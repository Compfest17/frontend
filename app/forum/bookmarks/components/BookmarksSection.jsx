'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ForumCard from '../../../../components/formulir/ForumCard';
import ForumAPI from '../../../../services/forumAPI';
import { getCurrentUser } from '../../../../lib/supabase-auth';

export default function BookmarksSection() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      return currentUser?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await getAuthToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await ForumAPI.getUserBookmarks(token);
        
        if (response.success) {
          const transformedBookmarks = response.data.map(bookmark => ({
            ...bookmark.forums,
            bookmark_id: bookmark.id,
            bookmarked_at: bookmark.created_at,
            isBookmarked: true
          }));
          setBookmarks(transformedBookmarks);
        } else {
          setError('Failed to load bookmarks');
        }
      } catch (err) {
        console.error('Error loading bookmarks:', err);
        setError('Failed to load bookmarks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  const filteredPosts = bookmarks.filter(
    post =>
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.forum_tags?.some(tag => 
        tag.tags?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.tags?.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      ) || false)
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleExplore = () => {
    router.push('/forum');
  };

  return (
    <div className="w-full max-w-2xl mx-auto lg:border-x border-gray-200 min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-20 bg-white/80 backdrop-blur-md border-b border-gray-200 z-20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Tersimpan</h1>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        {/* Search Bar */}
        {isSearchOpen && (
          <div className="px-4 pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari item tersimpan, lokasi, atau #hashtag..."
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
      </div>

      {/* Bookmarked Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span className="text-gray-600">Memuat bookmarks...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal memuat bookmarks</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Coba Lagi
            </button>
          </div>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {filteredPosts.map((post) => (
            <ForumCard key={post.id} post={post} />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        /* Empty State - No bookmarks at all */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada item tersimpan</h3>
            <p className="text-gray-500 mb-4">
              Simpan laporan atau diskusi dengan mengklik ikon bookmark untuk melihatnya di sini.
            </p>
            <button 
              onClick={handleExplore}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Jelajahi Forum
            </button>
          </div>
        </div>
      ) : (
        /* Empty State - No search results */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada hasil</h3>
            <p className="text-gray-500 mb-4">
              Tidak ditemukan bookmark yang sesuai dengan pencarian "{searchTerm}".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setIsSearchOpen(false);
              }}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Pencarian
            </button>
          </div>
        </div>
      )}

      {/* Load More - only show when there are bookmarks */}
      {!loading && !error && filteredPosts.length > 0 && (
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Menampilkan {filteredPosts.length} dari {bookmarks.length} item tersimpan
          </p>
        </div>
      )}
    </div>
  );
}
