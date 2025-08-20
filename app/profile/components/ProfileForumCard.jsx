'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import StatusBadge from '../../../components/formulir/StatusBadge';
import { MessageCircle, Eye, ThumbsUp, ThumbsDown, Bookmark } from 'lucide-react';

export default function ProfileForumCard({ post }) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = post.forum_media?.map(media => media.file_url) || 
                 post.images || 
                 (post.image ? [post.image] : []);

  const handleCardClick = (e) => {
    if (e.target.closest('.action-button')) return;
    router.push(`/forum/${post.id}`);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Image Section */}
      {images && images.length > 0 && (
        <div className="relative">
          <img 
            src={images[currentImageIndex]} 
            alt={post.title}
            className="w-full h-48 object-cover"
          />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Dots Indicator */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        {/* Header - Author Info */}
        <div className="flex items-center gap-3 mb-3">
          <img 
            src={post.is_anonymous ? "/image/forum/test/profil-test.jpg" : (post.users?.avatar_url || "/image/forum/test/profil-test.jpg")} 
            alt={post.is_anonymous ? 'Anonymous User' : (post.users?.full_name || 'User')}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">
                {post.is_anonymous ? 'Anonymous' : (post.users?.full_name || 'Anonymous')}
              </span>
              {!post.is_anonymous && post.users?.username && (
                <span className="text-gray-500 text-xs">@{post.users.username}</span>
              )}
              <span className="text-gray-500 text-xs">
                {new Date(post.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-3">
          <StatusBadge status={post.status} />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* Description */}
        {(post.description || post.content) && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {post.description || post.content}
          </p>
        )}

        {/* Tags */}
        {post.forum_tags && post.forum_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.forum_tags.slice(0, 3).map((tagItem, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
              >
                #{tagItem.tags?.name || tagItem.name || tagItem}
              </span>
            ))}
            {post.forum_tags.length > 3 && (
              <span className="text-xs text-gray-500">+{post.forum_tags.length - 3} lainnya</span>
            )}
          </div>
        )}

        {/* Location */}
        {(post.address || post.location) && (
          <div className="flex items-center gap-1 mb-3 text-gray-500 text-xs">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{post.address || post.location}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button className="action-button flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{post.comments || 0}</span>
            </button>
            
            <button className="action-button flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs">{post.upvotes || 0}</span>
            </button>
            
            <button className="action-button flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors">
              <ThumbsDown className="w-4 h-4" />
              <span className="text-xs">{post.downvotes || 0}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-gray-500">
              <Eye className="w-4 h-4" />
              <span className="text-xs">{post.views || 0}</span>
            </div>
            
            <button className="action-button text-gray-500 hover:text-blue-600 transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
