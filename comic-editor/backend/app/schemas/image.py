from pydantic import BaseModel

class ComicBookPageInput(BaseModel):
    keywords: str
    comicBookSketch: str 

# new image URL to send back
class ComicBookPageResponse(BaseModel):
    comicBookImage: str

