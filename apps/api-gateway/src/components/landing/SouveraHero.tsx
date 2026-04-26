'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Admin-managed via Supabase `hero_slides` table.
// Each slide: title, subtitle, badge, cta_primary, cta_secondary, stat_1, stat_2, bg_accent
const FALLBACK_SLIDES = [
  {
    id: 1,
    badge: 'Intelligence Terminal v2.0',
    title: 'The Africa &\nCaribbean\nDecision Engine.',
    subtitle: 'Institutional-grade macroeconomic signaling, real-time corridor intelligence, and sovereign risk models across 74 markets.',
    cta_primary: { label: 'Access Terminal', href: '/terminal/africa' },
    cta_secondary: { label: 'View Subscriptions', href: '/subscriptions' },
    stat_1: { value: '74', label: 'Sovereign Markets' },
    stat_2: { value: '42ms', label: 'Data Latency' },
    ticker: ['ZAF ▲ 1.2%', 'NGA ▲ 3.4%', 'KEN ▲ 5.0%', 'ETH ▲ 7.1%'],
    accent: '#2563EB',
  },
  {
    id: 2,
    badge: 'ACTIF 2026 Ready',
    title: 'Africa-Caribbean\nTrade Intelligence.\nPowered by Data.',
    subtitle: 'Connecting diaspora capital with sovereign-grade intelligence across the transatlantic trade corridor — from Lagos to Kingston.',
    cta_primary: { label: 'Explore Africa Command', href: '/terminal/africa' },
    cta_secondary: { label: 'Caribbean Intelligence', href: '/terminal/caribbean' },
    stat_1: { value: '$1.9T', label: 'Sub-Saharan GDP' },
    stat_2: { value: '$270B', label: 'Caribbean GDP' },
    ticker: ['DOM ▲ 5.1%', 'JAM ▲ 4.2%', 'GUY ▲ 6.2%', 'TTO LNG'],
    accent: '#0891B2',
  },
  {
    id: 3,
    badge: 'Sector Intelligence',
    title: 'Six Sectors.\n$600B+\nOpportunity Map.',
    subtitle: 'From African fintech to Caribbean energy — Souvera delivers the intelligence institutional investors need to move with conviction.',
    cta_primary: { label: 'Explore Sectors', href: '/terminal/sectors' },
    cta_secondary: { label: 'Request Demo', href: 'https://afdec-nc.vercel.app/contact' },
    stat_1: { value: '$14B', label: 'Fintech Market' },
    stat_2: { value: '$320B', label: 'Mining & Minerals' },
    ticker: ['Mining ▲ 12.4%', 'Fintech ▲ 28%', 'Energy ▲ 8.1%', 'Agri ▲ 6.5%'],
    accent: '#16A34A',
  },
];

type Slide = typeof FALLBACK_SLIDES[0];

// Live macro ticker data (scrolling strip at bottom of hero)
const TICKER_ITEMS = [
  { label: 'ZAF', value: '▲ 1.2%', color: '#22C55E' },
  { label: 'EGY', value: '▲ 4.1%', color: '#22C55E' },
  { label: 'NGA', value: '▲ 3.4%', color: '#22C55E' },
  { label: 'KEN', value: '▲ 5.0%', color: '#22C55E' },
  { label: 'ETH', value: '▲ 7.1%', color: '#22C55E' },
  { label: 'GHA', value: '▲ 3.8%', color: '#22C55E' },
  { label: 'RWA', value: '▲ 7.2%', color: '#22C55E' },
  { label: 'SDN', value: '▼ 4.0%', color: '#EF4444' },
  { label: 'DOM', value: '▲ 5.1%', color: '#22C55E' },
  { label: 'JAM', value: '▲ 4.2%', color: '#22C55E' },
  { label: 'GUY', value: '▲ 6.2%', color: '#22C55E' },
  { label: 'TTO', value: 'LNG+', color: '#F59E0B' },
];

export function SouveraHero() {
  const [slides] = useState<Slide[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo, slides.length]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo, slides.length]);

  useEffect(() => {
    intervalRef.current = setInterval(next, 7000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ background: '#0B0F14', minHeight: '100vh' }}>

      {/* Ambient glow — changes with slide accent */}
      <div
        className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${slide.accent}18 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
          opacity: isTransitioning ? 0.3 : 0.8,
          transition: 'opacity 0.5s, background 1s',
        }}
      />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      {/* Fine grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Main content */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 pt-20 pb-32 min-h-screen flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* LEFT: Copy */}
          <div className="lg:col-span-6 space-y-8" style={{ opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.3s ease' }}>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-souvera-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-souvera-blue" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase font-mono" style={{ color: '#93C5FD' }}>
                {slide.badge}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-bold leading-[1.02] tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 'clamp(48px, 6.5vw, 84px)', color: '#F9FAFB', whiteSpace: 'pre-line' }}>
              {slide.title.replace(/\\n/g, '\n')}
            </h1>

            {/* Subtext */}
            <p className="leading-relaxed max-w-xl font-light" style={{ color: '#9CA3AF', fontSize: 'clamp(16px, 1.8vw, 20px)' }}>
              {slide.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
              <Link
                href={slide.cta_primary.href === '/terminal' ? '/terminal/africa' : slide.cta_primary.href}
                className="flex items-center gap-2 px-7 py-4 font-bold text-[12px] tracking-widest uppercase transition-all group hover:gap-3"
                style={{ background: '#2563EB', color: 'white' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1d4ed8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2563EB'; }}
              >
                {slide.cta_primary.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href={slide.cta_secondary.href}
                className="flex items-center gap-2 px-7 py-4 font-bold text-[12px] tracking-widest uppercase transition-all hover:text-white"
                style={{ border: '1px solid #1F2A37', color: '#9CA3AF', background: 'transparent' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#374151'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1F2A37'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {slide.cta_secondary.label}
              </Link>
            </div>

            {/* Live ticker strip */}
            <div className="pt-6 flex flex-wrap items-center gap-6" style={{ borderTop: '1px solid #1F2A37' }}>
              {TICKER_ITEMS.slice(0, 5).map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <span className="section-label">{item.label}</span>
                  <span className="text-sm font-bold font-mono" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
              <span className="text-[10px] font-mono" style={{ color: '#374151' }}>IMF 2026</span>
            </div>
          </div>

          {/* RIGHT: Terminal Preview Mockup */}
          <div className="lg:col-span-6 relative" style={{ opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.3s ease' }}>
            {/* Terminal chrome */}
            <div className="relative rounded-sm overflow-hidden" style={{ background: '#121821', border: '1px solid #1F2A37', boxShadow: `0 0 60px ${slide.accent}20, 0 25px 50px rgba(0,0,0,0.5)` }}>
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1F2A37', background: '#0B0F14' }}>
                <div className="flex gap-1.5">
                  {['#2A1A1A', '#2A2A1A', '#1A2A1A'].map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                </div>
                <span className="section-label">Souvera Intelligence Terminal</span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
                  <span className="text-[9px] font-mono" style={{ color: '#22C55E' }}>LIVE</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-5 divide-x divide-[#1F2A37]" style={{ borderBottom: '1px solid #1F2A37' }}>
                {[
                  { label: 'Markets', value: '74' },
                  { label: 'Latency', value: '42ms' },
                  { label: 'Signals', value: '218' },
                  { label: 'GDP Data', value: 'Live' },
                  { label: 'FX Rate', value: 'Hourly' },
                ].map((s) => (
                  <div key={s.label} className="px-3 py-2.5 text-center">
                    <div className="section-label mb-0.5">{s.label}</div>
                    <div className="text-[13px] font-bold font-mono" style={{ color: '#E5E7EB' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Map placeholder + economies panel */}
              <div className="grid grid-cols-5" style={{ minHeight: '320px' }}>
                {/* Map area */}
                <div className="col-span-3 relative overflow-hidden flex items-center justify-center" style={{ background: '#0B0F14', borderRight: '1px solid #1F2A37' }}>
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  {/* Simulated country blobs */}
                  <svg viewBox="0 0 200 240" className="w-full h-full opacity-90">
                    {[
                      { x: 80, y: 30, w: 30, h: 20, c: '#7C3AED', label: 'North' },
                      { x: 45, y: 80, w: 35, h: 45, c: '#1D4ED8', label: 'West' },
                      { x: 100, y: 80, w: 25, h: 40, c: '#D97706', label: 'Central' },
                      { x: 130, y: 90, w: 30, h: 50, c: '#059669', label: 'East' },
                      { x: 90, y: 150, w: 40, h: 40, c: '#DC2626', label: 'South' },
                    ].map((r) => (
                      <g key={r.label}>
                        <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={3} fill={r.c} opacity={0.7} />
                        <rect x={r.x + r.w * 0.1} y={r.y + r.h * 0.1} width={r.w * 0.8} height={r.h * 0.8} rx={2} fill={r.c} opacity={0.5} />
                      </g>
                    ))}
                    {/* Pulse nodes */}
                    {[{ x: 115, y: 100, c: '#22C55E' }, { x: 60, y: 100, c: '#3B82F6' }, { x: 105, y: 165, c: '#F59E0B' }].map((n, i) => (
                      <g key={i}>
                        <circle cx={n.x} cy={n.y} r={5} fill={n.c} opacity={0.3}>
                          <animate attributeName="r" from="3" to="9" dur="2s" repeatCount="indefinite" begin={`${i * 0.7}s`} />
                          <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" begin={`${i * 0.7}s`} />
                        </circle>
                        <circle cx={n.x} cy={n.y} r={3} fill={n.c} />
                      </g>
                    ))}
                  </svg>
                  <div className="absolute bottom-3 left-3 section-label">Click country for brief →</div>
                </div>

                {/* Top economies sidebar */}
                <div className="col-span-2" style={{ background: '#121821' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid #1F2A37' }}>
                    <div className="section-label">Top 10 Economies</div>
                    <div className="text-[9px] mt-0.5 font-mono" style={{ color: '#374151' }}>IMF 2026 · GDP</div>
                  </div>
                  <div>
                    {[
                      { rank: 1, iso: 'ZAF', gdp: '$443B', g: '+1.2%', c: '#DC2626' },
                      { rank: 2, iso: 'EGY', gdp: '$399B', g: '+4.1%', c: '#7C3AED' },
                      { rank: 3, iso: 'NGA', gdp: '$334B', g: '+3.4%', c: '#1D4ED8' },
                      { rank: 4, iso: 'DZA', gdp: '$285B', g: '+3.2%', c: '#7C3AED' },
                      { rank: 5, iso: 'MAR', gdp: '$196B', g: '+3.0%', c: '#7C3AED' },
                      { rank: 6, iso: 'KEN', gdp: '$140B', g: '+5.0%', c: '#059669' },
                      { rank: 7, iso: 'ETH', gdp: '$125B', g: '+7.1%', c: '#059669' },
                    ].map((e) => (
                      <div key={e.rank} className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid rgba(31,42,55,0.5)' }}>
                        <span className="rank-badge">{e.rank}</span>
                        <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: e.c, opacity: 0.7 }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold truncate" style={{ color: '#E5E7EB' }}>{e.iso}</div>
                          <div className="text-[9px] font-mono" style={{ color: '#6B7280' }}>{e.gdp}</div>
                        </div>
                        <span className="text-[10px] font-bold font-mono flex-shrink-0" style={{ color: '#22C55E' }}>{e.g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stat chips */}
            <div className="absolute -bottom-5 -left-5 px-4 py-3 rounded-sm shadow-xl" style={{ background: '#121821', border: '1px solid #1F2A37' }}>
              <div className="section-label mb-1">{slide.stat_1.label}</div>
              <div className="text-xl font-bold font-mono text-glow-blue" style={{ color: '#E5E7EB' }}>{slide.stat_1.value}</div>
            </div>
            <div className="absolute -top-5 -right-5 px-4 py-3 rounded-sm shadow-xl" style={{ background: '#121821', border: '1px solid #1F2A37' }}>
              <div className="section-label mb-1">{slide.stat_2.label}</div>
              <div className="text-lg font-bold font-mono" style={{ color: '#22C55E' }}>{slide.stat_2.value}</div>
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
          <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-sm transition-all" style={{ background: '#161D26', border: '1px solid #1F2A37', color: '#6B7280' }} onMouseEnter={e => (e.currentTarget.style.color = 'white')} onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className="h-1 rounded-full transition-all duration-500" style={{ width: i === current ? '28px' : '12px', background: i === current ? slide.accent : '#1F2A37' }} />
            ))}
          </div>
          <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-sm transition-all" style={{ background: '#161D26', border: '1px solid #1F2A37', color: '#6B7280' }} onMouseEnter={e => (e.currentTarget.style.color = 'white')} onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
