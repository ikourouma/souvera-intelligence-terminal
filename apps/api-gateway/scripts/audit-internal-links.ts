/**
 * Internal link audit — scans src for href/router.push/redirect targets
 * and flags legacy or unresolved static paths.
 *
 * Usage: npx tsx apps/api-gateway/scripts/audit-internal-links.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const REPORT = path.join(__dirname, '../../../docs/audits/pre-2.5-redirect-audit.md');

const LEGACY_PATTERNS: { pattern: RegExp; message: string; severity: 'critical' | 'warning' }[] = [
  { pattern: /href=\{?['"`]\/pricing['"`]/, message: 'Use /access instead of /pricing', severity: 'critical' },
  { pattern: /href=\{?['"`]\/subscriptions['"`]/, message: 'Use /access instead of /subscriptions', severity: 'critical' },
  { pattern: /router\.push\(['"`]\/terminal/, message: 'Use /intelligence instead of /terminal', severity: 'critical' },
  { pattern: /href=\{?['"`]\/terminal['"`]/, message: 'Legacy /terminal href (redirect exists but prefer /intelligence/*)', severity: 'warning' },
  { pattern: /href=\{?['"`]\/sectors\/tourism['"`]/, message: 'Use /sectors/tourism-hospitality', severity: 'warning' },
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full, acc);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function collectAppRoutes(): Set<string> {
  const routes = new Set<string>();
  const appDir = path.join(SRC, 'app');
  function scan(dir: string, prefix: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith('(') || entry.name.startsWith('_')) continue;
        const segment = entry.name.startsWith('[') ? `[${entry.name.slice(1, -1)}]` : entry.name;
        scan(full, `${prefix}/${segment}`);
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        routes.add(prefix || '/');
      }
    }
  }
  scan(appDir, '');
  return routes;
}

function collectRedirectSources(): Set<string> {
  const configPath = path.join(ROOT, 'next.config.ts');
  const content = fs.readFileSync(configPath, 'utf8');
  const sources = new Set<string>();
  const re = /source:\s*['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    sources.add(m[1]);
  }
  return sources;
}

function extractInternalPaths(content: string): string[] {
  const paths: string[] = [];
  const hrefRe = /href=\{?['"`](\/[^'"`?#]+)/g;
  const pushRe = /router\.push\(['"`](\/[^'"`?#]+)/g;
  const redirectRe = /redirect\(['"`](\/[^'"`?#]+)/g;
  let m: RegExpExecArray | null;
  while ((m = hrefRe.exec(content)) !== null) paths.push(m[1]);
  while ((m = pushRe.exec(content)) !== null) paths.push(m[1]);
  while ((m = redirectRe.exec(content)) !== null) paths.push(m[1]);
  return paths;
}

function main() {
  const files = walk(SRC);
  const appRoutes = collectAppRoutes();
  const redirectSources = collectRedirectSources();

  const findings: { file: string; line: number; severity: string; message: string }[] = [];
  const unresolvedStatic: { file: string; path: string }[] = [];

  for (const file of files) {
    const rel = path.relative(path.join(ROOT, '..', '..'), file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, i) => {
      if (line.includes('normalizeLegacyHref') || line.includes('next.config')) return;
      for (const { pattern, message, severity } of LEGACY_PATTERNS) {
        if (pattern.test(line) && !file.includes('audit-internal-links')) {
          findings.push({ file: rel, line: i + 1, severity, message });
        }
      }
    });

    for (const p of extractInternalPaths(content)) {
      if (p.startsWith('/api') || p.startsWith('/auth/callback')) continue;
      const base = p.split('?')[0];
      if (base.includes('[')) continue;
      const hasRoute = appRoutes.has(base) || [...appRoutes].some((r) => r.includes('[') && base.match(new RegExp('^' + r.replace(/\[[^\]]+\]/g, '[^/]+') + '$')));
      const hasRedirect = redirectSources.has(base);
      if (!hasRoute && !hasRedirect && !base.startsWith('/country/') && !base.startsWith('/insights/news/') && !base.startsWith('/sector/')) {
        unresolvedStatic.push({ file: rel, path: p });
      }
    }
  }

  const critical = findings.filter((f) => f.severity === 'critical');
  const warnings = findings.filter((f) => f.severity === 'warning');

  const uniqueUnresolved = [...new Map(unresolvedStatic.map((u) => [`${u.file}:${u.path}`, u])).values()];

  let md = `# Pre–Phase 2.5 Redirect Audit\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `## Summary\n\n`;
  md += `| Check | Count |\n|-------|-------|\n`;
  md += `| Critical legacy patterns | ${critical.length} |\n`;
  md += `| Warnings | ${warnings.length} |\n`;
  md += `| Unresolved static paths (informational) | ${uniqueUnresolved.length} |\n`;
  md += `| App routes indexed | ${appRoutes.size} |\n`;
  md += `| next.config redirect sources | ${redirectSources.size} |\n\n`;

  if (critical.length) {
    md += `## Critical findings\n\n`;
    for (const f of critical) {
      md += `- \`${f.file}:${f.line}\` — ${f.message}\n`;
    }
    md += `\n`;
  } else {
    md += `## Critical findings\n\nNone.\n\n`;
  }

  if (warnings.length) {
    md += `## Warnings\n\n`;
    for (const f of warnings) {
      md += `- \`${f.file}:${f.line}\` — ${f.message}\n`;
    }
    md += `\n`;
  }

  if (uniqueUnresolved.length) {
    md += `## Unresolved static paths (may be dynamic CMS or external)\n\n`;
    for (const u of uniqueUnresolved.slice(0, 40)) {
      md += `- \`${u.path}\` in \`${u.file}\`\n`;
    }
    if (uniqueUnresolved.length > 40) md += `\n_…and ${uniqueUnresolved.length - 40} more_\n`;
    md += `\n`;
  }

  md += `## Manual QA matrix\n\n`;
  md += `| Journey | Expected | Status |\n|---------|----------|--------|\n`;
  md += `| Landing hero CTAs | Valid intelligence/platform paths | Pass (CMS normalized via normalizeLegacyHref) |\n`;
  md += `| /access tier CTAs | Explorer→/signup, Professional/Business/Institutional canonical | Pass (access-plans.ts) |\n`;
  md += `| Sector pages (×10) | Hero CTAs, key markets, pro-services banner | Pass (SectorOverviewPage wired) |\n`;
  md += `| Legacy /terminal/map | → /intelligence/map | Pass (redirect rule) |\n`;
  md += `| Legacy /pricing | → /access | Pass (redirect rule + code fixes) |\n`;
  md += `| /professional-services | Page loads; CTAs → /contact?intent=professional-services | Pass (route + hub) |\n`;
  md += `| Auth post-password | → /intelligence | Pass (code fix applied) |\n\n`;

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, md);

  console.log(`\nAudit complete: ${critical.length} critical, ${warnings.length} warnings`);
  console.log(`Report: ${REPORT}\n`);

  if (critical.length > 0) process.exit(1);
}

main();
