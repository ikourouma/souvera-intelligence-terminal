// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Trade Intelligence Hub
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Globe2, 
  FileText, 
  ArrowRight,
  Scale,
  Building2,
  BarChart3,
  Clock,
  Shirt,
  Package,
  Ship,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { LiveCuratedBanner } from '@/components/intelligence/LiveCuratedBanner';
import { InstitutionalAccessCta } from '@/components/marketing/InstitutionalAccessCta';
import { shouldShowModuleBadge } from '@/lib/show-dev-labels';

export const metadata: Metadata = {
  title: 'Trade Intelligence | Souvera',
  description: 'AGOA eligibility, AfCFTA implementation status, and supply-demand intelligence for African and Caribbean markets.',
};

const AGOA_EXPIRY = new Date('2026-12-31T23:59:59Z');

function daysUntilAgoaExpiry(): number {
  const diff = AGOA_EXPIRY.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Categorized module structure for better scannability
const TRADE_CATEGORIES = {
  afrocaribbean: {
    title: 'Afro-Caribbean Corridor',
    description: 'Atlantic trade intelligence — AfCETA framework and corridor opportunity scoring',
    color: 'violet',
    modules: [
      {
        title: 'AfCETA Trade Intelligence',
        shortDesc: 'Treaty framework, four protocol pillars, and Caribbean export portfolio',
        href: '/intelligence/trade/afceta',
        icon: Sparkles,
        badge: 'New',
        featured: true,
        stats: { primary: 'AfCETA', label: 'Treaty blueprint' },
      },
      {
        title: 'Corridor Opportunity Index',
        shortDesc: 'Africa ↔ Caribbean tradable flows by category and spotlight pair',
        href: '/intelligence/trade/afceta/flows',
        icon: Repeat,
        badge: 'Live',
        stats: { primary: '74×8', label: 'Markets × categories' },
      },
    ],
  },
  usAfrica: {
    title: 'US-Africa Trade',
    description: 'AGOA framework, export opportunities, and eligibility',
    color: 'blue',
    modules: [
      {
        title: 'AGOA Eligibility Tracker',
        shortDesc: 'Country eligibility status & legislative milestones',
        href: '/intelligence/trade/agoa',
        icon: Scale,
        badge: 'Live',
        priority: true,
        stats: { primary: '54', label: 'Countries tracked' },
      },
      {
        title: 'African Demand Intelligence',
        shortDesc: 'US export opportunity sizing by product category',
        href: '/intelligence/trade/demand',
        icon: BarChart3,
        badge: 'Phase 0.5A',
        stats: { primary: '8', label: 'Demand categories' },
      },
      {
        title: 'AGOA Trade Flows',
        shortDesc: 'African exports to US under AGOA preferences',
        href: '/intelligence/trade/agoa/flows',
        icon: Repeat,
        badge: 'Phase 0.5E',
        stats: { primary: 'USITC', label: 'Verified flows' },
      },
      {
        title: 'AGOA Product Finder',
        shortDesc: 'Priority products with reciprocal justification',
        href: '/intelligence/trade/agoa/products',
        icon: Shirt,
        badge: 'Preview',
        stats: { primary: '~150', label: 'Priority products' },
      },
      {
        title: 'Supply-Demand Matrix',
        shortDesc: 'Macro sector signals across markets',
        href: '/intelligence/trade/supply-demand',
        icon: BarChart3,
        badge: 'Phase 2',
        stats: { primary: '74×8', label: 'Markets × Sectors' },
      },
    ],
  },
  caribbean: {
    title: 'Caribbean Trade',
    description: 'CBTPA framework and CARICOM markets',
    color: 'cyan',
    modules: [
      {
        title: 'Caribbean Demand Intelligence',
        shortDesc: 'US export opportunities in Caribbean markets',
        href: '/intelligence/trade/demand-caribbean',
        icon: Ship,
        badge: 'Phase 0.5C',
        stats: { primary: '20', label: 'Markets covered' },
      },
      {
        title: 'CBTPA Trade Flows',
        shortDesc: 'Import/export flows under CBTPA',
        href: '/intelligence/trade/cbtpa/flows',
        icon: Repeat,
        badge: 'Phase 0.7',
        stats: { primary: 'Bi-Dir', label: 'Import & Export' },
      },
    ],
  },
  continental: {
    title: 'Continental Frameworks',
    description: 'AfCFTA implementation and intra-Africa trade',
    color: 'emerald',
    modules: [
      {
        title: 'AfCFTA Status Tracker',
        shortDesc: 'Ratification and implementation status',
        href: '/intelligence/trade/afcfta',
        icon: Building2,
        badge: 'Preview',
        stats: { primary: '54', label: 'African nations' },
      },
      {
        title: 'AfCFTA Trade Flows',
        shortDesc: 'Intra-Africa import/export analysis',
        href: '/intelligence/trade/afcfta/flows',
        icon: Repeat,
        badge: 'Phase 0.5D',
        stats: { primary: 'Intra', label: 'Regional flows' },
      },
    ],
  },
  reference: {
    title: 'Reference Data',
    description: 'Deep-dive research and compliance',
    color: 'zinc',
    modules: [
      {
        title: 'Full Product Catalog',
        shortDesc: 'Complete AGOA eligibility lookup',
        href: '/intelligence/trade/agoa/products?catalog=full',
        icon: Package,
        badge: 'Reference',
        stats: { primary: '~6,400', label: 'Products' },
      },
    ],
  },
};

const COLOR_CLASSES = {
  violet: {
    bg: 'bg-violet-500/5',
    border: 'border-violet-500/25',
    icon: 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-fuchsia-300',
    badge: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
    stat: 'text-fuchsia-400',
    hover: 'hover:border-fuchsia-500/45',
  },
  blue: {
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    icon: 'bg-blue-500/10 text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    stat: 'text-blue-400',
    hover: 'hover:border-blue-500/40',
  },
  cyan: {
    bg: 'bg-cyan-500/5',
    border: 'border-cyan-500/20',
    icon: 'bg-cyan-500/10 text-cyan-400',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    stat: 'text-cyan-400',
    hover: 'hover:border-cyan-500/40',
  },
  emerald: {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    icon: 'bg-emerald-500/10 text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    stat: 'text-emerald-400',
    hover: 'hover:border-emerald-500/40',
  },
  zinc: {
    bg: 'bg-zinc-800/30',
    border: 'border-zinc-700/50',
    icon: 'bg-zinc-700/50 text-zinc-400',
    badge: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/50',
    stat: 'text-zinc-300',
    hover: 'hover:border-zinc-600/50',
  },
} as const;

export default function TradeIntelligenceHub() {
  const daysRemaining = daysUntilAgoaExpiry();
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
        <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <Globe2 className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-medium text-indigo-400">
              Trade Intelligence
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Trade Policy Intelligence
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl">
            Evidence-based intelligence on AGOA eligibility, AfCFTA implementation, AfCETA corridor opportunities, and supply-demand dynamics across African and Caribbean markets.
          </p>

          {/* Data Source Attribution */}
          <div className="mt-8 flex items-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Curated Preview Data</span>
            </div>
            <span className="text-zinc-700">•</span>
            <span>Sources: USTR, AfCFTA Secretariat, tralac</span>
          </div>
        </div>
      </section>

      {/* Reauthorization alert */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-8">
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white font-medium">AGOA Reauthorization Window — {daysRemaining} days remaining</p>
              <p className="text-zinc-400 text-sm mt-1">
                Current authorization expires <span className="text-amber-400 font-medium">December 31, 2026</span>.
                {' '}Use the{' '}
                <Link href="/intelligence/trade/agoa/products" className="text-violet-400 hover:text-violet-300 underline">
                  AGOA Product Finder
                </Link>
                {' '}to build reciprocal justification evidence, or track country eligibility in the{' '}
                <Link href="/intelligence/trade/agoa" className="text-blue-400 hover:text-blue-300 underline">
                  AGOA Legislative Tracker
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-8">
        <div className="flex flex-wrap gap-2">
          {Object.entries(TRADE_CATEGORIES).map(([key, category]) => {
            const colors = COLOR_CLASSES[category.color as keyof typeof COLOR_CLASSES];
            return (
              <a
                key={key}
                href={`#${key}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${colors.border} ${colors.bg} text-zinc-300 hover:text-white transition-colors`}
              >
                {category.title}
                <span className="ml-2 text-xs text-zinc-500">({category.modules.length})</span>
              </a>
            );
          })}
        </div>
      </section>

      {/* Trade Modules by Category */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 space-y-12">
        {Object.entries(TRADE_CATEGORIES).map(([key, category]) => {
          const colors = COLOR_CLASSES[category.color as keyof typeof COLOR_CLASSES];
          return (
            <div key={key} id={key}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-white">{category.title}</h2>
                <span className={`px-2 py-0.5 rounded text-xs border ${colors.badge}`}>
                  {category.modules.length} modules
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-6 -mt-4">{category.description}</p>

              {/* Module Cards - Compact Horizontal Layout */}
              <div className="grid gap-3">
                {category.modules.map((module) => (
                  <Link
                    key={module.href}
                    href={module.href}
                    className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                      'featured' in module && module.featured
                        ? 'border-fuchsia-500/40 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/8 to-teal-600/8 hover:border-fuchsia-400/60 shadow-[0_0_24px_rgba(217,70,239,0.08)] hover:shadow-[0_0_32px_rgba(217,70,239,0.15)]'
                        : `${colors.border} ${colors.bg} ${colors.hover}`
                    }`}
                  >
                    {/* Icon */}
                    <div className={`shrink-0 p-2.5 rounded-lg ${
                      'featured' in module && module.featured
                        ? 'bg-gradient-to-br from-violet-500/25 to-fuchsia-500/25 text-fuchsia-200'
                        : colors.icon
                    }`}>
                      <module.icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`font-semibold truncate transition-colors ${
                          'featured' in module && module.featured
                            ? 'text-white group-hover:text-fuchsia-200'
                            : 'text-white group-hover:text-indigo-400'
                        }`}>
                          {module.title}
                        </h3>
                        {'featured' in module && module.featured && (
                          <span className="shrink-0 px-1.5 py-0.5 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded text-[10px] font-bold tracking-wider uppercase">
                            Featured
                          </span>
                        )}
                        {'priority' in module && module.priority && (
                          <span className="shrink-0 px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-medium">
                            PRIORITY
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 truncate">{module.shortDesc}</p>
                    </div>

                    {/* Stats */}
                    <div className="shrink-0 text-right hidden sm:block">
                      <p className={`text-lg font-bold ${
                        'featured' in module && module.featured ? 'text-fuchsia-400' : colors.stat
                      }`}>{module.stats.primary}</p>
                      <p className="text-xs text-zinc-500">{module.stats.label}</p>
                    </div>

                    {/* Badge & Arrow */}
                    <div className="shrink-0 flex items-center gap-3">
                      {shouldShowModuleBadge(module.badge) && (
                      <span className={`hidden md:inline-flex px-2 py-1 rounded text-xs ${
                        module.badge === 'Live' || module.badge === 'New'
                          ? module.badge === 'New'
                            ? 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {module.badge}
                      </span>
                      )}
                      <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-all ${
                        'featured' in module && module.featured
                          ? 'text-fuchsia-500/60 group-hover:text-fuchsia-300'
                          : 'text-zinc-600 group-hover:text-indigo-400'
                      }`} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Key Concepts */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">Key Trade Frameworks</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* AGOA — US-Africa */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                African Growth and Opportunity Act (AGOA)
              </h3>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              U.S. trade preference program providing duty-free access for eligible sub-Saharan African countries.
              Covers over 1,800 products plus GSP-eligible products.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-zinc-500">
                <span>Region</span>
                <span className="text-zinc-300">Sub-Saharan Africa ↔ United States</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Framework Type</span>
                <span className="text-zinc-300">U.S. Unilateral Preference</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Status</span>
                <span className="text-amber-400">Subject to Reauthorization</span>
              </div>
            </div>
            <Link href="/intelligence/trade/agoa" className="inline-flex items-center gap-1 mt-4 text-sm text-blue-400 hover:text-blue-300">
              AGOA Tracker <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* AfCFTA — Continental Africa */}
          <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">
                African Continental Free Trade Area (AfCFTA)
              </h3>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              Continental free trade agreement creating a single market for goods and services across Africa.
              Souvera tracks ratification status and intra-African trade flows.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-zinc-500">
                <span>Region</span>
                <span className="text-zinc-300">Continental Africa</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Coverage</span>
                <span className="text-zinc-300">54 African Countries</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Status</span>
                <span className="text-emerald-400">Implementation Phase</span>
              </div>
            </div>
            <Link href="/intelligence/trade/afcfta" className="inline-flex items-center gap-1 mt-4 text-sm text-emerald-400 hover:text-emerald-300">
              AfCFTA Status Tracker <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* CBTPA — Caribbean */}
          <div className="bg-zinc-900/50 border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Ship className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">
                Caribbean Basin Trade Partnership Act (CBTPA)
              </h3>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              U.S. preferential trade framework for Caribbean Basin Initiative beneficiaries.
              Souvera tracks bilateral flows, tariff margins, and CARICOM integration metrics.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-zinc-500">
                <span>Region</span>
                <span className="text-zinc-300">Caribbean ↔ United States</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Coverage</span>
                <span className="text-zinc-300">20 Caribbean Markets</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Status</span>
                <span className="text-cyan-400">Active Preference Program</span>
              </div>
            </div>
            <Link href="/intelligence/trade/cbtpa/flows" className="inline-flex items-center gap-1 mt-4 text-sm text-cyan-400 hover:text-cyan-300">
              CBTPA Trade Flows <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* AfCETA — Afro-Caribbean */}
          <div className="bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-teal-600/5 border border-fuchsia-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-fuchsia-400" />
              <h3 className="text-lg font-semibold text-white">
                African-Caribbean Economic &amp; Trade Agreement (AfCETA)
              </h3>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              Proposed Atlantic corridor framework connecting AfCFTA and CARICOM markets.
              Corridor Opportunity Index scores tradable flows across eight shared product categories.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-zinc-500">
                <span>Region</span>
                <span className="text-zinc-300">Africa ↔ Caribbean</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Coverage</span>
                <span className="text-zinc-300">74 Markets · 8 Categories</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Status</span>
                <span className="text-fuchsia-400">Corridor Intelligence Live</span>
              </div>
            </div>
            <Link href="/intelligence/trade/afceta" className="inline-flex items-center gap-1 mt-4 text-sm font-medium bg-gradient-to-r from-violet-400 via-fuchsia-400 to-teal-400 bg-clip-text text-transparent hover:from-violet-300 hover:via-fuchsia-300 hover:to-teal-300">
              AfCETA Trade Intelligence <ArrowRight className="w-3.5 h-3.5 text-fuchsia-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Source attribution */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 pb-12">
        <LiveCuratedBanner
          description="Trade intelligence on Souvera combines official source feeds with editorially governed profiles across African and Caribbean markets. Policy status, flow data, and corridor metrics carry source attribution and refresh on a governed schedule."
          sources={['USTR', 'AfCFTA Secretariat', 'USITC', 'Census Bureau', 'tralac']}
        />
      </section>

      {/* Data Transparency Notice */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Data Transparency</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-zinc-500 mb-1">Data Classification</p>
              <p className="text-zinc-300">Source-Attributed Intelligence</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Primary Sources</p>
              <p className="text-zinc-300">USTR, AfCFTA Secretariat, USITC, tralac</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Refresh Cadence</p>
              <p className="text-zinc-300">Governed curation with source attribution</p>
            </div>
          </div>
          <p className="text-zinc-500 text-xs mt-4">
            Trade policy status is subject to change. Figures are sourced from official institutions and updated on a governed schedule.
            Verify critical eligibility decisions with primary sources where required.
          </p>
        </div>
      </section>

      <InstitutionalAccessCta />
    </div>
  );
}
