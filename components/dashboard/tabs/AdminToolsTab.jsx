'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Copy, 
  Check, 
  Clock, 
  Users, 
  Settings,
  Key,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminToolsTab({ user }) {
  const [codes, setCodes] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  
  const [formData, setFormData] = useState({
    expiryHours: 24,
    notes: ''
  });

  useEffect(() => {
    if (user.role === 'admin') {
      fetchVerificationCodes();
    }
  }, [user]);

  const fetchProvinces = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      setLoadingProvinces(true);
      const { user: currentUser } = await getCurrentUser();
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/employee/provinces`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setProvinces(result.data.map(p => p.name || p));
      } else {
        setProvinces([
          'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 
          'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung',
          'Kepulauan Riau', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 
          'DI Yogyakarta', 'Jawa Timur', 'Banten', 'Bali', 'Nusa Tenggara Barat',
          'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah',
          'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
          'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 
          'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat', 'Maluku',
          'Maluku Utara', 'Papua Barat', 'Papua'
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
      setProvinces([
        'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 
        'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung',
        'Kepulauan Riau', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 
        'DI Yogyakarta', 'Jawa Timur', 'Banten', 'Bali', 'Nusa Tenggara Barat',
        'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah',
        'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
        'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 
        'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat', 'Maluku',
        'Maluku Utara', 'Papua Barat', 'Papua'
      ]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchVerificationCodes = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/dashboard/employee-codes`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCodes(result.data.codes);
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch verification codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      setGenerating(true);
      const { user: currentUser } = await getCurrentUser();
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/employee/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        
        setFormData({
          expiryHours: 24,
          notes: ''
        });
        
        fetchVerificationCodes();
        
        alert(`Kode berhasil dibuat: ${result.data.code}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal membuat kode');
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
      alert('Gagal membuat kode verifikasi');
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const getCodeStatus = (code) => {
    if (code.is_used) return { label: 'Used', color: 'bg-green-100 text-green-800' };
    if (new Date(code.expires_at) < new Date()) return { label: 'Expired', color: 'bg-red-100 text-red-800' };
    return { label: 'Active', color: 'bg-blue-100 text-blue-800' };
  };

  if (user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600">Access Denied</h3>
        <p className="text-gray-500">Hanya admin yang bisa mengakses tools ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Tools</h2>
          <p className="text-gray-600 mt-1">Kelola kode verifikasi karyawan dan pengaturan sistem</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Codes</p>
              <p className="text-3xl font-bold text-orange-800">{stats.total || 0}</p>
            </div>
            <Key className="w-8 h-8 text-[#DD761C]" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Used</p>
              <p className="text-3xl font-bold text-orange-800">{stats.used || 0}</p>
            </div>
            <Check className="w-8 h-8 text-[#DD761C]" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Active</p>
              <p className="text-3xl font-bold text-orange-800">{stats.active || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-[#DD761C]" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Expired</p>
              <p className="text-3xl font-bold text-orange-800">{stats.expired || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[#DD761C]" />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#DD761C]" />
          Generate Kode Referal Karyawan
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Buat kode referal umum yang bisa digunakan siapa saja untuk menjadi karyawan. Karyawan nanti bisa pilih provinsi sendiri.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expire (Jam)
            </label>
            <input
              type="number"
              value={formData.expiryHours}
              onChange={(e) => setFormData({...formData, expiryHours: parseInt(e.target.value)})}
              min="1"
              max="168"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Catatan untuk kode ini"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
        
        <button
          onClick={generateCode}
          disabled={generating}
          className="px-6 py-2 bg-[#DD761C] text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {generating ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Generate Kode Referal
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#DD761C]" />
            Verification Codes History
          </h3>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada kode verifikasi yang dibuat</p>
            </div>
          ) : (
            <div className="space-y-4">
              {codes.map((code, index) => {
                const status = getCodeStatus(code);
                
                return (
                  <motion.div
                    key={code.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="px-3 py-1 bg-gray-800 text-white rounded font-mono text-lg">
                          {code.code}
                        </code>
                        <button
                          onClick={() => copyCode(code.code)}
                          className="p-1 text-gray-500 hover:text-[#DD761C] transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === code.code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{code.province}{code.city && ` - ${code.city}`}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Expires: {new Date(code.expires_at).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{code.expiry_hours}h validity</span>
                        </div>
                        {code.used_by && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>Used by employee</span>
                          </div>
                        )}
                      </div>
                      
                      {code.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                          Note: {code.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      <p>Created</p>
                      <p>{new Date(code.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeSection === section.id
                    ? 'border-b-2 border-[#DD761C] text-[#DD761C]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Content */}
      {activeSection === 'codes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Codes</p>
                  <p className="text-3xl font-bold text-orange-800">{stats.total || 0}</p>
                </div>
                <Key className="w-8 h-8 text-[#DD761C]" />
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Used</p>
                  <p className="text-3xl font-bold text-orange-800">{stats.used || 0}</p>
                </div>
                <Check className="w-8 h-8 text-[#DD761C]" />
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Active</p>
                  <p className="text-3xl font-bold text-orange-800">{stats.active || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-[#DD761C]" />
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Expired</p>
                  <p className="text-3xl font-bold text-orange-800">{stats.expired || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-[#DD761C]" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#DD761C]" />
              Generate Kode Referal Karyawan
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Buat kode referal umum yang bisa digunakan siapa saja untuk menjadi karyawan. Karyawan nanti bisa pilih provinsi sendiri.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expire (Jam)
                </label>
                <input
                  type="number"
                  value={formData.expiryHours}
                  onChange={(e) => setFormData({...formData, expiryHours: parseInt(e.target.value)})}
                  min="1"
                  max="168"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Catatan untuk kode ini"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            <button
              onClick={generateCode}
              disabled={generating}
              className="px-6 py-2 bg-[#DD761C] text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {generating ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Generate Kode Referal
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Key className="w-5 h-5 text-[#DD761C]" />
                Verification Codes History
              </h3>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : codes.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada kode verifikasi yang dibuat</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {codes.map((code, index) => {
                    const status = getCodeStatus(code);
                    
                    return (
                      <motion.div
                        key={code.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <code className="px-3 py-1 bg-gray-800 text-white rounded font-mono text-lg">
                              {code.code}
                            </code>
                            <button
                              onClick={() => copyCode(code.code)}
                              className="p-1 text-gray-500 hover:text-[#DD761C] transition-colors"
                              title="Copy code"
                            >
                              {copiedCode === code.code ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{code.province}{code.city && ` - ${code.city}`}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Expires: {new Date(code.expires_at).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{code.expiry_hours}h validity</span>
                            </div>
                            {code.used_by && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>Used by employee</span>
                              </div>
                            )}
                          </div>
                          
                          {code.notes && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              Note: {code.notes}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right text-sm text-gray-500">
                          <p>Created</p>
                          <p>{new Date(code.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Point System Section */}
      {activeSection === 'points' && (
        <div className="bg-white rounded-xl shadow-sm">
          <AdminPointSystem user={user} />
        </div>
      )}
    </div>
  );
}
