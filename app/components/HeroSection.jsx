"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Bell, MessageSquare } from 'lucide-react';

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: (delay) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 1.0,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const cardLeftVariants = {
    hidden: {
      opacity: 0,
      x: -100,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 1.4,
      },
    },
  };

  const cardRightVariants = {
    hidden: {
      opacity: 0,
      x: 100,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 1.6,
      },
    },
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-4 lg:py-12">
      <div className='mx-auto max-w-7xl'>
        <motion.div 
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
          className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[600px]'
        >
          {/* Left Content */}
          <div className='flex justify-center flex-col text-center lg:text-left space-y-6'>
            <motion.p 
              custom={0.2}
              variants={textVariants}
              className='text-sm sm:text-base font-montserrat font-medium text-zinc-500'
            >
              Anda Lapor, Kami Meluncur, Jayakan Infrastruktur
            </motion.p>
            
            <div className="space-y-4">
              <motion.h1 
                custom={0.4}
                variants={textVariants}
                className="font-montserrat font-semibold leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                style={{ color: '#DD761C' }}
              >
                GatotKota
              </motion.h1>
              
              <motion.h3 
                custom={0.6}
                variants={textVariants}
                className="font-montserrat font-semibold text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl"
              >
                Laporan Infrastruktur Rusak
              </motion.h3>
            </div>
            
            <motion.p 
              custom={0.8}
              variants={textVariants}
              className='font-montserrat font-normal text-gray-700 max-w-lg mx-auto lg:mx-0 leading-relaxed text-sm sm:text-base md:text-lg lg:text-xl'
            >
              Platform pelaporan infrastruktur rusak yang memungkinkan masyarakat untuk melaporkan masalah infrastruktur dan berpartisipasi dalam pembangunan kota yang lebih baik.
            </motion.p>
            
            <motion.div
              variants={buttonVariants}
              className="pt-4"
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  transition: { 
                    duration: 0.2,
                    ease: "easeOut"
                  }
                }}
                whileTap={{ 
                  scale: 0.98,
                  transition: { 
                    duration: 0.1,
                    ease: "easeOut"
                  }
                }}
                className="inline-block"
              >
                <Link
                  href="/laporan"
                  className="inline-block text-white px-8 py-4 rounded-xl transition-colors duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: '#DD761C' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#C5661A'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#DD761C'}
                >
                  Lihat Laporan
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Content */}
          <div className='relative w-full flex justify-center lg:justify-end order-first lg:order-last'>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={isLoaded ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 50 }}
              transition={{
                duration: 1.2,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.6,
              }}
              className="relative w-full max-w-sm lg:max-w-md xl:max-w-lg"
            >
              <img 
                src="/heroimg.svg" 
                alt="Hero illustration" 
                className='h-auto w-full' 
              />
              
              {/* Floating Cards */}
              {/* Top Left - Laporan */}
              <motion.div
                variants={cardLeftVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -4,
                  transition: { duration: 0.3 }
                }}
                className="absolute top-20 -left-6 sm:top-24 sm:-left-10 md:top-32 md:-left-12 bg-white px-4 py-2.5 md:px-4 md:py-2.5 rounded-full shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-2.5">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isLoaded ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                    transition={{
                      delay: 1.6,
                      duration: 0.6,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#DD761C' }}
                  >
                    <Bell className="w-4 h-4 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={isLoaded ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 1.8, duration: 0.5 }}
                    className="font-semibold text-gray-800 text-sm md:text-base"
                  >
                    Laporan
                  </motion.div>
                </div>
              </motion.div>

              {/* Bottom Right - Forum Publik */}
              <motion.div
                variants={cardRightVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -4,
                  transition: { duration: 0.3 }
                }}
                className="absolute bottom-16 -right-2 sm:bottom-20 sm:-right-6 md:bottom-24 md:-right-10 bg-white px-4 py-2.5 md:px-4 md:py-2.5 rounded-full shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-2.5">
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={isLoaded ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 180 }}
                    transition={{
                      delay: 1.8,
                      duration: 0.6,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#DD761C' }}
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={isLoaded ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ delay: 2.0, duration: 0.5 }}
                    className="font-semibold text-gray-800 text-sm md:text-base"
                  >
                    Forum Publik
                  </motion.div>
                </div>
              </motion.div>

              {/* Background decoration */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={isLoaded ? { opacity: 0.1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ delay: 1.0, duration: 1.5 }}
                className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-3xl -z-10"
                style={{ backgroundColor: '#DD761C' }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={isLoaded ? { opacity: 0.1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ delay: 1.2, duration: 1.5 }}
                className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-3xl -z-10"
                style={{ backgroundColor: '#DD761C' }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}