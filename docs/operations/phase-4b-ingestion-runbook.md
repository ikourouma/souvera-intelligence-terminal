# Phase 4B Ingestion Operations Runbook

**Document Type:** Operations Runbook  
**Classification:** Internal — Operations  
**Date:** 2026-05-06  
**Version:** 1.0  
**Owner:** Afronovation Operations Team

---

## 1. Overview

This runbook provides operational procedures for the Phase 4B ingestion architecture.

### Governance Principle

> **API-first where available. Admin-managed where necessary. Source-attributed always. Published only after approval.**

---

## 2. Daily Operations

### 2.1 Review Queue Monitoring

**Frequency:** At least twice daily

1. Log into admin dashboard at `/admin/data/quality`
2. Check review queue at `/admin/data/review-queue`
3. Prioritize items by:
   - Priority score (higher = more urgent)
   - Policy type (AGOA > AfCFTA for US trade compliance)
   - Age (older items first)

### 2.2 Monitor Status Check

**Frequency:** Daily

1. Navigate to `/admin/data/monitors`
2. Check for monitors with:
   - `consecutive_failures > 0` — investigate API issues
   - `last_check_at` older than expected interval — check scheduler
   - `is_active = false` — verify intentional deactivation

### 2.3 Failed Batches Review

**Frequency:** Daily

1. Navigate to `/admin/data/batches?status=failed`
2. For each failed batch:
   - Review `error_message`
   - Check `error_details` for specifics
   - Determine if re-upload needed or file issue

---

## 3. Upload Procedures

### 3.1 Manual AGOA Status Upload

**When:** After official AGOA eligibility announcements

1. Obtain official source (USTR, Federal Register)
2. Prepare CSV with columns:
   - `country` (ISO3)
   - `status` (eligible, suspended, etc.)
   - `eligible_since` (date)
   - `apparel_eligible` (boolean)
   - `notes`
3. Navigate to `/admin/data/upload`
4. Upload file with:
   - Source name: "Office of the U.S. Trade Representative"
   - Source URL: Link to announcement
   - As-of date: Effective date
   - Template: "AGOA Eligibility Status Upload"
   - Confidence: "high"
5. Parse file
6. Validate rows
7. Review for ESH exclusions
8. Approve and publish

### 3.2 Manual AfCFTA Status Upload

**When:** After ratification or implementation updates

1. Obtain source (AfCFTA Secretariat, tralac)
2. Prepare CSV with columns:
   - `country` (ISO3)
   - `status` (signed, ratified, deposited, trading)
   - `signed_date`, `ratified_date`, `deposited_date`
   - `trading_since`
3. Follow same upload procedure
4. Use template: "AfCFTA Implementation Status Upload"

### 3.3 PDF Evidence Upload

**When:** Storing source documents for audit trail

1. Navigate to `/admin/data/upload`
2. Upload PDF
3. Fill source attribution
4. PDF stored as evidence only
5. Link to related data via batch notes

---

## 4. Monitor Operations

### 4.1 Manual Monitor Trigger

**When:** Checking for immediate updates

```bash
# Via API
curl -X POST https://api.souvera.com/api/v1/admin/monitors/<id>/check \
  -H "Authorization: Bearer <token>"
```

Or via admin UI:
1. Navigate to `/admin/data/monitors`
2. Click monitor row
3. Click "Run Check Now"

### 4.2 Monitor Alert Response

**When:** Monitor detects change

1. Check review queue for new item
2. Review detected change:
   - View event details
   - Follow source URL
   - Verify legitimacy
3. If legitimate:
   - Draft update data
   - Create or update batch
   - Approve and publish
4. If false positive:
   - Reject review item
   - Note reason

### 4.3 Monitor Failure Response

**When:** `consecutive_failures > 3`

1. Check `last_error_message`
2. Common issues:
   - API rate limited → Increase check_interval
   - API key expired → Rotate key
   - Page moved → Update monitor_url
   - Network issue → Wait and retry
3. Disable monitor if persistent issue
4. Create ticket for engineering if infrastructure issue

---

## 5. Batch Management

### 5.1 Batch Approval Workflow

```
1. Batch in 'validated' status
2. Admin reviews row statistics:
   - Valid rows count
   - Invalid rows (review validation_errors)
   - Excluded rows (ESH rejections)
3. If acceptable:
   - Click "Review" → status = 'under_review'
   - Add review notes
   - Click "Approve" → status = 'approved'
   - Click "Publish" → status = 'published'
4. If issues found:
   - Click "Reject"
   - Note rejection reason
   - Re-upload corrected file
```

### 5.2 Batch Rollback

**When:** Published data found to be incorrect

1. Navigate to batch details
2. Verify batch status = 'published'
3. Click "Rollback"
4. Provide rollback reason
5. Status changes to 'rolled_back'
6. Verify public views updated

### 5.3 Batch Supersede

**When:** Publishing updated data that replaces previous

1. Upload new batch
2. Process through validation
3. During publish, specify supersedes_batch_id
4. Old batch marked 'superseded'
5. New batch is 'published'

---

## 6. Data Quality

### 6.1 Invalid Row Resolution

1. Export invalid rows from batch
2. Review validation_errors for each:
   - `INVALID_MARKET`: Country not in 74-market scope
   - `EXCLUDED_MARKET`: ESH rejection (expected)
   - `REQUIRED_FIELD_MISSING`: Check source data
   - `INVALID_AGOA_STATUS`: Check status value
3. Correct source data
4. Re-upload corrected file

### 6.2 ESH Exclusion Verification

**Verification Query:**
```sql
SELECT COUNT(*) 
FROM souvera_source_file_ingestion_rows 
WHERE mapped_iso3 = 'ESH' 
  AND status = 'published';
-- Expected: 0
```

### 6.3 Source Attribution Audit

**Weekly:**
1. Query batches without source_url
2. Query batches with confidence = 'low'
3. Improve attribution for flagged batches

---

## 7. Incident Response

### 7.1 Unauthorized Data Publication

1. Identify affected records
2. Rollback related batch immediately
3. Audit access logs
4. Report to security team

### 7.2 Monitor Data Corruption

1. Disable affected monitor
2. Review recent snapshots
3. Rollback any published data from monitor
4. Fix monitor configuration
5. Re-enable after verification

### 7.3 Performance Issues

1. Check batch row counts (large batches may timeout)
2. Consider batch splitting for large uploads
3. Check database indexes
4. Contact engineering if persistent

---

## 8. Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API access | Yes |
| `REGULATIONS_GOV_API_KEY` | Regulations.gov API | For AGOA docket monitoring |

---

## 9. Governance Language Compliance

### Approved Language

Use in UI, documentation, and communications:

| ✓ Use | ✗ Avoid |
|-------|---------|
| Source-Attributed Preview | Live data |
| Curated Preview Data | Real-time eligibility |
| Data pending | Official compliance score |
| Under review | Guaranteed opportunity |
| Last reviewed | 49 AGOA eligible countries |
| Source confidence | Political advocacy terms |
| Evidence-based decision support | |

### Remediation Log

The following governance language violations were fixed in Phase 4B:

| File | Fixed |
|------|-------|
| `africa-map-embed.tsx` | `live data infrastructure` → `source-attributed data infrastructure` |
| `faqs/page.tsx` | `live data from the World Bank` → `curated data from the World Bank` |
| `PreviewDataBanner.tsx` | `Live data feeds` → `Additional source integrations` |

If new violations are found, document and fix immediately.

---

## 9. Contacts

| Role | Responsibility |
|------|----------------|
| Data Operations | Daily monitoring, uploads, approvals |
| Engineering | Infrastructure, bug fixes |
| Compliance | Policy interpretation, ESH exclusion verification |

---

## 10. Appendix: SQL Queries

### Check Recent Batches
```sql
SELECT id, batch_name, status, source_name, created_at
FROM souvera_source_file_ingestion_batches
ORDER BY created_at DESC
LIMIT 20;
```

### Check Monitor Health
```sql
SELECT 
  monitor_name,
  last_check_at,
  consecutive_failures,
  last_error_message
FROM souvera_policy_source_monitors
WHERE is_active = true
ORDER BY consecutive_failures DESC;
```

### Review Queue Summary
```sql
SELECT 
  policy_type,
  status,
  COUNT(*) as count
FROM souvera_policy_review_queue
GROUP BY policy_type, status
ORDER BY policy_type, status;
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Operations Team
