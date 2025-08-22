'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MobileSidebarTrigger() {
  const router = useRouter();

  const handleCreateReport = () => {
    router.push('/formulir');
  };

  return (
    <motion.button
      onClick={handleCreateReport}
      className="fixed bottom-6 right-6 z-50 lg:hidden bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors flex items-center gap-2 mb-20"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </motion.button>
  );
}
