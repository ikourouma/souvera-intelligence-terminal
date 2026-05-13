-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.5: SEED DATA FOR AFRICA + CARIBBEAN
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- 
-- CURATED PREVIEW DATA
-- Data sources: REST Countries API, World Bank, IMF
-- Data vintage: 2023-2024
-- Purpose: Phase 3A intelligence map seed data
-- 
-- IMPORTANT: This is curated preview data for platform 
-- demonstration. Live data ingestion is planned for Phase 4.
-- =========================================================

-- =========================================================
-- 1. DATA SOURCES
-- =========================================================

-- Note: Some sources were pre-seeded in sql-pack-v1.1
-- This ensures all required sources exist for preview data

INSERT INTO public.souvera_data_sources 
(key, name, domain, provider_url, api_base_url, api_docs_url, auth_model, billing_model, refresh_cadence, source_status, priority_rank, fallback_source_keys, legal_status, redistribution_notes)
VALUES
  ('rest_countries', 'REST Countries', 'identity', 'https://restcountries.com/', 'https://restcountries.com/v3.1', 'https://restcountries.com/', 'public', 'free', 'monthly', 'approved', 5, array[]::text[], 'approved', 'Use only for country metadata, flags, names, and display fields.'),
  ('world_bank', 'World Bank Indicators API', 'macro', 'https://www.worldbank.org', 'https://api.worldbank.org/v2', 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation', 'public', 'free', 'weekly', 'approved', 1, array['imf','oecd'], 'approved', 'Use source attribution and cached normalized metrics.'),
  ('imf', 'International Monetary Fund Data API', 'forecast', 'https://www.imf.org', 'https://api.imf.org', 'https://data.imf.org/en/Resource-Pages/IMF-API', 'public', 'free', 'monthly_or_release_driven', 'approved', 2, array['oecd','trading_economics'], 'approved', 'Mark forecast and estimate data clearly.'),
  ('un_comtrade', 'UN Comtrade API', 'trade', 'https://comtradeplus.un.org', 'https://comtradeapi.un.org', 'https://comtradeapi.un.org/docs', 'api_key', 'free_limited_or_premium', 'monthly_or_quarterly', 'testing', 4, array['world_bank'], 'review_required', 'Store processed summaries for UI.'),
  ('gdelt', 'GDELT Project API', 'news_signals', 'https://www.gdeltproject.org', 'https://api.gdeltproject.org/api/v2', 'https://www.gdeltproject.org/data.html', 'public', 'free', 'hourly_summary', 'testing', 7, array['newsapi'], 'review_required', 'Use to derive signals, not to overwhelm UI with raw articles.'),
  ('open_exchange_rates', 'Open Exchange Rates API', 'fx', 'https://openexchangerates.org', 'https://openexchangerates.org/api', 'https://docs.openexchangerates.org', 'api_key', 'freemium_or_paid', 'hourly_cached', 'testing', 6, array[]::text[], 'review_required', 'Respect plan limits and cache exchange rates server-side.')
ON CONFLICT (key) DO UPDATE
SET name = EXCLUDED.name,
    domain = EXCLUDED.domain,
    provider_url = EXCLUDED.provider_url,
    api_base_url = EXCLUDED.api_base_url,
    api_docs_url = EXCLUDED.api_docs_url,
    source_status = EXCLUDED.source_status,
    priority_rank = EXCLUDED.priority_rank;

-- =========================================================
-- 2. AFRICAN COUNTRIES (54 AU Member States)
-- =========================================================

-- Data source: REST Countries API + World Bank coordinates
-- Coverage: All 54 African Union member states

INSERT INTO public.souvera_countries 
(iso2, iso3, name, region, subregion, capital, currency_code, flag_svg_url, lat, lng, is_african_country, is_active)
VALUES
  -- NORTH AFRICA (7)
  ('DZ', 'DZA', 'Algeria', 'Africa', 'Northern Africa', 'Algiers', 'DZD', 'https://flagcdn.com/dz.svg', 28.0339, 1.6596, true, true),
  ('EG', 'EGY', 'Egypt', 'Africa', 'Northern Africa', 'Cairo', 'EGP', 'https://flagcdn.com/eg.svg', 26.8206, 30.8025, true, true),
  ('LY', 'LBY', 'Libya', 'Africa', 'Northern Africa', 'Tripoli', 'LYD', 'https://flagcdn.com/ly.svg', 26.3351, 17.2283, true, true),
  ('MA', 'MAR', 'Morocco', 'Africa', 'Northern Africa', 'Rabat', 'MAD', 'https://flagcdn.com/ma.svg', 31.7917, -7.0926, true, true),
  ('SD', 'SDN', 'Sudan', 'Africa', 'Northern Africa', 'Khartoum', 'SDG', 'https://flagcdn.com/sd.svg', 12.8628, 30.2176, true, true),
  ('TN', 'TUN', 'Tunisia', 'Africa', 'Northern Africa', 'Tunis', 'TND', 'https://flagcdn.com/tn.svg', 33.8869, 9.5375, true, true),
  ('EH', 'ESH', 'Western Sahara', 'Africa', 'Northern Africa', NULL, 'MAD', 'https://flagcdn.com/eh.svg', 24.2155, -12.8858, true, true),

  -- WEST AFRICA (16)
  ('BJ', 'BEN', 'Benin', 'Africa', 'Western Africa', 'Porto-Novo', 'XOF', 'https://flagcdn.com/bj.svg', 9.3077, 2.3158, true, true),
  ('BF', 'BFA', 'Burkina Faso', 'Africa', 'Western Africa', 'Ouagadougou', 'XOF', 'https://flagcdn.com/bf.svg', 12.2383, -1.5616, true, true),
  ('CV', 'CPV', 'Cabo Verde', 'Africa', 'Western Africa', 'Praia', 'CVE', 'https://flagcdn.com/cv.svg', 16.5388, -23.0418, true, true),
  ('CI', 'CIV', 'Côte d''Ivoire', 'Africa', 'Western Africa', 'Yamoussoukro', 'XOF', 'https://flagcdn.com/ci.svg', 7.5400, -5.5471, true, true),
  ('GM', 'GMB', 'Gambia', 'Africa', 'Western Africa', 'Banjul', 'GMD', 'https://flagcdn.com/gm.svg', 13.4432, -15.3101, true, true),
  ('GH', 'GHA', 'Ghana', 'Africa', 'Western Africa', 'Accra', 'GHS', 'https://flagcdn.com/gh.svg', 7.9465, -1.0232, true, true),
  ('GN', 'GIN', 'Guinea', 'Africa', 'Western Africa', 'Conakry', 'GNF', 'https://flagcdn.com/gn.svg', 9.9456, -9.6966, true, true),
  ('GW', 'GNB', 'Guinea-Bissau', 'Africa', 'Western Africa', 'Bissau', 'XOF', 'https://flagcdn.com/gw.svg', 11.8037, -15.1804, true, true),
  ('LR', 'LBR', 'Liberia', 'Africa', 'Western Africa', 'Monrovia', 'LRD', 'https://flagcdn.com/lr.svg', 6.4281, -9.4295, true, true),
  ('ML', 'MLI', 'Mali', 'Africa', 'Western Africa', 'Bamako', 'XOF', 'https://flagcdn.com/ml.svg', 17.5707, -3.9962, true, true),
  ('MR', 'MRT', 'Mauritania', 'Africa', 'Western Africa', 'Nouakchott', 'MRU', 'https://flagcdn.com/mr.svg', 21.0079, -10.9408, true, true),
  ('NE', 'NER', 'Niger', 'Africa', 'Western Africa', 'Niamey', 'XOF', 'https://flagcdn.com/ne.svg', 17.6078, 8.0817, true, true),
  ('NG', 'NGA', 'Nigeria', 'Africa', 'Western Africa', 'Abuja', 'NGN', 'https://flagcdn.com/ng.svg', 9.0820, 8.6753, true, true),
  ('SN', 'SEN', 'Senegal', 'Africa', 'Western Africa', 'Dakar', 'XOF', 'https://flagcdn.com/sn.svg', 14.4974, -14.4524, true, true),
  ('SL', 'SLE', 'Sierra Leone', 'Africa', 'Western Africa', 'Freetown', 'SLL', 'https://flagcdn.com/sl.svg', 8.4657, -11.7799, true, true),
  ('TG', 'TGO', 'Togo', 'Africa', 'Western Africa', 'Lomé', 'XOF', 'https://flagcdn.com/tg.svg', 8.6195, 0.8248, true, true),

  -- EAST AFRICA (14 - includes island nations and South Sudan)
  ('BI', 'BDI', 'Burundi', 'Africa', 'Eastern Africa', 'Gitega', 'BIF', 'https://flagcdn.com/bi.svg', -3.3731, 29.9189, true, true),
  ('KM', 'COM', 'Comoros', 'Africa', 'Eastern Africa', 'Moroni', 'KMF', 'https://flagcdn.com/km.svg', -11.8750, 43.8722, true, true),
  ('DJ', 'DJI', 'Djibouti', 'Africa', 'Eastern Africa', 'Djibouti', 'DJF', 'https://flagcdn.com/dj.svg', 11.8251, 42.5903, true, true),
  ('ER', 'ERI', 'Eritrea', 'Africa', 'Eastern Africa', 'Asmara', 'ERN', 'https://flagcdn.com/er.svg', 15.1794, 39.7823, true, true),
  ('ET', 'ETH', 'Ethiopia', 'Africa', 'Eastern Africa', 'Addis Ababa', 'ETB', 'https://flagcdn.com/et.svg', 9.1450, 40.4897, true, true),
  ('KE', 'KEN', 'Kenya', 'Africa', 'Eastern Africa', 'Nairobi', 'KES', 'https://flagcdn.com/ke.svg', -0.0236, 37.9062, true, true),
  ('MG', 'MDG', 'Madagascar', 'Africa', 'Eastern Africa', 'Antananarivo', 'MGA', 'https://flagcdn.com/mg.svg', -18.7669, 46.8691, true, true),
  ('MU', 'MUS', 'Mauritius', 'Africa', 'Eastern Africa', 'Port Louis', 'MUR', 'https://flagcdn.com/mu.svg', -20.1609, 57.5012, true, true),
  ('RW', 'RWA', 'Rwanda', 'Africa', 'Eastern Africa', 'Kigali', 'RWF', 'https://flagcdn.com/rw.svg', -1.9403, 29.8739, true, true),
  ('SC', 'SYC', 'Seychelles', 'Africa', 'Eastern Africa', 'Victoria', 'SCR', 'https://flagcdn.com/sc.svg', -4.6796, 55.4920, true, true),
  ('SO', 'SOM', 'Somalia', 'Africa', 'Eastern Africa', 'Mogadishu', 'SOS', 'https://flagcdn.com/so.svg', 5.1521, 46.1996, true, true),
  ('SS', 'SSD', 'South Sudan', 'Africa', 'Eastern Africa', 'Juba', 'SSP', 'https://flagcdn.com/ss.svg', 6.8770, 31.3070, true, true),
  ('TZ', 'TZA', 'Tanzania', 'Africa', 'Eastern Africa', 'Dodoma', 'TZS', 'https://flagcdn.com/tz.svg', -6.3690, 34.8888, true, true),
  ('UG', 'UGA', 'Uganda', 'Africa', 'Eastern Africa', 'Kampala', 'UGX', 'https://flagcdn.com/ug.svg', 1.3733, 32.2903, true, true),

  -- CENTRAL AFRICA (8)
  ('AO', 'AGO', 'Angola', 'Africa', 'Middle Africa', 'Luanda', 'AOA', 'https://flagcdn.com/ao.svg', -11.2027, 17.8739, true, true),
  ('CM', 'CMR', 'Cameroon', 'Africa', 'Middle Africa', 'Yaoundé', 'XAF', 'https://flagcdn.com/cm.svg', 7.3697, 12.3547, true, true),
  ('CF', 'CAF', 'Central African Republic', 'Africa', 'Middle Africa', 'Bangui', 'XAF', 'https://flagcdn.com/cf.svg', 6.6111, 20.9394, true, true),
  ('TD', 'TCD', 'Chad', 'Africa', 'Middle Africa', 'N''Djamena', 'XAF', 'https://flagcdn.com/td.svg', 15.4542, 18.7322, true, true),
  ('CG', 'COG', 'Congo', 'Africa', 'Middle Africa', 'Brazzaville', 'XAF', 'https://flagcdn.com/cg.svg', -4.0383, 21.7587, true, true),
  ('CD', 'COD', 'DR Congo', 'Africa', 'Middle Africa', 'Kinshasa', 'CDF', 'https://flagcdn.com/cd.svg', -4.0383, 21.7587, true, true),
  ('GQ', 'GNQ', 'Equatorial Guinea', 'Africa', 'Middle Africa', 'Malabo', 'XAF', 'https://flagcdn.com/gq.svg', 1.6508, 10.2679, true, true),
  ('GA', 'GAB', 'Gabon', 'Africa', 'Middle Africa', 'Libreville', 'XAF', 'https://flagcdn.com/ga.svg', -0.8037, 11.6094, true, true),
  ('ST', 'STP', 'São Tomé and Príncipe', 'Africa', 'Middle Africa', 'São Tomé', 'STN', 'https://flagcdn.com/st.svg', 0.1864, 6.6131, true, true),

  -- SOUTHERN AFRICA (9)
  ('BW', 'BWA', 'Botswana', 'Africa', 'Southern Africa', 'Gaborone', 'BWP', 'https://flagcdn.com/bw.svg', -22.3285, 24.6849, true, true),
  ('SZ', 'SWZ', 'Eswatini', 'Africa', 'Southern Africa', 'Mbabane', 'SZL', 'https://flagcdn.com/sz.svg', -26.5225, 31.4659, true, true),
  ('LS', 'LSO', 'Lesotho', 'Africa', 'Southern Africa', 'Maseru', 'LSL', 'https://flagcdn.com/ls.svg', -29.6100, 28.2336, true, true),
  ('MW', 'MWI', 'Malawi', 'Africa', 'Southern Africa', 'Lilongwe', 'MWK', 'https://flagcdn.com/mw.svg', -13.2543, 34.3015, true, true),
  ('MZ', 'MOZ', 'Mozambique', 'Africa', 'Southern Africa', 'Maputo', 'MZN', 'https://flagcdn.com/mz.svg', -18.6657, 35.5296, true, true),
  ('NA', 'NAM', 'Namibia', 'Africa', 'Southern Africa', 'Windhoek', 'NAD', 'https://flagcdn.com/na.svg', -22.9576, 18.4904, true, true),
  ('ZA', 'ZAF', 'South Africa', 'Africa', 'Southern Africa', 'Pretoria', 'ZAR', 'https://flagcdn.com/za.svg', -30.5595, 22.9375, true, true),
  ('ZM', 'ZMB', 'Zambia', 'Africa', 'Southern Africa', 'Lusaka', 'ZMW', 'https://flagcdn.com/zm.svg', -13.1339, 27.8493, true, true),
  ('ZW', 'ZWE', 'Zimbabwe', 'Africa', 'Southern Africa', 'Harare', 'ZWL', 'https://flagcdn.com/zw.svg', -19.0154, 29.1549, true, true)
ON CONFLICT (iso3) DO UPDATE
SET name = EXCLUDED.name,
    region = EXCLUDED.region,
    subregion = EXCLUDED.subregion,
    capital = EXCLUDED.capital,
    currency_code = EXCLUDED.currency_code,
    flag_svg_url = EXCLUDED.flag_svg_url,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    is_african_country = EXCLUDED.is_african_country,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- =========================================================
-- 3. CARIBBEAN COUNTRIES (20 Selected)
-- =========================================================

-- Data source: REST Countries API
-- Coverage: 20 major Caribbean nations (data only, no map in Phase 3A)

INSERT INTO public.souvera_countries 
(iso2, iso3, name, region, subregion, capital, currency_code, flag_svg_url, lat, lng, is_african_country, is_active)
VALUES
  ('AG', 'ATG', 'Antigua and Barbuda', 'Americas', 'Caribbean', 'St. John''s', 'XCD', 'https://flagcdn.com/ag.svg', 17.0608, -61.7964, false, true),
  ('BS', 'BHS', 'Bahamas', 'Americas', 'Caribbean', 'Nassau', 'BSD', 'https://flagcdn.com/bs.svg', 25.0343, -77.3963, false, true),
  ('BB', 'BRB', 'Barbados', 'Americas', 'Caribbean', 'Bridgetown', 'BBD', 'https://flagcdn.com/bb.svg', 13.1939, -59.5432, false, true),
  ('CU', 'CUB', 'Cuba', 'Americas', 'Caribbean', 'Havana', 'CUP', 'https://flagcdn.com/cu.svg', 21.5218, -77.7812, false, true),
  ('DM', 'DMA', 'Dominica', 'Americas', 'Caribbean', 'Roseau', 'XCD', 'https://flagcdn.com/dm.svg', 15.4150, -61.3710, false, true),
  ('DO', 'DOM', 'Dominican Republic', 'Americas', 'Caribbean', 'Santo Domingo', 'DOP', 'https://flagcdn.com/do.svg', 18.7357, -70.1627, false, true),
  ('GD', 'GRD', 'Grenada', 'Americas', 'Caribbean', 'St. George''s', 'XCD', 'https://flagcdn.com/gd.svg', 12.1165, -61.6790, false, true),
  ('HT', 'HTI', 'Haiti', 'Americas', 'Caribbean', 'Port-au-Prince', 'HTG', 'https://flagcdn.com/ht.svg', 18.9712, -72.2852, false, true),
  ('JM', 'JAM', 'Jamaica', 'Americas', 'Caribbean', 'Kingston', 'JMD', 'https://flagcdn.com/jm.svg', 18.1096, -77.2975, false, true),
  ('KN', 'KNA', 'Saint Kitts and Nevis', 'Americas', 'Caribbean', 'Basseterre', 'XCD', 'https://flagcdn.com/kn.svg', 17.3578, -62.7830, false, true),
  ('LC', 'LCA', 'Saint Lucia', 'Americas', 'Caribbean', 'Castries', 'XCD', 'https://flagcdn.com/lc.svg', 13.9094, -60.9789, false, true),
  ('VC', 'VCT', 'Saint Vincent and the Grenadines', 'Americas', 'Caribbean', 'Kingstown', 'XCD', 'https://flagcdn.com/vc.svg', 12.9843, -61.2872, false, true),
  ('SR', 'SUR', 'Suriname', 'Americas', 'Caribbean', 'Paramaribo', 'SRD', 'https://flagcdn.com/sr.svg', 3.9193, -56.0278, false, true),
  ('TT', 'TTO', 'Trinidad and Tobago', 'Americas', 'Caribbean', 'Port of Spain', 'TTD', 'https://flagcdn.com/tt.svg', 10.6918, -61.2225, false, true),
  ('GY', 'GUY', 'Guyana', 'Americas', 'South America', 'Georgetown', 'GYD', 'https://flagcdn.com/gy.svg', 4.8604, -58.9302, false, true),
  ('BZ', 'BLZ', 'Belize', 'Americas', 'Central America', 'Belmopan', 'BZD', 'https://flagcdn.com/bz.svg', 17.1899, -88.4976, false, true),
  ('PR', 'PRI', 'Puerto Rico', 'Americas', 'Caribbean', 'San Juan', 'USD', 'https://flagcdn.com/pr.svg', 18.2208, -66.5901, false, true),
  ('VG', 'VGB', 'British Virgin Islands', 'Americas', 'Caribbean', 'Road Town', 'USD', 'https://flagcdn.com/vg.svg', 18.4207, -64.6400, false, true),
  ('TC', 'TCA', 'Turks and Caicos Islands', 'Americas', 'Caribbean', 'Cockburn Town', 'USD', 'https://flagcdn.com/tc.svg', 21.6940, -71.7979, false, true),
  ('KY', 'CYM', 'Cayman Islands', 'Americas', 'Caribbean', 'George Town', 'KYD', 'https://flagcdn.com/ky.svg', 19.3133, -81.2546, false, true)
ON CONFLICT (iso3) DO UPDATE
SET name = EXCLUDED.name,
    region = EXCLUDED.region,
    subregion = EXCLUDED.subregion,
    capital = EXCLUDED.capital,
    currency_code = EXCLUDED.currency_code,
    flag_svg_url = EXCLUDED.flag_svg_url,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    is_african_country = EXCLUDED.is_african_country,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- =========================================================
-- 4. CURATED PREVIEW OBSERVATIONS (20 Priority Countries)
-- =========================================================

-- Data sources: World Bank (2023-2024 estimates), IMF projections
-- Purpose: Demonstrate map intelligence with defensible sample data
-- Label: "Curated Preview Data" in frontend

-- Helper: Get IDs for sources and indicators
DO $$
DECLARE
  v_world_bank_id uuid;
  v_gdp_id uuid;
  v_growth_id uuid;
  v_pop_id uuid;
BEGIN
  -- Get source ID
  SELECT id INTO v_world_bank_id FROM public.souvera_data_sources WHERE key = 'world_bank';
  
  -- Get indicator IDs
  SELECT id INTO v_gdp_id FROM public.souvera_indicators WHERE key = 'gdp_current_usd';
  SELECT id INTO v_growth_id FROM public.souvera_indicators WHERE key = 'gdp_growth_pct';
  SELECT id INTO v_pop_id FROM public.souvera_indicators WHERE key = 'population_total';

  -- Insert observations for 20 priority countries
  -- Data source: World Bank, IMF 2024 estimates
  
  INSERT INTO public.souvera_country_observations 
  (country_id, indicator_id, period_date, period_type, value_numeric, source_id, fetched_at, published_at)
  SELECT 
    (SELECT id FROM public.souvera_countries WHERE iso3 = country_iso),
    indicator_id,
    '2024-12-31'::date,
    'annual',
    value_numeric,
    v_world_bank_id,
    '2026-04-28T00:00:00Z'::timestamptz,
    '2024-10-01T00:00:00Z'::timestamptz
  FROM (VALUES
    -- Nigeria
    ('NGA', v_gdp_id, 477380000000::numeric),
    ('NGA', v_growth_id, 3.25::numeric),
    ('NGA', v_pop_id, 223800000::numeric),
    
    -- South Africa
    ('ZAF', v_gdp_id, 380900000000::numeric),
    ('ZAF', v_growth_id, 0.9::numeric),
    ('ZAF', v_pop_id, 60600000::numeric),
    
    -- Egypt
    ('EGY', v_gdp_id, 398000000000::numeric),
    ('EGY', v_growth_id, 3.8::numeric),
    ('EGY', v_pop_id, 111000000::numeric),
    
    -- Kenya
    ('KEN', v_gdp_id, 113500000000::numeric),
    ('KEN', v_growth_id, 5.3::numeric),
    ('KEN', v_pop_id, 55100000::numeric),
    
    -- Ghana
    ('GHA', v_gdp_id, 72300000000::numeric),
    ('GHA', v_growth_id, 2.8::numeric),
    ('GHA', v_pop_id, 34100000::numeric),
    
    -- Tanzania
    ('TZA', v_gdp_id, 79600000000::numeric),
    ('TZA', v_growth_id, 5.2::numeric),
    ('TZA', v_pop_id, 67400000::numeric),
    
    -- Ethiopia
    ('ETH', v_gdp_id, 156100000000::numeric),
    ('ETH', v_growth_id, 6.2::numeric),
    ('ETH', v_pop_id, 126500000::numeric),
    
    -- Morocco
    ('MAR', v_gdp_id, 134200000000::numeric),
    ('MAR', v_growth_id, 3.2::numeric),
    ('MAR', v_pop_id, 37800000::numeric),
    
    -- Angola
    ('AGO', v_gdp_id, 94100000000::numeric),
    ('AGO', v_growth_id, 2.8::numeric),
    ('AGO', v_pop_id, 36700000::numeric),
    
    -- Côte d'Ivoire
    ('CIV', v_gdp_id, 86900000000::numeric),
    ('CIV', v_growth_id, 6.5::numeric),
    ('CIV', v_pop_id, 28900000::numeric),
    
    -- Zambia
    ('ZMB', v_gdp_id, 29000000000::numeric),
    ('ZMB', v_growth_id, 4.2::numeric),
    ('ZMB', v_pop_id, 20600000::numeric),
    
    -- Rwanda
    ('RWA', v_gdp_id, 14600000000::numeric),
    ('RWA', v_growth_id, 7.2::numeric),
    ('RWA', v_pop_id, 14100000::numeric),
    
    -- Uganda
    ('UGA', v_gdp_id, 49200000000::numeric),
    ('UGA', v_growth_id, 5.8::numeric),
    ('UGA', v_pop_id, 48600000::numeric),
    
    -- Senegal
    ('SEN', v_gdp_id, 31800000000::numeric),
    ('SEN', v_growth_id, 8.3::numeric),
    ('SEN', v_pop_id, 18100000::numeric),
    
    -- Tunisia
    ('TUN', v_gdp_id, 46700000000::numeric),
    ('TUN', v_growth_id, 1.8::numeric),
    ('TUN', v_pop_id, 12500000::numeric),
    
    -- Botswana
    ('BWA', v_gdp_id, 20300000000::numeric),
    ('BWA', v_growth_id, 4.0::numeric),
    ('BWA', v_pop_id, 2700000::numeric),
    
    -- Mozambique
    ('MOZ', v_gdp_id, 21100000000::numeric),
    ('MOZ', v_growth_id, 5.5::numeric),
    ('MOZ', v_pop_id, 33900000::numeric),
    
    -- Namibia
    ('NAM', v_gdp_id, 12400000000::numeric),
    ('NAM', v_growth_id, 3.4::numeric),
    ('NAM', v_pop_id, 2600000::numeric),
    
    -- Zimbabwe
    ('ZWE', v_gdp_id, 31000000000::numeric),
    ('ZWE', v_growth_id, 3.5::numeric),
    ('ZWE', v_pop_id, 16600000::numeric),
    
    -- DR Congo
    ('COD', v_gdp_id, 68000000000::numeric),
    ('COD', v_growth_id, 6.8::numeric),
    ('COD', v_pop_id, 102300000::numeric)
  ) AS t(country_iso, indicator_id, value_numeric)
  ON CONFLICT (country_id, indicator_id, period_date, source_id) DO UPDATE
  SET value_numeric = EXCLUDED.value_numeric,
      fetched_at = EXCLUDED.fetched_at;

END $$;

-- =========================================================
-- 5. SIGNAL SCORES (20 Priority Countries)
-- =========================================================

-- Data source: Curated preview scores for demonstration
-- Purpose: Enable signal-level display in map

INSERT INTO public.souvera_country_signal_scores 
(country_id, signal_level, growth_score, risk_score, investment_score, confidence_score, scoring_version, computed_at)
SELECT 
  (SELECT id FROM public.souvera_countries WHERE iso3 = country_iso),
  signal_level::souvera_signal_level,
  growth_score,
  risk_score,
  investment_score,
  confidence_score,
  'v1.0-preview',
  '2026-04-28T00:00:00Z'::timestamptz
FROM (VALUES
  -- signal_level options: 'high_growth', 'emerging', 'stable', 'watchlist', 'risk_elevated'
  ('NGA', 'emerging', 68, 55, 65, 70),
  ('ZAF', 'stable', 45, 50, 72, 85),
  ('EGY', 'emerging', 70, 60, 68, 75),
  ('KEN', 'high_growth', 82, 45, 78, 80),
  ('GHA', 'emerging', 65, 60, 70, 75),
  ('TZA', 'high_growth', 75, 50, 72, 78),
  ('ETH', 'high_growth', 88, 65, 70, 65),
  ('MAR', 'stable', 62, 35, 78, 85),
  ('AGO', 'emerging', 58, 70, 60, 60),
  ('CIV', 'high_growth', 85, 50, 75, 75),
  ('ZMB', 'emerging', 68, 65, 65, 70),
  ('RWA', 'high_growth', 92, 40, 82, 88),
  ('UGA', 'high_growth', 78, 55, 72, 75),
  ('SEN', 'high_growth', 90, 45, 80, 82),
  ('TUN', 'stable', 50, 60, 68, 72),
  ('BWA', 'stable', 65, 30, 85, 90),
  ('MOZ', 'emerging', 72, 70, 62, 65),
  ('NAM', 'emerging', 68, 45, 72, 78),
  ('ZWE', 'watchlist', 62, 80, 55, 60),
  ('COD', 'emerging', 75, 75, 60, 58)
) AS t(country_iso, signal_level, growth_score, risk_score, investment_score, confidence_score)
ON CONFLICT (country_id) DO UPDATE
SET signal_level = EXCLUDED.signal_level,
    growth_score = EXCLUDED.growth_score,
    risk_score = EXCLUDED.risk_score,
    investment_score = EXCLUDED.investment_score,
    confidence_score = EXCLUDED.confidence_score,
    scoring_version = EXCLUDED.scoring_version,
    computed_at = EXCLUDED.computed_at;

-- =========================================================
-- 6. COUNTRY PROFILES (5 High-Priority Countries)
-- =========================================================

-- Minimal editorial teasers for top priority countries
-- Full editorial content to be added in Phase 3B

INSERT INTO public.souvera_country_profiles 
(country_id, summary_md, signal_level, updated_at)
VALUES
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
    'Africa''s largest population and 3rd largest economy. Major fintech hub and consumer market with significant oil and gas resources.',
    'emerging',
    now()
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
    'East Africa''s tech and financial services hub. Home to M-Pesa and a thriving startup ecosystem with strong infrastructure.',
    'high_growth',
    now()
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'RWA'),
    'Africa''s most business-friendly economy with exceptional governance and rapidly growing ICT sector.',
    'high_growth',
    now()
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
    'Africa''s most sophisticated economy and financial hub with deep capital markets and advanced infrastructure.',
    'stable',
    now()
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'EGY'),
    'Africa''s 2nd largest economy and strategic gateway controlling the Suez Canal with major logistics and energy sectors.',
    'emerging',
    now()
  )
ON CONFLICT (country_id) DO UPDATE
SET summary_md = EXCLUDED.summary_md,
    signal_level = EXCLUDED.signal_level,
    updated_at = now();

-- =========================================================
-- VERIFICATION QUERIES
-- =========================================================

-- Run these queries to verify seed data:

-- SELECT COUNT(*) FROM souvera_countries WHERE is_african_country = true;
-- Expected: 54

-- SELECT COUNT(*) FROM souvera_countries WHERE is_african_country = false;
-- Expected: 20

-- SELECT COUNT(*) FROM souvera_country_observations;
-- Expected: 60 (20 countries × 3 indicators)

-- SELECT COUNT(*) FROM souvera_country_signal_scores;
-- Expected: 20

-- SELECT iso3, name, gdp_current_usd, population_total, signal_level 
-- FROM souvera_country_lite_v 
-- WHERE is_african_country = true 
-- LIMIT 5;
-- Expected: 5 rows with populated data

-- =========================================================
-- END SQL PACK v1.5
-- =========================================================
