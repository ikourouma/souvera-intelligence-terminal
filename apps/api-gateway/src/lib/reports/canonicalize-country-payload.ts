/**
 * Canonical country report payload — single source of truth for macro/trade/as-of.
 */

import type { CountryProfileReportData } from './country-profile-data';
import type {
  AsOfStamps,
  CanonicalCountryPayload,
  CanonicalMetrics,
  DataCoverage,
} from '@/types/report-integrity';
import { getLatestPolicyVerifiedAt, getPolicyStatusRegistry } from './policy-status-registry';

function maxMacroYear(years: { year: number }[]): number | null {
  if (!years.length) return null;
  return Math.max(...years.map((y) => y.year));
}

function rowForYear(
  payload: CountryProfileReportData,
  year: number | null
): CountryProfileReportData['economyYears'][0] | undefined {
  if (year == null) return undefined;
  return payload.economyYears.find((y) => y.year === year);
}

function fmtUsdBillions(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function buildCanonicalDrivers(
  metrics: CanonicalMetrics,
  macroYear: number | null
): string[] {
  const drivers: string[] = [];
  const yearLabel = macroYear ?? 'latest';

  if (metrics.fdiNetInflowsUsd != null && metrics.fdiNetInflowsUsd > 0) {
    drivers.push(`FDI net inflows ${fmtUsdBillions(metrics.fdiNetInflowsUsd)} (${yearLabel})`);
  }
  if (metrics.gdpGrowthPct != null) {
    drivers.push(`GDP growth ${fmtPct(metrics.gdpGrowthPct)} (${yearLabel})`);
  }
  if (metrics.inflationCpiPct != null) {
    drivers.push(`Inflation ${fmtPct(metrics.inflationCpiPct)} (${yearLabel})`);
  }
  if (metrics.gdpCurrentUsd != null && drivers.length < 3) {
    drivers.push(`GDP scale ${fmtUsdBillions(metrics.gdpCurrentUsd)} (${yearLabel})`);
  }

  while (drivers.length < 2) {
    drivers.push('Additional macro drivers pending structured series coverage');
  }

  return drivers.slice(0, 3);
}

function computeConfidence(coverage: DataCoverage): 'high' | 'medium' | 'low' {
  let score = 0;
  if (coverage.hasMacroSeries && coverage.macroYearCount >= 3) score += 2;
  if (coverage.hasTradeSummary) score += 1;
  if (coverage.hasVerifiedPolicy) score += 1;
  if (coverage.hasMarketsAsOf) score += 1;
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

export function canonicalizeCountryPayload(
  payload: CountryProfileReportData
): CanonicalCountryPayload {
  const macroYear = maxMacroYear(payload.economyYears);
  const macroRow = rowForYear(payload, macroYear);

  const canonicalMetrics: CanonicalMetrics = {
    gdpCurrentUsd: macroRow?.gdp_current_usd,
    gdpGrowthPct: macroRow?.gdp_growth_pct,
    fdiNetInflowsUsd: macroRow?.fdi_net_inflows_usd,
    inflationCpiPct: macroRow?.inflation_cpi_pct,
    fxToUsd: macroRow?.fx_to_usd,
  };

  const policyRecords = getPolicyStatusRegistry(payload.country.iso3);

  const asOf: AsOfStamps = {
    macroYear,
    tradeYear: payload.tradeSummary?.asOfYear ?? null,
    marketsDate: payload.markets?.asOfDate ?? null,
    policyVerifiedAt: getLatestPolicyVerifiedAt(payload.country.iso3),
  };

  const dataCoverage: DataCoverage = {
    hasMacroSeries: payload.economyYears.length > 0,
    hasTradeSummary: Boolean(payload.tradeSummary?.exportsUsd || payload.tradeSummary?.importsUsd),
    hasMarketsAsOf: Boolean(payload.markets?.asOfDate),
    hasVerifiedPolicy: policyRecords.some((p) => p.status !== 'unknown' && p.lastVerifiedAt),
    macroYearCount: payload.economyYears.length,
  };

  const confidence = computeConfidence(dataCoverage);
  const signalDrivers = buildCanonicalDrivers(canonicalMetrics, macroYear);

  return {
    payload,
    asOf,
    canonicalMetrics,
    dataCoverage,
    confidence,
    policyRecords,
    signalDrivers,
    signalConfidence: confidence === 'high' ? 'High' : confidence === 'medium' ? 'Medium' : 'Low',
  };
}
