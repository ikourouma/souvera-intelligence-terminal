# Opportunity Tab - Design Pattern Reference

**Date**: May 14, 2026  
**Purpose**: Visual design reference for future tab implementations

---

## 🎨 ESTABLISHED DESIGN PATTERNS

This document captures the Bloomberg-grade design patterns used in the **Opportunity Tab** that should be replicated in future tabs (Risk, Trade, Reports).

---

## 1️⃣ COLOR PALETTE (Consistent Across All Tabs)

### Metric Highlighting
```css
/* Dollar Amounts */
text-emerald-400 font-semibold
Examples: $575B, $40B, $10B, $15B, $2B

/* Large Numbers (Volume/Scale) */
text-blue-300 font-semibold
Examples: 60M tons, 45M students, 350M people, 1.3B, 20M, 25GW, 200K+

/* Percentages & Growth Rates */
text-blue-400 font-semibold
Examples: 60%, 70%, 95%, 3.5%/year

/* Key Terms / Company Names */
text-white font-medium
Examples: Dangote, BUA, Series B-C, ECOWAS, AGOA
```

### Background & Borders
```css
/* Card Backgrounds */
bg-gradient-to-br from-zinc-900/90 to-zinc-800/50

/* Borders (Default) */
border border-zinc-700/50

/* Borders (Hover) */
border-blue-500/30    /* Technology theme */
border-emerald-500/30 /* Growth/Opportunity theme */
border-amber-500/30   /* Infrastructure/Warning theme */

/* Hero Section Backgrounds */
bg-gradient-to-br from-blue-900/20 to-emerald-900/20
border border-blue-500/20
```

### Text Hierarchy
```css
/* Headings */
text-2xl font-bold text-white       /* Main tab heading */
text-xl font-bold text-white        /* Section heading */
text-lg font-bold text-white        /* Card heading */
text-base font-semibold text-white  /* Subsection heading */

/* Body Text */
text-base text-zinc-300     /* Primary narrative */
text-sm text-zinc-300       /* Card content */
text-xs text-zinc-400       /* Labels */
text-xs text-zinc-500       /* Supporting text */
```

---

## 2️⃣ CARD LAYOUT PATTERNS

### Pattern A: Pillar Cards (3-Column Desktop)
**Use Case**: Multi-pillar frameworks (e.g., 3 investment pillars, 3 risk categories)

```html
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Card 1 */}
  <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300">
    {/* Icon + Heading */}
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-white">Pillar Title</h4>
        <p className="text-sm text-emerald-400 font-semibold">Badge Text</p>
      </div>
    </div>
    
    {/* Narrative */}
    <p className="text-sm text-zinc-300 mb-4">
      Paragraph with <span className="text-emerald-400 font-semibold">$40B</span> highlighted metrics
    </p>
    
    {/* Sub-section Box */}
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Section Label</p>
      <ul className="space-y-2 text-sm text-zinc-300">
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          <span>Bullet point content</span>
        </li>
      </ul>
    </div>
  </div>
</div>
```

**Responsive Behavior**:
- Mobile: 1 column (stacked)
- Desktop (`lg:`): 3 columns

**Examples**:
- Opportunity Tab: Technology, Agriculture, Infrastructure pillars
- Risk Tab (future): Macro, Political, Operational risks

---

### Pattern B: Grid Cards (2-Column, 4-Card)
**Use Case**: Entry points, strategies, mitigation tactics

```html
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Card 1 */}
  <div className="bg-zinc-800/50 rounded-lg p-5 hover:bg-zinc-800/70 transition-colors">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <div>
        <h4 className="text-base font-semibold text-white mb-2">Card Title</h4>
        <p className="text-sm text-zinc-300">
          Description with <span className="text-white font-medium">key terms</span> highlighted
        </p>
      </div>
    </div>
  </div>
</div>
```

**Responsive Behavior**:
- Mobile: 1 column
- Tablet (`md:`): 2 columns

**Examples**:
- Opportunity Tab: Investment Entry Points (4 cards)
- Risk Tab (future): Risk Mitigation Strategies (4 cards)

---

### Pattern C: Stat Cards (4-Column)
**Use Case**: Key statistics, market access metrics

```html
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Stat Card */}
  <div className="bg-zinc-800/50 rounded-lg p-5 text-center hover:bg-zinc-800/70 transition-colors">
    <Icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
    <div className="text-2xl font-bold text-blue-300 mb-1">350M</div>
    <div className="text-sm text-zinc-400 mb-2">Label Text</div>
    <p className="text-xs text-zinc-500">Supporting description</p>
  </div>
</div>
```

**Responsive Behavior**:
- Mobile: 1 column
- Tablet (`md:`): 2 columns
- Desktop (`lg:`): 4 columns

**Examples**:
- Opportunity Tab: Regional Advantages (ECOWAS, AfCFTA, AGOA, Workforce)
- Overview Tab: Country Snapshot, Key Sectors, Economic Momentum

---

## 3️⃣ SECTION HEADER PATTERN

**Standard Format** (used across all tabs):
```html
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
      <Icon className="w-5 h-5 text-blue-400" />
    </div>
    <h3 className="text-xl font-bold text-white">Section Heading</h3>
  </div>
  <HelpTooltip contentKey="knowledge_base_key" />
</div>
```

**Icon Colors by Theme**:
- **Technology/Information**: `text-blue-400`
- **Growth/Opportunity**: `text-emerald-400`
- **Infrastructure/Strategy**: `text-amber-400`
- **Risk/Warning**: `text-red-400`
- **Trade/Global**: `text-cyan-400`

---

## 4️⃣ HERO SECTION PATTERN

**Used at top of each tab**:
```html
<div className="bg-gradient-to-br from-blue-900/20 to-emerald-900/20 border border-blue-500/20 rounded-xl p-6 lg:p-8">
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">Tab Title</h2>
        <p className="text-sm text-zinc-400">Subtitle or tagline</p>
      </div>
    </div>
    <HelpTooltip contentKey="tab_overview" />
  </div>
  
  <div className="prose prose-invert max-w-none">
    <p className="text-base text-zinc-300 leading-relaxed">
      Narrative with <span className="text-emerald-400 font-semibold">$575B</span> highlighted metrics
    </p>
  </div>
</div>
```

**Examples**:
- Opportunity Tab: "Investment Opportunity" hero
- Risk Tab (future): "Risk Landscape" hero

---

## 5️⃣ BOTTOM CTA PATTERN

**Used at bottom of Business+ tabs**:
```html
<div className="bg-gradient-to-br from-blue-900/30 to-emerald-900/30 border border-blue-500/30 rounded-xl p-6 text-center">
  <h4 className="text-lg font-bold text-white mb-2">CTA Heading</h4>
  <p className="text-sm text-zinc-300 mb-4">Supporting text for the call-to-action</p>
  <div className="flex flex-wrap items-center justify-center gap-3">
    <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
      Primary Action
    </button>
    <button className="px-6 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-semibold transition-colors">
      Secondary Action
    </button>
  </div>
</div>
```

**Examples**:
- Opportunity Tab: "Schedule Consultation" + "Download Investment Brief"
- Risk Tab (future): "Request Risk Assessment" + "Download Risk Report"

---

## 6️⃣ ICON USAGE GUIDELINES

**Icons from `lucide-react`**:

### Tab-Level Icons
- **Opportunity**: `TrendingUp` (emerald-400)
- **Risk**: `AlertTriangle` (red-400)
- **Trade**: `Ship` (cyan-400)
- **Reports**: `FileText` (blue-400)

### Pillar/Section Icons
- **Technology**: `Zap` (blue-400)
- **Agriculture**: `TrendingUp` (emerald-400)
- **Infrastructure**: `Building2` (amber-400)
- **Finance**: `DollarSign` (blue-400)
- **Market Access**: `Globe` (emerald-400)
- **Partnerships**: `Building2` (blue-400)
- **Strategy**: `Briefcase` (amber-400)
- **Security**: `Shield` (blue-400)
- **Workforce**: `Users` (emerald-400)

---

## 7️⃣ RESPONSIVE GRID BREAKPOINTS

**Standard Breakpoints** (used across all tabs):

```css
/* Mobile-first approach */
grid-cols-1                    /* Default (mobile) */
md:grid-cols-2                 /* Tablet (768px+) */
lg:grid-cols-3 or lg:grid-cols-4  /* Desktop (1024px+) */
```

**Common Patterns**:
- **3-Column Layout**: `grid-cols-1 lg:grid-cols-3` (Pillar cards)
- **4-Column Layout**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (Stat cards)
- **2-Column Layout**: `grid-cols-1 md:grid-cols-2` (Entry points)

**Padding Adjustments**:
```css
p-6              /* Default (mobile/tablet) */
lg:p-8           /* Desktop (1024px+) */
```

---

## 8️⃣ TRANSITION & ANIMATION

**Hover States** (consistent across all interactive elements):
```css
/* Card Hover */
hover:border-blue-500/30 transition-all duration-300

/* Button Hover */
hover:bg-blue-700 transition-colors

/* Background Hover */
hover:bg-zinc-800/70 transition-colors
```

**Key Principles**:
- Use `transition-all` for border changes (smooth color + opacity)
- Use `transition-colors` for background/text changes
- Duration: 300ms (standard for cards), instant for buttons

---

## 9️⃣ ENTITLEMENT GATING PATTERN

**Upgrade Prompt** (for locked tabs):
```html
<div className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border border-zinc-700/50 rounded-lg p-8 text-center">
  <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
  <h3 className="text-xl font-bold text-white mb-3">Business+ Feature</h3>
  <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
    Unlock in-depth [tab-specific value proposition].
  </p>
  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
    Upgrade to Business
  </button>
</div>
```

**Entitlement Check**:
```typescript
const hasBusinessAccess = userEntitlements.includes('business') || userEntitlements.includes('admin');

if (!hasBusinessAccess) {
  return <UpgradePrompt />;
}
```

---

## 🔟 KNOWLEDGE BASE PATTERN

**HelpTooltip Integration**:
```typescript
<HelpTooltip contentKey="opportunity_overview" />
```

**Knowledge Base Entry Structure**:
```typescript
{
  termKey: 'opportunity_overview',
  termLabel: 'Investment Opportunity Overview',
  category: 'opportunity',
  tooltipShort: 'One-sentence summary (50-80 chars)',
  modal: {
    title: 'Modal Title',
    summary: 'Executive summary paragraph',
    sections: [
      {
        heading: 'Section 1',
        content: 'Context paragraph',
        list: ['Bullet 1', 'Bullet 2', 'Bullet 3'],
      },
    ],
    dataSources: ['Source 1', 'Source 2'],
  },
  relatedTerms: ['related_term_1', 'related_term_2'],
  tags: ['tag1', 'tag2', 'tag3'],
}
```

**Tooltip Density**:
- **Hero Section**: 1 tooltip (overview)
- **Pillar Cards**: 1 tooltip per card (3 total)
- **Major Sections**: 1 tooltip per section (2-3 total)
- **Total per tab**: 6-8 tooltips

---

## ✅ REPLICATION CHECKLIST (For Future Tabs)

When building **Risk**, **Trade**, or **Reports** tabs, ensure:

- [ ] **Color Palette**: Emerald/Blue highlighting applied
- [ ] **Card Layouts**: Use established patterns (Pillar, Grid, Stat)
- [ ] **Section Headers**: Icon + Heading + HelpTooltip
- [ ] **Hero Section**: Gradient background, icon, narrative
- [ ] **Bottom CTA**: 2 buttons, centered, responsive
- [ ] **Icons**: lucide-react, color-coded by theme
- [ ] **Responsive Grid**: Mobile (1 col) → Tablet (2 col) → Desktop (3-4 col)
- [ ] **Hover States**: 300ms transitions, border color changes
- [ ] **Entitlement Gating**: Upgrade prompt for locked content
- [ ] **Knowledge Base**: 6-8 comprehensive entries per tab

---

## 📊 TAB COMPARISON (Design Consistency)

| Element | Overview | Economy | Sectors | Opportunity | Risk (Future) |
|---------|----------|---------|---------|-------------|---------------|
| **Hero Section** | ✅ Gradient bg | ✅ Narrative | ✅ Sector thesis | ✅ Investment thesis | TBD |
| **Card Layouts** | ✅ 4+4+4 cards | ✅ Table + charts | ✅ 5 accordions | ✅ 3 pillars + 4 entry + 4 regional | TBD |
| **Highlighting** | ✅ Emerald/Blue | ✅ Emerald/Blue/Red | ✅ HTML seed data | ✅ Emerald/Blue | TBD |
| **Help Tooltips** | ✅ 10+ entries | ✅ 5+ entries | ✅ 3 scores | ✅ 6 entries | TBD |
| **Entitlement** | ✅ Free (all tiers) | ✅ Free (all tiers) | ✅ Free (all tiers) | ✅ Business+ | TBD |
| **Bottom CTA** | ❌ N/A (free) | ❌ N/A (free) | ❌ N/A (free) | ✅ Consultation + Brief | TBD |

---

## 🚀 NEXT TAB: RISK

**Recommended Structure** (following Opportunity Tab patterns):
1. **Hero Section**: Risk landscape overview
2. **3 Risk Categories** (Pillar Pattern):
   - Macro Risks (Currency, Inflation, Debt)
   - Political Risks (Governance, Security, Corruption)
   - Operational Risks (Power, Logistics, Talent)
3. **Risk Mitigation Strategies** (Grid Pattern, 4 cards):
   - Local Partnerships
   - Insurance Products
   - Revenue Diversification
   - Phased Capital Deployment
4. **Risk Scorecard** (Table or Visual Matrix)
5. **Bottom CTA**: "Request Risk Assessment" + "Download Risk Report"

**Data Source**: `seed-nigeria-overview.ts` → `risk_narrative_md`

---

**Document Created**: May 14, 2026  
**Purpose**: Design system reference for Nigeria template completion  
**Status**: Active (Opportunity Tab complete, Risk/Trade/Reports pending)
