# Report storage and schema audit

**Audit date:** 2026-06-04  
**Scope:** `souvera_report_requests`, Supabase Storage `reports` bucket, api-gateway PDF pipeline.

---

## Storage upload path format

| Item | Value |
|------|--------|
| **Bucket ID / name** | `reports` (private) |
| **Object path pattern** | `{user_id}/{request_id}.pdf` |
| **Example** | `a1b2c3d4-...-user-uuid/f4e5d6c7-...-request-uuid.pdf` |
| **MIME type** | `application/pdf` |
| **Upload option** | `upsert: true` (re-upload overwrites same object for that request) |

### Implementation

| Function / file | Role |
|-----------------|------|
| `apps/api-gateway/src/lib/reports/process-report-request.ts` | `storagePath = \`${request.user_id}/${requestId}.pdf\`` then `supabase.storage.from('reports').upload(...)` |
| `apps/api-gateway/src/lib/reports/ensure-reports-bucket.ts` | Ensures bucket exists at runtime (service role) |
| `infra/supabase/migrations/create-reports-storage-bucket.sql` | Creates `reports` bucket + service_role policy on `storage.objects` |

Signed URL TTL after upload: **7 days** (`60 * 60 * 24 * 7` seconds).

---

## Download mechanics

| Path | Behavior |
|------|----------|
| **Primary (UI)** | JSON includes `downloadUrl` — Supabase **signed URL** to the stored object. UI opens link in new tab (`<a href={downloadUrl} target="_blank">`). |
| **v2 direct PDF** | `POST /api/v2/reports/generate` returns **raw PDF bytes** with `Content-Type: application/pdf` and `Content-Disposition` (legacy hardcoded `country-profile-{iso3}-v2.pdf`). |
| **v1 generate** | `POST /api/v1/reports/generate` returns JSON with `downloadUrl` (signed URL), not inline bytes. |
| **History** | `GET /api/v1/reports/history` returns `downloadUrl` + `storagePath` per row. |

**Content-Disposition today:** only on `/api/v2/reports/generate` via `buildV2PdfResponseHeaders()` in `reports-v2-api.ts`. Signed-url downloads do **not** set filename server-side unless the client uses `download` attribute or a proxy.

**UI filename today:** none — browser uses URL/storage default, not `[country]_[report]_[timestamp].pdf`.

---

## DB schema

### `public.souvera_report_requests`

Defined in `infra/supabase/migrations/create-report-requests-table.sql`, extended by `add-report-requests-sector-key.sql` and `add-report-requests-template-metadata.sql`.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID PK | Request / correlation id; **embedded in storage path** |
| `user_id` | UUID FK → `auth.users` | Owner; **storage path prefix** |
| `country_id` | UUID FK → `souvera_countries` | Optional link |
| `iso3` | TEXT | Country code |
| `report_type` | TEXT | Legacy product label (`Country Profile`, `Sector Deep-Dive`, …) |
| `status` | `souvera_report_request_status` enum | `queued` → `processing` → `completed` \| `failed` |
| `query_text` | TEXT | AI custom query |
| `file_path` | TEXT | Storage object path (`{user_id}/{id}.pdf`) |
| `download_url` | TEXT | Cached signed URL (expires) |
| `error_message` | TEXT | Failure reason |
| `metadata` | JSONB | e.g. `sectorKey` |
| `sector_key` | TEXT | Canonical sector taxonomy key (Sector Deep-Dive) |
| `template_id` | TEXT | Canonical template id (post-migration) |
| `report_filename` | TEXT | User-facing download filename |
| `generator_used` | TEXT | Generator function id for audit |
| `generated_at_utc` | TIMESTAMPTZ | PDF generation timestamp (UTC) |
| `created_at` | TIMESTAMPTZ | Row created |
| `updated_at` | TIMESTAMPTZ | Row updated |
| `completed_at` | TIMESTAMPTZ | Completion time |

**No separate “report results” table** — artifacts live in Storage; metadata in `souvera_report_requests`.

### Related tables

| Table | Relation |
|-------|----------|
| `souvera_report_usage` | Monthly quota (`create-report-quota-tables.sql`) |
| `souvera_reports` | Legacy sql-pack table; **not** used by current PDF pipeline |

### Migrations (in order)

1. `infra/supabase/migrations/create-report-requests-table.sql`
2. `infra/supabase/migrations/create-reports-storage-bucket.sql`
3. `infra/supabase/migrations/create-report-quota-tables.sql`
4. `infra/supabase/migrations/add-report-requests-sector-key.sql`
5. `infra/supabase/migrations/add-report-requests-template-metadata.sql`

---

## Caching and idempotency risks

| Risk | Detail |
|------|--------|
| **Completed request short-circuit** | If `status === 'completed'` and `download_url` is set, `processReportRequest` returns cached URL **without re-rendering**. Regenerate requires a **new** request row (new `id` → new storage path). |
| **Same request re-process** | Upload uses `upsert: true` on `{user_id}/{requestId}.pdf` — safe overwrite for that id only. |
| **Stale signed URL** | `download_url` stored on row; URLs expire after 7 days. History may show dead links unless refreshed. |
| **Cross-request reuse** | **No** — each generation gets a new UUID path. No shared cache key by country/report type. |

---

## Post-audit changes (Phase 1–3)

- Canonical `template_id` registry (`template-registry.ts`); client-safe constants in `template-ids.ts`.
- Country Profile v1 HTML archived under `_archived/country-profile-v1/` (rollback via `REPORTS_ROLLBACK_COUNTRY_PROFILE_V1`).
- Download filenames via `formatReportDownloadFilename()` + `report_filename` column; proxy `GET /api/v1/reports/download/[requestId]` sets `Content-Disposition` without changing storage paths.
- **Generate always inserts a new request row**; `allowCachedCompleted` defaults to `false` (cache only for explicit idempotent retries).
- **v1 and v2 generate routes** both return JSON with `downloadProxyUrl` + `downloadFilename` (raw inline PDF deprecated).
- QA stamp: `REPORTS_SHOW_TEMPLATE_STAMP=true` adds `Template: country_profile_template` footer to Country Profile PDF.
