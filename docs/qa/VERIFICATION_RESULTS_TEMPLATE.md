# P0 Tier Resolution Fix - Verification Results

**Date**: 2026-05-01  
**Tester**: [Your Name]  
**Environment**: Local Development

---

## STEP 1: Database Migration

**File**: `infra/supabase/sql-pack-v1.7-rls-fix.sql`

- [ ] Migration executed in Supabase SQL Editor
- [ ] Success message appeared
- [ ] Policies table displayed

**Output**:
```
[Paste success message here]
```

**Status**: ⬜ Pass / ⬜ Fail

**Notes**:
```
[Any issues or observations]
```

---

## STEP 2: Test User Provisioning

**Command**: `npx tsx scripts/seed-test-users.ts`

- [ ] Script completed without errors
- [ ] All 4 users updated
- [ ] No duplicate subscription warnings

**Output**:
```
[Paste provisioning summary here]
```

**Status**: ⬜ Pass / ⬜ Fail

**Notes**:
```
[Any issues or observations]
```

---

## STEP 3: Database Verification

### Query 1: RLS Policies

**Expected**: 5+ policies

**Result**:
| tablename | policyname | cmd |
|-----------|-----------|-----|
| [Fill in] | [Fill in] | [Fill in] |

**Count**: ___ policies

**Status**: ⬜ Pass / ⬜ Fail

### Query 2: Subscriptions

**Expected**: 4 users with correct plans

**Result**:
| email | plan_id | status | fdi_access |
|-------|---------|--------|------------|
| explorer@... | [Fill in] | [Fill in] | [Fill in] |
| professional@... | [Fill in] | [Fill in] | [Fill in] |
| business@... | [Fill in] | [Fill in] | [Fill in] |
| institutional@... | [Fill in] | [Fill in] | [Fill in] |

**Status**: ⬜ Pass / ⬜ Fail

### Query 3: Duplicates

**Expected**: 0 rows

**Result**: ___ rows

**Status**: ⬜ Pass / ⬜ Fail

---

## STEP 4: Browser Verification

**Dev Server Port**: http://localhost:____

### Test 1: Explorer User

**Email**: explorer@afronovation.com

- [ ] Account dropdown shows "Explorer Plan"
- [ ] FDI shows "Professional+" lock on /intelligence/map
- [ ] FDI value NOT displayed
- [ ] Only 1 sector shown
- [ ] No sector rationale
- [ ] Same behavior on /intelligence/africa
- [ ] No browser console errors

**Screenshot**: [Optional - paste screenshot link]

**Status**: ⬜ Pass / ⬜ Fail

**Notes**:
```
[Any issues]
```

---

### Test 2: Professional User

**Email**: professional@afronovation.com

- [ ] Account dropdown shows "Professional Plan" (NOT "Explorer")
- [ ] FDI shows actual value (e.g., "$4.87B") on /intelligence/map
- [ ] NO "Professional+" lock badge
- [ ] Up to 5 sectors shown
- [ ] Sector rationale displayed
- [ ] Same behavior on /intelligence/africa
- [ ] No browser console errors

**API Response Check**:
- [ ] `meta.accessTier` = "professional"
- [ ] `meta.authenticated` = true
- [ ] `metrics.fdiNetInflowsUsd` present
- [ ] `sectors` array has up to 5 items
- [ ] Each sector has `rationale` field

**API Response** (from Network tab):
```json
{
  "meta": {
    "accessTier": "[Fill in]",
    "authenticated": [Fill in]
  },
  "metrics": {
    "fdiNetInflowsUsd": [Fill in or "missing"]
  }
}
```

**Screenshot**: [Optional]

**Status**: ⬜ Pass / ⬜ Fail

**Notes**:
```
[Any issues]
```

---

### Test 3: Business User

**Email**: business@afronovation.com

- [ ] Account dropdown shows "Business Plan"
- [ ] FDI visible on map
- [ ] Up to 5 sectors
- [ ] Sector rationale displayed

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 4: Institutional User

**Email**: institutional@afronovation.com

- [ ] Account dropdown shows "Institutional Plan"
- [ ] FDI visible on map
- [ ] Up to 5 sectors
- [ ] Sector rationale displayed

**Status**: ⬜ Pass / ⬜ Fail

---

## OVERALL RESULTS

### Success Criteria Summary

**Database Level**:
- [ ] 5+ RLS policies created
- [ ] Each user has 1 active subscription
- [ ] Correct plan_id assigned
- [ ] Professional+ have full_macro entitlement
- [ ] No duplicate subscriptions

**Frontend Level**:
- [ ] All 4 tiers show correct plan in dropdown
- [ ] No RLS errors in console
- [ ] No subscription query errors

**FDI Access**:
- [ ] Explorer: FDI locked
- [ ] Professional: FDI visible
- [ ] Business: FDI visible
- [ ] Institutional: FDI visible

**Sector Access**:
- [ ] Explorer: 1 sector, no rationale
- [ ] Professional+: Up to 5 sectors, rationale shown

**API Consistency**:
- [ ] meta.accessTier matches frontend
- [ ] FDI data present for Professional+

---

## FINAL STATUS

**Overall**: ⬜ PASS ✅ / ⬜ FAIL ❌

**Phase 2 QA Status**: ⬜ UNBLOCKED / ⬜ STILL BLOCKED

---

## ISSUES FOUND

1. **Issue**: [Description]
   - **Severity**: Critical / High / Medium / Low
   - **Steps to Reproduce**: [Steps]
   - **Expected**: [What should happen]
   - **Actual**: [What happened]
   - **Status**: Open / In Progress / Resolved

2. [Add more as needed]

---

## RECOMMENDATIONS

1. [Recommendation 1]
2. [Recommendation 2]

---

## SIGN-OFF

**Tester**: ___________________  
**Date**: ___________________  
**Time Spent**: ___ minutes

**Ready for Phase 2 QA**: ⬜ YES / ⬜ NO

---

**Next Steps**:
- [ ] Update `docs/qa/tier-resolution-fdi-access-fix.md` with results
- [ ] Close P0 bug ticket
- [ ] Notify team Phase 2 QA can begin
- [ ] Schedule Phase 2 QA session
