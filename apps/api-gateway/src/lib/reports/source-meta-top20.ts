/**
 * Build sourceMeta with World Bank URLs for Top 20 metrics.
 */

import type { CountryProfileReportData } from './country-profile-data';
import {
  top20ByKey,
  worldBankCountryIndicatorApiUrl,
  worldBankIndicatorPageUrl,
  WORLD_BANK_DOCS_URL,
} from '@/lib/indicators/top20';

const METRIC_KEY_MAP: Record<string, string> = {
  gdp_current_usd: 'gdp_current_usd',
  gdp_growth_pct: 'gdp_growth_pct',
  gdp_per_capita_usd: 'gdp_per_capita_usd',
  population_total: 'population_total',
  fdi_net_inflows_usd: 'fdi_net_inflows_usd',
  inflation_cpi_pct: 'inflation_cpi_pct',
  fx_to_usd: 'official_exchange_rate',
  current_account_pct_gdp: 'current_account_pct_gdp',
  reserves_total_usd: 'reserves_total_usd',
  reserves_months_imports: 'reserves_months_imports',
  remittances_received_usd: 'remittances_received_usd',
  exports_goods_services_usd: 'exports_goods_services_usd',
  imports_goods_services_usd: 'imports_goods_services_usd',
  trade_pct_gdp: 'trade_pct_gdp',
  unemployment_pct: 'unemployment_pct',
  internet_users_pct: 'internet_users_pct',
  life_expectancy_years: 'life_expectancy_years',
  urban_population_pct: 'urban_population_pct',
  electricity_access_pct: 'electricity_access_pct',
  co2_emissions_per_capita: 'co2_emissions_per_capita',
  debt_to_gdp_pct: 'debt_to_gdp_pct',
  fiscal_balance_pct_gdp: 'fiscal_balance_pct_gdp',
};

const METRIC_SOURCE_NAMES: Record<string, string> = {
  debt_to_gdp_pct: 'IMF',
  fiscal_balance_pct_gdp: 'IMF',
  fx_to_usd: 'World Bank',
};

export function buildTop20SourceMeta(
  iso2: string | undefined,
  macroYear: number | null,
  fetchedAt?: string
): CountryProfileReportData['sourceMeta'] {
  const metrics: NonNullable<CountryProfileReportData['sourceMeta']>['metrics'] = {};
  const year = macroYear != null ? String(macroYear) : undefined;

  for (const [metricId, indicatorKey] of Object.entries(METRIC_KEY_MAP)) {
    const def = top20ByKey(indicatorKey);
    const source_url = def
      ? iso2
        ? worldBankCountryIndicatorApiUrl(iso2, def.worldBankCode)
        : worldBankIndicatorPageUrl(def.worldBankCode)
      : undefined;

    metrics[metricId] = {
      source_name: METRIC_SOURCE_NAMES[metricId] ?? 'World Bank',
      source_url: source_url ?? WORLD_BANK_DOCS_URL,
      as_of: year,
      retrieved_at: fetchedAt,
    };
  }

  return {
    defaultSource: 'World Bank Indicators API',
    metrics,
  };
}
