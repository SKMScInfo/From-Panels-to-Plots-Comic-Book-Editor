from pydantic import BaseModel

class StoryInput(BaseModel):
    text: str

class StoryResponse(BaseModel):
    storyline: list[str]
