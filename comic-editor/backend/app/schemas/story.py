from pydantic import BaseModel

class StoryInput(BaseModel):
    story: str
    sketch: str | None = None   # <--- added this

class StoryResponse(BaseModel):
    storyline: list[str]
    sketch_used: bool
