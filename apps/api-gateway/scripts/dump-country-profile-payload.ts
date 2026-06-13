/**
 * Dump Country Profile payload for inspection (no secrets).
 * Run: npx tsx scripts/dump-country-profile-payload.ts NGA
 */
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fetchCountryProfileReportData } from '../src/lib/reports/country-profile-data';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function truncateStrings(obj: unknown, max = 600): unknown {
  if (typeof obj === 'string') {
    return obj.length > max ? `${obj.slice(0, max)}… [${obj.length} chars total]` : obj;
  }
  if (Array.isArray(obj)) return obj.map((x) => truncateStrings(x, max));
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = truncateStrings(v, max);
    return out;
  }
  return obj;
}

async function main() {
  const iso3 = process.argv[2] ?? 'NGA';
  const data = await fetchCountryProfileReportData(iso3);
  const sample = truncateStrings(data, 800);
  const outPath = path.join(process.cwd(), 'scripts', `country-profile-${iso3.toLowerCase()}-payload-sample.json`);
  fs.writeFileSync(outPath, JSON.stringify(sample, null, 2));
  console.log('Wrote', outPath);
  console.log('Field lengths:', {
    summary: data.summary?.length ?? 0,
    whyNow: data.whyNow?.length ?? 0,
    opportunityThesis: data.opportunityThesis?.length ?? 0,
    riskNarrative: data.riskNarrative?.length ?? 0,
    metrics: data.metrics.length,
    sectors: data.sectors.length,
    economyYears: data.economyYears.length,
    marketAccess: data.marketAccess.length,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
