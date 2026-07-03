/**
 * =====================================================
 * DEPRECATED - DO NOT USE
 * =====================================================
 * 
 * This script has been deprecated because it relied on static data files
 * (nigeria-trade.ts, jamaica-trade.ts, caribbean-wave2-trade.ts) that were
 * removed as part of the Souvera Data Contract (SDC) initiative.
 * 
 * The SDC prohibits hard-coded data in the codebase - all trade data should
 * be stored in the database and populated via ingestion scripts.
 * 
 * REPLACEMENT:
 * - Use ingest-afcfta-flows.ts for African trade data
 * - Use ingest-cbtpa-flows.ts for Caribbean trade data
 * - Use ingest-import-demand-expanded.ts for demand signals
 * - Use worldbank-rollout-fill.ts for macro indicator gaps
 * 
 * This file is kept for historical reference only.
 * 
 * @deprecated Since 2026-06-15 - Removed static data file dependencies
 */

import { closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';

export async function ingestCuratedTradeMacroFill(): Promise<void> {
  console.log('\n[curated-trade-macro-fill] ⚠️  DEPRECATED SCRIPT - DO NOT USE');
  console.log('[curated-trade-macro-fill] This script relied on deleted static data files.');
  console.log('[curated-trade-macro-fill] Use the following alternatives:');
  console.log('  - ingest-afcfta-flows.ts for African trade data');
  console.log('  - ingest-cbtpa-flows.ts for Caribbean trade data');
  console.log('  - ingest-import-demand-expanded.ts for demand signals');
  console.log('  - worldbank-rollout-fill.ts for macro indicator gaps\n');
  
  throw new Error('DEPRECATED: curated-trade-macro-fill has been deprecated. See script header for alternatives.');
}

export default ingestCuratedTradeMacroFill;
