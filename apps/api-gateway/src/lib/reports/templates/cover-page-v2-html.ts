/**
 * Institutional cover page — A4 HTML/CSS for Puppeteer (report v2).
 */

import type { CountryProfileReportData } from './country-profile-data';
import type { CanonicalCountryPayload, CoverPageModel } from '@/types/report-integrity';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatStampDate(iso?: string | null): string {
  if (!iso) return 'Not provided';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export function buildCoverPageModel(
  payload: CountryProfileReportData,
  canonical: CanonicalCountryPayload
): CoverPageModel {
  const { asOf } = canonical;
  const sections = payload.sections;

  const topRiskTitles =
    sections?.risk?.categories
      ?.flatMap((c) => c.items.map((i) => i.title))
      .slice(0, 2)
      .join('; ') ?? 'See Risk Assessment section';

  const watchFromPolitical =
    sections?.political?.items
      ?.map((i) => i.title)
      .slice(0, 2)
      .join('; ') ?? '';

  const watchFromRisk =
    sections?.risk?.categories?.[0]?.items?.[0]?.title ?? 'Macro and policy watchpoints';

  return {
    country: payload.country,
    generatedAt: payload.generatedAt,
    platformFreshnessAt: formatStampDate(payload.freshnessAt),
    asOf: {
      macroYear: asOf.macroYear != null ? String(asOf.macroYear) : 'Not covered',
      tradeYear: asOf.tradeYear != null ? String(asOf.tradeYear) : 'Not provided',
      marketsDate: asOf.marketsDate ? formatStampDate(asOf.marketsDate) : 'Not covered',
      policyVerifiedAt: asOf.policyVerifiedAt
        ? formatStampDate(asOf.policyVerifiedAt)
        : 'Unverified',
    },
    signal: {
      badge: payload.signalScan.badge,
      confidence: canonical.signalConfidence,
      drivers: canonical.signalDrivers,
    },
    stance: {
      baseCase: truncate(sections?.opportunity?.lead ?? payload.summary ?? 'Base case pending editorial refresh.', 220),
      topRisks: truncate(sections?.risk?.lead ?? topRiskTitles, 220),
      watchpoints: truncate(
        watchFromPolitical || watchFromRisk || '90-day policy and macro watchpoints in Risk section.',
        220
      ),
    },
  };
}

const COVER_CSS = `
@page { size: A4; margin: 16mm; }

:root{
  --ink:#111827; --muted:#6b7280; --line:#e5e7eb; --accent:#0f766e;
  --bgpanel:#f9fafb;
}

html,body{ margin:0; padding:0; color:var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif; }
*{ box-sizing:border-box; }
.page{ page-break-after: always; }
.cover{ min-height: 1000px; display:flex; flex-direction:column; }

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
`;

export function renderCoverPageHtml(model: CoverPageModel): string {
  const c = model.country;
  const metaParts = [
    c.region ? `Region: ${escapeHtml(c.region)}` : null,
    c.capital ? `Capital: ${escapeHtml(c.capital)}` : null,
    c.currencyCode ? `Currency: ${escapeHtml(c.currencyCode)}` : null,
    `ISO: ${escapeHtml(c.iso3)}${c.iso2 ? ` / ${escapeHtml(c.iso2)}` : ''}`,
  ].filter(Boolean);

  const driverItems = model.signal.drivers
    .map((d) => `<li>${escapeHtml(d)}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(c.name)} — Country Report</title>
  <style>${COVER_CSS}</style>
</head>
<body>
<section class="page cover">
  <div class="topbar">
    <div class="brand">SOUVERA INTELLIGENCE TERMINAL</div>
    <div class="classification">Confidential — Licensed subscriber use only</div>
  </div>

  <div class="titleBlock">
    <h1 class="countryName">${escapeHtml(c.name)}</h1>
    <div class="reportType">Country Report (Institutional)</div>
    <div class="metaLine">${metaParts.join(' • ')}</div>
  </div>

  <div class="panelRow">
    <div class="panel">
      <div class="panelTitle">Freshness &amp; Verification</div>
      <div class="kv">
        <div class="k">Report generated</div><div class="v">${escapeHtml(model.generatedAt)}</div>
        <div class="k">Platform refresh</div><div class="v">${escapeHtml(model.platformFreshnessAt)}</div>
        <div class="k">Macro data as-of</div><div class="v">${escapeHtml(model.asOf.macroYear)}</div>
        <div class="k">Trade data as-of</div><div class="v">${escapeHtml(model.asOf.tradeYear)}</div>
        <div class="k">Markets data as-of</div><div class="v">${escapeHtml(model.asOf.marketsDate)}</div>
        <div class="k">Policy last verified</div><div class="v">${escapeHtml(model.asOf.policyVerifiedAt)}</div>
      </div>
      <div class="panelNote">
        Values shown in this report are sourced and time-stamped. If a field is not verifiable, it is labeled “Not covered” or “Unverified.”
      </div>
    </div>

    <div class="panel signal">
      <div class="panelTitle">Souvera Signal Scan</div>
      <div class="badge">${escapeHtml(model.signal.badge)}</div>
      <div class="confidence">Confidence: <strong>${escapeHtml(model.signal.confidence)}</strong></div>
      <ul class="drivers">${driverItems}</ul>
    </div>
  </div>

  <div class="stance">
    <div class="stanceTitle">At-a-glance (12 months)</div>
    <ul class="stanceBullets">
      <li><strong>Base case:</strong> ${escapeHtml(model.stance.baseCase)}</li>
      <li><strong>Top risks:</strong> ${escapeHtml(model.stance.topRisks)}</li>
      <li><strong>Watchpoints (90d):</strong> ${escapeHtml(model.stance.watchpoints)}</li>
    </ul>
  </div>

  <div class="coverFooter">
    <div class="preparedBy">Prepared by: Souvera Intelligence Terminal — Research Division</div>
    <div class="contact">souveraterminal.com • intelligence@souveraterminal.com</div>
    <div class="disclaimerShort">For informational purposes only. Verify material facts independently before decisions.</div>
  </div>
</section>
</body>
</html>`;
}

export function renderCoverOnlyDocument(
  payload: CountryProfileReportData,
  canonical: CanonicalCountryPayload
): string {
  const model = buildCoverPageModel(payload, canonical);
  return renderCoverPageHtml(model);
}
