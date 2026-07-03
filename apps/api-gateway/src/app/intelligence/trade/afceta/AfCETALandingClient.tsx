'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Anchor,
  Leaf,
  Sparkles,
  Users,
  Ship,
  MapPin,
} from 'lucide-react';
import { AFCETA_FORUM } from '@/lib/intelligence/afceta-framework-content';
import { AfCETACorridorStatsPanel } from '@/components/intelligence/afceta/AfCETACorridorStatsPanel';
import { LiveCuratedBanner } from '@/components/intelligence/LiveCuratedBanner';
import { InstitutionalAccessCta } from '@/components/marketing/InstitutionalAccessCta';

interface FrameworkData {
  pillars: Record<string, { title: string; subtitle: string; summary: string }>;
  caribbean_portfolio: {
    statement: string;
    assets: Array<{ assetClass: string; title: string; description: string; examples: string[] }>;
  };
  coverage: {
    african_markets: number;
    caribbean_markets: number;
    total_markets: number;
    shared_categories: number;
    spotlight_pairs: number;
    protocol_pillars: number;
    data_vintage: number;
  };
  spotlight_preview: Array<{ label: string; direction: string; categories: string[] }>;
  attribution: { sources: string[]; note: string };
}

const PILLAR_ICONS: Record<string, typeof Anchor> = {
  blue_maritime: Anchor,
  digital_services: Sparkles,
  diaspora_investment: Users,
  agriculture_climate: Leaf,
};

export default function AfCETALandingClient() {
  const [data, setData] = useState<FrameworkData | null>(null);

  useEffect(() => {
    fetch('/api/v1/trade/afceta')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const coverage = data?.coverage ?? {
    african_markets: 54,
    caribbean_markets: 20,
    total_markets: 74,
    shared_categories: 8,
    spotlight_pairs: 12,
    protocol_pillars: 4,
    data_vintage: 2023,
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero — flush under sticky nav (trade layout adds pt-20) */}
      <section className="relative -mt-20 pt-20 border-b border-violet-500/25 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/90 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/12 to-teal-600/12" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-fuchsia-500/25 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-teal-500/15 via-transparent to-transparent" />
        <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 lg:pr-6">
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-violet-500/25 to-fuchsia-500/25 border border-violet-400/50 text-violet-200">
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
                  New Module
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 border border-teal-500/30 text-teal-300">
                  {coverage.african_markets} African + {coverage.caribbean_markets} Caribbean markets
                </span>
              </div>

              <p className="text-sm font-bold tracking-[0.2em] uppercase text-fuchsia-400 mb-4">
                Introducing AfCETA
              </p>
              <h1 className="text-[1.875rem] sm:text-[2.5rem] lg:text-[3.125rem] font-bold text-white mb-5 leading-tight">
                The trade intelligence for{' '}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-teal-400 bg-clip-text text-transparent">
                  Africa and the Caribbean
                </span>
              </h1>
              <p className="text-[1.0625rem] lg:text-[1.1875rem] text-zinc-400 mb-4 leading-relaxed max-w-xl">
                Corridor opportunity scoring, tradable-asset mapping, and protocol architecture for the Atlantic trade corridor.
              </p>
              <p className="text-sm text-zinc-500 mb-4 max-w-xl leading-relaxed">
                Built from AfCFTA export capacity, CBTPA bilateral flows, and governed import demand signals — a regional opportunity index aligned to official source data.
              </p>
              <p className="text-xs text-zinc-600 mb-8 max-w-xl">
                Source-attributed corridor metrics ·{' '}
                <Link
                  href="/resources/data-sources"
                  className="text-zinc-500 hover:text-violet-400 transition-colors underline-offset-2 hover:underline"
                >
                  Data sources & methodology
                </Link>
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/intelligence/trade/afceta/flows"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-violet-500 transition-all shadow-lg shadow-fuchsia-500/30 ring-1 ring-fuchsia-400/40"
                >
                  Explore Corridor Opportunities
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/intelligence/trade"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-medium text-zinc-200 border border-zinc-700 hover:border-violet-500/40 hover:text-white transition-all"
                >
                  Trade Intelligence Hub
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <AfCETACorridorStatsPanel
                coverage={coverage}
                spotlights={data?.spotlight_preview ?? []}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Four Protocol Pillars */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Four Protocol Pillars</h2>
        <p className="text-zinc-500 mb-8">
          The operational architecture of the agreement — from maritime corridors to diaspora capital and climate-resilient agriculture.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {data &&
            Object.entries(data.pillars).map(([key, pillar]) => {
              const Icon = PILLAR_ICONS[key] ?? Ship;
              return (
                <div
                  key={key}
                  className="p-6 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent hover:border-violet-400/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-fuchsia-400 font-medium mb-1">{pillar.subtitle}</p>
                      <h3 className="text-lg font-semibold text-white mb-2">{pillar.title}</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">{pillar.summary}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="mt-10">
          <LiveCuratedBanner
            description="AfCETA corridor metrics combine AfCFTA regional export profiles, CBTPA bilateral trade flows, and import demand signals across shared product categories. Figures are source-attributed and updated on a governed refresh schedule."
            sources={data?.attribution.sources ?? ['AfCFTA Trade Flows', 'CBTPA Flows', 'Import Demand Signals']}
          />
        </div>
      </section>

      {/* Caribbean Export Portfolio */}
      {data && (
        <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 border-t border-zinc-800">
          <h2 className="text-2xl font-bold text-white mb-2">Caribbean Export Portfolio</h2>
          <p className="text-zinc-400 mb-8 max-w-3xl">{data.caribbean_portfolio.statement}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.caribbean_portfolio.assets.map((asset) => (
              <div key={asset.assetClass} className="p-5 rounded-xl border border-teal-500/20 bg-teal-500/5">
                <h3 className="font-semibold text-teal-300 mb-2">{asset.title}</h3>
                <p className="text-sm text-zinc-400 mb-3">{asset.description}</p>
                <ul className="text-xs text-zinc-500 space-y-1">
                  {asset.examples.map((ex) => (
                    <li key={ex}>• {ex}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Spotlight corridors */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 border-t border-zinc-800">
        <div className="p-8 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-teal-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-violet-300 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{AFCETA_FORUM.host}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Spotlight Corridors</h3>
            <p className="text-zinc-400 text-sm max-w-xl">
              Curated Africa ↔ Caribbean pairs — Accra to Kingston, Lagos to Port of Spain, Nairobi to Basseterre, and more.
            </p>
          </div>
          <Link
            href="/intelligence/trade/afceta/flows?spotlight=true"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-500 hover:to-teal-500 transition-all"
          >
            View Spotlight Corridors
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <InstitutionalAccessCta />
    </div>
  );
}
