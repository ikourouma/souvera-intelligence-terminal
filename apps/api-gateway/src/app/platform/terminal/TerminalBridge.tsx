'use client';

import { useEffect, useState } from 'react';
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
import { MarketSignalBadge } from '@/components/intelligence/MarketSignalBadge';

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

const TERMINAL_TABS = ['Overview', 'Economy', 'Sectors', 'Trade', 'Signals'] as const;

const PILOT_MARKETS = [
  {
    iso3: 'NGA',
    name: 'Nigeria',
    gdp: '$252B',
    growth: '+3.2%',
    population: '223M',
    signal: 'emerging' as const,
    sectors: ['Fintech', 'Energy', 'Agriculture', 'Logistics'],
    blurb: 'Live macro data, 6 sector profiles, News Pulse, and PDF snapshot export.',
  },
  {
    iso3: 'JAM',
    name: 'Jamaica',
    gdp: '$19B',
    growth: '+2.1%',
    population: '2.8M',
    signal: 'stable' as const,
    sectors: ['Tourism', 'Fintech', 'Mining', 'Logistics'],
    blurb: 'Caribbean pilot with curated sectors, trade intelligence, and institutional reports.',
  },
];

export function TerminalBridge() {
  const [activePilot, setActivePilot] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const pilot = PILOT_MARKETS[activePilot];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePilot((i) => (i + 1) % PILOT_MARKETS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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

            <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
              {/* Tab row */}
              <div className="flex items-center gap-1 px-4 pt-4 pb-2 border-b border-zinc-800/80 overflow-x-auto">
                {TERMINAL_TABS.map((tab, i) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(i)}
                    className={`shrink-0 px-2.5 py-1 text-[9px] uppercase tracking-wider rounded-sm transition-colors ${
                      activeTab === i
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-5">
                {/* Pilot selector */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-bold text-white">
                      {pilot.name} · {pilot.iso3}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm">{pilot.blurb}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {PILOT_MARKETS.map((m, i) => (
                      <button
                        key={m.iso3}
                        type="button"
                        onClick={() => setActivePilot(i)}
                        aria-label={`Show ${m.name} terminal preview`}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          activePilot === i ? 'bg-blue-500' : 'bg-zinc-700 hover:bg-zinc-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Macro strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-3">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-1">GDP</p>
                    <p className="text-sm font-bold text-blue-400">{pilot.gdp}</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-3">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-1">Growth</p>
                    <p className="text-sm font-bold text-emerald-400">{pilot.growth}</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-3">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-1">Population</p>
                    <p className="text-sm font-bold text-purple-400">{pilot.population}</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-3 flex flex-col justify-center">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-1.5">Signal</p>
                    <MarketSignalBadge profileSignal={pilot.signal} size="sm" />
                  </div>
                </div>

                {/* Sector chips */}
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-2">Key Sectors</p>
                  <div className="flex flex-wrap gap-2">
                    {pilot.sectors.map((sector) => (
                      <span
                        key={sector}
                        className="px-2.5 py-1 text-[10px] font-semibold bg-zinc-800 text-zinc-300 rounded-sm border border-zinc-700"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-sm">
                    Live & Curated
                  </span>
                  <Link
                    href={`/country/${pilot.iso3}`}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
                  >
                    Open terminal
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <p className="text-xs text-zinc-500 px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 text-center">
                Live pilot terminals: Nigeria (NGA) and Jamaica (JAM) · 74-market intelligence rollout in progress
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
