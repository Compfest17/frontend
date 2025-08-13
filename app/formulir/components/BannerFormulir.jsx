export default function BannerFormulir() {
  return (
    <div className="h-[240px] rounded-xl relative overflow-hidden text-white shadow-lg mb-1 sm:mb-2 mx-4 sm:mx-6 md:mx-8 lg:mx-auto lg:container mt-8 sm:mt-10" style={{background: 'linear-gradient(to right, #DD761C, #DD761C)'}}>
      {/* Main Content Container */}
      <div className="relative z-20 h-full p-6 sm:p-8">
        {/* Text Content */}
        <div className="max-w-[60%] sm:max-w-[50%] pt-4">
          <h2 className="font-montserrat font-semibold mb-2 leading-tight text-xl sm:text-2xl lg:text-[48px]">
            Buat Laporan Sekarang
          </h2>
          {/* Mobile version */}
          <p className="font-montserrat font-normal opacity-90 leading-relaxed text-sm block sm:hidden">
            Lanjutkan untuk<br />mengisi laporan
          </p>
          {/* Desktop version */}
          <p className="font-montserrat font-normal opacity-90 leading-relaxed text-sm sm:text-base lg:text-[20px] hidden sm:block">
            Lanjutkan untuk mengisi laporan
          </p>
        </div>
        
        {/* Decorative dots - bottom left */}
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
          <div className="flex items-end gap-2">
            <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{backgroundColor: '#FDE49E'}}></span>
            <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#FDE49E'}}></span>
          </div>
        </div>
      </div>

      {/* Background Circle */}
      <div className="absolute top-32 right-6 sm:top-14 sm:right-8 z-10">
        <div 
          className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full" 
          style={{
            backgroundColor: '#FDE49E',
            filter: 'drop-shadow(0 4px 8px #FDE49E)'
          }}
        ></div>
      </div>

      {/* Illustration */}
      <div className="absolute bottom-0 right-4 sm:right-6 z-30">
        <div className="w-[170px] sm:w-[200px] lg:w-[220px]">
          <img 
            src="/image/formulir/MaskotBanner.svg"
            alt="Subscription Banner" 
            className="w-full h-auto object-contain" 
          />
        </div>
      </div>
    </div>
  )
}
