
import uuid
import json
import os
from pathlib import Path
from typing import List
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



router = APIRouter(prefix="/comic", tags=["comic"])

EXPORT_DIR = Path("exports")
EXPORT_DIR.mkdir(exist_ok=True)


def _apply_demo_generation_to_page(page: Page, prompt: str, index: int = 0, total: int = 1) -> Page:
   
    if total > 1:
        t = index / (total - 1)
    else:
        t = 0.5
    brightness = 0.9 + 0.2 * t

    new_panels: List[Panel] = []
    for i, p in enumerate(page.panels):
        generated_image_path = f"demo://{page.id}-panel-{i}"

        new_panel = Panel(
            id=p.id,
            image=generated_image_path,
            sketch=p.sketch,
            tone=Tone(
                brightness=brightness,
                contrast=p.tone.contrast,
                palette=p.tone.palette,
            ),
            caption=p.caption or f"{prompt} (panel {i + 1})",
        )
        new_panels.append(new_panel)

    new_page = Page(
        id=page.id,
        storySentence=page.storySentence or prompt,
        panels=new_panels,
    )
    return new_page


# ---------------------
# New Page
# ---------------------
@router.post("/new-page", response_model=NewPageResponse)

async def new_page():
   
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
# Single Page Generation
# ---------------------
@router.post("/generate", response_model=ComicGenerateResponse)
async def generate_comic_page(data: ComicGenerateRequest):
    generated_page = _apply_demo_generation_to_page(
        page=data.page,
        prompt=data.prompt,
        index=0,
        total=1,
    )
    return ComicGenerateResponse(page=generated_page)


# ---------------------
# All Pages Generation
# ---------------------
@router.post("/generate-all", response_model=ComicGenerateAllResponse)
async def generate_comic_all(data: ComicGenerateAllRequest):
    total = len(data.pages) if data.pages else 1
    generated_pages: List[Page] = []

    for idx, page in enumerate(data.pages):
        new_page = _apply_demo_generation_to_page(
            page=page,
            prompt=data.prompt,
            index=idx,
            total=total,
        )
        generated_pages.append(new_page)

    return ComicGenerateAllResponse(pages=generated_pages)


# ---------------------
# Export
# ---------------------
@router.post("/export", response_model=ExportResponse)
async def export_comic(data: ExportRequest):
   
    filename = os.path.basename(data.path) or "comic.json"
    target_path = EXPORT_DIR / filename

    try:
        # data.pages 是 List[Page]（Pydantic 模型），用 .dict() 转成可 JSON 化对象
        pages_data = [page.dict() for page in data.pages]

        with target_path.open("w", encoding="utf-8") as f:
            json.dump(pages_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export comic: {e}")

    return ExportResponse(status="saved")


