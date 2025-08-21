import BannerFormulir from './components/BannerFormulir';
import Formulir from './components/Formulir';

export default function FormulirPage() {
  return (
    <div className="min-h-screen bg-white relative">
      <BannerFormulir />
      <div className="container mx-auto p-4 sm:p-6 mt-8 relative z-40">
        <Formulir />
      </div>
      
      {/* Background Image */}
      <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none">
        <img 
          src="/image/formulir/BackgroundFormulir.svg"
          alt="Background"
          className="w-full h-auto"
        />
      </div>
      
      {/* Spacer to prevent footer overlap */}
      <div className="h-32"></div>
    </div>
  );
}