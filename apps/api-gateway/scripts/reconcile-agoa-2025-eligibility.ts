/**
 * Reconcile AGOA eligibility for ALL sub-Saharan African markets against the
 * authoritative, current Presidential designation.
 *
 * AUTHORITY: USTR / Office of the U.S. Trade Representative annual AGOA eligibility
 * determination as published in the Federal Register, Vol. 90, No. 103 (Fri, May 30 2025),
 * which lists the 32 countries designated as AGOA beneficiary sub-Saharan African
 * countries for 2025 and the sub-Saharan countries NOT designated.
 *   - https://www.govinfo.gov/content/pkg/FR-2025-05-30/html/2025-09795.htm
 *   - https://ustr.gov/countries-regions/africa  (per-country status pages)
 * Cross-checked against:
 *   - Lesotho:  https://ustr.gov/countries-regions/africa/southern-africa/lesotho  (eligible)
 *   - DR Congo: https://ustr.gov/countries-regions/africa/central-africa/democratic-republic-congo (eligible)
 *   - CAF/Gabon/Niger/Uganda terminated effective Jan 1 2024 (USTR statement, Oct 30 2023).
 *
 * This script ONLY updates rows whose current status differs from the authoritative
 * target — curated rows that are already correct are left untouched. Idempotent.
 *
 * Run: npx tsx apps/api-gateway/scripts/reconcile-agoa-2025-eligibility.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const USTR_AGOA_ARTIFACT_ID = '6a8877b7-35f6-4e46-b612-09e8074ed78c';
const SOURCE = 'USTR / Federal Register Vol. 90 No. 103 (May 30 2025) — 2025 AGOA designation';

// The 32 countries designated AGOA beneficiaries for 2025.
// Notes are concise citations/nuances — they are surfaced inside the Souvera Analysis
// narrative (not the card body), so they intentionally avoid repeating the boilerplate
// "Designated an AGOA beneficiary..." prose that the narrative already conveys.
const ELIGIBLE_DEFAULT = `${SOURCE}.`;
const ELIGIBLE_2025: Record<string, string> = {
  AGO: ELIGIBLE_DEFAULT,
  BEN: ELIGIBLE_DEFAULT,
  BWA: ELIGIBLE_DEFAULT,
  CPV: ELIGIBLE_DEFAULT,
  TCD: ELIGIBLE_DEFAULT,
  COM: ELIGIBLE_DEFAULT,
  COD: ELIGIBLE_DEFAULT,
  COG: ELIGIBLE_DEFAULT,
  CIV: ELIGIBLE_DEFAULT,
  DJI: ELIGIBLE_DEFAULT,
  SWZ: ELIGIBLE_DEFAULT,
  GMB: ELIGIBLE_DEFAULT,
  GHA: ELIGIBLE_DEFAULT,
  GNB: ELIGIBLE_DEFAULT,
  KEN: ELIGIBLE_DEFAULT,
  LSO: `Eligible for textile and apparel benefits. ${SOURCE}.`,
  LBR: ELIGIBLE_DEFAULT,
  MDG: ELIGIBLE_DEFAULT,
  MWI: ELIGIBLE_DEFAULT,
  MRT: `Reinstated as an AGOA beneficiary effective Jan 1 2024. ${SOURCE}.`,
  MUS: ELIGIBLE_DEFAULT,
  MOZ: ELIGIBLE_DEFAULT,
  NAM: ELIGIBLE_DEFAULT,
  NGA: ELIGIBLE_DEFAULT,
  RWA: `Apparel benefits suspended (effective Jul 31 2018). ${SOURCE}.`,
  STP: ELIGIBLE_DEFAULT,
  SEN: ELIGIBLE_DEFAULT,
  SLE: ELIGIBLE_DEFAULT,
  ZAF: ELIGIBLE_DEFAULT,
  TZA: ELIGIBLE_DEFAULT,
  TGO: ELIGIBLE_DEFAULT,
  ZMB: ELIGIBLE_DEFAULT,
};

// Sub-Saharan countries NOT designated AGOA beneficiaries for 2025.
const INELIGIBLE_DEFAULT = `Not a current AGOA beneficiary. ${SOURCE}.`;
const INELIGIBLE_2025: Record<string, string> = {
  BFA: `Removed following a military coup. ${SOURCE}.`,
  BDI: INELIGIBLE_DEFAULT,
  CMR: INELIGIBLE_DEFAULT,
  CAF: `Terminated effective Jan 1 2024 (gross human-rights violations). ${SOURCE}.`,
  GNQ: `Graduated from GSP/AGOA developing-country status. ${SOURCE}.`,
  ERI: INELIGIBLE_DEFAULT,
  ETH: `Eligibility terminated effective Jan 1 2022. ${SOURCE}.`,
  GAB: `Terminated effective Jan 1 2024 (unconstitutional change of government). ${SOURCE}.`,
  GIN: `Removed following a military coup. ${SOURCE}.`,
  MLI: `Removed following a military coup. ${SOURCE}.`,
  NER: `Terminated effective Jan 1 2024 (unconstitutional change of government). ${SOURCE}.`,
  SYC: `Graduated from GSP/AGOA developing-country status. ${SOURCE}.`,
  SOM: INELIGIBLE_DEFAULT,
  SSD: INELIGIBLE_DEFAULT,
  SDN: INELIGIBLE_DEFAULT,
  UGA: `Terminated effective Jan 1 2024 (gross human-rights violations). ${SOURCE}.`,
};

// Countries with curated special statuses we intentionally do NOT overwrite.
// ZWE is long-standing ineligible but carries a curated 'suspended' profile.
const SKIP: Set<string> = new Set([]);

const EFFECTIVE_DATE: Record<string, string> = {
  CAF: '2024-01-01', GAB: '2024-01-01', NER: '2024-01-01', UGA: '2024-01-01',
  MRT: '2024-01-01', ETH: '2022-01-01',
};

async function main() {
  console.log('\n=== Reconcile AGOA 2025 eligibility (Evidence Vault) ===\n');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const targets: Array<{ iso3: string; status: 'eligible' | 'ineligible'; notes: string }> = [
    ...Object.entries(ELIGIBLE_2025).map(([iso3, notes]) => ({ iso3, status: 'eligible' as const, notes })),
    ...Object.entries(INELIGIBLE_2025).map(([iso3, notes]) => ({ iso3, status: 'ineligible' as const, notes })),
  ];

  const iso3s = targets.map((t) => t.iso3);
  const { data: existingRows } = await sb
    .from('souvera_country_policy_status')
    .select('country_iso3, status, notes')
    .eq('framework', 'AGOA')
    .in('country_iso3', iso3s);
  const existing = new Map((existingRows ?? []).map((r) => [r.country_iso3, r]));

  let changed = 0;
  let skipped = 0;

  for (const t of targets) {
    if (SKIP.has(t.iso3)) { skipped++; continue; }
    const cur = existing.get(t.iso3);
    const statusMatches = cur?.status === t.status;
    const notesMatch = (cur?.notes ?? '') === t.notes;
    if (statusMatches && notesMatch) {
      console.log(`  ⏭️  ${t.iso3}: already ${t.status} with current note (no change)`);
      skipped++;
      continue;
    }

    const { error } = await sb.from('souvera_country_policy_status').upsert(
      {
        country_iso3: t.iso3,
        framework: 'AGOA',
        status: t.status,
        status_effective_date: EFFECTIVE_DATE[t.iso3] ?? '2025-01-01',
        last_reviewed_at: new Date().toISOString(),
        source_key: 'ustr',
        evidence_artifact_id: USTR_AGOA_ARTIFACT_ID,
        confidence: 'high',
        notes: t.notes,
      },
      { onConflict: 'country_iso3,framework' }
    );

    if (error) {
      console.log(`  ❌ ${t.iso3}: ${error.message}`);
    } else {
      const reason = !statusMatches ? `${cur?.status ?? 'NO ROW'} → ${t.status}` : 'note refreshed';
      console.log(`  ✅ ${t.iso3}: ${reason}`);
      changed++;
    }
  }

  console.log(`\nDone. Changed: ${changed} · Unchanged/skipped: ${skipped} · Total: ${targets.length}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
