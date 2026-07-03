// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Supply-Demand Matrix
// Owner: Afronovation, Inc.
// Phase 4C: Supply-Demand Matrix
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, ArrowLeft, Info, ArrowRightLeft } from 'lucide-react';
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';
import { SupplyDemandMatrixClient } from './SupplyDemandMatrixClient';

export const metadata: Metadata = {
  title: 'Supply-Demand Matrix | Trade Intelligence | Souvera',
  description: 'Explore 74-market × 8-sector supply capacity and demand signals — quantified opportunity scoring for bidirectional US-Africa/Caribbean trade.',
};

export default async function SupplyDemandPage() {
  // Check if user has access to Supply-Demand Matrix (Investor+ tier required)
  const { hasAccess } = await checkServerEntitlement('supply_demand_matrix');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <UpgradePrompt
          feature="Supply-Demand Matrix"
          requiredTier="investor"
          featureDescription="Access the comprehensive 74-market × 8-sector supply-demand matrix with supply capacity scores, demand signals, and opportunity indicators across Africa and the Caribbean."
          mode="card"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <section className="border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
          <Link 
            href="/intelligence/trade"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Trade Intelligence</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-medium text-purple-400">
              Investor Tier
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Supply-Demand Matrix
          </h1>
          <p className="text-lg text-zinc-400 max-w-3xl">
            Quantified opportunity scoring across <span className="text-white font-medium">74 markets × 8 sectors</span> — bidirectional trade analysis between Africa/Caribbean and the United States.
          </p>

          {/* How to Read the Matrix */}
          <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-zinc-300 mb-3">
                  <span className="font-medium text-white">How to Read This Matrix:</span> This matrix identifies <strong className="text-emerald-400">export opportunities</strong> from Africa/Caribbean <strong className="text-blue-400">to the United States</strong>.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-3">
                  <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded">
                    <p className="text-emerald-400 font-medium text-xs mb-1">Supply Score</p>
                    <p className="text-zinc-400 text-xs">Country's <strong>production capacity</strong> and export readiness in this sector</p>
                  </div>
                  <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                    <p className="text-blue-400 font-medium text-xs mb-1">Demand Score</p>
                    <p className="text-zinc-400 text-xs"><strong>US market</strong> import demand in this sector (not the country's own demand)</p>
                  </div>
                  <div className="p-2 bg-purple-500/5 border border-purple-500/20 rounded">
                    <p className="text-purple-400 font-medium text-xs mb-1">Opportunity Score</p>
                    <p className="text-zinc-400 text-xs">Where country supply can <strong>meet US demand</strong> with trade preference advantages</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span><span className="text-emerald-400">Tier 1 (80+)</span>: High-conviction</span>
                  <span><span className="text-blue-400">Tier 2 (60-79)</span>: Strong opportunity</span>
                  <span><span className="text-yellow-400">Tier 3 (40-59)</span>: Emerging</span>
                  <span><span className="text-zinc-400">Tier 4 (&lt;40)</span>: Early-stage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bidirectional Trade Note */}
          <div className="mt-4 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-zinc-300">
                  <span className="font-medium text-white">Bidirectional Trade View:</span> Click any cell to access <strong className="text-cyan-400">bidirectional analysis</strong>. Toggle between <span className="text-emerald-400">Region → US</span> (export capacity) and <span className="text-blue-400">US → Region</span> (import needs). Africa cells use AGOA reciprocity framing; Caribbean cells use CBI/CBTPA — petroleum excluded from preferential metrics (HTS Ch. 27).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        <SupplyDemandMatrixClient />
      </section>
    </div>
  );
}
