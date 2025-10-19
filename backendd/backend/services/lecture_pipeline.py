import os
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
    parsed_pages = parse_file(file_path)

    parsed_dir = "../parsed"
    os.makedirs(parsed_dir, exist_ok=True)
    parsed_path = os.path.join(parsed_dir, "parsed.json")
    save_parsed_output(parsed_pages, parsed_path)
    print(f"✅ Parsed file saved to {parsed_path}")

    # -----------------------------
    # Step 2: Generate lecture script
    # -----------------------------
    lecture_pages = generate_lecture_from_json(parsed_pages)

    scripts_dir = "../scripts"
    os.makedirs(scripts_dir, exist_ok=True)
    scripts_path = os.path.join(scripts_dir, "lecture_script_output.json")
    save_parsed_output(lecture_pages, scripts_path)
    print(f"✅ Lecture script saved to {scripts_path}")

    # -----------------------------
    # Step 3: Generate audio for each page
    # -----------------------------
    audio_dir = "../audio"
    os.makedirs(audio_dir, exist_ok=True)
    audio_files = []

    for page in lecture_pages:
        audio_path = os.path.join(audio_dir, f"slide_{page['page_number']}.mp3")
        audio_bytes = b"".join(tts_eleven(page["lecture_text"]))  # join generator into bytes
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)
        audio_files.append(audio_path)

    print(f"✅ Generated {len(audio_files)} audio files → {audio_dir}")

    return lecture_pages, audio_files
