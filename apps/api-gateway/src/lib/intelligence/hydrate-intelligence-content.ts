/**
 * Phase 0A — hydrate country terminal copy from live API metrics (same tokens as reports).
 */

import type { CountryIntelligenceResponse } from '@/types/country-intelligence';
import {
  buildNarrativeTemplateVars,
  hydrateContentTree,
  type NarrativeTemplateVars,
} from '@/lib/reports/narrative-template';
import { canonicalizeCountryPayload } from '@/lib/reports/canonicalize-country-payload';
import type { CountryProfileReportData } from '@/lib/reports/country-profile-data';
import type { CountryOverviewContent } from './country-overview-content';
import type { CountryRiskContent } from './country-risk-content';

function fmtUsd(n?: number): string {
  if (n == null || !Number.isFinite(n)) return 'Not covered';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtPct(n?: number): string {
  return n != null ? `${n.toFixed(1)}%` : 'Not covered';
}

/** Build template vars from country API payload (aligned with report canonical metrics). */
export function buildTemplateVarsFromIntelligence(
  data: CountryIntelligenceResponse
): NarrativeTemplateVars {
  const years = data.timeSeries?.years ?? [];
  const macroYear = years.length ? Math.max(...years.map((y) => y.year)) : null;
  const macroRow = macroYear != null ? years.find((y) => y.year === macroYear) : undefined;
  const m = data.metrics;

  const minimalPayload: CountryProfileReportData = {
    country: {
      name: data.country.name,
      iso3: data.country.iso3,
      region: data.country.region,
    },
    generatedAt: '',
    metrics: [],
    signalScan: { badge: 'Stable', bullets: ['—', '—'] },
    sectors: [],
    marketAccess: [],
    sources: '',
    economyYears: years.map((y) => ({
      year: y.year,
      gdp_current_usd: y.gdp_current_usd,
      gdp_growth_pct: y.gdp_growth_pct,
      fdi_net_inflows_usd: y.fdi_net_inflows_usd,
      inflation_cpi_pct: y.inflation_cpi_pct,
      fx_to_usd: y.fx_to_usd,
    })),
    sections: {} as CountryProfileReportData['sections'],
    tradeSummary: data.trade?.asOfYear
      ? {
          asOfYear: data.trade.asOfYear,
          exportsUsd: data.trade.exportsUsd != null ? fmtUsd(data.trade.exportsUsd) : undefined,
          importsUsd: data.trade.importsUsd != null ? fmtUsd(data.trade.importsUsd) : undefined,
          topPartners: [],
        }
      : undefined,
  };

  if (
    macroRow?.gdp_current_usd == null &&
    m.gdp_current_usd != null &&
    macroYear != null
  ) {
    const row = minimalPayload.economyYears.find((y) => y.year === macroYear);
    if (row) row.gdp_current_usd = m.gdp_current_usd;
  }
  if (macroRow?.gdp_growth_pct == null && m.gdp_growth_annual_pct != null && macroYear != null) {
    const row = minimalPayload.economyYears.find((y) => y.year === macroYear);
    if (row) row.gdp_growth_pct = m.gdp_growth_annual_pct;
  }
  if (macroRow?.fdi_net_inflows_usd == null && m.fdi_net_inflows_current_usd != null && macroYear != null) {
    const row = minimalPayload.economyYears.find((y) => y.year === macroYear);
    if (row) row.fdi_net_inflows_usd = m.fdi_net_inflows_current_usd;
  }
  if (macroRow?.inflation_cpi_pct == null && m.inflation_consumer_prices_annual_pct != null && macroYear != null) {
    const row = minimalPayload.economyYears.find((y) => y.year === macroYear);
    if (row) row.inflation_cpi_pct = m.inflation_consumer_prices_annual_pct;
  }
  if (macroRow?.fx_to_usd == null && m.fx_rate_usd != null && macroYear != null) {
    const row = minimalPayload.economyYears.find((y) => y.year === macroYear);
    if (row) row.fx_to_usd = m.fx_rate_usd;
  }

  if (!minimalPayload.economyYears.length && macroYear == null) {
    const fallbackYear = new Date().getFullYear() - 1;
    minimalPayload.economyYears.push({
      year: fallbackYear,
      gdp_current_usd: m.gdp_current_usd,
      gdp_growth_pct: m.gdp_growth_annual_pct,
      fdi_net_inflows_usd: m.fdi_net_inflows_current_usd,
      inflation_cpi_pct: m.inflation_consumer_prices_annual_pct,
      fx_to_usd: m.fx_rate_usd,
    });
  }

  const canonical = canonicalizeCountryPayload(minimalPayload);
  return buildNarrativeTemplateVars(canonical);
}

export function hydrateOverviewContent(
  content: CountryOverviewContent,
  data: CountryIntelligenceResponse
): CountryOverviewContent {
  const vars = buildTemplateVarsFromIntelligence(data);
  return hydrateContentTree(content, vars);
}

export function hydrateRiskContent(
  content: CountryRiskContent,
  data: CountryIntelligenceResponse
): CountryRiskContent {
  const vars = buildTemplateVarsFromIntelligence(data);
  return hydrateContentTree(content, vars);
}
