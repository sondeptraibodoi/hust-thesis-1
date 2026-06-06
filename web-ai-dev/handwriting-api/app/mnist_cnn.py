import os
import threading
from typing import List, Tuple

import cv2
import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_PATH = os.path.join(MODEL_DIR, "mnist_cnn.pt")

MNIST_MEAN = 0.1307
MNIST_STD = 0.3081

_model = None
_model_lock = threading.Lock()


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

    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((MNIST_MEAN,), (MNIST_STD,)),
    ])

    train_dataset = datasets.MNIST(
        DATA_DIR,
        train=True,
        download=True,
        transform=transform,
    )
    test_dataset = datasets.MNIST(
        DATA_DIR,
        train=False,
        download=True,
        transform=transform,
    )

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
    }


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
    digit_images = extract_digit_images(cell_img)

    if not digit_images:
        return "", []

    model = load_mnist_model()
    predictions = []
    digits = []

    with torch.no_grad():
        for digit_image in digit_images:
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
            })

    return "".join(digits), predictions


def extract_digit_images(cell_img: np.ndarray) -> List[np.ndarray]:
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
    digit_images = []

    for x, y, w, h in boxes:
        digit_crop = binary[max(y - 2, 0):min(y + h + 2, height),
                            max(x - 2, 0):min(x + w + 2, width)]

        if digit_crop.size == 0:
            continue

        digit_images.append(to_mnist_canvas(digit_crop))

    return digit_images


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
