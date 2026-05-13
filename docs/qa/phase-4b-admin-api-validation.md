# Phase 4B Admin API Validation

**Document Type:** API Validation Report  
**Classification:** Internal — Engineering  
**Date:** 2026-05-06  
**Version:** 1.0  
**Owner:** Afronovation Engineering Team

---

## Overview

This document validates the Phase 4B admin API endpoints for the ingestion architecture.

---

## 1. API Endpoints Summary

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/v1/admin/upload` | POST, GET | Upload source files, get templates/sources |
| `/api/v1/admin/batches` | GET | List ingestion batches |
| `/api/v1/admin/batches/[id]` | GET, PUT | Get batch detail, update status |
| `/api/v1/admin/batches/[id]/parse` | POST | Parse uploaded file |
| `/api/v1/admin/batches/[id]/validate` | POST | Validate batch rows |
| `/api/v1/admin/batches/[id]/rows` | GET | Preview parsed rows |
| `/api/v1/admin/monitors` | GET, POST | List/create policy monitors |
| `/api/v1/admin/monitors/[id]/check` | POST | Run monitor check |
| `/api/v1/admin/review-queue` | GET, POST | View/create review queue items |

---

## 2. Upload API Validation

### POST /api/v1/admin/upload

**Purpose:** Upload source files for ingestion

**Request:**
```
Content-Type: multipart/form-data

file: <binary>
source_name: "Office of the U.S. Trade Representative" (required)
source_url: "https://ustr.gov/..." (optional)
as_of_date: "2026-05-06" (required)
source_id: "<uuid>" (optional)
template_id: "<uuid>" (optional)
batch_name: "AGOA Status Q2 2026" (optional)
confidence_level: "high" | "medium" | "low" | "curated" (optional)
```

**Test Cases:**

| # | Test | Input | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | CSV upload | Valid CSV file | 201, batch created | ⏳ Test |
| 2 | JSON upload | Valid JSON file | 201, batch created | ⏳ Test |
| 3 | XLSX upload | Valid XLSX file | 201, batch created (stored) | ⏳ Test |
| 4 | PDF upload | Valid PDF file | 201, stored as evidence | ⏳ Test |
| 5 | Missing source_name | No source_name | 400, error | ⏳ Test |
| 6 | Missing as_of_date | No as_of_date | 400, error | ⏳ Test |
| 7 | Invalid file type | .exe file | 400, unsupported type | ⏳ Test |
| 8 | Unauthenticated | No auth | 403, forbidden | ⏳ Test |
| 9 | Non-admin user | Auth but not admin | 403, forbidden | ⏳ Test |
| 10 | Large file (>50MB) | 60MB file | 400, file too large | ⏳ Test |

### GET /api/v1/admin/upload

**Purpose:** Get available templates and sources

**Response:**
```json
{
  "templates": [...],
  "sources": [...],
  "supported_file_types": ["csv", "xlsx", "json", "xml", "pdf"],
  "required_fields": ["source_name", "as_of_date"]
}
```

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | Get templates | Returns available templates | ⏳ Test |
| 2 | Get sources | Returns active sources | ⏳ Test |
| 3 | Unauthenticated | 403, forbidden | ⏳ Test |

---

## 3. Batches API Validation

### GET /api/v1/admin/batches

**Purpose:** List ingestion batches

**Query Parameters:**
- `status`: Filter by status
- `source_id`: Filter by source
- `limit`: Pagination limit (default 50)
- `offset`: Pagination offset

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | List all batches | Returns batches with pagination | ⏳ Test |
| 2 | Filter by status | Returns filtered results | ⏳ Test |
| 3 | Filter by source | Returns filtered results | ⏳ Test |
| 4 | Pagination | Returns correct page | ⏳ Test |

### GET /api/v1/admin/batches/[id]

**Purpose:** Get batch details with row statistics

**Response:**
```json
{
  "batch": { ... },
  "row_statistics": {
    "total": 50,
    "valid": 45,
    "invalid": 3,
    "excluded": 2
  },
  "sample_rows": [...]
}
```

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | Get existing batch | Returns batch with stats | ⏳ Test |
| 2 | Get non-existent batch | 404, not found | ⏳ Test |
| 3 | Includes row statistics | Stats present | ⏳ Test |

### PUT /api/v1/admin/batches/[id]

**Purpose:** Update batch status (review, approve, reject, publish, rollback, supersede)

**Request:**
```json
{
  "action": "approve",
  "notes": "Reviewed and verified"
}
```

**Workflow Tests:**

| # | Test | Current Status | Action | Expected New Status | Status |
|---|------|----------------|--------|---------------------|--------|
| 1 | Review batch | validated | review | under_review | ⏳ Test |
| 2 | Approve batch | under_review | approve | approved | ⏳ Test |
| 3 | Reject batch | under_review | reject | rejected | ⏳ Test |
| 4 | Publish batch | approved | publish | published | ⏳ Test |
| 5 | Rollback batch | published | rollback | rolled_back | ⏳ Test |
| 6 | Invalid transition | uploaded | approve | 400, error | ⏳ Test |

---

## 4. Parse API Validation

### POST /api/v1/admin/batches/[id]/parse

**Purpose:** Parse uploaded file into rows

| # | Test | Input | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Parse CSV | Valid batch with CSV | Rows created, status = parsed | ⏳ Test |
| 2 | Parse JSON | Valid batch with JSON | Rows created, status = parsed | ⏳ Test |
| 3 | Parse PDF | PDF batch | 400, cannot parse PDF | ⏳ Test |
| 4 | Parse invalid CSV | Malformed CSV | Status = failed, errors logged | ⏳ Test |
| 5 | Already parsed | Status = parsed | 400, invalid state | ⏳ Test |

---

## 5. Validate API Validation

### POST /api/v1/admin/batches/[id]/validate

**Purpose:** Validate rows against 74-market scope, check required fields

**Request:**
```json
{
  "country_column": "country",
  "country_code_type": "iso3",
  "required_fields": ["country", "status"],
  "data_type": "agoa_status"
}
```

| # | Test | Input | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Validate AGOA data | Valid ISO3 countries | Rows marked valid | ⏳ Test |
| 2 | Invalid country | Non-74-market ISO3 | Row marked invalid | ⏳ Test |
| 3 | ESH rejection | ESH country | Row excluded, reason set | ⏳ Test |
| 4 | Missing required | Missing status | Row marked invalid | ⏳ Test |
| 5 | AGOA status validation | Invalid status | Error in validation_errors | ⏳ Test |
| 6 | AfCFTA status validation | Invalid status | Error in validation_errors | ⏳ Test |

---

## 6. Rows API Validation

### GET /api/v1/admin/batches/[id]/rows

**Purpose:** Preview parsed and validated rows

**Query Parameters:**
- `status`: Filter by row status
- `show_invalid`: Show only invalid rows
- `show_excluded`: Show only excluded rows
- `limit`: Pagination limit (default 100)
- `offset`: Pagination offset

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | Get all rows | Returns rows with pagination | ⏳ Test |
| 2 | Filter invalid | Returns only invalid rows | ⏳ Test |
| 3 | Filter excluded | Returns only ESH rows | ⏳ Test |
| 4 | Row has validation_errors | Errors present for invalid | ⏳ Test |

---

## 7. Monitors API Validation

### GET /api/v1/admin/monitors

**Purpose:** List policy source monitors

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | List all monitors | Returns monitors | ⏳ Test |
| 2 | Filter by source | Returns filtered monitors | ⏳ Test |
| 3 | Filter by type | Returns filtered monitors | ⏳ Test |
| 4 | Includes pending_events count | Count present | ⏳ Test |

### POST /api/v1/admin/monitors

**Purpose:** Create new monitor

**Request:**
```json
{
  "source_id": "<uuid>",
  "monitor_name": "Custom Monitor",
  "monitor_type": "page_hash",
  "monitor_url": "https://example.com/page",
  "check_interval_minutes": 60,
  "keywords": ["AGOA", "eligibility"]
}
```

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | Create valid monitor | 201, monitor created | ⏳ Test |
| 2 | Missing required field | 400, error | ⏳ Test |
| 3 | Invalid monitor_type | 400, error | ⏳ Test |

### POST /api/v1/admin/monitors/[id]/check

**Purpose:** Run monitor check manually

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | Check active monitor | 200, check result | ⏳ Test |
| 2 | Check inactive monitor | 400, not active | ⏳ Test |
| 3 | Change detected | Review task created | ⏳ Test |
| 4 | No change | has_changed = false | ⏳ Test |
| 5 | API error | Error logged, consecutive_failures++ | ⏳ Test |

---

## 8. Review Queue API Validation

### GET /api/v1/admin/review-queue

**Purpose:** List review queue items

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | List pending items | Returns pending items | ⏳ Test |
| 2 | Filter by policy_type | Returns AGOA or AfCFTA items | ⏳ Test |
| 3 | My items | Returns items assigned to user | ⏳ Test |
| 4 | Summary counts | Returns correct counts | ⏳ Test |

### POST /api/v1/admin/review-queue

**Purpose:** Create review queue item

**Request:**
```json
{
  "source_type": "change_event",
  "source_id": "<uuid>",
  "title": "AGOA Notice Detected",
  "policy_type": "agoa",
  "priority": 75
}
```

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | Create valid item | 201, item created | ⏳ Test |
| 2 | Missing required | 400, error | ⏳ Test |

---

## 9. Authentication & Authorization Tests

| # | Test | Endpoint | Expected Result | Status |
|---|------|----------|-----------------|--------|
| 1 | No auth token | All admin endpoints | 403 | ⏳ Test |
| 2 | Invalid token | All admin endpoints | 403 | ⏳ Test |
| 3 | Non-admin user | All admin endpoints | 403 | ⏳ Test |
| 4 | Org admin user | All admin endpoints | 200 | ⏳ Test |
| 5 | Platform admin user | All admin endpoints | 200 | ⏳ Test |

---

## 10. Test Execution

### Prerequisites

1. SQL packs v1.14 and v1.15 executed
2. Dev server running (`npm run dev`)
3. Admin user credentials available

### Test Commands

```bash
# Using curl
curl -X POST http://localhost:3000/api/v1/admin/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@test.csv" \
  -F "source_name=Test Source" \
  -F "as_of_date=2026-05-06"

# Using httpie
http POST localhost:3000/api/v1/admin/upload \
  Authorization:"Bearer <token>" \
  file@test.csv \
  source_name="Test Source" \
  as_of_date="2026-05-06"
```

---

## 11. Summary

| Category | Total Tests | Passed | Failed | Pending |
|----------|-------------|--------|--------|---------|
| Upload API | 10 | 0 | 0 | 10 |
| Batches API | 12 | 0 | 0 | 12 |
| Parse API | 5 | 0 | 0 | 5 |
| Validate API | 6 | 0 | 0 | 6 |
| Rows API | 4 | 0 | 0 | 4 |
| Monitors API | 8 | 0 | 0 | 8 |
| Review Queue API | 5 | 0 | 0 | 5 |
| Auth Tests | 5 | 0 | 0 | 5 |
| **TOTAL** | **55** | **0** | **0** | **55** |

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Engineering Team
