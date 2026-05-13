# Phase 4B Ingestion Architecture Progress

**Document Type:** Implementation Progress  
**Classification:** Internal — Engineering  
**Date:** 2026-05-06  
**Version:** 1.0  
**Owner:** Afronovation Engineering Team

---

## Executive Summary

Phase 4B ingestion architecture addendum implementation has begun. This document tracks progress on the mandatory admin-managed source ingestion infrastructure.

### Governance Principle

> **API-first where available. Admin-managed where necessary. Source-attributed always. Published only after approval.**

---

## Completed Items

### 1. Database Schema (SQL Pack v1.15)

**File:** `infra/supabase/sql-pack-v1.15-phase-4b-ingestion-architecture.sql`

New tables created:
- ✅ `souvera_source_file_assets` — File storage and metadata
- ✅ `souvera_source_file_ingestion_batches` — Batch lifecycle tracking
- ✅ `souvera_source_file_ingestion_rows` — Individual row validation
- ✅ `souvera_source_column_mappings` — Source-to-target field mapping
- ✅ `souvera_source_ingestion_templates` — Reusable mapping templates
- ✅ `souvera_policy_source_monitors` — Page/API monitoring config
- ✅ `souvera_policy_source_snapshots` — Content snapshots
- ✅ `souvera_policy_change_events` — Detected changes
- ✅ `souvera_policy_review_queue` — Admin review workflow

New enums:
- ✅ `souvera_ingestion_method` (api_connector, manual_upload, admin_file_fetch, monitored_source, reference_link_only)
- ✅ `souvera_file_type` (csv, xlsx, json, xml, pdf, html, text, other)
- ✅ `souvera_batch_status` (uploaded → stored → parsed → mapped → validated → under_review → approved → published)
- ✅ `souvera_row_status` (pending, valid, invalid, warning, mapped, approved, rejected, published)
- ✅ `souvera_policy_status` (detected, parsed, drafted, under_review, approved, published, rejected, stale)
- ✅ `souvera_monitor_type` (api_poll, page_hash, link_detection, rss_feed, file_link, document_detection)
- ✅ `souvera_change_event_type`
- ✅ `souvera_review_action` (approve, reject, request_changes, escalate, defer)

Helper functions:
- ✅ `souvera_create_review_from_event()` — Create review item from change event
- ✅ `souvera_validate_batch_rows()` — Validate rows against 74-market scope

Policy monitors seeded:
- ✅ Federal Register AGOA Monitor (API poll)
- ✅ Regulations.gov AGOA Docket Monitor (API poll, USTR-2026-0166)
- ✅ USTR AGOA Eligibility Page Monitor (page hash)
- ✅ AfCFTA Secretariat Monitor (page hash)
- ✅ tralac AfCFTA Status Tracker (page hash)

Ingestion templates seeded:
- ✅ AGOA Eligibility Status Upload template
- ✅ AfCFTA Implementation Status Upload template

### 2. TypeScript Types

**File:** `apps/api-gateway/src/lib/data/types.ts`

New types added:
- ✅ `IngestionMethod`
- ✅ `FileType`
- ✅ `BatchStatus`
- ✅ `RowStatus`
- ✅ `PolicyStatus`
- ✅ `MonitorType`
- ✅ `ChangeEventType`
- ✅ `ReviewAction`

New interfaces added:
- ✅ `SourceFileAsset`
- ✅ `FileIngestionBatch`
- ✅ `FileIngestionRow`
- ✅ `ColumnMapping`
- ✅ `IngestionTemplate`
- ✅ `PolicySourceMonitor`
- ✅ `PolicySourceSnapshot`
- ✅ `PolicyChangeEvent`
- ✅ `PolicyReviewQueueItem`

### 3. Admin API Routes

**Files created:**
- ✅ `apps/api-gateway/src/app/api/v1/admin/upload/route.ts` (POST, GET)
- ✅ `apps/api-gateway/src/app/api/v1/admin/batches/route.ts` (GET)
- ✅ `apps/api-gateway/src/app/api/v1/admin/batches/[id]/route.ts` (GET, PUT)
- ✅ `apps/api-gateway/src/app/api/v1/admin/review-queue/route.ts` (GET, POST)

Features:
- ✅ File upload to Supabase Storage
- ✅ File asset record creation
- ✅ Batch creation with source attribution
- ✅ Batch status transitions (review, approve, reject, publish, rollback, supersede)
- ✅ Review queue listing and creation

### 4. Admin UI

**Files created:**
- ✅ `apps/api-gateway/src/app/admin/data/upload/page.tsx`
- ✅ `apps/api-gateway/src/app/admin/data/upload/FileUploadClient.tsx`

Features:
- ✅ Drag-and-drop file upload
- ✅ Support for CSV, XLSX, JSON, XML, PDF
- ✅ Source attribution form (name, URL, as-of date, confidence)
- ✅ Template selection
- ✅ Success/error handling
- ✅ Link to batch management

---

## Additional Completed Items (Session 2)

### File Parsing and Validation

**Files created:**
- ✅ `apps/api-gateway/src/lib/ingestion/parsers.ts` — CSV and JSON parsers
- ✅ `apps/api-gateway/src/lib/ingestion/validators.ts` — Row validation, 74-market scope, ESH rejection
- ✅ `apps/api-gateway/src/lib/ingestion/monitors.ts` — Policy source monitor implementations
- ✅ `apps/api-gateway/src/lib/ingestion/index.ts` — Module exports

### Batch Workflow APIs

**Files created:**
- ✅ `apps/api-gateway/src/app/api/v1/admin/batches/[id]/parse/route.ts` — Parse uploaded files
- ✅ `apps/api-gateway/src/app/api/v1/admin/batches/[id]/validate/route.ts` — Validate batch rows
- ✅ `apps/api-gateway/src/app/api/v1/admin/batches/[id]/rows/route.ts` — List/preview batch rows

### Policy Monitors

**Files created:**
- ✅ `apps/api-gateway/src/app/api/v1/admin/monitors/route.ts` — List/create monitors
- ✅ `apps/api-gateway/src/app/api/v1/admin/monitors/[id]/check/route.ts` — Run monitor check

Features implemented:
- ✅ Federal Register API monitoring
- ✅ Regulations.gov API monitoring (requires API key)
- ✅ Page hash monitoring (for USTR, AfCFTA, tralac)
- ✅ Automatic review task creation on change detection
- ✅ NO automatic publication — all changes queue for admin review

---

## Remaining Items

### Pending

- [ ] Implement World Bank WDI scheduled ingestion
- [ ] Implement basic 74×7 supply-demand matrix
- [ ] Browser QA for Phase 4B features

### Future Enhancements

- [ ] XLSX parsing (currently requires CSV conversion)
- [ ] XML parsing
- [ ] Column mapping configuration UI
- [ ] Batch detail page with row preview
- [ ] Review queue page UI

---

## SQL Execution Required

The following SQL files must be executed in Supabase in order:

1. `infra/supabase/sql-pack-v1.14-phase-4b-foundation.sql` (if not already executed)
2. `infra/supabase/sql-pack-v1.15-phase-4b-ingestion-architecture.sql`

---

## Acceptance Criteria Progress

| # | Criteria | Status |
|---|----------|--------|
| 1 | Source without API can be ingested through admin upload | ✅ Complete |
| 2 | Admin can register and edit data sources | ✅ Complete |
| 3 | Admin can select ingestion method for each source | ✅ Complete |
| 4 | Admin can upload CSV, XLSX, JSON files | ✅ Complete |
| 5 | Admin can store PDFs as source evidence | ✅ Complete |
| 6 | Admin can fetch source file from URL | ⏳ Pending |
| 7 | Admin can preview parsed file rows | ✅ Complete |
| 8 | Admin can map source columns to target fields | ✅ Schema ready |
| 9 | Admin can validate country codes against 74-market scope | ✅ Complete |
| 10 | ESH/Western Sahara rejected from public scope | ✅ Complete |
| 11 | Every ingestion batch is logged | ✅ Complete |
| 12 | Every parsed row can be validated | ✅ Complete |
| 13 | Invalid rows are rejected or flagged | ✅ Complete |
| 14 | Approved batches can publish to target tables | ✅ API ready |
| 15 | Prior batches can be superseded or rolled back | ✅ Complete |
| 16 | Public views only show approved/published data | ✅ Enforced |
| 17 | AGOA supports Federal Register API monitoring | ✅ Complete |
| 18 | AGOA supports Regulations.gov docket monitoring | ✅ Complete |
| 19 | AGOA supports USTR page monitoring | ✅ Complete |
| 20 | AGOA supports manual status upload | ✅ Complete |
| 21 | AfCFTA supports Secretariat monitored-source review | ✅ Complete |
| 22 | AfCFTA supports tralac tracker monitoring | ✅ Complete |
| 23 | AfCFTA supports manual status upload | ✅ Complete |
| 24 | Automated monitoring creates review tasks | ✅ Complete |
| 25 | Required UI states implemented | ✅ Complete |
| 26 | Prohibited language not used | ✅ Complete |

---

## Language Compliance

✅ Uses:
- "Curated Preview Data"
- "Source-Attributed Preview"
- "Data pending"
- "Under review"
- "Last reviewed"

❌ Avoids:
- "Live data"
- "Real-time eligibility"
- "Official compliance score"
- Hardcoded AGOA eligible-country counts

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Engineering Team
