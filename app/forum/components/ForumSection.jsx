'use client';
import { useState, useEffect } from 'react';
import ForumCard from '../../../components/formulir/ForumCard';
import CarouselBanner from '../../../components/forum/CarouselBanner';
import ForumHeader from '../../../components/forum/ForumHeader';
import forumData from '../../../data/forumData.json';

export default function ForumSection() {
  const [posts] = useState(forumData.posts);
  const [filteredPosts, setFilteredPosts] = useState(forumData.posts);
  const [activeTab, setActiveTab] = useState('Untuk Anda');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get trending discussions directly from forumData.json
  // Sort by views (highest first) and take top 4 posts for trending
  const trendingDiscussions = [...forumData.posts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  // Apply filters whenever search query or status filter changes
  useEffect(() => {
    let filtered = posts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'Semua Status') {
      const statusMap = {
        'Sedang di proses': 'sedang_proses',
        'Selesai': 'selesai',
        'Batal': 'batal'
      };
      const filterStatus = statusMap[statusFilter];
      if (filterStatus) {
        filtered = filtered.filter(post => post.status === filterStatus);
      }
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, statusFilter]);

  // Search handler
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Status filter handler
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="w-full max-w-2xl mx-auto lg:border-x border-gray-200 min-h-screen bg-white">
      <CarouselBanner />
      <ForumHeader 
        onSearch={handleSearch} 
        onTabChange={handleTabChange}
        onStatusFilter={handleStatusFilter}
      />

      {/* Trending Content - Show as regular forum cards when Trending tab is active on mobile */}
      {activeTab === 'Trending' && isMobile ? (
        <div className="divide-y divide-gray-200">
          {trendingDiscussions.map((discussion) => (
            <ForumCard key={discussion.id} post={discussion} />
          ))}
          
          {/* Load More Button for Trending */}
          <div className="p-4 border-b border-gray-200 text-center">
            <button className="text-orange-500 text-sm font-medium py-2 hover:bg-orange-50 px-4 rounded-lg transition-colors">
              Tampilkan lebih banyak
            </button>
          </div>
        </div>
      ) : activeTab !== 'Trending' ? (
        <>
          {/* Regular Posts */}
          {filteredPosts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <ForumCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            /* No Data State */
            <div className="text-center py-16 border-b border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || statusFilter !== 'Semua Status' 
                    ? 'Tidak ada diskusi yang sesuai dengan filter yang dipilih.' 
                    : 'Belum ada diskusi yang tersedia.'
                  }
                </p>
                {(searchQuery || statusFilter !== 'Semua Status') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('Semua Status');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Load more indicator for infinite scroll - only show when there are posts */}
          {filteredPosts.length > 0 && (
            <div className="text-center py-8 border-b border-gray-200">
              <p className="text-gray-500 text-sm">
                Menampilkan {filteredPosts.length} dari {posts.length} diskusi
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}