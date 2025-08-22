'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Edit3,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getCurrentUser } from '@/lib/supabase-auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRealtimeForumStatus } from '@/hooks/useRealtimeReports';

export default function ReportsTab({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalAction, setModalAction] = useState('in_progress');
  const [modalComment, setModalComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { isConnected } = useRealtimeForumStatus({
    onStatusChange: (updatedReport, oldReport) => {
      console.log('ReportsTab - Status change detected:', { new: updatedReport, old: oldReport });
      if (user.role === 'karyawan') {
        if (updatedReport.status === 'open') {
          console.log('ReportsTab - Report still open, refreshing...');
          fetchReports();
        } else {
          console.log('ReportsTab - Report status changed from open, removing...');
          setReports(prev => prev.filter(r => r.id !== updatedReport.id));
        }
      } else {
        fetchReports();
      }
    }
  });

  useEffect(() => {
    fetchReports();
  }, [user.id, user.role, user.assigned_province, statusFilter, priorityFilter, pagination.page, searchTerm]);

  const fetchReports = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();
      
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      if (user.role === 'karyawan') {
        params.append('reportStatus', 'open');
      } else if (statusFilter !== 'all') {
        params.append('reportStatus', statusFilter);
      }
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const endpoint = user.role === 'admin' 
        ? `${API_BASE_URL}/api/forums/all`
        : `${API_BASE_URL}/api/employee/assigned-reports`;
      
      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('ReportsTab - Fetched data:', result);
        setReports(result.data?.data || result.data || []);
        if (result.data?.pagination) {
          setPagination({
            page: result.data.pagination.page || 1,
            limit: result.data.pagination.limit || 10,
            total: result.data.pagination.total || 0,
            totalPages: result.data.pagination.totalPages || 0
          });
        } else {
          const totalReports = result.data?.length || 0;
          setPagination({
            page: 1,
            limit: 10,
            total: totalReports,
            totalPages: Math.ceil(totalReports / 10)
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setModalAction('in_progress');
    setModalComment('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setModalComment('');
  };

  const submitUpdate = async () => {
    if (!selectedReport || !modalComment.trim()) return;
    try {
      setSubmitting(true);
      const { user: currentUser } = await getCurrentUser();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const statusRes = await fetch(`${API_BASE_URL}/api/forums/${selectedReport.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        body: JSON.stringify({ status: modalAction })
      });
      if (!statusRes.ok) throw new Error('Failed to update status');
      const commentRes = await fetch(`${API_BASE_URL}/api/forums/${selectedReport.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        body: JSON.stringify({ content: modalComment, is_anonymous: false })
      });
      if (!commentRes.ok) throw new Error('Failed to post comment');
      closeModal();
      if (modalAction !== 'open') {
        setReports(prev => prev.filter(r => r.id !== selectedReport.id));
      }
      fetchReports();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return CheckCircle;
      case 'in_progress': return Clock;
      case 'open': return AlertTriangle;
      case 'closed': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'Terbuka';
      case 'in_progress': return 'Proses';
      case 'resolved': return 'Selesai';
      case 'closed': return 'Dibatalkan';
      default: return status || 'Unknown';
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'karyawan')) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <ClipboardList className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You need admin or employee privileges to view reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {user.role === 'admin' ? 'All Reports' : 'My Assigned Reports'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isConnected && <span className="text-green-600 text-sm">● Real-time updates active</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search reports..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white">
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setSearchTerm(''); setPriorityFilter('all'); }} className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Reset Filters</button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {user.role === 'admin' && (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Laporan</p>
              <p className="text-3xl font-bold text-orange-800">{pagination.total}</p>
            </div>
            <ClipboardList className="w-8 h-8 text-[#DD761C]" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Terbuka</p>
              <p className="text-3xl font-bold text-orange-800">
                {reports.filter(r => r.status === 'open').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[#DD761C]" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Proses</p>
              <p className="text-3xl font-bold text-orange-800">
                {reports.filter(r => r.status === 'in_progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-[#DD761C]" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Selesai</p>
              <p className="text-3xl font-bold text-orange-800">
                {reports.filter(r => r.status === 'resolved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-[#DD761C]" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Dibatalkan</p>
              <p className="text-3xl font-bold text-orange-800">
                {reports.filter(r => r.status === 'closed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-[#DD761C]" />
          </div>
        </div>
      </div>
      )}

      {/* Reports Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Tidak ada laporan</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Tidak ada laporan yang sesuai dengan pencarian' : 'Belum ada laporan'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3 sm:w-2/5">
                    Report Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/3 sm:w-1/3">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => {
                  const StatusIcon = getStatusIcon(report.status);
                  
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <ClipboardList className="w-5 h-5 text-[#DD761C]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {report.title || 'Untitled Report'}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {report.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                          <div className="text-sm text-gray-900 break-words">
                            {report.address || 'Not specified'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(report.priority)}`}>
                          {(report.priority || 'Medium').toString().replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {getStatusLabel(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>{new Date(report.incident_date || report.created_at).toLocaleDateString('id-ID')}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.open(`/forum/${report.id}`, '_blank')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {user.role === 'karyawan' && report.status === 'open' && (
                            <button
                              onClick={() => openModal(report)}
                              className="p-2 text-[#DD761C] hover:bg-orange-50 rounded-lg transition-colors"
                              title="Update Status"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-6 py-3 rounded-xl border border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {isModalOpen && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25, duration: 0.3 } }}
              exit={{ opacity: 0, scale: 0.8, y: 20, transition: { duration: 0.2 } }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-[#DD761C]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Update Laporan</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aksi</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="action" value="in_progress" checked={modalAction === 'in_progress'} onChange={() => setModalAction('in_progress')} />
                      <span>Proses (In Progress)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="action" value="closed" checked={modalAction === 'closed'} onChange={() => setModalAction('closed')} />
                      <span>Close</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Komentar</label>
                  <textarea value={modalComment} onChange={(e) => setModalComment(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" rows={4} placeholder="Tulis komentar..." />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button onClick={closeModal} disabled={submitting} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">Batal</button>
                  <button onClick={submitUpdate} disabled={submitting || !modalComment.trim()} className="flex-1 px-6 py-3 bg-[#DD761C] text-white rounded-lg font-medium hover:bg-[#DD761C]/90 transition-colors duration-200 disabled:bg-gray-400">{submitting ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
