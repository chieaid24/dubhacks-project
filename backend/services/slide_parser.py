from pptx import Presentation
from PyPDF2 import PdfReader
import json


def parse_file(file_path: str):
    # Main entry point — detects file type and routes to parser.
    if file_path.endswith(".pptx"):
        return parse_pptx_as_pages(file_path)
    elif file_path.endswith(".pdf"):
        return parse_pdf(file_path)
    else:
        raise ValueError("Unsupported file format. Use .pptx or .pdf")


def parse_pptx_as_pages(file_path: str):
    # Treat PowerPoint slides as pages, same format as PDFs.
    prs = Presentation(file_path)
    pages = []
    for i, slide in enumerate(prs.slides):
        text_chunks = [
            shape.text.strip()
            for shape in slide.shapes
            if hasattr(shape, "text") and shape.text.strip()
        ]
        pages.append({
            "page_number": i + 1,
            "content": "\n".join(text_chunks)
        })
    return pages


def parse_pdf(file_path: str):
    reader = PdfReader(file_path)
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        pages.append({
            "page_number": i + 1,
            "content": text.strip() if text else ""
        })
    return pages


def save_parsed_output(pages, output_path: str):
    """Save parsed pages to a JSON file."""
    with open(output_path, "w") as f:
        json.dump(pages, f, indent=2)
    return output_path
