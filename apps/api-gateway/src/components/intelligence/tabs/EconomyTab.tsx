'use client';

import { Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Link from 'next/link';
import { exportCardToPNG } from '@/lib/intelligence/export-png';
import { countryExportContext } from '@/lib/intelligence/export-branding';
import { getEconomyTabCopy, type EconomyYearPoint } from '@/lib/intelligence/country-economy-content';
import { economyIndicatorRowsForYears } from '@/lib/intelligence/economy-indicator-rows';
import type { IntelligenceTabProps } from '@/types/country-intelligence';

type TimeSeriesYear = EconomyYearPoint;

/**
 * EconomyTab — Bloomberg-grade economic analysis with per-country copy (Sprint C).
 */
export function EconomyTab({ data, userEntitlements }: IntelligenceTabProps) {
  const hasAccess = userEntitlements.includes('full_macro') || userEntitlements.includes('admin_access');
  const canExport = hasAccess;
  const iso3 = data.country?.iso3?.toUpperCase() ?? '';
  const iso3Lower = iso3.toLowerCase();
  const copy = getEconomyTabCopy(iso3);
  const exportCtx = countryExportContext(data.country);

  const handleExport = (elementId: string, fileName: string, cardTitle: string) =>
    exportCardToPNG({ elementId, fileName, cardTitle, ...exportCtx });

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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-zinc-500">Economic time series data pending for {data.country.name}</p>
        </div>
      </div>
    );
  }

  const { years, forecast } = data.timeSeries;
  const hasForecast = userEntitlements.includes('forecast_metrics') || userEntitlements.includes('admin_access');
  const forecastData = hasForecast ? forecast : undefined;

  const latestYear = years[years.length - 1];
  const earliestYear = years[0];
  const gdpChange = latestYear.gdp_current_usd && earliestYear.gdp_current_usd
    ? ((latestYear.gdp_current_usd - earliestYear.gdp_current_usd) / earliestYear.gdp_current_usd) * 100
    : 0;

  return (
    <div className="space-y-8">
      <EconomyHeroNarrative latestYear={latestYear} gdpChange={gdpChange} copy={copy} />

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

function ExportButton({ onClick, className = 'text-blue-400 hover:text-blue-300' }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-export-exclude
      className={`text-xs flex items-center gap-1 transition-colors ${className}`}
      title="Export as PNG (Professional+)"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">PNG</span>
    </button>
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
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EconomyHeroNarrative({
  latestYear,
  gdpChange,
  copy,
}: {
  latestYear: TimeSeriesYear;
  gdpChange: number;
  copy: ReturnType<typeof getEconomyTabCopy>;
}) {
  const growth = latestYear.gdp_growth_pct != null ? latestYear.gdp_growth_pct.toFixed(1) : 'N/A';
  const fdi = latestYear.fdi_net_inflows_usd != null
    ? latestYear.fdi_net_inflows_usd >= 1e9
      ? `$${(latestYear.fdi_net_inflows_usd / 1e9).toFixed(1)}B`
      : `$${(latestYear.fdi_net_inflows_usd / 1e6).toFixed(0)}M`
    : 'N/A';
  const inflation = latestYear.inflation_cpi_pct != null ? latestYear.inflation_cpi_pct.toFixed(1) : 'N/A';
  const gdpChangeStr = Number.isFinite(gdpChange) ? gdpChange.toFixed(1) : 'N/A';

  return (
    <div className="bg-blue-950/10 border border-blue-900/30 rounded-xl p-6">
      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Economic Overview</h3>
      <p className="text-zinc-300 leading-relaxed text-sm">
        GDP expanded <span className="text-blue-400 font-semibold">{growth}%</span> in {latestYear.year}.
        Five-year GDP change: <span className="text-blue-400">{gdpChangeStr}%</span>.
        FDI inflows: <span className="text-emerald-400 font-semibold">{fdi}</span>.
        Inflation: <span className="text-amber-400">{inflation}%</span>, {copy.heroInflationNote}.
      </p>
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
  const bullets = copy.buildIndicatorBullets(years);
  const rows = economyIndicatorRowsForYears(years);

  return (
    <div id="economy-key-indicators">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-zinc-400">Key Economic Indicators</h3>
        {canExport && <ExportButton onClick={onExport} />}
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
            {rows.map((row) => (
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
            ))}
          </tbody>
        </table>
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

  return (
    <div id="economy-gdp-card" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Gross Domestic Product</h3>
        {canExport && <ExportButton onClick={onExport} className="text-emerald-400 hover:text-emerald-300" />}
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

  return (
    <div id="economy-growth-card" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Economic Growth</h3>
        {canExport && <ExportButton onClick={onExport} className="text-emerald-400 hover:text-emerald-300" />}
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

  return (
    <div id="economy-fx-card" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Foreign Exchange Rate</h3>
        {canExport && <ExportButton onClick={onExport} className="text-cyan-400 hover:text-cyan-300" />}
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
