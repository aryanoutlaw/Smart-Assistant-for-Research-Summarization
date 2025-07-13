/**
 * ChallengeMode Component
 * 
 * A React component that provides an interactive comprehension challenge interface
 * for testing user understanding of uploaded documents. Users answer AI-generated
 * questions sequentially and receive detailed feedback on their responses.
 * 
 * Key Features:
 * - Sequential question presentation with progress tracking
 * - AI-powered answer evaluation with detailed feedback
 * - Question regeneration with customizable quantity
 * - Real-time progress visualization with completion percentage
 * - Results summary with correct/incorrect indicators
 * - Challenge reset functionality for retaking
 * - Keyboard shortcuts (Enter to submit, Shift+Enter for new line)
 * 
 * Component State:
 * - currentQuestionIndex: Tracks which question user is currently answering
 * - userAnswer: Current answer input text
 * - isSubmitting: Loading state during answer evaluation
 * - results: Array of completed challenge results with evaluations
 * - error: Error message display state
 * - numQuestions: Number of questions to generate (3-10)
 * - isRegenerating: Loading state during question regeneration
 * 
 * Challenge Flow:
 * 1. Display current question with progress indicator
 * 2. User enters answer and submits
 * 3. AI evaluates answer and provides feedback
 * 4. Result stored and user moves to next question
 * 5. Show completion screen with score when all questions answered
 * 
 * Props:
 * - questions: Array of AI-generated questions to present
 * - onQuestionsUpdate: Callback to update questions in parent component
 * 
 * @author aryanoutlaw
 * @version 1.0.0
 */

import React, { useState } from 'react';
// Import Lucide React icons for consistent UI iconography
import { Trophy, CheckCircle, Clock, XCircle } from 'lucide-react';

// Import API service for backend communication
import { apiService } from '../services/api';

/**
 * Props interface for ChallengeMode component
 */
interface ChallengeModeProps {
  /**
   * Array of AI-generated questions for the challenge
   * Each question is a string that will be presented to the user
   */
  questions: string[];
  
  /**
   * Callback function to update questions in parent component
   * Called when questions are regenerated with new quantity
   */
  onQuestionsUpdate: (questions: string[]) => void;
}

/**
 * Interface for individual challenge result entries
 * Stores the complete evaluation data for each answered question
 */
interface ChallengeResult {
  /**
   * The original question text that was asked
   */
  question: string;
  
  /**
   * The user's answer to the question
   */
  userAnswer: string;
  
  /**
   * AI-generated evaluation feedback text
   */
  evaluation: string;
  
  /**
   * Whether this question has been completed
   * Used for progress tracking
   */
  isCompleted: boolean;
  
  /**
   * Whether the user's answer was marked as correct
   * Used for scoring and visual indicators
   */
  isCorrect: boolean;
}

/**
 * ChallengeMode Component
 * 
 * Renders the complete challenge interface with question presentation,
 * answer evaluation, progress tracking, and results summary.
 */
const ChallengeMode: React.FC<ChallengeModeProps> = ({ questions, onQuestionsUpdate }) => {
  // --- Component State ---
  
  /**
   * Index of the currently displayed question
   * Used to track progress through the challenge
   */
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  /**
   * Current answer input text
   * Controlled by textarea and reset after submission
   */
  const [userAnswer, setUserAnswer] = useState('');
  
  /**
   * Loading state during answer evaluation
   * true when API call is in progress, false otherwise
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Array of completed challenge results
   * Each entry contains question, answer, evaluation, and correctness
   */
  const [results, setResults] = useState<ChallengeResult[]>([]);
  
  /**
   * Error message state
   * null when no error, string message when error occurs
   */
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Number of questions to generate for new challenges
   * User can adjust this value between 3-10
   */
  const [numQuestions, setNumQuestions] = useState(questions.length || 3);
  
  /**
   * Loading state during question regeneration
   * true when generating new questions, false otherwise
   */
  const [isRegenerating, setIsRegenerating] = useState(false);

  // --- Derived State ---
  
  /**
   * Current question text being displayed
   * Retrieved from questions array using current index
   */
  const currentQuestion = questions[currentQuestionIndex];
  
  /**
   * Whether user is on the last question
   * Used to determine if challenge will complete after this answer
   */
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  /**
   * Number of questions that have been completed
   * Used for progress tracking and percentage calculation
   */
  const completedQuestions = results.filter(r => r.isCompleted).length;

  // --- Event Handlers ---
  
  /**
   * Handles answer submission and evaluation
   * Validates input, calls API for evaluation, and updates state
   * 
   * @param e - React form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    
    // Validate that answer is not empty
    if (!userAnswer.trim()) return;

    // Set loading state and clear previous errors
    setIsSubmitting(true);
    setError(null);

    try {
      // Call API to evaluate the user's answer
      const response = await apiService.evaluateAnswer(currentQuestion, userAnswer);
      
      // Create new result entry with evaluation data
      const newResult: ChallengeResult = {
        question: currentQuestion,
        userAnswer,
        evaluation: response.evaluation,
        isCompleted: true,
        isCorrect: response.is_correct,
      };

      // Add result to results array
      setResults(prev => [...prev, newResult]);
      
      // Clear answer input for next question
      setUserAnswer('');

      // Move to next question if not on last question
      if (!isLastQuestion) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (err) {
      // Handle API errors and display user-friendly message
      setError('Failed to evaluate answer. Please try again.');
      console.error('Challenge error:', err);
    } finally {
      // Always reset loading state when operation completes
      setIsSubmitting(false);
    }
  };

  /**
   * Resets the challenge to initial state
   * Clears all progress and starts over from first question
   */
  const resetChallenge = () => {
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setResults([]);
    setError(null);
  };

  /**
   * Handles generation of new questions
   * Calls API to generate fresh questions and resets challenge
   */
  const handleRegenerateQuestions = async () => {
    setIsRegenerating(true);
    setError(null);

    try {
      // Call API to generate new questions with specified quantity
      const response = await apiService.regenerateQuestions(numQuestions);
      
      // Update questions in parent component
      onQuestionsUpdate(response.questions);
      
      // Reset challenge state for new questions
      resetChallenge();
    } catch (err) {
      // Handle API errors and display user-friendly message
      setError('Failed to regenerate questions. Please try again.');
      console.error('Regenerate error:', err);
    } finally {
      // Always reset loading state when operation completes
      setIsRegenerating(false);
    }
  };

  // --- Conditional Rendering Logic ---
  
  // Show empty state if no questions are available
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

  // Calculate completion status and score
  const isCompleted = completedQuestions === questions.length;
  const correctAnswers = results.filter(r => r.isCorrect).length;

  // --- Render ---
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Component Header with Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Challenge Mode</h2>
        </div>
        
        {/* Progress Display */}
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

      {/* Question Settings Panel */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <label htmlFor="num-questions" className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                Number of Questions
              </label>
              
              {/* Question quantity selector */}
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
          
          {/* Regenerate Questions Button */}
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
        
        {/* Settings Help Text */}
        <p className="mt-2 text-xs text-gray-500">
          Choose how many questions you want, then click "Generate New Questions" to create a new set
        </p>
      </div>

      {/* Challenge Interface - Show if not completed */}
      {!isCompleted ? (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round((completedQuestions / questions.length) * 100)}% complete</span>
            </div>
            
            {/* Visual progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedQuestions / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Question Display */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500">
              <h3 className="font-medium text-gray-900 mb-2">Question {currentQuestionIndex + 1}:</h3>
              <p className="text-gray-700">{currentQuestion}</p>
            </div>
          </div>

          {/* Answer Input Form */}
          <form onSubmit={handleSubmit} className="mb-6">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                // Handle keyboard shortcuts
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  // Submit if answer is not empty and not currently submitting
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
            
            {/* Form Actions */}
            <div className="flex justify-between items-center mt-4">
              {/* Reset Challenge Button */}
              <button
                type="button"
                onClick={resetChallenge}
                className="reset-challenge-btn"
              >
                Reset Challenge
              </button>
              
              {/* Submit Answer Button */}
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

          {/* Error Message Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </>
      ) : (
        /* Challenge Completed Screen */
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Challenge Completed!</h3>
          <p className="text-gray-600 mb-2">You've answered all {questions.length} questions.</p>
          
          {/* Final Score Display */}
          <p className="text-lg font-semibold text-gray-800 mb-6">
            Score: {correctAnswers}/{questions.length} ({Math.round((correctAnswers / questions.length) * 100)}%)
          </p>
          
          {/* Try Again Button */}
          <button
            onClick={resetChallenge}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results Summary - Show if any questions have been answered */}
      {results.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Answers:</h4>
          
          {/* Results List */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  
                  {/* Correct/Incorrect Indicator */}
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
                  
                  {/* Result Details */}
                  <div className="flex-1">
                    {/* Question */}
                    <p className="font-medium text-gray-900 mb-2">{result.question}</p>
                    
                    {/* User's Answer */}
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Your answer:</span> {result.userAnswer}
                    </p>
                    
                    {/* AI Evaluation */}
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