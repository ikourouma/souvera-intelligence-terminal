# Supply-Demand Matrix Methodology

**Souvera Intelligence Terminal**  
**Phase 4C: Supply-Demand Matrix**  
**Last Updated: June 15, 2026**

---

## Executive Summary

The Supply-Demand Matrix is Souvera's flagship quantitative intelligence tool, providing opportunity scoring across **74 markets × 8 sectors = 592 cells**. Each cell quantifies where African and Caribbean supply capacity meets US import demand.

This document explains the scoring methodology, data sources, confidence levels, and interpretation guidelines for investors and stakeholders.

---

## 1. Matrix Dimensions

### Markets (74)

**Africa (54 countries):**
- North Africa: Algeria, Egypt, Libya, Morocco, Tunisia
- East Africa: Burundi, Comoros, Djibouti, Eritrea, Ethiopia, Kenya, Madagascar, Malawi, Mauritius, Mozambique, Rwanda, Seychelles, Somalia, South Sudan, Sudan, Tanzania, Uganda
- West Africa: Benin, Burkina Faso, Cabo Verde, Côte d'Ivoire, Gambia, Ghana, Guinea, Guinea-Bissau, Liberia, Mali, Mauritania, Niger, Nigeria, Senegal, Sierra Leone, Togo
- Central Africa: Cameroon, Central African Republic, Chad, Democratic Republic of Congo, Equatorial Guinea, Gabon, Republic of Congo, São Tomé and Príncipe
- Southern Africa: Angola, Botswana, Eswatini, Lesotho, Namibia, South Africa, Zambia, Zimbabwe

**Caribbean (20 markets):**
- Greater Antilles: Cuba, Dominican Republic, Haiti, Jamaica, Puerto Rico
- Lesser Antilles: Antigua and Barbuda, Aruba, Barbados, British Virgin Islands, Dominica, Grenada, Saint Kitts and Nevis, Saint Lucia, Saint Vincent, Trinidad and Tobago, Turks and Caicos
- Continental: Belize, Guyana, Suriname

### Sectors (8)

| Sector Key | Label | Description |
|------------|-------|-------------|
| `manufacturing_textiles` | Manufacturing & Textiles | Apparel, industrial goods, EPZ production |
| `agriculture_food` | Agriculture & Food Processing | Raw commodities + value-added processing |
| `energy_power` | Energy & Power | Oil, gas, LNG, renewables, power generation |
| `mining_minerals` | Mining & Critical Minerals | Gold, lithium, cobalt, rare earths |
| `digital_infrastructure` | Digital Infrastructure | Telecom, data centers, fiber, 5G |
| `fintech_finance` | Fintech & Digital Finance | Mobile money, payments, banking |
| `logistics_trade` | Logistics & Trade | Ports, freight, supply chain services |
| `tourism_hospitality` | Tourism & Hospitality | Hotels, travel services, eco-tourism |

---

## 2. Scoring Framework

Each matrix cell contains three core scores, all on a 0-100 scale:

### 2.1 Supply Score (Production Capacity)

**Definition:** Measures a country's ability to produce and export goods/services in a given sector.

**Formula:**
```
Supply Score = 
  (Export Volume Percentile × 0.30) +
  (Manufacturing Capacity × 0.20) +
  (FDI Inflows Score × 0.15) +
  (Infrastructure Score × 0.15) +
  (Labor Quality × 0.10) +
  (Regulatory Score × 0.10)
```

**Data Inputs:**
- Export volume by sector (UN Comtrade, national statistics)
- Manufacturing capacity index (World Bank Enterprise Surveys, UNIDO)
- FDI inflows to sector (UNCTAD, central banks)
- Infrastructure readiness score (ports, power, logistics)
- Labor force quality and availability
- Regulatory environment (Doing Business indicators)

### 2.2 Demand Score (US Market Opportunity)

**Definition:** Measures the size, growth, and accessibility of US import demand in a sector.

**Formula:**
```
Demand Score = 
  (US Import Volume Percentile × 0.35) +
  (Growth Rate Score × 0.25) +
  (Diversification Pressure × 0.20) +
  (Policy Incentive Score × 0.20)
```

**Data Inputs:**
- US import volume by sector (Census Bureau, BEA)
- 5-year CAGR import growth
- China market share (diversification pressure)
- Policy incentives (AGOA, IRA, CHIPS Act, etc.)

### 2.3 Opportunity Score (Combined Signal)

**Definition:** Quantified opportunity where supply meets demand, adjusted for trade barriers and competitive positioning.

**Formula:**
```
Base Score = (Supply × 0.45) + (Demand × 0.45)

Adjustments:
  + AGOA/CBTPA eligibility: +10 points
  + Tariff preference margin >10%: +5 points
  + Existing trade corridor >$100M: +5 points
  - High Chinese competition (>30%): -10 points
  - Infrastructure gaps (<50): -5 points
  - Political risk (>50): -10 points

Opportunity Score = Base + Adjustments (capped 0-100)
```

---

## 3. Opportunity Tiers

| Tier | Score Range | Classification | Interpretation |
|------|-------------|----------------|----------------|
| **1** | 80-100 | High-Conviction | Investor-ready; established infrastructure, proven export capacity |
| **2** | 60-79 | Strong Opportunity | Strong fundamentals with manageable execution risk |
| **3** | 40-59 | Emerging | Growth potential; benefits from development finance |
| **4** | <40 | Early-Stage | Requires capacity building and technical assistance |

---

## 4. Confidence Levels

Each score includes a confidence indicator reflecting data quality:

| Level | Criteria | Description |
|-------|----------|-------------|
| **A** | ≥4 data sources, vintage ≤2 years | High confidence; curated from primary sources |
| **B** | 2-3 sources, vintage ≤3 years | Medium confidence; validated estimates |
| **C** | 1 source or projected | Estimated; programmatic derivation |

**Tier A Priority Markets (20):**
Nigeria, South Africa, Kenya, Egypt, Ghana, Ethiopia, Tanzania, Côte d'Ivoire, Senegal, Morocco, Jamaica, Trinidad and Tobago, Dominican Republic, Bahamas, Barbados, Guyana, Haiti, Belize, Suriname, Antigua and Barbuda

---

## 5. Data Sources

### Supply-Side Sources
- UN Comtrade (bilateral trade flows)
- World Bank Development Indicators
- World Bank Enterprise Surveys
- UNCTAD FDI Statistics
- African Development Bank
- National Statistics Offices

### Demand-Side Sources
- US Census Bureau (imports by HS chapter)
- Bureau of Economic Analysis (BEA)
- USITC DataWeb
- ITC Trade Map

### Policy & Regulatory
- USTR (AGOA, CBTPA eligibility)
- World Bank Doing Business (historical)
- World Governance Indicators

---

## 6. Use Cases

### For Investors
1. **Portfolio Screening:** Filter Tier 1 and 2 opportunities for due diligence
2. **Sector Allocation:** Identify highest-potential sectors across regions
3. **Country Entry:** Evaluate market-specific supply capacity
4. **Competitive Analysis:** Understand China/EU/India positioning

### For Policymakers
1. **Trade Corridor Prioritization:** Focus AGOA renewal advocacy
2. **Infrastructure Investment:** Identify supply-side gaps
3. **Capacity Building:** Target Tier 3/4 markets for technical assistance

### For Corporates
1. **Sourcing Diversification:** Alternative suppliers to China
2. **Market Entry:** US export opportunities from Africa/Caribbean
3. **Partnership Identification:** Local supply chain partners

---

## 7. Limitations & Disclaimers

1. **Data Latency:** Macro data typically reflects 1-2 year vintage
2. **Sector Granularity:** 8 sectors may mask sub-sector variations
3. **Programmatic Estimates:** Tier C data involves assumptions
4. **Dynamic Conditions:** Political and economic conditions change
5. **Not Investment Advice:** Matrix is informational; conduct due diligence

---

## 8. API Reference

### Endpoint
```
GET /api/v1/intelligence/supply-demand
```

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `region` | string | Filter by region: `Africa` or `Caribbean` |
| `sector` | string | Filter by sector_key (comma-separated) |
| `iso3` | string | Filter by country code (comma-separated) |
| `min_opportunity_score` | number | Minimum opportunity score |
| `tier` | number | Filter by opportunity tier (1, 2, 3, 4) |
| `agoa_only` | boolean | Filter AGOA-eligible only |
| `cbtpa_only` | boolean | Filter CBTPA-eligible only |
| `year` | number | Data year (default: 2023) |
| `limit` | number | Max results (default: 600) |

### Response Structure
```typescript
{
  matrix: MatrixCell[],
  summary: {
    total_cells: number,
    tier_distribution: { 1: n, 2: n, 3: n, 4: n },
    avg_supply_score: number,
    avg_demand_score: number,
    avg_opportunity_score: number,
    top_opportunities: MatrixCell[],
    data_quality_breakdown: { A: n, B: n, C: n },
    data_vintage: string,
  },
  sectors: SectorSummary[],
  countries: CountrySummary[],
  attribution: { sources: string[], note: string }
}
```

### Access Control
- **Required Tier:** Investor or Institutional
- **Entitlement:** `supply_demand_matrix`

---

## 9. Bidirectional Analysis (US ↔ Africa/Caribbean)

The Supply-Demand Matrix supports **bidirectional trade analysis**, critical for understanding reciprocal trade flows under AGOA reauthorization and CBTPA frameworks.

### 9.1 Default View: Africa/Caribbean → US

The primary view shows how African and Caribbean countries can export to the US market:
- **Supply Score:** Country's export capacity in the sector
- **Demand Score:** US import demand in the sector
- **Opportunity:** Where African/Caribbean supply meets US demand

### 9.2 Reverse Flow: US → Africa/Caribbean

When users toggle to the reverse flow view, the analysis shows what US can export to meet African/Caribbean needs:
- **US Export Capacity:** US production and export strength in the sector
- **Country Import Demand Score:** Derived index of what the African/Caribbean country needs to import (0–100)
- **Import Opportunity:** Where US supply meets African/Caribbean demand

**Import Needs dollar amounts (pending):** Country-specific import $ by sector requires UN Comtrade bilateral import data. Until ingested, the reverse-flow drawer shows **import demand score only** with a pending-data badge — no fabricated percentages of U.S. sector totals.

### 9.3 Field scope labels (cell drawer)

| Metric | Label in UI | Meaning |
|--------|-------------|---------|
| Export capacity | Country export capacity | `export_volume_usd` — all destinations |
| Current U.S. trade | Bilateral exports to U.S. | `current_trade_usd` — country-specific |
| U.S. import demand | U.S. sector import total | `us_import_volume_usd` — same for all countries in sector |
| Top export products | Country products | From AGOA/CBTPA category flows when available; otherwise scaled sector template |
| Top U.S. import products | U.S. demand | U.S. sector-level demand (not country-specific) |

### 9.4 AGOA Reauthorization Context

This bidirectional view is crucial for AGOA 2025 reauthorization advocacy:
- **Reciprocity narrative:** Shows that AGOA creates a two-way trade relationship
- **US job creation:** US exports to African markets support American jobs
- **Mutual benefit:** Both parties benefit from the trade agreement

The US → Africa analysis includes:
- **Top US Export Products** by sector
- **Country Import Needs** assessment
- **Market Entry Thesis** for US exporters
- **AGOA eligibility status** for reciprocal trade

---

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-15 | Initial release with 592 cells |
| 1.1 | 2026-06-15 | Added bidirectional analysis (US → Africa) |
| 1.2 | 2026-06-28 | Phase 2.5 clarity: scope labels, flow-backed export products, import-needs score-only pending Comtrade |

---

## 11. Contact

For methodology questions, data corrections, or partnership inquiries:

**Souvera Intelligence Team**  
Email: intelligence@souvera.africa  
Web: https://souvera.africa/access

---

*© 2026 Afronovation, Inc. All rights reserved.*
