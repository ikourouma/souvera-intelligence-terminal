/**
 * Verify USTR trade-summary infra (source registry + summary table).
 * Run migration SQL if this script reports missing objects.
 *
 * Run: npx tsx apps/api-gateway/scripts/bootstrap-ustr-trade-summaries.ts
 */
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log('\n=== USTR trade summary infra check ===\n');

  const { data: dirSource, error: dirErr } = await sb
    .from('souvera_data_sources')
    .select('key, name')
    .eq('key', 'ustr_africa_directory')
    .maybeSingle();
  if (dirErr) console.error('souvera_data_sources query error:', dirErr.message);
  else if (dirSource) console.log('✅ Ingestion source ustr_africa_directory registered');
  else {
    console.log('❌ ustr_africa_directory missing — run create-external-reference-links.sql first');
  }

  const { data: summarySource } = await sb
    .from('souvera_data_sources')
    .select('key, name')
    .eq('key', 'ustr_country_trade_summary')
    .maybeSingle();
  if (summarySource) console.log('✅ Registry source ustr_country_trade_summary present');
  else console.log('ℹ️  ustr_country_trade_summary not in registry (optional — job uses ustr_africa_directory)');

  const { error: tableErr } = await sb.from('souvera_ustr_trade_summaries').select('iso3').limit(1);
  if (tableErr?.message?.includes('does not exist') || tableErr?.code === '42P01') {
    console.log('\n❌ Table souvera_ustr_trade_summaries MISSING');
    console.log('\nApply in Supabase SQL Editor:');
    console.log('  infra/supabase/migrations/create-ustr-trade-summaries.sql\n');
    process.exit(1);
  }
  if (tableErr) {
    console.error('\n❌ Table probe failed:', tableErr.message);
    process.exit(1);
  }

  const { count } = await sb
    .from('souvera_ustr_trade_summaries')
    .select('*', { count: 'exact', head: true });
  console.log(`✅ Table souvera_ustr_trade_summaries exists (${count ?? 0} rows)`);

  const { count: linkCount } = await sb
    .from('souvera_external_reference_links')
    .select('*', { count: 'exact', head: true })
    .eq('ref_type', 'USTR_COUNTRY_PAGE')
    .not('entity_key', 'is', null);
  console.log(`✅ USTR country page links: ${linkCount ?? 0}`);
  if (!linkCount) {
    console.log('\n⚠️  Run parse:ustr:africa_directory before parse:ustr:africa_country_summaries\n');
  } else {
    console.log('\nReady. Run:');
    console.log(
      '  npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts parse:ustr:africa_country_summaries\n'
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
