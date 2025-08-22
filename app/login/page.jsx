"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { signIn, signInWithGoogle } from '@/lib/supabase-auth';
import { getAuthError } from '@/lib/authUtils';
import BannerSlider from '@/components/auth/BannerSlider';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('invalid credentials') ||
            error.message.includes('Invalid email or password')) {
          setError('Email atau password salah. Silakan coba lagi.');
        } else if (error.message.includes('Email not confirmed') || 
                   error.message.includes('not confirmed')) {
          setError('Email belum diverifikasi. Silakan cek email untuk verifikasi.');
        } else if (error.message.includes('invalid') && error.message.includes('email')) {
          setError('Format email tidak valid. Silakan masukkan email yang benar.');
        } else if (error.message.includes('Network') || error.message.includes('network')) {
          setError('Koneksi bermasalah. Silakan coba lagi.');
        } else if (error.message.includes('Too many requests')) {
          setError('Terlalu banyak percobaan login. Silakan tunggu beberapa saat.');
        } else {
          setError(getAuthError(error, 'login'));
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log('Login successful:', data);
        localStorage.setItem('supabase_session', JSON.stringify(data.session));
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${data.session.access_token}` }
          });
          if (res.ok) {
            const profile = await res.json();
            const role = profile?.data?.user?.role;
            if (role === 'admin' || role === 'karyawan') {
              router.push('/dashboard');
            } else {
              router.push('/forum');
            }
          } else {
            router.push('/forum');
          }
        } catch (_) {
          router.push('/forum');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      if (error.message.includes('Invalid login credentials') || 
          error.message.includes('invalid credentials') ||
          error.message.includes('Invalid email or password')) {
        setError('Email atau password salah. Silakan coba lagi.');
      } else if (error.message.includes('Email not confirmed') || 
                 error.message.includes('not confirmed')) {
        setError('Email belum diverifikasi. Silakan cek email untuk verifikasi.');
      } else if (error.message.includes('invalid') && error.message.includes('email')) {
        setError('Format email tidak valid. Silakan masukkan email yang benar.');
      } else if (error.message.includes('Network') || error.message.includes('network')) {
        setError('Koneksi bermasalah. Silakan coba lagi.');
      } else if (error.message.includes('Too many requests')) {
        setError('Terlalu banyak percobaan login. Silakan tunggu beberapa saat.');
      } else {
        setError(getAuthError(error, 'login'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
          setError(getAuthError(error, 'login'));
        }
        return;
      }
      
    } catch (error) {
      console.error('Google sign in failed:', error);
      
      if (error.message.includes('popup') || error.message.includes('cancelled')) {
        setError('Login dengan Google dibatalkan. Silakan coba lagi.');
      } else if (error.message.includes('blocked') || error.message.includes('popup_blocked')) {
        setError('Popup diblokir browser. Silakan izinkan popup dan coba lagi.');
      } else {
        setError(getAuthError(error, 'login'));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const bannerSlides = [
    {
      title: "Laporkan Infrastruktur Rusak",
      subtitle: "Platform Pelaporan Infrastruktur",
      image: "/image/auth/Slider1.jpg",
      alt: "Infrastructure reporting platform"
    },
    {
      title: "Bersama Membangun Kota",
      subtitle: "Partisipasi aktif untuk infrastruktur yang lebih baik",
      image: "/image/auth/Slider2.jpg",
      alt: "Community participation"
    },
    {
      title: "Aksi Cepat Tanggap",
      subtitle: "Respons cepat untuk setiap laporan masyarakat",
      image: "/image/auth/Slider3.png",
      alt: "Quick response system"
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
              Selamat Datang
            </h1>
            <p className="text-gray-600">
              Belum memiliki akun?{' '}
              <Link href="/register" className="hover:opacity-80 font-medium transition-all duration-200" style={{ color: '#DD761C' }}>
                Sign Up
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                EMAIL
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
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan Password"
                  className="w-full px-0 py-3 pr-10 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                  style={{ 
                    borderBottomColor: formData.password ? '#DD761C' : undefined,
                  }}
                  onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                  onBlur={(e) => e.target.style.borderBottomColor = formData.password ? '#DD761C' : '#d1d5db'}
                  required
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
            </div>

            <div className="text-left">
              <Link href="/forgot-password" className="text-sm font-medium hover:opacity-80 transition-all duration-200" style={{ color: '#DD761C' }}>
                Forget password
              </Link>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full text-white font-medium py-4 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#DD761C' }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
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
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
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
              {isGoogleLoading ? 'Signing in with Google...' : 'Sign In with Google'}
            </button>
          </form>
        </div>
      </div>

      <BannerSlider slides={bannerSlides} />
    </div>
  );
}