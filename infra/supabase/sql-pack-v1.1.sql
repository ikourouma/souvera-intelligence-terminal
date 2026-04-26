-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.1
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1. ENUMS
-- =========================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'souvera_org_type') then
    create type souvera_org_type as enum (
      'individual',
      'business',
      'investor',
      'institutional',
      'government',
      'partner',
      'internal'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'souvera_user_role') then
    create type souvera_user_role as enum (
      'viewer',
      'analyst',
      'strategist',
      'executive',
      'org_admin',
      'platform_admin'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'souvera_subscription_status') then
    create type souvera_subscription_status as enum (
      'trial',
      'active',
      'past_due',
      'canceled',
      'expired'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'souvera_period_type') then
    create type souvera_period_type as enum (
      'daily',
      'monthly',
      'quarterly',
      'annual'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'souvera_source_status') then
    create type souvera_source_status as enum (
      'approved',
      'testing',
      'paused',
      'retired'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'souvera_job_status') then
    create type souvera_job_status as enum (
      'queued',
      'running',
      'succeeded',
      'failed',
      'partial'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'souvera_health_status') then
    create type souvera_health_status as enum (
      'healthy',
      'degraded',
      'down'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'souvera_signal_level') then
    create type souvera_signal_level as enum (
      'high_growth',
      'emerging',
      'stable',
      'watchlist',
      'risk_elevated'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'souvera_report_type') then
    create type souvera_report_type as enum (
      'country_brief',
      'business_brief',
      'investor_memo',
      'institutional_pack',
      'sector_brief'
    );
  end if;
end $$;

-- =========================================================
-- 2. UPDATED_AT TRIGGER
-- =========================================================

create or replace function public.souvera_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- 3. IDENTITY + MULTI-TENANT ACCESS
-- =========================================================

create table if not exists public.souvera_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  title text,
  organization_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_souvera_profiles_updated_at on public.souvera_profiles;
create trigger trg_souvera_profiles_updated_at
before update on public.souvera_profiles
for each row execute function public.souvera_set_updated_at();


create table if not exists public.souvera_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  org_type souvera_org_type not null default 'business',
  website text,
  country_iso3 text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_souvera_organizations_updated_at on public.souvera_organizations;
create trigger trg_souvera_organizations_updated_at
before update on public.souvera_organizations
for each row execute function public.souvera_set_updated_at();


create table if not exists public.souvera_organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.souvera_organizations(id) on delete cascade,
  user_id uuid not null references public.souvera_profiles(id) on delete cascade,
  role souvera_user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);


create table if not exists public.souvera_plans (
  id text primary key,
  name text not null,
  rank integer not null,
  description text,
  is_public boolean not null default false,
  is_enterprise boolean not null default false,
  created_at timestamptz not null default now()
);


create table if not exists public.souvera_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.souvera_profiles(id) on delete cascade,
  organization_id uuid references public.souvera_organizations(id) on delete cascade,
  plan_id text not null references public.souvera_plans(id),
  status souvera_subscription_status not null default 'active',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  constraint chk_souvera_subscription_subject check (
    user_id is not null or organization_id is not null
  )
);


create table if not exists public.souvera_entitlements (
  key text primary key,
  label text not null,
  description text,
  created_at timestamptz not null default now()
);


create table if not exists public.souvera_plan_entitlements (
  plan_id text not null references public.souvera_plans(id) on delete cascade,
  entitlement_key text not null references public.souvera_entitlements(key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (plan_id, entitlement_key)
);

-- =========================================================
-- 4. COUNTRY + SOURCE + INDICATOR REGISTRY
-- =========================================================

create table if not exists public.souvera_countries (
  id uuid primary key default gen_random_uuid(),
  iso2 text unique not null,
  iso3 text unique not null,
  name text not null,
  region text not null,
  subregion text,
  capital text,
  currency_code text,
  currency_name text,
  flag_svg_url text,
  flag_png_url text,
  lat numeric,
  lng numeric,
  is_african_country boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_souvera_countries_updated_at on public.souvera_countries;
create trigger trg_souvera_countries_updated_at
before update on public.souvera_countries
for each row execute function public.souvera_set_updated_at();


create table if not exists public.souvera_data_sources (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  domain text not null,
  provider_url text,
  api_base_url text,
  api_docs_url text,
  auth_model text,
  billing_model text,
  refresh_cadence text,
  source_status souvera_source_status not null default 'approved',
  priority_rank integer not null default 100,
  fallback_source_keys text[] not null default '{}',
  legal_status text default 'pending_review',
  redistribution_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_souvera_data_sources_updated_at on public.souvera_data_sources;
create trigger trg_souvera_data_sources_updated_at
before update on public.souvera_data_sources
for each row execute function public.souvera_set_updated_at();


create table if not exists public.souvera_indicators (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  domain text not null,
  unit text,
  description text,
  preferred_source_key text references public.souvera_data_sources(key),
  fallback_source_keys text[] not null default '{}',
  refresh_policy text,
  is_forecast boolean not null default false,
  min_plan_id text references public.souvera_plans(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_souvera_indicators_updated_at on public.souvera_indicators;
create trigger trg_souvera_indicators_updated_at
before update on public.souvera_indicators
for each row execute function public.souvera_set_updated_at();

-- =========================================================
-- 5. NORMALIZED INTELLIGENCE DATA
-- =========================================================

create table if not exists public.souvera_country_observations (
  id bigserial primary key,
  country_id uuid not null references public.souvera_countries(id) on delete cascade,
  indicator_id uuid not null references public.souvera_indicators(id) on delete cascade,
  period_date date not null,
  period_type souvera_period_type not null,
  value_numeric numeric,
  value_text text,
  source_id uuid not null references public.souvera_data_sources(id),
  source_series_key text,
  is_forecast boolean not null default false,
  is_estimate boolean not null default false,
  quality_score numeric not null default 1.0,
  fetched_at timestamptz not null default now(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (country_id, indicator_id, period_date, source_id)
);

create index if not exists idx_souvera_observations_country_indicator_period
on public.souvera_country_observations(country_id, indicator_id, period_date desc);

create index if not exists idx_souvera_observations_source_period
on public.souvera_country_observations(source_id, period_date desc);


create table if not exists public.souvera_country_profiles (
  country_id uuid primary key references public.souvera_countries(id) on delete cascade,
  summary_md text,
  why_now_md text,
  opportunity_thesis_md text,
  risk_narrative_md text,
  afdec_teaser_md text,
  signal_level souvera_signal_level,
  economic_momentum text,
  investor_readiness text,
  updated_by uuid references public.souvera_profiles(id),
  updated_at timestamptz not null default now()
);


create table if not exists public.souvera_country_sectors (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.souvera_countries(id) on delete cascade,
  sector_key text not null,
  sector_label text not null,
  strength_score numeric,
  growth_score numeric,
  attractiveness_score numeric,
  maturity text,
  rationale_md text,
  teaser_md text,
  min_plan_id text references public.souvera_plans(id),
  display_order integer not null default 0,
  updated_by uuid references public.souvera_profiles(id),
  updated_at timestamptz not null default now(),
  unique (country_id, sector_key)
);


create table if not exists public.souvera_country_trade_snapshots (
  id bigserial primary key,
  country_id uuid not null references public.souvera_countries(id) on delete cascade,
  year integer not null,
  top_exports jsonb,
  top_imports jsonb,
  top_trade_partners jsonb,
  trade_summary_md text,
  source_id uuid references public.souvera_data_sources(id),
  generated_at timestamptz not null default now(),
  unique (country_id, year)
);


create table if not exists public.souvera_country_news_signals (
  id bigserial primary key,
  country_id uuid not null references public.souvera_countries(id) on delete cascade,
  signal_date date not null,
  headline_count integer,
  risk_intensity numeric,
  opportunity_intensity numeric,
  sentiment_score numeric,
  source_mix jsonb,
  top_headlines jsonb,
  generated_at timestamptz not null default now(),
  unique (country_id, signal_date)
);


create table if not exists public.souvera_country_signal_scores (
  country_id uuid primary key references public.souvera_countries(id) on delete cascade,
  signal_level souvera_signal_level,
  growth_score numeric,
  risk_score numeric,
  investment_score numeric,
  sector_score numeric,
  news_signal_score numeric,
  confidence_score numeric not null default 1.0,
  scoring_version text not null default 'v1.0',
  computed_at timestamptz not null default now()
);


create table if not exists public.souvera_reports (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references public.souvera_countries(id) on delete cascade,
  report_type souvera_report_type not null,
  title text not null,
  summary text,
  file_path text,
  min_plan_id text not null references public.souvera_plans(id),
  published_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 6. INGESTION + SOURCE HEALTH
-- =========================================================

create table if not exists public.souvera_ingestion_jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.souvera_data_sources(id),
  job_type text not null,
  status souvera_job_status not null default 'queued',
  records_processed integer not null default 0,
  records_failed integer not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  metadata jsonb,
  created_at timestamptz not null default now()
);


create table if not exists public.souvera_source_payload_archive (
  id bigserial primary key,
  source_id uuid not null references public.souvera_data_sources(id),
  endpoint text,
  request_params jsonb,
  response_payload jsonb,
  http_status integer,
  fetched_at timestamptz not null default now()
);

create index if not exists idx_souvera_payload_source_fetched
on public.souvera_source_payload_archive(source_id, fetched_at desc);


create table if not exists public.souvera_source_health (
  source_id uuid primary key references public.souvera_data_sources(id) on delete cascade,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  failure_count integer not null default 0,
  latency_ms integer,
  status souvera_health_status not null default 'healthy',
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 7. USER ACTIONS + API + AUDIT
-- =========================================================

create table if not exists public.souvera_watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.souvera_profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);


create table if not exists public.souvera_watchlist_items (
  watchlist_id uuid not null references public.souvera_watchlists(id) on delete cascade,
  country_id uuid not null references public.souvera_countries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (watchlist_id, country_id)
);


create table if not exists public.souvera_saved_compares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.souvera_profiles(id) on delete cascade,
  name text not null,
  country_ids uuid[] not null,
  created_at timestamptz not null default now()
);


create table if not exists public.souvera_api_clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.souvera_organizations(id) on delete cascade,
  name text not null,
  key_hash text not null,
  allowed_scopes text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);


create table if not exists public.souvera_audit_events (
  id bigserial primary key,
  actor_user_id uuid references public.souvera_profiles(id),
  organization_id uuid references public.souvera_organizations(id),
  event_type text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_souvera_audit_actor_created
on public.souvera_audit_events(actor_user_id, created_at desc);

create index if not exists idx_souvera_audit_org_created
on public.souvera_audit_events(organization_id, created_at desc);

-- =========================================================
-- 8. SEED PLANS
-- =========================================================

insert into public.souvera_plans (id, name, rank, description, is_public, is_enterprise)
values
  ('public', 'Public', 0, 'Public teaser access', true, false),
  ('explorer', 'Explorer', 10, 'Basic registered access', false, false),
  ('professional', 'Professional', 20, 'Advanced individual intelligence access', false, false),
  ('business', 'Business', 30, 'Team and market-entry access', false, false),
  ('investor', 'Investor', 40, 'Investor-grade country and sector intelligence', false, true),
  ('institutional', 'Institutional', 50, 'Enterprise, API, and organizational access', false, true),
  ('platform_admin', 'Platform Admin', 100, 'Internal Afronovation platform control', false, true)
on conflict (id) do update
set name = excluded.name,
    rank = excluded.rank,
    description = excluded.description,
    is_public = excluded.is_public,
    is_enterprise = excluded.is_enterprise;

-- =========================================================
-- 9. SEED ENTITLEMENTS
-- =========================================================

insert into public.souvera_entitlements (key, label, description)
values
  ('country_identity', 'Country Identity', 'Country name, flag, region, capital, and currency'),
  ('headline_macro', 'Headline Macro', 'GDP, population, and growth teaser metrics'),
  ('full_macro', 'Full Macro Metrics', 'Full macroeconomic metric access'),
  ('forecast_metrics', 'Forecast Metrics', 'Forward-looking macro forecasts'),
  ('fx_metrics', 'FX Metrics', 'Currency and FX data'),
  ('sector_teasers', 'Sector Teasers', 'Top sector highlights'),
  ('sector_rationale', 'Sector Rationale', 'Full sector scores and rationale'),
  ('trade_snapshots', 'Trade Snapshots', 'Import, export, and trade partner summaries'),
  ('news_teasers', 'News Teasers', 'Basic country headline and signal teasers'),
  ('news_signals', 'News Signals', 'Full media pulse and sentiment indicators'),
  ('signal_scores', 'Signal Scores', 'Souvera-derived market and investment signals'),
  ('compare_lite', 'Compare Lite', 'Limited country comparison'),
  ('compare_full', 'Compare Full', 'Full comparison engine'),
  ('reports_download', 'Reports Download', 'Download country and sector reports'),
  ('investor_memos', 'Investor Memos', 'Investor-grade theses and memos'),
  ('api_lite', 'Lite API', 'Limited API access'),
  ('api_full', 'Full API', 'Institutional API access'),
  ('team_workspace', 'Team Workspace', 'Organization workspace and team features'),
  ('audit_logs', 'Audit Logs', 'Organizational audit log access'),
  ('admin_console', 'Admin Console', 'Internal platform administration')
on conflict (key) do update
set label = excluded.label,
    description = excluded.description;

-- =========================================================
-- 10. PLAN ENTITLEMENT MAPPING
-- =========================================================

delete from public.souvera_plan_entitlements;

insert into public.souvera_plan_entitlements (plan_id, entitlement_key)
values
  ('public', 'country_identity'),
  ('public', 'headline_macro'),
  ('public', 'sector_teasers'),
  ('public', 'news_teasers'),

  ('explorer', 'country_identity'),
  ('explorer', 'headline_macro'),
  ('explorer', 'sector_teasers'),
  ('explorer', 'news_teasers'),
  ('explorer', 'compare_lite'),

  ('professional', 'country_identity'),
  ('professional', 'headline_macro'),
  ('professional', 'full_macro'),
  ('professional', 'fx_metrics'),
  ('professional', 'sector_teasers'),
  ('professional', 'sector_rationale'),
  ('professional', 'news_teasers'),
  ('professional', 'news_signals'),
  ('professional', 'signal_scores'),
  ('professional', 'compare_lite'),

  ('business', 'country_identity'),
  ('business', 'headline_macro'),
  ('business', 'full_macro'),
  ('business', 'forecast_metrics'),
  ('business', 'fx_metrics'),
  ('business', 'sector_teasers'),
  ('business', 'sector_rationale'),
  ('business', 'trade_snapshots'),
  ('business', 'news_teasers'),
  ('business', 'news_signals'),
  ('business', 'signal_scores'),
  ('business', 'compare_lite'),
  ('business', 'compare_full'),
  ('business', 'reports_download'),
  ('business', 'team_workspace'),

  ('investor', 'country_identity'),
  ('investor', 'headline_macro'),
  ('investor', 'full_macro'),
  ('investor', 'forecast_metrics'),
  ('investor', 'fx_metrics'),
  ('investor', 'sector_teasers'),
  ('investor', 'sector_rationale'),
  ('investor', 'trade_snapshots'),
  ('investor', 'news_teasers'),
  ('investor', 'news_signals'),
  ('investor', 'signal_scores'),
  ('investor', 'compare_lite'),
  ('investor', 'compare_full'),
  ('investor', 'reports_download'),
  ('investor', 'investor_memos'),
  ('investor', 'api_lite'),
  ('investor', 'team_workspace'),

  ('institutional', 'country_identity'),
  ('institutional', 'headline_macro'),
  ('institutional', 'full_macro'),
  ('institutional', 'forecast_metrics'),
  ('institutional', 'fx_metrics'),
  ('institutional', 'sector_teasers'),
  ('institutional', 'sector_rationale'),
  ('institutional', 'trade_snapshots'),
  ('institutional', 'news_teasers'),
  ('institutional', 'news_signals'),
  ('institutional', 'signal_scores'),
  ('institutional', 'compare_lite'),
  ('institutional', 'compare_full'),
  ('institutional', 'reports_download'),
  ('institutional', 'investor_memos'),
  ('institutional', 'api_lite'),
  ('institutional', 'api_full'),
  ('institutional', 'team_workspace'),
  ('institutional', 'audit_logs'),

  ('platform_admin', 'country_identity'),
  ('platform_admin', 'headline_macro'),
  ('platform_admin', 'full_macro'),
  ('platform_admin', 'forecast_metrics'),
  ('platform_admin', 'fx_metrics'),
  ('platform_admin', 'sector_teasers'),
  ('platform_admin', 'sector_rationale'),
  ('platform_admin', 'trade_snapshots'),
  ('platform_admin', 'news_teasers'),
  ('platform_admin', 'news_signals'),
  ('platform_admin', 'signal_scores'),
  ('platform_admin', 'compare_lite'),
  ('platform_admin', 'compare_full'),
  ('platform_admin', 'reports_download'),
  ('platform_admin', 'investor_memos'),
  ('platform_admin', 'api_lite'),
  ('platform_admin', 'api_full'),
  ('platform_admin', 'team_workspace'),
  ('platform_admin', 'audit_logs'),
  ('platform_admin', 'admin_console');

-- =========================================================
-- 11. DATA SOURCE REGISTER WITH API LINKS
-- =========================================================

insert into public.souvera_data_sources
(key, name, domain, provider_url, api_base_url, api_docs_url, auth_model, billing_model, refresh_cadence, priority_rank, fallback_source_keys, legal_status, redistribution_notes)
values
  ('world_bank', 'World Bank Indicators API', 'macro', 'https://www.worldbank.org', 'https://api.worldbank.org/v2', 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation', 'public', 'free', 'weekly', 1, array['imf','oecd'], 'review_required', 'Use source attribution and cached normalized metrics.'),
  ('imf', 'International Monetary Fund Data API', 'forecast', 'https://www.imf.org', 'https://api.imf.org', 'https://data.imf.org/en/Resource-Pages/IMF-API', 'public', 'free', 'monthly_or_release_driven', 2, array['oecd','trading_economics'], 'review_required', 'Mark forecast and estimate data clearly.'),
  ('oecd', 'OECD Data API', 'macro_comparative', 'https://www.oecd.org', 'https://sdmx.oecd.org/public/rest/v1', 'https://www.oecd.org/en/data/insights/data-explainers/2024/09/api.html', 'public_rate_limited', 'free', 'monthly', 3, array['imf','world_bank'], 'review_required', 'Use as comparative and fallback source.'),
  ('un_comtrade', 'UN Comtrade API', 'trade', 'https://comtradeplus.un.org', 'https://comtradeapi.un.org', 'https://comtradeapi.un.org/docs', 'api_key', 'free_limited_or_premium', 'monthly_or_quarterly', 4, array['world_bank'], 'review_required', 'Store processed summaries for UI, not large raw payloads only.'),
  ('rest_countries', 'REST Countries API', 'metadata', 'https://restcountries.com', 'https://restcountries.com/v3.1', 'https://restcountries.com', 'public', 'free', 'monthly', 5, array[]::text[], 'review_required', 'Use only for country metadata, flags, names, and display fields.'),
  ('open_exchange_rates', 'Open Exchange Rates API', 'fx', 'https://openexchangerates.org', 'https://openexchangerates.org/api', 'https://docs.openexchangerates.org', 'api_key', 'freemium_or_paid', 'hourly_cached', 6, array[]::text[], 'review_required', 'Respect plan limits and cache exchange rates server-side.'),
  ('gdelt', 'GDELT Project API', 'news_signals', 'https://www.gdeltproject.org', 'https://api.gdeltproject.org/api/v2', 'https://www.gdeltproject.org/data.html', 'public', 'free', 'hourly_summary', 7, array['newsapi'], 'review_required', 'Use to derive signals, not to overwhelm UI with raw articles.'),
  ('newsapi', 'NewsAPI', 'news_headlines', 'https://newsapi.org', 'https://newsapi.org/v2', 'https://newsapi.org/docs', 'api_key', 'freemium_or_paid', 'hourly_cached', 8, array['gdelt'], 'review_required', 'Confirm production licensing before broad redistribution.'),
  ('afdb', 'African Development Bank Data Portal', 'africa_regional', 'https://dataportal.opendataforafrica.org', 'https://apiportal.opendataforafrica.org', 'https://apiportal.opendataforafrica.org', 'api_key_or_registered_access', 'free_or_partner', 'monthly', 9, array['world_bank','imf'], 'review_required', 'Use as Africa-specific enrichment and validation.'),
  ('iea', 'International Energy Agency API', 'energy', 'https://www.iea.org', 'https://api.iea.org', 'https://www.iea.org/data-and-statistics', 'bearer_token', 'enterprise_or_licensed', 'release_driven', 10, array[]::text[], 'legal_review_required', 'Phase 2+ premium energy layer; confirm license before production use.'),
  ('trading_economics', 'Trading Economics API', 'premium_macro_markets', 'https://tradingeconomics.com', 'https://api.tradingeconomics.com', 'https://docs.tradingeconomics.com', 'api_key', 'paid', 'daily_or_on_demand', 11, array['world_bank','imf'], 'legal_review_required', 'Premium fallback and institutional-grade enrichment.')
on conflict (key) do update
set name = excluded.name,
    domain = excluded.domain,
    provider_url = excluded.provider_url,
    api_base_url = excluded.api_base_url,
    api_docs_url = excluded.api_docs_url,
    auth_model = excluded.auth_model,
    billing_model = excluded.billing_model,
    refresh_cadence = excluded.refresh_cadence,
    priority_rank = excluded.priority_rank,
    fallback_source_keys = excluded.fallback_source_keys,
    legal_status = excluded.legal_status,
    redistribution_notes = excluded.redistribution_notes;

-- =========================================================
-- 12. CORE INDICATORS
-- =========================================================

insert into public.souvera_indicators
(key, label, domain, unit, description, preferred_source_key, fallback_source_keys, refresh_policy, is_forecast, min_plan_id)
values
  ('gdp_current_usd', 'GDP Current US$', 'macro', 'USD', 'Gross domestic product in current US dollars', 'world_bank', array['imf','oecd'], 'weekly', false, 'public'),
  ('gdp_growth_pct', 'GDP Growth %', 'macro', 'percent', 'Annual GDP growth percentage', 'world_bank', array['imf','oecd'], 'weekly', false, 'public'),
  ('population_total', 'Population Total', 'demographics', 'people', 'Total country population', 'world_bank', array['imf'], 'weekly', false, 'public'),
  ('fdi_net_inflows_usd', 'FDI Net Inflows US$', 'investment', 'USD', 'Foreign direct investment net inflows', 'world_bank', array['imf'], 'weekly', false, 'professional'),
  ('inflation_cpi_pct', 'Inflation CPI %', 'macro', 'percent', 'Consumer price inflation', 'world_bank', array['imf','oecd'], 'weekly', false, 'professional'),
  ('gdp_forecast_pct', 'GDP Forecast %', 'forecast', 'percent', 'Projected GDP growth', 'imf', array['trading_economics'], 'monthly_or_release_driven', true, 'business'),
  ('remittances_received_usd', 'Remittances Received US$', 'diaspora', 'USD', 'Personal remittances received', 'world_bank', array[]::text[], 'monthly', false, 'business'),
  ('fx_to_usd', 'FX to USD', 'fx', 'rate', 'Exchange rate to USD', 'open_exchange_rates', array['trading_economics'], 'hourly_cached', false, 'professional'),
  ('trade_exports_usd', 'Exports US$', 'trade', 'USD', 'Country exports value', 'un_comtrade', array['world_bank'], 'monthly_or_quarterly', false, 'business'),
  ('trade_imports_usd', 'Imports US$', 'trade', 'USD', 'Country imports value', 'un_comtrade', array['world_bank'], 'monthly_or_quarterly', false, 'business')
on conflict (key) do update
set label = excluded.label,
    domain = excluded.domain,
    unit = excluded.unit,
    description = excluded.description,
    preferred_source_key = excluded.preferred_source_key,
    fallback_source_keys = excluded.fallback_source_keys,
    refresh_policy = excluded.refresh_policy,
    is_forecast = excluded.is_forecast,
    min_plan_id = excluded.min_plan_id;

-- =========================================================
-- 13. ACCESS HELPER FUNCTIONS
-- =========================================================

create or replace function public.souvera_current_user_plan_rank()
returns integer
language sql
stable
as $$
  with direct_sub as (
    select p.rank
    from public.souvera_subscriptions s
    join public.souvera_plans p on p.id = s.plan_id
    where s.user_id = auth.uid()
      and s.status in ('trial','active')
      and (s.ends_at is null or s.ends_at > now())
    order by p.rank desc
    limit 1
  ),
  org_sub as (
    select p.rank
    from public.souvera_organization_members om
    join public.souvera_subscriptions s on s.organization_id = om.organization_id
    join public.souvera_plans p on p.id = s.plan_id
    where om.user_id = auth.uid()
      and s.status in ('trial','active')
      and (s.ends_at is null or s.ends_at > now())
    order by p.rank desc
    limit 1
  )
  select greatest(
    coalesce((select rank from direct_sub), 0),
    coalesce((select rank from org_sub), 0)
  );
$$;


create or replace function public.souvera_current_user_has_entitlement(ent_key text)
returns boolean
language sql
stable
as $$
  with active_plans as (
    select s.plan_id
    from public.souvera_subscriptions s
    where s.user_id = auth.uid()
      and s.status in ('trial','active')
      and (s.ends_at is null or s.ends_at > now())

    union

    select s.plan_id
    from public.souvera_organization_members om
    join public.souvera_subscriptions s on s.organization_id = om.organization_id
    where om.user_id = auth.uid()
      and s.status in ('trial','active')
      and (s.ends_at is null or s.ends_at > now())
  )
  select exists (
    select 1
    from public.souvera_plan_entitlements pe
    join active_plans ap on ap.plan_id = pe.plan_id
    where pe.entitlement_key = ent_key
  );
$$;


create or replace function public.souvera_plan_rank(plan_key text)
returns integer
language sql
stable
as $$
  select coalesce((select rank from public.souvera_plans where id = plan_key), 0);
$$;

-- =========================================================
-- 14. LATEST OBSERVATION VIEW
-- =========================================================

create or replace view public.souvera_latest_observations_v as
select distinct on (o.country_id, i.key)
  o.country_id,
  i.key as indicator_key,
  i.label as indicator_label,
  i.domain,
  i.unit,
  o.period_date,
  o.period_type,
  o.value_numeric,
  o.value_text,
  o.source_id,
  ds.key as source_key,
  ds.name as source_name,
  o.is_forecast,
  o.is_estimate,
  o.quality_score,
  o.fetched_at,
  o.published_at
from public.souvera_country_observations o
join public.souvera_indicators i on i.id = o.indicator_id
join public.souvera_data_sources ds on ds.id = o.source_id
order by o.country_id, i.key, o.period_date desc, o.fetched_at desc;

-- =========================================================
-- 15. PUBLIC / AFDEC-LITE COUNTRY SNAPSHOT
-- =========================================================

create or replace view public.souvera_country_lite_v as
select
  c.id as country_id,
  c.iso2,
  c.iso3,
  c.name,
  c.region,
  c.subregion,
  c.capital,
  c.currency_code,
  c.currency_name,
  c.flag_svg_url,
  c.flag_png_url,
  max(case when l.indicator_key = 'gdp_current_usd' then l.value_numeric end) as gdp_current_usd,
  max(case when l.indicator_key = 'gdp_growth_pct' then l.value_numeric end) as gdp_growth_pct,
  max(case when l.indicator_key = 'population_total' then l.value_numeric end) as population_total,
  cp.afdec_teaser_md,
  cp.signal_level,
  ss.investment_score,
  ss.confidence_score,
  greatest(
    max(l.fetched_at),
    cp.updated_at,
    ss.computed_at
  ) as freshness_at
from public.souvera_countries c
left join public.souvera_latest_observations_v l on l.country_id = c.id
left join public.souvera_country_profiles cp on cp.country_id = c.id
left join public.souvera_country_signal_scores ss on ss.country_id = c.id
where c.is_active = true
group by
  c.id, c.iso2, c.iso3, c.name, c.region, c.subregion, c.capital,
  c.currency_code, c.currency_name, c.flag_svg_url, c.flag_png_url,
  cp.afdec_teaser_md, cp.signal_level, ss.investment_score, ss.confidence_score,
  cp.updated_at, ss.computed_at;

-- =========================================================
-- 16. PROFESSIONAL SNAPSHOT
-- =========================================================

create or replace view public.souvera_country_professional_v as
select
  lite.*,
  max(case when l.indicator_key = 'fdi_net_inflows_usd' then l.value_numeric end) as fdi_net_inflows_usd,
  max(case when l.indicator_key = 'inflation_cpi_pct' then l.value_numeric end) as inflation_cpi_pct,
  max(case when l.indicator_key = 'fx_to_usd' then l.value_numeric end) as fx_to_usd,
  cp.summary_md,
  cp.why_now_md,
  cp.economic_momentum,
  cp.investor_readiness
from public.souvera_country_lite_v lite
left join public.souvera_latest_observations_v l on l.country_id = lite.country_id
left join public.souvera_country_profiles cp on cp.country_id = lite.country_id
group by
  lite.country_id, lite.iso2, lite.iso3, lite.name, lite.region, lite.subregion,
  lite.capital, lite.currency_code, lite.currency_name, lite.flag_svg_url,
  lite.flag_png_url, lite.gdp_current_usd, lite.gdp_growth_pct,
  lite.population_total, lite.afdec_teaser_md, lite.signal_level,
  lite.investment_score, lite.confidence_score, lite.freshness_at,
  cp.summary_md, cp.why_now_md, cp.economic_momentum, cp.investor_readiness;

-- =========================================================
-- 17. BUSINESS+ SNAPSHOT
-- =========================================================

create or replace view public.souvera_country_business_v as
select
  pro.*,
  max(case when l.indicator_key = 'gdp_forecast_pct' then l.value_numeric end) as gdp_forecast_pct,
  max(case when l.indicator_key = 'remittances_received_usd' then l.value_numeric end) as remittances_received_usd,
  cp.opportunity_thesis_md,
  cp.risk_narrative_md
from public.souvera_country_professional_v pro
left join public.souvera_latest_observations_v l on l.country_id = pro.country_id
left join public.souvera_country_profiles cp on cp.country_id = pro.country_id
group by
  pro.country_id, pro.iso2, pro.iso3, pro.name, pro.region, pro.subregion,
  pro.capital, pro.currency_code, pro.currency_name, pro.flag_svg_url,
  pro.flag_png_url, pro.gdp_current_usd, pro.gdp_growth_pct,
  pro.population_total, pro.afdec_teaser_md, pro.signal_level,
  pro.investment_score, pro.confidence_score, pro.freshness_at,
  pro.fdi_net_inflows_usd, pro.inflation_cpi_pct, pro.fx_to_usd,
  pro.summary_md, pro.why_now_md, pro.economic_momentum,
  pro.investor_readiness, cp.opportunity_thesis_md, cp.risk_narrative_md;

-- =========================================================
-- 18. ENABLE RLS
-- =========================================================

alter table public.souvera_profiles enable row level security;
alter table public.souvera_organizations enable row level security;
alter table public.souvera_organization_members enable row level security;
alter table public.souvera_subscriptions enable row level security;
alter table public.souvera_watchlists enable row level security;
alter table public.souvera_watchlist_items enable row level security;
alter table public.souvera_saved_compares enable row level security;
alter table public.souvera_api_clients enable row level security;
alter table public.souvera_audit_events enable row level security;

-- =========================================================
-- 19. PROFILE POLICIES
-- =========================================================

drop policy if exists "souvera_profiles_select_self" on public.souvera_profiles;
create policy "souvera_profiles_select_self"
on public.souvera_profiles
for select
using (id = auth.uid());

drop policy if exists "souvera_profiles_update_self" on public.souvera_profiles;
create policy "souvera_profiles_update_self"
on public.souvera_profiles
for update
using (id = auth.uid());

-- =========================================================
-- 20. ORGANIZATION POLICIES
-- =========================================================

drop policy if exists "souvera_orgs_select_member" on public.souvera_organizations;
create policy "souvera_orgs_select_member"
on public.souvera_organizations
for select
using (
  exists (
    select 1
    from public.souvera_organization_members om
    where om.organization_id = souvera_organizations.id
      and om.user_id = auth.uid()
  )
);

drop policy if exists "souvera_org_members_select_same_org" on public.souvera_organization_members;
create policy "souvera_org_members_select_same_org"
on public.souvera_organization_members
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.souvera_organization_members om
    where om.organization_id = souvera_organization_members.organization_id
      and om.user_id = auth.uid()
  )
);

-- =========================================================
-- 21. SUBSCRIPTION POLICIES
-- =========================================================

drop policy if exists "souvera_subscriptions_select_self_or_org" on public.souvera_subscriptions;
create policy "souvera_subscriptions_select_self_or_org"
on public.souvera_subscriptions
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.souvera_organization_members om
    where om.organization_id = souvera_subscriptions.organization_id
      and om.user_id = auth.uid()
  )
);

-- =========================================================
-- 22. WATCHLIST POLICIES
-- =========================================================

drop policy if exists "souvera_watchlists_all_own" on public.souvera_watchlists;
create policy "souvera_watchlists_all_own"
on public.souvera_watchlists
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "souvera_watchlist_items_all_own" on public.souvera_watchlist_items;
create policy "souvera_watchlist_items_all_own"
on public.souvera_watchlist_items
for all
using (
  exists (
    select 1 from public.souvera_watchlists w
    where w.id = souvera_watchlist_items.watchlist_id
      and w.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.souvera_watchlists w
    where w.id = souvera_watchlist_items.watchlist_id
      and w.user_id = auth.uid()
  )
);

-- =========================================================
-- 23. SAVED COMPARE POLICIES
-- =========================================================

drop policy if exists "souvera_compares_all_own" on public.souvera_saved_compares;
create policy "souvera_compares_all_own"
on public.souvera_saved_compares
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- =========================================================
-- 24. API CLIENT POLICIES
-- =========================================================

drop policy if exists "souvera_api_clients_select_org_admin" on public.souvera_api_clients;
create policy "souvera_api_clients_select_org_admin"
on public.souvera_api_clients
for select
using (
  public.souvera_current_user_has_entitlement('api_full')
  and exists (
    select 1
    from public.souvera_organization_members om
    where om.organization_id = souvera_api_clients.organization_id
      and om.user_id = auth.uid()
      and om.role in ('org_admin','executive')
  )
);

-- =========================================================
-- 25. AUDIT POLICIES
-- =========================================================

drop policy if exists "souvera_audit_select_institutional_org" on public.souvera_audit_events;
create policy "souvera_audit_select_institutional_org"
on public.souvera_audit_events
for select
using (
  public.souvera_current_user_has_entitlement('audit_logs')
  and exists (
    select 1
    from public.souvera_organization_members om
    where om.organization_id = souvera_audit_events.organization_id
      and om.user_id = auth.uid()
  )
);

-- =========================================================
-- 26. OPTIONAL STORAGE BUCKETS
-- Run only if Supabase storage schema is available.
-- Uncomment to create storage buckets.
-- =========================================================

-- insert into storage.buckets (id, name, public)
-- values
--   ('souvera-country-reports', 'souvera-country-reports', false),
--   ('souvera-editorial-assets', 'souvera-editorial-assets', false),
--   ('souvera-public-assets', 'souvera-public-assets', true)
-- on conflict (id) do nothing;

-- =========================================================
-- END SQL PACK v1.1
-- =========================================================
