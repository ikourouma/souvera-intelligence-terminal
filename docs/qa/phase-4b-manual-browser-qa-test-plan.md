# Phase 4B-V Manual Browser QA Test Plan

**Document Type:** Manual Test Plan  
**Classification:** Internal — Engineering / QA  
**Date:** 2026-05-06  
**Version:** 1.0  
**Owner:** Afronovation Engineering Team

---

## Purpose

This test plan provides step-by-step instructions for manually validating the Phase 4B ingestion architecture admin upload UI and workflow in a browser environment.

**Scope:** Validate that the admin upload interface at `/admin/data/upload` operates correctly after successful SQL verification.

**Out of Scope:**
- AGOA/AfCFTA tracker publication
- Supply-demand expansion
- Phase 4C work
- New feature development

---

## Prerequisites

### Required Access
- ✅ Running development server (`npm run dev`)
- ✅ Web browser (Chrome, Firefox, Safari, or Edge)
- ✅ Admin credentials for Souvera Intelligence Terminal
- ✅ Access to test data files (see Test Data section)
- ✅ Supabase dashboard access (for verification)

### Required Environment
- ✅ SQL Pack v1.14 executed
- ✅ SQL Pack v1.15 executed
- ✅ SQL Pack v1.16 executed (storage bucket setup)
- ✅ RLS enabled on all 9 ingestion tables
- ✅ Policy monitors seeded
- ✅ Ingestion templates seeded (AGOA, AfCFTA)
- ✅ **Supabase Storage bucket `source-files` created (private)**
- ✅ **Test user has `platform_admin` or `org_admin` role in `souvera_organization_members`**

### Test Data Location
```
docs/qa/test-data/phase-4b/
```

---

## Dev Server Startup

### Step 1: Navigate to Project Root
```bash
cd c:/Users/ikour/Projects/souvera
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Verify Server Started
Expected output:
```
> souvera@ dev
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in XXXms
```

### Step 4: Open Browser
Navigate to:
```
http://localhost:3000/admin/data/upload
```

---

## Browser QA Checklist

Execute each test and mark status:

| # | Test | Expected Result | Status | Notes |
|---|---|---|---|---|
| 1 | Dev server starts | `npm run dev` succeeds | ☐ | |
| 2 | Route loads | `/admin/data/upload` renders without fatal errors | ☐ | |
| 3 | Upload UI renders | Upload area visible | ☐ | |
| 4 | Drag-and-drop area renders | File selection/drop zone visible | ☐ | |
| 5 | Source name field renders | Field visible and required | ☐ | |
| 6 | Source URL field renders | Field visible and captured | ☐ | |
| 7 | As-of date field renders | Field visible and captured | ☐ | |
| 8 | Confidence level renders | Field visible and selectable (high/medium/low/curated) | ☐ | |
| 9 | Template selection renders | AGOA and AfCFTA templates available in dropdown | ☐ | |
| 10 | CSV upload works | File accepted, batch created | ☐ | |
| 11 | JSON upload works | File accepted, batch created | ☐ | |
| 12 | PDF evidence upload works | Evidence stored, no parsing required | ☐ | |
| 13 | XLSX behavior documented | Either works or displays documented limitation | ☐ | |
| 14 | Success state renders | Confirmation message visible after upload | ☐ | |
| 15 | Error state renders | Error message visible on invalid upload | ☐ | |
| 16 | Batch management link renders | User can navigate to created batch or batch list | ☐ | |
| 17 | No automatic publication | Upload does not publish without admin approval | ☐ | |
| 18 | No prohibited language | No "live data," "real-time," or prohibited copy | ☐ | |

---

## Upload Workflow Validation

### Test 1: AGOA Valid CSV Upload

**File:** `docs/qa/test-data/phase-4b/agoa-status-valid.csv`

**Steps:**
1. Navigate to `/admin/data/upload`
2. Select or drag `agoa-status-valid.csv`
3. Fill source metadata:
   - **Source Name:** "USTR AGOA Eligibility Test"
   - **Source URL:** https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa
   - **As-of Date:** 2026-05-06
   - **Confidence Level:** High
4. Select **Template:** "AGOA Eligibility Status Upload"
5. Enter **Batch Name:** "AGOA Test Upload 1"
6. Click **Upload**

**Expected Results:**
- ✅ File accepted
- ✅ Source metadata captured
- ✅ Batch created
- ✅ 3 rows parsed (NGA, KEN, GHA)
- ✅ Rows ready for validation
- ✅ No automatic publication
- ✅ Success confirmation displayed
- ✅ Batch ID or link provided

**Verification:**
- Check Supabase `souvera_source_file_ingestion_batches` table for new batch
- Verify batch status is `uploaded` or `parsed`, not `published`
- Check `souvera_source_file_ingestion_rows` for 3 parsed rows

**Status:** ☐ Pass / ☐ Fail / ☐ Blocked

**Notes:**
_____________________________________________

---

### Test 2: AfCFTA Valid CSV Upload

**File:** `docs/qa/test-data/phase-4b/afcfta-status-valid.csv`

**Steps:**
1. Navigate to `/admin/data/upload`
2. Select or drag `afcfta-status-valid.csv`
3. Fill source metadata:
   - **Source Name:** "AfCFTA Implementation Test"
   - **Source URL:** https://au-afcfta.org/
   - **As-of Date:** 2026-05-06
   - **Confidence Level:** High
4. Select **Template:** "AfCFTA Implementation Status Upload"
5. Enter **Batch Name:** "AfCFTA Test Upload 1"
6. Click **Upload**

**Expected Results:**
- ✅ File accepted
- ✅ Batch created
- ✅ 3 rows parsed (NGA, KEN, GHA)
- ✅ Rows ready for validation
- ✅ No automatic publication
- ✅ Success confirmation displayed

**Verification:**
- Check Supabase for new batch
- Verify batch status is not `published`
- Check for 3 parsed rows

**Status:** ☐ Pass / ☐ Fail / ☐ Blocked

**Notes:**
_____________________________________________

---

### Test 3: Invalid ISO3 Country Code Upload

**File:** `docs/qa/test-data/phase-4b/invalid-country-code.csv`

**Steps:**
1. Navigate to `/admin/data/upload`
2. Upload `invalid-country-code.csv` with AGOA template
3. Fill required source metadata
4. Click **Upload**

**Expected Results:**
- ✅ File accepted initially
- ✅ Batch created
- ✅ 2 rows parsed
- ⚠️ Row with ISO3 "ZZZ" flagged as invalid or rejected
- ✅ Row with ISO3 "NGA" accepted
- ✅ Validation errors displayed
- ✅ No automatic publication

**Verification:**
- Check `souvera_source_file_ingestion_rows`
- Verify row with `iso3 = 'ZZZ'` has `row_status = 'invalid'` or `is_excluded = TRUE`
- Verify row with `iso3 = 'NGA'` has `row_status = 'valid'` or similar

**Status:** ☐ Pass / ☐ Fail / ☐ Blocked

**Notes:**
_____________________________________________

---

### Test 4: ESH / Western Sahara Rejection Test

**File:** `docs/qa/test-data/phase-4b/esh-rejection-test.csv`

**Steps:**
1. Navigate to `/admin/data/upload`
2. Upload `esh-rejection-test.csv` with AGOA template
3. Fill required source metadata
4. Click **Upload**

**Expected Results:**
- ✅ File accepted initially
- ✅ Batch created
- ✅ 2 rows parsed
- ⚠️ Row with ISO3 "ESH" rejected or flagged as excluded from public Souvera scope
- ✅ Row with ISO3 "NGA" accepted
- ✅ Validation warning displayed: "ESH / Western Sahara excluded from public scope"
- ✅ No automatic publication

**Verification:**
- Check `souvera_source_file_ingestion_rows`
- Verify row with `iso3 = 'ESH'` has `is_excluded = TRUE` or `row_status = 'excluded'`
- Verify ESH is NOT marked as publishable
- Check validation errors/warnings column for ESH exclusion message

**Status:** ☐ Pass / ☐ Fail / ☐ Blocked

**Notes:**
_____________________________________________

---

### Test 5: JSON Upload

**File:** `docs/qa/test-data/phase-4b/agoa-status-valid.json`

**Steps:**
1. Navigate to `/admin/data/upload`
2. Upload `agoa-status-valid.json` with AGOA template
3. Fill required source metadata
4. Click **Upload**

**Expected Results:**
- ✅ JSON file accepted
- ✅ Batch created
- ✅ 3 rows parsed
- ✅ No automatic publication
- ✅ Success confirmation displayed

**Verification:**
- Check Supabase for new batch
- Verify JSON parsing worked
- Verify 3 rows created

**Status:** ☐ Pass / ☐ Fail / ☐ Blocked

**Notes:**
_____________________________________________

---

### Test 6: PDF Evidence Upload

**File:** Manually created PDF (see `docs/qa/test-data/phase-4b/pdf-evidence-placeholder.md` for instructions)

**Steps:**
1. Create a simple PDF evidence file following placeholder instructions
2. Navigate to `/admin/data/upload`
3. Upload PDF file
4. Fill source metadata
5. Select **Template:** (either AGOA or AfCFTA)
6. Click **Upload**

**Expected Results:**
- ✅ PDF accepted as source evidence
- ✅ PDF stored in Supabase Storage
- ✅ File asset created
- ✅ Batch created
- ℹ️ No rows parsed (PDF is evidence, not data)
- ✅ No automatic publication
- ✅ Success confirmation: "Evidence file uploaded"

**Verification:**
- Check `souvera_source_file_assets` for PDF file
- Check Supabase Storage bucket for uploaded PDF
- Verify `souvera_source_file_ingestion_rows` has zero rows for this batch (or batch marked as evidence-only)
- Verify batch status is not `published`

**Status:** ☐ Pass / ☐ Fail / ☐ Blocked

**Notes:**
_____________________________________________

---

### Test 7: XLSX Limitation Test

**File:** Manually created XLSX file (Excel format)

**Steps:**
1. Create a simple XLSX file with AGOA data (same structure as CSV)
2. Navigate to `/admin/data/upload`
3. Attempt to upload XLSX file
4. Observe behavior

**Expected Results (Option A - XLSX Unsupported):**
- ⚠️ Error message: "XLSX parsing not yet supported. Please convert to CSV or JSON."
- ℹ️ Documented limitation displayed
- ⚠️ Upload rejected or warned
- ℹ️ Issue P4B-001 remains deferred (non-blocking)

**Expected Results (Option B - XLSX Supported):**
- ✅ XLSX file accepted
- ✅ Batch created
- ✅ Rows parsed
- ✅ Issue P4B-001 can be marked resolved

**Verification:**
- Document actual behavior
- Update `docs/backlog/phase-4b-validation-issues.md` with XLSX status

**Status:** ☐ Pass / ☐ Fail / ☐ Blocked

**Notes:**
_____________________________________________

---

## Governance Language Check

While performing browser QA, verify the following:

| Prohibited Term | Status | Location (if found) |
|---|---|---|
| "live data" | ☐ Not found / ☐ Found at: __________ |  |
| "real-time" | ☐ Not found / ☐ Found at: __________ |  |
| "Real-Time" | ☐ Not found / ☐ Found at: __________ |  |
| "live intelligence" | ☐ Not found / ☐ Found at: __________ |  |
| "official compliance score" | ☐ Not found / ☐ Found at: __________ |  |
| "49 AGOA eligible countries" | ☐ Not found / ☐ Found at: __________ |  |
| "guaranteed opportunity score" | ☐ Not found / ☐ Found at: __________ |  |

**Approved Language Verified:**
- ☐ "Source-Attributed Preview"
- ☐ "Curated Preview Data"
- ☐ "Data pending"
- ☐ "Under review"
- ☐ "Source confidence"

---

## Failure Handling

If any test fails:

1. **Document the failure** in "Notes" section above
2. **Take a screenshot** of the error (if applicable)
3. **Check browser console** for errors (F12 → Console tab)
4. **Check network tab** for failed API requests (F12 → Network tab)
5. **Log the issue** in `docs/backlog/phase-4b-validation-issues.md`

**Issue Logging Format:**

| ID | Severity | Area | Issue | Resolution | Status |
|---|---|---|---|---|---|
| P4B-QA-XXX | P0/P1/P2/P3 | Browser QA / Upload | [Description] | [Resolution or TBD] | Open |

**Severity Definitions:**
- **P0:** Blocks validation gate (e.g., route doesn't load, fatal error)
- **P1:** Must fix before Phase 4B-V closure (e.g., upload fails, no batch created)
- **P2:** Can defer with workaround (e.g., XLSX unsupported as documented)
- **P3:** Enhancement/backlog (e.g., UI polish, better error messages)

---

## Pass/Fail Criteria

### ✅ PASS Criteria

Browser QA **PASSES** if:
- ✅ `/admin/data/upload` route loads without fatal errors
- ✅ Upload UI renders with all required fields
- ✅ CSV upload works (batch created, no auto-publish)
- ✅ JSON upload works (batch created, no auto-publish)
- ✅ Invalid ISO3 is flagged or rejected
- ✅ ESH is rejected or excluded from public scope
- ✅ PDF evidence upload works (stored, no parsing required)
- ✅ No prohibited language appears
- ✅ No automatic publication occurs

### ❌ FAIL Criteria

Browser QA **FAILS** if:
- ❌ Route doesn't load or throws fatal error
- ❌ Upload UI is broken or missing required fields
- ❌ CSV/JSON upload fails completely
- ❌ Invalid ISO3 or ESH is accepted into public scope
- ❌ Upload automatically publishes data
- ❌ Prohibited language appears on page

### ⚠️ PARTIAL PASS Criteria

Browser QA **PARTIALLY PASSES** if:
- ⚠️ XLSX parsing unsupported (P4B-001 remains deferred, non-blocking)
- ⚠️ Minor UI issues that don't block core workflow
- ⚠️ Non-critical validation warnings

---

## Final Tester Sign-Off

**Test Executed By:** ___________________________

**Date:** ___________________________

**Overall Result:** ☐ Pass / ☐ Fail / ☐ Partial Pass

**Blockers Found:** ☐ None / ☐ Yes (documented in issues log)

**Ready to Proceed to Monitor Validation:** ☐ Yes / ☐ No

**Notes:**

_____________________________________________

_____________________________________________

_____________________________________________

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Engineering Team
