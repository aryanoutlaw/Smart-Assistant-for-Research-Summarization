/**
 * GenAI Document Assistant - Main Application Component
 * 
 * This is the root component of the React application that provides an AI-powered
 * document assistant interface. The application allows users to upload documents,
 * view AI-generated summaries, ask questions, and participate in comprehension challenges.
 * 
 * Key Features:
 * - Document upload with drag-and-drop support
 * - Tabbed interface for different interaction modes
 * - AI-powered document summarization
 * - Interactive Q&A functionality
 * - Challenge mode with question generation and evaluation
 * - Responsive design with modern UI components
 * 
 * Component Architecture:
 * - Uses React hooks for state management
 * - Implements controlled components pattern
 * - Manages global application state for document data
 * - Coordinates communication between child components
 * 
 * State Management:
 * - uploadedDocument: Stores the current document and AI-generated content
 * - activeTab: Controls which interface mode is currently displayed
 * 
 * @author aryanoutlaw
 * @version 1.0.0
 */

import React, { useState } from 'react';
// Import Lucide React icons for consistent iconography
import { Brain, BookOpen, MessageSquare, Trophy } from 'lucide-react';

// Import child components for different application features
import FileUpload from './components/FileUpload';
import DocumentSummary from './components/DocumentSummary';
import QuestionAnswer from './components/QuestionAnswer';
import ChallengeMode from './components/ChallengeMode';

// Import API types for type safety
import { UploadResponse } from './services/api';

/**
 * Main App Component
 * 
 * Renders the complete document assistant interface with tabbed navigation
 * and handles the overall application state management.
 */
function App() {
  // --- State Management ---
  
  /**
   * Stores the uploaded document data and AI-generated content
   * null when no document is uploaded, UploadResponse object when document is processed
   */
  const [uploadedDocument, setUploadedDocument] = useState<UploadResponse | null>(null);
  
  /**
   * Controls which tab/interface mode is currently active
   * - 'summary': Shows AI-generated document summary
   * - 'qa': Shows question-answer interface
   * - 'challenge': Shows challenge mode with comprehension questions
   */
  const [activeTab, setActiveTab] = useState<'summary' | 'qa' | 'challenge'>('summary');

  // --- Event Handlers ---
  
  /**
   * Handles successful document upload
   * Updates the application state with the uploaded document data and switches to summary tab
   * 
   * @param result - The API response containing filename, summary, and questions
   */
  const handleUploadSuccess = (result: UploadResponse) => {
    setUploadedDocument(result);
    setActiveTab('summary'); // Always show summary first after upload
  };

  /**
   * Handles updates to the challenge questions
   * Used when questions are regenerated in challenge mode
   * 
   * @param questions - Array of new questions to update in the document state
   */
  const handleQuestionsUpdate = (questions: string[]) => {
    if (uploadedDocument) {
      // Update the document state with new questions while preserving other data
      setUploadedDocument({
        ...uploadedDocument,
        questions: questions
      });
    }
  };

  // --- UI Configuration ---
  
  /**
   * Tab configuration for the main interface
   * Defines the available tabs with their labels and icons
   */
  const tabs = [
    { id: 'summary', label: 'Summary', icon: BookOpen },
    { id: 'qa', label: 'Q&A', icon: MessageSquare },
    { id: 'challenge', label: 'Challenge', icon: Trophy },
  ] as const;

  // --- Render ---
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* Application Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {/* Brain icon represents AI/intelligence theme */}
            <Brain className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">GenAI Document Assistant</h1>
          </div>
          <p className="text-xl text-gray-600">
            Upload documents, get AI-powered summaries, ask questions, and test your understanding
          </p>
        </div>

        {/* File Upload Section - Only shown when no document is uploaded */}
        {!uploadedDocument && (
          <div className="mb-8">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Document Processing Interface - Only shown when document is uploaded */}
        {uploadedDocument && (
          <div className="space-y-6">
            
            {/* Document Info Bar - Shows current document name and upload new option */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">
                    {uploadedDocument.filename}
                  </span>
                </div>
                {/* Reset button to clear current document and allow new upload */}
                <button
                  onClick={() => setUploadedDocument(null)}
                  className="upload-new-btn"
                >
                  Upload New Document
                </button>
              </div>
            </div>

            {/* Tabbed Interface Container */}
            <div className="bg-white rounded-lg shadow-md">
              
              {/* Tab Navigation Bar */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-button ${
                          activeTab === tab.id ? 'active' : ''
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content Area - Conditionally renders based on active tab */}
              <div className="p-6">
                {/* Summary Tab: Shows AI-generated document summary */}
                {activeTab === 'summary' && (
                  <DocumentSummary
                    filename={uploadedDocument.filename}
                    summary={uploadedDocument.summary}
                  />
                )}
                
                {/* Q&A Tab: Shows question-answer interface */}
                {activeTab === 'qa' && <QuestionAnswer />}
                
                {/* Challenge Tab: Shows comprehension challenge interface */}
                {activeTab === 'challenge' && (
                  <ChallengeMode 
                    questions={uploadedDocument.questions} 
                    onQuestionsUpdate={handleQuestionsUpdate}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Application Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            Powered by Google Gemini AI • Built with React & FastAPI
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
