"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const newsItems = [
  {
    id: 1,
    date: "OCTOBER 12, 2026",
    title: "AfDEC Announces $50M Transatlantic Ag-Tech Fund",
    excerpt: "The African Diaspora Economic Council today finalized the deployment of a $50 million sovereign-backed fund to accelerate advanced agricultural technology transfers between North Carolina and the East African tech corridor.",
    image: "https://images.unsplash.com/photo-1595804595822-1d48c8b45942?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    date: "SEPTEMBER 28, 2026",
    title: "North Carolina Megasite Selected for Continent-Level Battery Manufacturing",
    excerpt: "A major African EV conglomerate has partnered with AfDEC to establish a Tier 1 lithium processing and battery manufacturing hub in central North Carolina, creating 3,000 projected high-yield jobs.",
    image: "https://images.unsplash.com/photo-1565893322194-e840003b0cbe?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    date: "SEPTEMBER 04, 2026",
    title: "AfDEC Hosted Sovereign Delegation Secures Fintech Corridor",
    excerpt: "Following a three-day summit in Raleigh, trade ministers from four West African nations signed the Fintech Corridor Agreement, drastically reducing cross-border banking friction for diaspora-led enterprises.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
  }
];

export function NewsGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".news-card",
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.15, 
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-2 block">News & Media</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Global Market Briefings</h2>
          </div>
          <Link href="/news" className="hidden md:flex items-center text-sm font-bold text-zinc-300 hover:text-white group">
            <span className="pb-1 border-b border-zinc-700 group-hover:border-blue-500 transition-colors">View All Press Releases</span>
            <ArrowRight className="w-4 h-4 ml-2 text-zinc-500 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item) => (
            <div 
              key={item.id} 
              className="news-card group flex flex-col h-full cursor-pointer"
            >
              {/* Image Container with Hover Zoom */}
              <div className="relative h-48 md:h-64 w-full overflow-hidden bg-zinc-900 mb-6">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${item.image}')`, filter: 'brightness(0.7)' }}
                />
                {/* Content type label */}
                <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-sm text-xs font-bold text-zinc-200 px-3 py-1 uppercase tracking-wider">
                  Press Release
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold text-blue-500 mb-3 tracking-widest">{item.date}</span>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-snug group-hover:text-blue-400 transition-colors line-clamp-3">
                  {item.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-6 flex-1 line-clamp-4 text-sm md:text-base">
                  {item.excerpt}
                </p>
                
                <div className="mt-auto flex items-center text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
                  Read Full Briefing
                  <ArrowRight className="w-4 h-4 ml-2 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All button */}
        <div className="md:hidden mt-10 text-center">
          <Link href="/news" className="inline-flex items-center text-sm font-bold text-white px-6 py-3 border border-zinc-700 bg-zinc-900 w-full justify-center">
            View All Press Releases
          </Link>
        </div>
      </div>
    </section>
  );
}
