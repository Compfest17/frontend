"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function BannerSlider({ slides, autoSlide = true, autoSlideInterval = 5000 }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imageError, setImageError] = useState(false)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (autoSlide && slides.length > 1) {
      const interval = setInterval(nextSlide, autoSlideInterval)
      return () => clearInterval(interval)
    }
  }, [autoSlide, autoSlideInterval, slides.length])

  if (!slides || slides.length === 0) {
    return null
  }

  const currentImage = slides[currentSlide].image || "/image/Rectangle.png"

  return (
    <div className="hidden lg:flex flex-1 relative h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        {!imageError ? (
          <Image
            src={currentImage || "/placeholder.svg"}
            alt={slides[currentSlide].alt}
            fill
            className="object-cover object-center transition-opacity duration-500"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600"></div>
        )}
      </div>

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: "linear-gradient(to top, #77400F, rgba(255, 255, 255, 0))",
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white w-full">
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-4 leading-tight transition-all duration-500 text-white drop-shadow-lg">
              {slides[currentSlide].title}
            </h2>
            <div className="mb-8">
              <p className="text-lg font-medium text-white drop-shadow-lg">GatotKota</p>
              <p className="text-sm opacity-90 transition-all duration-500 text-white drop-shadow-lg">
                {slides[currentSlide].subtitle}
              </p>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-orange-500" : "bg-white bg-opacity-30 hover:bg-opacity-50"
                  }`}
                  style={{
                    backgroundColor: index === currentSlide ? "#DD761C" : undefined,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex space-x-2 text-sm text-white">
                <span>{currentSlide + 1}</span>
                <span className="opacity-70">of</span>
                <span>{slides.length}</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full border border-white border-opacity-30 flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-all duration-200 text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full border border-white border-opacity-30 flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-all duration-200 text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
