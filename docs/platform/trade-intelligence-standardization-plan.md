# Trade Intelligence Drawer Standardization & Module Expansion Plan

**Created**: June 11, 2026  
**Updated**: June 11, 2026  
**Status**: Phase 0.5C Complete — Ready for 0.5D  
**Owner**: Souvera Platform Team

---

## Executive Summary

This plan outlines the standardization of all drawer components across Trade Policy Intelligence modules and the expansion to Caribbean and AfCFTA-specific intelligence views. The goal is to create a consistent, presentation-ready export experience where every data section can be downloaded as a branded PNG file.

---

## Current State Assessment

| Module | Drawer Status | Exportable Sections | Number Highlighting |
|--------|---------------|---------------------|---------------------|
| **African Demand Intelligence** | ✅ Enhanced | ✅ Full | ✅ Yes |
| **Caribbean Demand Intelligence** | ✅ Complete | ✅ Full | ✅ Yes |
| **AGOA Product Finder** | ✅ Enhanced | ✅ Full (5 sections) | ✅ Yes |
| **AGOA Eligibility Tracker** | ✅ Enhanced | ✅ Full (4 sections) | ✅ Yes |
| **AfCFTA Status Tracker** | ✅ Enhanced | ✅ Full (4 sections) | ✅ Yes |

---

## Phase 0.5B — Drawer Standardization

**Timeline**: Immediate  
**Priority**: High

### Task 0.5B-1: Extract Shared ExportableSection Component ✅
- [x] Extract `ExportableSection` from `DemandSignalMatrix.tsx`
- [x] Create `src/components/intelligence/ExportableSection.tsx`
- [x] Export `HighlightedText` utility for number highlighting
- [x] Make fully reusable with configurable props
- [x] Create index.ts for easy imports

### Task 0.5B-2: AGOA Product Finder Drawer Enhancement ✅
- [x] Import shared `HighlightedText` component
- [x] Create `ExportableProductSection` component in drawer
- [x] Wrap "Strategic Argument" section — downloadable with Souvera analysis
- [x] Wrap "Trade Flow" section (top trading countries) — downloadable with Souvera analysis
- [x] Wrap "Cliff Risk" section — downloadable with Souvera analysis
- [x] Wrap "Framework Coverage" section — downloadable with Souvera analysis
- [x] Wrap "Souvera Dia Analysis" section — downloadable
- [x] Add number highlighting to all narratives
- [x] Fix product name cutoff — improved header layout with full name display
- [x] Add Souvera analysis block to each exportable section

**PNG Header Format**:
```
┌─────────────────────────────────────────────────────────────┐
│  📦 HS 610910  |  Cotton T-shirts                  SOUVERA │
│  AGOA Product Analysis · 2026                              │
│  ▌ Strategic Argument                                      │
└─────────────────────────────────────────────────────────────┘
```

### Task 0.5B-3: AGOA Eligibility Tracker — Add Country Drawer ✅
- [x] Create `AGOACountryDrawer` component
- [x] Show AGOA status overview (downloadable)
- [x] Display eligibility since date and suspension info
- [x] Show apparel provision (AGOA IV) details with Souvera analysis
- [x] Add reauthorization impact section with countdown
- [x] Include related policy notes and USTR sources

### Task 0.5B-4: AfCFTA Status Tracker — Add Country Drawer ✅
- [x] Create `AfCFTACountryDrawer` component
- [x] Show AfCFTA implementation status (downloadable)
- [x] Display ratification timeline (signed, ratified, deposited, trading)
- [x] Show negotiations progress (tariff/services offers status)
- [x] Add market opportunity section with continental access info
- [x] Include Souvera analysis for each section

---

## Phase 0.5C — Caribbean Demand Intelligence

**Timeline**: After 0.5B completion  
**Priority**: High

### New Module: Caribbean Import Demand Intelligence

**URL**: `/intelligence/trade/demand-caribbean`

**Markets Covered** (20 total):
- Tier 1 (existing): Jamaica, Trinidad & Tobago, Bahamas, Barbados
- Tier 2 (expand): Guyana, Suriname, Haiti, Dominican Republic, Belize
- Tier 3 (complete): Grenada, St. Lucia, St. Vincent, Antigua, St. Kitts, Dominica

**Product Categories**: Same 10 categories as African Demand Intelligence
1. Agricultural & Mining Machinery
2. Grains & Cereals
3. Fertilizers & Agri-inputs
4. Pharmaceuticals
5. Cotton & Raw Textiles
6. Transport & Commercial Vehicles
7. Intermediate Industrial Goods
8. Textile Inputs
9. ICT & Telecommunications
10. Medical Devices & Diagnostics

**Framework Context**: CBTPA (Caribbean Basin Trade Partnership Act) instead of AGOA

**Data Sources**: ITC TDM, UN Comtrade, USITC, Caribbean Community (CARICOM)

### Database Requirements
```sql
-- Use existing souvera_import_demand_signals table
-- Expand records for Caribbean markets (JAM, TTO, BHS, BRB already exist)
-- Add: GUY, SUR, HTI, DOM, BLZ, GRD, LCA, VCT, ATG, KNA, DMA
```

---

## Phase 0.5D — AfCFTA Import-Export Intelligence

**Timeline**: After 0.5C completion  
**Priority**: Medium-High

### New Module: AfCFTA Trade Intelligence

**URL**: `/intelligence/trade/afcfta/flows`

**UI Design**:
```
┌───────────────────────────────────────────────────────────────┐
│  AfCFTA Trade Intelligence                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐            │
│  │ ● Import Intelligence│  │ Export Intelligence │            │
│  └─────────────────────┘  └─────────────────────┘            │
│                                                               │
│  [Category cards with country data — same drawer pattern]     │
└───────────────────────────────────────────────────────────────┘
```

### Import Intelligence View (Default)
- What African countries import FROM THE WORLD
- US/EU/China supplier competition analysis
- Opportunity sizing for US exporters under AfCFTA context

### Export Intelligence View (Toggle)
- What African countries export TO THE WORLD
- Intra-Africa trade flows under AfCFTA
- Regional supply chain opportunities

### Key Differentiators
- Focus on **intra-Africa** trade (AfCFTA mandate)
- Show **tariff reduction schedules** per product category
- Highlight **Rules of Origin** compliance status
- Display **preference margins** (AfCFTA rate vs MFN rate)

### Database Schema Extension
```sql
CREATE TABLE souvera_afcfta_trade_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exporter_country_id UUID REFERENCES souvera_countries(id),
  importer_country_id UUID REFERENCES souvera_countries(id),
  year INTEGER NOT NULL,
  hs_chapter VARCHAR(4),
  category_group VARCHAR(50),
  category_label VARCHAR(100),
  trade_value_usd BIGINT,
  afcfta_tariff_pct DECIMAL(5,2),
  mfn_tariff_pct DECIMAL(5,2),
  preference_margin_pct DECIMAL(5,2),
  roo_compliant BOOLEAN,
  top_products JSONB,
  yoy_growth_pct DECIMAL(5,2),
  source_id UUID REFERENCES souvera_data_sources(id),
  source_notes TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exporter_country_id, importer_country_id, year, hs_chapter)
);
```

---

## Implementation Sequence

```
Phase 0.5B — Drawer Standardization ✅ COMPLETE
├── ✅ Task 0.5B-1: Extract ExportableSection
├── ✅ Task 0.5B-2: Update AGOA Product Finder drawer (with Souvera analysis)
├── ✅ Task 0.5B-3: Add AGOA Eligibility country drawer
└── ✅ Task 0.5B-4: Add AfCFTA Status country drawer

Phase 0.5C — Caribbean Demand Intelligence ✅ COMPLETE (v3)
├── ✅ Create CaribbeanDemandMatrix component (full parity with African page)
├── ✅ Header with back button, icon badge, description, data vintage
├── ✅ 4 Summary KPI cards (US exports, potential, gap, markets)
├── ✅ Strategic context banner (CBTPA reciprocal opportunity)
├── ✅ CategoryCard with full data tables (8 columns)
├── ✅ Enhanced filters (search, category, region)
├── ✅ Coverage info banner (updated for 9-market coverage)
├── ✅ Country drawer with exportable sections
├── ✅ Footer attribution and navigation
├── ✅ Wire to Trade Hub navigation
├── ✅ Fix ISO3-to-ISO2 flag rendering (JAM→JM, BHS→BS, etc.)
└── ✅ Add Tier 2 Caribbean data (DOM, HTI, GUY, SUR, BLZ) - 5+ countries per category

Phase 0.5D — AfCFTA Import-Export Intelligence ✅ COMPLETE
├── ✅ Create database migration for afcfta_trade_flows
│   └── infra/supabase/migrations/create-afcfta-trade-flows-table.sql
├── ✅ Build AfCFTATradeIntelligence component with Import/Export toggle
│   └── src/app/intelligence/trade/afcfta/flows/AfCFTATradeIntelligence.tsx
│   └── Features: Direction toggle, category accordion tables, country drawer
│   └── Summary KPIs: intra-Africa trade, total trade, share %, markets covered
│   └── Strategic context banner explaining AfCFTA integration goals
├── ✅ Create API endpoint for AfCFTA flows
│   └── src/app/api/v1/trade/afcfta/flows/route.ts
├── ✅ Create ingestion script for intra-Africa flows
│   └── services/ingestion/ingest-afcfta-flows.ts
│   └── 12 major trading hubs × 8 categories × 2 directions = 192 records
│   └── Includes: preference margins, RoO compliance, YoY growth, top partners
├── ✅ Add tariff schedule and RoO data
│   └── AfCFTA tariff rates, MFN rates, preference margin calculations
│   └── Rules of Origin compliance flags per category
├── ✅ Connect to AfCFTA Status Tracker
│   └── Navigation link in drawer and footer
├── ✅ Wire to Trade Hub navigation
│   └── New module card with Repeat icon and Phase 0.5D badge
└── ✅ Add npm script for ingestion
    └── npm run ingest:afcfta-flows

Phase 1.0 — Live Data Integration
├── ⏳ ITC Trade Data Monitor API integration
├── ⏳ UN Comtrade bulk data pipeline
├── ⏳ Automated refresh schedules
└── ⏳ Data quality monitoring
```

---

## Shared Components Created

### ExportableSection
**Location**: `src/components/intelligence/ExportableSection.tsx`

**Props**:
```typescript
interface ExportableSectionProps {
  id: string;
  title: string;
  headerContext: {
    primaryLabel: string;      // e.g., "South Africa" or "HS 610910"
    primaryCode?: string;      // e.g., "ZAF" or code
    subtitle: string;          // e.g., "US export demand profile · 2023"
    category?: string;         // e.g., "ICT & Telecommunications"
  };
  sourceNotes: string;
  fileName: string;
  isHighlighted?: boolean;
  children: React.ReactNode;
}
```

### HighlightedText
**Location**: `src/components/intelligence/HighlightedText.tsx`

Highlights currency values and percentages in narrative text:
- `$620M`, `$1.33B/yr` → emerald color
- `16.3%`, `35%` → blue color

---

## Success Metrics

1. **Consistency**: All Trade Intelligence drawers use ExportableSection
2. **Export Coverage**: Every data section downloadable as branded PNG
3. **Number Highlighting**: All narratives highlight key figures
4. **Source Attribution**: Every export includes data sources
5. **User Feedback**: Positive feedback on presentation-ready exports

---

## Dependencies

- `modern-screenshot` package (already installed)
- `@/lib/intelligence/export-png.ts` utility
- `@/lib/intelligence/export-branding.ts` branding config

---

## Notes

- Caribbean Demand Intelligence reuses the same `ExportableSection` pattern ✓
- AfCFTA module introduces the first **toggle** pattern in Trade Intelligence ✓
- All modules are now ready for live data ingestion in Phase 1.0
- AfCFTA Import-Export Intelligence completes Phase 0.5 AGOA Reauthorization Intelligence Pack

## Phase 0.5 Summary (Complete)

| Module | URL | Status | Key Feature |
|--------|-----|--------|-------------|
| African Demand Intelligence | `/intelligence/trade/demand` | ✅ Live | US export opportunity sizing |
| Caribbean Demand Intelligence | `/intelligence/trade/demand-caribbean` | ✅ Live | CBTPA reciprocal opportunity |
| AfCFTA Import-Export Intelligence | `/intelligence/trade/afcfta/flows` | ✅ Live | Import/Export toggle, intra-Africa flows |
| AGOA Product Finder | `/intelligence/trade/agoa/products` | ✅ Enhanced | Product-level drawer with analysis |
| AGOA Eligibility Tracker | `/intelligence/trade/agoa` | ✅ Enhanced | Country drawer with trade volume |
| AfCFTA Status Tracker | `/intelligence/trade/afcfta` | ✅ Enhanced | 54-country coverage, trade partners |

**Next**: Phase 1.0 — Live Data Integration (ITC Trade Data Monitor, UN Comtrade API)
