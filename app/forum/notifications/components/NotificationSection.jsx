'use client';
import { useEffect, useState } from 'react';
import NotificationItem from '../../../../components/forum/NotificationItem';
import { getCurrentUser } from '@/lib/supabase-auth';
import { useRealtimeNotifications } from '@/hooks/useRealtimeReports';

export default function NotificationSection() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const { isConnected } = useRealtimeNotifications({
    userId: currentUser?.id,
    onNotification: (newNotification) => {
      console.log('New notification received in real-time:', newNotification);
      setNotifications(prev => [newNotification, ...prev]);
    }
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const { user } = await getCurrentUser();
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      
      setCurrentUser(user);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('🔍 Frontend - API response:', result);
      
      if (result.success) {
        console.log('🔍 Frontend - Setting notifications:', result.data);
        setNotifications(result.data || []);
        setError(null);
      } else {
        throw new Error(result.message || 'Gagal memuat notifikasi');
      }

    } catch (error) {
      console.error('Error loading notifications:', error);
      setError(error.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto lg:border-x border-gray-200 min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-20 bg-white/80 backdrop-blur-md border-b border-gray-200 z-20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Notifikasi</h1>
            {isConnected && (
              <span className="text-green-600 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Real-time active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Gagal memuat notifikasi
            </h3>
            <p className="text-gray-500 mb-4">
              {error}
            </p>
            <button 
              onClick={loadNotifications}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {!loading && !error && (
        <div className="divide-y divide-gray-200">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada notifikasi
                </h3>
                <p className="text-gray-500">
                  Semua notifikasi Anda akan muncul di sini.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Load More - only show when there are notifications */}
      {!loading && !error && notifications.length > 0 && (
        <div className="text-center py-8 border-t border-gray-200">
          <button 
            onClick={loadNotifications}
            className="text-orange-500 text-sm font-medium py-2 hover:bg-orange-50 px-4 rounded-lg transition-colors"
          >
            Refresh Notifikasi
          </button>
        </div>
      )}
    </div>
  );
}