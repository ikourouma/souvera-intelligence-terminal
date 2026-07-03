/**
 * Propagate mfn_tariff_pct across rows sharing the same hs_chapter (DB-only).
 * Does not invent rates — copies from peer rows already ingested with MFN data.
 *
 * Run: npx tsx apps/api-gateway/scripts/propagate-agoa-mfn-by-hs-chapter.ts
 */
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: withMfn, error: mfnErr } = await sb
    .from('souvera_agoa_trade_flows')
    .select('hs_chapter, mfn_tariff_pct')
    .not('mfn_tariff_pct', 'is', null)
    .not('hs_chapter', 'is', null);

  if (mfnErr) throw new Error(mfnErr.message);

  const mfnByChapter = new Map<string, number>();
  for (const row of withMfn ?? []) {
    const ch = String(row.hs_chapter).trim();
    if (ch && !mfnByChapter.has(ch) && row.mfn_tariff_pct != null) {
      mfnByChapter.set(ch, Number(row.mfn_tariff_pct));
    }
  }

  // Peer category MFN (DB-sourced): USITC 14-cat rows inherit from 10-cat peers already in DB.
  const { data: catMfn } = await sb
    .from('souvera_agoa_trade_flows')
    .select('category_group, mfn_tariff_pct')
    .not('mfn_tariff_pct', 'is', null);
  const mfnByCategory = new Map<string, number>();
  for (const row of catMfn ?? []) {
    const cat = String(row.category_group);
    if (!mfnByCategory.has(cat) && row.mfn_tariff_pct != null) {
      mfnByCategory.set(cat, Number(row.mfn_tariff_pct));
    }
  }

  const CATEGORY_MFN_PEER: Record<string, string> = {
    processed_foods: 'agriculture',
    leather: 'footwear',
    forest: 'agriculture',
  };

  let peerUpdated = 0;
  for (const [target, peer] of Object.entries(CATEGORY_MFN_PEER)) {
    const peerMfn = mfnByCategory.get(peer);
    if (peerMfn == null) continue;
    const { error } = await sb
      .from('souvera_agoa_trade_flows')
      .update({ mfn_tariff_pct: peerMfn })
      .eq('category_group', target)
      .is('mfn_tariff_pct', null);
    if (!error) peerUpdated++;
  }

  const { data: missing, error: missErr } = await sb
    .from('souvera_agoa_trade_flows')
    .select('id, hs_chapter, category_group, iso3')
    .is('mfn_tariff_pct', null)
    .not('hs_chapter', 'is', null);

  if (missErr) throw new Error(missErr.message);

  let updated = 0;
  for (const row of missing ?? []) {
    const mfn = mfnByChapter.get(String(row.hs_chapter).trim());
    if (mfn == null) continue;
    const { error } = await sb
      .from('souvera_agoa_trade_flows')
      .update({ mfn_tariff_pct: mfn })
      .eq('id', row.id);
    if (!error) updated++;
  }

  console.log(`\n=== Propagate MFN by HS chapter ===`);
  console.log(`  Chapters with MFN: ${mfnByChapter.size}`);
  console.log(`  Peer category groups updated: ${peerUpdated}`);
  console.log(`  Rows updated (by chapter): ${updated}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
