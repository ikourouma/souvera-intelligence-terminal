# Authenticated UX & Login Flow Review

**Date:** May 1, 2026  
**Auditor:** Souvera Engineering  
**Status:** 🔴 Critical UX Gaps Identified  
**Severity:** High — Poor Authenticated Experience  

---

## Executive Summary

The Souvera Intelligence Terminal has a **functional authentication system** (users can successfully log in), but the **authenticated user experience is severely lacking**. After successful login, users:

1. ❌ Are redirected to a **non-existent route** (`/terminal`)
2. ❌ Cannot tell they are logged in (no user info in top nav)
3. ❌ Cannot easily log out (logout hidden in `/profile`)
4. ❌ Cannot access their profile (no link in nav)
5. ❌ Cannot see their access tier (Explorer, Professional, etc.)

### Critical Findings

| Issue | Impact | Severity |
|-------|--------|----------|
| **Default redirect to `/terminal` (404)** | Users land on broken page after login | 🔴 Critical |
| **Nav never checks auth state** | Users can't tell if they're logged in | 🔴 Critical |
| **No logout in nav** | Users can't easily switch accounts for testing | 🔴 Critical |
| **No user/tier display** | Users can't see their access level | 🟠 High |
| **No profile link in nav** | Users can't find account settings | 🟠 High |

### Impact on Phase 2 QA

This blocks effective Phase 2 QA because:
- Testers cannot easily switch between Explorer, Professional, Business, and Institutional accounts
- Testers cannot verify tier-based access is working without logout/re-login
- User experience feels broken (404 after login)

---

## Current Login Success Behavior

### File: `apps/api-gateway/src/app/(auth)/login/page.tsx`

#### Password Login Flow

```typescript
const redirectTo = searchParams.get('redirect') || '/terminal'; // Line 16

const handlePasswordLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus('loading');
  setErrorMessage('');

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setStatus('error');
    setErrorMessage(error.message);
    return;
  }

  setStatus('success');
  router.push(redirectTo);    // Line 44 - Redirects to /terminal
  router.refresh();
};
```

#### Current Behavior Analysis

| Aspect | Current Implementation | Issue |
|--------|----------------------|-------|
| **Default Redirect** | `/terminal` | ❌ **Route does NOT exist** |
| **Success Message** | None for password login | ⚠️ No feedback to user |
| **Success State** | `setStatus('success')` then immediate redirect | ⚠️ User never sees success state |
| **Loading State** | "Authorizing..." with spinner | ✅ Good |
| **Error State** | Red banner with error message | ✅ Good |
| **Redirect Parameter** | Supports `?redirect=` query param | ✅ Good design |
| **Client-Side** | Uses `createClient()` from `@/lib/supabase/client` | ✅ Correct |

#### Magic Link Login Flow

| Aspect | Current Implementation | Issue |
|--------|----------------------|-------|
| **Email Redirect** | `/auth/callback?next=${redirectTo}` | ⚠️ Callback also defaults to `/terminal` |
| **Success Message** | "Check your email" banner | ✅ Good UX |
| **User Feedback** | Clear instructions with email address | ✅ Excellent |

---

## Current Auth Callback Behavior

### File: `apps/api-gateway/src/app/auth/callback/route.ts`

```typescript
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/terminal'; // Line 7

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      let redirectPath = next;
      
      // Special handling for invitations
      if (invitationToken) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !user.user_metadata?.password_set) {
          redirectPath = '/auth/set-password';
        }
      }

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?message=auth_callback_error`);
}
```

**Analysis:**
- ✅ Correctly handles OAuth code exchange
- ✅ Preserves redirect intent via `next` parameter
- ✅ Special handling for invitation flow
- ❌ **Defaults to `/terminal` if no `next` parameter** (line 7)

### File: `apps/api-gateway/src/app/auth/confirm/route.ts`

```typescript
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/terminal'; // Line 9

  if (token_hash && type) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?message=verification_failed`);
}
```

**Analysis:**
- ✅ Correctly handles email OTP verification
- ✅ Preserves redirect intent
- ❌ **Defaults to `/terminal` if no `next` parameter** (line 9)

---

## Current Top Nav Auth Behavior

### File: `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx`

#### Critical Finding: No Authentication State Check

**Lines 1-399:** The entire component **never checks authentication state**.

```typescript
export function SouveraMegaNav() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  // ... navigation state only, NO auth state
```

#### Current Right-Side CTAs (Lines 242-267)

```typescript
<div className="flex items-center gap-4 relative z-20">
  <Link
    href="/intelligence/map"
    className="hidden md:flex items-center gap-2 text-[13px] font-semibold text-zinc-300 hover:text-white transition-colors"
  >
    Access Terminal
  </Link>
  <Link
    href="/login"
    className="hidden sm:flex items-center gap-2 text-[12px] font-bold tracking-widest uppercase px-5 py-2.5 transition-all"
    style={{ background: '#2563EB', color: 'white' }}
  >
    <span>Sign In</span>
    <ArrowRight className="w-3.5 h-3.5" />
  </Link>
  <button onClick={() => setMobileOpen(!mobileOpen)}>
    {/* Mobile menu toggle */}
  </button>
</div>
```

#### Analysis

| Element | Current Behavior | Should Show |
|---------|------------------|-------------|
| **"Access Terminal" Link** | Always visible | Same (public access) |
| **"Sign In" Button** | Always visible | Conditional: hide if authenticated |
| **Account Menu** | ❌ Does not exist | Show if authenticated |
| **User Display** | ❌ None | Name/email/initials if authenticated |
| **Tier Badge** | ❌ None | Explorer/Professional/etc. if authenticated |
| **Logout** | ❌ None | Include in account dropdown |

#### Why This is a Problem

1. **User cannot tell they are logged in** — Nav looks identical before/after login
2. **No way to access profile** — No discoverable path to `/profile`
3. **No way to log out** — User must guess to navigate to `/profile`
4. **Cannot see access tier** — User doesn't know if they're Explorer or Professional
5. **Poor UX for testing** — QA testers cannot easily switch accounts

---

## Current Logout Behavior

### Logout Implementation Audit

| Location | Logout Available? | Accessibility |
|----------|-------------------|---------------|
| `SouveraMegaNav` | ❌ No | N/A |
| `SouveraFooter` | ❌ No | N/A |
| `/profile` page | ✅ Yes | Hidden (no nav link) |
| Other pages | ❌ No | N/A |

### Profile Page Logout (Lines 182-185, 211-217)

```typescript
const handleSignOut = async () => {
  await supabase.auth.signOut();
  router.push('/login');
};

// In JSX:
<button
  onClick={handleSignOut}
  className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors"
>
  <LogOut className="w-4 h-4" />
  Sign Out
</button>
```

**Analysis:**
- ✅ Logout correctly calls `supabase.auth.signOut()`
- ✅ Redirects to `/login` after logout
- ✅ Uses appropriate icon and styling
- ❌ **Not discoverable** — requires user to know `/profile` exists

#### Impact

**For QA Testing:**
- Tester logs in as `explorer@afronovation.com`
- Wants to test `professional@afronovation.com`
- **Cannot find logout button**
- Must manually navigate to `/profile` or clear cookies

**User Journey Fail:**
1. User logs in successfully
2. Lands on `/intelligence/map` (or 404 if `/terminal`)
3. Looks for account/profile in nav → not found
4. Looks for logout → not found
5. Feels confused, possibly closes tab or clears cookies manually

---

## Current Profile Page Behavior

### File: `apps/api-gateway/src/app/profile/page.tsx`

#### Implementation Quality: ✅ Excellent

The profile page is **well-implemented** with comprehensive features:

| Feature | Status | Notes |
|---------|--------|-------|
| **Auth Guard** | ✅ | Redirects to `/login` if not authenticated (lines 56-59) |
| **User Profile Display** | ✅ | Shows email, name, title, organization |
| **Current Plan Display** | ✅ | Shows plan (Explorer, Professional, etc.) with status (lines 195-197, 223-247) |
| **Profile Editing** | ✅ | Update name, title, organization (lines 95-117, 249-346) |
| **Password Change** | ✅ | Secure password update with validation (lines 119-180, 348-454) |
| **Sign Out Button** | ✅ | Clear logout with redirect (lines 182-185, 211-217) |
| **Success/Error States** | ✅ | Toast messages for actions |
| **Loading States** | ✅ | Spinner while loading/saving |
| **Back Navigation** | ✅ | Link to `/terminal` (line 204-210) |

#### Current Plan Display (Lines 223-247)

```typescript
<div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-6 mb-8">
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 bg-blue-500/10 rounded-sm">
      <CreditCard className="w-5 h-5 text-blue-400" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-white">Current Plan</h2>
      <p className="text-zinc-400 text-sm">Manage your subscription</p>
    </div>
  </div>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-white font-medium">{planDisplayName}</p>
      <p className="text-zinc-500 text-sm capitalize">
        Status: {subscription?.status || 'active'}
      </p>
    </div>
    <Link href="/access" className="...">
      Manage Plan
    </Link>
  </div>
</div>
```

**Analysis:**
- ✅ Fetches subscription from `souvera_subscriptions` table
- ✅ Displays plan name (capitalized: Explorer, Professional, Business, Institutional)
- ✅ Shows subscription status
- ✅ Links to `/access` for plan management
- ✅ Professional UI/UX

#### The Problem

Despite the excellent profile page, **users can't find it** because:
1. No link in top nav
2. No account menu or dropdown
3. No breadcrumb or hint that it exists

---

## Root Causes

### Root Cause 1: `/terminal` Route Does Not Exist

**File:** `apps/api-gateway/src/app/` directory structure

**Fact:** There is **no** `/terminal/page.tsx` file.

**Existing Routes:**
- ✅ `/terminal/map/page.tsx` — exists
- ✅ `/terminal/caribbean/page.tsx` — exists
- ❌ `/terminal/page.tsx` — **does NOT exist**

**Why `/terminal` Was Chosen:**

Likely historical reasons or placeholder. The codebase has:
- `/platform/terminal/page.tsx` — marketing page about the terminal
- `/terminal/map` and `/terminal/caribbean` — actual terminal routes
- But no `/terminal` landing page

**Impact:**
- User logs in → redirects to `/terminal`
- `/terminal` returns 404 or falls back to 404 handler
- User experience is broken immediately after successful login

**Fix:**
- Change default redirect to `/intelligence/map` (main product workspace)
- Or create a `/terminal` landing page (but this is more work)

---

### Root Cause 2: `SouveraMegaNav` Never Checks Auth State

**File:** `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx`

**Fact:** The component is marked `'use client'` (line 1) but **never calls any auth functions**.

**What's Missing:**

```typescript
// This DOES NOT exist in the current component:
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const supabase = createClient();
  
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    setLoading(false);
  });

  // Listen for auth changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);
```

**Why This Matters:**

Without checking auth state:
1. Nav cannot conditionally render "Sign In" vs "Account Menu"
2. Nav cannot display user name/email/tier
3. Nav cannot show logout option
4. User has no visual feedback that they're authenticated

---

### Root Cause 3: No Account Menu Component

**Files Checked:**
- ✅ `SouveraMegaNav.tsx` — no account menu
- ✅ `SouveraFooter.tsx` — no account menu
- ❌ No standalone `AccountMenu.tsx` or `UserDropdown.tsx` component exists

**What's Needed:**

An account dropdown component with:
- User info (name/email)
- Access tier badge (Explorer, Professional, etc.)
- Link to `/profile`
- Link to `/access` (manage plan)
- Logout button

**Reference Implementation:**

Many SaaS apps follow this pattern:
- Authenticated: Show avatar/initials in top-right corner
- Click avatar → dropdown with account options
- Prominent logout button in dropdown

---

### Root Cause 4: No Protected Route Middleware

**File:** `apps/api-gateway/src/lib/supabase/middleware.ts`

**Current Implementation:**

```typescript
export async function updateSession(request: NextRequest) {
  // ... creates supabase client ...
  const { data: { user } } = await supabase.auth.getUser();
  return { supabaseResponse, user };
}
```

**Analysis:**
- ✅ Utility function exists to check auth
- ❌ **Not actually used as Next.js middleware**
- ❌ No `middleware.ts` in `apps/api-gateway/src/` root
- ❌ No automatic session refresh
- ❌ No protected route enforcement

**Impact:**
- Session tokens can expire without refresh
- No automatic redirect to login for protected pages
- Each page must manually check auth (like `/profile` does)

**Note:** This is less critical than the nav/logout issues but should be addressed in the future.

---

## Recommended Immediate Fixes

### Priority Order

| Priority | Fix | Impact | Complexity |
|----------|-----|--------|------------|
| 🔴 **P0** | Change redirect from `/terminal` to `/intelligence/map` | Fixes 404 after login | Low (3 files) |
| 🔴 **P0** | Add auth state check to `SouveraMegaNav` | Makes login visible | Medium |
| 🔴 **P0** | Create account dropdown menu | Enables logout | Medium |
| 🟠 **P1** | Add user tier display in dropdown | Shows access level | Low |
| 🟡 **P2** | Add success toast for password login | Better UX feedback | Low |
| 🟡 **P2** | Create real `/terminal` landing page | Future-proof | High |

---

### Fix 1: Change Default Redirect to `/intelligence/map`

#### Files to Change (3)

**1. `apps/api-gateway/src/app/(auth)/login/page.tsx`**

```typescript
// Line 16
// OLD:
const redirectTo = searchParams.get('redirect') || '/terminal';

// NEW:
const redirectTo = searchParams.get('redirect') || '/intelligence/map';
```

**2. `apps/api-gateway/src/app/auth/callback/route.ts`**

```typescript
// Line 7
// OLD:
const next = searchParams.get('next') ?? '/terminal';

// NEW:
const next = searchParams.get('next') ?? '/intelligence/map';
```

**3. `apps/api-gateway/src/app/auth/confirm/route.ts`**

```typescript
// Line 9
// OLD:
const next = searchParams.get('next') ?? '/terminal';

// NEW:
const next = searchParams.get('next') ?? '/intelligence/map';
```

**4. `apps/api-gateway/src/app/profile/page.tsx`**

```typescript
// Line 205 (Back button)
// OLD:
<Link href="/terminal" className="...">

// NEW:
<Link href="/intelligence/map" className="...">
```

**Rationale:**
- `/intelligence/map` is the flagship product workspace
- Already implemented and stable (Phase 1 complete)
- Users see value immediately (map + country intelligence)
- Can explore without further navigation

---

### Fix 2: Add Auth State Check to `SouveraMegaNav`

#### Implementation

**File:** `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx`

**Add at top of component:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function SouveraMegaNav() {
  // ... existing state ...
  
  // NEW: Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const supabase = createClient();

  // NEW: Check auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // ... rest of component ...
}
```

**Conditional Render in Right CTAs:**

```typescript
<div className="flex items-center gap-4 relative z-20">
  <Link href="/intelligence/map" className="...">
    Access Terminal
  </Link>
  
  {/* NEW: Conditional rendering based on auth state */}
  {authLoading ? (
    <div className="w-20 h-10 bg-zinc-800/50 animate-pulse rounded-sm" />
  ) : user ? (
    <AccountMenu user={user} />
  ) : (
    <Link href="/login" className="...">
      <span>Sign In</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  )}
  
  <button onClick={() => setMobileOpen(!mobileOpen)}>
    {/* Mobile menu toggle */}
  </button>
</div>
```

---

### Fix 3: Create Account Dropdown Component

#### New File: `apps/api-gateway/src/components/ui/AccountMenu.tsx`

```typescript
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, CreditCard, LogOut, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AccountMenuProps {
  user: SupabaseUser;
}

export function AccountMenu({ user }: AccountMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [plan, setPlan] = useState<string>('Explorer');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch user plan
  useEffect(() => {
    async function fetchPlan() {
      const { data } = await supabase
        .from('souvera_subscriptions')
        .select('plan_id')
        .eq('user_id', user.id)
        .in('status', ['trial', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.plan_id) {
        const displayName = data.plan_id.charAt(0).toUpperCase() + data.plan_id.slice(1);
        setPlan(displayName);
      }
    }
    fetchPlan();
  }, [user.id, supabase]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Get user initials
  const email = user.email || '';
  const initials = email.substring(0, 2).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-sm transition-all hover:bg-zinc-800/50"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        {/* Email (hidden on mobile) */}
        <span className="hidden md:block text-sm text-zinc-300 max-w-[120px] truncate">
          {email}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-sm shadow-2xl overflow-hidden z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm text-white font-medium truncate">{email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 font-medium">
                {plan}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              Account Settings
            </Link>
            <Link
              href="/access"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Manage Plan
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-zinc-800 py-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Fix 4: Add User Tier Display

**Already included in `AccountMenu` component above** (see line with `{plan}` badge).

---

### Fix 5: Add Success Toast (Optional)

#### Implementation

**File:** `apps/api-gateway/src/app/(auth)/login/page.tsx`

**Option A: Simple inline message (no toast library required)**

```typescript
// In handlePasswordLogin, after success:
setStatus('success');
// NEW: Show brief success message before redirect
setTimeout(() => {
  router.push(redirectTo);
  router.refresh();
}, 800); // Brief delay to show success state
```

```tsx
{/* Add success banner after error banner */}
{status === 'success' && (
  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-sm mb-6">
    <div className="flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
      <div>
        <h3 className="text-white font-semibold mb-1">Login Successful</h3>
        <p className="text-zinc-400 text-sm">Redirecting to terminal...</p>
      </div>
    </div>
  </div>
)}
```

**Option B: Use existing success pattern for magic link**

No additional changes needed — just rely on the redirect being fast enough.

---

## Recommended Future Dashboard Strategy

### Current State

**No `/terminal` or `/dashboard` route exists.**

Available routes:
- `/intelligence/map` — Main workspace (Phase 1 complete)
- `/intelligence/africa` — Africa command center (Phase 2 complete)
- `/intelligence/caribbean` — Caribbean command center (skeleton)
- `/intelligence/compare` — Country comparison tool
- `/profile` — Account settings
- `/access` — Plans and pricing

### Interim Strategy (Immediate)

**Redirect authenticated users to `/intelligence/map`**

**Rationale:**
1. Already implemented and stable
2. Shows immediate value (interactive map + country intelligence)
3. Demonstrates tier-based access (FDI lock/unlock, sector limits)
4. Users can explore without further navigation
5. Aligns with "Intelligence Terminal" branding

### Future Dashboard Strategy

**When to Build `/terminal` or `/dashboard`:**

Build a dedicated authenticated landing page when you need:
1. **Personalized recommendations** based on user's industry/interests
2. **Recent activity** (recently viewed countries, saved reports)
3. **Quick actions** (bookmarks, saved comparisons, alerts)
4. **Onboarding flow** for new users
5. **Usage analytics** (API calls remaining, report downloads)
6. **Notifications** (new reports, data updates, plan changes)

**What it Should Contain:**

```
┌─────────────────────────────────────────────────────┐
│ Welcome back, [Name] · [Plan Badge]                │
├─────────────────────────────────────────────────────┤
│ Quick Actions                                       │
│ [Intelligence Map] [Compare] [Reports] [Profile]   │
├─────────────────────────────────────────────────────┤
│ Recently Viewed Countries                           │
│ [Nigeria] [South Africa] [Kenya]                   │
├─────────────────────────────────────────────────────┤
│ Saved Comparisons                                   │
│ [Nigeria vs Ghana] [SA vs Egypt]                   │
├─────────────────────────────────────────────────────┤
│ Latest Insights (if Professional+)                 │
│ [Briefing] [Report] [Update]                       │
├─────────────────────────────────────────────────────┤
│ Your Plan                                           │
│ Professional · Active · Manage Plan                │
└─────────────────────────────────────────────────────┘
```

**Timeline:**

- **Now → Phase 3:** Use `/intelligence/map` as post-login destination
- **Phase 4-5:** Consider building dashboard if usage patterns indicate need
- **Phase 6+:** Add personalized recommendations, saved searches, etc.

**Do NOT build dashboard prematurely:**
- Avoid creating a placeholder/empty dashboard just to have one
- Wait until there's genuine value to show (bookmarks, history, alerts)
- Users are better served going directly to `/intelligence/map` than landing on an empty dashboard

---

## Proposed Route Behavior Table

### Authentication Routes

| Route | Purpose | Success Redirect | Failure Redirect |
|-------|---------|------------------|------------------|
| `/login` | Email/password or magic link | `/intelligence/map` (or `?redirect` param) | Same page (show error) |
| `/register` | New user signup | `/intelligence/map` | Same page (show error) |
| `/auth/callback` | OAuth/magic link callback | `/intelligence/map` (or `?next` param) | `/auth/error` |
| `/auth/confirm` | Email confirmation | `/intelligence/map` (or `?next` param) | `/auth/error` |
| `/auth/forgot-password` | Password reset request | Same page (show success) | Same page (show error) |
| `/auth/reset-password` | Password reset form | `/login` (with success message) | Same page (show error) |
| `/auth/set-password` | Set password (invitations) | `/intelligence/map` | `/auth/error` |

### Protected Routes

| Route | Auth Required? | Redirect if Not Auth | Notes |
|-------|----------------|---------------------|-------|
| `/profile` | ✅ Yes | `/login?redirect=/profile` | Manually enforced (lines 56-59) |
| `/intelligence/map` | ❌ No | N/A | Public access with tier-based features |
| `/intelligence/africa` | ❌ No | N/A | Public access with tier-based features |
| `/intelligence/compare` | ❌ No | N/A | Public access with tier-based features |
| `/access` | ❌ No | N/A | Marketing/pricing page |

**Current Behavior:** Most intelligence pages are **public with tier-based features**
- Public/Explorer: Limited data, locked FDI, 1 sector
- Professional+: Full data, visible FDI, up to 5 sectors

**Future Consideration:** Should some routes require authentication?
- Likely no — keep intelligence pages public with upgrade prompts
- Enables freemium model and SEO benefits

---

## Proposed Authenticated Nav / Account Menu Behavior

### Desktop Nav (> 1024px)

#### Unauthenticated State

```
┌────────────────────────────────────────────────────────────┐
│ [SOUVERA] [Platform▾] [Intelligence▾] ... [Sign In →]     │
└────────────────────────────────────────────────────────────┘
```

#### Authenticated State

```
┌────────────────────────────────────────────────────────────┐
│ [SOUVERA] [Platform▾] [Intelligence▾] ... [[AB] user@...]▾│
│                                            └─ Dropdown     │
└────────────────────────────────────────────────────────────┘

Dropdown when clicked:
┌────────────────────────┐
│ user@company.com       │
│ [Professional Badge]   │
├────────────────────────┤
│ 👤 Account Settings    │
│ 💳 Manage Plan         │
├────────────────────────┤
│ 🚪 Sign Out            │
└────────────────────────┘
```

### Mobile Nav (< 1024px)

#### Unauthenticated State

```
┌────────────────────────────┐
│ [SOUVERA]         [≡]     │
└────────────────────────────┘

When menu opened:
┌────────────────────────────┐
│ [Platform▾]                │
│ [Intelligence▾]            │
│ ...                        │
│ [Access Terminal →]        │
│ [Sign In →]                │
└────────────────────────────┘
```

#### Authenticated State

```
┌────────────────────────────┐
│ [SOUVERA]    [AB] [≡]     │
└────────────────────────────┘

When menu opened:
┌────────────────────────────┐
│ user@company.com           │
│ [Professional]             │
├────────────────────────────┤
│ [Platform▾]                │
│ [Intelligence▾]            │
│ ...                        │
│ [Account Settings]         │
│ [Manage Plan]              │
│ [Sign Out]                 │
└────────────────────────────┘
```

### Account Dropdown Specifications

#### Trigger Button

- **Avatar:** Circle with 2-letter initials (e.g., "JD" for john.doe@example.com)
- **Email:** Truncated to ~15 chars on desktop, hidden on mobile
- **Badge:** Plan name (Explorer, Professional, Business, Institutional)
- **Icon:** ChevronDown (rotates 180° when open)

#### Dropdown Content

**Section 1: User Info (Non-clickable)**
- Email (full, no truncation)
- Plan badge (colored: blue for all, or tier-specific colors)

**Section 2: Account Actions**
- "Account Settings" → `/profile`
- "Manage Plan" → `/access`

**Section 3: Logout**
- "Sign Out" (red hover state)

#### Dropdown Behavior

- **Opens:** On click
- **Closes:** On outside click, on link click, or on pressing Escape
- **Z-index:** Above nav (z-50 or z-[100])
- **Position:** Right-aligned to trigger button
- **Animation:** Fade in (opacity 0 → 1, y: -8 → 0) over 200ms

---

## Files That Need Changes

### High Priority (P0) — Login UX Fixes

| File | Change | Lines | Complexity |
|------|--------|-------|------------|
| `apps/api-gateway/src/app/(auth)/login/page.tsx` | Change redirect `/terminal` → `/intelligence/map` | 16 | Low |
| `apps/api-gateway/src/app/auth/callback/route.ts` | Change redirect `/terminal` → `/intelligence/map` | 7 | Low |
| `apps/api-gateway/src/app/auth/confirm/route.ts` | Change redirect `/terminal` → `/intelligence/map` | 9 | Low |
| `apps/api-gateway/src/app/profile/page.tsx` | Change back link `/terminal` → `/intelligence/map` | 205 | Low |
| `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx` | Add auth state check + conditional render | Multiple | Medium |
| **NEW:** `apps/api-gateway/src/components/ui/AccountMenu.tsx` | Create account dropdown component | N/A | Medium |

### Medium Priority (P1) — Enhanced UX

| File | Change | Complexity |
|------|--------|------------|
| `apps/api-gateway/src/app/(auth)/login/page.tsx` | Add success banner (optional) | Low |

### Low Priority (P2) — Future Enhancements

| File | Change | Complexity |
|------|--------|------------|
| **NEW:** `apps/api-gateway/src/app/terminal/page.tsx` | Create dashboard landing page | High |
| **NEW:** `apps/api-gateway/src/middleware.ts` | Add session refresh middleware | Medium |

---

## Risks and Mitigations

### Risk 1: Changing Redirect Breaks Existing Flows

**Risk:** Users or tests may rely on `/terminal` redirect.

**Likelihood:** Low  
**Impact:** Low

**Mitigation:**
- `/terminal` was always broken (404), so no production users rely on it
- Tests that explicitly check redirect can be updated
- `/intelligence/map` is a better UX regardless

**Verification:**
- Grep for hardcoded `/terminal` references in tests
- Update any affected tests

---

### Risk 2: Auth State Check Causes Performance Issues

**Risk:** Checking auth on every page load slows down navigation.

**Likelihood:** Very Low  
**Impact:** Low

**Mitigation:**
- Supabase client caches session in localStorage
- `getSession()` is fast (reads from cache)
- Only nav component checks, not every component
- Can add loading skeleton while checking

**Verification:**
- Monitor page load times before/after
- Check Network tab for extra API calls (should be none)

---

### Risk 3: Account Dropdown Breaks Mobile Nav

**Risk:** Dropdown conflicts with mobile menu or causes layout issues.

**Likelihood:** Low  
**Impact:** Medium

**Mitigation:**
- Test thoroughly on mobile viewports (375px, 390px, 768px)
- Use proper z-index layering
- Ensure dropdown closes on mobile menu open
- Test touch interactions

**Verification:**
- Test on real mobile devices
- Test in Chrome DevTools mobile emulation
- Verify no horizontal overflow
- Verify touch targets are at least 44x44px

---

### Risk 4: Logout Doesn't Clear All State

**Risk:** User logs out but some client state persists.

**Likelihood:** Low  
**Impact:** Medium

**Mitigation:**
- `supabase.auth.signOut()` clears all Supabase state
- `router.push('/login')` navigates away from protected pages
- `router.refresh()` forces server components to re-render
- Consider adding cache clearing if issues arise

**Verification:**
- Test logout flow thoroughly
- Verify session is cleared in DevTools → Application → Cookies
- Verify accessing `/profile` after logout redirects to login
- Test logout → login as different user

---

### Risk 5: Fetching Plan in Dropdown Causes Delay

**Risk:** Dropdown shows "Explorer" briefly before correct plan loads.

**Likelihood:** Medium  
**Impact:** Low

**Mitigation:**
- Show loading state (skeleton or spinner) while fetching
- Cache plan in localStorage after first fetch
- Consider passing plan from server component if possible
- Default to "Explorer" as reasonable fallback

**Verification:**
- Test on slow 3G network throttling
- Verify loading state shows appropriately
- Consider adding error handling if fetch fails

---

## Acceptance Criteria

### P0 Fixes (Critical)

#### AC-1: Login Redirects to Valid Route
- [ ] User logs in with email/password → redirects to `/intelligence/map`
- [ ] `/intelligence/map` loads successfully (not 404)
- [ ] Magic link callback redirects to `/intelligence/map`
- [ ] Email confirmation redirects to `/intelligence/map`
- [ ] Redirect parameter still works (`/login?redirect=/profile` → redirects to `/profile`)

#### AC-2: Nav Shows Auth State
- [ ] **Before login:** Nav shows "Sign In" button
- [ ] **After login:** Nav shows account dropdown trigger (avatar + email)
- [ ] **Loading state:** Nav shows skeleton/loading indicator while checking auth
- [ ] **Auth change:** Nav updates when user logs in/out without page refresh

#### AC-3: Account Dropdown Works
- [ ] **Trigger:** Clicking avatar/email opens dropdown
- [ ] **User info:** Dropdown shows full email
- [ ] **Plan badge:** Dropdown shows correct plan (Explorer, Professional, etc.)
- [ ] **Account Settings:** Link navigates to `/profile`
- [ ] **Manage Plan:** Link navigates to `/access`
- [ ] **Sign Out:** Button logs out and redirects to `/login`
- [ ] **Close:** Dropdown closes on outside click
- [ ] **Close:** Dropdown closes when clicking a link

#### AC-4: Profile Page Updated
- [ ] Back button points to `/intelligence/map` (not `/terminal`)
- [ ] Logout button works correctly
- [ ] Page is accessible from nav dropdown

---

### P1 Fixes (High Priority)

#### AC-5: User Can Easily Log Out
- [ ] Logout is discoverable in nav dropdown
- [ ] Logout button has clear label ("Sign Out")
- [ ] Logout icon is recognizable (LogOut icon)
- [ ] Logout has appropriate styling (red on hover)

#### AC-6: User Can See Their Tier
- [ ] Plan badge shows in account dropdown
- [ ] Plan name is capitalized (Explorer, Professional, etc.)
- [ ] Badge has distinct color/styling
- [ ] Badge is visible on both desktop and mobile

#### AC-7: Mobile Nav Works
- [ ] Account dropdown works on mobile
- [ ] No horizontal overflow
- [ ] Touch targets are at least 44x44px
- [ ] Dropdown positioned correctly on small screens
- [ ] Mobile menu and dropdown don't conflict

---

### P2 Fixes (Future)

#### AC-8: Success Feedback (Optional)
- [ ] Password login shows success message briefly before redirect
- [ ] Success message is visually distinct from error
- [ ] Success message doesn't delay redirect excessively (< 1s)

#### AC-9: Protected Routes (Future)
- [ ] Middleware refreshes session automatically
- [ ] Expired sessions redirect to login with return path
- [ ] Protected routes enforce authentication

---

## Verification Steps

### Manual Testing Checklist

#### Test 1: Login Flow
1. Navigate to `/login`
2. Enter test user email and password (e.g., `explorer@afronovation.com`)
3. Click "Authorize Access"
4. **Expected:** Redirect to `/intelligence/map` (not 404)
5. **Expected:** Map loads successfully

#### Test 2: Nav Shows Auth State
1. Before login: **Expected:** Nav shows "Sign In" button
2. After login: **Expected:** Nav shows avatar + email
3. Avatar shows initials (e.g., "EA" for explorer@afronovation.com)

#### Test 3: Account Dropdown
1. Click avatar/email in nav
2. **Expected:** Dropdown opens
3. **Expected:** Shows full email
4. **Expected:** Shows plan badge (Explorer, Professional, etc.)
5. Click "Account Settings" → **Expected:** Navigate to `/profile`
6. Click avatar again to open dropdown
7. Click "Manage Plan" → **Expected:** Navigate to `/access`

#### Test 4: Logout
1. Click avatar in nav
2. Click "Sign Out"
3. **Expected:** Redirect to `/login`
4. **Expected:** Nav shows "Sign In" button again
5. Navigate to `/profile` → **Expected:** Redirect to `/login`

#### Test 5: Multi-Account Testing
1. Log in as `explorer@afronovation.com`
2. Navigate to `/intelligence/map` and select Nigeria
3. **Expected:** FDI locked, 1 sector
4. Click avatar → "Sign Out"
5. Log in as `professional@afronovation.com`
6. Navigate to `/intelligence/map` and select Nigeria
7. **Expected:** FDI visible, up to 5 sectors

#### Test 6: Mobile Responsive
1. Resize browser to mobile width (375px)
2. **Expected:** Avatar visible, email hidden
3. Click avatar → **Expected:** Dropdown opens, positioned correctly
4. **Expected:** No horizontal overflow
5. Click outside dropdown → **Expected:** Dropdown closes

---

## Related Documentation

- [Test User Login Fix Implementation](../qa/test-user-login-fix-implementation.md)
- [Test User Login Verification Checklist](../qa/test-user-login-verification-checklist.md)
- [Phase 2 Implementation Summary](../qa/phase-2-africa-workspace-embedding-implementation.md)
- [Phase 1 QA Gate](./phase-1-map-workspace-qa-gate.md)

---

## Summary Table

### Current State vs Desired State

| Aspect | Current | Desired |
|--------|---------|---------|
| **Login Redirect** | `/terminal` (404) | `/intelligence/map` |
| **Nav Auth Check** | ❌ Never checks | ✅ Checks on mount + listens for changes |
| **User Display** | ❌ None | ✅ Avatar + email in nav |
| **Tier Display** | ❌ None | ✅ Badge in dropdown |
| **Logout** | ❌ Hidden in `/profile` | ✅ In nav dropdown |
| **Profile Link** | ❌ Not in nav | ✅ In dropdown |
| **Account Menu** | ❌ Doesn't exist | ✅ Dropdown with actions |

---

**Audit Date:** May 1, 2026  
**Status:** 🔴 Critical UX gaps identified — Ready for immediate fixes  
**Priority:** High — Blocks effective Phase 2 QA  
**Estimated Fix Time:** 4-6 hours for P0 fixes  

---

**End of Authenticated UX & Login Flow Review**
