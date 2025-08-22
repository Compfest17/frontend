'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Settings } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import BannerForum from './components/BannerForum';
import ForumSection from './components/ForumSection';
import EmployeeProvinceSetup from '@/components/auth/EmployeeProvinceSetup';
import ProfileEditModal from './components/ProfileEditModal';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProvinceSetup, setShowProvinceSetup] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();
      
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.data.user);
        await fetchUserPosts(currentUser.access_token, result.data.user.id);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (token, userId) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/forums?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUserPosts(result.data || []);
      } else {
        console.error('Failed to fetch user posts:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
    }
  };

  const handleProvinceSetupSuccess = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setUser(result.data.user);
      }
    } catch (e) {}
    setShowProvinceSetup(false);
  };

  const handleEditProfileSuccess = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${currentUser.access_token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setUser(result.data.user);
        await fetchUserPosts(currentUser.access_token, result.data.user.id);
      }
    } catch (e) {}
    setShowEditProfile(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <BannerForum user={user} onEditProfile={() => setShowEditProfile(true)} />
      
      {/* Employee Province Setup Notification */}
      {user?.role === 'karyawan' && !user?.assigned_province && (
        <div className="container mx-auto px-4 sm:px-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-800">Set Provinsi Assignment</h4>
                  <p className="text-sm text-orange-700">
                    Sebagai karyawan, Anda perlu mengatur provinsi yang akan Anda handle.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProvinceSetup(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Set Provinsi
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Forum Section - Only show for regular users, not admin or karyawan */}
      {user?.role === 'user' && (
        <ForumSection posts={userPosts} />
      )}

      <AnimatePresence>
        {showProvinceSetup && (
          <EmployeeProvinceSetup
            user={user}
            onSuccess={handleProvinceSetupSuccess}
            onCancel={() => setShowProvinceSetup(false)}
          />
        )}
        {showEditProfile && (
          <ProfileEditModal
            user={user}
            onSuccess={handleEditProfileSuccess}
            onCancel={() => setShowEditProfile(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}