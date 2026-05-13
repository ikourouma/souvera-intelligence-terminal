# Phase 4B-V2-B — Invalid ISO3 Validation Results

**Document Type:** Validation Results  
**Classification:** Internal — Engineering  
**Date:** 2026-05-09  
**Version:** 1.0  
**Owner:** Afronovation Engineering Team  
**Status:** ⏳ PENDING MANUAL EXECUTION

---

## Executive Summary

**Validation Status:** ⏳ PENDING MANUAL EXECUTION  
**Gate:** Phase 4B-V2-B — Invalid ISO3 Validation  
**Test Date:** _________________  
**Tester:** _________________  
**Overall Result:** [ ] PASS / [ ] FAIL

**Purpose:**  
Validate that the existing validation workflow correctly detects invalid ISO3 codes (e.g., `ZZZ`) and marks them as invalid while allowing valid codes (e.g., `NGA`) to pass.

---

## Objective

Confirm the Upload → Parse → Validate workflow correctly processes files with invalid ISO3 codes without requiring code or schema changes.

**What Was Tested:**
- Invalid ISO3 detection (ZZZ)
- Valid ISO3 control (NGA)
- Parse endpoint functionality
- Validate endpoint functionality
- Validation error storage
- Batch status management

**What Was NOT Tested:**
- ESH rejection (Phase 4B-V2-C)
- JSON/PDF uploads
- Automatic parsing
- Automatic validation

---

## Test File

**Path:** `docs/qa/test-data/phase-4b/invalid-country-code.csv`

**Structure:**
```csv
iso3,country_name,agoa_status,apparel_status,as_of_date,source_url,notes
ZZZ,Invalid Country,eligible,not_verified,2026-05-06,https://ustr.gov/,Invalid ISO3 test
NGA,Nigeria,eligible,not_verified,2026-05-06,https://ustr.gov/,Valid control row
```

**Column Count:** 7 columns  
**Row Count:** 2 data rows (1 invalid, 1 valid control)  
**Invalid Value:** `ZZZ` (not in 74-market scope)  
**Control Value:** `NGA` (Nigeria, valid African country)

---

## Test Execution Details

### Test Environment

**Test Environment:**
- Dev Server: `http://localhost:3010/admin/data/upload`
- Test User: _________________
- Execution Date: _________________
- Execution Time: _________________

### Upload Form Metadata Used

| Field | Value Used |
|-------|------------|
| File | invalid-country-code.csv |
| Source Selection | (None - tested fallback) |
| Source Name | Test Invalid ISO3 |
| Source URL | (Not specified) |
| As-of Date | 2026-05-09 |
| Batch Name | invalid-iso3-test |
| Confidence Level | Default (curated) |

---

## Browser Upload Test Results

### Upload Response

**HTTP Status Code:** _________________

**Success Response:**
```json
[PASTE ACTUAL RESPONSE HERE]
```

**Batch ID Captured:** _________________

**File Asset ID:** _________________

**Ingestion Run ID:** _________________

---

## Parse Endpoint Test Results

### Parse Request

```bash
POST /api/v1/admin/batches/{batch_id}/parse
```

### Parse Response

**HTTP Status Code:** _________________

**Response Body:**
```json
[PASTE ACTUAL RESPONSE HERE]
```

**Total Rows Parsed:** _________________

**Columns Detected:** _________________

---

## Validate Endpoint Test Results

### Validate Request

```bash
POST /api/v1/admin/batches/{batch_id}/validate
Content-Type: application/json

{
  "country_column": "iso3",
  "country_code_type": "iso3",
  "required_fields": ["iso3", "country_name", "agoa_status"],
  "data_type": "agoa_status"
}
```

### Validate Response

**HTTP Status Code:** _________________

**Response Body:**
```json
[PASTE ACTUAL RESPONSE HERE]
```

**Validation Summary:**
- Total Rows: _________________
- Valid Rows: _________________
- Invalid Rows: _________________
- Warnings: _________________
- Excluded: _________________

---

## SQL Verification Results

### Pre-Verification: Ad-hoc Source Check

**Query:**
```sql
SELECT id, key, name, source_type, ingestion_method, is_active
FROM public.souvera_data_sources
WHERE key = 'adhoc_admin_upload';
```

**Result:**

| id | key | name | source_type | ingestion_method | is_active |
|----|-----|------|-------------|------------------|-----------|
| [PASTE RESULT] | | | | | |

**Status:** [ ] Pass / [ ] Fail

---

### Query 1: Verify File Asset Created

**Query:**
```sql
WITH adhoc_source AS (
  SELECT id FROM public.souvera_data_sources
  WHERE key = 'adhoc_admin_upload'
)
SELECT 
  'file_asset' AS record_type,
  fa.id,
  fa.file_name,
  fa.source_id,
  CASE 
    WHEN fa.source_id = (SELECT id FROM adhoc_source) THEN '✓ PASS'
    ELSE '✗ FAIL - Wrong source'
  END AS source_check,
  fa.file_type,
  fa.storage_path,
  fa.fetched_at
FROM public.souvera_source_file_assets fa
WHERE fa.file_name = 'invalid-country-code.csv'
ORDER BY fa.fetched_at DESC
LIMIT 1;
```

**Result:**

| record_type | id | file_name | source_id | source_check | file_type | storage_path | fetched_at |
|-------------|-------|-----------|-----------|--------------|-----------|--------------|------------|
| [PASTE RESULT] | | | | | | | |

**Status:** [ ] Pass / [ ] Fail

**Analysis:**
- source_check value: _________________
- file_type value: _________________
- Expected: source_check = '✓ PASS', file_type = 'csv'

---

### Query 2: Verify Batch Created

**Query:**
```sql
WITH adhoc_source AS (
  SELECT id FROM public.souvera_data_sources
  WHERE key = 'adhoc_admin_upload'
)
SELECT 
  'batch' AS record_type,
  b.id,
  b.batch_name,
  b.source_id,
  CASE 
    WHEN b.source_id = (SELECT id FROM adhoc_source) THEN '✓ PASS'
    ELSE '✗ FAIL - Wrong source'
  END AS source_check,
  b.status,
  b.total_rows,
  b.valid_rows,
  b.invalid_rows,
  b.approved_at,
  b.published_at,
  b.created_at
FROM public.souvera_source_file_ingestion_batches b
WHERE b.file_asset_id = (
  SELECT id FROM public.souvera_source_file_assets
  WHERE file_name = 'invalid-country-code.csv'
  ORDER BY fetched_at DESC
  LIMIT 1
)
ORDER BY b.created_at DESC
LIMIT 1;
```

**Result:**

| record_type | id | batch_name | source_id | source_check | status | total_rows | valid_rows | invalid_rows | approved_at | published_at | created_at |
|-------------|----|------------|-----------|--------------|--------|------------|------------|--------------|-------------|--------------|------------|
| [PASTE RESULT] | | | | | | | | | | | |

**Status:** [ ] Pass / [ ] Fail

**Analysis:**
- source_check value: _________________
- status value: _________________
- total_rows: _________________
- valid_rows: _________________
- invalid_rows: _________________
- approved_at value: _________________
- published_at value: _________________
- Expected: source_check = '✓ PASS', status = 'validated', total_rows = 2, valid_rows = 1, invalid_rows = 1, approved_at = NULL, published_at = NULL

---

### Query 3: Verify Ingestion Rows Created

**Query:**
```sql
SELECT 
  'ingestion_row' AS record_type,
  r.id,
  r.row_number,
  r.status,
  r.mapped_iso3,
  r.validation_errors,
  r.validation_warnings,
  r.is_excluded,
  r.raw_data->>'iso3' AS raw_iso3,
  r.raw_data->>'country_name' AS raw_country_name
FROM public.souvera_source_file_ingestion_rows r
WHERE r.batch_id = (
  SELECT id FROM public.souvera_source_file_ingestion_batches
  WHERE file_asset_id = (
    SELECT id FROM public.souvera_source_file_assets
    WHERE file_name = 'invalid-country-code.csv'
    ORDER BY fetched_at DESC
    LIMIT 1
  )
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY r.row_number;
```

**Result:**

| record_type | id | row_number | status | mapped_iso3 | validation_errors | validation_warnings | is_excluded | raw_iso3 | raw_country_name |
|-------------|----|------------|--------|-------------|-------------------|---------------------|-------------|----------|------------------|
| [PASTE RESULT ROW 1] | | | | | | | | | |
| [PASTE RESULT ROW 2] | | | | | | | | | |

**Status:** [ ] Pass / [ ] Fail

**Analysis:**

**Row 1 (ZZZ):**
- mapped_iso3: _________________
- status: _________________
- validation_errors: _________________
- Expected: mapped_iso3 = 'ZZZ', status = 'invalid', validation_errors contains 'INVALID_MARKET'

**Row 2 (NGA):**
- mapped_iso3: _________________
- status: _________________
- validation_errors: _________________
- Expected: mapped_iso3 = 'NGA', status = 'valid', validation_errors = NULL

---

### Query 4: Verify Storage Object

**Query:**
```sql
SELECT 
  id,
  bucket_id,
  name,
  created_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'source-files'
  AND name LIKE '%invalid-country-code.csv'
ORDER BY created_at DESC
LIMIT 1;
```

**Result:**

| id | bucket_id | name | created_at | metadata |
|----|-----------|------|------------|----------|
| [PASTE RESULT] | | | | |

**Status:** [ ] Pass / [ ] Fail

**Analysis:**
- bucket_id value: _________________
- name includes 'invalid-country-code.csv': [ ] Yes / [ ] No
- Expected: bucket_id = 'source-files', name includes test file

---

## Acceptance Criteria Results

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| AC-1 | Invalid ISO3 CSV uploads successfully | [ ] PASS / [ ] FAIL | Browser response |
| AC-2 | Storage object is created | [ ] PASS / [ ] FAIL | Query 4 result |
| AC-3 | File asset is created | [ ] PASS / [ ] FAIL | Query 1 result |
| AC-4 | Batch is created | [ ] PASS / [ ] FAIL | Query 2 result |
| AC-5 | Ingestion run is created | [ ] PASS / [ ] FAIL | Batch has ingestion_run_id |
| AC-6 | Parse endpoint succeeds | [ ] PASS / [ ] FAIL | Parse API response |
| AC-7 | Exactly 2 ingestion rows are created | [ ] PASS / [ ] FAIL | Query 3: count = 2 |
| AC-8 | Validate endpoint succeeds | [ ] PASS / [ ] FAIL | Validate API response |
| AC-9 | ZZZ row is marked invalid | [ ] PASS / [ ] FAIL | Query 3: row 1 status = 'invalid' |
| AC-10 | ZZZ row validation_errors contains INVALID_MARKET | [ ] PASS / [ ] FAIL | Query 3: validation_errors JSON |
| AC-11 | NGA row is marked valid | [ ] PASS / [ ] FAIL | Query 3: row 2 status = 'valid' |
| AC-12 | Batch valid_rows = 1 and invalid_rows = 1 | [ ] PASS / [ ] FAIL | Query 2 result |
| AC-13 | Batch is not approved | [ ] PASS / [ ] FAIL | Query 2: approved_at = NULL |
| AC-14 | Batch is not published | [ ] PASS / [ ] FAIL | Query 2: published_at = NULL |
| AC-15 | No code or schema changes made | [ ] PASS / [ ] FAIL | Confirmation |

**Overall Acceptance Criteria:** [ ] ALL PASS / [ ] SOME FAIL

**Pass Count:** _____ / 15  
**Fail Count:** _____ / 15

---

## Comparison with Phase 4B-V1 & V2-A

| Aspect | Phase 4B-V1 (AGOA) | Phase 4B-V2-A (AfCFTA) | Phase 4B-V2-B (Invalid ISO3) | Match |
|--------|-------------------|------------------------|------------------------------|-------|
| Upload succeeds | ✅ PASS | ✅ PASS | _________________ | [ ] Yes / [ ] No |
| Storage object created | ✅ PASS | ✅ PASS | _________________ | [ ] Yes / [ ] No |
| File asset created | ✅ PASS | ✅ PASS | _________________ | [ ] Yes / [ ] No |
| Batch created | ✅ PASS | ✅ PASS | _________________ | [ ] Yes / [ ] No |
| Ingestion run created | ✅ PASS | ✅ PASS | _________________ | [ ] Yes / [ ] No |
| source_id = adhoc_admin_upload | ✅ PASS | ✅ PASS | _________________ | [ ] Yes / [ ] No |
| Batch status = uploaded/validated | ✅ PASS | ✅ PASS | _________________ | [ ] Yes / [ ] No |
| No automatic approval | ✅ PASS | ✅ PASS | _________________ | [ ] Yes / [ ] No |
| No automatic publication | ✅ PASS | ✅ PASS | _________________ | [ ] Yes / [ ] No |

**Consistency:** [ ] CONSISTENT / [ ] INCONSISTENT

**Analysis:**

---

## Final Validation Verdict

**Phase 4B-V2-B Status:** [ ] PASSED / [ ] BLOCKED

**Justification:**

**Key Findings:**

**Confidence Level:** [ ] High / [ ] Medium / [ ] Low

---

## Issues Found

### Issue 1: [If any]

**Severity:** [ ] P0 / [ ] P1 / [ ] P2 / [ ] P3  
**Description:**

**Root Cause:**

**Evidence:**

**Impact:**

**Resolution:**

---

## Scope Compliance Verification

Confirm the following scope constraints were observed:

- [ ] No code changes were made
- [ ] No schema changes were made
- [ ] No SQL packs were created
- [ ] No upload route modifications
- [ ] No validation logic changes
- [ ] No automatic parsing implemented
- [ ] No automatic validation implemented
- [ ] No ESH testing performed
- [ ] No JSON/PDF/OCR work
- [ ] No BridgeVault integration
- [ ] No tracker publication
- [ ] No production deployment

**Scope Compliance:** [ ] PASS / [ ] FAIL

---

## Lessons Learned

### Technical Insights

1. _________________
2. _________________
3. _________________

### Process Improvements

1. _________________
2. _________________
3. _________________

---

## Recommended Next Gate

**If PASSED:**  
Recommend Phase 4B-V2-C — ESH Rejection Workflow Validation

**Rationale:** Invalid ISO3 detection validated. ESH rejection is a separate governance rule (market exclusion vs invalid market) that deserves isolated workflow testing.

**If BLOCKED:**  
Resolve blocking issues before proceeding

**Not Recommended Yet:**
- JSON upload validation (Phase 4B-V3)
- PDF evidence upload (Phase 4B-V4)
- Automatic parsing (Phase 4B-V5)

---

**Owner:** Afronovation Engineering Team  
**Status:** ⏳ PENDING MANUAL EXECUTION  
**Created:** 2026-05-09  
**Executor:** Manual QA
