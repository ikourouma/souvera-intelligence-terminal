'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface RegionalMetric {
  value: string;
  label: string;
}

// Lightweight pulse data fetched from API — used only for dynamic
// avg-growth and top-performer lines below the static metric cards.
interface RegionalPulse {
  avgGrowth: string | null;
  topPerformer: { name: string; growth: string } | null;
}

interface RegionalHeroCommandProps {
  region: 'africa' | 'caribbean';
  eyebrow: string;
  headline: string;
  body: string;
  metrics: RegionalMetric[];
  scrollToGridId?: string;
}

export function RegionalHeroCommand({
  region,
  eyebrow,
  headline,
  body,
  metrics,
  scrollToGridId = 'markets',
}: RegionalHeroCommandProps) {
  const [pulse, setPulse] = useState<RegionalPulse | null>(null);

  // Non-blocking API fetch — only enriches the sub-metric line.
  // Hero renders immediately with static metric card values.
  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const response = await fetch(`/api/v1/countries?region=${region}`);
        if (!response.ok) return;

        const data = await response.json();
        const countries: Array<{ gdpGrowthPct?: number; signalLevel?: string; name?: string }> =
          data.countries ?? [];

        const rates = countries
          .map((c) => c.gdpGrowthPct)
          .filter((g): g is number => g != null);

        const avgGrowth =
          rates.length > 0
            ? (rates.reduce((s, g) => s + g, 0) / rates.length).toFixed(1)
            : null;

        const top = [...countries]
          .filter((c) => c.gdpGrowthPct != null)
          .sort((a, b) => (b.gdpGrowthPct ?? 0) - (a.gdpGrowthPct ?? 0))[0];

        setPulse({
          avgGrowth,
          topPerformer:
            top && top.gdpGrowthPct != null
              ? { name: top.name ?? '', growth: top.gdpGrowthPct.toFixed(1) }
              : null,
        });
      } catch {
        // Silently degrade — hero always displays with static metric cards.
      }
    };

    fetchPulse();
  }, [region]);

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(scrollToGridId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isAfrica = region === 'africa';
  const accentClass       = isAfrica ? 'text-blue-500'       : 'text-teal-500';
  const accentBtnBg       = isAfrica ? 'bg-blue-600'         : 'bg-teal-600';
  const accentBtnHover    = isAfrica ? 'hover:bg-blue-500'   : 'hover:bg-teal-500';
  const accentBorderClass = isAfrica ? 'border-blue-500/25'  : 'border-teal-500/25';
  const accentCardBg      = isAfrica ? 'bg-blue-500/5'       : 'bg-teal-500/5';
  const accentValueColor  = isAfrica ? 'text-blue-400'       : 'text-teal-400';

  return (
    <section className="pt-32 pb-16 border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

        {/* ── Left-aligned executive hero copy ── */}
        <div className="max-w-4xl mb-14">

          {/* Eyebrow */}
          <div className={`text-[10px] font-bold tracking-[0.2em] uppercase ${accentClass} mb-6`}>
            {eyebrow}
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {headline}
          </h1>

          {/* Body */}
          <p className="text-xl text-zinc-400 leading-relaxed mb-8 max-w-3xl">
            {body}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExploreClick}
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 ${accentBtnBg} ${accentBtnHover} text-white rounded-sm font-semibold transition-colors`}
            >
              Explore Markets
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/access/request-access"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-zinc-700 hover:border-zinc-500 text-white rounded-sm font-semibold transition-colors"
            >
              Request Full Access
            </Link>
          </div>
        </div>

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`p-6 ${accentCardBg} border ${accentBorderClass} rounded-sm`}
            >
              <div className={`text-3xl md:text-4xl font-bold ${accentValueColor} mb-2`}>
                {metric.value}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic pulse line (API-enhanced, non-blocking) */}
        {pulse && (pulse.avgGrowth || pulse.topPerformer) && (
          <p className="text-sm text-zinc-500 mb-2">
            {pulse.avgGrowth && (
              <>
                Avg. GDP Growth:{' '}
                <span className="text-zinc-300 font-medium">{pulse.avgGrowth}%</span>
              </>
            )}
            {pulse.avgGrowth && pulse.topPerformer && (
              <span className="mx-2">·</span>
            )}
            {pulse.topPerformer && (
              <>
                Top Performer:{' '}
                <span className="text-zinc-300 font-medium">{pulse.topPerformer.name}</span>{' '}
                ({pulse.topPerformer.growth}%)
              </>
            )}
          </p>
        )}

        {/* Trust / freshness line */}
        <p className="text-xs text-zinc-600">
          Curated Preview Data · Sources: World Bank, IMF
        </p>
      </div>
    </section>
  );
}
