/**
 * Attach country import volume (U.S. → country) to SDM matrix cells.
 * Sector-scoped from import demand signals; bilateral fallback from Census snapshots.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MatrixCell } from '@/lib/intelligence/supply-demand-types';

/** Import demand category_group → SDM sector_key(s) */
export const SDM_SECTOR_IMPORT_GROUPS: Record<string, string[]> = {
  agriculture_food: ['grains', 'fertilizers', 'intermediate'],
  manufacturing_textiles: ['machinery', 'cotton', 'textiles_inputs'],
  energy_power: ['intermediate'],
  mining_minerals: ['machinery', 'intermediate'],
  digital_infrastructure: ['machinery'],
  fintech_finance: ['pharma', 'machinery'],
  logistics_trade: ['transport', 'machinery'],
  tourism_hospitality: ['transport', 'intermediate'],
};

type ImportRow = {
  category_group: string;
  category_label: string;
  imports_from_us_usd: number | null;
  year: number;
  souvera_countries: { iso3: string } | { iso3: string }[] | null;
};

function resolveIso3(row: ImportRow): string | null {
  const c = row.souvera_countries;
  if (!c) return null;
  const country = Array.isArray(c) ? c[0] : c;
  return country?.iso3?.toUpperCase() ?? null;
}

export async function attachSdmCountryImportVolume(
  cells: MatrixCell[],
  supabase: SupabaseClient,
  dataYear: number,
): Promise<MatrixCell[]> {
  if (!cells.length) return cells;

  const years = [dataYear, dataYear - 1, dataYear - 2];

  const [{ data: importRows }, { data: snapshots }] = await Promise.all([
    supabase
      .from('souvera_import_demand_signals')
      .select('category_group, category_label, imports_from_us_usd, year, souvera_countries(iso3)')
      .in('year', years),
    supabase
      .from('souvera_country_trade_snapshots')
      .select('imports_from_us_usd, year, souvera_countries(iso3)')
      .in('year', years)
      .order('year', { ascending: false }),
  ]);

  const sectorImportByIso = new Map<string, { usd: number; topLabel: string; topUsd: number }>();
  for (const row of (importRows ?? []) as ImportRow[]) {
    const iso = resolveIso3(row);
    if (!iso) continue;
    const usd = Number(row.imports_from_us_usd ?? 0);
    if (usd <= 0) continue;

    for (const [sectorKey, groups] of Object.entries(SDM_SECTOR_IMPORT_GROUPS)) {
      if (!groups.includes(row.category_group)) continue;
      const key = `${iso}:${sectorKey}`;
      const prev = sectorImportByIso.get(key) ?? { usd: 0, topLabel: '', topUsd: 0 };
      prev.usd += usd;
      if (usd > prev.topUsd) {
        prev.topUsd = usd;
        prev.topLabel = row.category_label;
      }
      sectorImportByIso.set(key, prev);
    }
  }

  const censusImportByIso = new Map<string, number>();
  for (const s of snapshots ?? []) {
    const iso = (s.souvera_countries as { iso3?: string } | null)?.iso3?.toUpperCase();
    if (!iso || censusImportByIso.has(iso)) continue;
    censusImportByIso.set(iso, Number(s.imports_from_us_usd ?? 0));
  }

  return cells.map((cell) => {
    const iso = cell.iso3.toUpperCase();
    const sectorData = sectorImportByIso.get(`${iso}:${cell.sector_key}`);
    const censusTotal = censusImportByIso.get(iso) ?? 0;

    return {
      ...cell,
      country_imports_from_us_usd: sectorData?.usd ?? censusTotal,
      country_sector_imports_from_us_usd: sectorData?.usd ?? null,
      country_top_import_product: sectorData?.topLabel ?? null,
      country_bilateral_imports_from_us_usd: censusTotal > 0 ? censusTotal : null,
    };
  });
}
