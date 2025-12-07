# app/api/tools.py

from typing import List

from fastapi import APIRouter
from app.schemas.schemas import (
    SmudgeRequest,
    ToneRequest,
    ColorFillRequest,
    ToolImageResponse,
    Page,
    Panel,
    Tone,
)

router = APIRouter(prefix="/tools", tags=["tools"])


# ---------------------
# Internal demo helpers
# ---------------------

def _demo_smudge(page: Page) -> Page:
    """
    Demo smudge tool.

    In a real implementation, this would apply a smudge/blur effect to the image.
    Here we:
      - If a panel has no image, assign a 'demo://smudged-<id>' placeholder.
      - Append ' (smudged)' to the caption so the frontend can see the change.
    """
    new_panels: List[Panel] = []

    for p in page.panels:
        new_panels.append(
            Panel(
                id=p.id,
                image=p.image or f"demo://smudged-{p.id}",
                sketch=p.sketch,
                tone=p.tone,  # keep tone as-is
                caption=(p.caption or "") + " (smudged)",
            )
        )

    return Page(
        id=page.id,
        storySentence=page.storySentence,
        panels=new_panels,
    )


def _demo_tone(page: Page, tone_name: str) -> Page:
    """
    Demo tone tool.

    This function adjusts Tone based on the requested 'tone_name'.
    It is designed to be consistent with how Tone is used elsewhere
    in the system (brightness, contrast, optional palette).

    Supported tone_name values (you can extend this list):
      - "bright": higher brightness
      - "dark": lower brightness
      - "contrast": higher contrast
      - "soft": slightly lower contrast and brightness
      - anything else: no strong change (neutral)
    """
    new_panels: List[Panel] = []

    for p in page.panels:
        base_brightness = p.tone.brightness
        base_contrast = p.tone.contrast
        base_palette = p.tone.palette

        if tone_name == "bright":
            brightness = base_brightness * 1.2
            contrast = base_contrast
            palette = base_palette
        elif tone_name == "dark":
            brightness = base_brightness * 0.8
            contrast = base_contrast
            palette = base_palette
        elif tone_name == "contrast":
            brightness = base_brightness
            contrast = base_contrast * 1.3
            palette = base_palette
        elif tone_name == "soft":
            brightness = base_brightness * 0.95
            contrast = base_contrast * 0.9
            palette = base_palette
        else:
            # Neutral / unknown tone: keep values almost unchanged
            brightness = base_brightness
            contrast = base_contrast
            palette = base_palette

        new_panels.append(
            Panel(
                id=p.id,
                image=p.image,
                sketch=p.sketch,
                tone=Tone(
                    brightness=brightness,
                    contrast=contrast,
                    palette=palette,
                ),
                caption=(p.caption or "") + f" ({tone_name})",
            )
        )

    return Page(
        id=page.id,
        storySentence=page.storySentence,
        panels=new_panels,
    )


def _demo_color_fill(page: Page, x: int, y: int, color: str) -> Page:
    """
    Demo color fill tool.

    In a real implementation, (x, y) would be used to compute a region and
    apply a flood fill or recoloring operation to the underlying image.

    For now, this demo:
      - Ignores (x, y).
      - Sets the 'palette' field of each panel's tone to the given color.
      - Appends a '(filled COLOR)' marker to the caption.
    """
    new_panels: List[Panel] = []

    for p in page.panels:
        new_panels.append(
            Panel(
                id=p.id,
                image=p.image,
                sketch=p.sketch,
                tone=Tone(
                    brightness=p.tone.brightness,
                    contrast=p.tone.contrast,
                    palette=color,
                ),
                caption=(p.caption or "") + f" (filled {color})",
            )
        )

    return Page(
        id=page.id,
        storySentence=page.storySentence,
        panels=new_panels,
    )


# ---------------------
# Endpoints
# ---------------------

@router.post("/smudge", response_model=ToolImageResponse)
async def smudge_page(data: SmudgeRequest):
    """
    Apply a demo smudge effect to the given page and return the updated page.

    The client should pass the full Page object in the request; the response
    contains the modified Page inside ToolImageResponse.
    """
    page = _demo_smudge(data.page)
    return ToolImageResponse(page=page)


@router.post("/tone", response_model=ToolImageResponse)
async def apply_tone(data: ToneRequest):
    """
    Apply a demo tone adjustment to the given page based on 'tone' string.

    This is purely metadata-level (Tone struct); it does not modify the image
    pixels yet, but can be used by the frontend or a later image-processing
    backend to apply real filters.
    """
    page = _demo_tone(data.page, data.tone)
    return ToolImageResponse(page=page)


@router.post("/color-fill", response_model=ToolImageResponse)
async def fill_color(data: ColorFillRequest):
    """
    Apply a demo color fill to the given page.

    The 'color' string is stored in the Tone.palette of each panel, and
    the caption is annotated with the applied color. In a real system this
    could be used to drive a recoloring pipeline on the actual image.
    """
    page = _demo_color_fill(
        data.page,
        data.point.x,
        data.point.y,
        data.color,
    )
    return ToolImageResponse(page=page)


