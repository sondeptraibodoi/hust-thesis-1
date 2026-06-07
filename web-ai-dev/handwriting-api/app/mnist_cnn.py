import os
import threading
import re
import uuid
from typing import List, Tuple

import cv2
import numpy as np
import torch
from torch import nn
from torch.utils.data import ConcatDataset, DataLoader, Dataset
from torchvision import datasets, transforms


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")
CUSTOM_DATA_DIR = os.path.join(BASE_DIR, "custom_digit_data")
MODEL_PATH = os.path.join(MODEL_DIR, "mnist_cnn.pt")

MNIST_MEAN = 0.1307
MNIST_STD = 0.3081
CUSTOM_SAMPLE_REPEAT_FACTOR = 20

_model = None
_model_lock = threading.Lock()


class CustomDigitDataset(Dataset):
    def __init__(self, root_dir: str):
        self.samples = []

        for digit in range(10):
            digit_dir = os.path.join(root_dir, str(digit))

            if not os.path.isdir(digit_dir):
                continue

            for filename in os.listdir(digit_dir):
                if filename.lower().endswith((".png", ".jpg", ".jpeg")):
                    self.samples.append((os.path.join(digit_dir, filename), digit))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        path, label = self.samples[index]
        image = cv2.imread(path, cv2.IMREAD_GRAYSCALE)

        if image is None:
            image = np.zeros((28, 28), dtype=np.uint8)

        image = cv2.resize(image, (28, 28), interpolation=cv2.INTER_AREA)
        tensor = torch.from_numpy(image.astype(np.float32) / 255.0)
        tensor = tensor.unsqueeze(0)
        tensor = (tensor - MNIST_MEAN) / MNIST_STD

        return tensor, label


class MNISTCNN(nn.Module):
    def __init__(self):
        super().__init__()

        self.features = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 7 * 7, 128),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(128, 10),
        )

    def forward(self, x):
        x = self.features(x)
        return self.classifier(x)


def model_exists() -> bool:
    return os.path.exists(MODEL_PATH)


def train_mnist_model(epochs: int = 3, batch_size: int = 128) -> dict:
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    mnist_train_dataset = datasets.MNIST(
        DATA_DIR,
        train=True,
        download=True,
        transform=create_digit_transform(augment=True),
    )
    mnist_test_dataset = datasets.MNIST(
        DATA_DIR,
        train=False,
        download=True,
        transform=create_digit_transform(augment=False),
    )
    emnist_train_dataset = datasets.EMNIST(
        DATA_DIR,
        split="digits",
        train=True,
        download=True,
        transform=create_digit_transform(
            augment=True,
            fix_emnist_orientation=True,
        ),
    )
    emnist_test_dataset = datasets.EMNIST(
        DATA_DIR,
        split="digits",
        train=False,
        download=True,
        transform=create_digit_transform(
            augment=False,
            fix_emnist_orientation=True,
        ),
    )

    custom_dataset = CustomDigitDataset(CUSTOM_DATA_DIR)
    train_datasets = [
        mnist_train_dataset,
        emnist_train_dataset,
    ]

    if len(custom_dataset) > 0:
        train_datasets.extend([
            custom_dataset
            for _ in range(CUSTOM_SAMPLE_REPEAT_FACTOR)
        ])

    train_dataset = ConcatDataset(train_datasets)
    test_dataset = ConcatDataset([
        mnist_test_dataset,
        emnist_test_dataset,
    ])

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=0,
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=0,
    )

    model = MNISTCNN().to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    for _ in range(epochs):
        model.train()

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

    accuracy = evaluate_model(model, test_loader, device)

    torch.save(
        {
            "state_dict": model.state_dict(),
            "accuracy": accuracy,
            "epochs": epochs,
        },
        MODEL_PATH,
    )

    global _model
    with _model_lock:
        model.eval()
        _model = model.to("cpu")

    return {
        "model_path": MODEL_PATH,
        "accuracy": accuracy,
        "epochs": epochs,
        "mnist_train_count": len(mnist_train_dataset),
        "emnist_digits_train_count": len(emnist_train_dataset),
        "mnist_test_count": len(mnist_test_dataset),
        "emnist_digits_test_count": len(emnist_test_dataset),
        "custom_sample_count": len(custom_dataset),
        "custom_sample_repeat_factor": CUSTOM_SAMPLE_REPEAT_FACTOR,
    }


def fine_tune_with_custom_data(
    epochs: int = 2,
    batch_size: int = 64,
    learning_rate: float = 0.0001,
) -> dict:
    custom_dataset = CustomDigitDataset(CUSTOM_DATA_DIR)

    if len(custom_dataset) == 0:
        return {
            "error": "No custom training samples found.",
            "custom_sample_count": 0,
        }

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = load_mnist_model().to(device)
    train_loader = DataLoader(
        custom_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=0,
    )
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=learning_rate,
    )

    for _ in range(epochs):
        model.train()

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

    torch.save(
        {
            "state_dict": model.state_dict(),
            "fine_tune_epochs": epochs,
            "fine_tune_learning_rate": learning_rate,
            "custom_sample_count": len(custom_dataset),
        },
        MODEL_PATH,
    )

    global _model
    with _model_lock:
        model.eval()
        _model = model.to("cpu")

    return {
        "model_path": MODEL_PATH,
        "fine_tune_epochs": epochs,
        "fine_tune_learning_rate": learning_rate,
        "custom_sample_count": len(custom_dataset),
    }


def create_digit_transform(
    augment: bool,
    fix_emnist_orientation: bool = False,
):
    transform_steps = []

    if fix_emnist_orientation:
        transform_steps.append(
            transforms.Lambda(
                lambda image: transforms.functional.hflip(
                    transforms.functional.rotate(image, -90)
                )
            )
        )

    if augment:
        transform_steps.append(
            transforms.RandomAffine(
                degrees=12,
                translate=(0.12, 0.12),
                scale=(0.85, 1.15),
                shear=8,
                fill=0,
            )
        )

    transform_steps.extend([
        transforms.ToTensor(),
        transforms.Normalize((MNIST_MEAN,), (MNIST_STD,)),
    ])

    return transforms.Compose(transform_steps)


def save_labeled_score_sample(image: np.ndarray, label: str) -> dict:
    os.makedirs(CUSTOM_DATA_DIR, exist_ok=True)

    label_digits = re.sub(r"\D", "", label or "")

    if not label_digits:
        return {
            "saved_count": 0,
            "error": "Label must contain at least one digit."
        }

    digit_candidates = extract_digit_candidates(image)

    if len(digit_candidates) != len(label_digits):
        return {
            "saved_count": 0,
            "error": (
                f"Digit count mismatch: image has {len(digit_candidates)} "
                f"digit(s), label has {len(label_digits)} digit(s)."
            ),
            "detected_digits": len(digit_candidates),
            "label_digits": label_digits,
        }

    saved_files = []

    for digit, (digit_image, _) in zip(label_digits, digit_candidates):
        digit_dir = os.path.join(CUSTOM_DATA_DIR, digit)
        os.makedirs(digit_dir, exist_ok=True)

        filename = f"{uuid.uuid4().hex}.png"
        path = os.path.join(digit_dir, filename)
        cv2.imwrite(path, digit_image)
        saved_files.append(path)

    return {
        "saved_count": len(saved_files),
        "label_digits": label_digits,
        "saved_files": saved_files,
        "custom_sample_count": count_custom_samples(),
    }


def count_custom_samples() -> int:
    return len(CustomDigitDataset(CUSTOM_DATA_DIR))


def evaluate_model(model: nn.Module, loader: DataLoader, device: torch.device) -> float:
    model.eval()
    total = 0
    correct = 0

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            predicted = outputs.argmax(dim=1)

            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    return correct / total if total else 0.0


def load_mnist_model() -> MNISTCNN:
    global _model

    with _model_lock:
        if _model is not None:
            return _model

        if not model_exists():
            raise FileNotFoundError(
                "MNIST model not found. Call /train-mnist before predicting scores."
            )

        checkpoint = torch.load(MODEL_PATH, map_location="cpu")
        model = MNISTCNN()
        model.load_state_dict(checkpoint["state_dict"])
        model.eval()

        _model = model
        return _model


def predict_score_from_cell(cell_img: np.ndarray) -> Tuple[str, List[dict]]:
    digit_candidates = extract_digit_candidates(cell_img)

    if not digit_candidates:
        return "", []

    model = load_mnist_model()
    predictions = []
    digits = []

    with torch.no_grad():
        for digit_image, box in digit_candidates:
            tensor = torch.from_numpy(digit_image.astype(np.float32) / 255.0)
            tensor = tensor.unsqueeze(0).unsqueeze(0)
            tensor = (tensor - MNIST_MEAN) / MNIST_STD

            outputs = model(tensor)
            probabilities = torch.softmax(outputs, dim=1)[0]
            confidence, predicted = torch.max(probabilities, dim=0)

            digit = int(predicted.item())
            digits.append(str(digit))
            predictions.append({
                "digit": digit,
                "confidence": float(confidence.item()),
                "box": box,
            })

    return "".join(digits), predictions


def extract_digit_images(cell_img: np.ndarray) -> List[np.ndarray]:
    return [digit_image for digit_image, _ in extract_digit_candidates(cell_img)]


def extract_digit_candidates(cell_img: np.ndarray) -> List[Tuple[np.ndarray, dict]]:
    if cell_img.size == 0:
        return []

    gray = cv2.cvtColor(cell_img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)

    binary = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU,
    )[1]

    binary = cv2.morphologyEx(
        binary,
        cv2.MORPH_OPEN,
        cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2)),
    )

    horizontal_kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (max(18, binary.shape[1] // 2), 1),
    )
    horizontal_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, horizontal_kernel)
    binary = cv2.bitwise_and(binary, cv2.bitwise_not(horizontal_lines))

    contours, _ = cv2.findContours(
        binary,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    height, width = binary.shape
    boxes = []

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        area = cv2.contourArea(contour)

        if is_table_line_component(w, h, width, height):
            continue

        if is_score_separator_component(x, w, h, width, height):
            continue

        if area < 8:
            continue

        if h < max(8, height * 0.18):
            continue

        if w < 2:
            continue

        if w > width * 0.8 and h > height * 0.8:
            continue

        boxes.append((x, y, w, h))

    boxes = merge_close_boxes(sorted(boxes, key=lambda item: item[0]))
    digit_candidates = []

    for x, y, w, h in boxes:
        digit_crop = binary[max(y - 2, 0):min(y + h + 2, height),
                            max(x - 2, 0):min(x + w + 2, width)]

        if digit_crop.size == 0:
            continue

        digit_candidates.append((
            to_mnist_canvas(digit_crop),
            {
                "x": int(x),
                "y": int(y),
                "w": int(w),
                "h": int(h),
            },
        ))

    return digit_candidates


def is_table_line_component(w: int, h: int, image_width: int, image_height: int) -> bool:
    if w >= image_width * 0.55 and h <= max(4, image_height * 0.35):
        return True

    if h >= image_height * 0.75 and w <= 3:
        return True

    return False


def is_score_separator_component(
    x: int,
    w: int,
    h: int,
    image_width: int,
    image_height: int,
) -> bool:
    middle_component = image_width * 0.20 <= x <= image_width * 0.70
    small_component = w <= 7 and h <= max(12, image_height * 0.42)

    return middle_component and small_component


def merge_close_boxes(boxes: List[Tuple[int, int, int, int]]) -> List[Tuple[int, int, int, int]]:
    if not boxes:
        return []

    merged = [boxes[0]]

    for box in boxes[1:]:
        x, y, w, h = box
        last_x, last_y, last_w, last_h = merged[-1]
        gap = x - (last_x + last_w)
        close_enough = gap <= 2
        overlaps = x <= last_x + last_w

        if close_enough or overlaps:
            x1 = min(last_x, x)
            y1 = min(last_y, y)
            x2 = max(last_x + last_w, x + w)
            y2 = max(last_y + last_h, y + h)
            merged[-1] = (x1, y1, x2 - x1, y2 - y1)
        else:
            merged.append(box)

    return merged


def to_mnist_canvas(binary_digit: np.ndarray) -> np.ndarray:
    coords = cv2.findNonZero(binary_digit)

    if coords is None:
        return np.zeros((28, 28), dtype=np.uint8)

    x, y, w, h = cv2.boundingRect(coords)
    digit = binary_digit[y:y + h, x:x + w]

    max_side = max(w, h)
    square = np.zeros((max_side, max_side), dtype=np.uint8)
    x_offset = (max_side - w) // 2
    y_offset = (max_side - h) // 2
    square[y_offset:y_offset + h, x_offset:x_offset + w] = digit

    resized = cv2.resize(square, (20, 20), interpolation=cv2.INTER_AREA)
    canvas = np.zeros((28, 28), dtype=np.uint8)
    canvas[4:24, 4:24] = resized

    return center_by_mass(canvas)


def center_by_mass(image: np.ndarray) -> np.ndarray:
    moments = cv2.moments(image)

    if moments["m00"] == 0:
        return image

    cx = moments["m10"] / moments["m00"]
    cy = moments["m01"] / moments["m00"]
    shift_x = int(round(14 - cx))
    shift_y = int(round(14 - cy))

    matrix = np.float32([[1, 0, shift_x], [0, 1, shift_y]])

    return cv2.warpAffine(
        image,
        matrix,
        (28, 28),
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=0,
    )
