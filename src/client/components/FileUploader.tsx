import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  accept = '*/*',
  maxSize = 10, // Default 10MB
  label = 'Upload File'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSize}MB limit`);
      return false;
    }

    // Check file type if accept is specified
    if (accept !== '*/*') {
      const fileType = file.type;
      const acceptTypes = accept.split(',').map(type => type.trim());
      
      // Check if the file type matches any of the accepted types
      const isAccepted = acceptTypes.some(type => {
        if (type.includes('/*')) {
          // Handle wildcard mime types like 'image/*'
          const typeCategory = type.split('/')[0];
          return fileType.startsWith(`${typeCategory}/`);
        }
        return type === fileType;
      });

      if (!isAccepted) {
        toast.error('File type not accepted');
        return false;
      }
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelect(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelect(file);
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={accept}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg
            className={`w-12 h-12 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          
          {fileName ? (
            <div>
              <p className="text-sm font-medium text-indigo-600">{fileName}</p>
              <p className="text-xs text-gray-500 mt-1">Click to change file</p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-500 mt-1">
                Drag & drop or click to browse
              </p>
              {accept !== '*/*' && (
                <p className="text-xs text-gray-400 mt-1">
                  Accepted formats: {accept}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Max size: {maxSize}MB
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;