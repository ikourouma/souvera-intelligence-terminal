/**
 * Archived Country Profile v1 (legacy 7-tab HTML).
 * Active only when REPORTS_ROLLBACK_COUNTRY_PROFILE_V1=true.
 */

import { fetchCountryProfileReportData } from '../../country-profile-data';
import { buildCountryProfileSections } from '../../country-profile-sections';
import { renderHtmlToPdf } from '../../render-pdf-puppeteer';
import { buildCountryProfileHtml } from './country-profile-html';
import type { CountryProfileReportData } from '../../country-profile-data';

export { buildCountryProfileHtml } from './country-profile-html';

export function isCountryProfileV1RollbackEnabled(): boolean {
  return process.env.REPORTS_ROLLBACK_COUNTRY_PROFILE_V1 === 'true';
}

/** Alias for callers that use the archived naming convention. */
export const shouldUseArchivedCountryProfileV1 = isCountryProfileV1RollbackEnabled;

export async function generateCountryProfileV1Pdf(
  iso3: string,
  overrides?: {
    summary?: string;
    opportunityThesis?: string;
    riskNarrative?: string;
  }
): Promise<Uint8Array> {
  const data = await fetchCountryProfileReportData(iso3);
  const merged: CountryProfileReportData = {
    ...data,
    summary: overrides?.summary ?? data.summary,
    opportunityThesis: overrides?.opportunityThesis ?? data.opportunityThesis,
    riskNarrative: overrides?.riskNarrative ?? data.riskNarrative,
    sections: buildCountryProfileSections(
      {
        ...data,
        summary: overrides?.summary ?? data.summary,
        opportunityThesis: overrides?.opportunityThesis ?? data.opportunityThesis,
        riskNarrative: overrides?.riskNarrative ?? data.riskNarrative,
      },
      data.economyYears
    ),
  };
  const html = buildCountryProfileHtml(merged);
  return renderHtmlToPdf(html);
}
