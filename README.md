# GenAI Document Assistant

A smart document assistant that allows you to upload PDF or TXT documents and interact with them through Q&A, automatic summarization, and challenge questions.

## Features

- **Document Upload**: Support for PDF and TXT files
- **Auto-Summary**: Generates concise summaries (≤ 150 words)
- **Ask Anything**: Free-form Q&A about the document content
- **Challenge Mode**: Generated questions to test your understanding
- **Web UI**: Beautiful Gradio interface
- **REST API**: Programmatic access via FastAPI endpoints

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure API Key**:
   - Get your Google AI API key from: https://makersuite.google.com/app/apikey
   - Create a `.env` file in the project root:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

3. **Run the Application**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the Application**:
   - Web UI: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## API Endpoints

- `POST /api/upload` - Upload and process a document
- `POST /api/ask` - Ask questions about the document
- `POST /api/challenge` - Submit answers to challenge questions

## Usage

1. Upload a PDF or TXT document
2. View the auto-generated summary
3. Use "Ask Anything" tab for free-form questions
4. Try "Challenge Me" tab for comprehension questions

## Requirements

- Python 3.8+
- Google AI API key
- PDF/TXT documents for processing
