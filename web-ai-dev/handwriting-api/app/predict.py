import os
import cv2
import easyocr
import numpy as np
from fastapi import UploadFile
import math
import re
from app.mnist_cnn import predict_score_from_cell

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
        mode = get_cell_ocr_mode(cell)
        read_cell = expand_score_cell(cell, cells) if mode == "score" else cell
        extra_result = {}

        if mode == "score":
            cell_img = crop_cell_image(table_image, read_cell, mode=mode)
            score_result = read_score_cell_result(reader, cell_img)
            text = score_result["text"]
            extra_result = {
                "score_match_percent": score_result["match_percent"],
                "score_source": score_result["source"],
                "score_digits": score_result["digits"],
                "score_digit_confidences": score_result["digit_confidences"],
            }
        else:
            text = read_cell_text(
                reader,
                table_image,
                read_cell,
                mode=mode
            )

        cell_results.append({
            **cell,
            "text": text,
            **extra_result
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


def get_cell_ocr_mode(cell):
    if cell["row"] == 0:
        return "text"

    if cell["col"] == 0:
        return "index"

    if cell["col"] == 1:
        return "student_code"

    if cell["col"] == 4:
        return "score"

    return "text"


def expand_score_cell(cell, cells):
    expanded = dict(cell)
    row = cell["row"]
    next_col = cell["col"] + 1
    next_cell = next(
        (
            item for item in cells
            if item["row"] == row and item["col"] == next_col
        ),
        None
    )

    if next_cell is None:
        return expanded

    if next_cell.get("w", 0) > 80:
        return expanded

    expanded["w"] = (next_cell["x"] + next_cell["w"]) - cell["x"]

    return expanded


def read_cell_text(reader, image, cell, mode="text"):
    cell_img = crop_cell_image(image, cell, mode=mode)

    if cell_img.size == 0:
        return ""

    if mode == "index":
        return read_digit_cell(reader, cell_img, min_len=1, max_len=3)

    if mode == "student_code":
        return read_digit_cell(reader, cell_img, min_len=6, max_len=12)

    if mode == "score":
        return read_score_cell(reader, cell_img)

    gray = prepare_ocr_gray(cell_img, scale=2, threshold=False)

    results = reader.readtext(
        gray,
        detail=0,
        paragraph=False
    )

    return " ".join(results).strip()


def crop_cell_image(image, cell, mode="text"):
    x = cell["x"]
    y = cell["y"]
    w = cell["w"]
    h = cell["h"]

    padding = 3 if mode == "score" else 5

    x1 = max(x + padding, 0)
    y1 = max(y + padding, 0)
    x2 = min(x + w - padding, image.shape[1])
    y2 = min(y + h - padding, image.shape[0])

    return image[y1:y2, x1:x2]


def read_digit_cell(reader, cell_img, min_len=1, max_len=12):
    images = [
        prepare_ocr_gray(cell_img, scale=3, threshold=False),
        prepare_ocr_gray(cell_img, scale=3, threshold=True)
    ]

    candidates = read_ocr_candidates(
        reader,
        images,
        allowlist="0123456789"
    )

    best_text = ""
    best_score = -1

    for text, confidence in candidates:
        digits = re.sub(r"\D", "", text)

        if not digits:
            continue

        length_bonus = 1 if min_len <= len(digits) <= max_len else 0
        score = confidence + length_bonus + min(len(digits), max_len) * 0.02

        if score > best_score:
            best_score = score
            best_text = digits

    return best_text


def read_score_cell(reader, cell_img):
    return read_score_cell_result(reader, cell_img)["text"]


def read_score_cell_result(reader, cell_img):
    cnn_result = read_score_cell_with_cnn(cell_img)

    if cnn_result["text"]:
        return cnn_result

    if reader is None:
        return empty_score_result()

    images = [
        prepare_ocr_gray(cell_img, scale=3, threshold=False),
        prepare_ocr_gray(cell_img, scale=3, threshold=True),
        *prepare_score_color_images(cell_img)
    ]

    candidates = read_ocr_candidates(
        reader,
        images,
        allowlist="0123456789,."
    )

    best_text = ""
    best_score = -1
    best_confidence = 0

    for text, confidence in candidates:
        score_text = normalize_score_text(text)

        if not score_text:
            continue

        score = confidence + score_value_bonus(score_text, text)

        if score > best_score:
            best_score = score
            best_text = score_text
            best_confidence = confidence

    if not best_text:
        return empty_score_result(source="easyocr")

    return {
        "text": best_text,
        "match_percent": round(best_confidence * 100, 2),
        "source": "easyocr",
        "digits": normalize_digits(best_text),
        "digit_confidences": [],
    }


def read_score_cell_with_cnn(cell_img):
    try:
        digit_text, predictions = predict_score_from_cell(cell_img)
    except FileNotFoundError:
        return empty_score_result(source="cnn")

    if not digit_text:
        return empty_score_result(source="cnn")

    score_text = format_cnn_score_digits(digit_text)

    if not score_text:
        return empty_score_result(
            source="cnn",
            digits=digit_text,
            digit_confidences=build_digit_confidences(predictions),
        )

    return {
        "text": score_text,
        "match_percent": calculate_score_match_percent(predictions),
        "source": "cnn",
        "digits": digit_text,
        "digit_confidences": build_digit_confidences(predictions),
    }


def format_cnn_score_digits(digit_text):
    digits = normalize_digits(digit_text)

    if not digits:
        return ""

    if digits in ("10", "100"):
        return "10"

    if len(digits) == 1:
        return digits if is_valid_score(digits) else ""

    integer_part = digits[:-1].lstrip("0") or "0"
    decimal_part = digits[-1]
    score_text = f"{integer_part},{decimal_part}"

    return score_text if is_valid_score(score_text) else ""


def calculate_score_match_percent(predictions):
    confidences = [item["confidence"] for item in predictions]

    if not confidences:
        return 0

    return round(sum(confidences) / len(confidences) * 100, 2)


def build_digit_confidences(predictions):
    return [
        {
            "digit": item["digit"],
            "confidence_percent": round(item["confidence"] * 100, 2),
            "box": item.get("box", {}),
        }
        for item in predictions
    ]


def empty_score_result(
    source="",
    digits="",
    digit_confidences=None,
):
    return {
        "text": "",
        "match_percent": 0,
        "source": source,
        "digits": digits,
        "digit_confidences": digit_confidences or [],
    }


def read_ocr_candidates(reader, images, allowlist=None):
    candidates = []

    for image in images:
        results = reader.readtext(
            image,
            detail=1,
            paragraph=False,
            allowlist=allowlist,
            decoder="beamsearch",
            batch_size=1,
            contrast_ths=0.05,
            adjust_contrast=0.7
        )

        for result in results:
            if len(result) < 3:
                continue

            text = str(result[1]).strip()
            confidence = float(result[2])

            if text:
                candidates.append((text, confidence))

    return candidates


def prepare_ocr_gray(cell_img, scale=2, threshold=False):
    gray = cv2.cvtColor(cell_img, cv2.COLOR_BGR2GRAY)
    gray = cv2.copyMakeBorder(
        gray,
        8,
        8,
        8,
        8,
        cv2.BORDER_CONSTANT,
        value=255
    )

    gray = cv2.resize(
        gray,
        None,
        fx=scale,
        fy=scale,
        interpolation=cv2.INTER_CUBIC
    )

    gray = cv2.GaussianBlur(gray, (3, 3), 0)

    if not threshold:
        return cv2.equalizeHist(gray)

    return cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]


def prepare_score_color_images(cell_img):
    padded = cv2.copyMakeBorder(
        cell_img,
        8,
        8,
        8,
        8,
        cv2.BORDER_CONSTANT,
        value=(255, 255, 255)
    )

    images = []

    for scale in (3, 5, 8):
        images.append(
            cv2.resize(
                padded,
                None,
                fx=scale,
                fy=scale,
                interpolation=cv2.INTER_CUBIC
            )
        )

    return images


def normalize_score_text(text):
    text = (
        text.strip()
        .replace("O", "0")
        .replace("o", "0")
        .replace("I", "1")
        .replace("l", "1")
        .replace("|", "1")
    )

    text = re.sub(r"[^0-9,.]", "", text)

    if not text:
        return ""

    text = text.replace(".", ",")

    if "," in text:
        integer_part, decimal_part = text.split(",", 1)
        integer_part = re.sub(r"\D", "", integer_part)
        decimal_part = re.sub(r"\D", "", decimal_part)

        if not integer_part:
            return ""

        normalized = integer_part

        if decimal_part:
            normalized = f"{integer_part},{decimal_part[0]}"

        return normalized if is_valid_score(normalized) else ""

    digits = re.sub(r"\D", "", text)

    if not digits:
        return ""

    if len(digits) == 1:
        return digits if is_valid_score(digits) else ""

    if digits in ("10", "100"):
        return "10"

    if len(digits) == 3 and digits[0] == "0":
        normalized = f"{int(digits[:2])},{digits[2]}"
    elif len(digits) >= 3:
        normalized = f"{digits[0]},{digits[-1]}"
    else:
        normalized = f"{digits[0]},{digits[1]}"

    return normalized if is_valid_score(normalized) else ""


def score_value_bonus(score_text, original_text=""):
    if not is_valid_score(score_text):
        return -2

    bonus = 1
    raw_digits = normalize_digits(original_text)

    if "," in score_text:
        bonus += 1.0

    if len(raw_digits) >= 2:
        bonus += 0.3

    if len(raw_digits) == 3 and raw_digits.startswith("0"):
        bonus += 0.5

    if score_text.endswith(",0") or score_text.endswith(",5"):
        bonus += 0.3

    return bonus


def is_valid_score(score_text):
    try:
        score = float(score_text.replace(",", "."))
    except ValueError:
        return False

    return 0 <= score <= 10


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

        if row_index == 0:
            continue

        # bỏ dòng tiêu đề nếu text có Mã SV / Họ và tên
        row_text = " ".join([cell.get("text", "") for cell in row_cells])

        if "Mã" in row_text or "Họ" in row_text or "Tên" in row_text:
            continue

        if len(row_cells) < 5:
            continue

        students.append({
            "stt": row_cells[0].get("text", ""),
            "student_code": row_cells[1].get("text", ""),
            "student_name": row_cells[2].get("text", ""),
            "class_name": row_cells[3].get("text", ""),
            "score": row_cells[4].get("text", "")
        })

    return students


# Override the simple positional mapper above with data-aware row mapping.
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

        if row_index == 0:
            continue

        student_code_cell = find_student_code_cell(row_cells)

        if student_code_cell is None:
            continue

        student_code = normalize_digits(student_code_cell.get("text", ""))
        score_cell = find_score_cell(row_cells, student_code_cell["col"])
        text_cells = find_text_cells_after_code(row_cells, student_code_cell["col"])

        students.append({
            "stt": find_student_index(row_cells, student_code_cell["col"], len(students) + 1),
            "student_code": student_code,
            "student_name": text_cells[0] if len(text_cells) > 0 else "",
            "class_name": text_cells[1] if len(text_cells) > 1 else "",
            "score": score_cell.get("text", "") if score_cell else "",
            "score_match_percent": score_cell.get("score_match_percent", 0) if score_cell else 0,
            "score_source": score_cell.get("score_source", "") if score_cell else "",
            "score_digits": score_cell.get("score_digits", "") if score_cell else "",
            "score_digit_confidences": score_cell.get("score_digit_confidences", []) if score_cell else []
        })

    return students


def find_student_code_cell(row_cells):
    for cell in row_cells:
        if cell.get("w", 0) > 260:
            continue

        digits = normalize_digits(cell.get("text", ""))

        if 6 <= len(digits) <= 12:
            return cell

    return None


def find_student_index(row_cells, student_code_col, fallback_index):
    for cell in row_cells:
        if cell["col"] >= student_code_col:
            continue

        digits = normalize_digits(cell.get("text", ""))

        if 1 <= len(digits) <= 3:
            return digits

    return str(fallback_index)


def find_score_cell(row_cells, student_code_col):
    candidates = []

    for cell in row_cells:
        if cell["col"] <= student_code_col:
            continue

        if cell.get("w", 0) < 35:
            continue

        if cell.get("w", 0) > 170:
            continue

        score_text = normalize_score_text(cell.get("text", ""))

        if not score_text:
            continue

        candidates.append({
            **cell,
            "text": score_text
        })

    if not candidates:
        return None

    return sorted(
        candidates,
        key=lambda item: (item["col"], item.get("w", 0))
    )[0]


def find_text_cells_after_code(row_cells, student_code_col):
    text_cells = []

    for cell in row_cells:
        if cell["col"] <= student_code_col:
            continue

        text = cell.get("text", "").strip()

        if not text:
            continue

        if cell.get("w", 0) < 40:
            continue

        if cell.get("w", 0) <= 170 and normalize_score_text(text):
            continue

        if cell.get("w", 0) <= 170 and normalize_digits(text) == text:
            continue

        text_cells.append(text)

    return text_cells


def normalize_digits(text):
    return re.sub(r"\D", "", text or "")
