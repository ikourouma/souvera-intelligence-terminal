/**
 * Phase 0B.3 — smoke test for vault → Overview market access card mapping.
 * Run: npx tsx scripts/test-phase-0b-market-access-overview.ts
 */

import { buildOverviewMarketAccessItems } from '../src/lib/intelligence/market-access-overview';
import type { MarketAccessFrameworkDto } from '../src/types/country-intelligence';

let failed = 0;

function assert(label: string, condition: boolean) {
  if (!condition) {
    console.error(`❌ ${label}`);
    failed++;
  } else {
    console.log(`✅ ${label}`);
  }
}

const sample: MarketAccessFrameworkDto[] = [
  {
    id: 'agoa',
    label: 'AGOA',
    emoji: '🇺🇸',
    description: 'Suspended from AGOA since 2015. Restoration under legislative review.',
    status: 'suspended',
    statusLabel: 'Suspended',
  },
  {
    id: 'afcfta',
    label: 'AfCFTA',
    emoji: '🌍',
    description: 'USTR AGOA beneficiary list',
    status: 'active',
    statusLabel: 'Active',
  },
];

const items = buildOverviewMarketAccessItems(sample);
assert('maps vault frameworks to overview items', items.length === 2);
assert('AGOA title present', items[0]?.title.includes('AGOA'));
assert('suspended → amber tone', items[0]?.tone === 'amber');
assert('active → emerald tone', items[1]?.tone === 'emerald');
assert('footnote cites Evidence Vault', items[0]?.footnote?.includes('Evidence Vault') === true);
assert('empty input returns []', buildOverviewMarketAccessItems(undefined).length === 0);

console.log(failed ? `\n${failed} failed` : '\nAll Phase 0B.3 mapper checks passed.');
process.exit(failed ? 1 : 0);
