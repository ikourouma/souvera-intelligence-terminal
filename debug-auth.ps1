# Debug Script - Find the Correct Auth Cookie
# Run this to see ALL cookies and test authentication

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "COOKIE FINDER & AUTH TESTER" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

Write-Host "STEP 1: Find ALL cookies from your browser" -ForegroundColor Cyan
Write-Host "=========================================`n"

Write-Host "1. Open your browser where you're logged in as admin@souveraterminal.com"
Write-Host "2. Go to: http://localhost:3010/admin/data/upload"
Write-Host "3. Press F12 to open DevTools"
Write-Host "4. Go to Application tab > Cookies > http://localhost:3010"
Write-Host "5. Look for ANY cookie that contains 'auth-token' in the name`n"

Write-Host "Common cookie names:" -ForegroundColor Yellow
Write-Host "  - sb-{something}-auth-token"
Write-Host "  - sb-localhost-auth-token"
Write-Host "  - supabase-auth-token"
Write-Host "  - supabase.auth.token`n"

Write-Host "COPY THE EXACT NAME and VALUE of the auth cookie you see`n" -ForegroundColor Green

# Test different possible cookie formats
Write-Host "`nSTEP 2: Test which cookie format works" -ForegroundColor Cyan
Write-Host "=========================================`n"

Write-Host "Try this in PowerShell to see what cookies the server is expecting:" -ForegroundColor Yellow
Write-Host ""
Write-Host @"
# Open browser console (F12) and run this JavaScript:
document.cookie.split(';').forEach(c => console.log(c.trim()))

# This will show you ALL cookies. Look for one with 'auth' in the name.
# Copy the ENTIRE cookie string (name=value)
"@ -ForegroundColor Gray

Write-Host "`n`nSTEP 3: Alternative - Use Browser Console Instead" -ForegroundColor Cyan
Write-Host "=========================================`n"

Write-Host "Since PowerShell cookies are tricky, use the browser console instead:" -ForegroundColor Yellow
Write-Host ""
Write-Host @"
1. Open browser at http://localhost:3010/admin/data/upload
2. Make sure you see "Platform Admin" in top right
3. Press F12 > Console tab
4. Paste this JavaScript and press Enter:

fetch('http://localhost:3010/api/v1/admin/batches/38de27eb-f655-4706-975a-eb6711ed13cc/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
}).then(r => r.json()).then(d => console.log('SUCCESS:', d)).catch(e => console.error('ERROR:', e))

This automatically uses your logged-in session. No cookie copy needed.
"@ -ForegroundColor Gray

Write-Host "`n`nIf you see SUCCESS in console, the API works!" -ForegroundColor Green
Write-Host "The problem is just copying the cookie to PowerShell.`n" -ForegroundColor Yellow

Write-Host "STEP 4: Alternative - Check if Admin Role is Actually Assigned" -ForegroundColor Cyan
Write-Host "=========================================`n"

Write-Host "Run this SQL in Supabase to verify admin role:" -ForegroundColor Yellow
Write-Host ""
Write-Host @"
SELECT 
  u.email,
  om.role as org_role,
  s.plan_id as subscription,
  om.organization_id,
  o.name as org_name
FROM auth.users u
LEFT JOIN souvera_organization_members om ON om.user_id = u.id
LEFT JOIN souvera_subscriptions s ON s.user_id = u.id AND s.status = 'active'
LEFT JOIN souvera_organizations o ON o.id = om.organization_id
WHERE u.email = 'admin@souveraterminal.com';
"@ -ForegroundColor Gray

Write-Host "`n`nExpected result:" -ForegroundColor Yellow
Write-Host "  email: admin@souveraterminal.com"
Write-Host "  org_role: platform_admin"
Write-Host "  subscription: platform_admin"
Write-Host "  org_name: Admin Test Organization`n"

Write-Host "If org_role is NULL or missing, the role wasn't assigned!" -ForegroundColor Red
Write-Host "Re-run: npx tsx scripts/seed-platform-admin.ts`n" -ForegroundColor Yellow

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "RECOMMENDED: Use browser console (Step 3)" -ForegroundColor Green
Write-Host "It's simpler and avoids cookie issues" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Yellow
