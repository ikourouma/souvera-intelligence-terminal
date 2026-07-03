-- Business Dashboard User Setup SQL
-- Run in Supabase SQL Editor to verify/fix business@afronovation.com

-- Step 1: Check if user exists in auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'business@afronovation.com';

-- Step 2: Check if profile exists
SELECT 
  id,
  email,
  full_name,
  title,
  organization_name,
  created_at
FROM souvera_profiles 
WHERE email = 'business@afronovation.com';

-- Step 3: Check subscription status
SELECT 
  s.id,
  s.user_id,
  s.plan_id,
  s.status,
  s.created_at,
  s.current_period_end
FROM souvera_subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'business@afronovation.com'
AND s.status IN ('active', 'trial')
ORDER BY s.created_at DESC
LIMIT 1;

-- Step 4: If profile is missing, create it
-- Replace USER_ID with the actual ID from Step 1
INSERT INTO souvera_profiles (id, email, full_name, title, organization_name)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID from Step 1
  'business@afronovation.com',
  'Business Test User',
  'Business Analyst',
  'Afronovation'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  title = EXCLUDED.title,
  organization_name = EXCLUDED.organization_name;

-- Step 5: If subscription is missing, create Business tier subscription
-- Replace USER_ID with the actual ID from Step 1
INSERT INTO souvera_subscriptions (
  user_id,
  plan_id,
  status,
  current_period_start,
  current_period_end
)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID
  'business',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days'
)
ON CONFLICT (user_id, plan_id) 
DO UPDATE SET
  status = 'active',
  current_period_end = NOW() + INTERVAL '30 days';

-- Step 6: Verify the complete setup
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.organization_name,
  s.plan_id,
  s.status,
  s.current_period_end
FROM auth.users u
LEFT JOIN souvera_profiles p ON u.id = p.id
LEFT JOIN souvera_subscriptions s ON u.id = s.user_id
WHERE u.email = 'business@afronovation.com'
AND (s.status IN ('active', 'trial') OR s.status IS NULL);
