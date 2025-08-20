'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase-auth';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkUserAccess = async () => {
      try {
        const { user: currentUser, error: userError } = await getCurrentUser();
        
        if (userError || !currentUser) {
          router.push('/login');
          return;
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${currentUser.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const profileData = await response.json();
        const userWithRole = profileData.data.user;
        console.log('Dashboard user data:', userWithRole);

        setUser(userWithRole);
      } catch (err) {
        console.error('Dashboard access error:', err);
        setError('Gagal memuat dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkUserAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h1>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {user.role === 'admin' ? 'Dashboard Admin' : 
           user.role === 'karyawan' ? 'Dashboard Karyawan' : 
           'Dashboard'}
        </h1>
        <p className="text-gray-600">
          Selamat datang, {user.full_name}
          {user.assigned_province && (
            <span className="ml-2 px-3 py-1 bg-[#DD761C] text-white text-sm rounded-full">
              {user.assigned_province}
            </span>
          )}
        </p>
      </div>
      
      {user.role === 'admin' || user.role === 'karyawan' ? (
        <DashboardTabs user={user} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ini halaman dashboard</h2>
          <p className="text-gray-600 mb-6">
            Selamat datang di dashboard! Untuk mengakses fitur lengkap, upgrade akun Anda menjadi karyawan.
          </p>

        </div>
      )}
    </div>
  );
}
