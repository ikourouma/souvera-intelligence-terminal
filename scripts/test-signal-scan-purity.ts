/**
 * Self-test: Signal scan + momentum band purity for NGA, JAM, and KEN.
 * Run: npx tsx scripts/test-signal-scan-purity.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { buildSignalScan, assertSignalScanPurity } from '../apps/api-gateway/src/lib/intelligence/country-signal-scan';
import {
  resolveMomentum,
  getMomentumBand,
  assertMomentumBandPurity,
} from '../apps/api-gateway/src/lib/intelligence/momentum';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const NGA_MARKERS = ['reform momentum', 'agoa', 'naira', 'tinubu', 'ecowas', 'tech/fintech'];
const JAM_MARKERS = ['caribbean gateway', 'kingston', 'caricom', 'cbi', 'tourism recovery', 'nearshore'];
const KEN_MARKERS = ['east africa hub', 'm-pesa', 'agoa', 'mombasa', 'eac', 'fintech', 'cbk'];
const NGA_FORBIDDEN_ON_JAM = ['reform momentum', 'nigeria', 'naira', 'agoa', 'ecowas', 'tinubu', 'lagos'];
const JAM_FORBIDDEN_ON_NGA = ['caribbean gateway', 'jamaica', 'kingston corridor', 'caricom', 'cbi', 'tourism recovery', 'nearshore', 'boj'];
const KEN_FORBIDDEN = ['nigeria', 'naira', 'tinubu', 'lagos', 'jamaica', 'kingston', 'caricom', 'cbi', 'jam-dex', 'point lisas'];

function checkMarkers(iso3: string, text: string, required: string[], forbidden: string[]): string[] {
  const lower = text.toLowerCase();
  const errors: string[] = [];
  for (const f of forbidden) {
    if (lower.includes(f)) errors.push(`${iso3}: forbidden marker "${f}" found`);
  }
  const hitRequired = required.some((r) => lower.includes(r));
  if (!hitRequired) errors.push(`${iso3}: expected at least one of [${required.join(', ')}]`);
  return errors;
}

async function testCountry(iso3: string): Promise<string[]> {
  const errors: string[] = [];

  const { data: country } = await supabase
    .from('souvera_countries')
    .select('id, iso3, name')
    .eq('iso3', iso3)
    .maybeSingle();

  if (!country) return [`${iso3}: country not found`];

  const { data: profile } = await supabase
    .from('souvera_country_profiles')
    .select('signal_level, economic_momentum, investor_readiness')
    .eq('country_id', country.id)
    .maybeSingle();

  const { data: signal } = await supabase
    .from('souvera_country_signal_scores')
    .select('signal_level, investment_score, growth_score')
    .eq('country_id', country.id)
    .maybeSingle();

  const { data: lite } = await supabase
    .from('souvera_country_lite_v')
    .select('gdp_growth_pct')
    .eq('iso3', iso3)
    .maybeSingle();

  const { data: pro } = await supabase
    .from('souvera_country_professional_v')
    .select('fdi_net_inflows_usd, inflation_cpi_pct')
    .eq('iso3', iso3)
    .maybeSingle();

  const { data: sectors } = await supabase
    .from('souvera_country_sectors')
    .select('sector_label, strength_score')
    .eq('country_id', country.id)
    .eq('row_status', 'active')
    .order('strength_score', { ascending: false })
    .limit(1);

  const metrics = {
    gdp_growth_annual_pct: lite?.gdp_growth_pct ?? undefined,
    fdi_net_inflows_current_usd: pro?.fdi_net_inflows_usd ?? undefined,
    inflation_consumer_prices_annual_pct: pro?.inflation_cpi_pct ?? undefined,
  };

  const signalLevel =
    (profile?.signal_level as string) ?? (signal?.signal_level as string) ?? 'emerging';

  const scan = buildSignalScan({
    iso3,
    signalLevel,
    metrics,
    topSectorLabel: sectors?.[0]?.sector_label ?? null,
  });

  const resolved = resolveMomentum({
    profileMomentum: profile?.economic_momentum,
    profileReadiness: profile?.investor_readiness,
    investmentScore: signal?.investment_score,
    growthScore: signal?.growth_score,
    gdpGrowthPct: metrics.gdp_growth_annual_pct ?? null,
  });

  const band = getMomentumBand(resolved.economicMomentum, iso3);

  try {
    assertSignalScanPurity(iso3, scan);
    assertMomentumBandPurity(iso3, band);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e));
  }

  const scanText = `${scan.badge} ${scan.bullets.join(' ')}`;
  const bandText = `${band.label} ${band.clause ?? ''}`;

  console.log(`\n── ${iso3} (${country.name}) ──`);
  console.log('  Signal scan:', scan.badge);
  scan.bullets.forEach((b) => console.log('    •', b));
  console.log('  Momentum band:', `${band.label}${band.clause ? ` — ${band.clause}` : ''}`);
  console.log('  Index:', resolved.economicMomentum, '| Readiness:', resolved.investorReadiness);

  if (iso3 === 'NGA') {
    errors.push(...checkMarkers(iso3, scanText + bandText, NGA_MARKERS, JAM_FORBIDDEN_ON_NGA));
  } else if (iso3 === 'JAM') {
    errors.push(...checkMarkers(iso3, scanText + bandText, JAM_MARKERS, NGA_FORBIDDEN_ON_JAM));
  } else if (iso3 === 'KEN') {
    errors.push(...checkMarkers(iso3, scanText + bandText, KEN_MARKERS, KEN_FORBIDDEN));
  }

  return errors;
}

async function main() {
  console.log('🧪 Signal scan purity self-test (NGA + JAM + KEN)\n');

  const allErrors: string[] = [];
  for (const iso of ['NGA', 'JAM', 'KEN']) {
    allErrors.push(...(await testCountry(iso)));
  }

  console.log('\n' + '═'.repeat(50));
  if (allErrors.length === 0) {
    console.log('✅ All purity checks passed — no cross-country contamination.');
    process.exit(0);
  } else {
    console.log('❌ Failures:');
    allErrors.forEach((e) => console.log('  -', e));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
