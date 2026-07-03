# Souvera Intelligence Terminal

**Owner:** Afronovation, Inc.  
**Type:** Enterprise SaaS — Sovereign-grade Intelligence Platform  
**Status:** Phase 1 — Foundation

---

## Vision

> "The Bloomberg Terminal for African and frontier market intelligence."

Souvera is a standalone intelligence platform providing structured country intelligence, investment signals, economic insights, and strategic decision support for governments, investors, institutions, and diaspora economic actors.

## Architecture

```
External Sources → Ingestion Services → Supabase → API Gateway → Intelligence UI
```

## Monorepo Structure

```
/apps
  /api-gateway        — Next.js app (API + intelligence UI)
  /admin-console      — Admin interface

/packages
  /types              — Shared TypeScript types
  /config             — Environment + Supabase config
  /ui                 — Shared UI components
  /entitlements       — Access control logic
  /api-client         — API fetch wrappers

/services
  /ingestion          — Data source adapters
  /signal-engine      — Intelligence scoring
  /normalization      — Data transforms

/infra
  /supabase           — SQL schema + migrations
  /vercel             — Deployment configs

/docs                 — Product, technical, data, UX, execution docs
```

## Getting Started

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Fill in your Supabase credentials

# Run development server
npm run dev

# Build all packages
npm run build
```

## Phase 1 Scope

1. Repository structure + monorepo config
2. Supabase schema deployment (SQL Pack v1.1)
3. REST Countries ingestion → `souvera_countries`
4. World Bank ingestion → `souvera_country_observations`
5. `/api/v1/countries-lite` + `/api/v1/country-lite` endpoints

## Documentation

See `/docs` for complete specifications:

- **Product:** PRD v2.0
- **Technical:** TRD v2.0, SQL Pack v1.1, API Binding Map v1.1
- **Data:** Ingestion Strategy, Source Registry, Entitlement Matrix
- **UX:** Route Spec, Country Panel Spec, Design System
- **Execution:** Engineering Plan, FlowMode Charter

---

*Engineered by Afronovation, Inc.*
