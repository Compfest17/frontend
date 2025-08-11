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
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo dan Nama Aplikasi */}
        <Link href="/" className="flex items-center">
          <div className="w-fit shadow-sm rounded-2xl ">
            <Image
              src="/gatotkota-logo.svg"
              alt="Next.js logo"
              width={80}
              height={16}
              className="max-h-14"
          />
          </div>
          <div className="flex flex-col ">
            <span className="font-bold text-xl px-2">Gatot Kota</span>
            <span className="font-bold text-xs px-2 text-zinc-500">Anda Lapor, Kami Meluncur</span>
          </div>
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