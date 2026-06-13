/**
 * API helpers — preflight JSON, response headers, observability.
 */

import type { PreflightReport } from '@/types/report-integrity';
import type { CanonicalCountryPayload } from '@/types/report-integrity';
import { buildContentDispositionAttachment } from './report-download';

export function serializePreflightForApi(preflight: PreflightReport) {
  return {
    passed: preflight.passed,
    iso3: preflight.iso3,
    errors: preflight.errors,
    warnings: preflight.warnings,
  };
}

/** Human-readable message for UI when generation returns 422 PREFLIGHT_FAILED. */
export function formatPreflightErrorsMessage(
  preflight: { errors?: Array<{ code: string; message: string }> } | undefined,
  fallback = 'PREFLIGHT_FAILED'
): string {
  const errors = preflight?.errors ?? [];
  if (!errors.length) return fallback;
  const lines = errors.slice(0, 3).map((e) => e.message);
  const more = errors.length > 3 ? ` (+${errors.length - 3} more)` : '';
  return `Report blocked by data integrity checks: ${lines.join('; ')}${more}`;
}

export function buildPreflightFailedBody(
  preflight: PreflightReport,
  generatedAt: string
) {
  return {
    ok: false as const,
    error: 'PREFLIGHT_FAILED' as const,
    preflight: serializePreflightForApi(preflight),
    country: { iso3: preflight.iso3 },
    generatedAt,
  };
}

export function buildV2PdfResponseHeaders(
  canonical: CanonicalCountryPayload,
  preflight: PreflightReport,
  downloadFilename: string
): Record<string, string> {
  const macroYear = canonical.asOf.macroYear;
  return {
    'Content-Type': 'application/pdf',
    'Content-Disposition': buildContentDispositionAttachment(downloadFilename),
    'X-Souvera-Template-Id': 'country_profile_template',
    'X-Souvera-Macro-As-Of': macroYear != null ? String(macroYear) : 'unknown',
    'X-Souvera-Policy-Verified-At': canonical.asOf.policyVerifiedAt ?? 'unverified',
    'X-Souvera-Preflight-Warnings': String(preflight.warnings.length),
    'Cache-Control': 'private, no-store',
  };
}

export function logReportGeneration(metrics: {
  correlationId: string;
  iso3: string;
  templateId?: string;
  templateVersion?: string;
  strict: boolean;
  preflightErrors: number;
  preflightWarnings: number;
  renderMs?: number;
  pdfBytes?: number;
  outcome: 'pdf' | 'preflight_failed' | 'failed' | 'v1_json';
}): void {
  console.info('[reports/generate]', JSON.stringify(metrics));
}

export function resolveCorrelationId(request: Request): string {
  return (
    request.headers.get('x-request-id') ??
    request.headers.get('x-correlation-id') ??
    `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );
}
