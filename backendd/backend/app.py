from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

import os
from backend.services.lecture_pipeline import run_pipeline_local

app = FastAPI(title="AI Lecture App - Full Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # allow your frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "../data")
OUTPUT_DIR = os.path.join(BASE_DIR, "../outputs")
AUDIO_DIR = os.path.join(BASE_DIR, "../static/audio")  # for frontend playback

# Make sure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

# --- Serve static audio files ---
app.mount("/static/audio", StaticFiles(directory=AUDIO_DIR), name="audio")


@app.get("/")
def root():
    return {"message": "Welcome to the AI Lecture App Backend!"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # --- Step 0: Validate file type ---
    if not file.filename.endswith((".pptx", ".pdf")):
        raise HTTPException(status_code=400, detail="Unsupported file type. Use .pptx or .pdf")

    # --- Step 1: Save uploaded file locally ---
    file_path = os.path.join(DATA_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # --- Step 2: Run full pipeline ---
    try:
        pipeline_result = run_pipeline_local(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running pipeline: {str(e)}")

    if pipeline_result["lecture_pages"] is None or pipeline_result["audio_files"] is None or pipeline_result["slides_data"] is None:
        raise HTTPException(status_code=500, detail="Pipeline failed to produce output")

    # Prepare audio URLs for frontend (assuming /static/audio is served)
    #audio_urls = [f"/static/audio/{os.path.basename(path)}" for path in pipeline_result["audio_files"]]

    # Return JSON with all outputs
    return JSONResponse({
        "filename": file.filename,
        "slide_count": len(pipeline_result["lecture_pages"]),
        "slides_data": pipeline_result["slides_data"],
        "image_paths": pipeline_result["image_paths"],
        "lecture_pages": pipeline_result["lecture_pages"],
        "audio_urls": pipeline_result["audio_files"]
    })
