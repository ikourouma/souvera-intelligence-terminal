# Souvera Intelligence Terminal — Project Backlog
**Owner:** Afronovation, Inc.  
**Last Updated:** April 29, 2026

---

## About This Document

This backlog tracks future engineering work, enhancements, and technical debt that are not part of the current sprint. Items are categorized by type and prioritized for future phases.

**Backlog Entry Format:**
```
CATEGORY-###: Title
Priority: Critical | High | Medium | Low
Phase: Phase # or Future
Status: Proposed | Approved | In Progress | Blocked | Completed
```

---

## Data Governance

### DATA-GOV-01: Market Scope Governance for Public Intelligence Coverage
**Priority:** High  
**Phase:** Phase 4 (Data Governance & Ingestion Hardening)  
**Status:** Approved  
**Owner:** Engineering Team  
**Date Added:** April 29, 2026

#### Problem Statement

Souvera's current public intelligence mandate covers Africa and Caribbean markets only. The immediate fix (Phase 3) uses API-level filtering and an approved Caribbean ISO3 list hardcoded in `apps/api-gateway/src/lib/market-coverage.ts`.

**Current interim approach:**
- Africa = `is_african_country = true`
- Caribbean = hardcoded approved Caribbean ISO3 list (20 markets)
- All Regions = Africa + approved Caribbean ISO3 list
- Implemented at API level and reinforced by frontend defensive filtering

**Why this is interim:**
This approach is acceptable for current stabilization sprint but not ideal long-term because:
1. REST Countries ingestion may include all global countries
2. Future corridors (diaspora, trade zones) may require multi-scope classification
3. Hardcoded ISO lists are not scalable
4. No governance model for "known country in registry" vs "published Souvera market"

#### Future Architecture Options

##### Option A: Interim Boolean Flag
Add to `souvera_countries` table:
```sql
is_caribbean_territory boolean default false
```

**Pros:**
- Simple to implement
- Easy to query
- Low migration complexity
- Useful if only Africa + Caribbean are needed

**Cons:**
- Less flexible for future expansion
- Requires additional boolean columns for new corridors
- Not ideal for multi-scope markets (Guyana, Suriname, Belize, Puerto Rico)
- Doesn't support future diaspora corridors or gated visibility

##### Option B: Scalable Array Model (Recommended)
Add to `souvera_countries` table:
```sql
market_scope text[] default '{}'
```

**Example values:**
- `['africa', 'public_preview']` — African country, visible on public intelligence pages
- `['caribbean', 'public_preview']` — Caribbean market, visible on public pages
- `['caribbean', 'diaspora_corridor', 'public_preview']` — Multi-scope (Guyana, Suriname, Belize)
- `['africa', 'institutional_only']` — African country, gated for institutional users only

**Pros:**
- ✅ Scalable to any number of corridors/regions
- ✅ Supports multiple scopes per country/territory
- ✅ Supports public vs gated visibility controls
- ✅ Better for ingestion governance (distinguish "known" vs "published")
- ✅ Better for AfDEC-lite and enterprise API boundaries
- ✅ Aligns with future product expansion

**Cons:**
- ⚠️ Requires database migration
- ⚠️ Requires API query updates
- ⚠️ Requires ingestion adapter updates
- ⚠️ Requires admin documentation
- ⚠️ Requires testing across all APIs and pages

#### Recommended Decision

**Do not implement either option in Phase 3 (current sprint).**

**Recommended approach:**
1. Complete Phase 3 with API-level filtering and hardcoded ISO lists
2. Add `market_scope text[] default '{}'` to Phase 4 (Data Governance & Ingestion Hardening)
3. Only consider `is_caribbean_territory` boolean if a quick interim flag becomes necessary before full governance

#### Acceptance Criteria (Phase 4 Implementation)

When implementing in Phase 4:

1. ✅ Add `market_scope text[] default '{}'` column to `souvera_countries` table
2. ✅ Backfill existing African countries with `['africa', 'public_preview']`
3. ✅ Backfill approved Caribbean markets with `['caribbean', 'public_preview']`
4. ✅ Update REST Countries ingestion adapter to not accidentally publish all global countries
5. ✅ Update `/api/v1/countries` to filter by `market_scope` instead of hardcoded ISO lists
6. ✅ Preserve approved Caribbean ISO list as validation fallback
7. ✅ Update `/intelligence/map`, `/intelligence/africa`, `/intelligence/caribbean` QA tests
8. ✅ Add admin documentation for future market-scope management
9. ✅ Create migration rollback script
10. ✅ Verify no public route exposes countries outside approved market scopes

#### Risk Notes

- ⚠️ **Data Retention:** Do not delete non-mandate countries from database unless separate data-retention decision is approved
- ⚠️ **Public Visibility:** Must be controlled by API logic and `market_scope`, not by raw `is_active` alone
- ⚠️ **Ingestion Governance:** Future ingestion must distinguish "country in registry" from "published Souvera market"
- ⚠️ **Multi-Scope Edge Cases:** Guyana, Suriname, Belize need both `['caribbean', 'diaspora_corridor']` scopes

#### Dependencies

- Phase 3 completion (API filtering, market grids, compare page)
- REST Countries ingestion adapter exists
- Admin panel for market-scope management (future)

#### Estimated Effort

- Database migration: 1 hour
- API updates: 2-3 hours
- Ingestion adapter updates: 2 hours
- Testing: 4 hours
- Documentation: 2 hours
- **Total:** ~1-2 days

#### Related Documents

- [Market Scope Governance Architecture](../architecture/market-scope-governance.md)
- [Decision Log: Defer Schema Changes](../operations/decision-log.md)
- [Market Coverage Constants](../../apps/api-gateway/src/lib/market-coverage.ts)
- [Phase 4 Roadmap](./phase-roadmap.md)

---

## Frontend Enhancements

_Add frontend enhancement backlog items here._

---

## API Improvements

_Add API improvement backlog items here._

---

## Performance Optimization

_Add performance optimization backlog items here._

---

## Technical Debt

_Add technical debt items here._

---

## Backlog Management

### Adding New Items

1. Assign a category and sequential ID (e.g., DATA-GOV-02, FE-ENH-01)
2. Set priority based on business impact and urgency
3. Assign to appropriate phase in roadmap
4. Update status as work progresses
5. Link to related documents

### Priority Definitions

- **Critical:** Blocking production launch or major feature
- **High:** Important for product quality or user experience
- **Medium:** Nice-to-have improvement
- **Low:** Future consideration

### Status Definitions

- **Proposed:** Idea suggested, not yet approved
- **Approved:** Accepted for future implementation
- **In Progress:** Currently being worked on
- **Blocked:** Waiting on dependencies or decisions
- **Completed:** Implementation finished and deployed

---

**Last Review:** April 29, 2026  
**Next Review:** Weekly during sprint planning
