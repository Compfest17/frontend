'use client';
import { useState, useEffect } from 'react';
import ForumCard from '../../../components/formulir/ForumCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ForumSection({ posts = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const postsPerPage = 9;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  useEffect(() => {
    setCurrentPage(1);
  }, [posts]);


  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Postingan Saya</h2>
          <p className="text-gray-600">
            {posts.length > 0 ? `${posts.length} postingan ditemukan` : 'Belum ada postingan'}
          </p>
      </div>

        {currentPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentPosts.map((post) => (
                <ForumCard key={post.id} post={post} />
              ))}
            </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="w-full flex flex-col items-center justify-center text-center py-16 min-h-[400px]">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Belum ada postingan</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
              Mulai berbagi pengalaman dan cerita Anda dengan komunitas
            </p>
            <a
              href="/formulir"
              className="inline-flex items-center px-6 py-3 bg-[#DD761C] text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Buat Postingan Pertama
            </a>
          </div>
        )}
    </div>
  );
}
