-- =========================================================
-- Seed the "AGOA Trade Flows Upload" ingestion template.
--
-- Enables admins to upload real USITC DataWeb / agoa.info AGOA trade-flow data
-- through the batch pipeline (upload -> parse -> validate -> approve -> publish).
-- Publishes to souvera_agoa_trade_flows keyed on (iso3, year, category_group).
--
-- Idempotent via the WHERE NOT EXISTS guard on template_name.
-- =========================================================

INSERT INTO public.souvera_source_ingestion_templates (
  template_name,
  template_description,
  target_table,
  target_data_type,
  column_mappings,
  country_column,
  country_mapping_type,
  required_columns,
  default_confidence
)
SELECT
  'AGOA Trade Flows Upload',
  'Upload AGOA bilateral trade-flow data (USITC DataWeb / agoa.info). Publishes to souvera_agoa_trade_flows keyed on (iso3, year, category_group).',
  'souvera_agoa_trade_flows',
  'agoa_trade_flows',
  jsonb_build_array(
    jsonb_build_object('source', 'iso3', 'target', 'iso3', 'required', true, 'transform', 'uppercase'),
    jsonb_build_object('source', 'year', 'target', 'year', 'required', true),
    jsonb_build_object('source', 'category_group', 'target', 'category_group', 'required', true),
    jsonb_build_object('source', 'category_label', 'target', 'category_label', 'required', true),
    jsonb_build_object('source', 'hs_chapter', 'target', 'hs_chapter', 'required', true),
    jsonb_build_object('source', 'total_exports_to_us_usd', 'target', 'total_exports_to_us_usd'),
    jsonb_build_object('source', 'agoa_exports_usd', 'target', 'agoa_exports_usd'),
    jsonb_build_object('source', 'agoa_share_pct', 'target', 'agoa_share_pct'),
    jsonb_build_object('source', 'non_agoa_exports_usd', 'target', 'non_agoa_exports_usd'),
    jsonb_build_object('source', 'mfn_tariff_pct', 'target', 'mfn_tariff_pct'),
    jsonb_build_object('source', 'tariff_savings_usd', 'target', 'tariff_savings_usd'),
    jsonb_build_object('source', 'agoa_eligible', 'target', 'agoa_eligible', 'transform', 'boolean'),
    jsonb_build_object('source', 'agoa_status', 'target', 'agoa_status'),
    jsonb_build_object('source', 'eligibility_since', 'target', 'eligibility_since'),
    jsonb_build_object('source', 'country_name', 'target', 'country_name'),
    jsonb_build_object('source', 'region', 'target', 'region'),
    jsonb_build_object('source', 'sub_region', 'target', 'sub_region'),
    jsonb_build_object('source', 'source_notes', 'target', 'source_notes'),
    jsonb_build_object('source', 'data_quality_tier', 'target', 'data_quality_tier')
  ),
  'iso3',
  'iso3',
  ARRAY['iso3', 'year', 'category_group', 'category_label', 'hs_chapter'],
  'high'
WHERE NOT EXISTS (
  SELECT 1 FROM public.souvera_source_ingestion_templates
  WHERE template_name = 'AGOA Trade Flows Upload'
);
