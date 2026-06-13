/**
 * Re-seed aligned overview content for Nigeria and Jamaica in one pass.
 * Run: npx tsx scripts/seed-country-overviews.ts
 */

import { execSync } from 'child_process';
import * as path from 'path';

const root = path.join(__dirname, '..');

const seeds = ['seed-nigeria-overview.ts', 'seed-jamaica-overview.ts'];

console.log('═'.repeat(60));
console.log('  Souvera Country Overview — aligned re-seed (NGA + JAM)');
console.log('═'.repeat(60));
console.log();

for (const script of seeds) {
  console.log(`▶ Running ${script}...\n`);
  execSync(`npx tsx scripts/${script}`, { cwd: root, stdio: 'inherit' });
  console.log();
}

console.log('═'.repeat(60));
console.log('  ✅ Both countries aligned. Verify:');
console.log('     /country/NGA  → Souvera Country Analysis (Professional+)');
console.log('     /country/JAM  → Souvera Country Analysis (Professional+)');
console.log('═'.repeat(60));
