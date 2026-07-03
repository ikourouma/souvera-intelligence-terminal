/**
 * Vet FX-rate currency coverage across all 74 approved markets.
 * Each market's Executive Snapshot FX Rate unit is derived from souvera_countries.currency_code,
 * so every approved market must have a valid (non-null, sensible) currency_code.
 *
 * Read-only. Run: npx tsx apps/api-gateway/scripts/audit-all74-fx-currency.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const APPROVED = [
  ...(APPROVED_AFRICA_ISO3 as unknown as string[]),
  ...(APPROVED_CARIBBEAN_ISO3 as unknown as string[]),
];

// ISO 4217 3-letter code shape (allow USD-using markets too)
const ISO4217 = /^[A-Z]{3}$/;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: rows } = await sb
    .from('souvera_countries')
    .select('iso3, name, currency_code')
    .in('iso3', APPROVED);

  const byIso3 = new Map((rows ?? []).map((r) => [r.iso3, r]));

  const missing: string[] = [];
  const malformed: string[] = [];
  const ok: Array<{ iso3: string; code: string }> = [];

  for (const iso3 of APPROVED) {
    const r = byIso3.get(iso3);
    const code = (r?.currency_code ?? '').trim().toUpperCase();
    if (!r) { missing.push(`${iso3} (no country row)`); continue; }
    if (!code) { missing.push(`${iso3} (${r.name})`); continue; }
    if (!ISO4217.test(code)) { malformed.push(`${iso3}=${code} (${r.name})`); continue; }
    ok.push({ iso3, code });
  }

  console.log(`\n=== FX Currency Coverage — ${APPROVED.length} approved markets ===\n`);
  console.log(`OK: ${ok.length}/${APPROVED.length}`);
  console.log(`\nMISSING currency_code (${missing.length}):`);
  console.log(missing.length ? '  ' + missing.join('\n  ') : '  none');
  console.log(`\nMALFORMED currency_code (${malformed.length}):`);
  console.log(malformed.length ? '  ' + malformed.join('\n  ') : '  none');

  // Show full pair preview so a human can eyeball correctness
  console.log('\n=== FX pair preview (CODE/USD) ===');
  for (const { iso3, code } of ok) console.log(`  ${iso3}: ${code}/USD`);
}

main().catch((e) => { console.error(e); process.exit(1); });
