# Top 20 Economic Indicators - Data Source Reference

**Version:** 1.0  
**Last Updated:** June 20, 2026  
**Target Coverage:** 20/20 indicators for all 74 markets  
**Owner:** Afronovation, Inc.

---

## Executive Summary

This document provides comprehensive mapping of the Top 20 economic indicators used across the Souvera Intelligence Platform. Each indicator is mapped to primary and fallback data sources with direct API endpoints for verification and ingestion.

**Production Readiness Target:** All 74 markets must achieve 20/20 indicator coverage with verified data from primary sources.

---

## Indicator Mapping Table

| # | Indicator Key | Label | Unit | Primary Source | API Code/Endpoint | Fallback Source |
|---|---------------|-------|------|----------------|-------------------|-----------------|
| 1 | `gdp_current_usd` | GDP (current USD) | USD Billions | World Bank WDI | `NY.GDP.MKTP.CD` | IMF WEO |
| 2 | `gdp_growth` | GDP Growth Rate | % annual | World Bank WDI | `NY.GDP.MKTP.KD.ZG` | IMF DataMapper `NGDP_RPCH` |
| 3 | `gdp_per_capita` | GDP per Capita | USD | World Bank WDI | `NY.GDP.PCAP.CD` | Calculated (GDP/Pop) |
| 4 | `population` | Population | Count | World Bank WDI | `SP.POP.TOTL` | UN Population Division |
| 5 | `inflation` | Inflation Rate | % annual | World Bank WDI | `FP.CPI.TOTL.ZG` | IMF DataMapper `PCPIPCH` |
| 6 | `unemployment` | Unemployment Rate | % of labor force | World Bank WDI | `SL.UEM.TOTL.ZS` | ILO ILOSTAT |
| 7 | `trade_balance` | Trade Balance | USD Millions | Calculated | Exports - Imports | WTO Stats |
| 8 | `exports_total` | Exports (goods/services) | USD Millions | World Bank WDI | `NE.EXP.GNFS.CD` | UN Comtrade |
| 9 | `imports_total` | Imports (goods/services) | USD Millions | World Bank WDI | `NE.IMP.GNFS.CD` | UN Comtrade |
| 10 | `fdi_inflows` | Foreign Direct Investment | USD Millions | World Bank WDI | `BX.KLT.DINV.CD.WD` | UNCTAD FDI Stats |
| 11 | `current_account` | Current Account Balance | % of GDP | World Bank WDI | `BN.CAB.XOKA.GD.ZS` | IMF BOP |
| 12 | `govt_debt_gdp` | Government Debt | % of GDP | World Bank WDI | `GC.DOD.TOTL.GD.ZS` | IMF Fiscal Monitor |
| 13 | `fiscal_balance` | Fiscal Balance | % of GDP | IMF DataMapper | `GGXCNL_G01_GDP_PT` | World Bank GFS |
| 14 | `fx_reserves` | Foreign Exchange Reserves | USD Millions | World Bank WDI | `FI.RES.TOTL.CD` | IMF IFS |
| 15 | `exchange_rate` | Exchange Rate | LCU per USD | World Bank WDI | `PA.NUS.FCRF` | IMF AREAER |
| 16 | `ease_business` | Ease of Doing Business | Score 0-100 | World Bank DB (disc.) | N/A | Heritage Econ Freedom |
| 17 | `corruption_index` | Corruption Perception | Score 0-100 | Transparency Intl | Manual | World Bank WGI `CC.EST` |
| 18 | `political_stability` | Political Stability | Score -2.5 to 2.5 | World Bank WGI | `PV.EST` | V-Dem Institute |
| 19 | `regulatory_quality` | Regulatory Quality | Score -2.5 to 2.5 | World Bank WGI | `RQ.EST` | Heritage Foundation |
| 20 | `rule_of_law` | Rule of Law | Score -2.5 to 2.5 | World Bank WGI | `RL.EST` | V-Dem Institute |

---

## Data Source Details

### 1. World Bank WDI (World Development Indicators)

**Base URL:** `https://api.worldbank.org/v2`  
**Documentation:** https://datahelpdesk.worldbank.org/knowledgebase/articles/889392  
**Coverage:** 217 countries, 1960-present  
**Update Frequency:** Quarterly  
**Format:** JSON/XML  
**Authentication:** None required (public API)

**API Pattern:**
```
https://api.worldbank.org/v2/country/{iso2}/indicator/{indicator_code}?format=json&date={year_start}:{year_end}
```

**Example Calls:**
```bash
# GDP for Zimbabwe (2020-2024)
curl "https://api.worldbank.org/v2/country/ZW/indicator/NY.GDP.MKTP.CD?format=json&date=2020:2024"

# Inflation for Kenya
curl "https://api.worldbank.org/v2/country/KE/indicator/FP.CPI.TOTL.ZG?format=json&date=2020:2024"

# Multiple countries
curl "https://api.worldbank.org/v2/country/ZW;KE;NG/indicator/NY.GDP.MKTP.CD?format=json&date=2023"
```

**Response Format:**
```json
[
  {
    "page": 1,
    "pages": 1,
    "per_page": 50,
    "total": 5
  },
  [
    {
      "indicator": {"id": "NY.GDP.MKTP.CD", "value": "GDP (current US$)"},
      "country": {"id": "ZW", "value": "Zimbabwe"},
      "countryiso3code": "ZWE",
      "date": "2023",
      "value": 28371000000.0,
      "unit": "",
      "obs_status": "",
      "decimal": 0
    }
  ]
]
```

---

### 2. IMF DataMapper

**Base URL:** `https://www.imf.org/external/datamapper/api/v1`  
**Documentation:** https://www.imf.org/external/datamapper/datasets  
**Coverage:** 190+ countries  
**Update Frequency:** Quarterly (WEO) / Annual (other datasets)  
**Format:** JSON  
**Authentication:** None required

**Available Datasets:**
- `NGDP_RPCH` - GDP growth (%)
- `PCPIPCH` - Inflation (%)
- `LUR` - Unemployment rate (%)
- `GGXCNL_G01_GDP_PT` - Fiscal balance (% GDP)
- `BCA_GDP` - Current account balance (% GDP)

**API Pattern:**
```
https://www.imf.org/external/datamapper/api/v1/{indicator_code}/{iso3}
```

**Example Calls:**
```bash
# GDP growth for Zimbabwe
curl "https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/ZWE"

# Inflation for multiple countries
curl "https://www.imf.org/external/datamapper/api/v1/PCPIPCH/ZWE,KEN,NGA"

# All countries for one indicator
curl "https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH"
```

---

### 3. UN Comtrade Plus

**Portal:** https://comtradeplus.un.org/  
**API:** https://comtradeplus.un.org/api  
**Documentation:** https://comtradeplus.un.org/docs/  
**Coverage:** 200+ countries, 1962-present  
**Update Frequency:** Monthly (with 3-6 month lag)  
**Authentication:** API key required (free registration)

**Key Endpoints:**
- `/data/da` - Detailed annual trade data
- `/metadata/reporter` - Country codes
- `/metadata/partner` - Partner countries

**Example Call:**
```bash
# Zimbabwe bilateral trade with USA (2023)
curl "https://comtradeplus.un.org/api/get/da/C/A/2023/716/0/USA"
```

---

### 4. ITC Trade Map

**Portal:** https://www.trademap.org/  
**Coverage:** Bilateral trade flows, product-level detail (HS codes)  
**Update Frequency:** Quarterly  
**Access:** Manual CSV/Excel exports  
**Note:** No public API; requires portal access and manual download

**Use Cases:**
- Product-level export/import data
- Top trading partners by product
- Market access indicators
- Tariff information

---

### 5. World Bank WGI (Worldwide Governance Indicators)

**Portal:** https://www.worldbank.org/en/publication/worldwide-governance-indicators  
**Data:** https://databank.worldbank.org/source/worldwide-governance-indicators  
**Coverage:** 200+ countries, 1996-present  
**Update Frequency:** Annual (September)  
**Format:** Excel/CSV downloads

**Six Dimensions:**
1. Voice and Accountability
2. Political Stability and Absence of Violence (`PV.EST`)
3. Government Effectiveness
4. Regulatory Quality (`RQ.EST`)
5. Rule of Law (`RL.EST`)
6. Control of Corruption (`CC.EST`)

**Accessing via World Bank API:**
```bash
# Rule of Law for Zimbabwe
curl "https://api.worldbank.org/v2/country/ZW/indicator/RL.EST?format=json&date=2020:2023"
```

---

### 6. UNCTAD (United Nations Conference on Trade and Development)

**FDI Stats:** https://unctad.org/topic/investment/world-investment-report  
**Data Portal:** https://unctadstat.unctad.org/  
**Coverage:** FDI inflows/outflows, stocks, bilateral flows  
**Update Frequency:** Annual (June)  
**Access:** Excel downloads, manual compilation

---

### 7. Transparency International

**Corruption Perceptions Index:** https://www.transparency.org/en/cpi/  
**Coverage:** 180 countries  
**Update Frequency:** Annual (January)  
**Format:** PDF, Excel  
**Access:** Manual download and compilation

**Score Range:** 0-100 (0 = highly corrupt, 100 = very clean)

---

### 8. Heritage Foundation

**Index of Economic Freedom:** https://www.heritage.org/index/  
**Coverage:** 180+ countries  
**Update Frequency:** Annual (March)  
**Components:** 12 freedoms (property rights, tax burden, govt spending, etc.)  
**Access:** Website data + Excel download

**Use:** Replacement for discontinued World Bank Doing Business score

---

## Indicator Definitions

### 1. GDP (current USD) - `gdp_current_usd`

**Definition:** Gross Domestic Product at current market prices in US dollars.

**Formula:**  
`GDP = C + I + G + (X - M)`  
Where: C=Consumption, I=Investment, G=Government spending, X=Exports, M=Imports

**Data Source:** World Bank WDI (`NY.GDP.MKTP.CD`)

**Use Cases:**
- Overall economic size comparison
- Market size for investment decisions
- Economic output trends

**Interpretation:** Higher GDP indicates larger economy, but doesn't reflect per-capita wealth or distribution.

---

### 2. GDP Growth Rate - `gdp_growth`

**Definition:** Annual percentage growth rate of GDP at constant prices (inflation-adjusted).

**Formula:**  
`Growth Rate = ((GDP_t - GDP_t-1) / GDP_t-1) × 100`

**Data Source:** World Bank WDI (`NY.GDP.MKTP.KD.ZG`) or IMF (`NGDP_RPCH`)

**Use Cases:**
- Economic expansion/contraction analysis
- Investment opportunity timing
- Policy effectiveness assessment

**Interpretation:**
- >5%: Strong growth
- 2-5%: Moderate growth
- <2%: Slow growth
- <0%: Recession

---

### 3. GDP per Capita - `gdp_per_capita`

**Definition:** GDP divided by midyear population.

**Formula:**  
`GDP per Capita = Total GDP / Total Population`

**Data Source:** World Bank WDI (`NY.GDP.PCAP.CD`)

**Use Cases:**
- Standard of living comparison
- Purchasing power assessment
- Market sophistication indicator

**Interpretation:**
- >$20,000: High income
- $4,000-$20,000: Middle income
- <$4,000: Low income

---

### 4. Population - `population`

**Definition:** Total population based on de facto definition (all residents regardless of legal status).

**Source:** National census data, UN Population Division estimates, World Bank projections

**Data Source:** World Bank WDI (`SP.POP.TOTL`)

**Use Cases:**
- Market size estimation
- Labor force potential
- Consumer base sizing

---

### 5. Inflation Rate - `inflation`

**Definition:** Annual percentage change in consumer price index (CPI) for average consumer basket.

**Formula:**  
`Inflation = ((CPI_t - CPI_t-1) / CPI_t-1) × 100`

**Data Source:** World Bank WDI (`FP.CPI.TOTL.ZG`) or IMF (`PCPIPCH`)

**Use Cases:**
- Purchasing power trends
- Monetary policy assessment
- Real returns calculation

**Interpretation:**
- <2%: Low inflation (stable)
- 2-5%: Moderate inflation (healthy)
- 5-10%: High inflation (concern)
- >10%: Hyperinflation risk

---

### 6. Unemployment Rate - `unemployment`

**Definition:** Share of labor force without work but available for and seeking employment.

**Formula:**  
`Unemployment Rate = (Unemployed / Labor Force) × 100`

**Data Source:** World Bank WDI (`SL.UEM.TOTL.ZS`) or ILO

**Use Cases:**
- Labor market health
- Social stability assessment
- Wage pressure indicators

**Note:** Definitions vary by country (e.g., discouraged workers, underemployment).

---

### 7. Trade Balance - `trade_balance`

**Definition:** Difference between value of exports and imports of goods and services.

**Formula:**  
`Trade Balance = Total Exports - Total Imports`

**Data Source:** Calculated from WDI exports/imports data

**Use Cases:**
- Trade competitiveness
- Currency pressure assessment
- External balance monitoring

**Interpretation:**
- Positive: Trade surplus (exports > imports)
- Negative: Trade deficit (imports > exports)

---

### 8. Exports (goods/services) - `exports_total`

**Definition:** Value of all goods and other market services provided to rest of the world.

**Components:**
- Merchandise exports (physical goods)
- Service exports (tourism, transport, financial, IP)

**Data Source:** World Bank WDI (`NE.EXP.GNFS.CD`)

**Use Cases:**
- Export capacity assessment
- Trade opportunity identification
- Economic openness indicator

---

### 9. Imports (goods/services) - `imports_total`

**Definition:** Value of all goods and other market services received from rest of the world.

**Components:**
- Merchandise imports
- Service imports

**Data Source:** World Bank WDI (`NE.IMP.GNFS.CD`)

**Use Cases:**
- Consumption pattern analysis
- Trade dependency assessment
- Demand signal for exporters

---

### 10. Foreign Direct Investment - `fdi_inflows`

**Definition:** Net inflows of investment to acquire lasting management interest (≥10% of voting stock).

**Components:**
- Equity capital
- Reinvested earnings
- Intra-company loans

**Data Source:** World Bank WDI (`BX.KLT.DINV.CD.WD`) or UNCTAD

**Use Cases:**
- Investment climate assessment
- Capital flow monitoring
- Economic confidence indicator

---

### 11. Current Account Balance - `current_account`

**Definition:** Sum of balance of trade in goods/services, net primary income, net secondary income.

**Formula:**  
`Current Account = (Exports - Imports) + Net Income from Abroad + Net Transfers`

**Data Source:** World Bank WDI (`BN.CAB.XOKA.GD.ZS`)

**Use Cases:**
- External sustainability
- Currency stability assessment
- Sovereign risk evaluation

**Interpretation:**
- Large deficit (>5% GDP): Potential currency risk
- Large surplus: Strong external position

---

### 12. Government Debt (% GDP) - `govt_debt_gdp`

**Definition:** Gross government debt as percentage of GDP (central + sub-national governments).

**Components:** All liabilities requiring future payments of interest and/or principal.

**Data Source:** World Bank WDI (`GC.DOD.TOTL.GD.ZS`) or IMF Fiscal Monitor

**Use Cases:**
- Fiscal sustainability
- Sovereign credit risk
- Debt crisis vulnerability

**Thresholds:**
- <60%: Sustainable (Maastricht criterion)
- 60-90%: Elevated
- >90%: High risk

---

### 13. Fiscal Balance (% GDP) - `fiscal_balance`

**Definition:** Government revenue minus expenditure as percentage of GDP (surplus/deficit).

**Formula:**  
`Fiscal Balance = ((Total Revenue - Total Expenditure) / GDP) × 100`

**Data Source:** IMF DataMapper (`GGXCNL_G01_GDP_PT`)

**Use Cases:**
- Fiscal health monitoring
- Borrowing needs assessment
- Policy space evaluation

**Interpretation:**
- Positive: Fiscal surplus
- Negative: Fiscal deficit (>3% concerning under Maastricht)

---

### 14. Foreign Exchange Reserves - `fx_reserves`

**Definition:** Monetary authority holdings of monetary gold, SDRs, reserve position in IMF, and foreign exchange.

**Purpose:** Intervention capacity, import coverage, confidence signaling

**Data Source:** World Bank WDI (`FI.RES.TOTL.CD`) or IMF IFS

**Use Cases:**
- Currency stability capacity
- Import coverage (months of imports)
- Crisis resilience

**Adequacy:** Should cover ≥3 months of imports

---

### 15. Exchange Rate - `exchange_rate`

**Definition:** Domestic currency units per US dollar (period average, market or official rate).

**Data Source:** World Bank WDI (`PA.NUS.FCRF`) or IMF AREAER

**Use Cases:**
- Purchasing power parity analysis
- Trade pricing
- Investment return calculation

**Note:** Distinguish between market rate, official rate, and parallel market rate.

> **CRITICAL — Database indicator key is `fx_to_usd`, NOT `exchange_rate`.**
> The Economy tab FX Rate card and the `souvera_country_professional_v` view read
> the observation whose `souvera_indicators.key = 'fx_to_usd'`. Ingestion scripts
> MUST write observations under `fx_to_usd`. Using any other key (e.g.
> `exchange_rate_lcu_per_usd`) results in a "data pending" FX card even though a
> row exists. Baseline reference rates for all 74 markets are seeded by
> `apps/api-gateway/scripts/seed-all74-fx.ts`.

---

### 16. Ease of Doing Business Score - `ease_business`

**Definition:** Simple average of percentile rankings on 10 topics (0-100, higher = better).

**Status:** ⚠️ DISCONTINUED by World Bank in September 2021

**Replacement Options:**
- Heritage Foundation Index of Economic Freedom
- World Economic Forum Global Competitiveness Index

**Historical Use:** Business climate, regulatory efficiency, investor protection

---

### 17. Corruption Perception Index - `corruption_index`

**Definition:** Perceived levels of public sector corruption (0-100 scale).

**Source:** Transparency International CPI  
**Methodology:** Composite of expert surveys and business assessments

**Data Collection:** Manual annual compilation

**Use Cases:**
- Governance quality
- Investment risk assessment
- Compliance due diligence

**Interpretation:**
- 80-100: Very clean
- 50-79: Moderate
- 0-49: High corruption

---

### 18. Political Stability - `political_stability`

**Definition:** Perceptions of likelihood that government will be destabilized or overthrown by unconstitutional or violent means.

**Score Range:** -2.5 (weak) to +2.5 (strong)

**Data Source:** World Bank WGI (`PV.EST`)

**Use Cases:**
- Political risk assessment
- Regime stability evaluation
- Investment horizon planning

---

### 19. Regulatory Quality - `regulatory_quality`

**Definition:** Perceptions of government ability to formulate and implement sound policies and regulations.

**Score Range:** -2.5 (weak) to +2.5 (strong)

**Data Source:** World Bank WGI (`RQ.EST`)

**Use Cases:**
- Business environment assessment
- Policy effectiveness
- Reform readiness

---

### 20. Rule of Law - `rule_of_law`

**Definition:** Perceptions of confidence in and adherence to rules of society (contract enforcement, property rights, police, courts).

**Score Range:** -2.5 (weak) to +2.5 (strong)

**Data Source:** World Bank WGI (`RL.EST`)

**Use Cases:**
- Legal system reliability
- Contract enforcement confidence
- Property rights security

---

## Data Quality Tiers

### Tier A: Production Standard (Target for ALL markets)
- **Criteria:** 20/20 indicators with verified data
- **Data Age:** 2023 or later (where available)
- **Sources:** Primary sources only (World Bank, IMF, UN)
- **Verification:** Cross-referenced with at least one fallback source
- **UI Display:** All indicators visible with confidence

**Required For:** All 74 markets, especially demo countries (Zimbabwe, etc.)

### Tier B: Acceptable for Gap Markets Only
- **Criteria:** 18-19/20 indicators
- **Allowed For:** Maximum 4 gap markets (Dominica, Grenada, St. Kitts & Nevis, Somalia)
- **Sources:** Mix of primary and secondary sources
- **Missing:** Max 2 indicators (typically discontinued or unavailable)

### Tier C: NOT PRODUCTION-READY
- **Criteria:** <18/20 indicators
- **Status:** Requires immediate remediation
- **Action:** Run gap-fill scripts and manual curation

---

## Verification Commands

### Check Overall Coverage
```bash
# Check all 74 markets
cd apps/api-gateway
npx tsx scripts/check-all74-top20-coverage.ts

# Output: List of markets with <20/20 indicators
```

### Verify Zimbabwe Specifically
```bash
# Detailed indicator check for Zimbabwe
npx tsx apps/api-gateway/scripts/verify-country-indicators.ts --country=ZWE --target=20

# Expected: 20/20 indicators with sources documented
```

### Check Individual Indicator
```sql
-- SQL query to check specific indicator across all countries
SELECT 
  c.iso3,
  c.name,
  i.key as indicator,
  o.value,
  o.year,
  o.data_quality_tier
FROM souvera_countries c
JOIN souvera_country_observations o ON c.id = o.country_id
JOIN souvera_indicators i ON o.indicator_id = i.id
WHERE i.key = 'gdp_current_usd'
  AND o.year >= 2023
ORDER BY c.name;
```

---

## Implementation Checklist

### Phase 1: Documentation ✅
- [x] Create TOP-20-INDICATORS-REFERENCE.md
- [ ] Share with team for review
- [ ] Update as sources change

### Phase 2: Data Ingestion
- [ ] Run World Bank Top 20 ingestion
- [ ] Run IMF gap fill
- [ ] Run WGI ingestion
- [ ] Manual compilation for Transparency Intl, Heritage Foundation

### Phase 3: Zimbabwe Elevation (Demo Priority)
- [ ] Verify all 20 indicators present
- [ ] Cross-reference with multiple sources
- [ ] Elevate to Tier A in database
- [ ] Test UI display

### Phase 4: Verification
- [ ] All 74 markets reach 20/20 (or 18/20 for gap markets)
- [ ] No placeholder symbols in database
- [ ] UI displays all values correctly
- [ ] Sources documented in data_quality_notes

---

## Maintenance Schedule

- **Weekly:** Check World Bank API for new data releases
- **Monthly:** Update with new IMF DataMapper releases
- **Quarterly:** Refresh UN Comtrade data
- **Annually:** 
  - Update WGI indicators (September)
  - Update Transparency Intl CPI (January)
  - Update Heritage Foundation Index (March)

---

## Support & Questions

For questions about data sources, indicator definitions, or ingestion issues:
- **Technical Lead:** Platform Team
- **Data Quality:** Analytics Team  
- **External Sources:** Refer to documentation links above

---

**Document Status:** ✅ Complete - Ready for Production Use  
**Next Review:** July 2026 or upon source changes
