'use client';
import { useState } from 'react';
import ForumCard from '../../../../components/formulir/ForumCard';
import forumData from '../../../../data/forumData.json';

export default function BookmarksSection() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock bookmarked posts - in real app this would come from user's bookmarks
  const bookmarkedPosts = forumData.posts.slice(0, 5); // Taking first 5 posts as example

  // Filter posts by search term
  const filteredPosts = bookmarkedPosts.filter(
    post =>
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
                placeholder="Cari item tersimpan..."
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
      {filteredPosts.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {filteredPosts.map((post) => (
            <ForumCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada item tersimpan</h3>
            <p className="text-gray-500 mb-4">
              Simpan laporan atau komentar untuk melihatnya di sini nanti.
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Jelajahi Forum
            </button>
          </div>
        </div>
      )}

      {/* Load More - only show when there are bookmarks */}
      {filteredPosts.length > 0 && (
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Menampilkan {filteredPosts.length} item tersimpan
          </p>
        </div>
      )}
    </div>
  );
}
