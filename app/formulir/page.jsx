'use client';

import { useState, useEffect } from 'react';
import BannerFormulir from './components/BannerFormulir';
import Formulir from './components/Formulir';
import ModalAuth from '@/components/formulir/ModalAuth';
import { getCurrentUser } from '@/lib/supabase-auth';
import { PendingUploadsProvider } from '@/contexts/PendingUploadsContext';

export default function FormulirPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { user } = await getCurrentUser();
        let mergedUser = user;
        if (user?.access_token) {
          try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
              headers: { 'Authorization': `Bearer ${user.access_token}` }
            });
            if (res.ok) {
              const profile = await res.json();
              mergedUser = { ...user, ...profile.data.user };
            }
          } catch (_) {}
        }
        setUser(mergedUser);
        if (!mergedUser) {
          setShowAuthModal(true);
        }
      } catch (error) {
        setUser(null);
        setShowAuthModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  const handleShowAuthModal = () => {
    setShowAuthModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DD761C]"></div>
      </div>
    );
  }

  return (
    <PendingUploadsProvider>
      <div className="min-h-screen bg-white relative">
        <BannerFormulir />
        <div className="container mx-auto p-4 sm:p-6 mt-8 relative z-40">
          <Formulir user={user} onAuthRequired={handleShowAuthModal} />
        </div>
        
        {/* Background Image */}
        <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none">
          <img 
            src="/image/formulir/BackgroundFormulir.svg"
            alt="Background"
            className="w-full h-auto"
          />
        </div>
        
        {/* Spacer to prevent footer overlap */}
        <div className="h-32"></div>

        {/* Auth Modal */}
        <ModalAuth isOpen={showAuthModal} onClose={handleCloseModal} />
      </div>
    </PendingUploadsProvider>
  );
}