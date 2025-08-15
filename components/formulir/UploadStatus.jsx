'use client';

import React from 'react';
import { CheckCircle, AlertCircle, Loader, Camera } from 'lucide-react';
import { usePendingUploads } from '@/contexts/PendingUploadsContext';

export default function UploadStatus() {
  const { getUploadStats } = usePendingUploads();
  const stats = getUploadStats();

  if (stats.uploading === 0 && stats.uploaded === 0 && stats.failed === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Camera size={20} className="text-gray-600" />
        <h3 className="font-medium text-gray-700">Status Upload Foto</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        {/* Uploading */}
        {stats.uploading > 0 && (
          <div className="flex items-center gap-2">
            <Loader size={12} className="text-orange-500 animate-spin" />
            <span className="text-orange-600">Upload: {stats.uploading}</span>
          </div>
        )}
        
        {/* Uploaded */}
        {stats.uploaded > 0 && (
          <div className="flex items-center gap-2">
            <CheckCircle size={12} className="text-green-500" />
            <span className="text-green-600">Berhasil: {stats.uploaded}</span>
          </div>
        )}
        
        {/* Failed */}
        {stats.failed > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle size={12} className="text-red-500" />
            <span className="text-red-600">Gagal: {stats.failed}</span>
          </div>
        )}
      </div>
      
      {/* Progress info - simplified */}
      <div className="mt-3 text-xs text-gray-500">
        {stats.uploading > 0 && (
          <p className="text-orange-600">Sedang mengupload {stats.uploading} foto...</p>
        )}
        {stats.failed > 0 && (
          <p className="text-red-600">{stats.failed} foto gagal diupload</p>
        )}
      </div>
    </div>
  );
}
