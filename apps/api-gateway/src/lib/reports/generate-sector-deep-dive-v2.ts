/**
 * Sector Deep-Dive v2 PDF generation.
 */

import { fetchSectorDeepDiveReportData } from './sector-deep-dive-data';
import { renderSectorDeepDiveV2Html } from './templates/sector-deep-dive-v2-html';
import { renderHtmlToPdfA4WithHeaderFooter } from './render-pdf-puppeteer';

export async function generateSectorDeepDiveV2(
  iso3: string,
  sectorKey: string
): Promise<Uint8Array> {
  const data = await fetchSectorDeepDiveReportData(iso3, sectorKey);
  const html = renderSectorDeepDiveV2Html(data);
  return renderHtmlToPdfA4WithHeaderFooter(html, {
    countryName: data.country.name,
    iso3: data.country.iso3,
    reportLabel: data.sector.label,
  });
}
