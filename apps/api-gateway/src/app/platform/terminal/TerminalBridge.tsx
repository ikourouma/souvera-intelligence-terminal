'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Map,
  Globe,
  BarChart3,
  Layers,
  Shield,
  Terminal,
} from 'lucide-react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';

const FEATURES = [
  {
    icon: Globe,
    title: 'Country Intelligence Terminal',
    description:
      'Seven-tab Bloomberg-grade workspace: Overview, Economy, Sectors, Trade, Risk, Opportunity, and Reports.',
  },
  {
    icon: Map,
    title: 'Interactive Intelligence Map',
    description:
      'Geospatial exploration across 54 African markets with entitlement-gated country drawers and sector previews.',
  },
  {
    icon: BarChart3,
    title: 'Side-by-Side Comparison',
    description:
      'Compare GDP, growth, and sector signals across markets with tier-aware indicator access.',
  },
  {
    icon: Layers,
    title: 'Live News Pulse',
    description:
      'Source-attributed headlines filtered by country relevance — separate from curated Souvera News editorial.',
  },
];

const TIERS = [
  { name: 'Explorer', access: 'Map + 1 sector teaser + country terminal entry' },
  { name: 'Professional', access: 'Full macro, sector rationale, multi-country compare' },
  { name: 'Business', access: 'Investment thesis, risk narratives, export intelligence' },
];

export function TerminalBridge() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <section className="pt-28 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-6">
                <Terminal className="w-4 h-4" />
                Intelligence Terminal
              </div>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                The Terminal Is Live.
              </h1>
              <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                Souvera&apos;s intelligence terminal is operational for pilot markets — Nigeria and
                Jamaica — with live institutional data, curated sector intelligence, and
                entitlement-gated depth. Explore the map or open a country terminal directly.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/country/NGA"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-semibold transition-colors"
                >
                  Explore Nigeria Terminal
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/intelligence/map"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-sm font-semibold transition-colors"
                >
                  <Map className="w-4 h-4" />
                  Open Intelligence Map
                </Link>
              </div>
            </div>

            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-sm">
              <div className="aspect-video bg-zinc-950 border border-zinc-800 rounded-sm flex flex-col items-center justify-center gap-4 p-8">
                <div className="flex gap-2">
                  {['Overview', 'Economy', 'Sectors', 'Trade', 'Risk'].map((tab) => (
                    <span
                      key={tab}
                      className="px-2 py-1 text-[9px] uppercase tracking-wider bg-zinc-800 text-zinc-400 rounded-sm"
                    >
                      {tab}
                    </span>
                  ))}
                </div>
                <p className="text-2xl font-bold text-white">Nigeria · NGA</p>
                <p className="text-xs text-zinc-500 text-center max-w-xs">
                  Pilot terminal with live macro data, 6 sector profiles, News Pulse, and PDF
                  snapshot export
                </p>
                <span className="text-[10px] uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-sm">
                  Live & Curated
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-4 text-center">
                Jamaica (JAM) terminal also available · 74-country rollout in progress
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <h2
            className="text-2xl md:text-3xl font-bold mb-10"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            What the Terminal Delivers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm"
                >
                  <Icon className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800 bg-zinc-900/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex items-start gap-4 p-6 bg-blue-500/5 border border-blue-500/20 rounded-sm mb-10">
            <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-400 mb-2">Entitlement-Gated Access</h3>
              <p className="text-sm text-blue-400/80 leading-relaxed">
                Terminal depth scales with your plan. Explorer opens the workspace; Professional and
                Business unlock sector rationale, macro depth, and investment narratives.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIERS.map((tier) => (
              <div key={tier.name} className="p-4 border border-zinc-800 rounded-sm bg-zinc-950">
                <p className="text-sm font-bold text-white mb-1">{tier.name}</p>
                <p className="text-xs text-zinc-500">{tier.access}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/access"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-semibold transition-colors text-sm"
            >
              View Access Plans
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/country/JAM"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-sm font-semibold transition-colors text-sm"
            >
              Explore Jamaica Terminal
            </Link>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
