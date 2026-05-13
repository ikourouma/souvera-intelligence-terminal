// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Data Quality Page
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import { AlertTriangle, CheckCircle, AlertCircle, Info, Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Quality | Admin',
  description: 'Monitor data quality issues for Souvera Intelligence Terminal',
};

export default function QualityPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Quality Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Monitor and resolve data quality issues
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Quality Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Healthy</p>
              <p className="text-2xl font-bold text-emerald-400">100%</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Errors</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Warnings</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Info</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Findings */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Quality Findings</h2>
        </div>
        <div className="p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto" />
          <p className="text-zinc-400 mt-4">No quality issues detected</p>
          <p className="text-zinc-500 text-sm mt-1">
            Quality findings will appear here after data ingestion runs
          </p>
        </div>
      </div>

      {/* Quality Rules */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active Validation Rules</h3>
        <div className="space-y-3">
          {[
            { code: 'INVALID_ISO3', severity: 'error', description: 'ISO3 code not in Souvera 74-market scope' },
            { code: 'EXCLUDED_MARKET', severity: 'error', description: 'ESH/Western Sahara rejected from public scope' },
            { code: 'MISSING_SOURCE_META', severity: 'error', description: 'Source metadata required for all uploads' },
            { code: 'MISSING_AS_OF_DATE', severity: 'error', description: 'as_of_date required for temporal data' },
            { code: 'VALUE_OUT_OF_RANGE', severity: 'warning', description: 'Value outside expected range for indicator' },
            { code: 'DUPLICATE_ENTRY', severity: 'warning', description: 'Duplicate country/indicator/period combination' },
          ].map((rule) => (
            <div key={rule.code} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                {rule.severity === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <div>
                  <p className="text-white font-mono text-sm">{rule.code}</p>
                  <p className="text-zinc-500 text-xs">{rule.description}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                rule.severity === 'error' 
                  ? 'bg-red-500/10 text-red-400' 
                  : 'bg-amber-500/10 text-amber-400'
              }`}>
                {rule.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
