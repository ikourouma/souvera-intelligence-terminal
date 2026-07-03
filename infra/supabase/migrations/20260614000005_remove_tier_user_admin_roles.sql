-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Remove Admin Roles from Tier Test Users
-- Owner: Afronovation, Inc.
-- Created: 2026-06-14
-- ===========================================
-- 
-- This migration removes the platform_admin and super_admin roles
-- that were erroneously assigned to tier test users during Phase 4B QA testing.
-- 
-- These users should only have their subscription tier (explorer, professional, 
-- business, institutional) without admin panel access.
--
-- Reference: docs/qa/phase-4b-browser-qa-results.md lines 381-385
-- ===========================================

-- Remove admin roles from tier test users
DELETE FROM souvera_organization_members 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'business@afronovation.com',
    'explorer@afronovation.com', 
    'professional@afronovation.com',
    'institutional@afronovation.com'
  )
) 
AND role IN ('platform_admin', 'super_admin', 'org_admin');

-- Log this cleanup action
DO $$
BEGIN
  RAISE NOTICE 'Removed admin roles from tier test users: business@, explorer@, professional@, institutional@ @afronovation.com';
END $$;
