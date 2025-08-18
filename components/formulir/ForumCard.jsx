'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';

export default function ForumCard({ post }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleCardClick = (e) => {
    // Prevent navigation when clicking on action buttons
    if (e.target.closest('.action-button')) return;
    router.push(`/forum/${post.id}`);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const handleCommentsClick = (e) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Rotating comments effect
  useEffect(() => {
    if (!post.commentsList || post.commentsList.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentCommentIndex((prev) => 
          (prev + 1) % post.commentsList.length
        );
        setIsVisible(true);
      }, 300); // Half of fade duration
    }, 3000); // Show each comment for 3 seconds

    return () => clearInterval(interval);
  }, [post.commentsList]);

  return (
    <>
      <article 
        onClick={handleCardClick}
        className="border-b border-gray-200 p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex gap-2 sm:gap-3">
          {/* Avatar */}
          <img 
            src="/image/forum/test/profil-test.jpg" 
            alt={post.author}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
          />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-1 sm:gap-2 mb-2">
              <span className="font-semibold text-gray-900 hover:underline cursor-pointer text-sm sm:text-base">
                {post.author}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm">@{post.author.toLowerCase().replace(/\s+/g, '')}</span>
              <span className="text-gray-500 text-xs sm:text-sm">·</span>
              <span className="text-gray-500 text-xs sm:text-sm">{post.date}</span>
            </div>
            
            {/* Status Badge */}
            <div className="mb-2">
              <StatusBadge status={post.status} />
            </div>
            
            {/* Post Content */}
            <div className="mb-3">
              <h3 className="text-gray-900 mb-2 leading-normal text-sm sm:text-base">
                {post.title}
              </h3>
              {post.content && (
                <p className="text-gray-700 leading-normal line-clamp-3 text-sm">
                  {post.content}
                </p>
              )}
            </div>
            
            {/* Image */}
            {post.image && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full max-h-60 sm:max-h-80 object-cover"
                />
              </div>
            )}
            
            {/* Location */}
            {post.location && (
              <div className="flex items-center gap-1 mb-3 text-gray-500 text-xs sm:text-sm">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{post.location}</span>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between max-w-sm">
              <button 
                onClick={handleCommentsClick}
                className="action-button flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-blue-500 transition-colors group"
              >
                <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm">{post.comments || 0}</span>
              </button>
              
              <button className="action-button flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-green-500 transition-colors group">
                <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-green-50 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </button>
              
              <button 
                onClick={handleLike}
                className={`action-button flex items-center gap-1 sm:gap-2 transition-colors group ${
                  liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm">{(post.likes || 0) + (liked ? 1 : 0)}</span>
              </button>
              
              <button className="action-button flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-blue-500 transition-colors group">
                <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
              </button>
              
              <button 
                onClick={handleBookmark}
                className={`action-button text-gray-500 hover:text-orange-500 transition-colors group ${
                  bookmarked ? 'text-orange-500' : ''
                }`}
              >
                <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-orange-50 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Rotating Comments Display */}
            {post.commentsList && post.commentsList.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="relative h-16 overflow-hidden">
                  <div 
                    className={`transition-opacity duration-300 ease-in-out ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="flex gap-2 items-start">
                      <img 
                        src="/image/forum/test/profil-test.jpg" 
                        alt="Commenter"
                        className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs text-gray-800">
                            {post.commentsList[currentCommentIndex]?.author}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {post.commentsList[currentCommentIndex]?.date}
                          </span>
                          {post.commentsList[currentCommentIndex]?.isFeatured && (
                            <span className="bg-orange-100 text-orange-600 text-xs px-1.5 py-0.5 rounded-full">
                              Unggulan
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                          {post.commentsList[currentCommentIndex]?.text}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-gray-400 text-xs">
                            {post.commentsList[currentCommentIndex]?.likes} suka
                          </span>
                          {post.commentsList[currentCommentIndex]?.replies > 0 && (
                            <span className="text-gray-400 text-xs">
                              {post.commentsList[currentCommentIndex]?.replies} balasan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Comments Popup */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">Komentar</h3>
              <button 
                onClick={() => setShowComments(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Comments List */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {post.commentsList && post.commentsList.length > 0 ? (
                <div className="space-y-4">
                  {post.commentsList.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      {/* Main Comment */}
                      <div className={`flex gap-3 p-3 rounded-lg ${comment.isFeatured ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                        <img 
                          src="/image/forum/test/profil-test.jpg" 
                          alt="Profile"
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{comment.author}</span>
                            <span className="text-gray-500 text-xs">{comment.date}</span>
                            {comment.isFeatured && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                Komentar Unggulan
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
                          
                          {/* Comment Actions */}
                          <div className="flex items-center gap-4 mt-2">
                            <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span className="text-xs">{comment.likes}</span>
                            </button>
                            
                            {comment.replies > 0 && (
                              <button 
                                onClick={() => toggleReplies(comment.id)}
                                className="text-blue-500 hover:text-blue-600 text-xs font-medium transition-colors"
                              >
                                {expandedReplies[comment.id] ? 'Sembunyikan' : 'Lihat'} {comment.replies} balasan
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Replies */}
                      {expandedReplies[comment.id] && comment.repliesList && (
                        <div className="ml-8 space-y-3">
                          {comment.repliesList.map((reply) => (
                            <div key={reply.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                              <img 
                                src="/image/forum/test/profil-test.jpg" 
                                alt="Profile"
                                className="w-6 h-6 rounded-full flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{reply.author}</span>
                                  <span className="text-gray-500 text-xs">{reply.date}</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{reply.text}</p>
                                
                                {/* Reply Actions */}
                                <div className="flex items-center gap-4 mt-2">
                                  <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span className="text-xs">{reply.likes}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada komentar</p>
                </div>
              )}
            </div>

            {/* Add Comment Section */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <img 
                  src="/image/forum/test/profil-test.jpg" 
                  alt="Your Profile"
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    placeholder="Tulis komentar..."
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors">
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}