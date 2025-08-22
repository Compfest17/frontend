export default function BannerForum() {
  return (
    <div className="h-[300px] relative overflow-hidden text-white shadow-lg mb-1 sm:mb-2 w-full" style={{background: 'linear-gradient(to right, #DD761C, #DD761C)'}}>
      {/* Main Content Container */}
      <div className="relative z-20 h-full p-6 sm:p-8 flex items-center">
        {/* Left Side - Image */}
        <div className="w-1/2 flex justify-center items-center relative">
          {/* Background Circle */}
          <div className="absolute z-10">
            <div 
              className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full" 
              style={{
                backgroundColor: '#FDE49E',
                filter: 'drop-shadow(0 4px 8px #FDE49E)'
              }}
            ></div>
          </div>
          
          {/* Illustration */}
          <div className="relative z-30">
            <div className="w-[150px] sm:w-[180px] lg:w-[200px]">
              <img 
                src="/image/forum/MaskotBanner.svg"
                alt="Forum Banner" 
                className="w-full h-auto object-contain" 
              />
            </div>
          </div>
        </div>

        {/* Right Side - Text Content */}
        <div className="w-1/2 flex justify-center items-center">
          <div className="text-center">
            <h2 className="font-montserrat font-semibold mb-2 leading-tight text-xl sm:text-2xl lg:text-[48px]">
              Komunitas Pelapor
            </h2>
            {/* Mobile version */}
            <p className="font-montserrat font-normal opacity-90 leading-relaxed text-sm block sm:hidden">
              <span className="block">Bergabunglah dengan warga yang peduli untuk</span>
              <span className="block">membangun infrastruktur yang lebih baik</span>
            </p>
            {/* Desktop version */}
            <p className="font-montserrat font-normal opacity-90 leading-relaxed text-sm sm:text-base lg:text-[20px] hidden sm:block">
              <span className="block">Bergabunglah dengan warga yang peduli untuk</span>
              <span className="block">membangun infrastruktur yang lebih baik</span>
            </p>
          </div>
        </div>
        
        {/* Decorative dots - bottom right */}
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8">
          <div className="flex items-end gap-2">
            <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{backgroundColor: '#FDE49E'}}></span>
            <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#FDE49E'}}></span>
          </div>
        </div>
      </div>
    </div>
  )
}
