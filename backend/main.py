from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
import json

# Import your service pipeline
from services.lecture_pipeline import run_pipeline
from services.eleven_api import save_tts_audio

# ---------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------
app = FastAPI(title="Bedtime Lecture Backend")

# --- CORS setup ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Directories for uploads and static assets
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "static"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Serve static files (audio, JSON, etc.)
# Accessible at http://localhost:8000/static/<filename>
app.mount("/static", StaticFiles(directory=OUTPUT_DIR), name="static")

# ---------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------

@app.get("/")
def root():
    return {"message": "Bedtime Lecture API is running."}


@app.post("/upload")
async def process_file(file: UploadFile = File(...)):
    """
    Uploads a PowerPoint (.pptx) or PDF, generates lecture text and TTS audio per slide.
    Returns paths to generated lecture JSON and audio files.
    """
    try:
        # Validate file extension
        if not (file.filename.endswith(".pptx") or file.filename.endswith(".pdf")):
            raise HTTPException(status_code=400, detail="Only .pptx or .pdf files are supported.")

        # Save uploaded file
        file_id = str(uuid.uuid4())
        upload_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run the pipeline
        slide_scripts, audio_iterators = run_pipeline(upload_path)

        # Save outputs
        page_outputs = []
        lecture_json_path = os.path.join(OUTPUT_DIR, f"{file_id}_lecture.json")

        # Write JSON file
        with open(lecture_json_path, "w") as f:
            json.dump(slide_scripts, f, indent=2)

        # Save each audio file
        for i, audio in enumerate(audio_iterators):
            audio_path = os.path.join(OUTPUT_DIR, f"{file_id}_page_{i+1}.mp3")
            save_tts_audio(audio, audio_path)
            page_outputs.append({
                "page_number": i + 1,
                "audio_url": f"/static/{os.path.basename(audio_path)}"
            })

        return JSONResponse({
            "audio_files": page_outputs
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

