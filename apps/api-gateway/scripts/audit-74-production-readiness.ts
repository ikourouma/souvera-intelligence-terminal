/**
 * Production Readiness Audit — All 74 Markets
 *
 * Audits data-layer readiness across all approved markets:
 *  - FX rate indicator coverage (fx_to_usd)
 *  - Sector coverage + Bloomberg-grade field completeness
 *  - News pulse coverage
 *
 * Run: npx tsx apps/api-gateway/scripts/audit-74-production-readiness.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ALL74_ISO3 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  // Resolve all country IDs
  const { data: countries } = await sb
    .from('souvera_countries')
    .select('id, iso3, name')
    .in('iso3', ALL74_ISO3 as unknown as string[]);

  const byIso3 = new Map((countries ?? []).map((c) => [c.iso3, c]));

  // ---------- 1. FX RATE COVERAGE ----------
  console.log('\n=== 1. FX Rate (fx_to_usd) Coverage ===\n');
  const { data: fxObs } = await sb
    .from('souvera_country_observations')
    .select('country_id, value_numeric, souvera_indicators!inner(key)')
    .eq('souvera_indicators.key', 'fx_to_usd');

  const fxByCountry = new Set((fxObs ?? []).map((o) => o.country_id));
  const fxMissing: string[] = [];
  for (const iso3 of ALL74_ISO3) {
    const c = byIso3.get(iso3);
    if (!c || !fxByCountry.has(c.id)) fxMissing.push(iso3);
  }
  console.log(`fx_to_usd present: ${ALL74_ISO3.length - fxMissing.length}/${ALL74_ISO3.length}`);
  console.log(`Missing fx_to_usd: ${fxMissing.join(', ') || 'none'}`);

  // Also check legacy wrong key
  const { data: wrongFx } = await sb
    .from('souvera_country_observations')
    .select('country_id, souvera_indicators!inner(key)')
    .eq('souvera_indicators.key', 'exchange_rate_lcu_per_usd');
  const wrongFxCountries = new Set((wrongFx ?? []).map((o) => o.country_id));
  const wrongFxIso3 = ALL74_ISO3.filter((iso3) => {
    const c = byIso3.get(iso3);
    return c && wrongFxCountries.has(c.id);
  });
  console.log(`Using WRONG key (exchange_rate_lcu_per_usd): ${wrongFxIso3.join(', ') || 'none'}`);

  // ---------- 2. SECTOR COVERAGE + FIELD COMPLETENESS ----------
  console.log('\n=== 2. Sector Coverage & Field Completeness ===\n');
  const { data: sectors, error: secErr } = await sb
    .from('souvera_country_sectors')
    .select(
      'country_id, sector_key, icon_emoji, strength_score, growth_score, attractiveness_score, narrative_short, key_players, teaser, row_status'
    )
    .eq('row_status', 'active');

  if (secErr) {
    console.log(`SECTOR QUERY ERROR (schema mismatch?): ${secErr.message}`);
  } else {
    const total = sectors?.length ?? 0;
    let withEmoji = 0;
    let withScores = 0;
    let withNarrative = 0;
    let withStructuredPlayers = 0;
    let withStringPlayers = 0;
    const sectorsByCountry = new Map<string, number>();

    for (const s of sectors ?? []) {
      sectorsByCountry.set(s.country_id, (sectorsByCountry.get(s.country_id) ?? 0) + 1);
      if (s.icon_emoji) withEmoji++;
      if (s.strength_score != null && s.growth_score != null && s.attractiveness_score != null)
        withScores++;
      if (s.narrative_short) withNarrative++;
      const kp = s.key_players as unknown;
      if (Array.isArray(kp) && kp.length > 0) {
        if (typeof kp[0] === 'object') withStructuredPlayers++;
        else if (typeof kp[0] === 'string') withStringPlayers++;
      }
    }

    console.log(`Total active sector rows: ${total}`);
    console.log(`  with icon_emoji:            ${withEmoji}/${total}`);
    console.log(`  with all 3 scores:          ${withScores}/${total}`);
    console.log(`  with narrative_short:       ${withNarrative}/${total}`);
    console.log(`  with structured key_players:${withStructuredPlayers}/${total}`);
    console.log(`  with STRING key_players:    ${withStringPlayers}/${total} (need conversion)`);

    // Markets with < expected sectors
    const lowSectorMarkets: string[] = [];
    for (const iso3 of ALL74_ISO3) {
      const c = byIso3.get(iso3);
      const count = c ? sectorsByCountry.get(c.id) ?? 0 : 0;
      if (count < 5) lowSectorMarkets.push(`${iso3}(${count})`);
    }
    console.log(`\nMarkets with <5 sectors: ${lowSectorMarkets.join(', ') || 'none'}`);
  }

  // ---------- 3. NEWS PULSE COVERAGE ----------
  console.log('\n=== 3. News Pulse Coverage ===\n');
  const { data: news } = await sb
    .from('souvera_country_news_signals')
    .select('country_id, status, sentiment_score, risk_intensity, opportunity_intensity');

  const publishedCountries = new Set(
    (news ?? [])
      .filter((n) => n.status === 'published')
      .map((n) => n.country_id)
  );
  const newsMissing: string[] = [];
  for (const iso3 of ALL74_ISO3) {
    const c = byIso3.get(iso3);
    if (!c || !publishedCountries.has(c.id)) newsMissing.push(iso3);
  }
  console.log(`Published news pulse: ${ALL74_ISO3.length - newsMissing.length}/${ALL74_ISO3.length}`);
  console.log(`Missing news pulse (${newsMissing.length}): ${newsMissing.join(', ') || 'none'}`);

  console.log('\n=== Audit Complete ===\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
