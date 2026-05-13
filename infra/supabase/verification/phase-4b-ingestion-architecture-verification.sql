-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- PHASE 4B INGESTION ARCHITECTURE VERIFICATION
-- Owner: Afronovation, Inc.
-- Date: 2026-05-06
--
-- Execute AFTER running:
--   1. sql-pack-v1.14-phase-4b-foundation.sql
--   2. sql-pack-v1.15-phase-4b-ingestion-architecture.sql
-- =========================================================

-- =========================================================
-- 1. VERIFY SQL PACK v1.14 TABLES (Foundation)
-- =========================================================

SELECT '=== SQL PACK v1.14 — FOUNDATION TABLES ===' AS section;

SELECT 
  tablename,
  CASE 
    WHEN tablename IS NOT NULL THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END AS status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'souvera_data_sources',
    'souvera_source_credentials',
    'souvera_source_update_policies',
    'souvera_indicator_source_links',
    'souvera_data_ingestion_runs',
    'souvera_data_quality_findings',
    'souvera_country_code_crosswalks',
    'souvera_manual_upload_batches',
    'souvera_manual_upload_rows',
    'souvera_trade_policy_statuses',
    'souvera_sector_supply_demand'
  )
ORDER BY tablename;

-- =========================================================
-- 2. VERIFY SQL PACK v1.15 TABLES (Ingestion Architecture)
-- =========================================================

SELECT '=== SQL PACK v1.15 — INGESTION ARCHITECTURE TABLES ===' AS section;

SELECT 
  tablename,
  CASE 
    WHEN tablename IS NOT NULL THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END AS status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'souvera_source_file_assets',
    'souvera_source_file_ingestion_batches',
    'souvera_source_file_ingestion_rows',
    'souvera_source_column_mappings',
    'souvera_source_ingestion_templates',
    'souvera_policy_source_monitors',
    'souvera_policy_source_snapshots',
    'souvera_policy_change_events',
    'souvera_policy_review_queue'
  )
ORDER BY tablename;

-- Count of 9 required tables
SELECT 
  '9 Ingestion Architecture Tables' AS requirement,
  COUNT(*) AS found,
  CASE 
    WHEN COUNT(*) = 9 THEN '✓ PASS'
    ELSE '✗ FAIL — Expected 9, found ' || COUNT(*)
  END AS status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'souvera_source_file_assets',
    'souvera_source_file_ingestion_batches',
    'souvera_source_file_ingestion_rows',
    'souvera_source_column_mappings',
    'souvera_source_ingestion_templates',
    'souvera_policy_source_monitors',
    'souvera_policy_source_snapshots',
    'souvera_policy_change_events',
    'souvera_policy_review_queue'
  );

-- =========================================================
-- 3. VERIFY ENUMS
-- =========================================================

SELECT '=== PHASE 4B ENUMS ===' AS section;

SELECT 
  typname AS enum_name,
  '✓ EXISTS' AS status
FROM pg_type 
WHERE typname IN (
  'souvera_ingestion_method',
  'souvera_file_type',
  'souvera_batch_status',
  'souvera_row_status',
  'souvera_policy_status',
  'souvera_monitor_type',
  'souvera_change_event_type',
  'souvera_review_action',
  'souvera_confidence_level',
  'souvera_freshness_status',
  'souvera_source_type',
  'souvera_agoa_status',
  'souvera_afcfta_status',
  'souvera_finding_severity'
)
ORDER BY typname;

-- Verify enum values
SELECT '=== INGESTION METHOD ENUM VALUES ===' AS section;
SELECT unnest(enum_range(NULL::souvera_ingestion_method)) AS value;

SELECT '=== BATCH STATUS ENUM VALUES ===' AS section;
SELECT unnest(enum_range(NULL::souvera_batch_status)) AS value;

SELECT '=== POLICY STATUS ENUM VALUES ===' AS section;
SELECT unnest(enum_range(NULL::souvera_policy_status)) AS value;

-- =========================================================
-- 4. VERIFY FOREIGN KEYS
-- =========================================================

SELECT '=== FOREIGN KEY CONSTRAINTS ===' AS section;

SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  '✓ VALID' AS status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN (
    'souvera_source_file_assets',
    'souvera_source_file_ingestion_batches',
    'souvera_source_file_ingestion_rows',
    'souvera_source_column_mappings',
    'souvera_source_ingestion_templates',
    'souvera_policy_source_monitors',
    'souvera_policy_source_snapshots',
    'souvera_policy_change_events',
    'souvera_policy_review_queue'
  )
ORDER BY tc.table_name, kcu.column_name;

-- =========================================================
-- 5. VERIFY INDEXES
-- =========================================================

SELECT '=== INDEXES ON INGESTION TABLES ===' AS section;

SELECT 
  indexname,
  tablename,
  '✓ EXISTS' AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'souvera_source_file_assets',
    'souvera_source_file_ingestion_batches',
    'souvera_source_file_ingestion_rows',
    'souvera_source_column_mappings',
    'souvera_source_ingestion_templates',
    'souvera_policy_source_monitors',
    'souvera_policy_source_snapshots',
    'souvera_policy_change_events',
    'souvera_policy_review_queue'
  )
ORDER BY tablename, indexname;

-- =========================================================
-- 6. VERIFY RLS IS ENABLED
-- =========================================================

SELECT '=== ROW LEVEL SECURITY STATUS ===' AS section;

SELECT 
  relname AS table_name,
  CASE 
    WHEN relrowsecurity THEN '✓ RLS ENABLED'
    ELSE '✗ RLS DISABLED'
  END AS rls_status
FROM pg_class
WHERE relname IN (
  'souvera_source_file_assets',
  'souvera_source_file_ingestion_batches',
  'souvera_source_file_ingestion_rows',
  'souvera_source_column_mappings',
  'souvera_source_ingestion_templates',
  'souvera_policy_source_monitors',
  'souvera_policy_source_snapshots',
  'souvera_policy_change_events',
  'souvera_policy_review_queue'
)
ORDER BY relname;

-- =========================================================
-- 7. VERIFY POLICY MONITORS SEEDED
-- =========================================================

SELECT '=== SEEDED POLICY MONITORS ===' AS section;

SELECT 
  monitor_name,
  monitor_type::TEXT,
  monitor_url,
  is_active,
  CASE 
    WHEN is_active THEN '✓ ACTIVE'
    ELSE '○ INACTIVE'
  END AS status
FROM public.souvera_policy_source_monitors
ORDER BY monitor_name;

-- Count required monitors
SELECT 
  '5 Required Monitors' AS requirement,
  COUNT(*) AS found,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✓ PASS'
    ELSE '✗ FAIL — Expected at least 5'
  END AS status
FROM public.souvera_policy_source_monitors
WHERE monitor_name IN (
  'Federal Register AGOA Monitor',
  'Regulations.gov AGOA Docket Monitor',
  'USTR AGOA Eligibility Page Monitor',
  'AfCFTA Secretariat Monitor',
  'tralac AfCFTA Status Tracker'
);

-- =========================================================
-- 8. VERIFY INGESTION TEMPLATES SEEDED
-- =========================================================

SELECT '=== SEEDED INGESTION TEMPLATES ===' AS section;

SELECT 
  template_name,
  target_data_type,
  target_table,
  is_active,
  CASE 
    WHEN is_active THEN '✓ ACTIVE'
    ELSE '○ INACTIVE'
  END AS status
FROM public.souvera_source_ingestion_templates
ORDER BY template_name;

-- =========================================================
-- 9. VERIFY HELPER FUNCTIONS EXIST
-- =========================================================

SELECT '=== HELPER FUNCTIONS ===' AS section;

SELECT 
  proname AS function_name,
  '✓ EXISTS' AS status
FROM pg_proc
WHERE proname IN (
  'souvera_create_review_from_event',
  'souvera_validate_batch_rows',
  'souvera_get_freshness_status',
  'souvera_validate_market_scope'
)
ORDER BY proname;

-- =========================================================
-- 10. VERIFY ESH REJECTION IN CROSSWALK
-- =========================================================

SELECT '=== ESH (WESTERN SAHARA) REJECTION TEST ===' AS section;

-- Check if ESH exists in crosswalk with non-public scope
SELECT 
  'ESH Crosswalk Entry' AS test,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ PASS — ESH not in crosswalk (excluded entirely)'
    WHEN COUNT(*) > 0 AND (NOT bool_or(is_souvera_market) OR bool_or(is_excluded)) 
      THEN '✓ PASS — ESH marked as non-public/excluded'
    ELSE '✗ FAIL — ESH in public Souvera market scope'
  END AS status
FROM public.souvera_country_code_crosswalks
WHERE iso3 = 'ESH';

-- =========================================================
-- 11. VERIFY 74-MARKET SCOPE
-- =========================================================

SELECT '=== 74-MARKET SCOPE VALIDATION ===' AS section;

-- Count distinct ISO3 codes in countries table
SELECT 
  '74 Markets in Scope' AS requirement,
  COUNT(DISTINCT iso3) AS found,
  CASE 
    WHEN COUNT(DISTINCT iso3) = 74 THEN '✓ PASS'
    ELSE '○ INFO — ' || COUNT(DISTINCT iso3) || ' countries found'
  END AS status
FROM public.souvera_countries
WHERE is_active = TRUE;

-- =========================================================
-- 12. TABLE ROW COUNTS
-- =========================================================

SELECT '=== TABLE ROW COUNTS ===' AS section;

SELECT 'souvera_data_sources' AS table_name, COUNT(*) AS row_count FROM public.souvera_data_sources
UNION ALL
SELECT 'souvera_source_file_assets', COUNT(*) FROM public.souvera_source_file_assets
UNION ALL
SELECT 'souvera_source_file_ingestion_batches', COUNT(*) FROM public.souvera_source_file_ingestion_batches
UNION ALL
SELECT 'souvera_source_file_ingestion_rows', COUNT(*) FROM public.souvera_source_file_ingestion_rows
UNION ALL
SELECT 'souvera_policy_source_monitors', COUNT(*) FROM public.souvera_policy_source_monitors
UNION ALL
SELECT 'souvera_policy_change_events', COUNT(*) FROM public.souvera_policy_change_events
UNION ALL
SELECT 'souvera_policy_review_queue', COUNT(*) FROM public.souvera_policy_review_queue
UNION ALL
SELECT 'souvera_source_ingestion_templates', COUNT(*) FROM public.souvera_source_ingestion_templates
ORDER BY table_name;

-- =========================================================
-- 13. SUMMARY
-- =========================================================

SELECT '=== PHASE 4B VALIDATION SUMMARY ===' AS section;

WITH checks AS (
  -- Check 9 tables exist
  SELECT 'Ingestion Tables (9)' AS check_name,
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' 
            AND tablename IN (
              'souvera_source_file_assets',
              'souvera_source_file_ingestion_batches',
              'souvera_source_file_ingestion_rows',
              'souvera_source_column_mappings',
              'souvera_source_ingestion_templates',
              'souvera_policy_source_monitors',
              'souvera_policy_source_snapshots',
              'souvera_policy_change_events',
              'souvera_policy_review_queue'
            )) = 9 THEN 'PASS'
      ELSE 'FAIL'
    END AS result
  UNION ALL
  -- Check RLS enabled on all 9 tables
  SELECT 'RLS Enabled (9 tables)' AS check_name,
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_class WHERE relname IN (
              'souvera_source_file_assets',
              'souvera_source_file_ingestion_batches',
              'souvera_source_file_ingestion_rows',
              'souvera_source_column_mappings',
              'souvera_source_ingestion_templates',
              'souvera_policy_source_monitors',
              'souvera_policy_source_snapshots',
              'souvera_policy_change_events',
              'souvera_policy_review_queue'
            ) AND relrowsecurity = TRUE) = 9 THEN 'PASS'
      ELSE 'FAIL'
    END AS result
  UNION ALL
  -- Check monitors seeded
  SELECT 'Policy Monitors Seeded (≥5)' AS check_name,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.souvera_policy_source_monitors) >= 5 THEN 'PASS'
      ELSE 'FAIL'
    END AS result
  UNION ALL
  -- Check templates seeded
  SELECT 'Ingestion Templates Seeded (≥2)' AS check_name,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.souvera_source_ingestion_templates) >= 2 THEN 'PASS'
      ELSE 'FAIL'
    END AS result
)
SELECT 
  check_name,
  result,
  CASE 
    WHEN result = 'PASS' THEN '✓'
    ELSE '✗'
  END AS indicator
FROM checks;

-- =========================================================
-- END OF VERIFICATION
-- =========================================================
