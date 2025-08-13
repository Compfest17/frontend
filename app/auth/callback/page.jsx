"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-auth';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/login?error=authentication_failed');
          return;
        }

        if (session) {
          console.log('User authenticated successfully:', session.user);
          
          router.push('/dashboard');
        } else {
          console.warn('No session found in callback');
          router.push('/login?error=no_session');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/login?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#DD761C' }}>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Menyelesaikan Login...</h2>
        <p className="text-gray-500">Mohon tunggu sebentar.</p>
      </div>
    </div>
  );
}
