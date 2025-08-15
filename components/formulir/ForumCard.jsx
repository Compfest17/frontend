'use client';
import { useRouter } from 'next/navigation';

export default function ForumCard({ post }) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/forum/${post.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="p-4">
        <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <h3 className="font-medium text-gray-900 mb-3 line-clamp-2 leading-5 group-hover:text-orange-600 transition-colors">
          {post.title}
        </h3>
        
        <div className="text-xs text-gray-500 mb-2">
          {post.date}
        </div>
        
        <div className="flex items-center gap-2">
          <img 
            src="/image/forum/test/profil-test.jpg" 
            alt="Profile"
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
          <span className="text-sm text-gray-700 font-medium truncate">
            {post.author}
          </span>
        </div>
      </div>
    </div>
  );
}
