-- Migration: Create Country Sectors Table
-- Purpose: Store sector-specific intelligence for Country Intelligence Panel (Sectors Tab)
-- Date: 2026-05-14
-- Bloomberg-Grade Intelligence Terminal (Phase 1: Country Panel Build)

-- ============================================================================
-- 1. DROP EXISTING TABLE AND ENUM (if exists)
-- ============================================================================

-- Drop the table first (this will cascade to dependent objects)
DROP TABLE IF EXISTS public.souvera_country_sectors CASCADE;

-- Drop the enum type if it exists (must be done after dropping dependent tables)
DROP TYPE IF EXISTS public.souvera_row_status CASCADE;

-- ============================================================================
-- 2. CREATE ENUM TYPE
-- ============================================================================

CREATE TYPE public.souvera_row_status AS ENUM ('active', 'archived', 'deleted');

-- ============================================================================
-- 3. CREATE TABLE: souvera_country_sectors
-- ============================================================================

CREATE TABLE public.souvera_country_sectors (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES public.souvera_countries(id) ON DELETE CASCADE,
  
  -- Sector Identification
  sector_key TEXT NOT NULL CHECK (sector_key ~ '^[a-z_]+$'), -- e.g., 'technology', 'agriculture', 'energy'
  sector_label TEXT NOT NULL, -- e.g., 'Technology', 'Agriculture & Food Processing', 'Energy & Power'
  icon_emoji TEXT, -- e.g., '💻', '🌾', '⚡'
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Public Teaser (All Users)
  teaser TEXT NOT NULL, -- 1-2 sentence overview (accessible to Explorer+)
  
  -- Sector Scores (Professional+ Access)
  strength_score INTEGER CHECK (strength_score >= 0 AND strength_score <= 100), -- Current capacity/competitiveness
  growth_score INTEGER CHECK (growth_score >= 0 AND growth_score <= 100), -- Growth trajectory/momentum
  attractiveness_score INTEGER CHECK (attractiveness_score >= 0 AND attractiveness_score <= 100), -- Investment appeal
  
  -- Souvera Narrative (Professional+ Access)
  narrative_short TEXT, -- 2-3 paragraphs (visible by default)
  narrative_full TEXT, -- Full analysis (progressive disclosure)
  
  -- Key Players (Public Access)
  key_players JSONB, -- Array of {name, sector, description, metric}
  
  -- AGOA Opportunity (Business+ Access)
  agoa_opportunity TEXT, -- Confident, evidence-based narrative (Option 2 framework)
  agoa_export_current_usd NUMERIC(15, 2), -- Current annual exports to U.S.
  agoa_export_potential_usd NUMERIC(15, 2), -- 2030 export potential under AGOA
  
  -- Data Quality & Freshness
  data_sources TEXT[], -- e.g., ['World Bank', 'UNCTAD', 'National Statistics']
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  row_status public.souvera_row_status DEFAULT 'active',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Constraints
  UNIQUE (country_id, sector_key)
);

-- ============================================================================
-- 4. CREATE INDEXES
-- ============================================================================

-- Fast lookups by country
CREATE INDEX IF NOT EXISTS idx_country_sectors_country_id ON public.souvera_country_sectors(country_id);

-- Fast lookups by sector key (for cross-country comparisons)
CREATE INDEX IF NOT EXISTS idx_country_sectors_sector_key ON public.souvera_country_sectors(sector_key);

-- Fast lookups by country + display order (for tab rendering)
CREATE INDEX IF NOT EXISTS idx_country_sectors_country_display ON public.souvera_country_sectors(country_id, display_order);

-- Fast lookups by row_status (filtering active sectors)
CREATE INDEX IF NOT EXISTS idx_country_sectors_status ON public.souvera_country_sectors(row_status) WHERE row_status = 'active';

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.souvera_country_sectors ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access (anyone can read active sectors)
CREATE POLICY "Anyone can view active country sectors"
  ON public.souvera_country_sectors
  FOR SELECT
  USING (row_status = 'active');

-- Policy 2: Service role write access (for backend operations)
-- Note: Admin write access will be handled by service role key in backend
-- Individual user-level admin policies can be added later when souvera_users table exists

-- ============================================================================
-- 6. COMMENTS
-- ============================================================================

COMMENT ON TABLE public.souvera_country_sectors IS 'Country-specific sector intelligence for Sectors Tab in Country Intelligence Panel (Bloomberg-grade)';
COMMENT ON COLUMN public.souvera_country_sectors.sector_key IS 'Machine-readable sector identifier (lowercase, underscores)';
COMMENT ON COLUMN public.souvera_country_sectors.teaser IS 'Public 1-2 sentence overview accessible to all users';
COMMENT ON COLUMN public.souvera_country_sectors.strength_score IS 'Current sector capacity/competitiveness (0-100). Requires Professional+ access.';
COMMENT ON COLUMN public.souvera_country_sectors.growth_score IS 'Sector growth momentum (0-100). Requires Professional+ access.';
COMMENT ON COLUMN public.souvera_country_sectors.attractiveness_score IS 'Investment appeal (0-100). Requires Professional+ access.';
COMMENT ON COLUMN public.souvera_country_sectors.narrative_short IS 'Abbreviated Souvera narrative (2-3 paragraphs). Requires Professional+ access.';
COMMENT ON COLUMN public.souvera_country_sectors.narrative_full IS 'Full sector analysis with progressive disclosure. Requires Professional+ access.';
COMMENT ON COLUMN public.souvera_country_sectors.key_players IS 'Array of key companies/organizations [{name, sector, description, metric}]. Public access.';
COMMENT ON COLUMN public.souvera_country_sectors.agoa_opportunity IS 'AGOA trade opportunity narrative (Option 2: Opportunity + Capacity framework). Requires Business+ access.';
COMMENT ON COLUMN public.souvera_country_sectors.agoa_export_current_usd IS 'Current annual exports to U.S. in USD. Requires Business+ access.';
COMMENT ON COLUMN public.souvera_country_sectors.agoa_export_potential_usd IS '2030 export potential under AGOA in USD. Requires Business+ access.';
