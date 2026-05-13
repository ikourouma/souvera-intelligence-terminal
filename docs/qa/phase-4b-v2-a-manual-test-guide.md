# Phase 4B-V2-A — AfCFTA CSV Upload Validation Manual Test Guide

**Document Type:** Manual QA Test Guide  
**Classification:** Internal — Engineering  
**Date:** 2026-05-08  
**Version:** 1.0  
**Owner:** Afronovation Engineering Team  
**Status:** Ready for Manual Execution

---

## Objective

Validate that the Phase 4B-V1 CSV upload pipeline works for a second strategic CSV dataset (AfCFTA) with different column structure.

**Purpose:**  
Confirm the upload route is generic and can handle different CSV structures without code changes or schema modifications.

**What This Tests:**
- Upload pipeline reusability
- Storage infrastructure
- Database record creation
- Source attribution (adhoc_admin_upload fallback)
- No automatic approval/publication

**What This Does NOT Test:**
- AfCFTA data parsing
- AfCFTA data validation
- Policy-specific validation logic
- Invalid ISO3 validation
- ESH rejection

---

## Prerequisites

Before executing this test:

- [ ] Phase 4B-V1 CSV Upload Pipeline is validated ✅
- [ ] Dev server is running (`npm run dev` in `apps/api-gateway`)
- [ ] Test user has `platform_admin` role in `souvera_organization_members`
- [ ] Browser is logged in as admin user
- [ ] Test file exists: `docs/qa/test-data/phase-4b/afcfta-status-valid.csv`
- [ ] Supabase SQL Editor is accessible
- [ ] `adhoc_admin_upload` source exists and is active

---

## Test File

**Path:** `docs/qa/test-data/phase-4b/afcfta-status-valid.csv`

**Expected Structure:**
```csv
iso3,country_name,signed_status,ratified_status,deposited_status,implementation_status,as_of_date,source_url,notes
```

**Column Count:** 9 columns  
**Row Count:** 4 rows (1 header + 3 data)  
**Test Countries:** Nigeria, Kenya, Ghana

**Column Differences from AGOA CSV:**
- AGOA: 7 columns (iso3, country_name, agoa_status, apparel_status, as_of_date, source_url, notes)
- AfCFTA: 9 columns (additional: signed_status, ratified_status, deposited_status, implementation_status)

---

## Browser Upload Test Procedure

### Step 1: Start/Verify Dev Server

**Command:**
```bash
cd apps/api-gateway
npm run dev
```

**Expected Output:**
```
ready - started server on 0.0.0.0:3000
```

**Verification:**
- [ ] Dev server is running without errors
- [ ] No TypeScript compilation errors

---

### Step 2: Navigate to Upload Page

**URL:** `http://localhost:3000/admin/data/upload`

**Expected:**
- [ ] Page loads successfully
- [ ] Upload form renders
- [ ] File drop zone is visible
- [ ] Metadata fields are visible

---

### Step 3: Upload AfCFTA CSV

**File to Upload:**
```
docs/qa/test-data/phase-4b/afcfta-status-valid.csv
```

**Form Fields:**

| Field | Value | Required |
|-------|-------|----------|
| **File** | Select `afcfta-status-valid.csv` | ✅ Yes |
| **Source Selection** | **DO NOT SELECT** (leave empty/default) | ❌ No - test fallback |
| **Source Name** | `AfCFTA Secretariat` | ✅ Yes |
| **Source URL** | `https://au-afcfta.org/` | ❌ No (optional) |
| **As-of Date** | `2026-05-06` | ✅ Yes |
| **Batch Name** | `afcfta-status-valid` or leave default | ❌ No (optional) |
| **Batch Description** | `AfCFTA test upload for Phase 4B-V2-A` | ❌ No (optional) |
| **Confidence Level** | Leave default (`curated`) | ❌ No (optional) |
| **Template** | Leave empty/default | ❌ No (optional) |

**Critical Test Behavior:**
- ✅ **DO NOT select a source from the dropdown**
- ✅ Allow `adhoc_admin_upload` fallback to resolve `source_id`
- ✅ This tests the validated fallback logic from Phase 4B-V1

---

### Step 4: Submit Upload

**Action:** Click "Upload File" button

**Expected Browser Response:**

**Success Response (HTTP 201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file_asset": {
    "id": "<uuid>",
    "file_name": "afcfta-status-valid.csv",
    "file_type": "csv",
    "file_size_bytes": <number>,
    "storage_path": "uploads/2026-05-08/<timestamp>_afcfta-status-valid.csv"
  },
  "batch": {
    "id": "<uuid>",
    "status": "uploaded",
    "source_name": "AfCFTA Secretariat",
    "as_of_date": "2026-05-06"
  },
  "ingestion_run_id": "<uuid>",
  "next_step": "File uploaded. Proceed to parsing and mapping."
}
```

**Evidence to Capture:**
- [ ] Screenshot of success response
- [ ] Copy full JSON response text
- [ ] Note HTTP status code
- [ ] Note timestamp

**Failure Response (if any):**
- [ ] Screenshot of error message
- [ ] Copy full error response text
- [ ] Note HTTP status code
- [ ] Check browser console for errors
- [ ] Check dev server terminal for error logs

---

## Verification SQL Queries

Run these queries in Supabase SQL Editor to verify database records.

### Pre-Verification: Confirm Ad-hoc Source Exists

**Query:**
```sql
SELECT 
  id,
  key,
  name,
  source_type,
  ingestion_method,
  is_active
FROM public.souvera_data_sources
WHERE key = 'adhoc_admin_upload';
```

**Expected Result:**
- key: `adhoc_admin_upload`
- name: `Ad-hoc Admin Upload`
- source_type: `manual`
- ingestion_method: `manual_upload`
- is_active: `true`

**Status:** [ ] Pass / [ ] Fail

---

### Query 1: Verify AfCFTA File Asset

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
WHERE fa.file_name = 'afcfta-status-valid.csv'
ORDER BY fa.fetched_at DESC
LIMIT 1;
```

**Expected Result:**
- source_check: `✓ PASS`
- file_name: `afcfta-status-valid.csv`
- file_type: `csv`
- source_id: matches adhoc_admin_upload ID
- storage_path: starts with `uploads/2026-05-08/`

**Actual Result:**

**Status:** [ ] Pass / [ ] Fail

---

### Query 2: Verify AfCFTA Ingestion Batch

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
  b.source_name,
  b.as_of_date,
  b.approved_at,
  b.published_at,
  b.created_at
FROM public.souvera_source_file_ingestion_batches b
WHERE b.file_asset_id = (
  SELECT id FROM public.souvera_source_file_assets
  WHERE file_name = 'afcfta-status-valid.csv'
  ORDER BY fetched_at DESC
  LIMIT 1
)
ORDER BY b.created_at DESC
LIMIT 1;
```

**Expected Result:**
- source_check: `✓ PASS`
- source_id: matches adhoc_admin_upload ID
- status: `uploaded` (NOT `approved` or `published`)
- source_name: `AfCFTA Secretariat`
- as_of_date: `2026-05-06`
- approved_at: `NULL`
- published_at: `NULL`

**Actual Result:**

**Status:** [ ] Pass / [ ] Fail

---

### Query 3: Verify AfCFTA Ingestion Run

**Query:**
```sql
WITH adhoc_source AS (
  SELECT id FROM public.souvera_data_sources
  WHERE key = 'adhoc_admin_upload'
)
SELECT 
  'ingestion_run' AS record_type,
  r.id,
  r.source_id,
  CASE 
    WHEN r.source_id = (SELECT id FROM adhoc_source) THEN '✓ PASS'
    ELSE '✗ FAIL - Wrong source'
  END AS source_check,
  r.run_type,
  r.status,
  r.triggered_by,
  r.started_at
FROM public.souvera_data_ingestion_runs r
WHERE r.id = (
  SELECT b.ingestion_run_id 
  FROM public.souvera_source_file_ingestion_batches b
  WHERE b.file_asset_id = (
    SELECT id FROM public.souvera_source_file_assets
    WHERE file_name = 'afcfta-status-valid.csv'
    ORDER BY fetched_at DESC
    LIMIT 1
  )
  ORDER BY b.created_at DESC
  LIMIT 1
);
```

**Expected Result:**
- source_check: `✓ PASS`
- source_id: matches adhoc_admin_upload ID
- run_type: `upload`
- status: `queued`

**Actual Result:**

**Status:** [ ] Pass / [ ] Fail

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
  AND name ILIKE '%afcfta-status-valid.csv%'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
- bucket_id: `source-files`
- name: contains `afcfta-status-valid.csv`
- metadata: includes MIME type and size

**Actual Result:**

**Status:** [ ] Pass / [ ] Fail

---

## Acceptance Criteria

Mark each criterion after verification:

| ID | Criterion | Status |
|----|-----------|--------|
| AC-1 | AfCFTA CSV upload succeeds | [ ] Pass / [ ] Fail |
| AC-2 | Browser receives success JSON response (201) | [ ] Pass / [ ] Fail |
| AC-3 | Storage object created in source-files bucket | [ ] Pass / [ ] Fail |
| AC-4 | File asset record created | [ ] Pass / [ ] Fail |
| AC-5 | Batch record created | [ ] Pass / [ ] Fail |
| AC-6 | Ingestion run record created | [ ] Pass / [ ] Fail |
| AC-7 | source_id resolves to adhoc_admin_upload (no source selected) | [ ] Pass / [ ] Fail |
| AC-8 | Batch status remains `uploaded` | [ ] Pass / [ ] Fail |
| AC-9 | No automatic approval (approved_at IS NULL) | [ ] Pass / [ ] Fail |
| AC-10 | No automatic publication (published_at IS NULL) | [ ] Pass / [ ] Fail |
| AC-11 | No JSON/PDF/OCR/ESH logic triggered | [ ] Pass / [ ] Fail |
| AC-12 | No schema changes required | [ ] Pass / [ ] Fail |

**Overall Result:** [ ] ALL PASS / [ ] SOME FAIL

---

## Evidence Capture Checklist

Capture the following evidence:

- [ ] Browser upload success response (screenshot + text)
- [ ] Browser error response (if any)
- [ ] Query 1 result (file asset verification)
- [ ] Query 2 result (batch verification)
- [ ] Query 3 result (ingestion run verification)
- [ ] Query 4 result (storage object verification)
- [ ] Dev server terminal logs (if errors occurred)
- [ ] Browser console logs (if errors occurred)

---

## Pass/Fail Criteria

**PASS Criteria:**
- All 12 acceptance criteria pass
- All 4 verification queries return expected results
- Browser receives success response (201)
- No errors in dev server logs
- No errors in browser console

**FAIL Criteria:**
- Any acceptance criterion fails
- Any verification query returns unexpected result
- Browser receives error response
- Errors in dev server logs
- Errors in browser console

---

## Troubleshooting

### Issue: "Admin access required" Error

**Root Cause:** User lacks admin role

**Fix:**
```sql
-- Add user to admin organization
INSERT INTO public.souvera_organization_members (
  organization_id,
  user_id,
  role
) VALUES (
  (SELECT id FROM public.souvera_organizations WHERE name = 'Admin Test Organization' LIMIT 1),
  (SELECT id FROM auth.users WHERE email = '<your-test-user-email>'),
  'platform_admin'
)
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'platform_admin';
```

---

### Issue: "Failed to upload file to storage" Error

**Root Cause:** Storage bucket missing or MIME type not allowed

**Fix 1 - Check bucket exists:**
```sql
SELECT * FROM storage.buckets WHERE id = 'source-files';
```

If missing, create it (should not be needed - bucket was created in Phase 4B-V1).

**Fix 2 - Check MIME types:**
```sql
SELECT allowed_mime_types FROM storage.buckets WHERE id = 'source-files';
```

Expected: Should include `text/csv`, `application/vnd.ms-excel`, `application/csv`

---

### Issue: "Failed to create file asset record" Error

**Root Cause:** adhoc_admin_upload source missing or inactive

**Fix:**
```sql
-- Verify ad-hoc source exists
SELECT * FROM public.souvera_data_sources WHERE key = 'adhoc_admin_upload';

-- If missing, run SQL Pack v1.18
```

---

### Issue: Browser Success but Query Returns No Records

**Root Cause:** Database insert may have failed silently

**Fix:**
1. Check dev server terminal for error logs
2. Check Supabase logs for insert errors
3. Verify RLS policies allow insert
4. Retry upload

---

## Scope Compliance Check

After test execution, confirm:

- [ ] No code changes were made
- [ ] No schema changes were made
- [ ] No SQL packs were created
- [ ] No AfCFTA parsing logic was added
- [ ] No data validation logic was added
- [ ] No invalid ISO3 validation was added
- [ ] No ESH rejection logic was added
- [ ] No JSON/PDF/OCR logic was added
- [ ] No BridgeVault integration was added
- [ ] No automatic parsing was implemented
- [ ] No policy monitors were triggered
- [ ] No tracker publication occurred
- [ ] No production deployment occurred

---

## Next Steps After Test Execution

1. **Document Results:**  
   Fill in `docs/qa/phase-4b-v2-a-validation-results.md` with actual test results

2. **Update Status:**  
   If all tests pass, mark Phase 4B-V2-A as PASSED in status documents

3. **Update Knowledgebase:**  
   Add Phase 4B-V2-A section to knowledgebase with results

4. **Report to User:**  
   Provide test results for validation

5. **Recommend Next Gate:**  
   If passed, recommend Phase 4B-V2-B (Invalid ISO3 Validation)

---

## Test Execution Log

**Executed By:** _________________  
**Execution Date:** _________________  
**Execution Time:** _________________  
**Test Environment:** Dev server (localhost:3000)  
**Overall Result:** [ ] PASS / [ ] FAIL

**Notes:**

---

**Document Version:** 1.0  
**Created:** 2026-05-08  
**Last Updated:** 2026-05-08  
**Owner:** Afronovation Engineering Team  
**Status:** Ready for Manual Execution
