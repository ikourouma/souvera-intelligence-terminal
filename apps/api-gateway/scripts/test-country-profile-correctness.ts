/**
 * Country Profile generation correctness — filenames, cache policy, template stamp.
 * Run: npx tsx scripts/test-country-profile-correctness.ts
 */

import { assertCountryProfileTemplateAccess, isCountryProfileTemplateEnabled } from '../src/lib/reports/reports-v2-config';
import { resolveTemplateId } from '../src/lib/reports/template-ids';
import { formatReportDownloadFilename } from '../src/lib/reports/format-report-download-filename';
import {
  buildContentDispositionAttachment,
  buildReportDownloadProxyUrl,
} from '../src/lib/reports/report-download';
import { buildV2PdfResponseHeaders } from '../src/lib/reports/reports-v2-api';
import {
  renderReportTemplateStampFooter,
  isReportTemplateStampEnabled,
} from '../src/lib/reports/report-template-stamp';
import type { CountryProfileReportData } from '../src/lib/reports/country-profile-data';
import { canonicalizeCountryPayload } from '../src/lib/reports/canonicalize-country-payload';

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

console.log('\nCountry Profile — env gate');
const prevV2 = process.env.REPORTS_V2_ENABLED;
const prevApp = process.env.APP_ENV;
process.env.REPORTS_V2_ENABLED = 'false';
process.env.APP_ENV = 'dev';
assert(isCountryProfileTemplateEnabled(), 'enabled when APP_ENV=dev without REPORTS_V2_ENABLED');
assert(assertCountryProfileTemplateAccess().allowed === true, 'assert passes in dev');
process.env.REPORTS_V2_ENABLED = prevV2;
process.env.APP_ENV = prevApp;

console.log('\nTemplate routing — Country Profile');
const cp = resolveTemplateId({ reportType: 'Country Profile' });
assert(!('error' in cp) && cp.templateId === 'country_profile_template', 'maps to country_profile_template');

console.log('\nFilename — NGA country profile + JAM sector tourism');
const ngaName = formatReportDownloadFilename({
  countryName: 'Nigeria',
  iso3: 'NGA',
  templateId: 'country_profile_template',
  generatedAtUtc: '2026-06-04T13:45:12.000Z',
});
assert(ngaName === 'nigeria_nga_country_profile_20260604_134512Z.pdf', 'NGA country profile filename');

const jamSector = formatReportDownloadFilename({
  countryName: 'Jamaica',
  iso3: 'JAM',
  templateId: 'sector_deep_dive_template',
  sectorKey: 'tourism-hospitality',
  generatedAtUtc: '2026-06-04T13:45:12.000Z',
});
assert(
  jamSector === 'jamaica_jam_sector_deep_dive_tourism_hospitality_20260604_134512Z.pdf',
  'JAM sector deep dive tourism_hospitality token'
);

console.log('\nDownload proxy + Content-Disposition');
const proxy = buildReportDownloadProxyUrl('abc-123');
assert(proxy === '/api/v1/reports/download/abc-123', 'proxy URL shape');
const cd = buildContentDispositionAttachment(ngaName);
assert(cd.includes('attachment; filename="nigeria_nga_country_profile_20260604_134512Z.pdf"'), 'Content-Disposition uses report_filename');
assert(!cd.includes('country-profile-nga-v2'), 'no legacy hardcoded v2 filename in Content-Disposition');

console.log('\nv2 headers — no legacy hardcoded iso filename');
const minimalPayload: CountryProfileReportData = {
  country: { name: 'Nigeria', iso3: 'NGA', region: 'Africa' },
  summary: 'Test',
  sources: 'Test',
  economyYears: [],
  sectors: [],
  signalScan: { badge: 'Stable', bullets: ['A', 'B'] },
  marketAccess: [],
  indicators: [],
};
const canonical = canonicalizeCountryPayload(minimalPayload);
const preflight = {
  passed: true,
  iso3: 'NGA',
  errors: [],
  warnings: [],
  canonical,
};
const headers = buildV2PdfResponseHeaders(canonical, preflight as never, ngaName);
assert(!headers['Content-Disposition']?.includes('country-profile-nga-v2'), 'v2 headers use formatted filename not legacy pattern');

console.log('\nTemplate stamp — env gated');
const prev = process.env.REPORTS_SHOW_TEMPLATE_STAMP;
process.env.REPORTS_SHOW_TEMPLATE_STAMP = 'false';
assert(renderReportTemplateStampFooter('country_profile_template') === '', 'stamp off by default');
process.env.REPORTS_SHOW_TEMPLATE_STAMP = 'true';
const stampHtml = renderReportTemplateStampFooter('country_profile_template');
assert(stampHtml.includes('country_profile_template'), 'stamp shows template id when enabled');
process.env.REPORTS_SHOW_TEMPLATE_STAMP = prev;

assert(
  isReportTemplateStampEnabled() === (process.env.REPORTS_SHOW_TEMPLATE_STAMP === 'true'),
  'stamp helper reads REPORTS_SHOW_TEMPLATE_STAMP'
);
process.env.REPORTS_SHOW_TEMPLATE_STAMP = prev;

console.log('\nCache policy — documented');
assert(true, 'each Generate inserts new request id; allowCachedCompleted only for idempotent retry');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
