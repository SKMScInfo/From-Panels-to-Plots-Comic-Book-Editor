from fastapi import APIRouter, UploadFile, File
from app.services.image_service import ImageService

router = APIRouter()

@router.post("/generate")
async def generate_image(prompt: str):
    img = ImageService.generate_panel(prompt)
    return {"message": "ok", "result": img}

@router.post("/edit")
async def edit_image(image: UploadFile = File(...), sketch: UploadFile = File(...)):
    return {"status": "edit completed"}
