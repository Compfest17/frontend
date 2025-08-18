export default function AboutHero() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-[#DD761C] tracking-wide uppercase">
                About GatotKota
              </h2>
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900">
                Anda Lapor, <br />
                <span className="text-[#DD761C]">Kami Meluncur</span>
              </h1>
            </div>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                <strong>GatotKota</strong> adalah platform digital inovatif yang menghubungkan masyarakat dengan pemerintah 
                dalam upaya pelaporan dan perbaikan infrastruktur kota yang rusak.
              </p>
              
              <p>
                Melalui platform ini, setiap warga dapat dengan mudah melaporkan kondisi infrastruktur 
                yang memerlukan perbaikan seperti jalan berlubang, lampu jalan mati, drainase tersumbat, 
                dan berbagai masalah infrastruktur lainnya.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Fitur Utama:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#DD761C] font-bold mr-2">•</span>
                    <span><strong>Pelaporan Real-time:</strong> Laporkan infrastruktur rusak dengan foto dan lokasi GPS yang akurat</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#DD761C] font-bold mr-2">•</span>
                    <span><strong>Forum Diskusi:</strong> Berpartisipasi dalam diskusi terbuka tentang pembangunan kota</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#DD761C] font-bold mr-2">•</span>
                    <span><strong>Tracking Status:</strong> Pantau progress perbaikan infrastruktur yang dilaporkan</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#DD761C] font-bold mr-2">•</span>
                    <span><strong>Peta Interaktif:</strong> Visualisasi sebaran masalah infrastruktur di seluruh kota</span>
                  </li>
                </ul>
              </div>
              
              <p>
                Dengan <strong>GatotKota</strong>, kami percaya bahwa partisipasi aktif masyarakat adalah kunci 
                untuk menciptakan kota yang lebih baik, aman, dan nyaman untuk semua.
              </p>
            </div>
          </div>

          <div 
            className="relative rounded-2xl overflow-hidden min-h-[500px] lg:min-h-[600px] flex items-center justify-center"
            style={{
              backgroundImage: `linear-gradient(rgba(221, 118, 28, 0.1), rgba(197, 102, 26, 0.1)), url('/image/auth/Slider1.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="text-center text-white p-8">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-[#DD761C]">
                Jayakan Infrastruktur
              </h3>
              <p className="text-lg text-gray-800 font-medium">
                Bersama membangun kota yang lebih baik
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
