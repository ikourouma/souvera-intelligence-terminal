-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL Pack v1.18 — Phase 4B Ad-hoc Admin Upload Source
-- Owner: Afronovation, Inc.
-- Purpose:
--   Create a controlled default source for admin-uploaded files
--   when no specific source is selected at upload time.
--
-- Governance:
--   This source is a staging/default attribution mechanism.
--   Files assigned to this source should be reviewed and, where appropriate,
--   reassigned to authoritative sources before publication.
--
-- Date: 2026-05-07
-- =========================================================

-- Insert controlled ad-hoc staging source
INSERT INTO public.souvera_data_sources (
  key,
  name,
  domain,
  source_type,
  ingestion_method,
  confidence_level,
  attribution_template,
  source_status,
  is_active,
  redistribution_notes
)
VALUES (
  'adhoc_admin_upload',
  'Ad-hoc Admin Upload',
  'admin',
  'manual',
  'manual_upload',
  'medium',
  'Source: Admin Upload',
  'approved',
  true,
  'Controlled staging source for direct admin file uploads without a selected source. Records may be reassigned to authoritative sources during review before publication. This maintains data integrity while allowing quick admin uploads.'
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  source_type = EXCLUDED.source_type,
  ingestion_method = EXCLUDED.ingestion_method,
  confidence_level = EXCLUDED.confidence_level,
  attribution_template = EXCLUDED.attribution_template,
  source_status = EXCLUDED.source_status,
  is_active = EXCLUDED.is_active,
  redistribution_notes = EXCLUDED.redistribution_notes,
  updated_at = NOW();

-- Verify creation
SELECT 
  id,
  key,
  name,
  domain,
  source_type,
  ingestion_method,
  confidence_level,
  is_active,
  created_at
FROM public.souvera_data_sources
WHERE key = 'adhoc_admin_upload';

-- =========================================================
-- Validation Check: Confirm enum values are valid
-- =========================================================
-- Expected result: 1 row with:
--   key = 'adhoc_admin_upload'
--   domain = 'admin'
--   source_type = 'manual'
--   ingestion_method = 'manual_upload'
--   is_active = true
-- =========================================================

-- =========================================================
-- END SQL PACK v1.18
-- =========================================================
