import Sidebar from '../../../components/forum/Sidebar';
import RightSidebar from '../../../components/forum/RightSidebar';
import MobileSidebarTrigger from '../../../components/forum/MobileSidebarTrigger';
import BookmarksSection from './components/BookmarksSection';

export default function BookmarksPage() {
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
          <RightSidebar />
        </div>
      </div>

      {/* Mobile Sidebar Trigger */}
      <MobileSidebarTrigger />
    </div>
  );
}
