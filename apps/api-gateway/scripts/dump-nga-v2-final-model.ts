/**
 * Debug: final CountryProfileV2Model for NGA (no PDF).
 * Run: npx tsx scripts/dump-nga-v2-final-model.ts
 * Writes: tmp/nga-v2-final-model.json (repo root)
 */
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fetchCountryProfileReportData } from '../src/lib/reports/country-profile-data';
import { canonicalizeCountryPayload } from '../src/lib/reports/canonicalize-country-payload';
import { preflightValidate } from '../src/lib/reports/preflight-validate';
import { buildCoverPageModel } from '../src/lib/reports/templates/cover-page-v2-html';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const payload = await fetchCountryProfileReportData('NGA');
  const canonical = canonicalizeCountryPayload(payload);
  const preflight = preflightValidate(payload, canonical);
  const coverModel = buildCoverPageModel(payload, canonical);

  const model = {
    renderModel: 'CountryProfileV2Model',
    payload,
    canonical: {
      asOf: canonical.asOf,
      canonicalMetrics: canonical.canonicalMetrics,
      dataCoverage: canonical.dataCoverage,
      confidence: canonical.confidence,
      policyRecords: canonical.policyRecords,
      signalDrivers: canonical.signalDrivers,
      signalConfidence: canonical.signalConfidence,
    },
    coverPageModel: coverModel,
    preflight: {
      passed: preflight.passed,
      errors: preflight.errors,
      warnings: preflight.warnings,
    },
    stamps: {
      macroAsOfYear: canonical.asOf.macroYear,
      tradeAsOfYear: canonical.asOf.tradeYear,
      marketsAsOfDate: canonical.asOf.marketsDate,
      policyVerifiedAt: canonical.asOf.policyVerifiedAt,
    },
    preflightWarningCount: preflight.warnings.length,
    preflightWarningCodes: preflight.warnings.map((w) => w.code),
  };

  const outDir = path.resolve(process.cwd(), '..', '..', 'tmp');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'nga-v2-final-model.json');
  fs.writeFileSync(outPath, JSON.stringify(model, null, 2));
  console.log('Wrote', outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
