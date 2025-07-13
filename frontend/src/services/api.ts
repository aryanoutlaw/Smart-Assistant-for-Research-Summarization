/**
 * API Service Module
 * 
 * This module provides a centralized service for all HTTP communication between
 * the React frontend and the FastAPI backend. It handles document upload,
 * question generation, Q&A functionality, and answer evaluation.
 * 
 * Key Features:
 * - Axios-based HTTP client with centralized configuration
 * - TypeScript interfaces for type-safe API communication
 * - File upload handling with multipart/form-data
 * - Consistent error handling across all endpoints
 * - RESTful API integration with FastAPI backend
 * 
 * API Endpoints:
 * - POST /api/upload: Upload and process documents
 * - POST /api/regenerate-questions: Generate new challenge questions
 * - POST /api/ask: Ask questions about document content
 * - POST /api/challenge: Evaluate challenge answers
 * 
 * Base URL: http://localhost:8000 (FastAPI development server)
 * 
 * Dependencies:
 * - axios: HTTP client library for making API requests
 * 
 * @author aryanoutlaw
 * @version 1.0.0
 */

import axios from 'axios';

// --- API Configuration ---

/**
 * Base URL for the FastAPI backend server
 * Points to the development server running on localhost:8000
 */
const API_BASE_URL = 'http://localhost:8000';

/**
 * Configured Axios instance for API communication
 * Sets up base URL and default headers for all requests
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // Default content type for JSON requests
  },
});

// --- TypeScript Interfaces ---

/**
 * Response interface for document upload endpoint
 * Contains the processed document data returned by the backend
 */
export interface UploadResponse {
  /**
   * Original filename of the uploaded document
   */
  filename: string;
  
  /**
   * AI-generated summary of the document content
   * Limited to approximately 150 words
   */
  summary: string;
  
  /**
   * Array of AI-generated challenge questions
   * Number of questions depends on the request parameter (3-10)
   */
  questions: string[];
}

/**
 * Response interface for question answering endpoint
 * Contains the AI-generated answer to user questions
 */
export interface AskResponse {
  /**
   * AI-generated answer based on document content
   * Includes justification and references to the document
   */
  answer: string;
}

/**
 * Response interface for challenge answer evaluation endpoint
 * Contains the AI evaluation of user's answer to challenge questions
 */
export interface ChallengeResponse {
  /**
   * Detailed evaluation feedback from the AI
   * Explains why the answer is correct or incorrect
   */
  evaluation: string;
  
  /**
   * Boolean indicating if the user's answer was correct
   * Used for scoring and visual feedback
   */
  is_correct: boolean;
}

// --- API Service Functions ---

/**
 * Centralized API service object containing all endpoint functions
 * Provides a clean interface for components to interact with the backend
 */
export const apiService = {
  /**
   * Upload and process a document file
   * 
   * This function handles file upload to the backend, which extracts text content,
   * generates an AI summary, and creates challenge questions. The file is sent
   * as multipart/form-data to support binary file uploads.
   * 
   * @param file - The File object to upload (PDF or TXT)
   * @returns Promise resolving to UploadResponse with filename, summary, and questions
   * 
   * @throws {Error} If upload fails due to network issues, server errors, or invalid file format
   * 
   * @example
   * ```typescript
   * const fileInput = document.getElementById('file') as HTMLInputElement;
   * const file = fileInput.files?.[0];
   * if (file) {
   *   try {
   *     const result = await apiService.uploadDocument(file);
   *     console.log('Summary:', result.summary);
   *     console.log('Questions:', result.questions);
   *   } catch (error) {
   *     console.error('Upload failed:', error);
   *   }
   * }
   * ```
   */
  uploadDocument: async (file: File): Promise<UploadResponse> => {
    // Create FormData object for multipart file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Make POST request with multipart/form-data content type
    const response = await api.post<UploadResponse>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Override default JSON content type
      },
    });
    
    return response.data;
  },

  /**
   * Generate new challenge questions for the current document
   * 
   * This function requests the backend to create a fresh set of AI-generated
   * comprehension questions based on the currently uploaded document. The number
   * of questions can be customized between 3-10.
   * 
   * @param numQuestions - Number of questions to generate (3-10)
   * @returns Promise resolving to object containing array of new questions
   * 
   * @throws {Error} If generation fails due to network issues, server errors, or invalid parameters
   * 
   * @example
   * ```typescript
   * try {
   *   const result = await apiService.regenerateQuestions(5);
   *   console.log('New questions:', result.questions);
   * } catch (error) {
   *   console.error('Question generation failed:', error);
   * }
   * ```
   */
  regenerateQuestions: async (numQuestions: number): Promise<{ questions: string[] }> => {
    // Make POST request with num_questions as query parameter
    const response = await api.post<{ questions: string[] }>('/api/regenerate-questions', null, {
      params: { num_questions: numQuestions }
    });
    
    return response.data;
  },

  /**
   * Ask a question about the uploaded document
   * 
   * This function sends a user's question to the backend, which uses AI to generate
   * an answer based solely on the document content. The AI is instructed to provide
   * justification and references from the document.
   * 
   * @param question - The user's question about the document
   * @returns Promise resolving to AskResponse with AI-generated answer
   * 
   * @throws {Error} If request fails due to network issues, server errors, or no uploaded document
   * 
   * @example
   * ```typescript
   * try {
   *   const result = await apiService.askQuestion("What is the main topic of this document?");
   *   console.log('Answer:', result.answer);
   * } catch (error) {
   *   console.error('Question failed:', error);
   * }
   * ```
   */
  askQuestion: async (question: string): Promise<AskResponse> => {
    // Make POST request with question in request body
    const response = await api.post<AskResponse>('/api/ask', { question });
    
    return response.data;
  },

  /**
   * Evaluate a user's answer to a challenge question
   * 
   * This function submits a user's answer to a challenge question for AI evaluation.
   * The backend compares the answer against the document content and provides
   * detailed feedback along with a correctness assessment.
   * 
   * @param question - The original challenge question
   * @param answer - The user's answer to evaluate
   * @returns Promise resolving to ChallengeResponse with evaluation and correctness
   * 
   * @throws {Error} If evaluation fails due to network issues, server errors, or no uploaded document
   * 
   * @example
   * ```typescript
   * try {
   *   const result = await apiService.evaluateAnswer(
   *     "What is the main conclusion?",
   *     "The main conclusion is that AI will transform education."
   *   );
   *   console.log('Evaluation:', result.evaluation);
   *   console.log('Correct:', result.is_correct);
   * } catch (error) {
   *   console.error('Evaluation failed:', error);
   * }
   * ```
   */
  evaluateAnswer: async (question: string, answer: string): Promise<ChallengeResponse> => {
    // Make POST request with question and answer in request body
    const response = await api.post<ChallengeResponse>('/api/challenge', { question, answer });
    
    return response.data;
  },
}; 