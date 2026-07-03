# Pre–Phase 2.5 Redirect Audit

**Generated:** 2026-07-03T22:10:36.660Z

## Summary

| Check | Count |
|-------|-------|
| Critical legacy patterns | 0 |
| Warnings | 0 |
| Unresolved static paths (informational) | 53 |
| App routes indexed | 119 |
| next.config redirect sources | 52 |

## Critical findings

None.

## Unresolved static paths (may be dynamic CMS or external)

- `/signup` in `apps/api-gateway/src/app/(auth)/login/page.tsx`
- `/login` in `apps/api-gateway/src/app/(auth)/register/page.tsx`
- `/login` in `apps/api-gateway/src/app/(auth)/signup/check-email/page.tsx`
- `/login` in `apps/api-gateway/src/app/(auth)/signup/page.tsx`
- `/signup/check-email` in `apps/api-gateway/src/app/(auth)/signup/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/billing/invoices/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/billing/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/billing/subscriptions/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/layout.tsx`
- `/login` in `apps/api-gateway/src/app/admin/marketing/banners/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/marketing/feature-flags/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/marketing/hero-slides/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/marketing/logos/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/marketing/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/marketing/pricing/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/matrix/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/notifications/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/stats/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/system/audit/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/system/config/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/system/flags/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/users/logs/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/users/organizations/page.tsx`
- `/login` in `apps/api-gateway/src/app/admin/users/page.tsx`
- `/login` in `apps/api-gateway/src/app/auth/error/page.tsx`
- `/login` in `apps/api-gateway/src/app/auth/forgot-password/page.tsx`
- `/login` in `apps/api-gateway/src/app/dashboard/page.tsx`
- `/signup` in `apps/api-gateway/src/app/intelligence/IntelligenceHub.tsx`
- `/intelligence/trade/cbtpa` in `apps/api-gateway/src/app/intelligence/trade/demand-caribbean/CaribbeanDemandMatrix.tsx`
- `/signup` in `apps/api-gateway/src/app/legal/terms/sections.tsx`
- `/signup` in `apps/api-gateway/src/app/platform/data-foundation/page.tsx`
- `/signup` in `apps/api-gateway/src/app/platform/PlatformHub.tsx`
- `/signup` in `apps/api-gateway/src/app/platform/signal-engine/page.tsx`
- `/login` in `apps/api-gateway/src/app/profile/page.tsx`
- `/admin/settings` in `apps/api-gateway/src/components/admin/AdminHeader.tsx`
- `/login` in `apps/api-gateway/src/components/admin/AdminHeader.tsx`
- `/signup` in `apps/api-gateway/src/components/marketing/traction/StickyConversionBar.tsx`
- `/signup` in `apps/api-gateway/src/components/marketing/traction/TractionConversionCta.tsx`
- `/login` in `apps/api-gateway/src/components/marketing/traction/TractionConversionCta.tsx`

_…and 13 more_

## Manual QA matrix

| Journey | Expected | Status |
|---------|----------|--------|
| Landing hero CTAs | Valid intelligence/platform paths | Pass (CMS normalized via normalizeLegacyHref) |
| /access tier CTAs | Explorer→/signup, Professional/Business/Institutional canonical | Pass (access-plans.ts) |
| Sector pages (×10) | Hero CTAs, key markets, pro-services banner | Pass (SectorOverviewPage wired) |
| Legacy /terminal/map | → /intelligence/map | Pass (redirect rule) |
| Legacy /pricing | → /access | Pass (redirect rule + code fixes) |
| /professional-services | Page loads; CTAs → /contact?intent=professional-services | Pass (route + hub) |
| Auth post-password | → /intelligence | Pass (code fix applied) |

