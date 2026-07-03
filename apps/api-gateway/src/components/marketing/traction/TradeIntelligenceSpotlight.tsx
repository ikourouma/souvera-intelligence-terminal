import Link from 'next/link';
import { ArrowRight, Scale, GitBranch, Globe2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const MODULES: {
  title: string;
  description: string;
  href: string;
  badge: string;
  badgeColor: string;
  icon: LucideIcon;
}[] = [
  {
    title: 'AfCETA Corridor Index',
    description: '416 Africa ↔ Caribbean corridor signals with live Corridor Lab evaluation.',
    href: '/intelligence/trade/afceta/flows',
    badge: 'Forum 2026',
    badgeColor: '#A78BFA',
    icon: Globe2,
  },
  {
    title: 'Supply-Demand Matrix',
    description: '74 markets × 8 sectors — flow-backed export products and import-needs scoring.',
    href: '/intelligence/trade/supply-demand',
    badge: '592 cells',
    badgeColor: '#22C55E',
    icon: GitBranch,
  },
  {
    title: 'AGOA Product Flows',
    description: 'Preferential trade flows, eligibility status, and Census/USITC reconciliation.',
    href: '/intelligence/trade/agoa/flows',
    badge: 'Tier A data',
    badgeColor: '#3B82F6',
    icon: Scale,
  },
];

export function TradeIntelligenceSpotlight() {
  return (
    <section className="py-12 border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="mb-8 max-w-3xl">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Trade Intelligence
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Featured trade modules
          </h2>
          <p className="text-zinc-400 text-sm">
            Live modules built on governed Census, USITC, AfCFTA, and CBTPA data — not generic market summaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm hover:border-blue-500/50 transition-all relative"
              >
                <span
                  className="absolute top-4 right-4 px-2 py-1 text-[9px] font-bold tracking-widest uppercase rounded-sm"
                  style={{
                    background: `${mod.badgeColor}15`,
                    color: mod.badgeColor,
                    border: `1px solid ${mod.badgeColor}30`,
                  }}
                >
                  {mod.badge}
                </span>
                <Icon className="w-7 h-7 text-blue-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{mod.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/intelligence/trade"
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-semibold text-sm transition-colors"
          >
            View all trade intelligence modules
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
