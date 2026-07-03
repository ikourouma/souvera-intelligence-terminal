/**
 * Seed signal scores for approved markets that have no curated signal_scores row.
 *
 * METHODOLOGY (scoring_version = 'v1.0-macro') — transparent, deterministic, macro-derived.
 * Inputs come from the latest complete macro year in souvera_country_observations. Missing
 * inputs degrade gracefully to the curated qualitative profile bands. All outputs are 0-100.
 *
 *   growthScore   = 52 + (gdpGrowth% - 4)*6 + fdiBonus            [15..95]
 *                   (fallback: profile momentum band)
 *   riskScore     = 48 + inflationPenalty + debtPenalty
 *                   + currentAcctPenalty + reservePenalty - governanceAdj   [15..88]
 *                   (higher = riskier; fallback: profile readiness band)
 *   governance    = 50 + wgi*18                                    [10..95]
 *   investment    = 0.45*growth + 0.35*(100-risk) + 0.20*governance [12..92]
 *   confidence    = 58 + (indicatorsPresent/7)*32                  [55..90]
 *   signal_level  = reused from souvera_country_profiles (never invented)
 *
 * Existing curated rows (scoring_version 'v1.0-preview') are NEVER overwritten.
 *
 * Run: npx tsx apps/api-gateway/scripts/seed-signal-scores-macro.ts [--dry]
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';
import {
  buildEconomyYearsFromObservations,
  getLatestCompleteMacroYear,
} from '../src/lib/intelligence/build-economy-years';
import type { EconomyYearPoint } from '../src/lib/intelligence/country-economy-content';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DRY = process.argv.includes('--dry');
const APPROVED = [
  ...(APPROVED_AFRICA_ISO3 as unknown as string[]),
  ...(APPROVED_CARIBBEAN_ISO3 as unknown as string[]),
];

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const round = (x: number) => Math.round(x);

const MOMENTUM_BAND: Record<string, number> = { improving: 62, accelerating: 68, stable: 50, declining: 38, decelerating: 32 };
const READINESS_RISK_BAND: Record<string, number> = { high: 42, moderate: 52, low: 62 };

interface Scores {
  growth_score: number;
  risk_score: number;
  investment_score: number;
  confidence_score: number;
  signal_level: string;
}

function computeScores(
  y: EconomyYearPoint,
  profile: { signal_level?: string | null; economic_momentum?: string | null; investor_readiness?: string | null }
): Scores {
  const g = y.gdp_growth_pct;
  const infl = y.inflation_cpi_pct;
  const debt = y.debt_to_gdp_pct;
  const ca = y.current_account_pct_gdp;
  const gov = y.wgi_governance_estimate;
  const res = y.reserves_months_imports;
  const fdiPctGdp =
    y.fdi_net_inflows_usd != null && y.gdp_current_usd
      ? (y.fdi_net_inflows_usd / y.gdp_current_usd) * 100
      : null;

  // --- Growth score ---
  let growthScore: number;
  if (g != null) {
    // Diminishing returns: a single-year commodity/oil rebound shouldn't dominate momentum.
    let gEff = g;
    if (g > 8) gEff = 8 + (g - 8) * 0.3;
    else if (g < -4) gEff = -4 + (g + 4) * 0.5;
    const fdiBonus = fdiPctGdp != null ? clamp((fdiPctGdp - 2) * 2, -4, 10) : 0;
    growthScore = clamp(52 + (gEff - 4) * 6 + fdiBonus, 15, 92);
  } else {
    growthScore = MOMENTUM_BAND[(profile.economic_momentum ?? '').toLowerCase()] ?? 50;
  }

  // --- Risk score (higher = riskier) ---
  let riskScore: number;
  if (infl != null || debt != null || gov != null || ca != null) {
    const inflationPenalty = infl != null ? clamp((infl - 8) * 1.1, 0, 22) : 0;
    const debtPenalty = debt != null ? clamp((debt - 60) * 0.25, 0, 14) : 0;
    const caPenalty = ca != null ? clamp((-ca - 3) * 0.8, 0, 10) : 0;
    const reservePenalty = res != null && res < 3 ? 6 : 0;
    const govAdj = gov != null ? gov * 9 : 0;
    riskScore = clamp(48 + inflationPenalty + debtPenalty + caPenalty + reservePenalty - govAdj, 15, 88);
  } else {
    riskScore = READINESS_RISK_BAND[(profile.investor_readiness ?? '').toLowerCase()] ?? 52;
  }

  // --- Governance sub-score ---
  const govScore = gov != null ? clamp(50 + gov * 18, 10, 95) : 50;

  // --- Investment score (composite) ---
  const investmentScore = clamp(
    0.45 * growthScore + 0.35 * (100 - riskScore) + 0.2 * govScore,
    12,
    92
  );

  // --- Confidence (data completeness) ---
  const present = [g, infl, debt, ca, gov, res, fdiPctGdp].filter((v) => v != null).length;
  const confidence = clamp(round(58 + (present / 7) * 32), 55, 90);

  return {
    growth_score: round(growthScore),
    risk_score: round(riskScore),
    investment_score: round(investmentScore),
    confidence_score: confidence,
    signal_level: profile.signal_level ?? 'emerging',
  };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log(`\n=== Seed signal scores (v1.0-macro)${DRY ? ' [DRY RUN]' : ''} ===\n`);

  const { data: countries } = await sb
    .from('souvera_countries')
    .select('id, iso3, name')
    .in('iso3', APPROVED);
  const byId = new Map((countries ?? []).map((c) => [c.id, c]));

  const { data: existing } = await sb.from('souvera_country_signal_scores').select('country_id');
  const hasScore = new Set((existing ?? []).map((r) => r.country_id as string));

  const { data: profiles } = await sb
    .from('souvera_country_profiles')
    .select('country_id, signal_level, economic_momentum, investor_readiness');
  const profById = new Map((profiles ?? []).map((p) => [p.country_id as string, p]));

  let seeded = 0;
  let skippedExisting = 0;
  let noData = 0;
  const previews: string[] = [];

  for (const country of countries ?? []) {
    if (hasScore.has(country.id)) { skippedExisting++; continue; }

    const { data: obs } = await sb
      .from('souvera_country_observations')
      .select('period_date, value_numeric, value_text, souvera_indicators (key, label, unit)')
      .eq('country_id', country.id)
      .gte('period_date', '2020-01-01')
      .lte('period_date', '2025-12-31')
      .eq('period_type', 'annual')
      .order('period_date', { ascending: true });

    const years = buildEconomyYearsFromObservations(
      (obs ?? []) as Parameters<typeof buildEconomyYearsFromObservations>[0]
    );
    const profile = profById.get(country.id) ?? {};

    if (!years.length && !('signal_level' in profile)) { noData++; continue; }

    const latest = getLatestCompleteMacroYear(years);
    const scores = computeScores(latest, profile);

    previews.push(
      `${country.iso3} (${country.name}): inv=${scores.investment_score} growth=${scores.growth_score} risk=${scores.risk_score} conf=${scores.confidence_score} [${scores.signal_level}]`
    );

    if (!DRY) {
      const { error } = await sb.from('souvera_country_signal_scores').upsert(
        {
          country_id: country.id,
          signal_level: scores.signal_level,
          growth_score: scores.growth_score,
          risk_score: scores.risk_score,
          investment_score: scores.investment_score,
          confidence_score: scores.confidence_score,
          scoring_version: 'v1.0-macro',
          computed_at: new Date().toISOString(),
        },
        { onConflict: 'country_id' }
      );
      if (error) { console.log(`  ❌ ${country.iso3}: ${error.message}`); continue; }
    }
    seeded++;
  }

  console.log(previews.join('\n'));
  console.log(`\n${DRY ? 'Would seed' : 'Seeded'}: ${seeded}`);
  console.log(`Skipped (curated existing): ${skippedExisting}`);
  console.log(`No usable data: ${noData}`);
  console.log(`Total approved: ${APPROVED.length}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
