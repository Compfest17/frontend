'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/supabase-auth';

export default function Sidebar({ onNavigate }) {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUnreadCount(result.data.unread_count || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const menuItems = [
    { icon: 'home', label: 'Beranda', path: '/forum' },
    { icon: 'bell', label: 'Notifikasi', path: '/forum/notifications', badge: unreadCount },
    { icon: 'bookmark', label: 'Tersimpan', path: '/forum/bookmarks' }
  ];

  const getIcon = (iconName, isActive = false) => {
    const className = `w-6 h-6 ${isActive ? 'text-orange-500' : 'text-gray-600'}`;
    
    const icons = {
      home: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      bell: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      bookmark: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      user: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    };
    return icons[iconName] || icons.home;
  };

  const handleNavigation = (path) => {
    router.push(path);
    if (onNavigate) {
      onNavigate();
    }
  };

  const isActive = (path) => {
    if (path === '/forum') {
      return pathname === '/forum';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="w-64 p-4 space-y-6 sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto flex flex-col">
      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${
                active ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
              }`}
            >
              <div className="flex-shrink-0 relative">
                {getIcon(item.icon, active)}
                {/* Badge for notifications - only show if count > 0 */}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`font-medium text-lg ${active ? 'text-orange-600' : 'text-gray-700'}`}>
                {item.label}
              </span>
              {active && <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full"></div>}
            </button>
          );
        })}
      </nav>

      {/* Spacer to push button to bottom */}
      <div className="flex-grow"></div>

      {/* Create Report Button - reduced top margin */}
      <button
        onClick={() => handleNavigation('/formulir')}
        className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Buat Laporan
      </button>
    </div>
  );
}