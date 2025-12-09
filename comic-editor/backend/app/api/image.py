import base64
import json
import os
from pathlib import Path
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
from datetime import datetime

import openai
from app.config import settings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(BASE_DIR)                   # backend/
CONTENT_DIR = Path(BASE_DIR) / "content"



router = APIRouter(prefix="/image", tags=["image"])


DB_PATH = Path(__file__).parent.parent.parent / "database/image.json"
MODE = settings.MODE

with open(DB_PATH, "r", encoding="utf-8") as f:
    IMAGE_DB = json.load(f)

#prompt_global=""

LOG_DIR = Path(__file__).parent.parent.parent / "database/logs"
LOG_DIR.mkdir(exist_ok=True)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
LOG_PATH= LOG_DIR / f"image_prompts_{timestamp}.log"

def log_prompt(prompt: str):
    """Append each prompt to a single log file with separators."""
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write("\n" + "=" * 60 + "\n")
        f.write(prompt.strip() + "\n")
        f.write("=" * 60 + "\n")


def database_lookup(prompt_global: str, lookup_type: str, optional_arg: str  = None):
    
    if prompt_global not in IMAGE_DB:
        raise KeyError(f"Story not found: '{prompt_global}'")

    entry = IMAGE_DB[prompt_global]

    # Expanded prompt
    if lookup_type == "imagePath":
        return entry.get("imagePath", "")

    else:
        raise ValueError(f"Invalid lookup_type: {lookup_type}")


# ---------------------
# Shared image & tone helpers
# ---------------------

def build_image_prompt(page, global_prompt, sketch, page_index, page_total):
    response= f"""
You are modifiying a single comic image.


PAGE SCENE DESCRIPTION:
{page.storySentence}


USER SKETCH PROVIDED:
The user drew a rough layout as a PNG sketch. Interpret only the composition,
poses, and silhouette placement from the sketch. Do NOT replicate line-level
details.

OUTPUT REQUIREMENTS:
- Same characters as current pages
- Same style as a Japanese manga with soft shading
- Keep lighting consistent with current pages
- Follow the sketch composition closely
- Return a clean polished comic-style illustration
"""
    log_prompt(response)
    return response



def generate_image_from_prompt(prompt: str,prompt_global: str) -> Optional[str]:
    """
    Call the OpenAI image API and return the generated image URL.
    Returns None if the generation fails.
    """
    print(MODE)
    try:
        if MODE=="use_saved":
            response=database_lookup(prompt_global,"imagePath")
            return response
        else:
            response = openai.Image.create(
                prompt=prompt,
                n=1,
                size="1024x1024",
            )
            return response["data"][0]["url"]
    except openai.error.OpenAIError as e:
        print(f"[image] Error generating image: {e}")
        return None

def save_sketch_png(sketch_base64: str, filename: str):
    #print("sketch",sketch_base64)
    header, encoded = sketch_base64.split(",", 1)
    binary = base64.b64decode(encoded)

    output_path = CONTENT_DIR / "promptImage1" / filename
    #print("outputpath ",output_path)
    with open(output_path, "wb") as f:
        f.write(binary)

    return str(output_path)


def apply_ai_generation_to_page(
    page: Page,
    prompt: str,
    sketch: str,
    index: int = 0,
    total: int = 1,
) -> Page:
    """
    Apply AI-powered image generation to every panel in a page.

    This function replaces the demo placeholder generation and produces
    real image URLs using OpenAI. It also updates the tone based on
    page position.
    """
    #new_panels: List[Panel] = []

    # for i, p in enumerate(page.panels):
    save_sketch_png(sketch,f"sketch_{prompt}.png")
    image_prompt = build_image_prompt(
        page=page,
        global_prompt=prompt,
        sketch=sketch,
        page_index=index,
        page_total=total,
    )

    image_url = generate_image_from_prompt(image_prompt,prompt)
    page.panels[0].image=image_url

    return page


def apply_ai_generation_to_pages(
    pages: List[Page],
    prompt: str,
    sketch:str,
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
            sketch=sketch,
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
    #print("Sketch",data.sketch)
    print("Prompt",data.prompt)
    generated_page = apply_ai_generation_to_page(
        page=data.page,
        prompt=data.prompt,
        sketch=data.sketch,
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
        sketch=data.sketch
    )
    return ComicGenerateAllResponse(pages=generated_pages)


@router.post("/overwrite")
async def overwrite_image(file: UploadFile = File(...), path: str = Form(...)):
    full_path = CONTENT_DIR / os.path.basename(path)
    print(full_path)

    with open(full_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"status": "ok", "saved": str(full_path)}




