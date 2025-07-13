import os
import google.generativeai as genai
from dotenv import load_dotenv
import re

# Load environment variables from .env file
load_dotenv()  # Try root first
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))  # Then try app folder

# Configure the generative AI model
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("WARNING: GOOGLE_API_KEY not found. Using dummy functions for testing.")
    # Set a flag to use dummy functions
    USE_DUMMY_FUNCTIONS = True
else:
    print("GOOGLE_API_KEY configured successfully")
    genai.configure(api_key=GOOGLE_API_KEY)
    USE_DUMMY_FUNCTIONS = False

# Use the latest Gemini 1.5 Flash model
if not USE_DUMMY_FUNCTIONS:
    model = genai.GenerativeModel('gemini-2.5-flash-lite-preview-06-17')

def generate_summary(text: str) -> str:
    """Generates a summary for the given text."""
    if USE_DUMMY_FUNCTIONS:
        return f"[DEMO MODE] This is a dummy summary of the uploaded document. The document contains {len(text)} characters. In a real deployment, this would be an AI-generated summary of the content."
    
    prompt = f"""
    Based on the following document, provide a concise summary of no more than 150 words.

    Document:
    ---
    {text}
    ---
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"An error occurred while generating the summary: {e}"

def generate_questions(text: str, num_questions: int = 3) -> list[str]:
    """Generates logic-based or comprehension-focused questions from the text."""
    if USE_DUMMY_FUNCTIONS:
        dummy_questions = [
            "What is the main topic of this document?",
            "What are the key points mentioned in the text?",
            "What conclusions can be drawn from the content?",
            "What evidence supports the main arguments?",
            "How does this relate to broader concepts?",
            "What are the implications of the findings?",
            "What methodology was used in this work?",
            "What are the limitations discussed?",
            "What future research is suggested?",
            "What are the practical applications mentioned?"
        ]
        return dummy_questions[:num_questions]
    
    prompt = f"""
    Based on the following document, generate exactly {num_questions} logic-based or comprehension-focused questions.
    Present the questions clearly, each on a new line, starting with a number (e.g., 1., 2., 3.).

    Document:
    ---
    {text}
    ---
    """
    try:
        response = model.generate_content(prompt)
        # Use regex to find all numbered list items
        questions = re.findall(r'^\s*\d+\.\s*(.*)', response.text, re.MULTILINE)
        return questions if questions else [q.strip() for q in response.text.split('\n') if q.strip()]
    except Exception as e:
        print(f"Error generating questions: {e}")
        return []

def answer_question(context: str, question: str) -> str:
    """Answers a user's question based on the document's context."""
    if USE_DUMMY_FUNCTIONS:
        return f"[DEMO MODE] This is a dummy answer to your question: '{question}'. In a real deployment, this would be an AI-generated answer based on the document content."
    
    prompt = f"""
    You are a helpful assistant. Your task is to answer the user's question based *only* on the provided document content.
    Do not use any external knowledge or make assumptions.
    Your answer must include a brief justification or reference from the document that supports your response (e.g., "As stated in paragraph 3...").

    Document Content:
    ---
    {context}
    ---

    Question: "{question}"
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"An error occurred while answering the question: {e}"

def evaluate_answer(context: str, question: str, user_answer: str) -> str:
    """Evaluates a user's answer to a question against the document's context."""
    if USE_DUMMY_FUNCTIONS:
        return f"[DEMO MODE] Evaluation of your answer: '{user_answer}' to the question: '{question}'. In a real deployment, this would be an AI-generated evaluation based on the document content."
    
    prompt = f"""
    You are an evaluator. Your task is to determine if the user's answer is correct based *only* on the provided document content.
    
    You must respond with a JSON object in this exact format (no markdown, no code blocks, just raw JSON):
    {{
        "is_correct": true,
        "evaluation": "Your detailed evaluation and justification here"
    }}
    
    OR
    
    {{
        "is_correct": false,
        "evaluation": "Your detailed evaluation and justification here"
    }}
    
    Rules:
    - Set "is_correct" to true only if the user's answer is factually correct and complete based on the document
    - Set "is_correct" to false if the answer is wrong, incomplete, or not based on the document content
    - In "evaluation", provide a brief evaluation and justification for your feedback, citing the document
    - Return ONLY the JSON object, no additional text, no markdown formatting, no code blocks
    - Do not wrap the JSON in ```json``` or any other formatting

    Document Content:
    ---
    {context}
    ---

    Question: "{question}"
    User's Answer: "{user_answer}"
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f'{{"is_correct": false, "evaluation": "An error occurred while evaluating the answer: {e}"}}' 