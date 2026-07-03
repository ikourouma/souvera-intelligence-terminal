# Supabase Explorer Signup — Ops Checklist

**Purpose:** Verify Supabase Auth settings before enabling public self-serve Explorer signup at `/signup`.  
**Related:** `apps/api-gateway/src/app/(auth)/signup/page.tsx`, `auth/confirm/route.ts`

## Required (before production launch)

- [ ] **Enable email confirmations** — Supabase Dashboard → Authentication → Providers → Email → "Confirm email" enabled.
- [ ] **Site URL** — Set to production origin (e.g. `https://souvera.com` or staging URL).
- [ ] **Redirect URLs** — Allow-list includes:
  - `https://<domain>/auth/confirm`
  - `https://<domain>/auth/callback`
  - `http://localhost:3000/auth/confirm` (local dev)
  - `http://localhost:3000/auth/callback` (local dev)
- [ ] **Confirm signup email template** — Branded subject/body (Afronovation, Inc. / Souvera); link uses `{{ .ConfirmationURL }}` or PKCE flow as configured.
- [ ] **DB triggers applied** — `handle_new_user` + `process_invitation_on_signup` from `infra/supabase/sql-pack-v1.4-auth.sql` and v1.8 duplicate fix.

## Recommended

- [ ] **Rate limiting** — Review Supabase Auth rate limits for signup endpoint abuse.
- [ ] **CAPTCHA** — Enable hCaptcha/Turnstile in Supabase Auth if bot signups appear.
- [ ] **Email deliverability** — Custom SMTP or verified sender domain for production (not default Supabase mail for high volume).

## Post-deploy smoke (manual)

1. Open `/login` → click **Create free account** → lands on `/signup`.
2. Submit signup with a throwaway email → redirect to `/signup/check-email`.
3. Click confirmation link in email → lands on `/auth/confirm` → redirects to `/intelligence/map` logged in.
4. Verify in Supabase / SQL:
   - `souvera_profiles` row for user email
   - `souvera_subscriptions` with `plan_id = 'explorer'`, `status = 'active'`
5. Call `GET /api/v1/me` while logged in — plan should be `explorer`.

## Automated pre-check

```bash
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/smoke-explorer-signup-flow.ts
```
