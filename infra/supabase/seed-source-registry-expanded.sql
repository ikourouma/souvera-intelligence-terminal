-- =========================================================
-- Expanded Source Registry + Top 20 indicator catalog
-- Run after sql-pack-v1.1.sql
-- =========================================================

insert into public.souvera_data_sources
(key, name, domain, provider_url, api_base_url, api_docs_url, auth_model, billing_model, refresh_cadence, priority_rank, fallback_source_keys, legal_status, redistribution_notes, is_active)
values
  ('imf_dataservices', 'IMF Data Services (SDMX JSON)', 'external_fiscal_monetary', 'https://www.imf.org', 'https://dataservices.imf.org/REST/SDMX_JSON.svc/', 'https://datahelp.imf.org/knowledgebase/articles/630877-data-services', 'public', 'free', 'monthly', 12, array['world_bank'], 'review_required', 'Attribution required; confirm per dataset', true),
  ('faostat', 'FAOSTAT API', 'agriculture', 'https://www.fao.org/faostat', 'https://fenixservices.fao.org/faostat/api/v1/en/', 'https://fenixservices.fao.org/faostat/api/v1/en/', 'public', 'free', 'monthly', 13, array['world_bank'], 'review_required', 'Attribution required', true),
  ('world_bank_projects', 'World Bank Projects & Operations API', 'projects', 'https://www.worldbank.org', 'https://search.worldbank.org/api/v2/projects', 'https://search.worldbank.org/api/v2/projects', 'public', 'free', 'weekly', 14, array[]::text[], 'review_required', 'Project summaries with attribution', true),
  ('ofac_sanctions', 'OFAC Sanctions Lists', 'compliance', 'https://ofac.treasury.gov/sanctions-lists', null, 'https://ofac.treasury.gov/specially-designated-nationals-list-data-formats', 'public', 'free', 'daily', 20, array[]::text[], 'review_required', 'Download+parse; optional until wired', false),
  ('unsc_sanctions', 'UN Security Council Consolidated Sanctions', 'compliance', 'https://www.un.org/securitycouncil/sanctions', 'https://scsanctions.un.org/resources/xml/en/consolidated.xml', null, 'public', 'free', 'daily', 21, array[]::text[], 'review_required', 'XML feed; optional until wired', false),
  ('unctadstat', 'UNCTADstat', 'trade_logistics', 'https://unctadstat.unctad.org/EN/', null, 'https://unctadstat.unctad.org/EN/', 'public', 'free', 'quarterly', 22, array['world_bank'], 'review_required', 'Ingestion method under review', false),
  ('imf_areaer', 'IMF AREAER (FX regime)', 'fx_regime', 'https://www.imf.org', null, 'https://www.imf.org/en/Publications/Annual-Report-on-Exchange-Arrangements-and-Exchange-Restrictions', 'public', 'free', 'annual', 23, array[]::text[], 'review_required', 'Document-based; no standard API', false)
on conflict (key) do update
set name = excluded.name,
    domain = excluded.domain,
    provider_url = excluded.provider_url,
    api_base_url = excluded.api_base_url,
    api_docs_url = excluded.api_docs_url,
    auth_model = excluded.auth_model,
    refresh_cadence = excluded.refresh_cadence,
    legal_status = excluded.legal_status,
    redistribution_notes = excluded.redistribution_notes,
    is_active = excluded.is_active;

-- Top 20 supplemental indicators (existing keys upserted)
insert into public.souvera_indicators
(key, label, domain, unit, description, preferred_source_key, fallback_source_keys, refresh_policy, is_forecast, min_plan_id)
values
  ('gdp_per_capita_usd', 'GDP per capita (current US$)', 'macro', 'USD', 'GDP per capita in current US dollars', 'world_bank', array['imf'], 'weekly', false, 'public'),
  ('current_account_pct_gdp', 'Current account balance (% of GDP)', 'external', 'percent', 'Current account balance as percent of GDP', 'world_bank', array['imf_dataservices'], 'weekly', false, 'professional'),
  ('reserves_total_usd', 'Total reserves (current US$)', 'external', 'USD', 'Total reserves including gold', 'world_bank', array['imf_dataservices'], 'weekly', false, 'professional'),
  ('reserves_months_imports', 'Reserves (months of imports)', 'external', 'months', 'Total reserves in months of imports', 'world_bank', array['imf_dataservices'], 'weekly', false, 'professional'),
  ('official_exchange_rate', 'Official exchange rate (LCU/USD)', 'fx', 'rate', 'Official average exchange rate', 'world_bank', array['open_exchange_rates'], 'weekly', false, 'professional'),
  ('exports_goods_services_usd', 'Exports of goods & services (US$)', 'trade', 'USD', 'Exports of goods and services', 'world_bank', array['un_comtrade'], 'weekly', false, 'business'),
  ('imports_goods_services_usd', 'Imports of goods & services (US$)', 'trade', 'USD', 'Imports of goods and services', 'world_bank', array['un_comtrade'], 'weekly', false, 'business'),
  ('trade_pct_gdp', 'Trade (% of GDP)', 'trade', 'percent', 'Trade as share of GDP', 'world_bank', array[]::text[], 'weekly', false, 'business'),
  ('unemployment_pct', 'Unemployment (% of labor force)', 'labor', 'percent', 'Unemployment rate', 'world_bank', array[]::text[], 'weekly', false, 'business'),
  ('internet_users_pct', 'Internet users (% of population)', 'digital', 'percent', 'Individuals using the Internet', 'world_bank', array[]::text[], 'weekly', false, 'public'),
  ('life_expectancy_years', 'Life expectancy (years)', 'demographics', 'years', 'Life expectancy at birth', 'world_bank', array[]::text[], 'weekly', false, 'public'),
  ('urban_population_pct', 'Urban population (% of total)', 'demographics', 'percent', 'Urban population share', 'world_bank', array[]::text[], 'weekly', false, 'public'),
  ('electricity_access_pct', 'Access to electricity (% of population)', 'infrastructure', 'percent', 'Population with electricity access', 'world_bank', array[]::text[], 'weekly', false, 'public'),
  ('co2_emissions_per_capita', 'CO2 emissions (metric tons per capita)', 'environment', 'metric_tons', 'CO2 emissions per capita', 'world_bank', array[]::text[], 'weekly', false, 'public'),
  ('debt_to_gdp_pct', 'General government debt (% of GDP)', 'fiscal', 'percent', 'Central government debt to GDP', 'imf_dataservices', array['world_bank'], 'monthly', false, 'professional')
on conflict (key) do update
set label = excluded.label,
    domain = excluded.domain,
    unit = excluded.unit,
    description = excluded.description,
    preferred_source_key = excluded.preferred_source_key,
    fallback_source_keys = excluded.fallback_source_keys,
    refresh_policy = excluded.refresh_policy;
