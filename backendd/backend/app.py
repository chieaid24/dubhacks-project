from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
from backend.services.lecture_pipeline import run_pipeline_local

app = FastAPI(title="AI Lecture App - Full Pipeline")

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "../data")
OUTPUT_DIR = os.path.join(BASE_DIR, "../outputs")
AUDIO_DIR = os.path.join(BASE_DIR, "../static/audio")  # for frontend playback

# Make sure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)


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
        lecture_pages, audio_files = run_pipeline_local(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running pipeline: {str(e)}")

    if lecture_pages is None or audio_files is None:
        raise HTTPException(status_code=500, detail="Pipeline failed to produce output")

    # Prepare audio URLs for frontend (assuming /static/audio is served)
    audio_urls = [f"/static/audio/{os.path.basename(path)}" for path in audio_files]

    # Return JSON with all outputs
    return JSONResponse({
        "filename": file.filename,
        "slide_count": len(lecture_pages),
        "lecture_pages": lecture_pages,
        "audio_urls": audio_urls
    })
