'use client';
import { useState, useEffect } from 'react';
import SearchBar from '../../../components/formulir/SearchBar';
import ForumCard from '../../../components/formulir/ForumCard';
import Pagination from '../../../components/formulir/Pagination';
import forumData from '../../../data/forumData.json';

export default function ForumSection() {
  const [posts, setPosts] = useState(forumData.posts);
  const [filteredPosts, setFilteredPosts] = useState(forumData.posts);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const postsPerPage = 9;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  
  // Get current posts for the page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(term.toLowerCase()) ||
      post.author.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <SearchBar onSearch={handleSearch} />
      
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

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
