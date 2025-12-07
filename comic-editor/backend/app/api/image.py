import os
import shutil
# app/api/image.py

from typing import List, Optional

from fastapi import APIRouter
from fastapi import UploadFile, File, Form
from fastapi.responses import JSONResponse
from app.utils.file_utils import return_all_default_pages, return_one_default_page

from app.schemas.schemas import (
    ComicGenerateRequest,
    ComicGenerateResponse,
    ComicGenerateAllRequest,
    ComicGenerateAllResponse,
    Page,
    Panel,
    Tone,
)

import openai

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(BASE_DIR)                   # backend/
CONTENT_DIR = os.path.join(BASE_DIR, "content")



router = APIRouter(prefix="/image", tags=["image"])


# ---------------------
# Shared image & tone helpers
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

    This follows the same structure as the helpers used in /story and /comic,
    so that all image generation behaves consistently across the API.
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

    # Compute a normalized position within the whole book
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
    Returns None if the generation fails.
    """
    try:
        response = openai.Image.create(
            prompt=prompt,
            n=1,
            size="1024x1024",
        )
        return response["data"][0]["url"]
    except openai.error.OpenAIError as e:
        print(f"[image] Error generating image: {e}")
        return None


def compute_page_tone(index: int, total: int, base_tone: Optional[Tone] = None) -> Tone:
    """
    Compute a smooth brightness progression across pages.

    This matches the tone behavior in /story and /comic, so that the same
    comic rendered through different endpoints has a consistent visual flow.
    """
    if total <= 1:
        t = 0.5
    else:
        t = index / (total - 1)

    base_brightness = base_tone.brightness if base_tone else 1.0
    base_contrast = base_tone.contrast if base_tone else 1.0
    base_palette = base_tone.palette if base_tone else None

    # 0.9 ~ 1.1 range (similar to your original demo logic)
    brightness = base_brightness * (0.9 + 0.2 * t)

    return Tone(
        brightness=brightness,
        contrast=base_contrast,
        palette=base_palette,
    )


def apply_ai_generation_to_page(
    page: Page,
    prompt: str,
    index: int = 0,
    total: int = 1,
) -> Page:
    """
    Apply AI-powered image generation to every panel in a page.

    This function replaces the demo placeholder generation and produces
    real image URLs using OpenAI. It also updates the tone based on
    page position.
    """
    new_panels: List[Panel] = []

    for i, p in enumerate(page.panels):
        image_prompt = build_image_prompt(
            page=page,
            panel=p,
            global_prompt=prompt,
            page_index=index,
            page_total=total,
            panel_index=i,
        )

        image_url = generate_image_from_prompt(image_prompt)
        new_tone = compute_page_tone(
            index=index,
            total=total,
            base_tone=p.tone,
        )

        new_panels.append(
            Panel(
                id=p.id,
                image=image_url or p.image,  # fallback to existing image if generation fails
                sketch=p.sketch,
                tone=new_tone,
                caption=p.caption or f"{prompt} (panel {i + 1})",
            )
        )

    return Page(
        id=page.id,
        storySentence=page.storySentence or prompt,
        panels=new_panels,
    )


def apply_ai_generation_to_pages(
    pages: List[Page],
    prompt: str,
) -> List[Page]:
    """
    Convenience helper: apply AI generation to a list of pages.
    """
    total = len(pages) if pages else 1
    new_pages: List[Page] = []

    for idx, page in enumerate(pages):
        new_page = apply_ai_generation_to_page(
            page=page,
            prompt=prompt,
            index=idx,
            total=total,
        )
        new_pages.append(new_page)

    return new_pages


# ---------------------
# Endpoints
# ---------------------

@router.post("/generate", response_model=ComicGenerateResponse)
async def generate_comic_page(data: ComicGenerateRequest):
    """
    Generate AI illustrations for a single comic page.

    This endpoint uses the same image generation logic as /story and /comic.
    """
    generated_page = apply_ai_generation_to_page(
        page=data.page,
        prompt=data.prompt,
        index=0,
        total=1,
    )
    return ComicGenerateResponse(page=generated_page)


@router.post("/generateAll", response_model=ComicGenerateAllResponse)
async def generate_comic_globally(data: ComicGenerateAllRequest):
    """
    Generate AI illustrations for all provided comic pages.

    This endpoint is useful when you want to (re)render a whole book or chapter
    with a given global prompt.
    """
    generated_pages = apply_ai_generation_to_pages(
        pages=data.pages,
        prompt=data.prompt,
    )
    return ComicGenerateAllResponse(pages=generated_pages)


@router.post("/overwrite")
async def overwrite_image(file: UploadFile = File(...), path: str = Form(...)):
    full_path = os.path.join(CONTENT_DIR, os.path.basename(path))
    print(full_path)
    with open(full_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"status": "ok", "saved": full_path}



