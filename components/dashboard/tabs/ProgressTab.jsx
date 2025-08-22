"use client";

import { useState, useEffect } from 'react';
import { MapPin, Search, ChevronLeft, ChevronRight, Eye, ClipboardList, Edit3 } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRealtimeForumStatus } from '@/hooks/useRealtimeReports';

export default function ProgressTab({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalComment, setModalComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('resolved');

  const { isConnected } = useRealtimeForumStatus({ 
    onStatusChange: (newReport, oldReport) => {
      console.log('ProgressTab - Status change detected:', { new: newReport, old: oldReport });
      if (newReport.status === 'in_progress') {
        console.log('ProgressTab - Report still in progress, refreshing...');
        fetchInProgressReports();
      } else {
        console.log('ProgressTab - Report status changed, removing from progress...');
        setReports(prev => prev.filter(r => r.id !== newReport.id));
      }
    }
  });

  useEffect(() => {
    fetchReports();
  }, [user.id, user.assigned_province, searchTerm, priorityFilter, pagination.page]);

  const fetchReports = async () => {
    try {
      if (typeof window === 'undefined') return;
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();

      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      params.append('reportStatus', 'in_progress');
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/employee/assigned-reports?${params}`, {
        headers: { 'Authorization': `Bearer ${currentUser.access_token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setReports(result.data || []);
        const totalReports = result.pagination?.total || (result.data?.length || 0);
        const totalPages = result.pagination?.totalPages || Math.ceil(totalReports / pagination.limit);
        setPagination(prev => ({ ...prev, total: totalReports, totalPages }));
      }
    } catch (e) {
      console.error('Failed to fetch in-progress reports:', e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setModalComment('');
    setSelectedStatus('resolved');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setModalComment('');
    setSelectedStatus('resolved');
  };

  const submitStatus = async () => {
    if (!selectedReport || !modalComment.trim()) return;
    try {
      setSubmitting(true);
      const { user: currentUser } = await getCurrentUser();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const statusRes = await fetch(`${API_BASE_URL}/api/forums/${selectedReport.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.access_token}` },
        body: JSON.stringify({ status: selectedStatus })
      });
      if (!statusRes.ok) throw new Error(`Failed to update status to ${selectedStatus}`);
      const commentRes = await fetch(`${API_BASE_URL}/api/forums/${selectedReport.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.access_token}` },
        body: JSON.stringify({ content: modalComment, is_anonymous: false })
      });
      if (!commentRes.ok) throw new Error('Failed to post comment');
      closeModal();
      setReports(prev => prev.filter(r => (r.forums || r).id !== selectedReport.id));
      fetchReports();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const parseUtcMs = (ts) => {
    if (!ts) return null;
    if (typeof ts === 'number') return ts;
    if (typeof ts === 'string') {
      const hasTZ = /Z|[+-]\d{2}:?\d{2}$/.test(ts);
      const normalized = hasTZ ? ts : `${ts}Z`;
      const ms = Date.parse(normalized);
      return Number.isNaN(ms) ? null : ms;
    }
    const ms = new Date(ts).getTime();
    return Number.isNaN(ms) ? null : ms;
  };

  const formatDurationSince = (ts) => {
    const start = parseUtcMs(ts);
    if (start == null) return '-';
    const now = Date.now();
    const ms = Math.max(0, now - start);
    const mins = Math.floor(ms / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} hari`;
    if (hours > 0) return `${hours} jam`;
    return `${mins} menit`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Progress</h2>
          <p className="text-gray-600 mt-1">
            {isConnected && <span className="text-green-600 text-sm">● Real-time updates active</span>}
          </p>
        </div>
      </div>

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
                
      {loading ? (
        <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Tidak ada laporan</h3>
          <p className="text-gray-500">{searchTerm ? 'Tidak ada laporan yang sesuai dengan pencarian' : 'Belum ada laporan in progress'}</p>
                  </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3 sm:w-2/5">Report Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/3 sm:w-1/3">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Duration</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((r) => {
                    const report = r.forums || r;
                    return (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 truncate">{report.title || 'Untitled Report'}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{report.description || 'No description'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center"><MapPin className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" /><div className="text-sm text-gray-900 break-words">{report.address || 'Not specified'}</div></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(report.priority)}`}>{(report.priority || 'Medium').toString().replace(/\b\w/g, c => c.toUpperCase())}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200`}>Proses</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.incident_date || report.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDurationSince(report.in_progress_at || report.updated_at || report.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => window.open(`/forum/${report.id}`, '_blank')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                                                      <button onClick={() => openModal(report)} className="ml-1 p-2 text-[#DD761C] hover:bg-orange-50 rounded-lg transition-colors" title="Update Status + Komentar"><Edit3 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
                  </div>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-6 py-3 rounded-xl border border-gray-200">
              <div className="flex items-center text-sm text-gray-500">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page <= 1} className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-3 py-1 text-sm text-gray-700">Page {pagination.page} of {pagination.totalPages}</span>
                <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
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
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-8 h-8 text-[#DD761C]" />
              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Update Status Laporan</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                      <option value="resolved">Selesai</option>
                      <option value="closed">Dibatalkan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Komentar</label>
                    <textarea value={modalComment} onChange={(e) => setModalComment(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" rows={4} placeholder="Tulis komentar..." />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onClick={closeModal} disabled={submitting} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">Batal</button>
                    <button onClick={submitStatus} disabled={submitting || !modalComment.trim()} className="flex-1 px-6 py-3 bg-[#DD761C] text-white rounded-lg font-medium hover:bg-[#DD761C]/90 transition-colors duration-200 disabled:bg-gray-400">{submitting ? 'Menyimpan...' : 'Update Status'}</button>
                </div>
              </div>
            </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
