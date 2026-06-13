/**
 * QA template stamp — env-gated footer in institutional PDFs.
 */

import { escapeHtml } from './templates/report-v2-shared';

export const COUNTRY_PROFILE_TEMPLATE_ID = 'country_profile_template';

export function isReportTemplateStampEnabled(): boolean {
  return process.env.REPORTS_SHOW_TEMPLATE_STAMP === 'true';
}

export function resolveReportBuildId(): string {
  const raw =
    process.env.REPORTS_BUILD_ID?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim()?.slice(0, 7) ||
    'local';
  return raw.slice(0, 12);
}

export function renderReportTemplateStampFooter(templateId: string): string {
  if (!isReportTemplateStampEnabled()) return '';
  const buildId = resolveReportBuildId();
  return `
<footer class="template-stamp-footer">
  <p class="template-stamp">Template: ${escapeHtml(templateId)} · Build ${escapeHtml(buildId)}</p>
</footer>`;
}
