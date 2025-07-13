"""
GenAI Document Assistant - Utility Functions

This module provides utility functions for document processing, specifically
text extraction from uploaded files. It supports both PDF and TXT file formats
and handles the conversion of uploaded file streams into plain text for AI processing.

The module uses PyMuPDF (fitz) for PDF text extraction, which provides robust
handling of various PDF formats and layouts. For TXT files, it handles proper
UTF-8 decoding of the uploaded file content.

Key Features:
- PDF text extraction using PyMuPDF library
- TXT file processing with UTF-8 encoding
- Robust error handling for file processing failures
- Support for FastAPI UploadFile objects
- Proper memory management for file streams

Dependencies:
- PyMuPDF (fitz): For PDF text extraction
- FastAPI: For UploadFile type support
- io: For bytes buffer handling

Author: aryanoutlaw
Version: 1.0.0
"""

import fitz  # PyMuPDF - library for PDF text extraction
from fastapi import UploadFile
import io

def extract_text_from_upload_file(file: UploadFile) -> str:
    """
    Extract text content from an uploaded file (PDF or TXT).
    
    This function processes uploaded files and extracts their text content
    for further AI processing. It supports both PDF and TXT file formats
    with appropriate handling for each file type.
    
    For PDF files:
    - Uses PyMuPDF (fitz) library for text extraction
    - Processes all pages in the document
    - Handles various PDF layouts and formats
    - Concatenates text from all pages
    
    For TXT files:
    - Reads raw bytes and decodes as UTF-8
    - Handles text encoding properly
    - Preserves original formatting
    
    Args:
        file (UploadFile): The uploaded file object from FastAPI containing
                          either a PDF or TXT file to process
        
    Returns:
        str: The extracted text content from the file as a single string
        
    Raises:
        IOError: If there's an error processing the PDF or reading the TXT file
        ValueError: If the file format is not supported (not PDF or TXT)
        
    Example:
        >>> from fastapi import UploadFile
        >>> # Assuming 'uploaded_file' is an UploadFile object
        >>> text = extract_text_from_upload_file(uploaded_file)
        >>> print(text[:100])  # Print first 100 characters
        "This is the extracted text from the document..."
    """
    # Extract file extension to determine processing method
    # Convert to lowercase for case-insensitive comparison
    file_extension = file.filename.split('.')[-1].lower()

    if file_extension == "pdf":
        try:
            # Process PDF file using PyMuPDF
            # Read the entire file content into memory as bytes
            pdf_stream = io.BytesIO(file.file.read())
            
            # Open the PDF document from the byte stream
            # Using stream parameter allows processing without saving to disk
            doc = fitz.open(stream=pdf_stream, filetype="pdf")
            
            # Initialize empty string to accumulate text from all pages
            text = ""
            
            # Iterate through all pages in the PDF document
            for page in doc:
                # Extract text from current page and append to result
                # get_text() returns all text content from the page
                text += page.get_text()
            
            # Close the document to free up memory resources
            doc.close()
            
            return text
            
        except Exception as e:
            # Handle any errors during PDF processing
            # This includes corrupted PDFs, unsupported formats, etc.
            raise IOError(f"Error processing PDF file: {e}")
            
    elif file_extension == "txt":
        try:
            # Process TXT file
            # Read the raw bytes from the uploaded file
            file_bytes = file.file.read()
            
            # Decode bytes to string using UTF-8 encoding
            # UTF-8 is the standard encoding for text files
            text = file_bytes.decode("utf-8")
            
            return text
            
        except Exception as e:
            # Handle any errors during TXT file processing
            # This includes encoding issues, corrupted files, etc.
            raise IOError(f"Error reading TXT file: {e}")
            
    else:
        # Unsupported file format
        # Only PDF and TXT files are currently supported
        raise ValueError("Unsupported file format. Please upload a PDF or TXT file.") 