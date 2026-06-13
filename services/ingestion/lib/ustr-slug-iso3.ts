/**
 * USTR country page slug → ISO3 resolution (Africa directory).
 */

import { APPROVED_AFRICA_ISO3 } from '../../../apps/api-gateway/src/lib/market-coverage';
import { countryDisplayName } from '../../../apps/api-gateway/src/lib/intelligence/country-names';
import { iso3FromMention } from './country-name-iso3';

/** Known USTR slug overrides (directory slugs ≠ ISO3-derived slugs). */
export const USTR_SLUG_TO_ISO3: Record<string, string> = {
  'cote-d-ivoire': 'CIV',
  'ivory-coast': 'CIV',
  'democratic-republic-of-the-congo': 'COD',
  'dr-congo': 'COD',
  'drc': 'COD',
  'republic-of-the-congo': 'COG',
  'congo-brazzaville': 'COG',
  'eswatini': 'SWZ',
  'swaziland': 'SWZ',
  'cape-verde': 'CPV',
  'sao-tome-and-principe': 'STP',
  'guinea-bissau': 'GNB',
  'south-sudan': 'SSD',
  'the-gambia': 'GMB',
  'gambia': 'GMB',
  'burkina-faso': 'BFA',
  'central-african-republic': 'CAF',
  'equatorial-guinea': 'GNQ',
  'sierra-leone': 'SLE',
  'south-africa': 'ZAF',
};

const SLUG_FROM_ISO3 = new Map<string, string>();

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

for (const iso3 of APPROVED_AFRICA_ISO3) {
  const name = countryDisplayName(iso3);
  SLUG_FROM_ISO3.set(nameToSlug(name), iso3);
}

export function slugToIso3(slug: string, linkLabel?: string): string | null {
  const norm = slug.toLowerCase().trim();
  if (USTR_SLUG_TO_ISO3[norm]) return USTR_SLUG_TO_ISO3[norm];
  if (SLUG_FROM_ISO3.has(norm)) return SLUG_FROM_ISO3.get(norm)!;
  if (linkLabel) {
    const fromLabel = iso3FromMention(linkLabel, 'africa');
    if (fromLabel) return fromLabel;
  }
  return null;
}

export function buildAfricaSlugIndex(): Map<string, string> {
  const out = new Map<string, string>();
  for (const iso3 of APPROVED_AFRICA_ISO3) {
    out.set(nameToSlug(countryDisplayName(iso3)), iso3);
  }
  for (const [slug, iso3] of Object.entries(USTR_SLUG_TO_ISO3)) {
    out.set(slug, iso3);
  }
  return out;
}
