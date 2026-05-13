// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Indicators Page
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, Plus, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Indicators | Admin',
  description: 'Manage indicator definitions for Souvera Intelligence Terminal',
};

export default function IndicatorsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Indicator Definitions</h1>
          <p className="text-zinc-400 mt-1">
            Define and configure metrics for data ingestion
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Indicator
        </button>
      </div>

      {/* Coming Soon */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
        <BarChart3 className="w-16 h-16 text-indigo-500/50 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Indicator Builder Coming Soon</h2>
        <p className="text-zinc-400 max-w-lg mx-auto mb-6">
          The indicator builder will allow admins to define custom metrics, map them to data sources, 
          configure transformations, and set visibility rules.
        </p>
        <p className="text-zinc-500 text-sm">Expected: Phase 4B Sprint 1</p>
      </div>

      {/* Preview of Existing Indicators */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Core Indicators (Pre-configured)</h3>
        <div className="space-y-3">
          {[
            { key: 'gdp_current_usd', label: 'GDP (Current USD)', domain: 'macro', source: 'World Bank WDI' },
            { key: 'gdp_growth_pct', label: 'GDP Growth Rate', domain: 'macro', source: 'World Bank WDI' },
            { key: 'population_total', label: 'Total Population', domain: 'macro', source: 'World Bank WDI' },
            { key: 'fdi_net_inflows', label: 'FDI Net Inflows', domain: 'investment', source: 'World Bank WDI' },
          ].map((indicator) => (
            <div key={indicator.key} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
              <div>
                <p className="text-white font-medium">{indicator.label}</p>
                <p className="text-zinc-500 text-sm font-mono">{indicator.key}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-zinc-500">{indicator.source}</span>
                <span className="px-2 py-1 bg-zinc-700 rounded text-xs text-zinc-300">{indicator.domain}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
