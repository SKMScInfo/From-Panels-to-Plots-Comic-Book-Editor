from pydantic import BaseModel
from typing import Optional, List


# ---------------------
# Story
# ---------------------
class StoryRequest(BaseModel):
    story: str
    fortuneSketch: Optional[str] = None  # base64


class StoryResponse(BaseModel):
    characters: List[str] = []
    summary: str = ""
    # add more fields if needed


# ---------------------
# Generate Comic Page
# ---------------------
class ComicGenerateRequest(BaseModel):
    sketch: Optional[str] = None        # base64
    prompt: str                         # page sentence
    currentImage: Optional[str] = None  # base64


class ComicGenerateResponse(BaseModel):
    image: str  # base64


# ---------------------
# Global Apply
# ---------------------
class ComicGenerateAllRequest(BaseModel):
    sketch: Optional[str] = None
    prompt: str
    images: List[Optional[str]]         # list of base64 images


class ComicGenerateAllResponse(BaseModel):
    images: List[str]  # updated list


# ---------------------
# Tools
# ---------------------
class SmudgeRequest(BaseModel):
    image: str  # base64


class ToneRequest(BaseModel):
    image: str
    tone: str


class ColorFillPoint(BaseModel):
    x: int
    y: int


class ColorFillRequest(BaseModel):
    image: str
    point: ColorFillPoint
    color: str


class ToolImageResponse(BaseModel):
    image: str


# ---------------------
# New Page
# ---------------------
class NewPageResponse(BaseModel):
    id: str
    storySentence: str
    panels: List[dict]  # your FE uses {id, image, sketch, tone, caption}


# ---------------------
# Export
# ---------------------
class ExportRequest(BaseModel):
    path: str
    pages: List[dict]


class ExportResponse(BaseModel):
    status: str
