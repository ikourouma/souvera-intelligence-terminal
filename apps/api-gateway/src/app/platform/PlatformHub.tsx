'use client';

import Link from 'next/link';
import {
  Terminal,
  Zap,
  Database,
  BarChart3,
  ArrowRight,
  Shield,
  TrendingUp,
  Landmark,
  Briefcase,
  Map,
  GitCompare,
  Scale,
  UserPlus,
  Layers,
  BookOpen,
} from 'lucide-react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { TrustSourceLayer } from '@/components/regional/TrustSourceLayer';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { IntelligenceMapPreview } from '@/components/intelligence/IntelligenceMapPreview';
import { PlatformAccessTierStrip } from '@/components/marketing/PlatformAccessTierStrip';
import { TractionConversionCta } from '@/components/marketing/traction/TractionConversionCta';
import { AuditProofCallout } from '@/components/marketing/traction/AuditProofCallout';
import { StickyConversionBar } from '@/components/marketing/traction/StickyConversionBar';
import type { LucideIcon } from 'lucide-react';

const COVERAGE_STATS = [
  { value: '74', label: 'Sovereign Markets', color: 'text-white' },
  { value: '8', label: 'Key Sectors', color: 'text-blue-500' },
  { value: '8+', label: 'Institutional Sources', color: 'text-emerald-500' },
  { value: 'REST', label: 'API Access', color: 'text-purple-400' },
];

const PLATFORM_PILLARS: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}[] = [
  {
    title: 'Intelligence Terminal',
    description:
      'Interactive dashboards with country profiles, market indicators, and geospatial intelligence across 74 African and Caribbean markets.',
    href: '/platform/terminal',
    icon: Terminal,
    badge: 'Core Product',
    badgeColor: '#3B82F6',
  },
  {
    title: 'Signal Engine',
    description:
      'AI-assisted signal indicators from official sources. Track growth vectors, risk indicators, and sector momentum with governed anomaly detection.',
    href: '/platform/signal-engine',
    icon: Zap,
    badge: 'Analytics',
    badgeColor: '#22C55E',
  },
  {
    title: 'Data Foundation',
    description:
      'Documented data sources, validation methodology, and quality assurance — every metric source-attributed for institutional audit.',
    href: '/platform/data-foundation',
    icon: BarChart3,
    badge: 'Trust',
    badgeColor: '#F59E0B',
  },
  {
    title: 'API Access',
    description:
      'RESTful API for programmatic access to Souvera intelligence. JSON and CSV formats with bulk export for enterprise workflows.',
    href: '/platform/api',
    icon: Database,
    badge: 'Enterprise',
    badgeColor: '#A78BFA',
  },
];

const PLATFORM_FLOW = [
  {
    step: '01',
    title: 'Data Foundation',
    subtitle: 'sources',
    description: 'IMF, World Bank, Census, USITC, and regional development banks normalized into one governed layer.',
    href: '/platform/data-foundation',
    icon: Database,
  },
  {
    step: '02',
    title: 'Signal Engine',
    subtitle: 'indicators',
    description: 'Official feeds transformed into market signals, risk indicators, and sector momentum scores.',
    href: '/platform/signal-engine',
    icon: Zap,
  },
  {
    step: '03',
    title: 'Intelligence Terminal',
    subtitle: 'dashboards',
    description: 'Country profiles, trade intelligence, and geospatial exploration for decision-ready analysis.',
    href: '/platform/terminal',
    icon: Terminal,
  },
  {
    step: '04',
    title: 'API Access',
    subtitle: 'programmatic',
    description: 'REST endpoints, CSV exports, and PNG briefs for teams that need data in their own systems.',
    href: '/platform/api',
    icon: Layers,
  },
];

const PERSONAS = [
  {
    title: 'Governments & DFIs',
    description: 'Policy-grade macro intelligence, AfCFTA/AGOA trade context, and bilateral relationship data for sovereign teams.',
    icon: Landmark,
  },
  {
    title: 'Investors & PE',
    description: 'Market screening, sector signals, and country comparison for frontier and emerging allocations.',
    icon: TrendingUp,
  },
  {
    title: 'Corporates & Trade',
    description: 'AGOA, CBI, AfCETA corridor intelligence, and supply-demand matrices for trade and market entry teams.',
    icon: Briefcase,
  },
  {
    title: 'Researchers & Analysts',
    description: 'Source-attributed data, documented methodology, and API export for audit-ready research workflows.',
    icon: BookOpen,
  },
];

const INTELLIGENCE_MODULES = [
  {
    title: 'Intelligence Map',
    description: 'Geospatial view of 74 markets with GDP, growth, and sector context at a glance.',
    href: '/intelligence/map',
    icon: Map,
  },
  {
    title: 'Country Comparison',
    description: 'Side-by-side macro, trade, and sector metrics across Africa and the Caribbean.',
    href: '/intelligence/compare',
    icon: GitCompare,
  },
  {
    title: 'Trade Intelligence',
    description: 'AGOA, AfCFTA, CBTPA, supply-demand matrices, and AfCETA corridor signals.',
    href: '/intelligence/trade',
    icon: Scale,
  },
];

const METHODOLOGY_POINTS = [
  {
    icon: Database,
    title: 'Institutional Data Sources',
    description:
      'Data sourced from World Bank, IMF, African Development Bank, and official national statistics. No proprietary black-box models.',
  },
  {
    icon: Shield,
    title: 'Governed AI Analysis',
    description:
      'AI-assisted analysis is clearly labeled and source-attributed. Human oversight on all strategic assessments.',
  },
  {
    icon: TrendingUp,
    title: 'Transparent Methodology',
    description:
      'All indicators, calculations, and signal scores documented. Full audit trail for institutional compliance.',
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">{children}</div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {children}
    </h2>
  );
}

export function PlatformHub() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      {/* Hero + coverage stats */}
      <section className="pt-32 pb-16 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -mr-96 -mt-96" />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mb-16">
            <SectionLabel>Platform Overview</SectionLabel>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              The Souvera Intelligence Platform.
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl">
              Institutional-grade intelligence for 74 African and Caribbean markets — from free Explorer
              access to enterprise API.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm font-semibold transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Create free account
              </Link>
              <Link
                href="/intelligence/map"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-semibold transition-colors"
              >
                <Map className="w-5 h-5" />
                Open Intelligence Map
              </Link>
              <Link
                href="/access"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-white rounded-sm font-semibold transition-colors"
              >
                View access plans
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {COVERAGE_STATS.map((stat) => (
              <div
                key={stat.label}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm text-center"
              >
                <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Stack — 2x2 */}
      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-12 max-w-3xl">
            <SectionLabel>Platform Stack</SectionLabel>
            <SectionTitle>Four layers. One intelligence pipeline.</SectionTitle>
            <p className="text-lg text-zinc-400">
              Every layer is documented, governed, and designed for institutional workflows — from data
              ingestion to terminal UX to enterprise API delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {PLATFORM_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Link
                  key={pillar.href}
                  href={pillar.href}
                  className="group p-8 bg-[#121821] border border-zinc-800 rounded-sm hover:border-blue-600/50 transition-all relative overflow-hidden min-h-[280px] flex flex-col"
                >
                  {pillar.badge && (
                    <div
                      className="absolute top-4 right-4 px-2 py-1 text-[9px] font-bold tracking-widest uppercase rounded-sm"
                      style={{
                        background: `${pillar.badgeColor}15`,
                        color: pillar.badgeColor,
                        border: `1px solid ${pillar.badgeColor}30`,
                      }}
                    >
                      {pillar.badge}
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-colors">
                    <Icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-6 flex-1">{pillar.description}</p>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it flows */}
      <section className="py-16 border-b border-zinc-800 bg-zinc-900/20">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-12 max-w-3xl">
            <SectionLabel>Architecture</SectionLabel>
            <SectionTitle>How it flows</SectionTitle>
            <p className="text-lg text-zinc-400">
              The four platform layers connect as a single governed pipeline — not four unrelated products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLATFORM_FLOW.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.step}
                  href={item.href}
                  className="group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm hover:border-blue-500/40 transition-all"
                >
                  {index < PLATFORM_FLOW.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-zinc-700 z-10" />
                  )}
                  <div className="text-[10px] font-mono text-zinc-600 mb-3">{item.step}</div>
                  <Icon className="w-7 h-7 text-blue-500 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">
                    {item.subtitle}
                  </p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Terminal preview */}
      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel>Intelligence Terminal</SectionLabel>
              <SectionTitle>The terminal product — live today</SectionTitle>
              <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                Souvera is not a static report library. The terminal delivers seven-tab country workspaces
                (Overview, Economy, Sectors, Trade, Risk, Opportunity, Reports) plus Trade Intelligence
                modules — AGOA, AfCFTA, supply-demand, and AfCETA corridors.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Country terminal with Census/USITC trade reconciliation',
                  'Supply-Demand Matrix with flow-backed export products',
                  'AfCETA Corridor Lab — live origin×destination evaluation',
                  'Explorer free tier — register for compare and saved views',
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
                Explore the map
              </Link>
            </div>
            <div className="relative">
              <IntelligenceMapPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-12 max-w-3xl">
            <SectionLabel>Built For</SectionLabel>
            <SectionTitle>Who it&apos;s for</SectionTitle>
            <p className="text-lg text-zinc-400">
              Souvera replaces fragmented spreadsheets and opaque vendor dashboards with one governed
              intelligence layer your compliance team can defend.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERSONAS.map((persona) => {
              const Icon = persona.icon;
              return (
                <div
                  key={persona.title}
                  className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm"
                >
                  <Icon className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-3">{persona.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{persona.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live intelligence + cross-link */}
      <section className="py-16 border-b border-zinc-800 bg-zinc-900/20">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-12 max-w-3xl">
            <SectionLabel>Live Intelligence</SectionLabel>
            <SectionTitle>Explore what you get today</SectionTitle>
            <p className="text-lg text-zinc-400">
              The platform powers the Intelligence hub — interactive modules you can use immediately, with
              deeper tiers unlocked as you upgrade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {INTELLIGENCE_MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="group p-8 bg-zinc-900/50 border border-zinc-800 rounded-sm hover:border-blue-500/50 transition-all"
                >
                  <Icon className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">{mod.description}</p>
                </Link>
              );
            })}
          </div>

          <p className="text-center text-zinc-400 max-w-2xl mx-auto">
            Looking for regional deep-dives? Explore the{' '}
            <Link href="/intelligence" className="text-blue-500 hover:text-blue-400 font-semibold inline-flex items-center gap-1">
              Intelligence hub
              <ArrowRight className="w-4 h-4" />
            </Link>{' '}
            for Africa and Caribbean command centers, trade modules, and country comparison tools.
          </p>
        </div>
      </section>

      {/* Trust & methodology */}
      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-12 max-w-3xl">
            <SectionLabel>Trust & Methodology</SectionLabel>
            <SectionTitle>Institutional-grade standards</SectionTitle>
            <p className="text-lg text-zinc-400">
              Souvera intelligence is built for institutional decision-makers who require transparent,
              auditable, and defensible data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {METHODOLOGY_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm">
                  <Icon className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-3">{point.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{point.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <TrustStrip />
      <TrustSourceLayer title="Data Sources & Attribution" />
      <section className="py-8 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <AuditProofCallout />
        </div>
      </section>

      <PlatformAccessTierStrip />
      <TractionConversionCta />

      <StickyConversionBar />
      <SouveraFooter />
    </main>
  );
}
