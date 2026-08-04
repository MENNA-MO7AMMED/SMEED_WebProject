import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import Button from './Button'; // تأكد إن المكون ده موجود

interface ProfilePhotoUploadProps {
  initialImage?: string;
  onImageChange?: (imageDataUrl: string | null) => void;
  className?: string;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  initialImage,
  onImageChange,
  className = '',
}) => {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null); // لمعالجة الأخطاء
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string;
        setImage(imageDataUrl);
        setError(null);
        if (onImageChange) onImageChange(imageDataUrl);
      };
      reader.onerror = () => setError('Error reading the file.');
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please drop an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string;
        setImage(imageDataUrl);
        setError(null);
        if (onImageChange) onImageChange(imageDataUrl);
      };
      reader.onerror = () => setError('Error reading the dropped file.');
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImage(null);
    setError(null);
    if (onImageChange) onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}
      <div
        className={`
          relative w-32 h-32 rounded-full overflow-hidden cursor-pointer
          border-2 ${isDragging ? 'border-blue-500 border-dashed' : 'border-gray-300 dark:border-gray-700'}
          transition-all duration-200
        `}
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Upload or change profile photo"
      >
        {image ? (
          <>
            <img 
              src={image} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
              <Camera className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200" size={24} />
            </div>
            <button 
              type="button"
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              aria-label="Remove profile photo"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Upload className="text-gray-400 mb-2" size={24} />
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">Upload Photo</span>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="mt-3 flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={triggerFileInput}
          className="text-xs"
          aria-label="Change profile photo"
        >
          Change
        </Button>
        {image && (
          <Button
            size="sm"
            variant="danger"
            onClick={removeImage}
            className="text-xs"
            aria-label="Remove profile photo"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;