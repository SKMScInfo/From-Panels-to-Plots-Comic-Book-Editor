from pydantic import BaseModel

class StoryInput(BaseModel):
    story: str
    fortuneSketch: str | None = None   # <--- added this

class StoryResponse(BaseModel):
    storyline: list[str].  # list of image URLs or paths
