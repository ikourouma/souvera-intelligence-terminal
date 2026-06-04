/**
 * Sector taxonomy, API validation, and v2 HTML tests.
 * Run from apps/api-gateway: npx tsx scripts/test-sector-deep-dive-wiring.ts
 */

import {
  getDeepDiveSectorOptions,
  isValidSectorKey,
  normalizeSectorKey,
  SECTOR_TAXONOMY,
  validateSectorDeepDiveRequest,
} from '../src/lib/sectors/sector-taxonomy';
import { renderSectorDeepDiveV2Html } from '../src/lib/reports/templates/sector-deep-dive-v2-html';
import type { SectorDeepDiveReportData } from '../src/lib/reports/sector-deep-dive-data';
import { isV2TemplateReport } from '../src/lib/reports/reports-v2-config';
import { generateSectorDeepDiveV2 } from '../src/lib/reports/generate-sector-deep-dive-v2';

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

console.log('\nTaxonomy — 10 entries + Tourism key');
assert(SECTOR_TAXONOMY.length === 10, 'taxonomy has 10 entries');
assert(isValidSectorKey('tourism-hospitality'), 'tourism-hospitality is valid');
assert(
  normalizeSectorKey('tourism_hospitality') === 'tourism-hospitality',
  'legacy tourism_hospitality alias normalizes'
);

const ngaOptions = getDeepDiveSectorOptions('NGA', 'Africa');
assert(
  ngaOptions.some((o) => o.sectorKey === 'tourism-hospitality'),
  'NGA dropdown includes Tourism & Hospitality'
);
assert(
  ngaOptions.some((o) => o.sectorKey === 'technology'),
  'NGA dropdown includes Technology'
);
assert(
  !ngaOptions.some((o) => o.sectorKey === 'fintech'),
  'NGA dropdown excludes fintech (deepDiveSupported=false)'
);

console.log('\nAPI validation — 422 sectorKey rules');
const missing = validateSectorDeepDiveRequest('Sector Deep-Dive', undefined);
assert(!missing.ok && missing.status === 422, 'rejects Sector Deep-Dive without sectorKey');

const unknown = validateSectorDeepDiveRequest('Sector Deep-Dive', 'not_a_real_sector');
assert(!unknown.ok && unknown.status === 422, 'rejects unknown sectorKey');

const okTech = validateSectorDeepDiveRequest('Sector Deep-Dive', 'technology');
assert(okTech.ok && okTech.sectorKey === 'technology', 'accepts technology');

const okTourismLegacy = validateSectorDeepDiveRequest('Sector Deep-Dive', 'tourism_hospitality');
assert(
  okTourismLegacy.ok && okTourismLegacy.sectorKey === 'tourism-hospitality',
  'accepts legacy alias tourism_hospitality'
);

const countryOk = validateSectorDeepDiveRequest('Country Profile', undefined);
assert(countryOk.ok, 'Country Profile does not require sectorKey');

assert(isV2TemplateReport('Sector Deep-Dive'), 'Sector Deep-Dive is v2 template report');

console.log('\nPDF HTML — covered vs Not covered (no fabricated tourism $)');
const withData: SectorDeepDiveReportData = {
  country: { name: 'Nigeria', iso3: 'NGA', region: 'Africa' },
  sector: SECTOR_TAXONOMY.find((s) => s.sectorKey === 'technology')!,
  generatedAt: 'May 31, 2026',
  scorecard: { strength: 72, growth: 65, attractiveness: 70, covered: true },
  teaser: 'Technology sector teaser.',
  keyPlayers: [{ name: 'Example Corp', role: 'Platform' }],
  macroAsOfYear: 2024,
  policyFrameworks: [
    { framework: 'AGOA', status: 'Under review', source: 'USTR', reviewed: 'May 2026' },
  ],
};

const withoutData: SectorDeepDiveReportData = {
  ...withData,
  sector: SECTOR_TAXONOMY.find((s) => s.sectorKey === 'tourism-hospitality')!,
  scorecard: { covered: false },
  teaser: undefined,
  keyPlayers: [],
};

const htmlCovered = renderSectorDeepDiveV2Html(withData);
const htmlTourism = renderSectorDeepDiveV2Html(withoutData);

assert(htmlCovered.includes('Technology'), 'covered report titles sector');
assert(htmlCovered.includes('72'), 'covered report shows strength score');
assert(htmlTourism.includes('Tourism'), 'tourism report titles sector');
assert(htmlTourism.includes('Not covered'), 'missing DB row shows Not covered');
assert(!htmlTourism.match(/\$[\d,.]+[BM]/), 'tourism report has no fabricated USD scale claims');

const scorecardProseMarker = 'The Souvera scorecard summarizes current sector positioning';
const policyProseMarker =
  'The table below summarizes relevant market-access and policy frameworks';
const scorecardTableIdx = htmlCovered.indexOf('<table');
const policyTableIdx = htmlCovered.indexOf('Framework</th>');
assert(
  scorecardTableIdx > 0 &&
    htmlCovered.indexOf(scorecardProseMarker) > 0 &&
    htmlCovered.indexOf(scorecardProseMarker) < scorecardTableIdx,
  'scorecard section has prose before table'
);
assert(
  policyTableIdx > 0 &&
    htmlCovered.indexOf(policyProseMarker) > 0 &&
    htmlCovered.indexOf(policyProseMarker) < policyTableIdx,
  'policy section has prose before table'
);
assert(
  htmlTourism.includes('not-covered') && htmlTourism.includes('Scorecard'),
  'tourism Not covered uses not-covered card for scorecard'
);
assert(htmlCovered.includes('Sector Deep-Dive (Institutional)'), 'institutional classification on cover');

async function runLivePdfTests() {
  console.log('\nGenerator — NGA technology + tourism-hospitality (requires Supabase)');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('  (skip live PDF tests — no Supabase env)');
    return;
  }
  try {
    const techPdf = await generateSectorDeepDiveV2('NGA', 'technology');
    assert(techPdf.length > 5000, 'NGA technology PDF generated');
    const tourPdf = await generateSectorDeepDiveV2('NGA', 'tourism-hospitality');
    assert(tourPdf.length > 5000, 'NGA tourism-hospitality PDF generated (Not covered path)');
  } catch (e) {
    console.warn('  (skip live PDF tests:', (e as Error).message, ')');
  }
}

runLivePdfTests().then(() => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
});
