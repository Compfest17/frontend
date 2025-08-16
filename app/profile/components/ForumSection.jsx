'use client';
import { useState, useEffect } from 'react';
import ForumCard from '../../../components/formulir/ForumCard';
import ProfileData from '../../../data/profileData.json';


export default function ForumSection() {
  const [posts, setPosts] = useState(ProfileData.posts);
  const [filteredPosts, setFilteredPosts] = useState(ProfileData.posts);
  const [currentPage, setCurrentPage] = useState(1);
  
  const postsPerPage = 9;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  
  // Get current posts for the page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);


  return (
    <div className="container px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentPosts.map((post) => (
          <ForumCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada diskusi yang ditemukan.</p>
        </div>
      )}

    </div>
  );
}
