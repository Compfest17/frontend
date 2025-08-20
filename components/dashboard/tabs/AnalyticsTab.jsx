'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/formulir/LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">Loading Map...</div>
});
import LoadingSpinner from '@/components/LoadingSpinner';
import { getCurrentUser } from '@/lib/supabase-auth';

export default function AnalyticsTab({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState({ markers: [], center: [-6.2088, 106.8456], coverage: null, boundaryGeoJSON: null });

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/employee/analytics`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);
        if (user.role === 'karyawan') {
          const provinceName = result.data.province || user.assigned_province;
          if (provinceName) {
            const coverage = buildCoverageFromUser(user);
            await updateMapForProvince(provinceName, coverage);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMapForProvince = async (province, coverage) => {
    try {
      if (!province) return;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const { user: currentUser } = await getCurrentUser();
      let boundaryGeoJSON = null;
      try {
        const boundaryRes = await fetch(`${API_BASE_URL}/api/geocoding/province-boundary?province=${encodeURIComponent(province)}`, {
          headers: { 'Authorization': `Bearer ${currentUser.access_token}` }
        });
        if (boundaryRes.ok) {
          const boundaryData = await boundaryRes.json();
          boundaryGeoJSON = boundaryData.data?.geojson || null;
        }
      } catch (e) {
        console.warn('Boundary fetch failed', e);
      }
      const response = await fetch(`${API_BASE_URL}/api/forums/by-province/${encodeURIComponent(province)}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });
      if (response.ok) {
        const reports = await response.json();
        let markers = (reports.data || []).map(report => ({
          lat: report.latitude,
          lng: report.longitude,
          status: report.status,
          popup: `
            <div class="p-2">
              <h4 class="font-bold text-sm">${report.title}</h4>
              <p class="text-xs text-gray-600">${report.address}</p>
              <span class="inline-block mt-1 px-2 py-1 text-xs rounded ${
                report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                report.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }">
                ${report.status}
              </span>
            </div>
          `
        }));
        if (coverage && coverage.lat && coverage.lng && coverage.radius) {
          const toRad = (v) => (v * Math.PI) / 180;
          const earthR = 6371000;
          markers = markers.filter(m => {
            const dLat = toRad(m.lat - coverage.lat);
            const dLng = toRad(m.lng - coverage.lng);
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(coverage.lat)) * Math.cos(toRad(m.lat)) * Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = earthR * c;
            return d <= coverage.radius;
          });
        }
        const center = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [-6.2088, 106.8456];
        setMapData({ markers, center, coverage, boundaryGeoJSON });
      }
    } catch (error) {
      console.error('Failed to fetch province reports:', error);
    }
  };

  const buildCoverageFromUser = (u) => {
    if (!u) return null;
    if (u.coverage_coordinates && u.coverage_coordinates.lat && u.coverage_coordinates.lng) {
      return {
        lat: u.coverage_coordinates.lat,
        lng: u.coverage_coordinates.lng,
        radius: u.coverage_coordinates.radius || 10000,
        color: '#DD761C',
        fillColor: '#DD761C',
        fillOpacity: 0.15
      };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Gagal memuat data analytics</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Assigned',
      value: analytics.totalAssigned || 0,
      icon: BarChart3,
      color: 'bg-[#DD761C]',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800'
    },
    {
      title: 'Completed',
      value: analytics.completed || 0,
      icon: CheckCircle,
      color: 'bg-[#DD761C]',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800'
    },
    {
      title: 'In Progress',
      value: analytics.inProgress || 0,
      icon: Clock,
      color: 'bg-[#DD761C]',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800'
    },
    {
      title: 'Pending',
      value: analytics.pending || 0,
      icon: AlertCircle,
      color: 'bg-[#DD761C]',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800'
    }
  ];

  return (
    <div className="space-y-6">
      {user.assigned_province && (
        <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <MapPin className="w-5 h-5 text-[#DD761C]" />
          <span className="font-medium text-gray-800">
            Coverage Area: {user.assigned_province}
            {user.assigned_city && ` - ${user.assigned_city}`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} rounded-xl p-6 border border-gray-100`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {user.role === 'karyawan' && analytics.province && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#DD761C]" />
            Area Coverage Map - {analytics.province}
          </h3>
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <LeafletMap
              center={mapData.center}
              zoom={8}
              markers={mapData.markers}
              coverage={mapData.coverage}
              boundaryGeoJSON={mapData.boundaryGeoJSON}
              height="100%"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Open Reports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Resolved</span>
            </div>
          </div>
        </motion.div>
      )}

      {analytics.byPriority && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <h4 className="font-bold text-red-800 mb-2">High Priority</h4>
            <p className="text-3xl font-bold text-red-600">{analytics.byPriority.high || 0}</p>
            <p className="text-sm text-red-600 mt-1">Urgent reports</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h4 className="font-bold text-yellow-800 mb-2">Medium Priority</h4>
            <p className="text-3xl font-bold text-yellow-600">{analytics.byPriority.medium || 0}</p>
            <p className="text-sm text-yellow-600 mt-1">Standard reports</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">Low Priority</h4>
            <p className="text-3xl font-bold text-blue-600">{analytics.byPriority.low || 0}</p>
            <p className="text-sm text-blue-600 mt-1">Minor issues</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
