/**
 * Build SDM export product rows from AGOA/CBTPA category flow DB rows.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '@/lib/market-coverage';
import {
  categoriesForSdmSector,
  labelForCategory,
} from '@/lib/intelligence/sdm-category-map';
import type { MatrixCell, SdmExportProduct, SdmProductSource } from '@/lib/intelligence/supply-demand-types';

type FlowRow = {
  iso3: string;
  category_group: string;
  total_exports_to_us_usd?: number | null;
  trade_with_us_usd?: number | null;
  year: number;
};

function flowUsd(row: FlowRow): number {
  return Number(row.total_exports_to_us_usd ?? row.trade_with_us_usd ?? 0);
}

function filterLatestYearByIso(rows: FlowRow[]): FlowRow[] {
  const maxYear = new Map<string, number>();
  for (const r of rows) {
    const iso = String(r.iso3).toUpperCase();
    const y = r.year as number;
    maxYear.set(iso, Math.max(maxYear.get(iso) ?? 0, y));
  }
  return rows.filter((r) => r.year === maxYear.get(String(r.iso3).toUpperCase()));
}

function topProductsFromCategoryTotals(
  totals: Map<string, number>,
  source: SdmProductSource,
): SdmExportProduct[] {
  const entries = [...totals.entries()]
    .filter(([, usd]) => usd > 0)
    .sort((a, b) => b[1] - a[1]);
  const sum = entries.reduce((s, [, v]) => s + v, 0);
  if (sum <= 0) return [];

  return entries.slice(0, 3).map(([cat, valueUsd]) => ({
    name: labelForCategory(cat),
    valueUsd,
    sharePct: Math.round((valueUsd / sum) * 1000) / 10,
    source,
    categoryGroup: cat,
  }));
}

function aggregateForCell(
  iso3: string,
  sectorKey: string,
  byIsoCat: Map<string, number>,
  source: SdmProductSource,
): SdmExportProduct[] {
  const cats = categoriesForSdmSector(sectorKey);
  const totals = new Map<string, number>();
  for (const cat of cats) {
    const usd = byIsoCat.get(`${iso3}:${cat}`) ?? 0;
    if (usd > 0) totals.set(cat, (totals.get(cat) ?? 0) + usd);
  }
  return topProductsFromCategoryTotals(totals, source);
}

function buildIsoCatMap(rows: FlowRow[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of filterLatestYearByIso(rows)) {
    const iso = String(r.iso3).toUpperCase();
    const key = `${iso}:${r.category_group}`;
    map.set(key, (map.get(key) ?? 0) + flowUsd(r));
  }
  return map;
}

export async function attachSdmExportProducts(
  cells: MatrixCell[],
  supabase: SupabaseClient,
  dataYear: number,
): Promise<MatrixCell[]> {
  if (!cells.length) return cells;

  const years = [dataYear, dataYear - 1, dataYear - 2];
  const iso3s = [...new Set(cells.map((c) => c.iso3.toUpperCase()))];
  const africaSet = new Set<string>(APPROVED_AFRICA_ISO3 as unknown as string[]);
  const caribbeanSet = new Set<string>(APPROVED_CARIBBEAN_ISO3 as unknown as string[]);

  const [{ data: agoaRows }, { data: cbtpaRows }] = await Promise.all([
    supabase
      .from('souvera_agoa_trade_flows')
      .select('iso3, category_group, total_exports_to_us_usd, year')
      .in('iso3', iso3s)
      .in('year', years)
      .limit(10000),
    supabase
      .from('souvera_cbtpa_trade_flows')
      .select('iso3, category_group, trade_with_us_usd, year')
      .eq('direction', 'exports')
      .in('iso3', iso3s)
      .in('year', years)
      .limit(10000),
  ]);

  const agoaByIsoCat = buildIsoCatMap((agoaRows ?? []) as FlowRow[]);
  const cbtpaByIsoCat = buildIsoCatMap((cbtpaRows ?? []) as FlowRow[]);

  return cells.map((cell) => {
    const iso = cell.iso3.toUpperCase();
    let products: SdmExportProduct[] = [];
    if (africaSet.has(iso)) {
      products = aggregateForCell(iso, cell.sector_key, agoaByIsoCat, 'usitc');
    } else if (caribbeanSet.has(iso)) {
      products = aggregateForCell(iso, cell.sector_key, cbtpaByIsoCat, 'cbtpa');
    }
    if (!products.length) return cell;
    return {
      ...cell,
      export_products: products,
      export_products_source: products[0]?.source ?? 'template',
    };
  });
}
