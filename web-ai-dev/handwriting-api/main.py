from fastapi import FastAPI
from app.api import router

app = FastAPI(title="Handwriting Recognition API")

app.include_router(router)