# Country Profile Report v2 — API

Institutional Country Profile PDFs with canonical metrics, preflight integrity gating, and Puppeteer rendering.

## Endpoints

### `POST /api/v1/reports/generate` (default — backward compatible)

Returns **JSON** with `downloadUrl` (unchanged for v1 clients).

**Body**

```json
{
  "reportType": "Country Profile",
  "iso3": "NGA",
  "query": null,
  "templateVersion": "v1",
  "strict": true,
  "proofLayout": false
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `templateVersion` | `"v1"` | `"v1"` legacy template, `"v2"` institutional multi-page |
| `strict` | `true` | When `true`, preflight errors block generation (v2) |
| `proofLayout` | `false` | Internal QA only; requires `REPORTS_PROOF_LAYOUT_ALLOWED=1` or development |

**v2 on v1 endpoint:** Returns JSON with `downloadUrl` + `preflight` metadata. On preflight failure → **422** JSON (no quota consumed).

### `POST /api/v2/reports/generate` (enterprise / binary clients)

Defaults to `templateVersion: "v2"`. Returns **`application/pdf`** on success.

**Success (200)** — response headers:

- `X-Souvera-Template-Version: v2`
- `X-Souvera-Macro-As-Of: 2024`
- `X-Souvera-Policy-Verified-At: <ISO date|null>`
- `X-Souvera-Preflight-Warnings: <count>`
- `X-Request-Id: <correlation id>`

**Preflight failure (422)**

```json
{
  "ok": false,
  "error": "PREFLIGHT_FAILED",
  "preflight": {
    "passed": false,
    "iso3": "NGA",
    "errors": [{ "code": "...", "path": "...", "message": "..." }],
    "warnings": [{ "code": "POLICY_NEEDS_REVIEW", "message": "..." }]
  },
  "country": { "iso3": "NGA" },
  "generatedAt": "2026-06-02T12:00:00.000Z"
}
```

## Feature flags

| Env | Description |
|-----|-------------|
| `REPORTS_V2_ENABLED=true` | Required for `templateVersion: "v2"` |
| `REPORTS_V2_ALLOWLIST_USER_IDS` | Optional comma-separated user UUIDs |
| `REPORTS_PROOF_LAYOUT_ALLOWED=1` | Allow `proofLayout: true` in production |

If v2 is requested while disabled → **403** (no silent fallback to v1).

## Warnings vs errors

- **Errors** — contradictions between narrative/metrics or unverified policy labels → block PDF (when `strict: true`).
- **Warnings** — e.g. AGOA `needs_review` → PDF still generated; count in `X-Souvera-Preflight-Warnings`.

## Tests

```bash
cd apps/api-gateway
npx tsx scripts/test-reports-v2-api-integration.ts
npx tsx scripts/test-country-profile-v2.ts NGA
```

## v1 preservation

Non–Country Profile types and `templateVersion: "v1"` use the existing `renderReportPdfBytes` path unchanged.
