import uuid
from typing import List

from fastapi import APIRouter
from app.schemas.schemas import (
    StoryRequest,
    StoryResponse,
    Page,
    Panel,
    Tone,
)

router = APIRouter(prefix="/story", tags=["story"])


def _split_story_into_units(text: str) -> List[str]:
    
    text = text.replace("\r\n", "\n")
    raw_paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    units: List[str] = []

    for para in raw_paragraphs:
        current = ""
        for ch in para:
            current += ch
            if ch in ".!?。！？":
                if current.strip():
                    units.append(current.strip())
                    current = ""
        if current.strip():
            units.append(current.strip())


    if not units and text.strip():
        units = [text.strip()]

    return units


def _compute_tone_for_index(index: int, total: int, has_fortune: bool) -> Tone:
 
    if total <= 1:
        return Tone()

    if not has_fortune:
        return Tone()

    # 0 ~ 1
    t = index / (total - 1)
    brightness = 0.85 + 0.3 * t  # 0.85 -> 1.15
    return Tone(brightness=brightness, contrast=1.0, palette=None)


@router.post("/generate", response_model=StoryResponse)
async def generate_story(data: StoryRequest) -> StoryResponse:
   
    # 1. split story
    units = _split_story_into_units(data.story)
    has_fortune = data.fortuneSketch is not None
    pages: List[Page] = []

    for idx, sentence in enumerate(units):
        page_id = f"page-{idx + 1}-{uuid.uuid4().hex[:4]}"
        tone = _compute_tone_for_index(idx, len(units), has_fortune)

        panel = Panel(
            id=f"{page_id}-0",
            caption=sentence,
            tone=tone,
            
        )

        page = Page(
            id=page_id,
            storySentence=sentence,
            panels=[panel],
        )
        pages.append(page)

    # 2. summary
    if len(units) >= 2:
        base_summary = " ".join(units[:2])
    elif units:
        base_summary = units[0]
    else:
        base_summary = ""

    if data.characterName and base_summary:
        summary = f"{data.characterName}：{base_summary}"
    else:
        summary = base_summary or "no summary。"

    return StoryResponse(
        pages=pages,
        summary=summary,
    )

