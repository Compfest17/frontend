'use client';
import { useState, useEffect, useMemo } from 'react';
import { getCurrentUser } from '../../lib/supabase-auth';

export default function CommentsSection({ comments, commentCount = 0, forumId, onAfterSubmit }) {
  const [showMainCommentBox, setShowMainCommentBox] = useState(false);
  const [mainComment, setMainComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [likedMap, setLikedMap] = useState({});
  const [dislikedMap, setDislikedMap] = useState({});
  const [voteBusyMap, setVoteBusyMap] = useState({});
  const [sortBy, setSortBy] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleMainCommentFocus = () => {
    setShowMainCommentBox(true);
  };

  const handleMainCommentCancel = () => {
    setShowMainCommentBox(false);
    setMainComment('');
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  const handleReplyCancel = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const toggleLike = async (commentId) => {
    if (voteBusyMap[commentId]) return;
    try {
      setVoteBusyMap(prev => ({ ...prev, [commentId]: true }));
      const { user } = await getCurrentUser();
      if (!user) return;
      const token = user.access_token;
      if (dislikedMap[commentId]) {
        await (await import('../../services/forumAPI')).default.voteComment(commentId, 'remove_downvote', token);
      }
      const action = likedMap[commentId] ? 'remove_upvote' : 'upvote';
      await (await import('../../services/forumAPI')).default.voteComment(commentId, action, token);
      setLikedMap(prev => ({ ...prev, [commentId]: !prev[commentId] }));
      setDislikedMap(prev => ({ ...prev, [commentId]: false }));
      if (onAfterSubmit) onAfterSubmit();
    } catch (_) {
    } finally {
      setVoteBusyMap(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const toggleDislike = async (commentId) => {
    if (voteBusyMap[commentId]) return;
    try {
      setVoteBusyMap(prev => ({ ...prev, [commentId]: true }));
      const { user } = await getCurrentUser();
      if (!user) return;
      const token = user.access_token;
      if (likedMap[commentId]) {
        await (await import('../../services/forumAPI')).default.voteComment(commentId, 'remove_upvote', token);
      }
      const action = dislikedMap[commentId] ? 'remove_downvote' : 'downvote';
      await (await import('../../services/forumAPI')).default.voteComment(commentId, action, token);
      setDislikedMap(prev => ({ ...prev, [commentId]: !prev[commentId] }));
      setLikedMap(prev => ({ ...prev, [commentId]: false }));
      if (onAfterSubmit) onAfterSubmit();
    } catch (_) {
    } finally {
      setVoteBusyMap(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const sortComments = (commentsToSort) => {
    if (!commentsToSort) return [];
    
    const sorted = [...commentsToSort];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'mostLiked':
        return sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      case 'mostDisliked':
        return sorted.sort((a, b) => (b.downvotes || 0) - (a.downvotes || 0));
      default:
        return sorted;
    }
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setShowSortDropdown(false);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'newest': return 'Terbaru';
      case 'oldest': return 'Terlama';
      case 'mostLiked': return 'Paling Disukai';
      case 'mostDisliked': return 'Paling Tidak Disukai';
      default: return 'Terbaru';
    }
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.sort-dropdown')) {
      setShowSortDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const sortedComments = useMemo(() => {
    return sortComments(comments);
  }, [comments, sortBy]);

  const submitTopLevelComment = async () => {
    if (!forumId || !mainComment.trim()) return;
    try {
      const { user } = await getCurrentUser();
      if (!user) return;
      const token = user.access_token;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE_URL}/api/forums/${forumId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: mainComment.trim() })
      });
      if (res.ok) {
        setMainComment('');
        setShowMainCommentBox(false);
        if (onAfterSubmit) onAfterSubmit();
      }
    } catch (_) {}
  };

  const submitReply = async (parentId) => {
    if (!forumId || !replyText.trim() || !parentId) return;
    try {
      const { user } = await getCurrentUser();
      if (!user) return;
      const token = user.access_token;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE_URL}/api/forums/${forumId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyText.trim(), parent_id: parentId })
      });
      if (res.ok) {
        setReplyText('');
        setReplyingTo(null);
        if (onAfterSubmit) onAfterSubmit();
      }
    } catch (_) {}
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          setCurrentUser(null);
          return;
        }
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${user.access_token}` }
          });
          if (res.ok) {
            const profile = await res.json();
            const merged = { ...user, ...profile.data.user };
            setCurrentUser(merged);
          } else {
            setCurrentUser(user);
          }
        } catch (_) {
          setCurrentUser(user);
        }
      } catch (e) {
        setCurrentUser(null);
      }
    };
    loadUser();
  }, []);

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Comments Header */}
      <div className="flex items-center gap-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {commentCount} Komentar
        </h3>
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            <span>{getSortLabel()}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showSortDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] sort-dropdown">
              <div className="py-1">
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    sortBy === 'newest' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  Terbaru
                </button>
                <button
                  onClick={() => handleSortChange('oldest')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    sortBy === 'oldest' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  Terlama
                </button>
                <button
                  onClick={() => handleSortChange('mostLiked')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    sortBy === 'mostLiked' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  Paling Disukai
                </button>
                <button
                  onClick={() => handleSortChange('mostDisliked')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    sortBy === 'mostDisliked' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  Paling Tidak Disukai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Comment */}
      <div className="flex gap-3 mb-6">
        <img 
          src={currentUser?.avatar_url || currentUser?.user_metadata?.avatar_url || "/image/forum/test/profil-test.jpg"}
          alt="Your Profile"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          onError={(e) => { e.currentTarget.src = "/image/forum/test/profil-test.jpg"; }}
        />
        <div className="flex-1">
          {!showMainCommentBox ? (
            <input
              type="text"
              placeholder="Tambahkan komentar..."
              className="w-full border-0 border-b border-gray-300 focus:border-gray-600 focus:outline-none pb-1 text-sm bg-transparent"
              onFocus={handleMainCommentFocus}
            />
          ) : (
            <div>
              <textarea
                value={mainComment}
                onChange={(e) => setMainComment(e.target.value)}
                placeholder="Tambahkan komentar..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-gray-600"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleMainCommentCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button
                  disabled={!mainComment.trim()}
                  onClick={submitTopLevelComment}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Komentar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedComments?.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <div className="flex gap-3">
              <img 
                src={comment.users?.avatar_url || "/image/forum/test/profil-test.jpg"} 
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                onError={(e) => { e.currentTarget.src = "/image/forum/test/profil-test.jpg"; }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">{comment.users?.full_name || comment.users?.username || 'Anonymous'}</span>
                  <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString('id-ID')}</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  {comment.content}
                </p>
                
                {/* Comment Actions */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button className={`p-1 rounded ${likedMap[comment.id] ? 'text-green-600 bg-green-50' : 'hover:bg-gray-100'}`} onClick={() => toggleLike(comment.id)} disabled={voteBusyMap[comment.id]}>
                      <svg className="w-4 h-4" fill={likedMap[comment.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-600">{comment.upvotes || 0}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className={`p-1 rounded ${dislikedMap[comment.id] ? 'text-red-600 bg-red-50' : 'hover:bg-gray-100'}`} onClick={() => toggleDislike(comment.id)} disabled={voteBusyMap[comment.id]}>
                      <svg className="w-4 h-4" fill={dislikedMap[comment.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-600">{comment.downvotes || 0}</span>
                  </div>

                  <button 
                    onClick={() => handleReplyClick(comment.id)}
                    className="text-xs font-medium text-gray-600 hover:text-gray-800"
                  >
                    Balas
                  </button>

                  <button className="p-1 hover:bg-gray-100 rounded ml-auto">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                {/* Show Replies Button */}
                {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                  <button 
                    onClick={() => toggleReplies(comment.id)}
                    className="flex items-center gap-2 mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <svg className={`w-4 h-4 transition-transform ${showReplies[comment.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {comment.replies.length} balasan
                  </button>
                )}

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="flex gap-3 mt-3">
                    <img 
                      src={currentUser?.avatar_url || currentUser?.user_metadata?.avatar_url || "/image/forum/test/profil-test.jpg"}
                      alt="Your Profile"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      onError={(e) => { e.currentTarget.src = "/image/forum/test/profil-test.jpg"; }}
                    />
                    <div className="flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Balas ke ${comment.users?.full_name || comment.users?.username || 'Anonymous'}...`}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-gray-600"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={handleReplyCancel}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                        >
                          Batal
                        </button>
                        <button
                          disabled={!replyText.trim()}
                          onClick={() => submitReply(comment.id)}
                          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Balas
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showReplies[comment.id] && Array.isArray(comment.replies) && comment.replies.length > 0 && (
              <div className="ml-12 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <img 
                      src={reply.users?.avatar_url || "/image/forum/test/profil-test.jpg"} 
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      onError={(e) => { e.currentTarget.src = "/image/forum/test/profil-test.jpg"; }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{reply.users?.full_name || reply.users?.username || 'Anonymous'}</span>
                        <span className="text-xs text-gray-500">{new Date(reply.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {reply.content}
                      </p>
                      
                      {/* Reply Actions */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button className={`p-1 rounded ${likedMap[reply.id] ? 'text-green-600 bg-green-50' : 'hover:bg-gray-100'}`} onClick={() => toggleLike(reply.id)} disabled={voteBusyMap[reply.id]}>
                            <svg className="w-3 h-3" fill={likedMap[reply.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                          </button>
                          <span className="text-xs text-gray-600">{reply.upvotes || 0}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className={`p-1 rounded ${dislikedMap[reply.id] ? 'text-red-600 bg-red-50' : 'hover:bg-gray-100'}`} onClick={() => toggleDislike(reply.id)} disabled={voteBusyMap[reply.id]}>
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
    </div>
  );
}