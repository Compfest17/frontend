"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { signUp, signInWithGoogle } from '@/lib/supabase-auth';
import { validatePassword, getAuthError } from '@/lib/authUtils';
import PasswordStrength from '@/components/PasswordStrength';
import BannerSlider from '@/components/auth/BannerSlider';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak sama');
      setIsLoading(false);
      return;
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setError(`Password: ${passwordErrors.join(', ')}`);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp(
        formData.email, 
        formData.password, 
        formData.full_name,
        formData.referralCode
      );

      if (error) {
        if (error.message.includes('User already registered') || 
            error.message.includes('already registered') ||
            error.message.includes('already been registered')) {
          setError('Email sudah terdaftar. Silakan gunakan email lain atau login.');
        } else if (error.message.includes('invalid') && error.message.includes('email')) {
          setError('Format email tidak valid. Silakan masukkan email yang benar.');
        } else if (error.message.includes('Password') || error.message.includes('password')) {
          setError('Password tidak memenuhi kriteria. Pastikan minimal 8 karakter dengan kombinasi huruf dan angka.');
        } else if (error.message.includes('Network') || error.message.includes('network')) {
          setError('Koneksi bermasalah. Silakan coba lagi.');
        } else {
          setError(getAuthError(error, 'register'));
        }
        setIsLoading(false);
        return;
      }

      console.log('Register successful:', data);
      
      if (data.user) {
        setSuccess('Akun berhasil dibuat! Silakan cek email untuk verifikasi.');
        
        setTimeout(() => {
          router.push('/login?message=Please check your email to verify your account');
        }, 2000);
      }
    } catch (error) {
      console.error('Register failed:', error);
      
      if (error.message.includes('User already registered') || 
          error.message.includes('already registered') ||
          error.message.includes('already been registered')) {
        setError('Email sudah terdaftar. Silakan gunakan email lain atau login.');
      } else if (error.message.includes('invalid') && error.message.includes('email')) {
        setError('Format email tidak valid. Silakan masukkan email yang benar.');
      } else if (error.message.includes('Password') || error.message.includes('password')) {
        setError('Password tidak memenuhi kriteria. Pastikan minimal 8 karakter dengan kombinasi huruf dan angka.');
      } else if (error.message.includes('Network') || error.message.includes('network')) {
        setError('Koneksi bermasalah. Silakan coba lagi.');
      } else {
        setError(getAuthError(error, 'register'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      setError('');
      
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        if (error.message.includes('popup') || error.message.includes('cancelled')) {
          setError('Login dengan Google dibatalkan. Silakan coba lagi.');
        } else if (error.message.includes('blocked') || error.message.includes('popup_blocked')) {
          setError('Popup diblokir browser. Silakan izinkan popup dan coba lagi.');
        } else {
          setError(getAuthError(error, 'register'));
        }
        return;
      }
      
    } catch (error) {
      console.error('Google sign up failed:', error);
      
      if (error.message.includes('popup') || error.message.includes('cancelled')) {
        setError('Login dengan Google dibatalkan. Silakan coba lagi.');
      } else if (error.message.includes('blocked') || error.message.includes('popup_blocked')) {
        setError('Popup diblokir browser. Silakan izinkan popup dan coba lagi.');
      } else {
        setError(getAuthError(error, 'register'));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const bannerSlides = [
    {
      title: "Bergabung dengan Komunitas",
      subtitle: "Mari membangun infrastruktur yang lebih baik",
      image: "/image/auth/Slider1.jpg",
      alt: "Join the community"
    },
    {
      title: "Suara Anda Penting",
      subtitle: "Setiap laporan berkontribusi untuk kemajuan kota",
      image: "/image/auth/Slider2.jpg",
      alt: "Your voice matters"
    },
    {
      title: "Infrastruktur Berkelanjutan",
      subtitle: "Bersama menciptakan lingkungan yang nyaman",
      image: "/image/auth/Slider3.png",
      alt: "Sustainable infrastructure"
    }
  ];

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="flex-1 flex items-center justify-center bg-white px-8 lg:px-16 relative">
        <Link 
          href="/"
          className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Kembali</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#DD761C' }}>
              Daftar Akun
            </h1>
            <p className="text-gray-600">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="hover:opacity-80 font-medium transition-all duration-200" style={{ color: '#DD761C' }}>
                Sign In
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                NAMA LENGKAP *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap"
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                style={{ 
                  borderBottomColor: formData.full_name ? '#DD761C' : undefined,
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                onBlur={(e) => e.target.style.borderBottomColor = formData.full_name ? '#DD761C' : '#d1d5db'}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                KODE REFERAL (Optional)
              </label>
              <input
                type="text"
                id="referralCode"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleInputChange}
                placeholder="Masukkan kode referal untuk menjadi karyawan"
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                style={{ 
                  borderBottomColor: formData.referralCode ? '#DD761C' : undefined,
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                onBlur={(e) => e.target.style.borderBottomColor = formData.referralCode ? '#DD761C' : '#d1d5db'}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                EMAIL *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Masukkan email"
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                style={{ 
                  borderBottomColor: formData.email ? '#DD761C' : undefined,
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                onBlur={(e) => e.target.style.borderBottomColor = formData.email ? '#DD761C' : '#d1d5db'}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                PASSWORD *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password"
                  className="w-full px-0 py-3 pr-10 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                  style={{ 
                    borderBottomColor: formData.password ? '#DD761C' : undefined,
                  }}
                  onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                  onBlur={(e) => e.target.style.borderBottomColor = formData.password ? '#DD761C' : '#d1d5db'}
                  required
                  disabled={isLoading}
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
              <PasswordStrength password={formData.password} />
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
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Konfirmasi password"
                  className="w-full px-0 py-3 pr-10 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                  style={{ 
                    borderBottomColor: formData.confirmPassword ? '#DD761C' : undefined,
                  }}
                  onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                  onBlur={(e) => e.target.style.borderBottomColor = formData.confirmPassword ? '#DD761C' : '#d1d5db'}
                  required
                  disabled={isLoading}
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
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-3"></div>
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isGoogleLoading ? 'Creating account...' : 'Sign Up with Google'}
            </button>
          </form>
        </div>
      </div>

      <BannerSlider slides={bannerSlides} />
    </div>
  );
}