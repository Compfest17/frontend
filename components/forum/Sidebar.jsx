'use client';
import { useRouter } from 'next/navigation';

export default function Sidebar({ onNavigate }) {
  const router = useRouter();

  const menuItems = [
    { icon: 'home', label: 'Beranda', path: '/forum' },
    { icon: 'bell', label: 'Notifikasi', path: '/forum/notifications' },
    { icon: 'bookmark', label: 'Markah', path: '/forum/bookmarks' }
  ];

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.46 7.57L12.357 2.115a.643.643 0 00-.714 0L1.54 7.57a1.784 1.784 0 00-.818 1.329L.722 20.3c0 .896.732 1.628 1.628 1.628h4.9a1.628 1.628 0 001.628-1.628v-6.35h6.284v6.35a1.628 1.628 0 001.628 1.628h4.9c.896 0 1.628-.732 1.628-1.628V8.9a1.784 1.784 0 00-.818-1.329z"/>
        </svg>
      ),
      bell: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      bookmark: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
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

  return (
    <div className="w-64 p-4 space-y-6 sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto flex flex-col">
      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavigation(item.path)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-100 transition-colors text-left"
          >
            <div className="text-gray-700">
              {getIcon(item.icon)}
            </div>
            <span className="text-gray-900 font-medium text-xl">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Spacer to push button to bottom */}
      <div className="flex-grow"></div>

      {/* Posting Button - moved to bottom */}
      <button 
        onClick={() => handleNavigation('/formulir')}
        className="w-full bg-orange-500 text-white py-3 rounded-full font-semibold text-lg hover:bg-orange-600 transition-colors"
      >
        Tambah Formulir
      </button>
    </div>
  );
}