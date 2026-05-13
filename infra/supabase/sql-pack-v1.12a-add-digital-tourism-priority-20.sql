-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL Pack v1.12a — Phase 4A Stage 1
-- Add Digital Infrastructure + Tourism & Hospitality
-- Priority 20 Countries Only
-- Owner: Afronovation, Inc.
-- ===========================================
--
-- PURPOSE:
-- Add 2 new sectors to 20 priority markets:
--   1. Digital Infrastructure (display_order: 1)
--   2. Tourism & Hospitality (display_order: 7)
--
-- SCOPE:
-- AFRICA (13):
--   NGA, ZAF, KEN, EGY, GHA, CIV, ETH, MAR, TZA, UGA, RWA, SEN, CMR
-- CARIBBEAN (7):
--   JAM, TTO, BRB, DOM, BHS, GRD, LCA
--
-- QUOTING STRATEGY:
-- All teaser_md and rationale_md values use dollar-quoting ($$...$$).
-- Dollar-quoted strings require NO escaping for apostrophes or backslashes.
--
-- IDEMPOTENCY:
-- Uses ON CONFLICT (country_id, sector_key) DO UPDATE.
-- Safe to rerun.
--
-- EXECUTION:
-- Run this SQL in Supabase SQL Editor after Phase 4A FDI ingestion is complete.
--
-- VERIFICATION:
-- After execution, run:
--   infra/supabase/verification/phase-4a-digital-tourism-priority-20-verification.sql
--
-- EXPECTED RESULT:
-- 140 sector rows (20 countries × 7 sectors)
-- Existing 100 rows unchanged
-- 40 new rows added
--
-- ===========================================

-- ═══════════════════════════════════════════════════════════════════════════
-- DIGITAL INFRASTRUCTURE + TOURISM & HOSPITALITY SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════

WITH sector_seed AS (
  SELECT * FROM (VALUES
    -- ────────────────────────────────────────────────────────────────────────
    -- NIGERIA (NGA) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('NGA', 'digital_infrastructure', 'Digital Infrastructure',
      $$Nigeria's digital infrastructure is supported by expanding broadband penetration, cloud investment, growing data center capacity, and institutional digital transformation initiatives.$$,
      $$Nigeria is positioning as a West African digital hub through fiber backbone expansion, cloud service provider entry, data center construction in Lagos and Abuja, and government digital transformation programs. Broadband penetration is increasing, fintech infrastructure is mature, and digital identity initiatives are advancing. The sector represents strategic opportunity for sovereign data infrastructure, e-government, and AI readiness investments.$$,
      72, 80, 1, 'explorer'),
    ('NGA', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Nigeria's visitor economy is supported by business travel, diaspora demand, cultural heritage assets, and aviation infrastructure development.$$,
      $$Nigeria's tourism sector is driven by business travel to Lagos and Abuja, diaspora engagement, and growing interest in cultural heritage and eco-tourism. Aviation connectivity is expanding through regional and international routes, and hotel capacity is increasing in commercial centers. The sector represents an underutilized opportunity for destination investment and tourism board modernization.$$,
      65, 72, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- SOUTH AFRICA (ZAF) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('ZAF', 'digital_infrastructure', 'Digital Infrastructure',
      $$South Africa's digital infrastructure combines advanced broadband networks, data center maturity, cloud provider presence, and comprehensive e-government platforms.$$,
      $$South Africa is a recognized digital infrastructure leader across Africa, supported by mature fiber backbone networks, submarine cable connectivity, data center hubs in Johannesburg and Cape Town, and advanced fintech infrastructure. E-government services are well-developed, digital identity systems are deployed, and cloud adoption is strong across public and private sectors. The sector is positioned for AI infrastructure expansion and regional digital hub development.$$,
      85, 78, 1, 'explorer'),
    ('ZAF', 'tourism_hospitality', 'Tourism and Hospitality',
      $$South Africa's visitor economy is anchored by wildlife tourism, coastal leisure infrastructure, business travel capacity, and established destination branding.$$,
      $$South Africa combines mature wildlife and safari tourism, coastal resort infrastructure in Cape Town and KwaZulu-Natal, business and conference tourism in Johannesburg, and strong aviation connectivity. The visitor economy contributes significantly to foreign exchange and employment. The sector is strategic for destination infrastructure investment, sports tourism expansion, and regional tourism gateway positioning.$$,
      88, 75, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- KENYA (KEN) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('KEN', 'digital_infrastructure', 'Digital Infrastructure',
      $$Kenya's digital infrastructure is anchored by advanced broadband networks, submarine cable connectivity, data center maturity, and comprehensive e-government platforms.$$,
      $$Kenya is a recognized digital infrastructure leader in Africa, supported by mature fiber backbone networks, submarine cable access, growing data center capacity in Nairobi, and advanced mobile money infrastructure. E-government services are well-developed, digital identity systems are deployed, and cloud adoption is increasing across sectors. The sector is positioned for AI infrastructure, sovereign data centers, and regional digital hub expansion.$$,
      85, 82, 1, 'explorer'),
    ('KEN', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Kenya's visitor economy is anchored by established wildlife tourism, air connectivity, hospitality infrastructure, and regional events capacity.$$,
      $$Kenya is a leading African tourism destination supported by wildlife and eco-tourism, coastal leisure travel, and business tourism to Nairobi. Air connectivity through Nairobi's regional hub, hotel infrastructure across key tourism zones, and destination branding position Kenya as a mature visitor economy. The sector contributes significantly to foreign exchange, employment, and conservation financing.$$,
      88, 80, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- EGYPT (EGY) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('EGY', 'digital_infrastructure', 'Digital Infrastructure',
      $$Egypt's digital infrastructure is supported by submarine cable connectivity, expanding data center capacity, e-government initiatives, and smart city development.$$,
      $$Egypt is positioning as a North African and Middle Eastern digital hub through submarine cable access, data center investment in Cairo, government digital transformation programs, and smart city initiatives. Broadband expansion is advancing, digital payments infrastructure is growing, and AI policy frameworks are emerging. The sector represents strategic opportunity for sovereign data infrastructure and regional digital gateway development.$$,
      74, 76, 1, 'explorer'),
    ('EGY', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Egypt's visitor economy is anchored by heritage tourism, Red Sea resort infrastructure, established aviation connectivity, and destination branding maturity.$$,
      $$Egypt combines world-class heritage tourism centered on ancient sites, mature Red Sea coastal resort infrastructure, strong European aviation connectivity, and Nile River tourism. The visitor economy is a major foreign exchange contributor with established hotel capacity, tour operator networks, and destination marketing. The sector is strategic for tourism infrastructure modernization and cultural heritage preservation.$$,
      90, 75, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- GHANA (GHA) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('GHA', 'digital_infrastructure', 'Digital Infrastructure',
      $$Ghana's digital infrastructure combines fiber backbone expansion, cloud readiness, digital payments infrastructure, and government digital transformation initiatives.$$,
      $$Ghana is advancing as a West African digital hub supported by fiber backbone deployment, submarine cable connectivity, growing fintech infrastructure, and government e-services platforms. Digital identity systems are expanding, data center capacity is increasing in Accra, and mobile money adoption is mature. The sector represents opportunity for digital public infrastructure, AI readiness, and regional connectivity development.$$,
      70, 75, 1, 'explorer'),
    ('GHA', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Ghana's visitor economy is supported by heritage tourism, coastal infrastructure, diaspora travel demand, and cultural festival capacity.$$,
      $$Ghana combines cultural heritage tourism centered on historic slave trade sites, coastal leisure infrastructure, strong diaspora engagement from North America and Europe, and cultural festival events. Aviation connectivity is improving, hotel capacity is expanding in Accra, and destination branding is advancing. The sector is strategic for tourism board modernization and heritage tourism investment.$$,
      68, 73, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- CÔTE D'IVOIRE (CIV) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('CIV', 'digital_infrastructure', 'Digital Infrastructure',
      $$Côte d'Ivoire's digital infrastructure is supported by submarine cable connectivity, Abidjan data center development, mobile money infrastructure, and institutional modernization.$$,
      $$Côte d'Ivoire is advancing digital infrastructure through submarine cable access, data center investment in Abidjan, government digital transformation initiatives, and mobile financial services expansion. Broadband deployment is increasing, digital identity frameworks are emerging, and fintech infrastructure is growing. The sector represents strategic opportunity for West African digital gateway positioning and e-government development.$$,
      65, 72, 1, 'explorer'),
    ('CIV', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Côte d'Ivoire's visitor economy is supported by coastal tourism potential, business travel to Abidjan, cultural heritage assets, and emerging destination positioning.$$,
      $$Côte d'Ivoire combines coastal tourism infrastructure along the Atlantic coast, business travel to Abidjan's commercial center, cultural heritage sites, and French-speaking West African diaspora engagement. Hotel capacity is expanding, aviation connectivity is improving through Abidjan hub development, and tourism board initiatives are advancing. The sector represents emerging opportunity for destination investment.$$,
      60, 70, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- ETHIOPIA (ETH) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('ETH', 'digital_infrastructure', 'Digital Infrastructure',
      $$Ethiopia's digital infrastructure is advancing through telecommunications reform, fiber backbone expansion, data center development, and government digital transformation.$$,
      $$Ethiopia is transforming digital infrastructure through telecommunications sector liberalization, national fiber backbone deployment, data center investment in Addis Ababa, and government e-services expansion. Digital identity initiatives are launching, mobile money is emerging post-telecom reform, and cloud adoption is beginning. The sector represents strategic opportunity for sovereign digital infrastructure and regional connectivity.$$,
      62, 78, 1, 'explorer'),
    ('ETH', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Ethiopia's visitor economy is supported by heritage tourism, eco-tourism potential, aviation hub connectivity, and cultural festival capacity.$$,
      $$Ethiopia combines UNESCO World Heritage cultural sites, emerging eco-tourism in the Rift Valley and Simien Mountains, Ethiopian Airlines' African aviation hub status, and Orthodox Christian heritage tourism. Hotel infrastructure is expanding in Addis Ababa, destination marketing is advancing, and diaspora travel is significant. The sector is strategic for tourism infrastructure development and heritage preservation.$$,
      70, 76, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- MOROCCO (MAR) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('MAR', 'digital_infrastructure', 'Digital Infrastructure',
      $$Morocco's digital infrastructure combines submarine cable connectivity, data center maturity in Casablanca, comprehensive e-government platforms, and smart city initiatives.$$,
      $$Morocco is a North African digital infrastructure leader with submarine cable connectivity to Europe, mature data center capacity in Casablanca, advanced government digital services, and smart city development in Rabat. Digital ID systems are deployed, cybersecurity frameworks are mature, and cloud adoption is strong. The sector is positioned for AI infrastructure expansion and regional digital gateway development.$$,
      78, 74, 1, 'explorer'),
    ('MAR', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Morocco's visitor economy is anchored by mature European tourism, heritage site infrastructure, coastal resort capacity, and established destination branding.$$,
      $$Morocco combines well-developed tourism infrastructure serving European markets, UNESCO heritage sites including medinas and kasbahs, Atlantic and Mediterranean coastal resorts, and strong aviation connectivity. The visitor economy is a major foreign exchange contributor with mature hotel capacity, tour networks, and destination marketing. The sector is strategic for tourism modernization and cultural preservation.$$,
      85, 72, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- TANZANIA (TZA) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('TZA', 'digital_infrastructure', 'Digital Infrastructure',
      $$Tanzania's digital infrastructure is advancing through fiber backbone expansion, submarine cable connectivity, mobile money maturity, and e-government initiatives.$$,
      $$Tanzania is developing digital infrastructure through national fiber backbone deployment, submarine cable access via Dar es Salaam, mature mobile money infrastructure, and government digital service platforms. Digital identity initiatives are advancing, data center capacity is growing, and regional connectivity to East Africa is expanding. The sector represents opportunity for digital public infrastructure and e-government development.$$,
      64, 73, 1, 'explorer'),
    ('TZA', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Tanzania's visitor economy is anchored by wildlife tourism in Serengeti, coastal leisure in Zanzibar, Mount Kilimanjaro trekking, and aviation connectivity.$$,
      $$Tanzania combines world-class wildlife tourism in Serengeti and Ngorongoro, Indian Ocean coastal tourism in Zanzibar, mountain tourism to Kilimanjaro, and established safari infrastructure. Aviation connectivity through Dar es Salaam and Kilimanjaro airports, hotel capacity across tourism zones, and destination branding position Tanzania as a leading East African tourism destination contributing significantly to foreign exchange.$$,
      86, 78, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- UGANDA (UGA) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('UGA', 'digital_infrastructure', 'Digital Infrastructure',
      $$Uganda's digital infrastructure is supported by fiber backbone expansion, mobile money infrastructure, government digital services, and regional connectivity development.$$,
      $$Uganda is advancing digital infrastructure through national fiber backbone deployment, mature mobile money adoption, government e-services platforms, and regional connectivity to East Africa. Digital identity initiatives are progressing, data center capacity is growing in Kampala, and fintech infrastructure is expanding. The sector represents opportunity for digital public infrastructure, AI readiness, and landlocked digital gateway positioning.$$,
      63, 71, 1, 'explorer'),
    ('UGA', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Uganda's visitor economy is supported by gorilla tourism, wildlife safari infrastructure, adventure tourism potential, and regional connectivity.$$,
      $$Uganda combines specialized gorilla tourism in Bwindi, wildlife safari infrastructure in Queen Elizabeth and Murchison Falls parks, adventure tourism including Nile River activities, and eco-tourism positioning. Aviation connectivity through Entebbe, hotel infrastructure in Kampala and tourism zones, and destination marketing support the visitor economy. The sector is strategic for conservation tourism and eco-tourism development.$$,
      74, 75, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- RWANDA (RWA) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('RWA', 'digital_infrastructure', 'Digital Infrastructure',
      $$Rwanda's digital infrastructure is anchored by comprehensive fiber networks, advanced e-government platforms, smart city initiatives, and regional digital hub positioning.$$,
      $$Rwanda is a recognized digital infrastructure leader with comprehensive national fiber coverage, advanced government digital services, Kigali smart city development, and regional ICT hub positioning. Digital ID is deployed, cybersecurity frameworks are advanced, mobile money is mature, and data center capacity is expanding. The sector is positioned for AI infrastructure, digital public infrastructure leadership, and East African digital gateway development.$$,
      80, 82, 1, 'explorer'),
    ('RWA', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Rwanda's visitor economy is anchored by gorilla tourism, MICE capacity in Kigali, eco-tourism positioning, and aviation hub connectivity.$$,
      $$Rwanda combines high-value gorilla tourism in Volcanoes National Park, meetings and conference tourism in Kigali, eco-tourism and conservation focus, and RwandAir's regional hub development. Hotel infrastructure is expanding, destination branding emphasizes sustainability, and tourism board services are digitizing. The sector contributes significantly to foreign exchange and conservation funding while positioning Rwanda as a premium African destination.$$,
      78, 80, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- SENEGAL (SEN) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('SEN', 'digital_infrastructure', 'Digital Infrastructure',
      $$Senegal's digital infrastructure is supported by submarine cable connectivity, Dakar data center development, mobile money infrastructure, and government digital transformation.$$,
      $$Senegal is advancing digital infrastructure through submarine cable access, data center investment in Dakar, government e-services platforms, and mobile financial services expansion. Digital identity initiatives are progressing, broadband deployment is increasing, and fintech infrastructure is growing. The sector represents strategic opportunity for West African digital gateway positioning and regional connectivity development.$$,
      67, 72, 1, 'explorer'),
    ('SEN', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Senegal's visitor economy is supported by coastal tourism, cultural heritage sites, French-speaking diaspora travel, and West African gateway positioning.$$,
      $$Senegal combines Atlantic coastal tourism infrastructure, cultural heritage sites including Gorée Island and Saint-Louis, strong French-speaking diaspora engagement, and positioning as a West African tourism gateway. Aviation connectivity through Dakar hub, hotel capacity expansion, and tourism board modernization support the visitor economy. The sector is strategic for diaspora tourism and destination infrastructure investment.$$,
      68, 71, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- CAMEROON (CMR) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('CMR', 'digital_infrastructure', 'Digital Infrastructure',
      $$Cameroon's digital infrastructure is advancing through submarine cable connectivity, fiber backbone expansion, mobile money growth, and institutional digital initiatives.$$,
      $$Cameroon is developing digital infrastructure through submarine cable access, fiber backbone deployment connecting Douala and Yaoundé, mobile financial services expansion, and government digital service initiatives. Digital identity frameworks are emerging, data center capacity is growing, and fintech infrastructure is advancing. The sector represents opportunity for Central African digital gateway positioning and regional connectivity.$$,
      62, 70, 1, 'explorer'),
    ('CMR', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Cameroon's visitor economy is supported by eco-tourism potential, coastal infrastructure, business travel to Douala, and cultural diversity.$$,
      $$Cameroon combines diverse eco-tourism assets including wildlife, volcanic landscapes, and coastal areas, business travel to Douala and Yaoundé, French and English-speaking cultural tourism, and regional sports tourism including football. Hotel capacity is expanding, aviation connectivity is improving, and tourism board initiatives are advancing. The sector represents emerging opportunity for eco-tourism and destination development.$$,
      58, 68, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- JAMAICA (JAM) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('JAM', 'digital_infrastructure', 'Digital Infrastructure',
      $$Jamaica's digital infrastructure combines submarine cable connectivity, cloud readiness, e-government modernization, and regional digital services hub positioning.$$,
      $$Jamaica benefits from submarine cable connectivity to North America and the Caribbean, established data center presence, government digital transformation initiatives, and positioning as a regional digital gateway. E-government services are advancing, digital identity frameworks are developing, cybersecurity capacity is growing, and fintech infrastructure supports regional payments. The sector is strategic for Caribbean digital hub development and institutional modernization.$$,
      76, 74, 1, 'explorer'),
    ('JAM', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Jamaica's visitor economy is anchored by regional air connectivity, established resort infrastructure, strong diaspora travel demand, and cultural tourism assets.$$,
      $$Jamaica combines mature hospitality capacity, robust air connectivity across North America and Europe, deep cultural tourism assets centered on music and heritage, and strong diaspora travel from the UK and North America. The visitor economy contributes significantly to foreign exchange, employment, and destination infrastructure investment. Sports tourism, cruise tourism, and events position Jamaica as a Caribbean tourism anchor.$$,
      82, 78, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- TRINIDAD AND TOBAGO (TTO) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('TTO', 'digital_infrastructure', 'Digital Infrastructure',
      $$Trinidad and Tobago's digital infrastructure combines submarine cable connectivity, financial technology infrastructure, e-government capacity, and regional digital services positioning.$$,
      $$Trinidad and Tobago benefits from submarine cable connectivity to the Americas, mature financial technology infrastructure, government digital services platforms, and positioning as a Caribbean digital services hub. Data center capacity exists in Port of Spain, cybersecurity frameworks are developing, digital payments infrastructure is mature, and business process outsourcing supports digital capacity. The sector is strategic for Caribbean financial technology and institutional digital transformation.$$,
      74, 70, 1, 'explorer'),
    ('TTO', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Trinidad and Tobago's visitor economy is supported by cultural festival capacity, business travel to Port of Spain, eco-tourism potential, and diaspora engagement.$$,
      $$Trinidad and Tobago combines major cultural festival tourism centered on Carnival, business and energy sector travel to Port of Spain, eco-tourism in Tobago including coastal and wildlife assets, and North American diaspora travel. Hotel and conference capacity supports business tourism, aviation connectivity serves regional and international routes, and destination marketing emphasizes cultural diversity. The sector is strategic for cultural tourism and diaspora engagement.$$,
      70, 68, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- BARBADOS (BRB) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('BRB', 'digital_infrastructure', 'Digital Infrastructure',
      $$Barbados' digital infrastructure combines submarine cable connectivity, digital services capacity, e-government platforms, and Caribbean digital hub positioning.$$,
      $$Barbados benefits from submarine cable connectivity to the Americas, established digital services and financial technology infrastructure, advanced e-government platforms, and positioning as a Caribbean digital services hub. Data center capacity supports regional services, cybersecurity frameworks are mature, digital identity initiatives are advancing, and business process outsourcing demonstrates digital capacity. The sector is strategic for Caribbean digital gateway development and institutional modernization.$$,
      78, 72, 1, 'explorer'),
    ('BRB', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Barbados' visitor economy is anchored by mature resort infrastructure, strong UK air connectivity, high-end tourism positioning, and established destination branding.$$,
      $$Barbados combines mature resort and hotel infrastructure, strong aviation connectivity to the UK and North America, high-end tourism market positioning, and established destination branding. The visitor economy is a major foreign exchange contributor with sophisticated tourism services, cultural heritage sites, and diaspora travel engagement. The sector is strategic for climate-resilient tourism infrastructure and premium destination development.$$,
      84, 70, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- DOMINICAN REPUBLIC (DOM) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('DOM', 'digital_infrastructure', 'Digital Infrastructure',
      $$Dominican Republic's digital infrastructure is advancing through submarine cable connectivity, data center development, mobile money expansion, and e-government initiatives.$$,
      $$Dominican Republic is developing digital infrastructure through submarine cable access, data center investment in Santo Domingo, mobile financial services growth, and government digital transformation programs. Digital identity initiatives are progressing, broadband expansion is advancing, and fintech infrastructure is growing to support tourism and remittance flows. The sector represents opportunity for Caribbean digital gateway positioning and institutional modernization.$$,
      70, 74, 1, 'explorer'),
    ('DOM', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Dominican Republic's visitor economy is anchored by established resort infrastructure, strong US air connectivity, coastal tourism capacity, and major hotel investment.$$,
      $$Dominican Republic combines extensive all-inclusive resort infrastructure, strong aviation connectivity to North American markets, Caribbean coastal tourism capacity, and significant hotel chain investment. The visitor economy is a leading foreign exchange contributor with mature tourism services, diaspora travel from the US, and cruise port infrastructure. The sector is strategic for tourism infrastructure modernization and climate-resilient destination development.$$,
      86, 75, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- BAHAMAS (BHS) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('BHS', 'digital_infrastructure', 'Digital Infrastructure',
      $$Bahamas' digital infrastructure combines submarine cable connectivity, financial technology capacity, e-government platforms, and digital services infrastructure.$$,
      $$Bahamas benefits from submarine cable connectivity to North America, mature financial technology infrastructure supporting offshore financial services, government digital platforms, and established telecommunications infrastructure. Data center capacity exists in Nassau, digital identity initiatives are advancing, cybersecurity frameworks support financial services, and fintech infrastructure is growing. The sector is strategic for Caribbean financial technology hub development.$$,
      76, 70, 1, 'explorer'),
    ('BHS', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Bahamas' visitor economy is anchored by proximity to US markets, extensive resort infrastructure, cruise tourism capacity, and luxury tourism positioning.$$,
      $$Bahamas combines extensive resort and hotel infrastructure, exceptional proximity and air connectivity to US markets, major cruise port infrastructure in Nassau, and luxury tourism positioning. The visitor economy dominates the services economy with mature tourism services, yacht and marine tourism, and strong destination branding. The sector is strategic for climate-resilient infrastructure, cruise tourism expansion, and luxury destination development.$$,
      88, 72, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- GRENADA (GRD) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('GRD', 'digital_infrastructure', 'Digital Infrastructure',
      $$Grenada's digital infrastructure is advancing through submarine cable connectivity, e-government initiatives, mobile infrastructure, and small island digital frameworks.$$,
      $$Grenada is developing digital infrastructure through submarine cable access, government digital service platforms, mobile telecommunications infrastructure, and small island state digital frameworks. Digital identity initiatives are emerging, broadband expansion is advancing, and fintech infrastructure supports tourism and remittance flows. The sector represents opportunity for climate-resilient digital infrastructure and Caribbean digital services participation.$$,
      62, 68, 1, 'explorer'),
    ('GRD', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Grenada's visitor economy is supported by boutique tourism positioning, cruise port infrastructure, eco-tourism assets, and Caribbean diaspora engagement.$$,
      $$Grenada combines boutique resort and hotel infrastructure, cruise port tourism in St. George's, eco-tourism and spice tourism assets, and UK and North American diaspora travel. Aviation connectivity serves regional and international routes, destination marketing emphasizes authentic Caribbean culture, and climate-resilient tourism development is advancing. The sector is strategic for sustainable tourism and small island destination development.$$,
      68, 70, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- SAINT LUCIA (LCA) — Digital Infrastructure + Tourism
    -- ────────────────────────────────────────────────────────────────────────
    ('LCA', 'digital_infrastructure', 'Digital Infrastructure',
      $$Saint Lucia's digital infrastructure is advancing through submarine cable connectivity, government digital platforms, mobile infrastructure, and tourism technology capacity.$$,
      $$Saint Lucia is developing digital infrastructure through submarine cable access, e-government service platforms, mobile telecommunications infrastructure, and digital capacity supporting tourism services. Digital identity initiatives are emerging, broadband expansion is advancing, and fintech infrastructure supports tourism payments and diaspora remittances. The sector represents opportunity for tourism technology infrastructure and Caribbean digital services integration.$$,
      64, 70, 1, 'explorer'),
    ('LCA', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Saint Lucia's visitor economy is anchored by luxury resort infrastructure, UK and North American air connectivity, natural heritage assets, and honeymoon tourism positioning.$$,
      $$Saint Lucia combines luxury resort infrastructure, strong aviation connectivity to UK and North America, UNESCO World Heritage natural sites including the Pitons, and honeymoon and romantic tourism market positioning. The visitor economy is a major foreign exchange contributor with high-end tourism services, cruise port infrastructure, and established destination branding. The sector is strategic for luxury tourism development and climate-resilient infrastructure.$$,
      80, 72, 7, 'explorer')

  ) AS v(iso3, sector_key, sector_label, teaser_md, rationale_md, strength_score, growth_score, display_order, min_plan_id)
)
INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
SELECT
  c.id,
  s.sector_key,
  s.sector_label,
  s.teaser_md,
  s.rationale_md,
  s.strength_score,
  s.growth_score,
  s.display_order,
  s.min_plan_id
FROM sector_seed s
JOIN public.souvera_countries c ON c.iso3 = s.iso3
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label,
  teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md,
  strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score,
  display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id,
  updated_at = now();

