'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../components/forum/Sidebar';
import RightSidebar from '../../components/forum/RightSidebar';
import MobileSidebarTrigger from '../../components/forum/MobileSidebarTrigger';
import ForumSection from './components/ForumSection';
import ForumAPI from '../../services/forumAPI';

export default function ForumPage() {
  const [trendingDiscussions, setTrendingDiscussions] = useState([]);

  const handlePostsLoaded = (posts) => {
    const trending = [...posts]
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 10);
    setTrendingDiscussions(trending);
  };

  useEffect(() => {
    const fetchTrendingForSidebar = async () => {
      try {
        const response = await ForumAPI.getTrending(10);
        if (response.success) {
          setTrendingDiscussions(response.data);
        }
      } catch (error) {
        console.error('Error fetching trending posts for sidebar:', error);
      }
    };

    fetchTrendingForSidebar();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex max-w-7xl mx-auto relative">
        {/* Left Sidebar - Desktop Only */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:px-0 px-0">
          <ForumSection onPostsLoaded={handlePostsLoaded} />
        </div>
        
        <div className="hidden xl:block flex-shrink-0">
          <RightSidebar trendingDiscussions={trendingDiscussions} />
        </div>
      </div>

      {/* Mobile Sidebar Trigger */}
      <MobileSidebarTrigger />
    </div>
  );
}