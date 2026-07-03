-- =========================================================
-- AGOA/CBTPA Priority Products Table
-- Phase 0E.4: Static Data Migration
--
-- Migrates AGOA priority products from TypeScript static file
-- to database for admin editing and version control.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_agoa_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product identification
  code VARCHAR(10) NOT NULL,                    -- HS code (6-digit) or BPM6 service code
  classification VARCHAR(10) NOT NULL,          -- 'HS' or 'BPM6'
  chapter INTEGER,                              -- HS chapter (null for BPM6 services)
  description TEXT NOT NULL,
  
  -- Sector mapping
  sector_key VARCHAR(50) NOT NULL,              -- Maps to SDM sector_key
  
  -- Strategic classification
  strategic_type VARCHAR(20) NOT NULL,          -- 'africa_export' | 'us_reciprocal'
  is_apparel_provision BOOLEAN DEFAULT FALSE,   -- AGOA special apparel / third-country fabric rule
  is_agoa_specific BOOLEAN DEFAULT FALSE,       -- Covered under AGOA (Africa)
  is_cbtpa_specific BOOLEAN DEFAULT FALSE,      -- Covered under CBTPA/CBI (Caribbean)
  
  -- US market data
  us_export_states TEXT[],                      -- US states with export specialization
  rules_of_origin_summary TEXT,                 -- ROO summary from USTR
  
  -- Trade flow data (populated by trade ingestion)
  export_to_us_usd BIGINT,
  us_import_demand_usd BIGINT,
  net_position_usd BIGINT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  source_id UUID REFERENCES public.souvera_data_sources(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_classification CHECK (classification IN ('HS', 'BPM6')),
  CONSTRAINT valid_strategic_type CHECK (strategic_type IN ('africa_export', 'us_reciprocal')),
  CONSTRAINT unique_code_classification UNIQUE (code, classification)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agoa_products_sector ON public.souvera_agoa_products(sector_key);
CREATE INDEX IF NOT EXISTS idx_agoa_products_strategic ON public.souvera_agoa_products(strategic_type);
CREATE INDEX IF NOT EXISTS idx_agoa_products_chapter ON public.souvera_agoa_products(chapter);
CREATE INDEX IF NOT EXISTS idx_agoa_products_agoa ON public.souvera_agoa_products(is_agoa_specific) WHERE is_agoa_specific = TRUE;
CREATE INDEX IF NOT EXISTS idx_agoa_products_cbtpa ON public.souvera_agoa_products(is_cbtpa_specific) WHERE is_cbtpa_specific = TRUE;
CREATE INDEX IF NOT EXISTS idx_agoa_products_active ON public.souvera_agoa_products(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE public.souvera_agoa_products ENABLE ROW LEVEL SECURITY;

-- Public read access for product catalog
CREATE POLICY agoa_products_public_read ON public.souvera_agoa_products
  FOR SELECT USING (is_active = TRUE);

-- Admin full access (via organization membership roles)
CREATE POLICY agoa_products_admin_all ON public.souvera_agoa_products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.souvera_organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('platform_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.souvera_organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('platform_admin', 'super_admin')
    )
  );

COMMENT ON TABLE public.souvera_agoa_products IS 'AGOA/CBTPA priority products catalog - migrated from static TypeScript file for admin editability';
