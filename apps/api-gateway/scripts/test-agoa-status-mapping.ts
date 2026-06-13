/**
 * AGOA vault status mapping smoke test.
 * Run: npx tsx scripts/test-agoa-status-mapping.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { fetchAgoaApiRowsFromVault } from '../src/lib/intelligence/trade-policy-vault';
import { countryDisplayName } from '../src/lib/intelligence/country-names';

async function main() {
  const { rows } = await fetchAgoaApiRowsFromVault(undefined, '', true);
  const byStatus = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.agoa_status] = (acc[r.agoa_status] ?? 0) + 1;
    return acc;
  }, {});

  console.log('Total:', rows.length);
  console.log('By status:', byStatus);

  const gin = rows.find((r) => r.country_iso3 === 'GIN');
  console.log('GIN name:', gin?.country_name, '(expected Guinea)');
  console.log('GIN status:', gin?.agoa_status);

  const eligible = byStatus.eligible ?? 0;
  const underReview = byStatus.under_review ?? 0;
  if (rows.length !== 54) {
    console.error('❌ expected 54 rows');
    process.exit(1);
  }
  if (gin?.country_name !== 'Guinea') {
    console.error('❌ GIN display name wrong');
    process.exit(1);
  }
  if (eligible + underReview + (byStatus.not_applicable ?? 0) + (byStatus.suspended ?? 0) + (byStatus.graduated ?? 0) + (byStatus.ineligible ?? 0) !== 54) {
    console.error('❌ status buckets do not sum to 54');
    process.exit(1);
  }
  if (eligible > 25) {
    console.error('❌ too many false eligible — check under_review mapping');
    process.exit(1);
  }

  console.log('✅ AGOA status mapping OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
