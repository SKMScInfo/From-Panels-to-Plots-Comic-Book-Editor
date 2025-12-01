from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api import api_router


app = FastAPI()

# Get absolute path to backend/content/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(BASE_DIR, "content")

print("STATIC FILES LOADING FROM:", CONTENT_DIR)

app.mount(
    "/content",
    StaticFiles(directory=CONTENT_DIR),
    name="content"
)

# --- CORS so React frontend can talk to backend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # in production change this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router)






# # --- Test route ---
# @app.get("/ping")
# async def ping():
#     return {"message": "pong"}


# # --- Endpoint to receive user story + sketch (base64) ---
# @app.post("/generate")
# async def generate(data: dict):
#     story_text = data.get("story", "")
#     sketch = data.get("sketch", None)  # base64 string (optional)

#     # Here later you'll call your ML model
#     return {
#         "received_text": story_text,
#         "received_sketch": sketch is not None,
#         "status": "ok"
#     }
