/**
 * Full Country Profile v2 — canonicalize, preflight, multi-page PDF.
 * Run: npx tsx scripts/test-country-profile-v2.ts [ISO3] [--cover-only] [--proof-layout]
 */
import { writeFileSync } from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fetchCountryProfileReportData } from '../src/lib/reports/country-profile-data';
import { runCountryProfileIntegrity } from '../src/lib/reports/generate-country-profile-v2';
import {
  generateCountryProfileCoverV2,
  generateCountryProfileFullV2,
} from '../src/lib/reports/generate-country-profile-v2';
import { renderCountryProfileV2Html } from '../src/lib/reports/templates/country-profile-v2-html';
import { renderHtmlToPdfA4WithHeaderFooter } from '../src/lib/reports/render-pdf-puppeteer';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const argv = process.argv.slice(2);
  const proofLayout = argv.includes('--proof-layout');
  const coverOnly = argv.includes('--cover-only');
  const iso3 = (argv.find((a) => !a.startsWith('--')) ?? 'NGA').toUpperCase();

  console.log(`\n=== Country Profile V2 FULL (${iso3}) ===\n`);

  const payload = await fetchCountryProfileReportData(iso3);
  const preflight = runCountryProfileIntegrity(payload);

  console.log(`Preflight: ${preflight.passed ? 'PASSED' : 'BLOCKED'} (errors ${preflight.errors.length}, warnings ${preflight.warnings.length})`);
  for (const e of preflight.errors) console.log(`  [ERROR] ${e.code}: ${e.message}`);
  for (const w of preflight.warnings) console.log(`  [WARN] ${w.code}: ${w.message}`);

  if (!preflight.passed) {
    if (proofLayout) {
      const html = renderCountryProfileV2Html({ payload, canonical: preflight.canonical });
      const pdf = await renderHtmlToPdfA4WithHeaderFooter(html, {
        countryName: payload.country.name,
        iso3: payload.country.iso3,
      });
      const out = `country-profile-${iso3.toLowerCase()}-v2-proof.pdf`;
      writeFileSync(out, pdf);
      console.log(`Wrote ${out} (proof layout only)`);
    }
    process.exit(1);
  }

  const result = coverOnly
    ? await generateCountryProfileCoverV2(payload)
    : await generateCountryProfileFullV2(payload);

  if (!result.ok) {
    console.log('Generation blocked.');
    process.exit(1);
  }

  const suffix = result.mode === 'cover' ? 'cover-v2' : 'v2-full';
  const out = `country-profile-${iso3.toLowerCase()}-${suffix}.pdf`;
  writeFileSync(out, result.pdf);
  console.log(`\nWrote ${out} (${result.pdf.length} bytes) mode=${result.mode}`);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
