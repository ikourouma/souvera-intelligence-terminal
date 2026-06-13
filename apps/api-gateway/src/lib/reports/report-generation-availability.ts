/**
 * Report generation pause — foundation phase gate.
 * Set REPORTS_GENERATION_PAUSED=false to re-enable when Phase 3 resumes.
 */

/** Default true during foundation phase — set `REPORTS_GENERATION_PAUSED=false` in .env.local to re-enable. */
export const REPORTS_GENERATION_PAUSED_DEFAULT = true;

export function isReportGenerationPaused(): boolean {
  if (process.env.REPORTS_GENERATION_PAUSED === 'false') return false;
  if (process.env.REPORTS_GENERATION_PAUSED === 'true') return true;
  return REPORTS_GENERATION_PAUSED_DEFAULT;
}

/** Client-safe mirror of pause state (matches server default until env override is wired to UI). */
export function isReportGenerationPausedForUi(): boolean {
  return REPORTS_GENERATION_PAUSED_DEFAULT;
}

export const REPORTS_PAUSED_USER_MESSAGE =
  'Institutional PDF reports are being refreshed to align with our verified intelligence layer. On-demand report generation will return soon — your country terminal already reflects the latest structured data.';

export const REPORTS_PAUSED_BANNER_TITLE = 'Report generation — coming soon';

export const REPORTS_PAUSED_BANNER_BODY =
  'We are completing our data foundation across all markets before releasing the next generation of Souvera PDFs. Preview the intelligence in each tab above; downloadable reports will follow once verification gates pass.';
