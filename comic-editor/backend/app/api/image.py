from fastapi import APIRouter, UploadFile, File
from app.services.image_service import ImageService
from app.schemas.image import ComicBookPageInput, ComicBookPageResponse

router = APIRouter()

@router.post("/generate")
async def generate_image(data: ComicBookPageInput):
    img = ImageService.generate_panel(data)
    return ComicBookPageResponse(comicBookImage= img)
