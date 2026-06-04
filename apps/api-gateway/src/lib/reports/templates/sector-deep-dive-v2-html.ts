/**
 * Sector Deep-Dive v2 — institutional HTML (Puppeteer).
 */

import type { SectorDeepDiveReportData } from '../sector-deep-dive-data';
import {
  escapeHtml,
  REPORT_V2_PRINT_CSS,
  renderMethodologyProvidersHtml,
  tableHtml,
} from './report-v2-shared';

function proseBlock(paragraphs: string[]): string {
  return paragraphs
    .filter(Boolean)
    .map((p) => `<p class="prose">${escapeHtml(p)}</p>`)
    .join('');
}

function notCoveredCard(title: string, note: string): string {
  return `
    <div class="not-covered">
      <div class="not-covered-title">${escapeHtml(title)}</div>
      <div class="not-covered-value">Not covered</div>
      <div class="not-covered-note">${escapeHtml(note)}</div>
    </div>
  `;
}

export function renderSectorDeepDiveV2Html(data: SectorDeepDiveReportData): string {
  const { country, sector, scorecard } = data;

  const macroAsOf = data.macroAsOfYear != null ? String(data.macroAsOfYear) : 'Not covered';

  const scoreRows: string[][] = scorecard.covered
    ? [
        ['Strength (S)', scorecard.strength != null ? String(scorecard.strength) : 'Not covered'],
        ['Growth (G)', scorecard.growth != null ? String(scorecard.growth) : 'Not covered'],
        [
          'Attractiveness (A)',
          scorecard.attractiveness != null ? String(scorecard.attractiveness) : 'Not covered',
        ],
      ]
    : [['Sector scorecard', 'Not covered']];

  const policyRows = (data.policyFrameworks ?? []).map((p) => [
    p.framework,
    p.status,
    p.source,
    p.reviewed,
  ]);

  const playersHtml =
    data.keyPlayers.length > 0
      ? `<ul class="compact">${data.keyPlayers
          .map(
            (p) =>
              `<li><strong>${escapeHtml(p.name)}</strong>${
                p.role ? ` — ${escapeHtml(p.role)}` : ''}</li>`
          )
          .join('')}</ul>`
      : '<p class="muted">Key players: Not covered</p>';

  const opportunityBullets = [
    'Joint venture structures with local operators where licensing requires domestic participation.',
    'Private equity and growth capital for platform roll-ups in fragmented sub-segments.',
    'Greenfield entry where regulatory clarity and FX convertibility support long-dated cash flows.',
  ];

  const riskBullets = [
    'Policy and licensing changes affecting sector entry and repatriation.',
    'FX and inflation exposure on local-currency costs versus USD-denominated returns.',
    'Operational and supply-chain concentration in single markets or partners.',
  ];

  const mitigantBullets = [
    'Stage-gate diligence on regulatory filings and counterparties.',
    'Hedging and natural offsets where available; conservative base-case FX assumptions.',
    'Diversified offtake or demand channels where sector concentration risk is elevated.',
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(country.name)} — ${escapeHtml(sector.label)} Deep-Dive</title>
<style>${REPORT_V2_PRINT_CSS}</style>
</head>
<body>

<!-- COVER -->
<div class="page cover">
  <div class="topbar">
    <span class="brand">SOUVERA</span>
    <span class="classification">Sector Deep-Dive (Institutional)</span>
  </div>

  <div class="titleBlock">
    <h1 class="countryName">${escapeHtml(country.name)}</h1>
    <p class="reportType">${escapeHtml(sector.label)}</p>
    <p class="metaLine">Generated ${escapeHtml(data.generatedAt)} · ${escapeHtml(country.iso3)}</p>
  </div>

  <div class="panel">
    <div class="panelTitle">Scope</div>
    ${proseBlock([
      `This brief provides a single-sector view of ${sector.label} in ${country.name} for institutional readers.`,
      `Macro reference year: ${macroAsOf}. Sector scorecards and policy statuses render only when present in Souvera's structured datasets.`,
      `If a field is not covered, it is labeled "Not covered" rather than inferred.`,
    ])}
  </div>
</div>

<!-- PAGE: SECTOR OVERVIEW + SCORECARD -->
<div class="page">
  <h1>Sector overview</h1>

  <p class="lead">${escapeHtml(
    `${sector.label} in ${country.name} — ${
      scorecard.covered ? 'structured sector data on file' : 'sector row not yet seeded; narrative shown without unsourced numerics'
    }.`
  )}</p>

  ${
    data.teaser
      ? `<p class="prose">${escapeHtml(data.teaser)}</p>`
      : '<p class="muted">Sector teaser: Not covered</p>'
  }

  <h2>Scorecard (S/G/A)</h2>

  ${proseBlock([
    `The Souvera scorecard summarizes current sector positioning ("Strength"), expansion momentum ("Growth"), and investability ("Attractiveness") on a 0–100 scale.`,
    scorecard.covered
      ? `Scores shown below are available for this country/sector as of the latest structured refresh (macro reference year: ${macroAsOf}).`
      : `This country/sector does not yet have a structured scorecard row on file. Treat this section as "Not covered" until seeded.`,
    `Interpretation: scores are directional and model-based; they are not credit ratings and should be validated in diligence.`,
  ])}

  ${
    scorecard.covered
      ? tableHtml(['Dimension', 'Score / status'], scoreRows)
      : notCoveredCard('Scorecard', 'Sector scorecard is not yet available in structured country sector data.')
  }

  <p class="muted">Method note: S/G/A is a platform scoring framework. See "Sources & methodology" for limits.</p>
</div>

<!-- PAGE: SUB-SEGMENTS + PLAYERS + POLICY TABLE -->
<div class="page">
  <h1>Sub-segments & operating context</h1>

  ${
    data.narrativeShort
      ? `<p class="prose">${escapeHtml(data.narrativeShort)}</p>`
      : '<p class="muted">Sub-segment detail: Not covered</p>'
  }

  <h2>Key players</h2>
  ${playersHtml}

  <h2>Regulatory & policy considerations</h2>

  ${proseBlock([
    `Sector outcomes are shaped by licensing, local content rules, trade preference frameworks, and cross-border operating constraints.`,
    `The table below summarizes relevant market-access and policy frameworks for this country as recorded in Souvera's evidence-backed policy registry.`,
    `If a framework is "Under review," validate status before structuring investments or export strategies.`,
  ])}

  ${
    policyRows.length
      ? tableHtml(['Framework', 'Status', 'Source', 'Last reviewed'], policyRows)
      : notCoveredCard('Policy registry', 'No policy framework records are available for this sector/country in the registry.')
  }
</div>

<!-- PAGE: OPPORTUNITY ARCHETYPES + RISKS -->
<div class="page">
  <h1>Opportunity archetypes</h1>

  ${proseBlock([
    `The opportunity archetypes below reflect common institutional entry routes for the sector.`,
    `These are template structures; customize based on local licensing, FX convertibility, counterparties, and timeline.`,
  ])}

  <ul class="compact">${opportunityBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>

  <h2>Risk & mitigants</h2>

  ${proseBlock([
    `Key risks are grouped into policy/regulatory, macro (FX/inflation), and operational factors.`,
    `Mitigants listed are standard tools used by DFIs, sponsors, and corporates operating in emerging markets.`,
  ])}

  <ul class="compact">${riskBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>

  <h3>Mitigants</h3>
  <ul class="compact">${mitigantBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>

  ${
    data.narrativeFull
      ? `<h2>Extended sector narrative</h2><p class="prose">${escapeHtml(data.narrativeFull)}</p>`
      : ''
  }
</div>

<!-- PAGE: SOURCES & METHODOLOGY -->
<div class="page">
  <h1>Sources & methodology</h1>

  ${proseBlock([
    `Provider attribution is listed below. This document does not embed raw source URLs in the client-facing PDF; evidence artifacts and retrieval metadata are stored internally for audit.`,
    `Where a metric is "Not covered," Souvera is indicating that no structured series or evidence-backed record is available in this environment at report time.`,
  ])}

  ${renderMethodologyProvidersHtml()}

  <p class="muted">© Souvera Intelligence — informational only; not investment advice.</p>
</div>

</body>
</html>`;
}
