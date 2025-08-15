'use client';

import { Phone } from 'lucide-react';
import { useState } from 'react';
import TagsInput from '@/components/formulir/TagsInput';
import AddressInput from '@/components/formulir/AddressInput';
import PhotoUploadDeferred from '@/components/formulir/PhotoUploadDeferred';
import UploadStatus from '@/components/formulir/UploadStatus';
import ForumAPI from '@/services/forumAPI';
import { usePendingUploads } from '@/contexts/PendingUploadsContext';

export default function Formulir({ user, onAuthRequired }) {
  const { uploadAllPending, clearAllPending, getUploadStats } = usePendingUploads();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incident_date: '',
    address: '',
    addressData: null, 
    coordinates: { lat: null, lon: null },
    priority: '',
    tags: [],
    is_anonymous: false,
    phone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!user) {
      onAuthRequired();
      return;
    }

    const uploadStats = getUploadStats();
    
    const hasValidAddress = formData.address && (
      (formData.coordinates.lat && formData.coordinates.lon) ||
      (formData.addressData?.coordinates?.lat && formData.addressData?.coordinates?.lng)
    );
    
    if (!formData.title || !formData.description || !formData.incident_date || 
        !hasValidAddress || !formData.priority) {
      alert('Mohon lengkapi semua field yang wajib diisi dan pastikan alamat memiliki koordinat yang valid');
      return;
    }

    setIsSubmitting(true);

    try {
      let media_urls = [];
      
      if (uploadStats.total > 0) {
        try {
          const uploadedFiles = await uploadAllPending();
          media_urls = uploadedFiles.map(file => ({
            url: file.url,
            type: file.type,
            name: file.name,
            size: file.size,
            public_id: file.public_id
          }));
        } catch (uploadError) {
          alert('Gagal mengupload foto. Silakan coba lagi.');
          return;
        }
      }

      const submitData = {
        title: formData.title,
        description: formData.description,
        incident_date: formData.incident_date,
        address: formData.address,
        latitude: formData.coordinates.lat,
        longitude: formData.coordinates.lon,
        priority: formData.priority,
        is_anonymous: formData.is_anonymous,
        tags: formData.tags,
        media_urls: media_urls
      };

      const response = await ForumAPI.createForum(submitData, user.access_token);
      
      if (response.success) {
        alert('Laporan berhasil dikirim!');
        
        clearAllPending();
        
        setFormData({
          title: '',
          description: '',
          incident_date: '',
          address: '',
          coordinates: { lat: null, lon: null },
          priority: '',
          tags: [],
          is_anonymous: false,
          phone: ''
        });
        
        window.location.href = '/forum';
      } else {
        throw new Error(response.message || 'Gagal mengirim laporan');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm max-w-2xl mx-auto">
      {/* Upload Status */}
      <UploadStatus />
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Judul Laporan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Judul Laporan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Contoh: Jalan Berlubang di Jalan Sudirman"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        {/* Deskripsi Laporan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Laporan <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Jelaskan detail kondisi jalan rusak, lokasi sekitar, dan dampaknya..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            required
          />
        </div>

        {/* Tanggal Kejadian */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Kejadian/Ditemukan <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.incident_date}
            onChange={(e) => handleInputChange('incident_date', e.target.value)}
            max={new Date().toISOString().split('T')[0]} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        {/* Lokasi Kejadian dengan OSM Integration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lokasi Kejadian <span className="text-red-500">*</span>
          </label>
          <AddressInput
            value={formData.address || ''}
            coordinates={formData.coordinates || { lat: null, lon: null }}
            onChange={(address) => handleInputChange('address', address)}
            onCoordinatesChange={(coordinates) => handleInputChange('coordinates', coordinates)}
            placeholder="Alamat lengkap lokasi jalan rusak"
          />
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags <span className="text-gray-500">(opsional)</span>
          </label>
          <TagsInput
            value={formData.tags}
            onChange={(tags) => handleInputChange('tags', tags)}
            placeholder="Ketik tag dipisah koma: jalanrusak, berlubang, macet"
            maxTags={5}
          />
          <p className="mt-1 text-xs text-gray-500">
            Ketik tags dipisah koma atau tekan Enter. Contoh: jalanrusak, berlubang, macet, lampu
          </p>
        </div>

        {/* Photo Upload - Deferred */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto Jalan Rusak <span className="text-gray-500">(maksimal 3 foto)</span>
          </label>
          <PhotoUploadDeferred maxFiles={3} />
        </div>

        {/* Tingkat Urgensi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tingkat Urgensi <span className="text-red-500">*</span>
          </label>
          <select 
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          >
            <option value="">Pilih tingkat urgensi</option>
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
            <option value="critical">Sangat Tinggi</option>
          </select>
        </div>

        {/* Kerahasiaan Identitas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Kerahasiaan Identitas <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                value="true"
                checked={formData.is_anonymous === true}
                onChange={(e) => handleInputChange('is_anonymous', true)}
                className="mr-2"
                style={{ accentColor: '#DD761C' }}
              />
              <span className="text-sm text-gray-700">Anonim (identitas disembunyikan)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                value="false"
                checked={formData.is_anonymous === false}
                onChange={(e) => handleInputChange('is_anonymous', false)}
                className="mr-2"
                style={{ accentColor: '#DD761C' }}
              />
              <span className="text-sm text-gray-700">Tampilkan Identitas</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#DD761C',
            '--tw-ring-color': '#DD761C'
          }}
        >
          {isSubmitting ? 'MENGIRIM LAPORAN...' : 'KIRIM LAPORAN'}
        </button>
      </form>
    </div>
  );
}