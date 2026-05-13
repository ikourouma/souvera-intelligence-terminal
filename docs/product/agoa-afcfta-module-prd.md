# AGOA + AfCFTA Trade Intelligence Module
## Product Requirements Document (PRD)

**Document Type:** Product Requirements Document  
**Classification:** Internal Product — Executive Review  
**Date:** 2026-05-06  
**Version:** 1.0 Draft  
**Owner:** Afronovation Product Team  
**Status:** Draft for Review

---

## 1. Executive Summary

### 1.1 Purpose

This PRD defines the requirements for an AGOA + AfCFTA Trade Intelligence Module within the Souvera Intelligence Terminal. The module will provide structured intelligence for U.S.–Africa trade governance, policy analysis, and supply-demand matching.

### 1.2 Opportunity

With AGOA temporarily reauthorized through December 31, 2026 and active USTR modernization consultations, there is immediate demand for an evidence platform serving:
- Trade policy analysts preparing AGOA modernization submissions
- Corporate procurement officers seeking supply chain diversification
- African trade ministries attracting investment
- Development finance institutions identifying trade-related investments

### 1.3 MVP Scope

**Phase 4B MVP (4-6 weeks):**
- AGOA eligibility tracker
- AfCFTA status tracker
- Basic supply-demand view (country-sector matrix)
- Admin source registry
- Admin indicator builder
- Data freshness badges

**Phase 4C Full Module (6-8 weeks):**
- Product-level HS code intelligence
- Product opportunity finder
- Full supply-demand matrix
- Trade report builder
- U.S. trade data integration

---

## 2. Personas

### 2.1 Primary Personas

#### Persona 1: Trade Policy Analyst (Alexandra)

**Organization:** U.S. Chamber of Commerce Africa Business Center  
**Role:** Senior Policy Analyst  
**Experience:** 8 years in trade policy  

**Goals:**
- Prepare evidence-based submissions for AGOA modernization process
- Monitor eligibility changes affecting member companies
- Generate policy briefs for congressional briefings
- Identify trade opportunities for member advocacy

**Pain Points:**
- Data scattered across USTR, Census Bureau, ITC, World Bank
- No integrated country-sector-product view
- Manual report compilation is time-consuming
- Difficulty tracking eligibility changes across 49 countries

**Success Criteria:**
- Reduce report preparation time by 50%
- Single platform for trade intelligence
- Automated eligibility alerts
- Citation-ready data exports

---

#### Persona 2: Corporate Trade Compliance Officer (Michael)

**Organization:** Fortune 500 Consumer Goods Company  
**Role:** Director of Trade Compliance  
**Experience:** 12 years in trade compliance  

**Goals:**
- Ensure AGOA eligibility compliance for African suppliers
- Identify alternative supply sources for diversification
- Monitor tariff treatment changes
- Support procurement decisions with trade intelligence

**Pain Points:**
- Supplier eligibility monitoring is manual
- No early warning for eligibility changes
- Difficulty comparing countries for sourcing decisions
- Compliance documentation is fragmented

**Success Criteria:**
- Automated eligibility monitoring
- Country-product comparison tools
- Compliance documentation support
- Supply chain risk indicators

---

#### Persona 3: African Trade Ministry Official (Amina)

**Organization:** Ministry of Trade and Industry (Ghana)  
**Role:** Director of Export Promotion  
**Experience:** 15 years in trade policy  

**Goals:**
- Attract U.S. investment in priority sectors
- Maintain and enhance AGOA eligibility
- Identify product opportunities in U.S. market
- Prepare for AfCFTA implementation

**Pain Points:**
- Limited access to U.S. market intelligence
- Difficulty positioning country competitively
- No systematic view of sector opportunities
- Fragmented data for investor presentations

**Success Criteria:**
- Clear competitive positioning
- Sector opportunity identification
- Investment-ready intelligence
- AfCFTA alignment visibility

---

#### Persona 4: DFI Investment Officer (David)

**Organization:** U.S. International Development Finance Corporation (DFC)  
**Role:** Investment Officer, Africa Region  
**Experience:** 10 years in development finance  

**Goals:**
- Identify trade-enabling infrastructure investments
- Assess trade potential of investment targets
- Monitor policy environment for portfolio
- Support U.S. trade policy objectives

**Pain Points:**
- Trade potential assessment is qualitative
- No systematic supply-demand matching
- Policy monitoring is fragmented
- Difficulty connecting infrastructure to trade outcomes

**Success Criteria:**
- Trade potential scoring for investments
- Supply-demand opportunity identification
- Policy environment monitoring
- Investment pipeline intelligence

---

### 2.2 Secondary Personas

#### Persona 5: Academic Researcher

**Goals:** Access structured trade data for research  
**Souvera Value:** Data export, methodology documentation

#### Persona 6: Trade Journalist

**Goals:** Monitor trade policy developments  
**Souvera Value:** News alerts, policy tracking

#### Persona 7: Law Firm Trade Practice Partner

**Goals:** Advise clients on trade compliance and opportunities  
**Souvera Value:** Legal-grade data, compliance intelligence

---

## 3. User Journeys

### 3.1 Journey: AGOA Modernization Comment Preparation

**Persona:** Alexandra (Trade Policy Analyst)  
**Goal:** Prepare comprehensive USTR modernization comment by May 15, 2026 deadline

**Steps:**

| Step | User Action | System Response | Success Criteria |
|------|-------------|-----------------|------------------|
| 1 | Navigate to AGOA Dashboard | Display eligibility overview map and country list | Page loads in <2s |
| 2 | Filter by "Top 10 U.S. Import Sources" | List updates to show top 10 AGOA exporters | Filter applies in <1s |
| 3 | Select country (Kenya) | Display country trade profile | Profile loads in <2s |
| 4 | View sector performance | Show 7-sector breakdown with export indicators | Sectors display correctly |
| 5 | Drill into "Agriculture" sector | Show agricultural product opportunities | Product list displays |
| 6 | Generate trade profile report | Create PDF with citations | PDF generates in <30s |
| 7 | Export data for submission | Download Excel with source attribution | Excel downloads |
| 8 | Check data freshness | Show last updated dates for all indicators | Freshness badges visible |

**Success Metrics:**
- Complete workflow in <30 minutes (vs. 4+ hours manually)
- Report includes 10+ data points with citations
- All data includes source attribution

---

### 3.2 Journey: Supply Chain Diversification Assessment

**Persona:** Michael (Trade Compliance Officer)  
**Goal:** Identify alternative AGOA-eligible suppliers for textile components

**Steps:**

| Step | User Action | System Response | Success Criteria |
|------|-------------|-----------------|------------------|
| 1 | Navigate to Product Finder | Display HS code search interface | Interface loads |
| 2 | Search "textile" or enter HS 52-54 | Show matching product categories | Results display |
| 3 | Filter by "AGOA-eligible countries" | List updates to AGOA countries only | Filter applies |
| 4 | Sort by "Opportunity Score" | Countries ranked by score | Sorting works |
| 5 | Compare top 3 countries | Side-by-side comparison view | Comparison displays |
| 6 | View country risk indicators | Show governance, logistics, compliance scores | Indicators visible |
| 7 | Check eligibility stability | Show eligibility history and risk assessment | History displays |
| 8 | Export comparison report | Generate PDF/Excel comparison | Export completes |

**Success Metrics:**
- Identify 5+ potential supplier countries
- Compare across 10+ indicators
- Complete assessment in <45 minutes

---

### 3.3 Journey: Investment Opportunity Identification

**Persona:** David (DFI Investment Officer)  
**Goal:** Identify countries with trade-enabling infrastructure gaps

**Steps:**

| Step | User Action | System Response | Success Criteria |
|------|-------------|-----------------|------------------|
| 1 | Navigate to Supply-Demand Matrix | Display country-sector-product matrix | Matrix loads |
| 2 | Filter by "High Demand, Low Supply" | Highlight gap opportunities | Filters apply |
| 3 | Filter by "AGOA-eligible" | Further filter to eligible countries | Filter applies |
| 4 | Select infrastructure sector | Show logistics/energy infrastructure needs | Sector displays |
| 5 | View country detail (Zambia) | Show infrastructure gaps and trade potential | Detail displays |
| 6 | View investment pipeline | Show DFI/infrastructure projects | Pipeline displays |
| 7 | Generate investment memo | Create investment-oriented report | Report generates |
| 8 | Export to portfolio tracking | Download structured data | Export completes |

**Success Metrics:**
- Identify 10+ investment opportunities
- Connect infrastructure to trade outcomes
- Complete assessment in <1 hour

---

### 3.4 Journey: AfCFTA Implementation Tracking

**Persona:** Amina (Trade Ministry Official)  
**Goal:** Monitor Ghana's AfCFTA implementation progress and positioning

**Steps:**

| Step | User Action | System Response | Success Criteria |
|------|-------------|-----------------|------------------|
| 1 | Navigate to AfCFTA Dashboard | Display implementation status map | Map loads |
| 2 | Select Ghana | Show Ghana's AfCFTA status detail | Detail displays |
| 3 | View tariff commitments | Show tariff reduction schedule | Schedule displays |
| 4 | View regional comparison | Compare to West African peers | Comparison shows |
| 5 | View value chain opportunities | Show regional integration opportunities | Opportunities list |
| 6 | Generate positioning report | Create report for investors | Report generates |

---

## 4. Module Architecture

### 4.1 Module Overview

```
┌─────────────────────────────────────────────────────────────┐
│              AGOA + AfCFTA TRADE MODULE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INTELLIGENCE LAYERS:                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │ Country      │ │ Sector       │ │ Product (HS Code)    ││
│  │ Intelligence │ │ Intelligence │ │ Intelligence         ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
│                                                             │
│  POLICY TRACKERS:                                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │ AGOA         │ │ AfCFTA       │ │ Market Access        ││
│  │ Eligibility  │ │ Status       │ │ Barriers             ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
│                                                             │
│  ANALYSIS TOOLS:                                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │ Supply-Demand│ │ Product      │ │ Report               ││
│  │ Matrix       │ │ Finder       │ │ Builder              ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
│                                                             │
│  ADMIN TOOLS:                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │ Source       │ │ Indicator    │ │ Data Quality         ││
│  │ Registry     │ │ Builder      │ │ Dashboard            ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Feature Modules

#### Module 1: AGOA Eligibility Tracker

**Purpose:** Track and display AGOA eligibility status for sub-Saharan African countries

**Features:**
- Eligibility status map (eligible, suspended, graduated, never eligible)
- Country eligibility detail (current status, history, criteria assessment)
- Eligibility change alerts
- Product eligibility lookup (AGOA-specific vs. GSP)
- Comparison across countries

**Data Requirements:**
- Country eligibility status (49 sub-Saharan countries)
- Eligibility criteria indicators
- Historical eligibility changes
- AGOA product list (1,800+ HS codes)

---

#### Module 2: AfCFTA Status Tracker

**Purpose:** Track AfCFTA implementation status and commitments

**Features:**
- Ratification status map (signed, ratified, trading)
- Country implementation detail
- Tariff commitment tracker
- Rules of origin status
- Regional economic community integration

**Data Requirements:**
- Ratification status (54 African countries)
- Tariff schedule commitments
- Implementation milestones
- REC membership data

---

#### Module 3: Supply-Demand Matrix

**Purpose:** Match African supply capacity with U.S. market demand

**Features:**
- Interactive matrix (countries × sectors or products)
- Opportunity scoring (0-100)
- Gap analysis visualization
- Filters (eligibility, region, risk level)
- Drill-down to country-product detail

**Data Requirements:**
- African export capacity by sector/product
- U.S. import requirements by product
- Infrastructure and logistics scores
- Risk indicators

---

#### Module 4: Product Finder (Phase 4C)

**Purpose:** Search and analyze products at HS code level

**Features:**
- HS code search and browse
- Product opportunity scores by country
- Tariff treatment comparison (AGOA vs. MFN)
- Competitive positioning
- Export/import trend analysis

**Data Requirements:**
- HS code reference data (6-digit minimum)
- AGOA/GSP eligibility by HS code
- U.S. import data by HS code
- African export data by HS code

---

#### Module 5: Trade Report Builder (Phase 4C)

**Purpose:** Generate custom trade intelligence reports

**Features:**
- Report templates (country profile, sector analysis, product deep-dive, policy brief)
- Entity selection (countries, sectors, products)
- Indicator selection
- Visualization configuration
- Export formats (PDF, Word, PowerPoint, Excel)
- Citation and source attribution

---

#### Module 6: Admin Source Registry

**Purpose:** Enable admins to configure and manage data sources

**Features:**
- Source registration and configuration
- Connection testing
- Ingestion scheduling
- Health monitoring
- Error logging

---

#### Module 7: Admin Indicator Builder

**Purpose:** Enable admins to define new metrics

**Features:**
- Indicator definition
- Source field mapping
- Entity mapping (country, sector, product)
- Validation rules
- Access control configuration
- Publish workflow

---

## 5. Data Model Concepts

### 5.1 Conceptual Entity-Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     Country      │       │     Sector       │       │     Product      │
│  (souvera_       │       │  (souvera_       │       │  (product_       │
│   countries)     │       │   sectors)       │       │   hs_codes)      │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ key (PK)         │       │ hs_code (PK)     │
│ iso3             │       │ label            │       │ description      │
│ name             │       │ display_order    │       │ hs_level         │
│ region           │       │                  │       │ agoa_eligible    │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         │    ┌────────────────────┐│                          │
         └────┤ country_sectors    ├┘                          │
              │ (existing)         │                           │
              └────────────────────┘                           │
         │                                                     │
         │    ┌────────────────────────────────────────────────┘
         │    │
         ▼    ▼
┌──────────────────────────────────────────────────────────────┐
│                    country_product_supply                    │
├──────────────────────────────────────────────────────────────┤
│ country_id (FK) | hs_code (FK) | export_value | year | ...   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    us_product_demand                         │
├──────────────────────────────────────────────────────────────┤
│ hs_code (FK) | import_value | top_suppliers | year | ...     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    agoa_eligibility                          │
├──────────────────────────────────────────────────────────────┤
│ country_id (FK) | status | effective_date | criteria | ...   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    afcfta_status                             │
├──────────────────────────────────────────────────────────────┤
│ country_id (FK) | signed | ratified | trading | tariff_...   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    product_opportunities                     │
├──────────────────────────────────────────────────────────────┤
│ country_id (FK) | hs_code (FK) | opportunity_score | ...     │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 New Tables (Conceptual)

**agoa_eligibility**
```
- id: UUID (PK)
- country_id: UUID (FK → souvera_countries)
- status: ENUM (eligible, suspended, graduated, never_eligible)
- effective_date: DATE
- apparel_eligible: BOOLEAN
- criteria_assessment: JSONB
- notes: TEXT
- source: VARCHAR
- updated_at: TIMESTAMP
```

**afcfta_status**
```
- id: UUID (PK)
- country_id: UUID (FK → souvera_countries)
- signed_date: DATE
- ratified_date: DATE
- trading_started: DATE
- tariff_offers_submitted: BOOLEAN
- services_offers_submitted: BOOLEAN
- implementation_status: VARCHAR
- source: VARCHAR
- updated_at: TIMESTAMP
```

**product_hs_codes**
```
- hs_code: VARCHAR (PK)
- hs_level: INTEGER (2, 4, 6)
- description: TEXT
- parent_code: VARCHAR (FK)
- agoa_eligible: BOOLEAN
- gsp_eligible: BOOLEAN
- category_key: VARCHAR
- updated_at: TIMESTAMP
```

**country_product_supply**
```
- id: UUID (PK)
- country_id: UUID (FK → souvera_countries)
- hs_code: VARCHAR (FK → product_hs_codes)
- year: INTEGER
- export_value_usd: NUMERIC
- export_quantity: NUMERIC
- unit_of_measure: VARCHAR
- capacity_score: INTEGER (0-100)
- source: VARCHAR
- updated_at: TIMESTAMP
```

**us_product_demand**
```
- id: UUID (PK)
- hs_code: VARCHAR (FK → product_hs_codes)
- year: INTEGER
- import_value_usd: NUMERIC
- import_quantity: NUMERIC
- top_suppliers: JSONB
- growth_rate: NUMERIC
- concentration_index: NUMERIC
- source: VARCHAR
- updated_at: TIMESTAMP
```

**product_opportunities**
```
- id: UUID (PK)
- country_id: UUID (FK → souvera_countries)
- hs_code: VARCHAR (FK → product_hs_codes)
- opportunity_score: INTEGER (0-100)
- supply_score: INTEGER
- demand_score: INTEGER
- access_score: INTEGER
- risk_adjustment: INTEGER
- rationale_md: TEXT
- calculated_at: TIMESTAMP
```

---

## 6. Dashboard Requirements

### 6.1 AGOA Dashboard

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                    AGOA ELIGIBILITY                         │
├───────────────────────────┬─────────────────────────────────┤
│                           │  Summary Stats:                 │
│   Eligibility Map         │  - Eligible: XX countries       │
│   (color-coded by status) │  - Suspended: X countries       │
│                           │  - Total trade value: $XXB      │
│                           │                                 │
├───────────────────────────┴─────────────────────────────────┤
│  Country List (sortable, filterable)                        │
│  ┌──────────┬────────┬─────────┬──────────┬──────────────┐ │
│  │ Country  │ Status │ Apparel │ Trade $  │ Last Change  │ │
│  ├──────────┼────────┼─────────┼──────────┼──────────────┤ │
│  │ Kenya    │ ✓      │ ✓       │ $650M    │ No change    │ │
│  │ Nigeria  │ ✓      │ ✓       │ $2.1B    │ No change    │ │
│  │ Ethiopia │ ✗      │ ✗       │ —        │ Suspended... │ │
│  └──────────┴────────┴─────────┴──────────┴──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Recent Eligibility Changes                                 │
│  - [Date] Country X status changed from Y to Z              │
│  - [Date] Country W apparel eligibility restored            │
└─────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click country on map → Navigate to country detail
- Click column header → Sort list
- Filter controls → Region, status, apparel eligibility
- Export → Download country list with eligibility data

### 6.2 Country Trade Profile

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Country Flag] KENYA — Trade Intelligence Profile          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ELIGIBILITY STATUS                    TRADE SNAPSHOT       │
│  ┌─────────────────────────┐          ┌───────────────────┐│
│  │ AGOA: ✓ Eligible        │          │ U.S. Exports: $X  ││
│  │ Apparel: ✓ Eligible     │          │ U.S. Imports: $Y  ││
│  │ AfCFTA: ✓ Trading       │          │ Trade Balance: $Z ││
│  │ Since: 2000             │          │ Growth: +X%       ││
│  └─────────────────────────┘          └───────────────────┘│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  SECTOR PERFORMANCE (existing 7-sector data)                │
│  ┌────────────────┬──────────┬───────────┬────────────────┐│
│  │ Sector         │ Strength │ Growth    │ Opportunity    ││
│  ├────────────────┼──────────┼───────────┼────────────────┤│
│  │ Agriculture    │ 75       │ 68        │ High           ││
│  │ Digital Infra  │ 60       │ 72        │ Moderate       ││
│  └────────────────┴──────────┴───────────┴────────────────┘│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  TOP PRODUCT OPPORTUNITIES (Phase 4C)                       │
│  - HS 0901: Coffee — Score: 85                              │
│  - HS 0603: Cut flowers — Score: 82                         │
│  - HS 6109: T-shirts — Score: 78                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Generate Report] [Export Data] [Compare Countries]        │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Supply-Demand Matrix

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  SUPPLY-DEMAND OPPORTUNITY MATRIX                           │
├─────────────────────────────────────────────────────────────┤
│  Filters: [AGOA-eligible ▼] [Region ▼] [Min Score ▼]        │
├─────────────────────────────────────────────────────────────┤
│           │ Agri │ Minerals │ Apparel │ Energy │ ...       │
│  ─────────┼──────┼──────────┼─────────┼────────┼───────    │
│  Kenya    │  85  │    45    │   78    │   52   │           │
│  Ghana    │  72  │    68    │   42    │   65   │           │
│  Nigeria  │  58  │    75    │   35    │   82   │           │
│  DRC      │  42  │    92    │   28    │   55   │           │
│  ...      │      │          │         │        │           │
│                                                             │
│  Legend: [90-100 ■] [70-89 ■] [50-69 ■] [30-49 ■] [<30 ■]  │
├─────────────────────────────────────────────────────────────┤
│  Click cell for detail | [Export Matrix] [Generate Report]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Report Generation Requirements

### 7.1 Report Templates

**Template 1: Country Trade Profile**
- Executive summary
- Eligibility status (AGOA, AfCFTA)
- Trade statistics
- Sector performance (7 sectors)
- Top product opportunities
- Infrastructure assessment
- Risk indicators
- Investment opportunities
- Sources and methodology

**Template 2: Sector Opportunity Brief**
- Sector overview
- Country comparison
- Supply capacity assessment
- U.S. market demand
- AGOA product opportunities
- Investment requirements
- Recommendations

**Template 3: Product Competitive Analysis**
- HS code description
- U.S. import trends
- Top suppliers (global and AGOA)
- African supply capacity
- Tariff treatment comparison
- Competitive positioning
- Opportunity recommendations

**Template 4: Policy Submission Brief**
- Executive summary
- Policy context
- Evidence summary
- Data tables
- Recommendations
- Full citations

### 7.2 Export Formats

- PDF (formatted report)
- Word (editable document)
- PowerPoint (presentation slides)
- Excel (data tables with sources)

### 7.3 Citation Requirements

All reports must include:
- Source attribution for every data point
- Data freshness date
- Methodology notes
- Disclaimer language

---

## 8. Acceptance Criteria

### 8.1 Phase 4B MVP Acceptance Criteria

**AGOA Eligibility Tracker:**
- [ ] Display eligibility status for all 49 sub-Saharan African countries
- [ ] Show eligibility history (at least 5 years)
- [ ] Display apparel eligibility separately
- [ ] Show last status change date
- [ ] Support sorting and filtering
- [ ] Export country list with eligibility data

**AfCFTA Status Tracker:**
- [ ] Display status for all 54 African countries
- [ ] Show ratification date
- [ ] Show trading start date
- [ ] Display tariff offer status
- [ ] Support sorting and filtering

**Supply-Demand Matrix (Basic):**
- [ ] Display country × sector matrix (74 countries × 7 sectors)
- [ ] Show existing sector scores (strength, growth)
- [ ] Support filtering by AGOA eligibility
- [ ] Support filtering by region
- [ ] Drill-down to country detail

**Admin Source Registry:**
- [ ] Register new data source
- [ ] Configure source type (API, File, Manual)
- [ ] Test source connection
- [ ] View source health status
- [ ] View ingestion history

**Admin Indicator Builder:**
- [ ] Define new indicator
- [ ] Map to source fields
- [ ] Configure entity mapping
- [ ] Set access controls
- [ ] Publish indicator

**Data Freshness:**
- [ ] Display last updated date for all indicators
- [ ] Show freshness badge (fresh, stale, expired)
- [ ] Configure freshness thresholds

### 8.2 Phase 4C Acceptance Criteria

**HS Code Product Layer:**
- [ ] Load HS code reference data (6-digit)
- [ ] Display AGOA/GSP eligibility by HS code
- [ ] Search products by code or keyword
- [ ] Browse product hierarchy

**Product Opportunity Finder:**
- [ ] Calculate opportunity scores by country-product
- [ ] Display top opportunities by country
- [ ] Display top countries by product
- [ ] Support filtering and sorting

**Full Supply-Demand Matrix:**
- [ ] Country × Product matrix view
- [ ] Opportunity score coloring
- [ ] Gap analysis visualization
- [ ] Drill-down to country-product detail

**Trade Report Builder:**
- [ ] Select report template
- [ ] Select entities (countries, sectors, products)
- [ ] Preview report
- [ ] Export to PDF, Word, Excel
- [ ] Include source citations

---

## 9. MVP vs. Later Phases

### 9.1 Phase 4B MVP Scope

| Feature | Included | Notes |
|---------|----------|-------|
| AGOA eligibility tracker | ✅ | Country status only |
| AfCFTA status tracker | ✅ | Basic status |
| Supply-demand matrix (basic) | ✅ | Country × sector |
| Admin source registry | ✅ | Core functionality |
| Admin indicator builder | ✅ | Core functionality |
| Data freshness badges | ✅ | All indicators |
| Scheduled ingestion (World Bank) | ✅ | Foundation |

### 9.2 Phase 4C Scope

| Feature | Included | Notes |
|---------|----------|-------|
| HS code product layer | ✅ | 6-digit level |
| Product opportunity finder | ✅ | Full scoring |
| Full supply-demand matrix | ✅ | Country × product |
| Trade report builder | ✅ | 4 templates |
| U.S. trade data integration | ✅ | Census/ITC |
| Sector metrics enrichment | ✅ | Source-attributed |
| Market access barrier tracker | ✅ | Basic NTB data |

### 9.3 Future Phases

| Feature | Phase | Notes |
|---------|-------|-------|
| Real-time trade data | 5+ | Premium sources |
| Shipment-level intelligence | 5+ | Panjiva/Import Genius |
| Company/entity tracking | 5+ | Major new feature |
| Predictive analytics | 5+ | ML capabilities |
| API access for partners | 5+ | Revenue opportunity |

---

## 10. Non-Functional Requirements

### 10.1 Performance

- Dashboard page load: <2 seconds
- Matrix rendering: <3 seconds
- Report generation: <30 seconds
- Search results: <1 second

### 10.2 Scalability

- Support 74 countries × 7 sectors × 500+ HS codes
- Support 100 concurrent users
- Support 10,000 daily API requests

### 10.3 Security

- Role-based access control
- Entitlement-based data visibility
- Audit logging for all admin actions
- Encrypted credential storage

### 10.4 Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast standards

---

## 11. Dependencies

### 11.1 Technical Dependencies

- Phase 4A completion (done)
- Supabase infrastructure (existing)
- Admin authentication (existing)
- Entitlement system (existing)

### 11.2 Data Dependencies

- USTR AGOA eligibility data
- AfCFTA Secretariat implementation data
- HS code reference data (Phase 4C)
- U.S. Census trade data (Phase 4C)

### 11.3 External Dependencies

- USTR policy announcements
- AfCFTA Secretariat updates
- U.S. Census data availability
- ITC Trade Map API access

---

## 12. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AGOA not reauthorized (expires Dec 2026) | High | Module valuable for policy analysis regardless; pivot to AfCFTA focus |
| Data source API changes | Medium | Source registry abstraction, fallback procedures |
| Data quality issues | Medium | Validation rules, admin review workflow |
| Scope creep | Medium | Strict MVP definition, phase gating |
| Performance issues with large data | Medium | Caching, query optimization, pagination |

---

## 13. Success Metrics

### 13.1 Phase 4B Success Metrics

| Metric | Target |
|--------|--------|
| Source Registry supports sources | 5+ |
| Indicators defined | 20+ |
| AGOA eligibility data coverage | 49 countries |
| AfCFTA status coverage | 54 countries |
| Admin adoption | 3+ admins using |
| User engagement (dashboard views) | 100+ per week |

### 13.2 Phase 4C Success Metrics

| Metric | Target |
|--------|--------|
| HS codes covered | 500+ |
| Product opportunity scores | 5,000+ (100 HS × 50 countries) |
| Reports generated | 50+ per month |
| Enterprise interest | 3+ inquiries |
| User satisfaction | 80%+ positive |

---

**Document Version:** 1.0 Draft  
**Classification:** Internal Product  
**Next Review:** After stakeholder feedback  
**Owner:** Afronovation Product Team
