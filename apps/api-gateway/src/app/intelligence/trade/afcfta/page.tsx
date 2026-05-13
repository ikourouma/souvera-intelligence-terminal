// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// AfCFTA Status Tracker
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AfCFTA Status Tracker | Trade Intelligence | Souvera',
  description: 'Track African Continental Free Trade Area implementation status including ratification and trading status.',
};

export default function AfCFTATrackerPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <section className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/intelligence/trade"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Trade Intelligence</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
              African Trade
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            AfCFTA Status Tracker
          </h1>
          <p className="text-lg text-zinc-400 max-w-3xl">
            Monitor African Continental Free Trade Area implementation status across 54 African countries.
          </p>

          {/* Data Attribution */}
          <div className="mt-6 flex items-center gap-4 text-sm">
            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400">
              Curated Preview Data
            </span>
            <span className="text-zinc-500">
              Source: AfCFTA Secretariat, tralac
            </span>
          </div>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <Building2 className="w-16 h-16 text-emerald-500/50 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Data Curation in Progress</h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-6">
            AfCFTA implementation status data is being curated from official sources. 
            This tracker will display ratification, deposit, and trading status for all African Union member states.
          </p>
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
            <FileText className="w-4 h-4" />
            <span>Expected: Phase 4B Sprint 2</span>
          </div>
        </div>

        {/* Framework Overview */}
        <div className="mt-8 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">About AfCFTA</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-zinc-500 mb-2">Implementation Stages</p>
              <ul className="space-y-1 text-zinc-300">
                <li>• Signed: Country has signed the agreement</li>
                <li>• Ratified: Domestic ratification complete</li>
                <li>• Deposited: Instrument deposited with AU</li>
                <li>• Trading: Actively trading under AfCFTA</li>
              </ul>
            </div>
            <div>
              <p className="text-zinc-500 mb-2">Coverage</p>
              <ul className="space-y-1 text-zinc-300">
                <li>• 54 African countries</li>
                <li>• Goods and services trade</li>
                <li>• Tariff liberalization</li>
                <li>• Rules of origin</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
