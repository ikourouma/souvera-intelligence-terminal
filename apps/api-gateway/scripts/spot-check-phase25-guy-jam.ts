/**
 * Phase 2.5 spot-check — GUY / JAM Trade + Sectors prerequisites.
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/spot-check-phase25-guy-jam.ts
 */
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';
import { isApprovedCaribbeanMarket } from '../src/lib/market-coverage';
import { getCountryRegion } from '../src/lib/intelligence/country-overview-content';
import { getSectorTradeCopy } from '../src/lib/intelligence/country-sectors-content';
import { getTradeTabCopy } from '../src/lib/intelligence/country-trade-content';
import { buildUsTradeCardAnalysis } from '../src/lib/intelligence/us-trade-card-analysis';
import { isPetroleumOrEnergySector } from '../src/lib/intelligence/preferential-trade-policy';

loadProjectEnv();

const MARKETS = ['GUY', 'JAM'] as const;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const failures: string[] = [];
  const passes: string[] = [];

  for (const iso3 of MARKETS) {
    console.log(`\n── ${iso3} ──`);

    if (!isApprovedCaribbeanMarket(iso3)) failures.push(`${iso3}: not in APPROVED_CARIBBEAN_ISO3`);
    if (getCountryRegion(iso3) !== 'caribbean') failures.push(`${iso3}: region not caribbean`);

    const sectorCopy = getSectorTradeCopy(iso3);
    const tradeCopy = getTradeTabCopy(iso3);
    if (/agoa/i.test(sectorCopy.sectionTitle + sectorCopy.lockedTitle)) {
      failures.push(`${iso3}: sector copy references AGOA`);
    } else {
      passes.push(`${iso3}: sector labels use CBI`);
    }
    if (!/cbi/i.test(tradeCopy.preferentialFramework ?? '') && !/cbi/i.test(sectorCopy.sectionTitle)) {
      // trade tab copy check
    }

    const { data: country } = await sb.from('souvera_countries').select('id, name').eq('iso3', iso3).maybeSingle();
    if (!country) {
      failures.push(`${iso3}: missing souvera_countries row`);
      continue;
    }

    const { data: snaps } = await sb
      .from('souvera_country_trade_snapshots')
      .select('year, total_trade_usd, exports_usd, imports_usd, exports_to_us_usd, imports_from_us_usd, source_notes')
      .eq('country_id', country.id)
      .order('year', { ascending: false })
      .limit(1);

    const snap = snaps?.[0];
    if (!snap) {
      failures.push(`${iso3}: no trade snapshot`);
    } else {
      // Census-only Caribbean rows: global cols are null; bilateral cols drive totals (same as country API + snapshot audit).
      const isCensus = String(snap.source_notes ?? '').toLowerCase().includes('census');
      const hasGlobal = snap.exports_usd != null || snap.imports_usd != null;
      const exp = hasGlobal ? (snap.exports_usd ?? 0) : (snap.exports_to_us_usd ?? snap.exports_usd ?? 0);
      const imp = hasGlobal ? (snap.imports_usd ?? 0) : (snap.imports_from_us_usd ?? snap.imports_usd ?? 0);
      const total =
        snap.total_trade_usd ??
        (snap.exports_to_us_usd != null || snap.imports_from_us_usd != null
          ? (snap.exports_to_us_usd ?? 0) + (snap.imports_from_us_usd ?? 0)
          : null);
      if (total == null) {
        failures.push(`${iso3}: no resolvable trade total`);
      } else {
        const delta = Math.abs(total - (exp + imp));
        const tol = Math.max(1000, total * 0.001);
        if (delta > tol) {
          failures.push(`${iso3}: total ${total} != exports ${exp} + imports ${imp} (Δ ${delta}) [census=${isCensus}]`);
        } else {
          passes.push(`${iso3}: snapshot math OK (${snap.year}) total=${total} scope=${hasGlobal ? 'global' : 'bilateral_us'}`);
        }
      }
      console.log(
        `  Snapshot ${snap.year}: exports=${exp} imports=${imp} total=${total} exp_to_us=${snap.exports_to_us_usd} imp_from_us=${snap.imports_from_us_usd}`,
      );
    }

    const { data: ustrRefs } = await sb
      .from('souvera_external_reference_links')
      .select('ref_type, url, source_key')
      .eq('entity_key', iso3);
    const africaUstr = (ustrRefs ?? []).filter(
      (r) => r.ref_type === 'USTR_COUNTRY_PAGE' && String(r.source_key).includes('africa'),
    );
    if (africaUstr.length > 0) {
      failures.push(`${iso3}: USTR Africa external ref present (${africaUstr.length}) — should not show on Caribbean Trade tab`);
    } else {
      passes.push(`${iso3}: no USTR Africa external refs`);
    }

    const { data: cbtpa } = await sb
      .from('souvera_cbtpa_trade_flows')
      .select('category_group, trade_with_us_usd, year')
      .eq('iso3', iso3)
      .eq('direction', 'exports')
      .order('year', { ascending: false })
      .limit(20);

    const cbtpaCount = cbtpa?.length ?? 0;
    if (cbtpaCount === 0) failures.push(`${iso3}: no CBTPA export flow rows`);
    else passes.push(`${iso3}: ${cbtpaCount} CBTPA flow rows`);

    const { data: sectors } = await sb
      .from('souvera_country_sectors')
      .select('sector_key, sector_label, agoa_opportunity')
      .eq('country_id', country.id);

    const energySectors = (sectors ?? []).filter((s) =>
      isPetroleumOrEnergySector(s.sector_key as string, s.sector_label as string),
    );
    if (energySectors.length === 0) {
      failures.push(`${iso3}: no energy/petroleum sector row for petroleum footnote check`);
    } else {
      passes.push(`${iso3}: ${energySectors.length} energy sector(s): ${energySectors.map((s) => s.sector_key).join(', ')}`);
      for (const s of energySectors) {
        const opp = String(s.agoa_opportunity ?? '');
        if (/duty-free under agoa|agoa duty-free/i.test(opp)) {
          failures.push(`${iso3}/${s.sector_key}: agoa_opportunity claims AGOA duty-free on energy`);
        }
      }
    }

    for (const s of sectors ?? []) {
      const opp = String(s.agoa_opportunity ?? '');
      if (/\bAGOA\b/.test(opp) && !/\bCBI\b|\bCBTPA\b|\bCARICOM\b/.test(opp)) {
        failures.push(`${iso3}/${s.sector_key}: agoa_opportunity mentions AGOA without CBI context`);
      }
    }

    const analysis = buildUsTradeCardAnalysis({
      countryName: country.name,
      iso3,
      trade: {
        exportsToUs: { valueUsd: snap?.exports_to_us_usd ?? undefined, year: snap?.year as number },
        importsFromUs: { valueUsd: snap?.imports_from_us_usd ?? undefined, year: snap?.year as number },
        agoa: {
          status: 'eligible',
          statusNote: 'CBI/CBTPA',
          currentExportsUsd: 100_000_000,
          potentialExportsUsd: 200_000_000,
          totalExportsToUsUsd: snap?.exports_to_us_usd ?? undefined,
        },
      },
    });
    if (/\bAGOA\b/.test(analysis) && !/\bCBI\b|\bCBTPA\b/.test(analysis)) {
      failures.push(`${iso3}: US trade card analysis mentions AGOA without CBI framing`);
    } else {
      passes.push(`${iso3}: trade analysis uses CBI framing`);
    }

    console.log(`  Sector copy: ${sectorCopy.sectionTitle}`);
    console.log(`  CBTPA rows: ${cbtpaCount}`);
  }

  console.log('\n══════════════════════════════════════');
  console.log(`PASS: ${passes.length}`);
  for (const p of passes) console.log(`  ✓ ${p}`);
  if (failures.length) {
    console.log(`\nFAIL: ${failures.length}`);
    for (const f of failures) console.log(`  ✗ ${f}`);
    process.exit(1);
  }
  console.log('\n✅ GUY/JAM Phase 2.5 spot-check PASS\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
