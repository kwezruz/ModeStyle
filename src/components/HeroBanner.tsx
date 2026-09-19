import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Flame, Tag } from 'lucide-react';
import { BannerSlide } from '../types';
import { INITIAL_BANNERS } from '../data/mockData';

interface HeroBannerProps {
  onSelectCategory: (cat: string) => void;
  banners?: BannerSlide[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory, banners }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slidesToRender = banners && banners.length > 0 ? banners : INITIAL_BANNERS;

  useEffect(() => {
    if (isPaused || slidesToRender.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slidesToRender.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, slidesToRender.length]);

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % slidesToRender.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + slidesToRender.length) % slidesToRender.length);
  };

  return (
    <div
      className="w-full relative rounded-3xl bg-black text-white overflow-hidden border border-zinc-800 shadow-xl min-h-[320px] sm:min-h-[380px] select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slidesToRender.map((slide, idx) => {
        const isActive = idx === currentIdx;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out scale-105 opacity-85"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            {/* Soft, balanced overlay so text stays readable while image is clearly bright and vibrant */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:to-black/10" />
            <div className="relative z-10 h-full p-6 sm:p-10 max-w-2xl flex flex-col justify-between">
              <div className="space-y-3 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black text-[11px] font-mono font-bold uppercase tracking-wider">
                  {slide.badgeIcon === 'flame' && <Flame className="w-3.5 h-3.5" />}
                  {slide.badgeIcon === 'sparkles' && <Sparkles className="w-3.5 h-3.5" />}
                  {slide.badgeIcon === 'tag' && <Tag className="w-3.5 h-3.5" />}
                  <span>{slide.badge}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed">
                  {slide.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-6 pb-2">
                <button
                  type="button"
                  onClick={() => onSelectCategory(slide.category || 'all')}
                  className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs sm:text-sm font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>{slide.btnText || "Ko'rish"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {slidesToRender.length > 1 && (
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="w-8 h-8 rounded-xl bg-black/70 hover:bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-8 h-8 rounded-xl bg-black/70 hover:bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
