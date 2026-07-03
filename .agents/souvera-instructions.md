# Souvera Antigravity Project Instructions v1.0

## Project Identity
Project Name: Souvera Intelligence Terminal  
Short Name: Souvera Terminal / SIT  
Owner: Afronovation, Inc.  
Project Path: C:\Users\ikour\Projects\souvera

Souvera is a standalone SaaS intelligence platform. It is NOT an AfDEC feature and must not inherit AfDEC code, database logic, or CMS assumptions.

## Strategic Rule
AfDEC remains the NGO / institutional gateway.  
Souvera is the intelligence platform, data engine, API layer, and SaaS product.

Do not modify the AfDEC project in this phase.

## Phase 1 Objective
Build Souvera independently with:
1. New Git repository
2. New Supabase project
3. New Vercel project
4. Clean monorepo structure
5. SQL Pack v1.1 deployed
6. Data ingestion foundation
7. Lite APIs ready for future AfDEC integration

## Non-Negotiable Architecture
External Sources → Ingestion Services → Supabase → API Gateway → Intelligence UI

All intelligence data must live in Souvera only.

AfDEC must later consume Souvera through lite APIs only:
- /api/v1/countries-lite
- /api/v1/country-lite
- /api/v1/compare-lite
- /api/v1/insight-teaser

## Do Not Do
- Do not copy AfDEC intelligence map logic into Souvera.
- Do not use AfDEC Supabase.
- Do not add country intelligence tables to AfDEC.
- Do not create frontend-only access control.
- Do not call external APIs directly from UI components.
- Do not introduce unregistered data sources.
- Do not build AfDEC integration until Souvera lite APIs are operational.

## Required Documentation
Before coding, read and follow these documents in this order:

1. Souvera Master Document Index v1.1
2. Souvera PRD v2.0
3. Souvera TRD v2.0
4. Souvera Data Source & Ingestion Strategy v1.0
5. Souvera Source Registry Expanded v1.0
6. Souvera Field-by-Field Entitlement Matrix v1.1
7. Souvera SQL Pack v1.1
8. Souvera API Binding Map v1.1
9. Souvera Route-by-Route Build Spec v1.1
10. Souvera Country Intelligence Panel Spec v1.0
11. Souvera Terminal UX & Design System Spec v1.0
12. Souvera Engineering Execution Plan v1.0
13. Souvera FlowMode Execution Charter v1.0

## Initial Repo Structure
Create this structure:

/apps
  /api-gateway
  /admin-console

/packages
  /ui
  /types
  /config
  /entitlements
  /api-client

/services
  /ingestion
  /signal-engine
  /normalization

/infra
  /supabase
  /vercel

/docs
  /product
  /technical
  /data
  /ux
  /execution
  /integration

## Phase 1 Build Scope
Build only:

1. Repository structure
2. Environment setup
3. Supabase schema deployment
4. REST Countries ingestion adapter
5. World Bank ingestion adapter
6. Ingestion logging
7. Source health logging
8. /api/v1/countries-lite
9. /api/v1/country-lite
10. Basic signal computation placeholder

## Phase 1 Definition of Done
Phase 1 is complete only when:

- Souvera runs independently from AfDEC.
- Supabase schema from SQL Pack v1.1 is deployed.
- REST Countries data populates souvera_countries.
- World Bank GDP, population, and growth data populate souvera_country_observations.
- Ingestion jobs are logged.
- Source health is updated.
- /api/v1/countries-lite returns real data.
- /api/v1/country-lite?iso3=ZMB returns real data.
- No AfDEC dependency exists.

## Build Order
1. Initialize repo
2. Add documentation
3. Setup Next.js app structure
4. Setup Supabase
5. Deploy SQL Pack
6. Build ingestion adapters
7. Build lite APIs
8. Validate with real countries
9. Commit cleanly

## First Commits
Use clean commit history:

1. chore: initialize Souvera standalone project
2. docs: add Souvera architecture and execution documentation
3. infra: add Supabase SQL Pack v1.1
4. feat: add ingestion service foundation
5. feat: add REST Countries ingestion
6. feat: add World Bank ingestion
7. feat: add country lite APIs

## Validation Commands
Run after major changes:

npm install
npm run build
npm run lint

If a command fails, stop and document the issue before proceeding.

## Final Instruction
Build Souvera as if AfDEC does not exist. AfDEC integration comes later only after Souvera lite APIs are stable.
