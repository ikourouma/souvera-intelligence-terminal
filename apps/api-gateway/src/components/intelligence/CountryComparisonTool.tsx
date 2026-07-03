'use client';

import { useState, useEffect } from 'react';
import { GitCompare, Loader2, AlertCircle, Lock, TrendingUp, Users, Building2, MapPin, Globe, Ship, Shield, Target, Download } from 'lucide-react';
import Link from 'next/link';
import type { EntitlementKey } from '@souvera/entitlements';
import { formatCurrency } from '@/lib/intelligence-entitlements';
import { exportCardToPNG } from '@/lib/intelligence/export-png';
import { countryExportContext } from '@/lib/intelligence/export-branding';
import { PreviewDataBanner } from '@/components/intelligence/PreviewDataBanner';
import { MarketSignalBadge } from '@/components/intelligence/MarketSignalBadge';

interface Country {
  iso2: string;
  iso3: string;
  name: string;
  region: string;
  subregion?: string;
  capital?: string;
}

interface CountryDetail {
  iso3: string;
  name: string;
  region?: string;
  subregion?: string;
  capital?: string;
  gdpCurrentUsd?: number;
  populationTotal?: number;
  gdpGrowthPct?: number;
  signalLevel?: string;
  investmentScore?: number;
  fdiNetInflowsUsd?: number;
  inflationCpiPct?: number;
  gdpForecastPct?: number;
  fxToUsd?: number;
  opportunityThesis?: string;
  riskNarrative?: string;
  totalTradeUsd?: number;
  usBilateralTradeUsd?: number;
  sectors?: string[];
  meta: {
    accessTier: string;
    previewData?: boolean;
    sources?: Array<{ key: string; name: string }>;
    generatedAt?: string;
  };
}

function hasEntitlement(entitlements: EntitlementKey[], key: EntitlementKey) {
  return entitlements.includes(key) || entitlements.includes('admin_access');
}

function mapApiResponse(data: Record<string, unknown>): CountryDetail {
  const country = (data.country ?? {}) as Record<string, unknown>;
  const metrics = (data.metrics ?? {}) as Record<string, unknown>;
  const signal = (data.signal ?? {}) as Record<string, unknown>;
  const meta = (data.meta ?? {}) as Record<string, unknown>;
  const thesis = (data.thesis ?? {}) as Record<string, unknown>;
  const sectors = Array.isArray(data.sectors)
    ? (data.sectors as Array<{ label?: string }>).map((s) => s.label ?? '').filter(Boolean)
    : [];

  return {
    iso3: String(country.iso3 ?? ''),
    name: String(country.name ?? ''),
    region: country.region != null ? String(country.region) : undefined,
    subregion: country.subregion != null ? String(country.subregion) : undefined,
    capital: country.capital != null ? String(country.capital) : undefined,
    gdpCurrentUsd: metrics.gdpCurrentUsd != null ? Number(metrics.gdpCurrentUsd) : undefined,
    gdpGrowthPct: metrics.gdpGrowthPct != null ? Number(metrics.gdpGrowthPct) : undefined,
    populationTotal: metrics.populationTotal != null ? Number(metrics.populationTotal) : undefined,
    fdiNetInflowsUsd: metrics.fdiNetInflowsUsd != null ? Number(metrics.fdiNetInflowsUsd) : undefined,
    inflationCpiPct: metrics.inflationCpiPct != null ? Number(metrics.inflationCpiPct) : undefined,
    gdpForecastPct: metrics.gdpForecastPct != null ? Number(metrics.gdpForecastPct) : undefined,
    fxToUsd: metrics.fxToUsd != null ? Number(metrics.fxToUsd) : undefined,
    signalLevel: signal.level != null ? String(signal.level) : undefined,
    investmentScore: signal.investmentScore != null ? Number(signal.investmentScore) : undefined,
    opportunityThesis: thesis.opportunityThesis != null ? String(thesis.opportunityThesis) : undefined,
    riskNarrative: thesis.riskNarrative != null ? String(thesis.riskNarrative) : undefined,
    sectors,
    meta: {
      accessTier: String(meta.accessTier ?? 'public'),
      previewData: meta.previewData === true,
      sources: Array.isArray(meta.sources)
        ? (meta.sources as Array<{ key: string; name: string }>)
        : [],
      generatedAt: meta.generatedAt != null ? String(meta.generatedAt) : undefined,
    },
  };
}

async function fetchCountryDetail(iso3: string, entitlements: EntitlementKey[]): Promise<CountryDetail | null> {
  const liteRes = await fetch(`/api/v1/country-lite?iso3=${iso3}`, { credentials: 'include' });
  if (!liteRes.ok) return null;
  const liteData = await liteRes.json();
  const detail = mapApiResponse(liteData);

  if (hasEntitlement(entitlements, 'trade_data')) {
    const fullRes = await fetch(`/api/v1/country/${iso3}`, { credentials: 'include' });
    if (fullRes.ok) {
      const full = await fullRes.json();
      const trade = full.trade as {
        totalTradeUsd?: number;
        exportsToUs?: { valueUsd?: number };
        importsFromUs?: { valueUsd?: number };
      } | null;
      if (trade && !('pending' in trade && trade.pending)) {
        detail.totalTradeUsd = trade.totalTradeUsd;
        const exp = trade.exportsToUs?.valueUsd ?? 0;
        const imp = trade.importsFromUs?.valueUsd ?? 0;
        if (exp || imp) detail.usBilateralTradeUsd = exp + imp;
      }
    }
  }

  return detail;
}

export function CountryComparisonTool() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEntitlements, setUserEntitlements] = useState<EntitlementKey[]>([]);
  
  const [selectedCountry1, setSelectedCountry1] = useState<string>('');
  const [selectedCountry2, setSelectedCountry2] = useState<string>('');
  
  const [countryDetail1, setCountryDetail1] = useState<CountryDetail | null>(null);
  const [countryDetail2, setCountryDetail2] = useState<CountryDetail | null>(null);
  
  const [loadingDetail1, setLoadingDetail1] = useState(false);
  const [loadingDetail2, setLoadingDetail2] = useState(false);

  useEffect(() => {
    fetch('/api/v1/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((me) => {
        if (me.access?.entitlements) {
          setUserEntitlements(me.access.entitlements as EntitlementKey[]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch countries list
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        // Use scope=global to get all countries worldwide for comparison
        const response = await fetch('/api/v1/countries?region=all&scope=global');
        
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }

        const data = await response.json();
        setCountries(data.countries || []);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError(err instanceof Error ? err.message : 'Failed to load countries');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Pre-select country from URL (?countries=NGA or ?country1=NGA)
  useEffect(() => {
    if (countries.length === 0 || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const preselected = (params.get('countries') ?? params.get('country1') ?? '').toUpperCase();
    if (!preselected) return;
    const match = countries.find((c) => c.iso3.toUpperCase() === preselected);
    if (match && !selectedCountry1) {
      setSelectedCountry1(match.iso3.toUpperCase());
    }
  }, [countries, selectedCountry1]);

  // Fetch country 1 details (authenticated — tier-aware)
  useEffect(() => {
    if (!selectedCountry1) {
      setCountryDetail1(null);
      return;
    }

    const load = async () => {
      setLoadingDetail1(true);
      try {
        setCountryDetail1(await fetchCountryDetail(selectedCountry1, userEntitlements));
      } catch {
        setCountryDetail1(null);
      } finally {
        setLoadingDetail1(false);
      }
    };

    load();
  }, [selectedCountry1, userEntitlements]);

  // Fetch country 2 details
  useEffect(() => {
    if (!selectedCountry2) {
      setCountryDetail2(null);
      return;
    }

    const load = async () => {
      setLoadingDetail2(true);
      try {
        setCountryDetail2(await fetchCountryDetail(selectedCountry2, userEntitlements));
      } catch {
        setCountryDetail2(null);
      } finally {
        setLoadingDetail2(false);
      }
    };

    load();
  }, [selectedCountry2, userEntitlements]);

  const formatNumber = (num?: number, prefix: string = ''): string => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1e12) return `${prefix}${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${prefix}${(num / 1e3).toFixed(1)}K`;
    return `${prefix}${num.toString()}`;
  };

  const getSignalBadge = (signal?: string, gdpGrowthPct?: number) => (
    <MarketSignalBadge signalLevel={signal} gdpGrowthPct={gdpGrowthPct} />
  );

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Loading countries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 rounded-sm p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-400 mb-2">Failed to Load Comparison Tool</h3>
              <p className="text-red-400/80">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showPreviewBanner = countryDetail1?.meta?.previewData || countryDetail2?.meta?.previewData;
  const sources = countryDetail1?.meta?.sources || countryDetail2?.meta?.sources || [];
  const canExportCompare =
    hasEntitlement(userEntitlements, 'full_macro') || hasEntitlement(userEntitlements, 'export_access');

  const comparisonLabel = [countryDetail1?.name, countryDetail2?.name].filter(Boolean).join(' vs ') || 'Country Comparison';

  const handleExportCompare = () => {
    exportCardToPNG({
      elementId: 'country-comparison-panel',
      fileName: `compare-${(countryDetail1?.iso3 ?? 'a').toLowerCase()}-${(countryDetail2?.iso3 ?? 'b').toLowerCase()}`,
      countryName: comparisonLabel,
      flagUrl: countryDetail1?.flagUrl,
      iso2: countryDetail1?.iso2,
      cardTitle: 'Country Comparison',
    });
  };

  return (
    <div className="space-y-8">
      {/* Preview Data Banner */}
      {showPreviewBanner && (
        <PreviewDataBanner 
          sources={sources}
          freshnessAt={countryDetail1?.meta?.generatedAt || countryDetail2?.meta?.generatedAt}
        />
      )}

      {/* Country Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country 1 Selector */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Select First Country
          </label>
          <select
            value={selectedCountry1}
            onChange={(e) => setSelectedCountry1(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
          >
            <option value="">Choose a country...</option>
            {countries.map((country) => (
              <option key={country.iso3} value={country.iso3}>
                {country.name} ({country.region})
              </option>
            ))}
          </select>
        </div>

        {/* Country 2 Selector */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Select Second Country
          </label>
          <select
            value={selectedCountry2}
            onChange={(e) => setSelectedCountry2(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
          >
            <option value="">Choose a country...</option>
            {countries.map((country) => (
              <option key={country.iso3} value={country.iso3}>
                {country.name} ({country.region})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Display */}
      {(selectedCountry1 || selectedCountry2) && (
        <div className="space-y-4">
          {canExportCompare && countryDetail1 && countryDetail2 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleExportCompare}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 rounded-sm text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Comparison (PNG)
              </button>
            </div>
          )}
        <div id="country-comparison-panel" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country 1 Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm">
            {loadingDetail1 ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-zinc-500">Loading details...</p>
              </div>
            ) : countryDetail1 ? (
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="pb-4 border-b border-zinc-800">
                  <h3 className="text-2xl font-bold text-white mb-2">{countryDetail1.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <MapPin className="w-4 h-4" />
                    <span>{countryDetail1.capital || 'N/A'}</span>
                    <span className="mx-2">·</span>
                    <Globe className="w-4 h-4" />
                    <span>{countryDetail1.region}</span>
                  </div>
                  {countryDetail1.signalLevel && (
                    <div className="mt-3">
                      {getSignalBadge(countryDetail1.signalLevel)}
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="space-y-4">
                  <MetricRow
                    icon={<Building2 className="w-5 h-5 text-blue-500" />}
                    label="GDP"
                    value={formatCurrency(countryDetail1.gdpCurrentUsd)}
                  />
                  <MetricRow
                    icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                    label="GDP Growth"
                    value={countryDetail1.gdpGrowthPct !== undefined ? `${countryDetail1.gdpGrowthPct.toFixed(1)}%` : 'N/A'}
                  />
                  <MetricRow
                    icon={<Users className="w-5 h-5 text-purple-500" />}
                    label="Population"
                    value={formatNumber(countryDetail1.populationTotal)}
                  />
                </div>

                {/* Extended metrics (entitlement-aware) */}
                <ExtendedCompareMetrics detail={countryDetail1} entitlements={userEntitlements} />
              </div>
            ) : selectedCountry1 ? (
              <div className="p-12 text-center text-zinc-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                <p>Unable to load country details</p>
              </div>
            ) : null}
          </div>

          {/* Country 2 Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm">
            {loadingDetail2 ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-zinc-500">Loading details...</p>
              </div>
            ) : countryDetail2 ? (
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="pb-4 border-b border-zinc-800">
                  <h3 className="text-2xl font-bold text-white mb-2">{countryDetail2.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <MapPin className="w-4 h-4" />
                    <span>{countryDetail2.capital || 'N/A'}</span>
                    <span className="mx-2">·</span>
                    <Globe className="w-4 h-4" />
                    <span>{countryDetail2.region}</span>
                  </div>
                  {countryDetail2.signalLevel && (
                    <div className="mt-3">
                      {getSignalBadge(countryDetail2.signalLevel)}
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="space-y-4">
                  <MetricRow
                    icon={<Building2 className="w-5 h-5 text-blue-500" />}
                    label="GDP"
                    value={formatCurrency(countryDetail2.gdpCurrentUsd)}
                  />
                  <MetricRow
                    icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                    label="GDP Growth"
                    value={countryDetail2.gdpGrowthPct !== undefined ? `${countryDetail2.gdpGrowthPct.toFixed(1)}%` : 'N/A'}
                  />
                  <MetricRow
                    icon={<Users className="w-5 h-5 text-purple-500" />}
                    label="Population"
                    value={formatNumber(countryDetail2.populationTotal)}
                  />
                </div>

                {/* Extended metrics (entitlement-aware) */}
                <ExtendedCompareMetrics detail={countryDetail2} entitlements={userEntitlements} />
              </div>
            ) : selectedCountry2 ? (
              <div className="p-12 text-center text-zinc-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                <p>Unable to load country details</p>
              </div>
            ) : null}
          </div>
        </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedCountry1 && !selectedCountry2 && (
        <div className="py-16 text-center">
          <GitCompare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Select Countries to Compare</h3>
          <p className="text-zinc-500 max-w-md mx-auto">
            Choose two countries from the dropdowns above to see a side-by-side comparison of available economic indicators.
          </p>
        </div>
      )}

      {/* Upgrade CTA — hide for Business+ users who already have full compare access */}
      {(countryDetail1 || countryDetail2) &&
        !hasEntitlement(userEntitlements, 'trade_data') &&
        !hasEntitlement(userEntitlements, 'investment_thesis') && (
        <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-sm text-center">
          <h3 className="text-xl font-bold text-white mb-3">
            Unlock Full Comparison Features
          </h3>
          <p className="text-blue-400/80 mb-6 max-w-2xl mx-auto">
            Access historical trends, trade data, risk analysis, and exportable reports with Professional, Business, or Institutional plans.
          </p>
          <Link
            href="/access/request-access"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-sm transition-colors"
          >
            Request Access
          </Link>
        </div>
      )}
    </div>
  );
}

function ExtendedCompareMetrics({
  detail,
  entitlements,
}: {
  detail: CountryDetail;
  entitlements: EntitlementKey[];
}) {
  const showMacro = hasEntitlement(entitlements, 'full_macro');
  const showTrade = hasEntitlement(entitlements, 'trade_data');
  const showRisk = hasEntitlement(entitlements, 'risk_analysis');
  const showThesis = hasEntitlement(entitlements, 'investment_thesis');

  const thesisPreview = detail.opportunityThesis
    ? detail.opportunityThesis.replace(/\*\*/g, '').slice(0, 140) + (detail.opportunityThesis.length > 140 ? '…' : '')
    : null;

  return (
    <div className="pt-4 border-t border-zinc-800 space-y-3">
      {showMacro ? (
        <>
          {detail.fdiNetInflowsUsd != null && (
            <MetricRow
              icon={<TrendingUp className="w-5 h-5 text-cyan-500" />}
              label="FDI Inflows"
              value={formatCurrency(detail.fdiNetInflowsUsd)}
            />
          )}
          {detail.inflationCpiPct != null && (
            <MetricRow
              icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
              label="Inflation (CPI)"
              value={`${detail.inflationCpiPct.toFixed(1)}%`}
            />
          )}
          {detail.gdpForecastPct != null && (
            <MetricRow
              icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
              label="GDP Forecast"
              value={`${detail.gdpForecastPct.toFixed(1)}%`}
            />
          )}
        </>
      ) : (
        <LockedMetric label="Historical Trends (5Y)" tier="Professional" />
      )}

      {showTrade ? (
        <>
          {detail.totalTradeUsd != null && (
            <MetricRow
              icon={<Ship className="w-5 h-5 text-blue-500" />}
              label="Total Trade"
              value={formatCurrency(detail.totalTradeUsd)}
            />
          )}
          {detail.usBilateralTradeUsd != null && (
            <MetricRow
              icon={<Ship className="w-5 h-5 text-emerald-500" />}
              label="U.S. Bilateral Trade"
              value={formatCurrency(detail.usBilateralTradeUsd)}
            />
          )}
          {detail.totalTradeUsd == null && detail.usBilateralTradeUsd == null && (
            <Link
              href={`/country/${detail.iso3}?tab=trade`}
              className="text-xs text-blue-400 hover:text-blue-300 block py-1"
            >
              View trade profile →
            </Link>
          )}
        </>
      ) : (
        <LockedMetric label="Trade & Export Data" tier="Business" />
      )}

      {showRisk ? (
        <>
          {detail.investmentScore != null && (
            <MetricRow
              icon={<Shield className="w-5 h-5 text-purple-500" />}
              label="Investment Score"
              value={`${detail.investmentScore}/100`}
            />
          )}
          {detail.riskNarrative && (
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 pl-1">
              {detail.riskNarrative.replace(/\*\*/g, '').slice(0, 160)}…
            </p>
          )}
        </>
      ) : (
        <LockedMetric label="Risk Analysis" tier="Business" />
      )}

      {showThesis ? (
        thesisPreview ? (
          <div className="py-2 px-3 bg-zinc-900/50 border border-zinc-800 rounded-sm">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Investment Thesis</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{thesisPreview}</p>
            <Link
              href={`/country/${detail.iso3}?tab=opportunity`}
              className="text-xs text-emerald-400 hover:text-emerald-300 mt-2 inline-block"
            >
              Full opportunity analysis →
            </Link>
          </div>
        ) : null
      ) : (
        <LockedMetric label="Investment Thesis" tier="Business" />
      )}
    </div>
  );
}

// Helper Components

function MetricRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <span className="text-lg font-semibold text-white">{value}</span>
    </div>
  );
}

function LockedMetric({ label, tier }: { label: string; tier: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-zinc-900/50 border border-zinc-800 rounded-sm opacity-60">
      <div className="flex items-center gap-3">
        <Lock className="w-4 h-4 text-zinc-600" />
        <span className="text-sm text-zinc-600">{label}</span>
      </div>
      <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-600">
        {tier}
      </span>
    </div>
  );
}
