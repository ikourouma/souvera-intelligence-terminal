/**
 * Integration tests for report v2 API wiring (no HTTP server required).
 * Run: npx tsx scripts/test-reports-v2-api-integration.ts
 */
import { assertReportsV2Access, isReportsV2Enabled, parseTemplateVersion } from '../src/lib/reports/reports-v2-config';
import {
  buildPreflightFailedBody,
  formatPreflightErrorsMessage,
  serializePreflightForApi,
} from '../src/lib/reports/reports-v2-api';
import { runCountryProfileIntegrity } from '../src/lib/reports/generate-country-profile-v2';
import { hydrateCountryProfileNarratives } from '../src/lib/reports/narrative-template';
import { preflightValidate } from '../src/lib/reports/preflight-validate';
import { formatReportStampDate } from '../src/lib/reports/report-dates';
import { TOP20_INDICATORS } from '../src/lib/indicators/top20';
import type { CountryProfileReportData } from '../src/lib/reports/country-profile-data';
import type { EconomyYearPoint } from '../src/lib/intelligence/country-economy-content';
import {
  getPolicyStatusRegistry,
  getVerifiedMarketAccessForReport,
  policyRecordFromDbRow,
  primePolicyStatusCache,
} from '../src/lib/reports/policy-status-registry';
import { renderCountryProfileV2Html } from '../src/lib/reports/templates/country-profile-v2-html';
import { canonicalizeCountryPayload } from '../src/lib/reports/canonicalize-country-payload';
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

function evidenceBackedNgaPolicyForTests() {
  primePolicyStatusCache('NGA', [
    policyRecordFromDbRow({
      country_iso3: 'NGA',
      framework: 'AGOA',
      status: 'eligible',
      status_effective_date: '2025-01-01',
      last_reviewed_at: '2026-05-31T00:00:00Z',
      source_key: 'ustr',
      evidence_artifact_id: '00000000-0000-4000-8000-000000000001',
      confidence: 'high',
      notes: 'USTR AGOA beneficiary list',
      souvera_evidence_artifacts: { status: 'ok', url: 'https://ustr.gov/' },
    }),
    policyRecordFromDbRow({
      country_iso3: 'NGA',
      framework: 'AfCFTA',
      status: 'active',
      status_effective_date: null,
      last_reviewed_at: '2026-05-31T00:00:00Z',
      source_key: 'au_afcfta',
      evidence_artifact_id: '00000000-0000-4000-8000-000000000002',
      confidence: 'med',
      notes: null,
      souvera_evidence_artifacts: { status: 'ok' },
    }),
    policyRecordFromDbRow({
      country_iso3: 'NGA',
      framework: 'ECOWAS',
      status: 'member',
      status_effective_date: null,
      last_reviewed_at: '2026-05-31T00:00:00Z',
      source_key: 'ecowas',
      evidence_artifact_id: '00000000-0000-4000-8000-000000000003',
      confidence: 'high',
      notes: null,
      souvera_evidence_artifacts: { status: 'ok' },
    }),
  ]);
  return getPolicyStatusRegistry('NGA');
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
    policyRecords: evidenceBackedNgaPolicyForTests(),
    tradeSummary: { asOfYear: 2024, exportsUsd: '$10B', importsUsd: '$8B', topPartners: [] },
    markets: { asOfDate: '2026-06-01' },
    sources: 'Test sources',
    sourceMeta: {
      defaultSource: 'World Bank',
      metrics: {
        gdp_current_usd: { source_name: 'World Bank', source_url: 'https://api.worldbank.org/v2/' },
        gdp_growth_pct: { source_name: 'World Bank', source_url: 'https://api.worldbank.org/v2/' },
        inflation_cpi_pct: { source_name: 'World Bank', source_url: 'https://api.worldbank.org/v2/' },
        fdi_net_inflows_usd: { source_name: 'World Bank', source_url: 'https://api.worldbank.org/v2/' },
        fx_to_usd: { source_name: 'World Bank', source_url: 'https://api.worldbank.org/v2/' },
      },
    },
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
  assert(
    formatPreflightErrorsMessage(body422.preflight).includes('6.2%'),
    'UI formatter surfaces preflight error detail'
  );

  const levelChange = basePayload({
    sections: {
      ...basePayload().sections,
      economic: {
        ...basePayload().sections.economic,
        paragraphs: [
          'GDP expanded from $400B (2019) to $477B (2024), a 19% change over the period.',
          'Latest GDP growth: 3.3% (2024).',
        ],
      },
    },
  });
  const levelPreflight = runCountryProfileIntegrity(levelChange);
  assert(
    !levelPreflight.errors.some((e) => e.code === 'NARRATIVE_GDP_GROWTH'),
    'GDP nominal % change over period is not mistaken for GDP growth rate'
  );

  console.log('\nPreflight — NGA integrity leaks (regression)');
  const yearDriftPayload = basePayload({
    summary: 'FDI net inflows $4.5B (2025) — stale macro year label.',
  });
  const yearDriftPreflight = preflightValidate(yearDriftPayload, undefined, { strict: true });
  assert(
    yearDriftPreflight.errors.some((e) => e.code === 'NARRATIVE_YEAR_DRIFT'),
    'NARRATIVE_YEAR_DRIFT blocks (2025) when macroAsOfYear=2024'
  );

  const gdpScalePayload = basePayload({
    sections: {
      ...basePayload().sections,
      risk: {
        ...basePayload().sections.risk,
        closingSummary:
          "Nigeria's risk-adjusted profile reflects a $575B economy scale with structural reforms.",
      },
    },
  });
  const gdpScalePreflight = preflightValidate(gdpScalePayload, undefined, { strict: true });
  assert(
    gdpScalePreflight.errors.some((e) => e.code === 'NARRATIVE_GDP_SCALE'),
    'NARRATIVE_GDP_SCALE blocks $575B economy scale vs canonical ~$477B'
  );

  const copyPayload = basePayload({
    sections: {
      ...basePayload().sections,
      economic: {
        ...basePayload().sections.economic,
        paragraphs: [
          "Nigeria's GDP moved with a -20% increase over the series window per editorial copy.",
        ],
      },
    },
  });
  const copyPreflight = preflightValidate(copyPayload, undefined, { strict: true });
  assert(
    copyPreflight.warnings.some((w) => w.code === 'COPY_CONTRADICTORY_CHANGE'),
    'COPY_CONTRADICTORY_CHANGE warns on "-20% increase"'
  );

  console.log('\nHydration — intro bullets strip unsourced USD');
  const introUsd = hydrateCountryProfileNarratives(
    basePayload({
      sections: {
        ...basePayload().sections,
        introduction: {
          ...basePayload().sections.introduction,
          bullets: ['Fintech corridor: $2B+ regional expansion opportunity by 2027'],
        },
      },
    })
  );
  assert(
    !introUsd.sections.introduction.bullets?.[0]?.includes('$2'),
    'introduction bullets neutralize unsourced USD before preflight'
  );
  const introUsdPreflight = runCountryProfileIntegrity(introUsd);
  assert(
    !introUsdPreflight.errors.some((e) => e.code === 'NARRATIVE_UNSOURCED_NUMERIC'),
    'neutralized intro bullets pass strict unsourced-numeric governance'
  );

  console.log('\nInstitutional template — hydrated canonical NGA-like');
  const institutional = hydrateCountryProfileNarratives(
    basePayload({
      sections: {
        ...basePayload().sections,
        risk: {
          ...basePayload().sections.risk,
          closingSummary:
            '{{GDP_NOMINAL_USD}} economy scale ({{MACRO_ASOF_YEAR}}) supports diversified entry strategies',
        },
        signalAndDifferentiation: {
          ...basePayload().sections.signalAndDifferentiation,
          signalBullets: ['FDI inflows $4.5B (2025)', 'Stale bullet'],
        },
      },
    })
  );
  const instPreflight = runCountryProfileIntegrity(institutional, { strict: true });
  assert(instPreflight.passed === true, 'hydrated institutional payload passes strict preflight');
  assert(!institutional.summary.includes('(2025)'), 'summary has no spurious (2025)');
  assert(
    !institutional.sections.risk.closingSummary.includes('575'),
    'risk closingSummary uses canonical GDP not $575B'
  );
  assert(
    institutional.sections.signalAndDifferentiation.signalBullets[0].includes('(2024)'),
    'signal bullets aligned to macroAsOfYear 2024'
  );
  assert(
    instPreflight.errors.length === 0,
    'hydrated NGA-like payload has zero preflight errors'
  );

  console.log('\nPolicy registry — evidence-backed NGA AGOA');
  const ngaAgoa = policyRecordFromDbRow({
    country_iso3: 'NGA',
    framework: 'AGOA',
    status: 'eligible',
    status_effective_date: '2025-01-01',
    last_reviewed_at: '2026-05-31T00:00:00Z',
    source_key: 'ustr',
    evidence_artifact_id: 'art-1',
    confidence: 'high',
    notes: '2025 USTR AGOA eligibility list',
    souvera_evidence_artifacts: { status: 'ok' },
  });
  assert(ngaAgoa.status === 'active', 'NGA AGOA maps to active when artifact ok');
  assert(ngaAgoa.clientStatusLabel === 'Eligible', 'NGA AGOA client status is Eligible');
  assert(ngaAgoa.sourceDisplayName === 'USTR', 'NGA AGOA source is USTR');
  assert(ngaAgoa.publishable === true, 'NGA AGOA is publishable with evidence artifact');

  console.log('\nPreflight — POLICY_NO_EVIDENCE');
  const noEvidencePayload = basePayload({
    policyRecords: [
      {
        framework: 'AGOA',
        status: 'active',
        statusLabel: 'Eligible',
        clientStatusLabel: 'Eligible',
        description: 'Test',
        authoritativeSourceUrl: null,
        lastVerifiedAt: '2026-01-01',
        publishable: false,
        evidenceArtifactId: null,
      },
    ],
  });
  const noEvPreflight = preflightValidate(noEvidencePayload, undefined, { strict: true });
  assert(
    noEvPreflight.errors.some((e) => e.code === 'POLICY_NO_EVIDENCE'),
    'POLICY_NO_EVIDENCE blocks Eligible without evidence artifact'
  );

  console.log('\nPreflight — PLACEHOLDER_LEAK');
  const leakPayload = basePayload({
    sections: {
      ...basePayload().sections,
      introduction: {
        ...basePayload().sections.introduction,
        bullets: ['Macro drift {{UNKNOWN_TOKEN}} in narrative'],
      },
    },
  });
  const leakPreflight = preflightValidate(leakPayload, undefined, { strict: true });
  assert(
    leakPreflight.errors.some((e) => e.code === 'PLACEHOLDER_LEAK'),
    'PLACEHOLDER_LEAK blocks unresolved {{...}} tokens'
  );

  console.log('\nClient PDF — no Verified/Unverified/URL leaks');
  const ngaCanon = canonicalizeCountryPayload(institutional);
  const html = renderCountryProfileV2Html({
    payload: institutional,
    canonical: ngaCanon,
    preflightWarnings: instPreflight.warnings,
  });
  assert(!/Unverified|Verified\s*\(|URL:\s*Not provided/i.test(html), 'PDF HTML has no Verified/Unverified/URL leaks');
  assert(html.includes('AGOA') && html.includes('Eligible') && html.includes('USTR'), 'PDF shows NGA AGOA Eligible · USTR');

  console.log('\nDate stamps');
  assert(
    formatReportStampDate('2026-01-15') === 'Jan 15, 2026',
    'policyVerifiedAt date-only ISO formats without TZ drift'
  );

  console.log('\nTop 20 catalog');
  assert(TOP20_INDICATORS.length === 20, 'Top 20 catalog has 20 indicators');

  console.log('\nPreflight — indicator series bullet (GDP scale range)');
  const seriesBullet = basePayload({
    sections: {
      ...basePayload().sections,
      economic: {
        ...basePayload().sections.economic,
        indicatorBullets: ['GDP scale: $599B → $477B over 6 years'],
      },
    },
  });
  const seriesPreflight = preflightValidate(seriesBullet, undefined, { strict: true });
  assert(
    !seriesPreflight.errors.some((e) => e.code === 'NARRATIVE_GDP_SCALE'),
    'GDP scale range in indicatorBullets is not flagged as economy-scale conflict'
  );

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
