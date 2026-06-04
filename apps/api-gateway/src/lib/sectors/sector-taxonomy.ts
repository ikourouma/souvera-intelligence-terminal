/**
 * Canonical sector taxonomy — single source of truth for hubs, reports, and DB mapping.
 */

import { isApprovedCaribbeanMarket } from '@/lib/market-coverage';

export type SouveraRegionScope = 'africa' | 'caribbean';

export interface SectorTaxonomyEntry {
  /** Stable taxonomy key (hyphenated where multi-word). */
  sectorKey: string;
  label: string;
  hubRoute: string;
  deepDiveSupported: boolean;
  regionsApplicable: SouveraRegionScope[];
  /** Maps to `souvera_country_sectors.sector_key` */
  dbSectorKeyAliases: string[];
}

export const SECTOR_TAXONOMY: SectorTaxonomyEntry[] = [
  {
    sectorKey: 'technology',
    label: 'Technology & Software',
    hubRoute: '/sectors/fintech',
    deepDiveSupported: true,
    regionsApplicable: ['africa', 'caribbean'],
    dbSectorKeyAliases: ['technology'],
  },
  {
    sectorKey: 'agriculture',
    label: 'Agriculture & Food Processing',
    hubRoute: '/sectors/agriculture',
    deepDiveSupported: true,
    regionsApplicable: ['africa', 'caribbean'],
    dbSectorKeyAliases: ['agriculture'],
  },
  {
    sectorKey: 'energy',
    label: 'Energy & Power',
    hubRoute: '/sectors/energy',
    deepDiveSupported: true,
    regionsApplicable: ['africa', 'caribbean'],
    dbSectorKeyAliases: ['energy'],
  },
  {
    sectorKey: 'manufacturing',
    label: 'Manufacturing',
    hubRoute: '/sectors/logistics',
    deepDiveSupported: true,
    regionsApplicable: ['africa'],
    dbSectorKeyAliases: ['manufacturing'],
  },
  {
    sectorKey: 'mining',
    label: 'Mining & Minerals',
    hubRoute: '/sectors/critical-minerals',
    deepDiveSupported: true,
    regionsApplicable: ['africa'],
    dbSectorKeyAliases: ['mining'],
  },
  {
    sectorKey: 'tourism-hospitality',
    label: 'Tourism & Hospitality',
    hubRoute: '/sectors/tourism-hospitality',
    deepDiveSupported: true,
    regionsApplicable: ['africa', 'caribbean'],
    dbSectorKeyAliases: ['tourism', 'tourism-hospitality', 'tourism_hospitality'],
  },
  {
    sectorKey: 'fintech',
    label: 'Fintech & Digital Finance',
    hubRoute: '/sectors/fintech',
    deepDiveSupported: false,
    regionsApplicable: ['africa', 'caribbean'],
    dbSectorKeyAliases: ['fintech'],
  },
  {
    sectorKey: 'logistics',
    label: 'Logistics & Trade',
    hubRoute: '/sectors/logistics',
    deepDiveSupported: false,
    regionsApplicable: ['africa', 'caribbean'],
    dbSectorKeyAliases: ['logistics'],
  },
  {
    sectorKey: 'critical-minerals',
    label: 'Critical Minerals',
    hubRoute: '/sectors/critical-minerals',
    deepDiveSupported: false,
    regionsApplicable: ['africa'],
    dbSectorKeyAliases: ['critical-minerals', 'critical_minerals', 'mining'],
  },
  {
    sectorKey: 'digital-infrastructure',
    label: 'Digital Infrastructure',
    hubRoute: '/sectors/digital-infrastructure',
    deepDiveSupported: false,
    regionsApplicable: ['africa', 'caribbean'],
    dbSectorKeyAliases: ['digital-infrastructure', 'digital_infrastructure'],
  },
];

const BY_KEY = new Map(SECTOR_TAXONOMY.map((e) => [e.sectorKey, e]));

/** Legacy / typo aliases → canonical taxonomy key */
const KEY_ALIASES: Record<string, string> = {
  tourism_hospitality: 'tourism-hospitality',
  digital_infrastructure: 'digital-infrastructure',
  critical_minerals: 'critical-minerals',
};

export function normalizeSectorKey(raw: string): string {
  const trimmed = raw.trim();
  return KEY_ALIASES[trimmed] ?? trimmed;
}

export function getSectorTaxonomyEntry(sectorKey: string): SectorTaxonomyEntry | undefined {
  return BY_KEY.get(normalizeSectorKey(sectorKey));
}

export function isValidSectorKey(sectorKey: string): boolean {
  return BY_KEY.has(normalizeSectorKey(sectorKey));
}

export function resolveRegionScope(iso3: string, regionLabel?: string): SouveraRegionScope {
  if (isApprovedCaribbeanMarket(iso3)) return 'caribbean';
  if (regionLabel?.toLowerCase().includes('caribbean')) return 'caribbean';
  return 'africa';
}

export function getDeepDiveSectorOptions(iso3: string, regionLabel?: string): SectorTaxonomyEntry[] {
  const scope = resolveRegionScope(iso3, regionLabel);
  return SECTOR_TAXONOMY.filter(
    (e) => e.deepDiveSupported && e.regionsApplicable.includes(scope)
  );
}

export function taxonomyEntryForDbSectorKey(dbKey: string): SectorTaxonomyEntry | undefined {
  const norm = dbKey.toLowerCase();
  return SECTOR_TAXONOMY.find((e) =>
    e.dbSectorKeyAliases.some((k) => k.toLowerCase() === norm)
  );
}

export function dbSectorKeyAliasesForTaxonomy(sectorKey: string): string[] {
  const entry = getSectorTaxonomyEntry(sectorKey);
  return entry?.dbSectorKeyAliases ?? [normalizeSectorKey(sectorKey)];
}

/** @deprecated Use dbSectorKeyAliasesForTaxonomy */
export function dbKeysForTaxonomy(sectorKey: string): string[] {
  return dbSectorKeyAliasesForTaxonomy(sectorKey);
}

export type SectorDeepDiveValidationResult =
  | { ok: true; sectorKey: string }
  | { ok: false; status: 422; error: string };

export function validateSectorDeepDiveRequest(
  reportType: string,
  sectorKey: string | undefined
): SectorDeepDiveValidationResult {
  if (reportType !== 'Sector Deep-Dive') return { ok: true, sectorKey: sectorKey ?? '' };
  if (!sectorKey?.trim()) {
    return { ok: false, status: 422, error: 'sectorKey is required for Sector Deep-Dive reports' };
  }
  const normalized = normalizeSectorKey(sectorKey);
  if (!isValidSectorKey(normalized)) {
    return { ok: false, status: 422, error: `Unknown sectorKey: ${sectorKey}` };
  }
  const entry = getSectorTaxonomyEntry(normalized)!;
  if (!entry.deepDiveSupported) {
    return {
      ok: false,
      status: 422,
      error: `Sector "${normalized}" is not enabled for deep-dive reports`,
    };
  }
  return { ok: true, sectorKey: normalized };
}
