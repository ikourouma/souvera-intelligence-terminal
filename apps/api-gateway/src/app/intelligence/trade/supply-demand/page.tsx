// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Supply-Demand Matrix
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, ArrowLeft, FileText, Lock } from 'lucide-react';
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';

export const metadata: Metadata = {
  title: 'Supply-Demand Matrix | Trade Intelligence | Souvera',
  description: 'Explore supply capacity and demand signals across 74 markets and 8 key sectors.',
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
              Market Signals
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Supply-Demand Matrix
          </h1>
          <p className="text-lg text-zinc-400 max-w-3xl">
            Macro sector signals across 74 markets and 8 key sectors — the anchor layer for trade opportunity analysis.
          </p>

          {/* Data Attribution */}
          <div className="mt-6 flex items-center gap-4 text-sm">
            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400">
              Curated Preview Data
            </span>
            <span className="text-zinc-500">
              Aggregated from multiple sources
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        {/* Access Notice */}
        <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="text-white font-medium">Professional Access Required</p>
              <p className="text-zinc-400 text-sm">
                The supply-demand matrix is available for Professional and higher plans.
              </p>
            </div>
            <Link
              href="/access"
              className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
            >
              Upgrade
            </Link>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <BarChart3 className="w-16 h-16 text-purple-500/50 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Matrix Generation in Progress</h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-6">
            The 74-market × 7-sector supply-demand matrix is being generated from curated data sources.
            This view will show supply capacity scores, demand signals, and opportunity indicators.
          </p>
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
            <FileText className="w-4 h-4" />
            <span>Expected: Phase 4B Sprint 4</span>
          </div>
        </div>

        {/* Matrix Preview */}
        <div className="mt-8 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Matrix Dimensions</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-zinc-500 mb-2">Markets (74)</p>
              <ul className="space-y-1 text-zinc-300">
                <li>• 54 African countries</li>
                <li>• 20 Caribbean markets</li>
              </ul>
            </div>
            <div>
              <p className="text-zinc-500 mb-2">Sectors (8)</p>
              <ul className="space-y-1 text-zinc-300">
                <li>• Manufacturing & Textiles</li>
                <li>• Agriculture & Food Processing</li>
                <li>• Energy & Power</li>
                <li>• Mining & Critical Minerals</li>
                <li>• Digital Infrastructure</li>
                <li>• Fintech & Digital Finance</li>
                <li>• Logistics & Trade</li>
                <li>• Tourism & Hospitality</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Signal Types */}
        <div className="mt-6 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Signal Types</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <p className="text-emerald-400 font-medium mb-1">Supply Score</p>
              <p className="text-zinc-400 text-xs">
                Production capacity and export readiness based on African market data.
              </p>
            </div>
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 font-medium mb-1">Demand Score</p>
              <p className="text-zinc-400 text-xs">
                U.S. and global import demand signals based on trade flow data.
              </p>
            </div>
            <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
              <p className="text-purple-400 font-medium mb-1">Opportunity Score</p>
              <p className="text-zinc-400 text-xs">
                Derived signal combining supply capacity and demand potential.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
