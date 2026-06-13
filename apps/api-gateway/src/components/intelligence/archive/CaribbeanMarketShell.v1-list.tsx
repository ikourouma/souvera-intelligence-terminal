/**
 * ARCHIVED — Caribbean Market Shell v1 (List UI)
 * ==============================================
 * Archived: 2026-05-20
 * Superseded by: CaribbeanMapPanel (geospatial, Natural Earth 50m)
 *
 * Production usage removed from SouveraMapWorkspace in favor of CaribbeanMapPanel.
 * Preserved for platform reference and available at:
 *   /intelligence/caribbean/list-archive
 *
 * Original implementation: Phase 3 Step 4A (search + card grid, 20 territories)
 * See: docs/architecture/archive/caribbean-market-shell-v1-list.md
 */

'use client';

import { useState, useMemo } from 'react';
import { Search, X, MapPin, TrendingUp, Users, ArrowRight } from 'lucide-react';
import type { Country } from '../SouveraMapWorkspace';

export interface CaribbeanMarketShellProps {
  countries: Country[];
  selectedIso3: string | null;
  onCountrySelect: (iso3: string) => void;
}

export function CaribbeanMarketShell({
  countries,
  selectedIso3,
  onCountrySelect,
}: CaribbeanMarketShellProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;

    const query = searchQuery.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.iso3.toLowerCase().includes(query) ||
        (c.capital && c.capital.toLowerCase().includes(query))
    );
  }, [countries, searchQuery]);

  const formatCurrency = (value: number | undefined | null): string => {
    if (value == null) return 'Data pending';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toFixed(0)}`;
  };

  const formatPercent = (value: number | undefined | null): string => {
    if (value == null) return 'Data pending';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatPopulation = (value: number | undefined | null): string => {
    if (value == null) return 'Data pending';
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-zinc-950">
      <div className="p-6 pb-4 shrink-0 border-b border-zinc-800/50">
        <div className="w-full max-w-sm sm:max-w-none mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search Caribbean markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-sm text-sm text-white placeholder-zinc-500 focus:border-zinc-700 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="mt-2 text-xs text-zinc-600 text-center sm:text-left">
            Showing {filteredCountries.length} of {countries.length} markets
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-4">
        {filteredCountries.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No markets found matching &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCountries.map((country) => {
              const isSelected = selectedIso3 === country.iso3;
              return (
                <button
                  key={country.iso3}
                  onClick={() => onCountrySelect(country.iso3)}
                  className={`group relative p-4 bg-zinc-900 border rounded-sm text-left transition-all hover:border-zinc-700 hover:bg-zinc-900/80 ${
                    isSelected ? 'border-blue-500 bg-blue-950/20' : 'border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {country.flagUrl ? (
                        <img
                          src={country.flagUrl}
                          alt={`${country.name} flag`}
                          className="w-8 h-6 object-cover rounded-sm shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-zinc-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {country.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-zinc-600 font-mono">{country.iso3}</span>
                          {country.capital && (
                            <>
                              <span className="text-zinc-700">·</span>
                              <span className="text-xs text-zinc-600">{country.capital}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-zinc-600 mb-1">GDP</div>
                      <div className="text-white font-semibold">
                        {formatCurrency(country.gdpCurrentUsd)}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-600 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Growth
                      </div>
                      <div
                        className={`font-semibold ${
                          country.gdpGrowthPct != null && country.gdpGrowthPct > 0
                            ? 'text-green-500'
                            : country.gdpGrowthPct != null && country.gdpGrowthPct < 0
                              ? 'text-red-500'
                              : 'text-zinc-400'
                        }`}
                      >
                        {formatPercent(country.gdpGrowthPct)}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-600 mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Pop
                      </div>
                      <div className="text-white font-semibold">
                        {formatPopulation(country.populationTotal)}
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-blue-500" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
