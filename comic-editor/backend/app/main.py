from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware as StarletteCORS
import os

from app.api import api_router

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(BASE_DIR, "content")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# 1. Global CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. API routes FIRST
app.include_router(api_router)

# 3. TEST ROUTE — MUST NOT BE UNDER /content/*
@app.get("/content-test")
def test_check():
    return {"ok": True}

# 4. Static files LAST
static_files_app = StaticFiles(directory=CONTENT_DIR)
static_files_app = StarletteCORS(
    app=static_files_app,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.mount("/content", static_files_app, name="content")

print(CONTENT_DIR)
print("CONTENT_DIR EXISTS:", os.path.exists(CONTENT_DIR))
print("\nREGISTERED ROUTES:")
for r in app.routes:
    print(" -", r.path, "  (name:", r.name, ")")
