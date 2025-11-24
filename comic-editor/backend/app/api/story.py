from fastapi import APIRouter
from app.schemas.story import StoryInput, StoryResponse
from app.services.story_service import StoryService

router = APIRouter()

@router.post("/generate", response_model=StoryResponse)
async def generate_story(data: StoryInput):
    storyline = StoryService.generate_panel(data)
    return StoryResponse(storyline=storyline)
