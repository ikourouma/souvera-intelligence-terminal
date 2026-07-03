/**
 * Seed fx_to_usd for all 74 markets that are missing it.
 *
 * Provides curated ~2024 reference exchange rates (local currency units per USD)
 * so the Economy tab FX Rate card and Professional view never show "data pending".
 * Rates are approximate annual-average references from central banks / IMF and are
 * marked as estimates (quality 0.75). Markets that already have an fx_to_usd
 * observation are skipped to preserve higher-fidelity ingested data.
 *
 * Run: npx tsx apps/api-gateway/scripts/seed-all74-fx.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ALL74_ISO3 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];

const FX_YEAR = 2024;

/** Curated ~2024 reference rate: local currency units per 1 USD. */
const FX_RATES: Record<string, number> = {
  // North Africa
  MAR: 9.9, DZA: 134, TUN: 3.1, LBY: 4.8, EGY: 48, SDN: 600,
  // West Africa
  NGA: 1550, GHA: 15, SEN: 600, MLI: 600, BFA: 600, NER: 600, GIN: 8600,
  SLE: 22, LBR: 190, CIV: 600, TGO: 600, BEN: 600, GMB: 68, GNB: 600,
  CPV: 108, MRT: 39,
  // East Africa
  ETH: 115, KEN: 129, TZA: 2600, UGA: 3700, RWA: 1350, BDI: 2900, SOM: 571,
  DJI: 178, ERI: 15, MDG: 4500, COM: 450, MUS: 46, SYC: 13.5, SSD: 1300,
  // Central Africa
  CMR: 600, CAF: 600, COD: 2800, COG: 600, GAB: 600, GNQ: 600, STP: 22,
  TCD: 600, AGO: 910,
  // Southern Africa
  ZAF: 18.5, BWA: 13.5, LSO: 18.5, SWZ: 18.5, NAM: 18.5, ZWE: 24.4,
  MOZ: 64, ZMB: 26, MWI: 1730,
  // Caribbean
  ATG: 2.7, BHS: 1.0, BRB: 2.0, CUB: 120, DMA: 2.7, DOM: 59, GRD: 2.7,
  HTI: 132, JAM: 156, KNA: 2.7, LCA: 2.7, VCT: 2.7, SUR: 35, TTO: 6.8,
  GUY: 209, BLZ: 2.0, PRI: 1.0, VGB: 1.0, TCA: 1.0, CYM: 0.83,
};

async function main() {
  console.log('\n=== Seed fx_to_usd for all 74 markets ===\n');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  // Resolve fx_to_usd indicator id
  const { data: ind } = await sb
    .from('souvera_indicators')
    .select('id, key')
    .eq('key', 'fx_to_usd')
    .maybeSingle();
  if (!ind) throw new Error('fx_to_usd indicator not found in souvera_indicators');
  const fxIndicatorId = ind.id;

  // Resolve / create curated data source
  let sourceId: string;
  const { data: src } = await sb
    .from('souvera_data_sources')
    .select('id')
    .eq('key', 'curated_fx_reference')
    .maybeSingle();
  if (src) {
    sourceId = src.id;
  } else {
    const { data: newSrc, error: srcErr } = await sb
      .from('souvera_data_sources')
      .insert({
        key: 'curated_fx_reference',
        name: 'Curated FX Reference Rates (Central Bank / IMF, 2024)',
        domain: 'imf.org',
        provider_url: 'https://www.imf.org',
        source_status: 'approved',
        priority_rank: 90,
        is_active: true,
      })
      .select('id')
      .single();
    if (srcErr || !newSrc) throw new Error(`Failed to create source: ${srcErr?.message}`);
    sourceId = newSrc.id;
  }

  // Country lookup
  const { data: countries } = await sb
    .from('souvera_countries')
    .select('id, iso3')
    .in('iso3', ALL74_ISO3 as unknown as string[]);
  const byIso3 = new Map((countries ?? []).map((c) => [c.iso3, c.id]));

  // Existing fx coverage
  const { data: existing } = await sb
    .from('souvera_country_observations')
    .select('country_id, souvera_indicators!inner(key)')
    .eq('souvera_indicators.key', 'fx_to_usd');
  const haveFx = new Set((existing ?? []).map((o) => o.country_id));

  let seeded = 0;
  let skipped = 0;
  let missingCountry = 0;

  for (const iso3 of ALL74_ISO3) {
    const countryId = byIso3.get(iso3);
    if (!countryId) {
      console.log(`  ⚠️  ${iso3}: country row missing`);
      missingCountry++;
      continue;
    }
    if (haveFx.has(countryId)) {
      skipped++;
      continue;
    }
    const rate = FX_RATES[iso3];
    if (rate == null) {
      console.log(`  ⚠️  ${iso3}: no curated rate defined`);
      continue;
    }
    const { error } = await sb.from('souvera_country_observations').upsert(
      {
        country_id: countryId,
        indicator_id: fxIndicatorId,
        period_date: `${FX_YEAR}-01-01`,
        period_type: 'annual',
        value_numeric: rate,
        source_id: sourceId,
        source_series_key: 'curated_fx_2024',
        is_forecast: false,
        is_estimate: true,
        quality_score: 0.75,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: 'country_id,indicator_id,period_date,source_id' }
    );
    if (error) {
      console.log(`  ❌ ${iso3}: ${error.message}`);
    } else {
      seeded++;
    }
  }

  console.log(`\n✅ Seeded fx_to_usd: ${seeded}`);
  console.log(`↩️  Skipped (already had fx): ${skipped}`);
  if (missingCountry) console.log(`⚠️  Missing country rows: ${missingCountry}`);
  console.log('\nDone.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
