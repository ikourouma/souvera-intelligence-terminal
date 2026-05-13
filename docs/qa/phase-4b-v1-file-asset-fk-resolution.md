# Phase 4B-V1 — File Asset Foreign Key Constraint Resolution

**Document Type:** Issue Resolution  
**Classification:** Internal — Engineering  
**Date:** 2026-05-07  
**Issue:** P4B-V-010  
**Severity:** P0 (blocking Phase 4B-V1 validation gate)  
**Owner:** Afronovation Engineering Team

---

## Root Cause Analysis

**Issue:** CSV upload passed storage upload but failed with "Failed to create file asset record"

**Root Cause:** Foreign key constraint violation — `souvera_source_file_assets.source_id` is `NOT NULL` with a foreign key constraint to `souvera_data_sources(id)`, but the upload form allows `source_id` to be optional. When admins upload without selecting a source, `source_id` is null, causing the database insert to fail.

---

## Data Flow Visualization

```
Upload Form (source optional)
  ↓ source_id = null
Upload API Route
  ↓ sourceId = null
Database Insert
  ↓ source_id: null
souvera_source_file_assets (source_id NOT NULL)
  ↓ CONSTRAINT VIOLATION
ERROR: null value violates not-null constraint
```

---

## Governance Model

The solution implements a controlled staging source that maintains Souvera's source-attribution discipline:

```
Known source selected → use selected source_id
No source selected → use controlled Ad-hoc Admin Upload source
Review stage → admin may reassign to authoritative source before publication
Published intelligence → must remain source-attributed
```

**Key Principle:** The ad-hoc source is a **staging mechanism**, NOT a loophole around source attribution.

---

## Solution Implemented

### 1. SQL Pack v1.18 — Controlled Ad-hoc Staging Source

**File:** `infra/supabase/sql-pack-v1.18-phase-4b-adhoc-source.sql`

**Creates data source:**
- `key = 'adhoc_admin_upload'`
- `name = 'Ad-hoc Admin Upload'`
- `domain = 'admin'`
- `source_type = 'manual'` (valid enum value)
- `ingestion_method = 'manual_upload'` (valid enum value)
- `confidence_level = 'medium'`
- `attribution_template = 'Source: Admin Upload'`
- `is_active = true`

**Governance notes in SQL pack:**
> "Controlled staging source for direct admin file uploads without a selected source. Records may be reassigned to authoritative sources during review before publication. This maintains data integrity while allowing quick admin uploads."

---

### 2. Upload Route Fallback Logic

**File:** `apps/api-gateway/src/app/api/v1/admin/upload/route.ts`

**Changes:**
1. Added constant: `ADHOC_SOURCE_KEY = 'adhoc_admin_upload'`
2. Added fallback logic after reading `sourceId` from form:
   ```typescript
   let resolvedSourceId = sourceId;
   
   if (!resolvedSourceId) {
     const { data: adhocSource, error: adhocSourceError } = await supabase
       .from('souvera_data_sources')
       .select('id')
       .eq('key', ADHOC_SOURCE_KEY)
       .single();
     
     if (adhocSourceError || !adhocSource?.id) {
       console.error('Default ad-hoc source lookup failed:', adhocSourceError);
       
       return NextResponse.json({
         error: 'No source selected and default source not found',
         details: adhocSourceError?.message || 'Default ad-hoc upload source is missing',
         sourceKey: ADHOC_SOURCE_KEY,
       }, { status: 400 });
     }
     
     resolvedSourceId = adhocSource.id;
   }
   ```
3. Updated file asset insert to use `resolvedSourceId` instead of `sourceId`
4. Updated batch insert to use `resolvedSourceId` instead of `sourceId`
5. Added governance comment in code:
   ```typescript
   // Governance note:
   // Ad-hoc Admin Upload is a controlled staging source for admin-uploaded files
   // when no explicit source is selected. It must not be treated as final
   // authoritative source attribution for published intelligence without review.
   ```

---

## Enum Values Verified

**Database Schema Confirmation:**

From `sql-pack-v1.14`:
```sql
CREATE TYPE souvera_source_type AS ENUM (
  'api',
  'file',
  'manual'
);
```

From `sql-pack-v1.15`:
```sql
CREATE TYPE souvera_ingestion_method AS ENUM (
  'api_connector',
  'manual_upload',
  'admin_file_fetch',
  'monitored_source',
  'reference_link_only'
);
```

**Values Used in SQL Pack v1.18:**
- `source_type = 'manual'` ✅ Valid
- `ingestion_method = 'manual_upload'` ✅ Valid

---

## Manual Execution Steps

### Step 1: Execute SQL Pack v1.18

**Action:** Execute `infra/supabase/sql-pack-v1.18-phase-4b-adhoc-source.sql` in Supabase SQL Editor

**Verification Query (included in SQL pack):**
```sql
SELECT 
  id,
  key,
  name,
  domain,
  source_type,
  ingestion_method,
  confidence_level,
  is_active,
  created_at
FROM public.souvera_data_sources
WHERE key = 'adhoc_admin_upload';
```

**Expected Result:**
```
1 row returned
key = 'adhoc_admin_upload'
domain = 'admin'
source_type = 'manual'
ingestion_method = 'manual_upload'
is_active = true
```

---

### Step 2: Rebuild and Restart Dev Server

**Action:** Rebuild Next.js application to include upload route changes

```bash
# Stop current dev server (Ctrl+C)
# Rebuild
npm run dev
```

---

### Step 3: Retest CSV Upload

**Action:** Upload `docs/qa/test-data/phase-4b/agoa-status-valid.csv` without selecting a source

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

### Step 4: Verify Database Records

**Query 1 — File Assets:**
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
  is_pdf_evidence,
  fetch_method,
  created_at
FROM public.souvera_source_file_assets
ORDER BY created_at DESC
LIMIT 20;
```

**Expected:**
- `file_name = 'agoa-status-valid.csv'`
- `storage_bucket = 'source-files'`
- `is_pdf_evidence = false`
- `source_id IS NOT NULL` (should be ad-hoc source ID)
- `fetch_method = 'upload'`

---

**Query 2 — Ingestion Batches:**
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
  approved_at,
  published_at,
  created_by,
  created_at
FROM public.souvera_source_file_ingestion_batches
ORDER BY created_at DESC
LIMIT 20;
```

**Expected:**
- `file_asset_id IS NOT NULL`
- `source_id IS NOT NULL` (should be ad-hoc source ID)
- `status = 'uploaded'`
- `approved_at IS NULL` ✅ (not auto-approved)
- `published_at IS NULL` ✅ (not auto-published)
- `created_by IS NOT NULL` (admin user ID)

---

**Query 3 — Verify Ad-hoc Source Used:**
```sql
SELECT 
  fa.id AS asset_id,
  fa.file_name,
  ds.key AS source_key,
  ds.name AS source_name,
  ds.domain AS source_domain,
  ds.source_type,
  ds.ingestion_method,
  fa.created_at
FROM public.souvera_source_file_assets fa
JOIN public.souvera_data_sources ds ON fa.source_id = ds.id
WHERE fa.file_name = 'agoa-status-valid.csv'
ORDER BY fa.created_at DESC
LIMIT 5;
```

**Expected:**
- `source_key = 'adhoc_admin_upload'`
- `source_name = 'Ad-hoc Admin Upload'`
- `source_domain = 'admin'`
- `source_type = 'manual'`
- `ingestion_method = 'manual_upload'`

---

## CSV-Only Acceptance Criteria

Phase 4B-V1 passes if all 8 criteria are met:

| # | Criterion | Verification Method | Status |
|---|-----------|---------------------|--------|
| 1 | Admin can access `/admin/data/upload` | Browser test | ⏳ |
| 2 | CSV uploads without error | API success response | ⏳ |
| 3 | Storage object created | SQL query (Step 4) | ⏳ |
| 4 | File asset record created | SQL query (Step 4.1) | ⏳ |
| 5 | Ingestion batch created | SQL query (Step 4.2) | ⏳ |
| 6 | Batch NOT auto-approved | `approved_at IS NULL` | ⏳ |
| 7 | Batch NOT auto-published | `published_at IS NULL` | ⏳ |
| 8 | Browser shows success state | UI confirmation | ⏳ |

---

## Security & Governance Safeguards

### Data Integrity Maintained
- ✅ Every file has a source (no orphaned files)
- ✅ Source-attribution discipline preserved
- ✅ FK constraints remain enforced

### Controlled Staging Mechanism
- ✅ Ad-hoc source is clearly labeled as staging
- ✅ Allows quick admin uploads without pre-creating sources
- ✅ Requires review before publication
- ✅ Encourages reassignment to authoritative sources

### No Security Weakening
- ✅ Admin authorization unchanged
- ✅ RLS unchanged
- ✅ Service role upload unchanged
- ✅ No automatic approval or publication

### Governance Comments
- ✅ Code comment explaining staging nature
- ✅ SQL pack documentation explaining purpose
- ✅ Database redistribution notes field populated

---

## Files Changed

1. `infra/supabase/sql-pack-v1.18-phase-4b-adhoc-source.sql` — NEW (ad-hoc source seed)
2. `apps/api-gateway/src/app/api/v1/admin/upload/route.ts` — Modified (fallback logic)
3. `docs/backlog/phase-4b-validation-issues.md` — Updated (P4B-V-010 added)
4. `docs/qa/phase-4b-browser-qa-results.md` — Updated (status and resolution)
5. `docs/status/phase-4b-status.md` — Updated (current status and artifacts)
6. `docs/qa/phase-4b-v1-file-asset-fk-resolution.md` — NEW (this document)

---

## Resolution Status

**Current Status:** ⏳ **Fix Ready for Manual Execution**

**Completed:**
- ✅ Root cause identified and confirmed
- ✅ Valid enum values verified
- ✅ SQL Pack v1.18 created
- ✅ Upload route updated with fallback logic
- ✅ File asset payload aligned to schema
- ✅ Batch payload aligned to schema
- ✅ Governance safeguards implemented
- ✅ Documentation updated

**Pending:**
- ⏳ Manual execution of SQL Pack v1.18
- ⏳ Dev server rebuild and restart
- ⏳ CSV upload retest
- ⏳ Database verification queries
- ⏳ CSV acceptance criteria validation

**Next Action:** Human must execute SQL Pack v1.18 in Supabase Dashboard, then retest CSV upload.

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-07  
**Owner:** Afronovation Engineering Team  
**Status:** ✅ **Implementation Complete — Awaiting Manual Execution**
