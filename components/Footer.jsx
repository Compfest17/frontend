import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#DD761C] text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h2 className="text-2xl font-bold mb-4">GatotKota</h2>
            <div className="mb-4">
              <p className="font-semibold mb-2">PT GatotKota</p>
              <p className="text-sm leading-relaxed">
                Gedung Rektorat Lantai 2<br />
                Jl. Veteran No.10-11, Ketawanggede, Kec.<br />
                Lowokwaru, Kota Malang, Jawa Timur, 65145.
              </p>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h3 className="font-bold text-lg mb-4">Pages</h3>
            <div className="space-y-2">
              <Link href="/" className="block hover:text-orange-200 transition-colors">
                Beranda
              </Link>
              <Link href="/formulir" className="block hover:text-orange-200 transition-colors">
                Buat Laporan
              </Link>
              <Link href="/forum" className="block hover:text-orange-200 transition-colors">
                Forum
              </Link>
              <Link href="/statistik" className="block hover:text-orange-200 transition-colors">
                Statistik
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Address</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span className="text-sm">edutech@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span className="text-sm">082145678901</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-orange-300 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-center md:text-left mb-4 md:mb-0">
              © 2025 GatotKota. All Rights Reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 border border-white rounded hover:bg-white hover:text-[#DD761C] transition-colors">
                <Facebook size={16} />
              </Link>
              <Link href="#" className="p-2 border border-white rounded hover:bg-white hover:text-[#DD761C] transition-colors">
                <Instagram size={16} />
              </Link>
              <Link href="#" className="p-2 border border-white rounded hover:bg-white hover:text-[#DD761C] transition-colors">
                <Linkedin size={16} />
              </Link>
              <Link href="#" className="p-2 border border-white rounded hover:bg-white hover:text-[#DD761C] transition-colors">
                <Twitter size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}