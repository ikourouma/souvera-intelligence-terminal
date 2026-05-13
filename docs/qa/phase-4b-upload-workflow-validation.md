# Phase 4B-V1 — CSV Upload Pipeline Validation

**Document Type:** Validation Test Plan  
**Classification:** Internal — Engineering  
**Date:** 2026-05-06  
**Version:** 1.0 (CSV-Only Scope)  
**Owner:** Afronovation Engineering Team

---

## Purpose

This document defines the focused validation gate for **CSV file upload only**.

**Strategic Principle:**  
Prove one file type, one admin journey, one source template, one storage path, one batch record, and one validation lifecycle before expanding to JSON, PDF, XLSX, XML, or monitor ingestion.

---

## Validation Scope

### In Scope for Phase 4B-V1

**Single File Type:** CSV only  
**Single Test File:** `docs/qa/test-data/phase-4b/agoa-status-valid.csv`  
**Single Journey:** Admin login → Upload page → File upload → Batch creation → Success confirmation

### Out of Scope for Phase 4B-V1

Do **not** test or work on these until CSV succeeds end-to-end:

- AfCFTA CSV
- Invalid ISO3 CSV
- ESH rejection CSV
- JSON upload
- PDF upload
- XLSX upload
- XML upload
- Policy monitors
- AGOA/AfCFTA tracker publication
- Supply-demand expansion
- Phase 4C

---

## Prerequisites

### Infrastructure Requirements

**Before starting validation, confirm:**

1. ✅ SQL Pack v1.14 executed in Supabase
2. ✅ SQL Pack v1.15 executed in Supabase
3. ✅ SQL Pack v1.16 executed in Supabase (storage bucket setup)
4. ✅ Private storage bucket `source-files` exists
5. ✅ Admin test users provisioned with `platform_admin` role
6. ✅ Dev server running (`npm run dev`)
7. ✅ Browser with network inspector available

### Environment Variables Required

**Must be present in `.env.local`:**

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

**Verification (Safe Check Only):**

```bash
# Check presence only, do not print values
echo "NEXT_PUBLIC_SUPABASE_URL present: $(test -n "$NEXT_PUBLIC_SUPABASE_URL" && echo "yes" || echo "no")"
echo "SUPABASE_SERVICE_ROLE_KEY present: $(test -n "$SUPABASE_SERVICE_ROLE_KEY" && echo "yes" || echo "no")"
```

---

## CSV-Only Acceptance Criteria

CSV upload **passes** only if **all 8 criteria** are true:

| # | Criterion | Expected Result | Validation Method |
|---|-----------|-----------------|-------------------|
| 1 | Admin can access `/admin/data/upload` | Page loads with upload form | Browser test |
| 2 | `agoa-status-valid.csv` uploads without storage error | No "failed to upload file to storage" error | Browser test + API response |
| 3 | Storage object created in `source-files` | Object exists under `uploads/YYYY-MM-DD/` | SQL query |
| 4 | Record created in `souvera_source_file_assets` | File asset record exists | SQL query |
| 5 | Record created in `souvera_source_file_ingestion_batches` | Ingestion batch record exists | SQL query |
| 6 | Batch is **not** automatically approved | `approved_at` is NULL | SQL query |
| 7 | Batch is **not** automatically published | `published_at` is NULL | SQL query |
| 8 | Browser shows clear success state | Success message displayed in UI | Browser test |

**Gate Status:** ⏳ **Validation in progress**

---

## Test Procedure

### Step 1: Environment Consistency Check

**Purpose:** Confirm local environment points to the same Supabase project where `source-files` bucket was created.

**Action:**

1. Check `.env.local` for `NEXT_PUBLIC_SUPABASE_URL` (safe check only, do not print secret)
2. Extract project reference from URL (format: `https://[project-ref].supabase.co`)
3. Open Supabase Dashboard
4. Navigate to Storage
5. Confirm `source-files` bucket exists
6. Confirm project reference matches local environment

**Expected Result:**  
Local environment and Supabase Dashboard reference the same project.

**If Mismatch Found:**  
Either create `source-files` bucket in the correct project, or update `.env.local` to point to the intended project.

---

### Step 2: Storage Bucket Verification

**Purpose:** Confirm `source-files` bucket exists and is configured correctly.

**SQL Query:**

```sql
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
WHERE id = 'source-files';
```

**Expected Result:**

```
1 row returned
id = source-files
public = false
file_size_limit = 52428800 (50MB)
allowed_mime_types = array of CSV, JSON, PDF, XML, XLSX MIME types
```

**If Not Found:**  
Execute SQL Pack v1.16 to create the bucket.

**If MIME Types Are NULL:**  
This may allow all file types (admin-only private bucket, acceptable if documented).

---

### Step 3: Pre-Upload Database State Capture

**Purpose:** Establish baseline before upload attempt.

**SQL Query 1 — Current Storage Objects:**

```sql
SELECT COUNT(*) as object_count
FROM storage.objects
WHERE bucket_id = 'source-files';
```

**SQL Query 2 — Current File Assets:**

```sql
SELECT COUNT(*) as asset_count
FROM public.souvera_source_file_assets;
```

**SQL Query 3 — Current Ingestion Batches:**

```sql
SELECT COUNT(*) as batch_count
FROM public.souvera_source_file_ingestion_batches;
```

**Record Results:**  
Note the count values to compare after upload.

---

### Step 4: Manual Browser Upload

**Purpose:** Execute the actual upload workflow from admin UI.

**Test File:** `docs/qa/test-data/phase-4b/agoa-status-valid.csv`

**Procedure:**

1. Start dev server: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Click "Sign In"
4. Log in as `platform_admin@afronovation.com` (or any test user with `platform_admin` role)
5. Navigate to Admin area
6. Navigate to `/admin/data/upload`
7. Fill upload form:
   - **File:** Select `agoa-status-valid.csv`
   - **Source Name:** "AGOA Status Test"
   - **As Of Date:** "2026-05-06"
   - **Source URL:** (optional) "https://ustr.gov"
   - **Confidence Level:** "curated"
   - **Batch Name:** (optional) "CSV Upload Test Batch"
   - **Batch Description:** (optional) "Phase 4B-V1 CSV validation test"
8. Click "Upload File"
9. Observe browser response

**Expected Success Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file_asset": {
    "id": "[uuid]",
    "file_name": "agoa-status-valid.csv",
    "file_type": "csv",
    "file_size_bytes": [number],
    "storage_path": "uploads/2026-05-06/[timestamp]_agoa-status-valid.csv"
  },
  "batch": {
    "id": "[uuid]",
    "status": "uploaded",
    "source_name": "AGOA Status Test",
    "as_of_date": "2026-05-06"
  },
  "ingestion_run_id": "[uuid]",
  "next_step": "File uploaded. Proceed to parsing and mapping."
}
```

**If Storage Error Occurs:**

Capture full error response, including new diagnostic fields:

```json
{
  "error": "Failed to upload file to storage",
  "details": "[error message]",
  "bucket": "source-files",
  "fileName": "agoa-status-valid.csv",
  "mimeType": "[detected mime type]",
  "fileSize": [bytes],
  "storagePath": "uploads/2026-05-06/[timestamp]_agoa-status-valid.csv"
}
```

---

### Step 5: MIME Type Inspection

**Purpose:** Identify the actual MIME type sent by the browser for CSV files.

**Action:**

1. Open browser DevTools → Network tab
2. Perform upload (Step 4)
3. Inspect POST request to `/api/v1/admin/upload`
4. Check request payload → `file` field → Content-Type header

**Expected CSV MIME Types:**

- `text/csv` (preferred)
- `text/plain` (common fallback)
- `application/vnd.ms-excel` (Excel CSV export)
- `application/csv` (less common)
- `application/octet-stream` (generic binary)

**If MIME Type Not Allowed:**

Check whether the detected MIME type is in the bucket's `allowed_mime_types` array. If not, recommend bucket MIME type update.

---

### Step 6: Post-Upload Storage Verification

**Purpose:** Confirm storage object was created successfully.

**SQL Query:**

```sql
SELECT 
  id,
  bucket_id,
  name,
  owner,
  metadata,
  created_at,
  updated_at
FROM storage.objects
WHERE bucket_id = 'source-files'
ORDER BY created_at DESC
LIMIT 20;
```

**Expected Result:**

New object appears with:
- `bucket_id = 'source-files'`
- `name` starts with `uploads/2026-05-06/`
- `created_at` timestamp matches upload time

**If No Object Appears:**

Storage upload failed before object creation. Check:
1. Bucket name mismatch
2. Service role key mismatch
3. MIME type rejection
4. Storage path conflict

---

### Step 7: Post-Upload Database Verification

**Purpose:** Confirm database records were created successfully.

**SQL Query 1 — File Assets:**

```sql
SELECT 
  id,
  source_id,
  file_name,
  file_type,
  file_size_bytes,
  mime_type,
  storage_path,
  storage_bucket,
  created_at,
  updated_at
FROM public.souvera_source_file_assets
ORDER BY created_at DESC
LIMIT 20;
```

**Expected Result:**

New file asset with:
- `file_name = 'agoa-status-valid.csv'`
- `file_type = 'csv'`
- `storage_bucket = 'source-files'`
- `storage_path` matches upload path

**SQL Query 2 — Ingestion Batches:**

```sql
SELECT 
  id,
  source_id,
  file_asset_id,
  batch_name,
  status,
  source_name,
  source_url,
  as_of_date,
  source_confidence,
  total_rows,
  valid_rows,
  invalid_rows,
  warning_rows,
  approved_by,
  approved_at,
  published_by,
  published_at,
  error_message,
  error_details,
  created_by,
  created_at,
  updated_at
FROM public.souvera_source_file_ingestion_batches
ORDER BY created_at DESC
LIMIT 20;
```

**Expected Result:**

New ingestion batch with:
- `status = 'uploaded'`
- `source_name = 'AGOA Status Test'`
- `as_of_date = '2026-05-06'`
- `approved_at IS NULL` ✅ (not auto-approved)
- `published_at IS NULL` ✅ (not auto-published)
- `approved_by IS NULL` ✅
- `published_by IS NULL` ✅

**SQL Query 3 — Ingestion Runs:**

```sql
SELECT 
  id,
  source_id,
  run_type,
  triggered_by,
  status,
  started_at,
  completed_at,
  created_at,
  updated_at
FROM public.souvera_data_ingestion_runs
ORDER BY created_at DESC
LIMIT 20;
```

**Expected Result:**

New ingestion run with:
- `run_type = 'upload'`
- `status = 'queued'` or `'in_progress'`

---

### Step 8: CSV Acceptance Criteria Validation

**Purpose:** Confirm all 8 acceptance criteria are met.

**Validation Checklist:**

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Admin access to `/admin/data/upload` | ⏳ | Browser test |
| 2 | CSV uploads without storage error | ⏳ | API response |
| 3 | Storage object created | ⏳ | SQL query (Step 6) |
| 4 | File asset record created | ⏳ | SQL query (Step 7.1) |
| 5 | Ingestion batch created | ⏳ | SQL query (Step 7.2) |
| 6 | Batch **not** auto-approved | ⏳ | `approved_at IS NULL` |
| 7 | Batch **not** auto-published | ⏳ | `published_at IS NULL` |
| 8 | Browser shows success state | ⏳ | UI confirmation |

**Gate Status:** ⏳ **Validation in progress**

---

## Root Cause Analysis Framework

If CSV upload still fails, use this diagnostic tree:

### Failure Point 1: "Admin access required"

**Root Cause:**  
Test user lacks `platform_admin` or `org_admin` role in `souvera_organization_members`.

**Verification:**

```sql
SELECT 
  user_id,
  organization_id,
  role
FROM souvera_organization_members
WHERE user_id = '[test-user-uuid]';
```

**Resolution:**  
Execute admin membership provisioning SQL (see SQL Pack v1.14 or manual insert).

---

### Failure Point 2: "Failed to upload file to storage"

**Possible Root Causes:**

1. **Bucket does not exist**
   - Verification: Execute SQL query in Step 2
   - Resolution: Execute SQL Pack v1.16

2. **Wrong Supabase project**
   - Verification: Compare `NEXT_PUBLIC_SUPABASE_URL` project reference to Supabase Dashboard project
   - Resolution: Update `.env.local` or create bucket in correct project

3. **Service role key mismatch**
   - Verification: Confirm `SUPABASE_SERVICE_ROLE_KEY` belongs to same project as `NEXT_PUBLIC_SUPABASE_URL`
   - Resolution: Replace service role key in `.env.local`

4. **MIME type rejection**
   - Verification: Check MIME type in error response and compare to `allowed_mime_types` in bucket
   - Resolution: Update bucket MIME types (see MIME Type Fix below)

5. **Storage path conflict**
   - Verification: Check if file with same path already exists in `storage.objects`
   - Resolution: Delete conflicting object or wait for next day (path includes date)

6. **Duplicate upload**
   - Verification: Check `upsert: false` setting in upload route
   - Resolution: Change filename or delete existing object

---

### Failure Point 3: Storage succeeds but database insert fails

**Root Cause:**  
RLS policy or database constraint blocking insert.

**Verification:**

Check server logs for database error after storage upload succeeds.

**Resolution:**

Review RLS policies on `souvera_source_file_assets` and `souvera_source_file_ingestion_batches`.

---

## Remediation: MIME Type Update

If diagnostics confirm MIME type rejection, apply this fix:

### Option 1: Preferred — Expand Allowed MIME Types

```sql
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/csv',
  'application/json',
  'application/pdf',
  'text/html',
  'application/xml',
  'text/xml',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]
WHERE id = 'source-files';
```

**Verification:**

```sql
SELECT allowed_mime_types 
FROM storage.buckets 
WHERE id = 'source-files';
```

---

### Option 2: Alternative — Allow All MIME Types

**Use only if:**
- MIME type detection is inconsistent
- Bucket is private and admin-only
- Service role upload is the only upload method

```sql
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'source-files';
```

**Security Justification:**

Private bucket + service role upload + admin authorization = safe to allow all MIME types for admin uploads.

**Document this decision** if applied.

---

## Success Criteria Summary

**Phase 4B-V1 passes if:**

1. ✅ All 8 CSV acceptance criteria met
2. ✅ Root cause identified and documented
3. ✅ Fix applied and validated
4. ✅ No automatic approval or publication
5. ✅ No feature work started
6. ✅ ESH validation deferred to next gate

**Phase 4B-V1 fails if:**

- CSV upload still fails after diagnostic investigation
- Storage object not created
- Database records not created
- Batch auto-approved or auto-published
- Feature work started instead of diagnostics

---

## Documentation Requirements

After completing validation, update:

1. **`docs/backlog/phase-4b-validation-issues.md`**
   - Add P4B-V-009 if new issue found
   - Mark resolved if CSV upload succeeds
   - Document root cause and fix

2. **`docs/qa/phase-4b-browser-qa-results.md`**
   - Update CSV upload test result
   - Document MIME type detected
   - Document database records created

3. **`docs/qa/phase-4b-upload-workflow-validation.md`** (this document)
   - Mark acceptance criteria as passed/failed
   - Document final gate status

4. **`docs/status/phase-4b-status.md`**
   - Update overall Phase 4B-V status
   - List completed validation steps
   - List pending work

---

## Final Report Template

```markdown
## Phase 4B-V1 CSV Upload Pipeline Validation — Final Report

**Date:** [YYYY-MM-DD]  
**Tester:** [Name]  
**Environment:** [Local / Staging]

### Files Inspected
- [List files read]

### Files Changed
- [List files modified with brief description]

### Storage Failure Details
- **Error Message:** [error text]
- **Bucket Name:** [bucket used by route]
- **Storage Path:** [generated path]
- **CSV MIME Type:** [detected by browser]

### Environment Check
- **NEXT_PUBLIC_SUPABASE_URL present:** [yes/no]
- **SUPABASE_SERVICE_ROLE_KEY present:** [yes/no]
- **Project Consistency:** [same project / mismatch]

### Database Verification
- **Bucket Exists:** [yes/no]
- **Storage Object Created:** [yes/no]
- **File Asset Created:** [yes/no]
- **Ingestion Batch Created:** [yes/no]
- **Auto-Approved:** [yes/no — should be NO]
- **Auto-Published:** [yes/no — should be NO]

### Root Cause
[Detailed explanation]

### Fix Applied
[Describe fix or recommendation]

### CSV Acceptance Criteria
[X/8 criteria passed]

| # | Criterion | Passed |
|---|-----------|--------|
| 1 | Admin access | ✅/❌ |
| 2 | No storage error | ✅/❌ |
| 3 | Storage object | ✅/❌ |
| 4 | File asset | ✅/❌ |
| 5 | Ingestion batch | ✅/❌ |
| 6 | Not auto-approved | ✅/❌ |
| 7 | Not auto-published | ✅/❌ |
| 8 | Success UI | ✅/❌ |

### Feature Work
**Confirmation:** No feature work started ✅

### Gate Status
- ✅ **PASSED** — CSV upload pipeline validated
- ❌ **FAILED** — CSV upload still fails

### Next Steps
[If passed: expand to other file types]
[If failed: continue diagnostics]
```

---

## Pending Work (Not in Scope for Phase 4B-V1)

Do **not** proceed to these until CSV upload succeeds:

- P4B-V-005: ESH validation
- P4B-V-006: PDF upload UX
- P4B-V-007: XLSX testing
- AfCFTA CSV upload
- Invalid ISO3 CSV upload
- JSON upload
- Policy monitors
- AGOA/AfCFTA tracker publication
- Phase 4C

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Engineering Team
