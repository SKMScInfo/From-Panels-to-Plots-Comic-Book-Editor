from pydantic import BaseModel

class ComicBookPageInput(BaseModel):
    keywords: str
    comicBookSketch: str | None = None   # <--- added this

# new image URL to send back
class ComicBookPageResponse(BaseModel):
    comicBookImage: str

