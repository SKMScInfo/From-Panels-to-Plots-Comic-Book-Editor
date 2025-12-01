from fastapi import FastAPI
from routers.story import router as story_router
from routers.image import router as image_router
from routers.tools import router as tools_router
from routers.comic import router as comic_router

app = FastAPI()

app.include_router(story_router)
app.include_router(image_router)
app.include_router(tools_router)
app.include_router(comic_router)
