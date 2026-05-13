-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- PHASE 4B RLS (ROW LEVEL SECURITY) VALIDATION
-- Owner: Afronovation, Inc.
-- Date: 2026-05-06
--
-- Tests access control for ingestion architecture tables.
-- Run sections as different user roles to validate RLS.
-- =========================================================

-- =========================================================
-- 1. RLS POLICY LISTING
-- =========================================================

SELECT '=== RLS POLICIES ON INGESTION TABLES ===' AS section;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN (
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
ORDER BY tablename, policyname;

-- =========================================================
-- 2. ANONYMOUS USER ACCESS TESTS
-- =========================================================

-- To test as anonymous user, run:
-- SET ROLE anon;

SELECT '=== ANONYMOUS ACCESS TESTS ===' AS section;
SELECT '(Run as anon role to verify these queries fail or return empty)' AS note;

-- These should return 0 rows or fail for anonymous users:
-- SELECT COUNT(*) FROM souvera_source_file_assets;
-- SELECT COUNT(*) FROM souvera_source_file_ingestion_batches;
-- SELECT COUNT(*) FROM souvera_source_file_ingestion_rows;
-- SELECT COUNT(*) FROM souvera_source_column_mappings;
-- SELECT COUNT(*) FROM souvera_source_ingestion_templates;
-- SELECT COUNT(*) FROM souvera_policy_source_monitors;
-- SELECT COUNT(*) FROM souvera_policy_source_snapshots;
-- SELECT COUNT(*) FROM souvera_policy_change_events;
-- SELECT COUNT(*) FROM souvera_policy_review_queue;

-- =========================================================
-- 3. AUTHENTICATED NON-ADMIN USER ACCESS TESTS
-- =========================================================

-- To test as authenticated non-admin, run:
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub TO 'some-non-admin-user-id';

SELECT '=== AUTHENTICATED NON-ADMIN ACCESS TESTS ===' AS section;
SELECT '(Run as authenticated role with non-admin user_id to verify restricted access)' AS note;

-- These should return 0 rows for non-admin authenticated users:
-- Admin-only tables should not be readable
-- SELECT COUNT(*) FROM souvera_source_file_assets;
-- SELECT COUNT(*) FROM souvera_source_file_ingestion_batches;
-- SELECT COUNT(*) FROM souvera_source_file_ingestion_rows;
-- SELECT COUNT(*) FROM souvera_policy_source_monitors;
-- SELECT COUNT(*) FROM souvera_policy_change_events;
-- SELECT COUNT(*) FROM souvera_policy_review_queue;

-- =========================================================
-- 4. SERVICE ROLE (ADMIN) ACCESS TESTS
-- =========================================================

-- Service role bypasses RLS — used by admin APIs
-- Admin should have full CRUD access

SELECT '=== SERVICE ROLE ACCESS VERIFICATION ===' AS section;

-- Count records as service role (should work)
SELECT 'Service Role: souvera_source_file_assets' AS test, COUNT(*) AS count FROM souvera_source_file_assets;
SELECT 'Service Role: souvera_source_file_ingestion_batches' AS test, COUNT(*) AS count FROM souvera_source_file_ingestion_batches;
SELECT 'Service Role: souvera_source_file_ingestion_rows' AS test, COUNT(*) AS count FROM souvera_source_file_ingestion_rows;
SELECT 'Service Role: souvera_policy_source_monitors' AS test, COUNT(*) AS count FROM souvera_policy_source_monitors;
SELECT 'Service Role: souvera_policy_change_events' AS test, COUNT(*) AS count FROM souvera_policy_change_events;
SELECT 'Service Role: souvera_policy_review_queue' AS test, COUNT(*) AS count FROM souvera_policy_review_queue;

-- =========================================================
-- 5. PUBLIC/ENTITLED DATA ACCESS VALIDATION
-- =========================================================

SELECT '=== PUBLIC INTELLIGENCE DATA ACCESS ===' AS section;

-- Published trade policy statuses should be readable by entitled users
-- Unpublished data should NOT be visible

SELECT 
  'Trade Policy Statuses' AS table_name,
  COUNT(*) AS total_records,
  COUNT(*) FILTER (WHERE agoa_publication_status = 'published') AS published_agoa,
  COUNT(*) FILTER (WHERE afcfta_publication_status = 'published') AS published_afcfta
FROM souvera_trade_policy_statuses;

-- =========================================================
-- 6. WRITE PROTECTION TESTS
-- =========================================================

SELECT '=== WRITE PROTECTION TESTS ===' AS section;
SELECT '(Run as authenticated/anon role to verify INSERT/UPDATE/DELETE fail)' AS note;

-- These should fail for non-admin users:
-- INSERT INTO souvera_source_file_assets (source_id, file_name, file_type, storage_path) 
--   VALUES (gen_random_uuid(), 'test.csv', 'csv', '/test/path');

-- INSERT INTO souvera_source_file_ingestion_batches (source_id, source_name, as_of_date, created_by)
--   VALUES (gen_random_uuid(), 'Test', CURRENT_DATE, gen_random_uuid());

-- INSERT INTO souvera_policy_change_events (monitor_id, event_type, event_title, status)
--   VALUES (gen_random_uuid(), 'new_document', 'Test Event', 'detected');

-- =========================================================
-- 7. DIRECT PUBLICATION PROTECTION
-- =========================================================

SELECT '=== DIRECT PUBLICATION PROTECTION ===' AS section;

-- Verify that ingestion rows cannot directly write to trade_policy_statuses
-- without going through the approval workflow

SELECT 
  'souvera_trade_policy_statuses' AS protected_table,
  CASE 
    WHEN relrowsecurity THEN '✓ RLS ENABLED'
    ELSE '✗ RLS DISABLED'
  END AS rls_status
FROM pg_class
WHERE relname = 'souvera_trade_policy_statuses';

-- Check for triggers or constraints that enforce approval workflow
SELECT 
  tgname AS trigger_name,
  tgtype,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'souvera_trade_policy_statuses'
  AND NOT tgisinternal;

-- =========================================================
-- 8. RLS VALIDATION SUMMARY
-- =========================================================

SELECT '=== RLS VALIDATION SUMMARY ===' AS section;

WITH rls_checks AS (
  SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = c.relname) AS policy_count
  FROM pg_class c
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
)
SELECT 
  table_name,
  CASE WHEN rls_enabled THEN '✓' ELSE '✗' END AS rls,
  policy_count AS policies,
  CASE 
    WHEN rls_enabled THEN 'Protected'
    ELSE 'UNPROTECTED - Add RLS!'
  END AS status
FROM rls_checks
ORDER BY table_name;

-- Total check
SELECT 
  'RLS Enabled on All 9 Tables' AS check,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_class 
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
          ) AND relrowsecurity = TRUE) = 9 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result;

-- =========================================================
-- END OF RLS VALIDATION
-- =========================================================
