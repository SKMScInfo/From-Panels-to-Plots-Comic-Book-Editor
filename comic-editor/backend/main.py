from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- CORS so React frontend can talk to backend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # in production change this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Test route ---
@app.get("/ping")
def ping():
    return {"message": "pong"}


# --- Endpoint to receive user story + sketch (base64) ---
@app.post("/generate")
async def generate(data: dict):
    story_text = data.get("story", "")
    sketch = data.get("sketch", None)  # base64 string (optional)

    # Here later you'll call your ML model
    return {
        "received_text": story_text,
        "received_sketch": sketch is not None,
        "status": "ok"
    }
