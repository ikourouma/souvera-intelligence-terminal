/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * Supply-Demand Matrix Verification
 * Owner: Afronovation, Inc.
 * Phase 4C: Supply-Demand Matrix
 * =====================================================
 *
 * This script validates the Supply-Demand Matrix data:
 *   - Checks completeness (592 cells expected)
 *   - Verifies confidence level distribution
 *   - Validates score ranges (0-100)
 *   - Identifies top opportunities
 *   - Flags potential data quality issues
 *
 * Run command:
 *   npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts verify:supply-demand
 */

import { getSupabaseServiceClient } from '@souvera/config';

const DATA_YEAR = 2023;
const EXPECTED_COUNTRIES = 74;
const EXPECTED_SECTORS = 8;
const EXPECTED_CELLS = EXPECTED_COUNTRIES * EXPECTED_SECTORS;

export async function verifySupplyDemandMatrix(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    SUPPLY-DEMAND MATRIX VERIFICATION                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const supabase = getSupabaseServiceClient();

  // 1. Total Cell Count
  console.log('1. COMPLETENESS CHECK');
  console.log('─'.repeat(60));

  const { count: totalCells, error: countError } = await supabase
    .from('souvera_supply_demand_signals')
    .select('*', { count: 'exact', head: true })
    .eq('data_year', DATA_YEAR);

  if (countError) {
    console.error('   Error counting cells:', countError.message);
    return;
  }

  console.log(`   Total cells: ${totalCells} / ${EXPECTED_CELLS} expected`);
  console.log(`   Coverage: ${((totalCells ?? 0) / EXPECTED_CELLS * 100).toFixed(1)}%`);
  
  if ((totalCells ?? 0) < EXPECTED_CELLS) {
    console.log(`   ⚠️  MISSING ${EXPECTED_CELLS - (totalCells ?? 0)} cells`);
  } else {
    console.log(`   ✅ Complete`);
  }

  // 2. Region Distribution
  console.log('\n2. REGION DISTRIBUTION');
  console.log('─'.repeat(60));

  const { data: regionData } = await supabase
    .from('souvera_supply_demand_signals')
    .select('region')
    .eq('data_year', DATA_YEAR);

  const regionCounts = { Africa: 0, Caribbean: 0 };
  (regionData || []).forEach((r: any) => {
    if (r.region === 'Africa') regionCounts.Africa++;
    if (r.region === 'Caribbean') regionCounts.Caribbean++;
  });

  console.log(`   Africa: ${regionCounts.Africa} cells (expected: ${54 * 8} = 432)`);
  console.log(`   Caribbean: ${regionCounts.Caribbean} cells (expected: ${20 * 8} = 160)`);

  // 3. Confidence Level Distribution
  console.log('\n3. DATA CONFIDENCE DISTRIBUTION');
  console.log('─'.repeat(60));

  const { data: confData } = await supabase
    .from('souvera_supply_demand_signals')
    .select('supply_confidence, data_quality_tier')
    .eq('data_year', DATA_YEAR);

  const confCounts = { A: 0, B: 0, C: 0 };
  (confData || []).forEach((r: any) => {
    const tier = r.data_quality_tier || 'C';
    confCounts[tier as 'A' | 'B' | 'C']++;
  });

  console.log(`   Tier A (High Confidence): ${confCounts.A} cells (${(confCounts.A / (totalCells ?? 1) * 100).toFixed(1)}%)`);
  console.log(`   Tier B (Medium):          ${confCounts.B} cells (${(confCounts.B / (totalCells ?? 1) * 100).toFixed(1)}%)`);
  console.log(`   Tier C (Estimated):       ${confCounts.C} cells (${(confCounts.C / (totalCells ?? 1) * 100).toFixed(1)}%)`);

  if (confCounts.A >= 160) {
    console.log(`   ✅ Minimum Tier A threshold met (≥160)`);
  } else {
    console.log(`   ⚠️  Tier A cells below threshold (${confCounts.A} < 160)`);
  }

  // 4. Opportunity Tier Distribution
  console.log('\n4. OPPORTUNITY TIER DISTRIBUTION');
  console.log('─'.repeat(60));

  const { data: tierData } = await supabase
    .from('souvera_supply_demand_signals')
    .select('opportunity_tier')
    .eq('data_year', DATA_YEAR);

  const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  (tierData || []).forEach((r: any) => {
    const tier = r.opportunity_tier || 4;
    tierCounts[tier as 1 | 2 | 3 | 4]++;
  });

  console.log(`   Tier 1 (High-Conviction): ${tierCounts[1]} cells`);
  console.log(`   Tier 2 (Strong):          ${tierCounts[2]} cells`);
  console.log(`   Tier 3 (Emerging):        ${tierCounts[3]} cells`);
  console.log(`   Tier 4 (Early-Stage):     ${tierCounts[4]} cells`);

  // 5. Score Range Validation
  console.log('\n5. SCORE RANGE VALIDATION');
  console.log('─'.repeat(60));

  const { data: scoreData, error: scoreError } = await supabase
    .from('souvera_supply_demand_signals')
    .select('iso3, sector_key, supply_score, demand_score, opportunity_score')
    .eq('data_year', DATA_YEAR);

  let invalidScores = 0;
  const outOfRange: string[] = [];

  (scoreData || []).forEach((r: any) => {
    const scores = [r.supply_score, r.demand_score, r.opportunity_score];
    scores.forEach((s, i) => {
      if (s !== null && (s < 0 || s > 100)) {
        invalidScores++;
        outOfRange.push(`${r.iso3}/${r.sector_key}: ${['supply', 'demand', 'opportunity'][i]}=${s}`);
      }
    });
  });

  if (invalidScores === 0) {
    console.log('   ✅ All scores within valid range (0-100)');
  } else {
    console.log(`   ⚠️  ${invalidScores} scores out of range`);
    outOfRange.slice(0, 5).forEach(msg => console.log(`      - ${msg}`));
  }

  // 6. Top 10 Opportunities
  console.log('\n6. TOP 10 OPPORTUNITIES');
  console.log('─'.repeat(60));

  const { data: topData } = await supabase
    .from('souvera_supply_demand_signals')
    .select('iso3, country_name, sector_label, opportunity_score, opportunity_tier, data_quality_tier')
    .eq('data_year', DATA_YEAR)
    .order('opportunity_score', { ascending: false })
    .limit(10);

  console.log('   Rank | Country                | Sector                  | Score | Tier | Quality');
  console.log('   ' + '─'.repeat(85));

  (topData || []).forEach((r: any, i: number) => {
    const country = (r.country_name || '').padEnd(22).slice(0, 22);
    const sector = (r.sector_label || '').padEnd(23).slice(0, 23);
    console.log(`   ${(i + 1).toString().padStart(4)} | ${country} | ${sector} | ${Math.round(r.opportunity_score).toString().padStart(5)} | T${r.opportunity_tier}   | ${r.data_quality_tier}`);
  });

  // 7. Potential Issues
  console.log('\n7. POTENTIAL DATA ISSUES');
  console.log('─'.repeat(60));

  // Check for null scores
  const { count: nullScores } = await supabase
    .from('souvera_supply_demand_signals')
    .select('*', { count: 'exact', head: true })
    .eq('data_year', DATA_YEAR)
    .or('supply_score.is.null,demand_score.is.null,opportunity_score.is.null');

  console.log(`   Null scores: ${nullScores ?? 0}`);

  // Check for missing trade data
  const { count: noTrade } = await supabase
    .from('souvera_supply_demand_signals')
    .select('*', { count: 'exact', head: true })
    .eq('data_year', DATA_YEAR)
    .eq('current_trade_usd', 0);

  console.log(`   Zero trade corridors: ${noTrade ?? 0}`);

  // AGOA/CBTPA counts
  const { count: agoaCount } = await supabase
    .from('souvera_supply_demand_signals')
    .select('*', { count: 'exact', head: true })
    .eq('data_year', DATA_YEAR)
    .eq('agoa_eligible', true);

  const { count: cbtpaCount } = await supabase
    .from('souvera_supply_demand_signals')
    .select('*', { count: 'exact', head: true })
    .eq('data_year', DATA_YEAR)
    .eq('cbtpa_eligible', true);

  console.log(`   AGOA-eligible cells: ${agoaCount ?? 0}`);
  console.log(`   CBTPA-eligible cells: ${cbtpaCount ?? 0}`);

  // 8. Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    VERIFICATION SUMMARY                                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`   Total Cells:       ${totalCells ?? 0} / ${EXPECTED_CELLS}`);
  console.log(`   Data Coverage:     ${((totalCells ?? 0) / EXPECTED_CELLS * 100).toFixed(1)}%`);
  console.log(`   High-Confidence:   ${confCounts.A} cells (${(confCounts.A / (totalCells ?? 1) * 100).toFixed(1)}%)`);
  console.log(`   Tier 1+2 Opps:     ${tierCounts[1] + tierCounts[2]} cells`);
  console.log(`   Invalid Scores:    ${invalidScores}`);
  console.log(`   Status:            ${(totalCells ?? 0) >= EXPECTED_CELLS && invalidScores === 0 ? '✅ VALID' : '⚠️  NEEDS ATTENTION'}`);
  console.log('');
}

export default verifySupplyDemandMatrix;
