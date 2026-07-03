/**
 * AGOA / CBI statutory petroleum exclusion — single source of truth for narratives and metrics.
 * HTS Chapter 27 (crude + refined petroleum) is ineligible for duty-free preferences under both programs.
 */

import { getCountryRegion } from './country-overview-content';
import { isApprovedCaribbeanMarket } from '../market-coverage';

/** Category groups excluded from preferential export sums in the country API. */
export const PREFERENTIAL_EXCLUDED_CATEGORY_GROUPS = new Set(['petroleum']);

export type PreferentialFramework = 'agoa' | 'cbi';

export function resolvePreferentialFramework(iso3: string): PreferentialFramework {
  return isApprovedCaribbeanMarket(iso3.toUpperCase()) || getCountryRegion(iso3) === 'caribbean'
    ? 'cbi'
    : 'agoa';
}

export function preferentialFrameworkLabel(iso3: string): string {
  return resolvePreferentialFramework(iso3) === 'cbi' ? 'CBI/CBTPA' : 'AGOA';
}

/** One-line UI footnote for Trade tab and sector cards. */
export function petroleumExclusionFootnote(iso3: string): string {
  const fw = preferentialFrameworkLabel(iso3);
  return `Crude petroleum and petroleum products (HTS Ch. 27) are excluded from ${fw} duty-free preferences. Bilateral Census totals include all goods at MFN rates; preferential export figures exclude petroleum.`;
}

/** Short clause for Overview / market-access paragraphs. */
export function petroleumExclusionClause(iso3: string): string {
  const fw = preferentialFrameworkLabel(iso3);
  return `Qualifying non-petroleum exports only — crude and refined petroleum are excluded from ${fw} preferences.`;
}

/** Sector-level note when the sector is energy/petroleum. */
export function petroleumSectorNote(iso3: string): string {
  const fw = preferentialFrameworkLabel(iso3);
  return `Energy and petroleum exports may appear in U.S. bilateral trade totals but do not receive ${fw} duty-free treatment. SOUVERA tracks petroleum separately from preferential export potential.`;
}

/** Whether a sector key/label represents petroleum or broader energy excluded from preferences. */
export function isPetroleumOrEnergySector(sectorKey?: string, sectorLabel?: string): boolean {
  const key = (sectorKey ?? '').toLowerCase();
  const label = (sectorLabel ?? '').toLowerCase();
  return (
    key === 'petroleum' ||
    key === 'energy' ||
    key.includes('petroleum') ||
    key.includes('energy') ||
    label.includes('petroleum') ||
    label.includes('oil & gas') ||
    label.includes('oil and gas')
  );
}

/** Phase 3 trade intelligence — product-level petroleum filter requirement. */
export const TRADE_INTELLIGENCE_PETROLEUM_RULES = {
  /** Census / bilateral totals: include petroleum (MFN). */
  bilateralTotals: 'include_all_goods',
  /** AGOA/CBI preferential metrics, SDM cells, Product Finder: exclude HTS 27. */
  preferentialMetrics: 'exclude_hts_chapter_27',
  /** Sector agoa_export_* fields for energy/petroleum: show MFN only, not preferential. */
  sectorPreferentialFields: 'mfn_only_for_energy',
} as const;
