import os
import shutil
from .slide_parser import parse_file, save_parsed_output
from .gemini_api import generate_lecture_from_json
from .eleven_api import tts_eleven

def run_pipeline_local(file_path):
    """
    Complete end-to-end pipeline for a local file:
    1. Parse slides / PDF
    2. Generate lecture script with Gemini
    3. Generate audio files with ElevenLabs
    Returns: tuple(lecture_pages, audio_files)
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    # -----------------------------
    # Step 1: Parse file
    # -----------------------------
    slides_data, image_paths = parse_file(file_path)

    # Step 2: Prepare clean output directories
    parsed_dir = "outputs/parsed"
    scripts_dir = "outputs/scripts"

    for d in [parsed_dir, scripts_dir]:
        if os.path.exists(d):
            shutil.rmtree(d)
        os.makedirs(d, exist_ok=True)




    os.makedirs(parsed_dir, exist_ok=True)
    parsed_path = os.path.join(parsed_dir, "parsed.json")
    save_parsed_output(slides_data, parsed_path)
    print(f"✅ Parsed file saved to {parsed_path}")

    # -----------------------------
    # Step 2: Generate lecture script
    # -----------------------------
    lecture_pages = generate_lecture_from_json(slides_data)

    scripts_path = os.path.join(scripts_dir, "lecture_script_output.json")
    save_parsed_output(lecture_pages, scripts_path)
    print(f"✅ Lecture script saved to {scripts_path}")

    # Use the same directory FastAPI serves: backend/static/audio
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    audio_dir = os.path.join(BASE_DIR, "../static/audio")
    os.makedirs(audio_dir, exist_ok=True)

    audio_files = []
    audio_urls = []

    for page in lecture_pages:
        filename = f"slide_{page['page_number']}.mp3"
        audio_path = os.path.join(audio_dir, filename)
        audio_bytes = b"".join(tts_eleven(page["lecture_text"]))
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)
        
        # Keep backend reference + frontend URL
        audio_files.append(audio_path)
        audio_urls.append(f"/static/audio/{filename}")

    print(f"✅ Generated {len(audio_files)} audio files → {audio_dir}")

    return {
        "slides_data": slides_data,
        "image_paths": image_paths,
        "lecture_pages": lecture_pages,
        "audio_files": audio_urls
    }
