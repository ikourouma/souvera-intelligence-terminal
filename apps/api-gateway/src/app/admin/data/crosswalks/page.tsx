// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Country Code Crosswalks Page
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import { Globe, Search, Plus, CheckCircle, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Crosswalks | Admin',
  description: 'Manage country code crosswalks for Souvera Intelligence Terminal',
};

export default function CrosswalksPage() {
  // Sample crosswalk data for preview
  const sampleCrosswalks = [
    { iso3: 'NGA', census: '7560', comtrade: '566', wdi: 'NGA', name: 'Nigeria', excluded: false },
    { iso3: 'ZAF', census: '7910', comtrade: '710', wdi: 'ZAF', name: 'South Africa', excluded: false },
    { iso3: 'KEN', census: '7600', comtrade: '404', wdi: 'KEN', name: 'Kenya', excluded: false },
    { iso3: 'GHA', census: '7360', comtrade: '288', wdi: 'GHA', name: 'Ghana', excluded: false },
    { iso3: 'EGY', census: '7850', comtrade: '818', wdi: 'EGY', name: 'Egypt', excluded: false },
    { iso3: 'JAM', census: '2110', comtrade: '388', wdi: 'JAM', name: 'Jamaica', excluded: false },
    { iso3: 'TTO', census: '2740', comtrade: '780', wdi: 'TTO', name: 'Trinidad and Tobago', excluded: false },
    { iso3: 'ESH', census: '-', comtrade: '732', wdi: 'ESH', name: 'Western Sahara', excluded: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Country Code Crosswalks</h1>
          <p className="text-zinc-400 mt-1">
            Map external country codes to Souvera's 74-market scope
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Mapping
        </button>
      </div>

      {/* Market Scope Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">African Markets</p>
              <p className="text-2xl font-bold text-white">54</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Caribbean Markets</p>
              <p className="text-2xl font-bold text-white">20</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Excluded</p>
              <p className="text-2xl font-bold text-white">1</p>
              <p className="text-zinc-500 text-xs">ESH (Western Sahara)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by ISO3, name, or external code..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      {/* Crosswalk Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                ISO3
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Census Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Comtrade Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                WDI Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sampleCrosswalks.map((row) => (
              <tr key={row.iso3} className={`hover:bg-zinc-800/30 transition-colors ${row.excluded ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{row.name}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-zinc-300 font-mono">{row.iso3}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-zinc-400 font-mono text-sm">{row.census}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-zinc-400 font-mono text-sm">{row.comtrade}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-zinc-400 font-mono text-sm">{row.wdi}</span>
                </td>
                <td className="px-6 py-4">
                  {row.excluded ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                      <XCircle className="w-3 h-3" />
                      Excluded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Code System Reference */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">External Code Systems</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-zinc-300 font-medium mb-2">U.S. Census</p>
            <p className="text-zinc-500 text-xs">
              4-digit codes used in U.S. Census International Trade data.
              Required for Census Trade API integration.
            </p>
          </div>
          <div>
            <p className="text-zinc-300 font-medium mb-2">UN Comtrade (M49)</p>
            <p className="text-zinc-500 text-xs">
              UN M49 standard numeric codes used in UN Comtrade database.
              Required for Comtrade API integration.
            </p>
          </div>
          <div>
            <p className="text-zinc-300 font-medium mb-2">World Bank WDI</p>
            <p className="text-zinc-500 text-xs">
              ISO3 codes used in World Bank World Development Indicators.
              Usually matches Souvera ISO3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
