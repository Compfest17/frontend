'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  ClipboardList, 
  TrendingUp, 
  History, 
  Users, 
  Settings,
  MapPin,
  Target
} from 'lucide-react';

import AnalyticsTab from './tabs/AnalyticsTab';
import SystemOverviewTab from './tabs/SystemOverviewTab';
import ReportsTab from './tabs/ReportsTab';
import ProgressTab from './tabs/ProgressTab';
import HistoryTab from './tabs/HistoryTab';
import ManageEmployeesTab from './tabs/ManageEmployeesTab';
import AdminToolsTab from './tabs/AdminToolsTab';
import PointSystemTab from './tabs/PointSystemTab';

export default function DashboardTabs({ user }) {
  const [activeTab, setActiveTab] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [mountedTabs, setMountedTabs] = useState({});

  const tabs = useMemo(() => {
    if (user?.role === 'admin') {
      return [
        { id: 'manage-employees', label: 'Manage Karyawan', icon: Users, component: ManageEmployeesTab },
        { id: 'system-overview', label: 'System Overview', icon: BarChart3, component: SystemOverviewTab },
        { id: 'all-reports', label: 'All Reports', icon: ClipboardList, component: ReportsTab },
        { id: 'point-system', label: 'Point System', icon: Target, component: PointSystemTab },
        { id: 'admin-tools', label: 'Admin Tools', icon: Settings, component: AdminToolsTab }
      ];
    } else if (user?.role === 'karyawan') {
      return [
        { id: 'analytics', label: 'Analytics', icon: BarChart3, component: AnalyticsTab },
        { id: 'reports', label: 'Laporan Masuk', icon: ClipboardList, component: ReportsTab },
        { id: 'progress', label: 'My Progress', icon: TrendingUp, component: ProgressTab },
        { id: 'history', label: 'History', icon: History, component: HistoryTab }
      ];
    }
    return [];
  }, [user?.role]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (tabs.length > 0 && typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(`dashboard-tab-${user.role}`);
      const defaultTab = tabs[0].id;
      const validSavedTab = savedTab && tabs.find(t => t.id === savedTab);
      const initialTab = validSavedTab ? savedTab : defaultTab;
      setActiveTab(initialTab);
      const allTabsMounted = {};
      tabs.forEach(tab => {
        allTabsMounted[tab.id] = true;
      });
      setMountedTabs(allTabsMounted);
    }
  }, [user.role, tabs]);

  useEffect(() => {
    if (activeTab && typeof window !== 'undefined') {
      localStorage.setItem(`dashboard-tab-${user.role}`, activeTab);
    }
  }, [activeTab, user.role]);

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMountedTabs(prev => ({ ...prev, [tabId]: true }));
  };

  const handleSwipe = (direction) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    let newIndex;
    
    if (direction === 'left' && currentIndex < tabs.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'right' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return;
    }
    
    setActiveTab(tabs[newIndex].id);
  };

  if (tabs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-600">No dashboard access for your role.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="border-b border-gray-200">
        {isMobile ? (
          <MobileTabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            onSwipe={handleSwipe}
          />
        ) : (
          <DesktopTabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
          />
        )}
      </div>

      <div className="relative p-6">
        {tabs.map(tab => {
          const TabComp = tab.component;
          const isActive = activeTab === tab.id;
          const isMounted = mountedTabs[tab.id];
          return (
            <div key={tab.id} className={isActive ? 'block' : 'hidden'}>
              {isMounted && <TabComp user={user} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DesktopTabNavigation({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-300 whitespace-nowrap ${
              isActive
                ? 'border-[#DD761C] text-[#DD761C] bg-orange-50'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MobileTabNavigation({ tabs, activeTab, onTabChange, onSwipe }) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onSwipe('left');
    } else if (isRightSwipe) {
      onSwipe('right');
    }
  };

  return (
    <div 
      className="flex overflow-x-auto scrollbar-hide"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 px-4 py-3 border-b-2 transition-all duration-300 min-w-[100px] ${
              isActive
                ? 'border-[#DD761C] text-[#DD761C] bg-orange-50'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium text-center">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
