import fitz  # PyMuPDF
from fastapi import UploadFile
import io

def extract_text_from_upload_file(file: UploadFile) -> str:
    """
    Extracts text from an uploaded file (PDF or TXT).

    Args:
        file: The uploaded file from FastAPI.

    Returns:
        The extracted text as a string.
    """
    file_extension = file.filename.split('.')[-1].lower()

    if file_extension == "pdf":
        try:
            # Read the file content into a bytes buffer
            pdf_stream = io.BytesIO(file.file.read())
            doc = fitz.open(stream=pdf_stream, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            raise IOError(f"Error processing PDF file: {e}")
    elif file_extension == "txt":
        try:
            # Read the file content as bytes and decode to string
            return file.file.read().decode("utf-8")
        except Exception as e:
            raise IOError(f"Error reading TXT file: {e}")
    else:
        raise ValueError("Unsupported file format. Please upload a PDF or TXT file.") 