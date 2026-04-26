"use client";
// ─────────────────────────────────────────────────────────────────────────────
// MapTeaser — Lightweight CTA section for corridor / sector / tourism pages
// Replaces the full AfricaMapEmbed with a slim section that drives to /africa-intelligence
// Zero map library imports — pure CSS/SVG. Instant render, zero JS weight.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

// ── Accent color theming ──────────────────────────────────────────────────────
type AccentColor = "blue" | "emerald" | "amber" | "purple";

const accent: Record<AccentColor, {
  eyebrow: string;
  badge: string;
  btn: string;
  btnText: string;
  statBg: string;
  statText: string;
  border: string;
  glow: string;
  silhouette: string;
}> = {
  blue: {
    eyebrow:   "text-blue-400",
    badge:     "bg-blue-900/30 border-blue-800/40 text-blue-300",
    btn:       "bg-blue-600 hover:bg-blue-700",
    btnText:   "text-white",
    statBg:    "bg-blue-950/40 border-blue-900/30",
    statText:  "text-blue-300",
    border:    "border-blue-900/20",
    glow:      "bg-blue-600/5",
    silhouette:"#1d4ed8",
  },
  emerald: {
    eyebrow:   "text-emerald-400",
    badge:     "bg-emerald-900/30 border-emerald-800/40 text-emerald-300",
    btn:       "bg-emerald-600 hover:bg-emerald-700",
    btnText:   "text-white",
    statBg:    "bg-emerald-950/40 border-emerald-900/30",
    statText:  "text-emerald-300",
    border:    "border-emerald-900/20",
    glow:      "bg-emerald-600/5",
    silhouette:"#059669",
  },
  amber: {
    eyebrow:   "text-amber-400",
    badge:     "bg-amber-900/30 border-amber-800/40 text-amber-300",
    btn:       "bg-amber-600 hover:bg-amber-700",
    btnText:   "text-white",
    statBg:    "bg-amber-950/40 border-amber-900/30",
    statText:  "text-amber-300",
    border:    "border-amber-900/20",
    glow:      "bg-amber-600/5",
    silhouette:"#d97706",
  },
  purple: {
    eyebrow:   "text-purple-400",
    badge:     "bg-purple-900/30 border-purple-800/40 text-purple-300",
    btn:       "bg-purple-600 hover:bg-purple-700",
    btnText:   "text-white",
    statBg:    "bg-purple-950/40 border-purple-900/30",
    statText:  "text-purple-300",
    border:    "border-purple-900/20",
    glow:      "bg-purple-600/5",
    silhouette:"#7c3aed",
  },
};

// ── 5 Region dot positions on the SVG coordinate system ──────────────────────
const REGION_DOTS = [
  { cx: 195, cy: 78,  fill: "#7c3aed", label: "North Africa",    delay: "0ms"    },
  { cx: 108, cy: 198, fill: "#1d4ed8", label: "West Africa",     delay: "400ms"  },
  { cx: 212, cy: 252, fill: "#d97706", label: "Central Africa",  delay: "800ms"  },
  { cx: 298, cy: 218, fill: "#059669", label: "East Africa",     delay: "1200ms" },
  { cx: 195, cy: 385, fill: "#dc2626", label: "Southern Africa", delay: "1600ms" },
];

// ── Simplified Africa continent SVG path ─────────────────────────────────────
// viewBox 0 0 380 490 — recognizable silhouette, key landmarks preserved:
// Mediterranean coast, Horn of Africa, Cape of Good Hope, Gulf of Guinea
const AFRICA_PATH =
  "M 158,28 L 218,20 260,24 292,40 314,68 322,98 338,130 344,162 " +
  "L 340,196 324,224 316,258 304,298 288,338 268,376 " +
  "L 244,418 215,452 190,464 162,458 138,440 116,416 " +
  "L 96,386 80,350 66,304 55,256 50,208 54,170 " +
  "L 64,138 72,108 84,84 96,62 112,46 134,34 Z";

// ── Component props ───────────────────────────────────────────────────────────
export type MapTeaserProps = {
  heading?:     string;
  subtext?:     string;
  ctaLabel?:    string;
  accentColor?: AccentColor;
};

const STAT_BADGES = [
  { value: "54",    label: "Nations"    },
  { value: "5",     label: "Regions"    },
  { value: "2026",  label: "IMF Data"   },
  { value: "Live",  label: "Real-Time"  },
];

export function MapTeaser({
  heading     = "54 African Nations. Live Economic Data.",
  subtext     = "GDP, Foreign Direct Investment (FDI), sector intelligence, and AfDEC market assessments — across every African nation. Sourced from IMF 2026 projections and updated in real time.",
  ctaLabel    = "Open Intelligence Terminal",
  accentColor = "blue",
}: MapTeaserProps) {
  const ac = accent[accentColor];

  return (
    <section className="py-16 border-t border-zinc-800/40 bg-zinc-950">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className={`bg-zinc-900/30 border ${ac.border} rounded-xl overflow-hidden relative`}>

          {/* Subtle radial glow behind silhouette */}
          <div className={`absolute right-0 top-0 w-[50%] h-full ${ac.glow} blur-[80px] opacity-60 pointer-events-none`} />

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[280px]">

            {/* ── Left: Text Content ── */}
            <div className="relative z-10 px-8 md:px-12 py-10 flex flex-col justify-center">

              {/* Eyebrow with live indicator */}
              <div className={`flex items-center gap-2.5 mb-5 ${ac.eyebrow}`}>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: ac.silhouette }} />
                  <span className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: ac.silhouette }} />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.22em]">
                  Africa Intelligence Terminal · Live
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-[1.15] mb-4">
                {heading}
              </h2>

              {/* Subtext */}
              <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-7 max-w-sm">
                {subtext}
              </p>

              {/* Stat badges */}
              <div className="flex flex-wrap gap-2 mb-8">
                {STAT_BADGES.map((s) => (
                  <div
                    key={s.label}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-bold ${ac.statBg} ${ac.statText}`}
                  >
                    <span className="font-black">{s.value}</span>
                    <span className="text-zinc-600 font-medium">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div>
                <Link
                  href="/africa-intelligence"
                  className={`inline-flex items-center gap-2.5 px-7 py-4 ${ac.btn} ${ac.btnText} font-black text-xs uppercase tracking-widest rounded-sm transition-all shadow-lg group`}
                >
                  {ctaLabel}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-zinc-700 text-[10px] font-medium mt-3 flex items-center gap-1.5">
                  <ExternalLink className="w-2.5 h-2.5" />
                  Opens the full interactive intelligence terminal
                </p>
              </div>
            </div>

            {/* ── Right: CSS Africa Silhouette ── */}
            <div className="relative hidden lg:flex items-center justify-center bg-zinc-950/60 border-l border-zinc-800/50 overflow-hidden">

              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Radial fade vignette */}
              <div className="absolute inset-0 bg-radial-from-transparent bg-[radial-gradient(ellipse_at_center,transparent_30%,#09090b_100%)]" />

              {/* Africa SVG */}
              <div className="relative z-10 w-[220px] h-[280px] select-none">
                <svg
                  viewBox="0 0 380 490"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  aria-label="Africa continent silhouette"
                >
                  {/* Continent fill */}
                  <path
                    d={AFRICA_PATH}
                    fill={ac.silhouette}
                    fillOpacity={0.12}
                    stroke={ac.silhouette}
                    strokeOpacity={0.4}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />

                  {/* ── Five Region Dots with staggered pulse ── */}
                  {REGION_DOTS.map((dot) => (
                    <g key={dot.label}>
                      {/* Outer pulse ring */}
                      <circle
                        cx={dot.cx}
                        cy={dot.cy}
                        r={9}
                        fill={dot.fill}
                        fillOpacity={0}
                        stroke={dot.fill}
                        strokeOpacity={0.5}
                        strokeWidth={1.5}
                        style={{
                          animation: `ping 2s cubic-bezier(0,0,0.2,1) infinite`,
                          animationDelay: dot.delay,
                          transformOrigin: `${dot.cx}px ${dot.cy}px`,
                        }}
                      />
                      {/* Inner dot */}
                      <circle
                        cx={dot.cx}
                        cy={dot.cy}
                        r={4}
                        fill={dot.fill}
                        fillOpacity={0.9}
                      />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Corner label */}
              <div className="absolute bottom-4 right-5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: "ping 2s ease-in-out infinite" }} />
                <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">54 AU Nations</span>
              </div>
            </div>

          </div>
        </div>

        {/* Attribution */}
        <p className="text-[10px] text-zinc-800 font-medium mt-3 text-right">
          Source: IMF World Economic Outlook 2026 · World Bank · AfDEC Intelligence Desk
        </p>
      </div>

      {/* Inline keyframe for SVG ping animation */}
      <style>{`
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
