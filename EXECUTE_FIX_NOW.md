# 🚨 EXECUTE TIER RESOLUTION FIX - IMMEDIATE ACTION REQUIRED

## Status: Ready to Deploy
## Priority: P0 - Blocking Phase 2 QA
## Risk Level: LOW (Idempotent, No Data Loss)
## Estimated Time: 10-15 minutes

---

## Quick Summary

**Problem**: Professional/Business/Institutional users show as "Explorer Plan", FDI locked  
**Root Cause**: Missing RLS policies prevent browser client from reading subscription data  
**Fix**: Add RLS SELECT policies for authenticated users  
**Impact**: All tier-based access will work correctly

---

## 🎯 3-Step Fix

### STEP 1: Run Database Migration (2 mins)

1. Open Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy and paste ENTIRE file:
   ```
   infra/supabase/sql-pack-v1.7-rls-fix.sql
   ```
4. Click "Run" (or Ctrl+Enter)

**Expected Output**:
```
✓ RLS policies created successfully
✓ souvera_subscriptions: Users can read their own subscriptions
✓ souvera_profiles: Users can read/update their own profile
```

✅ **Checkpoint**: Policies created, no errors

---

### STEP 2: Re-provision Test Users (1 min)

```bash
cd c:\Users\ikour\Projects\souvera
npx tsx scripts/seed-test-users.ts
```

**Expected Output**:
```
✅ explorer@afronovation.com (explorer)
✅ professional@afronovation.com (professional)
✅ business@afronovation.com (business)
✅ institutional@afronovation.com (institutional)
```

✅ **Checkpoint**: All users updated, no errors

---

### STEP 3: Quick Verification (5 mins)

#### Database Check

Run in Supabase SQL Editor:

```sql
-- Quick verification
SELECT 
  p.email,
  s.plan_id,
  CASE 
    WHEN pe.entitlement_key = 'full_macro' THEN 'FDI Unlocked'
    ELSE 'FDI Locked'
  END as fdi_status
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status = 'active'
JOIN souvera_plans pl ON pl.id = s.plan_id
LEFT JOIN souvera_plan_entitlements pe ON pe.plan_id = s.plan_id AND pe.entitlement_key = 'full_macro'
WHERE p.email LIKE '%@afronovation.com'
ORDER BY pl.rank;
```

**Expected**:
| email | plan_id | fdi_status |
|-------|---------|------------|
| explorer@... | explorer | FDI Locked |
| professional@... | professional | FDI Unlocked |
| business@... | business | FDI Unlocked |
| institutional@... | institutional | FDI Unlocked |

✅ **Checkpoint**: All correct

#### Browser Test (Professional User Only)

1. Open browser (incognito)
2. Go to `http://localhost:3000/login`
3. Login: `professional@afronovation.com`
4. **CHECK**: Dropdown says "Professional Plan" (not Explorer)
5. Go to `/intelligence/map`
6. Select Nigeria
7. **CHECK**: FDI shows value like "$4.87B" (not locked)
8. **CHECK**: Up to 5 sectors shown
9. Open Console (F12) → **CHECK**: No RLS errors

✅ **Checkpoint**: Professional access working

---

## ✅ Success = All 3 Checkpoints Pass

If all checkpoints pass:
- ✅ Fix is complete
- ✅ Phase 2 QA can begin
- ✅ Test other tiers (Explorer, Business, Institutional)

---

## 🚫 If Something Goes Wrong

### Issue: "Permission denied for table"

**Cause**: RLS policy not created  
**Fix**: Re-run Step 1 (sql-pack-v1.7-rls-fix.sql)

### Issue: Still shows "Explorer Plan"

**Possible causes**:
1. Browser cache → Hard refresh (Ctrl+Shift+R)
2. Old session → Logout, clear cookies, login again
3. Wrong user → Verify using `docs/Souvera Test Users.txt`

**Debug**:
```sql
-- Check policies exist
SELECT * FROM pg_policies 
WHERE tablename = 'souvera_subscriptions';
```

### Issue: Provisioning script fails

**Fix**: Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

---

## 📋 Full Documentation

If you need more details:
- **Diagnosis**: `docs/audits/tier-resolution-fdi-access-debug.md`
- **Fix Details**: `docs/qa/tier-resolution-fdi-access-fix.md`
- **Pre-flight Checklist**: `docs/qa/tier-resolution-preflight-checklist.md`
- **Verification SQL**: `docs/qa/tier-resolution-verification.sql`
- **Instructions**: `TIER_RESOLUTION_FIX_INSTRUCTIONS.md`

---

## ⏱️ Timeline

| Step | Time | Cumulative |
|------|------|------------|
| Run migration | 2 min | 2 min |
| Re-provision users | 1 min | 3 min |
| Database verification | 2 min | 5 min |
| Browser test | 5 min | 10 min |
| **Total** | **~10 min** | **10 min** |

---

## 🎯 Next Steps After Fix

1. ✅ Test all 4 tiers (Explorer, Professional, Business, Institutional)
2. ✅ Verify on both `/intelligence/map` and `/intelligence/africa`
3. ✅ Check mobile view
4. ✅ Begin Phase 2 QA
5. ✅ Close tier resolution bug ticket

---

**Ready to Execute**: Yes  
**Blocker Status**: This fixes the P0 blocker  
**Phase 2 QA**: Can begin immediately after verification

🚀 **EXECUTE NOW**
