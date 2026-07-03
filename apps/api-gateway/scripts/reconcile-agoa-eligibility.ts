/**
 * Reconcile souvera_agoa_trade_flows eligibility flags from Evidence Vault.
 * Evidence Vault (souvera_country_policy_status) is the single authority.
 *
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/reconcile-agoa-eligibility.ts
 */
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3 } from '../src/lib/market-coverage';
import { fetchAgoaEligibilityMap } from '../src/lib/intelligence/trade-policy-vault';
import { getAfricanSubRegionLabel } from '../src/lib/intelligence/country-regions';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

/** USTR-verified long-term suspensions that must override stale vault rows. */
const VAULT_CORRECTIONS: Record<string, { since: number; notes: string }> = {
  ZWE: {
    since: 2001,
    notes: 'Suspended from AGOA since 2001 due to governance concerns (USTR ineligible list)',
  },
};

async function applyVaultCorrections(
  sb: ReturnType<typeof createClient>
): Promise<number> {
  let fixed = 0;
  for (const [iso3, meta] of Object.entries(VAULT_CORRECTIONS)) {
    const { data: existing } = await sb
      .from('souvera_country_policy_status')
      .select('status')
      .eq('country_iso3', iso3)
      .eq('framework', 'AGOA')
      .maybeSingle();

    if (existing?.status === 'suspended') continue;

    const { error } = await sb.from('souvera_country_policy_status').upsert(
      {
        country_iso3: iso3,
        framework: 'AGOA',
        status: 'suspended',
        status_effective_date: `${meta.since}-01-01`,
        last_reviewed_at: new Date().toISOString(),
        source_key: 'ustr',
        confidence: 'high',
        notes: meta.notes,
      },
      { onConflict: 'country_iso3,framework' }
    );
    if (!error) {
      console.log(`  🔧 ${iso3}: vault corrected → suspended since ${meta.since}`);
      fixed++;
    }
  }
  return fixed;
}

async function main() {
  console.log('\n=== Reconcile AGOA eligibility (Vault → trade flows) ===\n');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  await applyVaultCorrections(sb);
  const eligibilityMap = await fetchAgoaEligibilityMap();

  let updated = 0;
  let skipped = 0;

  for (const iso3 of APPROVED_AFRICA_ISO3) {
    const vault = eligibilityMap.get(iso3);
    if (!vault) {
      console.log(`  ⚠️  ${iso3}: no vault AGOA row — skipped`);
      skipped++;
      continue;
    }

    const agoaStatus =
      vault.agoaStatus === 'eligible'
        ? 'eligible'
        : vault.agoaStatus === 'suspended'
          ? 'suspended'
          : vault.agoaStatus === 'graduated'
            ? 'graduated'
            : 'suspended';

    const eligibilitySince = vault.eligible
      ? vault.eligibilitySince
      : vault.suspensionSinceYear ?? vault.eligibilitySince;

    const subRegion = getAfricanSubRegionLabel(iso3);

    const { data: rows, error: fetchErr } = await sb
      .from('souvera_agoa_trade_flows')
      .select('id, category_group, agoa_eligible, agoa_exports_usd, total_exports_to_us_usd, agoa_share_pct, non_agoa_exports_usd, mfn_tariff_pct, tariff_savings_usd')
      .eq('iso3', iso3);

    if (fetchErr) {
      console.log(`  ❌ ${iso3}: ${fetchErr.message}`);
      continue;
    }
    if (!rows?.length) {
      console.log(`  ⚠️  ${iso3}: no trade flow rows — skipped`);
      skipped++;
      continue;
    }

    for (const row of rows) {
      const patch: Record<string, unknown> = {
        agoa_eligible: vault.eligible,
        agoa_status: agoaStatus,
        eligibility_since: eligibilitySince,
      };
      if (subRegion) patch.sub_region = subRegion;
      if (!vault.eligible) {
        patch.agoa_exports_usd = 0;
        patch.agoa_share_pct = 0;
        patch.tariff_savings_usd = 0;
        if (row.total_exports_to_us_usd != null) {
          patch.non_agoa_exports_usd = row.total_exports_to_us_usd;
        }
      } else if (
        (row.agoa_exports_usd ?? 0) === 0
        && (row.total_exports_to_us_usd ?? 0) > 0
        && row.agoa_share_pct != null
      ) {
        const share = row.agoa_share_pct / 100;
        const agoaExports = Math.round(row.total_exports_to_us_usd * share);
        patch.agoa_exports_usd = agoaExports;
        patch.non_agoa_exports_usd = Math.round(row.total_exports_to_us_usd * (1 - share));
        if (row.mfn_tariff_pct != null) {
          patch.tariff_savings_usd = Math.round(agoaExports * (row.mfn_tariff_pct / 100));
        }
      } else if (
        vault.eligible
        && (row.agoa_exports_usd ?? 0) > 0
        && row.mfn_tariff_pct != null
        && (row.tariff_savings_usd == null || row.tariff_savings_usd === 0)
      ) {
        patch.tariff_savings_usd = Math.round(
          (row.agoa_exports_usd ?? 0) * (row.mfn_tariff_pct / 100),
        );
      }
      const { error: upErr } = await sb
        .from('souvera_agoa_trade_flows')
        .update(patch)
        .eq('id', row.id);
      if (upErr) {
        console.log(`  ❌ ${iso3} row ${row.id}: ${upErr.message}`);
      } else {
        updated++;
      }
    }
    console.log(`  ✅ ${iso3}: ${vault.eligible ? 'eligible' : agoaStatus} (${rows.length} rows)`);
  }

  console.log(`\n✅ Updated ${updated} trade-flow rows`);
  console.log(`↩️  Skipped markets: ${skipped}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
