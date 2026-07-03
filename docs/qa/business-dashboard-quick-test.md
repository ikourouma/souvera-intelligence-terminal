# Business Dashboard - Quick Test Guide

**Date:** June 19, 2026  
**Status:** Ready for Manual Testing

---

## Quick Start (5-Minute Test)

### Step 1: Access the Dashboard
1. Open browser (Chrome recommended)
2. Navigate to: `http://localhost:3000/dashboard` (or staging URL)
3. Log in with Business tier credentials

### Step 2: Visual Verification (30 seconds)
**Expected Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Business Intelligence Hub            [Business Plan]    │
│ Welcome back • 127 countries • 43 exports • 0/1 reports │
└─────────────────────────────────────────────────────────┘

┌────────┬────────┬────────┬────────┐
│ 127    │ 43     │ 0/1    │ 8/50   │
│ Ctrs   │ Exprt  │ Rpts   │ Watch  │
└────────┴────────┴────────┴────────┘

┌─────────────────────────┐ ┌──────────┐
│ Trade Intelligence      │ │ Reports  │
│ [5 module cards]        │ │ Quota    │
│                         │ ├──────────┤
├─────────────────────────┤ │ Intel    │
│ Market Watchlist        │ │ Feed     │
│ [NGA, KEN, JAM]         │ ├──────────┤
│                         │ │ Upgrade  │
├─────────────────────────┤ │ Prompt   │
│ Recent Activity         │ │          │
└─────────────────────────┘ └──────────┘
```

### Step 3: Click Test (2 minutes)
**Test these links work:**
- [ ] Click "African Demand Intelligence" → Opens `/intelligence/trade/demand`
- [ ] Click "Nigeria" in watchlist → Opens `/country/NGA`
- [ ] Click "Generate Report" → Opens `/country/NGA?tab=reports`
- [ ] Click "Upgrade to Investor" → Opens `/access`

### Step 4: Responsive Test (1 minute)
- [ ] Resize browser to mobile width (375px)
- [ ] Verify all cards stack vertically
- [ ] Verify no horizontal scroll

### Step 5: Console Check (30 seconds)
- [ ] Open browser console (F12)
- [ ] Check for errors (should be none)
- [ ] Verify no TypeScript warnings

---

## Expected Results

### ✅ Success Criteria
- Dashboard loads in < 2 seconds
- All 5 trade intelligence modules visible
- Market watchlist shows 3 countries
- Stats show placeholder data (127, 43, 0/1, 8/50)
- All navigation links work
- No console errors

### ❌ Failure Scenarios
- Page shows "404 Not Found"
- "Upgrade prompt" shows for Investor tier
- Console shows TypeScript errors
- Navigation links 404
- Page doesn't load within 5 seconds

---

## Test Accounts Needed

### Business Tier User
- Email: business@test.souvera.com
- Access: Full dashboard

### Investor Tier User
- Email: investor@test.souvera.com
- Expected: Dashboard visible, NO upgrade prompt

### Professional Tier User
- Email: professional@test.souvera.com
- Expected: Upgrade prompt shown

### Explorer Tier User
- Email: explorer@test.souvera.com
- Expected: Upgrade prompt shown

---

## Troubleshooting

### Issue: 404 on /dashboard
**Cause:** Route not found  
**Fix:** Verify file exists at `apps/api-gateway/src/app/dashboard/page.tsx`

### Issue: Component not found error
**Cause:** Import path issue  
**Fix:** Verify `BusinessDashboard.tsx` exists in `components/dashboard/`

### Issue: TypeScript errors
**Cause:** Type mismatch  
**Fix:** Run `npx tsc --noEmit` to see specific errors

### Issue: Blank white screen
**Cause:** Runtime error  
**Fix:** Check browser console for error details

### Issue: Stuck on loading spinner
**Cause:** Auth check failing  
**Fix:** Verify user is logged in, check Supabase connection

---

## Next Steps After Testing

### If Tests Pass:
1. ✅ Mark Business Dashboard POC complete
2. → Proceed to build Professional Dashboard
3. → Extend to Investor Dashboard
4. → Add real data integration

### If Tests Fail:
1. Document specific failures
2. Review error logs
3. Fix critical issues
4. Re-test

---

**For detailed testing:** See `docs/qa/business-dashboard-test-plan.md`
