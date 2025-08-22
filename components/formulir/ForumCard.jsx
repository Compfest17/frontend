'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import StatusBadge from './StatusBadge';
import ForumAPI from '../../services/forumAPI';
import { getCurrentUser } from '../../lib/supabase-auth';
import MentionAutocomplete from '../forum/MentionAutocomplete';
import RoleBadge from '../forum/RoleBadge';
import UserLevelBadge from '../forum/UserLevelBadge';

export default function ForumCard({ post, rank }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);
  const [showComments, setShowComments] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes || 0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const [likedMap, setLikedMap] = useState({});
  const [dislikedMap, setDislikedMap] = useState({});
  const [voteBusyMap, setVoteBusyMap] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);

  const images = post.forum_media?.map(media => media.file_url) || 
                 post.images || 
                 (post.image ? [post.image] : []);

  const hasImages = images.length > 0;

  const minSwipeDistance = 50;

  useEffect(() => {
    const checkUserBookmarkStatus = async () => {
      if (post.isBookmarked === undefined) {
        try {
          const token = await getAuthToken();
          if (token && post.id) {
            const isBookmarked = await ForumAPI.checkBookmarkStatus(post.id, token);
            setBookmarked(isBookmarked);
          }
        } catch (error) {
          console.error('Error checking bookmark status:', error);
        }
      }
    };

    checkUserBookmarkStatus();
  }, [post.id, post.isBookmarked]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const { user: cu } = await getCurrentUser();
        if (!cu) {
          setCurrentUser(null);
          return;
        }
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${cu.access_token}` }
          });
          if (res.ok) {
            const profile = await res.json();
            const merged = { ...cu, ...profile.data.user };
            setCurrentUser(merged);
          } else {
            setCurrentUser(cu);
          }
        } catch (_) {
          setCurrentUser(cu);
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    loadCurrentUser();
  }, []);

  const getAuthToken = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      return currentUser?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.action-button') || e.target.closest('.carousel-control')) return;
    router.push(`/forum/${post.id}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    
    const token = await getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      if (disliked) {
        const removeDown = await ForumAPI.votePost(post.id, 'remove_downvote', token);
        if (!(removeDown && removeDown.success)) return;
      }

      const action = liked ? 'remove_upvote' : 'upvote';
      const response = await ForumAPI.votePost(post.id, action, token);
      
      if (response.success) {
        setUpvotes(response.data.upvotes);
        setDownvotes(response.data.downvotes);
        setLiked(!liked);
        setDisliked(false);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleDislike = async (e) => {
    e.stopPropagation();
    
    const token = await getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      if (liked) {
        const removeUp = await ForumAPI.votePost(post.id, 'remove_upvote', token);
        if (!(removeUp && removeUp.success)) return;
      }

      const action = disliked ? 'remove_downvote' : 'downvote';
      const response = await ForumAPI.votePost(post.id, action, token);
      
      if (response.success) {
        setUpvotes(response.data.upvotes);
        setDownvotes(response.data.downvotes);
        setDisliked(!disliked);
        setLiked(false);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    
    const token = await getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await ForumAPI.toggleBookmark(post.id, token);
      if (response.success) {
        setBookmarked(response.bookmarked);
        console.log(response.bookmarked ? 'Bookmark added!' : 'Bookmark removed!');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleCommentsClick = async (e) => {
    e.stopPropagation();
    setShowComments(!showComments);
    
    if (!showComments && comments.length === 0) {
      await loadComments();
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const response = await ForumAPI.getComments(post.id);
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    const token = await getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await ForumAPI.createComment(post.id, {
        content: newComment.trim()
      }, token);
      
      if (response.success) {
        setNewComment('');
        await loadComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const updateCommentTreeCounts = (commentList, targetId, newUpvotes, newDownvotes) => {
    return commentList.map((c) => {
      if (c.id === targetId) {
        return { ...c, upvotes: newUpvotes, downvotes: newDownvotes };
      }
      if (Array.isArray(c.replies) && c.replies.length > 0) {
        return { ...c, replies: updateCommentTreeCounts(c.replies, targetId, newUpvotes, newDownvotes) };
      }
      return c;
    });
  };

  const toggleLikeComment = async (commentId) => {
    if (voteBusyMap[commentId]) return;
    try {
      setVoteBusyMap(prev => ({ ...prev, [commentId]: true }));
      const token = await getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }
      if (dislikedMap[commentId]) {
        await ForumAPI.voteComment(commentId, 'remove_downvote', token);
      }
      const action = likedMap[commentId] ? 'remove_upvote' : 'upvote';
      const res = await ForumAPI.voteComment(commentId, action, token);
      setLikedMap(prev => ({ ...prev, [commentId]: !prev[commentId] }));
      setDislikedMap(prev => ({ ...prev, [commentId]: false }));
      if (res && res.success && res.data) {
        setComments(prev => updateCommentTreeCounts(prev, commentId, res.data.upvotes, res.data.downvotes));
      }
    } catch (_) {
    } finally {
      setVoteBusyMap(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const toggleDislikeComment = async (commentId) => {
    if (voteBusyMap[commentId]) return;
    try {
      setVoteBusyMap(prev => ({ ...prev, [commentId]: true }));
      const token = await getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }
      if (likedMap[commentId]) {
        await ForumAPI.voteComment(commentId, 'remove_upvote', token);
      }
      const action = dislikedMap[commentId] ? 'remove_downvote' : 'downvote';
      const res = await ForumAPI.voteComment(commentId, action, token);
      setDislikedMap(prev => ({ ...prev, [commentId]: !prev[commentId] }));
      setLikedMap(prev => ({ ...prev, [commentId]: false }));
      if (res && res.success && res.data) {
        setComments(prev => updateCommentTreeCounts(prev, commentId, res.data.upvotes, res.data.downvotes));
      }
    } catch (_) {
    } finally {
      setVoteBusyMap(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleReplyClick = (comment) => {
    setReplyingTo(comment);
    setReplyText('');
  };

  const handleReplyCancel = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingTo) return;
    
    const token = await getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setSubmittingReply(true);
    try {
      const response = await ForumAPI.createComment(post.id, {
        content: replyText.trim(),
        parent_id: replyingTo.id
      }, token);
      
      if (response.success) {
        setReplyText('');
        setReplyingTo(null);
        await loadComments();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmittingReply(false);
    }
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
      setCurrentImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
    
    if (isRightSwipe && images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  return (
    <>
      <article 
        onClick={handleCardClick}
        className="border-b border-gray-200 p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer relative"
      >
        {typeof rank === 'number' && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.414 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">#{rank}</span>
          </div>
        )}
        <div className="flex gap-2 sm:gap-3">
          <img 
            src={post.is_anonymous ? "/image/forum/test/profil-test.jpg" : (post.users?.avatar_url || "/image/forum/test/profil-test.jpg")} 
            alt={post.is_anonymous ? 'Anonymous User' : (post.users?.full_name || post.author || 'User')}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 object-cover"
          />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-1 sm:gap-2 mb-2">
              <span className="font-semibold text-gray-900 hover:underline cursor-pointer text-sm sm:text-base">
                {post.is_anonymous ? 'Anonymous' : (post.users?.full_name || post.author || 'Anonymous')}
              </span>
              {!post.is_anonymous && post.users?.levels?.name && (
                <UserLevelBadge levelName={post.users.levels.name} />
              )}
              {!post.is_anonymous && (post.users?.username || post.author) && (
                <span className="text-gray-500 text-xs sm:text-sm">
                  @{post.users?.username || post.author?.toLowerCase().replace(/\s+/g, '') || 'anonymous'}
                </span>
              )}
              <span className="text-gray-500 text-xs sm:text-sm">·</span>
              <span className="text-gray-500 text-xs sm:text-sm">{post.date || new Date(post.created_at).toLocaleDateString('id-ID')}</span>
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
              {(post.description || post.content) && (
                <p className="text-gray-700 leading-normal line-clamp-3 text-sm">
                  {post.description || post.content}
                </p>
              )}
            </div>

            {/* Tags */}
            {post.forum_tags && post.forum_tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.forum_tags.map((tagItem, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    #{tagItem.tags?.name || tagItem.name || tagItem}
                  </span>
                ))}
              </div>
            )}
            
            {/* Image Carousel - Simple Version */}
            {hasImages && (
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
                    className="w-full h-48 object-cover pointer-events-none"
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
            {(post.address || post.location) && (
              <div className="flex items-center gap-1 mb-3 text-gray-500 text-xs sm:text-sm">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="truncate">{post.address || post.location}</span>
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
                <span className="text-xs sm:text-sm">{post.views_count || post.views || 0}</span>
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
                <span className="text-xs sm:text-sm">{upvotes}</span>
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
                <span className="text-xs sm:text-sm">{downvotes}</span>
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

            {/* Rotating Comments Display - Removed as we now have real comments modal */}
          </div>
        </div>
      </article>

      {/* Comments Popup */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
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
            <div className="p-4 overflow-y-auto max-h-[60vh] flex-1">
              {loadingComments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      {/* Main Comment */}
                      <div className="flex gap-3 p-3 rounded-lg bg-gray-50">
                        <img 
                          src={comment.users?.avatar_url || "/image/forum/test/profil-test.jpg"} 
                          alt="Profile"
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {comment.users?.full_name || 'Anonymous'}
                            </span>
                            <RoleBadge role={comment.users?.roles?.name} />
                            <span className="text-gray-500 text-xs">
                              {new Date(comment.created_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                          
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <button 
                                className={`p-1 rounded ${likedMap[comment.id] ? 'text-green-600 bg-green-50' : 'hover:bg-gray-100'}`} 
                                onClick={() => toggleLikeComment(comment.id)} 
                                disabled={voteBusyMap[comment.id]}
                              >
                                <svg className="w-4 h-4" fill={likedMap[comment.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                              </button>
                              <span className="text-xs text-gray-600">{comment.upvotes || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                className={`p-1 rounded ${dislikedMap[comment.id] ? 'text-red-600 bg-red-50' : 'hover:bg-gray-100'}`} 
                                onClick={() => toggleDislikeComment(comment.id)} 
                                disabled={voteBusyMap[comment.id]}
                              >
                                <svg className="w-4 h-4" fill={dislikedMap[comment.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                </svg>
                              </button>
                              <span className="text-xs text-gray-600">{comment.downvotes || 0}</span>
                            </div>
                            
                            <button 
                              onClick={() => handleReplyClick(comment)}
                              className="text-blue-500 hover:text-blue-600 text-xs font-medium transition-colors"
                            >
                              Balas
                            </button>
                            
                            {comment.replies && comment.replies.length > 0 && (
                              <button 
                                onClick={() => toggleReplies(comment.id)}
                                className="text-blue-500 hover:text-blue-600 text-xs font-medium transition-colors"
                              >
                                {expandedReplies[comment.id] ? 'Sembunyikan' : 'Lihat'} {comment.replies.length} balasan
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Replies */}
                      {expandedReplies[comment.id] && comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                              <img 
                                src={reply.users?.avatar_url || "/image/forum/test/profil-test.jpg"} 
                                alt="Profile"
                                className="w-6 h-6 rounded-full flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">
                                    {reply.users?.full_name || 'Anonymous'}
                                  </span>
                                  <RoleBadge role={reply.users?.roles?.name} />
                                  <span className="text-gray-500 text-xs">
                                    {new Date(reply.created_at).toLocaleDateString('id-ID')}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{reply.content}</p>
                                
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-2">
                                    <button 
                                      className={`p-1 rounded ${likedMap[reply.id] ? 'text-green-600 bg-green-50' : 'hover:bg-gray-100'}`} 
                                      onClick={() => toggleLikeComment(reply.id)} 
                                      disabled={voteBusyMap[reply.id]}
                                    >
                                      <svg className="w-3 h-3" fill={likedMap[reply.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                      </svg>
                                    </button>
                                    <span className="text-xs text-gray-600">{reply.upvotes || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      className={`p-1 rounded ${dislikedMap[reply.id] ? 'text-red-600 bg-red-50' : 'hover:bg-gray-100'}`} 
                                      onClick={() => toggleDislikeComment(reply.id)} 
                                      disabled={voteBusyMap[reply.id]}
                                    >
                                      <svg className="w-3 h-3" fill={dislikedMap[reply.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                      </svg>
                                    </button>
                                    <span className="text-xs text-gray-600">{reply.downvotes || 0}</span>
                                  </div>
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

            {replyingTo && (
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSubmitReply} className="flex gap-3">
                  <img 
                    src={currentUser?.avatar_url || currentUser?.user_metadata?.avatar_url || "/image/forum/test/profil-test.jpg"}
                    alt="Your Profile"
                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                    onError={(e) => { e.currentTarget.src = "/image/forum/test/profil-test.jpg"; }}
                  />
                  <div className="flex-1">
                    <div className="mb-2 text-sm text-gray-600">
                      Balas ke <span className="font-semibold">{replyingTo.users?.full_name || 'Anonymous'}</span>
                    </div>
                    <MentionAutocomplete
                      forumId={post.id}
                      value={replyText}
                      onChange={setReplyText}
                      placeholder="Tulis balasan... Gunakan @ untuk mention user..."
                      className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        type="button"
                        onClick={handleReplyCancel}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                      <button 
                        type="submit"
                        disabled={submittingReply || !replyText.trim()}
                        className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submittingReply && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {submittingReply ? 'Mengirim...' : 'Kirim Balasan'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {!replyingTo && (
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSubmitComment} className="flex gap-3">
                  <img 
                    src={currentUser?.avatar_url || currentUser?.user_metadata?.avatar_url || "/image/forum/test/profil-test.jpg"}
                    alt="Your Profile"
                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                    onError={(e) => { e.currentTarget.src = "/image/forum/test/profil-test.jpg"; }}
                  />
                  <div className="flex-1">
                    <MentionAutocomplete
                      forumId={post.id}
                      value={newComment}
                      onChange={setNewComment}
                      placeholder="Tulis komentar... Gunakan @ untuk mention user..."
                      className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <div className="flex justify-end mt-2">
                      <button 
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submittingComment && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {submittingComment ? 'Mengirim...' : 'Kirim'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}