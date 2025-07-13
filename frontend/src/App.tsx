import React, { useState } from 'react';
import { Brain, BookOpen, MessageSquare, Trophy } from 'lucide-react';
import FileUpload from './components/FileUpload';
import DocumentSummary from './components/DocumentSummary';
import QuestionAnswer from './components/QuestionAnswer';
import ChallengeMode from './components/ChallengeMode';
import { UploadResponse } from './services/api';

function App() {
  const [uploadedDocument, setUploadedDocument] = useState<UploadResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'qa' | 'challenge'>('summary');

  const handleUploadSuccess = (result: UploadResponse) => {
    setUploadedDocument(result);
    setActiveTab('summary');
  };

  const handleQuestionsUpdate = (questions: string[]) => {
    if (uploadedDocument) {
      setUploadedDocument({
        ...uploadedDocument,
        questions: questions
      });
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: BookOpen },
    { id: 'qa', label: 'Q&A', icon: MessageSquare },
    { id: 'challenge', label: 'Challenge', icon: Trophy },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">GenAI Document Assistant</h1>
          </div>
          <p className="text-xl text-gray-600">
            Upload documents, get AI-powered summaries, ask questions, and test your understanding
          </p>
        </div>

        {/* File Upload Section */}
        {!uploadedDocument && (
          <div className="mb-8">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Document Processing Interface */}
        {uploadedDocument && (
          <div className="space-y-6">
            {/* Document Info Bar */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">
                    {uploadedDocument.filename}
                  </span>
                </div>
                <button
                  onClick={() => setUploadedDocument(null)}
                  className="upload-new-btn"
                >
                  Upload New Document
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
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

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'summary' && (
                  <DocumentSummary
                    filename={uploadedDocument.filename}
                    summary={uploadedDocument.summary}
                  />
                )}
                {activeTab === 'qa' && <QuestionAnswer />}
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

        {/* Footer */}
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
