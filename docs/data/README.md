# Souvera data layer (institutional v2)

## Top 20 indicators (World Bank WDI)

- Catalog: `apps/api-gateway/src/lib/indicators/top20.ts`
- Ingestion: `npx tsx services/ingestion/run.ts worldbank-top20`
- DB seed: `infra/supabase/seed-source-registry-expanded.sql`

## IMF fiscal / FX / governance

| Adapter | Command | Output |
|---------|---------|--------|
| IMF WEO SDMX | `npx tsx services/ingestion/run.ts imf-fiscal` | `debt_to_gdp_pct`, `fiscal_balance_pct_gdp` observations |
| IMF AREAER FX | `npx tsx services/ingestion/run.ts imf-areaer-fx` | `fx_regime_category` (text) |
| World Bank WGI | `npx tsx services/ingestion/run.ts worldbank-wgi` | `wgi_governance_estimate` |

## Evidence Vault + policy verification

Apply migrations (in order):

1. `infra/supabase/migrations/create-evidence-vault-policy-status.sql`
2. `infra/supabase/migrations/create-souvera-entities.sql`
3. `infra/supabase/migrations/seed-souvera-entities.sql`

| Job | Command |
|-----|---------|
| Entity registry seed | `npx tsx services/ingestion/run.ts seed:entities` |
| USTR AGOA | `npx tsx services/ingestion/run.ts verify:ustr:agoa` |
| USTR CBI (evidence-only) | `npx tsx services/ingestion/run.ts verify:ustr:cbi` |
| AfCFTA / ECOWAS | `npx tsx services/ingestion/run.ts verify:regional` |
| CARICOM (member / associate / not_a_member) | `npx tsx services/ingestion/run.ts verify:caricom` |
| All verification | `npx tsx services/ingestion/run.ts verify:all` |

Tables: `souvera_entities`, `souvera_evidence_artifacts`, `souvera_country_policy_status` (not `souvera_policy_status` — that name is reserved for the Phase 4B publication enum)

Policy audit (daily):

```bash
npx tsx scripts/audit-policy-status-coverage.ts
```

Output: `tmp/policy-status-audit.md`

## USTR anchor pages + Africa directory (map links)

Apply: `infra/supabase/migrations/create-external-reference-links.sql`

| Job | Command |
|-----|---------|
| Snapshot program anchors + directory | `npx tsx services/ingestion/run.ts capture:ustr:anchors` |
| Parse Africa directory → link table | `npx tsx services/ingestion/run.ts parse:ustr:africa_directory` |
| Coverage audit vs 54 Africa ISO3 | `npx tsx scripts/audit-ustr-africa-coverage.ts` |

Tables: `souvera_external_reference_links` (`ref_type = USTR_COUNTRY_PAGE`)

USTR program anchors are **citations only**; AGOA/CBI eligibility still comes from year-specific list artifacts (`verify:ustr:agoa`, `verify:ustr:cbi`). Africa directory links are **UI-only** (map tooltip + country panel), not PDF URLs.

Reports read policy from Evidence Vault via `policy-status-db.ts` (fallback: Under review).

## Data credibility audit

```bash
npx tsx services/ingestion/run.ts audit:data-coverage
```

Output: `tmp/data-credibility-audit.md`

## Connectivity checks

```bash
cd apps/api-gateway
npx tsx scripts/check-sources-connectivity.ts
npx tsx scripts/check-candidate-sources.ts
```

## Sourced Data Backlog (Option 2)

```bash
cd apps/api-gateway
npx tsx scripts/generate-sourced-data-backlog.ts NGA JAM KEN
```

Output: `docs/data/sourced-data-backlog.md` (excludes Top 20 canonical series)
