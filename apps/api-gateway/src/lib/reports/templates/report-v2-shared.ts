/**
 * Shared utilities and design tokens for Country Profile v2 PDF HTML.
 */

import type { CanonicalCountryPayload, PolicyStatusRecord, PreflightIssue } from '@/types/report-integrity';
import type { CountryProfileReportData } from '../country-profile-data';
import type { EconomyYearPoint } from '@/lib/intelligence/country-economy-content';
import { getClientPolicyRecords } from '../policy-status-registry';
import { formatReportStampDate } from '../report-dates';

export interface CountryProfileV2Model {
  payload: CountryProfileReportData;
  canonical: CanonicalCountryPayload;
  preflightWarnings?: PreflightIssue[];
}

/** Single print stylesheet — one @page; cover spacing via .cover padding. */
export const REPORT_V2_PRINT_CSS = `
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

.cover{ min-height: 960px; display:flex; flex-direction:column; padding: 4mm 0 0 0; }
.topbar{ display:flex; justify-content:space-between; align-items:center; padding-bottom:10px; border-bottom:1px solid var(--line); }
.brand{ font-weight:700; letter-spacing:.04em; font-size:12px; }
.classification{ font-size:11px; color:var(--muted); }
.titleBlock{ padding:22px 0 14px 0; }
.countryName{ margin:0; font-size:40px; line-height:1.05; letter-spacing:-0.02em; }
.reportType{ margin-top:6px; font-size:14px; color:var(--muted); font-weight:600; }
.metaLine{ margin-top:8px; font-size:12px; color:var(--muted); }
.panelRow{ display:grid; grid-template-columns: 1.25fr .75fr; gap:12px; margin-top:14px; }
.panel{ background:var(--bgpanel); border:1px solid var(--line); border-radius:10px; padding:14px; }
.panelTitle{ font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin-bottom:10px; }
.kv{ display:grid; grid-template-columns: 160px 1fr; gap:6px 10px; font-size:12px; font-variant-numeric: tabular-nums; }
.k{ color:var(--muted); }
.v{ font-weight:600; }
.panelNote{ margin-top:10px; font-size:11px; color:var(--muted); line-height:1.35; }
.signal .badge{ display:inline-block; background:rgba(15,118,110,.10); color:var(--accent); border:1px solid rgba(15,118,110,.25); padding:6px 10px; border-radius:999px; font-weight:700; font-size:12px; margin-bottom:8px; }
.signal .confidence{ font-size:12px; margin-bottom:8px; }
.drivers{ margin:0; padding-left:16px; font-size:12px; color:var(--ink); }
.drivers li{ margin:6px 0; }
.stance{ margin-top:14px; border:1px solid var(--line); border-radius:10px; padding:14px; }
.stanceTitle{ font-weight:700; font-size:13px; margin-bottom:8px; }
.stanceBullets{ margin:0; padding-left:16px; font-size:12px; }
.stanceBullets li{ margin:6px 0; }
.coverFooter{ margin-top:auto; padding-top:14px; border-top:1px solid var(--line); font-size:11px; color:var(--muted); display:flex; flex-direction:column; gap:4px; }
.preparedBy{ color:var(--ink); font-weight:600; }

h1{ font-size:22px; margin:0 0 8px; letter-spacing:-0.02em; }
h2{ font-size:15px; margin:16px 0 8px; color:var(--ink); }
h3{ font-size:13px; margin:12px 0 6px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; }
.prose{ font-size:11.5px; line-height:1.45; margin:0 0 8px; color:var(--ink); }
.muted{ color:var(--muted); font-size:11px; }
.template-stamp-footer{ margin-top:24px; padding-top:8px; border-top:1px dashed var(--line); }
.template-stamp{ font-size:9px; color:var(--muted); letter-spacing:.03em; }
.lead{ font-size:12px; font-weight:600; margin-bottom:10px; }

.grid2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; }
.grid3{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:10px; }
.card{ background:var(--bgpanel); border:1px solid var(--line); border-radius:8px; padding:10px; break-inside:avoid; }
.cardTitle{ font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
.cardValue{ font-size:16px; font-weight:700; }
.cardNote{ font-size:10px; color:var(--muted); margin-top:4px; line-height:1.35; }

.not-covered{ border:1px dashed var(--muted); background:#f9fafb; border-radius:8px; padding:12px; break-inside:avoid; }
.not-covered-title{ font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); margin-bottom:6px; }
.not-covered-value{ font-size:14px; font-weight:700; color:var(--ink); margin-bottom:4px; }
.not-covered-note{ font-size:10px; color:var(--muted); line-height:1.4; }

.data-table{ width:100%; border-collapse:collapse; font-size:11px; margin-top:8px; break-inside:avoid; }
.data-table th,.data-table td{ border:1px solid var(--line); padding:6px 8px; text-align:left; vertical-align:top; }
.data-table th{ background:var(--bgpanel); font-weight:600; }
.data-table td.num{ text-align:right; }
.data-table .not-covered-cell{ color:var(--muted); font-style:italic; }

.box-warn{ border:1px dashed var(--warn); background:#fffbeb; padding:10px; border-radius:8px; font-size:11px; margin-top:8px; break-inside:avoid; }
.badge{ display:inline-block; background:rgba(15,118,110,.10); color:var(--accent); border:1px solid rgba(15,118,110,.25);
  padding:4px 8px; border-radius:999px; font-weight:700; font-size:11px; }
ul.compact{ margin:6px 0; padding-left:16px; font-size:11px; }
ul.compact li{ margin:4px 0; }
`;

/** @deprecated Use REPORT_V2_PRINT_CSS */
export const REPORT_V2_BODY_CSS = REPORT_V2_PRINT_CSS;

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

export function tableHtml(headers: string[], rows: string[][]): string {
  const th = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const tr = rows
    .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
    .join('');
  return `<table class="data-table"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

export function priorMacroYear(
  years: EconomyYearPoint[],
  macroYear: number | null
): EconomyYearPoint | undefined {
  if (macroYear == null) return undefined;
  const sorted = [...years].sort((a, b) => a.year - b.year);
  const idx = sorted.findIndex((y) => y.year === macroYear);
  return idx > 0 ? sorted[idx - 1] : undefined;
}

/** Cap at sentence boundary — never mid-word truncation. */
export function truncateAtSentence(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const slice = t.slice(0, maxLen);
  const lastStop = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? ')
  );
  if (lastStop > maxLen * 0.5) return `${slice.slice(0, lastStop + 1).trim()} (continued in body)`;
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.6) return `${slice.slice(0, lastSpace).trim()}… (continued in body)`;
  return `${slice.trim()}… (continued in body)`;
}

export function renderCoverageCard(title: string, note: string): string {
  return `<div class="not-covered">
    <div class="not-covered-title">${escapeHtml(title)}</div>
    <div class="not-covered-value">Not covered</div>
    <div class="not-covered-note">${escapeHtml(note)}</div>
  </div>`;
}

/** Name-only attribution for client PDF tables (URLs remain in sourceMeta for audit). */
export function formatMetricSourceName(
  payload: CountryProfileReportData,
  metricId: string
): string {
  const m = payload.sourceMeta?.metrics?.[metricId];
  if (!m?.source_name) return 'Not covered';
  return `Source: ${m.source_name}`;
}

/** @deprecated Use formatMetricSourceName */
export function formatMetricSourceCell(
  payload: CountryProfileReportData,
  metricId: string
): string {
  return formatMetricSourceName(payload, metricId);
}

export function buildClientPolicyTableRows(iso3: string): string[][] {
  return getClientPolicyRecords(iso3).map((p) => clientPolicyRow(p));
}

function clientPolicyRow(p: PolicyStatusRecord): string[] {
  const reviewed =
    p.lastReviewedDisplay ??
    (p.lastVerifiedAt ? formatReportStampDate(p.lastVerifiedAt) : '—');
  return [
    p.framework,
    p.clientStatusLabel ?? p.statusLabel,
    p.sourceDisplayName ?? '—',
    reviewed,
  ];
}

export const METHODOLOGY_PROVIDERS: Array<{ name: string; line: string }> = [
  { name: 'World Bank', line: 'Macro indicators (GDP, growth, inflation, FDI, population) via WDI.' },
  { name: 'IMF', line: 'Fiscal and external-sector series where ingested (SDMX / AREAER).' },
  { name: 'UN Comtrade', line: 'Bilateral goods trade flows and partner concentration.' },
  { name: 'USTR', line: 'AGOA and U.S. preferential program eligibility.' },
  { name: 'AU', line: 'AfCFTA continental trade framework status.' },
  { name: 'ECOWAS', line: 'West African regional integration and market-access protocols.' },
];

export function renderMethodologyProvidersHtml(): string {
  return `<ul class="compact">${METHODOLOGY_PROVIDERS.map(
    (p) => `<li><strong>${escapeHtml(p.name)}</strong> — ${escapeHtml(p.line)}</li>`
  ).join('')}</ul>`;
}

export function buildDataCoverageLimitationsHtml(canonical: CanonicalCountryPayload): string {
  const items = canonical.coverageMap
    .filter((e) => e.status === 'not_covered' || e.status === 'partial')
    .map(
      (e) =>
        `${e.label}: ${e.status === 'partial' ? 'partial coverage' : 'not covered'}${e.note ? ` — ${e.note}` : ''}`
    );
  if (!items.length) {
    return '<p class="muted">All institutional domains in this edition are covered at the indicator level.</p>';
  }
  return `<ul class="compact">${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
}

export function buildRiskHeatmapRows(
  model: CountryProfileV2Model
): string[][] {
  const { payload, canonical } = model;
  const c = canonical.dataCoverage;
  const macroLevel = canonical.confidence === 'low' ? 'Elevated' : 'Moderate';
  const political =
    payload.sections.political.items[0]?.severity?.toString() ?? 'Moderate';

  return [
    ['Macro', macroLevel],
    ['Fiscal', c.hasFiscalSeries ? 'Moderate' : 'Not covered'],
    ['External', c.hasExternalSectorSeries ? 'Moderate' : 'Not covered'],
    ['Political', political],
    ['Operational', 'Moderate'],
  ];
}
