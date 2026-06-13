/**
 * Country profile v2 — canonicalize, preflight, full institutional PDF.
 */

import type { CountryProfileReportData } from './country-profile-data';
import { canonicalizeCountryPayload } from './canonicalize-country-payload';
import { preflightValidate } from './preflight-validate';
import { renderCoverOnlyDocument } from './templates/cover-page-v2-html';
import { renderCountryProfileV2Html } from './templates/country-profile-v2-html';
import { renderHtmlToPdfA4, renderHtmlToPdfA4WithHeaderFooter } from './render-pdf-puppeteer';
import type { PreflightReport } from '@/types/report-integrity';
import { isProofLayoutAllowed } from './reports-v2-config';

export type CountryProfileV2Result =
  | { ok: true; pdf: Uint8Array; preflight: PreflightReport; mode: 'cover' | 'full' }
  | { ok: false; preflight: PreflightReport };

export function runCountryProfileIntegrity(
  payload: CountryProfileReportData,
  options: { strict?: boolean } = {}
): PreflightReport {
  const canonical = canonicalizeCountryPayload(payload);
  return preflightValidate(payload, canonical, { strict: options.strict });
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
  return { ok: true, pdf, preflight, mode: 'cover' };
}

export interface CountryProfileV2GenerateOptions {
  /** When true (default), preflight errors block PDF generation. */
  strict?: boolean;
  /** Internal QA only — requires REPORTS_PROOF_LAYOUT_ALLOWED or development. */
  proofLayout?: boolean;
}

export async function generateCountryProfileFullV2(
  payload: CountryProfileReportData,
  options: CountryProfileV2GenerateOptions = {}
): Promise<CountryProfileV2Result> {
  const strict = options.strict !== false;
  const preflight = runCountryProfileIntegrity(payload, { strict });

  if (!preflight.passed) {
    const proofBypass = options.proofLayout && isProofLayoutAllowed();
    if (strict && !proofBypass) {
      return { ok: false, preflight };
    }
  }

  const html = renderCountryProfileV2Html({
    payload,
    canonical: preflight.canonical,
    preflightWarnings: preflight.warnings,
  });

  const pdf = await renderHtmlToPdfA4WithHeaderFooter(html, {
    countryName: payload.country.name,
    iso3: payload.country.iso3,
  });

  return { ok: true, pdf, preflight, mode: 'full' };
}
