-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL Pack v1.17 — Phase 4B-V1 MIME Type Fix
-- Owner: Afronovation, Inc.
-- Purpose: Expand allowed_mime_types for source-files bucket to support common CSV MIME variants
-- Date: 2026-05-07
-- Root Cause: CSV upload rejected due to application/vnd.ms-excel MIME type not in allowlist
-- =========================================================

-- Step 1: Verify current bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
WHERE id = 'source-files';

-- Expected: 1 row returned with current MIME types (may be NULL or limited array)

-- Step 2: Update bucket to allow common file MIME types for admin uploads
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  -- CSV MIME types (including Windows/Excel variants)
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/csv',
  -- JSON MIME types
  'application/json',
  -- PDF MIME types
  'application/pdf',
  -- HTML/XML MIME types
  'text/html',
  'application/xml',
  'text/xml',
  -- XLSX MIME types
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  -- Generic fallback for unrecognized admin uploads
  'application/octet-stream'
]
WHERE id = 'source-files';

-- Step 3: Verify update applied successfully
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
WHERE id = 'source-files';

-- Expected: 1 row returned with expanded MIME types array

-- =========================================================
-- JUSTIFICATION
-- =========================================================
-- 
-- CSV files can be sent with multiple MIME types depending on:
-- - Operating system (Windows vs. macOS vs. Linux)
-- - Browser (Chrome vs. Firefox vs. Edge)
-- - CSV creation tool (Excel vs. text editor vs. data export)
--
-- Common CSV MIME types:
-- - text/csv (standard)
-- - text/plain (plain text fallback)
-- - application/vnd.ms-excel (Windows/Excel CSV exports)
-- - application/csv (alternative standard)
-- - application/octet-stream (generic binary, used by some browsers)
--
-- Security Considerations:
-- - Bucket remains PRIVATE (public = false)
-- - Service role upload only (admin API enforces this)
-- - Admin authorization required (verifyAdminAccess checks platform_admin role)
-- - File size limit enforced (50MB)
-- - No public access to uploaded files
--
-- Therefore, expanding allowed MIME types is SAFE for this admin-only private bucket.
--
-- =========================================================

-- Step 4: Verification — Confirm MIME type is now allowed
SELECT 
  CASE 
    WHEN 'application/vnd.ms-excel' = ANY(allowed_mime_types) THEN '✅ PASS: application/vnd.ms-excel is now allowed'
    ELSE '❌ FAIL: application/vnd.ms-excel is still not allowed'
  END as mime_check
FROM storage.buckets
WHERE id = 'source-files';

-- Expected: ✅ PASS: application/vnd.ms-excel is now allowed
