/**
 * Audit AGOA Vault status for ALL approved African markets vs resolved UI status.
 * Read-only. npx tsx apps/api-gateway/scripts/audit-agoa-all-africa.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3 } from '../src/lib/market-coverage';
import { resolvePolicyStatusRegistry } from '../src/lib/reports/policy-status-registry';
import { policyRecordToAgoaUiSnapshot } from '../src/lib/intelligence/trade-policy-vault';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const iso3s = APPROVED_AFRICA_ISO3 as unknown as string[];

  const { data: vaultRows } = await sb
    .from('souvera_country_policy_status')
    .select('country_iso3, status, confidence, evidence_artifact_id')
    .eq('framework', 'AGOA')
    .in('country_iso3', iso3s);
  const vaultByIso3 = new Map((vaultRows ?? []).map((r) => [r.country_iso3, r]));

  console.log(`\n=== AGOA status: Vault (DB) vs resolved UI — ${iso3s.length} African markets ===\n`);
  console.log('ISO3 | DB status      | resolved agoaStatus | label');
  console.log('-----|----------------|---------------------|------');

  const noVaultRow: string[] = [];
  const dbUnderReview: string[] = [];
  const resolvedUnderReview: string[] = [];

  for (const iso3 of iso3s.slice().sort()) {
    const v = vaultByIso3.get(iso3);
    if (!v) noVaultRow.push(iso3);
    else if (v.status === 'under_review') dbUnderReview.push(iso3);

    const records = await resolvePolicyStatusRegistry(iso3);
    const agoa = records.find((r) => r.framework === 'AGOA');
    const snap = agoa ? policyRecordToAgoaUiSnapshot(agoa) : null;
    if (!snap || snap.agoaStatus === 'under_review') resolvedUnderReview.push(iso3);

    console.log(
      `${iso3}  | ${(v?.status ?? 'NO ROW').padEnd(14)} | ${(snap?.agoaStatus ?? '-').padEnd(19)} | ${snap?.statusLabel ?? '-'}`
    );
  }

  console.log(`\n--- Summary ---`);
  console.log(`No Vault AGOA row (${noVaultRow.length}): ${noVaultRow.join(', ') || 'none'}`);
  console.log(`DB status = under_review (${dbUnderReview.length}): ${dbUnderReview.join(', ') || 'none'}`);
  console.log(`Resolved UI = under_review (${resolvedUnderReview.length}): ${resolvedUnderReview.join(', ') || 'none'}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
