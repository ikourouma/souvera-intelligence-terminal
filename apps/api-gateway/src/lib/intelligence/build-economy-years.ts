/**
 * Phase 0C — Map observation rows → annual economy year points (Top 20 + extensions).
 */

import {
  FISCAL_COVERAGE_KEYS,
  FX_REGIME_COVERAGE_KEYS,
  GOVERNANCE_COVERAGE_KEYS,
  TOP20_INDICATORS,
} from '@/lib/indicators/top20';
import type { EconomyYearPoint } from '@/lib/intelligence/country-economy-content';

export interface EconomyObservationRow {
  period_date: string;
  value_numeric?: number | null;
  value_text?: string | null;
  souvera_indicators?: { key?: string } | null;
}

const EXTENSION_KEYS = [
  ...FISCAL_COVERAGE_KEYS,
  ...GOVERNANCE_COVERAGE_KEYS,
  ...FX_REGIME_COVERAGE_KEYS,
] as const;

/** Map DB indicator keys → EconomyYearPoint field names. */
function buildObservationKeyMap(): Record<string, keyof EconomyYearPoint> {
  const map = Object.fromEntries(
    TOP20_INDICATORS.map((d) => [d.indicatorKey, d.indicatorKey as keyof EconomyYearPoint])
  ) as Record<string, keyof EconomyYearPoint>;

  map.official_exchange_rate = 'fx_to_usd';
  for (const key of EXTENSION_KEYS) {
    map[key] = key as keyof EconomyYearPoint;
  }
  return map;
}

const OBSERVATION_KEY_MAP = buildObservationKeyMap();

export function buildEconomyYearsFromObservations(
  observations: EconomyObservationRow[]
): EconomyYearPoint[] {
  if (!observations.length) return [];

  const yearMap = new Map<number, EconomyYearPoint>();

  for (const obs of observations) {
    const indicatorKey = obs.souvera_indicators?.key;
    if (!indicatorKey) continue;

    const year = Number(obs.period_date.slice(0, 4));
    if (!yearMap.has(year)) yearMap.set(year, { year });
    const row = yearMap.get(year)!;

    if (indicatorKey === 'fx_regime_category' && obs.value_text) {
      row.fx_regime_category = obs.value_text;
      continue;
    }

    const field = OBSERVATION_KEY_MAP[indicatorKey];
    if (field && field !== 'year' && obs.value_numeric != null) {
      (row as Record<string, number>)[field] = obs.value_numeric;
    }
  }

  return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
}

/**
 * Pick the most informative recent year for the Economy/Overview hero.
 *
 * The previous rule required growth + FDI + inflation in the SAME year, which broke
 * for the ~8 covered markets that World Bank never reports CPI for (e.g. DR Congo,
 * Cuba, Eritrea): no year qualified, so it blindly returned the last array element —
 * which can be a sparse 2025 bucket with only population, hiding GDP/growth/FDI that
 * exist a year earlier. We now degrade gracefully through progressively looser tiers
 * so the hero always lands on the richest available recent year.
 */
export function getLatestCompleteMacroYear(years: EconomyYearPoint[]): EconomyYearPoint {
  if (!years.length) return { year: new Date().getFullYear() };

  const findLatest = (pred: (y: EconomyYearPoint) => boolean): EconomyYearPoint | undefined => {
    for (let i = years.length - 1; i >= 0; i--) {
      if (pred(years[i])) return years[i];
    }
    return undefined;
  };

  return (
    // Ideal: full macro picture in one year.
    findLatest((y) => y.gdp_growth_pct != null && y.fdi_net_inflows_usd != null && y.inflation_cpi_pct != null) ??
    // Inflation-less markets: growth + FDI is still a strong, complete-feeling hero.
    findLatest((y) => y.gdp_current_usd != null && y.gdp_growth_pct != null && y.fdi_net_inflows_usd != null) ??
    // Otherwise the latest year with the core public pair (GDP + growth).
    findLatest((y) => y.gdp_current_usd != null && y.gdp_growth_pct != null) ??
    // Otherwise any year carrying nominal GDP (avoids a population-only bucket).
    findLatest((y) => y.gdp_current_usd != null) ??
    years[years.length - 1]
  );
}

/** Keys we expect in rollout macro coverage audits. */
export const ROLLOUT_MACRO_COVERAGE_KEYS = [
  ...TOP20_INDICATORS.map((i) => i.indicatorKey),
  ...EXTENSION_KEYS,
] as const;
