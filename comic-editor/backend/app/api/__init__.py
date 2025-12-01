from fastapi import APIRouter

from app.api.story import router as story_router
from app.api.image import router as image_router
from app.api.tools import router as tools_router
from app.api.comic import router as comic_router

api_router = APIRouter()

# No prefixes here — routers already include their own
api_router.include_router(story_router)
api_router.include_router(image_router)
api_router.include_router(tools_router)
api_router.include_router(comic_router)
