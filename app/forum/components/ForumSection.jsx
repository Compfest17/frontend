'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ForumCard from '../../../components/formulir/ForumCard';
import CarouselBanner from '../../../components/forum/CarouselBanner';
import ForumHeader from '../../../components/forum/ForumHeader';
import ForumAPI from '../../../services/forumAPI';

export default function ForumSection({ onPostsLoaded }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]); 
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Untuk Anda');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(false); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    console.log('URL tab parameter:', urlTab);
    
    if (urlTab) {
      const tabName = urlTab.charAt(0).toUpperCase() + urlTab.slice(1);
      console.log('Setting active tab to:', tabName);
      setActiveTab(tabName);
      
      if (tabName === 'Trending') {
        fetchTrendingPosts();
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchTrendingPosts = async (limit = 20) => {
    try {
      setTrendingLoading(true);
      console.log('🔥 Fetching trending posts...');
      
      const response = await ForumAPI.getTrending(Math.max(limit, 10));
      
      if (response.success) {
        setTrendingPosts(response.data);
        console.log(`📊 Got ${response.data.length} trending posts`);
        
        if (onPostsLoaded && response.data.length > 0) {
          onPostsLoaded(response.data.slice(0, 10));
        }
      } else {
        console.warn('Failed to fetch trending posts:', response.error);
        setTrendingPosts([]);
      }
    } catch (err) {
      console.error('Error fetching trending posts:', err);
      setTrendingPosts([]);
    } finally {
      setTrendingLoading(false);
    }
  };

  useEffect(() => {
    const fetchForums = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ForumAPI.getForums({
          page: 1,
          limit: 50, 
        });

        if (response.success) {
          setPosts(response.data);
          setFilteredPosts(response.data);
          if (onPostsLoaded) {
            onPostsLoaded(response.data);
          }
        } else {
          setError('Failed to load forum posts');
        }
      } catch (err) {
        console.error('Error fetching forums:', err);
        setError('Failed to load forum posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchForums();
    
    fetchTrendingPosts();
  }, []);

  const trendingDiscussions = posts.length > 0 
    ? [...posts]
        .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
        .slice(0, 4)
    : [];

  useEffect(() => {
    let filtered = posts;

    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.users?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.forum_tags?.some(tag => 
            tag.tags?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tag.tags?.slug?.toLowerCase().includes(searchQuery.toLowerCase())
          ) || false)
      );
    }

    if (statusFilter !== 'Semua Status') {
      const statusMap = {
        'Terbuka': 'open',
        'Sedang di proses': 'in_progress',
        'Selesai': 'resolved', 
        'Batal': 'closed'
      };
      const filterStatus = statusMap[statusFilter];
      if (filterStatus) {
        filtered = filtered.filter(post => post.status === filterStatus);
      }
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, statusFilter]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleTabChange = (tabName) => {
    console.log('Changing tab to:', tabName);
    setActiveTab(tabName);
    
    const newUrl = `/forum?tab=${tabName.toLowerCase()}`;
    router.push(newUrl);
    
    if (tabName === 'Trending') {
      fetchTrendingPosts();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto lg:border-x border-gray-200 min-h-screen bg-white">
      <CarouselBanner />
      <ForumHeader 
        onSearch={handleSearch} 
        onTabChange={handleTabChange}
        onStatusFilter={handleStatusFilter}
        activeTab={activeTab}
      />

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span className="text-gray-600">Memuat diskusi...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-16 border-b border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal memuat diskusi</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Muat Ulang
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {activeTab === 'Trending' ? (
            <>
              {trendingLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    <span className="text-gray-600">Memuat trending...</span>
                  </div>
                </div>
              )}

              {!trendingLoading && trendingPosts.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-200">
                    {trendingPosts.map((post, index) => (
                      <ForumCard key={post.id} post={post} rank={index + 1} />
                    ))}
                  </div>
                  
                  <div className="p-4 border-b border-gray-200 text-center">
                    <button 
                      onClick={() => fetchTrendingPosts(trendingPosts.length + 10)}
                      className="text-orange-500 text-sm font-medium py-2 hover:bg-orange-50 px-4 rounded-lg transition-colors"
                      disabled={trendingLoading}
                    >
                      {trendingLoading ? 'Loading...' : 'Tampilkan lebih banyak'}
                    </button>
                  </div>
                </>
              ) : !trendingLoading && (
                <div className="text-center py-8 border-b border-gray-200">
                  <p className="text-gray-500">
                    Belum ada diskusi trending tersedia
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {filteredPosts.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <ForumCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
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

              {filteredPosts.length > 0 && (
                <div className="text-center py-8 border-b border-gray-200">
                  <p className="text-gray-500 text-sm">
                    Menampilkan {filteredPosts.length} dari {posts.length} diskusi
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}