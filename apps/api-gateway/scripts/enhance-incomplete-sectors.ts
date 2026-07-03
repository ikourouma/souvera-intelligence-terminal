/**
 * Enhance any active sector row that is missing Bloomberg-grade fields:
 *  - icon_emoji (assigned by sector_key keyword)
 *  - strength/growth/attractiveness scores (baseline if null)
 *  - key_players converted from string[] to structured objects
 *
 * Targets curated-but-incomplete rows (e.g. early Zimbabwe seed) without
 * touching rows that are already complete.
 *
 * Run: npx tsx apps/api-gateway/scripts/enhance-incomplete-sectors.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function emojiFor(sectorKey: string, label: string): string {
  const k = `${sectorKey} ${label}`.toLowerCase();
  if (/(min|mineral|metal|lithium|platinum|gold)/.test(k)) return '⛏️';
  if (/(agri|farm|food|tobacco|crop)/.test(k)) return '🌾';
  if (/(energy|power|electric|renewable|solar|oil|gas)/.test(k)) return '⚡';
  if (/(manufact|textile|apparel|industrial)/.test(k)) return '🏭';
  if (/(tour|hospitality|hotel|travel)/.test(k)) return '🏨';
  if (/(digital|tech|telecom|ict|data)/.test(k)) return '📡';
  if (/(logistic|trade|port|freight|transport)/.test(k)) return '🚢';
  if (/(fintech|finance|bank|payment)/.test(k)) return '💳';
  return '🏢';
}

function toStructuredPlayers(
  raw: unknown,
  label: string
): Array<{ name: string; sector: string; description: string; metric: string }> | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  if (typeof raw[0] === 'object') return null; // already structured
  return (raw as string[]).map((name) => ({
    name: String(name),
    sector: label,
    description: `Key participant in the ${label.toLowerCase()} value chain`,
    metric: 'Sector anchor',
  }));
}

async function main() {
  console.log('\n=== Enhance incomplete sectors ===\n');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: sectors, error } = await sb
    .from('souvera_country_sectors')
    .select(
      'id, sector_key, sector_label, icon_emoji, strength_score, growth_score, attractiveness_score, key_players'
    )
    .eq('row_status', 'active');
  if (error) throw new Error(error.message);

  let updated = 0;
  for (const s of sectors ?? []) {
    const patch: Record<string, unknown> = {};

    if (!s.icon_emoji) patch.icon_emoji = emojiFor(s.sector_key, s.sector_label);
    if (s.strength_score == null) patch.strength_score = 62;
    if (s.growth_score == null) patch.growth_score = 60;
    if (s.attractiveness_score == null) patch.attractiveness_score = 61;

    const structured = toStructuredPlayers(s.key_players, s.sector_label);
    if (structured) patch.key_players = structured;

    if (Object.keys(patch).length === 0) continue;

    const { error: upErr } = await sb
      .from('souvera_country_sectors')
      .update(patch)
      .eq('id', s.id);
    if (upErr) {
      console.log(`  ❌ ${s.sector_key}: ${upErr.message}`);
    } else {
      updated++;
      console.log(`  ✅ ${s.sector_label} (${Object.keys(patch).join(', ')})`);
    }
  }

  console.log(`\n✅ Enhanced ${updated} sector rows.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
