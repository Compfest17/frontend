'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Save, X } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProvinceCitySearch from '@/components/ProvinceCitySearch';
import { toast } from 'react-toastify';

export default function EmployeeProvinceSetup({ user, onSuccess, onCancel }) {
  
  const [formData, setFormData] = useState({
    assigned_province: user?.assigned_province || '',
    assigned_city: user?.assigned_city || '',
    coverage_coordinates: user?.coverage_coordinates || null
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.assigned_province) {
      toast.error('Provinsi wajib dipilih');
      return;
    }

    try {
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      let payload = { ...formData };
      if (!payload.coverage_coordinates && formData.assigned_province) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/geocoding/province-boundary?province=${encodeURIComponent(formData.assigned_province)}`, {
            headers: { 'Authorization': `Bearer ${currentUser.access_token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.data?.geojson) {
              payload.coverage_coordinates = data.data.geojson;
            }
          }
        } catch (_) {}
      }
      
      const response = await fetch(`${API_BASE_URL}/api/employee/${user.id}/assignment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await response.json();
        onSuccess();
        toast.success('Assignment berhasil diupdate!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal update assignment');
      }
    } catch (error) {
      console.error('Failed to update assignment:', error);
      toast.error('Gagal update assignment');
    } finally {
      setLoading(false);
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
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#DD761C]" />
            Set Provinsi
          </h2>
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Sebagai karyawan, Anda perlu mengatur provinsi yang akan Anda handle.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <ProvinceCitySearch
              onProvinceSelect={async (province) => {
                setFormData(prev => ({...prev, assigned_province: province}));
                try {
                  const { user: currentUser } = await getCurrentUser();
                  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                  if (!province) return;
                  const res = await fetch(`${API_BASE_URL}/api/geocoding/province-boundary?province=${encodeURIComponent(province)}`, {
                    headers: { 'Authorization': `Bearer ${currentUser.access_token}` }
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data?.data?.geojson) {
                      setFormData(prev => ({ ...prev, coverage_coordinates: data.data.geojson }));
                    }
                  }
                } catch (e) {}
              }}
              selectedProvince={formData.assigned_province}
              hideCity={true}
            />
          </div>
          
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
              disabled={loading || !formData.assigned_province}
              className="flex-1 px-6 py-3 bg-[#DD761C] text-white rounded-lg font-medium hover:bg-[#DD761C]/90 disabled:bg-gray-400 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
