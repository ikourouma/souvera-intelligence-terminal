/**
 * Integration tests for report v2 API wiring (no HTTP server required).
 * Run: npx tsx scripts/test-reports-v2-api-integration.ts
 */
import { assertReportsV2Access, isReportsV2Enabled, parseTemplateVersion } from '../src/lib/reports/reports-v2-config';
import { buildPreflightFailedBody, serializePreflightForApi } from '../src/lib/reports/reports-v2-api';
import { runCountryProfileIntegrity } from '../src/lib/reports/generate-country-profile-v2';
import type { CountryProfileReportData } from '../src/lib/reports/country-profile-data';
import type { EconomyYearPoint } from '../src/lib/intelligence/country-economy-content';
import { getVerifiedMarketAccessForReport } from '../src/lib/reports/policy-status-registry';
import type { CountryProfileSections } from '../src/lib/reports/country-profile-sections';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

function minimalSections(): CountryProfileSections {
  const block = { intro: 'Intro.', paragraphs: ['Paragraph one.', 'Paragraph two.'] };
  return {
    glossary: { intro: 'Glossary', paragraphs: ['Def.'], terms: [{ term: 'GDP', definition: 'Gross Domestic Product' }] },
    souvera: { ...block, capabilities: ['Cap'], bullets: [] },
    geography: { ...block, facts: [{ label: 'Region', value: 'Africa' }] },
    introduction: { headline: 'Test', intro: 'Intro', paragraphs: block.paragraphs, bullets: [] },
    political: { ...block, items: [] },
    economic: { ...block, indicatorBullets: ['GDP growth: 4.0% (2023) → 3.3% (2024)'] },
    tradeAndSectors: {
      ...block,
      regionalFrameworkIntro: 'RF',
      sectorScorecardIntro: 'SC',
      marketAccessIntro: 'MA',
      tradeFinanceIntro: 'TF',
      tradeFinanceBullets: [],
      regionalAgreements: [],
    },
    opportunity: {
      ...block,
      lead: 'Lead',
      entryPointsIntro: 'EP',
      pillars: [],
      entryPoints: [],
      regionalAdvantagesIntro: 'RA',
      regionalAdvantages: [],
    },
    risk: {
      ...block,
      lead: 'Risk lead',
      categories: [],
      mitigationIntro: 'Mit',
      mitigationStrategies: [],
      closingSummary: 'Close',
    },
    signalAndDifferentiation: {
      ...block,
      badge: 'Stable',
      signalBullets: ['Bullet A', 'Bullet B'],
      differentiators: ['Diff'],
    },
  };
}

function basePayload(overrides?: Partial<CountryProfileReportData>): CountryProfileReportData {
  const economyYears: EconomyYearPoint[] = [
    { year: 2023, gdp_growth_pct: 4.0, gdp_current_usd: 400e9 },
    { year: 2024, gdp_growth_pct: 3.3, gdp_current_usd: 477e9, fdi_net_inflows_usd: 4.5e9, inflation_cpi_pct: 18.8 },
  ];
  const base: CountryProfileReportData = {
    country: { name: 'Nigeria', iso3: 'NGA', iso2: 'NG', region: 'Africa', capital: 'Abuja', currencyCode: 'NGN' },
    generatedAt: 'June 1, 2026',
    freshnessAt: '2026-06-01T00:00:00Z',
    summary: 'Test summary with GDP growth 3.3% aligned to canonical series (2024).',
    metrics: [
      { label: 'GDP (current USD)', value: '$477.0B' },
      { label: 'GDP growth', value: '3.3%' },
      { label: 'FDI net inflows', value: '$4.5B' },
      { label: 'Inflation (CPI)', value: '18.8%' },
    ],
    signalScan: { badge: 'Stable · Test', bullets: ['FDI inflows $4.5B (2024)', 'Sector strength stable'] },
    sectors: [{ label: 'Tech', strength: 80, growth: 85, attractiveness: 90 }],
    marketAccess: getVerifiedMarketAccessForReport('NGA'),
    tradeSummary: { asOfYear: 2024, exportsUsd: '$10B', importsUsd: '$8B', topPartners: [] },
    markets: { asOfDate: '2026-06-01' },
    sources: 'Test sources',
    economyYears,
    sections: minimalSections(),
  };
  return { ...base, ...overrides };
}

async function main() {
  console.log('\n=== Report v2 API integration tests ===\n');

  console.log('Config');
  assert(parseTemplateVersion(undefined) === 'v1', 'default templateVersion is v1');
  assert(parseTemplateVersion('v2') === 'v2', 'parse v2');
  assert(
    assertReportsV2Access({ templateVersion: 'v1' }).allowed === true,
    'v1 always allowed'
  );

  const prevEnabled = process.env.REPORTS_V2_ENABLED;
  process.env.REPORTS_V2_ENABLED = 'false';
  assert(isReportsV2Enabled() === false, 'v2 disabled when env false');
  assert(
    assertReportsV2Access({ templateVersion: 'v2' }).allowed === false,
    'v2 blocked when disabled'
  );
  process.env.REPORTS_V2_ENABLED = 'true';
  assert(isReportsV2Enabled() === true, 'v2 enabled when env true');
  process.env.REPORTS_V2_ENABLED = prevEnabled;

  console.log('\nPreflight — clean payload');
  const clean = basePayload();
  const cleanPreflight = runCountryProfileIntegrity(clean);
  assert(cleanPreflight.passed === true, 'clean synthetic payload passes preflight');
  assert(
    serializePreflightForApi(cleanPreflight).errors.length === 0,
    'serialized preflight has no errors'
  );

  console.log('\nPreflight — contradictory payload');
  const bad = basePayload({
    sections: {
      ...basePayload().sections,
      introduction: {
        ...basePayload().sections.introduction,
        bullets: ['GDP growth of 6.2% in 2025 signals structural shift'],
      },
    },
  });
  const badPreflight = runCountryProfileIntegrity(bad);
  assert(badPreflight.passed === false, 'contradictory payload fails preflight');
  assert(badPreflight.errors.length > 0, 'contradictory payload has errors');

  const body422 = buildPreflightFailedBody(badPreflight, new Date().toISOString());
  assert(body422.error === 'PREFLIGHT_FAILED', '422 body error code');
  assert(body422.ok === false, '422 body ok false');
  assert(Array.isArray(body422.preflight.errors), '422 body includes preflight.errors');

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
