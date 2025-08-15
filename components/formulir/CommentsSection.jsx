'use client';
import { useState } from 'react';

export default function CommentsSection({ comments, commentCount = 0 }) {
  const [showMainCommentBox, setShowMainCommentBox] = useState(false);
  const [mainComment, setMainComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState({});

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

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Comments Header */}
      <div className="flex items-center gap-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {commentCount} Komentar
        </h3>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
          <span className="text-sm font-medium text-gray-600">Urutkan</span>
        </div>
      </div>

      {/* Add Comment */}
      <div className="flex gap-3 mb-6">
        <img 
          src="/image/forum/test/profil-test.jpg" 
          alt="Your Profile"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
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
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Komentar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Comments List */}
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="space-y-3">
            {/* Main Comment */}
            <div className="flex gap-3">
              {comment.author === '@zikrisaputra8116' ? (
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">Z</span>
                </div>
              ) : (
                <img 
                  src="/image/forum/test/profil-test.jpg" 
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">{comment.author}</span>
                  <span className="text-xs text-gray-500">{comment.date}</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  {comment.text}
                </p>
                
                {/* Comment Actions */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-600">{comment.likes}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                    </button>
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
                {comment.replies > 0 && (
                  <button 
                    onClick={() => toggleReplies(comment.id)}
                    className="flex items-center gap-2 mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <svg className={`w-4 h-4 transition-transform ${showReplies[comment.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {comment.replies} balasan
                  </button>
                )}

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="flex gap-3 mt-3">
                    <img 
                      src="/image/forum/test/profil-test.jpg" 
                      alt="Your Profile"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Balas ke ${comment.author}...`}
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

            {/* Replies */}
            {showReplies[comment.id] && comment.repliesList && comment.repliesList.length > 0 && (
              <div className="ml-12 space-y-3">
                {comment.repliesList.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <img 
                      src="/image/forum/test/profil-test.jpg" 
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{reply.author}</span>
                        <span className="text-xs text-gray-500">{reply.date}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {reply.text}
                      </p>
                      
                      {/* Reply Actions */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                          </button>
                          <span className="text-xs text-gray-600">{reply.likes}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                            </svg>
                          </button>
                        </div>

                        <button className="text-xs font-medium text-gray-600 hover:text-gray-800">
                          Balas
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
    </div>
  );
}