// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Ingestion CLI Runner
// Owner: Afronovation, Inc.
//
// Usage:
//   npx tsx services/ingestion/run.ts restcountries
//   npx tsx services/ingestion/run.ts worldbank
//   npx tsx services/ingestion/run.ts all
// ===========================================

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { ingestRestCountries } from './restcountries';
import { ingestWorldBank } from './worldbank';

const ADAPTERS: Record<string, () => Promise<void>> = {
  restcountries: ingestRestCountries,
  worldbank: ingestWorldBank,
};

async function main(): Promise<void> {
  const adapter = process.argv[2]?.toLowerCase();

  if (!adapter) {
    console.error('Usage: npx tsx services/ingestion/run.ts <adapter>');
    console.error('Available adapters:', Object.keys(ADAPTERS).join(', '), ', all');
    process.exit(1);
  }

  console.log('==============================================');
  console.log('  SOUVERA INTELLIGENCE TERMINAL');
  console.log('  Data Ingestion Runner');
  console.log('  Owner: Afronovation, Inc.');
  console.log('==============================================');
  console.log(`  Adapter: ${adapter}`);
  console.log(`  Time: ${new Date().toISOString()}`);
  console.log('==============================================\n');

  if (adapter === 'all') {
    for (const [name, fn] of Object.entries(ADAPTERS)) {
      try {
        console.log(`\n>>> Running adapter: ${name}`);
        await fn();
      } catch (err) {
        console.error(`>>> Adapter ${name} failed:`, err);
      }
    }
  } else if (ADAPTERS[adapter]) {
    try {
      await ADAPTERS[adapter]();
    } catch (err) {
      console.error(`\nIngestion failed:`, err);
      process.exit(1);
    }
  } else {
    console.error(`Unknown adapter: ${adapter}`);
    console.error('Available:', Object.keys(ADAPTERS).join(', '), ', all');
    process.exit(1);
  }

  console.log('\n==============================================');
  console.log('  Ingestion complete.');
  console.log('==============================================\n');
}

main();
