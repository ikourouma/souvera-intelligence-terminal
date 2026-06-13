/**
 * Report PDF router — institutional templates via Puppeteer (R1); pdf-lib fallback.
 * Country Profile production routing uses template-registry (country_profile_template).
 */

import { fetchCountryProfileReportData } from './country-profile-data';
import { buildCountryProfileSections } from './country-profile-sections';
import { buildInstitutionalReportHtml } from './templates/institutional-report-html';
import { isPuppeteerEnabled, renderHtmlToPdf } from './render-pdf-puppeteer';
import { renderReportPdf } from './render-pdf';
import type { ReportTemplateContext } from './templates';
import {
  generateCountryProfileV1Pdf,
  isCountryProfileV1RollbackEnabled,
} from './_archived/country-profile-v1';

export const COUNTRY_PROFILE_TYPE = 'Country Profile';

const PUPPETEER_REPORT_TYPES = new Set([
  COUNTRY_PROFILE_TYPE,
  'Investment Memo',
  'Trade Profile',
  'Sector Deep-Dive',
  'AI Custom Report',
  'Country Risk',
]);

export async function renderReportPdfBytes(
  ctx: ReportTemplateContext
): Promise<Uint8Array> {
  if (ctx.reportType === COUNTRY_PROFILE_TYPE) {
    if (isCountryProfileV1RollbackEnabled()) {
      return generateCountryProfileV1Pdf(ctx.iso3, {
        summary: ctx.summary,
        opportunityThesis: ctx.opportunityThesis,
        riskNarrative: ctx.riskNarrative,
      });
    }
    throw new Error(
      'Country Profile must use template registry (country_profile_template). Set REPORTS_ROLLBACK_COUNTRY_PROFILE_V1=true only for emergency v1 rollback.'
    );
  }

  if (PUPPETEER_REPORT_TYPES.has(ctx.reportType) && isPuppeteerEnabled()) {
    try {
      const data = await fetchCountryProfileReportData(ctx.iso3);
      const hasNarrativeOverride = Boolean(
        ctx.summary || ctx.opportunityThesis || ctx.riskNarrative
      );
      const merged = hasNarrativeOverride
        ? {
            ...data,
            summary: ctx.summary ?? data.summary,
            opportunityThesis: ctx.opportunityThesis ?? data.opportunityThesis,
            riskNarrative: ctx.riskNarrative ?? data.riskNarrative,
            sections: buildCountryProfileSections(
              {
                ...data,
                summary: ctx.summary ?? data.summary,
                opportunityThesis: ctx.opportunityThesis ?? data.opportunityThesis,
                riskNarrative: ctx.riskNarrative ?? data.riskNarrative,
              },
              data.economyYears
            ),
          }
        : data;
      const html = buildInstitutionalReportHtml(ctx.reportType, ctx, merged);

      return await renderHtmlToPdf(html);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        '[render-report] Puppeteer template failed:',
        message,
        err instanceof Error ? err.stack : ''
      );
      console.warn('[render-report] Falling back to pdf-lib for', ctx.reportType);
    }
  }

  return renderReportPdf(ctx);
}
