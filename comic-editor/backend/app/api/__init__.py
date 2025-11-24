from fastapi import APIRouter
from .story import router as story_router
from .image import router as image_router

api_router = APIRouter()

api_router.include_router(story_router, prefix="/story", tags=["story"])
api_router.include_router(image_router, prefix="/image", tags=["image"])
