# app/api/comic.py

import uuid
import json
import os
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException

from app.schemas.schemas import (
    NewPageResponse,
    ExportRequest,
    ExportResponse,
    Page,
    Panel,
    Tone,
    ComicGenerateRequest,
    ComicGenerateResponse,
    ComicGenerateAllRequest,
    ComicGenerateAllResponse,
)

import openai


router = APIRouter(prefix="/comic", tags=["comic"])

EXPORT_DIR = Path("exports")
EXPORT_DIR.mkdir(exist_ok=True)


# ---------------------
# New Page
# ---------------------
@router.post("/new-page", response_model=NewPageResponse)
async def new_page():
    """
    Create a new empty comic page with one empty panel.
    """
    page_id = f"page-{uuid.uuid4().hex[:6]}"

    page = Page(
        id=page_id,
        storySentence="",
        panels=[
            Panel(
                id=f"{page_id}-0",
                image=None,
                sketch=None,
                tone=Tone(brightness=1.0, contrast=1.0, palette=None),
                caption="",
            )
        ],
    )

    return NewPageResponse(id=page_id, page=page)


# ---------------------
# Export
# ---------------------
@router.post("/export", response_model=ExportResponse)
async def export_comic(data: ExportRequest):
    """
    Export the comic's pages to a JSON file.
    This can be extended later to support PDF or ZIP exports.
    """
    filename = os.path.basename(data.path) or "comic.json"
    target_path = EXPORT_DIR / filename

    try:
        pages_data = [page.dict() for page in data.pages]

        with target_path.open("w", encoding="utf-8") as f:
            json.dump(pages_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export comic: {e}")

    return ExportResponse(status="saved", path=str(target_path))



