"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-auth';

export default function EmailConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const handleEmailConfirm = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Email verification error:', error);
          router.push('/login?error=email_verification_failed');
          return;
        }

        if (session) {
          console.log('Email verified for user:', session.user.email);
          router.push('/dashboard?message=Email berhasil diverifikasi');
        } else {
          router.push('/login?message=Email diverifikasi, silakan login');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        router.push('/login?error=verification_error');
      }
    };

    handleEmailConfirm();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Memverifikasi Email...</h2>
        <p className="text-gray-500">Mohon tunggu sebentar.</p>
      </div>
    </div>
  );
}
