import os
import json
import re
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.utils import extract_text_from_upload_file
from app.llm import (
    generate_summary,
    generate_questions,
    answer_question,
    evaluate_answer,
)

# --- In-Memory Storage ---
# A simple dictionary to hold the processed document context.
# In a production environment, you might use a database or a more robust caching solution.
document_store = {
    "filename": "",
    "text": "",
    "summary": "",
    "questions": [],
}

# --- Pydantic Models for API validation ---
class AskRequest(BaseModel):
    question: str

class ChallengeRequest(BaseModel):
    question: str
    answer: str

# --- FastAPI Application ---
app = FastAPI(
    title="GenAI Document Assistant",
    description="Upload a document (PDF/TXT) to interact with it. Supports Q&A, content-based challenges, and provides an automatic summary.",
    version="1.0.0",
)

# Add CORS middleware to allow React frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints for Postman/programmatic access ---
@app.post("/api/upload", tags=["API"])
async def http_upload_document(file: UploadFile = File(...), num_questions: int = 3):
    """
    Uploads a document, extracts text, and generates a summary and challenge questions.
    The processed content is stored in memory for subsequent API calls.
    """
    if not file.filename.endswith(('.pdf', '.txt')):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF or TXT file.")

    # Validate num_questions parameter
    if num_questions < 3 or num_questions > 10:
        raise HTTPException(status_code=400, detail="Number of questions must be between 3 and 10.")

    try:
        text = extract_text_from_upload_file(file)
        document_store["text"] = text
        document_store["filename"] = file.filename

        summary = generate_summary(text)
        questions = generate_questions(text, num_questions)

        document_store["summary"] = summary
        document_store["questions"] = questions

        return {
            "filename": file.filename,
            "summary": summary,
            "questions": questions,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {e}")

@app.post("/api/ask", tags=["API"])
async def http_ask_question(request: AskRequest):
    """
    Asks a free-form question about the most recently uploaded document.
    """
    if not document_store["text"]:
        raise HTTPException(status_code=400, detail="No document uploaded. Please upload a document first via the /api/upload endpoint.")
    
    try:
        answer = answer_question(document_store["text"], request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

@app.post("/api/regenerate-questions", tags=["API"])
async def http_regenerate_questions(num_questions: int = 3):
    """
    Regenerates challenge questions for the currently uploaded document.
    """
    if not document_store["text"]:
        raise HTTPException(status_code=400, detail="No document uploaded. Please upload a document first.")
    
    # Validate num_questions parameter
    if num_questions < 3 or num_questions > 10:
        raise HTTPException(status_code=400, detail="Number of questions must be between 3 and 10.")
    
    try:
        questions = generate_questions(document_store["text"], num_questions)
        document_store["questions"] = questions
        
        return {
            "questions": questions,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to regenerate questions: {e}")

@app.post("/api/challenge", tags=["API"])
async def http_evaluate_challenge(request: ChallengeRequest):
    """
    Submits an answer to one of the generated challenge questions for evaluation.
    """
    if not document_store["text"]:
        raise HTTPException(status_code=400, detail="No document uploaded. Please upload a document first.")
    
    try:
        evaluation_response = evaluate_answer(
            context=document_store["text"],
            question=request.question,
            user_answer=request.answer
        )
        
        # Clean the response by removing markdown code blocks and extra whitespace
        cleaned_response = evaluation_response.strip()
        
        # Remove markdown code blocks if present
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]  # Remove ```json
        elif cleaned_response.startswith('```'):
            cleaned_response = cleaned_response[3:]   # Remove ```
        
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]  # Remove trailing ```
        
        # Remove any leading/trailing whitespace again
        cleaned_response = cleaned_response.strip()
        
        # Try to extract JSON if it's embedded in text
        json_match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
        if json_match:
            cleaned_response = json_match.group(0)
        
        # Try to parse the JSON response from the LLM
        try:
            evaluation_data = json.loads(cleaned_response)
            return {
                "evaluation": evaluation_data.get("evaluation", "No evaluation provided"),
                "is_correct": evaluation_data.get("is_correct", False)
            }
        except json.JSONDecodeError as json_error:
            # Fallback: if JSON parsing fails, assume incorrect and return raw response
            print(f"JSON parsing error: {json_error}")
            print(f"Cleaned response: {cleaned_response}")
            return {
                "evaluation": f"Error parsing evaluation response: {evaluation_response}",
                "is_correct": False
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

 