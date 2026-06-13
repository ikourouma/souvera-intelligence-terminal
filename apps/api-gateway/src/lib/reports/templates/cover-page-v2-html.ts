/**
 * Institutional cover page — A4 HTML/CSS for Puppeteer (report v2).
 */

import type { CountryProfileReportData } from '../country-profile-data';
import type { CanonicalCountryPayload, CoverPageModel } from '@/types/report-integrity';
import { formatReportStampDate } from '../report-dates';
import { REPORT_V2_PRINT_CSS, truncateAtSentence } from './report-v2-shared';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildCoverPageModel(
  payload: CountryProfileReportData,
  canonical: CanonicalCountryPayload
): CoverPageModel {
  const { asOf, dataCoverage } = canonical;
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

  const marketsCoverage = dataCoverage.hasMarketsFeed
    ? asOf.marketsDate
      ? formatReportStampDate(asOf.marketsDate)
      : 'On file'
    : 'Not covered';

  return {
    country: payload.country,
    generatedAt: payload.generatedAt,
    platformFreshnessAt: formatReportStampDate(payload.freshnessAt),
    asOf: {
      macroYear: asOf.macroYear != null ? String(asOf.macroYear) : 'Not covered',
      tradeYear: asOf.tradeYear != null ? String(asOf.tradeYear) : 'Not provided',
      marketsCoverage,
      policyVerifiedAt: asOf.policyVerifiedAt
        ? formatReportStampDate(asOf.policyVerifiedAt)
        : 'Not covered',
    },
    signal: {
      badge: payload.signalScan.badge,
      confidence: canonical.signalConfidence,
      drivers: canonical.signalDrivers,
    },
    stance: {
      baseCase: truncateAtSentence(
        sections?.opportunity?.lead ?? payload.summary ?? 'Base case pending editorial refresh.',
        220
      ),
      topRisks: truncateAtSentence(sections?.risk?.lead ?? topRiskTitles, 220),
      watchpoints: truncateAtSentence(
        watchFromPolitical || watchFromRisk || '90-day policy and macro watchpoints in Risk section.',
        220
      ),
    },
  };
}

/** Cover-specific classes only — print rules live in REPORT_V2_PRINT_CSS. */
export const COVER_V2_CSS = '';

export function renderCoverPageSection(model: CoverPageModel): string {
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

  return `<section class="page cover">
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
      <div class="panelTitle">Freshness &amp; Data stamps</div>
      <div class="kv">
        <div class="k">Report generated</div><div class="v">${escapeHtml(model.generatedAt)}</div>
        <div class="k">Platform refresh</div><div class="v">${escapeHtml(model.platformFreshnessAt)}</div>
        <div class="k">Macro data as-of</div><div class="v">${escapeHtml(model.asOf.macroYear)}</div>
        <div class="k">Trade data as-of</div><div class="v">${escapeHtml(model.asOf.tradeYear)}</div>
        <div class="k">Markets coverage</div><div class="v">${escapeHtml(model.asOf.marketsCoverage)}</div>
        <div class="k">Policy last reviewed</div><div class="v">${escapeHtml(model.asOf.policyVerifiedAt)}</div>
      </div>
      <div class="panelNote">
        Values shown in this report are sourced and time-stamped. Platform refresh is not a markets feed. Fields without structured backing are labeled Not covered.
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
</section>`;
}

export function renderCoverPageHtml(model: CoverPageModel): string {
  const c = model.country;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(c.name)} — Country Report</title>
  <style>${REPORT_V2_PRINT_CSS}</style>
</head>
<body>
${renderCoverPageSection(model)}
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
