/**
 * Reusable country seed functions — overview, time series, signal, sectors.
 * Pattern aligned with scripts/seed-kenya-*.ts pilots.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { validateCountryAnalysisMd } from './country-analysis-template';
import { seedCountryTimeSeries, type TimeSeriesRow } from './seed-time-series';

export interface ProfileSeed {
  summary_md: string;
  why_now_md: string;
  opportunity_thesis_md: string;
  risk_narrative_md: string;
  signal_level: 'high_growth' | 'emerging' | 'stable' | 'watchlist' | 'risk_elevated';
  economic_momentum: string;
  investor_readiness: string;
}

export interface SignalSeed {
  signal_level: ProfileSeed['signal_level'];
  growth_score: number;
  risk_score: number;
  investment_score: number;
  confidence_score: number;
  scoring_version?: string;
}

export interface SectorSeed {
  sector_key: string;
  sector_label: string;
  icon_emoji: string;
  display_order: number;
  teaser: string;
  strength_score: number;
  growth_score: number;
  attractiveness_score: number;
  narrative_short: string;
  narrative_full: string;
  key_players: Array<{ name: string; sector: string; description: string; metric: string }>;
  agoa_opportunity: string;
  agoa_export_current_usd: number;
  agoa_export_potential_usd: number;
  data_sources: string[];
}

const GLOBAL_FORBIDDEN = [
  'nigeria',
  'naira',
  'tinubu',
  'lagos fintech',
  'dangote',
  'flutterwave',
  'jamaica',
  'caricom',
  'cbi export',
  'jam-dex',
  'blue mountain',
  'ncb financial',
  'noranda',
  'm-pesa',
  'safaricom',
  'nairobi fintech',
];

export function assertSectorPurity(iso3: string, sector: SectorSeed, extraForbidden: string[] = []): void {
  const text = `${sector.teaser} ${sector.narrative_short} ${sector.agoa_opportunity}`.toLowerCase();
  const forbidden = [...GLOBAL_FORBIDDEN, ...extraForbidden.map((m) => m.toLowerCase())];
  for (const m of forbidden) {
    if (text.includes(m)) {
      throw new Error(`${iso3} sector ${sector.sector_key} contains forbidden marker "${m}"`);
    }
  }
  if (text.includes('cbi') && !text.includes('cbk')) {
    throw new Error(`${iso3} sector ${sector.sector_key} contains CBI (JAM marker)`);
  }
}

async function resolveCountryId(supabase: SupabaseClient, iso3: string): Promise<{ id: string; name: string }> {
  const { data: country, error } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', iso3.toUpperCase())
    .maybeSingle();

  if (error || !country) {
    throw new Error(`${iso3} not found in souvera_countries`);
  }
  return country;
}

export async function seedOverview(
  supabase: SupabaseClient,
  iso3: string,
  profile: ProfileSeed,
  countryLabel?: string
): Promise<void> {
  const country = await resolveCountryId(supabase, iso3);
  validateCountryAnalysisMd(profile.why_now_md, countryLabel ?? country.name);

  const { error } = await supabase.from('souvera_country_profiles').upsert(
    {
      country_id: country.id,
      summary_md: profile.summary_md,
      why_now_md: profile.why_now_md,
      opportunity_thesis_md: profile.opportunity_thesis_md,
      risk_narrative_md: profile.risk_narrative_md,
      signal_level: profile.signal_level,
      economic_momentum: profile.economic_momentum,
      investor_readiness: profile.investor_readiness,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'country_id' }
  );

  if (error) throw new Error(`Overview upsert failed for ${iso3}: ${error.message}`);
  console.log(`✅ ${country.name}: overview profile seeded`);
}

export async function seedTimeSeries(
  supabase: SupabaseClient,
  iso3: string,
  rows: TimeSeriesRow[]
): Promise<void> {
  await seedCountryTimeSeries(supabase, iso3, rows);
}

export async function seedSignal(
  supabase: SupabaseClient,
  iso3: string,
  signal: SignalSeed
): Promise<void> {
  const country = await resolveCountryId(supabase, iso3);

  const { error } = await supabase.from('souvera_country_signal_scores').upsert(
    {
      country_id: country.id,
      signal_level: signal.signal_level,
      growth_score: signal.growth_score,
      risk_score: signal.risk_score,
      investment_score: signal.investment_score,
      confidence_score: signal.confidence_score,
      scoring_version: signal.scoring_version ?? 'v1.0-preview',
      computed_at: new Date().toISOString(),
    },
    { onConflict: 'country_id' }
  );

  if (error) throw new Error(`Signal upsert failed for ${iso3}: ${error.message}`);
  console.log(`✅ ${country.name}: signal scores seeded (${signal.signal_level})`);
}

export async function seedSectors(
  supabase: SupabaseClient,
  iso3: string,
  sectors: SectorSeed[],
  extraForbidden: string[] = []
): Promise<void> {
  for (const sector of sectors) {
    assertSectorPurity(iso3, sector, extraForbidden);
  }

  const country = await resolveCountryId(supabase, iso3);

  for (const sector of sectors) {
    const { error } = await supabase.from('souvera_country_sectors').upsert(
      {
        country_id: country.id,
        ...sector,
        key_players: sector.key_players,
        row_status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'country_id,sector_key' }
    );

    if (error) {
      throw new Error(`${iso3} sector ${sector.sector_key}: ${error.message}`);
    }
    console.log(`✅ ${iso3} ${sector.sector_key}: ${sector.sector_label}`);
  }

  console.log(`✅ ${country.name}: ${sectors.length} sectors seeded`);
}

export async function seedCountryBundle(
  supabase: SupabaseClient,
  iso3: string,
  bundle: {
    profile: ProfileSeed;
    timeSeries: TimeSeriesRow[];
    signal: SignalSeed;
    sectors: SectorSeed[];
    extraForbidden?: string[];
  }
): Promise<void> {
  console.log(`\n▶ Seeding ${iso3}...\n`);
  await seedTimeSeries(supabase, iso3, bundle.timeSeries);
  await seedSignal(supabase, iso3, bundle.signal);
  await seedSectors(supabase, iso3, bundle.sectors, bundle.extraForbidden ?? []);
  await seedOverview(supabase, iso3, bundle.profile);
}
