'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, ToggleLeft, ToggleRight, Settings, Award } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const POINT_EVENT_TYPES = {
  comment_created: 'Berkomentar',
  like_received: 'Like Postingan Orang Lain', 
  post_closed: 'Post Ditutup (Solved)'
};

export default function PointSystemTab({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('rules');
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  
  const [newRule, setNewRule] = useState({
    event_type: 'comment_created',
    points: 5,
    description: ''
  });
  
  const [editRule, setEditRule] = useState({
    event_type: '',
    points: 0,
    description: ''
  });
  
  const [manualAdjustment, setManualAdjustment] = useState({
    username: '',
    points: 0,
    reason: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPointRules();
    }
  }, [user]);

    if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Access Denied</h3>
        <p className="text-gray-600 dark:text-gray-400">You need admin privileges to access the Point System.</p>
      </div>
    );
  }

  const loadPointRules = async () => {
    try {
      let currentUser = user;
      let token;

      if (currentUser && currentUser.access_token) {
        token = currentUser.access_token;
      } else {
        const { user: authUser } = await getCurrentUser();
        if (!authUser) {
          console.error('No user found');
          return;
        }
        currentUser = authUser;
        token = authUser.access_token;
      }

      if (!token) {
        token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No access token found');
          return;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/points/rules`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Loaded rules from API:', data.rules);
      setRules(data.rules || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading point rules:', error.message);
      setLoading(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    try {
      let currentUser = user;
      let token;

      if (currentUser && currentUser.access_token) {
        token = currentUser.access_token;
      } else {
        const { user: authUser } = await getCurrentUser();
        currentUser = authUser;
        token = authUser.access_token;
      }

      if (!token) {
        token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No access token found in handleCreateRule');
          return;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/points/rules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRule)
      });

      if (!response.ok) {
        throw new Error(`Failed to create rule: ${response.statusText}`);
      }

      await loadPointRules();
      setNewRule({
        event_type: 'comment_created',
        points: 5,
        description: ''
      });
      toast.success('Point rule berhasil dibuat!');
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRule = async (ruleId, currentActive) => {
    try {
      let currentUser = user;
      let token;

      if (currentUser && currentUser.access_token) {
        token = currentUser.access_token;
      } else {
        const { user: authUser } = await getCurrentUser();
        currentUser = authUser;
        token = authUser.access_token;
      }

      if (!token) {
        token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No access token found in handleToggleRule');
          return;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/points/rules/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentActive })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update rule: ${response.statusText} - ${errorData.message || ''}`);
      }

      console.log('Rule toggle successful, reloading rules...');
      await loadPointRules();
      toast.success('Status rule berhasil diupdate!');
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleEditRule = async (e) => {
    e.preventDefault();
    if (submitting || !editingRule) return;
    
    setSubmitting(true);
    try {
      let currentUser = user;
      let token;

      if (currentUser && currentUser.access_token) {
        token = currentUser.access_token;
      } else {
        const { user: authUser } = await getCurrentUser();
        currentUser = authUser;
        token = authUser.access_token;
      }

      if (!token) {
        token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No access token found in handleEditRule');
          return;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/points/rules/${editingRule}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editRule)
      });

      if (!response.ok) {
        throw new Error(`Failed to update rule: ${response.statusText}`);
      }

      await loadPointRules();
      setEditingRule(null);
      setEditRule({
        event_type: '',
        points: 0,
        description: ''
      });
      toast.success('Rule berhasil diupdate!');
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditRule = (rule) => {
    setEditingRule(rule.id);
    setEditRule({
      event_type: rule.event_type,
      points: rule.points,
      description: rule.description
    });
  };

  const cancelEditRule = () => {
    setEditingRule(null);
    setEditRule({
      event_type: '',
      points: 0,
      description: ''
    });
  };

  const handleManualAdjustment = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    if (!manualAdjustment.username.trim()) {
      toast.error('Username harus diisi!');
      return;
    }
    
    if (manualAdjustment.points === 0) {
      toast.error('Points tidak boleh 0!');
      return;
    }
    
    if (!manualAdjustment.reason.trim()) {
      toast.error('Alasan harus diisi!');
      return;
    }
    
    setSubmitting(true);
    try {
      let currentUser = user;
      let token;

      if (currentUser && currentUser.access_token) {
        token = currentUser.access_token;
      } else {
        const { user: authUser } = await getCurrentUser();
        currentUser = authUser;
        token = authUser.access_token;
      }

      if (!token) {
        token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No access token found in handleManualAdjustment');
          toast.error('Tidak dapat mengakses sistem. Coba login ulang.');
          return;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/points/manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(manualAdjustment)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      setManualAdjustment({
        username: '',
        points: 0,
        reason: ''
      });
      
      toast.success(`Berhasil! ${data.user.username} (${data.user.name}): ${data.user.previousPoints} → ${data.user.newPoints} points`);
    } catch (error) {
      console.error('Error manual adjustment:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRulesTab = () => (
    <div className="space-y-6">

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Buat Rule Baru</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleCreateRule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={newRule.event_type}
                  onChange={(e) => setNewRule({ ...newRule, event_type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {Object.entries(POINT_EVENT_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  value={newRule.points}
                  onChange={(e) => setNewRule({ ...newRule, points: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Jumlah points"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Deskripsi rule"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#DD761C] text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Membuat...' : 'Buat Rule'}
            </button>
          </form>
        </div>
      </div>

      {/* Edit Rule Modal/Form */}
      {editingRule && (
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Rule</h3>
          <form onSubmit={handleEditRule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={editRule.event_type}
                  onChange={(e) => setEditRule({ ...editRule, event_type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {Object.entries(POINT_EVENT_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  value={editRule.points}
                  onChange={(e) => setEditRule({ ...editRule, points: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Jumlah points"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={editRule.description}
                  onChange={(e) => setEditRule({ ...editRule, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Deskripsi rule"
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-[#DD761C] text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button
                type="button"
                onClick={cancelEditRule}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Rules */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Daftar Rules</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DD761C] mx-auto"></div>
              <p className="text-gray-500 mt-2">Memuat rules...</p>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada point rules. Buat yang pertama di atas!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                            <Award className="w-5 h-5 text-[#DD761C]" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {POINT_EVENT_TYPES[rule.event_type] || rule.event_type}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.points > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {rule.points > 0 ? '+' : ''}{rule.points} pts
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{rule.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          rule.is_active 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {rule.is_active ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEditRule(rule)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Rule"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleRule(rule.id, rule.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                              rule.is_active
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={rule.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {rule.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderManualAdjustmentTab = () => (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">Manual Point Adjustment</h3>
        <p className="text-gray-600 mt-1">
          Tambah atau kurangi points user secara manual. Gunakan nilai positif untuk menambah, negatif untuk mengurangi.
        </p>
      </div>
      <div className="p-6">
        <form onSubmit={handleManualAdjustment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={manualAdjustment.username}
                onChange={(e) => setManualAdjustment({ ...manualAdjustment, username: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                value={manualAdjustment.points}
                onChange={(e) => setManualAdjustment({ ...manualAdjustment, points: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="+/- points"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan
              </label>
              <input
                type="text"
                value={manualAdjustment.reason}
                onChange={(e) => setManualAdjustment({ ...manualAdjustment, reason: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Alasan adjustment"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-[#DD761C] text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Memproses...' : 'Adjust Points'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Point System</h2>
          <p className="text-gray-600 mt-1">
            Kelola point rules dan adjustment manual
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'rules'
                ? 'border-[#DD761C] text-[#DD761C]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Point Rules
          </button>
          <button
            onClick={() => setActiveSubTab('manual')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'manual'
                ? 'border-[#DD761C] text-[#DD761C]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manual Adjustment
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeSubTab === 'rules' && renderRulesTab()}
        {activeSubTab === 'manual' && renderManualAdjustmentTab()}
      </div>
    </div>
  );
}
