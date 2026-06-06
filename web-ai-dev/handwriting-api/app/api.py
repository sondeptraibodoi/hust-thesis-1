from fastapi import APIRouter, UploadFile, File, Query
from app.predict import predict_image
from app.mnist_cnn import model_exists, train_mnist_model

router = APIRouter()

@router.get("/")
def health_check():
    return {
        "message": "Handwriting Recognition API is running",
        "mnist_model_ready": model_exists()
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
        "message": "MNIST CNN model trained successfully",
        "result": result
    }

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    result = await predict_image(file)

    return {
        "filename": file.filename,
        "result": result
    }
