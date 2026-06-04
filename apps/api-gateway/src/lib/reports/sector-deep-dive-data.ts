/**
 * Sector Deep-Dive report payload — deterministic, no fabricated metrics.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  dbSectorKeyAliasesForTaxonomy,
  getSectorTaxonomyEntry,
  normalizeSectorKey,
  type SectorTaxonomyEntry,
} from '@/lib/sectors/sector-taxonomy';
import { resolvePolicyStatusRegistry } from './policy-status-registry';
import { formatReportStampDate } from './report-dates';
import { neutralizeClientNumericClaims } from './narrative-client-safe';

export interface SectorScorecard {
  strength?: number;
  growth?: number;
  attractiveness?: number;
  covered: boolean;
}

export interface SectorDeepDiveReportData {
  country: { name: string; iso3: string; region?: string };
  sector: SectorTaxonomyEntry;
  generatedAt: string;
  freshnessAt?: string;
  scorecard: SectorScorecard;
  teaser?: string;
  narrativeShort?: string;
  narrativeFull?: string;
  keyPlayers: Array<{ name: string; role?: string }>;
  macroAsOfYear: number | null;
  policyFrameworks: Array<{ framework: string; status: string; source: string; reviewed: string }>;
}

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function fetchSectorDeepDiveReportData(
  iso3: string,
  sectorKey: string
): Promise<SectorDeepDiveReportData> {
  const canonicalKey = normalizeSectorKey(sectorKey);
  const entry = getSectorTaxonomyEntry(canonicalKey);
  if (!entry) throw new Error(`Unknown sectorKey: ${sectorKey}`);

  const supabase = getServiceClient();
  const iso3Upper = iso3.toUpperCase();

  const { data: country } = await supabase
    .from('souvera_countries')
    .select('id, name, iso3, region')
    .eq('iso3', iso3Upper)
    .maybeSingle();

  if (!country) throw new Error(`Country not found: ${iso3Upper}`);

  const dbKeys = dbSectorKeyAliasesForTaxonomy(canonicalKey);
  const { data: sectorRow } = await supabase
    .from('souvera_country_sectors')
    .select(
      'sector_key, sector_label, strength_score, growth_score, attractiveness_score, teaser, narrative_short, narrative_full, key_players, updated_at'
    )
    .eq('country_id', country.id)
    .eq('row_status', 'active')
    .in('sector_key', dbKeys)
    .order('display_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: lite } = await supabase
    .from('souvera_country_lite_v')
    .select('freshness_at')
    .eq('iso3', iso3Upper)
    .maybeSingle();

  let macroAsOfYear: number | null = null;
  const { data: obs } = await supabase
    .from('souvera_country_observations')
    .select('period_date, souvera_indicators(key)')
    .eq('country_id', country.id)
    .limit(200);

  if (obs?.length) {
    const years = obs
      .map((o) => new Date(o.period_date as string).getFullYear())
      .filter((y) => !Number.isNaN(y));
    if (years.length) macroAsOfYear = Math.max(...years);
  }

  const policyRecords = await resolvePolicyStatusRegistry(iso3Upper);
  const policyFrameworks = policyRecords.map((p) => ({
    framework: p.framework,
    status: p.clientStatusLabel ?? p.statusLabel,
    source: p.sourceDisplayName ?? '—',
    reviewed:
      p.lastReviewedDisplay ??
      (p.lastVerifiedAt ? formatReportStampDate(p.lastVerifiedAt) : 'Under review'),
  }));

  const scorecard: SectorScorecard = sectorRow
    ? {
        strength: sectorRow.strength_score as number | undefined,
        growth: sectorRow.growth_score as number | undefined,
        attractiveness: sectorRow.attractiveness_score as number | undefined,
        covered: true,
      }
    : { covered: false };

  const rawTeaser = sectorRow?.teaser as string | undefined;
  const rawShort = sectorRow?.narrative_short as string | undefined;
  const rawFull = sectorRow?.narrative_full as string | undefined;

  let keyPlayers: Array<{ name: string; role?: string }> = [];
  const kp = sectorRow?.key_players;
  if (Array.isArray(kp)) {
    keyPlayers = kp.map((p) => {
      if (typeof p === 'object' && p && 'name' in p) {
        return { name: String((p as { name: string }).name), role: (p as { role?: string }).role };
      }
      return { name: String(p) };
    });
  }

  return {
    country: {
      name: country.name as string,
      iso3: country.iso3 as string,
      region: country.region as string | undefined,
    },
    sector: entry,
    generatedAt: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    freshnessAt: (lite?.freshness_at as string) ?? (sectorRow?.updated_at as string) ?? undefined,
    scorecard,
    teaser: rawTeaser ? neutralizeClientNumericClaims(rawTeaser) : undefined,
    narrativeShort: rawShort ? neutralizeClientNumericClaims(rawShort) : undefined,
    narrativeFull: rawFull ? neutralizeClientNumericClaims(rawFull) : undefined,
    keyPlayers,
    macroAsOfYear,
    policyFrameworks,
  };
}
