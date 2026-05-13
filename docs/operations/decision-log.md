# Souvera Intelligence Terminal — Decision Log
**Owner:** Afronovation, Inc.  
**Purpose:** Track key technical and architectural decisions  
**Last Updated:** April 29, 2026

---

## About This Document

This log records significant technical decisions, their rationale, alternatives considered, and outcomes. Each entry includes context, decision details, and references to related documentation.

**Entry Format:**
```
### DEC-###: Decision Title
**Date:** YYYY-MM-DD
**Status:** Proposed | Approved | Implemented | Superseded
**Owner:** [Team/Person]
**Category:** Architecture | API | Database | Frontend | Infrastructure | Product

**Context:** [Background and problem statement]

**Decision:** [What was decided]

**Rationale:** [Why this was chosen]

**Alternatives Considered:** [Other options and why they weren't chosen]

**Consequences:** [Impact and trade-offs]

**Related:** [Links to backlog, architecture docs, etc.]
```

---

## Database Decisions

### DEC-001: Defer Market Scope Governance Schema Changes to Phase 4
**Date:** April 29, 2026  
**Status:** Approved  
**Owner:** Engineering Team  
**Category:** Database | Architecture

#### Context

Souvera's public intelligence mandate covers Africa (54 countries) and Caribbean (20 markets/territories). The immediate Phase 3 implementation uses:
- `is_african_country = true` for African filtering
- Hardcoded approved Caribbean ISO3 list in `apps/api-gateway/src/lib/market-coverage.ts`
- API-level filtering enforced in `/api/v1/countries`
- Frontend defensive filtering as safety layer

This works for Phase 3 stabilization but is not ideal long-term because:
1. REST Countries ingestion may include all global countries
2. Hardcoded ISO lists are not scalable
3. Future corridors (diaspora, trade zones) require multi-scope classification
4. No governance model for "known country" vs "published market"

#### Decision

**Do not implement database schema changes in Phase 3 (current sprint).**

Continue using API-level filtering with hardcoded ISO lists as interim solution. Defer `market_scope text[]` column implementation to Phase 4 (Data Governance & Ingestion Hardening).

#### Rationale

1. **Sprint Focus:** Phase 3 is focused on stabilization, bug fixes, and UX polish — not schema changes
2. **Risk Management:** Database migrations introduce risk; Phase 3 requires stability
3. **Time for Planning:** Phase 4 provides time for proper migration planning and testing
4. **Business Priority:** No immediate business need for multi-scope classification
5. **Interim Solution Works:** API-level filtering with hardcoded lists is sufficient for current mandate
6. **Future-Proof:** Phase 4 implementation of `market_scope text[]` will be more robust

#### Alternatives Considered

**Option A: Add `is_caribbean_territory boolean` now**
- **Pros:** Simple, quick to implement
- **Cons:** Not scalable, requires more booleans for future corridors
- **Why rejected:** Doesn't solve long-term problem, just adds technical debt

**Option B: Implement `market_scope text[]` immediately in Phase 3**
- **Pros:** Future-proof solution now
- **Cons:** Adds risk to stabilization sprint, requires extensive testing
- **Why rejected:** Too risky for current sprint priorities

**Option C: Use hardcoded lists permanently**
- **Pros:** Simple, no schema changes ever
- **Cons:** Not scalable, requires code changes for new corridors
- **Why rejected:** Not sustainable long-term

**Selected: Option D — Defer to Phase 4**
- Use interim hardcoded lists now (Phase 3)
- Implement proper `market_scope text[]` later (Phase 4)
- Balance risk, time, and future scalability

#### Consequences

**Positive:**
- ✅ Phase 3 remains focused on stabilization
- ✅ No database migration risk in current sprint
- ✅ Time to plan robust Phase 4 implementation
- ✅ Interim solution (hardcoded lists) works for current needs

**Negative:**
- ⚠️ Hardcoded ISO lists must be maintained until Phase 4
- ⚠️ Cannot support multi-scope markets (Guyana, Suriname, Belize) until Phase 4
- ⚠️ Future corridors require code changes until Phase 4
- ⚠️ REST Countries ingestion must be monitored to prevent accidental global publishing

**Mitigation:**
- Document hardcoded lists as interim in code comments
- Add DATA-GOV-01 to Phase 4 backlog with full implementation plan
- Monitor ingestion to prevent non-mandate countries appearing
- Keep approved Caribbean ISO list as validation fallback in Phase 4

#### Implementation Notes

**Phase 3 (Current):**
- ✅ Use `apps/api-gateway/src/lib/market-coverage.ts` with hardcoded `APPROVED_CARIBBEAN_ISO3`
- ✅ Filter at API level in `/api/v1/countries`
- ✅ Add frontend defensive filtering
- ✅ Document as interim solution

**Phase 4 (Future):**
- ⏳ Add `market_scope text[]` column to `souvera_countries`
- ⏳ Backfill African countries with `['africa', 'public_preview']`
- ⏳ Backfill Caribbean markets with `['caribbean', 'public_preview']`
- ⏳ Update API queries to use `market_scope`
- ⏳ Update ingestion adapters
- ⏳ Preserve hardcoded list as validation fallback

#### Related Documentation

- [Project Backlog: DATA-GOV-01](../execution/project-backlog.md)
- [Phase 4 Roadmap](../execution/phase-roadmap.md)
- [Market Scope Governance Architecture](../architecture/market-scope-governance.md)
- [Market Coverage Constants](../../apps/api-gateway/src/lib/market-coverage.ts)

---

## API Decisions

### DEC-002: Add Global Scope Parameter for Compare Tool
**Date:** April 28, 2026  
**Status:** Implemented  
**Owner:** Engineering Team  
**Category:** API

#### Context

The compare tool (`/intelligence/compare`) needs to show all worldwide countries (~190+) for comparison, not just the 74 mandate-scoped markets (Africa + Caribbean).

#### Decision

Add `scope` parameter to `/api/v1/countries` endpoint:
- `scope=mandate` (default): Returns 74 mandate markets
- `scope=global`: Returns all countries in database

#### Rationale

- Compare tool is a different use case than intelligence map
- Users expect to compare any two countries globally
- Mandate filtering is for public intelligence surfaces only
- Simple parameter addition, no breaking changes

#### Related

- [Intelligence Pages Bug Fixes](../intelligence-pages-bug-fixes.md)

---

## Frontend Decisions

_Add frontend decisions here as they arise._

---

## Infrastructure Decisions

_Add infrastructure decisions here as they arise._

---

## Product Decisions

_Add product decisions here as they arise._

---

## Decision Log Maintenance

### Adding New Entries

1. Assign sequential ID (DEC-001, DEC-002, etc.)
2. Use template format above
3. Include all required sections
4. Link to related documentation
5. Update status as implementation progresses

### Status Definitions

- **Proposed:** Decision suggested, awaiting approval
- **Approved:** Accepted but not yet implemented
- **Implemented:** Decision implemented and deployed
- **Superseded:** Replaced by a later decision

### Review Schedule

- **Monthly:** Review recent decisions
- **Quarterly:** Archive old decisions
- **Annually:** Audit for superseded decisions

---

## References

### Related Documentation
- [Project Backlog](./project-backlog.md)
- [Phase Roadmap](./phase-roadmap.md)
- [Architecture Docs](../architecture/)
- [Knowledgebase](../knowledgebase/ISSUES_AND_SOLUTIONS.md)

### Decision-Making Process
1. Identify decision point
2. Document context and alternatives
3. Discuss with team
4. Record decision with rationale
5. Update related documentation
6. Track implementation status

---

**Document Owner:** Engineering Lead  
**Last Review:** April 29, 2026  
**Next Review:** May 29, 2026
