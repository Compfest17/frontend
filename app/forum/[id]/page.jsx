'use client';
import { notFound, useRouter } from 'next/navigation';
import { use, useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, Bookmark } from 'lucide-react';
import StatusBadge from '../../../components/formulir/StatusBadge';
import MapComponent from '../../../components/formulir/MapComponent';
import CommentsSection from '../../../components/formulir/CommentsSection';
import { getCurrentUser } from '@/lib/supabase-auth';
import ForumAPI from '../../../services/forumAPI';
import StyleStatusBadge from '../../../components/forum/StyleStatusBadge';
import ForumCard from '../../../components/formulir/ForumCard';

export default function ForumPostPage({ params }) {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const resolvedParams = use(params);
  
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [voteBusy, setVoteBusy] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);
  const minSwipeDistance = 50;

  const [recommendations, setRecommendations] = useState([]);

  const reloadComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      const commentsRes = await ForumAPI.getComments(resolvedParams.id);
      if (commentsRes.success) setComments(commentsRes.data);
    } finally {
      setLoadingComments(false);
    }
  }, [resolvedParams.id]);

  const handleLike = async () => {
    if (voteBusy) return;
    try {
      setVoteBusy(true);
      const { user } = await getCurrentUser();
      if (!user) return;
      
      const token = user.access_token;
      if (disliked) {
        await ForumAPI.votePost(resolvedParams.id, 'remove_downvote', token);
      }
      const action = liked ? 'remove_upvote' : 'upvote';
      await ForumAPI.votePost(resolvedParams.id, action, token);
      
      setLiked(!liked);
      setDisliked(false);
      
      setPost(prev => ({
        ...prev,
        upvotes: prev.upvotes + (liked ? -1 : 1),
        downvotes: disliked ? prev.downvotes - 1 : prev.downvotes
      }));
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoteBusy(false);
    }
  };

  const handleDislike = async () => {
    if (voteBusy) return;
    try {
      setVoteBusy(true);
      const { user } = await getCurrentUser();
      if (!user) return;
      
      const token = user.access_token;
      if (liked) {
        await ForumAPI.votePost(resolvedParams.id, 'remove_upvote', token);
      }
      const action = disliked ? 'remove_downvote' : 'downvote';
      await ForumAPI.votePost(resolvedParams.id, action, token);
      
      setDisliked(!disliked);
      setLiked(false);
      
      setPost(prev => ({
        ...prev,
        downvotes: prev.downvotes + (disliked ? -1 : 1),
        upvotes: liked ? prev.upvotes - 1 : prev.upvotes
      }));
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoteBusy(false);
    }
  };

  const handleBookmark = async () => {
    if (bookmarkBusy) return;
    try {
      setBookmarkBusy(true);
      const { user } = await getCurrentUser();
      if (!user) return;
      
      const token = user.access_token;
      await ForumAPI.toggleBookmark(resolvedParams.id, token);
      setBookmarked(!bookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkBusy(false);
    }
  };

  useEffect(() => {
    const fetchForumPost = async () => {
      try {
        const { user } = await getCurrentUser();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        const response = await fetch(`${API_BASE_URL}/api/forums/${resolvedParams.id}`, {
          headers: user?.access_token ? {
            'Authorization': `Bearer ${user.access_token}`
          } : {}
        });

        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch forum post');
        }

        const result = await response.json();
        if (result.success) {
          setPost(result.data);
          await reloadComments();
          
          if (user?.access_token) {
            try {
              const bookmarkStatus = await ForumAPI.checkBookmarkStatus(resolvedParams.id, user.access_token);
              setBookmarked(bookmarkStatus);
            } catch (error) {
              console.error('Error checking bookmark status:', error);
            }
          }
        } else {
          notFound();
        }
      } catch (error) {
        console.error('Error fetching forum post:', error);
        notFound();
      }
    };

    fetchForumPost();
  }, [resolvedParams.id, reloadComments]);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!post) return;
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE_URL}/api/forums`);
        const data = await res.json();
        if (!data.success || !Array.isArray(data.data)) return;

        const keywords = [];
        if (post.title) keywords.push(...post.title.toLowerCase().split(/\s+/));
        if (post.description) keywords.push(...post.description.toLowerCase().split(/\s+/));
        if (Array.isArray(post.forum_tags)) {
          keywords.push(...post.forum_tags.map(tag => (tag.tags?.name || tag.name || tag).toLowerCase()));
        }

        const uniqueKeywords = Array.from(new Set(keywords)).filter(k => k.length > 3);

        const filtered = data.data
          .filter(p => p.id !== post.id)
          .map(p => {
            const text = [
              p.title,
              p.description,
              ...(Array.isArray(p.forum_tags) ? p.forum_tags.map(tag => tag.tags?.name || tag.name || tag) : [])
            ].join(' ').toLowerCase();
            const matchCount = uniqueKeywords.reduce((acc, kw) => text.includes(kw) ? acc + 1 : acc, 0);
            return { ...p, matchCount };
          })
          .filter(p => p.matchCount > 0)
          .sort((a, b) => b.matchCount - a.matchCount)
          .slice(0, 3);

        setRecommendations(filtered);
      } catch (err) {
        setRecommendations([]);
      }
    }
    fetchRecommendations();
  }, [post]);

  const images = post?.forum_media?.map(media => media.file_url) || 
                 post?.images || 
                 (post?.image ? [post.image] : []);

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
    return (
      <div className="flex items-center justify-center py-16 min-h-[60vh]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="text-gray-600">Memuat detail postingan...</span>
        </div>
      </div>
    );
  }

  const handleBackClick = () => {
    router.back();
  };

  

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.slice(0, maxLength) + '...';
  };

  console.log('🔍 Timeline Debug - Post data:', {
    status: post?.status,
    created_at: post?.created_at,
    in_progress_at: post?.in_progress_at,
    resolved_at: post?.resolved_at,
    closed_at: post?.closed_at
  });

  const statusHistory = [
    { status: 'new', label: 'Laporan Dibuat', date: post?.created_at?.slice(0,10) },
    { status: 'in_progress', label: 'Sedang Diproses', date: post?.in_progress_at ? post.in_progress_at.slice(0,10) : undefined },
    ...(post?.status === 'resolved' && post?.resolved_at ? [
      { status: 'resolved', label: 'Selesai', date: post.resolved_at.slice(0,10) }
    ] : []),
    ...(post?.status === 'closed' && post?.closed_at ? [
      { status: 'closed', label: 'Dibatalkan', date: post.closed_at.slice(0,10) }
    ] : []),
  ].filter(step => step.date);

  console.log('🔍 Timeline Debug - Final statusHistory:', statusHistory);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 sm:mb-6 text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            Kembali ke Forum
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post Image Carousel - Simple Version */}
              {images && images.length > 0 && (
                <div className="aspect-video relative mb-4 lg:mb-6 rounded-lg overflow-hidden group">
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
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 lg:mb-6">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {post.title}
                  </h1>
                  {/* Tanggal posting di bawah judul */}
                  <div className="mt-1 text-xs sm:text-sm text-gray-500">
                    Diposting pada {post.created_at ? new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  {/* View count indicator - match ForumCard.jsx logic */}
                  <div className="flex items-center gap-1 text-gray-600 text-sm mr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>
                      {post.views_count ?? post.views ?? 0}
                    </span>
                  </div>
                  <button 
                    onClick={handleLike}
                    disabled={voteBusy}
                    className={`flex items-center gap-2 transition-colors ${
                      liked 
                        ? 'text-green-600 hover:text-green-700' 
                        : 'text-gray-600 hover:text-green-500'
                    } ${voteBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ThumbsUp size={18} className="sm:w-5 sm:h-5" fill={liked ? "currentColor" : "none"} />
                    <span className="text-sm font-medium">{post.upvotes || post.likes || 0}</span>
                  </button>
                  <button 
                    onClick={handleDislike}
                    disabled={voteBusy}
                    className={`flex items-center gap-2 transition-colors ${
                      disliked 
                        ? 'text-red-600 hover:text-red-700' 
                        : 'text-gray-600 hover:text-red-500'
                    } ${voteBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ThumbsDown size={18} className="sm:w-5 sm:h-5" fill={disliked ? "currentColor" : "none"} />
                    <span className="text-sm font-medium">{post.downvotes || post.dislikes || 0}</span>
                  </button>
                  <button 
                    onClick={handleBookmark}
                    disabled={bookmarkBusy}
                    className={`flex items-center gap-2 transition-colors ${
                      bookmarked 
                        ? 'text-orange-600 hover:text-orange-700' 
                        : 'text-gray-600 hover:text-orange-500'
                    } ${bookmarkBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Bookmark size={18} className="sm:w-5 sm:h-5" fill={bookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4 lg:mb-6">
                <StatusBadge status={post.status} />
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <img 
                  src={post.is_anonymous ? "/image/forum/test/profil-test.jpg" : (post.users?.avatar_url || "/image/forum/test/profil-test.jpg")} 
                  alt="Profile"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {post.is_anonymous ? 'Anonymous' : (post.users?.full_name || post.author || 'Anonymous')}
                  </p>
                  {!post.is_anonymous && (
                    <p className="text-xs sm:text-sm text-gray-500">
                      @{post.users?.username || post.author?.toLowerCase().replace(/\s+/g, '') || 'anonymous'}
                    </p>
                  )}
                  
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 lg:mb-8">
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-900">{post.date}</span>
                    <span className="text-xs sm:text-sm text-gray-500">•</span>
                    <span className="text-xs sm:text-sm text-gray-500">{post.address || post.location}</span>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-2 text-sm sm:text-base">
                    {isExpanded ? (post.description || post.content) : truncateText(post.description || post.content)}
                  </p>
                  
                  {(post.description || post.content) && (post.description || post.content).length > 150 && (
                    <button 
                      onClick={toggleExpanded}
                      className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                      {isExpanded ? 'Lihat lebih sedikit' : 'Lihat selengkapnya'}
                    </button>
                  )}
                </div>
              </div>

              {/* Map - Mobile Layout (below description) */}
              <div className="lg:hidden mb-6 lg:mb-8">
                <MapComponent 
                  location={post?.location} 
                  address={post?.address}
                  latitude={post?.latitude}
                  longitude={post?.longitude}
                />
                {/* Status History Stepper */}
                <div className="mt-6">
                  <StyleStatusBadge history={statusHistory} />
                </div>
              </div>

              {/* Comments Section */}
              <CommentsSection 
                comments={comments} 
                commentCount={comments.length}
                forumId={resolvedParams.id}
                onAfterSubmit={reloadComments}
              />
              {/* Rekomendasi Section */}
              <div className="mt-10">
                <h2 className="text-lg font-bold mb-4 text-gray-900">Rekomendasi untuk anda</h2>
                <div className="grid grid-cols-1 gap-8 w-full">
                  {recommendations.length === 0 ? (
                    <div className="text-gray-500 col-span-3 text-center">Tidak ada rekomendasi relevan ditemukan.</div>
                  ) : (
                    recommendations.map((rec, idx) => (
                      <ForumCard key={rec.id} post={rec} rank={undefined} />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Map - Desktop Layout */}
            <div className="hidden lg:block lg:col-span-1">
              <MapComponent 
                location={post?.location} 
                address={post?.address}
                latitude={post?.latitude}
                longitude={post?.longitude}
              />
              {/* Status History Stepper */}
              <div className="mt-6">
                <StyleStatusBadge history={statusHistory} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}