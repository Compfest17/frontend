'use client';
import { useState } from 'react';
import ForumCard from '../../../components/formulir/ForumCard';
import CarouselBanner from '../../../components/forum/CarouselBanner';
import ForumHeader from '../../../components/forum/ForumHeader';
import forumData from '../../../data/forumData.json';

export default function ForumSection() {
  const [posts] = useState(forumData.posts);
  const [filteredPosts, setFilteredPosts] = useState(forumData.posts);
  const [activeTab, setActiveTab] = useState('Untuk Anda');

  // Search
  const handleSearch = (query) => {
    if (!query) {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(
        posts.filter(
          (post) =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.author.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="w-full max-w-2xl mx-auto lg:border-x border-gray-200 min-h-screen bg-white">
      <CarouselBanner />
      <ForumHeader onSearch={handleSearch} onTabChange={handleTabChange} />

      {/* Posts - Only show when not on Trending tab */}
      {activeTab !== 'Trending' && (
        <>
          {/* Posts - Twitter style single column feed */}
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <ForumCard key={post.id} post={post} />
            ))}
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12 border-b border-gray-200">
              <p className="text-gray-500">Tidak ada diskusi yang ditemukan.</p>
            </div>
          )}

          {/* Load more indicator for infinite scroll */}
          {filteredPosts.length > 0 && (
            <div className="text-center py-8 border-b border-gray-200">
              <p className="text-gray-500 text-sm">
                Terus gulir untuk melihat lebih banyak
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}