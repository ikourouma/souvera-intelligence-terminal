/**
 * Seed all Jamaica data: time series + signal scores.
 * Profiles: run seed-country-overviews.ts separately (or included below).
 *
 * Run: npx tsx scripts/seed-jamaica-data.ts
 */

import { execSync } from 'child_process';
import * as path from 'path';

const root = path.join(__dirname, '..');

const steps = [
  { script: 'seed-jamaica-time-series.ts', label: 'Time series (2020–2025)' },
  { script: 'seed-jamaica-signal.ts', label: 'Signal scores' },
  { script: 'seed-jamaica-sectors.ts', label: 'Sectors (5 sectors, full parity)' },
];

console.log('═'.repeat(60));
console.log('  Jamaica Data Seed — Sprint A');
console.log('═'.repeat(60));
console.log();

for (const step of steps) {
  console.log(`▶ ${step.label} (${step.script})\n`);
  execSync(`npx tsx scripts/${step.script}`, { cwd: root, stdio: 'inherit' });
  console.log();
}

console.log('═'.repeat(60));
console.log('  ✅ Jamaica data seed complete.');
console.log('  Verify: /country/JAM → Economy + Sectors + signal badge');
console.log('  Profiles: npx tsx scripts/seed-jamaica-overview.ts');
console.log('  Parity test: npx tsx scripts/test-sectors-parity.ts');
console.log('═'.repeat(60));
