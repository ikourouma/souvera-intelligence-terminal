# Souvera Test User Reference

Complete reference for all test user personas, credentials, and provisioning procedures for the Souvera Intelligence Terminal.

## Test User Credentials

### User Personas (6 Tiers)

#### 1. Public Visitor
- **Status**: Not logged in (no credentials)
- **Access**: Browse marketing site, see paywalls
- **Entitlements**: `country_identity`, `headline_macro`, `sector_teasers`, `news_teasers`

#### 2. Explorer
- **Email**: `explorer@afronovation.com`
- **Password**: `PEGWest@1235`
- **Plan ID**: `explorer`
- **Access**: Basic intelligence hub, map, insights
- **Entitlements**: Public + `compare_lite`

#### 3. Professional
- **Email**: `professional@afronovation.com`
- **Password**: `PEGWest@1235`
- **Plan ID**: `professional`
- **Access**: Full macro data, sector analysis, policy trackers
- **Entitlements**: Explorer + `full_macro`, `sector_rationale`, `fx_metrics`

#### 4. Business
- **Email**: `business@afronovation.com`
- **Password**: `PEGWest@1235`
- **Plan ID**: `business`
- **Access**: Full trade intelligence suite, 1 report/month
- **Entitlements**: Professional + `reports_preview`, `trade_data`, `risk_analysis`, `investment_thesis`, `forecast_metrics`

#### 5. Investor
- **Email**: `investor@afronovation.com`
- **Password**: `PEGWest@1235`
- **Plan ID**: `investor`
- **Access**: All Business + Supply-Demand Matrix, 5 reports/month
- **Entitlements**: Same as Business (plan rank: 4)

#### 6. Institutional
- **Email**: `institutional@afronovation.com`
- **Password**: `PEGWest@1235`
- **Plan ID**: `institutional`
- **Access**: Full platform + API + unlimited reports
- **Entitlements**: Business + `api_access`, `export_access`

### Admin Personas (2 Roles)

#### 7. Platform Admin
- **Email**: `admin@souveraterminal.com`
- **Password**: `PEGWest@1235`
- **Plan ID**: `platform_admin`
- **Role**: `platform_admin`
- **Access**: Data & content management (`/admin`)
- **Entitlements**: Institutional + `admin_access`
- **Routes**: 
  - `/admin/data/*` (Sources, Indicators, Upload, Ingestion, News Pulse, Reports Reset, Data Quality, Crosswalks)
  - `/admin/content/*` (Curated News, Trade Policy)

#### 8. Super Admin (Platform Owner)
- **Email**: `admin@afronovation.com`
- **Password**: `PEGWest@1235`
- **Plan ID**: `super_admin`
- **Role**: `super_admin`
- **Access**: Full platform control (`/super-admin`) - **TO BE BUILT**
- **Entitlements**: All platform_admin + `super_admin_access`, `user_management`, `system_configuration`, `marketing_cms`, `billing_management`, `audit_logs`
- **Routes** (Planned):
  - `/super-admin/users` (User management)
  - `/super-admin/billing` (Billing & subscriptions)
  - `/super-admin/marketing` (Marketing site CMS)
  - `/super-admin/system` (System configuration)
  - `/super-admin/analytics` (Platform analytics)
  - `/super-admin/audit` (Audit logs)

## Provisioning Commands

### Prerequisites

Ensure environment variables are set in `.env.local` or `apps/api-gateway/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Run Migrations

Before provisioning, ensure the super admin migration has been applied:

```bash
# Connect to Supabase and run:
# infra/supabase/migrations/20260612000000_add_super_admin_tier.sql
```

### Provision Users

```bash
# Provision user tiers (2-6: Explorer, Professional, Business, Investor, Institutional)
npx tsx scripts/seed-test-users.ts

# Provision platform admin (7)
npx tsx scripts/seed-platform-admin.ts

# Provision super admin (8) - after migration
npx tsx scripts/seed-super-admin.ts
```

## Verification

Run the following SQL queries in Supabase SQL Editor or via `psql`:

### Verify All Test Users

```sql
SELECT 
  u.email,
  p.full_name,
  s.plan_id,
  s.status,
  om.role as org_role,
  o.name as organization
FROM auth.users u
LEFT JOIN souvera_profiles p ON p.id = u.id
LEFT JOIN souvera_subscriptions s ON s.user_id = u.id AND s.status IN ('trial', 'active')
LEFT JOIN souvera_organization_members om ON om.user_id = u.id
LEFT JOIN souvera_organizations o ON o.id = om.organization_id
WHERE u.email LIKE '%@afronovation.com' OR u.email LIKE '%@souveraterminal.com'
ORDER BY s.plan_id;
```

### Verify Entitlements for a Specific User

```sql
SELECT 
  u.email,
  s.plan_id,
  pe.entitlement_key
FROM auth.users u
JOIN souvera_subscriptions s ON s.user_id = u.id AND s.status IN ('trial', 'active')
JOIN souvera_plan_entitlements pe ON pe.plan_id = s.plan_id
WHERE u.email = 'admin@afronovation.com'
ORDER BY pe.entitlement_key;
```

### Verify Plan Ranks

```sql
SELECT 
  id as plan_id,
  name as plan_name,
  rank,
  is_visible
FROM souvera_plans
ORDER BY rank;
```

## Testing Checklist

After provisioning, verify each persona's access:

### User Tiers

- [ ] **Public**: Browse site without login, see paywalls on protected content
- [ ] **Explorer**: Login, view Intelligence Hub, hit paywalls on trade modules
- [ ] **Professional**: Login, access policy trackers, hit paywall on trade flows
- [ ] **Business**: Login, access all trade intelligence, generate 1 report
- [ ] **Investor**: Login, access Supply-Demand Matrix, generate 5 reports
- [ ] **Institutional**: Login, test API access, unlimited exports

### Admin Roles

- [ ] **Platform Admin**: Login, access `/admin`, manage data/content (19 tools)
- [ ] **Super Admin**: Login, access `/super-admin` (after implementation), test user management, marketing CMS, billing controls

## Access Matrix

| Feature | Public | Explorer | Professional | Business | Investor | Institutional | Platform Admin | Super Admin |
|---------|--------|----------|--------------|----------|----------|---------------|----------------|-------------|
| Intelligence Hub Map | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Headline Macro Data | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Full Macro Data | - | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sector Analysis | - | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Policy Trackers | - | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Trade Intelligence | - | - | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Supply-Demand Matrix | - | - | - | - | ✓ | ✓ | ✓ | ✓ |
| Risk Analysis | - | - | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Country Reports | - | - | - | 1/mo | 5/mo | Unlimited | Unlimited | Unlimited |
| API Access | - | - | - | - | - | ✓ | ✓ | ✓ |
| Data Export | - | - | - | - | - | ✓ | ✓ | ✓ |
| Admin Panel (`/admin`) | - | - | - | - | - | - | ✓ | ✓ |
| Super Admin Panel (`/super-admin`) | - | - | - | - | - | - | - | ✓ |
| User Management | - | - | - | - | - | - | - | ✓ |
| Marketing CMS | - | - | - | - | - | - | - | ✓ |
| Billing Management | - | - | - | - | - | - | - | ✓ |
| System Configuration | - | - | - | - | - | - | - | ✓ |
| Audit Logs | - | - | - | - | - | - | - | ✓ |

## Security Notes

### Password Policy

- All test users use the same password: `PEGWest@1235`
- This is for **DEVELOPMENT/QA ONLY**
- DO NOT use these credentials in production or staging
- Rotate passwords for staging/production environments

### Credential Storage

- `scripts/test-users.local.json` is `.gitignore`d
- NEVER commit this file to version control
- Service role keys are required for provisioning
- Admin credentials are for local/dev QA only

### Super Admin Security

- Super Admin has **complete platform control**
- Can provision/deprovision users
- Can manage billing and subscriptions
- Can modify marketing site structure
- Can access all system configuration
- Can view full audit trail
- Use with extreme caution
- Rotate or delete after QA if provisioned outside local dev

## Troubleshooting

### User Already Exists

The scripts handle existing users gracefully:
- Existing users are updated with new password
- Subscriptions are deactivated and recreated
- Organization memberships are upserted

### Subscription Not Active

Check subscription status:

```sql
SELECT user_id, plan_id, status, starts_at, ends_at
FROM souvera_subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@afronovation.com');
```

Manually activate if needed:

```sql
UPDATE souvera_subscriptions
SET status = 'active', ends_at = NULL
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@afronovation.com')
  AND plan_id = 'professional';
```

### Missing Plan or Entitlements

Verify plan exists:

```sql
SELECT * FROM souvera_plans WHERE id = 'investor';
```

Verify entitlements:

```sql
SELECT * FROM souvera_plan_entitlements WHERE plan_id = 'super_admin';
```

If missing, run migration: `20260612000000_add_super_admin_tier.sql`

## Next Steps

After test users are set up:

1. **Week 1: Access Control**
   - Implement paywall enforcement for each tier
   - Add route guards for admin/super admin
   - Test persona-specific restrictions

2. **Week 2: Super Admin Control Panel**
   - Build `/super-admin` routes
   - Implement user management UI
   - Create marketing CMS interface
   - Add billing management tools

3. **Week 3: Persona Dashboards**
   - Create personalized dashboards for each tier
   - Add quick actions and upgrade prompts
   - Implement usage analytics

4. **Week 4: Marketing Site CMS**
   - Database-driven hero slides
   - Configurable flash banners
   - Dynamic pricing tiers
   - Trust logo management

## References

- **Entitlements Package**: `packages/entitlements/index.ts`
- **Platform Admin Script**: `scripts/seed-platform-admin.ts`
- **Super Admin Script**: `scripts/seed-super-admin.ts`
- **Test Users Script**: `scripts/seed-test-users.ts`
- **Verification SQL**: `docs/qa/test-users-verification.sql`
- **Master Plan**: `docs/execution/complete-persona-dashboard-master-plan.md`
