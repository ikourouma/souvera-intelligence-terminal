# Souvera Admin Panel Features Guide

Quick reference for locating and using admin panel features.

## Access Requirements

- **Platform Admin**: Access to Data Management and Content sections
- **Super Admin**: Full access to all admin features including User Management, Billing, Marketing CMS, Access Control, and System settings

---

## Analytics

### Dashboard
- **Location**: `/admin`
- **Access**: All admins
- **Features**: Platform overview, key metrics, recent activity

### Platform Stats
- **Location**: `/admin/stats`
- **Access**: All admins
- **Features**: Detailed analytics (Coming Soon - Phase 5)

---

## Data Management

### Data Sources
- **Location**: `/admin/data/sources`
- **Access**: All admins
- **Features**: Manage external data source configurations

### Indicators
- **Location**: `/admin/data/indicators`
- **Access**: All admins
- **Features**: Indicator definitions (Coming Soon)

### Upload Data
- **Location**: `/admin/data/upload`
- **Access**: All admins
- **Features**: Manual data upload interface

### Ingestion
- **Location**: `/admin/data/ingestion`
- **Access**: All admins
- **Features**: Batch processing and ingestion jobs

### News Pulse
- **Location**: `/admin/data/news-pulse`
- **Access**: All admins
- **Features**: Automated news monitoring

### Reports
- **Location**: `/admin/data/reports`
- **Access**: All admins
- **Features**: Report generation and queue

### Data Quality
- **Location**: `/admin/data/quality`
- **Access**: All admins
- **Features**: Data quality monitoring

### Crosswalks
- **Location**: `/admin/data/crosswalks`
- **Access**: All admins
- **Features**: 
  - Country code mapping (ISO3 to Census, Comtrade, WDI, IMF)
  - Add new country mappings with autocomplete
  - 70 countries with pre-populated codes
  - **Note**: Requires migration `20260615000001_add_crosswalk_codes_to_countries.sql`

---

## Content Management

### Curated News
- **Location**: `/admin/content/news`
- **Access**: All admins
- **Features**: Manage curated news articles

### Trade Policy
- **Location**: `/admin/content/trade-policy`
- **Access**: All admins
- **Features**: Trade policy content management

---

## User Management (Super Admin Only)

### All Users
- **Location**: `/admin/users`
- **Access**: Super Admin only
- **Features**:
  - View all platform users
  - Search and filter by plan, status
  - User detail view
  - Add new users
  - **Test Users**: Should be visible if provisioned via seed scripts

### Organizations
- **Location**: `/admin/users/organizations`
- **Access**: Super Admin only
- **Features**:
  - List all organizations
  - Create new organizations
  - View organization members
  - Set email domains for auto-join

### Access Logs
- **Location**: `/admin/users/logs`
- **Access**: Super Admin only
- **Status**: Coming Soon (Phase 5)
- **Planned Features**: Login events, page views, API requests, security events

---

## Billing (Super Admin Only)

### Revenue Dashboard
- **Location**: `/admin/billing`
- **Access**: Super Admin only
- **Features**: Revenue overview and metrics

### Subscriptions
- **Location**: `/admin/billing/subscriptions`
- **Access**: Super Admin only
- **Features**: Manage user subscriptions

### Invoices
- **Location**: `/admin/billing/invoices`
- **Access**: Super Admin only
- **Features**: Manual invoice management, tracking

---

## Marketing CMS (Super Admin Only)

### CMS Dashboard
- **Location**: `/admin/marketing`
- **Access**: Super Admin only
- **Features**: Marketing content overview

### Hero Slides
- **Location**: `/admin/marketing/hero-slides`
- **Access**: Super Admin only
- **Features**:
  - Create/edit homepage carousel slides
  - **Ticker Items Builder**:
    - Country dropdown (29 common countries)
    - Direction selector (Up ▲ / Down ▼)
    - Percentage input
    - Live preview before adding
  - Manual entry mode for custom text
  - Slide preview before publishing

### Flash Banners
- **Location**: `/admin/marketing/banners`
- **Access**: Super Admin only
- **Features**: Site-wide announcement banners

### Pricing Display
- **Location**: `/admin/marketing/pricing`
- **Access**: Super Admin only
- **Features**:
  - Edit pricing plan display
  - Create new pricing tiers
  - Toggle visibility and featured status

### Trust Logos
- **Location**: `/admin/marketing/logos`
- **Access**: Super Admin only
- **Features**: Partner/trust logo management

### Feature Flags (Marketing)
- **Location**: `/admin/marketing/feature-flags`
- **Access**: Super Admin only
- **Features**: Marketing-specific feature flags

---

## Access Control (Super Admin Only)

### Matrix Management
- **Location**: `/admin/matrix`
- **Access**: Super Admin only
- **Features**: Entitlement matrix overview

### Plans
- **Location**: `/admin/matrix/plans`
- **Access**: Super Admin only
- **Features**: Plan tier management

---

## System (Super Admin Only)

### Configuration
- **Location**: `/admin/system/config`
- **Access**: Super Admin only
- **Features**:
  - View runtime environment info
  - System health status (Database, API, Auth)
  - Node.js and Next.js versions
  - Supabase project info (non-sensitive)

### Feature Flags
- **Location**: `/admin/system/flags`
- **Access**: Super Admin only
- **Features**:
  - Create new feature flags
  - Toggle flag enabled/disabled
  - Set scope (global, tier, user)
  - Tier restrictions

### Audit Logs
- **Location**: `/admin/system/audit`
- **Access**: Super Admin only
- **Features**:
  - View all data changes
  - Filter by action (create, update, delete)
  - Filter by table
  - Search by record ID or user
  - Export to CSV
  - View old/new values for each change

---

## Test User Provisioning

If test users are not visible in User Management, run the provisioning scripts:

```bash
# Provision user tiers (Explorer through Institutional)
npx tsx scripts/seed-test-users.ts

# Provision platform admin
npx tsx scripts/seed-platform-admin.ts

# Provision super admin
npx tsx scripts/seed-super-admin.ts
```

Test user credentials are documented in `docs/qa/test-users-reference.md`.

---

## Troubleshooting

### 404 Errors
If a page returns 404:
1. Verify the route exists in `apps/api-gateway/src/app/admin/`
2. Check admin sidebar links in `AdminSidebar.tsx`
3. Ensure you have the required access level (Super Admin vs Platform Admin)

### Database Migrations
Some features require database migrations to be applied:

```bash
# Apply crosswalk codes migration
# Run in Supabase SQL Editor:
infra/supabase/migrations/20260615000001_add_crosswalk_codes_to_countries.sql
```

### API Errors
Check browser console and server logs for detailed error messages. Most admin APIs require:
- Valid authentication
- Super Admin role for sensitive operations
- Service role key configured for backend operations
