'use client';
import { useState, useEffect } from 'react';
import forumData from '../../data/forumData.json';

export default function ForumHeader({ onSearch, onTabChange, onStatusFilter, activeTab }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tabs = ['Untuk Anda', ...(isMobile ? ['Trending'] : []), 'Status'];

  const statusOptions = ['Semua Status', 'Terbuka', 'Sedang di proses', 'Selesai', 'Batal'];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleTabClick = (tab) => {
    if (tab === 'Status') {
      setIsStatusDropdownOpen(!isStatusDropdownOpen);
    } else {
      setIsStatusDropdownOpen(false);
    }
    
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setIsStatusDropdownOpen(false);
    
    if (onStatusFilter) {
      onStatusFilter(status);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className={`sticky top-20 bg-white/80 backdrop-blur-md border-b border-gray-200 z-20 transition-transform duration-300 ease-in-out ${
      isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
    }`}>
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-gray-900">Forum Diskusi</h1>
        <button 
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      
      {isSearchOpen && (
        <div className="px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari diskusi, lokasi, atau #hashtag..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              autoFocus
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-b border-gray-200 relative">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <div key={tab} className="relative flex-shrink-0">
                <button
                  onClick={() => handleTabClick(tab)}
                  className={`px-4 sm:px-6 py-4 text-sm font-medium relative flex items-center justify-center gap-1 whitespace-nowrap ${
                    activeTab === tab 
                      ? 'text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'Status' ? selectedStatus : tab}
                  {tab === 'Status' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full"></div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {isStatusDropdownOpen && (
          <div className="absolute top-full right-4 bg-white border border-gray-200 rounded-lg shadow-2xl mt-2 z-[60] min-w-[200px]">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusSelect(status)}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  selectedStatus === status ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}