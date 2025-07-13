/**
 * FileUpload Component
 * 
 * A React component that provides a drag-and-drop file upload interface for the
 * document assistant application. Supports both drag-and-drop and click-to-select
 * file upload methods with validation for PDF and TXT files only.
 * 
 * Key Features:
 * - Drag-and-drop file upload with visual feedback
 * - Click-to-select file upload as fallback
 * - File format validation (PDF and TXT only)
 * - Upload progress indication with loading spinner
 * - Error handling and user feedback
 * - Responsive design with hover effects
 * 
 * Component State:
 * - isDragging: Tracks drag state for visual feedback
 * - isUploading: Shows loading state during file processing
 * - error: Stores and displays error messages to user
 * 
 * Props:
 * - onUploadSuccess: Callback function called when upload completes successfully
 * 
 * @author aryanoutlaw
 * @version 1.0.0
 */

import React, { useState } from 'react';
// Import Lucide React icons for consistent UI iconography
import { Upload, FileText, AlertCircle } from 'lucide-react';

// Import API service and types for backend communication
import { apiService, UploadResponse } from '../services/api';

/**
 * Props interface for FileUpload component
 */
interface FileUploadProps {
  /**
   * Callback function invoked when file upload is successful
   * Receives the API response containing filename, summary, and questions
   */
  onUploadSuccess: (result: UploadResponse) => void;
}

/**
 * FileUpload Component
 * 
 * Renders a drag-and-drop file upload interface with fallback click-to-select
 * functionality. Handles file validation, upload processing, and error states.
 */
const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  // --- Component State ---
  
  /**
   * Tracks whether user is currently dragging a file over the drop zone
   * Used to provide visual feedback during drag operations
   */
  const [isDragging, setIsDragging] = useState(false);
  
  /**
   * Indicates whether a file upload is currently in progress
   * Used to show loading spinner and disable interactions during upload
   */
  const [isUploading, setIsUploading] = useState(false);
  
  /**
   * Stores error messages to display to the user
   * null when no error, string message when error occurs
   */
  const [error, setError] = useState<string | null>(null);

  // --- File Processing Functions ---
  
  /**
   * Handles the actual file upload process
   * Validates file format, calls API service, and manages component state
   * 
   * @param file - The File object to upload and process
   */
  const handleFileUpload = async (file: File) => {
    // Validate file format - only PDF and TXT files are supported
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      setError('Please upload a PDF or TXT file only.');
      return;
    }

    // Set loading state and clear any previous errors
    setIsUploading(true);
    setError(null);

    try {
      // Call the API service to upload and process the file
      const result = await apiService.uploadDocument(file);
      
      // Notify parent component of successful upload
      onUploadSuccess(result);
    } catch (err) {
      // Handle upload errors and display user-friendly message
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      // Always reset loading state when upload completes (success or failure)
      setIsUploading(false);
    }
  };

  // --- Drag and Drop Event Handlers ---
  
  /**
   * Handles file drop events
   * Processes the dropped file and initiates upload
   * 
   * @param e - React drag event containing file data
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent default browser file handling
    setIsDragging(false); // Reset drag state
    
    // Extract files from the drop event
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Process the first file (ignore multiple files)
      handleFileUpload(files[0]);
    }
  };

  /**
   * Handles drag over events
   * Enables drop functionality and provides visual feedback
   * 
   * @param e - React drag event
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Allow dropping by preventing default behavior
    setIsDragging(true); // Set drag state for visual feedback
  };

  /**
   * Handles drag leave events
   * Resets drag state when user drags away from drop zone
   * 
   * @param e - React drag event
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false); // Reset drag state
  };

  // --- Click-to-Select Event Handler ---
  
  /**
   * Handles file selection from file input
   * Processes selected file when user clicks "Choose File" button
   * 
   * @param e - React change event from file input
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Process the selected file
      handleFileUpload(files[0]);
    }
  };

  // --- Render ---
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Drop Zone Container */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'  // Highlight when dragging
            : 'border-gray-300 hover:border-gray-400'  // Default state
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Upload State: Show loading spinner during upload */}
        {isUploading ? (
          <div className="flex flex-col items-center">
            {/* CSS-animated loading spinner */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Processing document...</p>
          </div>
        ) : (
          /* Default State: Show upload interface */
          <>
            {/* Upload icon */}
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            
            {/* Main upload message */}
            <p className="mt-4 text-lg font-medium text-gray-900">
              Upload your document
            </p>
            
            {/* Instructions for user */}
            <p className="mt-2 text-sm text-gray-500">
              Drag and drop a PDF or TXT file here, or click to select
            </p>
            
            {/* File Selection Button */}
            <div className="mt-8">
              {/* Hidden file input - triggered by label click */}
              <input
                type="file"
                accept=".pdf,.txt"  // Restrict file picker to supported formats
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              
              {/* Styled label that acts as button */}
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                Choose File
              </label>
            </div>
          </>
        )}
      </div>
      
      {/* Error Message Display */}
      {error && (
        <div className="mt-4 flex items-center text-red-600">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 