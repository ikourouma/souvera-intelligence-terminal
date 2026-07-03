/**
 * Backfill AGOA preferential shares for the 17 markets newly designated AGOA-eligible for 2025.
 *
 * These markets were originally seeded as non-beneficiaries, so every flow row has
 * agoa_share_pct = 0 and agoa_exports_usd = 0. Now that they are AGOA-eligible (per the
 * 2025 Federal Register designation), their preferential exports must be estimated with the
 * SAME methodology already used for the established AGOA markets: a category-level preferential
 * utilization share applied to actual bilateral exports to the U.S. (total_exports_to_us_usd).
 *
 * Methodology:
 *   - Compute the mean agoa_share_pct per category_group across all CURRENTLY-eligible markets
 *     that already carry real (non-zero) shares — this is the observed AGOA utilization model.
 *   - Apply that share to each newly-eligible market's actual total_exports_to_us_usd.
 *   - Petroleum (HS 2709) is excluded from AGOA preferential treatment → share 0.
 *   - agoa_exports_usd = round(total_exports_to_us_usd * share / 100).
 *
 * No bilateral trade totals are altered; only the modeled preferential split is filled.
 * Idempotent (only touches rows where agoa_share_pct = 0 and total_exports_to_us_usd > 0).
 *
 * Run: npx tsx apps/api-gateway/scripts/backfill-agoa-shares-newly-eligible.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const NEWLY_ELIGIBLE = ['CIV','COD','COG','CPV','GMB','GNB','LBR','LSO','MDG','MRT','MWI','RWA','SLE','STP','SWZ','TCD','TGO'];
const EXCLUDED = new Set(['petroleum']);
// No synthetic fallback share — only apply observed category-level shares from eligible markets.

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Observed category preferential-share model from markets that already have real shares.
  const { data: ref } = await sb
    .from('souvera_agoa_trade_flows')
    .select('iso3, category_group, agoa_share_pct')
    .gt('agoa_share_pct', 0)
    .not('iso3', 'in', `(${NEWLY_ELIGIBLE.join(',')})`);

  const acc = new Map<string, { sum: number; n: number }>();
  for (const r of ref ?? []) {
    const cat = r.category_group ?? 'other';
    const e = acc.get(cat) ?? { sum: 0, n: 0 };
    e.sum += Number(r.agoa_share_pct);
    e.n += 1;
    acc.set(cat, e);
  }
  const catShare = new Map<string, number>();
  for (const [cat, { sum, n }] of acc) catShare.set(cat, Math.round((sum / n) * 10) / 10);

  console.log('\n=== Observed AGOA preferential-share model (category mean across eligible markets) ===');
  for (const [cat, share] of [...catShare].sort()) console.log(`  ${cat.padEnd(18)} ${share}%`);

  // 2. Apply to newly-eligible markets' zeroed rows.
  let updated = 0;
  const perMarket = new Map<string, number>();
  for (const iso3 of NEWLY_ELIGIBLE) {
    const { data: rows } = await sb
      .from('souvera_agoa_trade_flows')
      .select('id, category_group, total_exports_to_us_usd, agoa_share_pct, source_notes')
      .eq('iso3', iso3)
      .eq('agoa_share_pct', 0);

    for (const row of rows ?? []) {
      const cat = row.category_group ?? 'other';
      const total = Number(row.total_exports_to_us_usd ?? 0);
      const isPetro = EXCLUDED.has(cat);
      const observedShare = catShare.get(cat);
      if (!isPetro && observedShare == null) continue; // no synthetic fallback when category model absent
      const share = isPetro ? 0 : observedShare!;
      const agoaUsd = isPetro ? 0 : Math.round(total * (share / 100));

      const note = row.source_notes && !row.source_notes.includes('AGOA share modeled')
        ? `${row.source_notes} · AGOA share modeled (2025 designation)`
        : (row.source_notes ?? 'AGOA share modeled (2025 designation)');

      const { error } = await sb
        .from('souvera_agoa_trade_flows')
        .update({ agoa_share_pct: share, agoa_exports_usd: agoaUsd, source_notes: note })
        .eq('id', row.id);
      if (error) { console.log(`  ❌ ${iso3}/${cat}: ${error.message}`); continue; }
      updated += 1;
      perMarket.set(iso3, (perMarket.get(iso3) ?? 0) + agoaUsd);
    }
  }

  console.log(`\n=== Backfilled preferential exports (latest-year sum may differ; multi-year) ===`);
  for (const iso3 of NEWLY_ELIGIBLE) {
    console.log(`  ${iso3}: total modeled AGOA exports across all years = ${(perMarket.get(iso3) ?? 0).toLocaleString()}`);
  }
  console.log(`\nDone. Rows updated: ${updated}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
