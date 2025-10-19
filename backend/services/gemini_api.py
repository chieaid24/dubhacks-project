import os
import json
from google import genai
from dotenv import load_dotenv

# Load environment variables from .env
dotenv_path = "/home/sagemaker-user/bedtime-lecturer/.env"
load_dotenv(dotenv_path)

# Optional: check that the key is loaded
print("GEMINI_API_KEY =", os.getenv("GEMINI_API_KEY") is not None)


# The client gets the API key from the environment variable `GEMINI_API_KEY`.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in environment variables")

client = genai.Client(api_key=GEMINI_API_KEY)

def generate_text(prompt):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text

def generate_lecture_from_json(parsed_pages):
    # Takes parsed pages and returns expanded lecture text per page
    lecture_pages = []

    # i = 0
    for page in parsed_pages:
        '''
        if (i == 2):
            break
        '''
        
        page_text = page["content"]

        # Skip empty pages
        if not page_text.strip():
            lecture_text = ""
        else:
            # Prompt for Gemini
            prompt = f"""
            Expand the following slide text into a (short) lecture format:
            Slide text: "{page_text}"
            Explain concepts clearly, add examples, and make it understandable. 
            Unless this is the title page, act as though you are continuing a lecture you were already talking about.
            Start your response immediately with the lecture.
            Make sure that your lecture is not too long, it should mostly just cover the content on the slide and not go too far beyond that.
            Your response should definitely be within 100-200 words (unless the slide has very little content and no applicable examples, the it can be less).
            """

            # Call Gemini API
            lecture_text = generate_text(prompt=prompt)
    
        lecture_pages.append({
            "page_number": page["page_number"],
            "lecture_text": lecture_text
        })
        # i += 1
    return lecture_pages


def save_lecture_output(lecture_pages, output_path: str):
    """
    Save generated lecture text per page to a JSON file.

    Args:
        lecture_pages (list): List of dicts with 'page_number' and 'lecture_text'
        output_path (str): Path to save the JSON file

    Returns:
        str: Path to the saved file
    """
    with open(output_path, "w") as f:
        json.dump(lecture_pages, f, indent=2)
    return output_path
        