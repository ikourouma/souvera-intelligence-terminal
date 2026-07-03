/**
 * Phase 2.5 — Data provenance audit (74 markets × headline macro indicators).
 * Flags observations without resolvable source keys.
 *
 * Run: npx tsx apps/api-gateway/scripts/audit-data-provenance.ts
 */
import { createClient } from '@supabase/supabase-js';
import { SOURCE_REGISTRY } from '../src/data/source-registry';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

const COVERED = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];
const HEADLINE_KEYS = [
  'gdp_current_usd',
  'gdp_growth_pct',
  'population_total',
  'inflation_cpi_pct',
  'fdi_net_inflows_usd',
  'official_exchange_rate',
];

const REGISTRY_KEYS = new Set(SOURCE_REGISTRY.map((s) => s.sourceKey));

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: countries } = await sb.from('souvera_countries').select('id, iso3').in('iso3', COVERED);
  const countryByIso = new Map((countries ?? []).map((c) => [c.iso3, c.id]));

  const { data: indicators } = await sb.from('souvera_indicators').select('id, key').in('key', HEADLINE_KEYS);
  const indByKey = new Map((indicators ?? []).map((i) => [i.key, i.id]));

  const { data: sources } = await sb.from('souvera_data_sources').select('id, key');
  const sourceKeyById = new Map((sources ?? []).map((s) => [s.id, s.key as string]));

  const orphans: string[] = [];
  const missingSource: string[] = [];
  let checked = 0;

  for (const iso of COVERED) {
    const countryId = countryByIso.get(iso);
    if (!countryId) continue;

    for (const indKey of HEADLINE_KEYS) {
      const indId = indByKey.get(indKey);
      if (!indId) continue;

      const { data: obs } = await sb
        .from('souvera_country_observations')
        .select('source_id, is_estimate')
        .eq('country_id', countryId)
        .eq('indicator_id', indId)
        .order('period_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      checked++;
      if (!obs) continue;

      if (!obs.source_id) {
        missingSource.push(`${iso}/${indKey}: observation has null source_id`);
        continue;
      }

      const srcKey = sourceKeyById.get(obs.source_id);
      if (!srcKey) {
        orphans.push(`${iso}/${indKey}: unknown source_id ${obs.source_id}`);
      } else if (!REGISTRY_KEYS.has(srcKey)) {
        orphans.push(`${iso}/${indKey}: source "${srcKey}" not in runtime registry`);
      }
    }
  }

  console.log('\n=== Phase 2.5 Data Provenance Audit ===\n');
  console.log(`Markets: ${COVERED.length} · Headline cells checked: ${checked}`);
  console.log(`Missing source_id: ${missingSource.length}`);
  console.log(`Orphan/unregistered sources: ${orphans.length}`);

  const failures = [...missingSource, ...orphans];
  if (failures.length === 0) {
    console.log('\n✅ PASS — all populated headline observations have registry-aligned sources\n');
    process.exit(0);
  }

  console.log(`\n⚠️  ${failures.length} provenance gap(s) (null observations are OK):\n`);
  for (const f of failures.slice(0, 30)) console.log(`  • ${f}`);
  process.exit(failures.length > 50 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
