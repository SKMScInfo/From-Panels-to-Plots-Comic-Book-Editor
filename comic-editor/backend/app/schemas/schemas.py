from pydantic import BaseModel
from typing import Optional, List

class ToneSelection(BaseModel):
    primary: str
    secondary: Optional[str] = None
    mix: float   # 0..1
    intensity: float  # 0..1

class Color(BaseModel):
    r: int
    g: int
    b: int
    hex: str



class Tone(BaseModel):
    brightness: float = 1.0
    contrast: float = 1.0
    palette: Optional[str] = None


class Panel(BaseModel):
    id: str
    image: Optional[str] = None      # base64 OR path
    sketch: Optional[str] = None     # base64
    tone: Tone = Tone()
    caption: str = ""


class Page(BaseModel):
    id: str
    storySentence: str = ""
    panels: List[Panel]


# ---------------------
# Story
# ---------------------
class StoryRequest(BaseModel):
    story: str
    fortuneSketch: Optional[str] = None  # base64
    characterName: str


class StoryResponse(BaseModel):
    pages: List[Page]
    summary: str = ""
    # add more fields if needed


# ---------------------
# Generate Comic Page
# ---------------------
class ComicGenerateRequest(BaseModel):
    sketch: Optional[str] = None      # base64
    prompt: str                       # page sentence
    page: Page                        # full current page


class ComicGenerateResponse(BaseModel):
    page: Page    # updated page object



# ---------------------
# Global Apply
# ---------------------
class ComicGenerateAllRequest(BaseModel):
    sketch: Optional[str] = None
    prompt: str
    pages: List[Page]   # full pages


class ComicGenerateAllResponse(BaseModel):
    pages: List[Page]



# ---------------------
# Tools
# ---------------------
class SmudgeRequest(BaseModel):
    page: Page



class ToneRequest(BaseModel):
    page: Page
    tone: ToneSelection


class ColorFillPoint(BaseModel):
    x: float
    y: float


class ColorFillRequest(BaseModel):
    page: Page
    point: ColorFillPoint
    color: Color


class ToolImageResponse(BaseModel):
    page: Page



# ---------------------
# New Page
# ---------------------
class NewPageResponse(BaseModel):
    id: str
    page: Page


# ---------------------
# Export
# ---------------------
class ExportRequest(BaseModel):
    path: str
    pages: List[Page]


class ExportResponse(BaseModel):
    status: str
    path: Optional[str] = None
