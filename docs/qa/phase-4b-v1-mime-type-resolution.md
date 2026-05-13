# Phase 4B-V1 — CSV MIME Type Fix Resolution

**Document Type:** Issue Resolution  
**Classification:** Internal — Engineering  
**Date:** 2026-05-07  
**Issue:** P4B-V-009  
**Severity:** P0 (blocking Phase 4B-V1 validation gate)  
**Owner:** Afronovation Engineering Team

---

## Root Cause Identified

**Issue:** CSV upload failed with "failed to upload file to storage"

**Root Cause:** MIME type rejection — Browser sent `application/vnd.ms-excel` for CSV file, which was not in the `source-files` bucket's `allowed_mime_types` array.

---

## Diagnostic Response Captured

```json
{
  "error": "Failed to upload file to storage",
  "details": "Failed to upload file to storage",
  "bucket": "source-files",
  "fileName": "agoa-status-valid.csv",
  "mimeType": "application/vnd.ms-excel",
  "fileSize": 576,
  "storagePath": "uploads/2026-05-07/1778117447142_agoa-status-valid.csv"
}
```

**Key Finding:** Windows/Excel CSV exports commonly use `application/vnd.ms-excel` MIME type instead of `text/csv`.

---

## Technical Background

### Why CSV Files Have Multiple MIME Types

CSV files can be sent with different MIME types depending on:

1. **Operating System:**
   - Windows: Often `application/vnd.ms-excel`
   - macOS: Usually `text/csv`
   - Linux: Typically `text/csv` or `text/plain`

2. **Browser:**
   - Chrome: Often sends `application/vnd.ms-excel` for Excel-generated CSV
   - Firefox: Usually `text/csv`
   - Edge: Often `application/vnd.ms-excel` (Windows default)

3. **CSV Creation Tool:**
   - Excel Export: `application/vnd.ms-excel`
   - Text Editor: `text/plain`
   - Database Export: `text/csv`
   - Python/Script Export: `text/csv`

### Common CSV MIME Types

| MIME Type | Usage | Support Required |
|-----------|-------|------------------|
| `text/csv` | Standard CSV MIME type | ✅ Yes |
| `text/plain` | Plain text fallback | ✅ Yes |
| `application/vnd.ms-excel` | Windows/Excel CSV exports | ✅ Yes (current blocker) |
| `application/csv` | Alternative standard | ✅ Yes |
| `application/octet-stream` | Generic binary fallback | ✅ Yes (some browsers) |

---

## Fix Applied

**SQL Pack Created:** `infra/supabase/sql-pack-v1.17-phase-4b-mime-type-fix.sql`

**Fix Type:** Expand `allowed_mime_types` array for `source-files` bucket

**MIME Types Added:**

```sql
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  -- CSV MIME types (including Windows/Excel variants)
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/csv',
  -- JSON MIME types
  'application/json',
  -- PDF MIME types
  'application/pdf',
  -- HTML/XML MIME types
  'text/html',
  'application/xml',
  'text/xml',
  -- XLSX MIME types
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  -- Generic fallback for unrecognized admin uploads
  'application/octet-stream'
]
WHERE id = 'source-files';
```

---

## Security Justification

**Bucket Remains Secure:**

| Security Control | Status | Details |
|------------------|--------|---------|
| Bucket Privacy | ✅ Private | `public = false` (unchanged) |
| Upload Method | ✅ Service Role Only | Admin API uses `SUPABASE_SERVICE_ROLE_KEY` |
| Authorization | ✅ Admin Only | `verifyAdminAccess()` checks `platform_admin` role |
| File Size Limit | ✅ Enforced | 50MB limit (unchanged) |
| Public Access | ✅ Blocked | No public URLs, no RLS bypass for public |
| MIME Validation | ✅ Enhanced | Expanded to support legitimate admin uploads |

**Why Expanding MIME Types Is Safe:**

1. **Private Bucket:** Files are not publicly accessible
2. **Service Role Upload:** Only admin API can upload (no client-side uploads)
3. **Admin Authorization:** `platform_admin` role required (not just authenticated user)
4. **File Size Limit:** 50MB limit prevents abuse
5. **No RLS Bypass:** Public users cannot access uploaded files
6. **Legitimate Use Case:** Admin users need to upload CSV files from various sources (Excel, databases, scripts)

**Conclusion:** Expanding `allowed_mime_types` for the **private, admin-only** `source-files` bucket is safe and necessary for supporting real-world CSV upload workflows.

---

## Verification Plan

### Step 1: Execute SQL Pack v1.17

**Action:** Execute SQL Pack in Supabase Dashboard or SQL Editor

**File:** `infra/supabase/sql-pack-v1.17-phase-4b-mime-type-fix.sql`

**Expected Result:**
```
✅ PASS: application/vnd.ms-excel is now allowed
```

---

### Step 2: Retest CSV Upload

**Action:** Retry manual CSV upload with `agoa-status-valid.csv`

**Test Procedure:**
1. Navigate to `/admin/data/upload`
2. Upload `docs/qa/test-data/phase-4b/agoa-status-valid.csv`
3. Fill form:
   - Source Name: "AGOA Status Test"
   - As Of Date: "2026-05-07"
   - Confidence Level: "curated"
4. Click "Upload File"

**Expected Success Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file_asset": {
    "id": "[uuid]",
    "file_name": "agoa-status-valid.csv",
    "file_type": "csv",
    "file_size_bytes": 576,
    "storage_path": "uploads/2026-05-07/[timestamp]_agoa-status-valid.csv"
  },
  "batch": {
    "id": "[uuid]",
    "status": "uploaded",
    "source_name": "AGOA Status Test",
    "as_of_date": "2026-05-07"
  },
  "ingestion_run_id": "[uuid]",
  "next_step": "File uploaded. Proceed to parsing and mapping."
}
```

---

### Step 3: Verify Storage Object Created

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
LIMIT 10;
```

**Expected:** New object under `uploads/2026-05-07/`

---

### Step 4: Verify Database Records

**SQL Query — File Assets:**
```sql
SELECT 
  id,
  file_name,
  file_type,
  file_size_bytes,
  mime_type,
  storage_path,
  storage_bucket,
  created_at
FROM public.souvera_source_file_assets
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:**
- `file_name = 'agoa-status-valid.csv'`
- `file_type = 'csv'`
- `mime_type = 'application/vnd.ms-excel'`
- `storage_bucket = 'source-files'`

**SQL Query — Ingestion Batches:**
```sql
SELECT 
  id,
  batch_name,
  status,
  source_name,
  as_of_date,
  approved_at,
  published_at,
  created_at
FROM public.souvera_source_file_ingestion_batches
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:**
- `status = 'uploaded'`
- `approved_at IS NULL` ✅ (not auto-approved)
- `published_at IS NULL` ✅ (not auto-published)

---

### Step 5: Validate CSV-Only Acceptance Criteria

| # | Criterion | Expected | Verification Method |
|---|-----------|----------|---------------------|
| 1 | Admin can access `/admin/data/upload` | ✅ Pass | Browser test |
| 2 | CSV uploads without storage error | ✅ Pass | API success response |
| 3 | Storage object created | ✅ Pass | SQL query (Step 3) |
| 4 | File asset record created | ✅ Pass | SQL query (Step 4.1) |
| 5 | Ingestion batch created | ✅ Pass | SQL query (Step 4.2) |
| 6 | Batch **not** auto-approved | ✅ Pass | `approved_at IS NULL` |
| 7 | Batch **not** auto-published | ✅ Pass | `published_at IS NULL` |
| 8 | Browser shows success state | ✅ Pass | UI confirmation |

**Gate Status:** If all 8 criteria pass, Phase 4B-V1 validation is **COMPLETE**.

---

## Resolution Documentation

### Files Updated

1. **`infra/supabase/sql-pack-v1.17-phase-4b-mime-type-fix.sql`** (NEW)
   - SQL fix to expand bucket MIME types
   - Includes verification queries
   - Includes security justification

2. **`docs/backlog/phase-4b-validation-issues.md`**
   - Added P4B-V-009 resolution details
   - Updated status to "Fix Ready"

3. **`docs/qa/phase-4b-browser-qa-results.md`**
   - Updated status to "Root Cause Identified"
   - Documented diagnostic response
   - Updated next steps

4. **`docs/status/phase-4b-status.md`**
   - Updated current status
   - Added SQL Pack v1.17 to completed list
   - Updated blocking issue status

5. **`docs/qa/phase-4b-v1-mime-type-resolution.md`** (THIS FILE)
   - Comprehensive resolution documentation
   - Technical background on CSV MIME types
   - Security justification
   - Verification plan

---

## Next Steps

### Immediate Actions

1. ⏳ **Execute SQL Pack v1.17** in Supabase Dashboard
2. ⏳ **Retest CSV upload** with `agoa-status-valid.csv`
3. ⏳ **Verify storage object creation** (SQL query)
4. ⏳ **Verify database records** (file asset, batch, run)
5. ⏳ **Validate 8 CSV acceptance criteria**
6. ⏳ **Document final resolution** in tracking docs

### After CSV Validation Passes

**Then proceed to:**
1. ESH rejection validation (P4B-V-005)
2. AfCFTA CSV upload
3. Invalid ISO3 CSV upload
4. JSON upload
5. PDF upload
6. XLSX upload
7. Policy monitors
8. AGOA/AfCFTA tracker publication

**Do not proceed until CSV upload succeeds end-to-end.**

---

## Success Criteria

**Phase 4B-V1 passes if:**
- ✅ All 8 CSV acceptance criteria met
- ✅ Root cause identified and documented
- ✅ Fix applied and verified
- ✅ No automatic approval or publication
- ✅ No security weakening
- ✅ Storage remains private
- ✅ Admin authorization maintained

**Phase 4B-V1 fails if:**
- CSV upload still fails after MIME fix
- Security controls weakened
- Bucket made public
- Admin authorization bypassed
- Automatic approval or publication occurs

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-07  
**Owner:** Afronovation Engineering Team  
**Status:** ✅ **Fix Ready for Execution**
