#!/usr/bin/env tsx
/**
 * CI: Placeholder leak scanner (Phase 0F.3)
 *
 * Scans all TypeScript/TSX source files for unresolved {{TOKEN}} patterns.
 * Allowlisted files are template DEFINITIONS where {{TOKEN}} is intentional.
 * Any match outside the allowlist means a template escaped into render code.
 *
 * Exit 0 = clean. Exit 1 = leaks detected.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const REPO_ROOT = join(__dirname, '../../..');
const SRC_ROOT = join(__dirname, '..');

// Files that are allowed to define {{TOKEN}} strings (template engine sources + test scripts)
const ALLOWLIST = new Set([
  'src/lib/intelligence/country-overview-content.ts',
  'src/lib/intelligence/country-risk-content.ts',
  'src/lib/reports/narrative-template.ts',
  'src/lib/reports/placeholder-leak.ts',
  'src/lib/reports/preflight-validate.ts',
  'src/lib/reports/preflight-narrative-rules.ts',
  // Test + CI scripts that intentionally reference tokens in assertions
  'scripts/ci-placeholder-scan.ts',
  'scripts/test-phase-0a-hydration.ts',
  'scripts/test-reports-v2-api-integration.ts',
]);

const PLACEHOLDER_RE = /\{\{[A-Z][A-Z0-9_]+\}\}/g;

function walkFiles(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue;
      results.push(...walkFiles(full, exts));
    } else if (exts.some((e) => entry.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

let leakCount = 0;
const leaks: { file: string; line: number; token: string }[] = [];

for (const absPath of walkFiles(SRC_ROOT, ['.ts', '.tsx'])) {
  const relPath = relative(SRC_ROOT, absPath).replace(/\\/g, '/');
  if (ALLOWLIST.has(relPath)) continue;

  const lines = readFileSync(absPath, 'utf-8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].match(PLACEHOLDER_RE);
    if (matches) {
      for (const token of matches) {
        leaks.push({ file: relPath, line: i + 1, token });
        leakCount++;
      }
    }
  }
}

if (leaks.length === 0) {
  console.log('✅  Placeholder scan: 0 leaks — all {{TOKEN}} patterns are contained in template definitions.');
  process.exit(0);
} else {
  console.error(`\n❌  Placeholder scan: ${leakCount} unresolved {{TOKEN}} leak(s) found outside allowlisted template files:\n`);
  for (const { file, line, token } of leaks) {
    console.error(`  ${file}:${line}  →  ${token}`);
  }
  console.error(
    '\nFix: Replace {{TOKEN}} with observation-backed values from souvera_country_observations,\n' +
    'or move the template string into an allowlisted lib/intelligence or lib/reports file.\n' +
    'See docs/platform/foundation-assessment-2026.md §SDC rules for guidance.'
  );
  process.exit(1);
}
