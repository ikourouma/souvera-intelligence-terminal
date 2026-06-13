/**
 * Template ID mapping + download filename formatting.
 * Run: npx tsx scripts/test-report-template-registry.ts
 */

import {
  resolveTemplateId,
  TEMPLATE_ID_BY_REPORT_TYPE,
  isTemplateId,
} from '../src/lib/reports/template-ids';
import {
  formatReportDownloadFilename,
  normalizeSectorFilenameToken,
} from '../src/lib/reports/format-report-download-filename';

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

console.log('\nTemplate ID — reportType back-compat');
const fromType = resolveTemplateId({ reportType: 'Country Profile' });
assert(!('error' in fromType) && fromType.templateId === 'country_profile_template', 'Country Profile maps to country_profile_template');

const fromId = resolveTemplateId({ templateId: 'sector_deep_dive_template' });
assert(!('error' in fromId) && fromId.reportType === 'Sector Deep-Dive', 'sector_deep_dive_template maps to Sector Deep-Dive');

const tourism = resolveTemplateId({
  templateId: 'sector_deep_dive_template',
  reportType: 'Sector Deep-Dive',
});
assert(!('error' in tourism), 'templateId + reportType both valid');

const bad = resolveTemplateId({ templateId: 'not_real' });
assert('error' in bad && bad.status === 422, 'unknown templateId returns 422');

assert(
  TEMPLATE_ID_BY_REPORT_TYPE['Sector Deep-Dive'] === 'sector_deep_dive_template',
  'Sector Deep-Dive in mapping table'
);

console.log('\nFilename — country profile');
const cp = formatReportDownloadFilename({
  countryName: 'Nigeria',
  iso3: 'NGA',
  templateId: 'country_profile_template',
  generatedAtUtc: '2026-06-04T13:45:12.000Z',
});
assert(cp === 'nigeria_nga_country_profile_20260604_134512Z.pdf', 'country profile filename shape');
assert(cp.length <= 160, 'filename within max length');

console.log('\nFilename — sector deep dive (hyphen → underscore)');
assert(
  normalizeSectorFilenameToken('tourism-hospitality') === 'tourism_hospitality',
  'sector token normalizes hyphens'
);
const sector = formatReportDownloadFilename({
  countryName: 'Jamaica',
  iso3: 'JAM',
  templateId: 'sector_deep_dive_template',
  sectorKey: 'tourism-hospitality',
  generatedAtUtc: '2026-06-04T13:45:12.000Z',
});
assert(
  sector === 'jamaica_jam_sector_deep_dive_tourism_hospitality_20260604_134512Z.pdf',
  'sector deep dive includes sector token'
);

console.log('\nTemplate IDs — registry completeness');
assert(isTemplateId('country_profile_template'), 'country_profile_template is valid');
assert(isTemplateId('ai_custom_report_template'), 'ai_custom_report_template is valid');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
