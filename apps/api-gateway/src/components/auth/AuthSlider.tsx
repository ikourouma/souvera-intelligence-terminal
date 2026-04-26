'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TrendingUp, Globe2, Building2, ShieldCheck } from 'lucide-react';

const marketingSlides = [
  {
    title: "Sovereign-grade intelligence for the African expansion.",
    subtitle: "Direct access to real-time macroeconomic signals, infrastructure pipelines, and verified deal-flow across 54 African nations.",
    stat_1_val: "54",
    stat_1_label: "Sovereign Nodes",
    stat_2_val: "$1.9T",
    stat_2_label: "Regional GDP",
    bg_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Unlocking Caribbean trade and logistics corridors.",
    subtitle: "Navigate the complex regulatory and investment landscape of CARICOM with institutional-level data density and predictive analytics.",
    stat_1_val: "20+",
    stat_1_label: "Active Markets",
    stat_2_val: "15M",
    stat_2_label: "Market Reach",
    bg_image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Strategic capital allocation via the Signal Engine.",
    subtitle: "Our proprietary weighting system correlates World Bank, IMF, and localized data to identify the fastest-growing emerging sectors.",
    stat_1_val: "4K+",
    stat_1_label: "Data Points",
    stat_2_val: "15min",
    stat_2_label: "Signal Refresh",
    bg_image: "https://images.unsplash.com/photo-1575883833722-e1903ba8fe39?q=80&w=2070&auto=format&fit=crop"
  }
];

export function AuthSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const marketingTextRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      
      gsap.to(marketingTextRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          setCurrentSlide((prev) => (prev + 1) % marketingSlides.length);
          setTimeout(() => {
            gsap.fromTo(marketingTextRef.current, 
              { opacity: 0, y: -10 },
              { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
            );
            setIsTransitioning(false);
          }, 50);
        }
      });
    }, 8000);
    
    return () => clearInterval(interval);
  }, [isTransitioning]);

  const activeSlide = marketingSlides[currentSlide];

  return (
    <div className="w-full md:w-1/2 relative min-h-[40vh] md:min-h-screen hidden md:flex items-end p-12 lg:p-20 border-r border-zinc-800 bg-zinc-950">
      <div 
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center filter brightness-[0.3] transition-all duration-1000 ease-in-out" 
        style={{ backgroundImage: `url('${activeSlide.bg_image}')` }} 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500" />
      
      <div className="relative z-10 w-full max-w-xl" ref={marketingTextRef}>
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-zinc-800/80 border border-zinc-700/50 mb-6 rounded-sm backdrop-blur-md">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold tracking-wide text-zinc-300 uppercase font-mono">Souvera Intelligence Network</span>
        </div>
        
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {activeSlide.title}
        </h2>
        
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed font-medium">
          {activeSlide.subtitle}
        </p>

        <div className="grid grid-cols-2 gap-6 border-t border-zinc-800 pt-8">
          <div>
            <div className="text-3xl font-black text-white mb-1 font-mono tracking-tighter">{activeSlide.stat_1_val}</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">{activeSlide.stat_1_label}</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white mb-1 font-mono tracking-tighter">{activeSlide.stat_2_val}</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">{activeSlide.stat_2_label}</div>
          </div>
        </div>
      </div>

      {/* Pagination Pips */}
      <div className="absolute bottom-8 left-12 lg:left-20 flex space-x-2 z-20">
        {marketingSlides.map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-blue-500' : 'w-4 bg-zinc-700'}`} />
        ))}
      </div>
    </div>
  );
}
