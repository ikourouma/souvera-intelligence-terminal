/**
 * Check currency_code + signal/momentum coverage for the 8 non-AGOA SSA/North-Africa markets.
 * Read-only. npx tsx scripts/audit-country-currency-signal.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ISO3 = ['MAR', 'DZA', 'TUN', 'LBY', 'SDN', 'BDI', 'ERI', 'GNQ'];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: countries } = await sb
    .from('souvera_countries')
    .select('id, iso3, name, currency_code')
    .in('iso3', ISO3);

  console.log('\n=== currency_code coverage ===');
  for (const iso3 of ISO3) {
    const c = countries?.find((x) => x.iso3 === iso3);
    console.log(`${iso3}: currency_code=${c?.currency_code ?? 'NULL'} (${c?.name ?? '?'})`);
  }

  const ids = new Map((countries ?? []).map((c) => [c.id, c.iso3]));

  console.log('\n=== souvera_country_signal_scores coverage ===');
  const { data: sig, error: sigErr } = await sb
    .from('souvera_country_signal_scores')
    .select('country_id, signal_level, investment_score, confidence_score, growth_score')
    .in('country_id', Array.from(ids.keys()));
  if (sigErr) console.log(`signal query error: ${sigErr.message}`);
  for (const iso3 of ISO3) {
    const cid = (countries ?? []).find((c) => c.iso3 === iso3)?.id;
    const m = (sig ?? []).find((x) => x.country_id === cid);
    console.log(`${iso3}: ${m ? `level=${m.signal_level} inv=${m.investment_score} conf=${m.confidence_score} growth=${m.growth_score}` : 'NO signal_scores row'}`);
  }

  console.log('\n=== souvera_country_profiles momentum/readiness coverage ===');
  const { data: prof, error: profErr } = await sb
    .from('souvera_country_profiles')
    .select('country_id, signal_level, economic_momentum, investor_readiness')
    .in('country_id', Array.from(ids.keys()));
  if (profErr) console.log(`profile query error: ${profErr.message}`);
  for (const iso3 of ISO3) {
    const cid = (countries ?? []).find((c) => c.iso3 === iso3)?.id;
    const m = (prof ?? []).find((x) => x.country_id === cid);
    console.log(`${iso3}: ${m ? `level=${m.signal_level} mom=${m.economic_momentum} readiness=${m.investor_readiness}` : 'NO profile row'}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
