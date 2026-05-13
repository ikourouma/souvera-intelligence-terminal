# Phase 4B-V2-B — Invalid ISO3 Validation Readiness Report

**Document Type:** Readiness Assessment  
**Classification:** Internal — Engineering  
**Date:** 2026-05-09  
**Owner:** Afronovation Engineering Team  
**Status:** READY FOR IMPLEMENTATION

---

## Readiness Verdict

**READY FOR IMPLEMENTATION** (with recommended workflow clarifications)

Phase 4B-V2-B can proceed immediately. The system already has complete validation logic, schema support, and architectural separation. No code changes or schema modifications are required.

---

## Executive Summary

**Key Finding:** Souvera already has a **fully implemented validation architecture** that is separate from the upload route. Invalid ISO3 validation exists and can be tested immediately using the existing workflow:

```
Upload → Parse → Validate → Review → Approve → Publish
```

**Current Architectural State:**
- Upload route = Storage only (validated in Phase 4B-V1 & V2-A)
- Parse route = CSV parsing into rows
- **Validate route = ISO3 + market scope + ESH validation (ALREADY EXISTS)**

**Implementation Requirement:**  
Phase 4B-V2-B is a workflow validation test, not a feature implementation. The task is to validate that the existing validation endpoint correctly detects invalid ISO3 codes using the test fixture.

---

## Files Inspected

### Core Implementation Files

1. **`apps/api-gateway/src/app/api/v1/admin/upload/route.ts`**
   - Status: Storage-only route (validated)
   - Contains no validation logic (by design)
   - Lifecycle stage: Upload → Store

2. **`apps/api-gateway/src/app/api/v1/admin/batches/[id]/parse/route.ts`**
   - Status: CSV/JSON parser implemented
   - Lifecycle stage: Parse
   - Creates rows in `souvera_source_file_ingestion_rows`

3. **`apps/api-gateway/src/app/api/v1/admin/batches/[id]/validate/route.ts`**
   - Status: **VALIDATION ENDPOINT ALREADY EXISTS**
   - Validates: ISO3, market scope, ESH exclusion, AGOA/AfCFTA status, dates
   - Lifecycle stage: Validate

4. **`apps/api-gateway/src/lib/ingestion/validators.ts`**
   - Status: **COMPLETE VALIDATION LOGIC IMPLEMENTED**
   - Contains: 74-market scope validation, ESH rejection, ISO3 validation
   - Functions: `validateRow()`, `isValidMarketScope()`, `isExcludedMarket()`

5. **`apps/api-gateway/src/lib/ingestion/parsers.ts`**
   - Status: CSV/JSON parsers implemented
   - Uses: PapaParse for CSV, native JSON.parse for JSON

### Schema Files

6. **`infra/supabase/sql-pack-v1.15-phase-4b-ingestion-architecture.sql`**
   - Table: `souvera_source_file_ingestion_rows` (lines 324-365)
   - Validation columns:
     - `validation_errors` (JSONB)
     - `validation_warnings` (JSONB)
     - `is_excluded` (boolean)
     - `exclusion_reason` (text)
     - `mapped_iso3` (text)
     - `status` (souvera_row_status enum)

### Test Fixtures

7. **`docs/qa/test-data/phase-4b/invalid-country-code.csv`**
   - Status: **TEST FILE EXISTS**
   - Contains: 2 rows (1 invalid `ZZZ`, 1 valid control `NGA`)
   - Structure: 7 columns (iso3, country_name, agoa_status, apparel_status, as_of_date, source_url, notes)

8. **`docs/qa/test-data/phase-4b/agoa-status-valid.csv`** (reference)
   - Valid test file for comparison

### Documentation

9. **`docs/status/phase-4b-status.md`**
   - Line 66: "74-market scope validation implemented" (marked complete)
   - Line 68: "AGOA status validation implemented" (marked complete)

10. **`docs/architecture/market-scope-governance.md`**
    - Documents 74-market scope architecture
    - Lists all valid ISO3 codes in SOUVERA_74_MARKET_SCOPE

---

## Question 1: Does Validation Logic Already Exist?

**Answer: YES — Complete validation logic is already implemented.**

### Existing Validation Components

#### A. Core Validator Function

From `apps/api-gateway/src/lib/ingestion/validators.ts` (lines 52-128):

```typescript
export function validateRow(
  row: Record<string, unknown>,
  config: {
    countryColumn?: string;
    requiredFields?: string[];
    countryCodeType?: 'iso3' | 'iso2' | 'name';
  }
): RowValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let mapped_iso3: string | undefined;
  let is_excluded = false;
  let exclusion_reason: string | undefined;

  // Validate country code
  if (config.countryColumn) {
    const countryValue = row[config.countryColumn];
    if (countryValue) {
      const countryStr = String(countryValue).toUpperCase().trim();
      
      if (config.countryCodeType === 'iso3' || countryStr.length === 3) {
        mapped_iso3 = countryStr;
        
        if (isExcludedMarket(countryStr)) {
          // ESH rejection
          errors.push({
            code: 'EXCLUDED_MARKET',
            message: 'ESH/Western Sahara excluded from Souvera public scope',
            field: config.countryColumn,
            value: countryValue,
          });
        } else if (!isValidMarketScope(countryStr)) {
          // INVALID ISO3 DETECTION (THIS IS THE RELEVANT CODE)
          errors.push({
            code: 'INVALID_MARKET',
            message: `Country "${countryStr}" is not in Souvera 74-market scope`,
            field: config.countryColumn,
            value: countryValue,
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    mapped_iso3,
    is_excluded,
    exclusion_reason,
  };
}
```

#### B. 74-Market Scope Definition

From `apps/api-gateway/src/lib/ingestion/validators.ts` (lines 14-30):

```typescript
export const SOUVERA_74_MARKET_SCOPE: readonly string[] = [
  // Africa - North
  'DZA', 'EGY', 'LBY', 'MAR', 'TUN',
  // Africa - West
  'BEN', 'BFA', 'CPV', 'CIV', 'GMB', 'GHA', 'GIN', 'GNB', 'LBR', 'MLI',
  'MRT', 'NER', 'NGA', 'SEN', 'SLE', 'TGO',
  // ... (54 African + 20 Caribbean = 74 total)
];

export function isValidMarketScope(iso3: string): boolean {
  return SOUVERA_74_MARKET_SCOPE.includes(iso3.toUpperCase());
}
```

#### C. Validation Endpoint

From `apps/api-gateway/src/app/api/v1/admin/batches/[id]/validate/route.ts` (lines 142-213):

The validation endpoint:
1. Fetches all rows from `souvera_source_file_ingestion_rows` for the batch
2. Calls `validateRow()` on each row
3. Stores validation errors in `validation_errors` column
4. Updates row status to `valid`, `invalid`, or `warning`
5. Updates batch counts: `valid_rows`, `invalid_rows`, `warning_rows`

**Conclusion:** All validation logic exists. No implementation required.

---

## Question 2: Where Should Validation Live?

**Answer: Validation already lives in the correct architectural location.**

### Current Architecture (Validated)

```
Upload Route → Storage → File Asset → Batch → Parse Route → Rows → Validate Route → Validated Rows → Review → Approve → Publish
```

### Architectural Separation (Already Implemented)

| Stage | Route | Responsibility | Status |
|-------|-------|----------------|--------|
| Upload | `/api/v1/admin/upload` | Storage + records | Validated (Phase 4B-V1, V2-A) |
| Parse | `/api/v1/admin/batches/[id]/parse` | CSV parsing into rows | Implemented |
| **Validate** | `/api/v1/admin/batches/[id]/validate` | **ISO3 + market scope validation** | **Implemented** |
| Review | (Future UI) | Admin review of errors | Not yet built |
| Approve | (Future endpoint) | Admin approval | Not yet built |
| Publish | (Future endpoint) | Publication to trackers | Not yet built |

**Recommendation:** Keep existing architecture. Upload route remains storage-only. Validation is correctly separated.

---

## Question 3: What is the Expected Behavior?

**Answer: Existing behavior matches governance-aligned design.**

### Current Behavior (Lines 185-212 of validate route)

For invalid ISO3 (e.g., `ZZZ`):

1. **File is accepted during upload** (storage-only, no validation)
2. **File is parsed into rows** (CSV parsing, no validation)
3. **Validation endpoint detects invalid ISO3:**
   - Row status set to `invalid`
   - `validation_errors` populated with:
     ```json
     [{
       "code": "INVALID_MARKET",
       "message": "Country \"ZZZ\" is not in Souvera 74-market scope",
       "field": "iso3",
       "value": "ZZZ"
     }]
     ```
   - `mapped_iso3` set to `"ZZZ"`
4. **Batch status updated:**
   - `status` = `validated`
   - `invalid_rows` = 1
   - `valid_rows` = 1 (NGA control row)
5. **Batch remains unpublished:**
   - `approved_at` = NULL
   - `published_at` = NULL

### Governance Alignment

This behavior is **optimal** because:
- Upload never rejects files (preserves evidence)
- Validation is explicit and auditable
- Invalid rows are flagged but preserved
- Admin review required before publication
- Follows established lifecycle: Upload → Parse → Validate → Review → Approve → Publish

**Recommendation:** No behavior changes required.

---

## Question 4: Are Schema Changes Required?

**Answer: NO — Existing schema is sufficient.**

### Existing Schema Support

From `sql-pack-v1.15-phase-4b-ingestion-architecture.sql` (lines 324-365):

```sql
CREATE TABLE IF NOT EXISTS public.souvera_source_file_ingestion_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.souvera_source_file_ingestion_batches(id),
  
  row_number INTEGER NOT NULL,
  raw_data JSONB NOT NULL,
  mapped_data JSONB,
  
  -- Country mapping
  source_country_value TEXT,
  mapped_country_id UUID REFERENCES public.souvera_countries(id),
  mapped_iso3 TEXT,
  
  -- VALIDATION COLUMNS (ALREADY EXIST)
  status souvera_row_status NOT NULL DEFAULT 'pending',
  validation_errors JSONB,           -- Stores array of error objects
  validation_warnings JSONB,         -- Stores array of warning objects
  
  -- Flags
  is_excluded BOOLEAN NOT NULL DEFAULT FALSE,
  exclusion_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Validation Result Storage

For `ZZZ` invalid ISO3, the system will store:

```sql
UPDATE souvera_source_file_ingestion_rows
SET
  status = 'invalid',
  mapped_iso3 = 'ZZZ',
  validation_errors = '[{
    "code": "INVALID_MARKET",
    "message": "Country \"ZZZ\" is not in Souvera 74-market scope",
    "field": "iso3",
    "value": "ZZZ"
  }]'::jsonb,
  is_excluded = false,
  updated_at = NOW()
WHERE id = <row_id>;
```

**Conclusion:** Existing schema is perfect. No changes required.

---

## Question 5: Is This Phase 4B-V2 or Phase 4B-V5?

**Answer: This is correctly scoped as Phase 4B-V2-B.**

### Rationale

**Phase 4B-V2-B scope:**
- Test existing validation logic with invalid ISO3 CSV
- Validate workflow: Upload → Parse → Validate
- Confirm validation errors are stored correctly
- No automatic parsing (manual API calls)
- No new features

**Phase 4B-V5 scope (FUTURE):**
- Automatic parsing after upload
- Automatic validation after parsing
- Background job processing
- Webhook/notification integration
- Parsing queue management

**Conclusion:** Phase 4B-V2-B is correctly scoped. This is a workflow validation test, not a feature implementation gate.

---

## Test Fixture Details

### File: `docs/qa/test-data/phase-4b/invalid-country-code.csv`

**Content:**
```csv
iso3,country_name,agoa_status,apparel_status,as_of_date,source_url,notes
ZZZ,Invalid Country,eligible,not_verified,2026-05-06,https://ustr.gov/,Invalid ISO3 test
NGA,Nigeria,eligible,not_verified,2026-05-06,https://ustr.gov/,Valid control row
```

**Structure:**
- **Columns:** 7 (iso3, country_name, agoa_status, apparel_status, as_of_date, source_url, notes)
- **Rows:** 2 data rows (1 invalid, 1 valid control)
- **Invalid value:** `ZZZ` (not in 74-market scope)
- **Control value:** `NGA` (Nigeria, valid African country)

**Mirror Structure:**  
Yes — matches AGOA/AfCFTA fixture structure (7 columns, same format)

**Expected Behavior:**
- Row 1 (ZZZ): `status = 'invalid'`, `validation_errors` populated
- Row 2 (NGA): `status = 'valid'`, no errors

---

## Risk Analysis and Mitigations

### Risk 1: Mixing Upload Validation with Data Validation

**Status:** Not a risk — architecture already prevents this

**Evidence:** Upload route contains zero validation logic (validated in Phase 4B-V1 & V2-A)

**Mitigation:** Already mitigated by existing architectural separation

---

### Risk 2: Rejecting Files Too Early

**Status:** Not a risk — upload always succeeds

**Evidence:** Upload route only checks file type, not content

**Mitigation:** Already mitigated. Files are never rejected during upload.

---

### Risk 3: Creating Duplicate Partial Records

**Status:** Not a risk — single-pass workflow

**Evidence:** 
- Upload creates: 1 file asset, 1 batch, 1 ingestion run
- Parse creates: N rows
- Validate updates: rows (in-place update, no inserts)

**Mitigation:** Already mitigated by design. No duplicate records created.

---

### Risk 4: No Place to Store Row-Level Validation Errors

**Status:** Not a risk — schema already supports this

**Evidence:** `validation_errors` JSONB column in `souvera_source_file_ingestion_rows`

**Mitigation:** Already mitigated. Schema is production-ready.

---

### Risk 5: Unclear 74-Market Scope Source of Truth

**Status:** Low risk — single source of truth exists

**Evidence:** `SOUVERA_74_MARKET_SCOPE` constant in `validators.ts` (lines 14-30)

**Concern:** Hardcoded array instead of database-driven

**Mitigation for Phase 4B-V2-B:** Use existing constant. Document as technical debt.

**Future Improvement (Phase 4C+):** Migrate to `market_scope` array column (documented in `docs/architecture/market-scope-governance.md`)

---

### Risk 6: ESH/Western Sahara Exception Handling Bleeding into ISO3 Test

**Status:** Low risk — ESH is handled separately

**Evidence:** Validator checks `isExcludedMarket()` first, then `isValidMarketScope()` (lines 91-106)

**Mitigation:** Test file uses `ZZZ`, not `ESH`. ESH handling is separate code path.

---

### Risk 7: Breaking the Validated Generic Upload Route

**Status:** Not a risk — upload route is untouched

**Evidence:** Phase 4B-V2-B requires zero code changes

**Mitigation:** Already mitigated. Upload route remains stable.

---

### Risk 8: Scope Creep into Parser Implementation

**Status:** Low risk — parser already exists

**Evidence:** Parser is already implemented in `parse/route.ts` and `parsers.ts`

**Mitigation:** Phase 4B-V2-B tests existing parser, does not modify it

---

## Implementation Readiness Checklist

### Prerequisites (All Satisfied)

- ✅ **Validation logic exists:** YES (lines 52-128 of validators.ts)
- ✅ **Validation endpoint exists:** YES (/api/v1/admin/batches/[id]/validate)
- ✅ **Parse endpoint exists:** YES (/api/v1/admin/batches/[id]/parse)
- ✅ **Schema supports validation:** YES (validation_errors, validation_warnings columns)
- ✅ **Test fixture exists:** YES (invalid-country-code.csv)
- ✅ **Upload route stable:** YES (validated in Phase 4B-V1 & V2-A)
- ✅ **Admin authentication working:** YES (resolved in P4B-V-004)
- ✅ **Storage infrastructure ready:** YES (source-files bucket created)

### Required Changes (None)

- ✅ **Code changes required:** NO
- ✅ **Schema changes required:** NO
- ✅ **SQL packs required:** NO
- ✅ **Upload route modifications:** NO
- ✅ **New features required:** NO

### Implementation Can Proceed

- ✅ **Without schema changes:** YES
- ✅ **Without modifying upload route:** YES
- ✅ **Using existing test fixture:** YES
- ✅ **Using existing validation logic:** YES

---

## Proposed Acceptance Criteria

Phase 4B-V2-B acceptance criteria (12 criteria):

**AC-1:** Invalid ISO3 CSV can be uploaded without error  
**Evidence:** Upload route returns 201 success

**AC-2:** Storage object is created  
**Evidence:** Query storage.objects for file

**AC-3:** File asset is created  
**Evidence:** Query souvera_source_file_assets

**AC-4:** Batch is created  
**Evidence:** Query souvera_source_file_ingestion_batches

**AC-5:** Ingestion run is created  
**Evidence:** Query souvera_data_ingestion_runs

**AC-6:** Parse endpoint succeeds  
**Evidence:** POST /api/v1/admin/batches/[id]/parse returns 200

**AC-7:** 2 rows are created (1 invalid ZZZ, 1 valid NGA)  
**Evidence:** Query souvera_source_file_ingestion_rows, count = 2

**AC-8:** Validate endpoint succeeds  
**Evidence:** POST /api/v1/admin/batches/[id]/validate returns 200

**AC-9:** Invalid ISO3 is detected  
**Evidence:** Row 1 (ZZZ) has status = 'invalid'

**AC-10:** Validation error is recorded  
**Evidence:** Row 1 validation_errors contains INVALID_MARKET error

**AC-11:** Batch is not approved  
**Evidence:** Batch approved_at = NULL

**AC-12:** Batch is not published  
**Evidence:** Batch published_at = NULL

### Validation Query Pattern

Similar to Phase 4B-V1 & V2-A, use verification pattern:

1. **Pre-verification:** Check adhoc_admin_upload source
2. **Query 1:** Verify file asset created
3. **Query 2:** Verify batch created
4. **Query 3:** Verify parse succeeded (2 rows created)
5. **Query 4:** Verify validation detected invalid ISO3

---

## Recommended Implementation Workflow

Phase 4B-V2-B requires testing a **3-step manual workflow:**

### Step 1: Upload

Navigate to `http://localhost:3010/admin/data/upload` and upload `docs/qa/test-data/phase-4b/invalid-country-code.csv`

**Form values:**
- File: invalid-country-code.csv
- Source Name: Test Invalid ISO3
- As-of Date: 2026-05-09
- Batch Name: invalid-iso3-test

**Expected:** 201 success, returns batch_id

### Step 2: Parse

Call: `POST /api/v1/admin/batches/{batch_id}/parse`

**Expected:** 200 success, returns "2 rows parsed"

### Step 3: Validate

Call: `POST /api/v1/admin/batches/{batch_id}/validate`

**Request body:**
```json
{
  "country_column": "iso3",
  "country_code_type": "iso3",
  "required_fields": ["iso3", "country_name", "agoa_status"],
  "data_type": "agoa_status"
}
```

**Expected:** 200 success, returns summary with invalid_rows = 1

### Step 4: Verification Queries

Run SQL queries to verify:
- Row 1 (ZZZ) has validation_errors
- Row 2 (NGA) is valid
- Batch counts: valid_rows = 1, invalid_rows = 1

---

## Summary and Recommendation

### Readiness Verdict

**READY FOR IMPLEMENTATION**

### Confidence Level

**HIGH** — All prerequisites satisfied, architecture validated, test fixture exists, zero code changes required

### Recommended Next Step

Proceed to Phase 4B-V2-B implementation using the 3-step manual workflow:
1. Upload invalid-country-code.csv
2. Parse batch
3. Validate batch

### Key Architectural Insight

Souvera's ingestion architecture was designed correctly from the start:
- Upload is storage-only (never validates content)
- Parse is format-only (CSV → rows)
- Validate is business logic (ISO3, market scope, ESH)
- Review/Approve/Publish are governance gates (future)

This separation means validation testing does not destabilize the proven upload pipeline.

### No Blockers

Phase 4B-V2-B has zero technical blockers. Implementation can begin immediately upon user approval.

---

**Document Status:** Readiness Check Complete — Awaiting Implementation Approval  
**Created:** 2026-05-09  
**Version:** 1.0  
**Owner:** Afronovation Engineering Team
