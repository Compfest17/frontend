'use client';
import { useState, useEffect } from 'react';

export default function CarouselBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const banners = [
    {
      id: 1,
      title: "Laporkan Masalah Infrastruktur",
      subtitle: "Bersama membangun kota yang lebih baik",
      description: "Bergabunglah dengan komunitas untuk melaporkan dan memantau perbaikan infrastruktur di sekitar Anda",
      image: "/image/forum/banner1.jpg",
      bgColor: "from-orange-500 to-red-500"
    },
    {
      id: 2,
      title: "Forum Diskusi Warga",
      subtitle: "Suara Anda, Perubahan Nyata",
      description: "Diskusikan masalah lingkungan dan temukan solusi bersama warga lainnya",
      image: "/image/forum/banner2.jpg",
      bgColor: "from-blue-500 to-purple-500"
    },
    {
      id: 3,
      title: "Pantau Progres Laporan",
      subtitle: "Transparansi Penuh untuk Semua",
      description: "Lihat status dan progres setiap laporan yang telah diajukan ke pemerintah",
      image: "/image/forum/banner3.jpg",
      bgColor: "from-green-500 to-teal-500"
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative h-64 overflow-hidden border-b border-gray-200">
      {/* Carousel Content */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`min-w-full h-full bg-gradient-to-r ${banner.bgColor} relative flex items-center justify-center`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-8 right-8 w-8 h-8 border-2 border-white rounded-full"></div>
              <div className="absolute top-1/2 right-12 w-4 h-4 bg-white rounded-full"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 text-center text-white px-6 max-w-2xl">
              <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>
              <h3 className="text-xl font-medium mb-4 opacity-90">{banner.subtitle}</h3>
              <p className="text-sm opacity-80 leading-relaxed">{banner.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}