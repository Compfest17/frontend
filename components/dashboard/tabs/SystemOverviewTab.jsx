'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Award,
  TrendingUp,
  Activity,
  BarChart3,
  Globe,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SystemOverviewTab({ user }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    assignedEmployees: 0,
    totalPosts: 0,
    activePosts: 0,
    totalComments: 0,
    totalPoints: 0,
    avgPoints: 0,
    usersWithPoints: 0,
    recentActivity: [],
    usersByRole: {},
    postsByStatus: {},
    postsByPriority: {},
    assignmentRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'karyawan') {
      fetchSystemStats();
    }
  }, [user]);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();
      
      console.log('🔍 Current user role:', user?.role);
      console.log('🔍 Current user data:', currentUser);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/dashboard/system-overview`, {
        headers: { 'Authorization': `Bearer ${currentUser.access_token}` }
      });

      console.log('🔍 API Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ API Response:', result);
        const data = result.data;
        
        setStats({
          totalUsers: data.users.total,
          totalEmployees: data.employees.total,
          activeEmployees: data.employees.active,
          assignedEmployees: data.employees.assigned,
          totalPosts: data.posts.total,
          activePosts: data.posts.byStatus.open + data.posts.byStatus.in_progress,
          totalComments: data.engagement.totalComments,
          totalPoints: data.engagement.totalPoints,
          avgPoints: data.engagement.avgPointsPerUser,
          usersWithPoints: data.engagement.usersWithPoints || 0,
          recentActivity: data.engagement.recentActivity,
          usersByRole: data.users.breakdown,
          postsByStatus: data.posts.byStatus,
          postsByPriority: data.posts.byPriority,
          assignmentRate: data.employees.assignmentRate
        });
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', response.status, errorData);
        console.error('❌ Error details:', errorData.message);
      }
    } catch (error) {
      console.error('❌ Failed to fetch system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'karyawan')) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <BarChart3 className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Akses Ditolak</h3>
        <p className="text-gray-600">Anda perlu hak akses admin atau karyawan untuk melihat overview sistem.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>
          <p className="text-gray-600 mt-1">Statistik keseluruhan sistem dalam 30 hari terakhir</p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          className="bg-orange-50 rounded-xl p-6 border border-orange-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Pengguna</p>
              <p className="text-3xl font-bold text-orange-800">{stats.totalUsers}</p>
              <p className="text-xs text-orange-600 mt-1">Semua role pengguna</p>
            </div>
            <Users className="w-8 h-8 text-[#DD761C]" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-orange-50 rounded-xl p-6 border border-orange-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Karyawan Aktif</p>
              <p className="text-3xl font-bold text-orange-800">{stats.activeEmployees}</p>
              <p className="text-xs text-orange-600 mt-1">dari {stats.totalEmployees} total</p>
            </div>
            <UserCheck className="w-8 h-8 text-[#DD761C]" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-orange-50 rounded-xl p-6 border border-orange-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Laporan Aktif</p>
              <p className="text-3xl font-bold text-orange-800">{stats.activePosts}</p>
              <p className="text-xs text-orange-600 mt-1">dari {stats.totalPosts} total</p>
            </div>
            <FileText className="w-8 h-8 text-[#DD761C]" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-orange-50 rounded-xl p-6 border border-orange-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Poin</p>
              <p className="text-3xl font-bold text-orange-800">{stats.totalPoints.toLocaleString()}</p>
              <p className="text-xs text-orange-600 mt-1">
                Rata-rata: {stats.avgPoints} dari {stats.usersWithPoints} user
              </p>
            </div>
            <Award className="w-8 h-8 text-[#DD761C]" />
          </div>
        </motion.div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pengguna per Role</h3>
          <div className="space-y-3">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{role}</span>
                <span className="font-semibold text-[#DD761C]">{count} pengguna</span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Laporan</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-red-600">Open</span>
              <span className="font-semibold text-red-600">{stats.postsByStatus.open || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-600">In Progress</span>
              <span className="font-semibold text-yellow-600">{stats.postsByStatus.in_progress || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-600">Resolved</span>
              <span className="font-semibold text-green-600">{stats.postsByStatus.resolved || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Assignment Rate */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tingkat Assignment Karyawan</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Karyawan Terassign</span>
              <span className="text-sm font-medium text-[#DD761C]">{stats.assignmentRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#DD761C] h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.assignmentRate}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {stats.assignedEmployees} dari {stats.totalEmployees}
            </p>
            <p className="text-xs text-gray-500">karyawan terassign</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#DD761C]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString('id-ID')} • Status: {activity.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Tidak ada aktivitas terbaru</p>
        )}
      </div>
    </div>
  );
}
