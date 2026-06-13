/**
 * Upsert souvera_entities from code registry (offline / CI).
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { SOUVERA_ENTITIES } from '../../apps/api-gateway/src/lib/entity-registry';

const PARENT_REFERENCES = [
  { entityKey: 'USA', name: 'United States', iso2: 'US', iso3: 'USA' },
  { entityKey: 'GBR', name: 'United Kingdom', iso2: 'GB', iso3: 'GBR' },
];

export async function seedSouveraEntities(): Promise<void> {
  const supabase = getSupabaseServiceClient();

  for (const p of PARENT_REFERENCES) {
    await supabase.from('souvera_entities').upsert(
      {
        entity_key: p.entityKey,
        name: p.name,
        iso2: p.iso2,
        iso3: p.iso3,
        region: 'caribbean',
        entity_type: 'sovereign',
        coverage_status: 'excluded',
        notes: 'Sovereign parent reference only',
      },
      { onConflict: 'entity_key' }
    );
  }

  for (const e of SOUVERA_ENTITIES) {
    const { error } = await supabase.from('souvera_entities').upsert(
      {
        entity_key: e.entityKey,
        name: e.name,
        iso2: e.iso2,
        iso3: e.iso3,
        region: e.region,
        entity_type: e.entityType,
        sovereign_parent_entity_key: e.sovereignParentEntityKey,
        coverage_status: e.coverageStatus,
        notes: e.notes,
      },
      { onConflict: 'entity_key' }
    );
    if (error) {
      throw new Error(`Entity upsert ${e.entityKey}: ${error.message}`);
    }
  }

  console.log(`[seed:entities] Upserted ${SOUVERA_ENTITIES.length} active entities`);
}
