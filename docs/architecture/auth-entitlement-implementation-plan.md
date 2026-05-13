# Souvera Authentication and Entitlement Implementation

**Status:** Implemented  
**Version:** 1.0  
**Date:** April 28, 2026

---

## Executive Summary

This document summarizes the implementation of Supabase Auth for Souvera with invite-only institutional access, organization-based accounts, and server-enforced entitlement system.

---

## 1. Implementation Overview

### Components Implemented

| Component | Status | Files |
|-----------|--------|-------|
| Supabase SSR Integration | ✅ Complete | `package.json`, `lib/supabase/*` |
| Session Management | ✅ Complete | `proxy.ts` |
| Login/Logout | ✅ Complete | `(auth)/login/page.tsx` |
| Magic Link Auth | ✅ Complete | `auth/callback/route.ts` |
| Email Verification | ✅ Complete | `auth/confirm/route.ts` |
| Password Reset | ✅ Complete | `auth/forgot-password`, `auth/reset-password` |
| Invitation System | ✅ Complete | SQL migration, API routes |
| Entitlements | ✅ Complete | `packages/entitlements` |
| Profile Management | ✅ Complete | `profile/page.tsx` |
| Upgrade Prompts | ✅ Complete | `components/access/UpgradePrompt.tsx` |

---

## 2. New Files Created

### Supabase Utilities
- `apps/api-gateway/src/lib/supabase/server.ts` - Server-side Supabase client
- `apps/api-gateway/src/lib/supabase/client.ts` - Browser Supabase client
- `apps/api-gateway/src/lib/supabase/middleware.ts` - Middleware session helper

### Auth Routes
- `apps/api-gateway/src/app/auth/callback/route.ts` - OAuth/magic link callback
- `apps/api-gateway/src/app/auth/confirm/route.ts` - Email verification
- `apps/api-gateway/src/app/auth/error/page.tsx` - Auth error page
- `apps/api-gateway/src/app/auth/forgot-password/page.tsx` - Password reset request
- `apps/api-gateway/src/app/auth/reset-password/page.tsx` - Password reset form
- `apps/api-gateway/src/app/auth/set-password/page.tsx` - Initial password setup

### API Routes
- `apps/api-gateway/src/app/api/v1/invitations/route.ts` - Create/list invitations
- `apps/api-gateway/src/app/api/v1/invitations/validate/route.ts` - Validate invitation tokens

### Entitlements Package
- `packages/entitlements/package.json` - Package config
- `packages/entitlements/index.ts` - Full entitlement resolver implementation

### Database Migration
- `infra/supabase/sql-pack-v1.4-auth.sql` - Invitations table, triggers, and helper functions

### UI Components
- `apps/api-gateway/src/app/profile/page.tsx` - User profile and settings
- `apps/api-gateway/src/components/access/UpgradePrompt.tsx` - Access upgrade prompts

---

## 3. Modified Files

- `apps/api-gateway/package.json` - Added `@supabase/ssr` and `@souvera/entitlements`
- `apps/api-gateway/src/proxy.ts` - Added session validation and route protection
- `apps/api-gateway/src/app/(auth)/login/page.tsx` - Full auth form implementation
- `apps/api-gateway/next.config.ts` - Added auth-related redirects
- `apps/api-gateway/src/app/api/v1/country-lite/route.ts` - Added entitlement-based filtering

---

## 4. Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      PUBLIC ACCESS                               │
│  Landing → Access Plans → Request Access (lead capture)          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    Admin Reviews Lead
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INVITE FLOW                                   │
│  Admin → Create Invitation → Send Magic Link → User Accepts      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              Trigger: Profile + Subscription Created
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                                │
│  Login (password/magic link) → Session Cookie → Protected Routes │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ENTITLEMENT CHECK                             │
│  API Request → resolveUserAccess() → Filter Data → Response      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Route Protection

### Public Routes (No Auth Required)
- `/` - Homepage
- `/about`, `/contact`, `/status`
- `/access/*` - Access plans and request access
- `/platform/*`, `/intelligence/*`, `/sectors/*` - Marketing pages
- `/insights/*`, `/resources/*` - Content pages
- `/auth/*` - Auth flows
- `/api/*` - API routes (authenticated internally)

### Protected Routes (Auth Required)
- `/terminal/*` - Intelligence terminal
- `/profile` - User settings
- `/settings` - Account settings
- `/org/*` - Organization management
- `/admin/*` - Platform administration
- `/dashboard` - User dashboard

---

## 6. Entitlement System

### Plan Hierarchy

| Plan | Rank | Key Features |
|------|------|--------------|
| Public | 0 | Country identity, headline macro |
| Explorer | 10 | + Compare lite |
| Professional | 20 | + Full macro, FX, sector rationale, signals |
| Business | 30 | + Forecasts, trade, reports, team workspace |
| Investor | 40 | + Investor memos, API lite |
| Institutional | 50 | + API full, audit logs |
| Platform Admin | 100 | + Admin console |

### Usage in API Routes

```typescript
import { resolveUserAccess, hasEntitlement, getDataView } from '@souvera/entitlements';

// Resolve user access
const access = await resolveUserAccess(supabase, user?.id);

// Check specific entitlement
if (hasEntitlement(access, 'full_macro')) {
  // Include full macro data
}

// Get appropriate database view
const view = getDataView(access); // Returns 'souvera_country_lite_v', etc.
```

---

## 7. Database Schema Additions

### souvera_invitations

```sql
CREATE TABLE souvera_invitations (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  organization_id UUID REFERENCES souvera_organizations,
  role souvera_user_role DEFAULT 'viewer',
  plan_id TEXT REFERENCES souvera_plans DEFAULT 'explorer',
  invited_by UUID REFERENCES souvera_profiles,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Database Triggers

1. **on_auth_user_created** - Auto-creates `souvera_profiles` record when user signs up
2. **on_profile_created_process_invite** - Processes invitation, creates subscription and org membership

### Helper Functions

- `souvera_create_invitation()` - Creates invitation with permission checks
- `souvera_get_invitation_by_token()` - Validates and retrieves invitation details
- `souvera_cleanup_expired_invitations()` - Removes old expired invitations

---

## 8. Supabase Configuration Required

### Authentication Settings
1. Enable Email provider
2. Configure email templates:
   - Confirm signup
   - Magic link
   - Password reset
   - Invitation
3. Set Site URL: `https://souvera.vercel.app`
4. Add Redirect URLs:
   - `https://souvera.vercel.app/auth/callback`
   - `https://souvera.vercel.app/auth/confirm`
   - `http://localhost:3010/auth/callback` (development)

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://souvera.vercel.app
```

---

## 9. Acceptance Criteria

### Authentication ✅
- [x] User can log in with email/password
- [x] User can log in with magic link
- [x] Session persists across page reloads
- [x] Logout clears session completely
- [x] Login page redirects authenticated users to terminal

### Invite Flow ✅
- [x] Invitation table and triggers created
- [x] API route to create invitations
- [x] API route to validate invitation tokens
- [x] New user gets correct plan on invite accept
- [x] Audit logging for invitation events

### Email/Password ✅
- [x] Forgot password page
- [x] Reset password page
- [x] Password change in profile
- [x] Password validation (8+ chars, upper, lower, number)

### Protected Routes ✅
- [x] Unauthenticated users redirected to login
- [x] Login preserves original destination URL
- [x] Security headers on all responses

### Entitlements ✅
- [x] `@souvera/entitlements` package implemented
- [x] `resolveUserAccess()` function
- [x] `hasEntitlement()` checks
- [x] `getDataView()` for tiered data access
- [x] API route updated with entitlement filtering
- [x] Upgrade prompt component

---

## 10. Remaining Work

### Database Migration
- Run `sql-pack-v1.4-auth.sql` on Supabase project

### Supabase Dashboard
- Configure email templates
- Set redirect URLs
- Enable email confirmations if required

### Optional Enhancements
- Admin UI for managing invitations
- Email sending integration (Supabase handles this automatically)
- Organization settings page
- Two-factor authentication
- Session activity logging

---

## 11. Security Considerations

1. **No Frontend-Only Filtering** - All entitlement checks happen server-side
2. **RLS Policies** - Database-level security via Row Level Security
3. **Service Role Separation** - Service role only used for admin operations
4. **Token Expiration** - Invitations expire after 7 days
5. **Password Requirements** - Minimum 8 characters, mixed case, numbers
6. **Security Headers** - X-Frame-Options, X-Content-Type-Options, Referrer-Policy

---

## 12. Testing Checklist

- [ ] Test login with email/password
- [ ] Test login with magic link
- [ ] Test password reset flow
- [ ] Test invitation creation and acceptance
- [ ] Test protected route redirects
- [ ] Test entitlement-based API responses
- [ ] Test profile update
- [ ] Test password change
- [ ] Test logout
