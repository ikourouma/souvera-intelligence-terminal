-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL Pack v1.11b — DATA-SEED-01 Priority 20
-- Sector Data Seeding (20 Priority Countries)
-- Owner: Afronovation, Inc.
-- ===========================================
--
-- PURPOSE:
-- Seed sector intelligence for 20 priority markets:
--   AFRICA (15):
--     NGA, ZAF, KEN, EGY, GHA, CIV, ETH, MAR, TZA, UGA, RWA, SEN, CMR, (+ 2 from pilot)
--   CARIBBEAN (5):
--     JAM, TTO, BRB, DOM, BHS, GRD, LCA
--
-- Each country receives 5 strategic sectors:
--   1. Fintech and Digital Finance
--   2. Energy and Renewables
--   3. Agriculture and Agribusiness
--   4. Mining and Critical Minerals
--   5. Logistics and Trade
--
-- QUOTING STRATEGY:
-- All teaser_md and rationale_md values use dollar-quoting ($$...$$).
-- Dollar-quoted strings require NO escaping for apostrophes or backslashes.
--
-- IDEMPOTENCY:
-- Uses ON CONFLICT (country_id, sector_key) DO UPDATE.
-- Safe to rerun. Includes verified pilot countries (NGA, ZAF, KEN, JAM, TTO).
--
-- EXECUTION:
-- Run this SQL in Supabase SQL Editor after Phase 4A FDI ingestion is complete.
--
-- VERIFICATION:
-- After execution, run:
--   infra/supabase/verification/phase-4a-sector-priority-20-verification.sql
--
-- EXPECTED RESULT:
-- 100 sector rows (20 countries × 5 sectors)
--
-- ===========================================

-- NOTE: This file includes the 5 verified pilot countries (NGA, ZAF, KEN, JAM, TTO)
-- plus 15 additional priority markets for a total of 20 countries.

-- ═══════════════════════════════════════════════════════════════════════════
-- PILOT COUNTRIES (5) — Already verified, safe to upsert
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- NIGERIA (NGA) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
    'fintech', 'Fintech and Digital Finance',
    $$Africa's largest fintech ecosystem supported by high mobile penetration and a young, digitally engaged population.$$,
    $$Nigeria anchors Africa's fintech revolution with over 200 licensed fintech operators and a banking sector increasingly oriented toward digital channels. Mobile money adoption exceeds 40% of the adult population, and Lagos has emerged as a continental hub for payment innovation, digital lending, and embedded finance. Regulatory sandboxes and revised CBN guidelines continue to shape the sector's evolution. Investment interest remains strong despite macroeconomic headwinds, with local and international VCs active in seed and Series A rounds.$$,
    85, 88, 1, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
    'energy', 'Energy and Renewables',
    $$Positioned to expand energy access through gas-to-power and off-grid solar deployment across underserved regions.$$,
    $$Nigeria's power sector is undergoing gradual reform, with gas-fired generation capacity anchoring baseload supply and solar mini-grids addressing rural electrification gaps. The Petroleum Industry Act has clarified upstream and midstream frameworks, and the country's vast gas reserves remain underutilized for domestic power generation. Off-grid solar providers report steady deployment in northern and rural states, supported by World Bank and development finance institution capital. Policy implementation and grid stability remain critical success factors.$$,
    70, 75, 2, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
    'agriculture', 'Agriculture and Agribusiness',
    $$Strategic emphasis on cassava, rice, and poultry value chains supported by large domestic demand and regional export potential.$$,
    $$Agriculture accounts for a significant share of Nigeria's GDP and employment, with ongoing efforts to reduce reliance on food imports. Government initiatives focus on cassava processing, rice milling, and poultry production, while private-sector investment is concentrated in agro-processing and cold chain logistics. Northern states anchor grain production; southern states support root crops and aquaculture. Land tenure complexity and infrastructure gaps constrain productivity, but mechanization and input financing models are emerging.$$,
    72, 68, 3, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
    'mining', 'Mining and Critical Minerals',
    $$Emerging solid minerals sector with lithium, tin, and lead-zinc deposits under early-stage commercial development.$$,
    $$Nigeria's mining sector remains nascent relative to oil and gas, but renewed government focus and revised legislation aim to unlock solid minerals potential. Lithium deposits in Nasarawa and Cross River states are attracting exploration interest amid global battery supply chain diversification. Tin production in Plateau State and lead-zinc in Benue and Cross River have established export routes. Artisanal mining dominates extraction, and formalization efforts are ongoing. Infrastructure deficits and regulatory consistency challenges persist.$$,
    60, 72, 4, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
    'logistics', 'Logistics and Trade',
    $$West Africa's largest consumer market anchored by Lagos port infrastructure and ECOWAS trade corridor connectivity.$$,
    $$Nigeria serves as West Africa's primary logistics node, with Apapa and Tin Can ports handling the majority of regional containerized cargo. Ongoing port reforms and the Lekki Deep Sea Port project are expected to enhance capacity and reduce dwell times. Road freight networks connect Nigeria to Benin, Niger, and Cameroon, supporting intra-ECOWAS trade flows. E-commerce growth is driving last-mile logistics innovation, particularly in urban centers. Congestion, customs procedures, and road infrastructure quality remain operational constraints.$$,
    75, 70, 5, 'explorer'
  )
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- SOUTH AFRICA (ZAF) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
    'fintech', 'Fintech and Digital Finance',
    $$Africa's most developed financial market supported by sophisticated banking infrastructure and regulatory frameworks.$$,
    $$South Africa's fintech sector benefits from a mature banking system, high smartphone penetration, and a well-established regulatory environment. Johannesburg anchors fintech innovation across payments, insurtech, and wealth management, with the South African Reserve Bank's regulatory sandbox facilitating pilot deployments. Major banks have launched digital-first offerings, and venture capital interest in B2B fintech and embedded finance remains robust. Currency volatility and power constraints present operational headwinds, but the market's depth and sophistication continue to attract investment.$$,
    88, 72, 1, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
    'energy', 'Energy and Renewables',
    $$Strategic shift toward renewable energy driven by solar and wind deployment amid grid reliability challenges.$$,
    $$South Africa's energy transition is accelerating, driven by load-shedding pressures and revised Integrated Resource Plan targets. The Renewable Energy Independent Power Producer Procurement Programme (REIPPPP) has enabled utility-scale solar and wind projects in Northern and Eastern Cape provinces. Corporate PPAs and rooftop solar installations are expanding rapidly as businesses hedge against Eskom supply interruptions. Battery storage and green hydrogen initiatives are emerging. Policy certainty and transmission capacity remain critical enablers.$$,
    75, 82, 2, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
    'agriculture', 'Agriculture and Agribusiness',
    $$Diversified commercial agriculture sector anchored by wine, citrus, and maize exports to global markets.$$,
    $$South Africa's agriculture is characterized by commercial scale and export orientation, with strong presence in wine, citrus, stone fruit, and maize. The Western Cape supports horticulture and viticulture; Free State and North West anchor grain production. Cold chain infrastructure and phytosanitary protocols enable access to European and Asian markets. Water scarcity in key agricultural regions and land reform debates introduce medium-term uncertainty, but agritech adoption and precision farming investments are advancing.$$,
    80, 65, 3, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
    'mining', 'Mining and Critical Minerals',
    $$Global leader in platinum group metals and a significant producer of chrome, manganese, and vanadium.$$,
    $$South Africa's mining sector is one of the world's most established, with dominant positions in platinum group metals (PGMs), chrome, and manganese. The Bushveld Complex remains the primary source of global PGM supply, and Mpumalanga and Northern Cape provinces host significant chrome and iron ore operations. Regulatory stability, power supply reliability, and community relations remain sector challenges. Emerging focus on battery minerals and beneficiation seeks to position South Africa in downstream value chains.$$,
    92, 60, 4, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
    'logistics', 'Logistics and Trade',
    $$Southern Africa's logistics gateway supported by container terminals in Durban, Cape Town, and Port Elizabeth.$$,
    $$South Africa serves as Southern Africa's primary logistics hub, with Durban and Cape Town ports handling containerized cargo for the SADC region. Transnet's rail and port networks connect mining corridors to export terminals, and road freight routes extend into Botswana, Zimbabwe, and Mozambique. E-commerce growth and cold chain investments are driving logistics modernization, particularly in Gauteng. Port congestion, rail performance, and power supply interruptions present operational risks, but infrastructure remains the most developed on the continent.$$,
    85, 68, 5, 'explorer'
  )
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- KENYA (KEN) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
    'fintech', 'Fintech and Digital Finance',
    $$East Africa's fintech leader anchored by M-Pesa and a vibrant ecosystem of digital financial service providers.$$,
    $$Kenya's fintech sector is among Africa's most advanced, driven by M-Pesa's foundational mobile money infrastructure and a regulatory environment supportive of innovation. Nairobi hosts a dense cluster of fintech startups, with strong activity in digital lending, insurtech, and B2B payments. The Central Bank of Kenya's licensing frameworks and sandbox provisions have enabled rapid deployment of new models. Regional expansion into Tanzania, Uganda, and Rwanda is a strategic focus for Kenyan fintech operators. Regulatory adjustments on lending caps and consumer protection continue to shape sector dynamics.$$,
    90, 85, 1, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
    'energy', 'Energy and Renewables',
    $$Renewable energy leader with substantial geothermal capacity and expanding solar and wind installations.$$,
    $$Kenya derives the majority of its electricity from renewable sources, with geothermal power from the Rift Valley accounting for a significant share of baseload generation. Hydropower, wind (Lake Turkana Wind Power Project), and solar are integrated into the grid, positioning Kenya as East Africa's cleanest power producer. Off-grid solar providers serve rural populations, and mini-grid deployment is advancing in underserved counties. Power Purchase Agreements (PPAs) and regulatory consistency are critical to sustaining investor confidence. Transmission capacity and last-mile distribution remain infrastructure priorities.$$,
    88, 78, 2, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
    'agriculture', 'Agriculture and Agribusiness',
    $$Diversified agriculture sector anchored by tea, coffee, and horticulture exports to European markets.$$,
    $$Agriculture is central to Kenya's economy and employment, with tea and coffee serving as traditional export pillars. Horticultural exports including flowers, vegetables, and fruits benefit from air freight connectivity and phytosanitary compliance. The Rift Valley and Central regions anchor production, while irrigation schemes in arid and semi-arid counties are expanding cultivable land. Smallholder aggregation models, cold chain investments, and agritech platforms are improving market access and yield optimization. Climate variability and land fragmentation remain structural constraints.$$,
    82, 70, 3, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
    'mining', 'Mining and Critical Minerals',
    $$Emerging mining sector with titanium, niobium, and coal deposits under early commercial development.$$,
    $$Kenya's mining sector is at an early stage relative to its East African peers, with titanium sands in Kwale County representing the most advanced operation. Base Titanium's mineral sands project exports rutile, ilmenite, and zircon to global markets. Niobium and rare earth exploration in the Mrima Hill area is attracting strategic interest. Coal deposits in Kitui County remain under assessment. Regulatory frameworks are evolving, and the government seeks to balance resource extraction with environmental safeguards. Artisanal mining formalization and community benefit-sharing models are policy priorities.$$,
    55, 70, 4, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
    'logistics', 'Logistics and Trade',
    $$East Africa's logistics gateway supported by Mombasa port and the Standard Gauge Railway inland corridor.$$,
    $$Kenya serves as East Africa's primary trade gateway, with Mombasa port handling cargo for Uganda, Rwanda, Burundi, South Sudan, and eastern DRC. The Standard Gauge Railway (SGR) connects Mombasa to Nairobi, reducing transit times and freight costs for containerized goods. Jomo Kenyatta International Airport anchors air cargo exports, particularly for horticulture and pharmaceuticals. Nairobi's warehousing and distribution networks support regional trade flows. Border efficiency improvements and Northern Corridor infrastructure upgrades are ongoing. Port congestion and rail-to-road handoff coordination remain operational challenges.$$,
    85, 75, 5, 'explorer'
  )
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- JAMAICA (JAM) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'JAM'),
    'fintech', 'Fintech and Digital Finance',
    $$Caribbean fintech hub supported by a modern regulatory framework and strong ICT infrastructure in Kingston.$$,
    $$Jamaica's fintech sector is anchored by the Bank of Jamaica's supportive regulatory posture and Kingston's role as a regional digital services hub. Mobile money adoption is advancing, with licensed payment service providers expanding digital wallet and remittance solutions. The Jamaican dollar's digital currency pilot (JAM-DEX) positions the country at the forefront of Caribbean CBDC development. Remittance corridors from North America and the UK remain a strategic fintech focus, with blockchain-based solutions under exploration. Financial inclusion targets and cybersecurity frameworks are policy priorities.$$,
    72, 78, 1, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'JAM'),
    'energy', 'Energy and Renewables',
    $$Transitioning from oil dependence to LNG and renewables, with solar and wind projects advancing across the island.$$,
    $$Jamaica's energy sector is undergoing significant transformation, with the Jamaica Public Service Company (JPS) diversifying its generation mix toward LNG and renewable sources. Solar photovoltaic installations are expanding in commercial and utility-scale configurations, and wind projects in St. Elizabeth and Clarendon parishes are under development. The government's Integrated Resource Plan targets increased renewable penetration, and net billing frameworks support distributed generation. High electricity costs and grid modernization requirements remain sector challenges. Energy security and climate resilience are national priorities.$$,
    65, 75, 2, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'JAM'),
    'agriculture', 'Agriculture and Agribusiness',
    $$Export-oriented agriculture focused on coffee, cocoa, and spices, supported by agro-processing and tourism linkages.$$,
    $$Jamaica's agricultural sector is characterized by Blue Mountain coffee production, cocoa cultivation, and spice exports including allspice and ginger. Small and medium-scale farms dominate, with value addition through agro-processing gaining traction. Tourism linkages including farm-to-table supply chains for resorts and restaurants are expanding, particularly in rural parishes. The Ministry of Agriculture and Fisheries supports irrigation expansion and greenhouse adoption. Land tenure issues, hurricane exposure, and post-harvest losses constrain productivity. Organic certification and niche market positioning are emerging strategies.$$,
    68, 65, 3, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'JAM'),
    'mining', 'Mining and Critical Minerals',
    $$Bauxite and alumina production anchored by long-established operations and global supply chain integration.$$,
    $$Jamaica is a major global bauxite producer, with mining operations concentrated in St. Ann, St. Catherine, and Manchester parishes. Alumina refining capacity supports export to North American and European aluminum smelters. The sector has long anchored Jamaica's export revenues, though global aluminum price volatility and energy costs for refining introduce cyclical exposure. Rehabilitation of mined land and community benefit-sharing frameworks are regulatory and reputational priorities. Rare earth exploration remains at an early stage.$$,
    78, 55, 4, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'JAM'),
    'logistics', 'Logistics and Trade',
    $$Caribbean transshipment hub anchored by Kingston Freeport Terminal and strategic location on major shipping lanes.$$,
    $$Jamaica's logistics sector is driven by the Kingston Container Terminal (KCT), one of the Caribbean's largest transshipment hubs. The port benefits from deep-water access and connectivity to major shipping lines serving North America, Europe, and Latin America. Kingston Freeport Terminal's expansion has enhanced capacity and efficiency. Air freight through Norman Manley International Airport supports perishable exports. Jamaica's CARICOM membership and trade agreements with the EU and Canada facilitate regional and international commerce. Port congestion during peak periods and customs modernization are ongoing priorities.$$,
    75, 68, 5, 'explorer'
  )
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- TRINIDAD AND TOBAGO (TTO) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'TTO'),
    'fintech', 'Fintech and Digital Finance',
    $$Emerging fintech market supported by a growing digital payments infrastructure and regulatory reforms.$$,
    $$Trinidad and Tobago's fintech sector is developing gradually, with the Central Bank of Trinidad and Tobago introducing licensing frameworks for electronic money issuers and payment service providers. Mobile banking adoption is increasing, and remittance corridors from North America are attracting fintech interest. Port of Spain hosts a small but active fintech startup community, with focus areas including digital wallets, cross-border payments, and insurtech. The banking sector's digital transformation and cybersecurity standards are advancing. Financial inclusion and payment system modernization remain policy priorities.$$,
    65, 72, 1, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'TTO'),
    'energy', 'Energy and Renewables',
    $$Oil and gas legacy transitioning toward renewable integration, with solar and wind projects under assessment.$$,
    $$Trinidad and Tobago's economy has long been anchored by oil and gas production, with natural gas supporting domestic power generation and petrochemical exports. The energy sector is now exploring diversification pathways, with utility-scale solar and wind projects under feasibility assessment. Government policy signals support for renewable energy integration, and private sector interest in solar PV is advancing. Mature oil and gas fields face production decline, prompting strategic reviews of the energy mix. Energy efficiency and grid modernization are emerging priorities as the country evaluates its long-term energy security framework.$$,
    70, 68, 2, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'TTO'),
    'agriculture', 'Agriculture and Agribusiness',
    $$Diversified agriculture sector anchored by cocoa, citrus, and poultry production for domestic and regional markets.$$,
    $$Agriculture contributes modestly to Trinidad and Tobago's GDP but remains strategically important for food security and rural employment. Cocoa production has a historic legacy, with efforts underway to revitalize quality and certification standards. Citrus, poultry, and aquaculture support domestic demand, and niche exports target CARICOM markets. The government's food import reduction strategies emphasize greenhouse agriculture and irrigation expansion. Land availability, post-harvest infrastructure, and competitive pressures from imported goods remain sector constraints. Agritech adoption and value chain coordination are advancing.$$,
    62, 60, 3, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'TTO'),
    'mining', 'Mining and Critical Minerals',
    $$Oil and gas extraction remains dominant, with limited solid minerals activity outside industrial aggregates.$$,
    $$Trinidad and Tobago's mining sector is overwhelmingly dominated by hydrocarbons, with onshore and offshore oil and gas fields supporting the national economy. Natural gas production underpins LNG exports and the petrochemical industry. Solid minerals extraction is limited to quarrying and industrial aggregates for construction. The mature nature of oil and gas fields and declining production rates are prompting upstream efficiency improvements and enhanced recovery techniques. Exploration activity in deepwater blocks continues. Diversification away from hydrocarbon dependency is a medium-term policy focus.$$,
    75, 50, 4, 'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'TTO'),
    'logistics', 'Logistics and Trade',
    $$Caribbean trade hub supported by Point Lisas Industrial Estate and Piarco International Airport connectivity.$$,
    $$Trinidad and Tobago's logistics sector is anchored by the Point Lisas Industrial Estate, which serves as a petrochemical and manufacturing hub with dedicated port facilities. The Port of Spain harbor handles containerized cargo and serves as a distribution point for CARICOM trade. Piarco International Airport provides air freight capacity for pharmaceuticals, electronics, and perishables. Trinidad's proximity to South America positions it as a potential gateway for Venezuela and Guyana trade flows. Customs modernization, warehousing capacity, and freight forwarding services are advancing. Port congestion and road infrastructure quality remain operational considerations.$$,
    70, 65, 5, 'explorer'
  )
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ═══════════════════════════════════════════════════════════════════════════
-- EXPANSION COUNTRIES (15) — Africa (10) + Caribbean (5)
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- EGYPT (EGY) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'EGY'), 'fintech', 'Fintech and Digital Finance',
    $$North Africa's largest fintech market supported by high smartphone adoption and government digital transformation initiatives.$$,
    $$Egypt's fintech ecosystem is expanding rapidly, driven by regulatory reforms and a large underbanked population. The Central Bank of Egypt's licensing regime for digital payment providers and the government's financial inclusion agenda have enabled growth in mobile wallets, digital lending, and payment aggregation. Cairo anchors the majority of fintech startups, with strong activity in B2C payments and remittance services. Regulatory clarity on data protection and consumer safeguards continues to evolve. Currency depreciation and economic volatility present operational challenges.$$,
    78, 82, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'EGY'), 'energy', 'Energy and Renewables',
    $$Strategic renewable energy expansion focused on solar and wind projects in desert regions and the Suez Gulf.$$,
    $$Egypt is advancing large-scale renewable energy deployment, with solar farms in Benban (Aswan) and wind installations along the Red Sea and Gulf of Suez. The government's renewable energy targets and feed-in tariff frameworks have attracted international project developers. Natural gas remains the backbone of domestic power generation, with Egypt positioned as a regional LNG export hub. Grid infrastructure and energy subsidy reforms are ongoing. Transmission capacity and investment certainty remain critical to sustaining renewable momentum.$$,
    72, 78, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'EGY'), 'agriculture', 'Agriculture and Agribusiness',
    $$Nile Delta agriculture anchored by cotton, citrus, and vegetables, with irrigation modernization underway.$$,
    $$Agriculture is central to Egypt's economy, with the Nile Delta and Valley supporting intensive cultivation of cotton, wheat, rice, citrus, and vegetables. Land reclamation projects and irrigation system upgrades aim to expand arable land and improve water efficiency. Export-oriented horticulture benefits from proximity to European markets, though phytosanitary compliance and cold chain logistics require investment. Food security concerns and population growth drive government support for domestic production. Water scarcity from upstream Nile developments remains a strategic constraint.$$,
    70, 65, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'EGY'), 'mining', 'Mining and Critical Minerals',
    $$Phosphate, gold, and rare earth deposits supporting domestic industry and export revenues.$$,
    $$Egypt's mining sector includes phosphate extraction in the Red Sea region, gold production in the Eastern Desert, and emerging rare earth exploration. Phosphate supports domestic fertilizer production and exports. Gold mining is expanding with both state-owned and private operators active. Regulatory reforms aim to attract investment in underdeveloped mineral resources. Infrastructure in remote mining areas and licensing transparency are ongoing policy priorities. Artisanal mining formalization efforts continue.$$,
    65, 68, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'EGY'), 'logistics', 'Logistics and Trade',
    $$Suez Canal gateway positioning Egypt as a global maritime chokepoint and regional trade corridor.$$,
    $$Egypt's logistics sector is anchored by the Suez Canal, one of the world's most strategic maritime routes. Canal expansions and the development of the Suez Canal Economic Zone aim to enhance trade facilitation and attract manufacturing. Port infrastructure in Alexandria, Port Said, and Ain Sokhna supports containerized cargo and bulk shipments. Air freight through Cairo International Airport serves regional and intercontinental trade. Customs modernization and road freight connectivity to North Africa and the Middle East are advancing.$$,
    80, 72, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- GHANA (GHA) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'GHA'), 'fintech', 'Fintech and Digital Finance',
    $$Expanding mobile money ecosystem supported by regulatory innovation and strong mobile network penetration.$$,
    $$Ghana's fintech sector is characterized by robust mobile money adoption and a supportive regulatory environment. The Bank of Ghana's Payment Systems and Services Act and licensing frameworks for payment service providers have enabled digital wallet expansion, agent banking, and cross-border remittances. Accra hosts a growing fintech community, with activity concentrated in digital payments, credit scoring, and insurtech. Regional fintech hubs are expanding into Kumasi and other urban centers. Currency depreciation and macroeconomic volatility introduce operational risk, but digital financial services penetration continues to deepen.$$,
    75, 80, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'GHA'), 'energy', 'Energy and Renewables',
    $$Hydropower and gas-fired generation complemented by solar and thermal projects addressing supply reliability.$$,
    $$Ghana's power sector is anchored by the Akosombo and Bui hydroelectric dams, with gas-fired thermal plants providing baseload and peaking capacity. Solar deployment is advancing through utility-scale projects and commercial rooftop installations, supported by net metering frameworks. Power sector debt and tariff recovery challenges have constrained investment, but recent reforms aim to improve financial sustainability. The Volta River Authority and independent power producers drive generation expansion. Transmission infrastructure and energy access in northern regions remain priorities.$$,
    68, 72, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'GHA'), 'agriculture', 'Agriculture and Agribusiness',
    $$Cocoa, cashew, and oil palm value chains anchored by smallholder production and export orientation.$$,
    $$Ghana is one of the world's largest cocoa producers, with cocoa exports anchoring agricultural revenues. The COCOBOD regulatory framework oversees quality and farmer support, though aging tree stock and climate variability constrain yields. Cashew production in northern regions and oil palm cultivation in the south are expanding. Agro-processing investments in cocoa products, cashew kernels, and palm oil are gaining traction. Land tenure, mechanization, and input access remain structural challenges. Climate-smart agriculture and irrigation expansion are policy priorities.$$,
    78, 70, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'GHA'), 'mining', 'Mining and Critical Minerals',
    $$Gold, manganese, and bauxite extraction anchored by established mining operations and exploration activity.$$,
    $$Ghana is Africa's leading gold producer, with large-scale mines in Ashanti, Western, and Central regions. Gold exports constitute a significant share of foreign exchange earnings. Manganese mining in the Western region and bauxite deposits in the Atewa Range support domestic and export markets. Artisanal and small-scale mining is widespread, with ongoing formalization efforts. Regulatory stability, environmental management, and community relations remain sector priorities. Lithium exploration is emerging as a strategic focus.$$,
    85, 75, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'GHA'), 'logistics', 'Logistics and Trade',
    $$West African trade hub anchored by Tema port and Kotoka International Airport connectivity.$$,
    $$Ghana's logistics sector is driven by the Port of Tema, the largest container port in West Africa, handling cargo for landlocked neighbors including Burkina Faso, Mali, and Niger. Port expansion projects and the development of the Tema Oil Refinery Industrial Zone aim to enhance capacity and efficiency. Kotoka International Airport in Accra serves as a regional air cargo hub. Road and rail corridors connect Ghana to ECOWAS markets. Port congestion, customs clearance efficiency, and inland transport quality remain operational constraints.$$,
    78, 72, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- CÔTE D'IVOIRE (CIV) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'CIV'), 'fintech', 'Fintech and Digital Finance',
    $$Francophone West Africa's fintech gateway supported by mobile money growth and regional payment integration.$$,
    $$Côte d'Ivoire's fintech sector benefits from strong mobile money penetration and Abidjan's role as a regional financial hub. The BCEAO's regional payment infrastructure and Orange Money's market presence anchor digital financial services. Regulatory frameworks for electronic money issuers are advancing, and cross-border payment corridors within UEMOA are expanding. Investment interest in digital lending and insurtech is growing, though infrastructure gaps in rural areas constrain universal access.$$,
    70, 75, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'CIV'), 'energy', 'Energy and Renewables',
    $$Diversified energy mix with hydropower and gas generation, advancing solar deployment in northern regions.$$,
    $$Côte d'Ivoire's power sector combines hydropower from the Kossou and Buyo dams with gas-fired thermal plants providing baseload capacity. The country exports electricity to neighboring states through the West African Power Pool. Solar projects in northern regions are under development, supported by international development finance. Energy access rates are improving, though rural electrification remains a priority. Regulatory stability and tariff frameworks continue to attract investment.$$,
    68, 70, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'CIV'), 'agriculture', 'Agriculture and Agribusiness',
    $$World's largest cocoa producer anchored by smallholder farms and evolving sustainability certification standards.$$,
    $$Côte d'Ivoire dominates global cocoa supply, with exports underpinning the agricultural economy. Cashew, coffee, rubber, and palm oil constitute additional export crops. Agro-processing investments in cocoa grinding and cashew shelling are expanding. Sustainability certifications and child labor remediation programs are increasingly integrated into supply chains. Land tenure issues and aging farmer populations present structural challenges, while cooperatives and aggregation models seek to improve smallholder incomes.$$,
    85, 68, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'CIV'), 'mining', 'Mining and Critical Minerals',
    $$Gold and manganese production supported by established operations and expanding exploration activity.$$,
    $$Côte d'Ivoire's mining sector is anchored by gold extraction in the north and west, with several industrial-scale operations active. Manganese mining contributes to export revenues, and exploration for iron ore and bauxite is ongoing. Artisanal gold mining is widespread, with formalization efforts advancing. Regulatory reforms aim to attract investment while ensuring environmental compliance. Infrastructure development in mining regions and community benefit-sharing frameworks are policy priorities.$$,
    65, 72, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'CIV'), 'logistics', 'Logistics and Trade',
    $$West Africa's primary logistics hub anchored by Abidjan port serving landlocked Sahel economies.$$,
    $$The Port of Abidjan is one of West Africa's largest and most efficient, handling containerized cargo for Burkina Faso, Mali, and Niger. Port expansion projects and the Abidjan-Ouagadougou rail corridor support regional trade flows. Félix-Houphouët-Boigny International Airport provides air cargo capacity. Côte d'Ivoire's coastal location and infrastructure investments position it as a strategic gateway for ECOWAS and UEMOA markets. Customs modernization and road network quality improvements are ongoing.$$,
    80, 72, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- ETHIOPIA (ETH) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'ETH'), 'fintech', 'Fintech and Digital Finance',
    $$Expanding digital financial services anchored by mobile money licensing and Addis Ababa's tech startup community.$$,
    $$Ethiopia's fintech sector is emerging following telecom liberalization and mobile money licensing reforms. Safaricom's entry and M-Pesa deployment are expected to accelerate digital payments adoption. The National Bank of Ethiopia's regulatory frameworks for payment service providers and digital lending are evolving. Addis Ababa hosts a growing tech ecosystem, with activity in digital wallets, remittances, and agent banking. Infrastructure constraints and foreign exchange controls present operational challenges.$$,
    62, 80, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'ETH'), 'energy', 'Energy and Renewables',
    $$Africa's hydropower leader with the Grand Ethiopian Renaissance Dam and expanding wind and geothermal capacity.$$,
    $$Ethiopia derives nearly all electricity from renewable sources, with hydropower anchoring generation through the Gilgel Gibe cascade and the Grand Ethiopian Renaissance Dam. Wind farms in Tigray and Somali regions and geothermal projects in the Rift Valley are advancing. Ethiopia exports electricity to neighboring countries and aims to position itself as East Africa's power hub. Transmission infrastructure and project financing remain critical enablers, while regional water-sharing negotiations continue.$$,
    75, 85, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'ETH'), 'agriculture', 'Agriculture and Agribusiness',
    $$Coffee and flower exports supported by highland agriculture and diversification into horticulture and pulses.$$,
    $$Agriculture is Ethiopia's economic backbone, with coffee anchoring export revenues and smallholder farms dominating production. Floriculture exports to Europe have grown substantially, concentrated near Addis Ababa. Pulses, oilseeds, and sesame support regional export markets. Government irrigation schemes and agricultural extension programs aim to improve yields. Land tenure, climate variability, and logistics infrastructure constrain productivity, while value addition and agro-processing investments are expanding.$$,
    72, 70, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'ETH'), 'mining', 'Mining and Critical Minerals',
    $$Gold, tantalum, and potash deposits under development with strategic focus on mineral exploration.$$,
    $$Ethiopia's mining sector is at an early stage, with gold extraction in the west and south representing the most developed operations. Tantalum mining and potash deposits in the Danakil Depression are attracting exploration interest. Regulatory reforms and a revised mining proclamation aim to improve transparency and attract investment. Artisanal mining formalization and infrastructure in remote mining areas are policy priorities. Geopolitical factors and security challenges in some regions affect operational continuity.$$,
    58, 75, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'ETH'), 'logistics', 'Logistics and Trade',
    $$Landlocked logistics hub anchored by Addis Ababa-Djibouti rail corridor and Ethiopian Airlines cargo network.$$,
    $$Ethiopia's logistics depend on the Ethiopia-Djibouti rail corridor, connecting Addis Ababa to the Port of Djibouti for containerized imports and exports. Ethiopian Airlines' air cargo network is among Africa's most extensive, supporting perishable exports including flowers and coffee. Industrial parks near Addis Ababa integrate manufacturing with logistics. Road freight networks connect to Kenya, Sudan, and Somalia. Border efficiency and customs modernization are advancing, though transit time variability remains a challenge.$$,
    70, 75, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- MOROCCO (MAR) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'MAR'), 'fintech', 'Fintech and Digital Finance',
    $$North Africa's fintech innovator supported by Bank Al-Maghrib's regulatory sandbox and Casablanca's financial infrastructure.$$,
    $$Morocco's fintech ecosystem is anchored by Casablanca Finance City and supportive regulatory frameworks including Bank Al-Maghrib's fintech sandbox. Digital payment adoption is advancing, with mobile wallets and e-commerce payment gateways expanding. Remittance corridors from Europe are a strategic focus, and insurtech and regtech startups are emerging. The banking sector's digital transformation and cybersecurity standards are well-established. Capital controls and currency convertibility constraints remain considerations for cross-border fintech models.$$,
    75, 72, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'MAR'), 'energy', 'Energy and Renewables',
    $$Regional renewable energy leader with large-scale solar and wind projects anchored by Noor solar complex.$$,
    $$Morocco has advanced one of Africa's most ambitious renewable energy programs, with the Noor Ouarzazate solar complex and wind farms along the Atlantic coast providing substantial capacity. The government's renewable energy targets and competitive procurement frameworks have attracted international project developers. Energy imports remain significant, though domestic renewable generation is reducing dependency. Grid integration and energy storage investments are advancing. Morocco's energy strategy positions it as a potential green hydrogen exporter to Europe.$$,
    80, 78, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'MAR'), 'agriculture', 'Agriculture and Agribusiness',
    $$Citrus, tomatoes, and olives anchor export-oriented agriculture supported by irrigation and Plan Maroc Vert initiatives.$$,
    $$Morocco's agricultural sector benefits from proximity to European markets and established supply chains for citrus, tomatoes, berries, and olives. Plan Maroc Vert has driven irrigation expansion, greenhouse adoption, and value chain development. Horticulture exports to the EU are facilitated by phytosanitary compliance and logistics infrastructure. Water scarcity in key agricultural regions and climate variability remain structural constraints. Agritech adoption and organic certification are advancing, targeting premium market segments.$$,
    78, 68, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'MAR'), 'mining', 'Mining and Critical Minerals',
    $$Global phosphate leader with OCP Group anchoring production and downstream fertilizer value chains.$$,
    $$Morocco holds the world's largest phosphate reserves, with OCP Group dominating extraction and fertilizer production. Phosphate exports and derivatives underpin a significant share of export revenues. Silver, lead, zinc, and copper mining are also active. The government's strategy emphasizes beneficiation and downstream processing to capture value. Infrastructure in mining regions is well-developed, and environmental management standards are advancing. Morocco's phosphate sector is globally strategic for agricultural supply chains.$$,
    90, 65, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'MAR'), 'logistics', 'Logistics and Trade',
    $$Africa-Europe gateway anchored by Tanger Med port and strategic positioning on Mediterranean trade routes.$$,
    $$Morocco's logistics sector is anchored by Tanger Med, one of Africa's largest container ports and a key transshipment hub for Europe-Africa trade. Casablanca and Agadir ports support domestic and regional cargo flows. Rail and road networks connect to Algeria and the Sahel, though cross-border trade with Algeria remains constrained. Mohammed V International Airport handles air freight for perishable exports. Customs efficiency and free trade agreements with the EU and U.S. enhance Morocco's trade facilitation framework.$$,
    85, 70, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- TANZANIA (TZA) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'TZA'), 'fintech', 'Fintech and Digital Finance',
    $$Expanding mobile money ecosystem anchored by Vodacom M-Pesa and evolving regulatory frameworks.$$,
    $$Tanzania's fintech sector is driven by high mobile money penetration, with M-Pesa and Tigo Pesa serving as primary digital payment platforms. The Bank of Tanzania's regulatory frameworks for payment service providers are evolving, and agent banking models are expanding financial inclusion in rural areas. Dar es Salaam hosts a growing fintech community, with activity in digital lending, remittances, and insurtech. Regulatory adjustments and macroeconomic volatility present operational considerations.$$,
    68, 75, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'TZA'), 'energy', 'Energy and Renewables',
    $$Natural gas and hydropower complemented by expanding solar and wind capacity in coastal and highland regions.$$,
    $$Tanzania's energy sector combines natural gas-fired generation with hydropower from the Rufiji basin. Solar and wind projects are advancing, supported by the government's renewable energy targets. Rural electrification programs aim to improve access in underserved regions. The Julius Nyerere Hydropower Project is expected to significantly expand baseload capacity. Gas-to-power frameworks and power purchase agreements are attracting independent power producers. Transmission infrastructure and tariff affordability remain policy priorities.$$,
    65, 78, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'TZA'), 'agriculture', 'Agriculture and Agribusiness',
    $$Coffee, cashew, and tobacco exports supported by smallholder production and emerging agro-processing investments.$$,
    $$Agriculture is central to Tanzania's economy, with coffee, cashews, tobacco, and cotton anchoring export revenues. Maize, cassava, and rice support domestic food security. Smallholder farms dominate, with cooperatives and aggregation models improving market access. Agro-processing investments in cashew kernels, coffee roasting, and edible oils are expanding. Irrigation infrastructure and input access remain structural constraints. Southern Highlands and coastal regions anchor key agricultural zones.$$,
    70, 70, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'TZA'), 'mining', 'Mining and Critical Minerals',
    $$Gold, diamonds, and rare earth deposits anchored by industrial-scale operations and exploration activity.$$,
    $$Tanzania is one of Africa's leading gold producers, with large-scale mines in the Lake Victoria goldfields and central regions. Diamond mining at Williamson contributes to exports, and rare earth exploration in southern regions is attracting strategic interest. Graphite and tanzanite extraction also contribute to mineral revenues. Regulatory frameworks have evolved, with local content requirements and beneficiation policies introduced. Artisanal mining formalization and community benefit-sharing frameworks are policy priorities.$$,
    75, 75, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'TZA'), 'logistics', 'Logistics and Trade',
    $$East Africa's trade corridor anchored by Dar es Salaam port serving landlocked neighbors and Central Corridor rail.$$,
    $$Tanzania's logistics sector is driven by the Port of Dar es Salaam, handling cargo for Uganda, Rwanda, Burundi, DRC, and Zambia. The Central Corridor rail line and Standard Gauge Railway projects aim to reduce transit times and freight costs. Julius Nyerere International Airport supports air cargo for perishable exports. Road networks connect to the Northern and Southern Corridor trade routes. Port congestion and customs clearance efficiency are ongoing operational challenges, though reforms are advancing.$$,
    72, 75, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- UGANDA (UGA) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'UGA'), 'fintech', 'Fintech and Digital Finance',
    $$Maturing mobile money market anchored by MTN Mobile Money and regulatory support for digital financial inclusion.$$,
    $$Uganda's fintech sector is characterized by deep mobile money penetration, with MTN Mobile Money and Airtel Money dominating. The Bank of Uganda's supportive regulatory posture and agent banking frameworks have enabled digital financial services expansion. Kampala hosts a growing fintech community, with activity in digital lending, payment aggregation, and insurtech. Regional remittance corridors and cross-border payment integration within the East African Community are strategic priorities. Currency volatility and infrastructure constraints in rural areas remain operational considerations.$$,
    70, 72, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'UGA'), 'energy', 'Energy and Renewables',
    $$Hydropower-dominated generation with emerging oil sector and expanding solar deployment in off-grid regions.$$,
    $$Uganda's electricity generation is anchored by hydropower, with the Karuma and Isimba dams providing baseload capacity. Oil discoveries in the Albertine Graben are expected to transform the energy landscape, with production and refining infrastructure under development. Solar mini-grids and off-grid solutions are expanding rural electrification. The government's renewable energy targets and feed-in tariffs support independent power producers. Transmission infrastructure and energy access in northern regions remain priorities.$$,
    68, 80, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'UGA'), 'agriculture', 'Agriculture and Agribusiness',
    $$Coffee, tea, and fish exports supported by smallholder production and agro-processing value chain development.$$,
    $$Agriculture employs the majority of Uganda's workforce, with coffee and tea anchoring export revenues. Fish from Lake Victoria supports regional trade, and horticulture exports including flowers and vegetables target European markets. Smallholder farms dominate, with cooperatives and aggregation models improving market access. Agro-processing investments in coffee milling, tea blending, and fish filleting are expanding. Land fragmentation, post-harvest losses, and climate variability constrain productivity, while irrigation and mechanization adoption are advancing.$$,
    72, 68, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'UGA'), 'mining', 'Mining and Critical Minerals',
    $$Emerging oil and gas sector complemented by gold, copper, and rare earth exploration.$$,
    $$Uganda's mining sector is transitioning with oil production in the Albertine Graben expected to commence. Gold mining in Karamoja and southwestern regions is expanding, and copper exploration is active. Rare earth and phosphate deposits are under assessment. Artisanal mining is widespread, with formalization efforts ongoing. The Oil and Gas Act provides a regulatory framework for upstream development. Infrastructure in mining and oil regions and local content requirements are policy priorities.$$,
    60, 82, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'UGA'), 'logistics', 'Logistics and Trade',
    $$Landlocked trade hub connected by Northern Corridor rail and road networks to Mombasa and regional markets.$$,
    $$Uganda's logistics depend on the Northern Corridor linking Kampala to the Port of Mombasa via Kenya. Road freight dominates, with rail upgrades under the Standard Gauge Railway project expected to reduce transit times. Entebbe International Airport handles air cargo for perishable exports. Uganda serves as a transit corridor for South Sudan, eastern DRC, and Rwanda. Customs modernization and border efficiency improvements are advancing. Port charges at Mombasa and transit time variability remain operational constraints.$$,
    68, 72, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- RWANDA (RWA) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'RWA'), 'fintech', 'Fintech and Digital Finance',
    $$East Africa's fintech innovator supported by Kigali's startup ecosystem and supportive regulatory environment.$$,
    $$Rwanda's fintech sector is anchored by Kigali's innovation hubs and the National Bank of Rwanda's progressive regulatory frameworks. Mobile money adoption is high, and digital payment platforms are well-integrated with government services. Fintech startups are active in digital lending, payment aggregation, and insurtech. Regional expansion into East Africa is a strategic focus for Rwandan fintech operators. The government's digital transformation agenda and 4G network coverage support sector growth. Regulatory clarity and cybersecurity standards are well-established.$$,
    75, 80, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'RWA'), 'energy', 'Energy and Renewables',
    $$Renewable energy expansion focused on hydro, solar, and methane gas from Lake Kivu.$$,
    $$Rwanda's energy sector emphasizes renewable sources, with hydropower, solar, and methane gas extraction from Lake Kivu providing generation capacity. Mini-grids and off-grid solar systems support rural electrification. The government's ambitious energy access targets and feed-in tariffs have attracted independent power producers. Peat-to-power and biomass projects are under assessment. Transmission infrastructure and cross-border power trade within the East African Power Pool are advancing. Energy security and grid stability remain policy priorities.$$,
    65, 78, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'RWA'), 'agriculture', 'Agriculture and Agribusiness',
    $$Coffee and tea exports supported by cooperative models and value addition through agro-processing investments.$$,
    $$Agriculture is central to Rwanda's economy, with coffee and tea anchoring export revenues. Smallholder farms dominate, organized into cooperatives that improve market access and quality standards. Horticulture including fruits and vegetables is expanding, targeting regional markets. Agro-processing investments in coffee washing stations, tea factories, and fruit pulping are advancing. Terracing, irrigation, and land consolidation programs aim to improve productivity on limited arable land. Climate resilience and post-harvest loss reduction are policy priorities.$$,
    70, 72, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'RWA'), 'mining', 'Mining and Critical Minerals',
    $$Tin, tantalum, and tungsten production anchored by conflict-free certification and traceability systems.$$,
    $$Rwanda's mining sector focuses on tin, tantalum, tungsten (the "3Ts"), and gold. The government's conflict-free mineral certification and traceability systems have positioned Rwandan minerals as responsibly sourced in global supply chains. Artisanal mining is formalized through cooperatives and licensing. Rare earth and lithium exploration is at an early stage. Infrastructure in mining regions and processing capacity are advancing. Rwanda's mining regulatory framework emphasizes transparency and environmental management.$$,
    68, 70, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'RWA'), 'logistics', 'Logistics and Trade',
    $$Landlocked logistics hub connected by Northern Corridor road networks and Kigali's air cargo capacity.$$,
    $$Rwanda's logistics sector depends on road freight via the Northern Corridor connecting Kigali to the Port of Mombasa. Transit times have improved through regional corridor initiatives and single customs territory frameworks. Kigali International Airport serves as a growing air cargo hub, particularly for high-value exports and perishables. Rwanda's membership in the East African Community and trade facilitation reforms support regional integration. Transit time variability and port congestion at Mombasa remain operational constraints.$$,
    65, 75, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- SENEGAL (SEN) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'SEN'), 'fintech', 'Fintech and Digital Finance',
    $$Francophone fintech hub anchored by Orange Money and Dakar's innovation ecosystem.$$,
    $$Senegal's fintech sector benefits from strong mobile money penetration, with Orange Money and Wave dominating digital payments. The BCEAO's regional regulatory frameworks and Dakar's tech hubs support fintech innovation. Digital remittances from Europe are a strategic focus, and insurtech and digital lending platforms are emerging. The government's digital transformation strategy and broadband expansion support sector growth. Cross-border payment integration within the UEMOA zone is advancing.$$,
    72, 75, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'SEN'), 'energy', 'Energy and Renewables',
    $$Gas-fired generation and expanding solar capacity supported by recent offshore gas discoveries.$$,
    $$Senegal's energy sector is transitioning with offshore gas discoveries in the Sangomar and Greater Tortue Ahmeyim fields expected to anchor domestic generation and export revenues. Solar projects in the interior regions are expanding, supported by independent power producers. Dakar's energy mix includes imported heavy fuel oil and domestic gas. Rural electrification programs and mini-grid deployment are advancing. The government's energy access targets and regulatory frameworks attract investment, though project financing and transmission capacity remain critical enablers.$$,
    65, 80, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'SEN'), 'agriculture', 'Agriculture and Agribusiness',
    $$Groundnuts, horticulture, and fish exports supported by irrigation expansion and agro-processing investments.$$,
    $$Agriculture anchors Senegal's rural economy, with groundnuts historically the primary cash crop. Horticulture including onions, tomatoes, and mangoes targets regional and European markets. Fisheries support both domestic consumption and exports, with Dakar serving as a processing hub. Irrigation schemes in the Senegal River Valley are expanding cultivable land. Agro-processing investments in groundnut oil, fish canning, and fruit pulping are advancing. Water management, land tenure, and climate variability remain structural constraints.$$,
    68, 68, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'SEN'), 'mining', 'Mining and Critical Minerals',
    $$Gold, phosphate, and zircon production anchored by industrial operations and emerging gas sector.$$,
    $$Senegal's mining sector includes gold extraction in the southeast, phosphate mining, and zircon sands. Offshore gas discoveries are expected to transform the extractives landscape, with upstream development underway. Gold exploration is expanding, and rare earth deposits are under assessment. Artisanal mining is widespread, with formalization efforts ongoing. The Mining Code provides a regulatory framework, and local content requirements aim to capture domestic value. Infrastructure in mining regions and environmental management are policy priorities.$$,
    62, 78, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'SEN'), 'logistics', 'Logistics and Trade',
    $$West Africa's maritime gateway anchored by Port of Dakar serving Sahel landlocked economies.$$,
    $$Senegal's logistics sector is driven by the Port of Dakar, a strategic hub for transshipment and landlocked Sahel trade. Port expansion and the Dakar Integrated Special Economic Zone aim to enhance capacity and efficiency. Blaise Diagne International Airport provides air cargo capacity for perishables and high-value goods. Road and rail networks connect Senegal to Mali and Mauritania, though infrastructure quality varies. Customs modernization and ECOWAS trade facilitation frameworks support regional integration.$$,
    70, 72, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- CAMEROON (CMR) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'CMR'), 'fintech', 'Fintech and Digital Finance',
    $$Bilingual fintech market anchored by Orange Money and evolving regulatory frameworks in Douala and Yaoundé.$$,
    $$Cameroon's fintech sector benefits from mobile money penetration, with Orange Money and MTN Mobile Money serving as primary platforms. The BEAC's regional regulatory frameworks for electronic money and the government's digital transformation strategy support sector development. Douala and Yaoundé host fintech startups focused on digital payments, remittances, and agent banking. Cross-border payment integration within the CEMAC zone is advancing. Infrastructure gaps in rural areas and regulatory consistency remain operational considerations.$$,
    65, 72, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'CMR'), 'energy', 'Energy and Renewables',
    $$Hydropower and gas-fired generation with expanding solar capacity and regional power export potential.$$,
    $$Cameroon's energy sector combines hydropower from dams on the Sanaga River with gas-fired thermal plants. The country exports electricity to Chad and Central African Republic through the Central African Power Pool. Solar projects in northern regions are under development, supported by international development finance. Rural electrification rates are improving, though access gaps persist. Regulatory stability and transmission infrastructure upgrades are attracting investment. Gas monetization and energy sector reforms are policy priorities.$$,
    68, 70, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'CMR'), 'agriculture', 'Agriculture and Agribusiness',
    $$Cocoa, coffee, and banana exports supported by diverse agro-ecological zones and smallholder production.$$,
    $$Agriculture is central to Cameroon's economy, with cocoa, coffee, bananas, and cotton anchoring export revenues. Diverse agro-ecological zones support production from coastal plantations to northern savanna crops. Smallholder farms dominate, with cooperatives and aggregation models improving market access. Agro-processing investments in cocoa grinding, coffee roasting, and palm oil refining are expanding. Land tenure issues, infrastructure gaps, and post-harvest losses constrain productivity. Irrigation and mechanization adoption are advancing.$$,
    70, 65, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'CMR'), 'mining', 'Mining and Critical Minerals',
    $$Bauxite, iron ore, and cobalt deposits under development with strategic focus on mineral diversification.$$,
    $$Cameroon's mining sector is anchored by artisanal gold extraction and industrial-scale bauxite projects under development. Iron ore deposits in the east and cobalt exploration are attracting investment. Alumina refining supports export revenues. The Mining Code provides a regulatory framework, and infrastructure development in mining regions is a policy priority. Artisanal mining formalization and environmental management standards are advancing. Security challenges in some regions affect operational continuity.$$,
    60, 68, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'CMR'), 'logistics', 'Logistics and Trade',
    $$Central Africa's logistics gateway anchored by Douala port serving Chad and Central African Republic.$$,
    $$Cameroon's logistics sector is driven by the Port of Douala, serving landlocked Chad and Central African Republic. Port congestion and customs clearance delays remain operational challenges, though reforms are advancing. Yaoundé-Douala rail and road corridors support domestic freight. Douala International Airport provides air cargo capacity for perishable exports including bananas and flowers. Cameroon's bilingual context and regional trade agreements facilitate CEMAC and ECCAS integration. Infrastructure quality and border efficiency improvements are ongoing.$$,
    68, 65, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- BARBADOS (BRB) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'BRB'), 'fintech', 'Fintech and Digital Finance',
    $$Caribbean fintech hub supported by regulatory frameworks and Bridgetown's international business services sector.$$,
    $$Barbados' fintech sector benefits from a mature financial services infrastructure and the Central Bank of Barbados' supportive regulatory posture. Digital payment platforms and remittance corridors from North America and the UK are well-established. Bridgetown's international business and financial services sector supports fintech innovation in payments, regtech, and digital banking. Cybersecurity standards and anti-money laundering frameworks are robust. The government's digital transformation strategy and broadband connectivity support sector growth.$$,
    70, 70, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'BRB'), 'energy', 'Energy and Renewables',
    $$Transitioning from oil dependence to solar and wind with renewable energy targets and grid modernization.$$,
    $$Barbados is advancing renewable energy deployment, with rooftop solar installations and utility-scale projects expanding. The government's renewable energy targets aim to reduce oil import dependency and achieve energy self-sufficiency. Net metering frameworks support distributed generation, and battery storage integration is advancing. High electricity costs and aging grid infrastructure are being addressed through modernization programs. Barbados Light and Power's generation mix is diversifying, and energy efficiency initiatives are promoted.$$,
    62, 75, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'BRB'), 'agriculture', 'Agriculture and Agribusiness',
    $$Sugar cane legacy transitioning to diversified agriculture including vegetables, roots, and niche exports.$$,
    $$Agriculture in Barbados has historically centered on sugar cane, though the sector is diversifying into vegetables, root crops, and niche products. Tourism linkages including farm-to-table supply chains for hotels and restaurants are expanding. Land availability constraints and high production costs limit scale, though organic farming and greenhouse adoption are advancing. Food import dependency remains high, and government programs support local production. Agro-processing and value addition are policy priorities.$$,
    55, 60, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'BRB'), 'mining', 'Mining and Critical Minerals',
    $$Limited extractives sector focused on limestone quarrying and industrial aggregates for construction.$$,
    $$Barbados has minimal mining activity, with limestone quarrying and aggregate extraction supporting the domestic construction sector. Offshore oil and gas exploration has been assessed historically, though no commercial production exists. The country's economic focus is on services, tourism, and international business rather than extractives. Environmental management of quarrying operations and coastal preservation are regulatory priorities.$$,
    40, 45, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'BRB'), 'logistics', 'Logistics and Trade',
    $$Caribbean logistics node anchored by Bridgetown Port and Grantley Adams International Airport connectivity.$$,
    $$Barbados' logistics sector is driven by Bridgetown Port, handling containerized cargo and serving as a regional transshipment point. Grantley Adams International Airport provides air freight capacity for pharmaceuticals, electronics, and perishables. Barbados' CARICOM membership and trade agreements with the EU and Canada facilitate regional and international commerce. Port efficiency and customs modernization are advancing. The country's role as a financial services hub complements its logistics infrastructure.$$,
    65, 65, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- DOMINICAN REPUBLIC (DOM) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'DOM'), 'fintech', 'Fintech and Digital Finance',
    $$Caribbean's largest fintech market supported by digital banking adoption and Santo Domingo's tech ecosystem.$$,
    $$The Dominican Republic's fintech sector is expanding rapidly, driven by digital banking adoption and regulatory support from the Central Bank. Mobile payment platforms and digital wallets are gaining traction in urban centers, particularly Santo Domingo. Remittance corridors from the United States anchor digital financial services, with blockchain-based solutions under exploration. The banking sector's digital transformation and e-commerce growth support fintech expansion. Regulatory frameworks for electronic money and cybersecurity standards are advancing.$$,
    75, 78, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'DOM'), 'energy', 'Energy and Renewables',
    $$Diversified energy mix with gas, coal, and expanding solar and wind capacity targeting renewable integration.$$,
    $$The Dominican Republic's energy sector combines natural gas, coal, and hydropower with expanding renewable capacity. Solar and wind projects are advancing, supported by government renewable energy targets and auction frameworks. Energy imports from neighboring countries and domestic generation support the grid. Rural electrification rates are high, though transmission losses and energy costs remain concerns. Public-private partnerships and independent power producers are key to sector expansion.$$,
    70, 72, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'DOM'), 'agriculture', 'Agriculture and Agribusiness',
    $$Sugar cane, cocoa, and tropical fruits anchored by export-oriented production and agro-processing investments.$$,
    $$Agriculture contributes significantly to the Dominican Republic's economy, with sugar cane, cocoa, coffee, bananas, and tobacco anchoring export revenues. Organic cocoa and coffee target premium markets. Smallholder farms and commercial estates coexist, with cooperatives improving market access. Agro-processing investments in sugar refining, cocoa processing, and fruit pulping are expanding. Irrigation infrastructure and land tenure issues remain structural constraints. Tourism linkages and farm-to-table supply chains support domestic demand.$$,
    72, 68, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'DOM'), 'mining', 'Mining and Critical Minerals',
    $$Gold, silver, and nickel production anchored by established operations and exploration activity.$$,
    $$The Dominican Republic's mining sector includes gold and silver extraction in the central regions and nickel mining. Barrick Gold's Pueblo Viejo operation is one of the world's largest gold mines. Exploration for copper and base metals is ongoing. Regulatory frameworks balance resource extraction with environmental safeguards. Artisanal mining is limited, and industrial-scale operations dominate. Infrastructure in mining regions and community benefit-sharing frameworks are policy priorities.$$,
    75, 65, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'DOM'), 'logistics', 'Logistics and Trade',
    $$Caribbean's primary logistics hub anchored by multiple ports and Las Américas International Airport.$$,
    $$The Dominican Republic's logistics sector is anchored by ports in Santo Domingo, Haina, and Caucedo, handling containerized cargo and serving as a regional distribution center. Las Américas International Airport provides air freight capacity for perishables and high-value goods. Free trade zones support manufacturing and re-export. Road infrastructure connects production regions to ports. Customs modernization and trade agreements with the United States and EU enhance trade facilitation.$$,
    78, 72, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- BAHAMAS (BHS) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'BHS'), 'fintech', 'Fintech and Digital Finance',
    $$Offshore financial center transitioning to digital banking and CBDC innovation with the Sand Dollar.$$,
    $$The Bahamas' fintech sector is anchored by its offshore financial services infrastructure and the Central Bank of The Bahamas' Sand Dollar CBDC, one of the world's first national digital currencies. Digital banking and payment platforms are advancing, with focus on financial inclusion across the archipelago. Regulatory frameworks for digital assets and cybersecurity standards are well-established. Nassau's financial services sector supports fintech innovation in regtech and cross-border payments. Compliance with international AML standards remains a priority.$$,
    72, 72, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'BHS'), 'energy', 'Energy and Renewables',
    $$Oil-dependent energy system transitioning to solar with distributed generation and battery storage initiatives.$$,
    $$The Bahamas relies heavily on imported petroleum for electricity generation, with high energy costs prompting renewable energy deployment. Rooftop solar installations and utility-scale solar projects are expanding, particularly in Nassau and Freeport. Battery storage integration and microgrid solutions support energy resilience across the archipelago. The Bahamas Electricity Corporation's generation mix is diversifying, and energy efficiency programs are promoted. Hurricane exposure and grid interconnection challenges constrain infrastructure planning.$$,
    55, 70, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'BHS'), 'agriculture', 'Agriculture and Agribusiness',
    $$Limited agriculture focused on citrus, vegetables, and aquaculture supporting tourism and domestic consumption.$$,
    $$Agriculture in The Bahamas is constrained by limited arable land and high production costs. Citrus production in Abaco and aquaculture including conch and lobster support export revenues. Vegetable farming and greenhouse agriculture target the tourism sector and domestic consumption. Food import dependency is high, and government programs promote local production. Hurricane vulnerability and saltwater intrusion affect agricultural zones. Niche markets and organic certification are emerging strategies.$$,
    50, 55, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'BHS'), 'mining', 'Mining and Critical Minerals',
    $$Minimal extractives activity limited to aragonite mining and salt production.$$,
    $$The Bahamas has limited mining activity, with aragonite extraction supporting cement and pharmaceutical industries and salt production serving niche markets. Offshore oil exploration has been assessed historically, though environmental concerns and tourism priorities constrain development. The country's economic focus is on financial services, tourism, and real estate rather than extractives. Marine resource management and coastal preservation are regulatory priorities.$$,
    35, 40, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'BHS'), 'logistics', 'Logistics and Trade',
    $$Strategic transshipment hub anchored by Freeport Container Port and Nassau's proximity to U.S. markets.$$,
    $$The Bahamas' logistics sector is driven by the Freeport Container Port, one of the Caribbean's largest transshipment hubs. Nassau and Grand Bahama serve as distribution centers for regional trade. Lynden Pindling International Airport provides air freight capacity for perishables and high-value goods. The Bahamas' proximity to the United States and favorable tax regime support logistics and warehousing. Customs efficiency and maritime connectivity are well-established. Hurricane exposure and infrastructure resilience are operational considerations.$$,
    70, 65, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- GRENADA (GRD) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'GRD'), 'fintech', 'Fintech and Digital Finance',
    $$Emerging digital payments ecosystem supported by mobile banking adoption and regional integration frameworks.$$,
    $$Grenada's fintech sector is developing gradually, with digital banking and mobile payment platforms gaining traction. The Eastern Caribbean Central Bank's regulatory frameworks and regional payment integration initiatives support sector growth. Remittance corridors from North America and the UK are strategic priorities. St. George's financial services sector is small but advancing, with focus on digital wallets and e-commerce payments. Broadband expansion and cybersecurity standards are policy priorities.$$,
    55, 68, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'GRD'), 'energy', 'Energy and Renewables',
    $$Diesel-dependent energy system transitioning to geothermal, solar, and wind with renewable energy targets.$$,
    $$Grenada's energy sector is heavily reliant on imported diesel, with high electricity costs prompting renewable energy development. Geothermal exploration in the interior and solar and wind projects are advancing, supported by government renewable energy targets. Grenada Electricity Services' generation mix is diversifying, and net metering frameworks support distributed generation. Hurricane resilience and grid modernization are priorities. Energy efficiency programs and battery storage integration are under assessment.$$,
    50, 72, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'GRD'), 'agriculture', 'Agriculture and Agribusiness',
    $$Nutmeg and cocoa exports anchored by smallholder production and tourism linkages for farm-to-table supply.$$,
    $$Agriculture is central to Grenada's identity, with nutmeg historically anchoring export revenues following recovery from hurricane damage. Cocoa, bananas, and spices including cinnamon and cloves support niche markets. Smallholder farms dominate, with cooperatives improving market access and quality standards. Tourism linkages including farm-to-table supply chains for resorts and restaurants are expanding. Land fragmentation, post-harvest losses, and hurricane exposure remain structural constraints. Organic certification and agro-processing are policy priorities.$$,
    60, 62, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'GRD'), 'mining', 'Mining and Critical Minerals',
    $$Negligible mining activity limited to small-scale sand and aggregate extraction for construction.$$,
    $$Grenada has minimal mining activity, with small-scale sand and aggregate extraction supporting domestic construction. The country's economic focus is on agriculture, tourism, and services rather than extractives. Coastal preservation and environmental management of quarrying operations are regulatory priorities. No significant mineral or hydrocarbon resources have been identified for commercial development.$$,
    30, 35, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'GRD'), 'logistics', 'Logistics and Trade',
    $$Small island logistics supported by Port St. George and Maurice Bishop International Airport connectivity.$$,
    $$Grenada's logistics sector is anchored by Port St. George in St. George's, handling containerized cargo and serving the domestic market. Maurice Bishop International Airport provides air freight capacity for nutmeg, cocoa, and perishables. Grenada's CARICOM membership facilitates regional trade. Port capacity is limited, and customs efficiency improvements are ongoing. The country's tourism sector supports logistics infrastructure, particularly for imported goods and food supplies for hotels and resorts.$$,
    55, 60, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ───────────────────────────────────────────────────────────────────────────
-- SAINT LUCIA (LCA) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
VALUES
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'LCA'), 'fintech', 'Fintech and Digital Finance',
    $$Emerging fintech market supported by Eastern Caribbean Central Bank frameworks and Castries' digital services growth.$$,
    $$Saint Lucia's fintech sector is developing, with digital banking platforms and mobile money services expanding. The Eastern Caribbean Central Bank's regulatory frameworks and regional payment integration initiatives support sector growth. Remittance corridors from North America and the UK are strategic priorities. Castries hosts a small but growing fintech community focused on digital payments and e-commerce. Broadband infrastructure and cybersecurity standards are advancing. Financial inclusion and digital transformation are policy priorities.$$,
    58, 70, 1, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'LCA'), 'energy', 'Energy and Renewables',
    $$Diesel-dependent energy transitioning to geothermal and solar with renewable energy targets and grid upgrades.$$,
    $$Saint Lucia's energy sector relies heavily on imported diesel, with high electricity costs driving renewable energy deployment. Geothermal exploration in the Soufrière area and solar projects are advancing, supported by government renewable energy targets. Saint Lucia Electricity Services' generation mix is diversifying, and net metering frameworks support distributed generation. Hurricane resilience and grid modernization are priorities. Energy efficiency programs and battery storage integration are under assessment.$$,
    52, 73, 2, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'LCA'), 'agriculture', 'Agriculture and Agribusiness',
    $$Banana exports complemented by cocoa and root crops, with tourism linkages driving farm-to-table initiatives.$$,
    $$Agriculture in Saint Lucia is anchored by banana exports to the UK, though the sector has diversified into cocoa, root crops, and vegetables. Smallholder farms dominate, with cooperatives improving market access. Tourism linkages including farm-to-table supply chains for resorts and restaurants are expanding. Land availability constraints and post-harvest losses limit productivity. Organic farming and agro-processing investments in cocoa and hot sauces are advancing. Hurricane vulnerability remains a structural constraint.$$,
    58, 60, 3, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'LCA'), 'mining', 'Mining and Critical Minerals',
    $$Minimal mining activity limited to sand and aggregate quarrying for domestic construction needs.$$,
    $$Saint Lucia has negligible mining activity, with small-scale quarrying of sand and aggregates supporting the domestic construction sector. The country's economic focus is on tourism, agriculture, and services rather than extractives. Environmental management of quarrying operations and coastal preservation are regulatory priorities. No significant mineral or hydrocarbon resources have been identified for commercial development.$$,
    32, 38, 4, 'explorer'),
  ((SELECT id FROM public.souvera_countries WHERE iso3 = 'LCA'), 'logistics', 'Logistics and Trade',
    $$Small island logistics anchored by Castries Port and Hewanorra International Airport connectivity.$$,
    $$Saint Lucia's logistics sector is driven by Castries Port, handling containerized cargo and cruise ship traffic. Hewanorra International Airport in Vieux Fort provides air freight capacity for bananas and perishables. Saint Lucia's CARICOM membership facilitates regional trade. Port capacity is constrained, and customs modernization is ongoing. The tourism sector supports logistics infrastructure, particularly for imported goods and food supplies. Hurricane resilience and infrastructure upgrades are policy priorities.$$,
    57, 62, 5, 'explorer')
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label, teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md, strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score, display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id, updated_at = now();

-- ===========================================
-- END OF SQL PACK v1.11b — COMPLETE
-- ===========================================
-- Total sector rows: 100 (20 countries × 5 sectors)
--
-- Pilot countries (5): NGA, ZAF, KEN, JAM, TTO
-- Expansion Africa (10): EGY, GHA, CIV, ETH, MAR, TZA, UGA, RWA, SEN, CMR
-- Expansion Caribbean (5): BRB, DOM, BHS, GRD, LCA
--
-- Verification:
-- Run: infra/supabase/verification/phase-4a-sector-priority-20-verification.sql
--
-- Expected results:
-- - total_priority_sectors = 100
-- - countries_with_sector_data = 20
-- - each country has 5 sectors
-- - missing countries = 0
-- - duplicate sector keys = 0
-- - all min_plan_id = explorer
-- - all display_order values 1–5
-- - all teaser_md and rationale_md present
--
-- ===========================================
