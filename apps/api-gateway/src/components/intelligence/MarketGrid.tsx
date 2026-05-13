'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin, TrendingUp, Globe, ChevronDown, ChevronUp, X } from 'lucide-react';
import { isApprovedSouveraMarket, isApprovedCaribbeanMarket } from '@/lib/market-coverage';

interface Country {
  iso2: string;
  iso3: string;
  name: string;
  region: string;
  subregion?: string;
  capital?: string;
  flagUrl?: string;
  lat?: number;
  lng?: number;
  gdpCurrentUsd?: number;
  populationTotal?: number;
  signalLevel?: string;
  freshnessAt?: string;
  isAfricanCountry?: boolean;
}

interface MarketGridProps {
  countries: Country[];
  onCountryClick: (iso3: string) => void;
  showRegionFilters?: boolean;
}

const INITIAL_VISIBLE_COUNT = 12;

export function MarketGrid({ countries, onCountryClick, showRegionFilters = true }: MarketGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredCountries = useMemo(() => {
    let filtered = countries;

    // Defensive filter: only show approved Souvera markets
    // This is a safety display filter; API is the primary enforcement
    filtered = filtered.filter(country =>
      isApprovedSouveraMarket({
        iso3: country.iso3,
        isAfricanCountry: country.isAfricanCountry,
      })
    );

    // Region filter
    if (regionFilter !== 'all') {
      if (regionFilter === 'Africa') {
        // Africa only: is_african_country = true
        filtered = filtered.filter(c => c.isAfricanCountry === true);
      } else if (regionFilter === 'Caribbean') {
        // Caribbean only: approved Caribbean ISO3 list
        filtered = filtered.filter(c => isApprovedCaribbeanMarket(c.iso3));
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.iso3.toLowerCase().includes(query) ||
        c.capital?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [countries, searchQuery, regionFilter]);

  // Visible countries for collapsed grid
  // If user is searching, show all matches; otherwise respect collapsed state
  const visibleCountries = useMemo(() => {
    if (searchQuery) {
      // When searching, show all matches
      return filteredCountries;
    }
    
    if (isExpanded) {
      return filteredCountries;
    }
    
    // Collapsed: show first 12 cards (3 rows of 4)
    return filteredCountries.slice(0, INITIAL_VISIBLE_COUNT);
  }, [filteredCountries, isExpanded, searchQuery]);

  const showExpandButton = filteredCountries.length > INITIAL_VISIBLE_COUNT && !searchQuery;

  const getSignalColor = (level?: string) => {
    switch (level) {
      case 'high_growth': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'emerging': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'stable': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
      case 'watchlist': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'risk_elevated': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-zinc-800/50 text-zinc-500 border-zinc-700';
    }
  };

  const formatGDP = (gdp?: number) => {
    if (!gdp) return null;
    if (gdp >= 1e12) return `$${(gdp / 1e12).toFixed(2)}T`;
    if (gdp >= 1e9) return `$${(gdp / 1e9).toFixed(1)}B`;
    if (gdp >= 1e6) return `$${(gdp / 1e6).toFixed(1)}M`;
    return null;
  };

  const formatPopulation = (pop?: number) => {
    if (!pop) return null;
    if (pop >= 1e9) return `${(pop / 1e9).toFixed(2)}B`;
    if (pop >= 1e6) return `${(pop / 1e6).toFixed(1)}M`;
    if (pop >= 1e3) return `${(pop / 1e3).toFixed(1)}K`;
    return pop.toString();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by country, ISO code, or capital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-zinc-900/50 border border-zinc-800 rounded-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Region Filter — only shown on /intelligence/map (all regions view) */}
        {showRegionFilters && (
          <div className="flex gap-2">
            {['all', 'Africa', 'Caribbean'].map((region) => (
              <button
                key={region}
                onClick={() => setRegionFilter(region)}
                className={`px-6 py-3 text-sm font-bold tracking-widest uppercase rounded-sm transition-all ${
                  regionFilter === region
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {region === 'all' ? 'All Regions' : region}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-zinc-500">
        {searchQuery ? (
          <>
            Found <span className="text-zinc-300 font-semibold">{filteredCountries.length}</span> {filteredCountries.length === 1 ? 'country' : 'countries'}
          </>
        ) : (
          <>
            Showing <span className="text-zinc-300 font-semibold">{visibleCountries.length}</span> of <span className="text-zinc-300 font-semibold">{filteredCountries.length}</span> {filteredCountries.length === 1 ? 'market' : 'markets'}
          </>
        )}
      </div>

      {/* Country Grid */}
      {filteredCountries.length === 0 ? (
        <div className="py-16 text-center">
          <Globe className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Markets Found</h3>
          <p className="text-zinc-400">
            {searchQuery 
              ? 'No approved Souvera markets match this search.'
              : 'No approved Souvera markets match this filter.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleCountries.map((country) => (
              <button
                key={country.iso3}
                onClick={() => onCountryClick(country.iso3)}
                className="group p-6 bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-900 rounded-sm text-left transition-all"
              >
                {/* Country Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {country.flagUrl && (
                      <img
                        src={country.flagUrl}
                        alt={`${country.name} flag`}
                        className="w-8 h-6 object-cover rounded-sm border border-zinc-700 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {country.name}
                      </h3>
                      <div className="text-xs text-zinc-600 font-mono">{country.iso3}</div>
                    </div>
                  </div>
                </div>

                {/* Country Metadata */}
                <div className="space-y-2 mb-4">
                  {country.capital && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{country.capital}</span>
                    </div>
                  )}
                  {country.subregion && (
                    <div className="text-xs text-zinc-600">
                      {country.subregion}
                    </div>
                  )}
                </div>

                {/* Quick Metrics */}
                <div className="space-y-2 mb-4">
                  {formatGDP(country.gdpCurrentUsd) && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600">GDP</span>
                      <span className="text-blue-400 font-bold">
                        {formatGDP(country.gdpCurrentUsd)}
                      </span>
                    </div>
                  )}
                  {formatPopulation(country.populationTotal) && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600">Population</span>
                      <span className="text-purple-400 font-bold">
                        {formatPopulation(country.populationTotal)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Signal Badge */}
                {country.signalLevel && (
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${getSignalColor(country.signalLevel)}`}>
                    <TrendingUp className="w-3 h-3" />
                    {country.signalLevel.replace('_', ' ')}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Expand/Collapse Button */}
          {showExpandButton && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-900 rounded-sm text-sm font-bold text-zinc-300 hover:text-white transition-all"
              >
                {isExpanded ? (
                  <>
                    Show fewer
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show all markets
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
