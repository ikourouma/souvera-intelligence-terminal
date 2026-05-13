# Phase 4B Architecture Decision
## Single-Host Unified Platform

**Decision Date:** 2026-05-13  
**Status:** APPROVED  
**Severity:** CRITICAL - Blocks demo readiness

---

## Executive Summary

Consolidate to **single-host architecture** on `localhost:3010` (api-gateway) for Fortune 5-grade simplicity and operational excellence.

---

## Current State (BROKEN)

```
Port 3010: api-gateway (76 pages + API endpoints) ✅ COMPLETE
Port 3000: terminal-web (0 pages)                 ❌ EMPTY SHELL
```

**Issues:**
- Two hosts confuse developers and users
- terminal-web is empty, serves no purpose
- Admin can't find upload page (expects it on 3000, but it's on 3010)
- API calls fail due to CORS/cookie domain mismatch
- Not production-ready

---

## Approved Architecture

### Single Next.js App on Port 3010

```
http://localhost:3010
│
├── /                          → Public landing page
├── /login                     → Authentication
├── /register                  → Registration
│
├── /dashboard                 → User dashboard (post-login redirect)
├── /intelligence/*            → Intelligence pages
├── /sectors/*                 → Sector pages
├── /insights/*                → Insights & rankings
│
├── /admin/data/upload         → Admin file upload (platform_admin only)
├── /admin/data/sources        → Admin source management
├── /admin/data/quality        → Admin data quality
├── /admin/data/ingestion      → Admin ingestion monitoring
│
└── /api/v1/*                  → RESTful API endpoints
    ├── /api/v1/admin/*        → Admin APIs
    └── /api/v1/public/*       → Public APIs
```

---

## Implementation Steps

### 1. Stop Running terminal-web

**Immediate action:**
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Start ONLY api-gateway
cd apps/api-gateway
npm run dev
```

### 2. Update turbo.json (Optional - For Future)

Remove terminal-web from dev pipeline if not needed:

```json
{
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

Or add explicit config to run only api-gateway:
```bash
npm run dev -- --filter=@souvera/api-gateway
```

### 3. Admin Dashboard Access

**Current (Working):**
- URL: `http://localhost:3010/admin/data/upload`
- Auth: `admin@souveraterminal.com` / `Password1!`
- Role: `platform_admin`

### 4. API Endpoints

**Current (Working):**
- Base: `http://localhost:3010/api/v1/admin/*`
- Auth: Session cookie from localhost:3010 login
- No CORS issues (same domain)

---

## Fortune 5 Best Practices Applied

### ✅ Single Source of Truth
- One host, one app, one deployment target
- No port confusion, no cookie domain mismatches

### ✅ Clear URL Hierarchy
- `/` = public
- `/dashboard` = authenticated users
- `/admin` = platform admins only
- `/api` = programmatic access

### ✅ Enterprise-Grade Routing
- RESTful API structure
- Semantic URL paths
- Role-based access at route level

### ✅ Simplified Operations
- One service to monitor
- One log stream to analyze
- One deployment pipeline

### ✅ Sovereign-Grade Security
- Session cookies scoped to single domain
- RLS policies at database level
- Admin routes protected by middleware

---

## Migration Impact

### Immediate Benefits
1. **Admin unblocked**: Upload page accessible at `/admin/data/upload`
2. **API calls work**: No CORS, same-domain cookies
3. **Demo-ready**: Single clean URL for stakeholders
4. **Simpler deployment**: One service to productionize

### Future Considerations
- If terminal-web is needed later, implement as:
  - **Option A**: Subdomain (`app.souvera.com` → reverse proxy to separate service)
  - **Option B**: Path prefix (`/app/*` → reverse proxy to separate service)
  - **Option C**: Keep unified (recommended)

---

## Verification Checklist

- [ ] Stop terminal-web (port 3000)
- [ ] Verify api-gateway running on port 3010
- [ ] Login at `http://localhost:3010/login`
- [ ] Access admin dashboard at `/admin/data/upload`
- [ ] Test API calls from browser console (same domain)
- [ ] Verify session persistence (refresh page, still logged in)
- [ ] Document final URL structure in README

---

## Stakeholder Communication

**For Musk, Bezos, Mark Demo:**
- Single URL: `https://terminal.souvera.com`
- Clean architecture, no port numbers
- Professional, Fortune 5-grade presentation

---

## Sign-Off

**Decision:** Consolidate to single-host on port 3010  
**Approved By:** Platform Team  
**Effective:** Immediate  
**Review Date:** Post-demo retrospective
