/**
 * Shared loader for AfCETA corridor source maps (AfCFTA, CBTPA, import demand).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { capacityKey } from '@/lib/intelligence/afceta-corridor-engine';

export interface AfcetaSourceMaps {
  africaCapacity: Map<string, number>;
  caribbeanCapacity: Map<string, number>;
  demandByIsoGroup: Map<string, number>;
}

const cache = new Map<number, { maps: AfcetaSourceMaps; loadedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function loadAfcetaSourceMaps(
  supabase: SupabaseClient,
  year: number,
): Promise<AfcetaSourceMaps> {
  const cached = cache.get(year);
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) {
    return cached.maps;
  }

  const { data: afcftaExports, error: afcErr } = await supabase
    .from('souvera_afcfta_trade_flows')
    .select('iso3, category_group, total_trade_usd')
    .eq('direction', 'exports')
    .eq('year', year);
  if (afcErr) throw new Error(`AfCFTA: ${afcErr.message}`);

  const { data: cbtpaExports, error: cbtErr } = await supabase
    .from('souvera_cbtpa_trade_flows')
    .select('iso3, category_group, trade_with_us_usd')
    .eq('direction', 'exports')
    .eq('year', year);
  if (cbtErr) throw new Error(`CBTPA: ${cbtErr.message}`);

  const { data: demandRows, error: demErr } = await supabase
    .from('souvera_import_demand_signals')
    .select('category_group, total_imports_usd, souvera_countries!inner(iso3, region)')
    .eq('year', year);
  if (demErr) throw new Error(`Demand: ${demErr.message}`);

  const africaCapacity = new Map<string, number>();
  for (const r of afcftaExports ?? []) {
    const k = capacityKey(r.iso3, r.category_group);
    africaCapacity.set(k, (africaCapacity.get(k) ?? 0) + (r.total_trade_usd ?? 0));
  }

  const caribbeanCapacity = new Map<string, number>();
  for (const r of cbtpaExports ?? []) {
    const k = capacityKey(r.iso3, r.category_group);
    caribbeanCapacity.set(k, (caribbeanCapacity.get(k) ?? 0) + (r.trade_with_us_usd ?? 0));
  }

  const demandByIsoGroup = new Map<string, number>();
  for (const r of demandRows ?? []) {
    const countries = r.souvera_countries as unknown as { iso3: string } | { iso3: string }[];
    const iso = Array.isArray(countries) ? countries[0]?.iso3 : countries.iso3;
    if (!iso) continue;
    const k = `${iso}:${r.category_group}`;
    demandByIsoGroup.set(k, (demandByIsoGroup.get(k) ?? 0) + (r.total_imports_usd ?? 0));
  }

  const maps = { africaCapacity, caribbeanCapacity, demandByIsoGroup };
  cache.set(year, { maps, loadedAt: Date.now() });
  return maps;
}
