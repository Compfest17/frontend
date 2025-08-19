'use client';
import { notFound, useRouter } from 'next/navigation';
import { use, useEffect, useState, useRef } from 'react';
import { ArrowLeft, Heart, ThumbsDown, Bookmark } from 'lucide-react';
import forumData from '../../../data/forumData.json';
import StatusBadge from '../../../components/formulir/StatusBadge';
import MapComponent from '../../../components/formulir/MapComponent';
import CommentsSection from '../../../components/formulir/CommentsSection';

export default function ForumPostPage({ params }) {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const resolvedParams = use(params);
  
  // Touch/Swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const foundPost = forumData.posts.find(p => p.id === parseInt(resolvedParams.id));
    if (!foundPost) {
      notFound();
    }
    setPost(foundPost);
  }, [resolvedParams.id]);

  // Get images array
  const images = post?.images || (post?.image ? [post.image] : []);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
  };

  // Touch handlers for swipe functionality
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      handleNextImage();
    }
    
    if (isRightSwipe && images.length > 1) {
      handlePrevImage();
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  const handleBackClick = () => {
    router.back();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft size={20} />
            Kembali ke Forum
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Post Image Carousel - Simple Version */}
              {images && images.length > 0 && (
                <div className="aspect-video relative mb-6 rounded-lg overflow-hidden group">
                  <div
                    ref={carouselRef}
                    className="relative h-full select-none"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    <img 
                      src={images[currentImageIndex]} 
                      alt={`${post.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                      draggable={false}
                    />
                    
                    {/* Navigation for multiple images - Desktop only */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        
                        <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                          {currentImageIndex + 1}/{images.length}
                        </div>
                        
                        {/* Mobile Swipe Hint */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none sm:hidden">
                          <div className="bg-black/30 text-white text-sm px-4 py-2 rounded-full opacity-50 animate-pulse">
                            Geser untuk melihat foto lain
                          </div>
                        </div>
                        
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => handleDotClick(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                index === currentImageIndex 
                                  ? 'bg-white' 
                                  : 'bg-white/50 hover:bg-white/75'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Post Title and Actions */}
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 flex-1 mr-4">
                  {post.title}
                </h1>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                    <Heart size={20} />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <ThumbsDown size={20} />
                    <span className="text-sm font-medium">{post.dislikes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                    <Bookmark size={20} />
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <StatusBadge status={post.status} />
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="/image/forum/test/profil-test.jpg" 
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{post.author}</p>
                  <p className="text-sm text-gray-500">{post.authorRole}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">{post.date}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{post.location}</span>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-2">
                    {isExpanded ? post.content : truncateText(post.content)}
                  </p>
                  
                  {post.content && post.content.length > 150 && (
                    <button 
                      onClick={toggleExpanded}
                      className="text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                      {isExpanded ? '...selengkapnya' : 'Lihat selengkapnya'}
                    </button>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <CommentsSection 
                comments={post.commentsList} 
                commentCount={post.comments}
              />
            </div>

            {/* Sidebar - Map */}
            <div className="lg:col-span-1">
              <MapComponent location={post.location} address={post.address} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}