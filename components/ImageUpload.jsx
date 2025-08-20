'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  type = 'avatar', 
  className = '',
  disabled = false,
  onUploadStateChange,
  deferred = false,
  onFileSelected
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    let previewUrl = null;
    
    try {
      previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageChange(previewUrl);

      if (deferred) {
        if (onFileSelected) onFileSelected(file);
        return;
      }

      setUploading(true);
      if (onUploadStateChange) onUploadStateChange(true);

      const formData = new FormData();
      formData.append('file', file);
      if (type === 'avatar' || type === 'banner') {
        formData.append('upload_preset', 'gatotkota_profiles');
        formData.append('folder', `profiles/${type}`);
        formData.append('resource_type', 'image');
        formData.append('public_id_prefix', `profiles/${type}/`);
      } else {
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'gatotkota_uploads');
        formData.append('folder', `reports`);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      const result = await response.json();
      URL.revokeObjectURL(previewUrl);
      setPreview(result.secure_url);
      onImageChange(result.secure_url);
      setUploading(false);
      if (onUploadStateChange) onUploadStateChange(false);

    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
      if (onUploadStateChange) onUploadStateChange(false);
      if (!deferred) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreview(currentImage);
        onImageChange(currentImage);
      }
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (type === 'banner') {
    return (
      <div className={`relative group ${className}`}>
        <div 
          className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300 hover:border-gray-400"
          onClick={handleClick}
        >
          {preview ? (
            <img 
              src={preview} 
              alt="Banner preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm">Click to upload banner</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </div>
        </div>

        {preview && !uploading && (
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <div 
        className="w-20 h-20 rounded-full overflow-hidden cursor-pointer border-4 border-gray-200 hover:border-gray-300 transition-colors"
        onClick={handleClick}
      >
        <img
          src={preview || '/profilePicture-img.svg'}
          alt="Profile"
          className="w-full h-full object-cover"
        />
        
        {/* Upload overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
          {uploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
}
