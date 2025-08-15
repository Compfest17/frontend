'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const PendingUploadsContext = createContext();

export const usePendingUploads = () => {
  const context = useContext(PendingUploadsContext);
  if (!context) {
    throw new Error('usePendingUploads must be used within a PendingUploadsProvider');
  }
  return context;
};

export const PendingUploadsProvider = ({ children }) => {
  const [pendingFiles, setPendingFiles] = useState([]);

  const addPendingFile = useCallback((file) => {
    const fileData = {
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setPendingFiles(prev => [...prev, fileData]);
    return fileData;
  }, []);

  const removePendingFile = useCallback((fileId) => {
    setPendingFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  const uploadAllPending = useCallback(async () => {
    const filesToUpload = pendingFiles.filter(f => f.status === 'pending');
    
    if (filesToUpload.length === 0) {
      return [];
    }

    setPendingFiles(prev => 
      prev.map(file => 
        file.status === 'pending' 
          ? { ...file, status: 'uploading', progress: 0 }
          : file
      )
    );

    const uploadPromises = filesToUpload.map(async (fileData) => {
      try {
        setPendingFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, progress: 10 }
              : f
          )
        );

        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'gatotkota_uploads');
        formData.append('folder', 'gatotkota/reports');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        const result = await response.json();

        setPendingFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { 
                  ...f, 
                  status: 'uploaded', 
                  progress: 100,
                  url: result.secure_url,
                  public_id: result.public_id
                }
              : f
          )
        );

        return {
          id: fileData.id,
          url: result.secure_url,
          public_id: result.public_id,
          name: fileData.name,
          size: fileData.size,
          type: fileData.type
        };

      } catch (error) {
        console.error('Upload error for file:', fileData.name, error);
        
        setPendingFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'failed', error: error.message }
              : f
          )
        );

        throw error;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error('Some files failed to upload');
    }
  }, [pendingFiles]);

  const clearAllPending = useCallback(() => {
    pendingFiles.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    setPendingFiles([]);
  }, [pendingFiles]);

  const getUploadStats = useCallback(() => {
    const total = pendingFiles.length;
    const pending = pendingFiles.filter(f => f.status === 'pending').length;
    const uploading = pendingFiles.filter(f => f.status === 'uploading').length;
    const uploaded = pendingFiles.filter(f => f.status === 'uploaded').length;
    const failed = pendingFiles.filter(f => f.status === 'failed').length;

    return { total, pending, uploading, uploaded, failed };
  }, [pendingFiles]);

  const value = {
    pendingFiles,
    addPendingFile,
    removePendingFile,
    uploadAllPending,
    clearAllPending,
    getUploadStats
  };

  return (
    <PendingUploadsContext.Provider value={value}>
      {children}
    </PendingUploadsContext.Provider>
  );
};
