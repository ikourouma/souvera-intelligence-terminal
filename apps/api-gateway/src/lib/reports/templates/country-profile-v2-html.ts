/**
 * Full Country Profile v2 — multi-page institutional HTML for Puppeteer.
 */

import { buildCoverPageModel, renderCoverPageSection } from './cover-page-v2-html';
import {
  buildClientPolicyTableRows,
  buildDataCoverageLimitationsHtml,
  buildRiskHeatmapRows,
  escapeHtml,
  fmtPct,
  fmtUsd,
  formatMetricSourceName,
  paragraphsHtml,
  priorMacroYear,
  renderCoverageCard,
  renderMethodologyProvidersHtml,
  REPORT_V2_PRINT_CSS,
  tableHtml,
  truncateAtSentence,
  type CountryProfileV2Model,
} from './report-v2-shared';
import { neutralizeClientNumericClaims } from '../narrative-client-safe';
import {
  COUNTRY_PROFILE_TEMPLATE_ID,
  renderReportTemplateStampFooter,
} from '../report-template-stamp';

function renderDashboard(model: CountryProfileV2Model): string {
  const { payload, canonical } = model;
  const cm = canonical.canonicalMetrics;
  const macroYear = canonical.asOf.macroYear;
  const prior = priorMacroYear(payload.economyYears, macroYear);

  const intro = [
    `${payload.country.name} is profiled with macro data as-of ${macroYear ?? 'Not covered'} and platform refresh ${payload.freshnessAt ? 'on file' : 'pending'}.`,
    `Canonical GDP growth is ${fmtPct(cm.gdpGrowthPct)} with nominal GDP ${fmtUsd(cm.gdpCurrentUsd)}; inflation ${fmtPct(cm.inflationCpiPct)}; FDI ${fmtUsd(cm.fdiNetInflowsUsd)}.`,
    'Figures below are drawn from structured series and the policy registry — not headline display strings.',
  ];

  const macroRows: string[][] = [
    [
      'GDP (nominal USD)',
      fmtUsd(cm.gdpCurrentUsd),
      prior?.gdp_current_usd != null ? fmtUsd(prior.gdp_current_usd) : '—',
      macroYear != null ? String(macroYear) : 'Not covered',
      formatMetricSourceName(payload, 'gdp_current_usd'),
    ],
    [
      'GDP growth',
      fmtPct(cm.gdpGrowthPct),
      prior?.gdp_growth_pct != null ? fmtPct(prior.gdp_growth_pct) : '—',
      macroYear != null ? String(macroYear) : 'Not covered',
      formatMetricSourceName(payload, 'gdp_growth_pct'),
    ],
    [
      'Inflation (CPI)',
      fmtPct(cm.inflationCpiPct),
      prior?.inflation_cpi_pct != null ? fmtPct(prior.inflation_cpi_pct) : '—',
      macroYear != null ? String(macroYear) : 'Not covered',
      formatMetricSourceName(payload, 'inflation_cpi_pct'),
    ],
    [
      'FDI net inflows',
      fmtUsd(cm.fdiNetInflowsUsd),
      prior?.fdi_net_inflows_usd != null ? fmtUsd(prior.fdi_net_inflows_usd) : '—',
      macroYear != null ? String(macroYear) : 'Not covered',
      formatMetricSourceName(payload, 'fdi_net_inflows_usd'),
    ],
    [
      'FX (local/USD)',
      cm.fxToUsd != null ? cm.fxToUsd.toFixed(2) : '—',
      prior?.fx_to_usd != null ? prior.fx_to_usd.toFixed(2) : '—',
      macroYear != null ? String(macroYear) : 'Not covered',
      formatMetricSourceName(payload, 'fx_to_usd'),
    ],
  ];

  const marketsPanel = canonical.dataCoverage.hasMarketsFeed
    ? `<div class="card"><div class="cardTitle">Markets feed</div><div class="cardValue">On file</div></div>`
    : renderCoverageCard(
        'Markets Coverage',
        'Platform refresh timestamp is not a markets feed. Rates, curves, and spreads are not included in this edition.'
      );

  const trade = payload.tradeSummary;
  const tradePanel = trade
    ? `<div class="grid2">
        <div class="card"><div class="cardTitle">Exports</div><div class="cardValue">${escapeHtml(trade.exportsUsd ?? '—')}</div></div>
        <div class="card"><div class="cardTitle">Imports</div><div class="cardValue">${escapeHtml(trade.importsUsd ?? '—')}</div></div>
      </div>
      <p class="muted">Trade as-of: ${canonical.asOf.tradeYear ?? 'Not provided'}</p>
      ${trade.topPartners?.length ? tableHtml(['Partner', 'Share %'], trade.topPartners.map((p) => [p.country, p.sharePct != null ? `${p.sharePct}%` : '—'])) : ''}`
    : `<div class="box-warn"><strong>Trade summary:</strong> Not provided.</div>`;

  const policyRows = buildClientPolicyTableRows(payload.country.iso3);

  const sectorRows = payload.sectors.slice(0, 5).map((s) => [
    s.label,
    s.strength != null ? String(s.strength) : '—',
    s.growth != null ? String(s.growth) : '—',
    s.attractiveness != null ? String(s.attractiveness) : '—',
  ]);

  const riskHeat = buildRiskHeatmapRows(model);

  const externalRows: string[][] = [];
  const macroRow =
    macroYear != null ? payload.economyYears.find((y) => y.year === macroYear) : undefined;
  if (macroRow && canonical.dataCoverage.hasExternalSectorSeries) {
    if (macroRow.current_account_pct_gdp != null) {
      externalRows.push(['Current account (% GDP)', fmtPct(macroRow.current_account_pct_gdp)]);
    }
    if (macroRow.reserves_total_usd != null) {
      externalRows.push(['Total reserves', fmtUsd(macroRow.reserves_total_usd)]);
    }
    if (macroRow.reserves_months_imports != null) {
      externalRows.push(['Reserves (months imports)', String(macroRow.reserves_months_imports.toFixed(1))]);
    }
    if (macroRow.remittances_received_usd != null) {
      externalRows.push(['Remittances received', fmtUsd(macroRow.remittances_received_usd)]);
    }
  }
  const externalBlock = canonical.dataCoverage.hasExternalSectorSeries && externalRows.length
    ? `<h2>External Sector</h2>${tableHtml(['Indicator', 'Latest'], externalRows)}<p class="muted">Source: World Bank WDI (${macroYear ?? 'n/a'})</p>`
    : `<h2>External Sector</h2>${renderCoverageCard('External Sector', 'Current account, reserves, and remittances series not yet populated for this country.')}`;

  return `<section class="page">
    <h1>Dashboard</h1>
    ${paragraphsHtml(intro)}
    <h2>Macro Snapshot</h2>
    ${tableHtml(['Indicator', 'Latest', 'Prior', 'As-of', 'Source'], macroRows)}
    <div class="grid2" style="margin-top:12px">
      <div>${marketsPanel}</div>
      <div><h3>Trade</h3>${tradePanel}</div>
    </div>
    <h2>Market Access (Registry)</h2>
    ${tableHtml(['Framework', 'Status', 'Source', 'Last reviewed'], policyRows)}
    ${externalBlock}
    <h2>Risk Heatmap</h2>
    ${tableHtml(['Domain', 'Level'], riskHeat)}
    <h2>Sector Leaderboard</h2>
    ${sectorRows.length ? tableHtml(['Sector', 'Strength', 'Growth', 'Attractiveness'], sectorRows) : '<p class="muted">No sector scorecard data.</p>'}
  </section>`;
}

function renderExecutiveSummary(model: CountryProfileV2Model): string {
  const { payload, canonical } = model;
  const s = payload.sections;
  const macroYear = canonical.asOf.macroYear;
  const prior = priorMacroYear(payload.economyYears, macroYear);

  const deltas: string[] = [];
  if (prior && macroYear && prior.gdp_growth_pct != null && canonical.canonicalMetrics.gdpGrowthPct != null) {
    const d = canonical.canonicalMetrics.gdpGrowthPct - prior.gdp_growth_pct;
    deltas.push(`GDP growth moved ${d >= 0 ? '+' : ''}${d.toFixed(1)} pp (${prior.year}→${macroYear}).`);
  }
  if (prior?.gdp_current_usd && canonical.canonicalMetrics.gdpCurrentUsd) {
    const pct =
      ((canonical.canonicalMetrics.gdpCurrentUsd - prior.gdp_current_usd) / prior.gdp_current_usd) * 100;
    deltas.push(
      `Nominal GDP scale ${pct >= 0 ? '+' : ''}${pct.toFixed(0)}% (${prior.year}→${macroYear}) in USD terms (USD values reflect FX/base effects).`
    );
  }
  if (!deltas.length) deltas.push('Prior-year structured deltas unavailable — single-year macro snapshot only.');

  const intro = [
    s.opportunity.lead,
    s.risk.lead,
    'This executive summary uses canonical macro stamps and the institutional policy registry; items without structured backing render as Not covered.',
  ];

  return `<section class="page">
    <h1>Executive Summary</h1>
    ${paragraphsHtml(intro)}
    <h2>Base / Upside / Downside</h2>
    <div class="grid3">
      <div class="card"><div class="cardTitle">Base case</div><ul class="compact">
        <li>${escapeHtml(truncateAtSentence(s.opportunity.lead, 280))}</li>
        <li>GDP growth ${fmtPct(canonical.canonicalMetrics.gdpGrowthPct)} (${macroYear ?? 'n/a'})</li>
        <li>Signal: ${escapeHtml(payload.signalScan.badge)}</li>
      </ul></div>
      <div class="card"><div class="cardTitle">Upside</div><ul class="compact">
        <li>FDI acceleration above ${fmtUsd(canonical.canonicalMetrics.fdiNetInflowsUsd)}</li>
        <li>Sector leaders maintain attractiveness scores &gt;80</li>
        <li>Policy frameworks align with USTR/AU/ECOWAS registry entries where listed</li>
      </ul></div>
      <div class="card"><div class="cardTitle">Downside</div><ul class="compact">
        <li>Inflation re-acceleration above ${fmtPct(canonical.canonicalMetrics.inflationCpiPct)}</li>
        <li>FX volatility beyond structured series</li>
        <li>Political/security shocks (see Risk)</li>
      </ul></div>
    </div>
    <h2>What changed since last structured year</h2>
    <ul class="compact">${deltas.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
    <h2>Key watchpoints (30–90d)</h2>
    <ul class="compact">
      <li>${escapeHtml(s.risk.categories[0]?.items[0]?.title ?? 'Macro and FX')}</li>
      <li>${escapeHtml(s.political.items[0]?.title ?? 'Governance')}</li>
      <li>Policy registry refresh (AGOA/AfCFTA/ECOWAS)</li>
    </ul>
  </section>`;
}

function renderSectionPage(
  title: string,
  block: { intro: string; paragraphs: string[] },
  bodyHtml: string
): string {
  return `<section class="page">
    <h1>${escapeHtml(title)}</h1>
    <p class="lead">${escapeHtml(block.intro)}</p>
    ${paragraphsHtml(block.paragraphs)}
    ${bodyHtml}
  </section>`;
}

function renderGeography(model: CountryProfileV2Model): string {
  const g = model.payload.sections.geography;
  const facts = tableHtml(
    ['Fact', 'Value', 'Note'],
    g.facts.map((f) => [f.label, f.value, f.note ?? ''])
  );
  return renderSectionPage('Geography & Demographics', g, facts);
}

function renderPolitical(model: CountryProfileV2Model): string {
  const p = model.payload.sections.political;
  const items = p.items
    .map(
      (i) => `<div class="card" style="margin-top:8px">
        <div class="severity">${escapeHtml(i.severity)}</div>
        <strong>${escapeHtml(i.title)}</strong>
        <p class="prose">${escapeHtml(i.body)}</p>
        ${i.mitigants?.length ? `<ul class="compact">${i.mitigants.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>` : ''}
      </div>`
    )
    .join('');
  return renderSectionPage('Political Environment', p, `${items}<p class="muted">Sources: see Appendix</p>`);
}

function renderEconomic(model: CountryProfileV2Model): string {
  const e = model.payload.sections.economic;
  const rows = model.payload.economyYears.map((y) => [
    String(y.year),
    y.gdp_current_usd != null ? fmtUsd(y.gdp_current_usd) : '—',
    y.gdp_growth_pct != null ? fmtPct(y.gdp_growth_pct) : '—',
    y.inflation_cpi_pct != null ? fmtPct(y.inflation_cpi_pct) : '—',
    y.fx_to_usd != null ? y.fx_to_usd.toFixed(2) : '—',
  ]);
  const bullets = e.indicatorBullets?.length
    ? `<ul class="compact">${e.indicatorBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
    : '';
  return renderSectionPage(
    'Economic Overview (Macro & Monetary)',
    e,
    `${tableHtml(['Year', 'GDP USD', 'Growth', 'Inflation', 'FX'], rows)}${bullets}`
  );
}

function renderTrade(model: CountryProfileV2Model): string {
  const t = model.payload.sections.tradeAndSectors;
  const trade = model.payload.tradeSummary;
  const body = trade
    ? `${tableHtml(['Metric', 'Value'], [
        ['Exports', trade.exportsUsd ?? '—'],
        ['Imports', trade.importsUsd ?? '—'],
        ['As-of year', model.canonical.asOf.tradeYear != null ? String(model.canonical.asOf.tradeYear) : 'Not provided'],
      ])}
      <p class="muted">HS export/import composition: Not covered in this edition.</p>
      <h2>Regional frameworks</h2>
      ${tableHtml(['Agreement', 'Summary'], t.regionalAgreements.map((a) => [a.name, a.description]))}`
    : `<div class="box-warn">Trade summary not provided.</div>`;
  return renderSectionPage('External & Trade', t, body);
}

function renderSectors(model: CountryProfileV2Model): string {
  const intro = {
    intro: model.payload.sections.tradeAndSectors.sectorScorecardIntro,
    paragraphs: model.payload.sections.tradeAndSectors.paragraphs.slice(0, 2),
  };
  const rows = model.payload.sectors.map((s) => [
    s.label,
    s.strength != null ? String(s.strength) : '—',
    s.growth != null ? String(s.growth) : '—',
    s.attractiveness != null ? String(s.attractiveness) : '—',
    neutralizeClientNumericClaims(s.teaser ?? '').slice(0, 80),
  ]);
  return renderSectionPage(
    'Sectors & Scorecards',
    intro,
    `${tableHtml(['Sector', 'S', 'G', 'A', 'Teaser'], rows)}
     <p class="muted">Methodology: See Appendix — Scorecard Methodology. Confidence: ${escapeHtml(model.canonical.confidence)}.</p>`
  );
}

function renderOpportunity(model: CountryProfileV2Model): string {
  const o = model.payload.sections.opportunity;
  const pillars = o.pillars
    .map(
      (p) => `<div class="card" style="margin-top:8px">
        <strong>${escapeHtml(neutralizeClientNumericClaims(p.title))}</strong> — ${escapeHtml(neutralizeClientNumericClaims(p.subtitle ?? ''))}
        <p class="prose">${escapeHtml(p.narrative)}</p>
      </div>`
    )
    .join('');
  return renderSectionPage('Investment Opportunity', o, pillars);
}

function renderRisk(model: CountryProfileV2Model): string {
  const r = model.payload.sections.risk;
  const cats = r.categories
    .map(
      (c) => `<h3>${escapeHtml(c.title)}</h3>${c.items
        .map(
          (i) => `<div class="card"><span class="severity">${escapeHtml(i.severity)}</span>
            <strong>${escapeHtml(i.title)}</strong><p class="prose">${escapeHtml(i.body)}</p></div>`
        )
        .join('')}`
    )
    .join('');
  const toolkit = `<div class="box-warn"><strong>Mitigation toolkit:</strong> PRI/MIGA coverage, FX hedging, phased deployment, local JV structures — align to mandate.</div>`;
  return renderSectionPage('Risk Assessment', r, `${cats}${toolkit}`);
}

function renderSignal(model: CountryProfileV2Model): string {
  const s = model.payload.sections.signalAndDifferentiation;
  const drivers = model.canonical.signalDrivers.map((d) => `<li>${escapeHtml(d)}</li>`).join('');
  const body = `<div class="badge">${escapeHtml(s.badge)}</div>
    <p class="prose">Confidence: <strong>${escapeHtml(model.canonical.signalConfidence)}</strong> — derived from structured macro coverage (${escapeHtml(String(model.canonical.asOf.macroYear ?? 'n/a'))}).</p>
    <ul class="compact">${drivers}</ul>
    <h2>Model limits</h2>
    <p class="prose">Signal scan synthesizes available macro and sector inputs; it is not a trading signal. Where series are incomplete, confidence is downgraded and drivers use canonical metrics only.</p>
    <h2>Souvera edge</h2>
    <ul class="compact">${s.differentiators.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`;
  return renderSectionPage('Signal Scan & Souvera Edge', s, body);
}

function renderAppendix(model: CountryProfileV2Model): string {
  const g = model.payload.sections.glossary;
  const terms = g.terms
    .slice(0, 12)
    .map((t) => `<tr><td><strong>${escapeHtml(t.term)}</strong></td><td>${escapeHtml(t.definition)}</td></tr>`)
    .join('');
  const policyEvidence = buildClientPolicyTableRows(model.payload.country.iso3)
    .map(
      (row) =>
        `<li>${escapeHtml(row[0])}: ${escapeHtml(row[1])} — Source: ${escapeHtml(row[2])} · Last reviewed: ${escapeHtml(row[3])}</li>`
    )
    .join('');

  const copyWarnings = (model.preflightWarnings ?? []).filter((w) =>
    w.code.startsWith('COPY_')
  );
  const copyWarningsBlock =
    copyWarnings.length > 0
      ? `<h1>Appendix: Copy warnings</h1>
    <p class="prose muted">Editorial lint (non-blocking) — review before external distribution.</p>
    <ul class="compact">${copyWarnings
      .map(
        (w) =>
          `<li><strong>${escapeHtml(w.code)}</strong> (${escapeHtml(w.path)}): ${escapeHtml(w.message)}</li>`
      )
      .join('')}</ul>`
      : '';

  return `<section class="page">
    <h1>Appendix: Methodology</h1>
    ${paragraphsHtml([
      'Scorecards rank Strength (position), Growth (trajectory), and Attractiveness (investment appeal) on 0–100 scales versus regional peers.',
      'Signal scan combines macro momentum, FDI, inflation, and sector leadership with explicit confidence tiers.',
      'Data quality: fields without structured backing render as Not covered; preflight blocks contradictory narratives and unresolved template tokens.',
    ])}
    <h2>Data &amp; Methodology — providers</h2>
    ${renderMethodologyProvidersHtml()}
    <h1>Appendix: Glossary</h1>
    <p class="prose">${escapeHtml(g.intro)}</p>
    <table class="data-table"><tbody>${terms}</tbody></table>
    <h1>Appendix: Sources &amp; Disclosures</h1>
    <p class="prose">${escapeHtml(model.payload.sources)}</p>
    <h2>Market-access registry (summary)</h2>
    <ul class="compact">${policyEvidence}</ul>
    <h1>Appendix: Data coverage &amp; limitations</h1>
    ${buildDataCoverageLimitationsHtml(model.canonical)}
    <p class="muted">For informational purposes only. Verify material facts independently before investment decisions.</p>
    ${copyWarningsBlock}
  </section>`;
}

export function renderCountryProfileV2Html(model: CountryProfileV2Model): string {
  const coverModel = buildCoverPageModel(model.payload, model.canonical);
  const name = model.payload.country.name;

  const sections = [
    renderCoverPageSection(coverModel),
    renderDashboard(model),
    renderExecutiveSummary(model),
    renderGeography(model),
    renderPolitical(model),
    renderEconomic(model),
    renderTrade(model),
    renderSectors(model),
    renderOpportunity(model),
    renderRisk(model),
    renderSignal(model),
    renderAppendix(model),
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(name)} — Country Profile (Institutional)</title>
  <style>${REPORT_V2_PRINT_CSS}</style>
</head>
<body>
${sections}
${renderReportTemplateStampFooter(COUNTRY_PROFILE_TEMPLATE_ID)}
</body>
</html>`;
}
