/**
 * Smoke test: Country Profile data + HTML + Puppeteer PDF for NGA.
 * Run: npx tsx scripts/test-country-profile-pdf.ts
 */
import { writeFileSync } from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fetchCountryProfileReportData } from '../src/lib/reports/country-profile-data';
import { buildCountryProfileHtml } from '../src/lib/reports/_archived/country-profile-v1/country-profile-html';
import { renderHtmlToPdf } from '../src/lib/reports/render-pdf-puppeteer';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const iso3 = process.argv[2] ?? 'NGA';
  console.log(`Fetching ${iso3} report data…`);
  const data = await fetchCountryProfileReportData(iso3);
  console.log('Sections:', Object.keys(data.sections));
  console.log('Sectors:', data.sectors.length);
  console.log('Summary length:', data.summary?.length ?? 0);

  const html = buildCountryProfileHtml(data);
  console.log('HTML length:', html.length);

  const pdf = await renderHtmlToPdf(html);
  const out = `country-profile-${iso3.toLowerCase()}-test.pdf`;
  writeFileSync(out, pdf);
  console.log(`Wrote ${out} (${pdf.length} bytes)`);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
