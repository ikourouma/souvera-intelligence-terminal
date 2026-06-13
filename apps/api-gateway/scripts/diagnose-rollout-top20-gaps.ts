/**
 * Diagnose Top 20 observation gaps for rollout markets (DB vs World Bank API).
 * Run from apps/api-gateway: npx tsx scripts/diagnose-rollout-top20-gaps.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import {
  TOP20_INDICATORS,
  worldBankCountryIndicatorApiUrl,
} from '../src/lib/indicators/top20';
import { ALL_ROLLOUT_ISO3 } from '../src/lib/intelligence/rollout-manifest';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TARGET_ISO3 = ['NGA', 'JAM', 'TTO', 'BRB'] as const;
const DATE_RANGE = '2018:2025';

type WbRecord = {
  date: string;
  value: number | null;
};

async function fetchWbRecent(iso2: string, code: string): Promise<WbRecord[]> {
  const url = worldBankCountryIndicatorApiUrl(iso2, code, DATE_RANGE);
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as [{}, WbRecord[] | null];
  return (data[1] ?? []).filter((r) => r.value != null);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  for (const iso3 of TARGET_ISO3) {
    const { data: country } = await sb
      .from('souvera_countries')
      .select('id, iso2, name')
      .eq('iso3', iso3)
      .maybeSingle();

    if (!country?.iso2) {
      console.log(`\n❌ ${iso3}: country row missing`);
      continue;
    }

    console.log(`\n=== ${iso3} (${country.name}) ===`);

    const { data: obs } = await sb
      .from('souvera_country_observations')
      .select('period_date, souvera_indicators(key)')
      .eq('country_id', country.id)
      .gte('period_date', '2020-01-01');

    const dbKeys = new Set(
      (obs ?? []).map((o) => (o.souvera_indicators as { key: string } | null)?.key).filter(Boolean)
    );

    const missing = TOP20_INDICATORS.filter((d) => !dbKeys.has(d.indicatorKey));
    console.log(`DB Top20 present: ${TOP20_INDICATORS.length - missing.length}/20`);

    for (const def of missing) {
      const wb = await fetchWbRecent(country.iso2, def.worldBankCode);
      const recent = wb.filter((r) => Number(r.date) >= 2020);
      const latest = wb.sort((a, b) => Number(b.date) - Number(a.date))[0];
      const status =
        recent.length > 0
          ? `WB has ${recent.length} obs 2020+ (latest ${latest?.date}=${latest?.value})`
          : wb.length > 0
            ? `WB only pre-2020 (latest ${latest?.date})`
            : 'WB no data';
      console.log(`  ${def.indicatorKey}: ${status}`);
      await new Promise((r) => setTimeout(r, 200));
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
