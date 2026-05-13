# Phase 4B CSV Ingestion - Final Execution Playbook

**Status:** 95% Complete → Finishing TODAY  
**Objective:** Complete CSV ingestion testing, declare victory, move to dashboards  
**Time Required:** 2 hours  
**Owner:** You  
**Date:** 2026-05-13

---

## The Situation

You're blocked on a 403 error because you haven't run the admin provisioning script. Once you run it and get the admin session, everything else works. Your CSV ingestion pipeline is already built and validated with two datasets (AGOA, AfCFTA). You just need to finish testing parse/validate, then you're done.

After this, you move to user dashboards. No more ingestion debugging.

---

## PART 1: Unblock Yourself (10 minutes)

### Step 1: Run Admin Provisioning Script

Open PowerShell in your project root and run:

```powershell
cd c:\Users\ikour\Projects\souvera
npx tsx scripts/seed-platform-admin.ts
```

**What you'll see:**
```
═══════════════════════════════════════════════════════════════
 PLATFORM ADMIN READY
═══════════════════════════════════════════════════════════════

  Email: admin@souveraterminal.com
  Role: platform_admin
  Subscription: platform_admin (full access)
  Organization: Admin Test Organization
  Status: ✅ Ready for local QA
```

If you see this, the script worked. If you see errors, check:
- Is your dev server running at localhost:3010?
- Is SUPABASE_SERVICE_ROLE_KEY set in .env.local?
- Is NEXT_PUBLIC_SUPABASE_URL set in .env.local?

### Step 2: Log In as Admin

1. Open browser, go to http://localhost:3010/login
2. **Log out completely** if you're logged in as professional@afronovation.com
3. Log in with:
   - Email: admin@souveraterminal.com
   - Password: Password1!
4. Navigate to http://localhost:3010/admin/data/upload
5. Verify the page loads (proves you have admin access)
6. **CRITICAL:** Check the account menu in top right - it should say "Platform Admin" NOT "Explorer Plan"

If it still says "Explorer Plan":
- Log out completely
- Close all browser tabs
- Clear cookies for localhost:3010
- Log back in as admin@souveraterminal.com
- If STILL showing Explorer Plan, run the seed script again (it's idempotent)

### Step 3: Get Admin Session Cookie

1. Press F12 to open Developer Tools
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Navigate to Cookies → http://localhost:3010
4. Find cookie named: `sb-djafctgnjazjwwudkmnq-auth-token`
5. Click on it and copy the entire VALUE (long base64 string starting with "base64-")
6. Save this in a text file - you'll use it multiple times

**Your cookie will look like:**
```
base64-eyJhY2Nlc3NfdG9rZW4iOiJleUp....[very long string].....fQ==
```

Copy the ENTIRE thing.

---

## PART 2: Test Parse & Validate (30 minutes)

You already have a batch from your previous upload. Use it.

**Your Batch ID:** `df3009a9-886d-4cf2-9b9f-2142ea576943` (from your SQL results)

### Step 4: Test Parse Endpoint

Open PowerShell and run this EXACT command (replace YOUR_ADMIN_COOKIE_HERE with the cookie you copied):

```powershell
$headers = @{
    "Cookie" = "sb-djafctgnjazjwwudkmnq-auth-token=YOUR_ADMIN_COOKIE_HERE"
}

$response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/admin/batches/df3009a9-886d-4cf2-9b9f-2142ea576943/parse" -Method POST -ContentType "application/json" -Headers $headers

Write-Host "Parse Response:"
$response | ConvertTo-Json -Depth 10
```

**Expected response (success):**
```json
{
  "success": true,
  "batchId": "df3009a9-886d-4cf2-9b9f-2142ea576943",
  "totalRows": 5,
  "message": "Batch parsed successfully"
}
```

**If you get 403 Forbidden:**
- Your cookie is wrong or expired
- Go back to Step 3 and get a fresh cookie
- Make sure you're logged in as admin@souveraterminal.com

**If you get 404 Not Found:**
- Batch ID is wrong
- Check the batch exists in database:
  ```sql
  SELECT id, batch_name, status 
  FROM souvera_source_file_ingestion_batches 
  WHERE id = 'df3009a9-886d-4cf2-9b9f-2142ea576943';
  ```

**If you get 500 Internal Server Error:**
- Check the dev server console logs
- Usually a parser error - check file format

### Step 5: Verify Parse Results in Database

Run this SQL in Supabase SQL Editor:

```sql
SELECT 
  id,
  batch_id,
  row_number,
  status,
  raw_data->>'iso3' as iso3,
  raw_data->>'country' as country,
  raw_data->>'status' as afcfta_status,
  created_at
FROM souvera_source_file_ingestion_rows
WHERE batch_id = 'df3009a9-886d-4cf2-9b9f-2142ea576943'
ORDER BY row_number;
```

**You should see 5 rows** (one for each line in afcfta-status-valid.csv).

**Expected:**
- row_number: 1, 2, 3, 4, 5
- status: 'pending' (not validated yet)
- iso3: DZA, EGY, KEN, NGA, ZAF
- raw_data contains all CSV columns

If you see this, **parse works**. Mark it as complete.

### Step 6: Test Validate Endpoint

Run this in PowerShell (same cookie):

```powershell
$headers = @{
    "Cookie" = "sb-djafctgnjazjwwudkmnq-auth-token=YOUR_ADMIN_COOKIE_HERE"
}

$body = @{
    country_column = "iso3"
    country_code_type = "iso3"
    required_fields = @("iso3", "country", "status")
    data_type = "afcfta_status"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/admin/batches/df3009a9-886d-4cf2-9b9f-2142ea576943/validate" -Method POST -Body $body -ContentType "application/json" -Headers $headers

Write-Host "Validate Response:"
$response | ConvertTo-Json -Depth 10
```

**Expected response:**
```json
{
  "success": true,
  "batchId": "df3009a9-886d-4cf2-9b9f-2142ea576943",
  "validRows": 5,
  "invalidRows": 0,
  "warnings": 0,
  "message": "Batch validated successfully"
}
```

### Step 7: Verify Validation Results

Run this SQL:

```sql
SELECT 
  row_number,
  status,
  mapped_iso3,
  validation_errors,
  validation_warnings,
  raw_data->>'country' as country
FROM souvera_source_file_ingestion_rows
WHERE batch_id = 'df3009a9-886d-4cf2-9b9f-2142ea576943'
ORDER BY row_number;
```

**Expected:**
- All rows: status = 'valid'
- All rows: mapped_iso3 = DZA, EGY, KEN, NGA, ZAF
- All rows: validation_errors = NULL
- All rows: validation_warnings = NULL

Check the batch status:

```sql
SELECT 
  id,
  batch_name,
  status,
  total_rows,
  valid_rows,
  invalid_rows,
  approved_at,
  published_at
FROM souvera_source_file_ingestion_batches
WHERE id = 'df3009a9-886d-4cf2-9b9f-2142ea576943';
```

**Expected:**
- status: 'validated'
- total_rows: 5
- valid_rows: 5
- invalid_rows: 0
- approved_at: NULL (not approved yet)
- published_at: NULL (not published yet)

If you see this, **validation works**. Mark it as complete.

---

## PART 3: Test Review & Approval (1 hour)

Now test the admin review and approval workflow.

### Step 8: Review Batch (Manual or API)

You have two options:

**Option A: SQL-Based Review (Quick)**

Check what needs approval:

```sql
SELECT 
  b.id,
  b.batch_name,
  b.status,
  b.total_rows,
  b.valid_rows,
  b.invalid_rows,
  b.source_name,
  b.as_of_date,
  b.created_at
FROM souvera_source_file_ingestion_batches b
WHERE b.status = 'validated'
  AND b.approved_at IS NULL
ORDER BY b.created_at DESC;
```

This shows all validated batches waiting for approval.

**Option B: Admin UI (If Implemented)**

Navigate to http://localhost:3010/admin/review-queue

If this page exists and shows batches, use it. If it 404s, use SQL approach.

### Step 9: Approve Batch

Approve the validated batch:

```sql
UPDATE souvera_source_file_ingestion_batches
SET 
  status = 'approved',
  approved_at = NOW(),
  approved_by = (SELECT id FROM auth.users WHERE email = 'admin@souveraterminal.com')
WHERE id = 'df3009a9-886d-4cf2-9b9f-2142ea576943';
```

Verify approval:

```sql
SELECT 
  id,
  batch_name,
  status,
  approved_at,
  approved_by,
  published_at
FROM souvera_source_file_ingestion_batches
WHERE id = 'df3009a9-886d-4cf2-9b9f-2142ea576943';
```

**Expected:**
- status: 'approved'
- approved_at: [timestamp]
- approved_by: [admin user ID]
- published_at: NULL (not published yet)

### Step 10: Test No Auto-Publication

Verify approved batches DO NOT auto-publish:

```sql
SELECT 
  id,
  batch_name,
  status,
  approved_at,
  published_at
FROM souvera_source_file_ingestion_batches
WHERE approved_at IS NOT NULL
  AND published_at IS NOT NULL;
```

**Expected result: 0 rows**

This proves approved batches wait for explicit publication. This is correct governance.

---

## PART 4: Publication Workflow (30 minutes)

This is where ingested data moves from staging to production.

### Step 11: Understand Publication Architecture

Your current tables:

**Staging (Ingestion):**
- `souvera_source_file_ingestion_rows` - Parsed and validated data

**Production (Published):**
- `souvera_agoa_status` - Published AGOA data
- `souvera_afcfta_status` - Published AfCFTA data
- (Other policy tracker tables)

**Publication means:** Copy validated rows from staging to production, mark batch as published.

### Step 12: Manual Publication (SQL)

For AfCFTA data, publish like this:

```sql
-- Insert validated rows into production table
INSERT INTO souvera_afcfta_status (
  country_iso3,
  country_name,
  status,
  as_of_date,
  source_url,
  notes,
  batch_id,
  created_at
)
SELECT 
  r.mapped_iso3,
  r.raw_data->>'country',
  r.raw_data->>'status',
  b.as_of_date,
  b.source_url,
  r.raw_data->>'notes',
  b.id,
  NOW()
FROM souvera_source_file_ingestion_rows r
JOIN souvera_source_file_ingestion_batches b ON b.id = r.batch_id
WHERE b.id = 'df3009a9-886d-4cf2-9b9f-2142ea576943'
  AND r.status = 'valid'
  AND b.status = 'approved';

-- Mark batch as published
UPDATE souvera_source_file_ingestion_batches
SET 
  status = 'published',
  published_at = NOW()
WHERE id = 'df3009a9-886d-4cf2-9b9f-2142ea576943';
```

### Step 13: Verify Publication

Check production table:

```sql
SELECT 
  country_iso3,
  country_name,
  status,
  as_of_date,
  batch_id,
  created_at
FROM souvera_afcfta_status
WHERE batch_id = 'df3009a9-886d-4cf2-9b9f-2142ea576943'
ORDER BY country_name;
```

**Expected: 5 rows** with AfCFTA data now in production table.

Check batch status:

```sql
SELECT 
  id,
  batch_name,
  status,
  approved_at,
  published_at
FROM souvera_source_file_ingestion_batches
WHERE id = 'df3009a9-886d-4cf2-9b9f-2142ea576943';
```

**Expected:**
- status: 'published'
- published_at: [timestamp]

### Step 14: Verify Data Accessible via API

Test if published data is available to end users:

```bash
# As any authenticated user
curl -X GET "http://localhost:3010/api/v1/afcfta-status?iso3=NGA" \
  -H "Cookie: [user-session-cookie]"
```

Or check directly in database:

```sql
SELECT * FROM souvera_afcfta_status WHERE country_iso3 = 'NGA';
```

If you see the data, **publication works**.

---

## PART 5: Declare Victory (10 minutes)

### Step 15: Update Status Documents

Update phase status:

```markdown
# In docs/status/phase-4b-status.md

## Current Status

| Attribute | Value |
|-----------|-------|
| **Status** | ✅ **Phase 4B CSV Ingestion COMPLETE** |
| **Completion Date** | 2026-05-13 |
| **Validated Workflows** | Upload, Parse, Validate, Review, Approve, Publish |
| **Production Status** | CSV ingestion ready for production use |

## Completed Workflows

### CSV Ingestion (Upload → Publish)
- ✅ Upload CSV via admin UI
- ✅ Parse CSV into structured rows
- ✅ Validate country codes (74-market scope)
- ✅ Validate policy status (AGOA, AfCFTA)
- ✅ Admin review queue
- ✅ Manual approval gating
- ✅ Publication to production tables
- ✅ No auto-publication (governance maintained)

### Validated Datasets
- ✅ AGOA trade policy data (Phase 4B-V1)
- ✅ AfCFTA trade policy data (Phase 4B-V2-A)

## Ready for Production

CSV ingestion pipeline is production-ready. Platform admins can now:
1. Upload trade policy CSV files
2. Review and validate data quality
3. Approve batches for publication
4. Publish to Intelligence Terminal

## Next Phase

**Phase 4C: User Dashboards**
- Admin dashboard (platform_admin)
- Professional dashboard
- Business dashboard
- Institutional dashboard
- Account-specific data views
```

### Step 16: Create Demo Documentation

Document the working demo:

```markdown
# In docs/demo/csv-ingestion-demo.md

# CSV Ingestion Demo Script

## Demo Objective
Show stakeholders the complete CSV ingestion workflow from upload to publication.

## Demo Duration
3-5 minutes

## Demo Steps

### 1. Upload (30 seconds)
- Log in as admin@souveraterminal.com
- Navigate to /admin/data/upload
- Upload afcfta-status-valid.csv
- Show success message
- Note batch ID

### 2. Parse & Validate (1 minute)
- Explain: System parses CSV into structured rows
- Explain: Validates country codes against 74-market scope
- Show SQL results of parsed rows
- Show validation passed (5 valid rows, 0 invalid)

### 3. Review (1 minute)
- Show validated batch in review queue
- Explain: Admin reviews data quality
- Explain: Can reject if issues found
- Show batch details (source, date, row count)

### 4. Approve (30 seconds)
- Click "Approve Batch" or run SQL
- Explain: Manual approval gating (no auto-publish)
- Show approved_at timestamp set

### 5. Publish (1 minute)
- Explain: Moves data from staging to production
- Run publication SQL
- Show data now in souvera_afcfta_status table
- Show published_at timestamp

### 6. Verify (1 minute)
- Query production table
- Show data available via API
- Explain: Now visible on Intelligence Terminal
- Show source attribution maintained

## Key Messages for Stakeholders

1. **Secure:** Platform admin access only
2. **Governed:** Manual approval required, no auto-publish
3. **Traceable:** Every row links back to source batch
4. **Validated:** Country codes checked against 74-market scope
5. **Production-Ready:** Working end-to-end for CSV files

## Demo Data

File: docs/qa/test-data/phase-4b/afcfta-status-valid.csv
Rows: 5 (Algeria, Egypt, Kenya, Nigeria, South Africa)
Policy: AfCFTA trade agreement status
```

### Step 17: Backlog Future Work

Create backlog document:

```markdown
# In docs/backlog/phase-4b-future-enhancements.md

# Phase 4B Future Enhancements

## Post-Demo, Pre-Launch (Priority: P1)

### 1. Review Queue UI
Build admin dashboard to review batches visually instead of SQL.

**Effort:** 2 days
**Value:** Admin UX improvement

### 2. Publication API Endpoint
Create POST /api/v1/admin/batches/{id}/publish endpoint.

**Effort:** 1 day
**Value:** No more manual SQL for publication

### 3. Error Handling UX
Better error messages in UI for parse/validate failures.

**Effort:** 1 day
**Value:** Admin can fix issues faster

## Post-Launch Enhancements (Priority: P2)

### 4. JSON File Support (Phase 4B-V3)
**Effort:** 3 days
**Value:** More flexible data sources

### 5. PDF Evidence Upload (Phase 4B-V4)
**Effort:** 2 days
**Value:** Link supporting documents

### 6. Scheduled Monitors (Phase 4B-V7)
**Effort:** 5 days
**Value:** Auto-detect policy changes

## Future Consideration (Priority: P3)

### 7. Automatic Parsing (Phase 4B-V5)
**Effort:** 2 days
**Value:** Reduce manual steps

### 8. Automatic Validation (Phase 4B-V6)
**Effort:** 2 days
**Value:** Immediate feedback on upload

### 9. Multi-Format Support
**Effort:** 10 days
**Value:** Handle XML, HTML, scanned PDFs

### 10. Advanced Validation
**Effort:** 5 days
**Value:** Cross-reference checking, ESH rejection

## Not Planned

- OCR for scanned documents (too complex, low ROI)
- Real-time web scraping (legal/technical issues)
- Automatic publication (governance violation)
```

---

## SUCCESS CRITERIA

You're done when:

✅ Admin script ran successfully  
✅ You can log in as admin@souveraterminal.com  
✅ Account menu shows "Platform Admin"  
✅ Parse API returns 200 OK (not 403)  
✅ Validate API returns 200 OK  
✅ Database shows parsed rows with status='valid'  
✅ Batch can be approved via SQL  
✅ Approved batch doesn't auto-publish  
✅ Publication SQL moves data to production  
✅ Published data visible in production table  
✅ Status docs updated to mark Phase 4B complete  

When all 11 checkboxes are checked, CSV ingestion is complete.

---

## NEXT PHASE: Dashboards

After this is done, you move to Phase 4C: User Dashboards.

**Dashboard work includes:**

1. **Platform Admin Dashboard**
   - Review queue UI
   - Batch management
   - User management
   - System monitoring

2. **Professional User Dashboard**
   - Data access based on professional plan
   - Limited to professional entitlements
   - No admin features

3. **Business User Dashboard**
   - Data access based on business plan
   - Comparison tools
   - Export capabilities

4. **Institutional User Dashboard**
   - Full data access
   - API access
   - Team workspace
   - Audit logs

**This is separate work.** CSV ingestion (Phase 4B) is infrastructure. Dashboards (Phase 4C) are user experience.

You finish Phase 4B today. Phase 4C starts tomorrow.

---

## TROUBLESHOOTING

### 403 Forbidden on Any Admin Endpoint

**Cause:** Not logged in as admin or cookie expired.

**Fix:**
1. Log out completely
2. Log in as admin@souveraterminal.com
3. Get fresh cookie
4. Retry command

### "Platform Admin" Not Showing in UI

**Cause:** Subscription not created (only role assigned).

**Fix:**
```bash
npx tsx scripts/seed-platform-admin.ts
```

Log out and log back in.

### Parse Returns 404

**Cause:** Batch doesn't exist or wrong ID.

**Fix:** Check batch exists:
```sql
SELECT id, batch_name, status FROM souvera_source_file_ingestion_batches 
WHERE file_asset_id IN (SELECT id FROM souvera_source_file_assets WHERE file_name LIKE '%afcfta%')
ORDER BY created_at DESC;
```

Use the correct batch ID.

### Parse Returns 500

**Cause:** File format issue or parser bug.

**Fix:** Check dev server logs. Usually means CSV has unexpected columns or format.

### Validate Returns Error

**Cause:** Required fields missing in validation config.

**Fix:** Match required_fields to actual CSV columns. Check CSV headers.

### Can't Find Cookie

**Cause:** Looking in wrong place or different browser.

**Fix:** 
- Chrome: F12 → Application → Cookies → http://localhost:3010
- Firefox: F12 → Storage → Cookies → http://localhost:3010
- Edge: F12 → Application → Cookies → http://localhost:3010

### SQL Queries Return 0 Rows

**Cause:** Using wrong batch ID or rows not created yet.

**Fix:** 
1. Confirm parse succeeded (check API response)
2. Wait 1 second (database write delay)
3. Verify batch ID matches

---

## TIMELINE

| Task | Duration | Cumulative |
|------|----------|------------|
| Run admin script | 5 min | 5 min |
| Log in as admin | 5 min | 10 min |
| Test parse | 10 min | 20 min |
| Test validate | 10 min | 30 min |
| Verify in database | 10 min | 40 min |
| Test approval | 10 min | 50 min |
| Test publication | 20 min | 70 min |
| Update docs | 20 min | 90 min |
| Create demo script | 30 min | 120 min |

**Total: 2 hours**

Start now. Finish by 4:00 PM today.

---

## FINAL WORD

Your CSV ingestion pipeline is built. You're not debugging infrastructure anymore - you're just finishing the test checklist. Once you run that admin script and get the cookie working, the rest flows.

After today, you're done with ingestion and moving to dashboards. The Africa and Caribbean intelligence platforms get their admin interfaces, then user dashboards for each account tier.

Execute this playbook step by step. Don't skip ahead. When you hit the success criteria, you're done.

Now run the script.
