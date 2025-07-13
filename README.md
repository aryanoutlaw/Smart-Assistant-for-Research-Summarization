# GenAI Document Assistant

A modern, AI-powered document assistant that allows you to upload PDF or TXT documents and interact with them through intelligent Q&A, automatic summarization, and comprehension challenges. Built with React and FastAPI.

🌐 **Live Demo**: [https://genai-assistant.vercel.app/](https://genai-assistant.vercel.app/)

## Features

- **📄 Document Upload**: Drag-and-drop support for PDF and TXT files
- **🤖 AI-Powered Summary**: Generates concise summaries (≤150 words) using Google Gemini AI
- **💬 Interactive Q&A**: Chat-style interface for asking questions about document content
- **🏆 Challenge Mode**: AI-generated comprehension questions with evaluation
- **🎨 Modern UI**: Beautiful, responsive React interface with TypeScript
- **🔌 REST API**: FastAPI backend with comprehensive API documentation

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication
- **Deployed on Vercel**

### Backend
- **FastAPI** with Python 3.13+
- **Google Gemini AI** for text processing
- **PyMuPDF** for PDF text extraction
- **Uvicorn** ASGI server

## Quick Start

### Prerequisites
- Node.js 16+ (for frontend development)
- Python 3.13+ (for backend development)
- Google AI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Optional**: [uv](https://docs.astral.sh/uv/) for faster Python package management

### Backend Setup

1. **Install Python Dependencies**:
   
   **Option A: Using pip (traditional)**
   ```bash
   pip install -r requirements.txt
   ```
   
   **Option B: Using uv (faster, recommended)**
   ```bash
   # Install uv if you haven't already
   pip install uv
   
   # Install dependencies using uv
   uv sync
   ```

2. **Configure Environment**:
   Create a `.env` file in the project root:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```

3. **Run the Backend**:
   
   **With pip/regular Python:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   **With uv:**
   ```bash
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **API Documentation**: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create `frontend/.env.local`:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Run the Frontend**:
   ```bash
   npm start
   ```

5. **Access Application**: http://localhost:3000

## Deployment

### Current Deployment
- **Frontend**: Deployed on [Vercel](https://vercel.com) at [https://genai-assistant.vercel.app/](https://genai-assistant.vercel.app/)
- **Backend**: Deployed on [Render](https://render.com) with automatic API integration

### Frontend (Vercel)
The frontend is deployed on Vercel and automatically builds from the `frontend/` directory. Vercel provides:
- Automatic deployments from GitHub
- Global CDN for fast loading
- Custom domain support
- Preview deployments for pull requests

### Backend (Render)
The backend is currently deployed on Render, which offers:
- Automatic deployments from GitHub
- Built-in SSL certificates
- Environment variable management
- Automatic scaling

### Alternative Deployment Options
The backend can also be deployed on other platforms that support Python/FastAPI:
- Railway
- Heroku
- AWS Lambda
- Google Cloud Run
- DigitalOcean App Platform

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/upload` | POST | Upload and process document |
| `/api/ask` | POST | Ask questions about document |
| `/api/challenge` | POST | Submit challenge answers |
| `/api/regenerate-questions` | POST | Generate new challenge questions |

## Usage

1. **Upload Document**: Drag and drop or click to select a PDF/TXT file
2. **View Summary**: Automatically generated AI summary appears first
3. **Ask Questions**: Use the Q&A tab for free-form questions about the document
4. **Take Challenge**: Test your understanding with AI-generated questions

## File Structure

```
Smart Assistant/
├── app/                    # FastAPI backend
│   ├── __init__.py
│   ├── main.py            # FastAPI application
│   ├── llm.py             # Google Gemini AI integration
│   └── utils.py           # File processing utilities
├── frontend/              # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   └── App.tsx        # Main application
│   ├── package.json
│   └── vercel.json        # Vercel deployment config
├── requirements.txt       # Python dependencies
├── pyproject.toml        # Python project configuration
└── README.md
```

## Development

### Running in Development Mode

1. **Start Backend**:
   
   **With pip/regular Python:**
   ```bash
   uvicorn app.main:app --reload
   ```
   
   **With uv:**
   ```bash
   uv run uvicorn app.main:app --reload
   ```

2. **Start Frontend**:
   ```bash
   cd frontend && npm start
   ```

### Building for Production

1. **Frontend Build**:
   ```bash
   cd frontend && npm run build
   ```

2. **Backend Production**:
   
   **With pip/regular Python:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   
   **With uv:**
   ```bash
   uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## Environment Variables

### Backend (.env)
```env
GOOGLE_API_KEY=your_google_api_key_here
ALLOWED_ORIGINS=http://localhost:3000,https://genai-assistant.vercel.app
```

**Note**: In production on Render, these environment variables are configured through the Render dashboard.

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
```

**Note**: In production on Vercel, `REACT_APP_API_URL` points to the Render backend URL.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using Google Gemini AI, React, and FastAPI**
