/**
 * QuestionAnswer Component
 * 
 * A React component that provides an interactive Q&A interface for asking questions
 * about uploaded documents. Users can ask free-form questions and receive AI-generated
 * answers based on the document content. The component maintains a conversation history
 * and provides a chat-like interface.
 * 
 * Key Features:
 * - Free-form question input with form submission
 * - Chat-style conversation history display
 * - AI-powered answer generation based on document content
 * - Real-time loading states and error handling
 * - Scrollable history with timestamp tracking
 * - Responsive design with user/AI message differentiation
 * 
 * Component State:
 * - question: Current question input value
 * - isLoading: Loading state during API calls
 * - qaHistory: Array of Q&A entries with timestamps
 * - error: Error message display state
 * 
 * Data Flow:
 * 1. User types question and submits form
 * 2. API call made to backend /api/ask endpoint
 * 3. Response added to history with timestamp
 * 4. UI updates to show conversation
 * 
 * @author aryanoutlaw
 * @version 1.0.0
 */

import React, { useState } from 'react';
// Import Lucide React icons for consistent UI iconography
import { MessageCircle, Send, Bot, User } from 'lucide-react';

// Import API service for backend communication
import { apiService } from '../services/api';

/**
 * Interface for individual Q&A entries in the conversation history
 */
interface QAEntry {
  /**
   * The user's question text
   */
  question: string;
  
  /**
   * The AI-generated answer text
   */
  answer: string;
  
  /**
   * Timestamp when the Q&A entry was created
   */
  timestamp: Date;
}

/**
 * QuestionAnswer Component
 * 
 * Renders a chat-style interface for asking questions about the uploaded document
 * and displays the conversation history between user and AI.
 */
const QuestionAnswer: React.FC = () => {
  // --- Component State ---
  
  /**
   * Current question input value
   * Controlled by the input field and reset after submission
   */
  const [question, setQuestion] = useState('');
  
  /**
   * Loading state indicator
   * true when API call is in progress, false otherwise
   */
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Array of Q&A conversation entries
   * Each entry contains question, answer, and timestamp
   */
  const [qaHistory, setQaHistory] = useState<QAEntry[]>([]);
  
  /**
   * Error message state
   * null when no error, string message when error occurs
   */
  const [error, setError] = useState<string | null>(null);

  // --- Event Handlers ---
  
  /**
   * Handles form submission for asking questions
   * Validates input, makes API call, and updates conversation history
   * 
   * @param e - React form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    
    // Validate that question is not empty
    if (!question.trim()) return;

    // Set loading state and clear previous errors
    setIsLoading(true);
    setError(null);

    try {
      // Make API call to get answer from backend
      const response = await apiService.askQuestion(question);
      
      // Create new Q&A entry with current timestamp
      const newEntry: QAEntry = {
        question,
        answer: response.answer,
        timestamp: new Date(),
      };
      
      // Add new entry to conversation history
      setQaHistory(prev => [...prev, newEntry]);
      
      // Clear the input field for next question
      setQuestion('');
    } catch (err) {
      // Handle API errors and display user-friendly message
      setError('Failed to get answer. Please try again.');
      console.error('Question error:', err);
    } finally {
      // Always reset loading state when operation completes
      setIsLoading(false);
    }
  };

  // --- Render ---
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Component Header */}
      <div className="flex items-center mb-6">
        <MessageCircle className="h-6 w-6 text-green-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Ask Questions</h2>
      </div>

      {/* Q&A Conversation History */}
      <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
        {qaHistory.length === 0 ? (
          /* Empty State: Show when no questions have been asked */
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Ask a question to get started!</p>
          </div>
        ) : (
          /* Conversation History: Display all Q&A entries */
          qaHistory.map((entry, index) => (
            <div key={index} className="space-y-2">
              
              {/* User Question Message */}
              <div className="flex items-start gap-3">
                {/* User avatar */}
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                
                {/* Question bubble */}
                <div className="flex-1 bg-blue-50 rounded-lg p-3">
                  <p className="text-gray-800">{entry.question}</p>
                </div>
              </div>

              {/* AI Answer Message */}
              <div className="flex items-start gap-3">
                {/* AI avatar */}
                <div className="bg-green-100 rounded-full p-2">
                  <Bot className="h-4 w-4 text-green-600" />
                </div>
                
                {/* Answer bubble with timestamp */}
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-800">{entry.answer}</p>
                  
                  {/* Timestamp display */}
                  <p className="text-xs text-gray-500 mt-2">
                    {entry.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Question Input Form */}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          {/* Question input field */}
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the document..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading} // Disable during loading
          />
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !question.trim()} // Disable if loading or empty
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              /* Loading State: Show spinner */
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              /* Default State: Show send icon */
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionAnswer; 