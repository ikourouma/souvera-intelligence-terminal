// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Ingestion publish targets
//
// Maps a validated ingestion batch to its destination table and performs the
// actual upsert when a batch is published. This is the "commit" step that the
// batch lifecycle (upload → parse → validate → approve → publish) writes through.
//
// Registry-driven so new datasets can be added without touching the batch route.
// First target: souvera_agoa_trade_flows (manual USITC DataWeb / agoa.info upload).
// ===========================================

import type { SupabaseClient } from '@supabase/supabase-js';

interface TemplateColumnMapping {
  source: string;
  target: string;
  required?: boolean;
  transform?: 'uppercase' | 'lowercase' | 'number' | 'boolean';
}

interface PublishTargetConfig {
  /** Destination table. */
  table: string;
  /** Unique conflict key for upsert (comma-separated column list). */
  conflictKey: string;
  /** Columns coerced to numbers. */
  numericFields: string[];
  /** Columns coerced to integers. */
  integerFields: string[];
  /** Columns coerced to booleans. */
  booleanFields: string[];
  /** Static defaults applied when a mapped value is missing. */
  defaults: Record<string, unknown>;
  /** Final row shaping after mapping + coercion + defaults. */
  finalize?: (row: Record<string, unknown>) => Record<string, unknown>;
}

/** Registry keyed by target_table. */
export const PUBLISH_TARGETS: Record<string, PublishTargetConfig> = {
  souvera_agoa_trade_flows: {
    table: 'souvera_agoa_trade_flows',
    conflictKey: 'iso3,year,category_group',
    numericFields: [
      'total_exports_to_us_usd',
      'agoa_exports_usd',
      'agoa_share_pct',
      'non_agoa_exports_usd',
      'mfn_tariff_pct',
      'tariff_savings_usd',
      'yoy_growth_pct',
      'cagr_5yr_pct',
      'us_total_imports_usd',
      'country_share_of_us_imports_pct',
    ],
    integerFields: ['year', 'eligibility_since'],
    booleanFields: ['agoa_eligible', 'is_textile_apparel', 'third_country_fabric_eligible'],
    defaults: {
      data_quality_tier: 'A',
      top_products: [],
      competitor_suppliers: [],
      is_textile_apparel: false,
      third_country_fabric_eligible: false,
    },
    finalize: (row) => {
      const out = { ...row };
      // hs_chapter is NOT NULL — derive a placeholder only if the upload omitted it.
      if (out.hs_chapter == null || out.hs_chapter === '') out.hs_chapter = '99';
      // category_label is NOT NULL — fall back to the category_group slug.
      if ((out.category_label == null || out.category_label === '') && out.category_group) {
        out.category_label = String(out.category_group);
      }
      // Derive non-AGOA residual when only the totals were provided.
      const total = Number(out.total_exports_to_us_usd ?? 0);
      const agoa = Number(out.agoa_exports_usd ?? 0);
      if (out.non_agoa_exports_usd == null && total > 0) {
        out.non_agoa_exports_usd = Math.max(total - agoa, 0);
      }
      if (out.iso3) out.iso3 = String(out.iso3).toUpperCase().trim();
      return out;
    },
  },
};

export function isPublishableTarget(targetTable?: string | null): boolean {
  return !!targetTable && targetTable in PUBLISH_TARGETS;
}

function coerce(
  row: Record<string, unknown>,
  cfg: PublishTargetConfig
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row };
  for (const f of cfg.numericFields) {
    if (out[f] != null && out[f] !== '') {
      const n = Number(out[f]);
      out[f] = Number.isFinite(n) ? n : null;
    }
  }
  for (const f of cfg.integerFields) {
    if (out[f] != null && out[f] !== '') {
      const n = parseInt(String(out[f]), 10);
      out[f] = Number.isFinite(n) ? n : null;
    }
  }
  for (const f of cfg.booleanFields) {
    if (out[f] != null && out[f] !== '') {
      out[f] = ['true', '1', 'yes', 'y'].includes(String(out[f]).toLowerCase());
    }
  }
  return out;
}

/** Apply a template's column mappings to a raw row. */
export function mapRowWithTemplate(
  raw: Record<string, unknown>,
  mappings: TemplateColumnMapping[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const m of mappings) {
    let value = raw[m.source];
    if (value != null) {
      switch (m.transform) {
        case 'uppercase':
          value = String(value).toUpperCase();
          break;
        case 'lowercase':
          value = String(value).toLowerCase();
          break;
        case 'number':
          value = Number(value);
          break;
        case 'boolean':
          value = ['true', '1', 'yes', 'y'].includes(String(value).toLowerCase());
          break;
      }
    }
    out[m.target] = value;
  }
  return out;
}

export interface PublishResult {
  published: number;
  skipped: number;
  errors: string[];
}

/**
 * Commit a validated/approved batch to its target table.
 * Only rows with status valid | warning | approved (and not excluded) are written.
 */
export async function publishBatchToTarget(
  supabase: SupabaseClient,
  batch: { id: string },
  template: { target_table: string; column_mappings?: TemplateColumnMapping[] } | null
): Promise<PublishResult> {
  const targetTable = template?.target_table;
  const cfg = targetTable ? PUBLISH_TARGETS[targetTable] : undefined;
  if (!cfg) {
    return {
      published: 0,
      skipped: 0,
      errors: [
        targetTable
          ? `No publish handler registered for target table "${targetTable}".`
          : 'Batch has no template/target table; nothing to publish.',
      ],
    };
  }

  const { data: rows, error: rowsError } = await supabase
    .from('souvera_source_file_ingestion_rows')
    .select('id, raw_data, mapped_data, status, is_excluded')
    .eq('batch_id', batch.id)
    .in('status', ['valid', 'warning', 'approved'])
    .eq('is_excluded', false);

  if (rowsError) return { published: 0, skipped: 0, errors: [rowsError.message] };
  if (!rows || rows.length === 0) {
    return { published: 0, skipped: 0, errors: ['No valid rows to publish.'] };
  }

  const mappings = template?.column_mappings ?? [];
  const records: Record<string, unknown>[] = [];
  for (const row of rows) {
    const mapped =
      (row.mapped_data as Record<string, unknown>) ??
      (mappings.length
        ? mapRowWithTemplate(row.raw_data as Record<string, unknown>, mappings)
        : (row.raw_data as Record<string, unknown>));
    let record = coerce({ ...cfg.defaults, ...mapped }, cfg);
    if (cfg.finalize) record = cfg.finalize(record);
    records.push(record);
  }

  const { error: upsertError } = await supabase
    .from(cfg.table)
    .upsert(records, { onConflict: cfg.conflictKey });

  if (upsertError) return { published: 0, skipped: 0, errors: [upsertError.message] };

  await supabase
    .from('souvera_source_file_ingestion_rows')
    .update({ status: 'published', target_table: cfg.table })
    .eq('batch_id', batch.id)
    .in('status', ['valid', 'warning', 'approved']);

  return { published: records.length, skipped: rows.length - records.length, errors: [] };
}
