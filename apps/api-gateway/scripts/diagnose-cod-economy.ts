/**
 * Focused diagnostic: why does COD's economy/overview render as "missing"?
 * Read-only. Prints COD's per-year headline observations AND what the two views
 * (lite / professional) return, so we can tell a DATA gap from a RENDER-LOGIC gap.
 *
 * Run: npx tsx apps/api-gateway/scripts/diagnose-cod-economy.ts [ISO3]
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ISO3 = (process.argv[2] || 'COD').toUpperCase();
const KEYS = ['gdp_current_usd', 'gdp_growth_pct', 'population_total', 'inflation_cpi_pct', 'fdi_net_inflows_usd', 'official_exchange_rate'];

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: country } = await sb.from('souvera_countries').select('id, iso3, name').eq('iso3', ISO3).maybeSingle();
  if (!country) { console.error(`No country ${ISO3}`); process.exit(1); }
  console.log(`\n=== ${ISO3} (${country.name}) · country_id=${country.id} ===`);

  const { data: inds } = await sb.from('souvera_indicators').select('id, key').in('key', KEYS);
  const idToKey = new Map((inds ?? []).map((i) => [String(i.id), String(i.key)]));

  const { data: obs } = await sb
    .from('souvera_country_observations')
    .select('indicator_id, period_date, value_numeric, period_type')
    .eq('country_id', country.id)
    .eq('period_type', 'annual')
    .in('indicator_id', (inds ?? []).map((i) => i.id));

  // Build year → key → value grid.
  const grid = new Map<number, Record<string, number | null>>();
  for (const o of obs ?? []) {
    const key = idToKey.get(String(o.indicator_id));
    if (!key) continue;
    const yr = Number(String(o.period_date).slice(0, 4));
    if (!grid.has(yr)) grid.set(yr, {});
    grid.get(yr)![key] = o.value_numeric;
  }

  console.log('\nYear  | GDP            | Growth | Pop         | Inflation | FDI            | FX');
  console.log('------|----------------|--------|-------------|-----------|----------------|--------');
  for (const yr of [...grid.keys()].sort()) {
    const g = grid.get(yr)!;
    const f = (v: number | null | undefined, d = 0) => (v == null ? '—'.padStart(12) : v.toLocaleString('en-US', { maximumFractionDigits: d }).padStart(12));
    console.log(
      `${yr}  | ${f(g.gdp_current_usd)} | ${(g.gdp_growth_pct ?? '—').toString().padStart(6)} | ${f(g.population_total)} | ${(g.inflation_cpi_pct ?? '—').toString().padStart(9)} | ${f(g.fdi_net_inflows_usd)} | ${(g.official_exchange_rate ?? '—').toString().padStart(6)}`
    );
  }

  // What do the views return?
  const { data: lite } = await sb.from('souvera_country_lite_v').select('gdp_current_usd, gdp_growth_pct, population_total').eq('iso3', ISO3).maybeSingle();
  const { data: pro } = await sb.from('souvera_country_professional_v').select('fdi_net_inflows_usd, inflation_cpi_pct, fx_to_usd').eq('iso3', ISO3).maybeSingle();
  console.log('\n=== View outputs (headline metrics surfaced to Overview snapshot) ===');
  console.log('  souvera_country_lite_v        :', JSON.stringify(lite));
  console.log('  souvera_country_professional_v:', JSON.stringify(pro));

  // Replicate getLatestCompleteMacroYear (needs growth+FDI+inflation in same year).
  const years = [...grid.keys()].sort();
  const complete = [...years].reverse().find((y) => {
    const g = grid.get(y)!;
    return g.gdp_growth_pct != null && g.fdi_net_inflows_usd != null && g.inflation_cpi_pct != null;
  });
  console.log(`\n=== Economy-tab "latest complete macro year" (growth+FDI+inflation all present) ===`);
  console.log(`  -> ${complete ?? 'NONE — falls back to last year ' + (years[years.length - 1] ?? 'n/a')}`);
  console.log('');
}

main().catch((e) => { console.error(e); process.exit(1); });
