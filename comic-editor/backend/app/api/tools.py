from fastapi import APIRouter
from app.schemas.schemas import (
    SmudgeRequest, ToneRequest,
    ColorFillRequest, ToolImageResponse, Page, Panel, Tone
)

router = APIRouter(prefix="/tools", tags=["tools"])

def _demo_smudge(page: Page) -> Page:
    new_panels = []
    for p in page.panels:
        new_panels.append(
            Panel(
                id=p.id,
                image=p.image or f"demo://smudged-{p.id}",
                sketch=p.sketch,
                tone=p.tone,
                caption=p.caption + " (smudged)"
            )
        )
    return Page(id=page.id, storySentence=page.storySentence, panels=new_panels)


def _demo_tone(page: Page, tone: str) -> Page:
    new_panels = []
    for p in page.panels:
        new_panels.append(
            Panel(
                id=p.id,
                image=p.image,
                sketch=p.sketch,
                tone=Tone(
                    brightness=1.2 if tone == "bright" else 0.8,
                    contrast=1.2 if tone == "contrast" else 1.0,
                    palette=p.tone.palette
                ),
                caption=p.caption + f" ({tone})"
            )
        )
    return Page(id=page.id, storySentence=page.storySentence, panels=new_panels)


def _demo_color_fill(page: Page, x: int, y: int, color: str) -> Page:
    new_panels = []
    for p in page.panels:
        new_panels.append(
            Panel(
                id=p.id,
                image=p.image,
                sketch=p.sketch,
                tone=Tone(
                    brightness=p.tone.brightness,
                    contrast=p.tone.contrast,
                    palette=color
                ),
                caption=p.caption + f" (filled {color})"
            )
        )
    return Page(id=page.id, storySentence=page.storySentence, panels=new_panels)


@router.post("/smudge", response_model=ToolImageResponse)
async def smudge_page(data: SmudgeRequest):
    page = _demo_smudge(data.page)
    return ToolImageResponse(image=data.image)


@router.post("/tone", response_model=ToolImageResponse)
async def apply_tone(data: ToneRequest):
    page = _demo_tone(data.page, data.tone)
    return ToolImageResponse(image=data.image)


@router.post("/color-fill", response_model=ToolImageResponse)
async def fill_color(data: ColorFillRequest):
    page = _demo_color_fill(
        data.page,
        data.point.x,
        data.point.y,
        data.color
    )
    return ToolImageResponse(page=page)


