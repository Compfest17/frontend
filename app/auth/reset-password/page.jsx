"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { updatePassword } from '@/lib/supabase-auth';
import { validatePassword, getAuthError } from '@/lib/authUtils';
import PasswordStrength from '@/components/PasswordStrength';
import BannerSlider from '@/components/auth/BannerSlider';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

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

  // Helper to map various error shapes/messages to a friendly localized string
  const getFriendlyError = (err) => {
    const msg = (err && (err.message || String(err))) || '';
    const lower = msg.toLowerCase();

    if (lower.includes('new password should be different') ||
        lower.includes('should be different from the old password') ||
        lower.includes('same as old password')) {
      return 'Password baru harus berbeda dari password lama. Silakan gunakan password yang berbeda.';
    }

    if (lower.includes('expired') || lower.includes('invalid')) {
      return 'Link reset password sudah tidak valid atau expired. Silakan minta reset password baru.';
    }

    if (lower.includes('network')) {
      return 'Koneksi bermasalah. Silakan coba lagi.';
    }

    // generic password requirement hint
    if (lower.includes('password') || lower.includes('pass')) {
      return 'Password tidak memenuhi kriteria. Pastikan minimal 8 karakter dengan kombinasi huruf dan angka.';
    }

    // fallback to getAuthError if it's an error object, otherwise return message or generic
    if (err && typeof err === 'object') {
      return getAuthError(err, 'reset') || (err.message || 'Gagal mengubah password. Silakan coba lagi.');
    }

    return msg || 'Gagal mengubah password. Silakan coba lagi.';
  };

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
      const { error: updateErr } = await updatePassword(password);

      if (updateErr) {
        setError(getFriendlyError(updateErr));
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/login?message=Password berhasil diubah, silakan login dengan password baru');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(getFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const bannerSlides = [
    {
      title: "Amankan Akun Anda",
      subtitle: "Password baru, awal yang baru",
      image: "/image/auth/Slider1.jpg",
      alt: "Secure your account"
    },
    {
      title: "Keamanan Maksimal",
      subtitle: "Lindungi akun dengan password yang kuat",
      image: "/image/auth/Slider2.jpg",
      alt: "Maximum security"
    }
  ];

  const successBannerSlides = [
    {
      title: "Password Berhasil Diubah",
      subtitle: "Akun Anda sekarang lebih aman",
      image: "/image/auth/Slider3.png",
      alt: "Password changed successfully"
    }
  ];

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

        <BannerSlider slides={successBannerSlides} autoSlide={false} />
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
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#DD761C' }}>
              Reset Password
            </h1>
            <p className="text-gray-600">
              Masukkan password baru Anda.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                PASSWORD BARU *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-0 py-3 pr-10 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                  style={{ 
                    borderBottomColor: password ? '#DD761C' : undefined,
                  }}
                  onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                  onBlur={(e) => e.target.style.borderBottomColor = password ? '#DD761C' : '#d1d5db'}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                KONFIRMASI PASSWORD *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  className="w-full px-0 py-3 pr-10 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                  style={{ 
                    borderBottomColor: confirmPassword ? '#DD761C' : undefined,
                  }}
                  onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                  onBlur={(e) => e.target.style.borderBottomColor = confirmPassword ? '#DD761C' : '#d1d5db'}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-medium py-4 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#DD761C' }}
              >
                {isLoading ? 'Mengubah Password...' : 'Ubah Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <BannerSlider slides={bannerSlides} />
    </div>
  );
}