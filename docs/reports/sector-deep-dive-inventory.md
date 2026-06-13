# Sector Deep-Dive inventory

Documentation snapshot: 2026-05-31.

## 1) Regional hub sectors (marketing / navigation)

Defined in `apps/api-gateway/src/components/regional/SectorLandscapeGrid.tsx`:

### Africa (`AFRICA_SECTORS`)

| Key | Display name | Hub link |
|-----|--------------|----------|
| `fintech` | Fintech | `/sectors/fintech` |
| `energy` | Energy | `/sectors/energy` |
| `critical-minerals` | Mining & Critical Minerals | `/sectors/critical-minerals` |
| `agriculture` | Agriculture & Agritech | `/sectors/agriculture` |
| `logistics` | Logistics & Trade | `/sectors/logistics` |
| `tourism` | Tourism & Hospitality | `/sectors/tourism` → redirects to `/sectors/tourism-hospitality` |

### Caribbean (`CARIBBEAN_SECTORS`)

| Key | Display name | Hub link |
|-----|--------------|----------|
| `tourism` | Tourism & Hospitality | `/sectors/tourism-hospitality` |
| `energy` | Energy & LNG | `/sectors/energy` |
| `fintech` | Fintech & Digital Finance | `/sectors/fintech` |
| `logistics` | Logistics & Trade | `/sectors/logistics` |
| `agriculture` | Agriculture | `/sectors/agriculture` |

---

## 2) Sector overview pages (slug registry)

`apps/api-gateway/src/data/sectors/sector-overviews.ts`:

| Slug | Title | Route |
|------|-------|-------|
| `fintech` | Fintech & Digital Finance | `/sectors/fintech` |
| `energy` | Energy & Renewables | `/sectors/energy` |
| `logistics` | Logistics & Trade | `/sectors/logistics` |
| `agriculture` | Agriculture & Agritech | `/sectors/agriculture` |
| `critical-minerals` | Critical Minerals | `/sectors/critical-minerals` |
| `tourism-hospitality` | Tourism & Hospitality | `/sectors/tourism-hospitality` |
| `digital-infrastructure` | Digital Infrastructure | `/sectors/digital-infrastructure` |

Legacy: `/sectors/tourism` → redirect to `tourism-hospitality` (`apps/api-gateway/src/app/sectors/tourism/page.tsx`).

---

## 3) Reports hub — Sector Deep-Dive dropdown

**Source of truth:** `apps/api-gateway/src/lib/sectors/sector-taxonomy.ts`  
**UI:** `apps/api-gateway/src/components/intelligence/tabs/ReportsTab.tsx` — taxonomy-driven `<select>` with `sectorKey`  
**API:** `POST /api/v1/reports/generate` includes `sectorKey` + `templateVersion: v2` for Sector Deep-Dive  
**PDF:** `generate-sector-deep-dive-v2.ts` → `sector-deep-dive-v2-html.ts` (Puppeteer)

**Deep-dive supported sectors (Africa):** technology, agriculture, energy, manufacturing, mining, **tourism_hospitality**  
**Caribbean:** technology, agriculture, energy, tourism_hospitality (no manufacturing/mining)

---

## 4) Per-country terminal sectors (DB)

**Table:** `souvera_country_sectors`  
**API:** `apps/api-gateway/src/app/api/v1/country/[iso3]/route.ts` exposes `sectorKey`, `sector_label`, scores, teaser, rationale.

### Nigeria (seed reference)

**File:** `infra/supabase/seed-nigeria-sectors.sql`

| sector_key | sector_label |
|------------|--------------|
| `technology` | Technology & Software |
| `agriculture` | Agriculture & Food Processing |
| `energy` | Energy & Power |
| `manufacturing` | Manufacturing |
| `mining` | Mining & Minerals |

**Tourism:** not in NGA seed (aligned with dropdown gap).

### Broader Africa

Stage-2 SQL packs (`sql-pack-v1.13a`–`v1.13c`) insert sector rows per ISO3 with `sector_key` + `sector_label` — coverage varies by country batch.

---

## 5) UI icon mapping (display only)

`apps/api-gateway/src/components/intelligence/EntitledSectorList.tsx` — `getSectorIcon()` matches labels containing tourism, fintech, energy, etc. Tourism icon works if **label** includes "tourism" or "hospitality".

---

## 6) Recommendations (documentation only)

1. Add **Tourism & Hospitality** to Reports dropdown; align label with `tourism-hospitality` slug.  
2. Replace hardcoded dropdown with **union of** hub slugs + country-specific `sector_label` from API.  
3. Pass `sectorKey` / `sectorLabel` on report generate request for Sector Deep-Dive.  
4. Add Sector Deep-Dive v2 template section mirroring `SectorsTab` + scorecard methodology.

Machine-readable snapshot: `tmp/sector-inventory.json`.
