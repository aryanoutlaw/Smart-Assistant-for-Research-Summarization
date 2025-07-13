import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

interface DocumentSummaryProps {
  filename: string;
  summary: string;
}

const DocumentSummary: React.FC<DocumentSummaryProps> = ({ filename, summary }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <FileText className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Document Summary</h2>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">File:</span> {filename}
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-blue-500">
        <div className="flex items-center mb-2">
          <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-800">AI-Generated Summary</span>
        </div>
        <p className="text-gray-700 leading-relaxed">{summary}</p>
      </div>
    </div>
  );
};

export default DocumentSummary; 