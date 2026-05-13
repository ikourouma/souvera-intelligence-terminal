# Phase 4B Open Issues

**Document Type:** Issue Backlog  
**Classification:** Internal — Engineering  
**Date:** 2026-05-06  
**Version:** 1.1  
**Owner:** Afronovation Engineering Team

---

## Overview

This document tracks open issues, known limitations, and deferred features for the Phase 4B ingestion architecture.

---

## Governance Language Remediation Log

The following governance language violations were identified and resolved:

| ID | File | Previous Language | Corrected Language | Status |
|---|---|---|---|---|
| P4B-LANG-001 | `africa-map-embed.tsx` | `live data infrastructure` | `source-attributed data infrastructure` | ✓ Resolved |
| P4B-LANG-002 | `faqs/page.tsx` | `live data from the World Bank` | `curated data from the World Bank` | ✓ Resolved |
| P4B-LANG-003 | `PreviewDataBanner.tsx` | `Live data feeds` | `Additional source integrations` | ✓ Resolved |
| P4B-LANG-004 | `agoa-afcfta-trade-intelligence-assessment.md` | `Real-time eligibility` | `Source-attributed eligibility` | ✓ Resolved |

For full resolution details, see: `docs/backlog/phase-4b-issue-resolution-log.md`

---

## 1. Known Limitations

### 1.1 XLSX Parsing Not Implemented

**Issue ID:** P4B-001  
**Severity:** Medium  
**Status:** Deferred

**Description:**  
XLSX (Excel) file parsing is not yet implemented. CSV conversion is required as a workaround.

**Workaround:**  
- Export Excel files as CSV before upload
- XLSX files can be stored but not parsed

**Resolution Plan:**  
- Add `xlsx` npm package
- Implement XLSX parser in `lib/ingestion/parsers.ts`
- Target: Phase 4C or later

---

### 1.2 XML Parsing Not Implemented

**Issue ID:** P4B-002  
**Severity:** Low  
**Status:** Deferred

**Description:**  
XML file parsing is not yet implemented. JSON or CSV preferred.

**Workaround:**  
- Convert XML to JSON or CSV before upload
- XML files can be stored as evidence

**Resolution Plan:**  
- Evaluate need based on source requirements
- Implement if required for specific data sources

---

### 1.3 PDF Extraction Optional

**Issue ID:** P4B-003  
**Severity:** Low  
**Status:** As Designed

**Description:**  
PDF files are stored as evidence only. Automated text extraction is optional and not reliable for all document structures.

**Current Behavior:**  
- PDFs stored in Supabase Storage
- `is_pdf_evidence = true`
- `pdf_extraction_status = 'pending'`
- Manual data entry required

**Resolution Plan:**  
- Evaluate OCR/extraction libraries if specific PDFs need parsing
- Maintain as evidence-only for Phase 4B

---

### 1.4 Regulations.gov API Key Required

**Issue ID:** P4B-004  
**Severity:** Medium  
**Status:** Configuration Required

**Description:**  
Regulations.gov API monitoring requires a valid API key from data.gov.

**Current Behavior:**  
- Monitor check returns error if key missing
- Error: "REGULATIONS_GOV_API_KEY not configured"

**Resolution:**  
1. Register at api.data.gov
2. Request Regulations.gov API key
3. Set `REGULATIONS_GOV_API_KEY` environment variable

---

## 2. Pending Implementation

### 2.1 Scheduled Monitor Execution

**Issue ID:** P4B-005  
**Severity:** Medium  
**Status:** Pending

**Description:**  
Monitors currently require manual triggering. Scheduled execution not implemented.

**Current Behavior:**  
- `check_interval_minutes` and `next_check_at` stored but not used
- Admin must manually trigger checks

**Resolution Plan:**  
- Implement cron job or Supabase Edge Function
- Schedule checks based on `next_check_at`
- Target: Phase 4C

---

### 2.2 Column Mapping UI

**Issue ID:** P4B-006  
**Severity:** Medium  
**Status:** Pending

**Description:**  
Admin UI for configuring column mappings not yet implemented.

**Current Behavior:**  
- Mappings defined in templates or via API
- No visual mapping interface

**Resolution Plan:**  
- Add drag-and-drop mapping interface
- Preview mapped data before validation
- Target: Phase 4C

---

### 2.3 Batch Detail UI

**Issue ID:** P4B-007  
**Severity:** Medium  
**Status:** Pending

**Description:**  
Detailed batch management UI with row preview not yet implemented.

**Current Behavior:**  
- API endpoints exist
- No dedicated admin page

**Resolution Plan:**  
- Create `/admin/data/batches/[id]` page
- Show row statistics, validation errors, approval actions
- Target: Phase 4C

---

### 2.4 Review Queue UI

**Issue ID:** P4B-008  
**Severity:** Medium  
**Status:** Pending

**Description:**  
Admin review queue UI not yet implemented.

**Current Behavior:**  
- API endpoints exist
- No dedicated admin page

**Resolution Plan:**  
- Create `/admin/data/review-queue` page
- Show pending items, assignment, approval actions
- Target: Phase 4C

---

## 3. Technical Debt

### 3.1 RLS Policies Need Refinement

**Issue ID:** P4B-009  
**Severity:** Low  
**Status:** Technical Debt

**Description:**  
RLS is enabled on all tables but policies are minimal. More granular policies needed.

**Current Behavior:**  
- RLS enabled
- Service role bypasses (for admin APIs)
- Basic SELECT policies

**Resolution Plan:**  
- Add role-based policies for org_admin vs platform_admin
- Add user-specific policies for assignments
- Review and document all policies

---

### 3.2 Error Handling Improvements

**Issue ID:** P4B-010  
**Severity:** Low  
**Status:** Technical Debt

**Description:**  
Error handling is functional but could be more detailed.

**Areas for Improvement:**  
- More specific error codes
- Structured error responses
- Error logging and alerting

---

## 4. Feature Requests

### 4.1 Bulk Batch Operations

**Issue ID:** P4B-FR-001  
**Status:** Requested

**Description:**  
Ability to approve/reject multiple batches at once.

---

### 4.2 Monitor Health Dashboard

**Issue ID:** P4B-FR-002  
**Status:** Requested

**Description:**  
Visual dashboard showing monitor health, failure rates, recent detections.

---

### 4.3 Data Freshness Alerts

**Issue ID:** P4B-FR-003  
**Status:** Requested

**Description:**  
Automated alerts when published data becomes stale.

---

### 4.4 Audit Log Export

**Issue ID:** P4B-FR-004  
**Status:** Requested

**Description:**  
Export audit trail for compliance reporting.

---

## 5. Priority Matrix

| Issue ID | Title | Severity | Impact | Effort | Priority |
|----------|-------|----------|--------|--------|----------|
| P4B-004 | Regulations.gov API Key | Medium | High | Low | P1 |
| P4B-005 | Scheduled Monitor Execution | Medium | High | Medium | P2 |
| P4B-001 | XLSX Parsing | Medium | Medium | Medium | P3 |
| P4B-006 | Column Mapping UI | Medium | Medium | Medium | P3 |
| P4B-007 | Batch Detail UI | Medium | Medium | Medium | P3 |
| P4B-008 | Review Queue UI | Medium | Medium | Medium | P3 |
| P4B-009 | RLS Refinement | Low | Low | Medium | P4 |
| P4B-002 | XML Parsing | Low | Low | Medium | P5 |
| P4B-003 | PDF Extraction | Low | Low | High | P5 |
| P4B-010 | Error Handling | Low | Low | Medium | P5 |

---

## 6. Resolution Timeline

### Phase 4C (Next)
- P4B-004: Regulations.gov API Key (configuration)
- P4B-005: Scheduled Monitor Execution
- P4B-006: Column Mapping UI
- P4B-007: Batch Detail UI
- P4B-008: Review Queue UI

### Phase 4D (Future)
- P4B-001: XLSX Parsing
- P4B-009: RLS Refinement
- Feature requests

### Deferred
- P4B-002: XML Parsing (as needed)
- P4B-003: PDF Extraction (as needed)
- P4B-010: Error Handling improvements

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Engineering Team
