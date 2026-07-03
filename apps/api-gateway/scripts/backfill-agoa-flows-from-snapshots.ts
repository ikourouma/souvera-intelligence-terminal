/**
 * Backfill souvera_agoa_trade_flows from Census trade snapshots when flow rows
 * are missing or all-null but exports_to_us_usd exists.
 *
 * Run: npx tsx apps/api-gateway/scripts/backfill-agoa-flows-from-snapshots.ts
 *      npx tsx apps/api-gateway/scripts/backfill-agoa-flows-from-snapshots.ts --dry-run
 */
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3 } from '../src/lib/market-coverage';
import {
  AGOA_FLOW_CATEGORY_GROUPS,
  AGOA_FLOW_CATEGORY_LABELS,
  type AgoaFlowCategoryGroup,
} from '../src/lib/trade/agoa-flow-categories';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

const DATA_YEAR = 2023;
const DRY_RUN = process.argv.includes('--dry-run');

/** Non-petroleum category weights for proportional split of bilateral total. */
const CATEGORY_WEIGHTS: Record<string, number> = {
  minerals: 0.28,
  agriculture: 0.22,
  textiles_apparel: 0.12,
  vehicles: 0.08,
  chemicals: 0.08,
  machinery: 0.07,
  electronics: 0.05,
  footwear: 0.04,
  handicrafts: 0.03,
  petroleum: 0.03,
};

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: countries } = await sb
    .from('souvera_countries')
    .select('id, iso3, name, region, subregion')
    .in('iso3', [...APPROVED_AFRICA_ISO3]);

  const byIso = new Map((countries ?? []).map((c) => [c.iso3 as string, c]));

  const { data: snaps } = await sb
    .from('souvera_country_trade_snapshots')
    .select('country_id, year, exports_to_us_usd');

  const latestExp = new Map<string, number>();
  for (const s of snaps ?? []) {
    const c = [...byIso.values()].find((x) => x.id === s.country_id);
    if (!c) continue;
    const exp = Number(s.exports_to_us_usd ?? 0);
    if (exp <= 0) continue;
    const prev = latestExp.get(c.iso3 as string) ?? 0;
    if (exp > prev) latestExp.set(c.iso3 as string, exp);
  }

  const { data: flows } = await sb
    .from('souvera_agoa_trade_flows')
    .select('iso3, total_exports_to_us_usd')
    .eq('year', DATA_YEAR);

  const flowSum = new Map<string, number>();
  for (const f of flows ?? []) {
    const iso3 = f.iso3 as string;
    flowSum.set(iso3, (flowSum.get(iso3) ?? 0) + Number(f.total_exports_to_us_usd ?? 0));
  }

  let upserted = 0;
  for (const iso3 of APPROVED_AFRICA_ISO3) {
    const bilateral = latestExp.get(iso3);
    const currentSum = flowSum.get(iso3) ?? 0;
    if (!bilateral || bilateral <= 0) continue;
    if (currentSum >= bilateral * 0.5) continue;

    const meta = byIso.get(iso3);
    if (!meta) continue;

    console.log(`${DRY_RUN ? '[dry-run] ' : ''}${iso3}: snapshot $${(bilateral / 1e6).toFixed(1)}M vs flows $${(currentSum / 1e6).toFixed(1)}M → backfill`);

    for (const cat of AGOA_FLOW_CATEGORY_GROUPS) {
      const weight = CATEGORY_WEIGHTS[cat] ?? 0.05;
      const total = Math.round(bilateral * weight);
      if (total <= 0) continue;

      const payload = {
        iso3,
        country_name: meta.name,
        region: meta.region ?? 'Africa',
        sub_region: meta.subregion ?? '',
        agoa_eligible: false,
        agoa_status: 'suspended',
        year: DATA_YEAR,
        hs_chapter: cat === 'petroleum' ? '27' : '00',
        category_group: cat,
        category_label: AGOA_FLOW_CATEGORY_LABELS[cat as AgoaFlowCategoryGroup],
        total_exports_to_us_usd: total,
        agoa_exports_usd: 0,
        agoa_share_pct: 0,
        non_agoa_exports_usd: total,
        data_quality_tier: 'B',
        source_notes: `Backfilled from Census bilateral snapshot ($${Math.round(bilateral / 1e6)}M total) · pending USITC category disaggregation`,
      };

      if (DRY_RUN) {
        upserted += 1;
        continue;
      }

      const { error } = await sb
        .from('souvera_agoa_trade_flows')
        .upsert(payload, { onConflict: 'iso3,year,category_group' });
      if (!error) upserted += 1;
      else console.error(`  ✗ ${iso3}/${cat}: ${error.message}`);
    }
  }

  console.log(`\n${DRY_RUN ? 'Would upsert' : 'Upserted'} ${upserted} flow rows.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
