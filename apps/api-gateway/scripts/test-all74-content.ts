/**
 * Verify every approved market produces substantive Risk / Opportunity / Trade
 * content — the libs that country briefs and the terminal tabs assemble from.
 *
 * Fails loudly if any market falls back to thin generic defaults (the failure
 * mode that left stakeholders without proper data / briefs).
 *
 * Run: npx tsx apps/api-gateway/scripts/test-all74-content.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';
import { getRiskContent } from '../src/lib/intelligence/country-risk-content';
import { getOpportunityContent } from '../src/lib/intelligence/country-opportunity-content';
import { getTradeTabCopy } from '../src/lib/intelligence/country-trade-content';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ALL74_ISO3 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: countries } = await sb
    .from('souvera_countries')
    .select('iso3, name')
    .in('iso3', ALL74_ISO3 as unknown as string[]);
  const nameByIso3 = new Map((countries ?? []).map((c) => [c.iso3, c.name]));

  let failures = 0;
  const issues: string[] = [];

  for (const iso3 of ALL74_ISO3) {
    const name = nameByIso3.get(iso3) ?? iso3;
    const risk = getRiskContent(iso3, name);
    const opp = getOpportunityContent(iso3, name);
    const trade = getTradeTabCopy(iso3);

    const riskItemCount =
      risk.macro.items.length + risk.political.items.length + risk.operational.items.length;
    const localIssues: string[] = [];

    // Risk must be richer than the 3-item generic default (curated pilots have 5+)
    if (riskItemCount < 5) localIssues.push(`risk items=${riskItemCount} (<5)`);
    if (risk.riskAdjustedStats.some((s) => s.value === '—')) localIssues.push('risk stats placeholder "—"');

    // Opportunity must have 3 pillars and no "See Sectors tab" placeholder bullets
    if (opp.pillars.length < 3) localIssues.push(`pillars=${opp.pillars.length} (<3)`);
    const placeholderBullet = opp.pillars.some((p) =>
      p.bullets.some((b) => /see (sectors|economy|trade) tab/i.test(b.text))
    );
    if (placeholderBullet) localIssues.push('opportunity has "See X tab" placeholder bullet');

    // Trade must show real regional agreements, not WTO-only
    const isWtoOnly =
      trade.regionalAgreements.length === 1 && trade.regionalAgreements[0].name === 'WTO';
    if (isWtoOnly) localIssues.push('trade is WTO-only');
    if (trade.regionalAgreements.length < 2) localIssues.push(`agreements=${trade.regionalAgreements.length} (<2)`);

    if (localIssues.length) {
      failures++;
      issues.push(`❌ ${iso3} (${name}): ${localIssues.join('; ')}`);
    }
  }

  console.log(`\n=== Content readiness for ${ALL74_ISO3.length} markets ===\n`);
  if (issues.length) {
    issues.forEach((i) => console.log(i));
  }
  console.log(
    failures
      ? `\n${failures}/${ALL74_ISO3.length} markets have content gaps.`
      : `\n✅ All ${ALL74_ISO3.length} markets produce substantive risk, opportunity, and trade content.`
  );
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
