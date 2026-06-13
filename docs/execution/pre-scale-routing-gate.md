# Pre-Scale Routing Gate

**Status:** Implemented for NGA/JAM pilot  
**Purpose:** Single source of truth for country terminal and account redirects before scaling to 74 countries.

---

## Decisions

### 1. Manage Plan (account dropdown)

| User state | Destination | Rationale |
|------------|-------------|-----------|
| Logged in | `/profile#subscription` | Profile is the user dashboard; subscription section shows current tier and upgrade CTAs |
| Anonymous | `/access` | Marketing comparison page for prospects |

**Implementation:** `managePlanHref(isAuthenticated)` in `apps/api-gateway/src/lib/intelligence/routing.ts`  
**Wired in:** `AccountMenu.tsx`, profile page "Compare Plans" → `/access?source=profile`

### 2. Map "Explore {Country} Opportunities"

| User state | Destination |
|------------|-------------|
| Authenticated + Explorer+ (`planRank >= 1`) | `/country/{ISO3}` |
| Not logged in or below Explorer | `/access/request-access?country={ISO3}&name=...&source=map-workspace&plan=explorer` |

**Implementation:** `exploreCountryHref()` uses `data.meta.authenticated` + `data.meta.planRank` from `/api/v1/country-lite`.

**Server-side gate:** `/country/[iso3]/page.tsx` redirects unauthorized users via `requestAccessForCountryHref()` — prevents direct URL bypass.

### 3. Centralized helpers

All country CTAs should import from `@/lib/intelligence/routing`:

| Helper | Use case |
|--------|----------|
| `exploreCountryHref()` | Map drawer, regional CTAs with country context |
| `countryTerminalHref(iso3, { tab })` | Deep links to terminal tabs |
| `canAccessCountryTerminal()` | Server/client entitlement checks |
| `managePlanHref()` | Account menu |
| `comparePlansHref(source)` | Upgrade / compare tiers |
| `requestAccessForCountryHref()` | Server redirect when gate fails |
| `loginForCountryHref()` | Post-login return to terminal |

**Test:** `npx tsx scripts/test-country-routing.ts`

---

## Scale checklist (74 countries)

- [ ] Replace any remaining hardcoded `/country/NGA` or `/country/JAM` with `countryTerminalHref(iso3)`
- [ ] Map workspace panel uses `exploreCountryHref()` (done)
- [ ] Country page server gate uses `canAccessCountryTerminal()` (done)
- [ ] country-lite API returns `planRank` in meta (done)
- [ ] Add routing test cases when new tier rules change
- [ ] Grep for `request-access?country=` — ensure only used for unauthenticated / sub-Explorer flows

---

## Intentionally unchanged routes

These remain `/access/request-access` (no country context needed):

- Landing page CTAs, footer, FAQ, generic "Request Full Access" on empty map panel
- Marketing pages, institutional funnel, login page signup link
