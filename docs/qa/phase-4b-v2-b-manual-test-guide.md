# Phase 4B-V2-B — Manual Test Execution Guide

**Document Type:** Test Execution Guide  
**Classification:** Internal — QA  
**Date:** 2026-05-09  
**Status:** Ready for Manual Execution

---

## Prerequisites

### 1. Platform Admin User

The parse and validate endpoints require `platform_admin` access. You must be logged in as the dev platform admin:

- **Email:** admin@souveraterminal.com
- **Password:** Password1!
- **Role:** platform_admin
- **Organization:** Admin Test Organization

**⚠️ Security Notice:** This credential is for LOCAL/DEV QA ONLY. Do not use it in production, staging exposed to the internet, or any shared remote environment. Rotate or delete the account after QA if it is provisioned outside local development.

**To provision this account:**

```bash
npx tsx scripts/seed-platform-admin.ts
```

Expected output:
```
═══════════════════════════════════════════════════════════════
 PLATFORM ADMIN READY
═══════════════════════════════════════════════════════════════

  Email: admin@souveraterminal.com
  Role: platform_admin
  Organization: Admin Test Organization
  Status: ✅ Ready for local QA
```

### 2. Login Before Testing

1. Navigate to http://localhost:3010/login
2. Log in as **admin@souveraterminal.com** (Password1!)
3. Verify you can access `/admin/data/upload`
4. Keep this browser session active during testing

**⚠️ Important:** Do not run parse/validate tests as `professional@afronovation.com`, member, explorer, or business users. A 403 response from parse/validate usually means you are not logged in as a platform admin.

### 3. Other Prerequisites

- [ ] Dev server running at `http://localhost:3010`
- [ ] Admin user authenticated with `platform_admin` role (see above)
- [ ] Supabase dashboard access for SQL queries
- [ ] Test file accessible at `docs/qa/test-data/phase-4b/invalid-country-code.csv`

---

## Step-by-Step Manual Execution

### Step 1: Upload Invalid ISO3 CSV

**Action:** Navigate to `http://localhost:3010/admin/data/upload`

**Upload Form Values:**
- **File:** Select `docs/qa/test-data/phase-4b/invalid-country-code.csv`
- **Source Selection:** Leave empty (test adhoc_admin_upload fallback)
- **Source Name:** `Test Invalid ISO3`
- **As-of Date:** `2026-05-09`
- **Batch Name:** `invalid-iso3-test`
- **Confidence Level:** Leave default (curated)

**Expected Result:**
- HTTP 201 Success
- Green success message displayed
- Batch ID visible in response

**Record Results Here:**
```
Batch ID: _________________________________
File Asset ID: _________________________________
Ingestion Run ID: _________________________________
Upload Timestamp: _________________________________
Success Message: _________________________________
```

**Screenshot:** Capture success screen

---

### Step 2: Parse the Batch

**Action:** Make API call to parse endpoint

**Using Browser DevTools / Postman / cURL:**

```bash
POST http://localhost:3010/api/v1/admin/batches/{BATCH_ID}/parse
Authorization: Bearer {YOUR_AUTH_TOKEN}
```

Replace `{BATCH_ID}` with the actual batch ID from Step 1.

**Expected Response:**
```json
{
  "success": true,
  "message": "File parsed successfully",
  "total_rows": 2,
  "columns": ["iso3", "country_name", "agoa_status", "apparel_status", "as_of_date", "source_url", "notes"],
  "next_step": "Proceed to column mapping"
}
```

**Record Results Here:**
```
Parse Success: Yes / No
HTTP Status: _________________________________
Total Rows: _________________________________
Errors (if any): _________________________________
```

---

### Step 3: Validate the Batch

**Action:** Make API call to validate endpoint

**Request:**
```bash
POST http://localhost:3010/api/v1/admin/batches/{BATCH_ID}/validate
Content-Type: application/json
Authorization: Bearer {YOUR_AUTH_TOKEN}

{
  "country_column": "iso3",
  "country_code_type": "iso3",
  "required_fields": ["iso3", "country_name", "agoa_status"],
  "data_type": "agoa_status"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Batch validated successfully",
  "summary": {
    "total": 2,
    "valid": 1,
    "invalid": 1,
    "warnings": 0,
    "excluded": 0
  },
  "next_step": "Review validated rows and proceed to approval"
}
```

**Record Results Here:**
```
Validate Success: Yes / No
HTTP Status: _________________________________
Total Rows: _________________________________
Valid Rows: _________________________________
Invalid Rows: _________________________________
Warnings: _________________________________
Excluded: _________________________________
Errors (if any): _________________________________
```

---

### Step 4: SQL Verification Queries

**Action:** Run verification queries in Supabase SQL Editor

#### Pre-Verification: Ad-hoc Source Check

```sql
SELECT id, key, name, source_type, ingestion_method, is_active
FROM public.souvera_data_sources
WHERE key = 'adhoc_admin_upload';
```

**Record Results:**
```
Source ID: _________________________________
Is Active: _________________________________
```

#### Query 1: Verify File Asset

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

**Record Results:**
```
File Asset ID: _________________________________
Source Check: PASS / FAIL
File Type: _________________________________
Storage Path: _________________________________
Fetched At: _________________________________
```

#### Query 2: Verify Batch

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

**Record Results:**
```
Batch ID: _________________________________
Source Check: PASS / FAIL
Status: _________________________________
Total Rows: _________________________________
Valid Rows: _________________________________
Invalid Rows: _________________________________
Approved At: _________________________________
Published At: _________________________________
```

#### Query 3: Verify Ingestion Rows

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

**Record Results:**

**Row 1 (ZZZ):**
```
Row ID: _________________________________
Status: _________________________________
Mapped ISO3: _________________________________
Validation Errors: _________________________________
Is Excluded: _________________________________
```

**Row 2 (NGA):**
```
Row ID: _________________________________
Status: _________________________________
Mapped ISO3: _________________________________
Validation Errors: _________________________________
Is Excluded: _________________________________
```

#### Query 4: Verify Storage Object

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

**Record Results:**
```
Storage Object ID: _________________________________
Bucket ID: _________________________________
File Name: _________________________________
MIME Type: _________________________________
File Size: _________________________________
```

---

## Acceptance Criteria Evaluation

After completing all steps, evaluate each acceptance criterion:

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| AC-1 | Invalid ISO3 CSV uploads successfully | [ ] PASS [ ] FAIL | Upload response |
| AC-2 | Storage object is created | [ ] PASS [ ] FAIL | Query 4 result |
| AC-3 | File asset is created | [ ] PASS [ ] FAIL | Query 1 result |
| AC-4 | Batch is created | [ ] PASS [ ] FAIL | Query 2 result |
| AC-5 | Ingestion run is created | [ ] PASS [ ] FAIL | Batch has ingestion_run_id |
| AC-6 | Parse endpoint succeeds | [ ] PASS [ ] FAIL | Parse response |
| AC-7 | Exactly 2 ingestion rows are created | [ ] PASS [ ] FAIL | Query 3: 2 rows |
| AC-8 | Validate endpoint succeeds | [ ] PASS [ ] FAIL | Validate response |
| AC-9 | ZZZ row is marked invalid | [ ] PASS [ ] FAIL | Query 3: row 1 status |
| AC-10 | ZZZ validation_errors contains INVALID_MARKET | [ ] PASS [ ] FAIL | Query 3: row 1 errors |
| AC-11 | NGA row is marked valid | [ ] PASS [ ] FAIL | Query 3: row 2 status |
| AC-12 | Batch valid_rows=1, invalid_rows=1 | [ ] PASS [ ] FAIL | Query 2 result |
| AC-13 | Batch is not approved | [ ] PASS [ ] FAIL | Query 2: approved_at NULL |
| AC-14 | Batch is not published | [ ] PASS [ ] FAIL | Query 2: published_at NULL |
| AC-15 | No code/schema changes made | [ ] PASS [ ] FAIL | Confirmation |

---

## Final Verdict

**Overall Result:** [ ] ALL PASS [ ] SOME FAIL

**Pass Count:** _____ / 15

**Fail Count:** _____ / 15

**Gate Status:** [ ] PASSED [ ] BLOCKED

---

## Next Steps

**If ALL AC Pass:**
- Mark Phase 4B-V2-B as PASSED
- Proceed to creating completion documentation
- Recommend Phase 4B-V2-C — ESH Rejection Workflow Validation

**If ANY AC Fail:**
- Document failures in validation results
- Investigate root cause
- Do NOT proceed to Phase 4B-V2-C

---

## Troubleshooting

### 403 Forbidden During Parse or Validate

**Symptom:** PowerShell returns `Invoke-RestMethod : The remote server returned an error: (403) Forbidden.`

**Likely Causes:**
1. You are logged in as a non-admin user (e.g., `professional@afronovation.com`)
2. Your session expired
3. The account does not have `platform_admin` role in `souvera_organization_members`
4. You copied a browser cookie from the wrong user session

**Resolution:**
1. Log out of the browser completely
2. Log in as **`admin@souveraterminal.com`** (Password1!)
3. Navigate to `/admin/data/upload` to confirm admin access
4. Extract the session cookie again (it will now be for the admin user)
5. Retry the parse/validate PowerShell commands with the new cookie

**Alternative:** Use the browser console to call the API directly:

```javascript
// In browser console at http://localhost:3010/admin/data/upload
fetch('http://localhost:3010/api/v1/admin/batches/YOUR_BATCH_ID/parse', {
  method: 'POST',
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

### How to Verify Admin Role

Run this SQL in Supabase SQL Editor:

```sql
SELECT 
  u.email,
  om.role,
  o.name as organization
FROM auth.users u
LEFT JOIN souvera_organization_members om ON om.user_id = u.id
LEFT JOIN souvera_organizations o ON o.id = om.organization_id
WHERE u.email = 'admin@souveraterminal.com';
```

**Expected result:**
- email: `admin@souveraterminal.com`
- role: `platform_admin`
- organization: `Admin Test Organization`

If the role is NULL or missing, run the provisioning script again:

```bash
npx tsx scripts/seed-platform-admin.ts
```

### Parse or Validate Returns 404

**Cause:** Batch ID is incorrect or does not exist.

**Resolution:** 
1. Verify the batch ID from the upload response
2. Check that the batch exists:

```sql
SELECT id, batch_name, status, file_asset_id
FROM souvera_source_file_ingestion_batches
WHERE id = 'YOUR_BATCH_ID';
```

### PowerShell Cookie Extraction Issues

If you have trouble extracting cookies from the browser:

**Option 1:** Use browser console fetch (see above)

**Option 2:** Use REST Client extension in VS Code:
1. Install "REST Client" extension
2. Create `test-api.http` file
3. Add requests with your batch ID
4. Click "Send Request" above each request

**Option 3:** Use Postman or Insomnia GUI tools

---

**Document Status:** Ready for Execution  
**Created:** 2026-05-09  
**Executor:** Manual QA  
**Approval Required:** After all AC verified
