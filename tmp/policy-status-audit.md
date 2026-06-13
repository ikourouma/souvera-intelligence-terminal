# Policy Status Audit — Phase 0B (2026-06-06)

Generated after `verify:ustr:agoa`, `verify:regional`, `verify:caricom`, `verify:ustr:cbi`.

## AGOA (54 Africa)

| Metric | Value |
|--------|-------|
| Rows populated | 54/54 |
| With evidence artifact | 54/54 |
| Eligible | 21 |
| Under review | 28 |
| Not applicable (North Africa) | 5 |

**Source:** USTR 2024 AGOA Eligible and Ineligible Countries PDF (discovered from program page).

**NGA:** `eligible` — USTR 2024 beneficiary list parse. Legislative watchpoint `nga-restoration-review` references vault reconciliation (no curated override).

## AfCFTA / ECOWAS

| Framework | Populated | Notes |
|-----------|-----------|-------|
| AfCFTA | 54/54 | 49 under_review; 5 not_applicable |
| ECOWAS | West Africa scope | via `verify:regional` |

## Caribbean

| Framework | Populated | Status breakdown |
|-----------|-----------|------------------|
| CBI | 20/20 | 14 eligible, 5 under_review, 1 not_applicable (CUB) |
| CARICOM | 20/20 | 12 member, 8 not_a_member |

**CARICOM URL fix:** `https://caricom.org/member-states-and-associate-members/`

## UI surfaces (Phase 0B.3)

- Country API `marketAccess` → Evidence Vault
- Overview tab cards → `buildOverviewMarketAccessItems(data.marketAccess)`
- Sidebar `MarketAccessSummary` → same API field
- Trade tab `agoaPolicy` → vault snapshot

## Re-run commands

```bash
npx tsx services/ingestion/run.ts verify:ustr:agoa
npx tsx services/ingestion/run.ts verify:regional
npx tsx services/ingestion/run.ts verify:caricom
npx tsx services/ingestion/run.ts verify:ustr:cbi
npx tsx apps/api-gateway/scripts/audit-policy-vault-coverage.ts
npx tsx apps/api-gateway/scripts/test-phase-0b-policy-consistency.ts
```
