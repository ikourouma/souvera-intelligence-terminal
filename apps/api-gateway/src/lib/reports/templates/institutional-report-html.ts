/**
 * Institutional HTML templates for Business+ report types (R1 elevated shell).
 */

import { markdownToHtml, sanitizeHtml } from '@/lib/intelligence/markdown';
import type { CountryProfileReportData } from '../country-profile-data';
import type { ReportTemplateContext } from '../templates';
import {
  buildCopyrightSheet,
  buildCoverSheet,
  buildTocSheet,
  esc,
  sectionBlock,
  wrapReportDocument,
  type TocEntry,
} from './report-design-system';

function proseBlock(md: string | undefined, fallback: string): string {
  if (md) {
    return `<div class="prose">${sanitizeHtml(markdownToHtml(md))}</div>`;
  }
  return `<p class="lead muted">${esc(fallback)}</p>`;
}

function metricsGrid(data: CountryProfileReportData): string {
  if (!data.metrics.length) return '<p class="muted">Macro indicators refreshing.</p>';
  return `<div class="metrics">${data.metrics
    .map(
      (m) => `
    <div class="metric-card">
      <div class="metric-label">${esc(m.label)}</div>
      <div class="metric-value">${esc(m.value)}</div>
    </div>`
    )
    .join('')}</div>`;
}

function sectorsTable(data: CountryProfileReportData): string {
  if (!data.sectors.length) return '<p class="muted">Sector scorecard pending.</p>';
  return `<table class="data-table">
    <thead><tr><th>Sector</th><th>S · G · A</th><th>Notes</th></tr></thead>
    <tbody>${data.sectors
      .map((s) => {
        const scores = [s.strength, s.growth, s.attractiveness]
          .map((v) => (v != null ? String(v) : '—'))
          .join(' · ');
        return `<tr>
          <td><strong>${esc(s.label)}</strong></td>
          <td>${esc(scores)}</td>
          <td class="muted">${esc(s.teaser ?? 'Curated sector intelligence')}</td>
        </tr>`;
      })
      .join('')}</tbody>
  </table>`;
}

function tradeBlock(data: CountryProfileReportData): string {
  const t = data.tradeSummary;
  if (!t) return '<p class="muted">Trade composition data expanding for this market.</p>';
  return `
    <div class="metrics" style="grid-template-columns: repeat(2, 1fr);">
      <div class="metric-card"><div class="metric-label">Exports</div><div class="metric-value">${esc(t.exportsUsd ?? 'N/A')}</div></div>
      <div class="metric-card"><div class="metric-label">Imports</div><div class="metric-value">${esc(t.importsUsd ?? 'N/A')}</div></div>
    </div>
    ${
      t.topPartners.length
        ? `<table class="data-table"><thead><tr><th>Partner</th><th>Share</th></tr></thead><tbody>${t.topPartners
            .map(
              (p) =>
                `<tr><td>${esc(p.country)}</td><td>${p.sharePct != null ? `${p.sharePct}%` : '—'}</td></tr>`
            )
            .join('')}</tbody></table>`
        : ''
    }`;
}

function marketAccessBlock(data: CountryProfileReportData): string {
  if (!data.marketAccess.length) return '<p class="muted">Framework mapping in progress.</p>';
  return data.marketAccess
    .map(
      (f) => `
    <div class="framework-card">
      <div class="framework-head">
        <span class="framework-label">${esc(f.label)}</span>
        <span class="framework-status">${esc(f.statusLabel)}</span>
      </div>
      <p class="muted">${esc(f.description)}</p>
    </div>`
    )
    .join('');
}

function signalBlock(data: CountryProfileReportData): string {
  return `
    <div class="callout">
      <div class="callout-badge">${esc(data.signalScan.badge)}</div>
      <ul><li>${esc(data.signalScan.bullets[0])}</li><li>${esc(data.signalScan.bullets[1])}</li></ul>
    </div>`;
}

function disclaimer(data: CountryProfileReportData): string {
  return `
    <div class="disclaimer-block">
      <strong>Sources:</strong> ${esc(data.sources)}<br/>
      <strong>Methodology:</strong> Souvera curated intelligence, World Bank, IMF, UN Comtrade.
      Verify material facts independently before investment decisions.
    </div>`;
}

const REPORT_META: Record<
  string,
  { title: string; subtitle: string; toc: TocEntry[]; buildSections: (ctx: ReportTemplateContext, data: CountryProfileReportData) => string }
> = {
  'Investment Memo': {
    title: 'Investment Memo',
    subtitle: 'Opportunity thesis, entry points, and institutional risk scorecard',
    toc: [
      { id: '1', title: 'Executive Summary' },
      { id: '2', title: 'Investment Thesis' },
      { id: '3', title: 'Macro & Signal Context' },
      { id: '4', title: 'Sector Entry Points' },
      { id: '5', title: 'Risk Assessment & Mitigants' },
      { id: '6', title: 'Market Access & Timing' },
    ],
    buildSections: (ctx, data) => {
      const thesis =
        ctx.opportunityThesis ?? data.opportunityThesis ?? data.whyNow;
      const risk = ctx.riskNarrative ?? data.riskNarrative;
      const summary = ctx.summary ?? data.summary;
      return `
        ${sectionBlock(1, 'Executive Summary', proseBlock(summary, `${data.country.name} investment memo prepared for institutional allocators.`), { opener: true })}
        ${sectionBlock(2, 'Investment Thesis', proseBlock(thesis, 'Investment thesis narrative will populate from country opportunity editorial.'))}
        ${sectionBlock(3, 'Macro & Signal Context', `<p class="muted">Headline indicators and Souvera signal synthesis</p>${metricsGrid(data)}${signalBlock(data)}`)}
        ${sectionBlock(4, 'Sector Entry Points', `<p class="muted">Top sectors by strength · growth · attractiveness</p>${sectorsTable(data)}`)}
        ${sectionBlock(5, 'Risk Assessment & Mitigants', proseBlock(risk, 'Risk narrative will populate from country risk editorial.'))}
        ${sectionBlock(6, 'Market Access & Timing', `${marketAccessBlock(data)}${data.whyNow ? `<h3 class="subsection">Why Now</h3>${proseBlock(data.whyNow, '')}` : ''}`)}
        ${disclaimer(data)}`;
    },
  },
  'Trade Profile': {
    title: 'Trade Profile',
    subtitle: 'Bilateral flows, partner concentration, and preferential market access',
    toc: [
      { id: '1', title: 'Executive Summary' },
      { id: '2', title: 'Bilateral Trade Overview' },
      { id: '3', title: 'Top Trading Partners' },
      { id: '4', title: 'Market Access Programs' },
      { id: '5', title: 'Trade Outlook & Signals' },
    ],
    buildSections: (ctx, data) => {
      const summary =
        ctx.summary ??
        data.summary ??
        `${data.country.name} trade profile covering bilateral flows, partner concentration, and preferential access frameworks relevant to U.S. and regional exporters.`;
      return `
        ${sectionBlock(1, 'Executive Summary', proseBlock(typeof summary === 'string' ? summary : undefined, summary as string), { opener: true })}
        ${sectionBlock(2, 'Bilateral Trade Overview', tradeBlock(data))}
        ${sectionBlock(3, 'Top Trading Partners', `<p class="muted">Partner share from curated trade registries</p>${tradeBlock(data)}`)}
        ${sectionBlock(4, 'Market Access Programs', marketAccessBlock(data))}
        ${sectionBlock(5, 'Trade Outlook & Signals', signalBlock(data))}
        ${disclaimer(data)}`;
    },
  },
  'Sector Deep-Dive': {
    title: 'Sector Deep-Dive',
    subtitle: 'Sector scorecard, players, and market-access fit for priority verticals',
    toc: [
      { id: '1', title: 'Executive Summary' },
      { id: '2', title: 'Sector Scorecard' },
      { id: '3', title: 'Macro Context' },
      { id: '4', title: 'Market Access for Exporters' },
      { id: '5', title: 'Risks & Opportunities' },
    ],
    buildSections: (ctx, data) => {
      const leadSector = data.sectors[0]?.label ?? 'Priority sector';
      const summary =
        ctx.summary ??
        data.summary ??
        `Sector deep-dive for ${leadSector} in ${data.country.name}, with Souvera strength · growth · attractiveness scoring and export-access mapping.`;
      return `
        ${sectionBlock(1, 'Executive Summary', proseBlock(typeof summary === 'string' ? summary : undefined, summary as string), { opener: true })}
        ${sectionBlock(2, 'Sector Scorecard', `<h3 class="subsection">Focus: ${esc(leadSector)}</h3>${sectorsTable(data)}`)}
        ${sectionBlock(3, 'Macro Context', metricsGrid(data))}
        ${sectionBlock(4, 'Market Access for Exporters', marketAccessBlock(data))}
        ${sectionBlock(5, 'Risks & Opportunities', `${proseBlock(ctx.riskNarrative ?? data.riskNarrative, 'Risk factors from country editorial.')}<h3 class="subsection">Signal Momentum</h3>${signalBlock(data)}`)}
        ${disclaimer(data)}`;
    },
  },
  'AI Custom Report': {
    title: 'Custom Intelligence Brief',
    subtitle: 'AI-assisted research brief grounded in Souvera country intelligence',
    toc: [
      { id: '1', title: 'Research Query' },
      { id: '2', title: 'Executive Summary' },
      { id: '3', title: 'Country Context' },
      { id: '4', title: 'Risk Considerations' },
      { id: '5', title: 'Data Appendix' },
    ],
    buildSections: (ctx, data) => {
      const query = ctx.query ?? 'Custom intelligence query';
      const summary = ctx.summary ?? data.summary;
      return `
        ${sectionBlock(1, 'Research Query', `<div class="callout"><p class="lead">${esc(query)}</p></div>`, { opener: true })}
        ${sectionBlock(2, 'Executive Summary', proseBlock(summary, `${data.country.name} brief synthesized from Souvera intelligence foundation.`))}
        ${sectionBlock(3, 'Country Context', `${metricsGrid(data)}${signalBlock(data)}${sectorsTable(data)}`)}
        ${sectionBlock(4, 'Risk Considerations', proseBlock(ctx.riskNarrative ?? data.riskNarrative, 'Risk narrative from country profile.'))}
        ${sectionBlock(5, 'Data Appendix', `${marketAccessBlock(data)}${tradeBlock(data)}${disclaimer(data)}`)}
      `;
    },
  },
  'Country Risk': {
    title: 'Country Risk Report',
    subtitle: 'Political, economic, and operational risk synthesis for institutional risk committees',
    toc: [
      { id: '1', title: 'Risk Executive Summary' },
      { id: '2', title: 'Macro Risk Indicators' },
      { id: '3', title: 'Political & Policy Risk' },
      { id: '4', title: 'Economic & FX Risk' },
      { id: '5', title: 'Mitigants & Monitoring' },
    ],
    buildSections: (ctx, data) => {
      const risk = ctx.riskNarrative ?? data.riskNarrative;
      return `
        ${sectionBlock(1, 'Risk Executive Summary', proseBlock(risk, `${data.country.name} risk profile for committee review.`), { opener: true })}
        ${sectionBlock(2, 'Macro Risk Indicators', metricsGrid(data))}
        ${sectionBlock(3, 'Political & Policy Risk', marketAccessBlock(data))}
        ${sectionBlock(4, 'Economic & FX Risk', signalBlock(data))}
        ${sectionBlock(5, 'Mitigants & Monitoring', proseBlock(data.whyNow, 'Monitoring triggers from Souvera signal scan and editorial.') + disclaimer(data))}
      `;
    },
  },
};

export function buildInstitutionalReportHtml(
  reportType: string,
  ctx: ReportTemplateContext,
  data: CountryProfileReportData
): string {
  const meta = REPORT_META[reportType];
  if (!meta) {
    throw new Error(`No institutional template for report type: ${reportType}`);
  }

  const dataAsOf = data.freshnessAt
    ? new Date(data.freshnessAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : undefined;

  const cover = buildCoverSheet({
    countryName: data.country.name,
    iso3: data.country.iso3,
    region: data.country.region,
    reportTitle: meta.title,
    reportSubtitle: meta.subtitle,
    editionLabel: 'Souvera Intelligence Terminal · Research Division',
    generatedAt: data.generatedAt,
    dataAsOf,
    classification: 'Professional Intelligence · Licensed subscriber use only',
  });

  const content = `
    ${cover}
    ${buildCopyrightSheet()}
    ${buildTocSheet(meta.toc)}
    <div class="content-body sheet">
      ${meta.buildSections(ctx, data)}
    </div>`;

  return wrapReportDocument(`${data.country.name} ${meta.title} — Souvera`, content);
}
