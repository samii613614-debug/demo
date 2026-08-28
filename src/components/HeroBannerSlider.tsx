import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { BannerAd } from '../types';

interface HeroBannerSliderProps {
  banners: BannerAd[];
  onBannerClick: (categoryId: string) => void;
}

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({
  banners,
  onBannerClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3.5">
      <div 
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-sky-100 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Banner Graphics & Background matching the image */}
        <div className="relative min-h-[170px] sm:min-h-[220px] md:min-h-[260px] bg-gradient-to-r from-[#cae9ff] via-[#b9e2fe] to-[#80c7fc] flex items-center justify-between p-4 sm:p-7 md:p-8 cursor-pointer select-none"
             onClick={() => onBannerClick(currentBanner.categoryId)}>
          
          {/* Cloud & Ambient Light Background Textures */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none"></div>
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/60 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 right-1/3 w-64 h-64 bg-sky-200/50 rounded-full blur-3xl pointer-events-none"></div>

          {/* Left Content Area (Mega Cool Offer Banner in Bengali & English) */}
          <div className="relative z-10 max-w-[58%] sm:max-w-[62%] space-y-1.5 sm:space-y-2.5">
            {/* Top Tag */}
            <div className="inline-flex items-center space-x-1 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-sky-200 text-[#003893] text-[10px] sm:text-xs font-bold shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{currentBanner.badge}</span>
            </div>

            {/* Stylized Bengali Title like "মেগা কুল" with 3D shadow effect */}
            <div className="flex flex-col">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#003893] drop-shadow-xs font-['Hind_Siliguri',sans-serif]">
                {currentBanner.title}
              </h2>
              <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 mt-0.5">
                {currentBanner.subtitle}
              </p>
            </div>

            {/* Offer Price Box */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-white/95 to-sky-50 px-3 sm:px-4 py-1.5 rounded-xl border border-sky-300/80 shadow-xs">
              <span className="text-[11px] sm:text-xs font-medium text-slate-600">
                {currentBanner.offerTag}:
              </span>
              <span className="text-lg sm:text-2xl font-black text-[#E31E24] tracking-tight font-['Hind_Siliguri',sans-serif]">
                {currentBanner.priceTag}
              </span>
            </div>

            {/* Trust Points (Free installation, 0% EMI, Warranty) */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 hidden xs:flex">
              {currentBanner.features.slice(0, 2).map((feat, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-medium text-slate-700 bg-white/75 px-2 py-0.5 rounded-md border border-sky-200"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right Product Showcase */}
          <div className="relative z-10 w-[38%] sm:w-[35%] flex items-center justify-center">
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              {/* Product Glow */}
              <div className="absolute inset-0 bg-white/40 rounded-full blur-xl transform scale-110"></div>
              <img
                src={currentBanner.image}
                alt={currentBanner.title}
                className="relative z-10 max-h-[120px] sm:max-h-[160px] md:max-h-[190px] w-auto object-contain drop-shadow-md rounded-lg"
              />
              <div className="absolute -bottom-2 right-2 bg-slate-900/80 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                DEMO COMPANY
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer z-20 border border-slate-200/50"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer z-20 border border-slate-200/50"
          aria-label="Next Banner"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? 'w-5 bg-[#003893]' : 'w-1.5 bg-slate-400/60 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
