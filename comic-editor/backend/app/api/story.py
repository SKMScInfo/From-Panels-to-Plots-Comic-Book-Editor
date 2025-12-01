from fastapi import APIRouter
from models.schemas import StoryRequest, StoryResponse

router = APIRouter(prefix="/story")


@router.post("/generate", response_model=StoryResponse)
async def generate_story(data: StoryRequest):
    # TODO: implement real logic
    return StoryResponse(
        characters=["Example Character"],
        summary="This is a placeholder summary."
    )
