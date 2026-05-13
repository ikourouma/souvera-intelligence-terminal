'use client';

import { useState, useEffect } from 'react';
import { Map, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { MarketGrid } from '@/components/intelligence/MarketGrid';
import { CountryDrawer } from '@/components/intelligence/CountryDrawer';
import { PreviewDataBanner } from '@/components/intelligence/PreviewDataBanner';
import { isApprovedSouveraMarket } from '@/lib/market-coverage';

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

interface CountriesResponse {
  countries: Country[];
  meta: {
    product: string;
    owner: string;
    accessTier: string;
    authenticated: boolean;
    generatedAt: string;
    region: string;
    count: number;
    previewData?: boolean;
    sources: Array<{ key: string; name: string }>;
  };
}

interface IntelligenceMapClientProps {
  defaultRegion?: 'africa' | 'caribbean' | 'all';
}

export function IntelligenceMapClient({ defaultRegion = 'all' }: IntelligenceMapClientProps = {}) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [meta, setMeta] = useState<CountriesResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountryIso3, setSelectedCountryIso3] = useState<string | null>(null);

  const fetchCountries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/countries?region=${defaultRegion}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch countries: ${response.statusText}`);
      }

      const data: CountriesResponse = await response.json();
      
      // Defensive filter: only render approved Souvera markets
      // This is a safety layer; API is the primary enforcement
      const approvedCountries = (data.countries || []).filter(country =>
        isApprovedSouveraMarket({
          iso3: country.iso3,
          isAfricanCountry: country.isAfricanCountry,
        })
      );
      
      setCountries(approvedCountries);
      setMeta(data.meta);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, [defaultRegion]);

  const handleCountryClick = (iso3: string) => {
    setSelectedCountryIso3(iso3);
  };

  const handleCloseDrawer = () => {
    setSelectedCountryIso3(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Preview Data Banner */}
        {meta?.previewData && (
          <PreviewDataBanner 
            sources={meta.sources}
            freshnessAt={meta.generatedAt}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading intelligence map...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-16">
            <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 rounded-sm p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-400 mb-2">
                    Failed to Load Intelligence Map
                  </h3>
                  <p className="text-red-400/80 mb-4">{error}</p>
                  <button
                    onClick={fetchCountries}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-sm transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && countries.length === 0 && (
          <div className="py-24 text-center">
            <Map className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Countries Available</h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              No approved Souvera markets match this filter.
            </p>
          </div>
        )}

        {/* Market Grid */}
        {!loading && !error && countries.length > 0 && (
          <MarketGrid 
            countries={countries}
            onCountryClick={handleCountryClick}
            showRegionFilters={defaultRegion === 'all'}
          />
        )}

        {/* Access Tier Info */}
        {meta && !loading && (
          <div className="pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <div>
                Access Tier: <span className="text-zinc-400 font-semibold">{meta.accessTier}</span>
                {meta.authenticated ? ' (Authenticated)' : ' (Public)'}
              </div>
              <div>
                Countries: <span className="text-zinc-400 font-semibold">{meta.count}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Country Drawer */}
      {selectedCountryIso3 && (
        <CountryDrawer 
          iso3={selectedCountryIso3}
          onClose={handleCloseDrawer}
        />
      )}
    </>
  );
}
