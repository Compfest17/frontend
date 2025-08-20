'use client';

import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';
import Navbar from './Navbar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const authPages = ['/login', '/register', '/forgot-password', '/auth/reset-password'];
  const forumPages = ['/forum'];
  const isAuthPage = authPages.includes(pathname);
  const isForumPage = pathname.startsWith('/forum');

  if (isAuthPage || isForumPage) {
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