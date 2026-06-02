/**
 * V2 milestone: canonicalize + preflight + cover-only PDF (NGA default).
 * Run: npx tsx scripts/test-country-profile-cover-v2.ts [ISO3]
 */
import { writeFileSync } from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fetchCountryProfileReportData } from '../src/lib/reports/country-profile-data';
import { canonicalizeCountryPayload } from '../src/lib/reports/canonicalize-country-payload';
import { preflightValidate } from '../src/lib/reports/preflight-validate';
import { generateCountryProfileCoverV2 } from '../src/lib/reports/generate-country-profile-v2';
import { renderCoverOnlyDocument } from '../src/lib/reports/templates/cover-page-v2-html';
import { renderHtmlToPdfA4 } from '../src/lib/reports/render-pdf-puppeteer';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const proofLayout = process.argv.includes('--proof-layout');
  const iso3 = (args[0] ?? 'NGA').toUpperCase();
  console.log(`\n=== Country Profile V2 (${iso3}) ===\n`);

  const payload = await fetchCountryProfileReportData(iso3);
  const canonical = canonicalizeCountryPayload(payload);

  console.log('Canonical as-of:', canonical.asOf);
  console.log('Canonical metrics:', canonical.canonicalMetrics);
  console.log('Signal drivers:', canonical.signalDrivers);
  console.log('Policy records:', canonical.policyRecords.map((p) => `${p.framework}=${p.statusLabel}`));

  const preflight = preflightValidate(payload, canonical);
  console.log(`\nPreflight: ${preflight.passed ? 'PASSED' : 'BLOCKED'}`);
  console.log(`  Errors: ${preflight.errors.length}`);
  console.log(`  Warnings: ${preflight.warnings.length}`);

  for (const e of preflight.errors) {
    console.log(`  [ERROR] ${e.code} @ ${e.path}`);
    console.log(`          ${e.message}`);
    if (e.detail) console.log(`          … ${e.detail}`);
  }
  for (const w of preflight.warnings) {
    console.log(`  [WARN] ${w.code} @ ${w.path}: ${w.message}`);
  }

  const result = await generateCountryProfileCoverV2(payload);
  if (!result.ok) {
    console.log('\nPDF generation blocked by preflight.');
    if (proofLayout) {
      console.log('--proof-layout: rendering cover HTML anyway (non-production).');
      const html = renderCoverOnlyDocument(payload, canonical);
      const pdf = await renderHtmlToPdfA4(html);
      const out = `country-profile-${iso3.toLowerCase()}-cover-v2-proof.pdf`;
      writeFileSync(out, pdf);
      console.log(`Wrote ${out} (${pdf.length} bytes)`);
    }
    process.exit(1);
  }

  const out = `country-profile-${iso3.toLowerCase()}-cover-v2.pdf`;
  writeFileSync(out, result.pdf);
  console.log(`\nWrote ${out} (${result.pdf.length} bytes) — cover page only`);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
