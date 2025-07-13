import React, { useState } from 'react';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { apiService } from '../services/api';

interface QAEntry {
  question: string;
  answer: string;
  timestamp: Date;
}

const QuestionAnswer: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<QAEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.askQuestion(question);
      
      const newEntry: QAEntry = {
        question,
        answer: response.answer,
        timestamp: new Date(),
      };
      
      setQaHistory(prev => [...prev, newEntry]);
      setQuestion('');
    } catch (err) {
      setError('Failed to get answer. Please try again.');
      console.error('Question error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <MessageCircle className="h-6 w-6 text-green-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Ask Questions</h2>
      </div>

      {/* Q&A History */}
      <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
        {qaHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Ask a question to get started!</p>
          </div>
        ) : (
          qaHistory.map((entry, index) => (
            <div key={index} className="space-y-2">
              {/* User Question */}
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 bg-blue-50 rounded-lg p-3">
                  <p className="text-gray-800">{entry.question}</p>
                </div>
              </div>

              {/* AI Answer */}
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <Bot className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-800">{entry.answer}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {entry.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Question Input */}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the document..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionAnswer; 