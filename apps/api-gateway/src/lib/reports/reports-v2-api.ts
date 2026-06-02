/**
 * API helpers — preflight JSON, response headers, observability.
 */

import type { PreflightReport } from '@/types/report-integrity';
import type { CanonicalCountryPayload } from '@/types/report-integrity';

export function serializePreflightForApi(preflight: PreflightReport) {
  return {
    passed: preflight.passed,
    iso3: preflight.iso3,
    errors: preflight.errors,
    warnings: preflight.warnings,
  };
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
  preflight: PreflightReport
): Record<string, string> {
  const macroYear = canonical.asOf.macroYear;
  return {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="country-profile-${canonical.payload.country.iso3.toLowerCase()}-v2.pdf"`,
    'X-Souvera-Template-Version': 'v2',
    'X-Souvera-Macro-As-Of': macroYear != null ? String(macroYear) : 'unknown',
    'X-Souvera-Policy-Verified-At': canonical.asOf.policyVerifiedAt ?? 'unverified',
    'X-Souvera-Preflight-Warnings': String(preflight.warnings.length),
    'Cache-Control': 'private, no-store',
  };
}

export function logReportGeneration(metrics: {
  correlationId: string;
  iso3: string;
  templateVersion: string;
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
