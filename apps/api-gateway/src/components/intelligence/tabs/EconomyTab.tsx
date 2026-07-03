'use client';

import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Link from 'next/link';
import { useState } from 'react';
import { exportCardToPNG } from '@/lib/intelligence/export-png';
import { countryExportContext } from '@/lib/intelligence/export-branding';
import { getEconomyTabCopy, buildEconomyOverviewAnalysis, type EconomyYearPoint } from '@/lib/intelligence/country-economy-content';
import { getLatestCompleteMacroYear } from '@/lib/intelligence/build-economy-years';
import { economyIndicatorRowsForYears } from '@/lib/intelligence/economy-indicator-rows';
import type { IntelligenceTabProps } from '@/types/country-intelligence';
import { DataPendingState } from '@/components/intelligence/DataPendingState';
import { getStructuralDataGap } from '@/lib/market-coverage/structural-data-gaps';
import { CollapsibleAnalysis } from '@/components/intelligence/CollapsibleAnalysis';
import { HighlightedText } from '@/components/intelligence/HighlightedText';
import { EstimateBadge } from '@/components/intelligence/EstimateBadge';
import { metricKeyIsEstimate } from '@/lib/intelligence/metric-estimate-flags';
import type { MetricEstimateFlags } from '@/types/country-intelligence';

type TimeSeriesYear = EconomyYearPoint;

/**
 * EconomyTab — Bloomberg-grade economic analysis with per-country copy (Sprint C).
 */
export function EconomyTab({ data, userEntitlements }: IntelligenceTabProps) {
  const hasAccess = userEntitlements.includes('full_macro') || userEntitlements.includes('admin_access');
  const canExport = hasAccess;
  const iso3 = data.country?.iso3?.toUpperCase() ?? '';
  const iso3Lower = iso3.toLowerCase();
  const baseCopy = getEconomyTabCopy(iso3);
  // Replace the generic "Local/USD" fallback with the country's actual currency pair.
  // Curated profiles (e.g. ZWE's "ZiG/USD") are kept as-is since they may be more current
  // than the stored currency_code.
  const fxCode = data.country?.currencyCode?.trim().toUpperCase();
  const copy =
    fxCode && baseCopy.fxPairLabel === 'Local/USD'
      ? { ...baseCopy, fxPairLabel: fxCode === 'USD' ? 'USD' : `${fxCode}/USD` }
      : baseCopy;
  const exportCtx = countryExportContext(data.country);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Professional Plan Required</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Access comprehensive economic analysis, time series charts, and historical data with a Professional or higher subscription.
          </p>
          <Link href="/pricing" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-sm transition-colors">
            Upgrade to Professional
          </Link>
        </div>
      </div>
    );
  }

  if (!data.timeSeries || data.timeSeries.years.length === 0) {
    const gap = getStructuralDataGap(iso3);
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <DataPendingState
          variant={gap ? 'not_reported' : 'pending'}
          message={
            gap?.disclaimer ??
            `Macroeconomic time series for ${data.country.name} is awaiting verified ingestion from World Bank / IMF sources.`
          }
        />
      </div>
    );
  }

  const { years, forecast } = data.timeSeries;
  const hasForecast = userEntitlements.includes('forecast_metrics') || userEntitlements.includes('admin_access');
  const forecastData = hasForecast ? forecast : undefined;

  const latestYear = getLatestCompleteMacroYear(years);
  const earliestYear = years[0];
  const gdpChange = latestYear.gdp_current_usd && earliestYear.gdp_current_usd
    ? ((latestYear.gdp_current_usd - earliestYear.gdp_current_usd) / earliestYear.gdp_current_usd) * 100
    : 0;

  const handleExport = (elementId: string, fileName: string, cardTitle: string, curatedAnalysis?: string) =>
    exportCardToPNG({
      elementId,
      fileName,
      cardTitle,
      curatedAnalysis,
      dataAsOf: String(latestYear.year),
      disclaimer: 'Curated macro estimates. Verify against official sources before investment decisions.',
      sourceAttribution: copy.dataSources,
      ...exportCtx,
    });

  return (
    <div className="space-y-8">
      <EconomyHeroNarrative
        latestYear={latestYear}
        earliestYear={earliestYear}
        gdpChange={gdpChange}
        copy={copy}
        countryName={data.country.name}
        iso3={iso3}
        canExport={canExport}
        metricEstimates={data.metricEstimates}
        onExport={(curatedAnalysis) =>
          handleExport(
            'economy-overview-card',
            `${iso3Lower}-economy-overview`,
            'Economic Overview',
            curatedAnalysis
          )
        }
      />

      <KeyIndicatorsTable
        years={years}
        copy={copy}
        canExport={canExport}
        onExport={() => handleExport('economy-key-indicators', `${iso3Lower}-economy-indicators`, 'Key Economic Indicators')}
      />

      <div id="gdp" className="scroll-mt-6">
        <GDPSection
          years={years}
          copy={copy}
          canExport={canExport}
          onExport={() => handleExport('economy-gdp-card', `${iso3Lower}-economy-gdp`, 'Gross Domestic Product')}
        />
      </div>

      <div id="growth" className="scroll-mt-6">
        <GrowthSection
          years={years}
          forecast={forecastData}
          hasForecast={hasForecast}
          copy={copy}
          canExport={canExport}
          onExport={() => handleExport('economy-growth-card', `${iso3Lower}-economy-growth`, 'Economic Growth')}
        />
      </div>

      <div id="fx" className="scroll-mt-6">
        <FXRateSection
          years={years}
          parallelRate={copy.showParallelRate ? data.metrics?.fx_rate_parallel_usd : undefined}
          copy={copy}
          canExport={canExport}
          onExport={() => handleExport('economy-fx-card', `${iso3Lower}-economy-fx`, 'Foreign Exchange Rate')}
        />
      </div>
    </div>
  );
}

function AnalysisBullets({ bullets }: { bullets: string[] }) {
  if (!bullets.length) return null;
  return (
    <div className="mt-4 pt-3 border-t border-zinc-800">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Souvera Analysis</p>
      <ul className="space-y-1 text-xs text-zinc-400">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span><HighlightedText text={b} /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatMetricUsd(value?: number): string {
  if (value == null || !Number.isFinite(value)) return 'N/A';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function EconomyHeroNarrative({
  latestYear,
  earliestYear,
  gdpChange,
  copy,
  countryName,
  iso3,
  canExport,
  metricEstimates,
  onExport,
}: {
  latestYear: TimeSeriesYear;
  earliestYear: TimeSeriesYear;
  gdpChange: number;
  copy: ReturnType<typeof getEconomyTabCopy>;
  countryName: string;
  iso3: string;
  canExport: boolean;
  metricEstimates?: MetricEstimateFlags;
  onExport: (curatedAnalysis: string) => void;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const fullAnalysis = buildEconomyOverviewAnalysis({
    countryName,
    iso3,
    latestYear,
    earliestYear,
    gdpChange,
    copy,
  });

  const gdpB = formatMetricUsd(latestYear.gdp_current_usd);
  const growth = latestYear.gdp_growth_pct != null ? `${latestYear.gdp_growth_pct.toFixed(1)}%` : 'N/A';
  const fdi = formatMetricUsd(latestYear.fdi_net_inflows_usd);
  const inflation = latestYear.inflation_cpi_pct != null ? `${latestYear.inflation_cpi_pct.toFixed(1)}%` : 'N/A';
  const gdpChangeStr = Number.isFinite(gdpChange) ? `${gdpChange >= 0 ? '+' : ''}${gdpChange.toFixed(1)}%` : 'N/A';

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await onExport(fullAnalysis);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="economy-overview-card" className="exportable-card group relative bg-blue-950/10 border border-blue-900/30 rounded-xl p-6">
      {canExport && (
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          title="Download Economic Overview as PNG"
          aria-label="Download Economic Overview as PNG"
          data-export-exclude
        >
          <Download className="w-4 h-4 text-blue-300" />
        </button>
      )}
      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Economic Overview</h3>

      {/* Export-visible metric summary (inline styles survive PNG rasterization) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg border border-blue-900/40" style={{ backgroundColor: '#1e3a5f33' }}>
          <p className="text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1 flex-wrap" style={{ color: '#60a5fa' }}>
            Nominal GDP
            {metricKeyIsEstimate('gdp_current_usd', metricEstimates) && <EstimateBadge />}
          </p>
          <p className="text-lg font-bold" style={{ color: '#6ee7b7' }}>{gdpB}</p>
          <p className="text-[10px]" style={{ color: '#71717a' }}>{latestYear.year}</p>
        </div>
        <div className="p-3 rounded-lg border border-blue-900/40" style={{ backgroundColor: '#1e3a5f33' }}>
          <p className="text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1 flex-wrap" style={{ color: '#60a5fa' }}>
            GDP Growth
            {metricKeyIsEstimate('gdp_growth_annual_pct', metricEstimates) && <EstimateBadge />}
          </p>
          <p className="text-lg font-bold" style={{ color: '#93c5fd' }}>{growth}</p>
          <p className="text-[10px]" style={{ color: '#71717a' }}>YoY {latestYear.year}</p>
        </div>
        <div className="p-3 rounded-lg border border-blue-900/40" style={{ backgroundColor: '#1e3a5f33' }}>
          <p className="text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1 flex-wrap" style={{ color: '#60a5fa' }}>
            FDI Inflows
            {metricKeyIsEstimate('fdi_net_inflows_current_usd', metricEstimates) && <EstimateBadge />}
          </p>
          <p className="text-lg font-bold" style={{ color: '#6ee7b7' }}>{fdi}</p>
          <p className="text-[10px]" style={{ color: '#71717a' }}>Net inflows</p>
        </div>
        <div className="p-3 rounded-lg border border-blue-900/40" style={{ backgroundColor: '#1e3a5f33' }}>
          <p className="text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1 flex-wrap" style={{ color: '#60a5fa' }}>
            Inflation
            {metricKeyIsEstimate('inflation_consumer_prices_annual_pct', metricEstimates) && <EstimateBadge />}
          </p>
          <p className="text-lg font-bold" style={{ color: '#fbbf24' }}>{inflation}</p>
          <p className="text-[10px]" style={{ color: '#71717a' }}>CPI · {gdpChangeStr} 5yr GDP</p>
        </div>
      </div>

      {/* Live-only narrative — first paragraph visible; expand for full analysis */}
      <div data-export-hide-analysis>
        <CollapsibleAnalysis
          text={fullAnalysis}
          title="Souvera Analysis"
          titleClass="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2"
          defaultExpanded={false}
          expandText="Expand full analysis"
          collapseText="Collapse analysis"
        />
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
        <span>Data: {copy.dataSources}</span>
        <span>Updated: {latestYear.year}</span>
      </div>
    </div>
  );
}

function KeyIndicatorsTable({
  years,
  copy,
  canExport,
  onExport,
}: {
  years: TimeSeriesYear[];
  copy: ReturnType<typeof getEconomyTabCopy>;
  canExport: boolean;
  onExport: () => void;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [showAllIndicators, setShowAllIndicators] = useState(false);
  const bullets = copy.buildIndicatorBullets(years);
  const rows = economyIndicatorRowsForYears(years, copy.fxPairLabel);
  const primaryRows = rows.filter((r) => r.primary);
  const secondaryRows = rows.filter((r) => !r.primary);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  const renderRow = (row: (typeof rows)[number]) => (
    <tr key={row.label} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
      <td className="py-3 px-4 font-medium">{row.label}</td>
      {years.map((year) => {
        const raw = row.getValue(year);
        const tone = raw != null && row.tone ? row.tone(raw) : 'text-zinc-300';
        return (
          <td key={year.year} className={`text-right py-3 px-4 font-bold ${tone}`}>
            {raw != null ? row.format(raw) : 'N/A'}
          </td>
        );
      })}
    </tr>
  );

  return (
    <div id="economy-key-indicators" className="exportable-card group relative">
      {/* Hover-activated PNG download button */}
      {canExport && (
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          data-export-exclude
          title="Download as PNG"
          aria-label="Download Key Economic Indicators as PNG"
        >
          <Download className={`w-4 h-4 text-zinc-300 ${isExporting ? 'animate-pulse' : ''}`} />
        </button>
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-zinc-400">Key Economic Indicators</h3>
      </div>
      <div className="overflow-x-auto bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-3 px-4 text-zinc-500 font-bold uppercase tracking-wider text-xs">Metric</th>
              {years.map((year) => (
                <th key={year.year} className="text-right py-3 px-4 text-zinc-500 font-bold">{year.year}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {(showAllIndicators || primaryRows.length === 0 ? rows : primaryRows).map(renderRow)}
          </tbody>
        </table>

        {secondaryRows.length > 0 && primaryRows.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAllIndicators((v) => !v)}
            data-export-exclude
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            {showAllIndicators ? (
              <>
                Show headline indicators only
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Show all indicators ({secondaryRows.length} more)
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}

        <AnalysisBullets bullets={bullets} />
      </div>
    </div>
  );
}

function GDPSection({
  years,
  copy,
  canExport,
  onExport,
}: {
  years: TimeSeriesYear[];
  copy: ReturnType<typeof getEconomyTabCopy>;
  canExport: boolean;
  onExport: () => void;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const chartData = years.map((year) => ({
    year: year.year,
    gdp: year.gdp_current_usd ? year.gdp_current_usd / 1e9 : null,
  }));

  const startGdpB = chartData[0].gdp ?? 0;
  const endGdpB = chartData[chartData.length - 1].gdp ?? 0;
  const pctChg = startGdpB ? ((endGdpB - startGdpB) / startGdpB) * 100 : 0;
  const narrative = copy.buildGdpNarrative({
    startGdpB,
    endGdpB,
    startYear: chartData[0].year,
    endYear: chartData[chartData.length - 1].year,
    pctChange: pctChg,
  });

  const bullets = [
    `$${startGdpB.toFixed(1)}B (${chartData[0].year}) → $${endGdpB.toFixed(1)}B (${chartData[chartData.length - 1].year})`,
    `${pctChg >= 0 ? '+' : ''}${pctChg.toFixed(0)}% cumulative change over ${years.length} years`,
  ];

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="economy-gdp-card" className="exportable-card group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      {/* Hover-activated PNG download button */}
      {canExport && (
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          data-export-exclude
          title="Download GDP chart as PNG"
          aria-label="Download GDP chart as PNG"
        >
          <Download className={`w-4 h-4 text-emerald-300 ${isExporting ? 'animate-pulse' : ''}`} />
        </button>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Gross Domestic Product</h3>
      </div>

      <div className="h-[300px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="year" stroke="#71717a" style={{ fontSize: '12px' }} />
            <YAxis stroke="#71717a" style={{ fontSize: '12px' }} label={{ value: 'GDP ($B)', angle: -90, position: 'insideLeft', style: { fill: '#71717a', fontSize: '12px' } }} />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
                <p className="text-xs text-zinc-500 mb-1">{payload[0].payload.year}</p>
                <p className="text-sm font-bold text-blue-400">${Number(payload[0].value).toFixed(1)}B</p>
              </div>
            ) : null} />
            <Line type="monotone" dataKey="gdp" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed">{narrative}</p>
      <AnalysisBullets bullets={bullets} />
    </div>
  );
}

function GrowthSection({
  years,
  forecast,
  hasForecast,
  copy,
  canExport,
  onExport,
}: {
  years: TimeSeriesYear[];
  forecast?: Array<{ year: number; gdp_growth_pct: number }>;
  hasForecast: boolean;
  copy: ReturnType<typeof getEconomyTabCopy>;
  canExport: boolean;
  onExport: () => void;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const historicalData = years.map((year) => ({ year: year.year, growth: year.gdp_growth_pct, isForecast: false }));
  const forecastData = forecast?.map((f) => ({ year: f.year, growth: f.gdp_growth_pct, isForecast: true })) ?? [];
  const chartData = [...historicalData, ...forecastData];

  const latestGrowth = years[years.length - 1].gdp_growth_pct ?? 0;
  const latestYear = years[years.length - 1].year;
  const narrative = copy.buildGrowthNarrative({
    latestGrowth,
    latestYear,
    forecast: forecast?.[0]?.gdp_growth_pct,
    forecastYear: forecast?.[0]?.year,
    hasForecast,
  });

  const bullets = [
    `Latest growth ${latestGrowth.toFixed(1)}% (${latestYear})`,
    ...(hasForecast && forecast?.[0]
      ? [`${copy.forecastAuthority} forecast: ${forecast[0].gdp_growth_pct.toFixed(1)}% (${forecast[0].year})`]
      : []),
  ];

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="economy-growth-card" className="exportable-card group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      {/* Hover-activated PNG download button */}
      {canExport && (
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          data-export-exclude
          title="Download Growth chart as PNG"
          aria-label="Download Growth chart as PNG"
        >
          <Download className={`w-4 h-4 text-emerald-300 ${isExporting ? 'animate-pulse' : ''}`} />
        </button>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Economic Growth</h3>
      </div>

      <div className="h-[300px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="year" stroke="#71717a" style={{ fontSize: '12px' }} />
            <YAxis stroke="#71717a" style={{ fontSize: '12px' }} label={{ value: 'Growth (%)', angle: -90, position: 'insideLeft', style: { fill: '#71717a', fontSize: '12px' } }} />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
                <p className="text-xs text-zinc-500 mb-1">
                  {payload[0].payload.year} {payload[0].payload.isForecast ? '(Forecast)' : ''}
                </p>
                <p className={`text-sm font-bold ${Number(payload[0].value) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {Number(payload[0].value).toFixed(1)}%
                </p>
              </div>
            ) : null} />
            <ReferenceLine y={0} stroke="#71717a" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="growth"
              stroke="#34d399"
              strokeWidth={3}
              dot={(props) => {
                const { cx, cy, payload } = props;
                return !payload.isForecast ? <circle cx={cx} cy={cy} r={5} fill="#34d399" /> : null;
              }}
              activeDot={{ r: 7 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed">{narrative}</p>
      <AnalysisBullets bullets={bullets} />
    </div>
  );
}

function FXRateSection({
  years,
  parallelRate,
  copy,
  canExport,
  onExport,
}: {
  years: TimeSeriesYear[];
  parallelRate?: number;
  copy: ReturnType<typeof getEconomyTabCopy>;
  canExport: boolean;
  onExport: () => void;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const latestFx = years[years.length - 1]?.fx_to_usd;
  const earliestFx = years[0]?.fx_to_usd;
  const latestYear = years[years.length - 1].year;
  const chartData = years.map((year) => ({ year: year.year, fx: year.fx_to_usd }));

  const narrative = latestFx != null
    ? copy.buildFxNarrative({ latestFx, earliestFx, latestYear })
    : 'FX data pending.';

  const bullets = latestFx != null
    ? [
        `Current rate: ${latestFx.toLocaleString()} ${copy.fxPairLabel} (${latestYear})`,
        ...(earliestFx ? [`Series: ${earliestFx.toLocaleString()} → ${latestFx.toLocaleString()} ${copy.fxPairLabel}`] : []),
      ]
    : [];

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="economy-fx-card" className="exportable-card group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      {/* Hover-activated PNG download button */}
      {canExport && (
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          data-export-exclude
          title="Download FX Rate chart as PNG"
          aria-label="Download FX Rate chart as PNG"
        >
          <Download className={`w-4 h-4 text-cyan-300 ${isExporting ? 'animate-pulse' : ''}`} />
        </button>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Foreign Exchange Rate</h3>
      </div>

      {latestFx != null && (
        <div className={`grid grid-cols-1 ${copy.showParallelRate && parallelRate != null ? 'md:grid-cols-2' : ''} gap-4 mb-4`}>
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="text-xs text-zinc-500 mb-1">{copy.fxRateLabel}</div>
            <div className="text-xl font-bold text-cyan-400">{latestFx.toLocaleString()} {copy.fxPairLabel}</div>
          </div>
          {copy.showParallelRate && parallelRate != null && (
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-xs text-zinc-500 mb-1">Parallel Market (est.)</div>
              <div className="text-xl font-bold text-amber-400">{parallelRate.toLocaleString()} {copy.fxPairLabel}</div>
            </div>
          )}
        </div>
      )}

      <div className="h-[300px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="year" stroke="#71717a" style={{ fontSize: '12px' }} />
            <YAxis stroke="#71717a" style={{ fontSize: '12px' }} label={{ value: copy.fxPairLabel, angle: -90, position: 'insideLeft', style: { fill: '#71717a', fontSize: '12px' } }} />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
                <p className="text-xs text-zinc-500 mb-1">{payload[0].payload.year}</p>
                <p className="text-sm font-bold text-cyan-400">{Number(payload[0].value).toFixed(0)} {copy.fxPairLabel}</p>
              </div>
            ) : null} />
            {copy.showReformLine && copy.reformLineYear && (
              <ReferenceLine
                x={copy.reformLineYear}
                stroke="#fbbf24"
                strokeDasharray="3 3"
                label={{ value: copy.reformLineLabel ?? 'Reform', position: 'top', fill: '#fbbf24', fontSize: '10px' }}
              />
            )}
            <Line type="monotone" dataKey="fx" stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#22d3ee', r: 5 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed">{narrative}</p>
      <AnalysisBullets bullets={bullets} />
    </div>
  );
}
