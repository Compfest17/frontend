"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { resetPassword } from '@/lib/supabase-auth';
import { getAuthError } from '@/lib/authUtils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        throw new Error(error.message);
      }

      console.log('Reset password email sent to:', email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(getAuthError(error, 'reset'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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

          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Email Terkirim!
              </h1>
              <p className="text-gray-600 mb-6">
                Kami telah mengirimkan link reset password ke email <strong>{email}</strong>. 
                Silakan cek email Anda dan ikuti instruksi untuk mereset password.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Tidak menerima email? Cek folder spam atau coba kirim ulang dalam beberapa menit.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full text-white font-medium py-3 rounded-full transition duration-200"
                style={{ backgroundColor: '#DD761C' }}
              >
                Kirim Ulang Email
              </button>
              
              <Link 
                href="/login"
                className="block w-full font-medium py-3 transition duration-200 hover:opacity-80"
                style={{ color: '#DD761C' }}
              >
                Kembali ke Login
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 relative h-screen">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          <div className="absolute inset-0">
            <img
              src="/image/Rectangle.png"
              alt="Construction worker"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
            <div className="max-w-md">
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Reset your password easily
              </h2>
              <div className="mb-8">
                <p className="text-lg font-medium">Security first</p>
                <p className="text-sm opacity-90">We've got your back</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Lupa Password?
            </h1>
            <p className="text-gray-600">
              Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                EMAIL
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                style={{ 
                  borderBottomColor: email ? '#DD761C' : undefined,
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#DD761C'}
                onBlur={(e) => e.target.style.borderBottomColor = email ? '#DD761C' : '#d1d5db'}
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
              {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>

            <div className="text-center">
              <Link 
                href="/login" 
                className="font-medium hover:opacity-80 transition-all duration-200"
                style={{ color: '#DD761C' }}
              >
                ← Kembali ke Login
              </Link>
            </div>
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
              Kami Siap Membantu
            </h2>
            <div className="mb-8">
              <p className="text-lg font-medium">GatotKota</p>
              <p className="text-sm opacity-90">Reset password dengan mudah dan aman</p>
            </div>
            
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-white bg-opacity-30"></div>
              <div className="w-3 h-3 rounded-full bg-white bg-opacity-50"></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DD761C' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
