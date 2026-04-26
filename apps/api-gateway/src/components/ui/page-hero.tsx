"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface PageHeroProps {
  headline: string;
  subheadline?: string;
  tag?: string;
  children?: React.ReactNode;
}

export function PageHero({ headline, subheadline, tag, children }: PageHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".page-hero-tag", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
      .fromTo(".page-hero-headline", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
      .fromTo(".page-hero-sub", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.3")
      .fromTo(".page-hero-children", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.2");
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative bg-zinc-950 border-b border-zinc-800/50 overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 md:py-32 relative z-10">
        {tag && (
          <div className="page-hero-tag inline-flex items-center space-x-2 px-3 py-1 bg-zinc-800/80 border border-zinc-700/50 mb-6 rounded-full backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase">{tag}</span>
          </div>
        )}
        <h1 className="page-hero-headline text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl">
          {headline}
        </h1>
        {subheadline && (
          <p className="page-hero-sub text-lg md:text-xl text-zinc-400 mt-6 max-w-2xl leading-relaxed font-medium">
            {subheadline}
          </p>
        )}
        {children && <div className="page-hero-children mt-8">{children}</div>}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </section>
  );
}
