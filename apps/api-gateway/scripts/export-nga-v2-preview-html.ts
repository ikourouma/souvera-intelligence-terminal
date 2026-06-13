/**
 * Export Cover + Dashboard + Executive Summary HTML for template review.
 * Run: npx tsx scripts/export-nga-v2-preview-html.ts
 * Output: tmp/nga-v2-preview-pages.html (repo root)
 */
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fetchCountryProfileReportData } from '../src/lib/reports/country-profile-data';
import { canonicalizeCountryPayload } from '../src/lib/reports/canonicalize-country-payload';
import { buildCoverPageModel, renderCoverPageSection } from '../src/lib/reports/templates/cover-page-v2-html';
import { renderCountryProfileV2Html } from '../src/lib/reports/templates/country-profile-v2-html';
import { REPORT_V2_PRINT_CSS } from '../src/lib/reports/templates/report-v2-shared';
import { runCountryProfileIntegrity } from '../src/lib/reports/generate-country-profile-v2';
import type { PreflightIssue } from '../src/types/report-integrity';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPreflightIssuesBox(
  passed: boolean,
  errors: PreflightIssue[],
  warnings: PreflightIssue[]
): string {
  const status = passed ? 'PASSED' : 'FAILED';
  const statusColor = passed ? '#0f766e' : '#b45309';

  const renderIssue = (i: PreflightIssue) =>
    `<li><strong>${escapeHtml(i.code)}</strong> · <code>${escapeHtml(i.path)}</code><br/>${escapeHtml(i.message)}${i.detail ? `<br/><span class="muted">${escapeHtml(i.detail)}</span>` : ''}</li>`;

  const errorsBlock =
    errors.length > 0
      ? `<h3 style="margin:8px 0 4px;font-size:12px;color:#b45309">Errors (${errors.length})</h3><ul class="compact">${errors.map(renderIssue).join('')}</ul>`
      : '<p class="muted">No preflight errors.</p>';

  const warningsBlock =
    warnings.length > 0
      ? `<h3 style="margin:8px 0 4px;font-size:12px;color:#6b7280">Warnings (${warnings.length})</h3><ul class="compact">${warnings.map(renderIssue).join('')}</ul>`
      : '<p class="muted">No preflight warnings.</p>';

  return `<div class="preflight-box" style="max-width:210mm;margin:0 auto 16px;padding:14px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;font:12px/1.45 system-ui,sans-serif">
    <div style="font-weight:700;margin-bottom:8px">Preflight Issues — <span style="color:${statusColor}">${status}</span> (${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'})</div>
    ${errorsBlock}
    ${warningsBlock}
  </div>`;
}

async function main() {
  const payload = await fetchCountryProfileReportData('NGA');
  const canonical = canonicalizeCountryPayload(payload);
  const preflight = runCountryProfileIntegrity(payload, { strict: true });
  const coverModel = buildCoverPageModel(payload, canonical);

  const coverSection = renderCoverPageSection(coverModel);
  const fullHtml = renderCountryProfileV2Html({
    payload,
    canonical,
    preflightWarnings: preflight.warnings,
  });

  const dashboardMatch = fullHtml.match(/<section class="page">\s*<h1>Dashboard<\/h1>[\s\S]*?<\/section>/);
  const execMatch = fullHtml.match(/<section class="page">\s*<h1>Executive Summary<\/h1>[\s\S]*?<\/section>/);
  const preflightBox = renderPreflightIssuesBox(
    preflight.passed,
    preflight.errors,
    preflight.warnings
  );

  const preview = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Nigeria — v2 Preview (Cover + Dashboard + Exec Summary)</title>
  <style>
${REPORT_V2_PRINT_CSS}
body.preview-body { background: #e5e7eb; padding: 24px; }
body.preview-body .page { background: #fff; max-width: 210mm; margin: 0 auto 24px; padding: 16mm; box-shadow: 0 4px 24px rgba(0,0,0,.12); }
  </style>
</head>
<body class="preview-body">
  ${preflightBox}
  ${coverSection}
  ${dashboardMatch?.[0] ?? '<p>Dashboard section not found</p>'}
  ${execMatch?.[0] ?? '<p>Executive Summary section not found</p>'}
</body>
</html>`;

  const outDir = path.resolve(process.cwd(), '..', '..', 'tmp');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'nga-v2-preview-pages.html');
  fs.writeFileSync(outPath, preview);

  const cssOnlyPath = path.join(outDir, 'nga-v2-page1-css.txt');
  fs.writeFileSync(cssOnlyPath, `=== REPORT_V2_PRINT_CSS (single @page) ===\n${REPORT_V2_PRINT_CSS}`);

  console.log('Wrote', outPath);
  console.log('Wrote', cssOnlyPath);
  console.log('Preflight passed:', preflight.passed);
  for (const e of preflight.errors) {
    console.log(`  ERROR ${e.code} @ ${e.path}: ${e.message}`);
  }
  for (const w of preflight.warnings) {
    console.log(`  WARN ${w.code} @ ${w.path}: ${w.message}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
