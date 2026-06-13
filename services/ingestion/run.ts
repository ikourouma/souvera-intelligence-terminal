// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Ingestion CLI Runner
// Owner: Afronovation, Inc.
//
// Usage:
//   npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts worldbank-top20
//   npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts verify:ustr:agoa
// ===========================================

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type IngestFn = () => Promise<void>;

const ADAPTER_LOADERS: Record<string, () => Promise<IngestFn>> = {
  restcountries: async () => (await import('./restcountries')).ingestRestCountries,
  worldbank: async () => (await import('./worldbank')).ingestWorldBank,
  'worldbank-top20': async () => (await import('./worldbank-top20')).ingestWorldBankTop20,
  'worldbank-rollout-fill': async () => (await import('./worldbank-rollout-fill')).ingestWorldBankRolloutFill,
  'curated-trade-macro-fill': async () => (await import('./curated-trade-macro-fill')).ingestCuratedTradeMacroFill,
  'curated-eccu-macro-fill': async () => (await import('./curated-eccu-macro-fill')).ingestCuratedEccuMacroFill,
  'imf-rollout-gap-fill': async () => (await import('./imf-rollout-gap-fill')).ingestImfRolloutGapFill,
  'imf-gap74-fill': async () => (await import('./imf-gap74-fill')).ingestImfGap74Fill,
  'imf-fiscal': async () => (await import('./imf-fiscal-sdmx')).ingestImfFiscalSdmx,
  'imf-areaer-fx': async () => (await import('./imf-areaer-fx')).ingestImfAreaerFx,
  'worldbank-wgi': async () => (await import('./worldbank-wgi')).ingestWorldBankWgi,
  'verify:ustr:agoa': async () => (await import('./verify-ustr-agoa')).verifyUstrAgoa,
  'verify:ustr:cbi': async () => (await import('./verify-ustr-cbi')).verifyUstrCbi,
  'verify:regional': async () => (await import('./verify-regional-frameworks')).verifyRegionalFrameworks,
  'verify:caricom': async () => (await import('./verify-caricom')).verifyCaricom,
  'audit:data-coverage': async () => (await import('./audit-data-coverage')).auditDataCoverage,
  'seed:entities': async () => (await import('./seed-souvera-entities')).seedSouveraEntities,
  'capture:ustr:anchors': async () => (await import('./capture-ustr-anchors')).captureUstrAnchors,
  'parse:ustr:africa_directory': async () =>
    (await import('./parse-ustr-africa-directory')).parseUstrAfricaDirectory,
  'static-trade-migration': async () =>
    (await import('./static-trade-migration')).ingestStaticTradeMigration,
  'seed:t2-profiles': async () =>
    (await import('./seed-rollout-t2-profiles')).seedRolloutT2Profiles,
  'ingest-import-demand': async () =>
    (await import('./ingest-import-demand-expanded')).ingestImportDemandExpanded,
  'ingest-afcfta-flows': async () =>
    (await import('./ingest-afcfta-flows')).ingestAfCFTAFlows,
  'ingest-cbtpa-flows': async () =>
    (await import('./ingest-cbtpa-flows')).ingestCBTPAFlows,
};

const VERIFY_ALL_NAMES = ['verify:ustr:agoa', 'verify:ustr:cbi', 'verify:regional', 'verify:caricom'] as const;

async function runAdapter(name: string): Promise<void> {
  const load = ADAPTER_LOADERS[name];
  if (!load) throw new Error(`Unknown adapter: ${name}`);
  const fn = await load();
  await fn();
}

async function main(): Promise<void> {
  const adapter = process.argv[2]?.toLowerCase();

  if (!adapter) {
    console.error('Usage: npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts <adapter>');
    console.error('Available adapters:', Object.keys(ADAPTER_LOADERS).join(', '), ', all, verify:all');
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
    for (const name of Object.keys(ADAPTER_LOADERS)) {
      if (name.startsWith('verify:') || name.startsWith('audit:')) continue;
      try {
        console.log(`\n>>> Running adapter: ${name}`);
        await runAdapter(name);
      } catch (err) {
        console.error(`>>> Adapter ${name} failed:`, err);
      }
    }
  } else if (adapter === 'verify:all') {
    for (const name of VERIFY_ALL_NAMES) {
      await runAdapter(name);
    }
  } else if (ADAPTER_LOADERS[adapter]) {
    try {
      await runAdapter(adapter);
    } catch (err) {
      console.error('\nIngestion failed:', err);
      process.exit(1);
    }
  } else {
    console.error(`Unknown adapter: ${adapter}`);
    console.error('Available:', Object.keys(ADAPTER_LOADERS).join(', '), ', all, verify:all');
    process.exit(1);
  }

  console.log('\n==============================================');
  console.log('  Ingestion complete.');
  console.log('==============================================\n');
}

main();
