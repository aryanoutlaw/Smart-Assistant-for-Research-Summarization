import React, { useState } from 'react';
import { Trophy, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface ChallengeModeProps {
  questions: string[];
  onQuestionsUpdate: (questions: string[]) => void;
}

interface ChallengeResult {
  question: string;
  userAnswer: string;
  evaluation: string;
  isCompleted: boolean;
  isCorrect: boolean;
}

const ChallengeMode: React.FC<ChallengeModeProps> = ({ questions, onQuestionsUpdate }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<ChallengeResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [numQuestions, setNumQuestions] = useState(questions.length || 3);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const completedQuestions = results.filter(r => r.isCompleted).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiService.evaluateAnswer(currentQuestion, userAnswer);
      
      const newResult: ChallengeResult = {
        question: currentQuestion,
        userAnswer,
        evaluation: response.evaluation,
        isCompleted: true,
        isCorrect: response.is_correct,
      };

      setResults(prev => [...prev, newResult]);
      setUserAnswer('');

      if (!isLastQuestion) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (err) {
      setError('Failed to evaluate answer. Please try again.');
      console.error('Challenge error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetChallenge = () => {
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setResults([]);
    setError(null);
  };

  const handleRegenerateQuestions = async () => {
    setIsRegenerating(true);
    setError(null);

    try {
      const response = await apiService.regenerateQuestions(numQuestions);
      onQuestionsUpdate(response.questions);
      resetChallenge();
    } catch (err) {
      setError('Failed to regenerate questions. Please try again.');
      console.error('Regenerate error:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8 text-gray-500">
          <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>Upload a document to start the challenge!</p>
        </div>
      </div>
    );
  }

  const isCompleted = completedQuestions === questions.length;
  const correctAnswers = results.filter(r => r.isCorrect).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Challenge Mode</h2>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          <span>{completedQuestions}/{questions.length} completed</span>
          {results.length > 0 && (
            <span className="ml-2 text-green-600">
              • {correctAnswers} correct
            </span>
          )}
        </div>
      </div>

      {/* Question Settings */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <label htmlFor="num-questions" className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                Number of Questions
              </label>
              <div className="relative">
                <select
                  id="num-questions"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 font-medium cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed appearance-none w-full"
                  disabled={isRegenerating || isSubmitting}
                >
                  {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>
                      {num} questions
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={handleRegenerateQuestions}
            disabled={isRegenerating || isSubmitting}
            className="generate-questions-btn"
          >
            {isRegenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              'Generate New Questions'
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Choose how many questions you want, then click "Generate New Questions" to create a new set
        </p>
      </div>

      {!isCompleted ? (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round((completedQuestions / questions.length) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedQuestions / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Question */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500">
              <h3 className="font-medium text-gray-900 mb-2">Question {currentQuestionIndex + 1}:</h3>
              <p className="text-gray-700">{currentQuestion}</p>
            </div>
          </div>

          {/* Answer Input */}
          <form onSubmit={handleSubmit} className="mb-6">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (userAnswer.trim() && !isSubmitting) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder="Enter your answer here... (Press Enter to submit, Shift+Enter for new line)"
              className="modern-textarea"
              rows={4}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={resetChallenge}
                className="reset-challenge-btn"
              >
                Reset Challenge
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !userAnswer.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Evaluating...
                  </>
                ) : (
                  'Submit Answer'
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </>
      ) : (
        /* Challenge Completed */
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Challenge Completed!</h3>
          <p className="text-gray-600 mb-2">You've answered all {questions.length} questions.</p>
          <p className="text-lg font-semibold text-gray-800 mb-6">
            Score: {correctAnswers}/{questions.length} ({Math.round((correctAnswers / questions.length) * 100)}%)
          </p>
          <button
            onClick={resetChallenge}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Answers:</h4>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`rounded-full p-1 ${
                    result.isCorrect 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    {result.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">{result.question}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Your answer:</span> {result.userAnswer}
                    </p>
                    <div className={`bg-white rounded p-3 border-l-4 ${
                      result.isCorrect 
                        ? 'border-green-500' 
                        : 'border-red-500'
                    }`}>
                      <p className="text-sm text-gray-700">{result.evaluation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeMode; 