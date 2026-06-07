import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from app.predict import predict_image
from app.mnist_cnn import (
    count_custom_samples,
    fine_tune_with_custom_data,
    model_exists,
    save_labeled_score_sample,
    train_mnist_model,
)

router = APIRouter()

@router.get("/")
def health_check():
    return {
        "message": "Handwriting Recognition API is running",
        "mnist_model_ready": model_exists(),
        "custom_sample_count": count_custom_samples()
    }

@router.post("/training-samples")
async def add_training_sample(
    label: str = Form(...),
    file: UploadFile = File(...)
):
    content = await file.read()
    np_buffer = np.frombuffer(content, np.uint8)
    image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(
            status_code=400,
            detail="Cannot read uploaded image."
        )

    result = save_labeled_score_sample(image, label)

    if result.get("error"):
        raise HTTPException(
            status_code=400,
            detail=result
        )

    return {
        "message": "Training sample saved successfully",
        "result": result
    }

@router.post("/train-mnist")
def train_mnist(
    epochs: int = Query(default=3, ge=1, le=20),
    batch_size: int = Query(default=128, ge=16, le=512)
):
    result = train_mnist_model(
        epochs=epochs,
        batch_size=batch_size
    )

    return {
        "message": "Digit CNN model trained successfully",
        "result": result
    }

@router.post("/fine-tune")
def fine_tune(
    epochs: int = Query(default=2, ge=1, le=20),
    batch_size: int = Query(default=64, ge=8, le=256),
    learning_rate: float = Query(default=0.0001, gt=0, le=0.01)
):
    result = fine_tune_with_custom_data(
        epochs=epochs,
        batch_size=batch_size,
        learning_rate=learning_rate,
    )

    if result.get("error"):
        raise HTTPException(
            status_code=400,
            detail=result
        )

    return {
        "message": "Digit CNN model fine-tuned successfully",
        "result": result
    }

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    result = await predict_image(file)

    return {
        "filename": file.filename,
        "result": result
    }
