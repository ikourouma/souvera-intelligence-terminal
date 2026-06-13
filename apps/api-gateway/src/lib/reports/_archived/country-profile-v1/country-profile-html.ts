/**
 * Country Profile — institutional HTML (7 tabs + Souvera section).
 */

import type { CountryProfileReportData } from '../../country-profile-data';
import { markdownToHtml, sanitizeHtml } from '@/lib/intelligence/markdown';
import type { ReportFact } from '../../country-profile-sections';
import {
  buildContactSheet,
  buildCopyrightSheet,
  buildCoverSheet,
  buildTocSheet,
  CARD_NO_BREAK_CLASS,
  esc,
  sectionBlock,
  wrapReportDocument,
  type TocEntry,
} from '../../templates/report-design-system';

const TOC: TocEntry[] = [
  { id: '1', title: 'About Souvera Intelligence Terminal' },
  { id: '2', title: 'Key Terms & Definitions' },
  { id: '3', title: 'Geography & Location' },
  { id: '4', title: 'Country Introduction' },
  { id: '5', title: 'Political Environment' },
  { id: '6', title: 'Economic Overview' },
  { id: '7', title: 'Trade & Key Sectors' },
  { id: '8', title: 'Investment Opportunity' },
  { id: '9', title: 'Risk Assessment' },
  { id: '10', title: 'Signal Scan & Souvera Edge' },
];

function scoreBar(label: string, value?: number): string {
  const pct = value != null ? Math.min(100, Math.max(0, value)) : 0;
  return `
    <div class="score-row">
      <span class="score-label">${esc(label)}</span>
      <div class="score-track"><div class="score-fill" style="width:${pct}%"></div></div>
      <span>${value != null ? value : '—'}</span>
    </div>`;
}

function factGrid(facts: ReportFact[]): string {
  return `<div class="fact-grid">${facts
    .map(
      (f) => `
    <div class="fact-card ${CARD_NO_BREAK_CLASS}">
      <div class="fact-label">${esc(f.label)}</div>
      <div class="fact-value">${esc(f.value)}</div>
      ${f.note ? `<div class="fact-note">${esc(f.note)}</div>` : ''}
    </div>`
    )
    .join('')}</div>`;
}

function glossaryHtml(glossary: CountryProfileReportData['sections']['glossary']): string {
  return `
    <p class="section-lead">${esc(glossary.intro)}</p>
    ${paragraphsHtml(glossary.paragraphs)}
    <div class="glossary-grid">
      ${glossary.terms
        .map(
          (t) => `
        <div class="glossary-item ${CARD_NO_BREAK_CLASS}">
          <div class="glossary-term">${esc(t.term)}</div>
          <div class="glossary-def">${esc(t.definition)}</div>
        </div>`
        )
        .join('')}
    </div>`;
}

function subsectionIntro(text: string): string {
  return `<p class="subsection-intro">${esc(text)}</p>`;
}

function paragraphsHtml(paragraphs: string[]): string {
  return paragraphs.map((p) => `<p class="section-lead">${esc(p)}</p>`).join('');
}

function bulletsHtml(bullets?: string[]): string {
  if (!bullets?.length) return '';
  return `<ul class="bullet-list">${bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
}

function sectorCards(data: CountryProfileReportData): string {
  if (!data.sectors.length) return '<p class="muted">Sector scorecard pending.</p>';
  return `<div class="sector-cards">${data.sectors
    .map(
      (s) => `
    <div class="sector-card ${CARD_NO_BREAK_CLASS}">
      <div class="sector-card-head">
        <span class="sector-name">${esc(s.label)}</span>
        <span class="sector-scores">S ${s.strength ?? '—'} · G ${s.growth ?? '—'} · A ${s.attractiveness ?? '—'}</span>
      </div>
      <p class="pillar-narrative">${esc(s.teaser ?? 'Curated sector intelligence from Souvera terminal.')}</p>
      ${scoreBar('Strength', s.strength)}
      ${scoreBar('Growth', s.growth)}
      ${scoreBar('Attractiveness', s.attractiveness)}
    </div>`
    )
    .join('')}</div>`;
}

function metricsPanel(data: CountryProfileReportData): string {
  if (!data.metrics.length) return '';
  return `<div class="metrics">${data.metrics
    .map(
      (m) => `
    <div class="metric-card ${CARD_NO_BREAK_CLASS}">
      <div class="metric-label">${esc(m.label)}</div>
      <div class="metric-value">${esc(m.value)}</div>
    </div>`
    )
    .join('')}</div>`;
}

export function buildCountryProfileHtml(data: CountryProfileReportData): string {
  const s = data.sections;
  const dataAsOf = data.freshnessAt
    ? new Date(data.freshnessAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : undefined;

  const cover = buildCoverSheet({
    countryName: data.country.name,
    iso3: data.country.iso3,
    region: data.country.region,
    reportTitle: 'Country Profile',
    reportSubtitle: 'Overview · Economy · Sectors · Opportunity · Risk · Trade',
    generatedAt: data.generatedAt,
    dataAsOf,
  });

  const souveraBody = `
    <p class="section-lead">${esc(s.souvera.intro)}</p>
    ${paragraphsHtml(s.souvera.paragraphs)}
    ${bulletsHtml(s.souvera.bullets)}
    <h3 class="subsection">Terminal Capabilities</h3>
    ${bulletsHtml(s.souvera.capabilities)}`;

  const geographyBody = `
    <p class="section-lead">${esc(s.geography.intro)}</p>
    ${paragraphsHtml(s.geography.paragraphs)}
    ${factGrid(s.geography.facts)}`;

  const introBody = `
    <h3 class="subsection">${esc(s.introduction.headline)}</h3>
    <p class="section-lead">${esc(s.introduction.intro)}</p>
    ${paragraphsHtml(s.introduction.paragraphs.slice(1))}
    ${
      data.summary
        ? `<h3 class="subsection">Executive Summary</h3><div class="prose">${sanitizeHtml(markdownToHtml(data.summary))}</div>`
        : ''
    }
    ${metricsPanel(data)}
    <h3 class="subsection">Why Now — Key Factors</h3>
    ${bulletsHtml(s.introduction.bullets)}`;

  const politicalBody = `
    <p class="section-lead">${esc(s.political.intro)}</p>
    ${paragraphsHtml(s.political.paragraphs)}
    ${s.political.items
      .map(
        (i) => `
      <div class="risk-card ${CARD_NO_BREAK_CLASS}">
        <div class="risk-head">
          <span class="risk-title">${esc(i.title)}</span>
          <span class="risk-severity">${esc(i.severity)}</span>
        </div>
        <p class="pillar-narrative">${esc(i.body)}</p>
        ${i.mitigants?.length ? `<p class="muted"><strong>Mitigants:</strong> ${esc(i.mitigants.join('; '))}</p>` : ''}
      </div>`
      )
      .join('')}`;

  const economicBody = `
    <p class="section-lead">${esc(s.economic.intro)}</p>
    ${paragraphsHtml(s.economic.paragraphs)}
    ${metricsPanel(data)}
    ${s.economic.indicatorBullets.length ? `<h3 class="subsection">Indicator Trajectory</h3>${bulletsHtml(s.economic.indicatorBullets)}` : ''}`;

  const tradeBody = `
    <p class="section-lead">${esc(s.tradeAndSectors.intro)}</p>
    ${paragraphsHtml(s.tradeAndSectors.paragraphs)}
    ${
      data.tradeSummary
        ? `<div class="metrics" style="grid-template-columns: repeat(2, 1fr);">
        <div class="metric-card ${CARD_NO_BREAK_CLASS}"><div class="metric-label">Exports</div><div class="metric-value">${esc(data.tradeSummary.exportsUsd ?? 'N/A')}</div></div>
        <div class="metric-card ${CARD_NO_BREAK_CLASS}"><div class="metric-label">Imports</div><div class="metric-value">${esc(data.tradeSummary.importsUsd ?? 'N/A')}</div></div>
      </div>
      ${
        data.tradeSummary.topPartners.length
          ? `<table class="data-table"><thead><tr><th>Partner</th><th>Share</th></tr></thead><tbody>${data.tradeSummary.topPartners
              .map(
                (p) =>
                  `<tr><td>${esc(p.country)}</td><td>${p.sharePct != null ? `${p.sharePct}%` : '—'}</td></tr>`
              )
              .join('')}</tbody></table>`
          : ''
      }`
        : ''
    }
    <h3 class="subsection">Regional Trade Frameworks</h3>
    ${subsectionIntro(s.tradeAndSectors.regionalFrameworkIntro)}
    ${s.tradeAndSectors.regionalAgreements
      .map(
        (a) => `
      <div class="framework-card ${CARD_NO_BREAK_CLASS}">
        <div class="framework-head"><span class="framework-label">${esc(a.name)}</span></div>
        <p class="pillar-narrative">${esc(a.description)}</p>
      </div>`
      )
      .join('')}
    <h3 class="subsection">Trade Finance Channels</h3>
    ${subsectionIntro(s.tradeAndSectors.tradeFinanceIntro)}
    ${bulletsHtml(s.tradeAndSectors.tradeFinanceBullets)}
    <h3 class="subsection">Key Sectors — Scorecard</h3>
    ${subsectionIntro(s.tradeAndSectors.sectorScorecardIntro)}
    ${sectorCards(data)}
    <h3 class="subsection">Market Access Status</h3>
    ${subsectionIntro(s.tradeAndSectors.marketAccessIntro)}
    ${data.marketAccess
      .map(
        (f) => `
      <div class="framework-card ${CARD_NO_BREAK_CLASS}">
        <div class="framework-head">
          <span class="framework-label">${esc(f.label)}</span>
          <span class="framework-status">${esc(f.statusLabel)}</span>
        </div>
        <p class="pillar-narrative">${esc(f.description)}</p>
      </div>`
      )
      .join('')}`;

  const opportunityBody = `
    <p class="section-lead">${esc(s.opportunity.intro)}</p>
    ${paragraphsHtml(s.opportunity.paragraphs)}
    <div class="callout ${CARD_NO_BREAK_CLASS}">
      <p class="pillar-narrative">${esc(s.opportunity.lead)}</p>
    </div>
    <h3 class="subsection">Investment Pillars</h3>
    ${s.opportunity.pillars
      .map(
        (p) => `
      <div class="pillar-card ${CARD_NO_BREAK_CLASS}">
        <div class="pillar-title">${esc(p.title)}</div>
        ${p.subtitle ? `<div class="pillar-sub">${esc(p.subtitle)}</div>` : ''}
        <p class="pillar-narrative">${esc(p.narrative)}</p>
        ${bulletsHtml(p.bullets)}
      </div>`
      )
      .join('')}
    ${
      s.opportunity.entryPoints.length
        ? `<h3 class="subsection">Investment Entry Points</h3>${subsectionIntro(s.opportunity.entryPointsIntro)}${s.opportunity.entryPoints
            .map(
              (e) => `
      <div class="pillar-card ${CARD_NO_BREAK_CLASS}">
        <div class="pillar-title">${esc(e.title)}</div>
        <p class="pillar-narrative">${esc(e.body)}</p>
      </div>`
            )
            .join('')}`
        : ''
    }
    ${
      s.opportunity.regionalAdvantages.length
        ? `<h3 class="subsection">Regional Advantages</h3>${subsectionIntro(s.opportunity.regionalAdvantagesIntro)}${s.opportunity.regionalAdvantages
            .map(
              (a) => `
      <div class="pillar-card ${CARD_NO_BREAK_CLASS}">
        <div class="pillar-title">${esc(a.title)}</div>
        <p class="pillar-narrative">${esc(a.body)}</p>
      </div>`
            )
            .join('')}`
        : ''
    }`;

  const riskBody = `
    <p class="section-lead">${esc(s.risk.intro)}</p>
    ${paragraphsHtml(s.risk.paragraphs)}
    <div class="callout ${CARD_NO_BREAK_CLASS}">
      <p class="pillar-narrative">${esc(s.risk.lead)}</p>
    </div>
    ${s.risk.categories
      .map(
        (cat) => `
      <h3 class="subsection">${esc(cat.title)}</h3>
      ${cat.items
        .map(
          (i) => `
        <div class="risk-card ${CARD_NO_BREAK_CLASS}">
          <div class="risk-head">
            <span class="risk-title">${esc(i.title)}</span>
            ${i.severity ? `<span class="risk-severity">${esc(i.severity)}</span>` : ''}
          </div>
          <p class="pillar-narrative">${esc(i.body)}</p>
          ${
            i.mitigants?.length
              ? `<p class="muted" style="margin-top:8px"><strong>Mitigants:</strong></p>${bulletsHtml(i.mitigants)}`
              : ''
          }
        </div>`
        )
        .join('')}`
      )
      .join('')}
    <h3 class="subsection">Mitigation Strategies</h3>
    ${subsectionIntro(s.risk.mitigationIntro)}
    ${s.risk.mitigationStrategies
      .map(
        (m) => `
      <div class="mitigation-card ${CARD_NO_BREAK_CLASS}">
        <div class="pillar-title">${esc(m.title)}</div>
        <p class="pillar-narrative">${esc(m.body)}</p>
      </div>`
      )
      .join('')}
    ${
      s.risk.closingSummary
        ? `<div class="callout ${CARD_NO_BREAK_CLASS}" style="margin-top:16px">
        <div class="callout-badge">Risk-Adjusted Outlook</div>
        <p class="pillar-narrative">${esc(s.risk.closingSummary)}</p>
      </div>`
        : ''
    }`;

  const signalBody = `
    <p class="section-lead">${esc(s.signalAndDifferentiation.intro)}</p>
    <div class="callout ${CARD_NO_BREAK_CLASS}">
      <div class="callout-badge">${esc(s.signalAndDifferentiation.badge)}</div>
      <ul class="bullet-list">
        <li>${esc(s.signalAndDifferentiation.signalBullets[0])}</li>
        <li>${esc(s.signalAndDifferentiation.signalBullets[1])}</li>
      </ul>
    </div>
    ${paragraphsHtml(s.signalAndDifferentiation.paragraphs)}
    <h3 class="subsection">What Bloomberg & Afreximbank Briefs Don't Include</h3>
    <div class="diff-grid">
      ${s.signalAndDifferentiation.differentiators
        .map((d) => `<div class="diff-item ${CARD_NO_BREAK_CLASS}">${esc(d)}</div>`)
        .join('')}
    </div>
    <div class="disclaimer-block">
      <strong>Sources:</strong> ${esc(data.sources)}<br/>
      <strong>Methodology:</strong> Terminal tab content, Souvera data foundation, World Bank, IMF, UN Comtrade.
      Regenerate from the Reports tab for the latest refresh. Verify material facts independently before investment decisions.
    </div>`;

  const content = `
    ${cover}
    ${buildCopyrightSheet()}
    ${buildTocSheet(TOC)}
    <div class="content-body">
      ${sectionBlock(1, 'About Souvera Intelligence Terminal', souveraBody, { major: true })}
      ${sectionBlock(2, 'Key Terms & Definitions', glossaryHtml(s.glossary), { major: true })}
      ${sectionBlock(3, 'Geography & Location', geographyBody, { major: true })}
      ${sectionBlock(4, 'Country Introduction', introBody, { major: true })}
      ${sectionBlock(5, 'Political Environment', politicalBody, { major: true })}
      ${sectionBlock(6, 'Economic Overview', economicBody, { major: true })}
      ${sectionBlock(7, 'Trade & Key Sectors', tradeBody, { major: true })}
      ${sectionBlock(8, 'Investment Opportunity', opportunityBody, { major: true })}
      ${sectionBlock(9, 'Risk Assessment', riskBody, { major: true })}
      ${sectionBlock(10, 'Signal Scan & Souvera Edge', signalBody, { major: true })}
    </div>
    ${buildContactSheet()}`;

  return wrapReportDocument(`${data.country.name} Country Profile — Souvera`, content);
}

export { TOC as COUNTRY_PROFILE_TOC };
