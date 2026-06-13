/**
 * Institutional report design system — Souvera brand · Afreximbank-grade PDF shell.
 */

import { COVER_GRADIENT, COVER_GRADIENT_ACCENT, SOUVERA_CONTACT, SOUVERA_REPORT_BRAND as B } from '../report-brand';

export type ReportTemplateId =
  | 'country-profile'
  | 'investment-memo'
  | 'trade-profile'
  | 'sector-deep-dive'
  | 'country-risk'
  | 'ai-custom'
  | 'trade-policy-agoa'
  | 'trade-policy-afcfta'
  | 'supply-demand';

export interface ReportCoverMeta {
  countryName: string;
  iso3: string;
  region?: string;
  reportTitle: string;
  reportSubtitle?: string;
  editionLabel?: string;
  generatedAt: string;
  dataAsOf?: string;
  classification?: string;
}

export interface TocEntry {
  id: string;
  title: string;
  pageHint?: string;
}

export function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Cards, pillars, frameworks — never split across pages. */
export const CARD_NO_BREAK_CLASS = 'card-no-break';

export function reportBaseStyles(): string {
  return `
    @page {
      size: letter;
      margin: 0.88in 0.68in 0.85in;
      @top-left {
        content: "SOUVERA INTELLIGENCE TERMINAL";
        font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 7pt;
        font-weight: 600;
        color: #047857;
        vertical-align: bottom;
        padding-bottom: 6px;
      }
      @bottom-left {
        content: "© Souvera · Confidential · souveraterminal.com";
        font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 7pt;
        color: #64748b;
      }
      @bottom-right {
        content: "Page " counter(page);
        font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 7pt;
        color: #64748b;
      }
    }
    @page :first {
      margin: 0;
      @top-left { content: none; }
      @bottom-left { content: none; }
      @bottom-right { content: none; }
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: 'Georgia', 'Times New Roman', Times, serif;
      font-size: 10.5pt;
      line-height: 1.55;
      color: ${B.ink};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      page-break-after: always;
      break-after: page;
      position: relative;
    }
    .sheet:last-child { page-break-after: auto; }

    .cover-sheet {
      page-break-after: always;
      break-after: page;
      width: 8.5in;
      height: 11in;
      min-height: 11in;
      max-height: 11in;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: ${B.navy};
      background-image: ${COVER_GRADIENT_ACCENT}, ${COVER_GRADIENT};
      color: ${B.white};
      box-sizing: border-box;
      position: relative;
    }
    .cover-sheet::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2.4in;
      background: linear-gradient(180deg, transparent 0%, rgba(11, 18, 32, 0.72) 35%, ${B.navy} 100%);
      pointer-events: none;
      z-index: 0;
    }
    .cover-inner {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      min-height: 11in;
      padding: 0.72in 0.75in 0.6in;
      box-sizing: border-box;
      position: relative;
      z-index: 1;
    }
    .cover-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: ${B.gold};
    }
    .cover-emerald-rule {
      width: 48px;
      height: 3px;
      background: ${B.emerald};
      margin-bottom: 20px;
    }
    .copyright-sheet {
      page-break-before: always;
      break-before: page;
      page-break-after: always;
      break-after: page;
      min-height: 8.5in;
      padding-top: 1.25in;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 9pt;
      color: #52525b;
    }
    .copyright-sheet h2 {
      font-size: 11pt;
      color: ${B.navyMid};
      margin: 0 0 16px;
      font-weight: 600;
    }
    .toc-sheet {
      page-break-before: always;
      break-before: page;
      page-break-after: always;
      break-after: page;
      min-height: 8.5in;
    }
    .cover-top {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-top: 0.35in;
      padding-bottom: 0.5in;
    }
    .cover-brand {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 8.5pt;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: ${B.emeraldLight};
      margin: 0 0 0.55in;
    }
    .cover-country {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 48pt;
      font-weight: 300;
      letter-spacing: -0.02em;
      line-height: 1.05;
      margin: 0 0 12px;
      color: #ffffff;
    }
    .cover-report-type {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 13pt;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: ${B.gold};
      margin: 0 0 16px;
    }
    .cover-subtitle {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 10pt;
      color: #94a3b8;
      max-width: 26rem;
      line-height: 1.6;
      margin: 0;
    }
    .cover-imprint {
      border-top: 1px solid rgba(148, 163, 184, 0.35);
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 8.5pt;
      color: #cbd5e1;
      line-height: 1.45;
    }
    .cover-imprint-left { flex: 1; max-width: 58%; }
    .cover-imprint-right { text-align: right; flex-shrink: 0; }
    .cover-imprint-label {
      font-size: 7pt;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .cover-classification {
      font-size: 8pt;
      color: #cbd5e1;
      margin-top: 6px;
      line-height: 1.4;
    }

    .toc-sheet h2 {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 14pt;
      font-weight: 700;
      color: ${B.navyMid};
      margin: 0 0 24px;
      padding-bottom: 8px;
      border-bottom: 2px solid ${B.gold};
    }
    .toc-list { list-style: none; padding: 0; margin: 0; }
    .toc-list li {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 12px;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 10pt;
    }
    .toc-num {
      font-weight: 700;
      color: ${B.emerald};
      min-width: 1.5rem;
    }
    .toc-title { flex: 1; color: #18181b; }
    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #cbd5e1;
      margin: 0 8px 3px;
      min-width: 24px;
    }

    .content-body { padding-top: 0; }
    .section { margin-bottom: 28px; }
    .section-major {
      page-break-before: always;
      break-before: page;
      margin-bottom: 24px;
    }
    .section-num {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 28pt;
      font-weight: 200;
      color: #cbd5e1;
      line-height: 1;
      margin-bottom: 4px;
    }
    h2.section-title {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 14pt;
      font-weight: 700;
      color: ${B.navyMid};
      margin: 0 0 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid ${B.emerald};
      letter-spacing: 0.02em;
    }
    h3.subsection {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 11pt;
      font-weight: 600;
      color: #0d9488;
      margin: 16px 0 8px;
    }
    .lead {
      font-size: 11pt;
      color: #334155;
      margin-bottom: 14px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 14px 0;
    }
    .metric-card {
      border: 1px solid ${B.border};
      border-top: 3px solid ${B.emerald};
      padding: 12px 14px;
      background: ${B.cardBgAlt};
      page-break-inside: avoid;
      break-inside: avoid-page;
    }
    .metric-label {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 7pt;
      font-weight: 600;
      color: ${B.slate};
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .metric-value {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 14pt;
      font-weight: 700;
      color: ${B.navyMid};
      margin-top: 6px;
    }
    .callout {
      background: linear-gradient(90deg, #ecfdf5 0%, ${B.cardBgAlt} 100%);
      border-left: 4px solid ${B.emerald};
      padding: 14px 16px;
      margin: 14px 0;
      page-break-inside: avoid;
      break-inside: avoid-page;
    }
    .callout-badge {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-weight: 700;
      font-size: 10pt;
      color: #047857;
      margin-bottom: 8px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin: 10px 0;
    }
    table.data-table th {
      background: ${B.navyMid};
      color: ${B.white};
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 7.5pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 8px 10px;
      text-align: left;
    }
    table.data-table td {
      border-bottom: 1px solid ${B.border};
      padding: 9px 10px;
      vertical-align: top;
    }
    table.data-table tr:nth-child(even) td { background: ${B.cardBgAlt}; }

    .card-no-break,
    .framework-card,
    .fact-card,
    .sector-card,
    .pillar-card,
    .risk-card,
    .risk-item,
    .diff-item {
      page-break-inside: avoid !important;
      break-inside: avoid-page !important;
      -webkit-column-break-inside: avoid;
    }

    .framework-card {
      border: 1px solid ${B.border};
      padding: 12px 14px;
      margin-bottom: 10px;
      border-radius: 2px;
      background: ${B.cardBgAlt};
    }
    .framework-head {
      display: flex;
      justify-content: space-between;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      margin-bottom: 4px;
    }
    .framework-label { font-weight: 700; color: ${B.navyMid}; }
    .framework-status {
      font-size: 8.5pt;
      font-weight: 700;
      color: ${B.emerald};
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .muted { color: ${B.slate}; font-size: 9pt; }
    .prose p { margin: 0 0 10px; text-align: justify; }
    .prose ul, .prose ol { margin: 0 0 10px; padding-left: 20px; }
    .prose li { margin-bottom: 4px; }
    .disclaimer-block {
      page-break-inside: avoid;
      break-inside: avoid-page;
      margin-top: 28px;
      padding: 14px 16px;
      background: ${B.cardBg};
      border: 1px solid #e4e4e7;
      font-size: 8pt;
      color: #52525b;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
    }
    .fact-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 14px 0;
    }
    .fact-card {
      border: 1px solid ${B.border};
      padding: 10px 12px;
      background: ${B.cardBg};
    }
    .fact-label {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 7pt;
      font-weight: 600;
      color: ${B.slate};
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .fact-value {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 12pt;
      font-weight: 700;
      color: ${B.navyMid};
      margin: 4px 0;
    }
    .fact-note { font-size: 8.5pt; color: ${B.slate}; line-height: 1.4; }
    .sector-card {
      border: 1px solid ${B.border};
      border-left: 4px solid ${B.emerald};
      padding: 12px 14px;
      margin-bottom: 14px;
      background: ${B.cardBg};
    }
    .sector-card-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      margin-bottom: 6px;
    }
    .sector-name { font-weight: 700; color: ${B.navyMid}; font-size: 10.5pt; }
    .sector-scores { font-size: 8.5pt; color: #047857; font-weight: 600; }
    .score-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 8pt;
    }
    .score-label { width: 5.5rem; color: ${B.slate}; }
    .score-track {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }
    .score-fill { height: 100%; background: linear-gradient(90deg, #047857, ${B.emerald}); }
    .risk-card {
      border: 1px solid ${B.border};
      border-left: 4px solid ${B.goldMuted};
      padding: 12px 14px;
      margin-bottom: 12px;
      background: ${B.cardBg};
    }
    .risk-item {
      margin-bottom: 12px;
      padding: 12px 14px;
      background: ${B.cardBg};
      border: 1px solid ${B.border};
      border-radius: 2px;
    }
    .risk-head {
      display: flex;
      justify-content: space-between;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      margin-bottom: 4px;
    }
    .risk-title { font-weight: 700; color: ${B.navyMid}; }
    .risk-severity {
      font-size: 7.5pt;
      font-weight: 700;
      color: #b45309;
      letter-spacing: 0.04em;
    }
    .pillar-card {
      border: 1px solid ${B.border};
      border-left: 4px solid ${B.cyan};
      padding: 14px 16px;
      margin-bottom: 14px;
      background: ${B.cardBg};
    }
    .pillar-title {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-weight: 700;
      color: ${B.navyMid};
      font-size: 10.5pt;
      margin-bottom: 2px;
    }
    .pillar-sub {
      font-size: 9pt;
      color: #047857;
      margin-bottom: 8px;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
    }
    .pillar-narrative {
      font-size: 10pt;
      color: #334155;
      margin-bottom: 8px;
      text-align: justify;
      line-height: 1.5;
    }
    .bullet-list { margin: 8px 0; padding-left: 18px; }
    .bullet-list li { margin-bottom: 5px; text-align: justify; font-size: 9.5pt; }
    .diff-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin: 12px 0;
    }
    .diff-item {
      padding: 8px 12px;
      background: #ecfdf5;
      border-left: 3px solid ${B.emerald};
      font-size: 9.5pt;
    }
    .section-lead {
      font-size: 10.5pt;
      color: #334155;
      margin-bottom: 10px;
      text-align: justify;
      line-height: 1.55;
    }
    .glossary-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin: 12px 0;
    }
    .glossary-item {
      border: 1px solid ${B.border};
      padding: 10px 12px;
      background: ${B.cardBgAlt};
      page-break-inside: avoid;
      break-inside: avoid-page;
    }
    .glossary-term {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-weight: 700;
      color: ${B.navyMid};
      font-size: 9.5pt;
      margin-bottom: 4px;
    }
    .glossary-def {
      font-size: 9.5pt;
      color: #334155;
      line-height: 1.5;
      text-align: justify;
    }
    .subsection-intro {
      font-size: 10pt;
      color: #475569;
      margin: 0 0 12px;
      text-align: justify;
      line-height: 1.55;
    }
    .mitigation-card {
      border: 1px solid ${B.border};
      border-left: 4px solid ${B.emerald};
      padding: 12px 14px;
      margin-bottom: 12px;
      background: ${B.cardBgAlt};
    }
    .contact-sheet {
      page-break-before: always;
      break-before: page;
      min-height: 6in;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
    }
    .contact-panel {
      border-top: 3px solid ${B.gold};
      padding-top: 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .contact-panel h3 {
      font-size: 10pt;
      font-weight: 700;
      color: ${B.navyMid};
      margin: 0 0 8px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .contact-panel p {
      margin: 0 0 4px;
      font-size: 9.5pt;
      color: #334155;
      line-height: 1.5;
    }
    .contact-panel a {
      color: #047857;
      text-decoration: none;
    }
    .contact-tagline {
      font-size: 8.5pt;
      color: ${B.slate};
      margin-top: 20px;
      text-align: center;
      letter-spacing: 0.04em;
    }
  `;
}

export function buildCoverSheet(meta: ReportCoverMeta): string {
  const edition = meta.editionLabel ?? SOUVERA_CONTACT.division;
  const classification = meta.classification ?? SOUVERA_CONTACT.classification;

  return `
  <section class="sheet cover-sheet">
    <div class="cover-accent"></div>
    <div class="cover-inner">
      <div class="cover-top">
        <div class="cover-emerald-rule"></div>
        <p class="cover-brand">Souvera Intelligence Terminal</p>
        <h1 class="cover-country">${esc(meta.countryName)}</h1>
        <p class="cover-report-type">${esc(meta.reportTitle)}</p>
        ${meta.reportSubtitle ? `<p class="cover-subtitle">${esc(meta.reportSubtitle)}</p>` : ''}
      </div>
      <div class="cover-imprint">
        <div class="cover-imprint-left">
          <div class="cover-imprint-label">Prepared by</div>
          <div>${esc(edition)}</div>
          <div class="cover-classification">${esc(classification)}</div>
        </div>
        <div class="cover-imprint-right">
          <div class="cover-imprint-label">Coverage</div>
          <div>${esc(meta.iso3)}${meta.region ? ` · ${esc(meta.region)}` : ''}</div>
          <div style="margin-top:10px">${esc(meta.generatedAt)}</div>
          ${meta.dataAsOf ? `<div>Data as of ${esc(meta.dataAsOf)}</div>` : ''}
        </div>
      </div>
    </div>
  </section>`;
}

export function buildCopyrightSheet(year = new Date().getFullYear()): string {
  return `
  <section class="sheet copyright-sheet">
    <h2>Copyright &amp; Disclaimer</h2>
    <p>Copyright © Souvera Intelligence Terminal ${year}. All rights reserved.</p>
    <p>No part of this publication may be reproduced, stored, or transmitted without prior written permission of Afronovation, Inc.</p>
    <p style="margin-top:20px"><strong>Disclaimer:</strong> This document is prepared for informational and research purposes only. It does not constitute investment, legal, or tax advice. Data is curated from public sources and Souvera proprietary models; verify material facts independently before decisions.</p>
    <p style="margin-top:16px">
      <a href="${SOUVERA_CONTACT.website}" style="color:#047857">${SOUVERA_CONTACT.websiteDisplay}</a>
      · ${SOUVERA_CONTACT.email}
    </p>
  </section>`;
}

export function buildContactSheet(): string {
  return `
  <section class="sheet contact-sheet">
    <div class="contact-panel">
      <div>
        <h3>${esc(SOUVERA_CONTACT.hqLabel)}</h3>
        <p>${esc(SOUVERA_CONTACT.addressLine1)}</p>
        <p>${esc(SOUVERA_CONTACT.addressLine2)}</p>
      </div>
      <div>
        <h3>Contact &amp; Intelligence Desk</h3>
        <p><a href="${SOUVERA_CONTACT.website}">${esc(SOUVERA_CONTACT.websiteDisplay)}</a></p>
        <p><a href="mailto:${SOUVERA_CONTACT.email}">${esc(SOUVERA_CONTACT.email)}</a></p>
        <p style="margin-top:10px;color:#64748b;font-size:8.5pt">${esc(SOUVERA_CONTACT.division)}</p>
      </div>
    </div>
    <p class="contact-tagline">Souvera Intelligence Terminal · Africa &amp; Caribbean Market Intelligence</p>
  </section>`;
}

export function buildTocSheet(entries: TocEntry[]): string {
  const items = entries
    .map(
      (e, i) => `
      <li>
        <span class="toc-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="toc-title">${esc(e.title)}</span>
        <span class="toc-dots"></span>
      </li>`
    )
    .join('');

  return `
  <section class="sheet toc-sheet">
    <h2>Table of Contents</h2>
    <ol class="toc-list">${items}</ol>
  </section>`;
}

export function sectionBlock(
  num: number,
  title: string,
  bodyHtml: string,
  options?: { opener?: boolean; major?: boolean }
): string {
  const cls =
    options?.major || options?.opener ? 'section section-major' : 'section';
  return `
  <section class="${cls}" id="section-${num}">
    <div class="section-num">${String(num).padStart(2, '0')}</div>
    <h2 class="section-title">${esc(title)}</h2>
    ${bodyHtml}
  </section>`;
}

export function wrapReportDocument(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>${reportBaseStyles()}</style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

export const PUPPETEER_HEADER_TEMPLATE = `
<div style="font-size:7px;width:100%;padding:0 0.65in;color:#64748b;font-family:Segoe UI,sans-serif;
  display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">
  <span style="color:#047857;font-weight:600">SOUVERA INTELLIGENCE TERMINAL</span>
  <span class="title"></span>
</div>`;

export const PUPPETEER_FOOTER_TEMPLATE = `
<div style="font-size:7px;width:100%;padding:0 0.65in;color:#64748b;font-family:Segoe UI,sans-serif;
  display:flex;justify-content:space-between;">
  <span>© Souvera · Confidential · souveraterminal.com</span>
  <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
</div>`;
