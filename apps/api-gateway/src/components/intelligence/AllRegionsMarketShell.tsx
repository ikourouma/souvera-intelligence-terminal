'use client';

import { useState, useMemo } from 'react';
import { Search, X, MapPin, TrendingUp, Users, ArrowRight } from 'lucide-react';
import type { Country } from './SouveraMapWorkspace';

interface AllRegionsMarketShellProps {
  countries: Country[];
  selectedIso3: string | null;
  onCountrySelect: (iso3: string) => void;
}

type RegionBadge = 'africa' | 'caribbean';

function getRegionBadge(country: Country): RegionBadge {
  return country.isAfricanCountry === true ? 'africa' : 'caribbean';
}

export function AllRegionsMarketShell({
  countries,
  selectedIso3,
  onCountrySelect,
}: AllRegionsMarketShellProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'africa' | 'caribbean'>('all');

  // Filter countries by search query and region filter
  const filteredCountries = useMemo(() => {
    let result = countries;

    // Apply region filter first
    if (activeFilter !== 'all') {
      result = result.filter(c =>
        activeFilter === 'africa' ? c.isAfricanCountry === true : c.isAfricanCountry !== true
      );
    }

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.iso3.toLowerCase().includes(query) ||
        (c.capital && c.capital.toLowerCase().includes(query))
      );
    }

    return result;
  }, [countries, searchQuery, activeFilter]);

  // Counts per badge
  const africaCount = useMemo(() => countries.filter(c => c.isAfricanCountry === true).length, [countries]);
  const caribbeanCount = useMemo(() => countries.filter(c => c.isAfricanCountry !== true).length, [countries]);

  const formatCurrency = (value: number | undefined | null): string => {
    if (value == null) return 'Data pending';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
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
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* Search + Filter Header - Fixed */}
      <div className="p-6 pb-4 shrink-0 space-y-3 border-b border-zinc-800/50">
        {/* Mobile Control Rail Container */}
        <div className="w-full max-w-sm sm:max-w-none mx-auto space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search all markets..."
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

          {/* Region Filter Pills - Stack on mobile, horizontal on tablet+ */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors text-center ${
                activeFilter === 'all'
                  ? 'bg-zinc-700 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              All ({countries.length})
            </button>
            <button
              onClick={() => setActiveFilter('africa')}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors text-center ${
                activeFilter === 'africa'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              Africa ({africaCount})
            </button>
            <button
              onClick={() => setActiveFilter('caribbean')}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors text-center ${
                activeFilter === 'caribbean'
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              Caribbean ({caribbeanCount})
            </button>
          </div>

          {/* Result Count */}
          <div className="text-xs text-zinc-600 text-center sm:text-left">
            Showing {filteredCountries.length} of {countries.length} markets
          </div>
        </div>
      </div>

      {/* Market Cards Area - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 pt-4">
        {filteredCountries.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">
              No markets found matching &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
              className="mt-4 text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCountries.map((country) => {
            const isSelected = selectedIso3 === country.iso3;
            const badge = getRegionBadge(country);

            return (
              <button
                key={country.iso3}
                onClick={() => onCountrySelect(country.iso3)}
                className={`
                  group relative p-4 bg-zinc-900 border rounded-sm text-left transition-all
                  hover:border-zinc-700 hover:bg-zinc-900/80
                  ${isSelected ? 'border-blue-500 bg-blue-950/20' : 'border-zinc-800'}
                `}
              >
                {/* Header: Flag + Name + Region Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Flag */}
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

                    {/* Country Name + meta */}
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {country.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-zinc-600 font-mono">{country.iso3}</span>
                        {country.capital && (
                          <>
                            <span className="text-zinc-700">·</span>
                            <span className="text-xs text-zinc-600 truncate">{country.capital}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Region Badge + Selected Indicator */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                      badge === 'africa'
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                        : 'bg-teal-500/15 text-teal-400 border border-teal-500/25'
                    }`}>
                      {badge === 'africa' ? 'AFR' : 'CAR'}
                    </span>
                    {isSelected && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {/* GDP */}
                  <div>
                    <div className="text-zinc-600 mb-1">GDP</div>
                    <div className="text-white font-semibold">
                      {formatCurrency(country.gdpCurrentUsd)}
                    </div>
                  </div>

                  {/* GDP Growth */}
                  <div>
                    <div className="text-zinc-600 mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Growth
                    </div>
                    <div className={`font-semibold ${
                      country.gdpGrowthPct != null && country.gdpGrowthPct > 0
                        ? 'text-green-500'
                        : country.gdpGrowthPct != null && country.gdpGrowthPct < 0
                        ? 'text-red-500'
                        : 'text-zinc-400'
                    }`}>
                      {formatPercent(country.gdpGrowthPct)}
                    </div>
                  </div>

                  {/* Population */}
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

                {/* Hover Arrow */}
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
