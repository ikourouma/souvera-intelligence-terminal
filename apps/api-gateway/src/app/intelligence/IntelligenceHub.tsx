'use client';

import Link from 'next/link';
import { Map, GitCompare, Scale, Landmark, Palmtree, TrendingUp, Database, Shield, ArrowRight, Users, Zap } from 'lucide-react';
import { TrustSourceLayer } from '@/components/regional/TrustSourceLayer';
import { AccessCTABlock } from '@/components/regional/AccessCTABlock';
import { IntelligenceMapPreview } from '@/components/intelligence/IntelligenceMapPreview';
import { DATA_STATUS_LABELS } from '@/lib/map-constants';

// Market coverage stats
const COVERAGE_STATS = [
  { value: '54', label: 'African Nations', color: 'text-blue-500' },
  { value: '20', label: 'Caribbean Territories', color: 'text-teal-500' },
  { value: '$3.4T', label: 'Combined GDP', color: 'text-emerald-500' },
  { value: '6', label: 'Key Sectors', color: 'text-amber-500' },
];

// Regional command cards
const REGIONAL_COMMANDS = [
  {
    region: 'africa',
    title: 'Africa Intelligence',
    subtitle: 'The World\'s Growth Frontier',
    description: 'Comprehensive market intelligence across 54 African nations. From Nigeria\'s fintech boom to Kenya\'s tech hub, from South Africa\'s capital markets to Rwanda\'s business environment.',
    stats: [
      { label: 'Nations', value: '54' },
      { label: 'GDP', value: '$3.1T' },
      { label: 'Population', value: '1.4B' },
    ],
    href: '/intelligence/africa',
    icon: Landmark,
    accentColor: 'blue',
    themes: ['AfCFTA Single Market', 'Demographic Dividend', 'Digital Leapfrogging', 'Critical Minerals'],
  },
  {
    region: 'caribbean',
    title: 'Caribbean Intelligence',
    subtitle: 'The Strategic Gateway',
    description: 'Market intelligence across 20 Caribbean territories. Strategic corridor connecting the Americas, Europe, and Africa with unique opportunities in tourism, energy, and nearshoring.',
    stats: [
      { label: 'Territories', value: '20' },
      { label: 'GDP', value: '$270B' },
      { label: 'Population', value: '44M' },
    ],
    href: '/intelligence/caribbean',
    icon: Palmtree,
    accentColor: 'teal',
    themes: ['Nearshoring Opportunity', 'Energy Transition', 'CARICOM Integration', 'Diaspora Corridors'],
  },
];

// Intelligence tools
const INTELLIGENCE_TOOLS = [
  {
    title: 'Intelligence Map',
    description: 'Interactive geospatial visualization. Click any country for economic profiles, growth indicators, and sector analysis.',
    href: '/intelligence/map',
    icon: Map,
    badge: 'Interactive',
  },
  {
    title: 'Country Comparison',
    description: 'Compare markets side-by-side. GDP, growth rates, sector composition, and investment metrics across regions.',
    href: '/intelligence/compare',
    icon: GitCompare,
    badge: 'Interactive',
  },
  {
    title: 'Trade Intelligence',
    description: 'AGOA eligibility, AfCFTA status, and U.S. trade policy watchpoints for African and Caribbean markets.',
    href: '/intelligence/trade',
    icon: Scale,
    badge: 'Interactive',
  },
];

// Methodology points
const METHODOLOGY_POINTS = [
  {
    icon: Database,
    title: 'Institutional Data Sources',
    description: 'Data sourced from World Bank, IMF, African Development Bank, and official national statistics. No proprietary black-box models.',
  },
  {
    icon: Shield,
    title: 'Governed AI Analysis',
    description: 'AI-assisted analysis is clearly labeled and source-attributed. Human oversight on all strategic assessments.',
  },
  {
    icon: TrendingUp,
    title: 'Transparent Methodology',
    description: 'All indicators, calculations, and signal scores documented. Full audit trail for institutional compliance.',
  },
];

export function IntelligenceHub() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      {/* Hero Section - Two Row */}
      <section className="pt-32 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          {/* Row 1: Title and Description */}
          <div className="max-w-4xl mb-16">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-6">
              Souvera Intelligence
            </div>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Market Intelligence Across Two Continents.
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed mb-8">
              Institutional-grade intelligence for Africa and the Caribbean. Country profiles, economic indicators, sector analysis, and strategic context for governments, investors, and enterprises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/intelligence/africa"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-semibold transition-colors"
              >
                <Landmark className="w-5 h-5" />
                Explore Africa
              </Link>
              <Link
                href="/intelligence/caribbean"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-sm font-semibold transition-colors"
              >
                <Palmtree className="w-5 h-5" />
                Explore Caribbean
              </Link>
            </div>
          </div>

          {/* Row 2: Coverage Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {COVERAGE_STATS.map((stat) => (
              <div
                key={stat.label}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm text-center"
              >
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regional Command Cards */}
      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-12">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Regional Command Centers
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Two Regions. One Platform.
            </h2>
            <p className="text-lg text-zinc-400 max-w-3xl">
              Deep intelligence coverage for Africa and the Caribbean, the world's most promising frontier markets.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {REGIONAL_COMMANDS.map((region) => {
              const Icon = region.icon;
              const accentClass = region.accentColor === 'blue' 
                ? 'text-blue-500 border-blue-500/20 bg-blue-500/5 hover:border-blue-500/50' 
                : 'text-teal-500 border-teal-500/20 bg-teal-500/5 hover:border-teal-500/50';
              const buttonClass = region.accentColor === 'blue'
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-teal-600 hover:bg-teal-500';

              return (
                <div
                  key={region.region}
                  className={`p-8 border rounded-sm transition-all ${accentClass}`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <Icon className={`w-10 h-10 ${region.accentColor === 'blue' ? 'text-blue-500' : 'text-teal-500'}`} />
                    <div className="flex gap-2">
                      {region.stats.map((stat) => (
                        <div key={stat.label} className="text-right">
                          <div className="text-lg font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-zinc-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {region.title}
                  </h3>
                  <p className={`text-sm font-semibold mb-4 ${region.accentColor === 'blue' ? 'text-blue-400' : 'text-teal-400'}`}>
                    {region.subtitle}
                  </p>
                  <p className="text-zinc-400 leading-relaxed mb-6">
                    {region.description}
                  </p>

                  {/* Themes */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {region.themes.map((theme) => (
                      <span
                        key={theme}
                        className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1 rounded-sm"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={region.href}
                    className={`inline-flex items-center gap-2 px-6 py-3 ${buttonClass} text-white rounded-sm font-semibold transition-colors`}
                  >
                    Explore {region.region === 'africa' ? 'Africa' : 'Caribbean'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Intelligence Tools Grid */}
      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-12">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Intelligence Tools
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Explore Markets Your Way
            </h2>
            <p className="text-lg text-zinc-400 max-w-3xl">
              Interactive tools for market exploration, comparison, and analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTELLIGENCE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isComingSoon = tool.badge === 'Coming Soon';

              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className={`group p-8 bg-zinc-900/50 border border-zinc-800 rounded-sm transition-all ${
                    isComingSoon ? 'opacity-75' : 'hover:border-blue-500/50 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8 text-blue-500" />
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm ${
                      isComingSoon 
                        ? 'text-amber-500 bg-amber-500/10' 
                        : 'text-emerald-500 bg-emerald-500/10'
                    }`}>
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {tool.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Intelligence Map Preview */}
      <section className="py-16 border-b border-zinc-800 bg-zinc-900/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
                Intelligence Map
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight mb-6"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Markets at a Glance
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                The Souvera Intelligence Map provides a visual overview of African and Caribbean markets. Explore country profiles, economic indicators, and growth signals across 74 countries.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Search and filter by country, region, or sector',
                  'Click any country for detailed economic profile',
                  'View GDP, population, and growth indicators',
                  'Identify high-growth and emerging markets',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                    <span className="text-zinc-400">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/intelligence/map"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-semibold transition-colors"
              >
                <Map className="w-5 h-5" />
                Open Intelligence Map
              </Link>
            </div>
            <div className="relative">
              <IntelligenceMapPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Methodology & Trust Section */}
      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-12">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Trust & Methodology
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Institutional-Grade Standards
            </h2>
            <p className="text-lg text-zinc-400 max-w-3xl">
              Souvera intelligence is built for institutional decision-makers who require transparent, auditable, and defensible data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {METHODOLOGY_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.title}
                  className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm"
                >
                  <Icon className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-3">
                    {point.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Live & Curated Data Notice */}
          <div className="mt-8 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
            <div className="flex items-start gap-4">
              <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-400 mb-2">
                  {DATA_STATUS_LABELS.previewData}
                </h4>
                <p className="text-sm text-emerald-400/80 leading-relaxed">
                  Souvera combines live institutional feeds (World Bank, IMF, GDELT News Pulse) with
                  editorially curated country profiles for pilot markets. Nigeria and Jamaica
                  terminals are fully populated; regional coverage expands on a governed rollout
                  schedule. Every metric is source-attributed and tier-gated.
                </p>
                <p className="text-xs text-emerald-400/60 mt-2">{DATA_STATUS_LABELS.pilotNote}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Source Layer */}
      <TrustSourceLayer title="Data Sources & Attribution" />

      {/* Executive CTA Block */}
      <AccessCTABlock
        region="africa"
        headline="Get Started with Souvera Intelligence"
        subheadline="From market screening to investment memos — institutional-grade intelligence for Africa and the Caribbean."
      />
    </div>
  );
}
