"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Factory, Cpu, TrendingUp, Users, Globe2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function DualMandate() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%",
        end: "bottom 80%",
        toggleActions: "play none none reverse",
      }
    });

    tl.fromTo(
      ".mandate-header",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo(
      ".mandate-card-nc",
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
      "-=0.7"
    )
    .fromTo(
      ".mandate-card-africa",
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
      "-=0.8"
    )
    .fromTo(
      ".mandate-stat",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)" },
      "-=0.5"
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-32 bg-zinc-950 relative border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mandate-header text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">The Dual Mandate.</h2>
          <p className="text-lg text-zinc-400">
            AfDEC bridges the top-ranked business environment of North Carolina with the world's most rapid economic expansion across the African continent. Unlocking sovereign-level infrastructure for mutual enterprise growth.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* North Carolina Advantage */}
          <div className="mandate-card-nc bg-zinc-950 border border-zinc-800 p-10 md:p-14 relative overflow-hidden group">
            {/* Contextual Image Background */}
            <div 
              className="absolute inset-0 grayscale opacity-10 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601058268499-e52658b8ebf8?q=80&w=1000&auto=format&fit=crop')" }}
            />
            {/* Primary Gradient Overlay to protect text */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950/90 to-blue-900/10" />
            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 text-blue-400 font-bold text-xs mb-6 uppercase tracking-widest border border-blue-500/20 rounded-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>The North Carolina Advantage</span>
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">Capital Infrastructure.</h3>
              <p className="text-zinc-400 mb-10 leading-relaxed font-medium">
                Ranked as America's Top State for Business, NC provides the ideal springboard for global enterprise, anchored by a low corporate tax rate, world-class university research, and immense clean energy capacity.
              </p>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="mandate-stat border-l-2 border-zinc-800 pl-4">
                  <Factory className="w-5 h-5 text-blue-400 mb-3" />
                  <div className="font-bold text-white text-lg">Megasites</div>
                  <div className="text-sm text-zinc-500 mt-1">Tier 1 Industrial Zones</div>
                </div>
                <div className="mandate-stat border-l-2 border-zinc-800 pl-4">
                  <Cpu className="w-5 h-5 text-blue-400 mb-3" />
                  <div className="font-bold text-white text-lg">Tech Talent</div>
                  <div className="text-sm text-zinc-500 mt-1">Research Triangle Park</div>
                </div>
              </div>

              <Link href="#" className="inline-flex items-center text-zinc-300 font-semibold hover:text-white transition-colors group/link mt-auto">
                Explore NC Expansion Criteria 
                <div className="ml-3 p-1.5 rounded-full bg-zinc-800 group-hover/link:bg-blue-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>

          {/* African Growth Mandate */}
          <div className="mandate-card-africa bg-zinc-950 border border-zinc-800 p-10 md:p-14 relative overflow-hidden group">
            {/* Contextual Image Background */}
             <div 
              className="absolute inset-0 grayscale opacity-15 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=1000&auto=format&fit=crop')" }}
            />
            {/* Primary Gradient Overlay to protect text */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950/90 to-emerald-900/10" />
            {/* Glow accent */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] translate-y-1/3 translate-x-1/3 transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-xs mb-6 uppercase tracking-widest border border-emerald-500/20 rounded-sm">
                <Globe2 className="w-3.5 h-3.5" />
                <span>The African Growth Pipeline</span>
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">Emerging Markets.</h3>
              <p className="text-zinc-400 mb-10 leading-relaxed font-medium">
                The future of global capitalization. Africa hosts 6 of the top 10 fastest-growing economies globally, driven by an unparalleled demographic dividend, vast resource capital, and massive agricultural expansion.
              </p>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="mandate-stat border-l-2 border-zinc-800 pl-4">
                  <TrendingUp className="w-5 h-5 text-emerald-400 mb-3" />
                  <div className="font-bold text-white text-lg">6 of Top 10</div>
                  <div className="text-sm text-zinc-500 mt-1">Fastest Growing Economies</div>
                </div>
                <div className="mandate-stat border-l-2 border-zinc-800 pl-4">
                  <Users className="w-5 h-5 text-emerald-400 mb-3" />
                  <div className="font-bold text-white text-lg">1.4 Billion</div>
                  <div className="text-sm text-zinc-500 mt-1">Market Population Base</div>
                </div>
              </div>

              <Link href="#" className="inline-flex items-center text-zinc-300 font-semibold hover:text-white transition-colors group/link mt-auto">
                Explore The Africa Portfolio 
                <div className="ml-3 p-1.5 rounded-full bg-zinc-800 group-hover/link:bg-emerald-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
