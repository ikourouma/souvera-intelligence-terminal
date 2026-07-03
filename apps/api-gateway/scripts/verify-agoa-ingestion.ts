/**
 * Post-ingestion verification of souvera_agoa_trade_flows after the live USITC pull.
 * Read-only. Prints per-market AGOA-preferential vs total for the latest year, the
 * eligibility flags, and flags any obvious anomalies (AGOA > total, missing chapters).
 *
 * Run: npx tsx apps/api-gateway/scripts/verify-agoa-ingestion.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const FOCUS = ['COD', 'LSO', 'ETH', 'KEN', 'NGA', 'ZAF', 'MDG'];

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Paginate past Supabase's 1000-row default cap.
  const rows: Array<Record<string, unknown>> = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from('souvera_agoa_trade_flows')
      .select('iso3, year, category_group, agoa_eligible, agoa_status, total_exports_to_us_usd, agoa_exports_usd, hs_chapter')
      .range(from, from + PAGE - 1);
    if (error) { console.error(error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }

  const years = [...new Set(rows.map((r) => r.year))].sort();
  const latest = years[years.length - 1];
  console.log(`\nTotal rows: ${rows.length} · years: ${years.join(', ')} · latest: ${latest}\n`);

  // Anomaly checks.
  const agoaGtTotal = rows.filter((r) => Number(r.agoa_exports_usd) > Number(r.total_exports_to_us_usd) + 1);
  const missingChapter = rows.filter((r) => !r.hs_chapter);
  console.log(`Anomalies — AGOA>total: ${agoaGtTotal.length} · missing hs_chapter: ${missingChapter.length}\n`);

  // Focus markets, latest year.
  console.log('=== Focus markets (latest year) ===');
  for (const iso3 of FOCUS) {
    const mk = rows.filter((r) => r.iso3 === iso3 && r.year === latest);
    if (!mk.length) { console.log(`  ${iso3}: no rows`); continue; }
    const total = mk.reduce((s, r) => s + Number(r.total_exports_to_us_usd || 0), 0);
    const agoa = mk.reduce((s, r) => s + Number(r.agoa_exports_usd || 0), 0);
    const elig = mk[0].agoa_eligible;
    const status = mk[0].agoa_status;
    const util = total > 0 ? ((agoa / total) * 100).toFixed(1) : '0';
    console.log(
      `  ${iso3.padEnd(4)} eligible=${String(elig).padEnd(5)} status=${String(status).padEnd(12)} ` +
      `AGOA $${(agoa / 1e6).toFixed(1)}M / total $${(total / 1e6).toFixed(1)}M (${util}% util) · ${mk.length} cats`
    );
  }

  // COD trend across all years (the market we scrutinized).
  console.log('\n=== COD trend (all years) ===');
  for (const y of years) {
    const mk = rows.filter((r) => r.iso3 === 'COD' && r.year === y);
    const total = mk.reduce((s, r) => s + Number(r.total_exports_to_us_usd || 0), 0);
    const agoa = mk.reduce((s, r) => s + Number(r.agoa_exports_usd || 0), 0);
    console.log(`  ${y}: AGOA $${(agoa / 1e6).toFixed(1)}M / total $${(total / 1e6).toFixed(1)}M`);
  }
  console.log('');
}

main().catch((e) => { console.error(e); process.exit(1); });
