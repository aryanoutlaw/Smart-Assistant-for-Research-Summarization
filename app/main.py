import json
import re
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import custom modules for document processing and AI functionality
from app.utils import extract_text_from_upload_file
from app.llm import (
    generate_summary,
    generate_questions,
    answer_question,
    evaluate_answer,
)

# --- In-Memory Storage ---
# Simple dictionary-based storage for the current session's document data
# This stores the processed document content and AI-generated materials

document_store = {
    "filename": "",      
    "text": "",         
    "summary": "",       
    "questions": [],    
}

# --- Pydantic Models for API Request/Response Validation ---

class AskRequest(BaseModel):
    """
    Request model for the /api/ask endpoint.
    
    Attributes:
        question (str): The user's question about the document content
    """
    question: str

class ChallengeRequest(BaseModel):
    """
    Request model for the /api/challenge endpoint.
    
    Attributes:
        question (str): The challenge question being answered
        answer (str): The user's answer to the challenge question
    """
    question: str
    answer: str

# --- FastAPI Application Configuration ---

app = FastAPI(
    title="GenAI Document Assistant",
    description="Upload a document (PDF/TXT) to interact with it. Supports Q&A, content-based challenges, and provides an automatic summary.",
    version="1.0.0",
)

# Configure CORS middleware to allow React frontend communication
# Get allowed origins from environment variable or use defaults
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else [
    "http://localhost:3000", 
    "https://genai-assistant.vercel.app"
]

# Remove empty strings and strip whitespace
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

# Print allowed origins for debugging
print(f"Allowed CORS origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,                  
    allow_methods=["*"],                     
    allow_headers=["*"],                     
)

# --- API Endpoints ---

@app.get("/", tags=["Health"])
async def root():
    """
    Health check endpoint to verify the API is running.
    """
    return {"message": "GenAI Document Assistant API is running!"}

@app.get("/api/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint with CORS headers for debugging.
    """
    return {"status": "healthy", "message": "API is running"}

@app.options("/{path:path}", tags=["CORS"])
async def options_handler(path: str):
    """
    Handle OPTIONS requests for CORS preflight
    """
    return {}

@app.post("/api/upload", tags=["API"])
async def http_upload_document(file: UploadFile = File(...), num_questions: int = 3):
    """
    Upload and process a document for AI analysis.
    
    This endpoint handles document upload, text extraction, and generates both
    a summary and challenge questions using AI. The processed content is stored
    in memory for use by other endpoints.
    
    Args:
        file (UploadFile): The uploaded document file (PDF or TXT)
        num_questions (int): Number of challenge questions to generate (3-10)
        
    Returns:
        dict: Contains filename, AI-generated summary, and list of questions
        
    Raises:
        HTTPException: 
            - 400: If file format is unsupported or num_questions is invalid
            - 500: If document processing fails
            
    Example Response:
        {
            "filename": "document.pdf",
            "summary": "This document discusses...",
            "questions": ["What is the main topic?", "..."]
        }
    """
    # Validate file format - only PDF and TXT files are supported
    if not file.filename.endswith(('.pdf', '.txt')):
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file format. Please upload a PDF or TXT file."
        )

    # Validate the number of questions parameter
    if num_questions < 3 or num_questions > 10:
        raise HTTPException(
            status_code=400, 
            detail="Number of questions must be between 3 and 10."
        )

    try:
        # Extract text content from the uploaded file
        text = extract_text_from_upload_file(file)
        
        # Store the extracted text and filename in memory
        document_store["text"] = text
        document_store["filename"] = file.filename

        # Generate AI-powered summary and questions
        summary = generate_summary(text)
        questions = generate_questions(text, num_questions)

        # Store the AI-generated content for later use
        document_store["summary"] = summary
        document_store["questions"] = questions

        # Return the processed results to the client
        return {
            "filename": file.filename,
            "summary": summary,
            "questions": questions,
        }
    except Exception as e:
        # Handle any errors during document processing
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process file: {e}"
        )

@app.post("/api/ask", tags=["API"])
async def http_ask_question(request: AskRequest):
    """
    Answer a free-form question about the uploaded document.
    
    This endpoint uses AI to answer user questions based on the content
    of the most recently uploaded document. The AI is instructed to base
    answers only on the document content, not external knowledge.
    
    Args:
        request (AskRequest): Contains the user's question
        
    Returns:
        dict: Contains the AI-generated answer
        
    Raises:
        HTTPException:
            - 400: If no document has been uploaded
            - 500: If answer generation fails
            
    Example Response:
        {
            "answer": "Based on the document, the main topic is..."
        }
    """
    # Check if a document has been uploaded and processed
    if not document_store["text"]:
        raise HTTPException(
            status_code=400, 
            detail="No document uploaded. Please upload a document first via the /api/upload endpoint."
        )
    
    try:
        # Generate AI answer based on document content and user question
        answer = answer_question(document_store["text"], request.question)
        return {"answer": answer}
    except Exception as e:
        # Handle any errors during answer generation
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred: {e}"
        )

@app.post("/api/regenerate-questions", tags=["API"])
async def http_regenerate_questions(num_questions: int = 3):
    """
    Generate new challenge questions for the current document.
    
    This endpoint creates a fresh set of AI-generated questions based on
    the currently uploaded document. Useful when users want different
    questions or want to adjust the number of questions.
    
    Args:
        num_questions (int): Number of questions to generate (3-10)
        
    Returns:
        dict: Contains the list of newly generated questions
        
    Raises:
        HTTPException:
            - 400: If no document uploaded or invalid num_questions
            - 500: If question generation fails
            
    Example Response:
        {
            "questions": ["What is the methodology?", "What are the results?", "..."]
        }
    """
    # Ensure a document has been uploaded
    if not document_store["text"]:
        raise HTTPException(
            status_code=400, 
            detail="No document uploaded. Please upload a document first."
        )
    
    # Validate the number of questions parameter
    if num_questions < 3 or num_questions > 10:
        raise HTTPException(
            status_code=400, 
            detail="Number of questions must be between 3 and 10."
        )
    
    try:
        # Generate new questions using AI
        questions = generate_questions(document_store["text"], num_questions)
        
        # Update the stored questions with the new ones
        document_store["questions"] = questions
        
        return {"questions": questions}
    except Exception as e:
        # Handle any errors during question generation
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to regenerate questions: {e}"
        )

@app.post("/api/challenge", tags=["API"])
async def http_evaluate_challenge(request: ChallengeRequest):
    """
    Evaluate a user's answer to a challenge question.
    
    This endpoint uses AI to evaluate whether a user's answer to a challenge
    question is correct based on the document content. The AI provides both
    a correctness assessment and detailed feedback.
    
    Args:
        request (ChallengeRequest): Contains the question and user's answer
        
    Returns:
        dict: Contains evaluation feedback and correctness boolean
        
    Raises:
        HTTPException:
            - 400: If no document has been uploaded
            - 500: If evaluation fails
            
    Example Response:
        {
            "evaluation": "Your answer is correct because...",
            "is_correct": true
        }
    """
    # Ensure a document has been uploaded for evaluation context
    if not document_store["text"]:
        raise HTTPException(
            status_code=400, 
            detail="No document uploaded. Please upload a document first."
        )
    
    try:
        # Get AI evaluation of the user's answer
        evaluation_response = evaluate_answer(
            context=document_store["text"],
            question=request.question,
            user_answer=request.answer
        )
        
        # Clean up the AI response by removing any markdown formatting
        # The AI sometimes returns JSON wrapped in markdown code blocks
        cleaned_response = evaluation_response.strip()
        
        # Remove markdown code block markers if present
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]  # Remove ```json
        elif cleaned_response.startswith('```'):
            cleaned_response = cleaned_response[3:]   # Remove ```
        
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]  # Remove trailing ```
        
        # Remove any remaining whitespace
        cleaned_response = cleaned_response.strip()
        
        # Extract JSON content if it's embedded within other text
        json_match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
        if json_match:
            cleaned_response = json_match.group(0)
        
        # Parse the AI's JSON response
        try:
            evaluation_data = json.loads(cleaned_response)
            return {
                "evaluation": evaluation_data.get("evaluation", "No evaluation provided"),
                "is_correct": evaluation_data.get("is_correct", False)
            }
        except json.JSONDecodeError as json_error:
            # Fallback: if JSON parsing fails, return error message
            print(f"JSON parsing error: {json_error}")
            print(f"Cleaned response: {cleaned_response}")
            return {
                "evaluation": f"Error parsing evaluation response: {evaluation_response}",
                "is_correct": False
            }
    except Exception as e:
        # Handle any errors during evaluation
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred: {e}"
        )

if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)