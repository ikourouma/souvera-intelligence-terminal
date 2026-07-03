/**
 * Phase 2.5 — Trade taxonomy audit.
 * Asserts Caribbean trade copy uses CBI (not AGOA) and region routing is canonical.
 *
 * Run: npx tsx apps/api-gateway/scripts/audit-trade-taxonomy.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3, isApprovedCaribbeanMarket } from '../src/lib/market-coverage';

function getCountryRegion(iso3: string): 'africa' | 'caribbean' | 'default' {
  const key = iso3.toUpperCase();
  if (isApprovedCaribbeanMarket(key)) return 'caribbean';
  if ((APPROVED_AFRICA_ISO3 as readonly string[]).includes(key)) return 'africa';
  return 'default';
}

function extractConst(source: string, name: string): string | null {
  const re = new RegExp(`const ${name}[^=]*=\\s*\\{`);
  const m = re.exec(source);
  if (!m) return null;
  let depth = 0;
  let started = false;
  for (let i = m.index; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') {
      depth++;
      started = true;
    } else if (ch === '}') {
      depth--;
      if (started && depth === 0) return source.slice(m.index, i + 1);
    }
  }
  return null;
}

const ROOT = path.resolve(__dirname, '..');

function main(): void {
  const failures: string[] = [];

  for (const iso of APPROVED_CARIBBEAN_ISO3) {
    if (getCountryRegion(iso) !== 'caribbean') {
      failures.push(`${iso}: getCountryRegion not caribbean`);
    }
  }

  const tradePath = path.join(ROOT, 'src/lib/intelligence/country-trade-content.ts');
  const tradeContent = fs.readFileSync(tradePath, 'utf8');

  for (const blockName of ['CARIBBEAN_TRADE', 'CARIBBEAN_TERRITORY_TRADE'] as const) {
    const block = extractConst(tradeContent, blockName);
    if (!block) {
      failures.push(`Missing ${blockName} constant`);
      continue;
    }
    if (/\bAGOA\b/i.test(block)) {
      failures.push(`${blockName} contains AGOA reference — must use CBI/CARICOM only`);
    }
  }

  const heroFn = tradeContent.match(/export function getAgoaHeroLabel[\s\S]*?\n\}/);
  if (heroFn) {
    const caribSection = heroFn[0].split('if (isApprovedCaribbeanMarket(iso3))')[1]?.split('}')[0] ?? '';
    if (/agoa/i.test(caribSection)) {
      failures.push('getAgoaHeroLabel Caribbean branch references AGOA');
    }
  }

  const hubFiles = [
    path.join(ROOT, 'src/app/intelligence/trade/demand-caribbean/CaribbeanDemandMatrix.tsx'),
    path.join(ROOT, 'src/app/intelligence/trade/cbtpa/flows/CBTpaTradeIntelligence.tsx'),
  ];
  for (const file of hubFiles) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (/preference margin of/i.test(text)) {
      failures.push(`${path.basename(file)}: preference margin narrative`);
    }
  }

  console.log('\n=== Phase 2.5 Trade Taxonomy Audit ===\n');
  console.log(`Caribbean markets checked: ${APPROVED_CARIBBEAN_ISO3.length}`);

  if (failures.length === 0) {
    console.log('✅ PASS — Caribbean CBI taxonomy OK\n');
    process.exit(0);
  }

  console.log(`❌ FAIL — ${failures.length} issue(s):\n`);
  for (const f of failures) console.log(`  • ${f}`);
  console.log('');
  process.exit(1);
}

main();
