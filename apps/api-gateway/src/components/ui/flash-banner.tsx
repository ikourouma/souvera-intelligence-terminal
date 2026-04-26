"use client";

import React, { useState } from "react";
import { ArrowRight, X, Megaphone } from "lucide-react";
import Link from "next/link";

export function FlashBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 text-white relative z-[55]">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium tracking-wide">
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center p-1 bg-white/20 rounded-full animate-pulse">
            <Megaphone className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:inline font-bold uppercase tracking-widest text-emerald-100 mr-1">Global Alert:</span>
          <span>The Sovereign Capital Board has officially opened Tier-1 applications for Q4 infrastructure deployments.</span>
        </div>

        <div className="flex items-center space-x-6 shrink-0 ml-4">
          <Link href="#" className="flex items-center space-x-1 group hover:text-emerald-100 transition-colors">
            <span className="font-bold underline underline-offset-4 decoration-white/40 group-hover:decoration-white transition-colors">Review Documentation</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-white rounded-sm p-0.5"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
