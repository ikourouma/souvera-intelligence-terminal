/**
 * Reconcile U.S. Census bilateral exports vs USITC/Comtrade category-flow aggregates.
 */

import type { TradeSourceReconciliation } from '@/types/country-intelligence';

const CENSUS_SOURCE = {
  sourceKey: 'us_census_trade',
  sourceLabel: 'U.S. Census Bureau (intltrade/enduse)',
  metricScope: 'bilateral_all_goods' as const,
};

const CATEGORY_FLOW_SOURCE = {
  sourceKey: 'usitc_hts',
  sourceLabel: 'USITC / category trade flows',
  metricScope: 'category_flow_aggregate' as const,
};

const PREFERENTIAL_SOURCE = {
  sourceKey: 'usitc_hts',
  sourceLabel: 'USITC category flows (petroleum excluded from preferential sum)',
  metricScope: 'preferential' as const,
};

export { CENSUS_SOURCE, CATEGORY_FLOW_SOURCE, PREFERENTIAL_SOURCE };

export function buildTradeSourceReconciliation(
  censusExportsToUsUsd: number,
  categoryFlowTotalUsd: number,
  asOfYear: number,
  options?: { categoryFlowYear?: number; minCategoryFlowUsd?: number }
): TradeSourceReconciliation | undefined {
  const minCategory = options?.minCategoryFlowUsd ?? 1_000_000;
  if (categoryFlowTotalUsd < minCategory) return undefined;

  const deltaUsd = Math.abs(censusExportsToUsUsd - categoryFlowTotalUsd);
  const base = Math.max(censusExportsToUsUsd, categoryFlowTotalUsd, 1);
  const deltaPct = Math.round((deltaUsd / base) * 1000) / 10;
  const tolerance = Math.max(base * 0.05, 1_000_000);
  if (deltaUsd <= tolerance) return undefined;

  const fmt = (n: number) =>
    n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${n.toLocaleString()}`;

  const yearNote =
    options?.categoryFlowYear != null && options.categoryFlowYear !== asOfYear
      ? ` Category flows use ${options.categoryFlowYear} vintage.`
      : '';

  return {
    message: `Census bilateral exports to the U.S. (${asOfYear}: ${fmt(censusExportsToUsUsd)}) differ from USITC category-flow totals (${options?.categoryFlowYear ?? asOfYear}: ${fmt(categoryFlowTotalUsd)}) by ${fmt(deltaUsd)} (${deltaPct}%). Census is the authoritative all-goods bilateral figure; category flows sum sector buckets and may use a different HS aggregation or vintage.${yearNote}`,
    censusExportsToUsUsd,
    categoryFlowTotalUsd,
    deltaUsd,
    deltaPct,
  };
}
