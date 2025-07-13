/**
 * DocumentSummary Component
 * 
 * A React component that displays the AI-generated summary of an uploaded document.
 * This component provides a clean, visually appealing presentation of the document
 * summary with the filename and AI-generated content clearly highlighted.
 * 
 * Key Features:
 * - Displays document filename for context
 * - Shows AI-generated summary in a highlighted card layout
 * - Uses gradient background for visual appeal
 * - Includes AI indicator with sparkles icon
 * - Responsive design with proper spacing and typography
 * 
 * Component Type: Presentational (stateless)
 * - Receives data via props and renders static content
 * - No internal state management or side effects
 * - Pure functional component for optimal performance
 * 
 * Props:
 * - filename: The name of the uploaded document file
 * - summary: The AI-generated summary text to display
 * 
 * @author aryanoutlaw
 * @version 1.0.0
 */

import React from 'react';
// Import Lucide React icons for consistent UI iconography
import { FileText, Sparkles } from 'lucide-react';

/**
 * Props interface for DocumentSummary component
 */
interface DocumentSummaryProps {
  /**
   * The filename of the uploaded document
   * Used to provide context about which document is being summarized
   */
  filename: string;
  
  /**
   * The AI-generated summary text
   * Contains the condensed version of the document content
   */
  summary: string;
}

/**
 * DocumentSummary Component
 * 
 * Renders a card-style layout displaying the document filename and AI-generated
 * summary with visual indicators and proper styling for readability.
 */
const DocumentSummary: React.FC<DocumentSummaryProps> = ({ filename, summary }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Component Header */}
      <div className="flex items-center mb-4">
        {/* File icon to represent document content */}
        <FileText className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Document Summary</h2>
      </div>
      
      {/* Document Information */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">File:</span> {filename}
        </p>
      </div>
      
      {/* AI-Generated Summary Display */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-blue-500">
        {/* AI Indicator Header */}
        <div className="flex items-center mb-2">
          {/* Sparkles icon to indicate AI-generated content */}
          <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-800">AI-Generated Summary</span>
        </div>
        
        {/* Summary Content */}
        <p className="text-gray-700 leading-relaxed">{summary}</p>
      </div>
    </div>
  );
};

export default DocumentSummary; 