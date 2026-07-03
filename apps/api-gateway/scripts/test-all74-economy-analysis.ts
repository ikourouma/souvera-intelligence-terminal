/**
 * QA gate: every approved market must produce executive-grade Economy Overview analysis.
 *
 * Run: npx tsx apps/api-gateway/scripts/test-all74-economy-analysis.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';
import {
  buildEconomyOverviewAnalysis,
  getEconomyTabCopy,
  type EconomyYearPoint,
} from '../src/lib/intelligence/country-economy-content';
import {
  BANNED_GENERIC_PHRASES,
  countQuantifiedValues,
  hasBannedGenericPhrase,
  wordCount,
} from '../src/lib/intelligence/executive-analysis-voice';
import { getCountryStructuralDriver } from '../src/lib/intelligence/economy-regional-frames';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ALL74_ISO3 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];
const TIER_A = new Set([
  'NGA', 'JAM', 'KEN', 'GHA', 'ZAF', 'ETH', 'SEN', 'CIV', 'TZA', 'ZWE',
  'TTO', 'BRB', 'GUY',
]);

function mockYearPoints(iso3: string): { latest: EconomyYearPoint; earliest: EconomyYearPoint; gdpChange: number } {
  const base = iso3.charCodeAt(0) % 5;
  const latest: EconomyYearPoint = {
    year: 2024,
    gdp_current_usd: (40 + base * 15) * 1e9,
    gdp_growth_pct: 3.2 + base * 0.4,
    population_total: (15 + base * 8) * 1e6,
    fdi_net_inflows_usd: (1.2 + base * 0.3) * 1e9,
    inflation_cpi_pct: 5.5 + base * 0.6,
    gdp_per_capita_usd: (1200 + base * 400),
    debt_to_gdp_pct: 45 + base * 5,
    current_account_pct_gdp: -2.5 + base * 0.5,
    trade_pct_gdp: 55 + base * 3,
    reserves_months_imports: 3.5 + base * 0.2,
  };
  const earliest: EconomyYearPoint = {
    year: 2019,
    gdp_current_usd: latest.gdp_current_usd! * 0.82,
    gdp_growth_pct: 2.8,
  };
  const gdpChange = ((latest.gdp_current_usd! - earliest.gdp_current_usd!) / earliest.gdp_current_usd!) * 100;
  return { latest, earliest, gdpChange };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const nameByIso3 = new Map<string, string>();

  if (url && key) {
    const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: countries } = await sb
      .from('souvera_countries')
      .select('iso3, name')
      .in('iso3', ALL74_ISO3 as unknown as string[]);
    (countries ?? []).forEach((c) => nameByIso3.set(c.iso3, c.name));
  }

  let failures = 0;
  const issues: string[] = [];

  for (const iso3 of ALL74_ISO3) {
    const name = nameByIso3.get(iso3) ?? iso3;
    const copy = getEconomyTabCopy(iso3);
    const { latest, earliest, gdpChange } = mockYearPoints(iso3);
    const analysis = buildEconomyOverviewAnalysis({
      countryName: name,
      iso3,
      latestYear: latest,
      earliestYear: earliest,
      gdpChange,
      copy,
    });

    const paragraphs = analysis.split(/\n\n+/).filter(Boolean);
    const localIssues: string[] = [];

    if (paragraphs.length < 3) localIssues.push(`paragraphs=${paragraphs.length} (<3)`);
    if (wordCount(analysis) < 180) localIssues.push(`words=${wordCount(analysis)} (<180)`);
    if (hasBannedGenericPhrase(analysis)) {
      localIssues.push(`banned phrase: ${BANNED_GENERIC_PHRASES.find((p) => analysis.toLowerCase().includes(p.toLowerCase()))}`);
    }
    if (countQuantifiedValues(paragraphs[1] ?? '') < 3) {
      localIssues.push(`P2 quantified values=${countQuantifiedValues(paragraphs[1] ?? '')} (<3)`);
    }
    if (TIER_A.has(iso3) && !getCountryStructuralDriver(iso3)) {
      localIssues.push('Tier A missing structural driver');
    }

    if (localIssues.length) {
      failures++;
      issues.push(`❌ ${iso3} (${name}): ${localIssues.join('; ')}`);
    }
  }

  console.log(`\n=== Economy analysis QA for ${ALL74_ISO3.length} markets ===\n`);
  issues.forEach((i) => console.log(i));
  console.log(
    failures
      ? `\n${failures}/${ALL74_ISO3.length} markets failed economy analysis QA.`
      : `\n✅ All ${ALL74_ISO3.length} markets pass economy analysis QA.`
  );
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
