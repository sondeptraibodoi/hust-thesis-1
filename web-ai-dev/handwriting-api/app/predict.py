import os
import cv2
import easyocr
import numpy as np
from fastapi import UploadFile
import math

UPLOAD_DIR = "uploads"

reader = None


async def predict_image(file: UploadFile):
    global reader

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    image = cv2.imread(file_path)

    if image is None:
        return {
            "error": "Không đọc được ảnh"
        }

    if reader is None:
        reader = easyocr.Reader(["vi", "en"], gpu=False)

    # 1. Căn chỉnh phối cảnh bảng
    table_image = deskew_image(image)

    cv2.imwrite(
        os.path.join(UPLOAD_DIR, "debug_table_corrected.png"),
        table_image
    )

    # 2. Tạo mask đường kẻ bảng
    table_mask = detect_table_mask(table_image)

    cv2.imwrite(
        os.path.join(UPLOAD_DIR, "debug_table_mask.png"),
        table_mask
    )

    # 3. Tách ô bảng
    cells = extract_table_cells(table_image)

    # 4. Vẽ debug các ô đã tách
    debug_image = table_image.copy()

    for cell in cells:
        x = cell["x"]
        y = cell["y"]
        w = cell["w"]
        h = cell["h"]

        cv2.rectangle(
            debug_image,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            2
        )

    cv2.imwrite(
        os.path.join(UPLOAD_DIR, "debug_cells.png"),
        debug_image
    )

    # 5. OCR từng ô
    cell_results = []

    for cell in cells:
        text = read_cell_text(reader, table_image, cell)

        cell_results.append({
            **cell,
            "text": text
        })
        
    students = group_cells_to_students(cell_results)

    return {
    "filename": file.filename,
    "cell_count": len(cells),
    "students": students,
    "cells": cell_results,
    "debug_files": {
        "table_corrected": "uploads/debug_table_corrected.png",
        "table_mask": "uploads/debug_table_mask.png",
        "cells": "uploads/debug_cells.png",
        "horizontal_lines": "uploads/debug_horizontal_lines.png",
        "vertical_lines": "uploads/debug_vertical_lines.png"
    }
}


def correct_table_perspective(image):
    mask = detect_table_mask(image)

    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return image

    contours = sorted(contours, key=cv2.contourArea, reverse=True)

    table_contour = contours[0]

    rect = cv2.minAreaRect(table_contour)
    box = cv2.boxPoints(rect)
    box = np.int32(box)

    ordered = order_points(box)

    width_a = np.linalg.norm(ordered[2] - ordered[3])
    width_b = np.linalg.norm(ordered[1] - ordered[0])
    max_width = int(max(width_a, width_b))

    height_a = np.linalg.norm(ordered[1] - ordered[2])
    height_b = np.linalg.norm(ordered[0] - ordered[3])
    max_height = int(max(height_a, height_b))

    if max_width < 100 or max_height < 100:
        return image

    destination = np.array([
        [0, 0],
        [max_width - 1, 0],
        [max_width - 1, max_height - 1],
        [0, max_height - 1]
    ], dtype="float32")

    matrix = cv2.getPerspectiveTransform(
        ordered.astype("float32"),
        destination
    )

    warped = cv2.warpPerspective(
        image,
        matrix,
        (max_width, max_height)
    )

    return warped


def order_points(points):
    points = points.astype("float32")

    rect = np.zeros((4, 2), dtype="float32")

    s = points.sum(axis=1)
    rect[0] = points[np.argmin(s)]
    rect[2] = points[np.argmax(s)]

    diff = np.diff(points, axis=1)
    rect[1] = points[np.argmin(diff)]
    rect[3] = points[np.argmax(diff)]

    return rect

def deskew_image(image):
    horizontal_lines, _ = extract_table_line_masks(image)

    lines = cv2.HoughLinesP(
        horizontal_lines,
        1,
        math.pi / 180,
        threshold=80,
        minLineLength=max(80, image.shape[1] // 4),
        maxLineGap=40
    )

    if lines is None:
        return image

    weighted_angles = []

    for line in lines:
        x1, y1, x2, y2 = line[0]
        line_length = math.hypot(x2 - x1, y2 - y1)

        if line_length < image.shape[1] * 0.20:
            continue

        angle = math.degrees(math.atan2(y2 - y1, x2 - x1))

        if -12 < angle < 12:
            weighted_angles.extend([angle] * max(1, int(line_length // 50)))

    if not weighted_angles:
        return image

    angle = float(np.median(weighted_angles))

    if abs(angle) < 0.15:
        return image

    h, w = image.shape[:2]
    center = (w // 2, h // 2)

    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)

    rotated = cv2.warpAffine(
        image,
        matrix,
        (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(255, 255, 255)
    )

    return rotated

def detect_table_mask(image):
    horizontal_lines, vertical_lines = extract_table_line_masks(image)
    table_mask = cv2.add(horizontal_lines, vertical_lines)

    return table_mask


def create_table_binary(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    dark_mask = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        31,
        12
    )

    blue_mask = cv2.inRange(
        hsv,
        np.array([70, 10, 20], dtype=np.uint8),
        np.array([150, 255, 245], dtype=np.uint8)
    )

    binary = cv2.bitwise_or(dark_mask, blue_mask)
    binary = cv2.medianBlur(binary, 3)

    return binary


def extract_table_line_masks(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    binary = create_table_binary(image)

    horizontal_size = max(25, w // 28)
    vertical_size = max(25, h // 28)

    horizontal_kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (horizontal_size, 1)
    )

    vertical_kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (1, vertical_size)
    )

    horizontal_lines = cv2.morphologyEx(
        binary,
        cv2.MORPH_OPEN,
        horizontal_kernel
    )

    vertical_lines = cv2.morphologyEx(
        binary,
        cv2.MORPH_OPEN,
        vertical_kernel
    )

    horizontal_lines = cv2.dilate(horizontal_lines, None, iterations=1)
    vertical_lines = cv2.dilate(vertical_lines, None, iterations=1)

    return horizontal_lines, vertical_lines


def extract_table_cells(image):
    img_h, img_w = image.shape[:2]
    horizontal_lines, vertical_lines = extract_table_line_masks(image)
    table_mask = cv2.add(horizontal_lines, vertical_lines)

    table_x, table_y, table_w, table_h = find_table_bounds(
        table_mask,
        img_w,
        img_h
    )

    table_x2 = min(table_x + table_w, img_w)
    table_y2 = min(table_y + table_h, img_h)

    horizontal_crop = horizontal_lines[table_y:table_y2, table_x:table_x2]
    vertical_crop = vertical_lines[table_y:table_y2, table_x:table_x2]

    cv2.imwrite(
        os.path.join(UPLOAD_DIR, "debug_horizontal_lines.png"),
        horizontal_crop
    )

    cv2.imwrite(
        os.path.join(UPLOAD_DIR, "debug_vertical_lines.png"),
        vertical_crop
    )

    y_lines = get_line_positions(
        horizontal_crop,
        axis="horizontal",
        threshold_ratio=0.18
    )

    x_lines = get_line_positions(
        vertical_crop,
        axis="vertical",
        threshold_ratio=0.12
    )

    y_lines = [line + table_y for line in normalize_lines(y_lines, min_gap=10)]
    y_lines = keep_regular_line_run(y_lines)
    x_lines = [line + table_x for line in x_lines]
    x_lines = trim_tiny_edge_columns(x_lines, min_width=30)
    
    print("Y lines:", y_lines)
    print("X lines:", x_lines)

    if len(x_lines) < 2 or len(y_lines) < 2:
        return []

    if table_x <= 2 and x_lines[0] - table_x > 10:
        x_lines.insert(0, table_x)

    cells = []

    for row in range(len(y_lines) - 1):
        y1 = y_lines[row]
        y2 = y_lines[row + 1]

        if y2 - y1 < 15:
            continue

        for col in range(len(x_lines) - 1):
            x1 = x_lines[col]
            x2 = x_lines[col + 1]

            if x2 - x1 < 20:
                continue

            cells.append({
                "row": row,
                "col": col,
                "x": int(x1),
                "y": int(y1),
                "w": int(x2 - x1),
                "h": int(y2 - y1)
            })

    return cells


def keep_regular_line_run(lines):
    if len(lines) < 3:
        return lines

    lines = sorted(lines)
    gaps = [lines[i + 1] - lines[i] for i in range(len(lines) - 1)]
    normal_gaps = [gap for gap in gaps if 12 <= gap <= 80]

    if not normal_gaps:
        return lines

    median_gap = float(np.median(normal_gaps))
    max_gap = max(median_gap * 1.8, median_gap + 12)

    best_start = 0
    best_end = 0
    current_start = 0

    for index, gap in enumerate(gaps):
        if 12 <= gap <= max_gap:
            current_end = index + 1

            if current_end - current_start > best_end - best_start:
                best_start = current_start
                best_end = current_end
        else:
            current_start = index + 1

    if best_end - best_start < 2:
        return lines

    return lines[best_start:best_end + 1]


def trim_tiny_edge_columns(lines, min_width=30):
    lines = sorted(lines)

    while len(lines) >= 2 and lines[1] - lines[0] < min_width:
        lines.pop(0)

    while len(lines) >= 2 and lines[-1] - lines[-2] < min_width:
        lines.pop()

    return lines


def find_table_bounds(table_mask, img_w, img_h):
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
    connected = cv2.dilate(table_mask, kernel, iterations=2)

    contours, _ = cv2.findContours(
        connected,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return 0, 0, img_w, img_h

    contours = sorted(contours, key=cv2.contourArea, reverse=True)

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)

        if w < img_w * 0.35 or h < img_h * 0.25:
            continue

        pad = 3
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(img_w, x + w + pad)
        y2 = min(img_h, y + h + pad)

        return x1, y1, x2 - x1, y2 - y1

    return 0, 0, img_w, img_h


def get_line_positions(line_image, axis="horizontal", threshold_ratio=0.15):
    h, w = line_image.shape

    if axis == "horizontal":
        profile = np.count_nonzero(line_image, axis=1)
        min_count = w * threshold_ratio
    else:
        profile = np.count_nonzero(line_image, axis=0)
        min_count = h * threshold_ratio

    positions = np.where(profile >= min_count)[0].tolist()

    return merge_positions(positions, min_gap=8)


def merge_positions(positions, min_gap=8):
    if not positions:
        return []

    positions = sorted(positions)
    groups = [[positions[0]]]

    for p in positions[1:]:
        if abs(p - groups[-1][-1]) <= min_gap:
            groups[-1].append(p)
        else:
            groups.append([p])

    return [int(round(sum(group) / len(group))) for group in groups]


def normalize_lines(lines, min_gap=8):
    if len(lines) < 2:
        return lines

    lines = sorted(lines)

    clean = []

    for value in lines:
        if not clean or abs(value - clean[-1]) > min_gap:
            clean.append(value)

    gaps = [
        clean[i + 1] - clean[i]
        for i in range(len(clean) - 1)
        if clean[i + 1] - clean[i] > min_gap
    ]

    if not gaps:
        return clean

    median_gap = int(sorted(gaps)[len(gaps) // 2])

    normalized = [clean[0]]

    for i in range(len(clean) - 1):
        current_line = clean[i]
        next_line = clean[i + 1]
        gap = next_line - current_line

        missing_count = round(gap / median_gap)

        if missing_count <= 1:
            normalized.append(next_line)
        elif missing_count > 4:
            normalized.append(next_line)
        else:
            for j in range(1, missing_count + 1):
                normalized.append(int(current_line + j * median_gap))

    return sorted(list(set(normalized)))


def read_cell_text(reader, image, cell):
    x = cell["x"]
    y = cell["y"]
    w = cell["w"]
    h = cell["h"]

    padding = 4

    x1 = max(x + padding, 0)
    y1 = max(y + padding, 0)
    x2 = min(x + w - padding, image.shape[1])
    y2 = min(y + h - padding, image.shape[0])

    cell_img = image[y1:y2, x1:x2]

    if cell_img.size == 0:
        return ""

    gray = cv2.cvtColor(cell_img, cv2.COLOR_BGR2GRAY)

    results = reader.readtext(
        gray,
        detail=0,
        paragraph=False
    )

    return " ".join(results).strip()

def group_cells_to_students(cell_results):
    rows = {}

    for cell in cell_results:
        row = cell["row"]

        if row not in rows:
            rows[row] = []

        rows[row].append(cell)

    students = []

    for row_index in sorted(rows.keys()):
        row_cells = sorted(rows[row_index], key=lambda item: item["col"])

        # bỏ dòng tiêu đề nếu text có Mã SV / Họ và tên
        row_text = " ".join([cell.get("text", "") for cell in row_cells])

        if "Mã" in row_text or "Họ" in row_text or "Tên" in row_text:
            continue

        if len(row_cells) < 4:
            continue

        students.append({
            "stt": row_cells[0].get("text", ""),
            "student_code": row_cells[1].get("text", ""),
            "student_name": row_cells[2].get("text", ""),
            "class_name": row_cells[3].get("text", ""),
            "score": row_cells[4].get("text", "")
        })

    return students
