# Souvera Environment Variables - Auth & Leads

**Document Version:** 1.0  
**Last Updated:** April 28, 2026  
**Applies To:** Phase 2C/2D (Authentication & Lead Capture)

---

## Required Environment Variables

### 1. Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Type:** Public
- **Required:** Yes
- **Used By:** All Supabase client/server interactions
- **Format:** `https://[PROJECT_ID].supabase.co`
- **Example:** `https://abc123xyz.supabase.co`
- **Where to Find:** Supabase Dashboard → Project Settings → API → Project URL

**Description:** Base URL for your Supabase project. Used by both server and client-side code.

---

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Type:** Public (safe for browser)
- **Required:** Yes
- **Used By:** Client-side auth, browser Supabase client
- **Format:** Long JWT token starting with `eyJ...`
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to Find:** Supabase Dashboard → Project Settings → API → `anon` `public` key

**Description:** Anonymous key for client-side Supabase operations. This key has RLS policies applied and is safe to expose in browser code.

**Security Notes:**
- ✅ Safe for client-side use
- ✅ Row Level Security (RLS) enforced
- ✅ Can be committed to public repos (though not recommended)

---

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Type:** Secret (server-only)
- **Required:** Yes
- **Used By:** Server-side API routes that need to bypass RLS
- **Format:** Long JWT token starting with `eyJ...`
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to Find:** Supabase Dashboard → Project Settings → API → `service_role` `secret` key

**Description:** Service role key with full database access, bypassing RLS. Used ONLY in server-side API routes.

**Security Notes:**
- ⚠️ NEVER expose in client-side code
- ⚠️ NEVER commit to version control
- ⚠️ Only use in API routes (e.g., `/api/v1/leads`, `/api/v1/country-lite`)
- ✅ Bypasses Row Level Security
- ✅ Use `getServiceClient()` helper in `apps/api-gateway/src/app/api/v1/leads/route.ts`

**Current Usage:**
- `/api/v1/leads` - Lead submissions
- `/api/v1/country-lite` - Country data API

---

### 2. Application Configuration

#### `NEXT_PUBLIC_SITE_URL`
- **Type:** Public
- **Required:** Yes
- **Used By:** Invitation system, email redirects, OAuth callbacks
- **Format:** `https://yourdomain.com` or `http://localhost:3000` (dev)
- **Example (Production):** `https://souvera.vercel.app`
- **Example (Development):** `http://localhost:3000`

**Description:** Base URL for the Souvera application. Used to construct absolute URLs for:
- Magic link redirects
- Password reset links
- Invitation acceptance URLs
- OAuth callbacks

**Environment-Specific Values:**
| Environment | Value |
|-------------|-------|
| Development | `http://localhost:3000` |
| Staging | `https://souvera-staging.vercel.app` |
| Production | `https://souvera.vercel.app` |

---

#### `TERMINAL_URL` (Optional)
- **Type:** Public
- **Required:** No (legacy)
- **Used By:** Legacy terminal route proxying
- **Format:** `https://terminal-domain.com`
- **Example:** `https://souvera-terminal.vercel.app`

**Description:** URL of the legacy terminal application for proxying `/terminal/*` routes. Only needed if terminal is deployed separately.

**Note:** This is a legacy configuration for the old terminal app. May be deprecated in Phase 3.

---

## Environment File Templates

### Development (`.env.local`)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_KEY

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional Legacy
TERMINAL_URL=http://localhost:3001
```

### Production (Vercel Environment Variables)

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production, Preview (encrypted) |
| `NEXT_PUBLIC_SITE_URL` | `https://souvera.vercel.app` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://souvera-git-[branch].vercel.app` | Preview |

---

## Setup Instructions

### 1. Supabase Project Setup

1. **Create Supabase Project** (if not exists)
   ```
   1. Go to https://supabase.com/dashboard
   2. Click "New Project"
   3. Set project name, database password, region
   4. Wait for project initialization (~2 minutes)
   ```

2. **Run Migrations**
   ```bash
   # From project root
   cd infra/supabase
   
   # Apply leads migration
   psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres -f sql-pack-v1.3-leads.sql
   
   # Apply auth migration
   psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres -f sql-pack-v1.4-auth.sql
   ```

3. **Get API Keys**
   ```
   1. Go to Project Settings → API
   2. Copy "Project URL" → NEXT_PUBLIC_SUPABASE_URL
   3. Copy "anon public" key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   4. Copy "service_role secret" key → SUPABASE_SERVICE_ROLE_KEY
   ```

### 2. Local Development Setup

1. **Create `.env.local`**
   ```bash
   cd apps/api-gateway
   cp .env.example .env.local
   ```

2. **Add Variables**
   - Edit `.env.local`
   - Paste Supabase credentials
   - Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

3. **Verify Setup**
   ```bash
   npm run dev
   
   # Test public route
   curl http://localhost:3000/
   
   # Test API route
   curl http://localhost:3000/api/v1/country-lite?iso3=ZMB
   ```

### 3. Production Deployment (Vercel)

1. **Import Project**
   ```
   1. Go to Vercel Dashboard
   2. Click "Add New Project"
   3. Import from GitHub: souvera/souvera
   ```

2. **Set Environment Variables**
   ```
   1. Go to Project Settings → Environment Variables
   2. Add all variables from table above
   3. Mark SUPABASE_SERVICE_ROLE_KEY as "Encrypted"
   ```

3. **Deploy**
   ```
   1. Push to main branch
   2. Vercel auto-deploys
   3. Verify at https://souvera.vercel.app
   ```

---

## Verification

### Check Environment Variables Are Loaded

Add to any API route temporarily:
```typescript
console.log({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
});
```

### Test Supabase Connection

```typescript
// Test script: scripts/test-supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase.from('souvera_plans').select('*');
console.log({ data, error });
```

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Cause:** `.env.local` not created or variables not set

**Fix:**
```bash
# Check if file exists
ls -la apps/api-gateway/.env.local

# If missing, create it
cp apps/api-gateway/.env.example apps/api-gateway/.env.local

# Edit and add variables
nano apps/api-gateway/.env.local
```

### Issue: "Invalid JWT token" in console

**Cause:** Wrong anon key or expired key

**Fix:**
1. Go to Supabase Dashboard → Project Settings → API
2. Copy fresh `anon public` key
3. Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
4. Restart dev server

### Issue: "Row Level Security policy violation"

**Cause:** Using anon key where service role key is needed

**Fix:**
- Use `getServiceClient()` in API routes, not `createClient()`
- Anon key → User-scoped operations
- Service role key → Admin operations

### Issue: "Failed to fetch" on API calls

**Cause:** `NEXT_PUBLIC_SITE_URL` mismatch or CORS

**Fix:**
1. Verify `NEXT_PUBLIC_SITE_URL` matches your domain
2. In Supabase Dashboard → Authentication → URL Configuration:
   - Add `http://localhost:3000` to "Site URL" (dev)
   - Add `https://souvera.vercel.app` to "Redirect URLs" (prod)

---

## Security Best Practices

### DO ✅

- Use `.env.local` for local development
- Add `.env.local` to `.gitignore`
- Use environment variables in Vercel for production
- Encrypt `SUPABASE_SERVICE_ROLE_KEY` in Vercel
- Rotate keys if accidentally exposed
- Use `getServiceClient()` wrapper for service role key

### DON'T ❌

- Commit `.env.local` to version control
- Expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- Hardcode credentials in source files
- Share service role key in Slack/email
- Use production keys in development
- Log full API keys in console

---

## Key Rotation Procedure

If `SUPABASE_SERVICE_ROLE_KEY` is compromised:

1. **Generate New Key**
   ```
   1. Go to Supabase Dashboard → Project Settings → API
   2. Click "Generate new key" next to service_role
   3. Copy new key
   ```

2. **Update Vercel**
   ```
   1. Go to Vercel → Project Settings → Environment Variables
   2. Edit SUPABASE_SERVICE_ROLE_KEY
   3. Paste new key
   ```

3. **Update Local**
   ```bash
   # Edit .env.local
   nano apps/api-gateway/.env.local
   
   # Update SUPABASE_SERVICE_ROLE_KEY
   ```

4. **Redeploy**
   ```bash
   git commit --allow-empty -m "trigger redeploy for key rotation"
   git push
   ```

5. **Revoke Old Key**
   - Old key auto-revoked in Supabase when new one generated

---

## References

- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Document Maintained By:** Engineering Team  
**Last Review:** April 28, 2026  
**Next Review:** After Phase 3
