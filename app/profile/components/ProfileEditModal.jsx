'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, X, Save, Image } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import ImageUpload from '@/components/ImageUpload';
import { toast } from 'react-toastify';

export default function ProfileEditModal({ user, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    phone: user?.phone || '',
    avatar_url: user?.avatar_url || '',
    banner_url: user?.banner_url || ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({ avatar: null, banner: null });

  useEffect(() => {
    console.log('🔧 FormData State Updated:', formData);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }

    setLoading(true);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const uploads = [];
    const toUpload = [];
    if (selectedFiles.banner) toUpload.push({ key: 'banner_url', file: selectedFiles.banner, folder: 'profiles/banner' });
    if (selectedFiles.avatar) toUpload.push({ key: 'avatar_url', file: selectedFiles.avatar, folder: 'profiles/avatar' });

    for (const item of toUpload) {
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('upload_preset', 'gatotkota_profiles');
      formData.append('folder', item.folder);
      uploads.push(
        fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData
        }).then(async (r) => {
          if (!r.ok) throw new Error(`Upload failed: ${r.status}`);
          const result = await r.json();
          return { key: item.key, url: result.secure_url };
        })
      );
    }

    const uploaded = await Promise.all(uploads);
    const payload = { ...formData };
    uploaded.forEach(u => { payload[u.key] = u.url; });

    try {
      const { user: currentUser } = await getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔧 Profile Update Success:', {
          formDataSent: formData,
          responseReceived: result
        });
        try {
          window.dispatchEvent(new CustomEvent('profile:updated', { detail: 'profileUpdated' }));
        } catch (_) {}
        onSuccess();
        toast.success('Profile berhasil diupdate!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Gagal update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'username') {
      const cleanedValue = value.toLowerCase().replace(/\s+/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.3 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-6 h-6 text-[#DD761C]" />
            Edit Profile
          </h2>
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-2 text-[#DD761C]" />
              Banner Profile
            </label>
            <ImageUpload
              currentImage={formData.banner_url}
              onImageChange={(imageUrl) => {
                console.log('🔧 Banner URL Change:', { imageUrl, type: 'banner', timestamp: new Date().toISOString() });
                console.log('🔧 Banner Current FormData Before Update:', formData);
                setFormData(prev => {
                  const newFormData = { ...prev, banner_url: imageUrl };
                  console.log('🔧 Banner New FormData After Update:', newFormData);
                  return newFormData;
                });
              }}
              type="banner"
              deferred
              onFileSelected={(file) => setSelectedFiles(prev => ({ ...prev, banner: file }))}
              disabled={loading}
            />
          </div>

          {/* Avatar Section */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Profile
            </label>
            <div className="flex justify-center">
              <ImageUpload
                currentImage={formData.avatar_url}
                onImageChange={(imageUrl) => {
                  console.log('🔧 Avatar URL Change:', { imageUrl, type: 'avatar' });
                  console.log('🔧 Current FormData Before Update:', formData);
                  setFormData(prev => {
                    const newFormData = { ...prev, avatar_url: imageUrl };
                    console.log('🔧 New FormData After Update:', newFormData);
                    return newFormData;
                  });
                }}
                type="avatar"
                deferred
                onFileSelected={(file) => setSelectedFiles(prev => ({ ...prev, avatar: file }))}
                disabled={loading}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Klik untuk ubah foto</p>
          </div>

          {/* Form Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2 text-[#DD761C]" />
              Nama Lengkap *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD761C] focus:border-transparent"
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2 text-[#DD761C]" />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD761C] focus:border-transparent"
              placeholder="johndoe123"
              pattern="[a-z0-9_-]+"
              title="Username harus lowercase, tanpa spasi, hanya huruf, angka, underscore, dan tanda hubung"
            />
            <p className="text-xs text-gray-500 mt-1">
              huruf kecil, tanpa spasi, minimal 3 karakter
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2 text-[#DD761C]" />
              No. Handphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD761C] focus:border-transparent"
              placeholder="Masukkan nomor handphone"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.full_name.trim()}
              className="flex-1 px-6 py-3 bg-[#DD761C] text-white rounded-lg font-medium hover:bg-[#DD761C]/90 disabled:bg-gray-400 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
