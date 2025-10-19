import os
import json
from .slide_parser import parse_file
from .gemini_api import generate_lecture_from_json
from .eleven_api import tts_eleven

def run_pipeline(file_path):
    # Step 1: parse slides
    slides_data = parse_file(file_path)

    # Step 2: generate lecture script
    slide_scripts = generate_lecture_from_json(slides_data)

    # Step 3: generate audio files
    audio_files = []
    for page in slide_scripts:
        audio_bytes = tts_eleven(page["slide_text"])
        audio_files.append(audio_bytes)

    return slide_scripts, audio_files