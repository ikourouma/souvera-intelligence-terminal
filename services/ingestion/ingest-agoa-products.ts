/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * AGOA Products Static Data Migration
 * Owner: Afronovation, Inc.
 * Phase 0E.4: Static Data → Database
 * =====================================================
 *
 * Migrates AGOA priority products from TypeScript static file
 * to souvera_agoa_products table for admin editing.
 *
 * Run:
 *   npx tsx --tsconfig services/ingestion/tsconfig.json \
 *     services/ingestion/run.ts ingest-agoa-products
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { closeIngestionJob, createIngestionJob } from './shared';

// Import static products from the source file
// Note: This uses dynamic import to avoid module resolution issues
async function getProducts() {
  const mod = await import('../../apps/api-gateway/src/lib/trade/agoa-priority-products');
  return mod.AGOA_PRIORITY_PRODUCTS;
}

export async function ingestAgoaProducts(): Promise<void> {
  console.log('\n[ingest-agoa-products] Migrating AGOA products to database...\n');
  
  const supabase = getSupabaseServiceClient();
  const { jobId, sourceId } = await createIngestionJob('ustr', 'agoa_products_migration');
  const start = Date.now();
  let upserted = 0;
  let failed = 0;
  
  let products: Awaited<ReturnType<typeof getProducts>>;
  try {
    products = await getProducts();
    console.log(`  → ${products.length} products to migrate\n`);
  } catch (err) {
    console.error('Failed to import products:', err);
    throw err;
  }
  
  for (const p of products) {
    const { error } = await supabase.from('souvera_agoa_products').upsert({
      code: p.code,
      classification: p.classification,
      chapter: p.chapter,
      description: p.description,
      sector_key: p.sectorKey,
      strategic_type: p.strategicType,
      is_apparel_provision: p.isApparelProvision,
      is_agoa_specific: p.isAgoaSpecific,
      is_cbtpa_specific: p.isCbtpaSpecific,
      us_export_states: p.usExportStates,
      rules_of_origin_summary: p.rulesOfOriginSummary,
      is_active: true,
      source_id: sourceId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'code,classification' });
    
    if (error) {
      console.error(`  ✗  ${p.code}: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓  ${p.code} — ${p.description.substring(0, 50)}...`);
      upserted++;
    }
  }
  
  const elapsed = Date.now() - start;
  console.log(`\n  Summary: ${upserted} upserted, ${failed} failed — ${elapsed}ms\n`);
  
  const status = failed === 0 ? 'succeeded' : upserted > 0 ? 'partial' : 'failed';
  await closeIngestionJob(jobId, status, upserted, failed, failed > 0 ? `${failed} failed` : undefined);
  
  console.log('[ingest-agoa-products] Done.\n');
}

export default ingestAgoaProducts;
