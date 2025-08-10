import HeroSection from './components/HeroSection';
import SectionTwo from './components/SectionTwo';

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6">
      <main className="space-y-12 sm:space-y-16">
        <HeroSection />
        <SectionTwo />
      </main>
    </div>
  );
}