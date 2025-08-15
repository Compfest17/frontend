'use client';
import { notFound, useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { ArrowLeft, Heart, ThumbsDown, Bookmark } from 'lucide-react';
import forumData from '../../../data/forumData.json';
import StatusBadge from '../../../components/formulir/StatusBadge';
import MapComponent from '../../../components/formulir/MapComponent';
import CommentsSection from '../../../components/formulir/CommentsSection';

export default function ForumPostPage({ params }) {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const resolvedParams = use(params);

  useEffect(() => {
    const foundPost = forumData.posts.find(p => p.id === parseInt(resolvedParams.id));
    if (!foundPost) {
      notFound();
    }
    setPost(foundPost);
  }, [resolvedParams.id]);

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
              {/* Post Image */}
              <div className="aspect-video relative mb-6 rounded-lg overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

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