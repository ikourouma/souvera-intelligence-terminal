'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, Users, DollarSign, Globe, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { UpgradePrompt } from '@/components/access/UpgradePrompt';
import { PreviewDataBanner } from '@/components/intelligence/PreviewDataBanner';
import { MarketSignalBadge } from '@/components/intelligence/MarketSignalBadge';

interface CountryDrawerProps {
  iso3: string | null;
  onClose: () => void;
}

interface CountryData {
  country: {
    iso2: string;
    iso3: string;
    name: string;
    region: string;
    subregion?: string;
    capital?: string;
    currencyCode?: string;
    flagUrl?: string;
  };
  metrics?: {
    gdpCurrentUsd?: number;
    gdpGrowthPct?: number;
    populationTotal?: number;
    fdiNetInflowsUsd?: number;
    inflationCpiPct?: number;
    fxToUsd?: number;
    gdpForecastPct?: number;
  };
  signal?: {
    level?: string;
    investmentScore?: number;
    confidenceScore?: number;
  };
  sectors?: Array<{
    label: string;
    teaser?: string;
    rationale?: string;
    strengthScore?: number;
    growthScore?: number;
  }>;
  narrative?: {
    summary?: string;
    whyNow?: string;
  };
  thesis?: {
    opportunityThesis?: string;
    riskNarrative?: string;
  };
  teaser?: {
    afdecTeaser?: string;
  };
  freshness?: {
    updatedAt?: string;
  };
  meta: {
    product: string;
    owner: string;
    accessTier: string;
    authenticated: boolean;
    generatedAt: string;
    sources: Array<{ key: string; name: string }>;
    previewData?: boolean;
  };
}

export function CountryDrawer({ iso3, onClose }: CountryDrawerProps) {
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iso3) {
      setCountryData(null);
      return;
    }

    const fetchCountryData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/country-lite?iso3=${iso3}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch country data: ${response.statusText}`);
        }

        const data = await response.json();
        setCountryData(data);
      } catch (err) {
        console.error('Error fetching country data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load country data');
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [iso3]);

  if (!iso3) return null;

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatNumber = (value?: number) => {
    if (!value) return 'N/A';
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return value >= 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-2xl h-full bg-zinc-950 border-l border-zinc-800 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Loading country intelligence...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Error</h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium mb-1">Failed to load country data</p>
                  <p className="text-red-400/80 text-sm">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {countryData && (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {countryData.country.flagUrl && (
                      <img 
                        src={countryData.country.flagUrl} 
                        alt={`${countryData.country.name} flag`}
                        className="w-8 h-6 object-cover rounded-sm border border-zinc-700"
                      />
                    )}
                    <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {countryData.country.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    {countryData.country.capital && (
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{countryData.country.capital}</span>
                      </div>
                    )}
                    {countryData.country.region && (
                      <div className="text-zinc-600">
                        {countryData.country.region}
                        {countryData.country.subregion && ` • ${countryData.country.subregion}`}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-zinc-400 hover:text-white transition-colors p-2 ml-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview Data Banner */}
              {countryData.meta.previewData && (
                <PreviewDataBanner 
                  sources={countryData.meta.sources}
                  freshnessAt={countryData.freshness?.updatedAt}
                  className="mt-4"
                />
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              {(countryData.metrics?.gdpCurrentUsd || 
                countryData.metrics?.gdpGrowthPct || 
                countryData.metrics?.populationTotal) && (
                <div>
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 mb-3">
                    Key Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {countryData.metrics.gdpCurrentUsd !== undefined && (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-blue-400" />
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">GDP</span>
                        </div>
                        <div className="text-xl font-black text-blue-400">
                          {formatCurrency(countryData.metrics.gdpCurrentUsd)}
                        </div>
                      </div>
                    )}

                    {countryData.metrics.gdpGrowthPct !== undefined && (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Growth</span>
                        </div>
                        <div className="text-xl font-black text-emerald-400">
                          {formatPercent(countryData.metrics.gdpGrowthPct)}
                        </div>
                      </div>
                    )}

                    {countryData.metrics.populationTotal !== undefined && (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Population</span>
                        </div>
                        <div className="text-xl font-black text-purple-400">
                          {formatNumber(countryData.metrics.populationTotal)}
                        </div>
                      </div>
                    )}

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-zinc-400" />
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Signal</span>
                      </div>
                      <MarketSignalBadge
                        profileSignal={countryData.signal?.level}
                        gdpGrowthPct={countryData.metrics?.gdpGrowthPct}
                        size="md"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Metrics (FDI, Inflation, etc.) */}
              {(countryData.metrics?.fdiNetInflowsUsd || 
                countryData.metrics?.inflationCpiPct) && (
                <div>
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 mb-3">
                    Investment Profile
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {countryData.metrics.fdiNetInflowsUsd !== undefined && (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-4">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-2">FDI Inflows</span>
                        <div className="text-lg font-bold text-amber-400">
                          {formatCurrency(countryData.metrics.fdiNetInflowsUsd)}
                        </div>
                      </div>
                    )}

                    {countryData.metrics.inflationCpiPct !== undefined && (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-4">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-2">Inflation</span>
                        <div className="text-lg font-bold text-orange-400">
                          {formatPercent(countryData.metrics.inflationCpiPct)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Narrative Summary */}
              {countryData.narrative?.summary && (
                <div>
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 mb-3">
                    Market Overview
                  </h3>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-4">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {countryData.narrative.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Sectors */}
              {countryData.sectors && countryData.sectors.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 mb-3">
                    Key Sectors
                  </h3>
                  <div className="space-y-2">
                    {countryData.sectors.map((sector, idx) => (
                      <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-4">
                        <div className="font-bold text-white mb-1">{sector.label}</div>
                        {sector.teaser && (
                          <p className="text-sm text-zinc-400">{sector.teaser}</p>
                        )}
                        {sector.rationale && (
                          <p className="text-sm text-zinc-400 mt-2">{sector.rationale}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upgrade Prompts for Gated Content */}
              {!countryData.narrative && countryData.meta.accessTier === 'explorer' && (
                <UpgradePrompt 
                  feature="Full Market Analysis & Investment Narrative"
                  currentPlan="Explorer"
                  suggestedPlan="Professional"
                  variant="banner"
                />
              )}

              {!countryData.thesis && countryData.meta.accessTier === 'professional' && (
                <UpgradePrompt 
                  feature="Investment Thesis & Risk Analysis"
                  currentPlan="Professional"
                  suggestedPlan="Business"
                  variant="banner"
                />
              )}

              {/* No Data Message */}
              {!countryData.metrics?.gdpCurrentUsd && 
               !countryData.metrics?.populationTotal && 
               !countryData.narrative?.summary && (
                <div className="py-12 text-center">
                  <Globe className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Data Coming Soon</h3>
                  <p className="text-zinc-400 max-w-md mx-auto">
                    Detailed intelligence for {countryData.country.name} is being prepared. 
                    Check back soon for comprehensive market data.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
