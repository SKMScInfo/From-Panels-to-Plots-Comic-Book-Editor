from fastapi import APIRouter

from app.schemas.schemas import (
    ComicGenerateRequest,
    ComicGenerateResponse,
    ComicGenerateAllRequest,
    ComicGenerateAllResponse,
    Page,
    Panel,
    Tone,
)


router = APIRouter(prefix="/image", tags=["image"])

def _apply_demo_generation_to_page(page: Page, prompt: str, index: int = 0, total: int = 1) -> Page:
    
    if total > 1:
        t = index / (total - 1)
    else:
        t = 0.5
    brightness = 0.9 + 0.2 * t  # 0.9 ~ 1.1 之间

    new_panels: List[Panel] = []
    for i, p in enumerate(page.panels):
        generated_image_placeholder = f"demo://{page.id}-panel-{i}"

        new_panels.append(
            Panel(
                id=p.id,
                image=generated_image_placeholder,   # 以后换成真实 URL/base64
                sketch=p.sketch,
                tone=Tone(
                    brightness=brightness,
                    contrast=p.tone.contrast,
                    palette=p.tone.palette,
                ),
                caption=p.caption or f"{prompt} (panel {i + 1})",
            )
        )

    return Page(
        id=page.id,
        storySentence=page.storySentence or prompt,
        panels=new_panels,
    )



@router.post("/generate", response_model=ComicGenerateResponse)
async def generate_comic_page(data: ComicGenerateRequest):
    generated_page = _apply_demo_generation_to_page(
        page=data.page,
        prompt=data.prompt,
        index=0,
        total=1,
    )
    return ComicGenerateResponse(page=generated_page)



@router.post("/generateAll", response_model=ComicGenerateAllResponse)
async def generate_comic_globally(data: ComicGenerateAllRequest):
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


