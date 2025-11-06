import React from 'react';
import { toast } from 'react-hot-toast';

interface FileDownloaderProps {
  fileUrl?: string;
  fileName: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  mockDownload?: boolean; // For demo purposes
}

const FileDownloader: React.FC<FileDownloaderProps> = ({
  fileUrl,
  fileName,
  label = 'Download',
  variant = 'primary',
  size = 'md',
  isDisabled = false,
  mockDownload = true // Default to mock for demo
}) => {
  // Button style classes based on variant and size
  const getButtonClasses = () => {
    let baseClasses = 'rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center';
    
    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base'
    };
    
    // Variant classes
    const variantClasses = {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
      outline: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500'
    };
    
    // Disabled classes
    const disabledClasses = 'opacity-50 cursor-not-allowed';
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${isDisabled ? disabledClasses : ''}`;
  };

  const handleDownload = () => {
    if (isDisabled) return;
    
    if (mockDownload) {
      // For demo: Create a mock file with some content
      const content = `This is a mock file download for ${fileName}.\nGenerated at ${new Date().toISOString()}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${fileName}`);
      return;
    }
    
    if (!fileUrl) {
      toast.error('Download URL not available');
      return;
    }
    
    try {
      // Real download using provided URL
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success(`Downloaded ${fileName}`);
    } catch (error) {
      toast.error('Download failed');
      console.error('Download error:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDisabled}
      className={getButtonClasses()}
      title={isDisabled ? 'Download not available' : `Download ${fileName}`}
    >
      <svg 
        className="w-4 h-4 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {label}
    </button>
  );
};

export default FileDownloader;