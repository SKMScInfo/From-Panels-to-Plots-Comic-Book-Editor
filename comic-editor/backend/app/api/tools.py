from fastapi import APIRouter
from models.schemas import (
    SmudgeRequest, ToneRequest,
    ColorFillRequest, ToolImageResponse
)

router = APIRouter(prefix="/tools")


@router.post("/smudge", response_model=ToolImageResponse)
async def smudge_page(data: SmudgeRequest):
    # TODO: implement real logic
    return ToolImageResponse(image=data.image)


@router.post("/tone", response_model=ToolImageResponse)
async def apply_tone(data: ToneRequest):
    # TODO: implement real logic
    return ToolImageResponse(image=data.image)


@router.post("/color-fill", response_model=ToolImageResponse)
async def fill_color(data: ColorFillRequest):
    # TODO: implement real logic
    return ToolImageResponse(image=data.image)
