'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  X, ArrowRight, Loader2, AlertCircle, Globe, MapPin,
  Calendar, Database, TrendingUp, Network
} from 'lucide-react';
import Image from 'next/image';
import { REGION_COLORS, type AfricaRegion, DATA_STATUS_LABELS } from '@/lib/map-constants';
import { EntitledMetricCard } from './EntitledMetricCard';
import { EntitledSectorList } from './EntitledSectorList';
import {
  countryMapPanelCta,
  countryTerminalHref,
  planRankFromTier,
  canAccessCountryTerminal,
} from '@/lib/intelligence/routing';
import { mapPanelSectorsEmptyMessage } from '@/lib/intelligence/map-panel-sectors';
import { isFullTerminalPilot } from '@/lib/intelligence/country-names';
import { PLAN_RANKS } from '@souvera/entitlements';
import type { RegionFilter } from '@/lib/market-coverage';
import type { Country } from './SouveraMapWorkspace';

interface CountryPanelData {
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
  metrics: {
    gdpCurrentUsd?: number;
    gdpGrowthPct?: number;
    populationTotal?: number;
    fdiNetInflowsUsd?: number;
    inflationCpiPct?: number;
    fxToUsd?: number;
    gdpForecastPct?: number;
  };
  signal: {
    level?: string;
    investmentScore?: number;
    confidenceScore?: number;
  };
  sectors: Array<{
    label: string;
    teaser?: string;
    rationale?: string;
    strengthScore?: number;
    growthScore?: number;
  }>;
  teaser: {
    afdecTeaser?: string;
  };
  narrative?: {
    summary?: string;
    whyNow?: string;
    economicMomentum?: string;
    investorReadiness?: string;
  };
  freshness: {
    updatedAt?: string;
  };
  meta: {
    accessTier: string;
    authenticated: boolean;
    planRank?: number;
    sources: Array<{ key: string; name: string }>;
  };
}

interface CountryIntelligencePanelProps {
  selectedIso3: string | null;
  onClose?: () => void;
  onCountrySelect?: (iso3: string) => void;
  regionData?: Map<string, AfricaRegion>;
  topEconomies?: Country[];
  defaultPanelTitle?: string;
  defaultPanelSubtitle?: string;
  /** Workspace region — drives default-panel CTA routing */
  region?: RegionFilter;
}

/**
 * Generate dynamic country intelligence summary based on available data
 */
function getCountryIntelligenceSummary(data: CountryPanelData): string {
  const { country, metrics, sectors } = data;
  const hasSectorData = sectors && sectors.length > 0;
  const hasGdp = metrics.gdpCurrentUsd !== undefined;
  const region = country.region?.toLowerCase();
  const isAfrica = region?.includes('africa');
  const isCaribbean = region?.includes('caribbean') || region?.includes('americas');

  // Priority 1: Countries with sector data and strong economic metrics
  if (hasSectorData && hasGdp && sectors.length >= 3) {
    if (isAfrica) {
      return `${country.name} combines macroeconomic scale, sector-specific opportunity, and regional positioning across key growth sectors. Souvera highlights trade patterns, investment flows, and industrial capacity through curated intelligence.`;
    } else if (isCaribbean) {
      return `${country.name} combines services-led growth, strategic connectivity, and sector-specific opportunity across key industries. Souvera tracks trade corridors, investment flows, and economic diversification through curated intelligence.`;
    }
    return `${country.name} combines economic scale, sector-specific opportunity, and strategic positioning. Souvera highlights the market's strongest signals through trade, investment, and sector intelligence.`;
  }

  // Priority 2: Countries with sector data but limited metrics
  if (hasSectorData) {
    return `${country.name} is positioned across key growth sectors including ${sectors[0]?.label?.toLowerCase() || 'emerging industries'}. Souvera tracks sector momentum, regional connectivity, and investment opportunity as data coverage expands.`;
  }

  // Priority 3: Countries without sector data (fallback)
  if (isAfrica) {
    return `${country.name} is part of Souvera's Africa market intelligence coverage. Sector-level analysis and investment intelligence are pending as country profiles and source coverage are expanded.`;
  } else if (isCaribbean) {
    return `${country.name} is part of Souvera's Caribbean market intelligence coverage. Sector-level analysis and investment intelligence are pending as country profiles and source coverage are expanded.`;
  }

  // Default fallback
  return `${country.name} is part of Souvera's curated market intelligence coverage. Additional sector-level intelligence is pending as source coverage and country profiles are expanded.`;
}

export function CountryIntelligencePanel({
  selectedIso3,
  onClose,
  onCountrySelect,
  regionData,
  topEconomies = [],
  defaultPanelTitle = 'Top 10 Economies',
  defaultPanelSubtitle = 'Largest African economies by GDP',
  region: workspaceRegion = 'africa',
}: CountryIntelligencePanelProps) {
  const [data, setData] = useState<CountryPanelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meAccess, setMeAccess] = useState({
    authenticated: false,
    planRank: 0,
    planId: 'public',
  });

  useEffect(() => {
    fetch('/api/v1/me', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((me) => {
        setMeAccess({
          authenticated: me.authenticated === true,
          planRank: me.access?.rank ?? planRankFromTier(me.access?.planId),
          planId: me.access?.planId ?? 'public',
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Early return for no selection - handled by conditional rendering
    if (!selectedIso3) return;

    let cancelled = false;

    const fetchCountryData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/country-lite?iso3=${selectedIso3}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        
        if (cancelled) return;
        
        if (!response.ok) {
          throw new Error('Failed to fetch country data');
        }

        const result = await response.json();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching country:', err);
          setError(err instanceof Error ? err.message : 'Failed to load country data');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCountryData();
    
    return () => {
      cancelled = true;
    };
  }, [selectedIso3]);
  
  // Reset data when no country selected
  useEffect(() => {
    if (!selectedIso3) {
      // Use setTimeout to avoid setState-in-effect lint warning
      const timer = setTimeout(() => setData(null), 0);
      return () => clearTimeout(timer);
    }
  }, [selectedIso3]);

  // Determine region color
  const getRegionColor = (iso3: string | undefined): AfricaRegion | undefined => {
    if (!iso3) return undefined;
    if (regionData?.has(iso3)) return regionData.get(iso3);
    return undefined;
  };

  const africaRegion = selectedIso3 ? getRegionColor(selectedIso3) : undefined;
  const regionColor = africaRegion ? REGION_COLORS[africaRegion] : null;

  const panelRegion: 'africa' | 'caribbean' | 'all' =
    workspaceRegion === 'caribbean'
      ? 'caribbean'
      : workspaceRegion === 'all'
        ? 'all'
        : 'africa';

  const defaultPanelCta = countryMapPanelCta({
    isAuthenticated: meAccess.authenticated,
    planRank: meAccess.planRank,
    accessTier: meAccess.planId,
    region: panelRegion,
    source: 'map-workspace-default',
  });

  const planRankFromData =
    data?.meta?.planRank ?? planRankFromTier(data?.meta?.accessTier);
  const planRank = Math.max(meAccess.planRank, planRankFromData);
  const panelAuthenticated = meAccess.authenticated || data?.meta?.authenticated === true;
  const hasFdiAccess = planRank >= PLAN_RANKS.professional;
  const hasSectorRationale = planRank >= PLAN_RANKS.professional;

  // Default state (no country selected)
  if (!selectedIso3) {
    // Show Top 10 Economies if available
    if (topEconomies.length > 0) {
      return (
        <div className="h-full bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold text-white">{defaultPanelTitle}</h3>
            </div>
            <p className="text-xs text-zinc-500">
              {defaultPanelSubtitle} · {DATA_STATUS_LABELS.previewData}
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="divide-y divide-zinc-800/60">
              {topEconomies.map((country, index) => {
                const region = regionData?.get(country.iso3);
                const regionColor = region ? REGION_COLORS[region] : null;
                
                // Format GDP
                const gdpFormatted = country.gdpCurrentUsd
                  ? country.gdpCurrentUsd >= 1e12
                    ? `$${(country.gdpCurrentUsd / 1e12).toFixed(1)}T`
                    : country.gdpCurrentUsd >= 1e9
                    ? `$${(country.gdpCurrentUsd / 1e9).toFixed(1)}B`
                    : `$${(country.gdpCurrentUsd / 1e6).toFixed(1)}M`
                  : 'N/A';
                
                // Format GDP Growth
                const growthFormatted = country.gdpGrowthPct != null
                  ? `${country.gdpGrowthPct >= 0 ? '+' : ''}${country.gdpGrowthPct.toFixed(1)}%`
                  : undefined;
                
                return (
                  <button
                    key={country.iso3}
                    onClick={() => onCountrySelect?.(country.iso3)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-800/50 transition-colors text-left group"
                  >
                    {/* Rank Badge */}
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-zinc-400">
                        {index + 1}
                      </span>
                    </div>
                    
                    {/* Region Color Dot */}
                    {regionColor && (
                      <div 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: regionColor.fill }} 
                      />
                    )}
                    
                    {/* Country Name */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors block truncate">
                        {country.name}
                      </span>
                    </div>
                    
                    {/* GDP */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-blue-400">
                        {gdpFormatted}
                      </div>
                      {growthFormatted && (
                        <div className={`text-[10px] font-semibold ${country.gdpGrowthPct! >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {growthFormatted}
                        </div>
                      )}
                    </div>
                    
                    {/* Arrow Hint */}
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-blue-400 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-zinc-800 shrink-0">
            <div className="text-center mb-3">
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                Source: World Bank · REST Countries API<br />
                Click any country for detailed intelligence
              </p>
            </div>
            <Link
              href={defaultPanelCta.href}
              className="block w-full text-center px-4 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
            >
              {defaultPanelCta.label}
            </Link>
          </div>
        </div>
      );
    }
    
    // Fallback: No data available
    return (
      <div className="h-full bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-white">Country Intelligence</h3>
          </div>
          <p className="text-sm text-zinc-500">
            Select a country on the map to view detailed intelligence
          </p>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <MapPin className="w-12 h-12 text-zinc-700 mb-4" />
          <h4 className="text-sm font-bold text-zinc-400 mb-2">
            Top Economy Preview Temporarily Unavailable
          </h4>
          <p className="text-xs text-zinc-600 max-w-xs mb-6">
            Click on any country on the map to view economic indicators, key sectors, and investment intelligence.
          </p>
          
          {/* Data status */}
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <Database className="w-3.5 h-3.5" />
            <span>{DATA_STATUS_LABELS.previewData}</span>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <Link
            href="/access/request-access"
            className="block w-full text-center px-4 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
          >
            Request Full Access
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-full bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-zinc-400">Loading intelligence...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white mb-2">Unable to Load Data</h4>
          <p className="text-xs text-zinc-500 mb-4 max-w-xs">{DATA_STATUS_LABELS.unavailable}</p>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Try another country
            </button>
          )}
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return null;
  }

  return (
    <div className="h-full bg-zinc-900/80 border border-zinc-700 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800 shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Flag */}
            {data.country.flagUrl && (
              <Image
                src={data.country.flagUrl}
                alt={`${data.country.name} flag`}
                width={40}
                height={28}
                className="w-10 h-7 object-cover rounded-sm border border-zinc-700"
                unoptimized
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{data.country.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {regionColor && (
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: regionColor.fill }}
                  />
                )}
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {data.country.subregion || data.country.region}
                </span>
              </div>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-600 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick info */}
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          {data.country.capital && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{data.country.capital}</span>
            </div>
          )}
          {data.freshness.updatedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Updated {new Date(data.freshness.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Data status banner */}
        <div className="px-5 py-2 bg-zinc-800/50 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <Database className="w-3 h-3 text-amber-500" />
            <span className="font-semibold text-amber-400">
              {DATA_STATUS_LABELS.previewData}
            </span>
            <span className="text-zinc-600">·</span>
            <span>
              Source: {data.meta.sources.map(s => s.name).join(', ')}
            </span>
          </div>
        </div>

        {/* Country insight teaser */}
        {data.teaser.afdecTeaser && (
          <div className="px-5 py-4 border-b border-zinc-800/50">
            <p className="text-sm text-zinc-300 leading-relaxed">
              {data.teaser.afdecTeaser}
            </p>
          </div>
        )}

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-px bg-zinc-800/50">
          <EntitledMetricCard
            label="GDP"
            value={data.metrics.gdpCurrentUsd}
            formatType="currency"
          />
          <EntitledMetricCard
            label="GDP Growth"
            value={data.metrics.gdpGrowthPct}
            formatType="percentage"
          />
          <EntitledMetricCard
            label="Population"
            value={data.metrics.populationTotal}
            formatType="population"
          />
          <EntitledMetricCard
            label="FDI"
            value={data.metrics.fdiNetInflowsUsd}
            formatType="currency"
            locked={!hasFdiAccess}
            lockedLabel="Professional+"
            missingLabel="Data pending"
          />
        </div>

        {/* Souvera Intelligence card */}
        <div className="px-5 py-3 border-t border-zinc-800/50">
          <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-3.5">
            <div className="flex items-start gap-2.5">
              <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mt-0.5">
                <Network className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">
                  Souvera Intelligence
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {getCountryIntelligenceSummary(data)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Sectors */}
        {data.sectors && data.sectors.length > 0 && (
          <div className="px-5 py-3 border-t border-zinc-800/50">
            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2.5">
              Key Sectors
            </h4>
            <EntitledSectorList
              sectors={data.sectors}
              maxVisible={hasSectorRationale ? 5 : 1}
              showRationale={hasSectorRationale}
              totalCount={data.sectors.length}
            />
          </div>
        )}

        {(!data.sectors || data.sectors.length === 0) && (
          <div className="px-5 py-3 border-t border-zinc-800/50">
            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2.5">
              Key Sectors
            </h4>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
              <p className="text-sm text-zinc-500 leading-relaxed">
                {mapPanelSectorsEmptyMessage(data.country.iso3)}
              </p>
              {canAccessCountryTerminal(panelAuthenticated, planRank) &&
                isFullTerminalPilot(data.country.iso3) && (
                  <Link
                    href={countryTerminalHref(data.country.iso3, { tab: 'sectors' })}
                    className="inline-flex text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300"
                  >
                    Open full Sectors tab →
                  </Link>
                )}
            </div>
          </div>
        )}
      </div>

      {/* CTA Footer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 shrink-0">
        {(() => {
          const cta = countryMapPanelCta({
            iso3: data.country.iso3,
            countryName: data.country.name,
            isAuthenticated: panelAuthenticated,
            planRank,
            accessTier: meAccess.authenticated ? meAccess.planId : data.meta.accessTier,
            source: 'map-workspace',
            region: panelRegion,
          });
          return (
            <Link
              href={cta.href}
              className="block w-full text-center px-4 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors group"
            >
              <span className="flex items-center justify-center gap-2">
                {cta.label}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          );
        })()}
      </div>
    </div>
  );
}
