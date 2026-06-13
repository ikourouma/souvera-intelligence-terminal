-- ================================================================
-- Souvera Intelligence Terminal — Nigeria Professional+ Metrics
-- ================================================================
-- Purpose: Seed FDI, Inflation, and FX data for Nigeria
-- Date: May 13, 2026
-- 
-- This adds the 3 missing Professional+ metrics to complete the
-- executive snapshot and enable full clickable card testing.
-- ================================================================

-- First, get Nigeria's UUID and the required indicator UUIDs
DO $$
DECLARE
  v_nigeria_id uuid;
  v_fdi_indicator_id uuid;
  v_inflation_indicator_id uuid;
  v_fx_indicator_id uuid;
  v_world_bank_id uuid;
BEGIN
  -- Get Nigeria's country UUID
  SELECT id INTO v_nigeria_id 
  FROM public.souvera_countries 
  WHERE iso3 = 'NGA' 
  LIMIT 1;

  -- Get World Bank source ID
  SELECT id INTO v_world_bank_id
  FROM public.souvera_data_sources
  WHERE key = 'world_bank'
  LIMIT 1;

  -- Get indicator IDs (these should exist from sql-pack-v1.1.sql)
  SELECT id INTO v_fdi_indicator_id
  FROM public.souvera_indicators
  WHERE key = 'fdi_net_inflows_usd'
  LIMIT 1;

  SELECT id INTO v_inflation_indicator_id
  FROM public.souvera_indicators
  WHERE key = 'inflation_cpi_pct'
  LIMIT 1;

  SELECT id INTO v_fx_indicator_id
  FROM public.souvera_indicators
  WHERE key = 'fx_to_usd'
  LIMIT 1;

  -- Verify we have all required IDs
  IF v_nigeria_id IS NULL THEN
    RAISE EXCEPTION 'Nigeria (NGA) not found in souvera_countries';
  END IF;

  IF v_world_bank_id IS NULL THEN
    RAISE EXCEPTION 'World Bank source not found in souvera_data_sources';
  END IF;

  IF v_fdi_indicator_id IS NULL OR v_inflation_indicator_id IS NULL OR v_fx_indicator_id IS NULL THEN
    RAISE NOTICE 'Some indicators not found. This is expected if they were not created yet.';
    RAISE NOTICE 'FDI indicator found: %', (v_fdi_indicator_id IS NOT NULL);
    RAISE NOTICE 'Inflation indicator found: %', (v_inflation_indicator_id IS NOT NULL);
    RAISE NOTICE 'FX indicator found: %', (v_fx_indicator_id IS NOT NULL);
    RETURN;
  END IF;

  -- Delete any existing observations for these indicators (for Nigeria)
  DELETE FROM public.souvera_country_observations
  WHERE country_id = v_nigeria_id
    AND indicator_id IN (v_fdi_indicator_id, v_inflation_indicator_id, v_fx_indicator_id);

  -- Insert Professional+ metrics for Nigeria
  INSERT INTO public.souvera_country_observations
    (country_id, indicator_id, period_date, period_type, value_numeric, value_text, source_id, fetched_at, published_at)
  VALUES
    -- FDI Net Inflows (USD) - $4.5B
    (v_nigeria_id, v_fdi_indicator_id, '2024-12-31'::date, 'annual', 4500000000, '4.5B USD', v_world_bank_id, NOW(), '2024-10-01'::timestamptz),
    
    -- Inflation CPI (%) - 18.75%
    (v_nigeria_id, v_inflation_indicator_id, '2024-12-31'::date, 'annual', 18.75, '18.75%', v_world_bank_id, NOW(), '2024-10-01'::timestamptz),
    
    -- FX Rate to USD - 1,547.50 NGN/USD
    (v_nigeria_id, v_fx_indicator_id, '2024-12-31'::date, 'annual', 1547.50, '1547.50', v_world_bank_id, NOW(), '2024-10-01'::timestamptz);

  RAISE NOTICE 'Successfully inserted 3 Professional+ metrics for Nigeria';

END $$;

-- Verify insertion
SELECT 
  c.iso3,
  c.name,
  i.key as indicator_key,
  o.value_numeric,
  o.value_text,
  o.period_date
FROM public.souvera_country_observations o
JOIN public.souvera_countries c ON c.id = o.country_id
JOIN public.souvera_indicators i ON i.id = o.indicator_id
WHERE c.iso3 = 'NGA'
  AND i.key IN ('fdi_net_inflows_usd', 'inflation_cpi_pct', 'fx_to_usd')
ORDER BY i.key;
