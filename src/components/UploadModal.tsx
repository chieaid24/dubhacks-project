"use client";

import { useState } from "react";

interface UploadModalProps {
  isUploading: boolean;
  onFileUpload: (file: File) => void;
}

export default function UploadModal({ isUploading, onFileUpload }: UploadModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    setErrorMessage(""); // Clear any previous errors when dragging over
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const allowedTypes = ['.pptx', '.pdf'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (allowedTypes.includes(fileExtension)) {
        setErrorMessage(""); // Clear any previous errors
        onFileUpload(file);
      } else {
        setErrorMessage('Please upload a .pptx or .pdf file');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['.pptx', '.pdf'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (allowedTypes.includes(fileExtension)) {
        setErrorMessage(""); // Clear any previous errors
        onFileUpload(file);
      } else {
        setErrorMessage('Please upload a .pptx or .pdf file');
      }
    }
  };

  return (
    <div className="absolute inset-0 bg-bg-darkest bg-opacity-90 flex items-center justify-center z-10">
      <div className="bg-bg-dark border border-border-dark-light rounded-xl p-8 w-96 max-w-md mx-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-text-white">Upload Your Slides</h2>
        
        <label 
          htmlFor="file-upload"
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer block ${
            isDragOver ? 'border-primary bg-hover-dark' : 'border-border-dark-light hover:border-primary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pptx,.pdf"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <div className="w-16 h-16 mx-auto mb-4 bg-bg-dark-secondary rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-text-white mb-2">Choose Slides File</p>
          <p className="text-sm text-text-medium-gray mb-4">{isDragOver ? 'Drop your file here' : 'or drag and drop here'}</p>
          <p className="text-xs text-text-dark-muted">Supports .pptx and .pdf files</p>
        </label>

        {errorMessage && (
          <div className="mt-4 p-3 bg-error/20 border border-error rounded-lg">
            <p className="text-sm text-error text-center">{errorMessage}</p>
          </div>
        )}

        {isUploading && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-text-light-gray">Processing your lecture...</p>
          </div>
        )}
      </div>
    </div>
  );
}
