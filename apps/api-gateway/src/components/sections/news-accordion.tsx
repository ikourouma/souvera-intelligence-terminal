"use client";

import React, { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus, Minus, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const newsItems = [
  {
    id: 1,
    date: "OCTOBER 12, 2026",
    title: "AfDEC Announces $50M Transatlantic Ag-Tech Fund",
    excerpt: "The African Diaspora Economic Council today finalized the deployment of a $50 million sovereign-backed fund to accelerate advanced agricultural technology transfers between North Carolina and the East African tech corridor.",
  },
  {
    id: 2,
    date: "SEPTEMBER 28, 2026",
    title: "North Carolina Megasite Selected for Continent-Level Battery Manufacturing",
    excerpt: "A major African EV conglomerate has partnered with AfDEC to establish a Tier 1 lithium processing and battery manufacturing hub in central North Carolina, creating 3,000 projected high-yield jobs.",
  },
  {
    id: 3,
    date: "SEPTEMBER 04, 2026",
    title: "AfDEC Hosted Sovereign Delegation Secures Fintech Corridor",
    excerpt: "Following a three-day summit in Raleigh, trade ministers from four West African nations signed the Fintech Corridor Agreement, drastically reducing cross-border banking friction for diaspora-led enterprises.",
  }
];

export function NewsAccordion() {
  const [openIndex, setOpenIndex] = useState<number>(0); // First item open by default
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".news-item",
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.15, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 tracking-tight text-center">Global Market Briefings</h2>
        
        <div className="space-y-4">
          {newsItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={item.id} 
                className="news-item border border-zinc-800 bg-zinc-900/30 overflow-hidden transition-colors hover:bg-zinc-900/60"
              >
                <button 
                  className="w-full text-left p-6 md:p-8 flex items-center justify-between focus:outline-none"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <div className="pr-8">
                    <span className="text-sm font-bold text-blue-500 mb-2 block tracking-widest">{item.date}</span>
                    <h3 className={`text-xl md:text-2xl font-bold transition-colors ${isOpen ? 'text-white' : 'text-zinc-300'}`}>
                      {item.title}
                    </h3>
                  </div>
                  <div className={`p-2 rounded-full border transition-colors flex-shrink-0 ${isOpen ? 'border-blue-500 text-blue-400' : 'border-zinc-700 text-zinc-500'}`}>
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-8 md:px-8 pt-2">
                      <p className="text-zinc-400 leading-relaxed mb-6">
                        {item.excerpt}
                      </p>
                      <button className="flex items-center text-sm font-bold text-white group">
                        <span className="pb-1 border-b border-blue-500">Read Full Briefing</span>
                        <ArrowRight className="w-4 h-4 ml-2 text-blue-500 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-transparent border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 font-semibold transition-all">
            View All Briefings
          </button>
        </div>
      </div>
    </section>
  );
}
