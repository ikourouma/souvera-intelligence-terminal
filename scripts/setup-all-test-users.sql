-- =====================================================
-- SOUVERA TEST USERS SETUP
-- =====================================================
-- This script ensures all test users have proper profiles and subscriptions
-- Run in Supabase SQL Editor

-- =====================================================
-- STEP 1: Verify all test users exist in auth.users
-- =====================================================
SELECT 
  email,
  id,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email IN (
  'explorer@afronovation.com',
  'professional@afronovation.com',
  'business@afronovation.com',
  'institutional@afronovation.com'
)
ORDER BY email;

-- =====================================================
-- STEP 2: Create/Update Profiles for All Test Users
-- =====================================================

-- Helper function to get user ID by email
DO $$
DECLARE
  explorer_id UUID;
  professional_id UUID;
  business_id UUID;
  institutional_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO explorer_id FROM auth.users WHERE email = 'explorer@afronovation.com';
  SELECT id INTO professional_id FROM auth.users WHERE email = 'professional@afronovation.com';
  SELECT id INTO business_id FROM auth.users WHERE email = 'business@afronovation.com';
  SELECT id INTO institutional_id FROM auth.users WHERE email = 'institutional@afronovation.com';

  -- Explorer Profile
  IF explorer_id IS NOT NULL THEN
    INSERT INTO souvera_profiles (id, email, full_name, title, organization_name)
    VALUES (
      explorer_id,
      'explorer@afronovation.com',
      'Explorer Test User',
      'Market Researcher',
      'Afronovation'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      title = EXCLUDED.title,
      organization_name = EXCLUDED.organization_name,
      updated_at = NOW();
    
    RAISE NOTICE 'Explorer profile created/updated: %', explorer_id;
  ELSE
    RAISE WARNING 'Explorer user not found in auth.users';
  END IF;

  -- Professional Profile
  IF professional_id IS NOT NULL THEN
    INSERT INTO souvera_profiles (id, email, full_name, title, organization_name)
    VALUES (
      professional_id,
      'professional@afronovation.com',
      'Professional Test User',
      'Trade Consultant',
      'Afronovation'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      title = EXCLUDED.title,
      organization_name = EXCLUDED.organization_name,
      updated_at = NOW();
    
    RAISE NOTICE 'Professional profile created/updated: %', professional_id;
  ELSE
    RAISE WARNING 'Professional user not found in auth.users';
  END IF;

  -- Business Profile
  IF business_id IS NOT NULL THEN
    INSERT INTO souvera_profiles (id, email, full_name, title, organization_name)
    VALUES (
      business_id,
      'business@afronovation.com',
      'Business Test User',
      'Export Manager',
      'Afronovation'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      title = EXCLUDED.title,
      organization_name = EXCLUDED.organization_name,
      updated_at = NOW();
    
    RAISE NOTICE 'Business profile created/updated: %', business_id;
  ELSE
    RAISE WARNING 'Business user not found in auth.users';
  END IF;

  -- Institutional Profile
  IF institutional_id IS NOT NULL THEN
    INSERT INTO souvera_profiles (id, email, full_name, title, organization_name)
    VALUES (
      institutional_id,
      'institutional@afronovation.com',
      'Institutional Test User',
      'Research Director',
      'Afronovation'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      title = EXCLUDED.title,
      organization_name = EXCLUDED.organization_name,
      updated_at = NOW();
    
    RAISE NOTICE 'Institutional profile created/updated: %', institutional_id;
  ELSE
    RAISE WARNING 'Institutional user not found in auth.users';
  END IF;
END $$;

-- =====================================================
-- STEP 3: Create/Update Subscriptions for All Test Users
-- =====================================================

DO $$
DECLARE
  explorer_id UUID;
  professional_id UUID;
  business_id UUID;
  institutional_id UUID;
BEGIN
  -- Get user IDs again
  SELECT id INTO explorer_id FROM auth.users WHERE email = 'explorer@afronovation.com';
  SELECT id INTO professional_id FROM auth.users WHERE email = 'professional@afronovation.com';
  SELECT id INTO business_id FROM auth.users WHERE email = 'business@afronovation.com';
  SELECT id INTO institutional_id FROM auth.users WHERE email = 'institutional@afronovation.com';

  -- Explorer Subscription
  IF explorer_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM souvera_subscriptions WHERE user_id = explorer_id AND plan_id = 'explorer') THEN
      UPDATE souvera_subscriptions
      SET status = 'active', ends_at = NOW() + INTERVAL '365 days'
      WHERE user_id = explorer_id AND plan_id = 'explorer';
      RAISE NOTICE 'Explorer subscription updated: %', explorer_id;
    ELSE
      INSERT INTO souvera_subscriptions (user_id, plan_id, status, starts_at, ends_at)
      VALUES (explorer_id, 'explorer', 'active', NOW(), NOW() + INTERVAL '365 days');
      RAISE NOTICE 'Explorer subscription created: %', explorer_id;
    END IF;
  END IF;

  -- Professional Subscription
  IF professional_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM souvera_subscriptions WHERE user_id = professional_id AND plan_id = 'professional') THEN
      UPDATE souvera_subscriptions
      SET status = 'active', ends_at = NOW() + INTERVAL '365 days'
      WHERE user_id = professional_id AND plan_id = 'professional';
      RAISE NOTICE 'Professional subscription updated: %', professional_id;
    ELSE
      INSERT INTO souvera_subscriptions (user_id, plan_id, status, starts_at, ends_at)
      VALUES (professional_id, 'professional', 'active', NOW(), NOW() + INTERVAL '365 days');
      RAISE NOTICE 'Professional subscription created: %', professional_id;
    END IF;
  END IF;

  -- Business Subscription
  IF business_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM souvera_subscriptions WHERE user_id = business_id AND plan_id = 'business') THEN
      UPDATE souvera_subscriptions
      SET status = 'active', ends_at = NOW() + INTERVAL '365 days'
      WHERE user_id = business_id AND plan_id = 'business';
      RAISE NOTICE 'Business subscription updated: %', business_id;
    ELSE
      INSERT INTO souvera_subscriptions (user_id, plan_id, status, starts_at, ends_at)
      VALUES (business_id, 'business', 'active', NOW(), NOW() + INTERVAL '365 days');
      RAISE NOTICE 'Business subscription created: %', business_id;
    END IF;
  END IF;

  -- Institutional Subscription
  IF institutional_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM souvera_subscriptions WHERE user_id = institutional_id AND plan_id = 'institutional') THEN
      UPDATE souvera_subscriptions
      SET status = 'active', ends_at = NOW() + INTERVAL '365 days'
      WHERE user_id = institutional_id AND plan_id = 'institutional';
      RAISE NOTICE 'Institutional subscription updated: %', institutional_id;
    ELSE
      INSERT INTO souvera_subscriptions (user_id, plan_id, status, starts_at, ends_at)
      VALUES (institutional_id, 'institutional', 'active', NOW(), NOW() + INTERVAL '365 days');
      RAISE NOTICE 'Institutional subscription created: %', institutional_id;
    END IF;
  END IF;
END $$;

-- =====================================================
-- STEP 4: Verify Final Setup
-- =====================================================
SELECT 
  u.email,
  u.id as user_id,
  p.full_name,
  p.title,
  p.organization_name,
  s.plan_id,
  s.status,
  s.ends_at,
  CASE 
    WHEN p.id IS NULL THEN '❌ Missing Profile'
    WHEN s.id IS NULL THEN '❌ Missing Subscription'
    WHEN s.status != 'active' THEN '⚠️ Inactive Subscription'
    ELSE '✅ Complete'
  END as setup_status
FROM auth.users u
LEFT JOIN souvera_profiles p ON u.id = p.id
LEFT JOIN souvera_subscriptions s ON u.id = s.user_id AND s.status = 'active'
WHERE u.email IN (
  'explorer@afronovation.com',
  'professional@afronovation.com',
  'business@afronovation.com',
  'institutional@afronovation.com'
)
ORDER BY u.email;

-- =====================================================
-- STEP 5: Check Entitlements (Optional Verification)
-- =====================================================
-- This shows what each user can access
SELECT 
  u.email,
  s.plan_id,
  CASE 
    WHEN s.plan_id = 'explorer' THEN 'Limited: 10 countries, regional trade intel, no exports'
    WHEN s.plan_id = 'professional' THEN 'Mid: 25 countries, all intel modules, 5 PNG exports/month'
    WHEN s.plan_id = 'business' THEN 'Full: 50 countries, all features, 50 PNG exports/month, 1 report/month'
    WHEN s.plan_id = 'institutional' THEN 'Unlimited: All countries, all features, unlimited exports'
    ELSE 'Unknown tier'
  END as entitlements
FROM auth.users u
JOIN souvera_subscriptions s ON u.id = s.user_id
WHERE u.email IN (
  'explorer@afronovation.com',
  'professional@afronovation.com',
  'business@afronovation.com',
  'institutional@afronovation.com'
)
AND s.status = 'active'
ORDER BY 
  CASE s.plan_id
    WHEN 'explorer' THEN 1
    WHEN 'professional' THEN 2
    WHEN 'business' THEN 3
    WHEN 'institutional' THEN 4
  END;
