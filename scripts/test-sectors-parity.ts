/**
 * Verify NGA + JAM + KEN Sectors tab data parity before 74-country scale-out.
 * Run: npx tsx scripts/test-sectors-parity.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const REQUIRED_FIELDS = ['teaser', 'strength_score', 'growth_score', 'narrative_short', 'key_players'] as const;
const MIN_SECTORS = 5;

const JAM_FORBIDDEN = ['nigeria', 'naira', 'agoa restoration', 'flutterwave', 'dangote', 'ecowas', 'tinubu', 'lagos fintech', 'm-pesa', 'mombasa port', 'standard gauge railway'];
const NGA_FORBIDDEN = ['jamaica', 'kingston corridor', 'caricom', 'cbi export', 'jam-dex', 'blue mountain coffee', 'boj ', 'm-pesa', 'mombasa port'];
const KEN_FORBIDDEN = ['nigeria', 'naira', 'tinubu', 'lagos fintech', 'dangote', 'flutterwave', 'ecowas', 'jamaica', 'caricom', 'cbi export', 'jam-dex', 'blue mountain', 'agoa restoration', 'noranda', 'ncb financial'];

async function loadSectors(iso3: string) {
  const { data: country } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', iso3)
    .maybeSingle();

  if (!country) return { country: null, sectors: [], errors: [`${iso3}: country not found`] };

  const { data: sectors, error } = await supabase
    .from('souvera_country_sectors')
    .select('*')
    .eq('country_id', country.id)
    .eq('row_status', 'active')
    .order('display_order');

  if (error) return { country, sectors: [], errors: [`${iso3}: ${error.message}`] };

  return { country, sectors: sectors ?? [], errors: [] as string[] };
}

function checkSector(iso3: string, sector: Record<string, unknown>, errors: string[]): void {
  const key = sector.sector_key as string;
  const label = sector.sector_label as string;

  for (const field of REQUIRED_FIELDS) {
    const val = sector[field];
    if (val == null || val === '' || (Array.isArray(val) && val.length === 0)) {
      errors.push(`${iso3}/${key}: missing ${field}`);
    }
  }

  if (sector.attractiveness_score == null) {
    errors.push(`${iso3}/${key}: missing attractiveness_score`);
  }

  const tradeText = String(sector.agoa_opportunity ?? '').toLowerCase();
  const bodyText = `${sector.teaser} ${sector.narrative_short} ${tradeText}`.toLowerCase();

  if (iso3 === 'JAM') {
    if (!tradeText.includes('cbi')) {
      errors.push(`${iso3}/${key}: trade block should reference CBI, not AGOA-only`);
    }
    if (tradeText.includes('agoa restoration')) {
      errors.push(`${iso3}/${key}: contains AGOA restoration (NGA copy)`);
    }
    for (const m of JAM_FORBIDDEN) {
      if (bodyText.includes(m)) errors.push(`${iso3}/${key}: forbidden marker "${m}"`);
    }
  }

  if (iso3 === 'NGA') {
    if (tradeText && !tradeText.includes('agoa') && sector.agoa_export_potential_usd) {
      errors.push(`${iso3}/${key}: trade block should reference AGOA`);
    }
    for (const m of NGA_FORBIDDEN) {
      if (bodyText.includes(m)) errors.push(`${iso3}/${key}: forbidden marker "${m}"`);
    }
  }

  if (iso3 === 'KEN') {
    if (!tradeText.includes('agoa')) {
      errors.push(`${iso3}/${key}: trade block should reference AGOA`);
    }
    if (tradeText.includes('cbi')) {
      errors.push(`${iso3}/${key}: contains CBI (JAM copy)`);
    }
    for (const m of KEN_FORBIDDEN) {
      if (bodyText.includes(m)) errors.push(`${iso3}/${key}: forbidden marker "${m}"`);
    }
  }

  console.log(`  ✓ ${iso3} ${key}: ${label} (S${sector.strength_score}/G${sector.growth_score})`);
}

async function main() {
  console.log('🧪 Sectors tab parity test (NGA + JAM + KEN)\n');
  const allErrors: string[] = [];

  for (const iso3 of ['NGA', 'JAM', 'KEN']) {
    const { country, sectors, errors } = await loadSectors(iso3);
    allErrors.push(...errors);

    if (!country) continue;

    console.log(`\n── ${iso3} (${country.name}) — ${sectors.length} sectors ──`);

    if (sectors.length < MIN_SECTORS) {
      allErrors.push(`${iso3}: expected ≥${MIN_SECTORS} sectors, got ${sectors.length}`);
    }

    for (const s of sectors) {
      checkSector(iso3, s, allErrors);
    }
  }

  console.log('\n' + '═'.repeat(50));
  if (allErrors.length === 0) {
    console.log('✅ NGA + JAM + KEN sectors parity passed — ready for scale-out gate.');
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
