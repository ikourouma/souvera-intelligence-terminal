# Phase 4B Single-Host Test & Validation Plan
**Date:** 2026-05-13  
**Objective:** Consolidate to single-host architecture and complete CSV validation workflow  
**Target:** Demo-ready platform on `localhost:3010`

---

## Pre-Flight Check

**Architecture Status:**
- ✅ api-gateway has 76 pages (complete application)
- ✅ Admin upload page exists at `/admin/data/upload`
- ✅ Validate API exists at `/api/v1/admin/batches/[id]/validate`
- ❌ terminal-web is empty and should not run

**Test Batch:**
- Batch ID: `38de27eb-f655-4706-975a-eb6711ed13cc`
- File: `afcfta-status-valid.csv`
- Status: `parsed` (3 rows)
- Ready for validation

---

## Step 1: Clean Environment Setup

### 1.1 Stop All Node Processes

```powershell
# Kill all node processes
taskkill /F /IM node.exe
```

### 1.2 Start Only api-gateway

```powershell
# Navigate to api-gateway
cd apps/api-gateway

# Start dev server
npm run dev
```

### 1.3 Verify Startup

**Expected output:**
```
▲ Next.js 16.2.4 (Turbopack)
- Local:    http://localhost:3010
✓ Ready in Xms
```

**Checkpoint:**
- [ ] Only ONE dev server running
- [ ] Port 3010 confirmed
- [ ] No errors in terminal

---

## Step 2: Verify Core Routes

### 2.1 Landing Page

**URL:** `http://localhost:3010/`

**Expected:**
- "The Africa & Caribbean Decision Engine" hero section
- Navigation menu
- "Explore Platform" button
- Professional branding

**Checkpoint:**
- [ ] Page loads without errors
- [ ] No 404 messages
- [ ] UI renders correctly

### 2.2 Login Page

**URL:** `http://localhost:3010/login`

**Test:**
- Email: `admin@souveraterminal.com`
- Password: `Password1!`

**Expected:**
- Login form renders
- Submit succeeds
- Redirects to dashboard or profile

**Checkpoint:**
- [ ] Login page accessible
- [ ] Authentication succeeds
- [ ] Session cookie set (check DevTools → Application → Cookies)

### 2.3 Admin Upload Page

**URL:** `http://localhost:3010/admin/data/upload`

**Expected:**
- File upload interface
- "Platform Admin" badge visible
- Source metadata form
- Batch upload functionality

**Checkpoint:**
- [ ] Page loads (not 404)
- [ ] Admin UI visible
- [ ] Upload form present

---

## Step 3: API Validation Workflow

### 3.1 Open Browser Console

**Location:** `http://localhost:3010` (any page while logged in)  
**Tool:** F12 → Console tab

### 3.2 Verify Batch Status (SQL)

**Run in Supabase SQL Editor:**

```sql
SELECT 
  id,
  batch_name,
  status,
  total_rows,
  valid_rows,
  invalid_rows,
  warning_rows
FROM souvera_source_file_ingestion_batches
WHERE id = '38de27eb-f655-4706-975a-eb6711ed13cc';
```

**Expected:**
| Field | Value |
|-------|-------|
| status | parsed |
| total_rows | 3 |
| valid_rows | null |
| invalid_rows | null |

**Checkpoint:**
- [ ] Batch exists
- [ ] Status is `parsed`
- [ ] Ready for validation

### 3.3 Run Validate API Call

**Run in Browser Console (on localhost:3010):**

```javascript
await fetch('/api/v1/admin/batches/38de27eb-f655-4706-975a-eb6711ed13cc/validate', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    country_column: 'iso3',
    country_code_type: 'iso3',
    data_type: 'afcfta_status',
    required_fields: ['iso3', 'country_name', 'afcfta_status']
  })
}).then(async r => {
  const status = r.status;
  const data = await r.json();
  console.log('🔍 Status Code:', status);
  console.log('📊 Response:', data);
  if (status === 200) {
    console.log('✅ VALIDATION SUCCESS');
    console.log('   Total:', data.summary.total);
    console.log('   Valid:', data.summary.valid);
    console.log('   Invalid:', data.summary.invalid);
    console.log('   Warnings:', data.summary.warnings);
    console.log('   Excluded:', data.summary.excluded);
  } else {
    console.error('❌ VALIDATION FAILED:', data.error);
  }
  return data;
});
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Batch validated successfully",
  "summary": {
    "total": 3,
    "valid": 3,
    "invalid": 0,
    "warnings": 0,
    "excluded": 0
  },
  "next_step": "Review validated rows and proceed to approval"
}
```

**Checkpoint:**
- [ ] Status code: 200
- [ ] `success: true`
- [ ] Summary shows 3 valid rows
- [ ] No errors in console
- [ ] No server errors in terminal

---

## Step 4: Verify Validation Results

### 4.1 Check Batch Status (SQL)

```sql
SELECT 
  id,
  batch_name,
  status,
  total_rows,
  valid_rows,
  invalid_rows,
  warning_rows,
  updated_at
FROM souvera_source_file_ingestion_batches
WHERE id = '38de27eb-f655-4706-975a-eb6711ed13cc';
```

**Expected:**
| Field | Value |
|-------|-------|
| status | **validated** |
| total_rows | 3 |
| valid_rows | **3** |
| invalid_rows | **0** |
| warning_rows | **0** |

### 4.2 Check Individual Row Results (SQL)

```sql
SELECT 
  row_number,
  status,
  mapped_iso3,
  raw_data->>'country_name' as country_name,
  raw_data->>'afcfta_status' as afcfta_status,
  validation_errors,
  validation_warnings
FROM souvera_source_file_ingestion_rows
WHERE batch_id = '38de27eb-f655-4706-975a-eb6711ed13cc'
ORDER BY row_number;
```

**Expected:**
- 3 rows returned
- All `status = 'valid'`
- `mapped_iso3` populated (e.g., 'GHA', 'KEN', 'NGA')
- `validation_errors` and `validation_warnings` are null

**Checkpoint:**
- [ ] Batch status changed to `validated`
- [ ] Valid/invalid counts correct
- [ ] All 3 rows marked as valid
- [ ] ISO3 codes mapped correctly

---

## Step 5: Route Structure Documentation

### 5.1 Verified Routes

Create a quick reference of tested routes:

**Public Routes (Unauthenticated):**
- `/` - Landing page ✅
- `/login` - Authentication ✅
- `/register` - User registration
- `/about` - About page
- `/contact` - Contact page

**Authenticated Routes:**
- `/dashboard` - User dashboard
- `/intelligence/*` - Intelligence pages
- `/sectors/*` - Sector pages
- `/insights/*` - Insights & rankings

**Admin Routes (platform_admin only):**
- `/admin/data/upload` - File upload ✅
- `/admin/data/sources` - Source management
- `/admin/data/quality` - Data quality monitoring
- `/admin/data/ingestion` - Ingestion monitoring

**API Routes:**
- `/api/v1/admin/batches/[id]/parse` - Parse uploaded file
- `/api/v1/admin/batches/[id]/validate` - Validate parsed data ✅
- `/api/v1/admin/batches/[id]/approve` - Approve validated data
- `/api/v1/admin/batches/[id]/publish` - Publish approved data

### 5.2 Update Phase 4B Status

Add to `docs/status/phase-4b-status.md`:

```markdown
## 2026-05-13 - Architecture Consolidation

**Change:** Consolidated to single-host architecture
**Impact:** All functionality on localhost:3010
**Benefits:**
- No CORS issues
- Simplified deployment
- Fortune 5-grade route structure
- Demo-ready

**Testing Status:**
- ✅ Landing page verified
- ✅ Authentication verified
- ✅ Admin dashboard accessible
- ✅ Validate API functional
- ✅ CSV validation complete (3/3 rows valid)

**Next Steps:**
- Review & approval workflow
- Publication workflow
- Dashboard data visualization
```

---

## Success Criteria

**All checkpoints must pass:**

1. ✅ Only one dev server running (port 3010)
2. ✅ Landing page loads correctly
3. ✅ Login as admin succeeds
4. ✅ Admin upload page accessible
5. ✅ Validate API returns 200 with success
6. ✅ Batch status updated to `validated`
7. ✅ All 3 rows marked as valid
8. ✅ No console errors
9. ✅ No server errors
10. ✅ Route structure documented

---

## Troubleshooting

### Issue: Port 3010 in use

**Solution:**
```powershell
netstat -ano | findstr :3010
taskkill /F /PID <PID>
```

### Issue: Login fails / 403 errors

**Solution:**
```bash
# Re-provision admin user
npx tsx scripts/seed-platform-admin.ts
```

### Issue: Validate returns 404

**Check:**
- Are you logged in on localhost:3010?
- Is the dev server running without errors?
- Check terminal for route loading errors

### Issue: Validate returns 500

**Check:**
- Terminal for stack trace
- Supabase connection (env vars)
- Batch exists and is in `parsed` status

---

## Demo Readiness Checklist

**For Musk, Bezos, Mark:**

- [ ] Single clean URL (localhost:3010 → production domain)
- [ ] Professional landing page
- [ ] Seamless authentication
- [ ] Admin dashboard responsive
- [ ] File upload functional
- [ ] Validation workflow complete
- [ ] Data visible in dashboards
- [ ] No errors or glitches
- [ ] Fortune 5-grade UX

---

## Next Steps After Validation

1. **Review & Approval Workflow**
   - UI for reviewing validated rows
   - Approval mechanism (UI or SQL)
   - Non-auto publication verification

2. **Publication Workflow**
   - Publish validated data to production tables
   - Verify data appears in dashboards
   - Test data updates

3. **Dashboard Integration**
   - AfCFTA status dashboard
   - Country-level drill-down
   - Source attribution display

4. **Demo Script**
   - End-to-end walkthrough
   - Talking points for stakeholders
   - Q&A preparation

---

**Status:** Ready to execute  
**Owner:** Platform Team  
**ETA:** 30 minutes to complete all steps
