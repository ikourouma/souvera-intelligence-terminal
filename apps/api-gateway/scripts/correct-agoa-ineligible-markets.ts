/**
 * Correct AGOA eligibility for sub-Saharan markets that are NOT current AGOA beneficiaries.
 *
 * Authority: USTR "2024 List of AGOA Eligible and Ineligible Countries" (already in the
 * Evidence Vault as artifact 6a8877b7-...), corroborated by CRS IF10149.
 *   - https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa
 *   - https://www.congress.gov/crs_external_products/IF/PDF/IF10149/IF10149.25.pdf
 *
 * BDI (Burundi)            — terminated from AGOA (not a current beneficiary)
 * ERI (Eritrea)            — never designated an AGOA beneficiary (was wrongly 'eligible')
 * GNQ (Equatorial Guinea)  — not a current AGOA beneficiary
 * SDN (Sudan)              — not a current AGOA beneficiary
 *
 * Idempotent. Run: npx tsx apps/api-gateway/scripts/correct-agoa-ineligible-markets.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const USTR_AGOA_ARTIFACT_ID = '6a8877b7-35f6-4e46-b612-09e8074ed78c';

const INELIGIBLE: Record<string, string> = {
  BDI: 'Not a current AGOA beneficiary (USTR 2024 AGOA eligibility list).',
  ERI: 'Not designated an AGOA beneficiary (USTR 2024 AGOA eligibility list).',
  GNQ: 'Not a current AGOA beneficiary (USTR 2024 AGOA eligibility list).',
  SDN: 'Not a current AGOA beneficiary (USTR 2024 AGOA eligibility list).',
};

async function main() {
  console.log('\n=== Correct AGOA ineligible markets (Evidence Vault) ===\n');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  for (const [iso3, notes] of Object.entries(INELIGIBLE)) {
    const { data: existing } = await sb
      .from('souvera_country_policy_status')
      .select('status')
      .eq('country_iso3', iso3)
      .eq('framework', 'AGOA')
      .maybeSingle();

    const { error } = await sb.from('souvera_country_policy_status').upsert(
      {
        country_iso3: iso3,
        framework: 'AGOA',
        status: 'ineligible',
        status_effective_date: '2024-01-01',
        last_reviewed_at: new Date().toISOString(),
        source_key: 'ustr',
        evidence_artifact_id: USTR_AGOA_ARTIFACT_ID,
        confidence: 'high',
        notes,
      },
      { onConflict: 'country_iso3,framework' }
    );

    if (error) {
      console.log(`  ❌ ${iso3}: ${error.message}`);
    } else {
      console.log(`  ✅ ${iso3}: ${existing?.status ?? 'none'} → ineligible`);
    }
  }

  console.log('\nDone. Re-run reconcile-agoa-eligibility.ts to sync trade-flow flags if needed.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
