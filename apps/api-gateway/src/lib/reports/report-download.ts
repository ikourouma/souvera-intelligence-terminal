/**
 * Download proxy URLs and Content-Disposition helpers (client-safe).
 */

export function buildReportDownloadProxyUrl(requestId: string): string {
  return `/api/v1/reports/download/${requestId}`;
}

export function buildContentDispositionAttachment(filename: string): string {
  const safeName = filename.replace(/[^\w.\-]/g, '_');
  return `attachment; filename="${safeName}"`;
}
