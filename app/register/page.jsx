"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp, signInWithGoogle } from '@/lib/supabase-auth';
import { validatePassword, getAuthError } from '@/lib/authUtils';
import PasswordStrength from '@/components/PasswordStrength';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
        formData.full_name
      );

      if (error) {
        throw new Error(error.message);
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
      setError(getAuthError(error, 'register'));
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
        setError(getAuthError(error, 'register'));
        return;
      }
      
    } catch (error) {
      console.error('Google sign up failed:', error);
      setError(getAuthError(error, 'register'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#DD761C' }}>
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
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Masukkan password"
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                style={{ 
                  borderBottomColor: formData.password ? '#DD761C' : undefined,
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                onBlur={(e) => e.target.style.borderBottomColor = formData.password ? '#DD761C' : '#d1d5db'}
                required
                disabled={isLoading}
              />
              <PasswordStrength password={formData.password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                KONFIRMASI PASSWORD *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Konfirmasi password"
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                style={{ 
                  borderBottomColor: formData.confirmPassword ? '#DD761C' : undefined,
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                onBlur={(e) => e.target.style.borderBottomColor = formData.confirmPassword ? '#DD761C' : '#d1d5db'}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-medium py-4 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#DD761C' }}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>

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

      <div className="hidden lg:flex flex-1 relative h-screen">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="absolute inset-0">
          <img
            src="/image/Rectangle.png"
            alt="Infrastructure"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white w-full">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Bergabung dengan Komunitas
            </h2>
            <div className="mb-8">
              <p className="text-lg font-medium">GatotKota</p>
              <p className="text-sm opacity-90">Mari membangun infrastruktur yang lebih baik</p>
            </div>
            
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-white bg-opacity-50"></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DD761C' }}></div>
              <div className="w-3 h-3 rounded-full bg-white bg-opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
