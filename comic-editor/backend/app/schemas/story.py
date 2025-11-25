from pydantic import BaseModel

class StoryInput(BaseModel):
    story: str
    fortuneSketch: str 

class StoryResponse(BaseModel):
    storyline: list[str]
