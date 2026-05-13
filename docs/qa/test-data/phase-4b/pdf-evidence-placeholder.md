# PDF Evidence Test File Instructions

## Purpose

Test PDF evidence upload functionality for Phase 4B ingestion architecture.

## How to Create a Test PDF

### Option 1: Using a Word Processor

1. Create a new document in Microsoft Word, Google Docs, or similar
2. Add the following content:

```
AGOA Eligibility Evidence Document
Date: May 6, 2026
Source: United States Trade Representative

This is a test evidence document for Phase 4B upload validation.

Countries reviewed:
- Nigeria (NGA): Eligible
- Kenya (KEN): Eligible
- Ghana (GHA): Eligible

Source URL: https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa

This document is for testing purposes only.
```

3. Save/Export as PDF
4. Name the file: `agoa-evidence-test.pdf`

### Option 2: Using a Screenshot

1. Take a screenshot of an official USTR AGOA page
2. Save as PDF using your browser's "Print to PDF" function
3. Name the file: `agoa-evidence-test.pdf`

### Option 3: Using Online Tools

1. Visit: https://www.pdf2go.com/create-pdf (or similar)
2. Create a simple PDF with AGOA evidence text
3. Download as `agoa-evidence-test.pdf`

## Expected Behavior

When uploading this PDF to `/admin/data/upload`:

- ✅ PDF should be accepted as source evidence
- ✅ PDF should be stored in Supabase Storage
- ✅ PDF parsing is NOT required (evidence only)
- ✅ No automatic publication should occur
- ✅ Batch should be created with PDF reference

## Test Validation

After upload, verify:

1. Batch record created in `souvera_source_file_ingestion_batches`
2. File asset created in `souvera_source_file_assets`
3. File stored in Supabase Storage bucket
4. No rows parsed (PDF is evidence, not data)
5. Batch status remains unpublished until admin approval

---

**Created:** 2026-05-06  
**Purpose:** Phase 4B-V Manual Browser QA
