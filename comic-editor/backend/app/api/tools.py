# app/api/tools.py

import base64
import json
import os
from pathlib import Path
from datetime import datetime

from typing import List, Optional

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.schemas.schemas import (
    SmudgeRequest,
    ToneRequest,
    ColorFillRequest,
    ToolImageResponse,
    Page,
    Panel,
    Tone,
)
import openai
from app.config import settings

# --------------------------
# PATHS / GLOBALS
# --------------------------

router = APIRouter(prefix="/tools", tags=["tools"])

BASE_DIR = Path(__file__).resolve().parents[2]
CONTENT_DIR = BASE_DIR / "content"
TOOLS_OUTPUT = CONTENT_DIR / "tools"
TOOLS_OUTPUT.mkdir(exist_ok=True)

DB_PATH = BASE_DIR / "database/tools.json"
MODE = settings.MODE

if DB_PATH.exists():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        TOOLS_DB = json.load(f)
else:
    TOOLS_DB = {}

# Logging
LOG_DIR = BASE_DIR / "database" / "logs"
LOG_DIR.mkdir(exist_ok=True)
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
LOG_PATH = LOG_DIR / f"tools_prompts_{timestamp}.log"

def log_prompt(prompt: str):
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write("\n" + "=" * 60 + "\n")
        f.write(prompt.strip() + "\n")
        f.write("=" * 60 + "\n")

# --------------------------
# DATABASE LOOKUP
# --------------------------

def database_lookup(tool_name: str, image_path: str):
    """
    Look up from tools.json using the image path.
    Example key:
        TOOLS_DB["smudge"]["content/page1.png"]
    """
    if tool_name not in TOOLS_DB:
        raise KeyError(f"No entries for tool '{tool_name}'")

    tool_section = TOOLS_DB[tool_name]

    if image_path not in tool_section:
        raise KeyError(f"No stored result for tool '{tool_name}' on image '{image_path}'")

    return tool_section[image_path]

def database_store(tool_name: str, image_path: str, output: dict):
    """
    Append or update an entry in tools.json.
    """
    if tool_name not in TOOLS_DB:
        TOOLS_DB[tool_name] = {}

    TOOLS_DB[tool_name][image_path] = output

    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(TOOLS_DB, f, indent=4)


# --------------------------
# UTILS
# --------------------------

def save_image_bytes(img_bytes: bytes, filename: str) -> str:
    output_path = TOOLS_OUTPUT / filename
    with open(output_path, "wb") as f:
        f.write(img_bytes)
    return str(output_path)


def call_openai_image(prompt: str) -> Optional[str]:
    """Generate an image with OpenAI."""
    try:
        response = openai.Image.create(
            prompt=prompt,
            n=1,
            size="1024x1024",
        )
        return response["data"][0]["url"]
    except Exception as e:
        print(f"[tools] OpenAI image generation error:", e)
        return None


# --------------------------
# PROMPT BUILDERS
# --------------------------

def build_smudge_prompt(page: Page, image_path: str):
    prompt = f"""
You are applying a SMUDGE EFFECT to an existing comic panel.

IMAGE PATH: {image_path}

INSTRUCTIONS:
- Keep characters, colors, and style intact.
- Apply a light smudge effect across the main silhouette.
- Maintain full manga aesthetic.

Return a polished, smudged version of the image.
"""
    log_prompt(prompt)
    return prompt


def build_tone_prompt(page: Page, tone, image_path):
    prompt = f"""
Apply a TONE ADJUSTMENT to a manga-style image.

IMAGE PATH: {image_path}

TARGET TONE:
- primary: {tone.primary}
- secondary: {tone.secondary}
- mix: {tone.mix}
- intensity: {tone.intensity}

INSTRUCTIONS:
- Preserve the character design and line work.
- Apply a palette shift consistent with manga shading.
"""
    log_prompt(prompt)
    return prompt


def build_color_fill_prompt(page: Page, x: int, y: int, color, image_path):
    prompt = f"""
Apply a COLOR FILL operation to this manga image.

IMAGE PATH: {image_path}

FILL REQUEST:
- Click location: ({x}, {y})
- Fill color: {color.hex} (rgb {color.r},{color.g},{color.b})

INSTRUCTIONS:
- Perform a region fill around the click point.
- Maintain manga shading style.
"""
    log_prompt(prompt)
    return prompt



# --------------------------
# APPLY TOOL OPERATIONS
# --------------------------

def _apply_tool(tool_name: str, page: Page, prompt: str) -> Page:
    """
    Unified handler for smudge / tone / color-fill.
    """
    original_path = page.panels[0].image

    if not original_path:
        raise ValueError("Panel has no image to modify.")

    # === SAVED MODE ===
    if MODE == "use_saved":
        try:
            stored = database_lookup(tool_name, original_path)
            page.panels[0].image = stored["imagePath"]
            return page
        except KeyError:
            raise ValueError(f"No saved result found for tool '{tool_name}' and image '{original_path}'")

    # === LIVE MODE ===
    new_image_url = call_openai_image(prompt)

    if not new_image_url:
        raise RuntimeError("OpenAI image generation failed.")

    # Save in database
    database_store(tool_name, original_path, {
        "imagePath": new_image_url
    })

    page.panels[0].image = new_image_url
    return page



# --------------------------
# ENDPOINTS
# --------------------------

@router.post("/smudge", response_model=ToolImageResponse)
async def smudge_page(data: SmudgeRequest):
    page = data.page
    prompt = build_smudge_prompt(page, page.panels[0].image)
    updated = _apply_tool("smudge", page, prompt)
    return ToolImageResponse(page=updated)


@router.post("/tone", response_model=ToolImageResponse)
async def apply_tone(data: ToneRequest):
    page = data.page
    tone = data.tone
    prompt = build_tone_prompt(page, tone, page.panels[0].image)
    updated = _apply_tool("tone", page, prompt)

    # Update metadata
    updated.panels[0].tone.brightness = tone.mix
    updated.panels[0].tone.contrast = tone.intensity
    updated.panels[0].tone.palette = tone.primary

    return ToolImageResponse(page=updated)


@router.post("/color-fill", response_model=ToolImageResponse)
async def fill_color(data: ColorFillRequest):
    page = data.page
    prompt = build_color_fill_prompt(
        page,
        data.point.x,
        data.point.y,
        data.color,
        page.panels[0].image,
    )
    updated = _apply_tool("color-fill", page, prompt)

    updated.panels[0].caption += f"\nColor fill applied: {data.color.hex}"
    updated.panels[0].tone.palette = data.color.hex

    return ToolImageResponse(page=updated)
