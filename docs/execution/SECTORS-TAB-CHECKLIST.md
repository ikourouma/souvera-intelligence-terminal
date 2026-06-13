# ✅ Sectors Tab Implementation Checklist

Use this checklist to verify the implementation and go live.

---

## 📋 Pre-Launch Checklist

### **Database Setup** (Required)

- [ ] **Step 1**: Run database setup script
  ```powershell
  .\setup-sectors-db.ps1
  ```
  
- [ ] **Step 2**: Choose setup method:
  - [ ] Option 1: Supabase Dashboard (recommended)
  - [ ] Option 2: Copy SQL manually
  - [ ] Option 3: Direct Postgres connection

- [ ] **Step 3**: Verify table was created
  ```sql
  SELECT * FROM souvera_country_sectors LIMIT 1;
  ```
  Expected: 1 row returned (Technology sector)

- [ ] **Step 4**: Verify all 5 sectors were seeded
  ```sql
  SELECT COUNT(*) FROM souvera_country_sectors sc
  JOIN souvera_countries c ON sc.country_id = c.id
  WHERE c.iso3 = 'NGA';
  ```
  Expected: 5 rows

---

## 🧪 Testing Checklist

### **Functional Tests**

- [ ] Navigate to `/country/NGA?tab=sectors`
- [ ] Verify 5 sector cards render
- [ ] Verify icons display correctly (💻, 🌾, ⚡, 🏭, ⛏️)
- [ ] Verify teaser text is visible
- [ ] Verify key players section displays
- [ ] Click "Read Full Analysis" to expand narrative
- [ ] Verify narrative expands/collapses smoothly
- [ ] Hover over help tooltip (ⓘ) icons
- [ ] Verify tooltips show definitions

### **Entitlement Tests**

Test with different user roles:

- [ ] **Anonymous User** (Public):
  - [ ] Can see teaser ✓
  - [ ] Can see key players ✓
  - [ ] Cannot see sector scores ✗
  - [ ] Cannot see narrative ✗
  - [ ] Cannot see AGOA opportunity ✗

- [ ] **Explorer**:
  - [ ] Can see teaser ✓
  - [ ] Can see key players ✓
  - [ ] Cannot see sector scores ✗
  - [ ] Cannot see narrative ✗
  - [ ] Cannot see AGOA opportunity ✗

- [ ] **Professional**:
  - [ ] Can see teaser ✓
  - [ ] Can see key players ✓
  - [ ] Can see sector scores ✓
  - [ ] Can see narrative ✓
  - [ ] Cannot see AGOA opportunity ✗

- [ ] **Business**:
  - [ ] Can see teaser ✓
  - [ ] Can see key players ✓
  - [ ] Can see sector scores ✓
  - [ ] Can see narrative ✓
  - [ ] Can see AGOA opportunity ✓

- [ ] **Admin**:
  - [ ] Can see everything ✓

### **Responsive Tests**

Test on different screen sizes:

- [ ] **Mobile (375px width)**:
  - [ ] Cards stack vertically
  - [ ] Icons are appropriately sized (not too large)
  - [ ] Text wraps without overflow
  - [ ] Score bars are visible and full-width
  - [ ] AGOA metrics stack vertically
  - [ ] Footer stacks (sources above date)
  - [ ] Export button shows icon only (text hidden)

- [ ] **Tablet (768px width)**:
  - [ ] All text at full size
  - [ ] AGOA metrics in 2-column grid
  - [ ] Comfortable spacing
  - [ ] Export button shows "PNG" text

- [ ] **Desktop (1920px width)**:
  - [ ] Full layout with optimal spacing
  - [ ] All elements visible
  - [ ] Hover effects work on buttons
  - [ ] Tooltips display on hover

### **Data Quality Tests**

Verify sector data:

- [ ] **Technology Sector**:
  - [ ] Strength: 82/100
  - [ ] Growth: 88/100
  - [ ] Attractiveness: 91/100
  - [ ] 4 key players (Flutterwave, Paystack, Andela, Interswitch)
  - [ ] AGOA current: $85M/year
  - [ ] AGOA potential: $500M/year

- [ ] **Agriculture Sector**:
  - [ ] Strength: 74/100
  - [ ] Growth: 68/100
  - [ ] Attractiveness: 79/100
  - [ ] 4 key players (Olam, Dangote Sugar, Flour Mills, TGI)
  - [ ] AGOA current: $450M/year
  - [ ] AGOA potential: $1.2B/year

- [ ] **Energy Sector**:
  - [ ] Strength: 76/100
  - [ ] Growth: 72/100
  - [ ] Attractiveness: 85/100
  - [ ] 4 key players (NNPC, Nigeria LNG, Dangote Refinery, Arnergy)
  - [ ] AGOA current: $2.4B/year
  - [ ] AGOA potential: $8B/year

- [ ] **Manufacturing Sector**:
  - [ ] Strength: 68/100
  - [ ] Growth: 64/100
  - [ ] Attractiveness: 73/100
  - [ ] 4 key players (Dangote Cement, Innoson, Honeywell, Nigerian Textile Mills)
  - [ ] AGOA current: $150M/year
  - [ ] AGOA potential: $600M/year

- [ ] **Mining Sector**:
  - [ ] Strength: 58/100
  - [ ] Growth: 76/100
  - [ ] Attractiveness: 88/100
  - [ ] 4 key players (Dangote, United Capital, Thor, Dalex)
  - [ ] AGOA current: $120M/year
  - [ ] AGOA potential: $2B/year

---

## 🐛 Known Issues & Fixes

### Issue: "Table does not exist"
**Fix**: Run the migration first:
```sql
-- Copy/paste contents of: infra/supabase/migrations/create-country-sectors-table.sql
```

### Issue: "No sectors displayed"
**Fix**: Run the seed script:
```sql
-- Copy/paste contents of: infra/supabase/seed-nigeria-sectors.sql
```

### Issue: "Help tooltips not working"
**Fix**: Verify knowledge base entries exist:
```typescript
// Check: apps/api-gateway/src/data/knowledge-base.ts
// Look for: sector_strength_score, sector_growth_score, sector_attractiveness_score
```

### Issue: "Score bars not visible on mobile"
**Fix**: Verify Tailwind classes:
```tsx
// Should be: h-2 sm:h-2.5 (not h-1)
className="w-full h-2 sm:h-2.5 bg-zinc-800 rounded-full overflow-hidden"
```

---

## 📊 Performance Checklist

- [ ] Page loads in < 2 seconds
- [ ] No console errors
- [ ] No console warnings (ignore Next.js dev warnings)
- [ ] Images load correctly (flag icons, etc.)
- [ ] Fonts load correctly (no FOUT)
- [ ] Animations are smooth (no jank)
- [ ] No horizontal scroll on any device

---

## ♿ Accessibility Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Help tooltips are accessible (keyboard + screen reader)
- [ ] Headings are hierarchical (h1 → h2 → h3)
- [ ] No layout shift on load

---

## 🔒 Security Checklist

- [ ] RLS policies are enabled on `souvera_country_sectors` table
- [ ] Entitlement checks are server-side (API route)
- [ ] No sensitive data exposed to unauthenticated users
- [ ] AGOA data only visible to Business+ tier
- [ ] Admin panel access restricted

---

## 📈 Analytics Checklist (Optional)

If you have analytics set up:

- [ ] Track page views: `/country/NGA?tab=sectors`
- [ ] Track sector card clicks
- [ ] Track "Read Full Analysis" expansions
- [ ] Track help tooltip hovers
- [ ] Track export button clicks (when implemented)

---

## 🚀 Go-Live Checklist

### **Pre-Launch** (Day 1)
- [ ] Database setup complete
- [ ] All tests passing
- [ ] No console errors
- [ ] Responsive on all devices
- [ ] Entitlements working correctly

### **Launch** (Day 1)
- [ ] Deploy to production
- [ ] Verify production database has sectors data
- [ ] Test on production URL
- [ ] Monitor error logs

### **Post-Launch** (Day 2-7)
- [ ] Collect user feedback
- [ ] Monitor analytics (most viewed sectors)
- [ ] Check error logs daily
- [ ] Fix any reported bugs

---

## 🎯 Success Criteria

### **Minimum Viable Product** (MVP)
- [x] 5 sectors displayed
- [x] Sector scores visible (Professional+)
- [x] Narrative visible (Professional+)
- [x] AGOA opportunity visible (Business+)
- [x] Responsive on mobile, tablet, desktop
- [x] Help tooltips functional

### **Nice to Have** (Future)
- [ ] PNG export (per sector card)
- [ ] Sub-sector breakdowns (Fintech, E-commerce)
- [ ] Sector trends (charts for 2020-2025)
- [ ] Regional comparisons (Nigeria vs. Kenya)
- [ ] Investment case studies

---

## 📞 Support

### If you encounter issues:

1. **Check logs**:
   - Browser console (F12 → Console)
   - Server logs (`npm run dev` output)
   - Supabase logs (Dashboard → Logs)

2. **Verify data**:
   ```sql
   SELECT * FROM souvera_country_sectors 
   WHERE country_id = (SELECT id FROM souvera_countries WHERE iso3 = 'NGA');
   ```

3. **Review documentation**:
   - Implementation plan: `session-4-sectors-tab-build-plan.md`
   - Completion report: `session-4-implementation-complete.md`
   - Responsive guide: `sectors-tab-responsive-design.md`

4. **Test on fresh browser**:
   - Clear cache (Ctrl+Shift+R)
   - Try incognito mode
   - Try different browser

---

## ✅ Final Verification

Before marking as complete:

- [ ] Database setup: **DONE**
- [ ] Functional tests: **PASSED**
- [ ] Entitlement tests: **PASSED**
- [ ] Responsive tests: **PASSED**
- [ ] Data quality tests: **PASSED**
- [ ] Performance tests: **PASSED**
- [ ] Accessibility tests: **PASSED**
- [ ] Security tests: **PASSED**

---

## 🎉 You're Ready!

Once all checkboxes are complete:

```
✅ Sectors Tab is LIVE and PRODUCTION-READY
```

Congratulations! You've built a Bloomberg-grade sectoral intelligence system. 🚀

---

**Next Session Options**:
1. **Opportunity Tab**: Investment thesis, FDI entry points, growth drivers
2. **Risk Tab**: Risk narrative, scorecard, mitigation strategies
3. **Trade Tab**: Bilateral trade flows, AGOA product breakdown

**Your choice!** 🎯
