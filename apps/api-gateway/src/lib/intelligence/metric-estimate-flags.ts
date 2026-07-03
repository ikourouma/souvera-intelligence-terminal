import type { CountryMetrics, MetricEstimateFlags } from '@/types/country-intelligence';

/** Map Overview/Economy card labels → CountryMetrics keys for estimate badges. */
const LABEL_TO_METRIC: Record<string, keyof CountryMetrics> = {
  'GDP Growth': 'gdp_growth_annual_pct',
  Growth: 'gdp_growth_annual_pct',
  'Growth Leader': 'gdp_growth_annual_pct',
  GDP: 'gdp_current_usd',
  'Economic Scale': 'gdp_current_usd',
  'FDI Inflows': 'fdi_net_inflows_current_usd',
  Inflation: 'inflation_consumer_prices_annual_pct',
  Population: 'population_total',
  'Nominal GDP': 'gdp_current_usd',
};

export function isMetricEstimate(
  label: string,
  estimates?: MetricEstimateFlags
): boolean {
  const key = LABEL_TO_METRIC[label];
  return key ? !!estimates?.[key] : false;
}

export function metricKeyIsEstimate(
  key: keyof CountryMetrics,
  estimates?: MetricEstimateFlags
): boolean {
  return !!estimates?.[key];
}
