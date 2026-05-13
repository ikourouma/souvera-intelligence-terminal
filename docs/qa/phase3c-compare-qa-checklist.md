# Phase 3C: Country Comparison Tool - QA Checklist

**Page:** `/intelligence/compare`  
**Feature:** Minimal Executive-Grade Comparison Preview  
**Test Date:** _____________  
**Tester:** _____________

---

## Pre-Test Setup

- [ ] Verify Supabase is running locally or connected to staging
- [ ] Verify environment variables are configured (`.env.local`)
- [ ] Verify seed data is loaded (`sql-pack-v1.5-seed-africa-caribbean.sql`)
- [ ] Clear browser cache and cookies
- [ ] Test in both logged-out and logged-in states

---

## 1. Page Load & Initial State

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Navigate to `/intelligence/compare` | Page loads without errors | ⬜ | |
| Page displays header section | "Country Comparison." heading visible | ⬜ | |
| Two dropdown selectors visible | Both labeled correctly | ⬜ | |
| First dropdown label | "Select First Country" | ⬜ | |
| Second dropdown label | "Select Second Country" | ⬜ | |
| Both dropdowns default state | "Choose a country..." placeholder | ⬜ | |
| Empty state displays | GitCompare icon + instructional text | ⬜ | |
| No preview banner initially | Banner only appears after selection | ⬜ | |
| No error messages initially | Clean initial state | ⬜ | |

---

## 2. Dropdown Population

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| First dropdown populates | Countries load with regions in parentheses | ⬜ | |
| Second dropdown populates | Same country list as first | ⬜ | |
| Countries sorted | Alphabetical or logical order | ⬜ | |
| Country format | "Nigeria (Africa)" format | ⬜ | |
| Both Africa and Caribbean | Countries from both regions present | ⬜ | |
| No duplicate entries | Each country appears once | ⬜ | |

**Sample Countries to Verify:**
- [ ] Nigeria (Africa)
- [ ] Kenya (Africa)
- [ ] Ghana (Africa)
- [ ] Jamaica (Caribbean)
- [ ] Trinidad and Tobago (Caribbean)
- [ ] Barbados (Caribbean)

---

## 3. First Country Selection

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Select Nigeria from first dropdown | Selection updates | ⬜ | |
| Loading spinner appears | In first country card | ⬜ | |
| Loading text displays | "Loading details..." | ⬜ | |
| Country detail fetches | Card populates with data | ⬜ | |
| Country name displays | "Nigeria" as heading | ⬜ | |
| Capital displays | Correct capital shown | ⬜ | |
| Region displays | "Africa" or correct region | ⬜ | |
| Signal badge displays | Color-coded badge if available | ⬜ | |
| GDP displays | Formatted as $XXX.XXB or $X.XXT | ⬜ | |
| GDP Growth displays | Formatted as X.X% | ⬜ | |
| Population displays | Formatted as XXX.XM or X.XB | ⬜ | |
| Locked features display | 4 locked rows visible | ⬜ | |
| Historical Trends locked | Shows "Professional" badge | ⬜ | |
| Trade Data locked | Shows "Business" badge | ⬜ | |
| Risk Analysis locked | Shows "Business" badge | ⬜ | |
| Investment Thesis locked | Shows "Institutional" badge | ⬜ | |
| Lock icons display | All locked rows have lock icon | ⬜ | |
| Second dropdown remains empty | No auto-selection | ⬜ | |
| Preview banner appears | "Curated Preview Data" visible | ⬜ | |

---

## 4. Second Country Selection

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Select Jamaica from second dropdown | Selection updates | ⬜ | |
| Loading spinner appears | In second country card | ⬜ | |
| Country detail fetches | Card populates with data | ⬜ | |
| Both cards visible side-by-side | Desktop: 2 columns | ⬜ | |
| Jamaica details display | Name, capital, region, metrics | ⬜ | |
| Both preview banners persist | Or single banner for both | ⬜ | |
| Source metadata displays | Sources listed in banner | ⬜ | |
| Freshness timestamp | If available, displays correctly | ⬜ | |

---

## 5. Side-by-Side Comparison

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Visual alignment | Metrics align vertically | ⬜ | |
| Consistent formatting | GDP, growth, population formats match | ⬜ | |
| Icons match | Same icons for same metrics | ⬜ | |
| Signal badges color-coded | Different countries may have different colors | ⬜ | |
| Locked features identical | Same 4 locked rows in both cards | ⬜ | |
| Cards same height | Or at least balanced layout | ⬜ | |

---

## 6. Upgrade CTA Block

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| CTA block appears | After comparison displayed | ⬜ | |
| CTA text appropriate | "Unlock Full Comparison Features" | ⬜ | |
| Description accurate | Mentions tiers, features, no overstatements | ⬜ | |
| CTA button functional | Routes to `/access/request-access` | ⬜ | |
| Button styling consistent | Souvera blue, hover effect | ⬜ | |

---

## 7. Loading States

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Initial country list load | Spinner with "Loading countries..." | ⬜ | |
| Country detail fetch | Spinner in card area | ⬜ | |
| Loading text readable | "Loading details..." clear | ⬜ | |
| Spinner animation | Rotates smoothly | ⬜ | |
| No flickering | Smooth transition to content | ⬜ | |

---

## 8. Error Handling

### 8a. API Failure (Countries List)

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Simulate API failure | Stop Supabase or break endpoint | ⬜ | |
| Error message displays | Red alert card with error | ⬜ | |
| Error text clear | "Failed to Load Comparison Tool" | ⬜ | |
| AlertCircle icon displays | Red icon in error card | ⬜ | |
| No crash or blank page | Graceful degradation | ⬜ | |

### 8b. Country Detail Failure

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Select country when API broken | Error state in card | ⬜ | |
| Error message displays | "Unable to load country details" | ⬜ | |
| Other country unaffected | If only one fails, other still works | ⬜ | |
| No crash | Graceful error handling | ⬜ | |

---

## 9. Empty State

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| No countries selected | Empty state displays | ⬜ | |
| GitCompare icon | Large centered icon | ⬜ | |
| Heading displays | "Select Countries to Compare" | ⬜ | |
| Instructional text | Clear guidance to use dropdowns | ⬜ | |
| No comparison cards | Cards only appear after selection | ⬜ | |

---

## 10. Changing Selections

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Change first dropdown | Card updates with new country | ⬜ | |
| Change second dropdown | Card updates with new country | ⬜ | |
| Loading state during change | Spinner reappears briefly | ⬜ | |
| Previous data clears | No old data persists | ⬜ | |
| Preview banner updates | If sources differ, banner updates | ⬜ | |
| Select same country twice | Both cards can show same country | ⬜ | |

---

## 11. Mobile Responsiveness (375px)

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Page loads on mobile | No horizontal scroll | ⬜ | |
| Dropdowns full width | Fit screen without overflow | ⬜ | |
| Cards stack vertically | One card above the other | ⬜ | |
| Text readable | No truncation or overlap | ⬜ | |
| Buttons functional | CTA tappable, correct size | ⬜ | |
| Icons appropriately sized | Not too large or small | ⬜ | |
| Locked features readable | Tier badges visible | ⬜ | |

---

## 12. Tablet Responsiveness (768px)

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Layout adapts | 2-column or appropriate layout | ⬜ | |
| Dropdowns side-by-side | Or stacked if more readable | ⬜ | |
| Comparison cards visible | Side-by-side if space allows | ⬜ | |
| No awkward spacing | Balanced layout | ⬜ | |

---

## 13. Desktop Responsiveness (1024px+)

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Full layout visible | Dropdowns and cards side-by-side | ⬜ | |
| Proper spacing | No cramped or too-wide elements | ⬜ | |
| Max width enforced | Container max-width reasonable | ⬜ | |
| Hover effects work | Dropdown hover, button hover | ⬜ | |

---

## 14. Entitlement Behavior (Public User)

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| User not logged in | Can access page | ⬜ | |
| Country selection works | Fetch succeeds | ⬜ | |
| Public-safe fields only | GDP, growth, population visible | ⬜ | |
| No premium fields | Sectors, advanced metrics hidden or locked | ⬜ | |
| Locked features display | All 4 premium rows locked | ⬜ | |
| Preview banner shows | "Curated Preview Data" visible | ⬜ | |
| Upgrade CTA appears | Encourages access request | ⬜ | |

---

## 15. Entitlement Behavior (Explorer User)

**Setup:** Log in as Explorer test user

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| User logged in | Access page successfully | ⬜ | |
| Country selection works | Fetch succeeds | ⬜ | |
| Explorer-tier fields | Basic metrics visible | ⬜ | |
| API returns accessTier | Response includes `meta.accessTier: "explorer"` | ⬜ | |
| Locked features display | Premium rows still locked | ⬜ | |
| Upgrade CTA appears | Encourages upgrade to Professional+ | ⬜ | |

---

## 16. Entitlement Behavior (Professional User)

**Setup:** Log in as Professional test user

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| User logged in | Access page successfully | ⬜ | |
| Country selection works | Fetch succeeds | ⬜ | |
| Professional-tier fields | Additional metrics if available | ⬜ | |
| API returns accessTier | Response includes `meta.accessTier: "professional"` | ⬜ | |
| Historical Trends | **Currently locked** (until Phase 3E) | ⬜ | |
| Other premium rows | Trade, risk, thesis still locked | ⬜ | |

---

## 17. Entitlement Behavior (Business User)

**Setup:** Log in as Business test user

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| User logged in | Access page successfully | ⬜ | |
| Country selection works | Fetch succeeds | ⬜ | |
| Business-tier fields | Extended metrics if available | ⬜ | |
| API returns accessTier | Response includes `meta.accessTier: "business"` | ⬜ | |
| Trade & Risk rows | **Currently locked** (until Phase 3F) | ⬜ | |
| Investment Thesis | Still locked (Institutional only) | ⬜ | |

---

## 18. Entitlement Behavior (Institutional User)

**Setup:** Log in as Institutional test user

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| User logged in | Access page successfully | ⬜ | |
| Country selection works | Fetch succeeds | ⬜ | |
| Institutional-tier fields | Full metrics if available | ⬜ | |
| API returns accessTier | Response includes `meta.accessTier: "institutional"` | ⬜ | |
| Investment Thesis row | **Currently locked** (until Phase 4) | ⬜ | |

---

## 19. Data Accuracy

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| GDP values reasonable | Match seed data | ⬜ | |
| GDP Growth values reasonable | Plausible percentages | ⬜ | |
| Population values reasonable | Match seed data | ⬜ | |
| Capital cities correct | Verified against seed | ⬜ | |
| Regions correct | Africa/Caribbean assigned properly | ⬜ | |
| Signal levels appropriate | Match seed data if present | ⬜ | |
| No "N/A" for seeded data | Fields with data display correctly | ⬜ | |
| "N/A" for missing data | Graceful handling of nulls | ⬜ | |

---

## 20. SEO & Metadata

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Page title correct | "Country Comparison \| Side-by-Side Analysis \| Souvera" | ⬜ | |
| Meta description present | Accurate, compelling, <160 chars | ⬜ | |
| Keywords meta tag | Relevant keywords present | ⬜ | |
| OpenGraph metadata | Title, description, URL, image | ⬜ | |
| Canonical URL | https://souvera.vercel.app/intelligence/compare | ⬜ | |
| No duplicate metadata | Clean head section | ⬜ | |

---

## 21. Browser Compatibility

| Browser | Version | Pass/Fail | Notes |
|---------|---------|-----------|-------|
| Chrome | Latest | ⬜ | |
| Firefox | Latest | ⬜ | |
| Safari | Latest | ⬜ | |
| Edge | Latest | ⬜ | |

---

## 22. Accessibility

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Keyboard navigation | Tab through dropdowns | ⬜ | |
| Select via keyboard | Enter/Space to select | ⬜ | |
| Focus visible | Clear focus indicators | ⬜ | |
| Screen reader labels | Dropdowns labeled correctly | ⬜ | |
| Locked features announced | Screen reader describes tier requirement | ⬜ | |
| ARIA roles appropriate | Semantic HTML or ARIA labels | ⬜ | |

---

## 23. Claims Verification

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| No "real-time" claims | Absent from all text | ⬜ | |
| No "live data" claims | Absent from all text | ⬜ | |
| No accuracy percentages | No "99.x%" claims | ⬜ | |
| No "investment advice" | Absent from all text | ⬜ | |
| No analyst counts | No "40+ analysts" | ⬜ | |
| No data node counts | Absent from all text | ⬜ | |
| Preview data labeled | "Curated Preview Data" present | ⬜ | |

---

## 24. Regression Testing

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Mega nav functional | All links work | ⬜ | |
| Footer functional | All links work | ⬜ | |
| Other pages unaffected | /intelligence/map, /africa, /caribbean work | ⬜ | |
| Forms still work | Lead capture, access request forms functional | ⬜ | |
| No 404 errors | All links resolve | ⬜ | |
| No console errors | Clean console log | ⬜ | |
| Build still succeeds | `npm run build` passes | ⬜ | |

---

## 25. Performance

| Test | Expected Result | Pass/Fail | Notes |
|------|----------------|-----------|-------|
| Initial page load | < 3 seconds on fast connection | ⬜ | |
| Countries list fetch | < 2 seconds | ⬜ | |
| Country detail fetch | < 1 second per country | ⬜ | |
| No memory leaks | Multiple selections don't degrade performance | ⬜ | |
| Smooth animations | No janky scrolling or transitions | ⬜ | |

---

## Summary

**Total Tests:** 200+  
**Passed:** ___  
**Failed:** ___  
**Blocked:** ___  
**Not Tested:** ___

---

## Critical Issues Found

| Issue ID | Severity | Description | Status |
|----------|----------|-------------|--------|
| | | | |

---

## Recommendations

1. 
2. 
3. 

---

## Sign-Off

**QA Tester:** _____________  
**Date:** _____________  
**Status:** [ ] Ready for Pilot   [ ] Needs Fixes   [ ] Blocked

**Notes:**
