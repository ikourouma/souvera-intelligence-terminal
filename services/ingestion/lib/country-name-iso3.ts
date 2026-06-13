/**
 * Country / territory display name → ISO3 for verification parsers.
 */

import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../../../apps/api-gateway/src/lib/market-coverage';
import { countryDisplayName } from '../../../apps/api-gateway/src/lib/intelligence/country-names';

const AFRICA_NAMES: Record<string, string> = {};
for (const iso3 of APPROVED_AFRICA_ISO3) {
  AFRICA_NAMES[normalizeName(countryDisplayName(iso3))] = iso3;
}

const CARIBBEAN_NAMES: Record<string, string> = {
  ...buildCaribbeanAliases(),
};

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[’']/g, "'")
    .trim();
}

function buildCaribbeanAliases(): Record<string, string> {
  const out: Record<string, string> = {};
  const aliases: Record<string, string[]> = {
    PRI: ['puerto rico'],
    VGB: ['british virgin islands', 'virgin islands (british)'],
    TCA: ['turks and caicos islands'],
    CYM: ['cayman islands'],
    ABW: ['aruba'],
    BHS: ['bahamas', 'the bahamas'],
    BRB: ['barbados'],
    BLZ: ['belize'],
    DMA: ['dominica'],
    DOM: ['dominican republic'],
    GRD: ['grenada'],
    GUY: ['guyana'],
    HTI: ['haiti'],
    JAM: ['jamaica'],
    LCA: ['saint lucia', 'st. lucia', 'st lucia'],
    SUR: ['suriname'],
    TTO: ['trinidad and tobago'],
    ATG: ['antigua and barbuda'],
    KNA: ['saint kitts and nevis', 'st. kitts and nevis'],
    VCT: ['saint vincent and the grenadines', 'st. vincent and the grenadines'],
    CUB: ['cuba'],
  };
  for (const iso3 of APPROVED_CARIBBEAN_ISO3) {
    const names = aliases[iso3] ?? [countryDisplayName(iso3)];
    for (const n of names) out[normalizeName(n)] = iso3;
  }
  return out;
}

export function iso3FromMention(text: string, region: 'africa' | 'caribbean'): string | null {
  const norm = normalizeName(text);
  const map = region === 'africa' ? AFRICA_NAMES : CARIBBEAN_NAMES;
  if (map[norm]) return map[norm];
  for (const [name, iso3] of Object.entries(map)) {
    if (norm.includes(name) || name.includes(norm)) return iso3;
  }
  return null;
}

export function matchIso3InBlob(blob: string, region: 'africa' | 'caribbean'): Set<string> {
  const found = new Set<string>();
  const map = region === 'africa' ? AFRICA_NAMES : CARIBBEAN_NAMES;
  const lower = blob.toLowerCase();
  for (const [name, iso3] of Object.entries(map)) {
    if (name.length < 4) continue;
    const re = new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i');
    if (re.test(lower)) found.add(iso3);
  }
  return found;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function allAfricaIso3(): string[] {
  return [...APPROVED_AFRICA_ISO3];
}

export function allCaribbeanIso3(): string[] {
  return [...APPROVED_CARIBBEAN_ISO3];
}
