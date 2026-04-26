"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Search, Globe, X, ChevronDown } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLanguage } from "@/lib/LanguageContext";

export function TopNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const searchModalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage, t } = useLanguage();

  useGSAP(() => {
    if (isSearchOpen && searchModalRef.current) {
      gsap.to(searchModalRef.current, {
        opacity: 1,
        duration: 0.3,
        display: "flex",
        ease: "power2.out",
        onComplete: () => searchInputRef.current?.focus()
      });
      gsap.fromTo(
        ".search-content",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: "power3.out" }
      );
    } else if (!isSearchOpen && searchModalRef.current) {
      gsap.to(searchModalRef.current, {
        opacity: 0,
        duration: 0.2,
        display: "none",
        ease: "power2.in"
      });
    }
  }, [isSearchOpen]);

  return (
    <>
      <div className="bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900 border-opacity-50 text-xs h-10 flex items-center relative z-50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full flex justify-between items-center">
          
          {/* Tagline / System Status */}
          <div className="hidden md:flex items-center space-x-2 text-zinc-500 font-medium tracking-wide">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span>Sovereign Economic Council • Transatlantic Operations</span>
          </div>

          {/* Utility Links */}
          <div className="flex items-center space-x-6 text-[10px] md:text-xs tracking-widest font-bold text-zinc-300">
            <Link href="/faqs" className="hover:text-blue-400 transition-colors hidden sm:block">FAQS</Link>
            <Link href="/contact" className="hover:text-blue-400 transition-colors hidden sm:block">CONTACT</Link>
            <Link href="/contact" className="text-amber-500 hover:text-amber-400 transition-colors hidden lg:block">ADVERTISE WITH US</Link>
            <Link href="/invest" className="text-amber-500 hover:text-amber-400 transition-colors hidden lg:block">BECOME A MEMBER</Link>
            <Link href="/news" className="hover:text-blue-400 transition-colors">{t("nav.news")}</Link>
            <Link href="/events" className="hover:text-blue-400 transition-colors">{t("nav.events")}</Link>
            
            <div className="w-px h-3 bg-zinc-800 mr-6"></div>

            {/* Language Selection Dropdown */}
            <div 
              className="relative flex items-center space-x-1 cursor-pointer"
              onMouseEnter={() => setIsLangOpen(true)}
              onMouseLeave={() => setIsLangOpen(false)}
            >
              <div className={`flex items-center space-x-1 transition-colors ${isLangOpen ? 'text-white' : 'hover:text-zinc-100'}`}>
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase">{language}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Menu */}
              {isLangOpen && (
                <div className="absolute top-full right-0 w-32 bg-zinc-900 border border-zinc-800 shadow-xl rounded-sm overflow-hidden z-50">
                  <button 
                    onClick={() => { setLanguage("en"); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-zinc-800 border-b border-zinc-800/50 flex items-center justify-between ${language === 'en' ? 'text-white font-bold bg-zinc-800/50' : 'text-zinc-400 font-medium'}`}
                  >
                    English 
                    {language === 'en' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                  </button>
                  <button 
                    onClick={() => { setLanguage("fr"); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-zinc-800 flex items-center justify-between ${language === 'fr' ? 'text-white font-bold bg-zinc-800/50' : 'text-zinc-400 font-medium'}`}
                  >
                    Français
                    {language === 'fr' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-1 hover:text-zinc-100 transition-colors ml-6 focus:outline-none"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Search Modal */}
      <div 
        ref={searchModalRef} 
        className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl hidden flex-col items-center justify-center p-6"
        style={{ opacity: 0 }}
      >
        <button 
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-10 right-10 text-zinc-500 hover:text-white transition-colors p-2"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="search-content w-full max-w-3xl">
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-zinc-500" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search reports, mandates, or sectors..." 
              className="w-full bg-transparent border-b-2 border-zinc-700 text-3xl md:text-5xl text-white font-bold py-6 pl-14 pr-4 focus:outline-none focus:border-blue-500 placeholder:text-zinc-700 transition-colors"
            />
          </div>
          <div className="mt-8 flex items-center space-x-4">
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Popular:</span>
            <span className="text-sm border border-zinc-800 text-zinc-400 px-3 py-1 rounded-full cursor-pointer hover:bg-zinc-800">2026 Strategy</span>
            <span className="text-sm border border-zinc-800 text-zinc-400 px-3 py-1 rounded-full cursor-pointer hover:bg-zinc-800">Megasites</span>
            <span className="text-sm border border-zinc-800 text-zinc-400 px-3 py-1 rounded-full cursor-pointer hover:bg-zinc-800">Agritech Report</span>
          </div>
        </div>
      </div>
    </>
  );
}
