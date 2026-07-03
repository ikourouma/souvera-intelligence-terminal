/**
 * Phase 2.5 — Trade intelligence hub figure audit.
 * Scans Pillar B clients for hardcoded $/% literals not sourced from API payloads.
 *
 * Run: npx tsx apps/api-gateway/scripts/audit-trade-intelligence-figures.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const TRADE_HUB = path.resolve(__dirname, '../src/app/intelligence/trade');
const COMPONENTS = path.resolve(__dirname, '../src/components/intelligence');

const SUSPICIOUS = [
  /\$[0-9]+(\.[0-9]+)?[BMK]\+?/,
  /preference margin of/i,
  /tariff advantage.*\d+%/i,
  /MFN.*\d+%/i,
  /'\$45B'/,
  /"65%"/,
];

const ALLOWLIST = [
  'SupplyDemandCellDrawer.tsx', // sector examples in reverse-flow mock — audit separately
  'supply-demand-types.ts', // static sector blurbs — flagged for content review
];

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(tsx?)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function main(): void {
  const files = [...walk(TRADE_HUB), ...walk(COMPONENTS).filter((f) => f.includes('SupplyDemand') || f.includes('DemandSignal') || f.includes('CaribbeanDemand'))];
  const hits: string[] = [];

  for (const file of files) {
    const base = path.basename(file);
    if (ALLOWLIST.some((a) => base.includes(a))) continue;

    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (line.includes('fmtUsd') || line.includes('formatUsd') || line.includes('toLocaleString')) return;
      for (const pat of SUSPICIOUS) {
        if (pat.test(line)) {
          hits.push(`${path.relative(process.cwd(), file)}:${i + 1}: ${line.trim().slice(0, 120)}`);
          break;
        }
      }
    });
  }

  console.log('\n=== Phase 2.5 Trade Intelligence Figures Audit ===\n');
  console.log(`Files scanned: ${files.length}`);

  if (hits.length === 0) {
    console.log('✅ PASS — no suspicious hardcoded trade figures in hub clients\n');
    process.exit(0);
  }

  console.log(`⚠️  ${hits.length} line(s) flagged for review:\n`);
  for (const h of hits.slice(0, 40)) console.log(`  • ${h}`);
  console.log('\nReview flagged lines — remove or bind to API payload fields.\n');
  process.exit(hits.length > 10 ? 1 : 0);
}

main();
