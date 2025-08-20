'use client';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

export default function RightSidebar({ trendingDiscussions = [] }) {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(5);

  const formattedDiscussions = useMemo(() => trendingDiscussions.map((post, index) => ({
    id: post.id,
    author: post.is_anonymous ? 'Anonymous' : (post.users?.full_name || post.author || 'Anonymous'),
    username: post.is_anonymous ? '' : `@${post.users?.username || post.author?.toLowerCase().replace(/\s+/g, '') || 'anonymous'}`,
    avatar_url: post.is_anonymous ? '/image/forum/test/profil-test.jpg' : (post.users?.avatar_url || '/image/forum/test/profil-test.jpg'), 
    date: post.date || new Date(post.created_at).toLocaleDateString('id-ID'),
    title: post.title,
    content: post.description || post.content || '',
    comments: post.comments || 0,
    likes: post.upvotes || post.likes || 0,
    views: post.views_count || post.views || 0,
    ranking: index + 1,
    trending_score: post.trending_score || 0 
  })), [trendingDiscussions]);

  const visibleDiscussions = useMemo(() => {
    return formattedDiscussions.slice(0, Math.min(visibleCount, 10));
  }, [formattedDiscussions, visibleCount]);

  const handleDiscussionClick = (discussionId) => {
    router.push(`/forum/${discussionId}`);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(10, formattedDiscussions.length));
  };

  return (
    <div className="w-80 p-4 space-y-6 sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <h3 className="font-bold text-lg text-gray-900">Sedang hangat dibicarakan</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {visibleDiscussions.length > 0 ? (
            visibleDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                onClick={() => handleDiscussionClick(discussion.id)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={discussion.avatar_url}
                    alt={discussion.author}
                    className="w-7 h-7 rounded-full border border-gray-200 object-cover"
                    onError={(e) => {
                      e.target.src = '/image/forum/test/profil-test.jpg'; 
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <span className="font-semibold text-gray-900 truncate max-w-[100px]">
                        {discussion.author}
                      </span>
                      {discussion.username && (
                        <>
                          <span className="text-gray-400 flex-shrink-0">{discussion.username}</span>
                          <span className="text-gray-400 flex-shrink-0">·</span>
                        </>
                      )}
                      <span className="text-gray-400 flex-shrink-0">{discussion.date}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                    {discussion.title}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {discussion.content}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="font-medium">{discussion.comments}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span className="font-medium">{discussion.views}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span className="font-medium">{discussion.likes}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-orange-500">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.414 14.586 7H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">#{discussion.ranking}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">
                Belum ada diskusi trending
              </p>
            </div>
          )}
        </div>

        {formattedDiscussions.length > visibleCount && visibleCount < 10 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white">
            <button 
              onClick={handleShowMore}
              className="w-full text-orange-500 text-sm font-medium hover:text-orange-600 hover:bg-orange-50 py-2 px-3 rounded-lg transition-colors"
            >
              Tampilkan lebih banyak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
