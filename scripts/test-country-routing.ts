/**
 * Routing logic self-test — NGA/JAM explore + manage plan paths.
 * Run: npx tsx scripts/test-country-routing.ts
 */

import {
  canAccessCountryTerminal,
  countryTerminalHref,
  exploreCountryHref,
  managePlanHref,
  planRankFromTier,
} from '../apps/api-gateway/src/lib/intelligence/routing';

let failed = 0;

function assert(label: string, condition: boolean) {
  if (!condition) {
    console.error(`❌ ${label}`);
    failed++;
  } else {
    console.log(`✅ ${label}`);
  }
}

// Explorer+ authenticated → country terminal
assert(
  'Auth explorer → /country/NGA',
  exploreCountryHref({
    iso3: 'NGA',
    countryName: 'Nigeria',
    isAuthenticated: true,
    accessTier: 'explorer',
  }) === '/country/NGA'
);

assert(
  'Auth professional → /country/JAM',
  exploreCountryHref({
    iso3: 'jam',
    countryName: 'Jamaica',
    isAuthenticated: true,
    accessTier: 'professional',
  }) === '/country/JAM'
);

// Anonymous → request-access with country context
const anonNga = exploreCountryHref({
  iso3: 'NGA',
  countryName: 'Nigeria',
  isAuthenticated: false,
  accessTier: 'public',
});
assert('Anonymous → request-access', anonNga.startsWith('/access/request-access?'));
assert('Anonymous includes country=NGA', anonNga.includes('country=NGA'));
assert('Anonymous includes plan=explorer', anonNga.includes('plan=explorer'));
assert('Anonymous includes source=map-workspace', anonNga.includes('source=map-workspace'));

// Public tier (not authenticated)
assert(
  'Public meta → request-access',
  !canAccessCountryTerminal(false, planRankFromTier('public'))
);

// Manage plan
assert('Manage plan (auth) → profile', managePlanHref(true) === '/profile#subscription');
assert('Manage plan (anon) → /access', managePlanHref(false) === '/access');

assert('countryTerminalHref tab', countryTerminalHref('NGA', { tab: 'trade' }).includes('tab=trade'));

console.log('\n' + '═'.repeat(40));
if (failed === 0) {
  console.log('✅ All routing checks passed.');
  process.exit(0);
} else {
  console.log(`❌ ${failed} check(s) failed.`);
  process.exit(1);
}
