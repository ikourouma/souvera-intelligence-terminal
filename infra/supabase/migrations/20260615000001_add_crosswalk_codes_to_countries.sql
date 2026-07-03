-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Migration: Add crosswalk code columns to countries
-- Owner: Afronovation, Inc.
-- ===========================================

-- Add crosswalk code columns to souvera_countries table
-- These columns map Souvera's ISO3 codes to external data source codes

ALTER TABLE public.souvera_countries
  ADD COLUMN IF NOT EXISTS census_code TEXT,
  ADD COLUMN IF NOT EXISTS comtrade_code TEXT,
  ADD COLUMN IF NOT EXISTS wdi_code TEXT,
  ADD COLUMN IF NOT EXISTS imf_code TEXT,
  ADD COLUMN IF NOT EXISTS is_excluded BOOLEAN NOT NULL DEFAULT false;

-- Add indexes for code lookups (partial indexes for non-null values)
CREATE INDEX IF NOT EXISTS idx_countries_census_code 
  ON public.souvera_countries(census_code) WHERE census_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_countries_comtrade_code 
  ON public.souvera_countries(comtrade_code) WHERE comtrade_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_countries_wdi_code 
  ON public.souvera_countries(wdi_code) WHERE wdi_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_countries_imf_code 
  ON public.souvera_countries(imf_code) WHERE imf_code IS NOT NULL;

-- Add helpful comments for documentation
COMMENT ON COLUMN public.souvera_countries.census_code IS 
  'US Census Bureau 4-digit country code for trade data integration';

COMMENT ON COLUMN public.souvera_countries.comtrade_code IS 
  'UN Comtrade M49 numeric code for international trade statistics';

COMMENT ON COLUMN public.souvera_countries.wdi_code IS 
  'World Bank World Development Indicators country code (usually ISO3)';

COMMENT ON COLUMN public.souvera_countries.imf_code IS 
  'IMF 3-digit numeric country code for financial data';

COMMENT ON COLUMN public.souvera_countries.is_excluded IS 
  'Whether the country is excluded from active crosswalk selection';

-- Seed known crosswalk codes for major African and Caribbean markets
-- This provides a starting point; admins can add/modify via UI

UPDATE public.souvera_countries SET 
  census_code = CASE iso3
    WHEN 'NGA' THEN '7560'
    WHEN 'ZAF' THEN '7910'
    WHEN 'KEN' THEN '7600'
    WHEN 'GHA' THEN '7360'
    WHEN 'EGY' THEN '7850'
    WHEN 'MAR' THEN '7800'
    WHEN 'ETH' THEN '7440'
    WHEN 'TZA' THEN '7630'
    WHEN 'RWA' THEN '7530'
    WHEN 'UGA' THEN '7650'
    WHEN 'SEN' THEN '7460'
    WHEN 'CIV' THEN '7310'
    WHEN 'CMR' THEN '7280'
    WHEN 'AGO' THEN '7620'
    WHEN 'DZA' THEN '7210'
    WHEN 'TUN' THEN '7640'
    WHEN 'JAM' THEN '2110'
    WHEN 'TTO' THEN '2740'
    WHEN 'BRB' THEN '2380'
    WHEN 'BHS' THEN '2350'
    WHEN 'HTI' THEN '2240'
    WHEN 'DOM' THEN '2470'
    WHEN 'GUY' THEN '8020'
    WHEN 'SUR' THEN '8050'
    WHEN 'BLZ' THEN '2050'
    ELSE census_code
  END,
  comtrade_code = CASE iso3
    WHEN 'NGA' THEN '566'
    WHEN 'ZAF' THEN '710'
    WHEN 'KEN' THEN '404'
    WHEN 'GHA' THEN '288'
    WHEN 'EGY' THEN '818'
    WHEN 'MAR' THEN '504'
    WHEN 'ETH' THEN '231'
    WHEN 'TZA' THEN '834'
    WHEN 'RWA' THEN '646'
    WHEN 'UGA' THEN '800'
    WHEN 'SEN' THEN '686'
    WHEN 'CIV' THEN '384'
    WHEN 'CMR' THEN '120'
    WHEN 'AGO' THEN '024'
    WHEN 'DZA' THEN '012'
    WHEN 'TUN' THEN '788'
    WHEN 'JAM' THEN '388'
    WHEN 'TTO' THEN '780'
    WHEN 'BRB' THEN '052'
    WHEN 'BHS' THEN '044'
    WHEN 'HTI' THEN '332'
    WHEN 'DOM' THEN '214'
    WHEN 'GUY' THEN '328'
    WHEN 'SUR' THEN '740'
    WHEN 'BLZ' THEN '084'
    ELSE comtrade_code
  END,
  wdi_code = COALESCE(wdi_code, iso3),
  imf_code = CASE iso3
    WHEN 'NGA' THEN '694'
    WHEN 'ZAF' THEN '199'
    WHEN 'KEN' THEN '664'
    WHEN 'GHA' THEN '652'
    WHEN 'EGY' THEN '469'
    WHEN 'MAR' THEN '686'
    WHEN 'ETH' THEN '644'
    WHEN 'TZA' THEN '738'
    WHEN 'RWA' THEN '714'
    WHEN 'UGA' THEN '746'
    WHEN 'SEN' THEN '722'
    WHEN 'CIV' THEN '662'
    WHEN 'CMR' THEN '622'
    WHEN 'AGO' THEN '614'
    WHEN 'DZA' THEN '612'
    WHEN 'TUN' THEN '744'
    WHEN 'JAM' THEN '343'
    WHEN 'TTO' THEN '369'
    WHEN 'BRB' THEN '316'
    WHEN 'BHS' THEN '313'
    WHEN 'HTI' THEN '263'
    WHEN 'DOM' THEN '243'
    WHEN 'GUY' THEN '336'
    WHEN 'SUR' THEN '366'
    WHEN 'BLZ' THEN '339'
    ELSE imf_code
  END
WHERE iso3 IN (
  'NGA', 'ZAF', 'KEN', 'GHA', 'EGY', 'MAR', 'ETH', 'TZA', 'RWA', 'UGA',
  'SEN', 'CIV', 'CMR', 'AGO', 'DZA', 'TUN', 'JAM', 'TTO', 'BRB', 'BHS',
  'HTI', 'DOM', 'GUY', 'SUR', 'BLZ'
);
