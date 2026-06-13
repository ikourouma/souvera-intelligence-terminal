/**
 * Debug preflight for one or more ISO3 codes.
 * Run: npx tsx scripts/debug-preflight-iso3.ts NGA JAM GHA
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fetchCountryProfileReportData } from '../src/lib/reports/country-profile-data';
import { runCountryProfileIntegrity } from '../src/lib/reports/generate-country-profile-v2';
import { generateReportFromTemplate } from '../src/lib/reports/template-registry';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const isos = process.argv.slice(2).map((s) => s.toUpperCase());
  if (!isos.length) isos.push('NGA');

  for (const iso3 of isos) {
    console.log(`\n=== ${iso3} ===`);
    const payload = await fetchCountryProfileReportData(iso3);
    const pf = runCountryProfileIntegrity(payload, { strict: true });
    console.log(
      `Integrity: ${pf.passed ? 'PASS' : 'FAIL'} (${pf.errors.length} errors, ${pf.warnings.length} warnings)`
    );
    for (const e of pf.errors) {
      console.log(`  [ERROR] ${e.code} @ ${e.path}: ${e.message}`);
      if (e.detail) console.log(`    detail: ${e.detail}`);
    }
    if (!pf.passed && payload.sections?.economic?.paragraphs?.length) {
      payload.sections.economic.paragraphs.forEach((p, i) => {
        console.log(`  economic[${i}]: ${p.slice(0, 160)}${p.length > 160 ? '…' : ''}`);
      });
    }

    const viaTemplate = await generateReportFromTemplate('country_profile_template', {
      iso3,
      strict: true,
    });
    console.log(`Template registry: ${viaTemplate.ok ? 'ok' : 'blocked'}`);
    if (!viaTemplate.ok) {
      for (const e of viaTemplate.preflight.errors) {
        console.log(`  [API path] ${e.code}: ${e.message}`);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
