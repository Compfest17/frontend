'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  CheckCircle, 
  MapPin, 
  Calendar,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HistoryTab({ user }) {
  const [completedReports, setCompletedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchCompletedReports();
  }, [user, dateFilter]);

  const fetchCompletedReports = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();
      
      const params = new URLSearchParams();
      params.append('reportStatus', 'resolved');
      if (dateFilter !== 'all') {
        params.append('dateFilter', dateFilter);
      }
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/employee/assigned-reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCompletedReports(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch completed reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = completedReports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.forums?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.forums?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.forums?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-[#DD761C]';
      case 'medium': return 'bg-orange-400';
      case 'low': return 'bg-orange-300';
      default: return 'bg-gray-500';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInDays = Math.floor((now - past) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hari ini';
    if (diffInDays === 1) return 'Kemarin';
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} minggu yang lalu`;
    return `${Math.floor(diffInDays / 30)} bulan yang lalu`;
  };

  const getResolutionTime = (assignedAt, resolvedAt) => {
    const assigned = new Date(assignedAt);
    const resolved = new Date(resolvedAt);
    const diffInHours = Math.floor((resolved - assigned) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Kurang dari 1 jam';
    if (diffInHours < 24) return `${diffInHours} jam`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">History Laporan</h2>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="quarter">3 Bulan Terakhir</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Tidak ada history</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Tidak ada history yang sesuai dengan pencarian' : 'Belum ada laporan yang diselesaikan'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`w-1 h-16 ${getPriorityColor(report.forums?.priority)} rounded-full`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {report.forums?.title}
                        </h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Resolved
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {report.forums?.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{report.forums?.address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Incident: {new Date(report.forums?.incident_date).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      Resolved {getTimeAgo(report.forums?.updated_at)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Resolution time: {getResolutionTime(report.assigned_at, report.forums?.updated_at)}
                    </p>
                  </div>
                  
                  <button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-[#DD761C] transition-colors">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">
                      Assignment: {report.assignment_type === 'auto' ? 'Auto-assigned' : 'Manual'}
                    </span>
                    <span className="text-gray-500">
                      Priority: <span className={`font-medium ${
                        report.forums?.priority === 'high' ? 'text-red-600' :
                        report.forums?.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>{report.forums?.priority}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Completed Successfully</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
