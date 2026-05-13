# Manual Data Curation Standard Operating Procedure

**Document Type:** Standard Operating Procedure  
**Classification:** Internal — Operations  
**Date:** 2026-05-06  
**Version:** 1.0  
**Owner:** Afronovation Data Operations Team

---

## 1. Purpose

This SOP defines the procedures for manual data curation in the Souvera Intelligence Terminal, ensuring all manually curated data meets quality, attribution, and governance standards.

### Governance Principle

> **API-first where available. Admin-managed where necessary. Source-attributed always. Published only after approval.**

---

## 2. Scope

This SOP applies to:

- AGOA eligibility status data
- AfCFTA implementation status data
- Country-level trade policy intelligence
- Any data not ingested via automated API connectors

---

## 3. Roles and Responsibilities

| Role | Responsibilities |
|------|------------------|
| Data Curator | Prepares source files, initiates uploads |
| Data Reviewer | Validates data quality, approves batches |
| Data Publisher | Final approval, triggers publication |
| Compliance Officer | Verifies source legitimacy, ESH exclusion |

---

## 4. Source Attribution Requirements

### 4.1 Required Metadata

Every manual upload MUST include:

| Field | Description | Example |
|-------|-------------|---------|
| Source Name | Official name of data source | "Office of the U.S. Trade Representative" |
| Source URL | Direct link to source document | "https://ustr.gov/..." |
| As-of Date | Effective date of the data | "2026-05-06" |
| Confidence Level | Data reliability assessment | "high", "medium", "curated" |

### 4.2 Confidence Levels

| Level | Definition | When to Use |
|-------|------------|-------------|
| High | Official government source, verified | USTR, Federal Register, AU official |
| Medium | Reputable secondary source | tralac, major news, think tanks |
| Low | Unverified or conflicting sources | Initial reports, unconfirmed |
| Curated | Souvera-compiled from multiple sources | Synthesized analysis |

---

## 5. AGOA Data Curation Procedure

### 5.1 Source Identification

**Primary Sources (High Confidence):**
- USTR AGOA eligibility announcements
- Federal Register Presidential determinations
- Regulations.gov docket documents (USTR-2026-0166)

**Secondary Sources (Medium Confidence):**
- Congressional Research Service reports
- AGOA.info (unofficial tracker)

### 5.2 Data Preparation

1. Download or compile source data
2. Create CSV with required columns:

```csv
country,status,eligible_since,apparel_eligible,suspension_date,suspension_reason,notes
KEN,eligible,2000-10-02,true,,,Eligible since AGOA inception
ETH,suspended,2000-10-02,false,2022-01-01,Gross violations,Suspended per 2022 review
```

3. Validate country codes are ISO3 format
4. Validate status values: `eligible`, `candidate`, `suspended`, `reinstated`, `not_eligible`, `graduated`

### 5.3 Upload and Validation

1. Navigate to `/admin/data/upload`
2. Select AGOA status template
3. Upload prepared CSV
4. Review validation results:
   - Check for invalid country codes
   - Verify ESH exclusion (expected)
   - Review AGOA status validation errors

### 5.4 Review and Approval

1. Reviewer examines:
   - Row-level validation errors
   - Source attribution completeness
   - Data recency and relevance
2. Reviewer adds review notes
3. Reviewer approves or rejects batch

### 5.5 Publication

1. Publisher verifies reviewer approval
2. Publisher confirms no pending issues
3. Publisher triggers publication
4. Verify data appears in public views

---

## 6. AfCFTA Data Curation Procedure

### 6.1 Source Identification

**Primary Sources (High Confidence):**
- AfCFTA Secretariat official communications
- African Union ratification status
- National government ratification announcements

**Secondary Sources (Medium Confidence):**
- tralac AfCFTA status tracker
- ECA trade policy reports

### 6.2 Data Preparation

1. Compile ratification and implementation status
2. Create CSV with required columns:

```csv
country,status,signed_date,ratified_date,deposited_date,trading_since,notes
KEN,trading,2018-03-21,2018-05-10,2018-05-12,2021-01-01,Phase 1 trading
NGA,trading,2019-07-07,2020-12-01,2020-12-05,2021-01-01,Late ratification
```

3. Validate country codes are ISO3 format
4. Validate status values: `not_signed`, `signed`, `ratified`, `deposited`, `trading`, `full_implementation`
5. Validate dates in ISO format (YYYY-MM-DD)

### 6.3 Upload, Validation, Approval

Follow same procedure as AGOA (Section 5.3-5.5)

---

## 7. ESH (Western Sahara) Handling

### 7.1 Policy

> ESH / Western Sahara is excluded from Souvera's 74-market public scope due to ongoing territorial disputes and lack of recognized sovereign trade policy status.

### 7.2 Procedure

1. **During upload:** ESH rows automatically flagged as excluded
2. **Verification:** 
   - `is_excluded = true`
   - `exclusion_reason = 'ESH/Western Sahara excluded from Souvera public scope'`
   - `status = 'invalid'`
3. **Publication:** ESH rows cannot reach 'published' status
4. **Audit:** Weekly verification that no ESH data in published tables

### 7.3 Compliance Checkpoint

Before any batch publication, verify:
```sql
SELECT COUNT(*) FROM souvera_source_file_ingestion_rows 
WHERE batch_id = '<batch_id>' 
  AND mapped_iso3 = 'ESH' 
  AND status NOT IN ('invalid', 'rejected');
-- Expected: 0
```

---

## 8. Quality Assurance

### 8.1 Pre-Upload Checklist

- [ ] Source document obtained from official channel
- [ ] Source URL accessible and valid
- [ ] As-of date reflects data effective date
- [ ] All country codes validated as ISO3
- [ ] ESH not included (or will be excluded)
- [ ] Status values match allowed enum
- [ ] Dates in ISO format

### 8.2 Post-Validation Checklist

- [ ] Valid rows > 0
- [ ] Invalid rows reviewed and explained
- [ ] ESH exclusions expected and correct
- [ ] No unexpected country rejections
- [ ] Source attribution complete

### 8.3 Pre-Publication Checklist

- [ ] Reviewer has approved
- [ ] Review notes documented
- [ ] No blocking validation errors
- [ ] Publication will not overwrite newer data (check as_of_date)

---

## 9. Data Correction Procedures

### 9.1 Correcting Published Data

1. **Do NOT directly edit database**
2. Upload corrected file as new batch
3. During publication, mark as superseding previous batch
4. Previous batch status → 'superseded'
5. Document correction reason in batch notes

### 9.2 Rollback Procedure

1. Identify incorrect batch
2. Navigate to batch detail
3. Click "Rollback"
4. Provide detailed rollback reason
5. Verify public views updated
6. Upload corrected data

---

## 10. Audit Trail

### 10.1 Tracked Fields

Every batch and row tracks:
- `created_by` / `created_at`
- `reviewed_by` / `reviewed_at` / `review_notes`
- `approved_by` / `approved_at` / `approval_notes`
- `published_by` / `published_at`
- `rolled_back_by` / `rolled_back_at` / `rollback_reason`

### 10.2 Monthly Audit

1. Export batch history for period
2. Verify all publications have:
   - Source attribution
   - Review approval
   - No ESH data
3. Report anomalies to Compliance

---

## 11. Prohibited Practices

- ❌ Direct database INSERT/UPDATE for published data
- ❌ Publishing without reviewer approval
- ❌ Including ESH in public scope data
- ❌ Publishing with confidence = 'low' without explicit approval
- ❌ Backdating as_of_date to circumvent data freshness
- ❌ Using unofficial sources without medium/low confidence flag

---

## 12. Approved Language

Use in UI and documentation:

| ✓ Use | ✗ Avoid |
|-------|---------|
| Source-Attributed Preview | Live data |
| Curated Preview Data | Real-time eligibility |
| Data pending | Official compliance score |
| Under review | Guaranteed opportunity |
| Last reviewed | 49 AGOA eligible countries |
| Source confidence | Political advocacy terms |
| Evidence-based decision support | |

---

## 13. Escalation

| Issue | Escalate To |
|-------|-------------|
| Source legitimacy question | Compliance Officer |
| Technical upload failure | Engineering |
| Policy interpretation | Legal/Compliance |
| ESH data in production | Immediate incident response |

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Data Operations Team
