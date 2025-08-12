"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { updatePassword } from '@/lib/supabase-auth';
import { validatePassword, getAuthError } from '@/lib/authUtils';
import PasswordStrength from '@/components/PasswordStrength';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handlePasswordReset = async () => {
      const hash = window.location.hash;
      if (hash.includes('access_token') && hash.includes('type=recovery')) {
        return;
      } else {
        setError('Link reset password tidak valid atau sudah expired');
      }
    };

    handlePasswordReset();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak sama');
      setIsLoading(false);
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`Password: ${passwordErrors.join(', ')}`);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await updatePassword(password);
      
      if (error) {
        throw new Error(error.message);
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push('/login?message=Password berhasil diubah, silakan login dengan password baru');
      }, 2000);

    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'Gagal mengubah password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-screen flex overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-white px-8 lg:px-16">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Berhasil Diubah!</h1>
              <p className="text-gray-600">Mengalihkan ke halaman login...</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 relative h-screen">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute inset-0">
            <img
              src="/image/Rectangle.png"
              alt="Success"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="flex-1 flex items-center justify-center bg-white px-8 lg:px-16 relative">
        <Link 
          href="/login"
          className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Kembali ke Login</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#DD761C' }}>
              Reset Password
            </h1>
            <p className="text-gray-600">
              Masukkan password baru Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                PASSWORD BARU *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                style={{ 
                  borderBottomColor: password ? '#DD761C' : undefined,
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                onBlur={(e) => e.target.style.borderBottomColor = password ? '#DD761C' : '#d1d5db'}
                required
                disabled={isLoading}
                minLength={8}
              />
              <PasswordStrength password={password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                KONFIRMASI PASSWORD *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                style={{ 
                  borderBottomColor: confirmPassword ? '#DD761C' : undefined,
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                onBlur={(e) => e.target.style.borderBottomColor = confirmPassword ? '#DD761C' : '#d1d5db'}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-medium py-4 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#DD761C' }}
            >
              {isLoading ? 'Mengubah Password...' : 'Ubah Password'}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative h-screen">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        <div className="absolute inset-0">
          <img
            src="/image/Rectangle.png"
            alt="Reset Password"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Secure your account
            </h2>
            <div className="mb-8">
              <p className="text-lg font-medium">New password, new beginning</p>
              <p className="text-sm opacity-90">Your security matters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
