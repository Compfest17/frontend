'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Formulir', href: '/formulir' },
    { name: 'Forum', href: '/forum' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo dan Nama Aplikasi */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/next.svg"
            alt="Next.js logo"
            width={80}
            height={16}
          />
          <span className="font-bold text-lg">ProyekUji</span>
        </Link>

        {/* Menu Navigasi */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-gray-600 hover:text-black transition-colors ${
                pathname === item.href ? 'font-bold text-black' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Tombol Login */}
        <Link 
          href="/login" 
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Login
        </Link>
      </div>
    </header>
  );
}