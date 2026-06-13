/**
 * Phase 0B.4–0B.5 — audit Evidence Vault policy coverage after verification runs.
 * Run: npx tsx scripts/audit-policy-vault-coverage.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3 } from '../src/lib/market-coverage';
import { isApprovedCaribbeanMarket } from '../src/lib/market-coverage';
import { entityKeysForRegion } from '../src/lib/entity-registry';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function countFramework(framework: string, iso3List: string[]) {
  const { data, error } = await sb
    .from('souvera_country_policy_status')
    .select('country_iso3, status, evidence_artifact_id, confidence')
    .eq('framework', framework)
    .in('country_iso3', iso3List);

  if (error) throw error;
  const rows = data ?? [];
  const withEvidence = rows.filter((r) => r.evidence_artifact_id);
  const byStatus = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    total: iso3List.length,
    populated: rows.length,
    withEvidence: withEvidence.length,
    byStatus,
    missing: iso3List.filter((iso) => !rows.some((r) => r.country_iso3 === iso)),
  };
}

async function main() {
  const africa = [...APPROVED_AFRICA_ISO3];
  const caribbean = entityKeysForRegion('caribbean').filter((iso) => isApprovedCaribbeanMarket(iso));

  console.log('\n=== Evidence Vault Policy Coverage Audit ===\n');

  const agoa = await countFramework('AGOA', africa);
  console.log('AGOA (Africa 54):');
  console.log(`  Populated: ${agoa.populated}/${agoa.total}`);
  console.log(`  With evidence artifact: ${agoa.withEvidence}/${agoa.total}`);
  console.log(`  By status:`, agoa.byStatus);
  if (agoa.missing.length) console.log(`  Missing: ${agoa.missing.join(', ')}`);

  const afcfta = await countFramework('AfCFTA', africa);
  console.log('\nAfCFTA (Africa):');
  console.log(`  Populated: ${afcfta.populated}/${afcfta.total}`);
  console.log(`  With evidence: ${afcfta.withEvidence}/${afcfta.total}`);
  console.log(`  By status:`, afcfta.byStatus);

  const cbi = await countFramework('CBI', caribbean);
  console.log('\nCBI (Caribbean rollout):');
  console.log(`  Populated: ${cbi.populated}/${caribbean.length}`);
  console.log(`  With evidence: ${cbi.withEvidence}/${caribbean.length}`);
  console.log(`  By status:`, cbi.byStatus);

  const caricom = await countFramework('CARICOM', caribbean);
  console.log('\nCARICOM (Caribbean rollout):');
  console.log(`  Populated: ${caricom.populated}/${caribbean.length}`);
  console.log(`  With evidence: ${caricom.withEvidence}/${caribbean.length}`);
  console.log(`  By status:`, caricom.byStatus);

  const nga = await sb
    .from('souvera_country_policy_status')
    .select('status, notes, evidence_artifact_id')
    .eq('country_iso3', 'NGA')
    .eq('framework', 'AGOA')
    .maybeSingle();

  console.log('\nNGA AGOA row:', nga.data ?? 'none');

  console.log('\n=== End audit ===\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
