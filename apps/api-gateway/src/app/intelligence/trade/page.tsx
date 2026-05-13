// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Trade Intelligence Hub
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Globe2, 
  TrendingUp, 
  FileText, 
  ArrowRight,
  Scale,
  Building2,
  Ship,
  BarChart3
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trade Intelligence | Souvera',
  description: 'AGOA eligibility, AfCFTA implementation status, and supply-demand intelligence for African and Caribbean markets.',
};

const tradeModules = [
  {
    title: 'AGOA Eligibility Tracker',
    description: 'Track African Growth and Opportunity Act eligibility status, apparel provisions, and policy updates for sub-Saharan African countries.',
    href: '/intelligence/trade/agoa',
    icon: Scale,
    color: 'bg-blue-500/10 border-blue-500/30',
    iconColor: 'text-blue-400',
    badge: 'U.S. Trade Policy',
    stats: [
      { label: 'Framework', value: 'Sub-Saharan Africa' },
      { label: 'Data', value: 'Curated Preview' },
    ],
  },
  {
    title: 'AfCFTA Status Tracker',
    description: 'Monitor African Continental Free Trade Area implementation status including ratification, deposit, and trading status.',
    href: '/intelligence/trade/afcfta',
    icon: Building2,
    color: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    badge: 'African Trade',
    stats: [
      { label: 'Coverage', value: '54 African Countries' },
      { label: 'Data', value: 'Curated Preview' },
    ],
  },
  {
    title: 'Supply-Demand Matrix',
    description: 'Explore supply capacity and demand signals across 74 markets and 7 key sectors.',
    href: '/intelligence/trade/supply-demand',
    icon: BarChart3,
    color: 'bg-purple-500/10 border-purple-500/30',
    iconColor: 'text-purple-400',
    badge: 'Market Signals',
    stats: [
      { label: 'Markets', value: '74' },
      { label: 'Sectors', value: '7' },
    ],
  },
];

export default function TradeIntelligenceHub() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

      {/* Trade Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
