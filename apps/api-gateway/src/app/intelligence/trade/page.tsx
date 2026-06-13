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
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trade Intelligence | Souvera',
  description: 'AGOA eligibility, AfCFTA implementation status, and supply-demand intelligence for African and Caribbean markets.',
};

const AGOA_EXPIRY = new Date('2026-12-31T23:59:59Z');

function daysUntilAgoaExpiry(): number {
  const diff = AGOA_EXPIRY.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Module ordering — deliberate:
 * 1. SDM  → macro WHERE (all 8 sectors, 74 markets)
 * 2. Product Finder → specific WHAT (priority ~150 products, reciprocal justification)
 * 3. AGOA Tracker  → policy WHO (eligibility, legislative timeline)
 * 4. AfCFTA Tracker → continental framework
 */
const tradeModules = [
  {
    title: 'African Demand Intelligence',
    description: 'US export opportunity sizing by product category across 74 markets. Quantifies African demand for US goods — the core AGOA reauthorization "two-way street" argument.',
    href: '/intelligence/trade/demand',
    icon: BarChart3,
    color: 'bg-blue-500/10 border-blue-500/30',
    iconColor: 'text-blue-400',
    badge: 'Phase 0.5A',
    stats: [
      { label: 'US export potential', value: '$12B+/yr' },
      { label: 'Categories', value: '10 groups' },
    ],
  },
  {
    title: 'Caribbean Demand Intelligence',
    description: 'US export opportunities in Caribbean markets. Quantifies Caribbean demand for US goods under CBTPA and bilateral trade frameworks.',
    href: '/intelligence/trade/demand-caribbean',
    icon: Ship,
    color: 'bg-cyan-500/10 border-cyan-500/30',
    iconColor: 'text-cyan-400',
    badge: 'Phase 0.5C',
    stats: [
      { label: 'Framework', value: 'CBTPA' },
      { label: 'Categories', value: '10 groups' },
    ],
  },
  {
    title: 'CBTPA Import-Export Intelligence',
    description: 'US-Caribbean bilateral trade flows under the Caribbean Basin Trade Partnership Act. Track imports, exports, preference margins, and intra-CARICOM trade.',
    href: '/intelligence/trade/cbtpa/flows',
    icon: Repeat,
    color: 'bg-blue-500/10 border-blue-500/30',
    iconColor: 'text-blue-400',
    badge: 'Phase 0.7',
    stats: [
      { label: 'Coverage', value: '20 Markets' },
      { label: 'Trade Direction', value: 'Import/Export' },
    ],
  },
  {
    title: 'AfCFTA Import-Export Intelligence',
    description: 'Intra-Africa trade flows under AfCFTA. Toggle between Import and Export views to analyze regional supply chains and market access opportunities.',
    href: '/intelligence/trade/afcfta/flows',
    icon: Repeat,
    color: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    badge: 'Phase 0.5D',
    stats: [
      { label: 'Coverage', value: '54 Markets' },
      { label: 'Trade Direction', value: 'Import/Export' },
    ],
  },
  {
    title: 'Supply-Demand Matrix',
    description: 'Macro sector signals across 74 markets and 8 sectors — identify WHERE the strongest supply capacity, demand gaps, and AGOA export opportunities sit.',
    href: '/intelligence/trade/supply-demand',
    icon: BarChart3,
    color: 'bg-purple-500/10 border-purple-500/30',
    iconColor: 'text-purple-400',
    badge: 'Phase 2',
    stats: [
      { label: 'Markets', value: '74' },
      { label: 'Sectors', value: '8' },
    ],
  },
  {
    title: 'AGOA Product Finder',
    description: 'Priority ~150 products organized by sector — Africa export surplus, US reciprocal opportunity, tariff cliff exposure. Evidence layer for AGOA reauthorization.',
    href: '/intelligence/trade/agoa/products',
    icon: Shirt,
    color: 'bg-violet-500/10 border-violet-500/30',
    iconColor: 'text-violet-400',
    badge: 'Preview',
    stats: [
      { label: 'Products', value: '~150' },
      { label: 'Sectors', value: '8' },
    ],
  },
  {
    title: 'AGOA Eligibility Tracker',
    description: 'Track AGOA eligibility status, apparel provisions, and legislative milestones for sub-Saharan African countries.',
    href: '/intelligence/trade/agoa',
    icon: Scale,
    color: 'bg-blue-500/10 border-blue-500/30',
    iconColor: 'text-blue-400',
    badge: 'Live',
    stats: [
      { label: 'Framework', value: 'Sub-Saharan Africa' },
      { label: 'Countries', value: '54 Tracked' },
    ],
  },
  {
    title: 'AfCFTA Status Tracker',
    description: 'Monitor African Continental Free Trade Area implementation — ratification, deposit, and trading status.',
    href: '/intelligence/trade/afcfta',
    icon: Building2,
    color: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    badge: 'Preview',
    stats: [
      { label: 'Coverage', value: '54 African Countries' },
      { label: 'Data', value: 'Curation in Progress' },
    ],
  },
  {
    title: 'Full Product Catalog',
    description: 'Browse full AGOA eligibility across ~6,400 product categories — reference layer for compliance, rules of origin, and deep-dive research.',
    href: '/intelligence/trade/agoa/products?catalog=full',
    icon: Package,
    color: 'bg-zinc-800/50 border-zinc-700/50',
    iconColor: 'text-zinc-400',
    badge: 'Reference',
    stats: [
      { label: 'Products', value: '~6,400' },
      { label: 'Use', value: 'Eligibility lookup' },
    ],
  },
];

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
            Evidence-based intelligence on AGOA eligibility, AfCFTA implementation, and supply-demand dynamics across African and Caribbean markets.
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

      {/* Trade Modules */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">Trade Intelligence Modules</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tradeModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className={`group relative p-6 rounded-xl border ${module.color} hover:border-opacity-60 transition-all duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${module.color}`}>
                  <module.icon className={`w-6 h-6 ${module.iconColor}`} />
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  module.badge === 'Live'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {module.badge}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {module.title}
              </h3>
              <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                {module.description}
              </p>

              <div className="flex items-center gap-4 mb-4">
                {module.stats.map((stat, idx) => (
                  <div key={idx}>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                    <p className="text-sm font-medium text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center text-sm text-indigo-400 group-hover:text-indigo-300">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Key Concepts */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">Key Trade Frameworks</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* AGOA Card */}
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
                <span>Framework Type</span>
                <span className="text-zinc-300">U.S. Unilateral Preference</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Review Cycle</span>
                <span className="text-zinc-300">Annual Presidential Review</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Status</span>
                <span className="text-amber-400">Subject to Reauthorization</span>
              </div>
            </div>
          </div>

          {/* AfCFTA Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">
                African Continental Free Trade Area (AfCFTA)
              </h3>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              Continental free trade agreement creating a single market for goods and services across Africa. 
              Aims to boost intra-African trade and economic integration.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-zinc-500">
                <span>Framework Type</span>
                <span className="text-zinc-300">Continental FTA</span>
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
          </div>
        </div>
      </section>

      {/* Data Transparency Notice */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Data Transparency</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-zinc-500 mb-1">Data Classification</p>
              <p className="text-zinc-300">Curated Preview Data</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Primary Sources</p>
              <p className="text-zinc-300">USTR, AfCFTA Secretariat, tralac</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Refresh Cadence</p>
              <p className="text-zinc-300">Manual curation with source attribution</p>
            </div>
          </div>
          <p className="text-zinc-500 text-xs mt-4">
            Trade policy status is subject to change. Data is curated from official sources and may not reflect the most recent updates. 
            Always verify critical eligibility decisions with official sources.
          </p>
        </div>
      </section>
    </div>
  );
}
