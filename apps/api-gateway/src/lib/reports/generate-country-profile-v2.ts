/**
 * Country profile v2 — canonicalize, preflight, cover-only PDF.
 */

import type { CountryProfileReportData } from './country-profile-data';
import { canonicalizeCountryPayload } from './canonicalize-country-payload';
import { preflightValidate } from './preflight-validate';
import { renderCoverOnlyDocument } from './templates/cover-page-v2-html';
import { renderHtmlToPdfA4 } from './render-pdf-puppeteer';
import type { PreflightReport } from '@/types/report-integrity';

export type CountryProfileV2Result =
  | { ok: true; pdf: Uint8Array; preflight: PreflightReport }
  | { ok: false; preflight: PreflightReport };

export function runCountryProfileIntegrity(
  payload: CountryProfileReportData
): PreflightReport {
  const canonical = canonicalizeCountryPayload(payload);
  return preflightValidate(payload, canonical);
}

export async function generateCountryProfileCoverV2(
  payload: CountryProfileReportData
): Promise<CountryProfileV2Result> {
  const preflight = runCountryProfileIntegrity(payload);

  if (!preflight.passed) {
    return { ok: false, preflight };
  }

  const html = renderCoverOnlyDocument(payload, preflight.canonical);
  const pdf = await renderHtmlToPdfA4(html);
  return { ok: true, pdf, preflight };
}
