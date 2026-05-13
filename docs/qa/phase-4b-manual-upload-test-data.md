# Phase 4B-V Manual Upload Test Data

**Document Type:** Test Data Reference  
**Classification:** Internal — Engineering / QA  
**Date:** 2026-05-06  
**Version:** 1.0  
**Owner:** Afronovation Engineering Team

---

## Purpose

This document describes the test data files used for Phase 4B-V manual browser QA and upload workflow validation.

All test data files are located in:

```
docs/qa/test-data/phase-4b/
```

---

## Test Data Files

### 1. `agoa-status-valid.csv`

**Purpose:** Test valid AGOA eligibility data upload

**Format:** CSV

**Columns:**
- `iso3` — ISO 3166-1 alpha-3 country code
- `country_name` — Country display name
- `agoa_status` — AGOA eligibility status (`eligible`, `ineligible`, `suspended`, `graduated`, `under_review`)
- `apparel_status` — AGOA apparel provision status (`verified`, `not_verified`, `suspended`, `not_applicable`)
- `as_of_date` — Data as-of date (YYYY-MM-DD)
- `source_url` — Source URL (USTR AGOA page)
- `notes` — Additional context

**Content:**

```csv
iso3,country_name,agoa_status,apparel_status,as_of_date,source_url,notes
NGA,Nigeria,eligible,not_verified,2026-05-06,https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa,Test upload only
KEN,Kenya,eligible,not_verified,2026-05-06,https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa,Test upload only
GHA,Ghana,eligible,not_verified,2026-05-06,https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa,Test upload only
```

**Expected Behavior:**
- ✅ 3 rows parsed (NGA, KEN, GHA)
- ✅ All rows valid (all within Souvera 74-market scope)
- ✅ Batch created
- ✅ No automatic publication

**Validation Scenario:** Test 1 in `phase-4b-manual-browser-qa-test-plan.md`

---

### 2. `afcfta-status-valid.csv`

**Purpose:** Test valid AfCFTA implementation data upload

**Format:** CSV

**Columns:**
- `iso3` — ISO 3166-1 alpha-3 country code
- `country_name` — Country display name
- `signed_status` — Signature status (`signed`, `not_signed`)
- `ratified_status` — Ratification status (`ratified`, `not_ratified`)
- `deposited_status` — Deposit status (`deposited`, `not_deposited`)
- `implementation_status` — Implementation status (`operational`, `in_progress`, `under_review`, `pending`)
- `as_of_date` — Data as-of date (YYYY-MM-DD)
- `source_url` — Source URL (AfCFTA Secretariat)
- `notes` — Additional context

**Content:**

```csv
iso3,country_name,signed_status,ratified_status,deposited_status,implementation_status,as_of_date,source_url,notes
NGA,Nigeria,signed,ratified,deposited,under_review,2026-05-06,https://au-afcfta.org/,Test upload only
KEN,Kenya,signed,ratified,deposited,under_review,2026-05-06,https://au-afcfta.org/,Test upload only
GHA,Ghana,signed,ratified,deposited,under_review,2026-05-06,https://au-afcfta.org/,Test upload only
```

**Expected Behavior:**
- ✅ 3 rows parsed (NGA, KEN, GHA)
- ✅ All rows valid (all within Souvera 74-market scope)
- ✅ Batch created
- ✅ No automatic publication

**Validation Scenario:** Test 2 in `phase-4b-manual-browser-qa-test-plan.md`

---

### 3. `invalid-country-code.csv`

**Purpose:** Test invalid ISO3 country code rejection

**Format:** CSV

**Content:**

```csv
iso3,country_name,agoa_status,apparel_status,as_of_date,source_url,notes
ZZZ,Invalid Country,eligible,not_verified,2026-05-06,https://ustr.gov/,Invalid ISO3 test
NGA,Nigeria,eligible,not_verified,2026-05-06,https://ustr.gov/,Valid control row
```

**Expected Behavior:**
- ✅ 2 rows parsed
- ⚠️ Row 1 (ZZZ) flagged as invalid or rejected
- ✅ Row 2 (NGA) accepted
- ⚠️ Validation error displayed: "Invalid ISO3 country code: ZZZ"
- ✅ No automatic publication

**Validation Scenario:** Test 3 in `phase-4b-manual-browser-qa-test-plan.md`

---

### 4. `esh-rejection-test.csv`

**Purpose:** Test ESH / Western Sahara exclusion from public Souvera scope

**Format:** CSV

**Content:**

```csv
iso3,country_name,agoa_status,apparel_status,as_of_date,source_url,notes
ESH,Western Sahara,eligible,not_verified,2026-05-06,https://ustr.gov/,Should be rejected from public Souvera scope
NGA,Nigeria,eligible,not_verified,2026-05-06,https://ustr.gov/,Valid control row
```

**Expected Behavior:**
- ✅ 2 rows parsed
- ⚠️ Row 1 (ESH) rejected or marked as excluded from public scope
- ✅ Row 2 (NGA) accepted
- ⚠️ Validation warning: "ESH / Western Sahara excluded from public Souvera market scope"
- ✅ No automatic publication
- ✅ ESH row NOT marked as publishable

**Validation Scenario:** Test 4 in `phase-4b-manual-browser-qa-test-plan.md`

**Critical Requirement:**
This test validates the 74-market scope enforcement. ESH must be rejected from public Souvera scope as documented in:
- `docs/research/agoa-afcfta-data-source-inventory.md` (v2.1)
- SQL Pack v1.14 country code crosswalk
- SQL Pack v1.15 ingestion validators

---

### 5. `agoa-status-valid.json`

**Purpose:** Test JSON format upload

**Format:** JSON

**Content:**

```json
[
  {
    "iso3": "NGA",
    "country_name": "Nigeria",
    "agoa_status": "eligible",
    "apparel_status": "not_verified",
    "as_of_date": "2026-05-06",
    "source_url": "https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa",
    "notes": "Test upload only"
  },
  {
    "iso3": "KEN",
    "country_name": "Kenya",
    "agoa_status": "eligible",
    "apparel_status": "not_verified",
    "as_of_date": "2026-05-06",
    "source_url": "https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa",
    "notes": "Test upload only"
  },
  {
    "iso3": "GHA",
    "country_name": "Ghana",
    "agoa_status": "eligible",
    "apparel_status": "not_verified",
    "as_of_date": "2026-05-06",
    "source_url": "https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa",
    "notes": "Test upload only"
  }
]
```

**Expected Behavior:**
- ✅ JSON file accepted
- ✅ 3 rows parsed (NGA, KEN, GHA)
- ✅ All rows valid
- ✅ Batch created
- ✅ No automatic publication

**Validation Scenario:** Test 5 in `phase-4b-manual-browser-qa-test-plan.md`

---

### 6. `pdf-evidence-placeholder.md`

**Purpose:** Instructions for creating a PDF evidence test file

**Format:** Markdown (instructions only)

**Content:** Instructions for manually creating a simple PDF evidence file using:
- Word processor (Word, Google Docs) → Save as PDF
- Browser screenshot → Print to PDF
- Online PDF creation tools

**Expected Behavior (when PDF is uploaded):**
- ✅ PDF accepted as source evidence
- ✅ PDF stored in Supabase Storage
- ✅ File asset created
- ℹ️ No rows parsed (PDF is evidence, not data)
- ✅ Batch created
- ✅ No automatic publication

**Validation Scenario:** Test 6 in `phase-4b-manual-browser-qa-test-plan.md`

---

## Test Data Summary

| File | Format | Rows | Purpose | Valid Rows | Invalid Rows |
|---|---|---|---|---|---|
| `agoa-status-valid.csv` | CSV | 3 | Valid AGOA upload | 3 | 0 |
| `afcfta-status-valid.csv` | CSV | 3 | Valid AfCFTA upload | 3 | 0 |
| `invalid-country-code.csv` | CSV | 2 | Invalid ISO3 test | 1 | 1 (ZZZ) |
| `esh-rejection-test.csv` | CSV | 2 | ESH exclusion test | 1 | 1 (ESH) |
| `agoa-status-valid.json` | JSON | 3 | JSON format test | 3 | 0 |
| `pdf-evidence-placeholder.md` | Instructions | N/A | PDF evidence test | N/A | N/A |

---

## Column Mappings

### AGOA Template Expected Columns

| Database Column | CSV/JSON Field | Type | Required |
|---|---|---|---|
| `iso3` | `iso3` | string (ISO 3166-1 alpha-3) | Yes |
| `country_name` | `country_name` | string | No |
| `agoa_status` | `agoa_status` | enum | Yes |
| `apparel_status` | `apparel_status` | enum | No |
| `as_of_date` | `as_of_date` | date (YYYY-MM-DD) | Yes |
| `source_url` | `source_url` | string (URL) | No |
| `notes` | `notes` | text | No |

### AfCFTA Template Expected Columns

| Database Column | CSV/JSON Field | Type | Required |
|---|---|---|---|
| `iso3` | `iso3` | string (ISO 3166-1 alpha-3) | Yes |
| `country_name` | `country_name` | string | No |
| `signed_status` | `signed_status` | enum | Yes |
| `ratified_status` | `ratified_status` | enum | Yes |
| `deposited_status` | `deposited_status` | enum | Yes |
| `implementation_status` | `implementation_status` | enum | Yes |
| `as_of_date` | `as_of_date` | date (YYYY-MM-DD) | Yes |
| `source_url` | `source_url` | string (URL) | No |
| `notes` | `notes` | text | No |

---

## Validation Rules

### ISO3 Country Code Validation

All uploaded ISO3 codes must:
1. Match a valid ISO 3166-1 alpha-3 code
2. Exist in `souvera_country_code_crosswalks` table
3. Have `is_souvera_market = TRUE` AND `is_excluded = FALSE`
4. Be within the 74-market Souvera scope

**Explicit Exclusion:**
- **ESH (Western Sahara)** — Must be rejected from public Souvera scope

### 74-Market Scope

Valid Souvera markets (subset of examples):

**West Africa:** NGA, GHA, SEN, CIV, BEN, TGO, MLI, BFA, NER, GIN, GMB, SLE, LBR, GNB, CPV, MRT  
**East Africa:** KEN, ETH, TZA, UGA, RWA, BDI, SOM, DJI, ERI, SSD  
**Southern Africa:** ZAF, BWA, NAM, ZWE, ZMB, MOZ, MWI, LSO, SWZ, AGO  
**Central Africa:** COD, CMR, GAB, COG, CAF, TCD, GNQ, STP  
**North Africa:** EGY, DZA, TUN, LBY, MAR, SDN  
**Caribbean (AGOA-eligible):** JAM, TTO, BRB, HTI, GUY, SUR, BHS, BLZ, DMA, GRD, LCA, VCT, ATG, KNA

**Full scope:** 74 markets (56 African countries + 18 Caribbean economies)

**Excluded:** ESH, and any non-Souvera markets

---

## Using This Test Data

### Step 1: Locate Test Data
```bash
cd c:/Users/ikour/Projects/souvera/docs/qa/test-data/phase-4b
```

### Step 2: Verify Files Exist
```bash
ls
```

Expected output:
```
agoa-status-valid.csv
afcfta-status-valid.csv
invalid-country-code.csv
esh-rejection-test.csv
agoa-status-valid.json
pdf-evidence-placeholder.md
```

### Step 3: Follow Test Plan
Refer to `docs/qa/phase-4b-manual-browser-qa-test-plan.md` for detailed test execution instructions.

---

## Notes

- All test data uses `as_of_date: 2026-05-06` (test execution date)
- All test data includes disclaimer: "Test upload only"
- Source URLs are placeholder references to official sources
- Data is NOT production-ready and should NOT be published
- Data is for validation purposes only

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Engineering Team
