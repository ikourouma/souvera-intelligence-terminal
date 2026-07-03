# Business Dashboard Testing Guide
**Version:** 1.0  
**Date:** June 19, 2026  
**Status:** POC Testing Phase

---

## Test Environment Setup

### Prerequisites
- ✅ User account with Business tier subscription
- ✅ Active authentication session
- ✅ Browser: Chrome/Firefox/Safari (latest versions)
- ✅ Network: Connected to staging/production database

### Test Users
Create test accounts for:
- [ ] Business tier user (primary testing)
- [ ] Investor tier user (verify dashboard access)
- [ ] Professional tier user (verify upgrade prompt)
- [ ] Explorer tier user (verify paywall)

---

## Functional Testing Checklist

### 1. Authentication & Access Control
**Route:** `/dashboard`

#### Test 1.1: Unauthenticated Access
- [ ] Navigate to `/dashboard` without logging in
- [ ] **Expected:** Redirect to `/login`
- [ ] **Actual:** _____________________

#### Test 1.2: Business Tier Access
- [ ] Log in as Business tier user
- [ ] Navigate to `/dashboard`
- [ ] **Expected:** Full Business dashboard visible
- [ ] **Actual:** _____________________

#### Test 1.3: Investor/Institutional Access
- [ ] Log in as Investor or Institutional user
- [ ] Navigate to `/dashboard`
- [ ] **Expected:** Business dashboard visible (POC)
- [ ] **Actual:** _____________________

#### Test 1.4: Lower Tier Access (Explorer/Professional)
- [ ] Log in as Explorer or Professional user
- [ ] Navigate to `/dashboard`
- [ ] **Expected:** Upgrade prompt card visible
- [ ] **Actual:** _____________________

---

### 2. Dashboard Header

#### Test 2.1: Header Display
- [ ] Page title shows "Business Intelligence Hub"
- [ ] Plan badge displays correct tier (e.g., "Business Plan")
- [ ] "Account Settings" link present
- [ ] Usage summary shows: countries viewed, exports, reports used
- [ ] **Pass/Fail:** _____________________

#### Test 2.2: Navigation Links
- [ ] Click "Account Settings" → Redirects to `/profile`
- [ ] Plan badge is static (non-clickable)
- [ ] **Pass/Fail:** _____________________

---

### 3. Quick Stats Row

#### Test 3.1: Stat Cards Display
- [ ] **Countries Analyzed** card shows number + trend
- [ ] **Exports Generated** card shows count
- [ ] **Reports Quota** card shows used/limit format (e.g., "0/1")
- [ ] **Watchlist** card shows count/max format (e.g., "8/50")
- [ ] **Pass/Fail:** _____________________

#### Test 3.2: Visual Design
- [ ] Each card has appropriate icon
- [ ] Color coding matches design (blue, emerald, amber, cyan)
- [ ] Cards are responsive (stack on mobile)
- [ ] **Pass/Fail:** _____________________

---

### 4. Trade Intelligence Panel

#### Test 4.1: Module Cards Display
- [ ] All 5 modules visible:
  - African Demand Intelligence
  - Caribbean Demand Intelligence
  - AfCFTA Trade Flows
  - CBTPA Trade Flows
  - AGOA Product Finder
- [ ] Each card has icon, name, description
- [ ] **Pass/Fail:** _____________________

#### Test 4.2: Module Navigation
- [ ] Click "African Demand Intelligence" → Redirects to `/intelligence/trade/demand`
- [ ] Click "Caribbean Demand Intelligence" → Redirects to `/intelligence/trade/demand-caribbean`
- [ ] Click "AfCFTA Trade Flows" → Redirects to `/intelligence/trade/afcfta/flows`
- [ ] Click "CBTPA Trade Flows" → Redirects to `/intelligence/trade/cbtpa/flows`
- [ ] Click "AGOA Product Finder" → Redirects to `/intelligence/trade/agoa/products`
- [ ] **Pass/Fail:** _____________________

#### Test 4.3: Hover Effects
- [ ] Hover on module card → Background darkens
- [ ] Hover on module card → Border color changes
- [ ] Hover on module card → Arrow icon moves right
- [ ] **Pass/Fail:** _____________________

---

### 5. Market Watchlist Panel

#### Test 5.1: Watchlist Display
- [ ] Panel title shows "Market Watchlist"
- [ ] Counter shows "X/50 markets monitored"
- [ ] Sample markets visible (Nigeria, Kenya, Jamaica)
- [ ] Each market shows flag, name, status
- [ ] **Pass/Fail:** _____________________

#### Test 5.2: Status Indicators
- [ ] "Policy change" shows amber warning icon
- [ ] "Up to date" shows green check icon
- [ ] "Trade update" shows cyan trending icon
- [ ] **Pass/Fail:** _____________________

#### Test 5.3: Market Navigation
- [ ] Click on Nigeria → Redirects to `/country/NGA`
- [ ] Click on Kenya → Redirects to `/country/KEN`
- [ ] Click on Jamaica → Redirects to `/country/JAM`
- [ ] **Pass/Fail:** _____________________

#### Test 5.4: Add Markets Button
- [ ] "+ Add Markets" button visible
- [ ] Button hover effect works
- [ ] **Note:** Button functionality is placeholder (TODO)
- [ ] **Pass/Fail:** _____________________

---

### 6. Recent Activity Panel

#### Test 6.1: Activity Display
- [ ] Panel title shows "Recent Activity"
- [ ] Sample activities visible (3 items)
- [ ] Each activity shows icon, name, timestamp
- [ ] **Pass/Fail:** _____________________

#### Test 6.2: Activity Types
- [ ] Country view activity (eye icon)
- [ ] Export activity (download icon)
- [ ] Timestamp format correct (e.g., "2 hours ago", "Yesterday")
- [ ] **Pass/Fail:** _____________________

---

### 7. Reports Quota Widget (Sidebar)

#### Test 7.1: Quota Display
- [ ] Widget title shows "REPORTS QUOTA"
- [ ] Large number shows remaining reports
- [ ] Format: "X of Y remaining"
- [ ] Progress bar visible
- [ ] **Pass/Fail:** _____________________

#### Test 7.2: Tier-Specific Limits
- [ ] Business tier: "0 of 1 remaining"
- [ ] Investor tier: "0 of 5 remaining"
- [ ] Progress bar percentage correct
- [ ] **Pass/Fail:** _____________________

#### Test 7.3: Reset Date
- [ ] "Next reset" date displays
- [ ] Date is approximately 11 days from today
- [ ] Format: "Month Day, Year"
- [ ] **Pass/Fail:** _____________________

#### Test 7.4: Generate Report Button
- [ ] "Generate Report" button visible
- [ ] Button hover effect works
- [ ] Click → Redirects to `/country/NGA?tab=reports`
- [ ] **Pass/Fail:** _____________________

---

### 8. Intelligence Feed Widget (Sidebar)

#### Test 8.1: Feed Display
- [ ] Widget title shows "INTELLIGENCE FEED"
- [ ] Bell icon visible in header
- [ ] 3 sample alerts visible
- [ ] **Pass/Fail:** _____________________

#### Test 8.2: Alert Types
- [ ] AGOA countdown alert (amber calendar icon)
- [ ] Policy update alert (green check icon)
- [ ] Trade opportunity alert (cyan trending icon)
- [ ] **Pass/Fail:** _____________________

#### Test 8.3: View All Link
- [ ] "View all updates →" link visible
- [ ] Click → Redirects to `/insights`
- [ ] **Pass/Fail:** _____________________

---

### 9. Upgrade Prompt Widget (Sidebar)

#### Test 9.1: Widget Visibility
- [ ] **Business tier:** Widget visible
- [ ] **Investor tier:** Widget NOT visible
- [ ] **Institutional tier:** Widget NOT visible
- [ ] **Pass/Fail:** _____________________

#### Test 9.2: Widget Content
- [ ] Title: "Unlock with Investor Plan"
- [ ] 4 feature bullets visible with check icons
- [ ] Features listed:
  - Supply-Demand Matrix (74×8 sectors)
  - Forecast metrics and predictive analytics
  - 5 reports/month (no watermark)
  - Advanced risk scoring
- [ ] **Pass/Fail:** _____________________

#### Test 9.3: Upgrade Button
- [ ] "Upgrade to Investor" button visible
- [ ] Button hover effect works
- [ ] Click → Redirects to `/access`
- [ ] **Pass/Fail:** _____________________

---

### 10. Responsive Design

#### Test 10.1: Desktop (1920x1080)
- [ ] All panels visible
- [ ] 3-column grid layout (2 main + 1 sidebar)
- [ ] No horizontal scroll
- [ ] **Pass/Fail:** _____________________

#### Test 10.2: Tablet (768px)
- [ ] Stats row stacks into 2 columns
- [ ] Main panels stack vertically
- [ ] Sidebar moves below main content
- [ ] **Pass/Fail:** _____________________

#### Test 10.3: Mobile (375px)
- [ ] Stats cards stack into 1 column
- [ ] Trade Intelligence modules stack into 1 column
- [ ] All text readable
- [ ] No horizontal scroll
- [ ] **Pass/Fail:** _____________________

---

### 11. Performance Testing

#### Test 11.1: Page Load Time
- [ ] Initial load: < 2 seconds
- [ ] Stats load: < 1 second
- [ ] No layout shift during load
- [ ] **Pass/Fail:** _____________________

#### Test 11.2: Navigation Speed
- [ ] Click on module → Navigate < 500ms
- [ ] Click on market → Navigate < 500ms
- [ ] Back button works correctly
- [ ] **Pass/Fail:** _____________________

---

### 12. Data Integration (Future)

#### Test 12.1: Real Stats (TODO)
- [ ] Countries viewed count from database
- [ ] Exports generated count from database
- [ ] Reports used/limit from subscription
- [ ] Watchlist count from user preferences
- [ ] **Note:** Currently using placeholder data
- [ ] **Pass/Fail:** _____________________

#### Test 12.2: Real Activity Feed (TODO)
- [ ] Recent countries from user_preferences table
- [ ] Recent exports from dashboard_analytics table
- [ ] Timestamps accurate
- [ ] **Note:** Currently using placeholder data
- [ ] **Pass/Fail:** _____________________

---

## Browser Compatibility Testing

### Test 13: Chrome (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Visual design correct
- [ ] **Pass/Fail:** _____________________

### Test 14: Firefox (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Visual design correct
- [ ] **Pass/Fail:** _____________________

### Test 15: Safari (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Visual design correct
- [ ] **Pass/Fail:** _____________________

### Test 16: Edge (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Visual design correct
- [ ] **Pass/Fail:** _____________________

---

## Accessibility Testing

### Test 17: Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Enter/Space activates buttons/links
- [ ] **Pass/Fail:** _____________________

### Test 18: Screen Reader
- [ ] Page title announced correctly
- [ ] Stat cards have proper labels
- [ ] Links have descriptive text
- [ ] Icons have aria-labels where needed
- [ ] **Pass/Fail:** _____________________

---

## Known Issues / TODOs

1. **Data Integration:**
   - Stats are currently placeholder values
   - Need to connect to real database tables
   - Need to implement user_preferences table queries

2. **Add Markets Functionality:**
   - "+ Add Markets" button is placeholder
   - Need to implement watchlist management
   - Need to create modal/drawer for adding markets

3. **Activity Feed:**
   - Sample data only
   - Need to implement real activity tracking
   - Need dashboard_analytics table queries

4. **Other Personas:**
   - Only Business tier implemented
   - Need Professional dashboard
   - Need Investor dashboard
   - Need Explorer dashboard
   - Need Institutional dashboard

5. **Saved Analyses:**
   - Not yet implemented
   - Planned for Phase 2B

6. **Export History:**
   - Not yet implemented
   - Needs saved_content table queries

---

## Test Results Summary

**Test Date:** _____________________  
**Tested By:** _____________________  
**Environment:** Staging / Production (circle one)

### Overall Status
- [ ] ✅ All Critical Tests Passed
- [ ] 🟡 Minor Issues Found (see notes)
- [ ] ❌ Major Issues Found (see notes)

### Issues Found:
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Recommendations:
1. _____________________________________
2. _____________________________________
3. _____________________________________

---

## Sign-off

**Developer:** _____________________  
**Date:** _____________________  

**QA Engineer:** _____________________  
**Date:** _____________________  

**Product Owner:** _____________________  
**Date:** _____________________
