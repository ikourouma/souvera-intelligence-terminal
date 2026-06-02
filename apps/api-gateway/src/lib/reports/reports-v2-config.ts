/**
 * Feature flags and rollout controls for Country Profile report v2.
 */

export type ReportTemplateVersion = 'v1' | 'v2';

export interface ReportsV2RequestOptions {
  templateVersion?: ReportTemplateVersion;
  strict?: boolean;
  proofLayout?: boolean;
}

const COUNTRY_PROFILE = 'Country Profile';

export function parseTemplateVersion(
  value: unknown,
  defaultVersion: ReportTemplateVersion = 'v1'
): ReportTemplateVersion {
  if (value === 'v2') return 'v2';
  if (value === 'v1') return 'v1';
  return defaultVersion;
}

export function isCountryProfileReport(reportType: string): boolean {
  return reportType === COUNTRY_PROFILE;
}

/** REPORTS_V2_ENABLED=true required; optional REPORTS_V2_ALLOWLIST_USER_IDS comma-separated. */
export function isReportsV2Enabled(userId?: string): boolean {
  if (process.env.REPORTS_V2_ENABLED !== 'true') return false;
  const raw = process.env.REPORTS_V2_ALLOWLIST_USER_IDS?.trim();
  if (!raw) return true;
  const allowlist = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (!allowlist.length) return true;
  return Boolean(userId && allowlist.includes(userId));
}

/** Internal-only: bypass preflight block for layout QA. */
export function isProofLayoutAllowed(): boolean {
  return (
    process.env.REPORTS_PROOF_LAYOUT_ALLOWED === '1' ||
    process.env.NODE_ENV === 'development'
  );
}

export function assertReportsV2Access(
  options: ReportsV2RequestOptions,
  userId?: string
): { allowed: true } | { allowed: false; message: string } {
  if (options.templateVersion !== 'v2') return { allowed: true };
  if (!isReportsV2Enabled(userId)) {
    return {
      allowed: false,
      message:
        'Report template v2 is not enabled for this environment. Set REPORTS_V2_ENABLED=true or use templateVersion v1.',
    };
  }
  return { allowed: true };
}
