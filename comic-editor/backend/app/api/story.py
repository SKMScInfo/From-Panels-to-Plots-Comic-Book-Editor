from fastapi import APIRouter
from app.schemas.schemas import StoryRequest, StoryResponse
from app.utils.file_utils import return_all_default_pages 

router = APIRouter(prefix="/story")


@router.post("/generate", response_model=StoryResponse)
async def generate_story(data: StoryRequest):
    # TODO: implement real logic
    return StoryResponse(
        pages=return_all_default_pages(),
        summary="This is a placeholder summary."
    )
