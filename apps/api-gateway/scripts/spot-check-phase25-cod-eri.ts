/**
 * Phase 2.5 spot-check — COD / ERI Trade + Sectors prerequisites.
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/spot-check-phase25-cod-eri.ts
 */
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';
import { isApprovedCaribbeanMarket } from '../src/lib/market-coverage';
import { getCountryRegion } from '../src/lib/intelligence/country-overview-content';
import { getSectorTradeCopy } from '../src/lib/intelligence/country-sectors-content';
import { buildTradeSourceReconciliation } from '../src/lib/intelligence/trade-source-reconciliation';
import { buildUsTradeCardAnalysis } from '../src/lib/intelligence/us-trade-card-analysis';
import { policyRecordToAgoaUiSnapshot } from '../src/lib/intelligence/trade-policy-vault';
import {
  fetchAgoaMetrics,
  isPreferentialExcludedCategory,
  sumAgoaPreferentialExports,
} from '../src/lib/trade/agoa-flow-metrics';
import { isPetroleumOrEnergySector } from '../src/lib/intelligence/preferential-trade-policy';
import { resolvePolicyStatusRegistry } from '../src/lib/reports/policy-status-registry';
import type { CountryTrade } from '../src/types/country-intelligence';

loadProjectEnv();

const MARKETS = ['COD', 'ERI'] as const;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function falsePreferentialClaim(opp: string, ineligible: boolean): boolean {
  if (!opp.trim()) return false;
  const activeAgoa =
    /duty-free under agoa|agoa duty-free|active agoa|agoa preferential access|qualif(?:y|ies) for agoa duty-free/i.test(
      opp,
    );
  if (!activeAgoa) return false;
  if (ineligible) {
    return !/ineligible|not a (?:current )?agoa beneficiary|mfn|terminated|withdrawn/i.test(opp);
  }
  return false;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const failures: string[] = [];
  const passes: string[] = [];

  for (const iso3 of MARKETS) {
    console.log(`\n── ${iso3} ──`);

    if (isApprovedCaribbeanMarket(iso3)) failures.push(`${iso3}: incorrectly classified as Caribbean`);
    if (getCountryRegion(iso3) !== 'africa') failures.push(`${iso3}: region not africa`);

    const sectorCopy = getSectorTradeCopy(iso3);
    if (getCountryRegion(iso3) === 'africa' && !/agoa/i.test(sectorCopy.sectionTitle)) {
      failures.push(`${iso3}: Africa sector copy missing AGOA label`);
    } else if (iso3 === 'COD') {
      passes.push(`${iso3}: sector copy uses AGOA framing (${sectorCopy.sectionTitle})`);
    }

    const records = await resolvePolicyStatusRegistry(iso3);
    const agoaRec = records.find((r) => r.framework === 'AGOA');
    if (!agoaRec) {
      failures.push(`${iso3}: no AGOA policy record`);
      continue;
    }
    const agoaPolicy = policyRecordToAgoaUiSnapshot(agoaRec);
    console.log(`  AGOA policy: ${agoaPolicy.agoaStatus} (${agoaPolicy.statusLabel})`);

    const { data: country } = await sb.from('souvera_countries').select('id, name').eq('iso3', iso3).maybeSingle();
    if (!country) {
      failures.push(`${iso3}: missing souvera_countries row`);
      continue;
    }

    const { data: snaps } = await sb
      .from('souvera_country_trade_snapshots')
      .select(
        'year, total_trade_usd, exports_usd, imports_usd, exports_to_us_usd, imports_from_us_usd, source_notes',
      )
      .eq('country_id', country.id)
      .order('year', { ascending: false })
      .limit(1);

    const snap = snaps?.[0];
    const censusExports = snap?.exports_to_us_usd as number | null;
    const censusYear = snap?.year as number | undefined;
    console.log(
      `  Census snapshot ${censusYear}: exp_to_us=${fmtUsd(censusExports ?? 0)} imp_from_us=${fmtUsd((snap?.imports_from_us_usd as number) ?? 0)}`,
    );

    const vaultEligible = agoaPolicy.agoaStatus === 'eligible';
    const agoaMetrics = await fetchAgoaMetrics(iso3, sb, vaultEligible);
    const categoryTotal = agoaMetrics?.totalExportsToUsUsd ?? 0;
    const flowYear = agoaMetrics?.dataVintage;
    console.log(
      `  AGOA flows ${flowYear}: category total=${fmtUsd(categoryTotal)} preferential=${fmtUsd(agoaMetrics?.currentAgoaExportsUsd ?? 0)}`,
    );

    if (iso3 === 'COD') {
      if (agoaPolicy.agoaStatus !== 'eligible') {
        failures.push(`COD: expected AGOA eligible, got ${agoaPolicy.agoaStatus}`);
      } else {
        passes.push('COD: AGOA eligible in Evidence Vault');
      }

      if (censusExports == null || censusExports < 50_000_000) {
        failures.push(`COD: Census exports_to_us missing or too low (${censusExports})`);
      } else {
        passes.push(`COD: Census bilateral exports ${fmtUsd(censusExports)} (${censusYear})`);
      }

      if (categoryTotal < 200_000_000) {
        failures.push(`COD: category-flow total too low (${fmtUsd(categoryTotal)})`);
      } else {
        passes.push(`COD: USITC category-flow sum ${fmtUsd(categoryTotal)} (${flowYear})`);
      }

      if (censusExports != null && categoryTotal > 0) {
        const recon = buildTradeSourceReconciliation(censusExports, categoryTotal, censusYear ?? 2024, {
          categoryFlowYear: flowYear,
        });
        if (!recon) {
          failures.push('COD: expected dual-source reconciliation banner (>5% divergence)');
        } else {
          const pct = recon.deltaPct;
          if (pct < 25 || pct > 40) {
            failures.push(`COD: reconciliation delta ${pct}% outside expected ~32% band`);
          } else {
            passes.push(`COD: dual-source reconciliation OK (Δ ${fmtUsd(recon.deltaUsd)}, ${pct}%)`);
          }
        }
      }

      const { data: flows } = await sb
        .from('souvera_agoa_trade_flows')
        .select('category_group, total_exports_to_us_usd, agoa_exports_usd, year')
        .eq('iso3', 'COD')
        .eq('year', flowYear ?? 2024);

      const minerals = (flows ?? []).find((f) => f.category_group === 'minerals');
      const petroleum = (flows ?? []).find((f) => f.category_group === 'petroleum');
      if (!minerals) failures.push('COD: no minerals AGOA flow row');
      else if ((minerals.agoa_exports_usd as number) <= 0) {
        failures.push(`COD: minerals agoa_exports_usd=${minerals.agoa_exports_usd} (expected >0)`);
      } else {
        passes.push(`COD: minerals AGOA-eligible exports ${fmtUsd(minerals.agoa_exports_usd as number)}`);
      }
      if (petroleum && (petroleum.agoa_exports_usd as number) > 0) {
        failures.push(`COD: petroleum has agoa_exports_usd=${petroleum.agoa_exports_usd} (should be 0)`);
      } else {
        passes.push('COD: petroleum excluded from preferential exports');
      }
    }

    if (iso3 === 'ERI') {
      if (agoaPolicy.agoaStatus !== 'ineligible') {
        failures.push(`ERI: expected AGOA ineligible, got ${agoaPolicy.agoaStatus}`);
      } else {
        passes.push('ERI: AGOA ineligible in Evidence Vault');
      }

      const preferential = agoaMetrics ? sumAgoaPreferentialExports([]) : 0;
      if (agoaMetrics && sumAgoaPreferentialExports(
        (await sb.from('souvera_agoa_trade_flows').select('*').eq('iso3', 'ERI').eq('year', flowYear ?? 2023)).data?.map(
          (f) => ({
            total_exports_to_us_usd: f.total_exports_to_us_usd,
            agoa_exports_usd: f.agoa_exports_usd,
            category_group: f.category_group,
            year: f.year,
            tariff_savings_usd: f.tariff_savings_usd,
          }),
        ) ?? [],
      ) > 0 && !vaultEligible) {
        failures.push('ERI: non-zero preferential exports while ineligible');
      } else {
        passes.push('ERI: $0 AGOA preferential exports (ineligible)');
      }
      void preferential;

      const trade: CountryTrade = {
        asOfYear: censusYear ?? 2023,
        exportsToUs: { year: censusYear ?? 2023, valueUsd: censusExports ?? undefined },
        importsFromUs: { year: censusYear ?? 2023, valueUsd: snap?.imports_from_us_usd ?? undefined },
        agoa: {
          status: 'ineligible',
          statusNote: agoaPolicy.notes ?? 'Not a current AGOA beneficiary.',
        },
      };
      const narrative = buildUsTradeCardAnalysis({
        countryName: country.name,
        iso3,
        trade,
        agoaPolicy,
      });
      if (!/not a current AGOA beneficiary/i.test(narrative)) {
        failures.push('ERI: trade analysis missing ineligible framing');
      } else if (/maintains active eligibility|designated AGOA beneficiary on USTR/i.test(narrative)) {
        failures.push('ERI: trade analysis falsely claims active AGOA eligibility');
      } else {
        passes.push('ERI: trade analysis uses ineligible framing');
      }
    }

    const { data: ustrRefs } = await sb
      .from('souvera_external_reference_links')
      .select('ref_type, url, source_key')
      .eq('entity_key', iso3);
    const ustrAfrica = (ustrRefs ?? []).filter(
      (r) => r.ref_type === 'USTR_COUNTRY_PAGE' && String(r.source_key).includes('africa'),
    );
    if (iso3 === 'COD' && ustrAfrica.length === 0) {
      failures.push('COD: missing USTR Africa country page reference');
    } else if (iso3 === 'COD') {
      passes.push(`COD: USTR Africa reference present (${ustrAfrica.length})`);
    } else if (iso3 === 'ERI' && ustrAfrica.length > 0) {
      passes.push(`ERI: USTR reference present as expected (${ustrAfrica.length})`);
    } else {
      passes.push('ERI: no USTR Africa ref (optional for ineligible)');
    }

    const { data: ustrSummary } = await sb
      .from('souvera_ustr_trade_summaries')
      .select('iso3, year')
      .eq('iso3', iso3)
      .limit(1);
    if (iso3 === 'COD' && (ustrSummary?.length ?? 0) > 0) {
      passes.push('COD: USTR trade summary ingested (tertiary panel eligible)');
    } else if (iso3 === 'COD') {
      console.log('  Note: COD USTR trade summary not yet ingested — tertiary panel optional');
    }

    const { data: sectors } = await sb
      .from('souvera_country_sectors')
      .select(
        'sector_key, sector_label, agoa_opportunity, agoa_export_current_usd, agoa_export_potential_usd',
      )
      .eq('country_id', country.id);

    const ineligible = agoaPolicy.agoaStatus === 'ineligible';
    for (const s of sectors ?? []) {
      const opp = String(s.agoa_opportunity ?? '');
      if (falsePreferentialClaim(opp, ineligible)) {
        failures.push(`${iso3}/${s.sector_key}: false active AGOA preferential claim`);
      }
      if (isPetroleumOrEnergySector(s.sector_key as string, s.sector_label as string)) {
        if (/duty-free under agoa|agoa duty-free/i.test(opp)) {
          failures.push(`${iso3}/${s.sector_key}: energy sector claims AGOA duty-free on petroleum`);
        }
      }
    }

    if (iso3 === 'COD') {
      const mineralsSector = (sectors ?? []).find((s) =>
        /mineral|cobalt|copper|mining/i.test(`${s.sector_key} ${s.sector_label}`),
      );
      if (!mineralsSector) {
        failures.push('COD: no minerals sector row');
      } else {
        const opp = String(mineralsSector.agoa_opportunity ?? '');
        if (!opp.trim()) failures.push('COD/minerals: empty agoa_opportunity');
        else passes.push(`COD: minerals sector present (${mineralsSector.sector_key})`);
      }
      const energySectors = (sectors ?? []).filter((s) =>
        isPetroleumOrEnergySector(s.sector_key as string, s.sector_label as string),
      );
      if (energySectors.length === 0) {
        failures.push('COD: no energy/petroleum sector for footnote check');
      } else {
        passes.push(`COD: ${energySectors.length} energy sector(s) for petroleum footnote`);
      }
    }

    if (iso3 === 'ERI') {
      let falseClaims = 0;
      for (const s of sectors ?? []) {
        const opp = String(s.agoa_opportunity ?? '');
        if (
          /\bAGOA\b/i.test(opp) &&
          /eligible|duty-free|preferential/i.test(opp) &&
          !/ineligible|not a beneficiary|mfn|terminated|withdrawn|restoration only/i.test(opp)
        ) {
          falseClaims++;
        }
      }
      if (falseClaims > 0) {
        failures.push(`ERI: ${falseClaims} sector(s) with false AGOA preferential claims`);
      } else {
        passes.push('ERI: no false AGOA preferential claims in sector narratives');
      }
    }

    const { data: flowRows } = await sb
      .from('souvera_agoa_trade_flows')
      .select('category_group, agoa_exports_usd')
      .eq('iso3', iso3)
      .eq('year', flowYear ?? censusYear ?? 2024);
    for (const f of flowRows ?? []) {
      if (isPreferentialExcludedCategory(f.category_group as string) && (f.agoa_exports_usd as number) > 0) {
        failures.push(`${iso3}/${f.category_group}: excluded category has agoa_exports > 0`);
      }
    }
  }

  console.log('\n══════════════════════════════════════');
  console.log(`PASS: ${passes.length}`);
  for (const p of passes) console.log(`  ✓ ${p}`);
  if (failures.length) {
    console.log(`\nFAIL: ${failures.length}`);
    for (const f of failures) console.log(`  ✗ ${f}`);
    process.exit(1);
  }
  console.log('\n✅ COD/ERI Phase 2.5 spot-check PASS\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
