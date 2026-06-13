/**
 * Phase 0X — Diagnostic for the 10 markets below the ≥15/20 Top 20 gate.
 * Shows exactly which keys are missing in DB and whether WB API has data.
 *
 * Failing markets (from 2026-06-10 audit):
 *   Africa:    SOM (13/20), ERI (8/20),  SSD (11/20)
 *   Caribbean: CUB (12/20), DMA (14/20), GRD (14/20), KNA (14/20),
 *              PRI (13/20), VGB (5/20),  TCA (9/20)
 *
 * Run: npx tsx scripts/diagnose-gap74-markets.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import {
  TOP20_INDICATORS,
  worldBankCountryIndicatorApiUrl,
} from '../src/lib/indicators/top20';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GAP_MARKETS: Array<{ iso3: string; region: 'Africa' | 'Caribbean'; knownScore: number }> = [
  { iso3: 'SOM', region: 'Africa',    knownScore: 13 },
  { iso3: 'ERI', region: 'Africa',    knownScore: 8  },
  { iso3: 'SSD', region: 'Africa',    knownScore: 11 },
  { iso3: 'CUB', region: 'Caribbean', knownScore: 12 },
  { iso3: 'DMA', region: 'Caribbean', knownScore: 14 },
  { iso3: 'GRD', region: 'Caribbean', knownScore: 14 },
  { iso3: 'KNA', region: 'Caribbean', knownScore: 14 },
  { iso3: 'PRI', region: 'Caribbean', knownScore: 13 },
  { iso3: 'VGB', region: 'Caribbean', knownScore: 5  },
  { iso3: 'TCA', region: 'Caribbean', knownScore: 9  },
];

const DATE_RANGE = '2019:2025';

type WbRecord = { date: string; value: number | null };

async function fetchWbSeries(iso2: string, wbCode: string): Promise<WbRecord[]> {
  try {
    const url = worldBankCountryIndicatorApiUrl(iso2, wbCode, DATE_RANGE);
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as [{}, WbRecord[] | null];
    return (data[1] ?? []).filter((r) => r.value != null);
  } catch {
    return [];
  }
}

function wbStatus(records: WbRecord[]): string {
  if (!records.length) return '❌ WB: no data';
  const sorted = [...records].sort((a, b) => Number(b.date) - Number(a.date));
  const latest = sorted[0];
  const recent = records.filter((r) => Number(r.date) >= 2021);
  if (recent.length > 0) return `✅ WB: ${recent.length} obs (latest ${latest.date}=${latest.value?.toFixed(2)})`;
  return `⚠️  WB: only pre-2021 (latest ${latest.date}=${latest.value?.toFixed(2)})`;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log('\n======================================================');
  console.log('  SOUVERA  Phase 0X — Gap Market Diagnostic');
  console.log('  10 markets below ≥15/20 Top 20 threshold');
  console.log('======================================================\n');

  const summary: Array<{ iso3: string; missing: string[]; wbFillable: string[]; noData: string[] }> = [];

  for (const { iso3, region, knownScore } of GAP_MARKETS) {
    const { data: country } = await sb
      .from('souvera_countries')
      .select('id, iso2, name')
      .eq('iso3', iso3)
      .maybeSingle();

    if (!country) {
      console.log(`❌ ${iso3}: country row missing in souvera_countries\n`);
      continue;
    }

    const { data: obs } = await sb
      .from('souvera_country_observations')
      .select('souvera_indicators(key)')
      .eq('country_id', country.id)
      .gte('period_date', '2019-01-01');

    const dbKeys = new Set(
      (obs ?? []).map((o) => (o.souvera_indicators as { key: string } | null)?.key).filter(Boolean)
    );

    const missingDefs = TOP20_INDICATORS.filter((d) => !dbKeys.has(d.indicatorKey));

    console.log(`\n─── ${iso3} (${country.name}) [${region}] — ${knownScore}/20 in DB ───`);
    console.log(`    Present: ${20 - missingDefs.length}/20  |  Missing: ${missingDefs.length}/20\n`);

    const wbFillable: string[] = [];
    const noData: string[] = [];

    for (const def of missingDefs) {
      const wbRecords = await fetchWbSeries(country.iso2 ?? iso3.slice(0, 2), def.worldBankCode);
      const status = wbStatus(wbRecords);
      console.log(`    MISSING  ${def.indicatorKey.padEnd(32)} ${status}`);
      if (wbRecords.length > 0) wbFillable.push(def.indicatorKey);
      else noData.push(def.indicatorKey);
      await new Promise((r) => setTimeout(r, 150));
    }

    summary.push({ iso3, missing: missingDefs.map((d) => d.indicatorKey), wbFillable, noData });
  }

  console.log('\n\n======================================================');
  console.log('  SUMMARY — Gap-fill plan by market');
  console.log('======================================================\n');

  let tier_a: string[] = [];
  let tier_b: string[] = [];
  let tier_c: string[] = [];

  for (const m of summary) {
    const present = 20 - m.missing.length;
    const afterWb = present + m.wbFillable.length;
    const tier = afterWb >= 15 ? 'A/B — fillable ✅' : `C — structural ⚠️  (max ${afterWb}/20)`;
    console.log(`  ${m.iso3}  ${present}/20 → ${afterWb}/20 after WB fill  [${tier}]`);
    if (m.wbFillable.length) console.log(`       WB fillable:  ${m.wbFillable.join(', ')}`);
    if (m.noData.length)    console.log(`       No source:    ${m.noData.join(', ')}`);

    if (afterWb >= 15) {
      if (m.missing.length === 1) tier_a.push(m.iso3);
      else tier_b.push(m.iso3);
    } else {
      tier_c.push(m.iso3);
    }
  }

  console.log('\n------------------------------------------------------');
  console.log(`  Tier A (1 key, close today):   ${tier_a.join(', ') || 'none'}`);
  console.log(`  Tier B (2-4 keys, WB fillable): ${tier_b.join(', ') || 'none'}`);
  console.log(`  Tier C (structural ceiling):    ${tier_c.join(', ') || 'none'}`);
  console.log('------------------------------------------------------\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
