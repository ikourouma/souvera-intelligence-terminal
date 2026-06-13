/**
 * Phase 0A — UI placeholder hydration smoke test.
 * Run: npx tsx scripts/test-phase-0a-hydration.ts
 */
import { getOverviewContent } from '../src/lib/intelligence/country-overview-content';
import { getRiskContent } from '../src/lib/intelligence/country-risk-content';
import {
  hydrateOverviewContent,
  hydrateRiskContent,
} from '../src/lib/intelligence/hydrate-intelligence-content';
import { findPlaceholderLeaks } from '../src/lib/reports/placeholder-leak';
import type { CountryIntelligenceResponse } from '../src/types/country-intelligence';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

function ngaFixture(): CountryIntelligenceResponse {
  return {
    country: { iso3: 'NGA', name: 'Nigeria', region: 'Africa' },
    metrics: {
      gdp_current_usd: 477e9,
      gdp_growth_annual_pct: 3.3,
      fdi_net_inflows_current_usd: 4.5e9,
      inflation_consumer_prices_annual_pct: 18.8,
      fx_rate_usd: 1580,
    },
    signal: null,
    momentum: null,
    newsPulse: null,
    sectors: [],
    narrative: {},
    trade: { asOfYear: 2024 },
    timeSeries: {
      years: [
        { year: 2023, gdp_current_usd: 400e9, gdp_growth_pct: 4.0 },
        {
          year: 2024,
          gdp_current_usd: 477e9,
          gdp_growth_pct: 3.3,
          fdi_net_inflows_usd: 4.5e9,
          inflation_cpi_pct: 18.8,
        },
      ],
    },
    freshness: { updatedAt: '2026-06-01T00:00:00Z', sources: [] },
    meta: { accessTier: 'professional', authenticated: true },
  };
}

function collectStrings(obj: unknown, out: string[] = []): string[] {
  if (typeof obj === 'string') {
    out.push(obj);
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v) => collectStrings(v, out));
    return out;
  }
  if (obj && typeof obj === 'object') {
    Object.values(obj).forEach((v) => collectStrings(v, out));
  }
  return out;
}

console.log('\nPhase 0A — NGA overview hydration');
const data = ngaFixture();
const rawOverview = getOverviewContent('NGA', 'Nigeria', data.metrics);
const overview = hydrateOverviewContent(rawOverview, data);
const overviewTexts = collectStrings(overview);
const overviewLeaks = overviewTexts.flatMap((t) => findPlaceholderLeaks(t));
assert(overviewLeaks.length === 0, 'NGA overview has no {{TOKEN}} leaks after hydration');
assert(
  overview.snapshotIntro.includes('$477') || overview.snapshotIntro.includes('477'),
  'snapshotIntro shows canonical GDP scale'
);
assert(overview.snapshotIntro.includes('2024'), 'snapshotIntro shows macro as-of year');

console.log('\nPhase 0A — NGA risk hydration');
const rawRisk = getRiskContent('NGA', 'Nigeria');
const risk = hydrateRiskContent(rawRisk, data);
const riskLeaks = collectStrings(risk).flatMap((t) => findPlaceholderLeaks(t));
assert(riskLeaks.length === 0, 'NGA risk has no {{TOKEN}} leaks after hydration');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
