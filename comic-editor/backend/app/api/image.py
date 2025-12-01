from fastapi import APIRouter
from app.schemas.schemas import (
    ComicGenerateRequest,
    ComicGenerateResponse,
    ComicGenerateAllRequest,
    ComicGenerateAllResponse,
)

router = APIRouter(prefix="/image")


@router.post("/generate", response_model=ComicGenerateResponse)
async def generate_comic_page(data: ComicGenerateRequest):
    # TODO: plug your model
    return ComicGenerateResponse(image=data.currentImage or data.sketch or "")


@router.post("/generateAll", response_model=ComicGenerateAllResponse)
async def generate_comic_globally(data: ComicGenerateAllRequest):
    # TODO: plug your model
    return ComicGenerateAllResponse(images=data.images)
