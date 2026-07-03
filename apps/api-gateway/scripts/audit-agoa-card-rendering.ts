/**
 * Audit AGOA card narrative consistency across all African markets.
 *
 * Verifies that, after moving the policy `statusNote` out of the card body and into the
 * Souvera Analysis narrative, every market:
 *   - resolves to a definitive AGOA status (no 'under_review'),
 *   - produces a clean 3-paragraph narrative via buildUsTradeCardAnalysis,
 *   - surfaces its policy nuance (textile/apparel eligibility, apparel suspension,
 *     reinstatement, coup/human-rights termination, GSP graduation) IN the narrative
 *     when that nuance exists in the Evidence Vault note,
 *   - never emits the broken "maintains active eligibility ... N/A" text for ineligible markets.
 *
 * Read-only. Trade figures are placeholders (narrative-structure check, not value check).
 * Run: npx tsx apps/api-gateway/scripts/audit-agoa-card-rendering.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { APPROVED_AFRICA_ISO3 } from '../src/lib/market-coverage';
import { resolvePolicyStatusRegistry } from '../src/lib/reports/policy-status-registry';
import { policyRecordToAgoaUiSnapshot } from '../src/lib/intelligence/trade-policy-vault';
import { buildUsTradeCardAnalysis } from '../src/lib/intelligence/us-trade-card-analysis';
import type { AgoaPolicyUiSnapshot, CountryTrade } from '../src/types/country-intelligence';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type TradeAgoaStatus = NonNullable<CountryTrade['agoa']>['status'];

/** Mirror the country route's mapping from policy snapshot to trade.agoa.status. */
function mapToTradeStatus(s: AgoaPolicyUiSnapshot['agoaStatus']): TradeAgoaStatus | null {
  switch (s) {
    case 'eligible':
      return 'eligible';
    case 'suspended':
      return 'restoration_opportunity';
    case 'ineligible':
    case 'graduated':
      return 'ineligible';
    case 'not_applicable':
      return 'not_applicable';
    default:
      return null; // under_review → no card
  }
}

/** Build a placeholder trade object so the narrative can render for inspection. */
function buildTrade(status: TradeAgoaStatus, note: string): CountryTrade {
  const eligible = status === 'eligible';
  const restoration = status === 'restoration_opportunity';
  return {
    asOfYear: 2023,
    exportsToUs: { year: 2023, valueUsd: 250_000_000, yoyPct: 6 },
    importsFromUs: { year: 2023, valueUsd: 120_000_000, yoyPct: 3 },
    agoa: {
      status,
      statusNote: note,
      totalExportsToUsUsd: 250_000_000,
      currentExportsUsd: eligible ? 162_000_000 : undefined,
      potentialExportsUsd: eligible || restoration ? 240_000_000 : undefined,
      restorationPotentialUsd: restoration ? 300_000_000 : undefined,
      eligibleCategories: eligible || restoration ? 6500 : undefined,
      dataSource: 'UN Comtrade / USITC',
      dataVintage: 2023,
    },
  };
}

/** Expected nuance keyword that must appear in the narrative given the vault note. */
function expectedNuance(note: string): { label: string; needle: RegExp } | null {
  const lc = note.toLowerCase();
  if (lc.includes('textile and apparel') || lc.includes('apparel benefits eligible'))
    return { label: 'textile/apparel eligible', needle: /textile and apparel provisions/i };
  if (lc.includes('apparel benefits suspended'))
    return { label: 'apparel suspended', needle: /apparel benefits remain suspended/i };
  if (lc.includes('reinstated'))
    return { label: 'reinstated', needle: /reinstated as an AGOA beneficiary/i };
  if (lc.includes('coup') || lc.includes('unconstitutional change of government'))
    return { label: 'coup/termination', needle: /unconstitutional change of government/i };
  if (lc.includes('human-rights') || lc.includes('human rights'))
    return { label: 'human-rights termination', needle: /internationally recognised human rights/i };
  if (lc.includes('graduated'))
    return { label: 'GSP graduation', needle: /graduated from GSP\/AGOA/i };
  return null;
}

async function main() {
  const iso3s = (APPROVED_AFRICA_ISO3 as unknown as string[]).slice().sort();
  console.log(`\n=== AGOA card narrative audit — ${iso3s.length} African markets ===\n`);

  const issues: string[] = [];
  let ok = 0;

  for (const iso3 of iso3s) {
    const records = await resolvePolicyStatusRegistry(iso3);
    const agoaRec = records.find((r) => r.framework === 'AGOA');
    const snap = agoaRec ? policyRecordToAgoaUiSnapshot(agoaRec) : null;

    if (!snap) {
      issues.push(`${iso3}: no AGOA policy record resolved`);
      continue;
    }
    if (snap.agoaStatus === 'under_review') {
      issues.push(`${iso3}: still resolves to under_review`);
      continue;
    }

    const tradeStatus = mapToTradeStatus(snap.agoaStatus);
    if (!tradeStatus) {
      issues.push(`${iso3}: unmapped status ${snap.agoaStatus}`);
      continue;
    }

    const trade = buildTrade(tradeStatus, snap.notes);
    const narrative = buildUsTradeCardAnalysis({ countryName: iso3, iso3, trade, agoaPolicy: snap });
    const paras = narrative.split('\n\n');
    const wordCount = narrative.split(/\s+/).filter(Boolean).length;

    const localIssues: string[] = [];

    // Structure: exactly 3 paragraphs, reasonable length.
    if (paras.length !== 3) localIssues.push(`expected 3 paragraphs, got ${paras.length}`);
    // Upper bound accommodates the policy-nuance sentence plus the utilization /
    // MFN / multi-year trend sentences in the eligible branch.
    if (wordCount < 140 || wordCount > 380) localIssues.push(`word count ${wordCount} outside 140-380`);

    // Ineligible markets must NOT claim active eligibility or emit N/A export figures.
    if (tradeStatus === 'ineligible') {
      if (/maintains active|designated AGOA beneficiary/i.test(narrative))
        localIssues.push('ineligible market wrongly claims eligibility');
      if (/preferential exports stand at N\/A/i.test(narrative))
        localIssues.push('ineligible market emits "N/A" preferential exports');
    }

    // Nuance: when the vault note carries a nuance, the narrative must surface it.
    const exp = expectedNuance(snap.notes);
    if (exp && !exp.needle.test(narrative)) {
      localIssues.push(`missing nuance in narrative: ${exp.label}`);
    }

    if (localIssues.length) {
      issues.push(`${iso3} [${snap.agoaStatus}/${tradeStatus}]: ${localIssues.join('; ')}`);
    } else {
      ok += 1;
    }
  }

  console.log(`Clean: ${ok}/${iso3s.length}`);
  if (issues.length) {
    console.log(`\n--- Markets needing review (${issues.length}) ---`);
    for (const i of issues) console.log(`  ⚠️  ${i}`);
  } else {
    console.log('\nAll markets render consistent, nuance-complete AGOA narratives. ✅');
  }

  // Spot-check sample narratives for manual eyeballing.
  console.log('\n=== Sample narratives (paragraph 2) ===');
  for (const iso3 of ['NGA', 'LSO', 'RWA', 'MRT', 'ETH', 'GAB', 'GNQ', 'MLI']) {
    const records = await resolvePolicyStatusRegistry(iso3);
    const agoaRec = records.find((r) => r.framework === 'AGOA');
    const snap = agoaRec ? policyRecordToAgoaUiSnapshot(agoaRec) : null;
    if (!snap) continue;
    const tradeStatus = mapToTradeStatus(snap.agoaStatus);
    if (!tradeStatus) continue;
    const trade = buildTrade(tradeStatus, snap.notes);
    const narrative = buildUsTradeCardAnalysis({ countryName: iso3, iso3, trade, agoaPolicy: snap });
    console.log(`\n[${iso3} · ${snap.agoaStatus}] note: "${snap.notes}"`);
    console.log(`  ${narrative.split('\n\n')[1]}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
