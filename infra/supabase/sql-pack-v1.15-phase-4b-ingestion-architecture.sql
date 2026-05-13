-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.15 — PHASE 4B INGESTION ARCHITECTURE ADDENDUM
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- Date: 2026-05-06
-- 
-- Implements: Admin-managed source ingestion, file assets,
-- policy monitoring, and approval workflows.
--
-- Governance: API-first where available. Admin-managed where
-- necessary. Source-attributed always. Published only after approval.
-- =========================================================

-- =========================================================
-- 1. NEW ENUMS FOR INGESTION ARCHITECTURE
-- =========================================================

DO $$
BEGIN
  -- Source ingestion method
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_ingestion_method') THEN
    CREATE TYPE souvera_ingestion_method AS ENUM (
      'api_connector',
      'manual_upload',
      'admin_file_fetch',
      'monitored_source',
      'reference_link_only'
    );
  END IF;

  -- File asset type
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_file_type') THEN
    CREATE TYPE souvera_file_type AS ENUM (
      'csv',
      'xlsx',
      'json',
      'xml',
      'pdf',
      'html',
      'text',
      'other'
    );
  END IF;

  -- Ingestion batch status
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_batch_status') THEN
    CREATE TYPE souvera_batch_status AS ENUM (
      'uploaded',
      'stored',
      'parsing',
      'parsed',
      'mapping',
      'mapped',
      'validating',
      'validated',
      'under_review',
      'approved',
      'publishing',
      'published',
      'rejected',
      'superseded',
      'rolled_back',
      'failed'
    );
  END IF;

  -- Row validation status
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_row_status') THEN
    CREATE TYPE souvera_row_status AS ENUM (
      'pending',
      'valid',
      'invalid',
      'warning',
      'mapped',
      'approved',
      'rejected',
      'published'
    );
  END IF;

  -- Policy data status (lifecycle)
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_policy_status') THEN
    CREATE TYPE souvera_policy_status AS ENUM (
      'detected',
      'parsed',
      'drafted',
      'under_review',
      'approved',
      'published',
      'rejected',
      'stale'
    );
  END IF;

  -- Monitor type
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_monitor_type') THEN
    CREATE TYPE souvera_monitor_type AS ENUM (
      'api_poll',
      'page_hash',
      'link_detection',
      'rss_feed',
      'file_link',
      'document_detection'
    );
  END IF;

  -- Change event type
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_change_event_type') THEN
    CREATE TYPE souvera_change_event_type AS ENUM (
      'new_document',
      'page_changed',
      'content_updated',
      'link_added',
      'file_updated',
      'status_changed',
      'api_response_changed'
    );
  END IF;

  -- Review action
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_review_action') THEN
    CREATE TYPE souvera_review_action AS ENUM (
      'approve',
      'reject',
      'request_changes',
      'escalate',
      'defer'
    );
  END IF;
END $$;

-- =========================================================
-- 2. EXTEND DATA SOURCES TABLE
-- =========================================================

-- Add ingestion method to data sources
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_data_sources' AND column_name = 'ingestion_method'
  ) THEN
    ALTER TABLE public.souvera_data_sources 
    ADD COLUMN ingestion_method souvera_ingestion_method NOT NULL DEFAULT 'manual_upload';
  END IF;

  -- Add fallback method
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_data_sources' AND column_name = 'fallback_ingestion_method'
  ) THEN
    ALTER TABLE public.souvera_data_sources 
    ADD COLUMN fallback_ingestion_method souvera_ingestion_method;
  END IF;

  -- Add API endpoint for API sources
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_data_sources' AND column_name = 'api_endpoint'
  ) THEN
    ALTER TABLE public.souvera_data_sources 
    ADD COLUMN api_endpoint TEXT;
  END IF;

  -- Add monitor URL for monitored sources
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_data_sources' AND column_name = 'monitor_url'
  ) THEN
    ALTER TABLE public.souvera_data_sources 
    ADD COLUMN monitor_url TEXT;
  END IF;

  -- Add file download URL for admin_file_fetch
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_data_sources' AND column_name = 'file_download_url'
  ) THEN
    ALTER TABLE public.souvera_data_sources 
    ADD COLUMN file_download_url TEXT;
  END IF;
END $$;

-- =========================================================
-- 3. SOURCE FILE ASSETS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_source_file_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.souvera_data_sources(id) ON DELETE CASCADE,
  
  -- File metadata
  file_name TEXT NOT NULL,
  file_type souvera_file_type NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  
  -- Storage
  storage_path TEXT NOT NULL,                    -- Supabase storage path
  storage_bucket TEXT NOT NULL DEFAULT 'source-files',
  original_url TEXT,                             -- URL if fetched externally
  
  -- Fetch metadata
  fetch_method TEXT,                             -- 'upload', 'fetch', 'monitor'
  fetched_at TIMESTAMPTZ,
  fetched_by UUID REFERENCES public.souvera_profiles(id),
  
  -- Checksums
  file_hash_sha256 TEXT,
  content_hash TEXT,                             -- For change detection
  
  -- PDF-specific
  is_pdf_evidence BOOLEAN NOT NULL DEFAULT FALSE,
  pdf_page_count INTEGER,
  pdf_extracted_text TEXT,
  pdf_extraction_status TEXT,                    -- 'pending', 'extracted', 'failed', 'not_applicable'
  
  -- Source attribution
  source_document_title TEXT,
  source_document_date DATE,
  source_document_url TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_souvera_source_file_assets_updated_at ON public.souvera_source_file_assets;
CREATE TRIGGER trg_souvera_source_file_assets_updated_at
BEFORE UPDATE ON public.souvera_source_file_assets
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_souvera_file_assets_source 
ON public.souvera_source_file_assets(source_id, created_at DESC);

-- =========================================================
-- 4. SOURCE FILE INGESTION BATCHES
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_source_file_ingestion_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.souvera_data_sources(id),
  file_asset_id UUID REFERENCES public.souvera_source_file_assets(id),
  
  -- Batch metadata
  batch_name TEXT,
  batch_description TEXT,
  
  -- Status lifecycle
  status souvera_batch_status NOT NULL DEFAULT 'uploaded',
  
  -- Source attribution (required)
  source_name TEXT NOT NULL,
  source_url TEXT,
  as_of_date DATE NOT NULL,
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Confidence
  source_confidence souvera_confidence_level NOT NULL DEFAULT 'curated',
  
  -- Parsing results
  total_rows INTEGER,
  valid_rows INTEGER,
  invalid_rows INTEGER,
  warning_rows INTEGER,
  
  -- Column mapping
  mapping_template_id UUID,
  column_mapping JSONB,                          -- Source column → target field mapping
  
  -- Review
  reviewed_by UUID REFERENCES public.souvera_profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Approval
  approved_by UUID REFERENCES public.souvera_profiles(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Publication
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES public.souvera_profiles(id),
  
  -- Supersession
  supersedes_batch_id UUID REFERENCES public.souvera_source_file_ingestion_batches(id),
  superseded_by_batch_id UUID,
  superseded_at TIMESTAMPTZ,
  
  -- Rollback
  rolled_back_at TIMESTAMPTZ,
  rolled_back_by UUID REFERENCES public.souvera_profiles(id),
  rollback_reason TEXT,
  
  -- Error tracking
  error_message TEXT,
  error_details JSONB,
  
  -- Ingestion run link
  ingestion_run_id UUID REFERENCES public.souvera_data_ingestion_runs(id),
  
  -- Audit
  created_by UUID NOT NULL REFERENCES public.souvera_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_souvera_file_ingestion_batches_updated_at ON public.souvera_source_file_ingestion_batches;
CREATE TRIGGER trg_souvera_file_ingestion_batches_updated_at
BEFORE UPDATE ON public.souvera_source_file_ingestion_batches
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_souvera_batches_source_status 
ON public.souvera_source_file_ingestion_batches(source_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_souvera_batches_status 
ON public.souvera_source_file_ingestion_batches(status) WHERE status IN ('under_review', 'approved', 'published');

-- =========================================================
-- 5. SOURCE FILE INGESTION ROWS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_source_file_ingestion_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.souvera_source_file_ingestion_batches(id) ON DELETE CASCADE,
  
  -- Row position
  row_number INTEGER NOT NULL,
  
  -- Raw data
  raw_data JSONB NOT NULL,
  
  -- Parsed/mapped data
  mapped_data JSONB,
  
  -- Country mapping
  source_country_value TEXT,                     -- Original value from file
  mapped_country_id UUID REFERENCES public.souvera_countries(id),
  mapped_iso3 TEXT,
  
  -- Validation
  status souvera_row_status NOT NULL DEFAULT 'pending',
  validation_errors JSONB,                       -- Array of {code, message, field, value}
  validation_warnings JSONB,
  
  -- Flags
  is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
  is_excluded BOOLEAN NOT NULL DEFAULT FALSE,    -- ESH rejected
  exclusion_reason TEXT,
  
  -- Admin override
  admin_override BOOLEAN NOT NULL DEFAULT FALSE,
  override_by UUID REFERENCES public.souvera_profiles(id),
  override_reason TEXT,
  
  -- Publication tracking
  published_at TIMESTAMPTZ,
  target_table TEXT,                             -- Where the row was published
  target_record_id UUID,                         -- ID of published record
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_souvera_file_ingestion_rows_updated_at ON public.souvera_source_file_ingestion_rows;
CREATE TRIGGER trg_souvera_file_ingestion_rows_updated_at
BEFORE UPDATE ON public.souvera_source_file_ingestion_rows
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_souvera_ingestion_rows_batch 
ON public.souvera_source_file_ingestion_rows(batch_id, row_number);

CREATE INDEX IF NOT EXISTS idx_souvera_ingestion_rows_status 
ON public.souvera_source_file_ingestion_rows(batch_id, status);

-- =========================================================
-- 6. SOURCE COLUMN MAPPINGS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_source_column_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.souvera_data_sources(id) ON DELETE CASCADE,
  
  -- Mapping definition
  source_column_name TEXT NOT NULL,
  source_column_index INTEGER,
  target_field_name TEXT NOT NULL,
  target_table TEXT NOT NULL,
  
  -- Transformation
  transform_type TEXT,                           -- 'none', 'uppercase', 'date_parse', 'numeric', 'country_lookup'
  transform_config JSONB,
  
  -- Validation rules
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  validation_rules JSONB,                        -- Array of {rule_type, config}
  
  -- Default value
  default_value TEXT,
  
  -- Active
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Audit
  created_by UUID REFERENCES public.souvera_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (source_id, source_column_name, target_field_name)
);

DROP TRIGGER IF EXISTS trg_souvera_column_mappings_updated_at ON public.souvera_source_column_mappings;
CREATE TRIGGER trg_souvera_column_mappings_updated_at
BEFORE UPDATE ON public.souvera_source_column_mappings
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

-- =========================================================
-- 7. SOURCE INGESTION TEMPLATES
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_source_ingestion_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.souvera_data_sources(id),
  
  -- Template metadata
  template_name TEXT NOT NULL,
  template_description TEXT,
  
  -- Target configuration
  target_table TEXT NOT NULL,
  target_data_type TEXT,                         -- 'agoa_status', 'afcfta_status', 'indicator_value', etc.
  
  -- Column mapping template
  column_mappings JSONB NOT NULL,                -- Array of column mapping definitions
  
  -- Validation configuration
  validation_config JSONB,
  
  -- Country field configuration
  country_column TEXT,
  country_mapping_type TEXT,                     -- 'iso3', 'iso2', 'name', 'census_code', 'comtrade_code'
  
  -- Required fields
  required_columns TEXT[] NOT NULL DEFAULT '{}',
  
  -- Defaults
  default_confidence souvera_confidence_level DEFAULT 'curated',
  
  -- Active
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Audit
  created_by UUID REFERENCES public.souvera_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_souvera_ingestion_templates_updated_at ON public.souvera_source_ingestion_templates;
CREATE TRIGGER trg_souvera_ingestion_templates_updated_at
BEFORE UPDATE ON public.souvera_source_ingestion_templates
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

-- =========================================================
-- 8. POLICY SOURCE MONITORS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_policy_source_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.souvera_data_sources(id) ON DELETE CASCADE,
  
  -- Monitor configuration
  monitor_name TEXT NOT NULL,
  monitor_type souvera_monitor_type NOT NULL,
  monitor_url TEXT NOT NULL,
  
  -- API-specific
  api_endpoint TEXT,
  api_params JSONB,
  api_headers JSONB,
  
  -- Page monitoring
  page_selector TEXT,                            -- CSS selector for content to monitor
  link_patterns TEXT[],                          -- Regex patterns for links to detect
  
  -- RSS/Feed
  feed_url TEXT,
  
  -- Schedule
  check_interval_minutes INTEGER NOT NULL DEFAULT 60,
  last_check_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ,
  
  -- Last known state
  last_content_hash TEXT,
  last_response_status INTEGER,
  last_error_message TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  
  -- Keywords for detection
  keywords TEXT[] NOT NULL DEFAULT '{}',         -- e.g., ['AGOA', 'eligibility', 'determination']
  
  -- Active
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Audit
  created_by UUID REFERENCES public.souvera_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_souvera_policy_monitors_updated_at ON public.souvera_policy_source_monitors;
CREATE TRIGGER trg_souvera_policy_monitors_updated_at
BEFORE UPDATE ON public.souvera_policy_source_monitors
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

-- =========================================================
-- 9. POLICY SOURCE SNAPSHOTS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_policy_source_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES public.souvera_policy_source_monitors(id) ON DELETE CASCADE,
  
  -- Snapshot metadata
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Content
  content_hash TEXT NOT NULL,
  content_preview TEXT,                          -- First N characters for quick review
  full_content TEXT,                             -- Full captured content (if small enough)
  
  -- Storage for large content
  storage_path TEXT,
  storage_bucket TEXT,
  
  -- Response metadata
  response_status INTEGER,
  response_headers JSONB,
  
  -- Detected changes
  has_changed BOOLEAN NOT NULL DEFAULT FALSE,
  change_summary TEXT,
  detected_links TEXT[],
  detected_documents JSONB,                      -- Array of {title, url, type}
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_souvera_snapshots_monitor 
ON public.souvera_policy_source_snapshots(monitor_id, snapshot_at DESC);

-- =========================================================
-- 10. POLICY CHANGE EVENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_policy_change_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES public.souvera_policy_source_monitors(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES public.souvera_policy_source_snapshots(id),
  
  -- Event type
  event_type souvera_change_event_type NOT NULL,
  
  -- Event details
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_url TEXT,
  event_date DATE,
  
  -- Source document (if detected)
  document_title TEXT,
  document_url TEXT,
  document_type TEXT,                            -- 'notice', 'determination', 'press_release', etc.
  
  -- Extracted data
  extracted_data JSONB,                          -- Parsed data from the event
  
  -- Keywords matched
  matched_keywords TEXT[],
  
  -- Policy status lifecycle
  status souvera_policy_status NOT NULL DEFAULT 'detected',
  
  -- Review assignment
  assigned_to UUID REFERENCES public.souvera_profiles(id),
  assigned_at TIMESTAMPTZ,
  
  -- Review
  reviewed_by UUID REFERENCES public.souvera_profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  review_action souvera_review_action,
  
  -- Approval
  approved_by UUID REFERENCES public.souvera_profiles(id),
  approved_at TIMESTAMPTZ,
  
  -- Publication
  published_at TIMESTAMPTZ,
  published_to_table TEXT,
  published_record_id UUID,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_souvera_change_events_updated_at ON public.souvera_policy_change_events;
CREATE TRIGGER trg_souvera_change_events_updated_at
BEFORE UPDATE ON public.souvera_policy_change_events
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_souvera_change_events_status 
ON public.souvera_policy_change_events(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_souvera_change_events_review 
ON public.souvera_policy_change_events(status, assigned_to) 
WHERE status IN ('detected', 'parsed', 'drafted', 'under_review');

-- =========================================================
-- 11. POLICY REVIEW QUEUE
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_policy_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source reference
  source_type TEXT NOT NULL,                     -- 'change_event', 'ingestion_batch', 'manual_entry'
  source_id UUID NOT NULL,                       -- ID of the source record
  
  -- Review item
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 50,          -- 1-100, higher = more urgent
  
  -- Policy type
  policy_type TEXT,                              -- 'agoa', 'afcfta', 'trade', etc.
  country_iso3 TEXT,
  
  -- Status
  status souvera_policy_status NOT NULL DEFAULT 'under_review',
  
  -- Assignment
  assigned_to UUID REFERENCES public.souvera_profiles(id),
  assigned_at TIMESTAMPTZ,
  
  -- Due date
  due_at TIMESTAMPTZ,
  
  -- Review
  reviewed_by UUID REFERENCES public.souvera_profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  review_action souvera_review_action,
  
  -- Approval
  approved_by UUID REFERENCES public.souvera_profiles(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Completion
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.souvera_profiles(id),
  
  -- Audit
  created_by UUID REFERENCES public.souvera_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_souvera_review_queue_updated_at ON public.souvera_policy_review_queue;
CREATE TRIGGER trg_souvera_review_queue_updated_at
BEFORE UPDATE ON public.souvera_policy_review_queue
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_souvera_review_queue_status 
ON public.souvera_policy_review_queue(status, priority DESC, created_at);

CREATE INDEX IF NOT EXISTS idx_souvera_review_queue_assigned 
ON public.souvera_policy_review_queue(assigned_to, status) 
WHERE status IN ('under_review');

-- =========================================================
-- 12. EXTEND TRADE POLICY STATUSES
-- =========================================================

-- Add publication lifecycle columns
DO $$
BEGIN
  -- Policy status lifecycle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_trade_policy_statuses' AND column_name = 'agoa_publication_status'
  ) THEN
    ALTER TABLE public.souvera_trade_policy_statuses 
    ADD COLUMN agoa_publication_status souvera_policy_status DEFAULT 'published';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_trade_policy_statuses' AND column_name = 'afcfta_publication_status'
  ) THEN
    ALTER TABLE public.souvera_trade_policy_statuses 
    ADD COLUMN afcfta_publication_status souvera_policy_status DEFAULT 'published';
  END IF;

  -- Batch references
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_trade_policy_statuses' AND column_name = 'agoa_batch_id'
  ) THEN
    ALTER TABLE public.souvera_trade_policy_statuses 
    ADD COLUMN agoa_batch_id UUID REFERENCES public.souvera_source_file_ingestion_batches(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_trade_policy_statuses' AND column_name = 'afcfta_batch_id'
  ) THEN
    ALTER TABLE public.souvera_trade_policy_statuses 
    ADD COLUMN afcfta_batch_id UUID REFERENCES public.souvera_source_file_ingestion_batches(id);
  END IF;
END $$;

-- =========================================================
-- 13. HELPER FUNCTIONS
-- =========================================================

-- Function to create a review queue item from a change event
CREATE OR REPLACE FUNCTION public.souvera_create_review_from_event(
  p_event_id UUID,
  p_priority INTEGER DEFAULT 50
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_event RECORD;
  v_review_id UUID;
BEGIN
  -- Get event details
  SELECT * INTO v_event
  FROM public.souvera_policy_change_events
  WHERE id = p_event_id;

  IF v_event IS NULL THEN
    RAISE EXCEPTION 'Event not found: %', p_event_id;
  END IF;

  -- Create review queue item
  INSERT INTO public.souvera_policy_review_queue (
    source_type,
    source_id,
    title,
    description,
    priority,
    policy_type,
    status
  ) VALUES (
    'change_event',
    p_event_id,
    v_event.event_title,
    v_event.event_description,
    p_priority,
    CASE 
      WHEN v_event.event_title ILIKE '%AGOA%' THEN 'agoa'
      WHEN v_event.event_title ILIKE '%AfCFTA%' THEN 'afcfta'
      ELSE 'trade'
    END,
    'under_review'
  )
  RETURNING id INTO v_review_id;

  -- Update event status
  UPDATE public.souvera_policy_change_events
  SET status = 'under_review', updated_at = NOW()
  WHERE id = p_event_id;

  RETURN v_review_id;
END;
$$;

-- Function to validate batch rows against 74-market scope
CREATE OR REPLACE FUNCTION public.souvera_validate_batch_rows(
  p_batch_id UUID
)
RETURNS TABLE (
  valid_count INTEGER,
  invalid_count INTEGER,
  excluded_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update row validation status based on country mapping
  UPDATE public.souvera_source_file_ingestion_rows r
  SET 
    status = CASE
      WHEN r.mapped_iso3 = 'ESH' THEN 'invalid'
      WHEN r.mapped_country_id IS NOT NULL THEN 'valid'
      ELSE 'invalid'
    END,
    is_excluded = (r.mapped_iso3 = 'ESH'),
    exclusion_reason = CASE 
      WHEN r.mapped_iso3 = 'ESH' THEN 'ESH/Western Sahara excluded from public scope'
      ELSE NULL
    END,
    validation_errors = CASE
      WHEN r.mapped_iso3 = 'ESH' THEN 
        jsonb_build_array(jsonb_build_object(
          'code', 'EXCLUDED_MARKET',
          'message', 'ESH/Western Sahara excluded from Souvera public scope',
          'field', 'country',
          'value', r.source_country_value
        ))
      WHEN r.mapped_country_id IS NULL THEN
        jsonb_build_array(jsonb_build_object(
          'code', 'INVALID_COUNTRY',
          'message', 'Country not found in 74-market scope',
          'field', 'country',
          'value', r.source_country_value
        ))
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE r.batch_id = p_batch_id
    AND r.status = 'pending';

  -- Return counts
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE status = 'valid')::INTEGER AS valid_count,
    COUNT(*) FILTER (WHERE status = 'invalid' AND NOT is_excluded)::INTEGER AS invalid_count,
    COUNT(*) FILTER (WHERE is_excluded)::INTEGER AS excluded_count
  FROM public.souvera_source_file_ingestion_rows
  WHERE batch_id = p_batch_id;
END;
$$;

-- =========================================================
-- 14. SEED AGOA AND AFCFTA MONITORS
-- =========================================================

-- Federal Register API Monitor for AGOA
INSERT INTO public.souvera_policy_source_monitors (
  source_id,
  monitor_name,
  monitor_type,
  monitor_url,
  api_endpoint,
  api_params,
  check_interval_minutes,
  keywords,
  is_active
)
SELECT 
  id,
  'Federal Register AGOA Monitor',
  'api_poll',
  'https://www.federalregister.gov/api/v1/documents',
  'https://www.federalregister.gov/api/v1/documents.json',
  jsonb_build_object(
    'conditions[term]', 'AGOA OR "African Growth and Opportunity Act"',
    'conditions[agencies][]', 'office-of-the-united-states-trade-representative',
    'order', 'newest',
    'per_page', '20'
  ),
  360,  -- Check every 6 hours
  ARRAY['AGOA', 'African Growth and Opportunity Act', 'eligibility', 'determination', 'presidential'],
  TRUE
FROM public.souvera_data_sources
WHERE key = 'ustr_agoa'
ON CONFLICT DO NOTHING;

-- Regulations.gov Monitor for AGOA Modernization Docket
INSERT INTO public.souvera_policy_source_monitors (
  source_id,
  monitor_name,
  monitor_type,
  monitor_url,
  api_endpoint,
  api_params,
  check_interval_minutes,
  keywords,
  is_active
)
SELECT 
  id,
  'Regulations.gov AGOA Docket Monitor',
  'api_poll',
  'https://api.regulations.gov/v4/documents',
  'https://api.regulations.gov/v4/documents',
  jsonb_build_object(
    'filter[docketId]', 'USTR-2026-0166',
    'sort', '-postedDate',
    'page[size]', '25'
  ),
  720,  -- Check every 12 hours
  ARRAY['AGOA', 'modernization', 'comment', 'eligibility'],
  TRUE
FROM public.souvera_data_sources
WHERE key = 'regulations_gov'
ON CONFLICT DO NOTHING;

-- USTR AGOA Page Monitor
INSERT INTO public.souvera_policy_source_monitors (
  source_id,
  monitor_name,
  monitor_type,
  monitor_url,
  check_interval_minutes,
  keywords,
  is_active
)
SELECT 
  id,
  'USTR AGOA Eligibility Page Monitor',
  'page_hash',
  'https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa',
  1440,  -- Check daily
  ARRAY['eligible', 'countries', 'beneficiary', 'status'],
  TRUE
FROM public.souvera_data_sources
WHERE key = 'ustr_agoa'
ON CONFLICT DO NOTHING;

-- AfCFTA Secretariat Monitor
INSERT INTO public.souvera_policy_source_monitors (
  source_id,
  monitor_name,
  monitor_type,
  monitor_url,
  check_interval_minutes,
  keywords,
  is_active
)
SELECT 
  id,
  'AfCFTA Secretariat Monitor',
  'page_hash',
  'https://au-afcfta.org/',
  1440,  -- Check daily
  ARRAY['ratification', 'deposited', 'implementation', 'protocol', 'trading'],
  TRUE
FROM public.souvera_data_sources
WHERE key = 'afcfta_secretariat'
ON CONFLICT DO NOTHING;

-- tralac AfCFTA Tracker Monitor
INSERT INTO public.souvera_policy_source_monitors (
  source_id,
  monitor_name,
  monitor_type,
  monitor_url,
  check_interval_minutes,
  keywords,
  is_active
)
SELECT 
  id,
  'tralac AfCFTA Status Tracker',
  'page_hash',
  'https://www.tralac.org/resources/infographic/13795-status-of-afcfta-ratification.html',
  1440,  -- Check daily
  ARRAY['ratified', 'signed', 'deposited', 'status'],
  TRUE
FROM public.souvera_data_sources
WHERE key = 'tralac_afcfta'
ON CONFLICT DO NOTHING;

-- =========================================================
-- 15. SEED INGESTION TEMPLATES
-- =========================================================

-- AGOA Status Upload Template
INSERT INTO public.souvera_source_ingestion_templates (
  template_name,
  template_description,
  target_table,
  target_data_type,
  column_mappings,
  country_column,
  country_mapping_type,
  required_columns,
  default_confidence
)
VALUES (
  'AGOA Eligibility Status Upload',
  'Template for uploading AGOA country eligibility status data',
  'souvera_trade_policy_statuses',
  'agoa_status',
  jsonb_build_array(
    jsonb_build_object('source', 'country', 'target', 'country_iso3', 'required', true),
    jsonb_build_object('source', 'status', 'target', 'agoa_status', 'required', true),
    jsonb_build_object('source', 'eligible_since', 'target', 'agoa_eligible_since'),
    jsonb_build_object('source', 'apparel_eligible', 'target', 'agoa_apparel_eligible'),
    jsonb_build_object('source', 'suspension_date', 'target', 'agoa_suspension_date'),
    jsonb_build_object('source', 'suspension_reason', 'target', 'agoa_suspension_reason'),
    jsonb_build_object('source', 'notes', 'target', 'agoa_notes')
  ),
  'country',
  'iso3',
  ARRAY['country', 'status'],
  'high'
)
ON CONFLICT DO NOTHING;

-- AfCFTA Status Upload Template
INSERT INTO public.souvera_source_ingestion_templates (
  template_name,
  template_description,
  target_table,
  target_data_type,
  column_mappings,
  country_column,
  country_mapping_type,
  required_columns,
  default_confidence
)
VALUES (
  'AfCFTA Implementation Status Upload',
  'Template for uploading AfCFTA country implementation status data',
  'souvera_trade_policy_statuses',
  'afcfta_status',
  jsonb_build_array(
    jsonb_build_object('source', 'country', 'target', 'country_iso3', 'required', true),
    jsonb_build_object('source', 'status', 'target', 'afcfta_status', 'required', true),
    jsonb_build_object('source', 'signed_date', 'target', 'afcfta_signed_date'),
    jsonb_build_object('source', 'ratified_date', 'target', 'afcfta_ratified_date'),
    jsonb_build_object('source', 'deposited_date', 'target', 'afcfta_deposited_date'),
    jsonb_build_object('source', 'trading_since', 'target', 'afcfta_trading_since'),
    jsonb_build_object('source', 'notes', 'target', 'afcfta_notes')
  ),
  'country',
  'iso3',
  ARRAY['country', 'status'],
  'high'
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 16. RLS POLICIES
-- =========================================================

-- Enable RLS on new tables
ALTER TABLE public.souvera_source_file_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_source_file_ingestion_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_source_file_ingestion_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_source_column_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_source_ingestion_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_policy_source_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_policy_source_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_policy_change_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_policy_review_queue ENABLE ROW LEVEL SECURITY;

-- Admin-only access for most tables (managed via service role)
-- Public views only show published data (enforced in application)

-- =========================================================
-- 17. VERIFICATION QUERIES
-- =========================================================

SELECT 'Phase 4B Ingestion Architecture Tables' AS verification;

SELECT 
  tablename,
  '✓ Created' AS status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'souvera_source_file_assets',
    'souvera_source_file_ingestion_batches',
    'souvera_source_file_ingestion_rows',
    'souvera_source_column_mappings',
    'souvera_source_ingestion_templates',
    'souvera_policy_source_monitors',
    'souvera_policy_source_snapshots',
    'souvera_policy_change_events',
    'souvera_policy_review_queue'
  )
ORDER BY tablename;

SELECT 'Phase 4B Ingestion Enums' AS verification;

SELECT 
  typname,
  '✓ Created' AS status
FROM pg_type 
WHERE typname IN (
  'souvera_ingestion_method',
  'souvera_file_type',
  'souvera_batch_status',
  'souvera_row_status',
  'souvera_policy_status',
  'souvera_monitor_type',
  'souvera_change_event_type',
  'souvera_review_action'
)
ORDER BY typname;

SELECT 'Policy Monitors Seeded' AS verification;

SELECT 
  monitor_name,
  monitor_type::TEXT,
  is_active
FROM public.souvera_policy_source_monitors
ORDER BY monitor_name;

SELECT 'Ingestion Templates Seeded' AS verification;

SELECT 
  template_name,
  target_data_type,
  is_active
FROM public.souvera_source_ingestion_templates
ORDER BY template_name;

-- =========================================================
-- END OF SQL PACK v1.15
-- =========================================================
