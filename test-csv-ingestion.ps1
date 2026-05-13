# Phase 4B - CSV Ingestion Testing Script
# Run this from: c:\Users\ikour\Projects\souvera
# 
# BEFORE RUNNING:
# 1. Open browser, go to http://localhost:3010/admin/data/upload
# 2. Make sure you're logged in as admin@souveraterminal.com
# 3. Press F12, go to Application > Cookies > http://localhost:3010
# 4. Find cookie: sb-djafctgnjazjwwudkmnq-auth-token
# 5. Copy the ENTIRE VALUE (long string starting with "base64-")
# 6. Paste it below where it says PASTE_YOUR_ADMIN_COOKIE_HERE

# ============================================================================
# CONFIGURATION - EDIT THIS SECTION
# ============================================================================

# PASTE YOUR ADMIN COOKIE VALUE HERE (replace the text between quotes)
$adminCookie = "base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpNNE5tTmhOVFk0TFRRM1ptSXROREZtTWkxaE1HRTJMVGd6TURJeU1UQTJaR1ZsTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMlJxWVdaamRHZHVhbUY2YW5kM2RXUnJiVzV4TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJNE4yTXhZMkV3TVMwNFpHSmlMVFJsT1RjdFlUQTVOQzB6TW1NM04ySmtORGRoTlRRaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemM0TnpBd05UQTJMQ0pwWVhRaU9qRTNOemcyT1RZNU1EWXNJbVZ0WVdsc0lqb2lZV1J0YVc1QWMyOTFkbVZ5WVhSbGNtMXBibUZzTG1OdmJTSXNJbkJvYjI1bElqb2lJaXdpWVhCd1gyMWxkR0ZrWVhSaElqcDdJbkJ5YjNacFpHVnlJam9pWlcxaGFXd2lMQ0p3Y205MmFXUmxjbk1pT2xzaVpXMWhhV3dpWFgwc0luVnpaWEpmYldWMFlXUmhkR0VpT25zaVpXMWhhV3hmZG1WeWFXWnBaV1FpT25SeWRXVXNJbVoxYkd4ZmJtRnRaU0k2SWtSbGRpQlFiR0YwWm05eWJTQkJaRzFwYmlKOUxDSnliMnhsSWpvaVlYVjBhR1Z1ZEdsallYUmxaQ0lzSW1GaGJDSTZJbUZoYkRFaUxDSmhiWElpT2x0N0ltMWxkR2h2WkNJNkluQmhjM04zYjNKa0lpd2lkR2x0WlhOMFlXMXdJam94TnpjNE5qazJPVEEyZlYwc0luTmxjM05wYjI1ZmFXUWlPaUpqWldZNFptTmhNeTFqWlRnM0xUUmxNamt0WVRFNVppMDVZV1ZsTnpOaU5qQXdPVGNpTENKcGMxOWhibTl1ZVcxdmRYTWlPbVpoYkhObGZRLkJZVXJlZENVLUFnSjFVTnp3M05FVVh6R1dFYlZXNUN5bXpTNUdmajRvcUhMZTJVeVVyZFBURHk5VFdWUW9udHZLQnl2MGQwOEoweEZDRXlqbUV4dGFBIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3Nzg3MDA1MDYsInJlZnJlc2hfdG9rZW4iOiJraDZ5ZmJiamQ2MzIiLCJ1c2VyIjp7ImlkIjoiODdjMWNhMDEtOGRiYi00ZTk3LWEwOTQtMzJjNzdiZDQ3YTU0IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBzb3V2ZXJhdGVybWluYWwuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wNS0xM1QxODoxMDozNi41NTAzNzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTA1LTEzVDE4OjEwOjM2LjU1MDM3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTA1LTEzVDE4OjI4OjI2LjA2NzEwNjc2N1oiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiRGV2IFBsYXRmb3JtIEFkbWluIn0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiZDEyYjVlYzgtYTFmNy00YTc2LWIyYjYtMDc4Mjc1MjkxMjU1IiwiaWQiOiI4N2MxY2EwMS04ZGJiLTRlOTctYTA5NC0zMmM3N2JkNDdhNTQiLCJ1c2VyX2lkIjoiODdjMWNhMDEtOGRiYi00ZTk3LWEwOTQtMzJjNzdiZDQ3YTU0IiwiaWRlbnRpdHlfZGF0YSI6eyJlbWFpbCI6ImFkbWluQHNvdXZlcmF0ZXJtaW5hbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiODdjMWNhMDEtOGRiYi00ZTk3LWEwOTQtMzJjNzdiZDQ3YTU0In0sInByb3ZpZGVyIjoiZW1haWwiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTA1LTExVDE4OjE4OjU3LjE5MDA1WiIsImNyZWF0ZWRfYXQiOiIyMDI2LTA1LTExVDE4OjE4OjU3LjE5MDExMVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wNS0xMVQxODoxODo1Ny4xOTAxMTFaIiwiZW1haWwiOiJhZG1pbkBzb3V2ZXJhdGVybWluYWwuY29tIn1dLCJjcmVhdGVkX2F0IjoiMjAyNi0wNS0xMVQxODoxODo1Ny4wOTk3NDVaIiwidXBkYXRlZF9hdCI6IjIwMjYtMDUtMTNUMTg6Mjg6MjYuMDc4MTk3WiIsImlzX2Fub255bW91cyI6ZmFsc2V9LCJ3ZWFrX3Bhc3N3b3JkIjpudWxsfQ"

# Your batch IDs (from upload)
$batchId1 = "df3009a9-886d-4cf2-9b9f-2142ea576943"  # First batch
$batchId2 = "38de27eb-f655-4706-975a-eb6711ed13cc"  # New batch

# Choose which batch to test (use $batchId1 or $batchId2)
$testBatchId = $batchId2  # Using new batch

# ============================================================================
# DO NOT EDIT BELOW THIS LINE
# ============================================================================

# Colors for output
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Section { param($msg) Write-Host "`n========================================" -ForegroundColor Yellow; Write-Host $msg -ForegroundColor Yellow; Write-Host "========================================`n" -ForegroundColor Yellow }

# Validate cookie
if ($adminCookie -eq "PASTE_YOUR_ADMIN_COOKIE_HERE" -or $adminCookie -eq "") {
    Write-Error "ERROR: You need to paste your admin cookie in the configuration section!"
    Write-Info "Steps:"
    Write-Info "1. Open browser at http://localhost:3010/admin/data/upload"
    Write-Info "2. Make sure you're logged in as admin@souveraterminal.com"
    Write-Info "3. Press F12, go to Application > Cookies"
    Write-Info "4. Find cookie: sb-djafctgnjazjwwudkmnq-auth-token"
    Write-Info "5. Copy the entire VALUE"
    Write-Info "6. Paste it in this script where it says PASTE_YOUR_ADMIN_COOKIE_HERE"
    Write-Info "7. Save and run again"
    exit 1
}

# Setup headers
$headers = @{
    "Cookie" = "sb-djafctgnjazjwwudkmnq-auth-token=$adminCookie"
}

# ============================================================================
# TEST 1: PARSE BATCH
# ============================================================================

Write-Section "TEST 1: Parse Batch"
Write-Info "Batch ID: $testBatchId"
Write-Info "Calling parse endpoint..."

try {
    $parseResponse = Invoke-RestMethod `
        -Uri "http://localhost:3010/api/v1/admin/batches/$testBatchId/parse" `
        -Method POST `
        -ContentType "application/json" `
        -Headers $headers
    
    Write-Success "✅ PARSE SUCCEEDED"
    Write-Info "Response:"
    $parseResponse | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Info "`nParse Summary:"
    Write-Info "  Total Rows: $($parseResponse.totalRows)"
    Write-Info "  Status: $($parseResponse.message)"
    
} catch {
    Write-Error "❌ PARSE FAILED"
    Write-Error "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Error "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Write-Error "`nYour cookie is wrong or expired!"
        Write-Info "Fix:"
        Write-Info "1. Go to browser at http://localhost:3010/admin/data/upload"
        Write-Info "2. Verify you see 'Platform Admin' in top right (not 'Explorer Plan')"
        Write-Info "3. Press F12 > Application > Cookies"
        Write-Info "4. Copy the VALUE of cookie: sb-djafctgnjazjwwudkmnq-auth-token"
        Write-Info "5. Paste it in this script (line 14)"
        Write-Info "6. Save and run again"
    }
    exit 1
}

# ============================================================================
# TEST 2: VALIDATE BATCH
# ============================================================================

Write-Section "TEST 2: Validate Batch"
Write-Info "Batch ID: $testBatchId"
Write-Info "Calling validate endpoint..."

$validateBody = @{
    country_column = "iso3"
    country_code_type = "iso3"
    required_fields = @("iso3", "country", "status")
    data_type = "afcfta_status"
} | ConvertTo-Json

try {
    $validateResponse = Invoke-RestMethod `
        -Uri "http://localhost:3010/api/v1/admin/batches/$testBatchId/validate" `
        -Method POST `
        -Body $validateBody `
        -ContentType "application/json" `
        -Headers $headers
    
    Write-Success "✅ VALIDATE SUCCEEDED"
    Write-Info "Response:"
    $validateResponse | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Info "`nValidation Summary:"
    Write-Info "  Valid Rows: $($validateResponse.validRows)"
    Write-Info "  Invalid Rows: $($validateResponse.invalidRows)"
    Write-Info "  Warnings: $($validateResponse.warnings)"
    Write-Info "  Status: $($validateResponse.message)"
    
} catch {
    Write-Error "❌ VALIDATE FAILED"
    Write-Error "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Error "Error: $($_.Exception.Message)"
    exit 1
}

# ============================================================================
# NEXT STEPS
# ============================================================================

Write-Section "TESTS COMPLETE"

Write-Success "✅ Parse: SUCCESS"
Write-Success "✅ Validate: SUCCESS"

Write-Info "`nNext Steps:"
Write-Info "1. Open Supabase SQL Editor"
Write-Info "2. Run this query to verify parsed rows:"
Write-Info ""
Write-Host @"
SELECT 
  row_number,
  status,
  mapped_iso3,
  raw_data->>'country' as country,
  validation_errors
FROM souvera_source_file_ingestion_rows
WHERE batch_id = '$testBatchId'
ORDER BY row_number;
"@ -ForegroundColor Gray

Write-Info "`n3. Run this query to verify batch status:"
Write-Info ""
Write-Host @"
SELECT 
  id,
  batch_name,
  status,
  total_rows,
  valid_rows,
  invalid_rows
FROM souvera_source_file_ingestion_batches
WHERE id = '$testBatchId';
"@ -ForegroundColor Gray

Write-Info "`n4. Continue with approval workflow in the playbook"
Write-Success "`nPhase 4B CSV Ingestion: Parse & Validate COMPLETE ✅"
