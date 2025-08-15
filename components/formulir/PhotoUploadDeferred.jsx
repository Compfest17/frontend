'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { usePendingUploads } from '@/contexts/PendingUploadsContext';

export default function PhotoUploadDeferred({
  maxFiles = 3,
  maxSize = 5 * 1024 * 1024, 
  allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
  className = ""
}) {
  const { pendingFiles, addPendingFile, removePendingFile } = usePendingUploads();
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (pendingFiles.length + files.length > maxFiles) {
      alert(`Maksimal ${maxFiles} foto yang dapat diunggah`);
      return;
    }

    files.forEach(file => validateAndAddFile(file));
    
    event.target.value = '';
  };

  const validateAndAddFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      alert(`Format file tidak didukung. Gunakan: ${allowedTypes.join(', ')}`);
      return;
    }

    if (file.size > maxSize) {
      alert(`Ukuran file terlalu besar. Maksimal ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    addPendingFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    const fakeEvent = { target: { files } };
    handleFileSelect(fakeEvent);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = (file) => {
    switch (file.status) {
      case 'uploading':
        return <Loader size={20} className="text-orange-500 animate-spin" />;
      case 'uploaded':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'failed':
        return <AlertCircle size={20} className="text-red-500" />;
      default:
        return null; 
    }
  };

  const getStatusText = (file) => {
    switch (file.status) {
      case 'uploading':
        return `Uploading... ${file.progress || 0}%`;
      case 'uploaded':
        return 'Upload berhasil';
      case 'failed':
        return `Gagal: ${file.error || 'Unknown error'}`;
      default:
        return ''; 
    }
  };

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          pendingFiles.length >= maxFiles 
            ? 'border-gray-200 bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400 cursor-pointer'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={pendingFiles.length < maxFiles ? openFileDialog : undefined}
      >
        {pendingFiles.length >= maxFiles ? (
          <div className="text-gray-500">
            <Image size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Maksimal {maxFiles} foto telah tercapai</p>
          </div>
        ) : (
          <>
            <Upload size={48} className="text-gray-400 mb-2 mx-auto" />
            <p className="text-sm text-gray-600 mb-1">
              Seret & lepas foto di sini, atau{' '}
              <span className="font-medium cursor-pointer" style={{ color: '#DD761C' }}>
                Pilih Foto
              </span>
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG Max. {Math.round(maxSize / 1024 / 1024)}MB per file ({maxFiles} foto maksimal)
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {pendingFiles.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {pendingFiles.map((file) => (
            <div key={file.id} className="relative group">
              <button
                type="button"
                onClick={() => removePendingFile(file.id)}
                disabled={file.status === 'uploading'}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-90 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <X size={16} />
              </button>

              <div className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />

                {file.status !== 'pending' && (
                  <div className="absolute top-2 left-2">
                    {getStatusIcon(file)}
                  </div>
                )}

                {file.status === 'uploading' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2">
                <p className="text-xs text-gray-500 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
                {file.status !== 'pending' && getStatusText(file) && (
                  <p className={`text-xs mt-1 ${
                    file.status === 'uploaded' ? 'text-green-600' :
                    file.status === 'failed' ? 'text-red-600' :
                    file.status === 'uploading' ? 'text-orange-600' :
                    'text-blue-600'
                  }`}>
                    {getStatusText(file)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        <span>{pendingFiles.length}/{maxFiles} foto</span>
      </div>
    </div>
  );
}
