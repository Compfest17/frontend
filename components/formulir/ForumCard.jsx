'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import StatusBadge from './StatusBadge';

export default function ForumCard({ post }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Touch/Swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);

  // Get images array, fallback to single image or default
  const images = post.images || (post.image ? [post.image] : ['/image/forum/test/article-test.jpg']);

  // Minimum swipe distance to trigger image change
  const minSwipeDistance = 50;

  const handleCardClick = (e) => {
    // Prevent navigation when clicking on action buttons or carousel controls
    if (e.target.closest('.action-button') || e.target.closest('.carousel-control')) return;
    router.push(`/forum/${post.id}`);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (disliked) setDisliked(false); // Remove dislike if liked
    setLiked(!liked);
  };

  const handleDislike = (e) => {
    e.stopPropagation();
    if (liked) setLiked(false); // Remove like if disliked
    setDisliked(!disliked);
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

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleDotClick = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Touch handlers for swipe functionality
  const onTouchStart = (e) => {
    e.stopPropagation();
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    e.stopPropagation();
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e) => {
    e.stopPropagation();
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      // Swipe left - next image
      setCurrentImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
    
    if (isRightSwipe && images.length > 1) {
      // Swipe right - previous image
      setCurrentImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
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
            
            {/* Image Carousel - Simple Version */}
            {images && images.length > 0 && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200 relative group">
                {/* Main Image with Touch Support */}
                <div 
                  ref={carouselRef}
                  className="relative select-none"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <img 
                    src={images[currentImageIndex]} 
                    alt={`${post.title} - Image ${currentImageIndex + 1}`}
                    className="w-full max-h-60 sm:max-h-80 object-cover pointer-events-none"
                    draggable={false}
                  />
                  
                  {/* Navigation Arrows - only show on desktop if more than 1 image */}
                  {images.length > 1 && (
                    <>
                      {/* Previous Button - Hidden on mobile, shown on hover for desktop */}
                      <button
                        onClick={handlePrevImage}
                        className="carousel-control absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 hidden sm:block"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {/* Next Button - Hidden on mobile, shown on hover for desktop */}
                      <button
                        onClick={handleNextImage}
                        className="carousel-control absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 hidden sm:block"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {currentImageIndex + 1}/{images.length}
                      </div>

                      {/* Swipe Hint for Mobile */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none sm:hidden">
                        <div className="bg-black/30 text-white text-xs px-3 py-1 rounded-full opacity-50 animate-pulse">
                          Geser untuk melihat foto lain
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Dots Indicator - always visible if more than 1 image */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleDotClick(index, e)}
                        className={`carousel-control w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'bg-white' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}
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
            
            {/* Actions - Comment, Views, Thumbs Up/Down, Save */}
            <div className="flex items-center justify-between max-w-sm">
              {/* Comment Button */}
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
              
              {/* Views Button */}
              <button className="action-button flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-purple-500 transition-colors group">
                <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-purple-50 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm">{post.views || 0}</span>
              </button>
              
              {/* Thumbs Up Button */}
              <button 
                onClick={handleLike}
                className={`action-button flex items-center gap-1 sm:gap-2 transition-colors group ${
                  liked ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
                }`}
              >
                <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-green-50 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm">{(post.likes || 0) + (liked ? 1 : 0)}</span>
              </button>
              
              {/* Thumbs Down Button */}
              <button 
                onClick={handleDislike}
                className={`action-button flex items-center gap-1 sm:gap-2 transition-colors group ${
                  disliked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={disliked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm">{(post.dislikes || 0) + (disliked ? 1 : 0)}</span>
              </button>
              
              {/* Save/Bookmark Button */}
              <button 
                onClick={handleBookmark}
                className={`action-button transition-colors group ${
                  bookmarked ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'
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