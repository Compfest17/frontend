import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="text-center py-16 sm:py-20">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
        Selamat Datang di Dashboard Anda
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
        Semua informasi penting Anda dalam satu tempat. Kelola proyek, lihat statistik, dan tetap terhubung dengan tim Anda.
      </p>
      <Link
        href="/laporan"
        className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg"
      >
        Lihat Laporansss
      </Link>
    </section>
  );
}