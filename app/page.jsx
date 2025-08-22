"use client";
import HeroSection from './components/HeroSection';
import SectionTwo from './components/KomunitasSection';
import FaqSection from './components/FaqSection';
import { useEffect, useState, useMemo } from 'react';
import ForumAPI from '../services/forumAPI';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/formulir/LeafletMap'), { ssr: false });

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ForumAPI.getHomeSummary();
        setSummary(res.data);
      } catch (_) {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markers = useMemo(() => (summary?.markers || []).map(m => ({
    lat: m.lat,
    lng: m.lng,
    status: m.status,
    popup: `<div class="p-2"><h4 class="font-bold text-sm">${m.title || ''}</h4><p class="text-xs text-gray-600">${m.address || ''}</p></div>`
  })), [summary]);

  return (
    <div className="container mx-auto px-4 sm:px-6">
      <main className="space-y-12 sm:space-y-16">
        <HeroSection />

        {/* Map Title */}
        <div className="max-w-5xl mx-auto mb-6 md:mb-8 text-center">
          <h2
            className="text-3xl md:text-4xl font-semibold leading-tight font-montserrat mb-6"
            style={{ color: '#DD761C' }}
          >
            Laporan Lokasi Infrastruktur
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Real Time Data Lokasi
          </p>
        </div>

        {/* Nationwide Map */}
        <section>
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <LeafletMap center={[-2.5489, 118.0149]} zoom={5} markers={markers} height="100%" />
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Terbuka</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Proses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Selesai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Dibatalkan</span>
            </div>
          </div>
        </section>

        <SectionTwo />
        <FaqSection />
      </main>
    </div>
  );
}