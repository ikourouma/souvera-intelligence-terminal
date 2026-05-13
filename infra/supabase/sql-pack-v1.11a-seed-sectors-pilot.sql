-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL Pack v1.11a — DATA-SEED-01 Pilot
-- Sector Data Seeding (5 Priority Countries)
-- Owner: Afronovation, Inc.
-- Version: 1.11a-r2 (dollar-quoted strings)
-- ===========================================
--
-- PURPOSE:
-- Seed sector intelligence for 5 pilot countries:
--   - NGA (Nigeria)
--   - ZAF (South Africa)
--   - KEN (Kenya)
--   - JAM (Jamaica)
--   - TTO (Trinidad and Tobago)
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
-- Short identifier fields (sector_key, sector_label, min_plan_id) use single quotes.
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
--   infra/supabase/verification/phase-4a-sector-pilot-verification.sql
--
-- ===========================================

-- ───────────────────────────────────────────────────────────────────────────
-- NIGERIA (NGA) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id,
  sector_key,
  sector_label,
  teaser_md,
  rationale_md,
  strength_score,
  growth_score,
  display_order,
  min_plan_id
)
VALUES
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
    'fintech',
    'Fintech and Digital Finance',
    $$Africa's largest fintech ecosystem supported by high mobile penetration and a young, digitally engaged population.$$,
    $$Nigeria anchors Africa's fintech revolution with over 200 licensed fintech operators and a banking sector increasingly oriented toward digital channels. Mobile money adoption exceeds 40% of the adult population, and Lagos has emerged as a continental hub for payment innovation, digital lending, and embedded finance. Regulatory sandboxes and revised CBN guidelines continue to shape the sector's evolution. Investment interest remains strong despite macroeconomic headwinds, with local and international VCs active in seed and Series A rounds.$$,
    85,
    88,
    1,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
    'energy',
    'Energy and Renewables',
    $$Positioned to expand energy access through gas-to-power and off-grid solar deployment across underserved regions.$$,
    $$Nigeria's power sector is undergoing gradual reform, with gas-fired generation capacity anchoring baseload supply and solar mini-grids addressing rural electrification gaps. The Petroleum Industry Act has clarified upstream and midstream frameworks, and the country's vast gas reserves remain underutilized for domestic power generation. Off-grid solar providers report steady deployment in northern and rural states, supported by World Bank and development finance institution capital. Policy implementation and grid stability remain critical success factors.$$,
    70,
    75,
    2,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
    'agriculture',
    'Agriculture and Agribusiness',
    $$Strategic emphasis on cassava, rice, and poultry value chains supported by large domestic demand and regional export potential.$$,
    $$Agriculture accounts for a significant share of Nigeria's GDP and employment, with ongoing efforts to reduce reliance on food imports. Government initiatives focus on cassava processing, rice milling, and poultry production, while private-sector investment is concentrated in agro-processing and cold chain logistics. Northern states anchor grain production; southern states support root crops and aquaculture. Land tenure complexity and infrastructure gaps constrain productivity, but mechanization and input financing models are emerging.$$,
    72,
    68,
    3,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
    'mining',
    'Mining and Critical Minerals',
    $$Emerging solid minerals sector with lithium, tin, and lead-zinc deposits under early-stage commercial development.$$,
    $$Nigeria's mining sector remains nascent relative to oil and gas, but renewed government focus and revised legislation aim to unlock solid minerals potential. Lithium deposits in Nasarawa and Cross River states are attracting exploration interest amid global battery supply chain diversification. Tin production in Plateau State and lead-zinc in Benue and Cross River have established export routes. Artisanal mining dominates extraction, and formalization efforts are ongoing. Infrastructure deficits and regulatory consistency challenges persist.$$,
    60,
    72,
    4,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
    'logistics',
    'Logistics and Trade',
    $$West Africa's largest consumer market anchored by Lagos port infrastructure and ECOWAS trade corridor connectivity.$$,
    $$Nigeria serves as West Africa's primary logistics node, with Apapa and Tin Can ports handling the majority of regional containerized cargo. Ongoing port reforms and the Lekki Deep Sea Port project are expected to enhance capacity and reduce dwell times. Road freight networks connect Nigeria to Benin, Niger, and Cameroon, supporting intra-ECOWAS trade flows. E-commerce growth is driving last-mile logistics innovation, particularly in urban centers. Congestion, customs procedures, and road infrastructure quality remain operational constraints.$$,
    75,
    70,
    5,
    'explorer'
  )
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label   = EXCLUDED.sector_label,
  teaser_md      = EXCLUDED.teaser_md,
  rationale_md   = EXCLUDED.rationale_md,
  strength_score = EXCLUDED.strength_score,
  growth_score   = EXCLUDED.growth_score,
  display_order  = EXCLUDED.display_order,
  min_plan_id    = EXCLUDED.min_plan_id,
  updated_at     = now();

-- ───────────────────────────────────────────────────────────────────────────
-- SOUTH AFRICA (ZAF) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id,
  sector_key,
  sector_label,
  teaser_md,
  rationale_md,
  strength_score,
  growth_score,
  display_order,
  min_plan_id
)
VALUES
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
    'fintech',
    'Fintech and Digital Finance',
    $$Africa's most developed financial market supported by sophisticated banking infrastructure and regulatory frameworks.$$,
    $$South Africa's fintech sector benefits from a mature banking system, high smartphone penetration, and a well-established regulatory environment. Johannesburg anchors fintech innovation across payments, insurtech, and wealth management, with the South African Reserve Bank's regulatory sandbox facilitating pilot deployments. Major banks have launched digital-first offerings, and venture capital interest in B2B fintech and embedded finance remains robust. Currency volatility and power constraints present operational headwinds, but the market's depth and sophistication continue to attract investment.$$,
    88,
    72,
    1,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
    'energy',
    'Energy and Renewables',
    $$Strategic shift toward renewable energy driven by solar and wind deployment amid grid reliability challenges.$$,
    $$South Africa's energy transition is accelerating, driven by load-shedding pressures and revised Integrated Resource Plan targets. The Renewable Energy Independent Power Producer Procurement Programme (REIPPPP) has enabled utility-scale solar and wind projects in Northern and Eastern Cape provinces. Corporate PPAs and rooftop solar installations are expanding rapidly as businesses hedge against Eskom supply interruptions. Battery storage and green hydrogen initiatives are emerging. Policy certainty and transmission capacity remain critical enablers.$$,
    75,
    82,
    2,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
    'agriculture',
    'Agriculture and Agribusiness',
    $$Diversified commercial agriculture sector anchored by wine, citrus, and maize exports to global markets.$$,
    $$South Africa's agriculture is characterized by commercial scale and export orientation, with strong presence in wine, citrus, stone fruit, and maize. The Western Cape supports horticulture and viticulture; Free State and North West anchor grain production. Cold chain infrastructure and phytosanitary protocols enable access to European and Asian markets. Water scarcity in key agricultural regions and land reform debates introduce medium-term uncertainty, but agritech adoption and precision farming investments are advancing.$$,
    80,
    65,
    3,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
    'mining',
    'Mining and Critical Minerals',
    $$Global leader in platinum group metals and a significant producer of chrome, manganese, and vanadium.$$,
    $$South Africa's mining sector is one of the world's most established, with dominant positions in platinum group metals (PGMs), chrome, and manganese. The Bushveld Complex remains the primary source of global PGM supply, and Mpumalanga and Northern Cape provinces host significant chrome and iron ore operations. Regulatory stability, power supply reliability, and community relations remain sector challenges. Emerging focus on battery minerals and beneficiation seeks to position South Africa in downstream value chains.$$,
    92,
    60,
    4,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
    'logistics',
    'Logistics and Trade',
    $$Southern Africa's logistics gateway supported by container terminals in Durban, Cape Town, and Port Elizabeth.$$,
    $$South Africa serves as Southern Africa's primary logistics hub, with Durban and Cape Town ports handling containerized cargo for the SADC region. Transnet's rail and port networks connect mining corridors to export terminals, and road freight routes extend into Botswana, Zimbabwe, and Mozambique. E-commerce growth and cold chain investments are driving logistics modernization, particularly in Gauteng. Port congestion, rail performance, and power supply interruptions present operational risks, but infrastructure remains the most developed on the continent.$$,
    85,
    68,
    5,
    'explorer'
  )
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label   = EXCLUDED.sector_label,
  teaser_md      = EXCLUDED.teaser_md,
  rationale_md   = EXCLUDED.rationale_md,
  strength_score = EXCLUDED.strength_score,
  growth_score   = EXCLUDED.growth_score,
  display_order  = EXCLUDED.display_order,
  min_plan_id    = EXCLUDED.min_plan_id,
  updated_at     = now();

-- ───────────────────────────────────────────────────────────────────────────
-- KENYA (KEN) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id,
  sector_key,
  sector_label,
  teaser_md,
  rationale_md,
  strength_score,
  growth_score,
  display_order,
  min_plan_id
)
VALUES
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
    'fintech',
    'Fintech and Digital Finance',
    $$East Africa's fintech leader anchored by M-Pesa and a vibrant ecosystem of digital financial service providers.$$,
    $$Kenya's fintech sector is among Africa's most advanced, driven by M-Pesa's foundational mobile money infrastructure and a regulatory environment supportive of innovation. Nairobi hosts a dense cluster of fintech startups, with strong activity in digital lending, insurtech, and B2B payments. The Central Bank of Kenya's licensing frameworks and sandbox provisions have enabled rapid deployment of new models. Regional expansion into Tanzania, Uganda, and Rwanda is a strategic focus for Kenyan fintech operators. Regulatory adjustments on lending caps and consumer protection continue to shape sector dynamics.$$,
    90,
    85,
    1,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
    'energy',
    'Energy and Renewables',
    $$Renewable energy leader with substantial geothermal capacity and expanding solar and wind installations.$$,
    $$Kenya derives the majority of its electricity from renewable sources, with geothermal power from the Rift Valley accounting for a significant share of baseload generation. Hydropower, wind (Lake Turkana Wind Power Project), and solar are integrated into the grid, positioning Kenya as East Africa's cleanest power producer. Off-grid solar providers serve rural populations, and mini-grid deployment is advancing in underserved counties. Power Purchase Agreements (PPAs) and regulatory consistency are critical to sustaining investor confidence. Transmission capacity and last-mile distribution remain infrastructure priorities.$$,
    88,
    78,
    2,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
    'agriculture',
    'Agriculture and Agribusiness',
    $$Diversified agriculture sector anchored by tea, coffee, and horticulture exports to European markets.$$,
    $$Agriculture is central to Kenya's economy and employment, with tea and coffee serving as traditional export pillars. Horticultural exports including flowers, vegetables, and fruits benefit from air freight connectivity and phytosanitary compliance. The Rift Valley and Central regions anchor production, while irrigation schemes in arid and semi-arid counties are expanding cultivable land. Smallholder aggregation models, cold chain investments, and agritech platforms are improving market access and yield optimization. Climate variability and land fragmentation remain structural constraints.$$,
    82,
    70,
    3,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
    'mining',
    'Mining and Critical Minerals',
    $$Emerging mining sector with titanium, niobium, and coal deposits under early commercial development.$$,
    $$Kenya's mining sector is at an early stage relative to its East African peers, with titanium sands in Kwale County representing the most advanced operation. Base Titanium's mineral sands project exports rutile, ilmenite, and zircon to global markets. Niobium and rare earth exploration in the Mrima Hill area is attracting strategic interest. Coal deposits in Kitui County remain under assessment. Regulatory frameworks are evolving, and the government seeks to balance resource extraction with environmental safeguards. Artisanal mining formalization and community benefit-sharing models are policy priorities.$$,
    55,
    70,
    4,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
    'logistics',
    'Logistics and Trade',
    $$East Africa's logistics gateway supported by Mombasa port and the Standard Gauge Railway inland corridor.$$,
    $$Kenya serves as East Africa's primary trade gateway, with Mombasa port handling cargo for Uganda, Rwanda, Burundi, South Sudan, and eastern DRC. The Standard Gauge Railway (SGR) connects Mombasa to Nairobi, reducing transit times and freight costs for containerized goods. Jomo Kenyatta International Airport anchors air cargo exports, particularly for horticulture and pharmaceuticals. Nairobi's warehousing and distribution networks support regional trade flows. Border efficiency improvements and Northern Corridor infrastructure upgrades are ongoing. Port congestion and rail-to-road handoff coordination remain operational challenges.$$,
    85,
    75,
    5,
    'explorer'
  )
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label   = EXCLUDED.sector_label,
  teaser_md      = EXCLUDED.teaser_md,
  rationale_md   = EXCLUDED.rationale_md,
  strength_score = EXCLUDED.strength_score,
  growth_score   = EXCLUDED.growth_score,
  display_order  = EXCLUDED.display_order,
  min_plan_id    = EXCLUDED.min_plan_id,
  updated_at     = now();

-- ───────────────────────────────────────────────────────────────────────────
-- JAMAICA (JAM) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id,
  sector_key,
  sector_label,
  teaser_md,
  rationale_md,
  strength_score,
  growth_score,
  display_order,
  min_plan_id
)
VALUES
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'JAM'),
    'fintech',
    'Fintech and Digital Finance',
    $$Caribbean fintech hub supported by a modern regulatory framework and strong ICT infrastructure in Kingston.$$,
    $$Jamaica's fintech sector is anchored by the Bank of Jamaica's supportive regulatory posture and Kingston's role as a regional digital services hub. Mobile money adoption is advancing, with licensed payment service providers expanding digital wallet and remittance solutions. The Jamaican dollar's digital currency pilot (JAM-DEX) positions the country at the forefront of Caribbean CBDC development. Remittance corridors from North America and the UK remain a strategic fintech focus, with blockchain-based solutions under exploration. Financial inclusion targets and cybersecurity frameworks are policy priorities.$$,
    72,
    78,
    1,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'JAM'),
    'energy',
    'Energy and Renewables',
    $$Transitioning from oil dependence to LNG and renewables, with solar and wind projects advancing across the island.$$,
    $$Jamaica's energy sector is undergoing significant transformation, with the Jamaica Public Service Company (JPS) diversifying its generation mix toward LNG and renewable sources. Solar photovoltaic installations are expanding in commercial and utility-scale configurations, and wind projects in St. Elizabeth and Clarendon parishes are under development. The government's Integrated Resource Plan targets increased renewable penetration, and net billing frameworks support distributed generation. High electricity costs and grid modernization requirements remain sector challenges. Energy security and climate resilience are national priorities.$$,
    65,
    75,
    2,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'JAM'),
    'agriculture',
    'Agriculture and Agribusiness',
    $$Export-oriented agriculture focused on coffee, cocoa, and spices, supported by agro-processing and tourism linkages.$$,
    $$Jamaica's agricultural sector is characterized by Blue Mountain coffee production, cocoa cultivation, and spice exports including allspice and ginger. Small and medium-scale farms dominate, with value addition through agro-processing gaining traction. Tourism linkages including farm-to-table supply chains for resorts and restaurants are expanding, particularly in rural parishes. The Ministry of Agriculture and Fisheries supports irrigation expansion and greenhouse adoption. Land tenure issues, hurricane exposure, and post-harvest losses constrain productivity. Organic certification and niche market positioning are emerging strategies.$$,
    68,
    65,
    3,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'JAM'),
    'mining',
    'Mining and Critical Minerals',
    $$Bauxite and alumina production anchored by long-established operations and global supply chain integration.$$,
    $$Jamaica is a major global bauxite producer, with mining operations concentrated in St. Ann, St. Catherine, and Manchester parishes. Alumina refining capacity supports export to North American and European aluminum smelters. The sector has long anchored Jamaica's export revenues, though global aluminum price volatility and energy costs for refining introduce cyclical exposure. Rehabilitation of mined land and community benefit-sharing frameworks are regulatory and reputational priorities. Rare earth exploration remains at an early stage.$$,
    78,
    55,
    4,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'JAM'),
    'logistics',
    'Logistics and Trade',
    $$Caribbean transshipment hub anchored by Kingston Freeport Terminal and strategic location on major shipping lanes.$$,
    $$Jamaica's logistics sector is driven by the Kingston Container Terminal (KCT), one of the Caribbean's largest transshipment hubs. The port benefits from deep-water access and connectivity to major shipping lines serving North America, Europe, and Latin America. Kingston Freeport Terminal's expansion has enhanced capacity and efficiency. Air freight through Norman Manley International Airport supports perishable exports. Jamaica's CARICOM membership and trade agreements with the EU and Canada facilitate regional and international commerce. Port congestion during peak periods and customs modernization are ongoing priorities.$$,
    75,
    68,
    5,
    'explorer'
  )
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label   = EXCLUDED.sector_label,
  teaser_md      = EXCLUDED.teaser_md,
  rationale_md   = EXCLUDED.rationale_md,
  strength_score = EXCLUDED.strength_score,
  growth_score   = EXCLUDED.growth_score,
  display_order  = EXCLUDED.display_order,
  min_plan_id    = EXCLUDED.min_plan_id,
  updated_at     = now();

-- ───────────────────────────────────────────────────────────────────────────
-- TRINIDAD AND TOBAGO (TTO) — 5 Sectors
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.souvera_country_sectors (
  country_id,
  sector_key,
  sector_label,
  teaser_md,
  rationale_md,
  strength_score,
  growth_score,
  display_order,
  min_plan_id
)
VALUES
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'TTO'),
    'fintech',
    'Fintech and Digital Finance',
    $$Emerging fintech market supported by a growing digital payments infrastructure and regulatory reforms.$$,
    $$Trinidad and Tobago's fintech sector is developing gradually, with the Central Bank of Trinidad and Tobago introducing licensing frameworks for electronic money issuers and payment service providers. Mobile banking adoption is increasing, and remittance corridors from North America are attracting fintech interest. Port of Spain hosts a small but active fintech startup community, with focus areas including digital wallets, cross-border payments, and insurtech. The banking sector's digital transformation and cybersecurity standards are advancing. Financial inclusion and payment system modernization remain policy priorities.$$,
    65,
    72,
    1,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'TTO'),
    'energy',
    'Energy and Renewables',
    $$Oil and gas legacy transitioning toward renewable integration, with solar and wind projects under assessment.$$,
    $$Trinidad and Tobago's economy has long been anchored by oil and gas production, with natural gas supporting domestic power generation and petrochemical exports. The energy sector is now exploring diversification pathways, with utility-scale solar and wind projects under feasibility assessment. Government policy signals support for renewable energy integration, and private sector interest in solar PV is advancing. Mature oil and gas fields face production decline, prompting strategic reviews of the energy mix. Energy efficiency and grid modernization are emerging priorities as the country evaluates its long-term energy security framework.$$,
    70,
    68,
    2,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'TTO'),
    'agriculture',
    'Agriculture and Agribusiness',
    $$Diversified agriculture sector anchored by cocoa, citrus, and poultry production for domestic and regional markets.$$,
    $$Agriculture contributes modestly to Trinidad and Tobago's GDP but remains strategically important for food security and rural employment. Cocoa production has a historic legacy, with efforts underway to revitalize quality and certification standards. Citrus, poultry, and aquaculture support domestic demand, and niche exports target CARICOM markets. The government's food import reduction strategies emphasize greenhouse agriculture and irrigation expansion. Land availability, post-harvest infrastructure, and competitive pressures from imported goods remain sector constraints. Agritech adoption and value chain coordination are advancing.$$,
    62,
    60,
    3,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'TTO'),
    'mining',
    'Mining and Critical Minerals',
    $$Oil and gas extraction remains dominant, with limited solid minerals activity outside industrial aggregates.$$,
    $$Trinidad and Tobago's mining sector is overwhelmingly dominated by hydrocarbons, with onshore and offshore oil and gas fields supporting the national economy. Natural gas production underpins LNG exports and the petrochemical industry. Solid minerals extraction is limited to quarrying and industrial aggregates for construction. The mature nature of oil and gas fields and declining production rates are prompting upstream efficiency improvements and enhanced recovery techniques. Exploration activity in deepwater blocks continues. Diversification away from hydrocarbon dependency is a medium-term policy focus.$$,
    75,
    50,
    4,
    'explorer'
  ),
  (
    (SELECT id FROM public.souvera_countries WHERE iso3 = 'TTO'),
    'logistics',
    'Logistics and Trade',
    $$Caribbean trade hub supported by Point Lisas Industrial Estate and Piarco International Airport connectivity.$$,
    $$Trinidad and Tobago's logistics sector is anchored by the Point Lisas Industrial Estate, which serves as a petrochemical and manufacturing hub with dedicated port facilities. The Port of Spain harbor handles containerized cargo and serves as a distribution point for CARICOM trade. Piarco International Airport provides air freight capacity for pharmaceuticals, electronics, and perishables. Trinidad's proximity to South America positions it as a potential gateway for Venezuela and Guyana trade flows. Customs modernization, warehousing capacity, and freight forwarding services are advancing. Port congestion and road infrastructure quality remain operational considerations.$$,
    70,
    65,
    5,
    'explorer'
  )
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label   = EXCLUDED.sector_label,
  teaser_md      = EXCLUDED.teaser_md,
  rationale_md   = EXCLUDED.rationale_md,
  strength_score = EXCLUDED.strength_score,
  growth_score   = EXCLUDED.growth_score,
  display_order  = EXCLUDED.display_order,
  min_plan_id    = EXCLUDED.min_plan_id,
  updated_at     = now();

-- ===========================================
-- END OF SQL PACK v1.11a
-- ===========================================
-- Expected Result: 25 sector rows (5 countries x 5 sectors)
-- Verify using: infra/supabase/verification/phase-4a-sector-pilot-verification.sql
