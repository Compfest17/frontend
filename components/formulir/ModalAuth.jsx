'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import Link from 'next/link';

export default function ModalAuth({ isOpen, onClose }) {
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-[#DD761C]" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Anda harus login terlebih dahulu
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Untuk mengirim laporan, Anda perlu masuk ke akun terlebih dahulu. 
            Anda tetap bisa melihat dan mengisi formulir, namun untuk mengirim laporan diperlukan login.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Tetap disini
            </button>
            <Link
              href="/login"
              className="flex-1 px-6 py-3 bg-[#DD761C] text-white rounded-lg font-medium hover:bg-[#DD761C]/90 transition-colors duration-200"
            >
              Ya, Login
            </Link>
          </div>

          {/* Register Link */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link 
                href="/register" 
                className="text-[#DD761C] hover:text-[#DD761C]/80 font-medium transition-colors duration-200"
              >
                Daftar disini
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
