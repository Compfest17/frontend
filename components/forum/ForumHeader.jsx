'use client';
import { useState, useEffect } from 'react';
import forumData from '../../data/forumData.json';

export default function ForumHeader({ onSearch, onTabChange }) {
  const [activeTab, setActiveTab] = useState('Untuk Anda');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile/tablet on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dynamic tabs based on screen size
  const tabs = isMobile 
    ? ['Untuk Anda', 'Mengikuti', 'Status', 'Trending']
    : ['Untuk Anda', 'Mengikuti', 'Status'];

  const statusOptions = ['Semua Status', 'Sedang di proses', 'Selesai', 'Batal'];

  // Get trending discussions from forumData.json
  const trendingDiscussions = forumData.posts.slice(0, 4).map(post => ({
    author: post.author,
    username: `@${post.author.toLowerCase().replace(/\s+/g, '')}`,
    date: post.date,
    title: post.title,
    content: post.content,
    comments: post.comments,
    likes: post.likes
  }));

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'Status') {
      setIsStatusDropdownOpen(!isStatusDropdownOpen);
    } else {
      setIsStatusDropdownOpen(false);
    }
    
    // Notify parent component about tab change
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setIsStatusDropdownOpen(false);
  };

  // Scroll detection
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
      
      {/* Search Bar */}
      {isSearchOpen && (
        <div className="px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari diskusi..."
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
      
      {/* Scrollable Tabs Container */}
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
        
        {/* Status Dropdown */}
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

      {/* Trending Content - Only show on mobile/tablet when Trending tab is active */}
      {activeTab === 'Trending' && isMobile && (
        <div className="bg-white border-b border-gray-200">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4">Sedang hangat dibicarakan</h3>
            <div className="space-y-4">
              {trendingDiscussions.map((discussion, index) => (
                <div key={index} className="hover:bg-gray-50 p-3 rounded-lg cursor-pointer -mx-1 transition-colors">
                  {/* Author Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src="/image/forum/test/profil-test.jpg" 
                      alt={discussion.author}
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <span className="font-semibold text-gray-900">{discussion.author}</span>
                      <span>{discussion.username}</span>
                      <span>·</span>
                      <span>{discussion.date}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="mb-2">
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">{discussion.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {discussion.content}
                    </p>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{discussion.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{discussion.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-orange-500 text-sm mt-3 hover:underline">
              Tampilkan lebih banyak
            </button>
          </div>
        </div>
      )}
    </div>
  );
}