from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play
import os

load_dotenv()

elevenlabs = ElevenLabs(
  api_key=os.getenv("ELEVEN_API_KEY"),
)

def tts_eleven(script): 
    audio = elevenlabs.text_to_speech.convert(
        text=script,
        voice_id="fJE3lSefh7YI494JMYYz",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
    )
    return audio

def save_tts_audio(audio_bytes, output_path: str):
    """
    Save TTS audio bytes to an MP3 file.

    Args:
        audio_bytes (bytes or iterator of bytes): Audio data from tts_eleven
        output_path (str): Path to save the MP3 file

    Returns:
        str: Path to the saved MP3 file
    """
    # If audio_bytes is an iterator (ElevenLabs can return an iterator), join it
    if hasattr(audio_bytes, "__iter__") and not isinstance(audio_bytes, bytes):
        audio_bytes = b"".join(audio_bytes)

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Write audio to file
    with open(output_path, "wb") as f:
        f.write(audio_bytes)

    return output_path

