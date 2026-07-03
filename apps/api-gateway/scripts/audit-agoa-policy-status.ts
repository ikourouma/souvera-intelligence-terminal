/**
 * Quick check: what AGOA policy status resolves for the non-AGOA SSA + North African markets?
 * Determines whether the Trade tab renders gracefully (not_applicable / clear note) vs an
 * N/A-filled AGOA block.
 * Read-only. npx tsx scripts/audit-agoa-policy-status.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { resolvePolicyStatusRegistry } from '../src/lib/reports/policy-status-registry';
import { policyRecordToAgoaUiSnapshot } from '../src/lib/intelligence/trade-policy-vault';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ISO3 = ['MAR', 'DZA', 'TUN', 'LBY', 'SDN', 'BDI', 'ERI', 'GNQ'];

async function main() {
  for (const iso3 of ISO3) {
    const records = await resolvePolicyStatusRegistry(iso3);
    const agoa = records.find((r) => r.framework === 'AGOA');
    if (!agoa) {
      console.log(`${iso3}: NO AGOA policy record (agoaPolicy=undefined → trade.agoa stays unset)`);
      continue;
    }
    const snap = policyRecordToAgoaUiSnapshot(agoa);
    console.log(`${iso3}: agoaStatus=${snap.agoaStatus} | statusLabel="${snap.statusLabel}"`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
