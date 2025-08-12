import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative px-30">
      <div className='mx-auto'>
        <div className='grid grid-cols-2 '>
          <div className='flex justify-center flex-col'>
            <p className='mb-10 text-base text-zinc-500'>
              Anda Lapor, Kami Meluncur, Jayakan Infrastruktur
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold">
            Gatot Kota
            </h1>
            <h3 className="max-w-2xl text-3xl text-gray-600 mb-2">
              Laporan Infrastruktur Rusak
            </h3>
            <p className='mb-4 mx-auto'>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aut, mollitia officiis tenetur provident sunt nam laudantium nihil aperiam a consequuntur nulla odio quidem vitae delectus doloremque maxime, facere voluptas? Incidunt?
            </p>
            <Link
              href="/laporan"
              className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg w-fit"
            >
              Lihat Laporan
            </Link>
          </div>
          <div className='relative mx-auto w-full justify-end flex'>
            <img src="/hero-img.svg" alt="" className='h-auto w-{300}' />
          </div>
        </div>
      </div>
    </section>
  );
}