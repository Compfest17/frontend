'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
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
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showActionDropdown, setShowActionDropdown] = useState({});
  const sortDropdownRef = useRef(null);
  const actionDropdownRefs = useRef({});

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

  // Sort comments and their replies
  const sortComments = (commentsToSort) => {
    if (!commentsToSort) return [];
    const sorted = [...commentsToSort];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'mostLiked':
        sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        break;
      case 'mostDisliked':
        sorted.sort((a, b) => (b.downvotes || 0) - (a.downvotes || 0));
        break;
      default:
        break;
    }
    // Also sort replies for each comment
    sorted.forEach(comment => {
      if (Array.isArray(comment.replies)) {
        comment.replies = sortComments(comment.replies);
      }
    });
    return sorted;
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

  // Improved click outside for dropdown using ref and pointerdown for mobile support
  useEffect(() => {
    function handleClickOutside(e) {
      // Only close if click is outside the dropdown container
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    }
    if (showSortDropdown) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [showSortDropdown]);

  // Handle click outside for action dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      Object.keys(actionDropdownRefs.current).forEach((id) => {
        const ref = actionDropdownRefs.current[id];
        if (ref && !ref.contains(e.target)) {
          setShowActionDropdown((prev) => ({ ...prev, [id]: false }));
        }
      });
    }
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
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

  // Helper to check if current user is the author
  const isAuthor = (comment) => {
    if (!currentUser) return false;
    return (
      comment.users?.id === currentUser.id ||
      comment.users?.id === currentUser.user_metadata?.id
    );
  };

  // Handle edit click
  const handleEditClick = (comment) => {
    setEditCommentId(comment.id);
    setEditCommentText(comment.content);
    setShowActionDropdown({});
  };

  // Handle delete click
  const handleDeleteClick = async (comment) => {
    setShowActionDropdown({});
    if (!window.confirm('Yakin ingin menghapus komentar ini?')) return;
    try {
      const { user } = await getCurrentUser();
      if (!user) return;
      const token = user.access_token;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await fetch(`${API_BASE_URL}/api/forums/comments/${comment.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (onAfterSubmit) onAfterSubmit();
    } catch (_) {}
  };

  // Handle save edit
  const handleSaveEdit = async (comment) => {
    if (!editCommentText.trim()) return;
    try {
      const { user } = await getCurrentUser();
      if (!user) return;
      const token = user.access_token;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await fetch(`${API_BASE_URL}/api/forums/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editCommentText.trim() })
      });
      setEditCommentId(null);
      setEditCommentText('');
      if (onAfterSubmit) onAfterSubmit();
    } catch (_) {}
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditCommentId(null);
    setEditCommentText('');
  };

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Comments Header */}
      <div className="flex items-center gap-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {commentCount} Komentar
        </h3>
        {/* Wrap both button and dropdown in the same ref container */}
        <div className="relative inline-block" ref={sortDropdownRef}>
          <button
            type="button"
            onClick={() => setShowSortDropdown((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            aria-haspopup="listbox"
            aria-expanded={showSortDropdown}
            aria-controls="sort-dropdown-list"
            tabIndex={0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            <span>{getSortLabel()}</span>
            <svg className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showSortDropdown && (
            <div
              id="sort-dropdown-list"
              className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] sort-dropdown"
              role="listbox"
            >
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleSortChange('newest')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    sortBy === 'newest' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                  role="option"
                  aria-selected={sortBy === 'newest'}
                >
                  Terbaru
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('oldest')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    sortBy === 'oldest' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                  role="option"
                  aria-selected={sortBy === 'oldest'}
                >
                  Terlama
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('mostLiked')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    sortBy === 'mostLiked' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                  role="option"
                  aria-selected={sortBy === 'mostLiked'}
                >
                  Paling Disukai
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('mostDisliked')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    sortBy === 'mostDisliked' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                  role="option"
                  aria-selected={sortBy === 'mostDisliked'}
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
                {/* Edit mode for comment */}
                {editCommentId === comment.id ? (
                  <div>
                    <textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-gray-600"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                      >
                        Batal
                      </button>
                      <button
                        disabled={!editCommentText.trim()}
                        onClick={() => handleSaveEdit(comment)}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 mb-3">
                    {comment.content}
                  </p>
                )}

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

                  {/* Three dots button with dropdown */}
                  <div className="relative ml-auto" ref={el => actionDropdownRefs.current[comment.id] = el}>
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() =>
                        setShowActionDropdown(prev => ({
                          ...prev,
                          [comment.id]: !prev[comment.id]
                        }))
                      }
                      aria-haspopup="menu"
                      aria-expanded={!!showActionDropdown[comment.id]}
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="6" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="18" r="1.5" />
                      </svg>
                    </button>
                    {showActionDropdown[comment.id] && isAuthor(comment) && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
                        <button
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                          onClick={() => handleEditClick(comment)}
                        >
                          Edit
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                          onClick={() => handleDeleteClick(comment)}
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
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
                      {/* Edit mode for reply */}
                      {editCommentId === reply.id ? (
                        <div>
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-gray-600"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                              Batal
                            </button>
                            <button
                              disabled={!editCommentText.trim()}
                              onClick={() => handleSaveEdit(reply)}
                              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 mb-2">
                          {reply.content}
                        </p>
                      )}
                      
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

                        {/* Three dots button for reply */}
                        <div className="relative ml-auto" ref={el => actionDropdownRefs.current[reply.id] = el}>
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            onClick={() =>
                              setShowActionDropdown(prev => ({
                                ...prev,
                                [reply.id]: !prev[reply.id]
                              }))
                            }
                            aria-haspopup="menu"
                            aria-expanded={!!showActionDropdown[reply.id]}
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="6" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="18" r="1.5" />
                            </svg>
                          </button>
                          {showActionDropdown[reply.id] && isAuthor(reply) && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
                              <button
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                                onClick={() => handleEditClick(reply)}
                              >
                                Edit
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                                onClick={() => handleDeleteClick(reply)}
                              >
                                Hapus
                              </button>
                            </div>
                          )}
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