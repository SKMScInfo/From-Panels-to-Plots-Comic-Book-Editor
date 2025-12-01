from pydantic import BaseModel

class StoryInput(BaseModel):
    story: str
    fortuneSketch: str
    characterName: str 

class StoryResponse(BaseModel):
    storyline: list[str]
