/**
 * AGOA trade-flow aggregations — DB-sourced only (shared by country API + flows API).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { PREFERENTIAL_EXCLUDED_CATEGORY_GROUPS } from '@/lib/intelligence/preferential-trade-policy';

export const AGOA_EXCLUDED_CATEGORIES = PREFERENTIAL_EXCLUDED_CATEGORY_GROUPS;

export type AgoaFlowDbRow = {
  total_exports_to_us_usd: number | null;
  agoa_exports_usd: number | null;
  agoa_share_pct?: number | null;
  category_group: string | null;
  tariff_savings_usd: number | null;
  mfn_tariff_pct?: number | null;
  year: number;
  data_quality_tier?: string | null;
  source_notes?: string | null;
};

export function isPreferentialExcludedCategory(categoryGroup: string | null | undefined): boolean {
  return AGOA_EXCLUDED_CATEGORIES.has(categoryGroup ?? '');
}

/** Resolve preferential exports for a row (petroleum excluded). */
export function resolveAgoaExportsUsd(
  categoryGroup: string,
  agoaEligible: boolean,
  storedAgoaExports: number | null,
): number {
  if (isPreferentialExcludedCategory(categoryGroup)) return 0;
  if (!agoaEligible) return 0;
  return storedAgoaExports ?? 0;
}

/**
 * Derive tariff savings from DB fields only — no default MFN rates.
 * Returns null when mfn_tariff_pct is missing and stored savings is null.
 */
export function resolveTariffSavingsUsd(
  categoryGroup: string,
  agoaEligible: boolean,
  agoaExportsUsd: number | null,
  mfnTariffPct: number | null,
  storedSavings: number | null,
): number | null {
  if (isPreferentialExcludedCategory(categoryGroup)) return 0;
  if (!agoaEligible) return 0;
  if (storedSavings != null) return storedSavings;
  const agoa = agoaExportsUsd ?? 0;
  if (agoa > 0 && mfnTariffPct != null) {
    return Math.round(agoa * (mfnTariffPct / 100));
  }
  return null;
}

export function sumAgoaPreferentialExports(flows: AgoaFlowDbRow[]): number {
  return flows.reduce((sum, f) => {
    if (isPreferentialExcludedCategory(f.category_group)) return sum;
    const direct = f.agoa_exports_usd ?? 0;
    if (direct > 0) return sum + direct;
    const total = f.total_exports_to_us_usd ?? 0;
    if (total <= 0 || f.agoa_share_pct == null) return sum;
    return sum + Math.round(total * (f.agoa_share_pct / 100));
  }, 0);
}

/** Non-petroleum bilateral export base that would qualify under AGOA if restored. */
export function sumEligibleExportBase(flows: AgoaFlowDbRow[]): number {
  return flows.reduce((sum, f) => {
    if (isPreferentialExcludedCategory(f.category_group)) return sum;
    return sum + (f.total_exports_to_us_usd ?? 0);
  }, 0);
}

export function sumPreferentialTariffSavings(flows: AgoaFlowDbRow[]): number {
  return flows.reduce((sum, f) => {
    if (isPreferentialExcludedCategory(f.category_group)) return sum;
    return sum + (f.tariff_savings_usd ?? 0);
  }, 0);
}

export interface AgoaCountryMetrics {
  totalExportsToUsUsd: number;
  currentAgoaExportsUsd: number;
  restorationPotentialUsd: number;
  eligibleCategories: number;
  dataSource: string;
  dataVintage: number;
  trend: Array<{ year: number; agoaPreferentialUsd: number }>;
}

/**
 * Fetch and aggregate AGOA trade flow metrics from database.
 * Excludes petroleum from preferential totals.
 */
export async function fetchAgoaMetrics(
  iso3: string,
  supabaseAdmin: SupabaseClient,
  vaultEligible: boolean,
): Promise<AgoaCountryMetrics | null> {
  try {
    const { data: flows, error } = await supabaseAdmin
      .from('souvera_agoa_trade_flows')
      .select(
        'total_exports_to_us_usd, agoa_exports_usd, agoa_share_pct, category_group, tariff_savings_usd, mfn_tariff_pct, year, data_quality_tier, source_notes',
      )
      .eq('iso3', iso3.toUpperCase())
      .order('year', { ascending: false })
      .limit(100);

    if (error || !flows?.length) return null;

    const years = [...new Set(flows.map((f) => f.year as number))].sort((a, b) => b - a);
    let selectedYear = years[0];
    let selectedFlows = flows.filter((f) => f.year === selectedYear) as AgoaFlowDbRow[];

    if (vaultEligible) {
      for (const year of years) {
        const yearFlows = flows.filter((f) => f.year === year) as AgoaFlowDbRow[];
        if (sumAgoaPreferentialExports(yearFlows) > 0) {
          selectedYear = year;
          selectedFlows = yearFlows;
          break;
        }
      }
    }

    const totalExportsToUsUsd = selectedFlows.reduce(
      (sum, f) => sum + (f.total_exports_to_us_usd || 0),
      0,
    );
    const currentAgoaExportsUsd = vaultEligible
      ? sumAgoaPreferentialExports(selectedFlows)
      : 0;
    const tariffSavings = sumPreferentialTariffSavings(selectedFlows);
    const eligibleExportBaseUsd = sumEligibleExportBase(selectedFlows);
    const restorationPotentialUsd = vaultEligible
      ? eligibleExportBaseUsd + tariffSavings
      : eligibleExportBaseUsd;

    const uniqueCategories = new Set(
      selectedFlows.map((f) => f.category_group).filter(Boolean),
    );

    const tier = selectedFlows[0]?.data_quality_tier ?? 'B';
    const dataSource =
      tier === 'A'
        ? 'USITC category trade flows'
        : selectedFlows[0]?.source_notes?.includes('Comtrade')
          ? 'UN Comtrade'
          : 'Souvera trade flows (estimated)';

    const trend = years
      .map((y) => ({
        year: y,
        agoaPreferentialUsd: sumAgoaPreferentialExports(
          flows.filter((f) => f.year === y) as AgoaFlowDbRow[],
        ),
      }))
      .filter((t) => t.agoaPreferentialUsd > 0)
      .sort((a, b) => a.year - b.year);

    return {
      totalExportsToUsUsd,
      currentAgoaExportsUsd,
      restorationPotentialUsd,
      eligibleCategories: uniqueCategories.size,
      dataSource,
      dataVintage: selectedYear,
      trend,
    };
  } catch (err) {
    console.error('[fetchAgoaMetrics] Error:', err);
    return null;
  }
}

/** Build per-country metrics from in-memory flow rows (no extra DB round-trips). */
export function buildCountryMetricsFromRows(
  iso3: string,
  rows: Array<AgoaFlowDbRow & { iso3: string }>,
  vaultEligible: boolean,
  year?: number,
): {
  restorationPotentialUsd: number;
  currentTariffSavingsUsd: number;
  currentAgoaExportsUsd: number;
} {
  const iso = iso3.toUpperCase();
  const filtered = rows.filter((r) => r.iso3 === iso);
  if (filtered.length === 0) {
    return { restorationPotentialUsd: 0, currentTariffSavingsUsd: 0, currentAgoaExportsUsd: 0 };
  }
  const targetYear = year ?? Math.max(...filtered.map((r) => r.year));
  const yearRows = filtered.filter((r) => r.year === targetYear);
  const currentAgoaExportsUsd = vaultEligible ? sumAgoaPreferentialExports(yearRows) : 0;
  const currentTariffSavingsUsd = sumPreferentialTariffSavings(yearRows);
  const eligibleBase = sumEligibleExportBase(yearRows);
  const restorationPotentialUsd = vaultEligible
    ? eligibleBase + currentTariffSavingsUsd
    : eligibleBase;
  return { restorationPotentialUsd, currentTariffSavingsUsd, currentAgoaExportsUsd };
}
