# Phase 4B Policy Monitor Validation

**Document Type:** Monitor Validation  
**Classification:** Internal — Engineering  
**Date:** 2026-05-06  
**Version:** 1.0  
**Owner:** Afronovation Engineering Team

---

## Overview

This document validates the Phase 4B policy source monitoring system.

### Governance Rule

> **Automated monitoring does not equal automatic publication.**
>
> All detected changes create review tasks. No policy-status data is published without admin approval.

### Required Lifecycle

```
Detected → Parsed → Drafted → Admin reviewed → Approved → Published
```

---

## 1. Seeded Monitors

### 1.1 AGOA Monitors

| Monitor | Type | URL | Check Interval | Status |
|---------|------|-----|----------------|--------|
| Federal Register AGOA Monitor | api_poll | federalregister.gov | 6 hours | ⏳ Verify |
| Regulations.gov AGOA Docket Monitor | api_poll | regulations.gov | 12 hours | ⏳ Verify |
| USTR AGOA Eligibility Page Monitor | page_hash | ustr.gov | 24 hours | ⏳ Verify |

### 1.2 AfCFTA Monitors

| Monitor | Type | URL | Check Interval | Status |
|---------|------|-----|----------------|--------|
| AfCFTA Secretariat Monitor | page_hash | au-afcfta.org | 24 hours | ⏳ Verify |
| tralac AfCFTA Status Tracker | page_hash | tralac.org | 24 hours | ⏳ Verify |

---

## 2. Federal Register API Monitor Tests

### 2.1 API Configuration

```json
{
  "api_endpoint": "https://www.federalregister.gov/api/v1/documents.json",
  "api_params": {
    "conditions[term]": "AGOA OR \"African Growth and Opportunity Act\"",
    "conditions[agencies][]": "office-of-the-united-states-trade-representative",
    "order": "newest",
    "per_page": "20"
  },
  "keywords": ["AGOA", "African Growth and Opportunity Act", "eligibility", "determination", "presidential"]
}
```

### 2.2 Test Cases

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | API returns 200 | Success response | ⏳ Test |
| 2 | Documents parsed | Results array processed | ⏳ Test |
| 3 | Keywords matched | matched_keywords populated | ⏳ Test |
| 4 | Change detected | has_changed = true if new docs | ⏳ Test |
| 5 | Snapshot created | souvera_policy_source_snapshots record | ⏳ Test |
| 6 | Change event created | souvera_policy_change_events record | ⏳ Test |
| 7 | Review task created | souvera_policy_review_queue record | ⏳ Test |
| 8 | No auto-publish | Status = 'detected' or 'under_review' | ⏳ Test |

### 2.3 Sample Expected Output

```json
{
  "success": true,
  "has_changed": true,
  "detected_changes": [
    {
      "event_type": "new_document",
      "title": "2026 AGOA Country Eligibility Review",
      "document_type": "notice",
      "matched_keywords": ["AGOA", "eligibility"]
    }
  ],
  "review_tasks_created": ["<uuid>"]
}
```

---

## 3. Regulations.gov API Monitor Tests

### 3.1 API Configuration

```json
{
  "api_endpoint": "https://api.regulations.gov/v4/documents",
  "api_params": {
    "filter[docketId]": "USTR-2026-0166",
    "sort": "-postedDate",
    "page[size]": "25"
  },
  "keywords": ["AGOA", "modernization", "comment", "eligibility"]
}
```

### 3.2 Prerequisites

- `REGULATIONS_GOV_API_KEY` environment variable set
- Valid API key from regulations.gov

### 3.3 Test Cases

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | API key configured | Environment variable present | ⏳ Test |
| 2 | API returns 200 | Success response | ⏳ Test |
| 3 | Docket documents parsed | Data array processed | ⏳ Test |
| 4 | New documents detected | Change events created | ⏳ Test |
| 5 | Review task created | Queue item exists | ⏳ Test |
| 6 | No sentiment scoring | No sentiment fields populated | ⏳ Test |
| 7 | No auto-publish | Admin review required | ⏳ Test |

---

## 4. USTR Page Monitor Tests

### 4.1 Configuration

```json
{
  "monitor_type": "page_hash",
  "monitor_url": "https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa",
  "keywords": ["eligible", "countries", "beneficiary", "status"]
}
```

### 4.2 Test Cases

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | Page fetched | HTTP 200 response | ⏳ Test |
| 2 | Content hashed | SHA-256 hash computed | ⏳ Test |
| 3 | Hash compared | Against last_content_hash | ⏳ Test |
| 4 | Change detected | has_changed = true if hash differs | ⏳ Test |
| 5 | Snapshot stored | Content preview saved | ⏳ Test |
| 6 | Review task created | On change detection | ⏳ Test |

---

## 5. AfCFTA Secretariat Monitor Tests

### 5.1 Configuration

```json
{
  "monitor_type": "page_hash",
  "monitor_url": "https://au-afcfta.org/",
  "keywords": ["ratification", "deposited", "implementation", "protocol", "trading"]
}
```

### 5.2 Test Cases

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | Page fetched | HTTP 200 response | ⏳ Test |
| 2 | Content hashed | SHA-256 hash computed | ⏳ Test |
| 3 | Keywords matched | In page content | ⏳ Test |
| 4 | Change event created | On detected change | ⏳ Test |
| 5 | Review task created | policy_type = 'afcfta' | ⏳ Test |
| 6 | No auto-publish | Status remains under_review | ⏳ Test |

---

## 6. tralac Tracker Monitor Tests

### 6.1 Configuration

```json
{
  "monitor_type": "page_hash",
  "monitor_url": "https://www.tralac.org/resources/infographic/13795-status-of-afcfta-ratification.html",
  "keywords": ["ratified", "signed", "deposited", "status"]
}
```

### 6.2 Test Cases

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | Page fetched | HTTP 200 response | ⏳ Test |
| 2 | Hash comparison | Against previous | ⏳ Test |
| 3 | tralac treated as secondary | Not sole authority | ⏳ Test |
| 4 | Review task created | On change | ⏳ Test |
| 5 | No auto-publish | Admin review required | ⏳ Test |

---

## 7. Monitor Check Workflow

### 7.1 Single Monitor Check

```bash
# Trigger manual check
curl -X POST http://localhost:3000/api/v1/admin/monitors/[id]/check \
  -H "Authorization: Bearer <admin_token>"
```

### 7.2 Expected Workflow

```
1. Monitor check triggered (manual or scheduled)
2. Source fetched (API call or page fetch)
3. Content hashed / compared
4. If changed:
   a. Snapshot created
   b. Change event created (status = 'detected')
   c. Review task created
   d. Monitor last_check_at updated
5. If unchanged:
   a. Monitor last_check_at updated
   b. No events created
```

### 7.3 Review Task Lifecycle

| Step | Status | Action Required |
|------|--------|-----------------|
| 1 | detected | System creates event |
| 2 | under_review | Admin assigned |
| 3 | approved | Admin verifies |
| 4 | published | Data published to trade_policy_statuses |

---

## 8. No Auto-Publish Verification

### Critical Tests

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | Monitor check never inserts to trade_policy_statuses | No direct INSERT | ⏳ Test |
| 2 | Change event status never auto-advances to 'published' | Requires admin action | ⏳ Test |
| 3 | Review queue required | Cannot bypass | ⏳ Test |
| 4 | Batch approval required | Published via approved batch only | ⏳ Test |

---

## 9. Error Handling Tests

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | API timeout | Error logged, consecutive_failures++ | ⏳ Test |
| 2 | API 403/401 | Error logged, check credentials | ⏳ Test |
| 3 | Page 404 | Error logged, alert admin | ⏳ Test |
| 4 | Invalid response | Parse error logged | ⏳ Test |
| 5 | Missing API key | Clear error message | ⏳ Test |

---

## 10. Monitor Status Tracking

### 10.1 Success Tracking

| Field | Updated On |
|-------|------------|
| `last_check_at` | Every check |
| `next_check_at` | Calculated from interval |
| `last_content_hash` | On success |
| `last_response_status` | HTTP status code |
| `consecutive_failures` | Reset to 0 on success |

### 10.2 Failure Tracking

| Field | Updated On |
|-------|------------|
| `last_check_at` | Every check |
| `last_error_message` | Error description |
| `consecutive_failures` | Incremented |

---

## 11. Test Execution

### Prerequisites

- [ ] SQL packs v1.14 and v1.15 executed
- [ ] Monitors seeded in database
- [ ] Dev server running
- [ ] Admin credentials available
- [ ] `REGULATIONS_GOV_API_KEY` set (for Regulations.gov test)

### Execution Commands

```bash
# List monitors
curl http://localhost:3000/api/v1/admin/monitors \
  -H "Authorization: Bearer <token>"

# Run specific monitor check
curl -X POST http://localhost:3000/api/v1/admin/monitors/<monitor_id>/check \
  -H "Authorization: Bearer <token>"

# Check review queue after monitor runs
curl http://localhost:3000/api/v1/admin/review-queue \
  -H "Authorization: Bearer <token>"
```

---

## 12. Summary

| Monitor | Tests | Passed | Failed | Pending |
|---------|-------|--------|--------|---------|
| Federal Register | 8 | 0 | 0 | 8 |
| Regulations.gov | 7 | 0 | 0 | 7 |
| USTR Page | 6 | 0 | 0 | 6 |
| AfCFTA Secretariat | 6 | 0 | 0 | 6 |
| tralac | 5 | 0 | 0 | 5 |
| No Auto-Publish | 4 | 0 | 0 | 4 |
| Error Handling | 5 | 0 | 0 | 5 |
| **TOTAL** | **41** | **0** | **0** | **41** |

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Engineering Team
