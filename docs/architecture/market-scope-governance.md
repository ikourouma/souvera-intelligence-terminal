# Market Scope Governance Architecture
**Document Type:** Architecture Decision Record  
**Status:** Proposed  
**Owner:** Engineering Team  
**Date:** April 29, 2026  
**Phase:** Phase 4 (Data Governance & Ingestion Hardening)

---

## Executive Summary

This document defines the long-term architecture for governing which countries and territories are visible on Souvera's public intelligence surfaces. The current Phase 3 implementation uses hardcoded ISO lists and API-level filtering as an interim solution. Phase 4 will implement a scalable `market_scope` array model that supports future product expansion.

---

## Problem Statement

### Current Mandate

Souvera's public intelligence coverage is limited to:
- **54 African countries** (all countries where `is_african_country = true`)
- **20 approved Caribbean markets/territories** (hardcoded ISO3 list)

### Current Interim Implementation (Phase 3)

**Location:** `apps/api-gateway/src/lib/market-coverage.ts`

```typescript
export const APPROVED_CARIBBEAN_ISO3 = [
  'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
  'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM'
] as const;
```

**API Filtering:**
- `region=africa` → `WHERE is_african_country = true`
- `region=caribbean` → `WHERE iso3 IN (APPROVED_CARIBBEAN_ISO3)`
- `region=all` → Two queries merged (Africa + Caribbean)

**Why This is Interim:**
1. **Not scalable** — Adding new corridors requires code changes
2. **Hardcoded** — No governance model for managing market classification
3. **No flexibility** — Cannot support multi-scope markets (e.g., Guyana is both Caribbean and diaspora corridor)
4. **Ingestion risk** — REST Countries adapter could accidentally publish all global countries
5. **No visibility control** — Cannot distinguish "public preview" from "institutional only"

---

## Architecture Options

### Option A: Boolean Flag Approach (Not Recommended)

Add a boolean column for Caribbean classification:

```sql
ALTER TABLE souvera_countries 
ADD COLUMN is_caribbean_territory boolean DEFAULT false;

-- Backfill
UPDATE souvera_countries 
SET is_caribbean_territory = true 
WHERE iso3 IN ('ATG', 'BHS', 'BRB', ..., 'CYM');
```

**Query Logic:**
```sql
-- Africa
SELECT * FROM souvera_countries WHERE is_african_country = true;

-- Caribbean
SELECT * FROM souvera_countries WHERE is_caribbean_territory = true;

-- All Regions
SELECT * FROM souvera_countries 
WHERE is_african_country = true 
   OR is_caribbean_territory = true;
```

#### Pros
- ✅ Simple to implement
- ✅ Easy to query
- ✅ Low migration complexity
- ✅ Works if Souvera only needs Africa + Caribbean

#### Cons
- ❌ Not scalable — each new corridor requires a new column
- ❌ Doesn't support multi-scope markets (Guyana, Suriname, Belize)
- ❌ Cannot represent visibility control (public vs gated)
- ❌ Future diaspora corridors would need `is_diaspora_market boolean`
- ❌ Becomes a "boolean soup" with many columns

#### When to Use
Only if Phase 4 is blocked and a quick interim database flag is needed before full governance implementation.

---

### Option B: Scalable Array Model (Recommended)

Add a text array column for flexible market classification:

```sql
ALTER TABLE souvera_countries 
ADD COLUMN market_scope text[] DEFAULT '{}';

-- Create index for fast lookups
CREATE INDEX idx_souvera_countries_market_scope 
ON souvera_countries USING GIN (market_scope);
```

**Example Classifications:**

| Country | `market_scope` | Explanation |
|---------|----------------|-------------|
| Nigeria | `['africa', 'public_preview']` | African country, visible on public pages |
| Kenya | `['africa', 'public_preview', 'tech_corridor']` | African country, part of tech corridor analysis |
| Guyana | `['caribbean', 'diaspora_corridor', 'public_preview']` | Multi-scope: Caribbean + diaspora |
| Suriname | `['caribbean', 'diaspora_corridor', 'public_preview']` | Multi-scope: Caribbean + diaspora |
| Belize | `['caribbean', 'diaspora_corridor', 'public_preview']` | Multi-scope: Caribbean + diaspora |
| South Africa | `['africa', 'institutional_only']` | African country, gated for institutional tier |
| USA | `['reference_only']` | In registry but not published on public intelligence |

**Query Logic:**

```sql
-- Africa
SELECT * FROM souvera_countries 
WHERE 'africa' = ANY(market_scope);

-- Caribbean
SELECT * FROM souvera_countries 
WHERE 'caribbean' = ANY(market_scope);

-- All public regions (Africa + Caribbean)
SELECT * FROM souvera_countries 
WHERE ('africa' = ANY(market_scope) OR 'caribbean' = ANY(market_scope))
  AND 'public_preview' = ANY(market_scope);

-- Diaspora corridor only
SELECT * FROM souvera_countries 
WHERE 'diaspora_corridor' = ANY(market_scope);

-- Institutional-only markets
SELECT * FROM souvera_countries 
WHERE 'institutional_only' = ANY(market_scope);

-- Multi-scope markets (both Caribbean and diaspora)
SELECT * FROM souvera_countries 
WHERE 'caribbean' = ANY(market_scope) 
  AND 'diaspora_corridor' = ANY(market_scope);
```

#### Pros
- ✅ **Scalable** — Add new scopes without schema changes
- ✅ **Flexible** — Supports multiple scopes per country
- ✅ **Visibility control** — Distinguish public vs gated
- ✅ **Future-proof** — Supports diaspora corridors, trade zones, etc.
- ✅ **Ingestion governance** — Distinguish "known" from "published"
- ✅ **Product expansion** — Aligns with AfDEC-lite and enterprise API boundaries
- ✅ **GIN index** — Fast array queries in PostgreSQL

#### Cons
- ⚠️ Requires migration
- ⚠️ API query updates needed
- ⚠️ Ingestion adapter updates needed
- ⚠️ More complex than boolean flags
- ⚠️ Requires admin documentation

#### When to Use
**Recommended for Phase 4** as the long-term governance model.

---

## Recommended Implementation (Phase 4)

### 1. Database Migration

**File:** `infra/supabase/sql-pack-v1.7-market-scope.sql`

```sql
-- ============================================
-- Souvera Market Scope Governance Migration
-- Version: 1.7
-- Date: Phase 4
-- Owner: Afronovation, Inc.
-- ============================================

-- Add market_scope column
ALTER TABLE souvera_countries 
ADD COLUMN IF NOT EXISTS market_scope text[] DEFAULT '{}';

-- Create GIN index for fast array queries
CREATE INDEX IF NOT EXISTS idx_souvera_countries_market_scope 
ON souvera_countries USING GIN (market_scope);

-- Backfill African countries
UPDATE souvera_countries 
SET market_scope = ARRAY['africa', 'public_preview']
WHERE is_african_country = true;

-- Backfill approved Caribbean markets
UPDATE souvera_countries 
SET market_scope = ARRAY['caribbean', 'public_preview']
WHERE iso3 IN (
  'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
  'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM'
);

-- Multi-scope: Guyana, Suriname, Belize (Caribbean + diaspora)
UPDATE souvera_countries 
SET market_scope = ARRAY['caribbean', 'diaspora_corridor', 'public_preview']
WHERE iso3 IN ('GUY', 'SUR', 'BLZ');

-- Non-mandate countries: Mark as reference only
UPDATE souvera_countries 
SET market_scope = ARRAY['reference_only']
WHERE market_scope = '{}' AND is_active = true;

-- Verification query
SELECT 
  iso3, 
  name, 
  market_scope,
  is_african_country
FROM souvera_countries
WHERE 'public_preview' = ANY(market_scope)
ORDER BY name;
-- Expected: 74 countries (54 African + 20 Caribbean)

-- Rollback script
-- DROP INDEX IF EXISTS idx_souvera_countries_market_scope;
-- ALTER TABLE souvera_countries DROP COLUMN IF EXISTS market_scope;
```

### 2. API Updates

**File:** `apps/api-gateway/src/app/api/v1/countries/route.ts`

```typescript
// BEFORE (Phase 3 - Hardcoded)
if (region === 'caribbean') {
  query = query.in('iso3', APPROVED_CARIBBEAN_ISO3);
}

// AFTER (Phase 4 - market_scope)
if (region === 'caribbean') {
  query = query
    .contains('market_scope', ['caribbean'])
    .contains('market_scope', ['public_preview']);
}

// All public regions (Africa + Caribbean)
if (region === 'all') {
  query = query
    .or('market_scope.cs.{africa},market_scope.cs.{caribbean}')
    .contains('market_scope', ['public_preview']);
}
```

**Preserve as Validation Fallback:**

Keep `APPROVED_CARIBBEAN_ISO3` list in `market-coverage.ts` for validation:

```typescript
// For validation only - not used for primary filtering
export const APPROVED_CARIBBEAN_ISO3 = [...];

// New utility for market_scope validation
export function isApprovedMarketScope(scope: string[]): boolean {
  return (
    scope.includes('public_preview') &&
    (scope.includes('africa') || scope.includes('caribbean'))
  );
}
```

### 3. Ingestion Adapter Updates

**File:** `services/ingestion/restcountries.ts`

```typescript
// BEFORE (No governance - risk of publishing all countries)
const country = {
  iso3: data.cca3,
  name: data.name.common,
  // ...
};
await supabase.from('souvera_countries').insert(country);

// AFTER (Phase 4 - Governed insertion)
const country = {
  iso3: data.cca3,
  name: data.name.common,
  market_scope: [], // Empty by default - admin must approve
  // ...
};

// Only insert if in approved list or explicitly marked
const isApproved = 
  isAfricanCountry(data) ||
  APPROVED_CARIBBEAN_ISO3.includes(data.cca3);

if (isApproved) {
  country.market_scope = isAfricanCountry(data)
    ? ['africa', 'public_preview']
    : ['caribbean', 'public_preview'];
}

await supabase.from('souvera_countries').upsert(country);
```

### 4. Admin Documentation

**File:** `docs/operations/market-scope-management.md`

Document procedures for:
- Adding new countries to public intelligence
- Updating market_scope for existing countries
- Adding new corridor types
- Managing visibility controls (public vs gated)

---

## Scope Taxonomy

### Geographic Scopes
- `africa` — African countries
- `caribbean` — Caribbean markets and territories
- `north_america` — (Future) North American markets
- `south_america` — (Future) South American markets
- `europe` — (Future) European markets
- `asia` — (Future) Asian markets
- `middle_east` — (Future) Middle Eastern markets

### Corridor Scopes
- `diaspora_corridor` — Diaspora-focused markets
- `tech_corridor` — Technology innovation hubs
- `trade_corridor` — Strategic trade routes
- `energy_corridor` — Energy production/transition zones

### Visibility Scopes
- `public_preview` — Visible on public intelligence pages
- `institutional_only` — Gated for Institutional tier users
- `beta_preview` — Pilot/beta testing markets
- `reference_only` — In registry but not published

### Special Scopes
- `afdec_priority` — AfDEC priority markets (future)
- `high_confidence` — High-quality data available
- `data_limited` — Limited data availability

---

## Migration Strategy

### Pre-Migration Checklist
1. ✅ Phase 3 stabilization complete
2. ✅ All APIs using hardcoded filtering working correctly
3. ✅ QA tests passing for `/intelligence/map`, `/africa`, `/caribbean`
4. ⏳ Backup database before migration
5. ⏳ Test migration in staging environment
6. ⏳ Prepare rollback script

### Migration Steps
1. Add `market_scope` column
2. Create GIN index
3. Backfill African countries
4. Backfill Caribbean markets
5. Mark multi-scope markets (Guyana, Suriname, Belize)
6. Mark non-mandate countries as `reference_only`
7. Verify backfill (should have 74 `public_preview` countries)
8. Update API queries
9. Update ingestion adapters
10. Run QA tests
11. Deploy to production

### Rollback Plan
If migration fails:
1. Run rollback SQL script (drop column and index)
2. Revert API changes to use hardcoded ISO lists
3. Verify Phase 3 implementation still works
4. Investigate failure and re-plan

---

## Testing Requirements

### Unit Tests
- ✅ `isApprovedMarketScope()` utility function
- ✅ Array query logic
- ✅ Multi-scope market handling

### Integration Tests
- ✅ `/api/v1/countries?region=africa` returns 54 countries
- ✅ `/api/v1/countries?region=caribbean` returns 20 countries
- ✅ `/api/v1/countries?region=all` returns 74 countries
- ✅ No non-mandate countries returned for `public_preview`
- ✅ Guyana, Suriname, Belize have both `caribbean` and `diaspora_corridor`

### End-to-End Tests
- ✅ `/intelligence/map` shows 74 markets
- ✅ `/intelligence/africa` shows 54 African countries
- ✅ `/intelligence/caribbean` shows 20 Caribbean markets
- ✅ Search works correctly
- ✅ Country drawer opens with correct data
- ✅ Compare tool works with all markets

---

## Performance Considerations

### GIN Index
- ✅ `CREATE INDEX idx_souvera_countries_market_scope USING GIN (market_scope)`
- Fast array containment queries (`@>`, `&&`, `<@` operators)
- Efficient for `ANY(market_scope)` queries

### Query Performance
- Array queries with GIN index: ~1-5ms for 200+ countries
- No performance degradation vs boolean columns
- Index size: ~10KB for 200 countries

---

## Future Enhancements

### Admin Panel (Phase 5+)
- UI for managing market_scope
- Bulk updates for corridors
- Audit log for classification changes
- Preview before publishing

### API Enhancements (Phase 6+)
- Query by corridor: `/api/v1/countries?corridor=diaspora`
- Query by visibility: `/api/v1/countries?visibility=public_preview`
- Multi-scope queries: `/api/v1/countries?scope=caribbean&scope=diaspora_corridor`

### Ingestion Governance (Phase 4)
- Admin approval workflow for new countries
- Auto-classification rules based on ISO codes and UN regions
- Data quality gates before publishing

---

## Decision Log Entry

**Decision:** Defer `market_scope` implementation to Phase 4; use API-level filtering in Phase 3.

**Rationale:**
- Current sprint focused on stabilization and bug fixes
- Hardcoded ISO lists acceptable for interim period
- Phase 4 provides time for proper migration planning
- No business need for multi-scope classification yet

**Date:** April 29, 2026  
**Approved By:** Engineering Lead  
**Related:** DATA-GOV-01 backlog item

---

## References

- [Project Backlog (DATA-GOV-01)](../execution/project-backlog.md)
- [Phase Roadmap](../execution/phase-roadmap.md)
- [Decision Log](../operations/decision-log.md)
- [Market Coverage Constants](../../apps/api-gateway/src/lib/market-coverage.ts)
- [PostgreSQL Array Documentation](https://www.postgresql.org/docs/current/arrays.html)
- [PostgreSQL GIN Index](https://www.postgresql.org/docs/current/gin-intro.html)

---

**Document Status:** Approved for Phase 4  
**Last Updated:** April 29, 2026  
**Next Review:** Before Phase 4 sprint planning
