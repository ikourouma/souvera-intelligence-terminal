"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";

export function SponsorshipStrip() {
  return (
    <div className="bg-amber-600/10 border-b border-amber-600/20 py-3 relative overflow-hidden">
      {/* Subtle moving light effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full animate-[shimmer_5s_infinite]" />
      
      <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-amber-500">
          <Award className="w-4 h-4 shrink-0" />
          <p className="text-[11px] font-black uppercase tracking-[0.2em]">
            Strategic Revenue Opportunity: <span className="text-white">Partner with the Council</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link href="/events" className="text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-colors flex items-center">
            Advertise With Us
            <ArrowRight className="w-3 h-3 ml-2" />
          </Link>
          <div className="w-px h-3 bg-zinc-800" />
          <Link href="/invest" className="text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-colors flex items-center">
            Become a Sponsor
            <ArrowRight className="w-3 h-3 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
