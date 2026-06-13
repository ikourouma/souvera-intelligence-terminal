/**
 * Seed all Kenya data: time series + signal scores + sectors.
 * Profiles: run seed-kenya-overview.ts separately.
 *
 * Run: npx tsx scripts/seed-kenya-data.ts
 */

import { execSync } from 'child_process';
import * as path from 'path';

const root = path.join(__dirname, '..');

const steps = [
  { script: 'seed-kenya-time-series.ts', label: 'Time series (2020–2025)' },
  { script: 'seed-kenya-signal.ts', label: 'Signal scores' },
  { script: 'seed-kenya-sectors.ts', label: 'Sectors (5 sectors, full parity)' },
];

console.log('═'.repeat(60));
console.log('  Kenya Data Seed — East Africa Pilot');
console.log('═'.repeat(60));
console.log();

for (const step of steps) {
  console.log(`▶ ${step.label} (${step.script})\n`);
  execSync(`npx tsx scripts/${step.script}`, { cwd: root, stdio: 'inherit' });
  console.log();
}

console.log('═'.repeat(60));
console.log('  ✅ Kenya data seed complete.');
console.log('  Verify: /country/KEN → Economy + Sectors + signal badge');
console.log('  Profiles: npx tsx scripts/seed-kenya-overview.ts');
console.log('  News Pulse: npx tsx scripts/seed-news-pulse-pilot.ts');
console.log('  Parity test: npx tsx scripts/test-sectors-parity.ts');
console.log('═'.repeat(60));
