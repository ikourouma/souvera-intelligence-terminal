/**
 * Economy tab — dynamic key indicator table rows (Top 20 aware).
 */

import type { EconomyYearPoint } from '@/lib/intelligence/country-economy-content';
import { formatPopulation } from '@/lib/intelligence-entitlements';

export interface EconomyIndicatorRow {
  label: string;
  /** Headline metrics shown before "Expand" on the Economy tab. */
  primary?: boolean;
  getValue: (year: EconomyYearPoint) => number | undefined;
  format: (value: number) => string;
  tone?: (value: number) => string;
}

function hasAny(years: EconomyYearPoint[], getter: (y: EconomyYearPoint) => number | undefined) {
  return years.some((y) => getter(y) != null);
}

const ROW_DEFS: EconomyIndicatorRow[] = [
  {
    label: 'GDP ($B)',
    primary: true,
    getValue: (y) => (y.gdp_current_usd != null ? y.gdp_current_usd / 1e9 : undefined),
    format: (v) => v.toFixed(1),
    tone: () => 'text-emerald-400',
  },
  {
    label: 'GDP per capita ($)',
    primary: true,
    getValue: (y) => y.gdp_per_capita_usd,
    format: (v) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    tone: () => 'text-emerald-300',
  },
  {
    label: 'Growth (%)',
    primary: true,
    getValue: (y) => y.gdp_growth_pct,
    format: (v) => v.toFixed(1),
    tone: (v) => (v < 0 ? 'text-red-400' : v > 5 ? 'text-emerald-400' : 'text-blue-400'),
  },
  {
    // Adaptive units: populations span 46K (St Kitts) → 223M (Nigeria), so a fixed
    // "(M)" column renders "0.0" for small nations. formatPopulation picks K/M/B.
    label: 'Population',
    primary: true,
    getValue: (y) => y.population_total,
    format: (v) => formatPopulation(v),
    tone: () => 'text-zinc-300',
  },
  {
    label: 'FDI ($M)',
    primary: true,
    getValue: (y) => (y.fdi_net_inflows_usd != null ? y.fdi_net_inflows_usd / 1e6 : undefined),
    format: (v) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    tone: () => 'text-blue-300',
  },
  {
    label: 'Inflation (%)',
    primary: true,
    getValue: (y) => y.inflation_cpi_pct,
    format: (v) => v.toFixed(1),
    tone: (v) => (v > 20 ? 'text-red-400' : v > 15 ? 'text-amber-400' : 'text-blue-400'),
  },
  {
    label: 'FX (LCU/USD)',
    getValue: (y) => y.fx_to_usd ?? y.official_exchange_rate,
    format: (v) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    tone: () => 'text-cyan-400',
  },
  {
    label: 'Exports ($B)',
    getValue: (y) => (y.exports_goods_services_usd != null ? y.exports_goods_services_usd / 1e9 : undefined),
    format: (v) => v.toFixed(1),
    tone: () => 'text-emerald-300',
  },
  {
    label: 'Imports ($B)',
    getValue: (y) => (y.imports_goods_services_usd != null ? y.imports_goods_services_usd / 1e9 : undefined),
    format: (v) => v.toFixed(1),
    tone: () => 'text-amber-300',
  },
  {
    label: 'Trade (% GDP)',
    getValue: (y) => y.trade_pct_gdp,
    format: (v) => v.toFixed(1),
    tone: () => 'text-zinc-300',
  },
  {
    label: 'Current acct (% GDP)',
    getValue: (y) => y.current_account_pct_gdp,
    format: (v) => v.toFixed(1),
    tone: (v) => (v < 0 ? 'text-amber-400' : 'text-emerald-400'),
  },
  {
    label: 'Reserves ($B)',
    getValue: (y) => (y.reserves_total_usd != null ? y.reserves_total_usd / 1e9 : undefined),
    format: (v) => v.toFixed(1),
    tone: () => 'text-blue-300',
  },
  {
    label: 'Reserves (mo. imports)',
    getValue: (y) => y.reserves_months_imports,
    format: (v) => v.toFixed(1),
    tone: () => 'text-blue-300',
  },
  {
    label: 'Remittances ($B)',
    getValue: (y) => (y.remittances_received_usd != null ? y.remittances_received_usd / 1e9 : undefined),
    format: (v) => v.toFixed(2),
    tone: () => 'text-emerald-300',
  },
  {
    label: 'Debt (% GDP)',
    getValue: (y) => y.debt_to_gdp_pct,
    format: (v) => v.toFixed(1),
    tone: () => 'text-amber-400',
  },
  {
    label: 'Unemployment (%)',
    getValue: (y) => y.unemployment_pct,
    format: (v) => v.toFixed(1),
    tone: () => 'text-zinc-300',
  },
  {
    label: 'Internet users (%)',
    getValue: (y) => y.internet_users_pct,
    format: (v) => v.toFixed(1),
    tone: () => 'text-cyan-300',
  },
  {
    label: 'Electricity access (%)',
    getValue: (y) => y.electricity_access_pct,
    format: (v) => v.toFixed(1),
    tone: () => 'text-cyan-300',
  },
];

export function economyIndicatorRowsForYears(
  years: EconomyYearPoint[],
  fxPairLabel?: string
): EconomyIndicatorRow[] {
  return ROW_DEFS.filter((row) => hasAny(years, row.getValue)).map((row) =>
    fxPairLabel && row.label === 'FX (LCU/USD)'
      ? { ...row, label: `FX (${fxPairLabel})` }
      : row
  );
}
