import os
import google.generativeai as genai
from dotenv import load_dotenv
import re

# --- Environment Configuration ---
# Load environment variables from .env file
# Try multiple locations to ensure flexibility in deployment
load_dotenv()  # Try root directory first
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))  # Then try app folder

# --- Google AI Model Configuration ---
# Configure the generative AI model with API key from environment
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Determine whether to use real AI or dummy functions based on API key availability
if not GOOGLE_API_KEY:
    print("WARNING: GOOGLE_API_KEY not found. Using dummy functions for testing.")
    # Enable dummy mode for development/testing without API key
    USE_DUMMY_FUNCTIONS = True
else:
    print("GOOGLE_API_KEY configured successfully")
    # Configure the Google Generative AI library with the API key
    genai.configure(api_key=GOOGLE_API_KEY)
    USE_DUMMY_FUNCTIONS = False

# Initialize the AI model only if we have a valid API key
if not USE_DUMMY_FUNCTIONS:
    # Using Gemini 2.5 Flash Lite Preview - optimized for speed and cost-effectiveness
    model = genai.GenerativeModel('gemini-2.5-flash-lite-preview-06-17')

# --- AI Processing Functions ---

def generate_summary(text: str) -> str:
    """
    Generate a concise AI-powered summary of the document text.
    
    This function uses Google's Gemini AI to create a summary of no more than
    150 words that captures the key points and main ideas of the document.
    
    Args:
        text (str): The full text content of the document to summarize
        
    Returns:
        str: A concise summary of the document (max 150 words)
        
    Raises:
        Exception: If AI processing fails, returns error message as string
        
    Example:
        >>> summary = generate_summary("This is a long document about AI...")
        >>> print(summary)
        "This document discusses artificial intelligence applications..."
    """
    # Use dummy response if API key is not configured
    if USE_DUMMY_FUNCTIONS:
        return f"[DEMO MODE] This is a dummy summary of the uploaded document. The document contains {len(text)} characters. In a real deployment, this would be an AI-generated summary of the content."
    
    # Construct the AI prompt for summarization
    prompt = f"""
    Based on the following document, provide a concise summary of no more than 150 words.

    Document:
    ---
    {text}
    ---
    """
    
    try:
        # Generate summary using the AI model
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        # Return error message if AI processing fails
        return f"An error occurred while generating the summary: {e}"

def generate_questions(text: str, num_questions: int = 3) -> list[str]:
    """
    Generate logic-based comprehension questions from the document text.
    
    This function creates challenging questions that test the reader's understanding
    of the document content. Questions are designed to be logic-based and require
    comprehension rather than simple recall.
    
    Args:
        text (str): The full text content of the document
        num_questions (int): Number of questions to generate (default: 3)
        
    Returns:
        list[str]: List of generated questions as strings
        
    Raises:
        Exception: If AI processing fails, returns empty list and logs error
        
    Example:
        >>> questions = generate_questions("Document about climate change...", 5)
        >>> print(questions)
        ["What are the main causes of climate change?", "How does...", ...]
    """
    # Use dummy questions if API key is not configured
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
        # Return the requested number of dummy questions
        return dummy_questions[:num_questions]
    
    # Construct the AI prompt for question generation
    prompt = f"""
    Based on the following document, generate exactly {num_questions} logic-based or comprehension-focused questions.
    Present the questions clearly, each on a new line, starting with a number (e.g., 1., 2., 3.).

    Document:
    ---
    {text}
    ---
    """
    
    try:
        # Generate questions using the AI model
        response = model.generate_content(prompt)
        
        # Extract numbered questions using regex pattern matching
        # This ensures we get properly formatted questions
        questions = re.findall(r'^\s*\d+\.\s*(.*)', response.text, re.MULTILINE)
        
        # Fallback: if regex fails, split by newlines and clean up
        if not questions:
            questions = [q.strip() for q in response.text.split('\n') if q.strip()]
        
        return questions
    except Exception as e:
        # Log error and return empty list if AI processing fails
        print(f"Error generating questions: {e}")
        return []

def answer_question(context: str, question: str) -> str:
    """
    Answer a user's question based on the document content.
    
    This function uses AI to provide answers that are strictly based on the
    document content, without using external knowledge. The AI is instructed
    to include justification from the document to support its answers.
    
    Args:
        context (str): The full text content of the document
        question (str): The user's question about the document
        
    Returns:
        str: AI-generated answer with justification from the document
        
    Raises:
        Exception: If AI processing fails, returns error message as string
        
    Example:
        >>> answer = answer_question("Document text...", "What is the main topic?")
        >>> print(answer)
        "Based on the document, the main topic is... As stated in paragraph 2..."
    """
    # Use dummy response if API key is not configured
    if USE_DUMMY_FUNCTIONS:
        return f"[DEMO MODE] This is a dummy answer to your question: '{question}'. In a real deployment, this would be an AI-generated answer based on the document content."
    
    # Construct the AI prompt for question answering
    # Emphasize that answers must be based only on document content
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
        # Generate answer using the AI model
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        # Return error message if AI processing fails
        return f"An error occurred while answering the question: {e}"

def evaluate_answer(context: str, question: str, user_answer: str) -> str:
    """
    Evaluate a user's answer to a question against the document content.
    
    This function uses AI to assess whether a user's answer is correct and
    complete based on the document content. It returns a JSON response with
    both a correctness boolean and detailed evaluation feedback.
    
    Args:
        context (str): The full text content of the document
        question (str): The original question that was asked
        user_answer (str): The user's answer to evaluate
        
    Returns:
        str: JSON string containing evaluation results with format:
             {"is_correct": boolean, "evaluation": "detailed feedback"}
        
    Raises:
        Exception: If AI processing fails, returns JSON with error message
        
    Example:
        >>> result = evaluate_answer("Document...", "What is X?", "X is Y")
        >>> print(result)
        '{"is_correct": true, "evaluation": "Your answer is correct because..."}'
    """
    # Use dummy response if API key is not configured
    if USE_DUMMY_FUNCTIONS:
        return f"[DEMO MODE] Evaluation of your answer: '{user_answer}' to the question: '{question}'. In a real deployment, this would be an AI-generated evaluation based on the document content."
    
    # Construct the AI prompt for answer evaluation
    # Strict instructions for JSON format to ensure consistent parsing
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
        # Generate evaluation using the AI model
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        # Return JSON-formatted error message if AI processing fails
        return f'{{"is_correct": false, "evaluation": "An error occurred while evaluating the answer: {e}"}}' 
