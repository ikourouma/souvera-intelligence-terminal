# Platform Data-Consistency Audit — Findings

_Generated 2026-06-27T08:13:32.541Z · 74 markets · read-only scan of `souvera_country_observations` + sectors + trade snapshots._

## Summary

- **67/74** markets have all 6 headline indicators (GDP, Growth, Population, Inflation, FDI, FX).
- **56** markets lack a 2025 GDP-growth observation.
- **0** markets have 0 active sector rows; **0** have 0 trade snapshots.

## Headline indicator coverage (per market)

| ISO3 | Market | GDP | Growth | Pop | Inflation | FDI | FX | Latest yr | Top20 | Yrs | Sectors | Trade |
|------|--------|-----|--------|-----|-----------|-----|----|-----------|-------|-----|---------|-------|
| AGO | Angola | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| ATG | Antigua and Barbuda | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 17/20 | 7 | 7 | 1 |
| BDI | Burundi | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 15/20 | 8 | 7 | 1 |
| BEN | Benin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 17/20 | 8 | 7 | 1 |
| BFA | Burkina Faso | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 17/20 | 8 | 7 | 1 |
| BHS | Bahamas | ✅25 | ✅25 | ✅ | ✅25 | ✅25 | ✅ | 2025 | 18/20 | 26 | 5 | 1 |
| BLZ | Belize | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| BRB | Barbados | ✅25 | ✅25 | ✅ | ✅25 | ✅25 | ✅ | 2025 | 19/20 | 26 | 5 | 1 |
| BWA | Botswana | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| CAF | Central African Republic | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 16/20 | 8 | 7 | 1 |
| CIV | Côte d'Ivoire | ✅25 | ✅25 | ✅25 | ✅25 | ✅25 | ✅ | 2025 | 19/20 | 26 | 5 | 1 |
| CMR | Cameroon | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| COD | DR Congo | ✅25 | ✅25 | ✅ | ✅25 | ✅ | ✅ | 2025 | 18/20 | 8 | 7 | 1 |
| COG | Congo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| COM | Comoros | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| CPV | Cabo Verde | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| CUB | Cuba | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | 2024 | 12/20 | 8 | 7 | 1 |
| CYM | Cayman Islands | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 2024 | 15/20 | 7 | 7 | 1 |
| DJI | Djibouti | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| DMA | Dominica | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 20/20 | 7 | 7 | 1 |
| DOM | Dominican Republic | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| DZA | Algeria | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| EGY | Egypt | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| ERI | Eritrea | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | 2024 | 9/20 | 8 | 7 | 1 |
| ETH | Ethiopia | ✅25 | ✅25 | ✅25 | ✅25 | ✅25 | ✅ | 2025 | 18/20 | 26 | 5 | 1 |
| GAB | Gabon | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 16/20 | 8 | 7 | 1 |
| GHA | Ghana | ✅25 | ✅25 | ✅25 | ✅25 | ✅25 | ✅ | 2025 | 18/20 | 26 | 5 | 1 |
| GIN | Guinea | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| GMB | Gambia | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| GNB | Guinea-Bissau | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 17/20 | 8 | 7 | 1 |
| GNQ | Equatorial Guinea | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 16/20 | 8 | 7 | 1 |
| GRD | Grenada | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 20/20 | 7 | 7 | 1 |
| GUY | Guyana | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 15/20 | 8 | 7 | 1 |
| HTI | Haiti | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| JAM | Jamaica | ✅25 | ✅25 | ✅25 | ✅25 | ✅25 | ✅ | 2025 | 18/20 | 26 | 5 | 1 |
| KEN | Kenya | ✅25 | ✅25 | ✅25 | ✅25 | ✅25 | ✅ | 2025 | 18/20 | 26 | 5 | 1 |
| KNA | Saint Kitts and Nevis | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 20/20 | 7 | 7 | 1 |
| LBR | Liberia | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 15/20 | 8 | 7 | 1 |
| LBY | Libya | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 17/20 | 8 | 7 | 1 |
| LCA | Saint Lucia | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 15/20 | 8 | 7 | 1 |
| LSO | Lesotho | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| MAR | Morocco | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| MDG | Madagascar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| MLI | Mali | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 17/20 | 8 | 7 | 1 |
| MOZ | Mozambique | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| MRT | Mauritania | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| MUS | Mauritius | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| MWI | Malawi | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| NAM | Namibia | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| NER | Niger | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 17/20 | 8 | 7 | 1 |
| NGA | Nigeria | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 26 | 5 | 1 |
| PRI | Puerto Rico | ✅25 | ✅25 | ✅ | ✅25 | ❌ | ✅ | 2025 | 14/20 | 8 | 7 | 1 |
| RWA | Rwanda | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| SDN | Sudan | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 16/20 | 7 | 7 | 1 |
| SEN | Senegal | ✅25 | ✅25 | ✅25 | ✅25 | ✅25 | ✅ | 2025 | 19/20 | 26 | 5 | 1 |
| SLE | Sierra Leone | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| SOM | Somalia | ✅25 | ✅25 | ✅ | ✅25 | ✅ | ❌ | 2025 | 15/20 | 8 | 7 | 1 |
| SSD | South Sudan | ✅25 | ✅25 | ✅ | ✅25 | ✅ | ✅ | 2025 | 14/20 | 8 | 7 | 1 |
| STP | São Tomé and Príncipe | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 15/20 | 8 | 7 | 1 |
| SUR | Suriname | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 15/20 | 8 | 7 | 1 |
| SWZ | Eswatini | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| SYC | Seychelles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 17/20 | 7 | 7 | 1 |
| TCA | Turks and Caicos Islands | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 2024 | 11/20 | 7 | 7 | 1 |
| TCD | Chad | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 16/20 | 8 | 7 | 1 |
| TGO | Togo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 17/20 | 8 | 7 | 1 |
| TTO | Trinidad and Tobago | ✅25 | ✅25 | ✅ | ✅25 | ✅25 | ✅ | 2025 | 18/20 | 26 | 5 | 1 |
| TUN | Tunisia | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| TZA | Tanzania | ✅25 | ✅25 | ✅25 | ✅25 | ✅25 | ✅ | 2025 | 19/20 | 26 | 5 | 1 |
| UGA | Uganda | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| VCT | Saint Vincent and the Grenadines | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 15/20 | 8 | 7 | 1 |
| VGB | British Virgin Islands | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | 2024 | 5/20 | 7 | 7 | 1 |
| ZAF | South Africa | ✅25 | ✅25 | ✅25 | ✅25 | ✅25 | ✅ | 2025 | 18/20 | 26 | 5 | 1 |
| ZMB | Zambia | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2024 | 18/20 | 8 | 7 | 1 |
| ZWE | Zimbabwe | ✅25 | ✅25 | ✅25 | ✅25 | ✅25 | ✅ | 2025 | 18/20 | 8 | 7 | 1 |

_Legend: ✅25 = present incl. 2025 · ✅ = present (older vintage) · ❌ = missing._

## Trade source reconciliation (Census vs USITC category flows)

_Audit: `audit-trade-source-reconciliation.ts` · threshold >5% divergence._

| Market | Census bilateral (exports to US) | USITC category-flow sum | Δ | Notes |
|--------|----------------------------------|-------------------------|---|-------|
| **COD** | ~$218M (2024) | ~$323M (2024) | ~32% | Minerals (~$300M) are AGOA-eligible; petroleum excluded from preferential sums only. Gap reflects HS aggregation / vintage — Census is authoritative bilateral; category flows sum sector buckets. Trade tab shows dual-source banner when both sources present. |

Other markets with material divergence are flagged by the audit script and surfaced via `TradeSourceReconciliationBanner` on the Trade tab when both sources are present.

## Trade Intelligence Coverage Audit

_Generated 2026-06-29T04:46:00.679Z · year 2023_

| Module | Cells | Coverage | Status |
|--------|-------|----------|--------|
| AGOA Trade Flows | 540/540 | 100.0% | PASS |
| AfCFTA Trade Flows | 864/864 | 100.0% | PASS |
| CBTPA Trade Flows | 320/320 | 100.0% | PASS |
| Import Demand Signals | 740/740 | 100.0% | PASS |
| Supply-Demand Matrix | 592/592 | 100.0% | PASS |

### AGOA gaps (credibility-critical)

- **No DB rows:** none
- **All null/zero:** none
- **ZWE:** {"rows":13,"totalUsd":564122428,"tiers":{"A":7,"C":6}}

### Trade snapshots missing: none

## Cross-module Trade Intelligence consistency

_Audit: `audit-ti-cross-module-consistency.ts` · 74 markets · 2026-06-28 run._

| Check | Result |
|-------|--------|
| SDM cells present | ✅ 592/592 (600 rows incl. duplicates filtered at API) |
| Caribbean AGOA bleed | ✅ 0 failures — no Caribbean cells marked `agoa_eligible` without CBTPA |
| Census snapshots | ✅ 74/74 markets |
| SDM sector sum vs Census bilateral | ℹ️ 23 warnings — sector `current_trade_usd` sums can exceed Census headline when sectors overlap or use category-flow vintage; not a hard failure |
| COD dual-source | ℹ️ Documented — Census $218M vs AGOA flows $323M |
| Tier-A USTR links | ℹ️ KEN, ZAF missing from USTR directory scrape — curated seed path available |

## Supply-Demand Matrix field semantics (Phase 2.5)

| Field | Scope | Notes |
|-------|-------|-------|
| `export_volume_usd` | Country × sector export capacity (all destinations) | e.g. Kenya agriculture ~$3.5B |
| `current_trade_usd` | Bilateral exports to U.S. in sector | e.g. Kenya agriculture ~$420M to U.S. |
| `us_import_volume_usd` | U.S. sector import total | Same value for all 74 countries in a sector (e.g. ~$165B U.S. ag imports) |
| `export_products` | Top products in cell drawer | Flow-backed from AGOA/CBTPA when rows exist; else scaled sector template |
| Reverse-flow Import Needs | Country import demand | **Score only** until Comtrade country-sector data — no fabricated country-specific $ |

_Audit: `audit-sdm-data-consistency.ts` · 275 flow-backed + 323 template-backed export product cells._
