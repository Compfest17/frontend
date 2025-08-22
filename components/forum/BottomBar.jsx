'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { icon: 'home', label: 'Beranda', path: '/forum' },
    { icon: 'bell', label: 'Notifikasi', path: '/forum/notifications' },
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
    };
    return icons[iconName] || icons.home;
  };

  const isActive = (path) => {
    if (path === '/forum') {
      return pathname === '/forum';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex lg:hidden justify-around items-center h-16">
      {menuItems.map((item) => (
        <button
          key={item.label}
          onClick={() => router.push(item.path)}
          className="flex flex-col items-center justify-center flex-1 h-full"
        >
          {getIcon(item.icon, isActive(item.path))}
          <span className={`text-xs mt-1 ${isActive(item.path) ? 'text-orange-500 font-semibold' : 'text-gray-600'}`}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
