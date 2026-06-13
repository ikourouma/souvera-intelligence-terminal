# 74-Market Top 20 Coverage Audit — 2026-06-10

**Run:** `npm run check:all74-top20` (scripts/check-all74-top20-coverage.ts)  
**Threshold:** ≥15/20 Top 20 keys required for Phase 2 SDM scoring  
**Rollout standard:** ≥18/20 for the 12 rollout markets  
**Result:** **64/74 markets pass** (10 markets require gap-fill)

---

## Executive summary

Africa coverage is strong — **51/54 markets (94%)** meet the ≥15/20 Phase 2 gate. The 3 failing African markets are all structurally data-limited countries (Eritrea, Somalia, South Sudan) where World Bank and IMF have constrained reporting. Caribbean coverage is weaker — **13/20 markets (65%)** pass, with 7 failing markets almost entirely concentrated in small island territories and sanctioned/US states with non-standard data reporting.

**Phase 2 SDM can launch for 64 markets immediately** once Phase 1 policy vault is complete. The remaining 10 markets should be filled where possible; where structural ceilings apply, they receive a "Limited coverage" badge rather than blocking the platform.

---

## Full audit results

### Africa — 51/54 passing

| ISO3 | Market | Score | Status | Gap |
|------|--------|-------|--------|-----|
| MAR | Morocco | 18/20 | ✅ | — |
| DZA | Algeria | 18/20 | ✅ | — |
| TUN | Tunisia | 18/20 | ✅ | — |
| LBY | Libya | 17/20 | ✅ | — |
| EGY | Egypt | 18/20 | ✅ | — |
| SDN | Sudan | 16/20 | ✅ | — |
| NGA | Nigeria | 18/20 | ✅ | — |
| GHA | Ghana | 18/20 | ✅ | — |
| SEN | Senegal | 19/20 | ✅ | — |
| MLI | Mali | 17/20 | ✅ | — |
| BFA | Burkina Faso | 17/20 | ✅ | — |
| NER | Niger | 17/20 | ✅ | — |
| GIN | Guinea | 18/20 | ✅ | — |
| SLE | Sierra Leone | 18/20 | ✅ | — |
| LBR | Liberia | 15/20 | ✅ | — |
| CIV | Côte d'Ivoire | 19/20 | ✅ | — |
| TGO | Togo | 17/20 | ✅ | — |
| BEN | Benin | 17/20 | ✅ | — |
| GMB | Gambia | 18/20 | ✅ | — |
| GNB | Guinea-Bissau | 17/20 | ✅ | — |
| CPV | Cabo Verde | 18/20 | ✅ | — |
| MRT | Mauritania | 18/20 | ✅ | — |
| ETH | Ethiopia | 18/20 | ✅ | — |
| KEN | Kenya | 18/20 | ✅ | — |
| TZA | Tanzania | 19/20 | ✅ | — |
| UGA | Uganda | 18/20 | ✅ | — |
| RWA | Rwanda | 18/20 | ✅ | — |
| BDI | Burundi | 15/20 | ✅ | — |
| **SOM** | **Somalia** | **13/20** | **⚠️ BELOW** | **2 keys** |
| DJI | Djibouti | 18/20 | ✅ | — |
| **ERI** | **Eritrea** | **8/20** | **⚠️ BELOW** | **7 keys** |
| MDG | Madagascar | 18/20 | ✅ | — |
| COM | Comoros | 18/20 | ✅ | — |
| MUS | Mauritius | 18/20 | ✅ | — |
| SYC | Seychelles | 17/20 | ✅ | — |
| **SSD** | **South Sudan** | **11/20** | **⚠️ BELOW** | **4 keys** |
| CMR | Cameroon | 18/20 | ✅ | — |
| CAF | Central African Republic | 16/20 | ✅ | — |
| COD | DR Congo | 17/20 | ✅ | — |
| COG | Republic of Congo | 18/20 | ✅ | — |
| GAB | Gabon | 16/20 | ✅ | — |
| GNQ | Equatorial Guinea | 16/20 | ✅ | — |
| STP | São Tomé and Príncipe | 15/20 | ✅ | — |
| TCD | Chad | 16/20 | ✅ | — |
| AGO | Angola | 18/20 | ✅ | — |
| ZAF | South Africa | 18/20 | ✅ | — |
| BWA | Botswana | 18/20 | ✅ | — |
| LSO | Lesotho | 18/20 | ✅ | — |
| SWZ | Eswatini | 17/20 | ✅ | — |
| NAM | Namibia | 18/20 | ✅ | — |
| ZWE | Zimbabwe | 18/20 | ✅ | — |
| MOZ | Mozambique | 18/20 | ✅ | — |
| ZMB | Zambia | 18/20 | ✅ | — |
| MWI | Malawi | 18/20 | ✅ | — |

### Caribbean — 13/20 passing

| ISO3 | Market | Score | Status | Gap | Type |
|------|--------|-------|--------|-----|------|
| ATG | Antigua and Barbuda | 17/20 | ✅ | — | Independent |
| BHS | Bahamas | 18/20 | ✅ | — | Independent |
| BRB | Barbados | 18/20 | ✅ | — | Independent |
| **CUB** | **Cuba** | **12/20** | **⚠️ BELOW** | **3 keys** | Sanctioned — data limited |
| **DMA** | **Dominica** | **14/20** | **⚠️ BELOW** | **1 key** | Independent — near gate |
| DOM | Dominican Republic | 18/20 | ✅ | — | Independent |
| **GRD** | **Grenada** | **14/20** | **⚠️ BELOW** | **1 key** | Independent — near gate |
| HTI | Haiti | 18/20 | ✅ | — | Independent |
| JAM | Jamaica | 18/20 | ✅ | — | Independent |
| **KNA** | **St. Kitts and Nevis** | **14/20** | **⚠️ BELOW** | **1 key** | Independent — near gate |
| LCA | St. Lucia | 15/20 | ✅ | — | Independent |
| VCT | St. Vincent and the Grenadines | 15/20 | ✅ | — | Independent |
| SUR | Suriname | 15/20 | ✅ | — | Independent |
| TTO | Trinidad and Tobago | 18/20 | ✅ | — | Independent |
| GUY | Guyana | 15/20 | ✅ | — | Independent |
| BLZ | Belize | 18/20 | ✅ | — | Independent |
| **PRI** | **Puerto Rico** | **13/20** | **⚠️ BELOW** | **2 keys** | US territory — structural |
| **VGB** | **British Virgin Islands** | **5/20** | **⚠️ BELOW** | **10 keys** | UK territory — structural |
| **TCA** | **Turks and Caicos** | **9/20** | **⚠️ BELOW** | **6 keys** | UK territory — structural |
| CYM | Cayman Islands | 15/20 | ✅ | — | UK territory |

---

## Gap classification and closure plan

### Tier A — Quick wins (1 key missing) — target: close within 1 week

| Market | Keys needed | Best source | Action |
|--------|-------------|-------------|--------|
| DMA (Dominica) | 1 key | IMF DataMapper / UN DESA | Run `imf-rollout-gap-fill` for DMA |
| GRD (Grenada) | 1 key | IMF DataMapper / UN DESA | Run `imf-rollout-gap-fill` for GRD |
| KNA (St. Kitts and Nevis) | 1 key | IMF DataMapper / IMF WEO | Run `imf-rollout-gap-fill` for KNA |

These 3 markets are **1 key away from the ≥15/20 gate**. A single targeted IMF DataMapper or WEO ingest pass closes all three.

### Tier B — Achievable with targeted fill (2–4 keys missing) — target: 2 weeks

| Market | Keys needed | Best source | Notes |
|--------|-------------|-------------|-------|
| SOM (Somalia) | 2 keys | UN DESA / IMF WEO | Conflict-affected but IMF tracks; GDP and trade basics available |
| SSD (South Sudan) | 4 keys | IMF WEO / World Bank | Youngest nation (2011); GDP + FDI + trade keys partially available |
| CUB (Cuba) | 3 keys | UN COMTRADE / CEPAL | Sanctioned — US Treasury data limits; UN CEPAL has trade data |
| PRI (Puerto Rico) | 2 keys | US BEA / Census Bureau | US territory — data tracked by BEA, not WB/IMF standard keys |

Action: Run diagnostic script per market to identify exactly which keys are missing, then target-ingest from the specified sources.

### Tier C — Structural data ceiling (5+ keys missing) — label as "Limited coverage"

| Market | Keys | Root cause | Platform decision |
|--------|------|------------|-------------------|
| ERI (Eritrea) | 8/20 | Political isolation; WB+IMF reporting suspended | Display "Limited data coverage" badge. Do not block SDM — show available keys, grey out missing cells |
| VGB (British Virgin Islands) | 5/20 | UK overseas territory; no IMF Article IV; no WB national accounts | "Territory — limited coverage" badge. Offshore financial center, minimal production economy |
| TCA (Turks and Caicos) | 9/20 | UK overseas territory; no independent national accounts | "Territory — limited coverage" badge |

These 3 markets have structural data ceilings that cannot be closed by ingestion — the data simply does not exist in international repositories. The correct platform response is a "Limited coverage" badge with honest display of available keys, not a broken or empty terminal.

---

## Phase 2 SDM readiness

| Region | Markets passing | Total | % | SDM-ready? |
|--------|-----------------|-------|---|-----------|
| Africa | 51 | 54 | 94% | ✅ 51 markets launch with Phase 2 |
| Caribbean | 13 | 20 | 65% | ✅ 13 markets; 3 more with Tier A fill |
| **Total** | **64** | **74** | **86%** | **64/74 Phase 2 ready now** |
| After Tier A fix | **67** | **74** | **91%** | DMA + GRD + KNA added |
| After Tier B fix | **71** | **74** | **96%** | SOM + SSD + CUB + PRI added |
| After Tier C label | **74** | **74** | **100%** | ERI + VGB + TCA with "Limited coverage" badge |

---

## Recommended gap-closure sequence

### Step 1 — Run diagnostic for all 10 failing markets (today)

```bash
# From apps/api-gateway — identify exactly which keys are missing per market
npx tsx scripts/diagnose-rollout-top20-gaps.ts SOM ERI SSD CUB DMA GRD KNA PRI VGB TCA
```

### Step 2 — Tier A: 3 near-gate Caribbean markets (today or tomorrow)

```bash
# IMF DataMapper gap fill targeting DMA, GRD, KNA
# Identify keys via diagnostic first, then run ingestion
cd services/ingestion
npx tsx run.ts imf-rollout-gap-fill --iso3 DMA GRD KNA
```

### Step 3 — Tier B: SOM, SSD, CUB, PRI (week 1)

- **SOM/SSD**: IMF WEO April 2025 has economic projections for both. Use `imf-weo-fill` or curated macro for missing keys.
- **CUB**: UN ECLAC (CEPAL) holds Caribbean trade data where WB/IMF coverage is thin.
- **PRI**: US BEA Puerto Rico accounts have GDP and trade flows not in WB standard format. May require a curated-trade-macro-fill entry.

### Step 4 — Tier C: Label structural gaps (week 1)

Update the country display logic: if `top20_coverage < 15`, show a "Limited data coverage" amber banner on the country terminal instead of empty metrics. ERI, VGB, TCA should never be "broken" pages — they should be honest about coverage limits.

### Step 5 — Re-run audit to confirm (week 1–2)

```bash
npm run check:all74-top20
```

Target: 71/74 passing (96%) + 3 with "Limited coverage" badges.

---

## Rollout market check (all 12 must remain ≥18/20)

All 12 rollout markets confirmed ✅ at time of audit:
NGA 18 · JAM 18 · KEN 18 · GHA 18 · ZAF 18 · ETH 18 · SEN 19 · CIV 19 · TZA 19 · TTO 18 · BRB 18 · BHS 18

No regression. Rollout markets are Phase 0C-closed and hold their ≥18/20 floor.

---

## What this unlocks

Once Tier A (3 markets) and Tier B (4 markets) are filled and Tier C is labelled:

1. **Phase 0X is closed** — 74-market data wave complete
2. **Phase 0D/E/F can proceed** — narrative governance, anti-hardcode sweep, integrity CI
3. **Phase 1 can proceed** — trade framework vault for all 74 markets
4. **Phase 2 SDM has a clean data foundation** — 74 × 8 = 592 cells, observation-backed, no static seeds

---

*Audit run: 2026-06-10 · Script: `apps/api-gateway/scripts/check-all74-top20-coverage.ts` · Threshold: ≥15/20*
