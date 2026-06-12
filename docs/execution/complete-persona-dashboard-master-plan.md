# Souvera Platform: Complete Persona System & Dashboards - Master Plan

**Date**: June 12, 2026  
**Status**: 🔴 COMPREHENSIVE REVIEW & STRATEGIC PLAN  
**Scope**: Platform-wide persona system, dashboard architecture, super admin controls, and enhancement recommendations

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Complete Persona System](#complete-persona-system)
3. [Dashboard Architecture by Persona](#dashboard-architecture-by-persona)
4. [Super Admin Platform Control](#super-admin-platform-control)
5. [Marketing Site Admin Management](#marketing-site-admin-management)
6. [Full Project Analysis](#full-project-analysis)
7. [Strategic Recommendations](#strategic-recommendations)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Critical Findings

1. **🔴 CRITICAL: No Super Admin Role Defined**
   - Current `platform_admin` is for data/content management only
   - No platform owner/super admin with full system control
   - No unified admin dashboard exists

2. **🔴 CRITICAL: Access Control Not Implemented**
   - Entitlement system exists but not enforced at route level
   - All trade intelligence modules publicly accessible
   - API endpoints lack protection

3. **🟡 HIGH: No Persona Dashboards**
   - Current `/profile` page is basic (name, email, password)
   - No personalized dashboards for different user tiers
   - No usage analytics, saved content, or quick actions

4. **🟡 HIGH: Marketing Site Not Admin-Managed**
   - Home page components are hard-coded
   - Hero slides, pricing tiers, trust logos not CMS-managed
   - No admin interface for marketing content

5. **🟢 STRENGTH: Solid Foundation**
   - Entitlement system architecture complete
   - Data pipeline robust (Phase 0 complete)
   - Trade intelligence modules feature-complete

### Strategic Recommendations

**Immediate (Week 1)**:
- Define Super Admin persona and capabilities
- Implement access control for trade intelligence
- Create persona-specific dashboards

**Short-term (Month 1)**:
- Build Super Admin Control Panel
- Implement marketing site CMS
- Deploy persona dashboards to production

**Medium-term (Quarter 1)**:
- Advanced analytics dashboards
- White-label capabilities for Institutional tier
- API management console

---

## Complete Persona System

### Overview

Souvera serves **8 distinct personas** across 3 categories:

#### User Personas (6)
1. Public Visitor
2. Explorer
3. Professional
4. Business
5. Investor
6. Institutional

#### Admin Personas (2)
7. Platform Admin (Data & Content Manager)
8. **Super Admin** (Platform Owner) ⭐ NEW

---

### Persona 1: Public Visitor

**Access Tier**: `public` (Rank 0)  
**Typical Users**: Website visitors, researchers, students  
**Primary Goal**: Explore platform capabilities, assess value

#### Entitlements
```typescript
['country_identity', 'headline_macro', 'sector_teasers', 'news_teasers']
```

#### Platform Access

| Feature | Access Level | View |
|---------|--------------|------|
| **Landing Page** | ✅ Full | Marketing content, hero, pricing tiers |
| **Intelligence Hub** | ✅ Limited | Overview only, module cards with "Sign up" CTAs |
| **Intelligence Map** | ✅ Limited | Map visible, country cards show basic info only |
| **Africa/Caribbean Hubs** | ✅ Limited | Regional overview, stats, teaser cards |
| **Country Profiles** | ❌ Paywall | "Sign up to unlock" overlay |
| **Trade Intelligence** | ❌ Paywall | Hub overview only, modules locked |
| **Insights** | ✅ Limited | News headlines, rankings preview (top 10 only) |
| **Sectors** | ✅ Limited | Sector overview pages, key markets teaser |
| **Reports** | ❌ Locked | Report generation unavailable |
| **API** | ❌ Locked | No API access |
| **Exports** | ❌ Locked | No PNG/CSV/Excel exports |

#### Dashboard: Public Profile Portal

**Route**: `/explore` (no auth required)

**Components**:
- **Hero**: "Start Your Intelligence Journey"
- **Quick Stats**: Platform coverage (74 markets, 8 sectors, 1000+ indicators)
- **Sample Insights**: 3 featured country cards (teaser view)
- **Pricing Comparison**: Explorer vs Professional vs Business
- **CTA**: "Create Free Account" (Explorer tier)

---

### Persona 2: Explorer

**Access Tier**: `explorer` (Rank 1)  
**Typical Users**: Independent researchers, students, journalists, NGO staff  
**Primary Goal**: Research markets, gather preliminary insights

#### Entitlements
```typescript
[
  'country_identity',
  'headline_macro',
  'sector_teasers',
  'news_teasers',
  'compare_lite',
]
```

#### Platform Access

| Feature | Access Level | View |
|---------|--------------|------|
| **Intelligence Hub** | ✅ Full | All regional hubs unlocked |
| **Intelligence Map** | ✅ Full | Interactive map, basic country cards |
| **Country Profiles** | ✅ Limited | Overview tab only (headline macro, basic sectors) |
| **Trade Intelligence** | 🟡 Preview | AGOA/AfCFTA status view (read-only), flows locked |
| **Country Comparison** | ✅ Basic | Compare up to 3 countries (GDP, pop, growth only) |
| **Insights** | ✅ Full | News articles, rankings, briefings |
| **Sectors** | ✅ Limited | Sector overviews, key markets list (no deep-dive) |
| **Reports** | ❌ Locked | Report generation unavailable |
| **API** | ❌ Locked | No API access |
| **Exports** | ❌ Locked | No exports |

#### Dashboard: Explorer Dashboard

**Route**: `/dashboard` (authenticated)

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Welcome back, [Name]                                    │
│  Explorer Plan • [Usage Stats]                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  QUICK ACTIONS                                           │
│  [Explore Map] [Compare Countries] [View Insights]      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  RECENTLY VIEWED (last 10)                               │
│  • Nigeria (2 hours ago)                                 │
│  • Kenya (Yesterday)                                     │
│  • Jamaica (3 days ago)                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SAVED CONTENT (0/10 limit)                              │
│  [Empty state: "Bookmark countries to quick access"]    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PLATFORM UPDATES                                        │
│  • New: Caribbean Intelligence Hub launched              │
│  • Update: AGOA reauthorization countdown               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  UPGRADE BENEFITS (Professional)                         │
│  ✓ Full macro data (FX, debt, forecasts)                │
│  ✓ Sector rationale and investment context              │
│  ✓ Trade policy details (AGOA eligibility)              │
│  [Upgrade to Professional →]                             │
└─────────────────────────────────────────────────────────┘
```

**Components**:
1. **Header Card**: Welcome message, plan badge, usage summary
2. **Quick Actions**: 3 primary CTAs based on persona
3. **Recently Viewed**: Last 10 countries/pages visited
4. **Saved Content**: Bookmarked countries (10 max for Explorer)
5. **Platform Updates**: News, feature launches, policy changes
6. **Upgrade CTA**: Benefits of next tier (Professional)

---

### Persona 3: Professional

**Access Tier**: `professional` (Rank 2)  
**Typical Users**: Independent consultants, small business owners, exporters, trade advisors  
**Primary Goal**: Market research, export opportunity identification, client briefings

#### Entitlements
```typescript
[
  'country_identity',
  'headline_macro',
  'sector_teasers',
  'news_teasers',
  'compare_lite',
  'full_macro',
  'sector_rationale',
  'fx_metrics',
]
```

#### Platform Access

| Feature | Access Level | View |
|---------|--------------|------|
| **Country Profiles** | ✅ Extended | Overview + Economy + Sectors tabs unlocked |
| **Trade Intelligence** | 🟡 Policy Only | AGOA Eligibility, AfCFTA Status (read-only) |
| **Country Comparison** | ✅ Enhanced | Compare up to 5 countries (full macro metrics) |
| **Reports** | ❌ Locked | Report generation unavailable |
| **API** | ❌ Locked | No API access |
| **Exports** | ❌ Locked | No exports |

#### Dashboard: Professional Command Center

**Route**: `/dashboard`

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  [Name] • Professional Plan • 28 days remaining          │
│  [Usage: 45 countries viewed this month]                │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  QUICK INTELLIGENCE  │  MARKET WATCHLIST (0/25)         │
│                      │                                  │
│  [Compare Markets]   │  [Empty: Add countries to        │
│  [Policy Tracker]    │   monitor policy changes]        │
│  [Sector Analysis]   │                                  │
│  [FX Dashboard]      │  [+ Add Country]                 │
└──────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  RECENT RESEARCH                                         │
│  • Nigeria - Economy Analysis (2 hours ago)              │
│  • Kenya - Agriculture Sector (Yesterday)                │
│  • Comparison: JAM vs DOM vs TTO (2 days ago)           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TRADE POLICY ALERTS                                     │
│  🔔 AGOA: 202 days until expiration                      │
│  🔔 AfCFTA: Kenya completed Phase 1 implementation       │
│  [View all alerts →]                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  UNLOCK WITH BUSINESS PLAN                               │
│  ✓ Full trade flow data (imports/exports)               │
│  ✓ African & Caribbean demand intelligence              │
│  ✓ AGOA Product Finder (150+ products)                  │
│  ✓ PNG exports with branding                            │
│  ✓ Country profile reports (1/month)                    │
│  [Upgrade to Business →]                                 │
└─────────────────────────────────────────────────────────┘
```

**New Components**:
- **Market Watchlist**: Monitor up to 25 countries for policy changes
- **Trade Policy Alerts**: Real-time notifications for AGOA/AfCFTA updates
- **Quick Intelligence**: Fast access to comparison tools, policy tracker, sector analysis
- **Recent Research**: Full history of viewed pages with timestamps

---

### Persona 4: Business

**Access Tier**: `business` (Rank 3)  
**Typical Users**: SMEs, export managers, trade consultants, market research firms  
**Primary Goal**: Trade opportunity analysis, export planning, client deliverables

#### Entitlements
```typescript
[
  'country_identity',
  'headline_macro',
  'sector_teasers',
  'news_teasers',
  'compare_lite',
  'full_macro',
  'sector_rationale',
  'reports_preview',
  'trade_data',
  'risk_analysis',
  'investment_thesis',
  'fx_metrics',
  'forecast_metrics',
]
```

#### Platform Access

| Feature | Access Level | View |
|---------|--------------|------|
| **Country Profiles** | ✅ Full | All tabs unlocked (Overview, Economy, Trade, Risk, Sectors, Reports) |
| **Trade Intelligence** | ✅ Full Suite | All modules unlocked |
| **African Demand Intelligence** | ✅ Full | All categories, country drawers, analysis |
| **Caribbean Demand Intelligence** | ✅ Full | All categories, country drawers, analysis |
| **AfCFTA Import-Export** | ✅ Full | Import/export flows, all categories |
| **CBTPA Import-Export** | ✅ Full | Import/export flows, all categories |
| **AGOA Product Finder** | ✅ Priority | 150 priority products with analysis |
| **Supply-Demand Matrix** | ❌ Locked | Investor tier required |
| **Country Comparison** | ✅ Advanced | Compare up to 10 countries (all metrics) |
| **Reports** | ✅ Limited | 1 report/month, watermarked |
| **API** | ❌ Locked | No API access |
| **Exports** | ✅ Watermarked | PNG exports with Souvera watermark |

#### Dashboard: Business Intelligence Hub

**Route**: `/dashboard`

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Business Intelligence Hub                               │
│  [Name] • Business Plan • Renews June 30, 2026          │
│  Usage: 127 countries | 43 exports | 0/1 reports used   │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  TRADE INTELLIGENCE  │  MY WATCHLIST (8/50)             │
│                      │                                  │
│  [Demand Intel]      │  Nigeria    [△ Policy change]   │
│  [AfCFTA Flows]      │  Kenya      [✓ Up to date]      │
│  [CBTPA Flows]       │  Jamaica    [△ Trade update]    │
│  [AGOA Products]     │  [+ Add markets]                 │
│  [Policy Tracker]    │                                  │
└──────────────────────┴──────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  SAVED ANALYSES      │  EXPORT HISTORY                  │
│  (Unlimited)         │                                  │
│                      │  • NGA-Trade-Flows.png (Today)   │
│  [12 saved items]    │  • AfCFTA-Machinery.png (2d ago) │
│  [View all →]        │  • JAM-Demand-Profile.png (4d)   │
│                      │  [View all 43 exports →]         │
└──────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  REPORTS QUOTA                                           │
│  📊 0 of 1 reports generated this month                  │
│  [Generate Country Profile Report →]                     │
│  Next reset: June 30, 2026                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  RECENT INTELLIGENCE                                     │
│  • Nigerian demand for US machinery: $1.2B opportunity   │
│  • AfCFTA implementation: 5 countries updated            │
│  • AGOA Product Alert: New apparel guidelines            │
│  [View intelligence feed →]                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  UNLOCK WITH INVESTOR PLAN                               │
│  ✓ Supply-Demand Matrix (74×8 sectors)                  │
│  ✓ Forecast metrics and predictive analytics            │
│  ✓ 5 reports/month (no watermark)                       │
│  ✓ Advanced risk scoring                                │
│  [Upgrade to Investor →]                                 │
└─────────────────────────────────────────────────────────┘
```

**New Components**:
- **Trade Intelligence Quick Launch**: Direct links to all trade modules
- **My Watchlist**: Monitor up to 50 markets with status indicators
- **Saved Analyses**: Unlimited bookmarks for countries, reports, charts
- **Export History**: Track all PNG exports with download links
- **Reports Quota**: Usage tracking for monthly report allowance
- **Intelligence Feed**: Personalized alerts based on watchlist

---

### Persona 5: Investor

**Access Tier**: `investor` (Rank 4)  
**Typical Users**: Fund managers, institutional investors, private equity, venture capital  
**Primary Goal**: Investment due diligence, portfolio monitoring, opportunity sourcing

#### Entitlements
```typescript
[
  'country_identity',
  'headline_macro',
  'sector_teasers',
  'news_teasers',
  'compare_lite',
  'full_macro',
  'sector_rationale',
  'reports_preview',
  'trade_data',
  'risk_analysis',
  'investment_thesis',
  'fx_metrics',
  'forecast_metrics',
]
```

#### Platform Access

| Feature | Access Level | View |
|---------|--------------|------|
| **All Business Features** | ✅ Inherited | Same as Business tier |
| **Supply-Demand Matrix** | ✅ Full | 74×8 sector opportunity matrix |
| **Country Comparison** | ✅ Unlimited | Compare unlimited countries |
| **Reports** | ✅ Enhanced | 5 reports/month, no watermark |
| **Exports** | ✅ Professional | PNG/CSV exports without watermark |
| **Forecast Metrics** | ✅ Full | Projections, growth forecasts, risk models |
| **API** | ❌ Locked | Institutional tier required |

#### Dashboard: Investor Command Center

**Route**: `/dashboard`

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Investor Command Center                                 │
│  [Name] • [Organization] • Investor Plan                 │
│  Portfolio: 12 active markets | 5/5 reports used        │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  PORTFOLIO MONITOR   │  OPPORTUNITY SCANNER             │
│  (12 active)         │                                  │
│                      │  High-potential sectors:         │
│  Nigeria    [🟢 8.5] │  • NGA: Fintech (Score: 9.2)     │
│  Kenya      [🟢 8.2] │  • KEN: Agriculture (8.8)        │
│  Jamaica    [🟡 7.1] │  • GHA: Digital Infra (8.5)      │
│  Ethiopia   [🟢 7.8] │                                  │
│  [Manage →]          │  [Run full scan →]               │
└──────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SUPPLY-DEMAND MATRIX                                    │
│  74 markets × 8 sectors = 592 opportunity cells         │
│  [Launch Matrix Analysis →]                              │
│                                                          │
│  Top Opportunities (This Week):                          │
│  • Kenya - Digital Infrastructure: High supply, US demand│
│  • Nigeria - Energy: Strong demand, US export potential │
│  • Rwanda - Fintech: Emerging supply, growing demand    │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  REPORTS GENERATED   │  ANALYTICS & INSIGHTS            │
│  5/5 this month      │                                  │
│                      │  • Portfolio avg risk: 7.4/10    │
│  • NGA Profile (5d)  │  • Macro trends: 3 alerts        │
│  • KEN Profile (7d)  │  • Trade policy: 2 updates       │
│  • JAM Profile (10d) │  • Sector shifts: 5 signals      │
│  [View all →]        │  [View dashboard →]              │
└──────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  FORECAST & RISK MODELS                                  │
│  • GDP growth forecasts (2026-2028)                      │
│  • FX volatility models                                  │
│  • Political risk scores                                 │
│  • Sector opportunity scores                             │
│  [Access models →]                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  UNLOCK WITH INSTITUTIONAL PLAN                          │
│  ✓ API access for data integration                      │
│  ✓ Unlimited reports & exports                          │
│  ✓ White-label reports with your branding               │
│  ✓ Custom data views and dashboards                     │
│  ✓ Priority support & dedicated account manager         │
│  [Contact Sales →]                                       │
└─────────────────────────────────────────────────────────┘
```

**New Components**:
- **Portfolio Monitor**: Track specific markets with risk scores
- **Opportunity Scanner**: AI-driven sector opportunity identification
- **Supply-Demand Matrix Access**: Quick launch to 74×8 matrix
- **Analytics & Insights**: Aggregated intelligence across portfolio
- **Forecast & Risk Models**: Advanced predictive analytics
- **Reports Generated**: Full history with re-download capability

---

### Persona 6: Institutional

**Access Tier**: `institutional` (Rank 5)  
**Typical Users**: Enterprises, government agencies, development banks, multilaterals, large consulting firms  
**Primary Goal**: Comprehensive intelligence, API integration, white-label reporting, multi-user teams

#### Entitlements
```typescript
[
  'country_identity',
  'headline_macro',
  'sector_teasers',
  'news_teasers',
  'compare_lite',
  'full_macro',
  'sector_rationale',
  'reports_preview',
  'trade_data',
  'risk_analysis',
  'investment_thesis',
  'api_access',
  'export_access',
  'fx_metrics',
  'forecast_metrics',
]
```

#### Platform Access

| Feature | Access Level | View |
|---------|--------------|------|
| **All Platform Features** | ✅ Complete | Full access to all modules |
| **API Access** | ✅ Full | RESTful API with authentication |
| **Reports** | ✅ Unlimited | Unlimited white-label reports |
| **Exports** | ✅ Unlimited | Unlimited PNG/CSV/Excel/PDF |
| **Custom Dashboards** | ✅ Available | Configurable views and widgets |
| **Team Management** | ✅ Full | Multi-user accounts, role assignment |
| **Priority Support** | ✅ Included | Dedicated account manager |

#### Dashboard: Institutional Control Center

**Route**: `/dashboard`

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  [Organization Name] Intelligence Center                 │
│  Institutional Plan • 23 active users • [Admin Panel]    │
│  Account Manager: [Name] • [Contact]                     │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  TEAM ACTIVITY       │  USAGE ANALYTICS                 │
│  23 active users     │                                  │
│                      │  API calls: 45,230 this month    │
│  • 5 Analysts        │  Reports generated: 127          │
│  • 3 Strategists     │  Exports: 1,843                  │
│  • 2 Executives      │  Data refreshed: 2 hours ago     │
│  [Manage team →]     │  [View analytics →]              │
└──────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  CUSTOM DASHBOARDS (3 configured)                        │
│  • Executive Summary (Macro trends, risk alerts)         │
│  • Trade Opportunities (African demand, AGOA products)   │
│  • Portfolio Monitor (12 markets, sector scores)         │
│  [+ Create dashboard] [Configure widgets]                │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  API MANAGEMENT      │  REPORTS & EXPORTS               │
│                      │                                  │
│  Status: Active      │  • 127 reports generated         │
│  Rate: 1000 req/min  │  • 1,843 exports this month      │
│  [View docs]         │  • White-label branding active   │
│  [Generate API key]  │  [Configure branding →]          │
└──────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ORGANIZATION SETTINGS                                   │
│  • Team management & roles                               │
│  • White-label branding configuration                    │
│  • API keys & webhook endpoints                          │
│  • Data export schedules                                 │
│  • Custom integrations                                   │
│  [Manage settings →]                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SUPPORT & RESOURCES                                     │
│  • Dedicated Account Manager: [Name] ([Email])           │
│  • Priority support ticket system                        │
│  • Training sessions & onboarding                        │
│  • API documentation & SDKs                              │
│  [Contact support] [Schedule training]                   │
└─────────────────────────────────────────────────────────┘
```

**New Components**:
- **Team Activity**: Multi-user management with role-based access
- **Usage Analytics**: API calls, reports, exports tracking
- **Custom Dashboards**: Configurable intelligence dashboards
- **API Management**: Keys, rate limits, documentation
- **White-Label Branding**: Logo, colors, report templates
- **Support & Resources**: Dedicated account manager, training

---

### Persona 7: Platform Admin (Data & Content Manager)

**Access Tier**: `platform_admin` (Rank 99)  
**Typical Users**: Souvera/Afronovation data team, content editors  
**Primary Goal**: Data ingestion, content curation, system monitoring

#### Entitlements
```typescript
[
  ...ALL_USER_ENTITLEMENTS,
  'admin_access',
]
```

#### Platform Access

| Feature | Access Level | View |
|---------|--------------|------|
| **All User Features** | ✅ Complete | Full user-facing platform access |
| **Admin Panel** | ✅ Full | Data & content management |
| **Data Sources** | ✅ Manage | Source registry, data quality |
| **Indicators** | ✅ Manage | Country observations, metrics |
| **Data Upload** | ✅ Full | Manual CSV/Excel uploads |
| **Ingestion Jobs** | ✅ Run | Trigger ingestion scripts |
| **News Pulse** | ✅ Curate | News signal management |
| **Curated News** | ✅ Manage | Article creation, editing, publishing |
| **Trade Policy** | ✅ Manage | Policy status updates |
| **Reports Reset** | ✅ Execute | Reset quota, clear history |
| **User Management** | ❌ Limited | View users, no delete/ban |
| **System Settings** | ❌ Locked | Super Admin only |

#### Dashboard: Platform Admin Panel

**Route**: `/admin` (current implementation)

**Current Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Souvera Admin                                           │
│  [Home] [Data Management] [System Healthy ✓]            │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  SIDEBAR NAVIGATION  │  MAIN CONTENT AREA               │
│                      │                                  │
│  Data Management:    │  [Selected tool content]         │
│  • Data Sources      │                                  │
│  • Indicators        │                                  │
│  • Upload Data       │                                  │
│  • Ingestion         │                                  │
│  • News Pulse        │                                  │
│  • Reports Reset     │                                  │
│  • Data Quality      │                                  │
│  • Crosswalks        │                                  │
│                      │                                  │
│  Content:            │                                  │
│  • Curated News      │                                  │
│  • Trade Policy      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

**✅ Current Tools (Implemented)**:
1. **Data Sources** - Source registry, connectivity checks
2. **Indicators** - Country observations browser
3. **Upload Data** - CSV/Excel file uploads
4. **Ingestion** - Trigger ingestion jobs (IMF, World Bank, etc.)
5. **News Pulse** - News signal curation and filtering
6. **Curated News** - Article CMS (create, edit, publish, unpublish)
7. **Trade Policy** - Policy status updates (AGOA, AfCFTA)
8. **Reports Reset** - Reset report quota, clear history
9. **Data Quality** - Data quality tiers and validation
10. **Crosswalks** - Country code crosswalks

**❌ Missing (Needed for Complete Admin Experience)**:
- System health dashboard
- Data pipeline monitoring
- Audit logs
- User activity monitoring
- Performance metrics

---

### Persona 8: Super Admin (Platform Owner) ⭐ NEW

**Access Tier**: `super_admin` (Rank 100) ⭐ NEW  
**Typical Users**: Souvera/Afronovation founders, CTO, platform architects  
**Primary Goal**: Complete platform control, system configuration, user management, marketing site CMS

#### Entitlements
```typescript
[
  ...ALL_ENTITLEMENTS,
  'super_admin_access',
  'user_management',
  'system_configuration',
  'marketing_cms',
  'billing_management',
  'audit_logs',
]
```

#### Platform Access

| Feature | Access Level | View |
|---------|--------------|------|
| **All Platform Features** | ✅ God Mode | Complete access to everything |
| **Super Admin Control Panel** | ✅ Exclusive | Platform-wide configuration |
| **User Management** | ✅ Full | Create, edit, delete, ban users |
| **Organization Management** | ✅ Full | Manage institutional accounts |
| **Marketing Site CMS** | ✅ Full | Edit all marketing content |
| **System Configuration** | ✅ Full | Feature flags, settings, secrets |
| **Billing & Subscriptions** | ✅ Full | Plans, pricing, overrides |
| **Audit Logs** | ✅ Full | Complete activity history |
| **Database Access** | ✅ Direct | Supabase admin panel |
| **Deployment** | ✅ Full | Production deploys, rollbacks |

#### Dashboard: Super Admin Control Panel ⭐ NEW

**Route**: `/super-admin` (requires `super_admin` role)

**Proposed Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  🔴 SUPER ADMIN CONTROL PANEL                            │
│  [System Status] [Platform Metrics] [Emergency Actions] │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  NAVIGATION          │  DASHBOARD HOME                  │
│                      │                                  │
│  🏠 Dashboard        │  ┌────────────────────────────┐  │
│                      │  │ PLATFORM HEALTH            │  │
│  👥 Users & Orgs     │  │ Status: ✅ Operational     │  │
│  💳 Billing          │  │ Uptime: 99.98%             │  │
│  🎨 Marketing CMS    │  │ API: 124ms avg             │  │
│  ⚙️  System Config   │  │ DB: 45% capacity           │  │
│  📊 Analytics        │  └────────────────────────────┘  │
│  📋 Audit Logs       │                                  │
│  🚀 Deployments      │  ┌────────────────────────────┐  │
│  🛠️  Dev Tools       │  │ PLATFORM METRICS           │  │
│                      │  │ Users: 2,847               │  │
│  ─────────────────   │  │ Organizations: 43          │  │
│  Platform Admin ↗    │  │ Active subs: 1,234         │  │
│  (Data & Content)    │  │ MRR: [Confidential]        │  │
│                      │  └────────────────────────────┘  │
│  ─────────────────   │                                  │
│  [Sign Out]          │  [Recent activity...]            │
└──────────────────────┴──────────────────────────────────┘
```

**New Tools** (To Be Built):

#### 1. Users & Organizations Management

```
┌─────────────────────────────────────────────────────────┐
│  USER MANAGEMENT                                         │
│  [Search] [Filter: All Plans ▾] [+ Create User]         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  USER TABLE                                              │
│  ┌──────┬──────────┬─────────┬────────┬─────────────┐  │
│  │ User │ Email    │ Plan    │ Status │ Actions     │  │
│  ├──────┼──────────┼─────────┼────────┼─────────────┤  │
│  │ John │ j@...    │ Business│ Active │ [Edit][Ban] │  │
│  │ Mary │ m@...    │ Investor│ Active │ [Edit][Ban] │  │
│  │ Acme │ a@...    │ Instit. │ Active │ [Edit][Ban] │  │
│  └──────┴──────────┴─────────┴────────┴─────────────┘  │
│  [Pagination: 1-50 of 2,847]                             │
└─────────────────────────────────────────────────────────┘

ACTIONS:
• View user profile & activity
• Edit user details (name, email, plan)
• Change subscription manually
• Ban/suspend user
• Reset password
• Impersonate user (for support)
• View audit log for user
```

#### 2. Billing & Subscriptions

```
┌─────────────────────────────────────────────────────────┐
│  BILLING MANAGEMENT                                      │
│  [Plans] [Subscriptions] [Revenue] [Overrides]          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SUBSCRIPTION PLANS                                      │
│  ┌────────────┬────────────┬────────────┬──────────┐   │
│  │ Plan       │ Price      │ Active     │ Actions  │   │
│  ├────────────┼────────────┼────────────┼──────────┤   │
│  │ Explorer   │ $0/mo      │ 1,245      │ [Edit]   │   │
│  │ Professional│ $XX/mo    │ 387        │ [Edit]   │   │
│  │ Business   │ $XX/mo     │ 189        │ [Edit]   │   │
│  │ Investor   │ $XX/mo     │ 34         │ [Edit]   │   │
│  │ Institutional│ Custom   │ 12         │ [Edit]   │   │
│  └────────────┴────────────┴────────────┴──────────┘   │
└─────────────────────────────────────────────────────────┘

CAPABILITIES:
• Edit plan features & entitlements
• Adjust pricing (all plans DB-managed)
• Create custom plans for enterprise
• Manual subscription overrides
• Grant free trials
• View revenue analytics
```

#### 3. Marketing Site CMS ⭐ KEY FEATURE

```
┌─────────────────────────────────────────────────────────┐
│  MARKETING SITE CMS                                      │
│  [Hero] [Sections] [Pages] [Navigation] [Settings]      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  HOME PAGE HERO MANAGEMENT                               │
│  [+ Add Slide] [Reorder Slides] [Preview]               │
│                                                          │
│  SLIDE 1 (Active)                                        │
│  Title: "74 Markets. One Platform."                      │
│  Subtitle: "Institutional-grade intelligence..."         │
│  CTA: "Start Free Trial" → /access                       │
│  Background: [Upload image] [Current: hero-1.jpg]        │
│  [Edit] [Deactivate] [Delete]                           │
│                                                          │
│  SLIDE 2 (Active)                                        │
│  Title: "AGOA Reauthorization Intelligence"             │
│  Subtitle: "202 days remaining..."                       │
│  CTA: "Explore Trade Intelligence" → /intelligence/trade│
│  Background: [Upload image] [Current: hero-2.jpg]        │
│  [Edit] [Deactivate] [Delete]                           │
└─────────────────────────────────────────────────────────┘

MANAGED CONTENT:
• Hero slides (title, subtitle, CTA, background)
• Flash banners (announcement bar)
• Trust logos (source attribution strip)
• Pricing tiers (plans, features, CTAs)
• Sector showcase cards
• Top economies list
• Newsletter prompts
• Footer links & content
• Navigation mega menu
• Feature flags (enable/disable sections)
```

#### 4. System Configuration

```
┌─────────────────────────────────────────────────────────┐
│  SYSTEM CONFIGURATION                                    │
│  [Feature Flags] [API Settings] [Email] [Integrations]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  FEATURE FLAGS                                           │
│  Toggle features on/off without code deployment         │
│                                                          │
│  ☑ Trade Intelligence Modules (enabled)                 │
│  ☑ Supply-Demand Matrix (enabled)                       │
│  ☑ Country Profile Reports (enabled)                    │
│  ☑ PNG Exports (enabled)                                │
│  ☐ API Access (disabled - in development)               │
│  ☐ White-Label Reports (disabled - institutional only)  │
│                                                          │
│  [Save Changes]                                          │
└─────────────────────────────────────────────────────────┘

CAPABILITIES:
• Feature flags (enable/disable features)
• API rate limits & quotas
• Email templates (transactional, marketing)
• Third-party integrations (Stripe, SendGrid, etc.)
• System-wide settings (maintenance mode, etc.)
```

#### 5. Analytics Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  PLATFORM ANALYTICS                                      │
│  [Users] [Engagement] [Revenue] [Performance]           │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  USER GROWTH         │  ENGAGEMENT METRICS              │
│  [Chart: 30 days]    │                                  │
│                      │  DAU: 1,234                      │
│  +127 new users      │  MAU: 2,847                      │
│  +5 new orgs         │  Avg session: 18m 34s            │
│                      │  Top feature: Trade Intel        │
└──────────────────────┴──────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  REVENUE             │  PERFORMANCE                     │
│  [Chart: 90 days]    │                                  │
│                      │  API: 124ms avg                  │
│  MRR: [Conf]         │  Page load: 1.2s avg             │
│  Churn: 2.1%         │  Error rate: 0.03%               │
│  LTV: [Conf]         │  Uptime: 99.98%                  │
└──────────────────────┴──────────────────────────────────┘

METRICS:
• User acquisition & growth
• Feature usage by tier
• Revenue & churn
• API performance
• System health
```

#### 6. Audit Logs

```
┌─────────────────────────────────────────────────────────┐
│  AUDIT LOGS                                              │
│  [Search] [Filter: All Events ▾] [Date Range]           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  RECENT ACTIVITY                                         │
│  ┌──────────┬──────┬─────────┬──────────────────────┐  │
│  │ Time     │ User │ Action  │ Details              │  │
│  ├──────────┼──────┼─────────┼──────────────────────┤  │
│  │ 2m ago   │ Admin│ Publish │ Curated News ID:123  │  │
│  │ 15m ago  │ Super│ Edit    │ User: john@...       │  │
│  │ 1h ago   │ Admin│ Ingest  │ IMF WEO data         │  │
│  │ 2h ago   │ User │ Export  │ PNG: NGA-Trade.png   │  │
│  └──────────┴──────┴─────────┴──────────────────────┘  │
│  [Load more...]                                          │
└─────────────────────────────────────────────────────────┘

LOGGED EVENTS:
• User logins/logouts
• Admin actions (data changes, user edits)
• Content publishes/unpublishes
• Subscription changes
• System configuration changes
• Data ingestion runs
• Report generations
• Export actions
```

---

## Dashboard Architecture by Persona

### Component Library

All dashboards share a common component library for consistency:

#### 1. Header Components
- **DashboardHeader**: Welcome message, plan badge, usage stats
- **QuickActions**: Primary CTAs based on persona
- **NotificationBell**: Alerts, updates, messages

#### 2. Widget Components
- **StatCard**: Single metric with trend indicator
- **ChartWidget**: Line/bar/pie charts for analytics
- **ListWidget**: Recent items, watchlist, saved content
- **UpgradeCard**: Feature comparison, upgrade CTA
- **ActivityFeed**: Recent actions, platform updates

#### 3. Interactive Components
- **SearchBar**: Global search across countries, sectors, content
- **FilterBar**: Filter by region, sector, time period
- **Pagination**: Navigate large lists
- **SortableTable**: Sortable data tables

#### 4. Layout Components
- **TwoColumnLayout**: Sidebar + main content
- **GridLayout**: Responsive grid for widgets
- **TabLayout**: Organize content by category

### Database Schema for Dashboards

#### User Preferences Table
```sql
CREATE TABLE souvera_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dashboard customization
  default_dashboard TEXT, -- 'explorer', 'business', 'investor'
  dashboard_layout JSONB, -- Widget arrangement
  theme TEXT DEFAULT 'dark', -- 'dark' | 'light'
  
  -- Watchlist
  watchlist_countries TEXT[], -- ISO3 codes
  watchlist_sectors TEXT[], -- Sector keys
  
  -- Notifications
  email_alerts BOOLEAN DEFAULT true,
  policy_alerts BOOLEAN DEFAULT true,
  trade_alerts BOOLEAN DEFAULT false,
  
  -- Recently viewed
  recent_countries TEXT[], -- Last 50 ISO3 codes
  recent_pages TEXT[], -- Last 50 page paths
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Saved Content Table
```sql
CREATE TABLE souvera_saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  content_type TEXT NOT NULL, -- 'country', 'sector', 'report', 'chart'
  content_id TEXT NOT NULL, -- ISO3, sector key, report ID, etc.
  content_metadata JSONB, -- Additional context
  
  notes TEXT, -- User notes
  tags TEXT[], -- User-defined tags
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_content_user ON souvera_saved_content(user_id);
CREATE INDEX idx_saved_content_type ON souvera_saved_content(content_type);
```

#### Dashboard Analytics Table
```sql
CREATE TABLE souvera_dashboard_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL, -- 'page_view', 'export', 'report_gen', etc.
  event_metadata JSONB, -- Event details
  
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_user ON souvera_dashboard_analytics(user_id);
CREATE INDEX idx_analytics_type ON souvera_dashboard_analytics(event_type);
CREATE INDEX idx_analytics_date ON souvera_dashboard_analytics(created_at);
```

---

## Super Admin Platform Control

### Marketing Site CMS - Detailed Spec

#### Managed Content Tables

##### 1. Hero Slides Table
```sql
CREATE TABLE souvera_hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_url TEXT,
  background_image_url TEXT,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### 2. Flash Banners Table
```sql
CREATE TABLE souvera_flash_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  message TEXT NOT NULL,
  cta_text TEXT,
  cta_url TEXT,
  banner_type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  
  -- Display
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### 3. Pricing Plans Table (DB-Managed)
```sql
CREATE TABLE souvera_pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT UNIQUE NOT NULL, -- 'explorer', 'professional', etc.
  
  -- Display
  display_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  
  -- Pricing
  price_monthly_usd DECIMAL(10,2),
  price_annual_usd DECIMAL(10,2),
  billing_cycle TEXT, -- 'monthly', 'annual', 'custom'
  
  -- Features (JSONB array)
  features JSONB, -- [{"text": "Feature 1", "included": true}, ...]
  
  -- CTA
  cta_text TEXT DEFAULT 'Get Started',
  cta_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### 4. Trust Logos Table
```sql
CREATE TABLE souvera_trust_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organization
  org_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### 5. Feature Flags Table
```sql
CREATE TABLE souvera_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT UNIQUE NOT NULL, -- 'trade_intelligence_enabled'
  
  -- Configuration
  is_enabled BOOLEAN DEFAULT false,
  description TEXT,
  rollout_percentage INTEGER DEFAULT 0, -- 0-100
  
  -- Targeting
  enabled_for_tiers TEXT[], -- ['business', 'investor', 'institutional']
  enabled_for_users UUID[], -- Specific user IDs
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Super Admin UI - Implementation Plan

#### Phase 1: Core Infrastructure (Week 1)

**Tasks**:
1. Create `super_admin` role in entitlements system
2. Build `/super-admin` route protection
3. Create Super Admin dashboard layout
4. Implement navigation sidebar
5. Build dashboard home (metrics widgets)

**Files to Create**:
- `packages/entitlements/index.ts` - Add `super_admin` tier
- `apps/api-gateway/src/app/super-admin/layout.tsx` - Super Admin layout
- `apps/api-gateway/src/app/super-admin/page.tsx` - Dashboard home
- `apps/api-gateway/src/lib/admin/verify-super-admin.ts` - Auth check
- `apps/api-gateway/src/components/super-admin/SuperAdminNav.tsx` - Navigation

#### Phase 2: User & Org Management (Week 2)

**Tasks**:
1. Build user management table
2. Create user edit modal
3. Implement subscription override
4. Build organization management
5. Add impersonation capability

**Files to Create**:
- `apps/api-gateway/src/app/super-admin/users/page.tsx`
- `apps/api-gateway/src/app/super-admin/users/[id]/page.tsx`
- `apps/api-gateway/src/app/super-admin/organizations/page.tsx`
- `apps/api-gateway/src/components/super-admin/UserTable.tsx`
- `apps/api-gateway/src/components/super-admin/UserEditModal.tsx`

#### Phase 3: Marketing Site CMS (Week 3)

**Tasks**:
1. Create hero slides management
2. Build flash banner editor
3. Implement pricing plan editor
4. Create trust logos manager
5. Build feature flag toggle UI

**Files to Create**:
- `apps/api-gateway/src/app/super-admin/marketing/hero/page.tsx`
- `apps/api-gateway/src/app/super-admin/marketing/banners/page.tsx`
- `apps/api-gateway/src/app/super-admin/marketing/pricing/page.tsx`
- `apps/api-gateway/src/app/super-admin/marketing/trust-logos/page.tsx`
- `apps/api-gateway/src/app/super-admin/system/feature-flags/page.tsx`

#### Phase 4: Analytics & Audit (Week 4)

**Tasks**:
1. Build analytics dashboard
2. Create revenue metrics
3. Implement audit log viewer
4. Add export capabilities
5. Build alerting system

**Files to Create**:
- `apps/api-gateway/src/app/super-admin/analytics/page.tsx`
- `apps/api-gateway/src/app/super-admin/audit-logs/page.tsx`
- `apps/api-gateway/src/components/super-admin/AnalyticsChart.tsx`
- `apps/api-gateway/src/components/super-admin/AuditLogTable.tsx`

---

## Full Project Analysis

### Project Structure Overview

```
souvera-intelligence-terminal/
├── apps/
│   ├── api-gateway/          # Main Next.js application
│   │   ├── src/
│   │   │   ├── app/          # Pages (93 total)
│   │   │   │   ├── (auth)/   # Authentication pages
│   │   │   │   ├── admin/    # Platform Admin (19 files)
│   │   │   │   ├── intelligence/ # Intelligence modules
│   │   │   │   ├── insights/ # News, briefings, rankings
│   │   │   │   ├── sectors/  # Sector pages
│   │   │   │   ├── access/   # Pricing, plans
│   │   │   │   ├── profile/  # User profile
│   │   │   │   └── ...
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # Utilities, helpers
│   │   │   └── types/        # TypeScript types
│   │   └── package.json
│   └── terminal-web/         # Terminal application (separate)
├── packages/
│   ├── config/               # Shared configuration
│   ├── entitlements/         # Access control system ✅
│   ├── types/                # Shared TypeScript types
│   └── ui/                   # Shared UI components
├── services/
│   └── ingestion/            # Data ingestion pipelines
├── infra/
│   └── supabase/
│       └── migrations/       # Database migrations (24 files)
├── docs/                     # Documentation
│   ├── execution/            # Project plans, status reports
│   ├── platform/             # Technical docs
│   └── data/                 # Data coverage, backlog
└── scripts/                  # Utility scripts

**Total Files**: ~500+
**Total Lines of Code**: ~150,000+
```

### Current State Assessment

#### ✅ Strengths (Well-Implemented)

1. **Data Foundation** (Phase 0 Complete)
   - 68/74 markets with >= 15/20 Top 20 metrics
   - Structured observations in Supabase
   - Evidence Vault for policy status
   - Ingestion pipelines operational

2. **Trade Intelligence Modules** (Phase 0.5-0.7 Complete)
   - African Import Demand Intelligence ✅
   - Caribbean Import Demand Intelligence ✅
   - AfCFTA Import-Export Intelligence ✅
   - CBTPA Import-Export Intelligence ✅
   - AGOA Product Finder ✅
   - AGOA Eligibility Tracker ✅

3. **Entitlements System Architecture** ✅
   - 7 access tiers defined
   - Entitlement keys mapped to tiers
   - Helper functions (`hasEntitlement`, `resolveUserAccess`)
   - Database views for tiered data

4. **Admin Panel (Platform Admin)** ✅
   - Data source management
   - Indicator browser
   - CSV/Excel upload
   - Ingestion job triggers
   - News Pulse curation
   - Curated News CMS
   - Trade Policy management

5. **UI/UX Quality** ✅
   - Modern design system (Tailwind CSS)
   - Consistent component library
   - Responsive layouts
   - Accessibility considered
   - Professional Bloomberg Terminal aesthetic

#### 🔴 Critical Gaps (Must Fix)

1. **No Access Control Enforcement**
   - Entitlement system exists but not enforced
   - All trade modules publicly accessible
   - API endpoints unprotected
   - No route-level guards

2. **No Super Admin Role**
   - Only `platform_admin` exists (data/content only)
   - No platform owner with full control
   - No marketing site CMS
   - No user management capabilities

3. **No Persona Dashboards**
   - `/profile` page is basic
   - No personalized dashboards
   - No usage analytics
   - No saved content/watchlists

4. **Marketing Site Not CMS-Managed**
   - Hero slides hard-coded
   - Pricing tiers static
   - Trust logos hard-coded
   - Flash banners manual

5. **No Team/Organization Management**
   - Institutional tier exists but no multi-user support
   - No role-based access within orgs
   - No team activity tracking

#### 🟡 Medium Priority (Should Have)

1. **Supply-Demand Matrix** - Stub exists, not implemented
2. **API Access** - Defined in entitlements, not built
3. **White-Label Reports** - Mentioned, not implemented
4. **Custom Dashboards** - Institutional tier feature, not built
5. **Audit Logging** - Partial (admin actions), not comprehensive
6. **Performance Monitoring** - No real-time metrics dashboard
7. **Email Notifications** - Basic Supabase auth emails only
8. **Mobile App** - Not planned yet

---

## Strategic Recommendations

### Immediate (Week 1-2)

#### 1. Implement Access Control ⚡ CRITICAL
**Priority**: 🔴 P0  
**Impact**: Security, Revenue, Compliance

**Actions**:
- [ ] Add route protection to all trade intelligence modules
- [ ] Create `AccessUpgradeNotice` component for paywalls
- [ ] Protect API endpoints with entitlement checks
- [ ] Add middleware for automatic access control
- [ ] Test each persona's access flow

**Estimated Effort**: 2-3 days  
**Files Affected**: ~20 routes, ~8 API endpoints

---

#### 2. Define Super Admin Role ⚡ CRITICAL
**Priority**: 🔴 P0  
**Impact**: Platform Management, Security

**Actions**:
- [ ] Add `super_admin` tier to entitlements (Rank 100)
- [ ] Create `/super-admin` route with protection
- [ ] Build Super Admin dashboard home
- [ ] Implement user management UI
- [ ] Add marketing site CMS basics

**Estimated Effort**: 5-7 days  
**New Files**: ~15 components, 10 pages

---

#### 3. Build Basic Persona Dashboards ⚡ HIGH
**Priority**: 🟡 P1  
**Impact**: User Engagement, Retention

**Actions**:
- [ ] Create `/dashboard` route (authenticated)
- [ ] Build Explorer dashboard
- [ ] Build Professional dashboard
- [ ] Build Business dashboard
- [ ] Build Investor dashboard
- [ ] Implement recently viewed tracking
- [ ] Add saved content capability

**Estimated Effort**: 5-7 days  
**New Files**: ~20 components, 5 pages

---

### Short-Term (Month 1)

#### 4. Marketing Site CMS
**Priority**: 🟡 P1  
**Impact**: Marketing Agility, A/B Testing

**Capabilities**:
- [ ] Hero slides manager (create, edit, reorder, delete)
- [ ] Flash banners editor (schedule, activate, deactivate)
- [ ] Pricing plans editor (DB-managed, no code deploy)
- [ ] Trust logos manager (add, remove, reorder)
- [ ] Feature flags UI (enable/disable features)

**Estimated Effort**: 7-10 days

---

#### 5. Organization & Team Management
**Priority**: 🟡 P1  
**Impact**: Institutional Tier Value, MRR

**Capabilities**:
- [ ] Multi-user accounts for Institutional tier
- [ ] Role-based access (viewer, analyst, strategist, executive)
- [ ] Team activity dashboard
- [ ] Usage analytics per organization
- [ ] Seat management (add/remove users)

**Estimated Effort**: 10-14 days

---

#### 6. Audit Logging System
**Priority**: 🟡 P1  
**Impact**: Compliance, Security, Debugging

**Capabilities**:
- [ ] Log all user actions (logins, views, exports)
- [ ] Log all admin actions (data changes, content edits)
- [ ] Searchable audit log viewer (Super Admin)
- [ ] Export audit logs (CSV, JSON)
- [ ] Retention policy (90 days default)

**Estimated Effort**: 5-7 days

---

### Medium-Term (Quarter 1)

#### 7. Advanced Analytics Dashboard
**Priority**: 🟢 P2  
**Impact**: Business Intelligence, Growth

**Capabilities**:
- [ ] User acquisition metrics
- [ ] Feature usage by tier
- [ ] Revenue & churn analytics
- [ ] API performance metrics
- [ ] System health monitoring
- [ ] Alerting for anomalies

**Estimated Effort**: 14-21 days

---

#### 8. API Access (Institutional Tier)
**Priority**: 🟢 P2  
**Impact**: Institutional Value, Differentiation

**Capabilities**:
- [ ] RESTful API endpoints for all data
- [ ] API key generation & management
- [ ] Rate limiting by tier
- [ ] Usage tracking & quotas
- [ ] API documentation (Swagger/OpenAPI)
- [ ] SDKs (Python, JavaScript)

**Estimated Effort**: 21-30 days

---

#### 9. White-Label Reports
**Priority**: 🟢 P2  
**Impact**: Institutional Value, Branding

**Capabilities**:
- [ ] Custom logo upload
- [ ] Custom color scheme
- [ ] Custom report templates
- [ ] Remove Souvera branding (Institutional only)
- [ ] Export with client branding

**Estimated Effort**: 14-21 days

---

#### 10. Supply-Demand Matrix (Full Implementation)
**Priority**: 🟢 P2  
**Impact**: Product Differentiation, Value Prop

**Capabilities**:
- [ ] 74×8 interactive matrix
- [ ] Sector opportunity scores
- [ ] Supply-demand gap analysis
- [ ] US export opportunity sizing
- [ ] Heat map visualization
- [ ] Drill-down to country-sector pairs

**Estimated Effort**: 21-30 days

---

### Long-Term (Future Phases)

#### 11. Mobile Applications
- iOS app (native or React Native)
- Android app (native or React Native)
- Responsive web app optimization

#### 12. Collaborative Features
- Team annotations & comments
- Shared watchlists
- Collaborative reports
- Real-time updates

#### 13. AI/ML Enhancements
- Predictive analytics
- Anomaly detection
- Personalized recommendations
- Natural language queries

#### 14. Integration Marketplace
- Slack integration
- Microsoft Teams integration
- Tableau/Power BI connectors
- Export to CRM (Salesforce, HubSpot)

---

## Implementation Roadmap

### Week 1: Critical Security & Access Control

**Day 1-2: Access Control Implementation**
- Morning: Add route protection to trade intelligence modules
- Afternoon: Create `AccessUpgradeNotice` component
- Evening: Test public/explorer access flows

**Day 3-4: API Endpoint Protection**
- Morning: Add middleware for entitlement checks
- Afternoon: Protect all trade API endpoints
- Evening: Test Business/Investor API access

**Day 5: Testing & Validation**
- Morning: Comprehensive testing across all tiers
- Afternoon: Fix bugs, refine paywall messaging
- Evening: Deploy to staging, QA review

**Deliverables**:
- ✅ All trade modules require `trade_data` entitlement
- ✅ Paywall displayed for unauthorized users
- ✅ API endpoints return 403 for unauthorized requests

---

### Week 2: Super Admin & User Management

**Day 1-2: Super Admin Foundation**
- Add `super_admin` tier to entitlements
- Create `/super-admin` route with protection
- Build Super Admin dashboard layout
- Implement navigation sidebar

**Day 3-4: User Management**
- Build user management table
- Create user edit modal
- Implement subscription override
- Add ban/suspend capabilities

**Day 5: Organization Management**
- Build organization table
- Create organization detail page
- Implement seat management
- Add team activity tracker

**Deliverables**:
- ✅ Super Admin role defined and protected
- ✅ User management UI functional
- ✅ Organization management basics

---

### Week 3: Persona Dashboards

**Day 1: Dashboard Infrastructure**
- Create `/dashboard` route
- Build dashboard layout component
- Implement recently viewed tracking
- Add saved content capability

**Day 2: Explorer & Professional Dashboards**
- Build Explorer dashboard
- Build Professional dashboard
- Implement quick actions
- Add upgrade CTAs

**Day 3: Business & Investor Dashboards**
- Build Business dashboard
- Build Investor dashboard
- Implement watchlist feature
- Add usage analytics widgets

**Day 4: Institutional Dashboard**
- Build Institutional dashboard
- Implement team activity view
- Add custom dashboards capability
- Create API management widget

**Day 5: Testing & Polish**
- Test all persona dashboards
- Refine UI/UX
- Add loading states
- Deploy to staging

**Deliverables**:
- ✅ Personalized dashboards for all 6 user tiers
- ✅ Recently viewed tracking
- ✅ Saved content/watchlist features

---

### Week 4: Marketing Site CMS

**Day 1-2: Hero Slides Manager**
- Create `souvera_hero_slides` table
- Build hero slides manager UI
- Implement create/edit/delete
- Add drag-and-drop reordering
- Update home page to fetch from DB

**Day 3: Flash Banners & Pricing**
- Create `souvera_flash_banners` table
- Build flash banner editor
- Create `souvera_pricing_plans` table
- Build pricing plan editor
- Update home page components

**Day 4: Trust Logos & Feature Flags**
- Create `souvera_trust_logos` table
- Build trust logos manager
- Create `souvera_feature_flags` table
- Build feature flag toggle UI
- Implement feature flag checking

**Day 5: Integration & Testing**
- Integrate CMS with home page
- Test all CMS features
- Create admin documentation
- Deploy to production

**Deliverables**:
- ✅ Marketing site fully CMS-managed
- ✅ No code deploys for content updates
- ✅ Feature flags for gradual rollouts

---

## Success Metrics

### Week 1 (Access Control)
- [ ] Zero unauthorized access to trade modules
- [ ] 100% of API endpoints protected
- [ ] Clear paywall messaging for all tiers
- [ ] No security vulnerabilities

### Week 2 (Super Admin)
- [ ] Super Admin role operational
- [ ] User management functional
- [ ] Organization management basics complete
- [ ] Audit logging for admin actions

### Week 3 (Dashboards)
- [ ] All 6 persona dashboards live
- [ ] Recently viewed tracking works
- [ ] Saved content feature functional
- [ ] Upgrade CTAs converting at >5%

### Week 4 (CMS)
- [ ] Home page fully CMS-managed
- [ ] Zero code deploys for content updates
- [ ] Feature flags control major features
- [ ] Marketing team trained on CMS

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Access control breaks existing users | Medium | High | Thorough testing, gradual rollout, monitor errors |
| Super Admin role security vulnerability | Low | Critical | Code review, penetration testing, audit logs |
| Dashboard performance degradation | Medium | Medium | Lazy loading, caching, query optimization |
| CMS complexity overwhelms users | Low | Medium | Clear UI, documentation, training sessions |
| Feature flag misconfiguration | Medium | High | Validation rules, rollback mechanism, alerts |

---

## Next Steps

**Immediate Actions** (Today):
1. Review this plan with leadership
2. Approve roadmap and priorities
3. Assign engineering resources
4. Set up project tracking (Jira/Linear/GitHub Projects)

**This Week**:
1. Begin Week 1 implementation (Access Control)
2. Daily standups to track progress
3. Create detailed task breakdowns for each week
4. Set up staging environment for testing

**Next Week**:
1. Review Week 1 deliverables
2. Begin Week 2 implementation (Super Admin)
3. User acceptance testing for access control
4. Prepare for production deployment

---

**Plan Owner**: Souvera Platform Team  
**Reviewers**: Afronovation Leadership, Engineering, Product  
**Status**: 🔴 CRITICAL - IMMEDIATE ACTION REQUIRED  
**Last Updated**: June 12, 2026

---

## Appendix: Component Inventory

### Existing Components (To Leverage)

**UI Components** (18 files):
- `SouveraMegaNav` - Main navigation
- `SouveraFooter` - Footer
- `FlashBanner` - Announcement banner
- `AccountMenu` - User dropdown menu
- `ComplianceBanner` - Compliance disclosure

**Intelligence Components** (~50 files):
- `CountryIntelligencePanel` - Country profile
- `AfricaMapPanel` - Interactive Africa map
- `CaribbeanMapPanel` - Interactive Caribbean map
- `DirectionToggle` - Import/export toggle (shared)
- `ExportableSection` - PNG export wrapper
- `TradeDataQualityBadge` - Data quality indicators

**Landing Components** (~15 files):
- `SouveraHero` - Hero section
- `WhySouveraSection` - Value proposition
- `ProductSuiteSection` - Product showcase
- `PricingTiersSection` - Pricing cards

### New Components (To Build)

**Dashboard Components**:
- `DashboardHeader` - Welcome message, stats
- `QuickActions` - Persona-specific CTAs
- `WatchlistWidget` - Market monitoring
- `RecentlyViewedWidget` - History
- `SavedContentWidget` - Bookmarks
- `UpgradeCard` - Upgrade prompts
- `UsageStatsWidget` - Analytics

**Super Admin Components**:
- `SuperAdminNav` - Navigation sidebar
- `UserTable` - User management table
- `UserEditModal` - Edit user details
- `OrganizationTable` - Org management
- `HeroSlideEditor` - CMS hero editor
- `FlashBannerEditor` - CMS banner editor
- `PricingPlanEditor` - CMS pricing editor
- `FeatureFlagToggle` - Feature flag UI
- `AuditLogTable` - Audit log viewer
- `AnalyticsChart` - Metrics visualization

**Access Control Components**:
- `AccessUpgradeNotice` - Paywall overlay
- `FeatureTeaser` - Preview card with CTA
- `EntitlementBadge` - User plan indicator
- `UpgradeModal` - In-context upgrade flow

---

**Total New Components**: ~25  
**Total New Pages**: ~15  
**Estimated Total Effort**: 30-40 developer days  
**Recommended Team Size**: 2-3 engineers  
**Timeframe**: 4-6 weeks for complete implementation
