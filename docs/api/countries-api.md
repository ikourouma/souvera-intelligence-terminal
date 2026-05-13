# Countries List API Documentation

**Endpoint:** `GET /api/v1/countries`  
**Purpose:** Returns a list of countries for map visualization and country selection  
**Access:** Public (with tiered entitlement filtering)  
**Version:** 1.0 (Phase 3A)

---

## Overview

The Countries API provides a lightweight list of countries optimized for map display and country selection interfaces. It returns only essential fields needed for visualization, with data filtered based on the user's access tier.

**Key Features:**
- Server-side entitlement filtering
- Tiered data views (public, explorer, professional, business+)
- Regional filtering (Africa, Caribbean, or all)
- Curated preview data with clear labeling
- Optimized for map rendering (includes coordinates)

---

## Endpoint

```
GET /api/v1/countries?region={africa|caribbean|all}
```

---

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `region` | string | No | `all` | Filter by region: `africa`, `caribbean`, or `all` |

**Valid Values:**
- `africa` - Returns 54 African Union member states
- `caribbean` - Returns 20 Caribbean nations
- `all` - Returns all countries (74 total)

---

## Authentication

No authentication required. The endpoint works for both:
- **Unauthenticated users** (public tier)
- **Authenticated users** (entitlement-based tier)

Authentication is detected automatically via session cookies.

---

## Entitlement Behavior

The API applies server-side filtering based on user access tier:

| Field | Public | Explorer | Professional+ |
|-------|--------|----------|---------------|
| `iso2`, `iso3`, `name` | ✅ | ✅ | ✅ |
| `region`, `subregion` | ✅ | ✅ | ✅ |
| `capital`, `flagUrl` | ✅ | ✅ | ✅ |
| `lat`, `lng` | ✅ | ✅ | ✅ |
| `gdpCurrentUsd` | ✅ | ✅ | ✅ |
| `populationTotal` | ✅ | ✅ | ✅ |
| `signalLevel` | ❌ | ✅ | ✅ |
| `freshnessAt` | ✅ | ✅ | ✅ |

**Note:** Additional fields (FDI, inflation, forecasts) are available via the `/api/v1/country-lite` endpoint.

---

## Response Format

### Success Response (200)

```json
{
  "countries": [
    {
      "iso2": "NG",
      "iso3": "NGA",
      "name": "Nigeria",
      "region": "Africa",
      "subregion": "Western Africa",
      "capital": "Abuja",
      "flagUrl": "https://flagcdn.com/ng.svg",
      "lat": 9.082,
      "lng": 8.6753,
      "gdpCurrentUsd": 477380000000,
      "populationTotal": 223800000,
      "signalLevel": "emerging",
      "freshnessAt": "2026-04-28T00:00:00Z"
    }
  ],
  "meta": {
    "product": "souvera",
    "owner": "Afronovation, Inc.",
    "accessTier": "explorer",
    "authenticated": true,
    "generatedAt": "2026-04-28T22:45:00Z",
    "region": "africa",
    "count": 54,
    "previewData": true,
    "sources": [
      { "key": "rest_countries", "name": "REST Countries API" },
      { "key": "world_bank", "name": "World Bank Indicators API" }
    ]
  }
}
```

### Error Response (400)

```json
{
  "error": "Invalid region parameter",
  "valid_regions": ["africa", "caribbean", "all"],
  "example": "/api/v1/countries?region=africa"
}
```

### Error Response (500)

```json
{
  "error": "Failed to fetch countries",
  "details": "Error message details"
}
```

---

## Response Fields

### Country Object

| Field | Type | Description |
|-------|------|-------------|
| `iso2` | string | ISO 3166-1 alpha-2 code (e.g., "NG") |
| `iso3` | string | ISO 3166-1 alpha-3 code (e.g., "NGA") |
| `name` | string | Country name |
| `region` | string | Primary region ("Africa" or "Americas") |
| `subregion` | string? | Subregion classification |
| `capital` | string? | Capital city |
| `flagUrl` | string? | SVG flag URL from flagcdn.com |
| `lat` | number? | Latitude (decimal degrees) |
| `lng` | number? | Longitude (decimal degrees) |
| `gdpCurrentUsd` | number? | GDP in current USD (public tier) |
| `populationTotal` | number? | Total population (public tier) |
| `signalLevel` | string? | Investment signal ("high_growth", "emerging", "stable", "watchlist", "risk_elevated") - Explorer+ only |
| `freshnessAt` | string? | ISO timestamp of last data update |

### Meta Object

| Field | Type | Description |
|-------|------|-------------|
| `product` | string | Always "souvera" |
| `owner` | string | "Afronovation, Inc." |
| `accessTier` | string | User's plan ID |
| `authenticated` | boolean | Whether user is authenticated |
| `generatedAt` | string | ISO timestamp of response generation |
| `region` | string | Filter applied |
| `count` | number | Number of countries returned |
| `previewData` | boolean | Whether data is curated preview (true in Phase 3A) |
| `sources` | array | Data source attributions |

---

## Source & Freshness Behavior

### Data Sources

All data is attributed to approved sources:
- **REST Countries API** - Country identity, coordinates, flags
- **World Bank Indicators API** - GDP, population, growth metrics

### Data Status

**Phase 3A (Current):** 
- `previewData: true` 
- Data is curated preview from 2023-2024
- Labeled as "Curated Preview Data" in frontend
- Live data ingestion planned for Phase 4

**Freshness Timestamps:**
- `freshnessAt` indicates last data update
- Currently set to seed date (2026-04-28)
- Will reflect actual ingestion timestamps in Phase 4

---

## Preview Data Disclaimer

⚠️ **Curated Preview Data**

Data shown is from curated sources and may not reflect real-time updates. Live data feeds are in development.

**Current Status:**
- Data vintage: 2023-2024 (World Bank, IMF estimates)
- Purpose: Platform demonstration and map visualization
- Label: "Curated Preview Data" required in UI
- Live ingestion: Planned for Phase 4

---

## Caching

**Headers:**
```
Cache-Control: public, s-maxage=600, stale-while-revalidate=1200
```

- CDN/proxy cache: 10 minutes (600s)
- Stale-while-revalidate: 20 minutes (1200s)
- Browser cache: Follows `Cache-Control` directives

---

## Example Requests

### Get all African countries (public access)

```bash
curl https://souvera.vercel.app/api/v1/countries?region=africa
```

### Get Caribbean countries (authenticated)

```bash
curl https://souvera.vercel.app/api/v1/countries?region=caribbean \
  -H "Cookie: sb-access-token=..."
```

### Get all countries

```bash
curl https://souvera.vercel.app/api/v1/countries?region=all
```

---

## Integration Example

### React Component

```typescript
import { useEffect, useState } from 'react';

interface Country {
  iso3: string;
  name: string;
  lat?: number;
  lng?: number;
  gdpCurrentUsd?: number;
  signalLevel?: string;
}

export function CountryMap() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/countries?region=africa')
      .then(res => res.json())
      .then(data => {
        setCountries(data.countries);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load countries:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {countries.map(country => (
        <div key={country.iso3}>
          {country.name} - {country.signalLevel || 'N/A'}
        </div>
      ))}
    </div>
  );
}
```

---

## Related Endpoints

- **`GET /api/v1/country-lite?iso3=XXX`** - Detailed country intelligence
- **`GET /api/v1/countries`** - This endpoint (country list)

Use `/api/v1/countries` for:
- Map visualization
- Country selection dropdowns
- Overview dashboards

Use `/api/v1/country-lite` for:
- Detailed country profiles
- Full metric display
- Investment analysis

---

## Rate Limiting

No rate limiting in Phase 3A. Rate limiting will be implemented in Phase 4 based on access tier.

---

## Changelog

**Version 1.0 (Phase 3A - April 2026)**
- Initial release
- 54 African countries
- 20 Caribbean countries
- Curated preview data
- Server-side entitlement filtering
- Regional filtering support

---

## Support

For API issues or questions, contact:
- **Product:** Souvera Intelligence Terminal
- **Owner:** Afronovation, Inc.
- **Documentation:** https://souvera.vercel.app/resources/api
