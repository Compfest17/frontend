"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, ChevronLeft, ChevronRight, Eye, ClipboardList } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRealtimeForumStatus } from '@/hooks/useRealtimeReports';

export default function HistoryTab({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const { isConnected } = useRealtimeForumStatus({ 
    onStatusChange: (newReport, oldReport) => {
      console.log('HistoryTab - Status change detected:', { new: newReport, old: oldReport });
      if (newReport.status === 'resolved' || newReport.status === 'closed') {
        console.log('HistoryTab - Status changed to resolved/closed, refreshing...');
        fetchReports();
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
      params.append('reportStatus', 'resolved,closed');
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/employee/assigned-reports?${params}`, {
        headers: { 'Authorization': `Bearer ${currentUser.access_token}` }
      });
      if (response.ok) {
        const result = await response.json();
        console.log('HistoryTab - Fetched data:', result);
        setReports(result.data || []);
        const totalReports = result.pagination?.total || (result.data?.length || 0);
        const totalPages = result.pagination?.totalPages || Math.ceil(totalReports / pagination.limit);
        setPagination(prev => ({ ...prev, total: totalReports, totalPages }));
      }
    } catch (e) {
      console.error('Failed to fetch history reports:', e);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">History</h2>
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
          <p className="text-gray-500">{searchTerm ? 'Tidak ada laporan yang sesuai dengan pencarian' : 'Belum ada history laporan'}</p>
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
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 rounded-full text-xs font-medium border ${report.status === 'closed' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>{report.status === 'resolved' ? 'Selesai' : report.status === 'closed' ? 'Dibatalkan' : report.status}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.incident_date || report.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => window.open(`/forum/${report.id}`, '_blank')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details"><Eye className="w-4 h-4" /></button></td>
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
    </div>
  );
}
