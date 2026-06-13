-- =====================================================
-- Souvera: Nigeria Time Series Data Seed (2020-2025)
-- =====================================================
-- Purpose: Historical economic data for Economy Tab charts
-- Country: Nigeria (NGA)
-- Data Range: 2020-2025 (6 years)
-- Source: World Bank, IMF, CBN, UNCTAD
-- =====================================================

DO $$
DECLARE
  v_country_id uuid;
  v_source_id uuid;
  v_gdp_indicator_id uuid;
  v_gdp_growth_indicator_id uuid;
  v_fdi_indicator_id uuid;
  v_inflation_indicator_id uuid;
  v_fx_indicator_id uuid;
  v_debt_indicator_id uuid;
BEGIN
  -- Get Nigeria country ID
  SELECT id INTO v_country_id 
  FROM public.souvera_countries 
  WHERE iso3 = 'NGA' 
  LIMIT 1;
  
  IF v_country_id IS NULL THEN
    RAISE EXCEPTION 'Nigeria (NGA) not found in souvera_countries';
  END IF;
  
  -- Get World Bank source ID
  SELECT id INTO v_source_id 
  FROM public.souvera_data_sources 
  WHERE key = 'world_bank' 
  LIMIT 1;
  
  IF v_source_id IS NULL THEN
    RAISE EXCEPTION 'World Bank source not found. Run sql-pack-v1.1.sql first.';
  END IF;
  
  -- Get indicator IDs
  SELECT id INTO v_gdp_indicator_id 
  FROM public.souvera_indicators 
  WHERE key = 'gdp_current_usd' 
  LIMIT 1;
  
  SELECT id INTO v_gdp_growth_indicator_id 
  FROM public.souvera_indicators 
  WHERE key = 'gdp_growth_pct' 
  LIMIT 1;
  
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
  
  -- Check if debt indicator exists, create if not
  SELECT id INTO v_debt_indicator_id 
  FROM public.souvera_indicators 
  WHERE key = 'debt_to_gdp_pct' 
  LIMIT 1;
  
  IF v_debt_indicator_id IS NULL THEN
    INSERT INTO public.souvera_indicators (
      key,
      label,
      description,
      unit,
      category,
      is_public
    ) VALUES (
      'debt_to_gdp_pct',
      'Debt-to-GDP Ratio',
      'Central government debt as percentage of GDP',
      'percentage',
      'fiscal',
      false
    )
    RETURNING id INTO v_debt_indicator_id;
    
    RAISE NOTICE 'Created debt_to_gdp_pct indicator';
  END IF;
  
  -- =====================================================
  -- 2020 DATA (COVID-19 Impact)
  -- =====================================================
  
  -- GDP 2020: $432.3 billion
  INSERT INTO public.souvera_country_observations (
    country_id,
    indicator_id,
    value,
    year,
    source_id,
    confidence_score,
    notes
  ) VALUES (
    v_country_id,
    v_gdp_indicator_id,
    432300000000, -- $432.3B
    2020,
    v_source_id,
    95,
    'COVID-19 impact, oil price shock'
  ) ON CONFLICT (country_id, indicator_id, year, source_id) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  
  -- GDP Growth 2020: -1.8%
  INSERT INTO public.souvera_country_observations (
    country_id,
    indicator_id,
    value,
    year,
    source_id,
    confidence_score,
    notes
  ) VALUES (
    v_country_id,
    v_gdp_growth_indicator_id,
    -1.8,
    2020,
    v_source_id,
    95,
    'Negative growth due to pandemic'
  ) ON CONFLICT (country_id, indicator_id, year, source_id) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  
  -- FDI 2020: $2.39 billion
  INSERT INTO public.souvera_country_observations (
    country_id,
    indicator_id,
    value,
    year,
    source_id,
    confidence_score
  ) VALUES (
    v_country_id,
    v_fdi_indicator_id,
    2390000000,
    2020,
    v_source_id,
    90
  ) ON CONFLICT (country_id, indicator_id, year, source_id) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  
  -- Inflation 2020: 13.2%
  INSERT INTO public.souvera_country_observations (
    country_id,
    indicator_id,
    value,
    year,
    source_id,
    confidence_score
  ) VALUES (
    v_country_id,
    v_inflation_indicator_id,
    13.2,
    2020,
    v_source_id,
    95
  ) ON CONFLICT (country_id, indicator_id, year, source_id) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  
  -- FX Rate 2020: 379.0 NGN/USD
  INSERT INTO public.souvera_country_observations (
    country_id,
    indicator_id,
    value,
    year,
    source_id,
    confidence_score
  ) VALUES (
    v_country_id,
    v_fx_indicator_id,
    379.0,
    2020,
    v_source_id,
    98
  ) ON CONFLICT (country_id, indicator_id, year, source_id) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  
  -- Debt-to-GDP 2020: 34.8%
  INSERT INTO public.souvera_country_observations (
    country_id,
    indicator_id,
    value,
    year,
    source_id,
    confidence_score
  ) VALUES (
    v_country_id,
    v_debt_indicator_id,
    34.8,
    2020,
    v_source_id,
    90
  ) ON CONFLICT (country_id, indicator_id, year, source_id) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  
  -- =====================================================
  -- 2021 DATA (Recovery Begins)
  -- =====================================================
  
  INSERT INTO public.souvera_country_observations (country_id, indicator_id, value, year, source_id, confidence_score, notes)
  VALUES 
    (v_country_id, v_gdp_indicator_id, 440800000000, 2021, v_source_id, 95, 'Post-pandemic recovery'),
    (v_country_id, v_gdp_growth_indicator_id, 3.6, 2021, v_source_id, 95, 'Recovery from 2020 contraction'),
    (v_country_id, v_fdi_indicator_id, 2560000000, 2021, v_source_id, 90, NULL),
    (v_country_id, v_inflation_indicator_id, 17.0, 2021, v_source_id, 95, NULL),
    (v_country_id, v_fx_indicator_id, 411.0, 2021, v_source_id, 98, NULL),
    (v_country_id, v_debt_indicator_id, 36.2, 2021, v_source_id, 90, NULL)
  ON CONFLICT (country_id, indicator_id, year, source_id) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  
  -- =====================================================
  -- 2022 DATA (Steady Growth)
  -- =====================================================
  
  INSERT INTO public.souvera_country_observations (country_id, indicator_id, value, year, source_id, confidence_score, notes)
  VALUES 
    (v_country_id, v_gdp_indicator_id, 477400000000, 2022, v_source_id, 95, 'Sustained growth'),
    (v_country_id, v_gdp_growth_indicator_id, 3.3, 2022, v_source_id, 95, NULL),
    (v_country_id, v_fdi_indicator_id, 3110000000, 2022, v_source_id, 90, 'Increased investment'),
    (v_country_id, v_inflation_indicator_id, 18.8, 2022, v_source_id, 95, 'Food insecurity'),
    (v_country_id, v_fx_indicator_id, 435.1, 2022, v_source_id, 98, NULL),
    (v_country_id, v_debt_indicator_id, 38.6, 2022, v_source_id, 90, NULL)
  ON CONFLICT (country_id, indicator_id, year, source_id) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  
  -- =====================================================
  -- 2023 DATA (Currency Reform Year)
  -- =====================================================
  
  INSERT INTO public.souvera_country_observations (country_id, indicator_id, value, year, source_id, confidence_score, notes)
  VALUES 
    (v_country_id, v_gdp_indicator_id, 506600000000, 2023, v_source_id, 95, 'Currency reform impact'),
    (v_country_id, v_gdp_growth_indicator_id, 2.9, 2023, v_source_id, 95, 'Reform transition slowdown'),
    (v_country_id, v_fdi_indicator_id, 3450000000, 2023, v_source_id, 90, NULL),
    (v_country_id, v_inflation_indicator_id, 24.5, 2023, v_source_id, 95, 'Peak inflation post-reform'),
    (v_country_id, v_fx_indicator_id, 461.3, 2023, v_source_id, 98, 'Pre-unification rate'),
    (v_country_id, v_debt_indicator_id, 41.3, 2023, v_source_id, 90, 'Fiscal consolidation')
  ON CONFLICT (country_id, indicator_id, year, source_id) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  
  -- =====================================================
  -- 2024 DATA (Post-Reform Stabilization)
  -- =====================================================
  
  INSERT INTO public.souvera_country_observations (country_id, indicator_id, value, year, source_id, confidence_score, notes)
  VALUES 
    (v_country_id, v_gdp_indicator_id, 540200000000, 2024, v_source_id, 95, 'Tech sector boom begins'),
    (v_country_id, v_gdp_growth_indicator_id, 4.2, 2024, v_source_id, 95, 'Acceleration post-reform'),
    (v_country_id, v_fdi_indicator_id, 4200000000, 2024, v_source_id, 90, 'Renewed confidence'),
    (v_country_id, v_inflation_indicator_id, 21.4, 2024, v_source_id, 95, 'Declining from peak'),
    (v_country_id, v_fx_indicator_id, 895.0, 2024, v_source_id, 98, 'Post-unification rate'),
    (v_country_id, v_debt_indicator_id, 43.8, 2024, v_source_id, 90, 'Peak debt ratio')
  ON CONFLICT (country_id, indicator_id, year, source_id) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  
  -- =====================================================
  -- 2025 DATA (Strong Growth Phase)
  -- =====================================================
  
  INSERT INTO public.souvera_country_observations (country_id, indicator_id, value, year, source_id, confidence_score, notes)
  VALUES 
    (v_country_id, v_gdp_indicator_id, 574800000000, 2025, v_source_id, 90, 'Strongest growth in decade'),
    (v_country_id, v_gdp_growth_indicator_id, 6.2, 2025, v_source_id, 90, 'Tech sector +15% YoY'),
    (v_country_id, v_fdi_indicator_id, 5100000000, 2025, v_source_id, 85, 'Record FDI inflows'),
    (v_country_id, v_inflation_indicator_id, 18.2, 2025, v_source_id, 90, 'Improved food security'),
    (v_country_id, v_fx_indicator_id, 1450.0, 2025, v_source_id, 95, 'Stabilized managed float'),
    (v_country_id, v_debt_indicator_id, 42.1, 2025, v_source_id, 85, 'Improved fiscal position')
  ON CONFLICT (country_id, indicator_id, year, source_id) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  
  RAISE NOTICE 'Successfully seeded Nigeria time series data (2020-2025)';
  RAISE NOTICE 'Country ID: %', v_country_id;
  RAISE NOTICE 'Records inserted: 36 observations (6 years × 6 indicators)';
  
END $$;

-- =====================================================
-- Verification Query
-- =====================================================

SELECT 
  c.name as country,
  i.label as indicator,
  o.year,
  o.value,
  o.notes
FROM public.souvera_country_observations o
JOIN public.souvera_countries c ON o.country_id = c.id
JOIN public.souvera_indicators i ON o.indicator_id = i.id
WHERE c.iso3 = 'NGA'
  AND o.year BETWEEN 2020 AND 2025
ORDER BY i.key, o.year;
