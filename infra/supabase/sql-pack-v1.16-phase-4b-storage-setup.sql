-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL Pack v1.16 — Phase 4B Storage Setup
-- Owner: Afronovation, Inc.
-- Purpose: Create private storage bucket for Phase 4B source-file ingestion
-- Date: 2026-05-06
-- =========================================================
--
-- ISSUE RESOLVED:
-- P4B-V-008: Upload passed admin authorization but failed with 
-- "failed to upload file to storage" because Supabase Storage 
-- bucket 'source-files' did not exist.
--
-- This SQL pack creates the required storage bucket for the 
-- Phase 4B admin upload workflow at /admin/data/upload.
--
-- SECURITY:
-- - Bucket is PRIVATE (not publicly accessible)
-- - Service role authentication required for uploads
-- - Admin role required for API route access
-- - File size limit: 50MB
-- - MIME types restricted to expected document formats
--
-- =========================================================

-- Create source-files storage bucket for Phase 4B admin file uploads
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'source-files',
  'source-files',
  false,  -- Private bucket for admin-uploaded source files
  52428800,  -- 50MB file size limit
  ARRAY[
    'text/csv',
    'application/json',
    'application/pdf',
    'text/plain',
    'text/html',
    'application/xml',
    'text/xml',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Verification query
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

-- Expected result:
-- 1 row returned
-- id = 'source-files'
-- public = false
-- file_size_limit = 52428800
-- allowed_mime_types = {text/csv, application/json, application/pdf, ...}

-- =========================================================
-- NOTES
-- =========================================================
--
-- Storage Policies:
-- Service role client (used by upload route) has full access by default.
-- No additional storage policies are required for admin-only uploads.
--
-- Upload Route:
-- apps/api-gateway/src/app/api/v1/admin/upload/route.ts
-- - Uses service role client (bypasses RLS)
-- - Requires platform_admin or org_admin role
-- - Uploads to: uploads/YYYY-MM-DD/timestamp_filename.ext
--
-- Related Tables:
-- - souvera_source_file_assets (stores file metadata)
-- - souvera_source_file_ingestion_batches (tracks upload batches)
-- - souvera_source_file_ingestion_rows (parsed file data)
--
-- Related SQL Packs:
-- - sql-pack-v1.14-phase-4b-foundation.sql (initial schema)
-- - sql-pack-v1.15-phase-4b-ingestion-architecture.sql (ingestion tables)
--
-- =========================================================
-- END SQL PACK v1.16
-- =========================================================
