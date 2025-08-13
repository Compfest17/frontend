'use client';

import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';
import Navbar from './Navbar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const authPages = ['/login', '/register', '/forgot-password', '/auth/reset-password'];
  const isAuthPage = authPages.includes(pathname);

  if (isAuthPage) {
    return children; 
  }
  
  return (
    <>
      <Navbar />
      <MainLayout>
        <main className="pt-20 md:pt-24">
          {children}
        </main>
      </MainLayout>
    </>
  );
}