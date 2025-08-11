import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className=" flex flex-col bg-cover bg-center h-screen items-center justify-center text-center py-auto sm:py-20" style={{backgroundImage:"url('/hero-img.svg')"}}>

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 flex ">
        Selamat Datang di GatotKota
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
        Semua informasi penting Anda dalam satu tempat. Kelola proyek, lihat statistik, dan tetap terhubung dengan tim Anda.
      </p>
      <Link
        href="/laporan"
        className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg"
      >
        Lihat Laporan
      </Link>
    </section>
  );
}