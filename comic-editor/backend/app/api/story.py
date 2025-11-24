from fastapi import APIRouter
from app.schemas.story import StoryInput, StoryResponse

router = APIRouter()

@router.post("/generate", response_model=StoryResponse)
def generate_story(data: StoryInput):
    text = data.text
    storyline = text.split(".")  # placeholder
    storyline = [s.strip() for s in storyline if s.strip()]
    return StoryResponse(storyline=storyline)
