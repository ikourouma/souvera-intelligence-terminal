/**
 * Single formatter for institutional report date stamps (cover, appendix, API headers).
 * Date-only ISO strings (YYYY-MM-DD) are interpreted as UTC calendar dates to avoid TZ drift.
 */

export function formatReportStampDate(iso?: string | null): string {
  if (!iso) return 'Not provided';

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (dateOnly) {
    const year = parseInt(dateOnly[1], 10);
    const month = parseInt(dateOnly[2], 10) - 1;
    const day = parseInt(dateOnly[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
