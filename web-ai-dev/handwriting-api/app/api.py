from fastapi import APIRouter, UploadFile, File
from app.predict import predict_image

router = APIRouter()

@router.get("/")
def health_check():
    return {
        "message": "Handwriting Recognition API is running"
    }

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    result = await predict_image(file)

    return {
        "filename": file.filename,
        "result": result
    }