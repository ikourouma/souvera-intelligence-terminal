/**
 * News Pulse country relevance self-test
 * Run: npx tsx scripts/test-news-pulse-relevance.ts
 */

import {
  isHeadlineRelevantToCountry,
  newsPulseFilterConfig,
} from '../apps/api-gateway/src/lib/intelligence/news-pulse-relevance';

let failed = 0;

function assert(label: string, condition: boolean) {
  if (!condition) {
    console.error(`❌ ${label}`);
    failed++;
  } else {
    console.log(`✅ ${label}`);
  }
}

const jamCfg = newsPulseFilterConfig('JAM')!;
const ngaCfg = newsPulseFilterConfig('NGA')!;

assert(
  'Black Stars / Ghana article rejected for JAM',
  !isHeadlineRelevantToCountry(
    "The Black Stars and Africa's World Cup dream",
    jamCfg
  )
);

assert(
  'Jamaica tourism headline accepted for JAM',
  isHeadlineRelevantToCountry(
    'Jamaica tourism arrivals hit record Q1 as cruise traffic rebounds',
    jamCfg
  )
);

assert(
  'Nigeria FX headline accepted for NGA',
  isHeadlineRelevantToCountry('Nigeria targets $30bn AfCFTA export corridor by 2027', ngaCfg)
);

assert(
  'Ghana-only headline rejected for NGA',
  !isHeadlineRelevantToCountry('Ghana cedi stabilizes after IMF review', ngaCfg)
);

console.log('\n' + '═'.repeat(40));
if (failed === 0) {
  console.log('✅ All relevance checks passed.');
  process.exit(0);
} else {
  console.log(`❌ ${failed} check(s) failed.`);
  process.exit(1);
}
