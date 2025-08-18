'use client';

import AboutHero from './components/AboutHero';
import ContactSection from './components/ContactSection';
import ImpactSection from './components/ImpactSection';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AboutHero />
      <ContactSection />
      <ImpactSection />
    </div>
  );
}
