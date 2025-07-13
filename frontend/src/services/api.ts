import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UploadResponse {
  filename: string;
  summary: string;
  questions: string[];
}

export interface AskResponse {
  answer: string;
}

export interface ChallengeResponse {
  evaluation: string;
  is_correct: boolean;
}

export const apiService = {
  uploadDocument: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<UploadResponse>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  regenerateQuestions: async (numQuestions: number): Promise<{ questions: string[] }> => {
    const response = await api.post<{ questions: string[] }>('/api/regenerate-questions', null, {
      params: { num_questions: numQuestions }
    });
    return response.data;
  },

  askQuestion: async (question: string): Promise<AskResponse> => {
    const response = await api.post<AskResponse>('/api/ask', { question });
    return response.data;
  },

  evaluateAnswer: async (question: string, answer: string): Promise<ChallengeResponse> => {
    const response = await api.post<ChallengeResponse>('/api/challenge', { question, answer });
    return response.data;
  },
}; 