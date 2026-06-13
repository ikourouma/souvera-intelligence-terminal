/**
 * Export breakdown — 5 sector slots across rollout trade payloads.
 * Run: npx tsx scripts/test-trade-composition-slots.ts
 */

import { NIGERIA_TRADE } from '../src/data/nigeria-trade';
import { KENYA_TRADE } from '../src/data/kenya-trade';
import { JAMAICA_TRADE } from '../src/data/jamaica-trade';
import { WAVE1_AFRICA_TRADE } from '../src/data/wave1-africa-trade';
import { CARIBBEAN_WAVE2_TRADE } from '../src/data/caribbean-wave2-trade';
import {
  BREAKDOWN_SECTOR_SLOTS,
  normalizeCompositionSlots,
  compositionShareSum,
} from '../src/lib/intelligence/trade-composition';

const TRADES = [
  ['NGA', NIGERIA_TRADE],
  ['KEN', KENYA_TRADE],
  ['JAM', JAMAICA_TRADE],
  ...Object.entries(WAVE1_AFRICA_TRADE),
  ...Object.entries(CARIBBEAN_WAVE2_TRADE),
] as const;

let failed = 0;

for (const [iso, trade] of TRADES) {
  const normalized = normalizeCompositionSlots(trade.exportComposition ?? []);
  const slots = normalized.length;
  const sum = compositionShareSum(normalized);
  if (slots !== BREAKDOWN_SECTOR_SLOTS) {
    console.error(`❌ ${iso}: ${slots} slots (expected ${BREAKDOWN_SECTOR_SLOTS})`);
    failed++;
  } else if (sum !== 100) {
    console.error(`❌ ${iso}: shares sum ${sum}%`);
    failed++;
  } else {
    console.log(`✅ ${iso}: ${slots} sectors, ${sum}%`);
  }
}

process.exit(failed ? 1 : 0);
