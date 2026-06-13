# Opportunity Tab - Visual Testing Checklist

**Date**: May 14, 2026  
**Component**: `OpportunityTab.tsx`  
**Test Environment**: Development (`/country/NGA`)

---

## 🎯 PRE-FLIGHT CHECK

Before starting visual testing:
- [ ] Development server running (`npm run dev`)
- [ ] Database connection active
- [ ] Nigeria seed data applied (`seed-nigeria-overview.ts`)
- [ ] Browser DevTools open (for responsive testing)

---

## 1️⃣ ENTITLEMENT GATING

### Test Cases

#### Explorer Tier (No Access)
- [ ] Navigate to `/country/NGA?tab=opportunity`
- [ ] **Expected**: Upgrade prompt displayed
- [ ] Shield icon visible (opacity 50%)
- [ ] "Business+ Feature" heading
- [ ] "Upgrade to Business" button present
- [ ] No opportunity content visible

#### Professional Tier (No Access)
- [ ] Switch to Professional user
- [ ] Navigate to Opportunity tab
- [ ] **Expected**: Same upgrade prompt as Explorer

#### Business Tier (Full Access)
- [ ] Switch to Business user
- [ ] Navigate to Opportunity tab
- [ ] **Expected**: Full content visible
- [ ] All 3 pillar cards displayed
- [ ] Investment entry points visible
- [ ] Regional advantages section present

#### Admin Tier (Full Access)
- [ ] Switch to Admin user
- [ ] **Expected**: Identical to Business tier

---

## 2️⃣ HERO SECTION

### Visual Elements
- [ ] **Gradient background**: Blue-900/20 to Emerald-900/20
- [ ] **Border**: Blue-500/20
- [ ] **Icon**: TrendingUp in emerald-400
- [ ] **Heading**: "Investment Opportunity" (text-2xl, bold, white)
- [ ] **Subheading**: "Multi-sector opportunities..." (text-sm, zinc-400)
- [ ] **Help tooltip**: Functional on click

### Metric Highlighting
- [ ] **$575 billion**: `text-emerald-400 font-semibold`
- [ ] Narrative text readable (text-zinc-300)

### Responsive Behavior
- [ ] **Mobile (375px)**: Padding reduced, text wraps
- [ ] **Tablet (768px)**: Comfortable spacing
- [ ] **Desktop (1024px+)**: Full layout with padding-8

---

## 3️⃣ THREE CORE PILLARS

### Layout
- [ ] **Grid**: 1 column (mobile), 3 columns (desktop `lg:`)
- [ ] **Spacing**: `gap-6` between cards
- [ ] All 3 cards equal height

### Pillar 1: Technology Sector
- [ ] **Icon**: Zap (blue-400) in gradient box
- [ ] **Heading**: "Technology Sector" (text-lg, bold, white)
- [ ] **Badge**: "Africa's Leading Tech Hub" (emerald-400)
- [ ] **Help tooltip**: Functional

**Metrics**:
- [ ] **$40 billion**: emerald-400, font-semibold
- [ ] **60% of adults**: blue-400, font-semibold
- [ ] Narrative paragraph readable

**Key Opportunities Box**:
- [ ] Background: zinc-800/50
- [ ] Label: "KEY OPPORTUNITIES" (uppercase, tracking-wider)
- [ ] 4 bullet points:
  - [ ] Fintech infrastructure
  - [ ] AgriTech
  - [ ] EdTech (**45 million** in blue-300)
  - [ ] E-commerce
- [ ] Blue bullet points (•) aligned

**Hover State**:
- [ ] Border changes to blue-500/30
- [ ] Smooth transition (300ms)

### Pillar 2: Agricultural Value-Add
- [ ] **Icon**: TrendingUp (emerald-400) in gradient box
- [ ] **Heading**: "Agricultural Value-Add" (text-lg, bold, white)
- [ ] **Badge**: "$10B Import Substitution Play" (emerald-400)
- [ ] **Help tooltip**: Functional

**Metrics**:
- [ ] **$10 billion**: emerald-400, font-semibold
- [ ] **60M tons/year**: blue-300, font-semibold
- [ ] **70% exported raw**: blue-400, font-semibold
- [ ] **$2B**: emerald-400, font-semibold
- [ ] **95%**: blue-400, font-semibold

**Investment Areas Box**:
- [ ] Background: zinc-800/50
- [ ] Label: "INVESTMENT AREAS"
- [ ] 4 bullet points:
  - [ ] Cassava processing (60M tons/year highlighted)
  - [ ] Cocoa value chain (70% highlighted)
  - [ ] Rice milling ($2B highlighted)
  - [ ] Cold chain (95% highlighted)
- [ ] Emerald bullet points (•) aligned

**Hover State**:
- [ ] Border changes to emerald-500/30

### Pillar 3: Infrastructure Development
- [ ] **Icon**: Building2 (amber-400) in gradient box
- [ ] **Heading**: "Infrastructure Development" (text-lg, bold, white)
- [ ] **Badge**: "$15B Pipeline (2025-2028)" (amber-400)
- [ ] **Help tooltip**: Functional

**Metrics**:
- [ ] **$15 billion**: emerald-400, font-semibold
- [ ] **25GW**: blue-300, font-semibold
- [ ] **20M**: blue-300, font-semibold
- [ ] **3.5%/year**: blue-400, font-semibold

**Priority Projects Box**:
- [ ] Background: zinc-800/50
- [ ] Label: "PRIORITY PROJECTS"
- [ ] 4 bullet points:
  - [ ] Power generation (25GW highlighted)
  - [ ] Port modernization
  - [ ] Rail infrastructure
  - [ ] Housing (20M, 3.5%/year highlighted)
- [ ] Amber bullet points (•) aligned

**Hover State**:
- [ ] Border changes to amber-500/30

---

## 4️⃣ INVESTMENT ENTRY POINTS

### Layout
- [ ] **Section heading**: "Investment Entry Points" with DollarSign icon
- [ ] **Help tooltip**: Functional
- [ ] **Grid**: 1 column (mobile), 2 columns (md:), 2 columns (desktop)
- [ ] **Spacing**: `gap-4`

### Entry Point Cards (4 Total)

#### 1. Joint Ventures
- [ ] **Icon**: Building2 (blue-400) in blue-500/20 circle
- [ ] **Heading**: "Joint Ventures" (font-semibold, white)
- [ ] **Content**: Mentions Dangote, BUA, Flour Mills (white, font-medium)
- [ ] Hover: Background darkens to zinc-800/70

#### 2. Private Equity
- [ ] **Icon**: TrendingUp (emerald-400) in emerald-500/20 circle
- [ ] **Heading**: "Private Equity" (font-semibold, white)
- [ ] **Content**: "Series B-C stage" highlighted (white, font-medium)
- [ ] Hover: Background darkens

#### 3. Greenfield Projects
- [ ] **Icon**: Zap (amber-400) in amber-500/20 circle
- [ ] **Heading**: "Greenfield Projects" (font-semibold, white)
- [ ] **Content**: "tax holidays" (emerald-400), "repatriation guarantees" (blue-400)
- [ ] Hover: Background darkens

#### 4. Listed Equities
- [ ] **Icon**: DollarSign (cyan-400) in cyan-500/20 circle
- [ ] **Heading**: "Listed Equities" (font-semibold, white)
- [ ] **Content**: "NSE" mentioned
- [ ] Hover: Background darkens

---

## 5️⃣ REGIONAL MARKET ADVANTAGES

### Layout
- [ ] **Section heading**: "Regional Market Advantages" with Globe icon
- [ ] **Help tooltip**: Functional
- [ ] **Grid**: 1 column (mobile), 2 columns (md:), 4 columns (lg:)
- [ ] **Spacing**: `gap-4`

### Stat Cards (4 Total)

#### 1. ECOWAS Market Access
- [ ] **Icon**: Globe (blue-400), centered
- [ ] **Stat**: "350M" (text-2xl, bold, blue-300)
- [ ] **Label**: "ECOWAS Market Access" (text-sm, zinc-400)
- [ ] **Subtext**: "West African Economic Community" (text-xs, zinc-500)
- [ ] Hover: Background darkens

#### 2. AfCFTA Access
- [ ] **Icon**: Globe (emerald-400), centered
- [ ] **Stat**: "1.3B" (text-2xl, bold, emerald-300)
- [ ] **Label**: "AfCFTA Access" (text-sm, zinc-400)
- [ ] **Subtext**: "Duty-free African market" (text-xs, zinc-500)
- [ ] Hover: Background darkens

#### 3. AGOA
- [ ] **Icon**: Shield (blue-400), centered
- [ ] **Stat**: "AGOA" (text-2xl, bold, blue-300)
- [ ] **Label**: "U.S. Market Access" (text-sm, zinc-400)
- [ ] **Subtext**: "Duty-free exports through 2025+" (text-xs, zinc-500)
- [ ] Hover: Background darkens

#### 4. Annual Graduates
- [ ] **Icon**: Users (emerald-400), centered
- [ ] **Stat**: "200K+" (text-2xl, bold, emerald-300)
- [ ] **Label**: "Annual Graduates" (text-sm, zinc-400)
- [ ] **Subtext**: "English-speaking skilled workforce" (text-xs, zinc-500)
- [ ] Hover: Background darkens

---

## 6️⃣ BOTTOM CTA SECTION

### Visual Elements
- [ ] **Gradient background**: Blue-900/30 to Emerald-900/30
- [ ] **Border**: Blue-500/30
- [ ] **Heading**: "Ready to Explore..." (text-lg, bold, white)
- [ ] **Subheading**: "Connect with our investment..." (text-sm, zinc-300)
- [ ] **2 Buttons**:
  - [ ] "Schedule Consultation" (blue-600, hover:blue-700)
  - [ ] "Download Investment Brief" (zinc-700, hover:zinc-600)

### Responsive Behavior
- [ ] **Mobile**: Buttons stack vertically
- [ ] **Tablet+**: Buttons side-by-side with `gap-3`

---

## 7️⃣ RESPONSIVE BREAKPOINTS

### Mobile (375px)
- [ ] Hero section: Padding reduced to p-6
- [ ] Pillar cards: Stacked (1 column)
- [ ] Entry points: Stacked (1 column)
- [ ] Regional advantages: Stacked (1 column)
- [ ] Text readable, no horizontal scroll
- [ ] Buttons stack vertically

### Tablet (768px)
- [ ] Hero section: Padding comfortable
- [ ] Pillar cards: Still stacked (transitions at 1024px)
- [ ] Entry points: 2 columns (`md:grid-cols-2`)
- [ ] Regional advantages: 2 columns (`md:grid-cols-2`)
- [ ] Buttons side-by-side

### Desktop (1024px)
- [ ] Hero section: Full padding (p-8)
- [ ] Pillar cards: 3 columns (`lg:grid-cols-3`)
- [ ] Entry points: 2 columns (maintained)
- [ ] Regional advantages: 4 columns (`lg:grid-cols-4`)
- [ ] All content comfortably spaced

### Large Desktop (1440px+)
- [ ] Content centered with max-width constraints
- [ ] No excessive whitespace
- [ ] Cards maintain consistent aspect ratios

---

## 8️⃣ HELP TOOLTIPS (Knowledge Base)

### Tooltip Functionality
- [ ] **opportunity_overview**: Comprehensive investment thesis
- [ ] **tech_sector_opportunity**: $40B fintech, 60% mobile penetration
- [ ] **agriculture_opportunity**: $10B import gap, cassava/cocoa/rice
- [ ] **infrastructure_opportunity**: $15B pipeline, power/ports/rail/housing
- [ ] **investment_entry_points**: JVs, PE/VC, greenfield, NSE equities
- [ ] **regional_advantages**: ECOWAS, AfCFTA, AGOA, workforce

### Modal Behavior
- [ ] Tooltip opens on click
- [ ] Modal displays title, summary, sections
- [ ] Related terms linked
- [ ] Modal closes correctly (X button, outside click)

---

## 9️⃣ CROSS-TAB CONSISTENCY

### Compare with Other Tabs

#### Overview Tab
- [ ] Card layouts similar (4-card grids)
- [ ] Metric highlighting consistent (emerald/blue)
- [ ] Help tooltip style matches

#### Economy Tab
- [ ] Color scheme consistent
- [ ] Section headers similar
- [ ] Responsive breakpoints aligned

#### Sectors Tab
- [ ] Card hover states similar (border color change)
- [ ] Icon usage consistent (lucide-react)
- [ ] Background gradients similar

---

## 🔟 PERFORMANCE & ACCESSIBILITY

### Performance
- [ ] Initial load time < 2s
- [ ] No console errors
- [ ] No React hydration warnings
- [ ] Smooth scrolling within tab
- [ ] Hover transitions smooth (300ms)

### Accessibility
- [ ] All buttons keyboard-accessible (Tab navigation)
- [ ] Help tooltips keyboard-accessible (Enter to open)
- [ ] Heading hierarchy correct (h2 → h3 → h4)
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Focus states visible on interactive elements

---

## ✅ SIGN-OFF

**Tester Name**: _________________  
**Date**: _________________  
**Environment**: Development / Staging / Production  

**Overall Assessment**:
- [ ] **Visual Design**: Bloomberg-grade quality ✅
- [ ] **Metric Highlighting**: Emerald/Blue correctly applied ✅
- [ ] **Responsive Design**: Mobile → Desktop functional ✅
- [ ] **Entitlement Gating**: Business+ correctly enforced ✅
- [ ] **Help Tooltips**: 6 knowledge base entries functional ✅
- [ ] **Performance**: Load time < 2s, no errors ✅

**Issues Found**: (List any bugs, visual glitches, or inconsistencies)
1. _________________
2. _________________
3. _________________

**Recommendations**: (Suggest improvements or enhancements)
1. _________________
2. _________________
3. _________________

---

**Status**: ⬜ Passed / ⬜ Failed / ⬜ Passed with Minor Issues

**Next Steps**: Risk Tab Implementation
