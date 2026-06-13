/**
 * Self-check: NGA + JAM + KEN geographic triad pilot parity.
 * Run: npx tsx scripts/test-pilot-triad-parity.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { FULL_TERMINAL_PILOT_ISO3 } from '../apps/api-gateway/src/lib/intelligence/country-names';
import { NIGERIA_TRADE } from '../apps/api-gateway/src/data/nigeria-trade';
import { JAMAICA_TRADE } from '../apps/api-gateway/src/data/jamaica-trade';
import { KENYA_TRADE } from '../apps/api-gateway/src/data/kenya-trade';
import { getRiskContent } from '../apps/api-gateway/src/lib/intelligence/country-risk-content';
import { getTradeTabCopy } from '../apps/api-gateway/src/lib/intelligence/country-trade-content';
import { getOverviewContent } from '../apps/api-gateway/src/lib/intelligence/country-overview-content';
import {
  AGOA_LEGISLATIVE_EVENTS,
  type AgoaCountryRecord,
} from '../apps/api-gateway/src/data/agoa-legislative-tracker';
import {
  getAgoaCountryRecord,
  AGOA_COUNTRY_STATUSES,
} from '../apps/api-gateway/src/data/agoa-full-coverage';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const PILOTS = ['NGA', 'JAM', 'KEN'] as const;

const TRADE_BY_ISO = {
  NGA: NIGERIA_TRADE,
  JAM: JAMAICA_TRADE,
  KEN: KENYA_TRADE,
} as const;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

let failed = 0;

function assert(label: string, condition: boolean) {
  if (!condition) {
    console.error(`❌ ${label}`);
    failed++;
  } else {
    console.log(`✅ ${label}`);
  }
}

function checkTradeStatic(iso3: typeof PILOTS[number]) {
  const trade = TRADE_BY_ISO[iso3];
  assert(`${iso3} trade: not pending`, !trade.pending);
  assert(`${iso3} trade: totalTradeUsd populated`, (trade.totalTradeUsd ?? 0) > 0);
  assert(`${iso3} trade: US bilateral exports`, (trade.exportsToUs?.valueUsd ?? 0) > 0);
  assert(`${iso3} trade: agoa block present`, !!trade.agoa);
  assert(`${iso3} trade: export composition`, (trade.exportComposition?.length ?? 0) >= 3);
  assert(`${iso3} trade: top partners`, (trade.topPartners?.length ?? 0) >= 4);

  if (iso3 === 'NGA') {
    assert(`${iso3} AGOA: eligible`, trade.agoa?.status === 'eligible');
    assert(`${iso3} AGOA: current exports > 0`, (trade.agoa?.currentExportsUsd ?? 0) > 0);
  }
  if (iso3 === 'KEN') {
    assert(`${iso3} AGOA: active eligibility`, trade.agoa?.status === 'eligible');
    assert(`${iso3} AGOA: current exports > 0`, (trade.agoa?.currentExportsUsd ?? 0) > 0);
    assert(`${iso3} trade: EAC intra-regional block`, !!trade.intraRegional);
  }
  if (iso3 === 'JAM') {
    assert(`${iso3} trade: CARICOM intra-regional block`, !!trade.intraRegional);
  }
}

function checkRiskContent(iso3: typeof PILOTS[number]) {
  const content = getRiskContent(iso3, iso3);
  const stats = content.riskAdjustedStats;
  assert(`${iso3} risk: narrative populated`, content.riskAdjustedNarrative.length > 80);
  assert(`${iso3} risk: stats not placeholder`, stats.every((s) => s.value !== '—'));
  assert(`${iso3} risk: returns bullets`, content.returnsBullets.length >= 3);
}

function checkTradeCopy(iso3: typeof PILOTS[number]) {
  const copy = getTradeTabCopy(iso3);
  assert(`${iso3} trade copy: regional agreements`, copy.regionalAgreements.length >= 2);
  if (iso3 === 'KEN') {
    const names = copy.regionalAgreements.map((a) => a.name).join(' ');
    assert(`${iso3} trade copy: AGOA agreement listed`, names.includes('AGOA'));
    assert(`${iso3} trade copy: EAC agreement listed`, names.includes('EAC'));
    assert(`${iso3} trade copy: not ECOWAS-only`, !copy.intraSecondaryVolumeLabel.includes('ECOWAS'));
  }
}

function checkOverviewContent(iso3: typeof PILOTS[number]) {
  const content = getOverviewContent(iso3, iso3, {});
  assert(`${iso3} overview: custom snapshot title`, content.snapshotTitle !== 'Country Overview');
  assert(`${iso3} overview: market access items`, content.marketAccessItems.length >= 2);
}

async function checkDbSeeds(iso3: typeof PILOTS[number]) {
  const { data: country } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', iso3)
    .maybeSingle();

  if (!country) {
    assert(`${iso3} DB: country record`, false);
    return;
  }

  const { data: profile } = await supabase
    .from('souvera_country_profiles')
    .select('summary_md, why_now_md, signal_level, economic_momentum')
    .eq('country_id', country.id)
    .maybeSingle();

  assert(`${iso3} DB: profile summary`, !!profile?.summary_md && profile.summary_md.length > 100);
  assert(`${iso3} DB: profile why_now`, !!profile?.why_now_md && profile.why_now_md.length > 100);
  assert(`${iso3} DB: economic_momentum`, profile?.economic_momentum != null);

  const { data: sectors } = await supabase
    .from('souvera_country_sectors')
    .select('sector_key, teaser, agoa_opportunity')
    .eq('country_id', country.id)
    .eq('row_status', 'active');

  assert(`${iso3} DB: ≥5 active sectors`, (sectors?.length ?? 0) >= 5);

  const { data: observations } = await supabase
    .from('souvera_country_observations')
    .select('id')
    .eq('country_id', country.id)
    .gte('period_date', '2020-01-01');

  assert(`${iso3} DB: time series observations`, (observations?.length ?? 0) >= 7);

  const { data: signal } = await supabase
    .from('souvera_country_signal_scores')
    .select('signal_level, investment_score')
    .eq('country_id', country.id)
    .maybeSingle();

  assert(`${iso3} DB: signal scores`, !!signal?.signal_level && signal.investment_score != null);

  const { data: news } = await supabase
    .from('souvera_country_news_signals')
    .select('top_headlines')
    .eq('country_id', country.id)
    .order('signal_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const headlines = (news?.top_headlines as unknown[] | null) ?? [];
  assert(`${iso3} DB: news pulse headlines`, headlines.length >= 2);
}

function checkAgoaTracker() {
  assert('AGOA: 54 African markets tracked', AGOA_COUNTRY_STATUSES.length === 54);
  assert('AGOA: sub-Saharan eligible+suspended+graduated', AGOA_COUNTRY_STATUSES.filter((r) => r.agoa_status !== 'not_applicable').length >= 45);
  assert('AGOA: legislative events', AGOA_LEGISLATIVE_EVENTS.length >= 5);
  for (const iso of PILOTS) {
    if (iso === 'JAM') continue;
    const rec = getAgoaCountryRecord(iso);
    assert(`${iso} AGOA: country record`, !!rec);
    assert(`${iso} AGOA: status set`, !!rec?.agoa_status);
  }
  assert('NGA AGOA: no curated override (vault authority)', !getAgoaCountryRecord('NGA') || getAgoaCountryRecord('NGA')?.agoa_status !== 'suspended');
  assert('KEN AGOA: eligible', getAgoaCountryRecord('KEN')?.agoa_status === 'eligible');
}

async function main() {
  console.log('🧪 Pilot triad self-check (NGA + JAM + KEN)\n');

  for (const iso of PILOTS) {
    assert(`FULL_TERMINAL_PILOT includes ${iso}`, FULL_TERMINAL_PILOT_ISO3.has(iso));
  }

  console.log('\n── AGOA Legislative Tracker ──');
  checkAgoaTracker();

  console.log('\n── Static content (Trade / Risk / Overview) ──');
  for (const iso of PILOTS) {
    checkTradeStatic(iso);
    checkRiskContent(iso);
    checkTradeCopy(iso);
    checkOverviewContent(iso);
  }

  console.log('\n── Database seeds ──');
  for (const iso of PILOTS) {
    await checkDbSeeds(iso);
  }

  console.log('\n' + '═'.repeat(50));
  if (failed === 0) {
    console.log('✅ Pilot triad parity passed — NGA + JAM + KEN complete.');
    process.exit(0);
  } else {
    console.log(`❌ ${failed} check(s) failed.`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
