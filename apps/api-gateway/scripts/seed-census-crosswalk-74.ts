/**
 * Build + seed Census CTY_CODE crosswalk for all 74 Souvera markets.
 * Resolves codes from live Census API country names (Schedule C via intltrade API).
 *
 * Run: npx tsx apps/api-gateway/scripts/seed-census-crosswalk-74.ts
 */
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

const ALL_74 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3] as string[];

/** Territories not in intltrade country breakdown — Schedule C reference codes. */
const MANUAL_CENSUS_CODES: Record<string, string> = {
  PRI: '9030', // Puerto Rico — U.S. possession; not in standard import partner list
};

/** ISO3 → Census CTY_NAME aliases when API name ≠ WDI name. */
const NAME_ALIASES: Record<string, string[]> = {
  COD: ['DEMOCRATIC REPUBLIC OF THE CONGO'],
  COG: ['CONGO'],
  CIV: ["COTE D'IVOIRE", "CÔTE D'IVOIRE", 'IVORY COAST'],
  GMB: ['GAMBIA, THE', 'THE GAMBIA'],
  STP: ['SAO TOME AND PRINCIPE', 'SÃO TOMÉ AND PRÍNCIPE'],
  SWZ: ['ESWATINI', 'SWAZILAND'],
  TZA: ['TANZANIA, UNITED REPUBLIC OF', 'TANZANIA'],
  BHS: ['BAHAMAS, THE', 'THE BAHMAS', 'BAHAMAS'],
  VGB: ['BRITISH VIRGIN ISLANDS'],
  TCA: ['TURKS AND CAICOS ISLANDS'],
  CYM: ['CAYMAN ISLANDS'],
  KNA: ['SAINT KITTS AND NEVIS', 'ST KITTS AND NEVIS'],
  LCA: ['SAINT LUCIA', 'ST LUCIA'],
  VCT: ['SAINT VINCENT AND THE GRENADINES', 'ST VINCENT AND THE GRENADINES'],
  ATG: ['ANTIGUA AND BARBUDA'],
  DOM: ['DOMINICAN REPUBLIC'],
  DMA: ['DOMINICA'],
  GRD: ['GRENADA'],
  PRI: ['PUERTO RICO'],
  CPV: ['CABO VERDE', 'CAPE VERDE'],
  GNQ: ['EQUATORIAL GUINEA'],
  BFA: ['BURKINA FASO'],
  CAF: ['CENTRAL AFRICAN REPUBLIC'],
  SSD: ['SOUTH SUDAN'],
};

/** WDI / display names for matching (uppercase). */
const ISO3_DISPLAY: Record<string, string> = {
  DZA: 'ALGERIA', AGO: 'ANGOLA', BEN: 'BENIN', BWA: 'BOTSWANA', BFA: 'BURKINA FASO',
  BDI: 'BURUNDI', CPV: 'CABO VERDE', CMR: 'CAMEROON', CAF: 'CENTRAL AFRICAN REPUBLIC',
  TCD: 'CHAD', COM: 'COMOROS', COG: 'CONGO',
  CIV: "COTE D'IVOIRE",
  DJI: 'DJIBOUTI', EGY: 'EGYPT', GNQ: 'EQUATORIAL GUINEA', ERI: 'ERITREA',
  SWZ: 'ESWATINI', ETH: 'ETHIOPIA', GAB: 'GABON', GMB: 'GAMBIA', GHA: 'GHANA',
  GIN: 'GUINEA', GNB: 'GUINEA-BISSAU', KEN: 'KENYA', LSO: 'LESOTHO', LBR: 'LIBERIA',
  LBY: 'LIBYA', MDG: 'MADAGASCAR', MWI: 'MALAWI', MLI: 'MALI', MRT: 'MAURITANIA',
  MUS: 'MAURITIUS', MAR: 'MOROCCO', MOZ: 'MOZAMBIQUE', NAM: 'NAMIBIA', NER: 'NIGER',
  NGA: 'NIGERIA', RWA: 'RWANDA', STP: 'SAO TOME AND PRINCIPE', SEN: 'SENEGAL',
  SYC: 'SEYCHELLES', SLE: 'SIERRA LEONE', SOM: 'SOMALIA', ZAF: 'SOUTH AFRICA',
  SSD: 'SOUTH SUDAN', SDN: 'SUDAN', TZA: 'TANZANIA', TGO: 'TOGO', TUN: 'TUNISIA',
  UGA: 'UGANDA', ZMB: 'ZAMBIA', ZWE: 'ZIMBABWE',
  ATG: 'ANTIGUA AND BARBUDA', BHS: 'BAHAMAS', BRB: 'BARBADOS', CUB: 'CUBA',
  DMA: 'DOMINICA', DOM: 'DOMINICAN REPUBLIC', GRD: 'GRENADA', HTI: 'HAITI',
  JAM: 'JAMAICA', KNA: 'SAINT KITTS AND NEVIS', LCA: 'SAINT LUCIA',
  VCT: 'SAINT VINCENT AND THE GRENADINES', SUR: 'SURINAME', TTO: 'TRINIDAD AND TOBAGO',
  GUY: 'GUYANA', BLZ: 'BELIZE', PRI: 'PUERTO RICO', VGB: 'BRITISH VIRGIN ISLANDS',
  TCA: 'TURKS AND CAICOS ISLANDS', CYM: 'CAYMAN ISLANDS',
};

function norm(s: string): string {
  return s
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchCensusNameMap(apiKey: string): Promise<Map<string, string>> {
  const maps = new Map<string, string>();
  for (const flow of ['imports', 'exports'] as const) {
    const r = await fetch(
      `https://api.census.gov/data/timeseries/intltrade/${flow}/enduse?get=CTY_CODE,CTY_NAME&time=2024&key=${apiKey}`
    );
    const j = (await r.json()) as string[][];
    for (const row of j.slice(1)) {
      const code = row[0]?.trim();
      const name = row[1]?.trim();
      if (!code || !name || code.startsWith('00') || code === '-') continue;
      if (code.length === 4 && /^\d{4}$/.test(code)) maps.set(code, name);
    }
  }
  return maps;
}

function buildNameToCode(codeToName: Map<string, string>): Map<string, string> {
  const nameToCode = new Map<string, string>();
  for (const [code, name] of codeToName) {
    const n = norm(name);
    if (!nameToCode.has(n)) nameToCode.set(n, code);
  }
  return nameToCode;
}

function matchIsoToCode(iso3: string, nameToCode: Map<string, string>): { code: string; name: string } | null {
  if (MANUAL_CENSUS_CODES[iso3]) {
    return { code: MANUAL_CENSUS_CODES[iso3], name: ISO3_DISPLAY[iso3] ?? iso3 };
  }

  const candidates = [
    ...(NAME_ALIASES[iso3] ?? []).map(norm),
    norm(ISO3_DISPLAY[iso3] ?? ''),
  ].filter(Boolean);

  for (const c of candidates) {
    const code = nameToCode.get(c);
    if (code) return { code, name: c };
  }

  return null;
}

export async function seedCensusCrosswalk74(): Promise<void> {
  const apiKey =
    process.env.CENSUS_API_KEY ??
    (await import('fs')).readFileSync('.env.local', 'utf8').match(/CENSUS_API_KEY\s*=\s*(\S+)/)?.[1];
  if (!apiKey) throw new Error('CENSUS_API_KEY not found');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase credentials missing');

  console.log('\n=== Census Crosswalk 74 — build from live API ===\n');

  const codeToName = await fetchCensusNameMap(apiKey);
  const nameToCode = buildNameToCode(codeToName);
  console.log(`Census API country codes loaded: ${codeToName.size}`);

  const resolved: Array<{ iso3: string; censusCode: string; censusName: string }> = [];
  const unmatched: string[] = [];

  for (const iso3 of ALL_74) {
    const hit = matchIsoToCode(iso3, nameToCode);
    if (hit) resolved.push({ iso3, censusCode: hit.code, censusName: hit.name });
    else unmatched.push(iso3);
  }

  console.log(`Matched: ${resolved.length}/74`);
  if (unmatched.length) {
    console.log('Unmatched:', unmatched.join(', '));
  }

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  let updated = 0;
  let failed = 0;

  for (const { iso3, censusCode } of resolved) {
    const { error } = await sb
      .from('souvera_countries')
      .update({ census_code: censusCode })
      .eq('iso3', iso3);
    if (error) {
      console.error(`  ✗ ${iso3}: ${error.message}`);
      failed++;
    } else {
      updated++;
    }
  }

  const { count } = await sb
    .from('souvera_countries')
    .select('id', { count: 'exact', head: true })
    .in('iso3', ALL_74)
    .not('census_code', 'is', null);

  console.log(`\nDB updated: ${updated} rows (${failed} failed)`);
  console.log(`Census codes in DB for 74 markets: ${count ?? '?'}/74\n`);

  if (unmatched.length > 0 || failed > 0) throw new Error('Crosswalk seed incomplete');
}

seedCensusCrosswalk74().catch((e) => {
  console.error(e);
  process.exit(1);
});
