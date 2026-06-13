/**
 * Institutional coverage map — honest panel rendering across countries.
 */

import type { CountryProfileReportData } from './country-profile-data';
import type { CanonicalCountryPayload, CoverageMapEntry } from '@/types/report-integrity';
import {
  EXTERNAL_SECTOR_KEYS,
  FISCAL_COVERAGE_KEYS,
  FX_REGIME_COVERAGE_KEYS,
  GOVERNANCE_COVERAGE_KEYS,
  TOP20_INDICATOR_KEYS,
} from '@/lib/indicators/top20';

function latestValueForKey(
  payload: CountryProfileReportData,
  key: string,
  macroYear: number | null
): number | undefined {
  if (macroYear == null) return undefined;
  const row = payload.economyYears.find((y) => y.year === macroYear);
  if (!row) return undefined;
  return (row as Record<string, number | undefined>)[key];
}

function hasAnyKey(payload: CountryProfileReportData, keys: readonly string[], year: number | null): boolean {
  if (year == null) return false;
  const row = payload.economyYears.find((y) => y.year === year);
  if (!row) return false;
  return keys.some((k) => (row as Record<string, number | undefined>)[k] != null);
}

function hasFxRegime(payload: CountryProfileReportData, year: number | null): boolean {
  if (year == null) return false;
  const row = payload.economyYears.find((y) => y.year === year);
  return Boolean(row?.fx_regime_category?.trim());
}

export function buildCoverageMap(
  payload: CountryProfileReportData,
  canonical: CanonicalCountryPayload
): CoverageMapEntry[] {
  const macroYear = canonical.asOf.macroYear;
  const c = canonical.dataCoverage;
  const pop = latestValueForKey(payload, 'population_total', macroYear);

  return [
    {
      domain: 'macro',
      label: 'Macro (Top 20 core)',
      status: c.hasMacroSeries ? 'covered' : 'not_covered',
      asOfYear: macroYear,
      sourceKey: 'world_bank',
      sourceUrl: 'https://api.worldbank.org/v2',
    },
    {
      domain: 'population',
      label: 'Population',
      status: pop != null || c.hasPopulationInCanonical ? 'covered' : 'not_covered',
      asOfYear: macroYear,
      sourceKey: 'world_bank',
      sourceUrl: 'https://data.worldbank.org/indicator/SP.POP.TOTL',
    },
    {
      domain: 'external',
      label: 'External sector',
      status: hasAnyKey(payload, EXTERNAL_SECTOR_KEYS, macroYear)
        ? 'covered'
        : 'not_covered',
      asOfYear: macroYear,
      sourceKey: 'world_bank',
      note: 'Current account, reserves, remittances (WDI)',
    },
    {
      domain: 'fiscal',
      label: 'Fiscal / public debt',
      status: hasAnyKey(payload, FISCAL_COVERAGE_KEYS, macroYear) ? 'covered' : 'not_covered',
      asOfYear: macroYear,
      sourceKey: 'imf_dataservices',
      note: 'IMF WEO — debt and fiscal balance (% of GDP)',
    },
    {
      domain: 'trade',
      label: 'Trade summary',
      status: c.hasTradeSummary ? 'covered' : 'not_covered',
      asOfYear: canonical.asOf.tradeYear,
      sourceKey: 'un_comtrade',
    },
    {
      domain: 'markets',
      label: 'Markets (rates/curves/spreads)',
      status: c.hasMarketsFeed ? 'covered' : 'not_covered',
      note: 'Platform refresh is not a markets feed',
    },
    {
      domain: 'fx_regime',
      label: 'FX regime / capital controls',
      status: 'not_covered',
      sourceKey: 'imf_areaer',
      note: 'IMF AREAER document extraction planned',
    },
    {
      domain: 'governance',
      label: 'Governance indicators (WGI/CPI)',
      status: 'not_covered',
      note: 'WGI/CPI ingestion planned',
    },
  ];
}

export function top20CoverageCount(payload: CountryProfileReportData, macroYear: number | null): number {
  if (macroYear == null) return 0;
  const row = payload.economyYears.find((y) => y.year === macroYear);
  if (!row) return 0;
  return TOP20_INDICATOR_KEYS.filter((k) => (row as Record<string, number | undefined>)[k] != null).length;
}
