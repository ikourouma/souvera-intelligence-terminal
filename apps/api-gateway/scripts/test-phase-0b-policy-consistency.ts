/**
 * Phase 0B.6 — cross-surface AGOA / market-access consistency for rollout markets.
 * Run: npx tsx scripts/test-phase-0b-policy-consistency.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { AGOA_CURATED_OVERRIDES, AGOA_LEGISLATIVE_EVENTS } from '../src/data/agoa-legislative-tracker';
import { resolvePolicyStatusRegistry } from '../src/lib/reports/policy-status-registry';
import { policyRecordsToMarketAccessFrameworks } from '../src/lib/intelligence/trade-policy-vault';
import { buildOverviewMarketAccessItems } from '../src/lib/intelligence/market-access-overview';
import { ALL_ROLLOUT_ISO3 } from '../src/lib/intelligence/rollout-manifest';

let failed = 0;

function assert(label: string, condition: boolean) {
  if (!condition) {
    console.error(`❌ ${label}`);
    failed++;
  } else {
    console.log(`✅ ${label}`);
  }
}

async function main() {
  const ngaOverride = AGOA_CURATED_OVERRIDES.find((r) => r.country_iso3 === 'NGA');
  assert('NGA has no curated AGOA override (vault is authority)', !ngaOverride);

  const ngaEvent = AGOA_LEGISLATIVE_EVENTS.find((e) => e.id === 'nga-restoration-review');
  assert('NGA legislative event exists', !!ngaEvent);
  assert(
    'NGA legislative event references vault / watchpoint',
    /evidence vault|watchpoint|ustr/i.test(ngaEvent?.summary ?? '')
  );

  for (const iso3 of ALL_ROLLOUT_ISO3) {
    const records = await resolvePolicyStatusRegistry(iso3);
    const frameworks = policyRecordsToMarketAccessFrameworks(records);
    const overviewItems = buildOverviewMarketAccessItems(frameworks);

    assert(`${iso3}: vault yields market access rows`, frameworks.length >= 1);
    assert(`${iso3}: overview mapper non-empty when vault present`, overviewItems.length >= 1);

    const agoaRecord = records.find((r) => r.framework === 'AGOA');
    const agoaFramework = frameworks.find((f) => f.label === 'AGOA');
    if (agoaRecord && agoaFramework) {
      const statusAligned =
        agoaRecord.clientStatusLabel === agoaFramework.statusLabel ||
        agoaRecord.statusLabel === agoaFramework.statusLabel ||
        (agoaRecord.publishable === false && agoaFramework.status === 'info');
      assert(`${iso3}: AGOA vault ↔ framework status aligned`, statusAligned);
    }

    if (iso3 === 'NGA' && agoaRecord) {
      assert('NGA vault AGOA row present', !!agoaFramework);
    }
  }

  console.log(failed ? `\n${failed} failed` : '\nAll Phase 0B.6 consistency checks passed.');
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
