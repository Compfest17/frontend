'use client';

import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Logika bisa ditambahkan di sini jika perlu layout yang berbeda
  // untuk halaman tertentu, misal: /dashboard atau /login.
  
  return <MainLayout>{children}</MainLayout>;
}