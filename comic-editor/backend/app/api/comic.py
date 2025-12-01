from fastapi import APIRouter
from models.schemas import NewPageResponse, ExportRequest, ExportResponse
import uuid
import json

router = APIRouter(prefix="/comic")


@router.post("/new-page", response_model=NewPageResponse)
async def new_page():
    # TODO: implement real logic
    page_id = f"page-{uuid.uuid4().hex[:6]}"

    page = {
        "id": page_id,
        "storySentence": "New page",
        "panels": [
            {
                "id": f"{page_id}-0",
                "image": None,
                "sketch": None,
                "tone": {"brightness": 1, "contrast": 1, "palette": None},
                "caption": "",
            }
        ],
    }

    return NewPageResponse(**page)


@router.post("/export", response_model=ExportResponse)
async def export_comic(data: ExportRequest):
    # TODO: implement real logic
    with open(data.path, "w") as f:
        json.dump(data.pages, f, indent=2)

    return ExportResponse(status="saved")
