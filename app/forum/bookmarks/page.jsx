'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../../components/forum/Sidebar';
import RightSidebar from '../../../components/forum/RightSidebar';
import MobileSidebarTrigger from '../../../components/forum/MobileSidebarTrigger';
import BookmarksSection from './components/BookmarksSection';
import ForumAPI from '../../../services/forumAPI';

export default function BookmarksPage() {
  const [trendingDiscussions, setTrendingDiscussions] = useState([]);

  useEffect(() => {
    loadTrendingDiscussions();
  }, []);

  const loadTrendingDiscussions = async () => {
    try {
      const response = await ForumAPI.getForums();
      
      const posts = response.success && Array.isArray(response.data) ? response.data : [];
      
      const trending = [...posts]
        .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
        .slice(0, 4);
      setTrendingDiscussions(trending);
    } catch (error) {
      console.error('Error loading trending discussions:', error);
      setTrendingDiscussions([]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex max-w-7xl mx-auto relative">
        {/* Left Sidebar - Desktop Only */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:px-0 px-0">
          <BookmarksSection />
        </div>
        
        {/* Right Sidebar - Desktop Only */}
        <div className="hidden xl:block flex-shrink-0">
          <RightSidebar trendingDiscussions={trendingDiscussions} />
        </div>
      </div>

      {/* Mobile Sidebar Trigger */}
      <MobileSidebarTrigger />
    </div>
  );
}
