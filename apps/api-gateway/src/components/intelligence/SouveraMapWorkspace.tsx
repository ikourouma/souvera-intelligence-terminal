'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { MapWorkspaceTopNav } from './MapWorkspaceTopNav';
import { AfricaMapPanel } from './AfricaMapPanel';
import { CaribbeanMapPanel } from './CaribbeanMapPanel';
import { CountryIntelligencePanel } from './CountryIntelligencePanel';
import { AllRegionsMarketShell } from './AllRegionsMarketShell';
import { ISO3_REGION, type AfricaRegion, DATA_STATUS_LABELS } from '@/lib/map-constants';
import { type RegionFilter, getWorkspaceLabelForRegion } from '@/lib/market-coverage';

export interface Country {
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
  gdpGrowthPct?: number;
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
    scope: string;
    count: number;
    previewData?: boolean;
    sources: Array<{ key: string; name: string }>;
  };
}

interface SouveraMapWorkspaceProps {
  region?: RegionFilter;
  workspaceLabel?: string;
  showTopNav?: boolean;
  embedded?: boolean;
  /** When true, omit outer card chrome (parent provides border/radius). */
  frameless?: boolean;
  className?: string;
  initialSelectedIso3?: string | null;
  onRegionChange?: (region: RegionFilter) => void;
  onCountrySelect?: (iso3: string | null) => void;
}

export function SouveraMapWorkspace({
  region = 'africa',
  workspaceLabel,
  showTopNav = true,
  embedded = false,
  frameless = false,
  className,
  initialSelectedIso3,
  onRegionChange,
  onCountrySelect,
}: SouveraMapWorkspaceProps) {
  // Track current region (can be changed by user in non-embedded mode)
  // Use region prop as source of truth for controlled mode
  const currentRegion = region; // Always use prop value
  
  // Derive workspace label from current region if not explicitly provided
  const effectiveWorkspaceLabel = workspaceLabel ?? getWorkspaceLabelForRegion(currentRegion);
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [caribbeanCountries, setCaribbeanCountries] = useState<Country[]>([]);
  const [meta, setMeta] = useState<CountriesResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIso3, setSelectedIso3] = useState<string | null>(initialSelectedIso3 ?? null);
  const hasFetchedRef = useRef(false);
  const previousRegionRef = useRef<RegionFilter>(region);

  // Reset fetch flag when region changes
  useEffect(() => {
    if (previousRegionRef.current !== currentRegion) {
      hasFetchedRef.current = false;
      previousRegionRef.current = currentRegion;
    }
  }, [currentRegion]);

  // Handle region change
  const handleRegionChange = useCallback((newRegion: RegionFilter) => {
    setSelectedIso3(null); // Reset selection when region changes
    hasFetchedRef.current = false; // Allow refetch for new region
    
    // Notify parent of region change (parent will update prop)
    onRegionChange?.(newRegion);
  }, [onRegionChange]);

  // Build region lookup map for the panel
  const regionData = new Map<string, AfricaRegion>();
  Object.entries(ISO3_REGION).forEach(([iso3, reg]) => {
    regionData.set(iso3, reg);
  });

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/countries?region=${currentRegion}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch countries: ${response.statusText}`);
      }

      const data: CountriesResponse = await response.json();
      
      if (currentRegion === 'caribbean') {
        // Caribbean only: store all as Caribbean
        setCaribbeanCountries(data.countries || []);
        setCountries([]);
      } else if (currentRegion === 'all') {
        // All regions: separate into African and Caribbean buckets
        const africanCountries = (data.countries || []).filter(c =>
          c.isAfricanCountry === true || ISO3_REGION[c.iso3] !== undefined
        );
        const caribCountries = (data.countries || []).filter(c =>
          c.isAfricanCountry !== true && ISO3_REGION[c.iso3] === undefined
        );
        setCountries(africanCountries);
        setCaribbeanCountries(caribCountries);
      } else {
        // Africa only
        const africanCountries = (data.countries || []).filter(c =>
          c.isAfricanCountry === true || ISO3_REGION[c.iso3] !== undefined
        );
        setCountries(africanCountries);
        setCaribbeanCountries([]);
      }
      
      setMeta(data.meta);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, [currentRegion]);

  // Fetch on mount and when region changes
  useEffect(() => {
    const hasCountries = currentRegion === 'caribbean'
      ? caribbeanCountries.length > 0
      : currentRegion === 'all'
      ? countries.length > 0 || caribbeanCountries.length > 0
      : countries.length > 0;

    if (hasFetchedRef.current && hasCountries) return;
    hasFetchedRef.current = true;
    
    (async () => {
      await fetchCountries();
    })();
  }, [fetchCountries, countries.length, caribbeanCountries.length, currentRegion]);

  const handleCountrySelect = useCallback((iso3: string) => {
    setSelectedIso3(iso3);
    
    // Notify parent of country selection
    onCountrySelect?.(iso3);
  }, [onCountrySelect]);

  const handleClosePanel = useCallback(() => {
    setSelectedIso3(null);
    
    // Notify parent that country was deselected
    onCountrySelect?.(null);
  }, [onCountrySelect]);

  // Compute top 10 economies by GDP for default panel state
  const topEconomies = useMemo(() => {
    const sourceCountries =
      currentRegion === 'caribbean'
        ? caribbeanCountries
        : currentRegion === 'all'
        ? [...countries, ...caribbeanCountries]
        : countries;

    return [...sourceCountries]
      .filter(c => c.gdpCurrentUsd != null && c.gdpCurrentUsd > 0)
      .sort((a, b) => (b.gdpCurrentUsd ?? 0) - (a.gdpCurrentUsd ?? 0))
      .slice(0, 10);
  }, [countries, caribbeanCountries, currentRegion]);

  // Compute region-aware default panel titles
  const defaultPanelTitle = useMemo(() => {
    switch (currentRegion) {
      case 'caribbean':
        return 'Top Caribbean Economies';
      case 'all':
        return 'Top Souvera Economies';
      case 'africa':
      default:
        return 'Top 10 Economies';
    }
  }, [currentRegion]);

  const defaultPanelSubtitle = useMemo(() => {
    switch (currentRegion) {
      case 'caribbean':
        return 'Largest Caribbean markets by GDP';
      case 'all':
        return 'Largest markets by GDP across Africa and Caribbean';
      case 'africa':
      default:
        return 'Largest African economies by GDP';
    }
  }, [currentRegion]);

  const shellClass = frameless
    ? className || ''
    : `bg-zinc-950 rounded-xl border border-zinc-800 ${className || ''}`;

  // Error state
  if (error && !loading) {
    return (
      <div className={`min-h-[600px] ${shellClass}`}>
        {showTopNav && (
          <MapWorkspaceTopNav 
            workspaceLabel={effectiveWorkspaceLabel}
            region={currentRegion}
            onRegionChange={handleRegionChange}
            showRegionFilter={!embedded}
          />
        )}
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center max-w-md px-6">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">
              {DATA_STATUS_LABELS.unavailable}
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              The map workspace is experiencing connectivity issues. Please try again.
            </p>
            <button
              onClick={fetchCountries}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state (initial)
  if (loading && countries.length === 0 && caribbeanCountries.length === 0) {
    return (
      <div className={`min-h-[600px] ${shellClass}`}>
        {showTopNav && (
          <MapWorkspaceTopNav 
            workspaceLabel={effectiveWorkspaceLabel}
            region={currentRegion}
            onRegionChange={handleRegionChange}
            showRegionFilter={!embedded}
          />
        )}
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-sm text-zinc-400">Loading intelligence workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Caribbean market shell rendering
  if (currentRegion === 'caribbean') {
    return (
      <div className={shellClass}>
        {/* Workspace Nav - conditionally rendered */}
        {showTopNav && (
          <MapWorkspaceTopNav 
            workspaceLabel={effectiveWorkspaceLabel}
            region={currentRegion}
            onRegionChange={handleRegionChange}
            showRegionFilter={!embedded}
          />
        )}
        
        {/* Main workspace layout for Caribbean — geospatial map (v2, migrated 2026-05-20) */}
        <div className="flex flex-col lg:flex-row lg:h-[650px] xl:h-[700px]">
          {/* Map Panel (Left) — v1 list archived: see /intelligence/caribbean/list-archive */}
          <div className="flex-1 lg:w-[65%] xl:w-[68%] min-h-[400px] lg:h-full border-b lg:border-b-0 lg:border-r border-zinc-800">
            <CaribbeanMapPanel
              countries={caribbeanCountries}
              selectedIso3={selectedIso3}
              onCountrySelect={handleCountrySelect}
              loading={loading}
            />
          </div>

          {/* Intelligence Panel (Right) */}
          <div className="lg:w-[35%] xl:w-[32%] min-h-[400px] lg:h-full pt-4 px-4 pb-4 lg:pt-5">
            <CountryIntelligencePanel
              selectedIso3={selectedIso3}
              onClose={handleClosePanel}
              onCountrySelect={handleCountrySelect}
              regionData={regionData}
              topEconomies={topEconomies}
              defaultPanelTitle={defaultPanelTitle}
              defaultPanelSubtitle={defaultPanelSubtitle}
              region={currentRegion}
            />
          </div>
        </div>

        {/* Footer metadata */}
        {meta && (
          <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-[10px]">
              {/* Access & Markets - centered on mobile, left on desktop */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-zinc-600 text-center sm:text-left">
                <span>
                  Access: <span className="text-zinc-400 font-semibold">{meta.accessTier}</span>
                  {meta.authenticated ? ' (Authenticated)' : ' (Public)'}
                </span>
                <span className="hidden sm:inline">·</span>
                <span>
                  Markets: <span className="text-zinc-400 font-semibold">{meta.count}</span>
                </span>
              </div>
              
              {/* Status & Sources - centered on mobile, right on desktop */}
              <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                <span className="text-amber-500">{DATA_STATUS_LABELS.previewData}</span>
                <span className="hidden sm:inline text-zinc-600">·</span>
                <span className="text-zinc-600">
                  Sources: {meta.sources.map(s => s.name).join(' · ')}
                </span>
              </div>
            </div>
            
            {/* Attribution - centered on all viewports */}
            <div className="mt-2 pt-2 border-t border-zinc-800/50 text-center">
              <span className="text-[9px] text-zinc-700 font-medium">
                Afronovation, Inc.
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // All Regions combined view
  if (currentRegion === 'all') {
    const allCountries = [...countries, ...caribbeanCountries];
    return (
      <div className={shellClass}>
        {showTopNav && (
          <MapWorkspaceTopNav
            workspaceLabel={effectiveWorkspaceLabel}
            region={currentRegion}
            onRegionChange={handleRegionChange}
            showRegionFilter={!embedded}
          />
        )}

        <div className="flex flex-col lg:flex-row lg:h-[650px] xl:h-[700px]">
          {/* Market List Panel (Left) */}
          <div className="flex-1 lg:w-[65%] xl:w-[68%] min-h-[400px] lg:h-full border-b lg:border-b-0 lg:border-r border-zinc-800">
            <AllRegionsMarketShell
              countries={allCountries}
              selectedIso3={selectedIso3}
              onCountrySelect={handleCountrySelect}
            />
          </div>

          {/* Intelligence Panel (Right) */}
          <div className="lg:w-[35%] xl:w-[32%] min-h-[400px] lg:h-full pt-4 px-4 pb-4 lg:pt-5">
            <CountryIntelligencePanel
              selectedIso3={selectedIso3}
              onClose={handleClosePanel}
              onCountrySelect={handleCountrySelect}
              regionData={regionData}
              topEconomies={topEconomies}
              defaultPanelTitle={defaultPanelTitle}
              defaultPanelSubtitle={defaultPanelSubtitle}
              region={currentRegion}
            />
          </div>
        </div>

        {/* Footer metadata */}
        {meta && (
          <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-[10px]">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-zinc-600 text-center sm:text-left">
                <span>
                  Access: <span className="text-zinc-400 font-semibold">{meta.accessTier}</span>
                  {meta.authenticated ? ' (Authenticated)' : ' (Public)'}
                </span>
                <span className="hidden sm:inline">·</span>
                <span>
                  Markets: <span className="text-zinc-400 font-semibold">{allCountries.length}</span>
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                <span className="text-amber-500">{DATA_STATUS_LABELS.previewData}</span>
                <span className="hidden sm:inline text-zinc-600">·</span>
                <span className="text-zinc-600">
                  Sources: {meta.sources.map(s => s.name).join(' · ')}
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-zinc-800/50 text-center">
              <span className="text-[9px] text-zinc-700 font-medium">Afronovation, Inc.</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: Africa only
  return (
    <div className={shellClass}>
      {/* Workspace Nav - conditionally rendered */}
      {showTopNav && (
        <MapWorkspaceTopNav 
          workspaceLabel={effectiveWorkspaceLabel}
          region={currentRegion}
          onRegionChange={handleRegionChange}
          showRegionFilter={!embedded}
        />
      )}

      {/* Main workspace layout */}
      <div className="flex flex-col lg:flex-row lg:h-[650px] xl:h-[700px]">
        {/* Map Panel (Left) */}
        <div className="flex-1 lg:w-[65%] xl:w-[68%] min-h-[400px] lg:h-full border-b lg:border-b-0 lg:border-r border-zinc-800">
          <AfricaMapPanel
            countries={countries}
            selectedIso3={selectedIso3}
            onCountrySelect={handleCountrySelect}
            loading={loading}
          />
        </div>

        {/* Intelligence Panel (Right) */}
        <div className="lg:w-[35%] xl:w-[32%] min-h-[400px] lg:h-full pt-4 px-4 pb-4 lg:pt-5">
          <CountryIntelligencePanel
            selectedIso3={selectedIso3}
            onClose={handleClosePanel}
            onCountrySelect={handleCountrySelect}
            regionData={regionData}
            topEconomies={topEconomies}
            defaultPanelTitle={defaultPanelTitle}
            defaultPanelSubtitle={defaultPanelSubtitle}
            region={currentRegion}
          />
        </div>
      </div>

      {/* Footer metadata */}
      {meta && (
        <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-[10px]">
            {/* Access & Markets - centered on mobile, left on desktop */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-zinc-600 text-center sm:text-left">
              <span>
                Access: <span className="text-zinc-400 font-semibold">{meta.accessTier}</span>
                {meta.authenticated ? ' (Authenticated)' : ' (Public)'}
              </span>
              <span className="hidden sm:inline">·</span>
              <span>
                Markets: <span className="text-zinc-400 font-semibold">{meta.count}</span>
              </span>
            </div>
            
            {/* Status & Sources - centered on mobile, right on desktop */}
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
              <span className="text-amber-500">{DATA_STATUS_LABELS.previewData}</span>
              <span className="hidden sm:inline text-zinc-600">·</span>
              <span className="text-zinc-600">
                Sources: {meta.sources.map(s => s.name).join(' · ')}
              </span>
            </div>
          </div>
          
          {/* Attribution - centered on all viewports */}
          <div className="mt-2 pt-2 border-t border-zinc-800/50 text-center">
            <span className="text-[9px] text-zinc-700 font-medium">
              Afronovation, Inc.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
