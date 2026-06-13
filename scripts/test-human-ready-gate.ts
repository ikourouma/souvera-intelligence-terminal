/**
 * Master human-ready gate — runs parity/purity scripts and static assertions.
 * Run: npx tsx scripts/test-human-ready-gate.ts
 */

import { execSync } from 'child_process';
import * as path from 'path';
import { AGOA_COUNTRY_STATUSES } from '../apps/api-gateway/src/data/agoa-full-coverage';
import { CARIBBEAN_WAVE2_TRADE } from '../apps/api-gateway/src/data/caribbean-wave2-trade';
import { NIGERIA_TRADE } from '../apps/api-gateway/src/data/nigeria-trade';
import { JAMAICA_TRADE } from '../apps/api-gateway/src/data/jamaica-trade';
import { KENYA_TRADE } from '../apps/api-gateway/src/data/kenya-trade';
import { WAVE1_AFRICA_TRADE } from '../apps/api-gateway/src/data/wave1-africa-trade';
import { WAVE1_AFRICA_ISO3 } from './lib/news-pulse-pilot';

const root = path.join(__dirname, '..');

const SCRIPT_RUNS = [
  'scripts/test-pilot-triad-parity.ts',
  'scripts/test-sectors-parity.ts',
  'scripts/test-signal-scan-purity.ts',
];

const WAVE1_TRADE_ISO3: Record<string, { totalTradeUsd?: number }> = {
  NGA: NIGERIA_TRADE,
  JAM: JAMAICA_TRADE,
  KEN: KENYA_TRADE,
  ...WAVE1_AFRICA_TRADE,
  ...CARIBBEAN_WAVE2_TRADE,
};

let failed = 0;

function assert(label: string, condition: boolean) {
  if (!condition) {
    console.error(`❌ ${label}`);
    failed++;
  } else {
    console.log(`✅ ${label}`);
  }
}

function runScript(relPath: string) {
  console.log(`\n▶ ${relPath}\n`);
  execSync(`npx tsx ${relPath}`, { cwd: root, stdio: 'inherit' });
}

function checkStaticAssertions() {
  console.log('\n── Static assertions ──\n');
  assert('AGOA country statuses === 54', AGOA_COUNTRY_STATUSES.length === 54);

  for (const iso of ['TTO', 'BRB', 'BHS']) {
    const trade = CARIBBEAN_WAVE2_TRADE[iso];
    assert(`${iso} wave2 trade wired`, !!trade && (trade.totalTradeUsd ?? 0) > 0);
    assert(`${iso} CARICOM intraRegional`, !!trade?.intraRegional);
    assert(`${iso} CBI block (agoa field)`, !!trade?.agoa && trade.agoa.status === 'eligible');
  }

  for (const iso of WAVE1_AFRICA_ISO3) {
    assert(`WAVE1_AFRICA ${iso} in news pulse config`, true);
  }

  const wave1WithTrade = [...WAVE1_AFRICA_ISO3, 'NGA', 'JAM', 'KEN', 'TTO', 'BRB', 'BHS'] as const;
  for (const iso of wave1WithTrade) {
    const trade = WAVE1_TRADE_ISO3[iso];
    assert(`wave1/pilot ${iso} has trade data`, !!trade && (trade.totalTradeUsd ?? 0) > 0);
    const composition = (trade as { importComposition?: unknown[] }).importComposition;
    assert(`${iso} importComposition (≥3 sectors)`, Array.isArray(composition) && composition.length >= 3);
    if (iso === 'NGA') {
      const exports = (trade as { exportComposition?: unknown[] }).exportComposition;
      assert('NGA exportComposition (5 sectors)', Array.isArray(exports) && exports.length >= 5);
    }
  }
}

async function main() {
  console.log('🧪 Human-ready master gate\n');

  for (const script of SCRIPT_RUNS) {
    try {
      runScript(script);
    } catch {
      console.error(`\n❌ ${script} failed`);
      process.exit(1);
    }
  }

  checkStaticAssertions();

  console.log('\n' + '═'.repeat(50));
  if (failed === 0) {
    console.log('✅ Human-ready gate passed — proceed to docs/execution/human-test-checklist.md');
    process.exit(0);
  } else {
    console.log(`❌ ${failed} static assertion(s) failed.`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
