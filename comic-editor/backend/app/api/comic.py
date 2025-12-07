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
# Shared image & tone helpers (same structure as /story)
# ---------------------

def build_image_prompt(
    page: Page,
    panel: Panel,
    global_prompt: str,
    page_index: int,
    page_total: int,
    panel_index: int,
) -> str:
    """
    Build a detailed image prompt for a specific panel.
    This helper mirrors the one in /story to keep behavior unified.
    """
    page_pos = page_index + 1
    total_pages = page_total

    base_desc_parts: List[str] = []

    if global_prompt:
        base_desc_parts.append(global_prompt)

    if page.storySentence:
        base_desc_parts.append(f"Page story: {page.storySentence}")

    if panel.caption:
        base_desc_parts.append(f"Panel description: {panel.caption}")

    scene_desc = " ".join(base_desc_parts).strip() or "A comic book scene."

    if total_pages > 1:
        t = page_index / (total_pages - 1)
    else:
        t = 0.5

    if t < 0.33:
        phase_hint = "This is an opening scene, introducing characters or setting."
    elif t < 0.66:
        phase_hint = "This is a mid-story scene, with development or tension."
    else:
        phase_hint = "This is a late-story scene, approaching climax or resolution."

    prompt = (
        f"Create a detailed comic book style illustration for page {page_pos}, "
        f"panel {panel_index + 1}. "
        f"{phase_hint} "
        f"Scene description: {scene_desc}. "
        "Use clear visual storytelling, expressive characters, and strong composition. "
        "High-quality comic book panel."
    )

    return prompt


def generate_image_from_prompt(prompt: str) -> Optional[str]:
    """
    Call the OpenAI image API and return the generated image URL.
    """
    try:
        response = openai.Image.create(
            prompt=prompt,
            n=1,
            size="1024x1024",
        )
        return response["data"][0]["url"]
    except openai.error.OpenAIError as e:
        print(f"[comic] Error generating image: {e}")
        return None


def compute_page_tone(index: int, total: int, base_tone: Optional[Tone] = None) -> Tone:
    """
    Compute a smooth brightness progression across pages.
    Matched with /story to keep tone behavior consistent.
    """
    if total <= 1:
        t = 0.5
    else:
        t = index / (total - 1)

    base_brightness = base_tone.brightness if base_tone else 1.0
    base_contrast = base_tone.contrast if base_tone else 1.0
    base_palette = base_tone.palette if base_tone else None

    brightness = base_brightness * (0.9 + 0.2 * t)

    return Tone(
        brightness=brightness,
        contrast=base_contrast,
        palette=base_palette,
    )


def apply_ai_generation_to_page(
    page: Page,
    prompt: str,
    page_index: int,
    page_total: int,
) -> Page:
    """
    Apply AI-powered image generation to every panel in a page.
    """
    new_panels: List[Panel] = []

    for i, p in enumerate(page.panels):
        image_prompt = build_image_prompt(
            page=page,
            panel=p,
            global_prompt=prompt,
            page_index=page_index,
            page_total=page_total,
            panel_index=i,
        )

        image_url = generate_image_from_prompt(image_prompt)
        new_tone = compute_page_tone(
            index=page_index,
            total=page_total,
            base_tone=p.tone,
        )

        new_panel = Panel(
            id=p.id,
            image=image_url or p.image,
            sketch=p.sketch,
            tone=new_tone,
            caption=p.caption or prompt,
        )
        new_panels.append(new_panel)

    new_page = Page(
        id=page.id,
        storySentence=page.storySentence or prompt,
        panels=new_panels,
    )
    return new_page


def apply_ai_generation_to_pages(
    pages: List[Page],
    prompt: str,
) -> List[Page]:
    """
    Apply AI-powered image generation to a list of pages.
    """
    total = len(pages) if pages else 1
    new_pages: List[Page] = []

    for idx, page in enumerate(pages):
        new_page = apply_ai_generation_to_page(
            page=page,
            prompt=prompt,
            page_index=idx,
            page_total=total,
        )
        new_pages.append(new_page)

    return new_pages


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
# Single Page Generation
# ---------------------
@router.post("/generate", response_model=ComicGenerateResponse)
async def generate_comic_page(data: ComicGenerateRequest):
    """
    Generate AI illustrations for a single comic page.
    Uses the same image pipeline as /story.
    """
    generated_page = apply_ai_generation_to_page(
        page=data.page,
        prompt=data.prompt,
        page_index=0,
        page_total=1,
    )
    return ComicGenerateResponse(page=generated_page)


# ---------------------
# All Pages Generation
# ---------------------
@router.post("/generate-all", response_model=ComicGenerateAllResponse)
async def generate_comic_all(data: ComicGenerateAllRequest):
    """
    Generate AI illustrations for all pages in the comic.
    Uses the same image pipeline as /story.
    """
    generated_pages = apply_ai_generation_to_pages(
        pages=data.pages,
        prompt=data.prompt,
    )
    return ComicGenerateAllResponse(pages=generated_pages)


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



