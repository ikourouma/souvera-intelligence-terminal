"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/LanguageContext";
import { Tractor, Zap, HeartPulse, Cpu, Plane, Factory } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function SectorIntelligence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const sectors = [
    {
      title: t("verticals.agritech"),
      description: "Modernizing food security and agrarian infrastructure across the continent. Facilitating deep-tier agritech investments and supply chain resilience.",
      icon: Tractor,
      metrics: "$2.4T Market by 2030"
    },
    {
      title: "Advanced Manufacturing",
      description: "Developing robust industrial processing and heavy machinery manufacturing capabilities to bypass supply chain bottlenecks.",
      icon: Factory,
      metrics: "Tier 1 Mega-Hubs"
    },
    {
      title: t("verticals.energy"),
      description: "Accelerating the transition to localized, renewable grids. Maximizing vast solar and hydro portfolios for sovereign utility independence.",
      icon: Zap,
      metrics: "Clean Power Mandate"
    },
    {
      title: t("verticals.health"),
      description: "Building pharmaceutical independence and localized clinical research institutions to supply continental healthcare demands.",
      icon: HeartPulse,
      metrics: "Bio-Informatics"
    },
    {
      title: t("verticals.digital"),
      description: "Powering the unbanked and streamlining cross-border transactions through decentralized banking and institutional capital corridors.",
      icon: Cpu,
      metrics: "Digital Capitalization"
    },
    {
      title: t("verticals.defense"),
      description: "Strategic sector alignment focusing on secure drone logistics and modernized security technologies for stable sovereign growth.",
      icon: Plane,
      metrics: "Strategic Security"
    }
  ];

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
      ".sector-header h2",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo(
      ".sector-header p",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      "-=0.8"
    )
    .fromTo(
      ".sector-card",
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      "-=0.5"
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-32 bg-zinc-950 relative border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="sector-header mb-20 flex flex-col md:flex-row md:items-end justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">{t("home.verticalsTitle")}</h2>
            <p className="text-lg text-zinc-400">
              {t("home.verticalsDesc")}
            </p>
          </div>
          <div className="mt-8 md:mt-0">
            <div className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Core Mandate</div>
            <div className="text-xl font-bold text-blue-500 mt-1">6 Priority Vertical Portfolios</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector, idx) => {
            const Icon = sector.icon;
            return (
              <div 
                key={sector.title} 
                className="sector-card group bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 transition-colors p-8 flex flex-col h-full cursor-pointer"
              >
                <div className="mb-6 flex justify-between items-start">
                  <div className="p-3 bg-zinc-800 rounded text-zinc-300 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 tracking-wider">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-zinc-100 mb-3 group-hover:text-white transition-colors">
                  {sector.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-grow">
                  {sector.description}
                </p>

                <div className="pt-6 border-t border-zinc-800/50 mt-auto flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    {sector.metrics}
                  </span>
                  <div className="w-6 h-6 flex items-center justify-center rounded-full border border-zinc-700 text-zinc-500 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
