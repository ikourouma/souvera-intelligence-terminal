/**
 * Seed AfCETA corridor opportunity signals from AfCFTA, CBTPA, and import demand data.
 *
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/seed-afceta-corridor-signals.ts
 */
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '@/lib/market-coverage';
import { AFCETA_SPOTLIGHT_PAIRS } from '@/lib/intelligence/afceta-spotlights';
import { AFCETA_SHARED_CATEGORIES } from '@/lib/intelligence/afceta-types';
import { loadAfcetaSourceMaps } from '@/lib/intelligence/afceta-corridor-data-loader';
import {
  buildCorridorRow,
  capacityKey,
  demandForCategory,
} from '@/lib/intelligence/afceta-corridor-engine';

loadProjectEnv();

const DATA_YEAR = 2023;
const CATEGORY_KEYS = Object.keys(AFCETA_SHARED_CATEGORIES);

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { africaCapacity, caribbeanCapacity, demandByIsoGroup } = await loadAfcetaSourceMaps(sb, DATA_YEAR);

  const rows: ReturnType<typeof buildCorridorRow>[] = [];
  const seen = new Set<string>();

  function addRow(
    origin: string,
    dest: string,
    direction: 'africa_to_caribbean' | 'caribbean_to_africa',
    category: string,
    tier: 'A' | 'B' | 'C',
    spotlight: boolean,
  ) {
    const key = `${origin}:${dest}:${direction}:${category}`;
    if (seen.has(key)) return;
    seen.add(key);

    const capacityMap = direction === 'africa_to_caribbean' ? africaCapacity : caribbeanCapacity;
    const capacity = capacityMap.get(capacityKey(origin, category)) ?? 0;
    const demand = demandForCategory(demandByIsoGroup, dest, category);
    if (capacity <= 0 && demand <= 0) return;

    rows.push(
      buildCorridorRow({
        origin_iso3: origin,
        dest_iso3: dest,
        direction,
        category_group: category,
        origin_capacity_usd: capacity || demand * 0.15,
        dest_demand_usd: demand || capacity * 0.15,
        data_quality_tier: tier,
        is_spotlight: spotlight,
        data_year: DATA_YEAR,
      }),
    );
  }

  // Tier-A spotlights
  for (const pair of AFCETA_SPOTLIGHT_PAIRS) {
    for (const cat of pair.categories) {
      addRow(pair.origin_iso3, pair.dest_iso3, pair.direction, cat, 'A', true);
    }
  }

  // Tier-C computed: top exporters × top importers per category
  for (const cat of CATEGORY_KEYS) {
    const topAfrican = [...APPROVED_AFRICA_ISO3]
      .map((iso) => ({ iso, cap: africaCapacity.get(capacityKey(iso, cat)) ?? 0 }))
      .filter((x) => x.cap > 0)
      .sort((a, b) => b.cap - a.cap)
      .slice(0, 5);

    const topCaribbeanDemand = [...APPROVED_CARIBBEAN_ISO3]
      .map((iso) => ({ iso, dem: demandForCategory(demandByIsoGroup, iso, cat) }))
      .filter((x) => x.dem > 0)
      .sort((a, b) => b.dem - a.dem)
      .slice(0, 5);

    for (const o of topAfrican) {
      for (const d of topCaribbeanDemand) {
        addRow(o.iso, d.iso, 'africa_to_caribbean', cat, 'C', false);
      }
    }

    const topCaribbean = [...APPROVED_CARIBBEAN_ISO3]
      .map((iso) => ({ iso, cap: caribbeanCapacity.get(capacityKey(iso, cat)) ?? 0 }))
      .filter((x) => x.cap > 0)
      .sort((a, b) => b.cap - a.cap)
      .slice(0, 5);

    const topAfricaDemand = [...APPROVED_AFRICA_ISO3]
      .map((iso) => ({ iso, dem: demandForCategory(demandByIsoGroup, iso, cat) }))
      .filter((x) => x.dem > 0)
      .sort((a, b) => b.dem - a.dem)
      .slice(0, 5);

    for (const o of topCaribbean) {
      for (const d of topAfricaDemand) {
        addRow(o.iso, d.iso, 'caribbean_to_africa', cat, 'C', false);
      }
    }
  }

  const { error: delErr } = await sb.from('souvera_afceta_corridor_signals').delete().eq('data_year', DATA_YEAR);
  if (delErr && !delErr.message.includes('does not exist')) {
    console.warn('[seed] delete warning:', delErr.message);
  }

  const BATCH = 100;
  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await sb.from('souvera_afceta_corridor_signals').upsert(batch, {
      onConflict: 'origin_iso3,dest_iso3,direction,category_group,data_year',
    });
    if (error) throw new Error(`Upsert: ${error.message}`);
    upserted += batch.length;
  }

  const spotlights = rows.filter((r) => r.is_spotlight).length;
  console.log(`\n[AfCETA seed] Upserted ${upserted} corridor signals (${spotlights} spotlights) for ${DATA_YEAR}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
