'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Calendar,
  Edit3,
  Eye,
  ArrowRight
} from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProgressTab({ user }) {
  const [inProgressReports, setInProgressReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInProgressReports();
  }, [user]);

  const fetchInProgressReports = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/employee/assigned-reports?reportStatus=in_progress`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setInProgressReports(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch in progress reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      const { user: currentUser } = await getCurrentUser();
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/forums/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchInProgressReports();
      }
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  };

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
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari yang lalu`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Progress Laporan</h2>
        <div className="text-sm text-gray-600">
          {inProgressReports.length} laporan sedang dikerjakan
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : inProgressReports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Tidak ada laporan in progress</h3>
          <p className="text-gray-500">Semua laporan sudah selesai atau belum ada yang dikerjakan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inProgressReports.map((report, index) => (
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
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-200">
                          In Progress
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
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Started: {getTimeAgo(report.assigned_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 lg:items-end">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-[#DD761C] border border-gray-300 rounded-lg hover:border-[#DD761C] transition-colors">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button className="flex items-center gap-1 px-3 py-2 text-sm text-[#DD761C] hover:text-white hover:bg-[#DD761C] border border-[#DD761C] rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                      Update Progress
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateReportStatus(report.forums?.id, 'resolved')}
                      className="flex items-center gap-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Assignment Type: {report.assignment_type}</span>
                  <span className="text-gray-500">
                    Priority: <span className={`font-medium ${
                      report.forums?.priority === 'high' ? 'text-red-600' :
                      report.forums?.priority === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>{report.forums?.priority}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
