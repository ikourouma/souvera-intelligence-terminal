# FDI N/A Documentation Summary

**Date**: 2026-05-02  
**Status**: ✅ Documentation Complete  
**Next Action**: Review and implement DATA-ING-02B + UX-DATA-01

---

## Documents Created/Updated

### ✅ Created: FDI Debug Report

**File**: `docs/qa/fdi-na-data-path-debug.md`

**Contains**:
- Executive summary with data path status table
- Current entitlement status confirmation (tier resolution fixed)
- Complete data path diagram from API to frontend
- Database findings with SQL verification queries
- View findings showing correct pivot logic
- API response findings confirming entitlement check works
- Frontend mapping findings confirming display logic correct
- Ingestion/source findings identifying root cause
- Root cause: FDI not seeded and not in World Bank adapter
- Recommended fixes (Options A, B, C)
- Acceptance criteria for fix
- Full SQL diagnostic queries in appendix

**Key Finding**: All code is correct; FDI data simply doesn't exist in the database.

---

### ✅ Updated: Source Ingestion Activation Plan

**File**: `docs/execution/source-ingestion-activation-plan.md`

**Changes (v1.0 → v1.1)**:

1. **Added FDI Findings**:
   - Corrected World Bank FDI indicator code: `BX.KLT.DINV.CD.WD`
   - Added critical finding note in Priority 2 source section
   - Cross-referenced FDI debug report

2. **Clarified Phase Structure**:
   - **Phase 1-2**: Terminal foundation & auth (✅ Complete)
   - **Phase 3**: Regional expansion & route behavior (Next)
   - **Phase 4A**: Manual source ingestion activation (Includes FDI fix)
   - **Phase 4B**: Scheduled ingestion
   - **Phase 5**: Production source-governed intelligence

3. **Added DATA-ING-02B Task**:
   - Full implementation details
   - World Bank indicator code
   - Commands to run
   - Acceptance criteria
   - Verification SQL
   - Priority: P1

4. **Updated Document Metadata**:
   - Version: 1.1
   - Updated date: May 2, 2026
   - Document history with changes

---

### ✅ Created: Data Ingestion Backlog

**File**: `docs/backlog/data-ingestion-backlog.md`

**Contains**:

**Priority P1 Tasks**:
1. **DATA-ING-02B** — Add FDI to World Bank Ingestion
   - Problem statement
   - Implementation details
   - World Bank indicator code: `BX.KLT.DINV.CD.WD`
   - Acceptance criteria
   - Verification SQL
   - Dependencies: None
   - Estimate: 4 hours
   - Priority: P1

2. **UX-DATA-01** — Replace Unlocked Missing Metric Display
   - Problem statement
   - Current vs proposed behavior
   - Implementation details
   - Test matrix by tier
   - Acceptance criteria
   - Dependencies: None
   - Estimate: 2 hours
   - Priority: P1

**Phase 4A Tasks** (All documented):
- DATA-ING-01: Ingestion inventory audit (✅ Complete)
- DATA-ING-02: World Bank manual ingestion
- DATA-ING-02B: Add FDI to World Bank adapter (NEW)
- DATA-ING-03: REST Countries ingestion
- DATA-ING-04: Observation validation SQL
- DATA-ING-05: Freshness/source display QA
- DATA-ING-06: Source health verification
- DATA-ING-07: Job logging verification

**Phase 4B Tasks**:
- DATA-ING-08: Payload archive policy
- DATA-ING-09: Scheduled ingestion design

**Phase 5 Tasks**:
- DATA-ING-10: Admin completeness dashboard

**Future Source Adapters**:
- DATA-ING-11: IMF adapter
- DATA-ING-12: UN Comtrade adapter
- DATA-ING-13: Open Exchange Rates adapter

**Additional UX Enhancements**:
- UX-DATA-02: Stale data badges
- UX-DATA-03: Loading states for metric cards

**Quality Gates Checklist**: All 14 gates documented with task mappings

**Sprint Planning Recommendations**: 3 sprints outlined

---

## Phase Roadmap Confirmation

### Phase 1-2: Terminal Foundation & Authentication
**Status**: ✅ Complete (2026-05-02)

| Deliverable | Status |
|-------------|--------|
| UI/API foundation | ✅ Complete |
| Curated preview data seeded | ✅ Complete |
| Map workspace implemented | ✅ Complete |
| Africa workspace embedded | ✅ Complete |
| Auth/entitlements | ✅ Complete |
| Tier-based access working | ✅ Complete |
| Account menu polish | ✅ Complete |

**UI Language**: "Curated Preview Data"

---

### Phase 3: Regional Expansion & Route Behavior
**Status**: Planned (Next)

| Deliverable | Description |
|-------------|-------------|
| Caribbean shell route | `/intelligence/caribbean` page structure |
| Region filters (optional) | Africa / Caribbean / All toggle if approved |
| Query params (optional) | `?region=africa` support if approved |
| Route architecture docs | Navigation pattern documentation |

**Data Source**: Still curated preview/seed data  
**UI Language**: Still "Curated Preview Data"

---

### Phase 4A: Manual Source Ingestion Activation
**Status**: Ready to Begin (Can run in parallel with Phase 3)

**Critical Deliverable**: **DATA-ING-02B** — Add FDI to World Bank adapter

| Deliverable | Description |
|-------------|-------------|
| Add FDI to World Bank adapter | ⏳ Required for Professional+ feature completeness |
| World Bank manual ingestion | Run CLI with FDI included |
| REST Countries manual ingestion | Run CLI, validate country records |
| Observation validation | SQL verification including FDI |
| Source health baseline | Verify tracking works |

**UI Language After Validation**:
- "Source-Attributed Preview"
- "Updated from approved public sources"
- "Last updated [date]"

**Still Prohibited**:
- "Live data"
- "Real-time"
- "Automated refresh" (until Phase 4B)

---

### Phase 4B: Scheduled Ingestion
**Status**: After Phase 4A validated

| Deliverable | Description |
|-------------|-------------|
| Supabase Edge Functions | Scheduled ingestion triggers |
| Source health monitoring | Automatic health status updates |
| Ingestion job dashboard | Admin view |
| Stale data badges | UI indicator |

**UI Language**:
- "Automated source refresh"
- "Scheduled data updates"
- "Source health monitored"

---

### Phase 5: Production Source-Governed Intelligence
**Status**: After all 14 quality gates pass

| Deliverable | Description |
|-------------|-------------|
| Automated refresh cadence | Daily/weekly schedules per source |
| Admin monitoring dashboard | Data completeness, freshness, health |
| Source licensing review | Legal compliance verified |

**UI Language**:
- "Source-Attributed Data"
- "Updated [frequency] from [source]"

**Still Prohibited**:
- "Guaranteed accuracy"
- Unsupported latency/uptime claims

---

## Acceptance Criteria Summary

### For DATA-ING-02B (FDI Addition)

**When Complete**:
- [ ] World Bank adapter includes `BX.KLT.DINV.CD.WD` → `fdi_net_inflows_usd`
- [ ] Ingestion job succeeds
- [ ] FDI observations written to database
- [ ] Professional+ users see FDI values when available
- [ ] Countries without FDI show "Data pending" (requires UX-DATA-01)
- [ ] Source/freshness metadata appears
- [ ] No "live data" language used

---

### For UX-DATA-01 (Display Enhancement)

**When Complete**:
- [ ] Explorer sees "Locked" overlay on FDI card
- [ ] Professional+ sees "Data pending" if unlocked but no data
- [ ] Professional+ sees formatted value if data exists
- [ ] No metric appears broken
- [ ] Mobile display remains clean

---

## Implementation Priority

### Sprint 1 (Immediate - Phase 4A Week 1)

**Goal**: Complete Professional+ FDI feature

1. **DATA-ING-02B** (4 hours) — Add FDI to World Bank adapter
2. **UX-DATA-01** (2 hours) — Improve missing data display
3. **DATA-ING-02** (1 hour) — Run World Bank ingestion with FDI
4. **Verify** (1 hour) — Run FDI verification SQL

**Sprint Goal**: Professional+ users see FDI values or "Data pending"

---

### Sprint 2 (Phase 4A Week 2)

**Goal**: Full manual ingestion validation

1. DATA-ING-03 — REST Countries ingestion
2. DATA-ING-04 — Full observation validation
3. DATA-ING-05 — Freshness/source QA
4. DATA-ING-06 — Source health verification
5. DATA-ING-07 — Job logging verification

**Sprint Goal**: All manual ingestion validated, ready for Phase 4B

---

## Files Modified/Created

### Created
- ✅ `docs/qa/fdi-na-data-path-debug.md` (Complete diagnostic report)
- ✅ `docs/backlog/data-ingestion-backlog.md` (Full backlog with priorities)
- ✅ `FDI_DOCUMENTATION_SUMMARY.md` (This file)

### Updated
- ✅ `docs/execution/source-ingestion-activation-plan.md` (v1.0 → v1.1)

### To Be Modified (Implementation)
- ⏳ `services/ingestion/worldbank.ts` (Add FDI indicator)
- ⏳ `apps/api-gateway/src/components/intelligence/EntitledMetricCard.tsx` (Improve UX)

---

## What Was NOT Done (As Requested)

✅ Did not implement ingestion (per instructions)  
✅ Did not run ingestion (per instructions)  
✅ Did not change UI language to "live" (per instructions)  
✅ Did not modify code — only created documentation

---

## Related Documentation

All cross-references are complete:

| Document | Location | Status |
|----------|----------|--------|
| FDI Debug Report | `docs/qa/fdi-na-data-path-debug.md` | ✅ Created |
| Source Ingestion Plan | `docs/execution/source-ingestion-activation-plan.md` | ✅ Updated |
| Data Ingestion Backlog | `docs/backlog/data-ingestion-backlog.md` | ✅ Created |
| P0 Auth Fix | `docs/qa/p0-auth-entitlement-fix-implementation.md` | ✅ Exists |
| Entitlements Package | `docs/qa/entitlements-package-implementation.md` | ✅ Exists |

---

## Key Takeaways

1. **Root Cause Confirmed**: FDI displays as "N/A" because no FDI data exists in `souvera_country_observations`. All code, views, entitlements, and frontend logic are correctly implemented.

2. **Two Contributing Factors**:
   - Seed file only seeds 3 indicators (not FDI)
   - World Bank adapter only ingests 3 indicators (not FDI)

3. **Fix is Simple**: Add one line to World Bank adapter:
   ```typescript
   { wbCode: 'BX.KLT.DINV.CD.WD', souveraKey: 'fdi_net_inflows_usd' }
   ```

4. **UX Enhancement**: Change "N/A" to "Data pending" for unlocked but missing metrics.

5. **Phase Clarity**: Phases 1-2 are complete, Phase 3 is regional expansion, Phase 4A includes FDI addition.

6. **No Code Changes Yet**: All documentation complete; implementation awaits approval.

---

## Next Steps

### For Engineering Team:

1. **Review**: `docs/qa/fdi-na-data-path-debug.md`
2. **Review**: `docs/backlog/data-ingestion-backlog.md`
3. **Implement**: DATA-ING-02B (4 hours)
4. **Implement**: UX-DATA-01 (2 hours)
5. **Run**: `npx tsx services/ingestion/run.ts worldbank`
6. **Verify**: FDI observations created
7. **QA**: Professional+ users see FDI or "Data pending"

### For Product Team:

1. **Review**: Phase roadmap in updated source-ingestion plan
2. **Approve**: Sprint 1 scope (DATA-ING-02B + UX-DATA-01)
3. **Confirm**: "Source-Attributed Preview" language can be used after Phase 4A validation

---

**Documentation Status**: ✅ Complete  
**Implementation Status**: ⏳ Ready to begin  
**Blocker Status**: None — all prerequisites met
