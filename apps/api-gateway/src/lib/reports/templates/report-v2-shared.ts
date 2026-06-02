/**
 * Shared utilities and design tokens for Country Profile v2 PDF HTML.
 */

import type { CanonicalCountryPayload } from '@/types/report-integrity';
import type { CountryProfileReportData } from '../country-profile-data';
import type { EconomyYearPoint } from '@/lib/intelligence/country-economy-content';

export interface CountryProfileV2Model {
  payload: CountryProfileReportData;
  canonical: CanonicalCountryPayload;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function fmtUsd(n?: number): string {
  if (n == null) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export function fmtPct(n?: number): string {
  return n != null ? `${n.toFixed(1)}%` : '—';
}

export function paragraphsHtml(paragraphs: string[]): string {
  return paragraphs
    .slice(0, 3)
    .map((p) => `<p class="prose">${escapeHtml(p)}</p>`)
    .join('');
}

export function tableHtml(
  headers: string[],
  rows: string[][]
): string {
  const th = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const tr = rows
    .map(
      (row) =>
        `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`
    )
    .join('');
  return `<table class="data-table"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

export function priorMacroYear(years: EconomyYearPoint[], macroYear: number | null): EconomyYearPoint | undefined {
  if (macroYear == null) return undefined;
  const sorted = [...years].sort((a, b) => a.year - b.year);
  const idx = sorted.findIndex((y) => y.year === macroYear);
  return idx > 0 ? sorted[idx - 1] : undefined;
}

export const REPORT_V2_BODY_CSS = `
@page { size: A4; margin: 18mm 14mm 24mm 14mm; }

:root{
  --ink:#111827; --muted:#6b7280; --line:#e5e7eb; --accent:#0f766e;
  --bgpanel:#f9fafb; --warn:#b45309;
}

html,body{ margin:0; padding:0; color:var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  font-variant-numeric: tabular-nums;
}
*{ box-sizing:border-box; }
.page{ page-break-after: always; padding: 0; min-height: 980px; }
.page:last-child{ page-break-after: auto; }

h1{ font-size:22px; margin:0 0 8px; letter-spacing:-0.02em; }
h2{ font-size:15px; margin:16px 0 8px; color:var(--ink); }
h3{ font-size:13px; margin:12px 0 6px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; }
.prose{ font-size:11.5px; line-height:1.45; margin:0 0 8px; color:var(--ink); }
.muted{ color:var(--muted); font-size:11px; }
.lead{ font-size:12px; font-weight:600; margin-bottom:10px; }

.grid2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; }
.grid3{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:10px; }
.card{ background:var(--bgpanel); border:1px solid var(--line); border-radius:8px; padding:10px; break-inside:avoid; }
.cardTitle{ font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
.cardValue{ font-size:16px; font-weight:700; }
.cardNote{ font-size:10px; color:var(--muted); margin-top:4px; }

.data-table{ width:100%; border-collapse:collapse; font-size:11px; margin-top:8px; break-inside:avoid; }
.data-table th,.data-table td{ border:1px solid var(--line); padding:6px 8px; text-align:left; }
.data-table th{ background:var(--bgpanel); font-weight:600; }
.data-table td.num{ text-align:right; }

.box-warn{ border:1px dashed var(--warn); background:#fffbeb; padding:10px; border-radius:8px; font-size:11px; margin-top:8px; break-inside:avoid; }
.badge{ display:inline-block; background:rgba(15,118,110,.10); color:var(--accent); border:1px solid rgba(15,118,110,.25);
  padding:4px 8px; border-radius:999px; font-weight:700; font-size:11px; }
.severity{ font-size:10px; font-weight:700; color:var(--muted); }
ul.compact{ margin:6px 0; padding-left:16px; font-size:11px; }
ul.compact li{ margin:4px 0; }
`;
