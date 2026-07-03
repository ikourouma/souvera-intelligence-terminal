/**
 * Phase 2.5 — Tab content router hardcoded figure audit.
 * Flags bare $BMK literals in country-*-content.ts not behind fmtGdp/fmtFdi hydration.
 *
 * Run: npx tsx apps/api-gateway/scripts/audit-tab-hardcoded-figures.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../src/lib/intelligence');
const FILES = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => f.startsWith('country-') && f.endsWith('-content.ts'))
  .map((f) => path.join(CONTENT_DIR, f));

// Lines with fmtGdp(..., '$X') fallbacks are allowed — flag only standalone hero/fallback strings.
const BARE_DOLLAR = /(?:heroFallback|fallback:|subtitle:|value:\s*['"])\s*[^'"]*\$[0-9]+[BMK]/;
const BARE_BULLET = /bullets:\s*\[[^\]]*\$[0-9]+[BMK][^\]]*\]/;

function main(): void {
  const hits: string[] = [];

  for (const file of FILES) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (line.includes('fmtGdp(') || line.includes('fmtFdi(') || line.includes('fmtUsd')) return;
      if (BARE_DOLLAR.test(line) || BARE_BULLET.test(line)) {
        hits.push(`${path.basename(file)}:${i + 1}: ${line.trim().slice(0, 100)}`);
      }
    });
  }

  console.log('\n=== Phase 2.5 Tab Hardcoded Figures Audit ===\n');
  console.log(`Content routers scanned: ${FILES.length}`);

  if (hits.length === 0) {
    console.log('✅ PASS — no bare hero/fallback $ literals outside hydration helpers\n');
    process.exit(0);
  }

  console.log(`⚠️  ${hits.length} line(s) with bare $ figures (use fmtGdp/fmtFdi or remove):\n`);
  for (const h of hits.slice(0, 40)) console.log(`  • ${h}`);
  console.log('');
  process.exit(0); // warn-only — hydration fallbacks tracked separately
}

main();
