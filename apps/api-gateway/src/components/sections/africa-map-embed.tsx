"use client";
// ─────────────────────────────────────────────────────────────────────────────
// AfricaMapEmbed — Reusable section for corridor / footprint pages
// Shows the full AfricaMap (with live indicator) + a prominent "Open Terminal" CTA
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import Link from "next/link";
import { AfricaMap } from "@/components/sections/africa-map";
import { ArrowRight, Globe, ExternalLink } from "lucide-react";

type AfricaMapEmbedProps = {
  heading?: string;
  subtext?: string;
  accentColor?: "blue" | "emerald" | "amber" | "purple";
};

const accentMap = {
  blue:    { text: "text-blue-400",    btn: "bg-blue-600 hover:bg-blue-700",    border: "border-blue-900/30",    glow: "bg-blue-600/5" },
  emerald: { text: "text-emerald-400", btn: "bg-emerald-600 hover:bg-emerald-700", border: "border-emerald-900/30", glow: "bg-emerald-600/5" },
  amber:   { text: "text-amber-400",   btn: "bg-amber-600 hover:bg-amber-700",   border: "border-amber-900/30",   glow: "bg-amber-600/5" },
  purple:  { text: "text-purple-400",  btn: "bg-purple-600 hover:bg-purple-700", border: "border-purple-900/30",  glow: "bg-purple-600/5" },
};

export function AfricaMapEmbed({
  heading = "Africa Intelligence Map",
  subtext = "Real-time economic and market intelligence across all 54 African nations — powered by AfDEC's live data infrastructure.",
  accentColor = "blue",
}: AfricaMapEmbedProps) {
  const ac = accentMap[accentColor];

  return (
    <section className="py-20 border-t border-zinc-800/50 bg-zinc-950">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* Live blinking indicator */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Intelligence</span>
              <div className="w-px h-4 bg-zinc-700" />
              <Globe className={`w-3.5 h-3.5 ${ac.text}`} />
              <span className={`text-[10px] font-black ${ac.text} uppercase tracking-widest`}>Africa Intelligence Terminal</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{heading}</h2>
            <p className="text-zinc-500 text-sm font-medium mt-2 max-w-xl leading-relaxed">{subtext}</p>
          </div>
          <Link
            href="/africa-intelligence"
            className={`inline-flex items-center gap-2 px-6 py-3.5 ${ac.btn} text-white font-black text-xs uppercase tracking-widest rounded-sm transition-all shadow-lg group shrink-0`}
          >
            Open Full Terminal <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Full map — rendered with live indicator built in */}
        <div className={`bg-zinc-900/40 border ${ac.border} rounded-xl overflow-hidden relative`}>
          {/* Subtle glow */}
          <div className={`absolute -top-20 left-1/2 w-96 h-40 ${ac.glow} rounded-full blur-[80px] opacity-40 -translate-x-1/2 pointer-events-none`} />
          <div className="p-6 relative z-10">
            <AfricaMap />
          </div>
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-[10px] text-zinc-700 font-medium">
            Source: IMF · World Bank · Supabase Live · AfDEC Intelligence Desk · 2026
          </p>
          <Link
            href="/africa-intelligence"
            className={`flex items-center gap-1.5 text-[11px] font-bold ${ac.text} hover:opacity-80 transition-opacity`}
          >
            Explore full terminal <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
