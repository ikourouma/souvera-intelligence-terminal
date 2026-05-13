-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.13c: STAGE 2 SECTOR SEED — SOUTHERN AFRICA
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- 
-- CURATED PREVIEW DATA
-- Phase 4A Stage 2: All-74 Sector Coverage — Batch C
-- Southern Africa (8 countries × 7 sectors = 56 rows)
-- =========================================================

-- ===========================================
-- IMPORTANT NOTES
-- ===========================================
-- 
-- 1. This is Batch C of 4 regional batches for Stage 2.
-- 2. ESH / Western Sahara is excluded from all batches.
-- 3. Africa scope = 54 countries (excluding ESH).
-- 4. This batch covers 8 Southern African countries.
-- 5. Each country receives all 7 universal sectors.
-- 6. Content is country-specific and executive-grade.
-- 7. Safe to rerun (idempotent ON CONFLICT DO UPDATE).
-- 
-- ===========================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 7-SECTOR SEED DATA — SOUTHERN AFRICA (BATCH C)
-- ═══════════════════════════════════════════════════════════════════════════

WITH sector_seed AS (
  SELECT * FROM (VALUES
    -- ────────────────────────────────────────────────────────────────────────
    -- BOTSWANA (BWA) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('BWA', 'digital_infrastructure', 'Digital Infrastructure',
      $$Botswana's digital infrastructure is anchored by fiber backbone expansion, competitive telecommunications market, growing data center interest, and targeted e-government initiatives.$$,
      $$Botswana benefits from competitive telecommunications infrastructure, fiber backbone connectivity linking major urban centers, and government digital transformation programs. The country has developed a stable regulatory environment for ICT investment, with growing interest in data center development and regional connectivity. E-government services are expanding, and digital identity initiatives are underway. The sector represents opportunity for cloud infrastructure, cross-border connectivity, and institutional digital transformation aligned with Botswana's economic diversification goals.$$,
      68, 70, 1, 'explorer'),
    ('BWA', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Botswana's financial sector combines established banking infrastructure, mobile money expansion, regulatory modernization, and growing fintech ecosystem interest.$$,
      $$Botswana maintains a well-regulated banking sector supported by the Bank of Botswana, with expanding mobile money penetration and payment system modernization. The regulatory environment is conducive to fintech development, with frameworks for digital payments and innovation sandboxes under consideration. Cross-border payment systems and regional financial integration present strategic opportunities. The sector is positioned for digital lending, insurance technology, and regional fintech hub development.$$,
      70, 68, 2, 'explorer'),
    ('BWA', 'energy_renewables', 'Energy and Renewables',
      $$Botswana's energy sector is characterized by coal-based generation capacity, solar potential, regional power interconnection, and energy transition planning.$$,
      $$Botswana relies primarily on coal-fired power generation supplemented by imports from regional interconnectors. The country possesses significant solar energy potential across its semi-arid landscape, with utility-scale solar projects under development. The government has committed to renewable energy expansion as part of economic diversification from coal dependence. Regional power pooling through SAPP provides energy security and trade opportunities. The sector represents investment potential in solar generation, transmission infrastructure, and energy access expansion.$$,
      65, 72, 3, 'explorer'),
    ('BWA', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Botswana's agriculture is supported by cattle ranching, emerging horticulture, irrigation investment, and value chain development targeting domestic and regional markets.$$,
      $$Botswana's agricultural sector is anchored by cattle ranching and beef production, with growing focus on horticulture, drought-resistant crops, and irrigation infrastructure. Water scarcity shapes agricultural strategy, with emphasis on efficient irrigation and value chain development. The country benefits from disease-free livestock status and preferential export access to European markets. Government support for commercialization, agro-processing, and food security positions the sector for institutional investment and regional trade expansion.$$,
      62, 65, 4, 'explorer'),
    ('BWA', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Botswana's mining sector is anchored by diamonds, coal, copper-nickel, and emerging exploration for critical minerals including rare earths and lithium.$$,
      $$Botswana is a global diamond production leader with mature mining infrastructure, transparent governance, and stable regulatory framework. The country produces diamonds, coal, copper, nickel, and soda ash, with expanding exploration for critical minerals including lithium and rare earth elements. Botswana's mining-driven GDP and institutional capacity position it as a competitive destination for resource development. Beneficiation initiatives, downstream value addition, and responsible mining standards enhance sector attractiveness for institutional mining investors.$$,
      82, 75, 5, 'explorer'),
    ('BWA', 'logistics_trade', 'Logistics and Trade',
      $$Botswana's logistics infrastructure includes road networks, regional rail connectivity, dry port development, and positioning as a Southern African trade corridor.$$,
      $$Botswana maintains road networks linking major centers and bordering countries, with rail connectivity to South Africa and Zimbabwe. The Trans-Kalahari Corridor provides landlocked access to Namibian ports, while plans for Kazungula Bridge and dry port development enhance regional trade facilitation. SADC membership and customs modernization support cross-border commerce. The sector represents opportunity for trade corridor investment, cold chain development, and regional logistics hub positioning.$$,
      65, 68, 6, 'explorer'),
    ('BWA', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Botswana's tourism economy is anchored by safari and conservation tourism, lodge infrastructure, air connectivity, and high-value low-volume positioning.$$,
      $$Botswana is a premium safari destination supported by the Okavango Delta UNESCO World Heritage site, wildlife conservation areas, and luxury lodge infrastructure. The country's high-value low-volume tourism model emphasizes sustainability, community benefit, and conservation financing. Air connectivity through Maun and Kasane serves tourism zones, while regional aviation access from South Africa supports visitor flows. The sector contributes significantly to GDP and employment, with opportunities for lodge investment, conservation partnerships, and experiential tourism development.$$,
      78, 72, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- ESWATINI (SWZ) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('SWZ', 'digital_infrastructure', 'Digital Infrastructure',
      $$Eswatini's digital infrastructure is developing through mobile network coverage, fiber backbone expansion, cross-border connectivity, and government digitalization initiatives.$$,
      $$Eswatini benefits from competitive mobile network coverage and expanding fiber infrastructure connecting urban centers. The country's strategic location between South Africa and Mozambique supports cross-border connectivity potential. Government digitalization programs are advancing e-government services and digital identity systems. Regulatory frameworks for ICT investment are evolving, with emphasis on broadband access and digital inclusion. The sector represents opportunity for regional connectivity, cloud adoption, and institutional digital transformation.$$,
      58, 65, 1, 'explorer'),
    ('SWZ', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Eswatini's financial sector combines established banking through CMA membership, mobile money growth, payment system modernization, and emerging digital finance adoption.$$,
      $$Eswatini participates in the Common Monetary Area with South Africa, maintaining banking sector stability and currency peg to the South African rand. Mobile money platforms are expanding financial inclusion, particularly in rural areas. Payment infrastructure is modernizing through digital channels and card acceptance networks. The Central Bank of Eswatini is developing frameworks for digital finance and fintech innovation. The sector is positioned for mobile banking expansion, agricultural finance digitization, and cross-border payment facilitation.$$,
      62, 68, 2, 'explorer'),
    ('SWZ', 'energy_renewables', 'Energy and Renewables',
      $$Eswatini's energy sector is characterized by hydropower generation, reliance on imports from South Africa, renewable energy potential, and regional power integration.$$,
      $$Eswatini generates hydropower and imports substantial electricity from South Africa and Mozambique through SAPP interconnections. The country possesses untapped hydroelectric, solar, and biomass renewable energy potential. Small-scale renewable energy projects and mini-grids are expanding rural energy access. Energy sector reforms aim to attract private investment in generation and transmission. The sector represents opportunity for renewable energy development, energy efficiency, and regional power trade optimization.$$,
      55, 70, 3, 'explorer'),
    ('SWZ', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Eswatini's agriculture includes sugarcane production, citrus cultivation, cattle ranching, smallholder farming, and agro-processing for export and domestic markets.$$,
      $$Eswatini's agricultural sector is anchored by sugarcane cultivation and sugar export, complemented by citrus, forestry, cattle, and maize production. Irrigated agriculture in lowveld areas supports export-oriented horticulture. Government support for smallholder commercialization, value chain development, and land reform shapes sector evolution. SACU and AGOA preferential trade access enhance export competitiveness. The sector represents opportunity for agro-processing investment, irrigation infrastructure, and climate-resilient agriculture.$$,
      68, 65, 4, 'explorer'),
    ('SWZ', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Eswatini's mining sector includes coal production, iron ore, stone quarrying, and exploration for critical minerals and precious metals.$$,
      $$Eswatini produces coal for domestic use and export, with mining contributing modestly to GDP alongside quarrying and iron ore extraction. Exploration activity for gold, diamonds, and critical minerals is ongoing, with potential for resource expansion. The regulatory environment for mining is evolving to attract investment while ensuring environmental and social responsibility. The sector represents opportunity for exploration investment, beneficiation, and responsible resource development.$$,
      52, 60, 5, 'explorer'),
    ('SWZ', 'logistics_trade', 'Logistics and Trade',
      $$Eswatini's logistics infrastructure includes road networks, rail connectivity to Mozambique and South Africa, dry port development, and regional trade corridor positioning.$$,
      $$Eswatini's strategic location between South Africa and Mozambique positions it along key trade corridors linking inland regions to Maputo port. Road infrastructure connects to neighboring countries, while rail links provide freight access to Mozambican ports. SACU membership facilitates customs integration and trade flows. Dry port and border post modernization are improving trade facilitation. The sector represents opportunity for transit logistics, warehousing, and regional trade services.$$,
      60, 65, 6, 'explorer'),
    ('SWZ', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Eswatini's tourism economy is supported by cultural heritage, wildlife reserves, proximity to South African markets, and growing hospitality infrastructure.$$,
      $$Eswatini offers cultural tourism centered on Swazi heritage, combined with wildlife reserves and national parks supporting conservation tourism. Proximity to South Africa's Gauteng and KwaZulu-Natal regions provides accessible regional visitor markets. Hospitality infrastructure includes lodges, hotels, and community tourism initiatives. Events tourism, adventure activities, and cross-border tourism circuits present development opportunities. The sector contributes to employment and foreign exchange, with potential for destination investment and regional tourism integration.$$,
      62, 68, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- LESOTHO (LSO) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('LSO', 'digital_infrastructure', 'Digital Infrastructure',
      $$Lesotho's digital infrastructure is advancing through mobile network expansion, fiber connectivity development, digital public services, and cross-border integration.$$,
      $$Lesotho's telecommunications sector benefits from expanding mobile network coverage reaching mountainous terrain, with fiber backbone development connecting urban centers. The government is implementing e-government platforms and digital identity programs to improve service delivery. Cross-border connectivity with South Africa provides bandwidth access and regional integration potential. Regulatory frameworks are evolving to support ICT investment and digital inclusion. The sector represents opportunity for rural connectivity, cloud adoption, and digital transformation aligned with development priorities.$$,
      52, 62, 1, 'explorer'),
    ('LSO', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Lesotho's financial sector includes banking through CMA membership, expanding mobile money adoption, remittance digitization, and financial inclusion initiatives.$$,
      $$Lesotho participates in the Common Monetary Area with rand currency integration, maintaining banking stability and cross-border financial linkages with South Africa. Mobile money platforms are expanding access in rural mountainous areas where traditional banking is limited. Remittances from Lesotho workers abroad represent significant inflows, with digital channels reducing transaction costs. The Central Bank of Lesotho is supporting digital financial services and financial inclusion programs. The sector is positioned for mobile banking growth, agricultural finance, and diaspora finance digitization.$$,
      58, 70, 2, 'explorer'),
    ('LSO', 'energy_renewables', 'Energy and Renewables',
      $$Lesotho's energy sector is anchored by hydropower generation, electricity exports to South Africa, renewable energy potential, and infrastructure investment.$$,
      $$Lesotho generates substantial hydropower through the Lesotho Highlands Water Project, exporting electricity to South Africa while serving domestic demand. The country possesses additional hydroelectric potential in mountainous terrain, with projects under development. Solar energy deployment is expanding for rural electrification and mini-grids. Regional power interconnection through SAPP supports energy trade and security. The sector represents strategic opportunity for hydropower expansion, renewable energy investment, and energy infrastructure financing.$$,
      68, 75, 3, 'explorer'),
    ('LSO', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Lesotho's agriculture includes livestock production, wool and mohair, highland crop cultivation, and smallholder farming shaped by mountainous terrain and water resources.$$,
      $$Lesotho's agriculture is characterized by livestock rearing, particularly sheep and goats producing wool and mohair for export. Highland terrain limits arable agriculture but supports unique crop varieties and organic production potential. Water abundance from mountain sources supports irrigation and horticulture development. Government programs target agricultural commercialization, value chain development, and climate resilience. The sector represents opportunity for agro-processing, high-value niche products, and sustainable mountain agriculture.$$,
      58, 62, 4, 'explorer'),
    ('LSO', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Lesotho's mining sector is focused on diamond production, with exploration activity for minerals and water resource management for regional export.$$,
      $$Lesotho produces diamonds from established mines, with mining contributing meaningfully to export earnings and government revenues. The country's geology supports ongoing exploration for precious stones and base metals. Water is a strategic resource, with the Lesotho Highlands Water Project delivering bulk water to South Africa alongside hydropower generation. Responsible mining governance and environmental stewardship are policy priorities. The sector represents opportunity for diamond sector investment, exploration, and sustainable resource management.$$,
      65, 68, 5, 'explorer'),
    ('LSO', 'logistics_trade', 'Logistics and Trade',
      $$Lesotho's logistics infrastructure includes road networks, border posts with South Africa, landlocked positioning, and SACU membership supporting trade integration.$$,
      $$Lesotho's landlocked geography makes road infrastructure and border efficiency critical for trade. The country maintains road connections to South African ports through multiple border posts, with ongoing upgrades to improve transit times. SACU membership provides customs union benefits and preferential market access. Apparel and textile exports benefit from AGOA access to U.S. markets. The sector represents opportunity for trade facilitation, cold chain development, and regional logistics services supporting manufacturing exports.$$,
      55, 62, 6, 'explorer'),
    ('LSO', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Lesotho's tourism economy is anchored by mountain adventure tourism, cultural heritage, ski resort infrastructure, and nature-based experiences.$$,
      $$Lesotho offers unique mountain tourism experiences as the only country entirely above 1000 meters elevation, supporting trekking, skiing at Afriski resort, and highland cultural tourism. Natural attractions include mountain landscapes, waterfalls, and biodiversity supporting eco-tourism. Proximity to South Africa provides accessible regional visitor markets. Hospitality infrastructure includes lodges, guesthouses, and community tourism initiatives. The sector contributes to rural employment and foreign exchange, with potential for adventure tourism investment and regional destination marketing.$$,
      60, 68, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- MALAWI (MWI) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('MWI', 'digital_infrastructure', 'Digital Infrastructure',
      $$Malawi's digital infrastructure is advancing through fiber backbone expansion, mobile broadband deployment, regional connectivity, and government digitalization initiatives.$$,
      $$Malawi is expanding fiber backbone infrastructure connecting major cities, with mobile networks providing broadband coverage across urban and rural areas. Regional fiber connectivity through neighboring countries enhances international bandwidth access. Government e-services and digital identity programs are under development to improve public service delivery. The regulatory environment for ICT investment is evolving, with emphasis on digital inclusion and affordability. The sector represents opportunity for last-mile connectivity, data center services, and institutional digital transformation.$$,
      55, 68, 1, 'explorer'),
    ('MWI', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Malawi's financial sector includes banking modernization, expanding mobile money adoption, agricultural finance digitization, and financial inclusion programs.$$,
      $$Malawi's financial sector is modernizing through digital banking channels, mobile money platforms, and payment system upgrades. The Reserve Bank of Malawi supports digital financial services and fintech innovation to expand financial inclusion in predominantly rural populations. Agricultural finance is digitizing through mobile platforms linking farmers to markets and credit. Remittance corridors and cross-border payments represent growth areas. The sector is positioned for mobile banking expansion, agent banking networks, and agricultural value chain financing.$$,
      58, 72, 2, 'explorer'),
    ('MWI', 'energy_renewables', 'Energy and Renewables',
      $$Malawi's energy sector combines hydropower generation, biomass reliance, solar expansion, regional power integration, and energy access challenges.$$,
      $$Malawi relies primarily on hydroelectric power from Shire River installations, supplemented by thermal generation during dry seasons. Biomass remains the dominant household energy source, creating deforestation and health concerns. The country is expanding solar energy deployment for rural electrification and mini-grids. Regional power interconnections through SAPP are under development. Energy sector reforms aim to attract private investment and improve access rates. The sector represents opportunity for renewable energy investment, transmission infrastructure, and off-grid solutions.$$,
      52, 70, 3, 'explorer'),
    ('MWI', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Malawi's agriculture is anchored by tobacco, tea, sugar cultivation, maize production, smallholder farming, and agro-processing for export and food security.$$,
      $$Malawi's economy is heavily agricultural, with tobacco as the primary export alongside tea, sugar, cotton, and macadamia nuts. Maize cultivation supports domestic food security. Lake Malawi fisheries provide protein and livelihoods. Smallholder farmers dominate production, with government and development programs supporting commercialization, irrigation, and climate resilience. The country benefits from fertile soils and freshwater resources. The sector represents opportunity for agro-processing investment, value chain finance, and export diversification.$$,
      68, 65, 4, 'explorer'),
    ('MWI', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Malawi's mining sector includes uranium, rare earths, limestone, gemstones, and emerging exploration for critical minerals and energy resources.$$,
      $$Malawi's mining sector is developing, with uranium, coal, rare earth elements, and gemstones among resources under extraction or exploration. Limestone supports cement production for domestic construction demand. The government is strengthening mining governance and attracting exploration investment for critical minerals. Geological potential exists for further resource discovery. The sector represents opportunity for responsible mining investment, exploration, and local content development in emerging mineral economy.$$,
      48, 65, 5, 'explorer'),
    ('MWI', 'logistics_trade', 'Logistics and Trade',
      $$Malawi's logistics infrastructure includes road networks, rail rehabilitation, regional trade corridors to Mozambique and Tanzania, and border modernization.$$,
      $$Malawi's landlocked position makes regional trade corridors critical for imports and exports. Road networks connect to Mozambican ports (Nacala, Beira) and Tanzania (Dar es Salaam), with corridor investments improving transit efficiency. Rail rehabilitation projects aim to restore freight capacity. COMESA and SADC membership support regional trade integration. Border post modernization and one-stop facilities are improving customs efficiency. The sector represents opportunity for corridor logistics investment, warehousing, and trade facilitation services.$$,
      52, 65, 6, 'explorer'),
    ('MWI', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Malawi's tourism economy is anchored by Lake Malawi, wildlife reserves, hospitality infrastructure, and positioning as a peaceful Southern African destination.$$,
      $$Malawi's tourism sector centers on Lake Malawi, a UNESCO World Heritage site supporting water-based leisure, diving, and beach tourism. National parks including Liwonde and Majete offer wildlife viewing and conservation tourism. The country benefits from political stability and "warm heart of Africa" destination branding. Hospitality infrastructure includes lakeshore lodges, hotels, and community tourism. Regional visitor markets and diaspora travel support demand. The sector contributes to employment and foreign exchange, with opportunity for eco-tourism investment and destination development.$$,
      62, 68, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- MOZAMBIQUE (MOZ) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('MOZ', 'digital_infrastructure', 'Digital Infrastructure',
      $$Mozambique's digital infrastructure benefits from submarine cable landings, fiber backbone expansion, mobile broadband growth, and regional connectivity positioning.$$,
      $$Mozambique serves as a digital gateway for Southern Africa through submarine cable landings at Maputo and Nacala, providing international connectivity. Fiber backbone networks are expanding to connect provinces and link landlocked neighbors. Mobile networks provide growing broadband coverage in urban and rural areas. Government e-services and digital identity initiatives are advancing service delivery modernization. The sector represents opportunity for data center development, cross-border connectivity, and cloud infrastructure serving regional markets.$$,
      65, 75, 1, 'explorer'),
    ('MOZ', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Mozambique's financial sector combines banking expansion, mobile money growth, remittance digitization, and fintech innovation supporting financial inclusion.$$,
      $$Mozambique's financial sector is expanding digital channels through mobile money platforms, reaching underserved populations in rural areas. The Banco de Moçambique supports fintech innovation and digital payment system development. Remittances from Mozambican diaspora represent significant inflows, with digital channels reducing costs. Cross-border payment systems linking regional economies are developing. The sector is positioned for mobile banking expansion, agricultural finance digitization, and regional fintech hub development leveraging geographic positioning.$$,
      60, 72, 2, 'explorer'),
    ('MOZ', 'energy_renewables', 'Energy and Renewables',
      $$Mozambique's energy sector is anchored by natural gas discoveries, hydropower generation, coal reserves, renewable energy potential, and regional power export.$$,
      $$Mozambique is emerging as a regional energy hub through Rovuma Basin natural gas discoveries attracting LNG investment, complemented by Cahora Bassa hydropower and coal reserves. The country exports electricity to Southern Africa through SAPP interconnectors. Solar and wind renewable energy potential is substantial for domestic generation and export. Energy sector reforms aim to expand access and attract private investment. The sector represents strategic opportunity for gas monetization, renewable energy, and regional energy trade infrastructure.$$,
      72, 85, 3, 'explorer'),
    ('MOZ', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Mozambique's agriculture includes maize, cassava, cashew production, sugarcane, cotton cultivation, and agro-processing supported by arable land and water resources.$$,
      $$Mozambique possesses extensive arable land and water resources supporting diverse agricultural production including cashews (major export), sugar, cotton, tobacco, and staple crops. Smallholder farming dominates, with commercial agriculture expanding through land concessions. The government is promoting agricultural commercialization, irrigation, and value chain development. Proximity to regional markets and port infrastructure enhances export competitiveness. The sector represents opportunity for agro-processing investment, commercial farming, and regional agricultural hub development.$$,
      65, 70, 4, 'explorer'),
    ('MOZ', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Mozambique's mining sector includes coal, graphite, heavy mineral sands, gemstones, and exploration for critical minerals supporting industrial demand.$$,
      $$Mozambique produces coal from Tete Province for export and domestic use, with substantial reserves supporting mining expansion. Graphite production serves battery and industrial markets. Heavy mineral sands (titanium, zircon) and gemstones (rubies, tourmaline) diversify mineral output. The country's geology supports exploration for critical minerals including rare earths. Mining infrastructure development and regulatory reforms aim to attract investment. The sector represents opportunity for resource development, beneficiation, and export infrastructure investment.$$,
      68, 75, 5, 'explorer'),
    ('MOZ', 'logistics_trade', 'Logistics and Trade',
      $$Mozambique's logistics infrastructure includes deep-water ports at Maputo, Beira, Nacala, rail corridors, road networks, and positioning as regional trade gateway.$$,
      $$Mozambique operates strategic deep-water ports serving landlocked Southern African countries including Zimbabwe, Zambia, Malawi, and eastern DRC. The Maputo Corridor links Gauteng, Beira Corridor serves central regions, and Nacala Corridor provides northern access. Rail infrastructure is being rehabilitated and expanded to increase freight capacity. SADC membership and customs modernization support trade facilitation. The sector is a major foreign exchange earner and employment generator, with opportunity for port infrastructure investment, logistics services, and regional trade integration.$$,
      75, 78, 6, 'explorer'),
    ('MOZ', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Mozambique's tourism economy is anchored by Indian Ocean coastal resorts, marine biodiversity, heritage sites, wildlife areas, and growing hospitality investment.$$,
      $$Mozambique offers extensive Indian Ocean coastline supporting beach and marine tourism, with diving, fishing, and island destinations attracting regional and international visitors. Heritage sites including Island of Mozambique (UNESCO) provide cultural tourism. Wildlife reserves support safari tourism and conservation finance. Hospitality infrastructure is expanding through hotel, lodge, and resort investment. Regional aviation and road connectivity from South Africa support visitor access. The sector contributes significantly to GDP and employment, with opportunity for coastal destination investment and eco-tourism development.$$,
      70, 75, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- NAMIBIA (NAM) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('NAM', 'digital_infrastructure', 'Digital Infrastructure',
      $$Namibia's digital infrastructure combines fiber backbone networks, mobile broadband coverage, data center readiness, submarine cable connectivity, and e-government platforms.$$,
      $$Namibia benefits from established fiber backbone infrastructure connecting major centers, with mobile networks providing broadband coverage across vast distances. Submarine cable landings through Angola and South Africa provide international connectivity. The government maintains advanced e-services and digital identity systems supporting service delivery. Data center infrastructure is developing to serve domestic and regional markets. ICT regulatory frameworks support competition and investment. The sector represents opportunity for regional digital hub development, cloud services, and cross-border connectivity serving SADC markets.$$,
      70, 72, 1, 'explorer'),
    ('NAM', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Namibia's financial sector includes mature banking, mobile money expansion, payment system modernization, and stable regulatory environment attracting fintech investment.$$,
      $$Namibia maintains a well-developed banking sector regulated by the Bank of Namibia, with expanding digital banking and mobile money platforms. Payment infrastructure is modernizing through digital channels and card networks. The country's CMA membership provides currency stability and cross-border financial integration with South Africa. Regulatory frameworks support fintech innovation while maintaining financial stability. The sector is positioned for digital lending, insurance technology, agricultural finance digitization, and regional fintech services leveraging institutional strength.$$,
      72, 70, 2, 'explorer'),
    ('NAM', 'energy_renewables', 'Energy and Renewables',
      $$Namibia's energy sector is characterized by renewable energy potential, solar expansion, cross-border power imports, regional interconnection, and green hydrogen initiatives.$$,
      $$Namibia possesses exceptional solar and wind energy resources supporting renewable energy development and green hydrogen production potential. The country currently imports substantial power from neighboring countries while developing domestic generation capacity. Utility-scale solar projects are operational and expanding, with wind projects under development. Regional SAPP interconnection supports energy trade and security. Government commitment to renewable energy and green hydrogen positions Namibia for energy transition investment. The sector represents strategic opportunity for solar generation, wind power, hydrogen economy development, and regional clean energy exports.$$,
      68, 80, 3, 'explorer'),
    ('NAM', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Namibia's agriculture includes livestock ranching, high-value horticulture, aquaculture, drought-resistant crops, and export-oriented production for regional markets.$$,
      $$Namibia's agricultural sector is dominated by livestock production, particularly cattle ranching for beef export benefiting from disease-free status. Arid climate shapes agricultural strategy, with emphasis on drought-resistant crops, irrigation efficiency, and aquaculture including oyster production. High-value horticulture targets export markets. Government support for commercialization, land reform, and climate resilience influences sector development. The sector represents opportunity for agro-processing, value chain investment, and sustainable dryland agriculture suited to semi-arid conditions.$$,
      62, 65, 4, 'explorer'),
    ('NAM', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Namibia's mining sector is anchored by diamonds, uranium, copper, zinc, and exploration for critical minerals including rare earths and lithium.$$,
      $$Namibia is a significant global producer of diamonds and uranium, with established mining operations for copper, zinc, gold, and other minerals. The country benefits from stable governance, transparent mining regulatory frameworks, and mature mining infrastructure. Exploration activity for critical minerals including lithium, rare earths, and battery metals is intensifying. Namibia's geology and institutional capacity position it as a competitive African mining jurisdiction. The sector represents opportunity for resource development, exploration investment, and beneficiation aligned with responsible mining standards.$$,
      78, 72, 5, 'explorer'),
    ('NAM', 'logistics_trade', 'Logistics and Trade',
      $$Namibia's logistics infrastructure includes Walvis Bay port, road networks, Trans-Caprivi and Trans-Kalahari corridors, and positioning as regional trade gateway.$$,
      $$Namibia operates Walvis Bay deep-water port serving landlocked SADC countries including Botswana, Zambia, and Zimbabwe, with container and bulk handling capacity. Trans-Caprivi and Trans-Kalahari corridors facilitate regional trade flows. Road infrastructure connects neighboring countries, while rail networks link ports to inland regions. SADC membership and customs modernization support trade facilitation. The sector is strategically important for regional logistics, with opportunity for port expansion, corridor investment, and warehousing services for Southern African trade.$$,
      75, 72, 6, 'explorer'),
    ('NAM', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Namibia's tourism economy is anchored by conservation tourism, desert landscapes, wildlife areas, coastal attractions, and high-quality hospitality infrastructure.$$,
      $$Namibia is a premier African conservation tourism destination featuring Etosha National Park, Namib Desert landscapes, coastal attractions at Swakopmund and Walvis Bay, and community-based conservancies supporting wildlife and livelihoods. The country maintains high-quality lodge infrastructure, responsible tourism practices, and wilderness experiences attracting international visitors. Aviation connectivity through Windhoek and regional access support visitor flows. Tourism contributes significantly to GDP, employment, and conservation financing. The sector represents opportunity for lodge investment, eco-tourism development, and regional destination integration.$$,
      80, 72, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- ZAMBIA (ZMB) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('ZMB', 'digital_infrastructure', 'Digital Infrastructure',
      $$Zambia's digital infrastructure is advancing through fiber backbone expansion, data center development, mobile broadband deployment, and regional connectivity positioning.$$,
      $$Zambia is expanding fiber backbone networks connecting provinces and neighboring countries, with growing data center capacity in Lusaka supporting cloud adoption. Mobile networks provide broadband coverage across urban and rural areas. Government e-services and digital identity programs are modernizing public service delivery. Regional connectivity through terrestrial and submarine cable systems enhances international bandwidth. ICT regulatory reforms aim to attract investment and expand digital access. The sector represents opportunity for data center services, cross-border connectivity, and institutional digital transformation serving regional markets.$$,
      62, 72, 1, 'explorer'),
    ('ZMB', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Zambia's financial sector includes banking modernization, expanding mobile money adoption, digital payment growth, and financial inclusion initiatives.$$,
      $$Zambia's financial sector is evolving through digital banking channels, mobile money platforms, and payment system modernization. The Bank of Zambia supports digital financial services and fintech innovation to expand access in underserved populations. Agricultural finance is digitizing through mobile platforms connecting farmers to markets and credit. Remittance corridors and cross-border payments represent growth opportunities. The sector is positioned for mobile banking expansion, agent banking networks, and regional fintech services leveraging Zambia's COMESA and SADC positioning.$$,
      65, 72, 2, 'explorer'),
    ('ZMB', 'energy_renewables', 'Energy and Renewables',
      $$Zambia's energy sector is anchored by hydropower generation, regional power export, renewable energy potential, and transmission infrastructure investment.$$,
      $$Zambia generates substantial hydropower from Zambezi River installations including Kariba Dam, exporting electricity to Southern Africa through SAPP while meeting domestic demand. The country possesses additional hydroelectric, solar, and biomass renewable energy potential. Energy sector reforms aim to attract private investment in generation and transmission. Regional interconnection positions Zambia as a potential energy hub. The sector represents strategic opportunity for hydropower expansion, solar deployment, transmission infrastructure, and regional power trade.$$,
      70, 75, 3, 'explorer'),
    ('ZMB', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Zambia's agriculture includes maize, tobacco, cotton, livestock production, aquaculture, and agro-processing supported by arable land and water resources.$$,
      $$Zambia possesses abundant arable land and water resources supporting diverse agricultural production including maize (food security and export), tobacco, cotton, cattle, and emerging aquaculture. Government agricultural support programs, land allocation, and irrigation investment promote commercialization. Regional food markets and export corridors enhance trade opportunities. The sector contributes significantly to employment and GDP, with opportunity for agro-processing investment, commercial farming, and agricultural finance serving regional food security and export markets.$$,
      68, 70, 4, 'explorer'),
    ('ZMB', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Zambia's mining sector is anchored by copper production, cobalt, emeralds, and exploration for critical minerals supporting battery and technology demand.$$,
      $$Zambia is a major African copper producer with substantial reserves and established mining infrastructure in the Copperbelt region. Cobalt is extracted as a copper byproduct, serving battery manufacturing demand. Emerald production contributes to gemstone exports. The country's geology supports exploration for additional critical minerals. Mining sector reforms aim to improve fiscal terms and attract investment. Zambia's mining heritage and resource endowment position it strategically for resource development, beneficiation, and supply chain investment for energy transition minerals.$$,
      75, 72, 5, 'explorer'),
    ('ZMB', 'logistics_trade', 'Logistics and Trade',
      $$Zambia's logistics infrastructure includes road networks, rail corridors to Tanzania and Mozambique, border posts, and landlocked regional trade positioning.$$,
      $$Zambia's landlocked geography makes regional trade corridors critical for copper exports and imports. Road and rail links connect to Tanzanian (Dar es Salaam, Tazara railway), Mozambican (Nacala), and South African ports. COMESA and SADC membership support regional trade integration. Border post modernization and one-stop facilities are improving customs efficiency. The country serves as a transit corridor for neighboring countries. The sector represents opportunity for corridor logistics investment, warehousing, trade facilitation, and regional supply chain services supporting mining and agricultural trade.$$,
      65, 68, 6, 'explorer'),
    ('ZMB', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Zambia's tourism economy is anchored by Victoria Falls, safari tourism, South Luangwa and Kafue parks, adventure tourism, and growing hospitality investment.$$,
      $$Zambia shares Victoria Falls with Zimbabwe, one of the world's largest waterfalls and UNESCO World Heritage site, driving tourism demand. South Luangwa and Kafue National Parks offer premier safari and wildlife experiences. Adventure tourism including white-water rafting, bungee jumping, and walking safaris diversifies product offerings. Hospitality infrastructure includes lodges, hotels, and community tourism initiatives. Regional aviation connectivity supports visitor access. The sector contributes to employment and foreign exchange, with opportunity for lodge investment, conservation finance, and regional destination marketing.$$,
      72, 72, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- ZIMBABWE (ZWE) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('ZWE', 'digital_infrastructure', 'Digital Infrastructure',
      $$Zimbabwe's digital infrastructure combines fiber backbone networks, mobile broadband coverage, data center capacity, and digital transformation initiatives.$$,
      $$Zimbabwe maintains established fiber backbone infrastructure connecting major cities, with mobile networks providing broadband coverage across the country. Data center capacity in Harare supports cloud services and digital transformation. Government e-services and digital payment systems are advancing despite infrastructure challenges. Regional connectivity through terrestrial links enhances international bandwidth access. ICT sector resilience and innovation persist through economic volatility. The sector represents opportunity for digital infrastructure investment, fintech expansion, and institutional modernization aligned with economic stabilization.$$,
      58, 68, 1, 'explorer'),
    ('ZWE', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Zimbabwe's financial sector includes mobile money dominance, digital payment adoption, banking sector evolution, and financial innovation responding to currency challenges.$$,
      $$Zimbabwe has developed one of Africa's most advanced mobile money ecosystems, with platforms facilitating transactions, payments, and financial services in response to currency volatility. Digital payment adoption is widespread across urban and rural populations. The Reserve Bank of Zimbabwe supports digital financial services while managing monetary policy challenges. Banking sector modernization and fintech innovation continue despite economic headwinds. The sector demonstrates resilience and opportunity for digital finance solutions, payment infrastructure, and financial inclusion services serving diverse currency environments.$$,
      65, 70, 2, 'explorer'),
    ('ZWE', 'energy_renewables', 'Energy and Renewables',
      $$Zimbabwe's energy sector combines hydropower from Kariba, thermal generation, solar expansion, regional power integration, and infrastructure rehabilitation needs.$$,
      $$Zimbabwe generates power from Kariba Dam (shared with Zambia) and coal-fired thermal plants, supplemented by regional imports through SAPP interconnections. The country faces electricity supply challenges requiring generation capacity expansion and infrastructure rehabilitation. Solar energy deployment for commercial, industrial, and residential use is accelerating. Energy sector reforms aim to attract private investment and improve supply reliability. The sector represents opportunity for renewable energy investment, grid rehabilitation, and power purchase agreements supporting economic recovery.$$,
      55, 68, 3, 'explorer'),
    ('ZWE', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Zimbabwe's agriculture includes tobacco, maize, horticulture, livestock production, and irrigation supported by agricultural knowledge and arable land.$$,
      $$Zimbabwe's agricultural sector benefits from fertile soils, favorable climate, and established agricultural expertise supporting tobacco (major export), maize, horticulture, cattle, and crops for domestic and export markets. Land reform has reshaped farm structures, with smallholder and commercial farming coexisting. Irrigation infrastructure enhances productivity and drought resilience. Regional markets and export corridors provide trade opportunities. The sector represents opportunity for agro-processing investment, value chain finance, irrigation technology, and agricultural commercialization supporting food security and export growth.$$,
      65, 65, 4, 'explorer'),
    ('ZWE', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Zimbabwe's mining sector includes platinum, gold, diamonds, lithium, chrome, and substantial reserves of critical minerals attracting exploration investment.$$,
      $$Zimbabwe possesses world-class mineral resources including platinum group metals, gold, diamonds, lithium, chrome, and coal. The Great Dyke hosts significant platinum and chrome deposits, while lithium reserves serve battery manufacturing demand. Gold production contributes substantially to export earnings. Mining sector reforms aim to attract investment, improve governance, and expand production. The country's mineral endowment and geological potential position it strategically for resource development, exploration, and beneficiation serving energy transition and industrial demand.$$,
      72, 72, 5, 'explorer'),
    ('ZWE', 'logistics_trade', 'Logistics and Trade',
      $$Zimbabwe's logistics infrastructure includes road and rail networks, border posts, regional trade positioning, and rehabilitation investment restoring capacity.$$,
      $$Zimbabwe's landlocked position makes regional trade corridors essential for imports and exports. Road and rail infrastructure connects to South African, Mozambican, and Zambian ports, with ongoing rehabilitation and upgrade projects. Border posts with South Africa, Botswana, Zambia, and Mozambique facilitate regional trade. COMESA and SADC membership support trade integration. The logistics sector serves as transit corridor for neighboring countries. Infrastructure rehabilitation and investment represent opportunity for trade facilitation, warehousing, and regional supply chain services supporting economic recovery and regional integration.$$,
      58, 65, 6, 'explorer'),
    ('ZWE', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Zimbabwe's tourism economy is anchored by Victoria Falls, Hwange National Park, Great Zimbabwe heritage site, safari tourism, and hospitality infrastructure.$$,
      $$Zimbabwe shares Victoria Falls, offering premier adventure and leisure tourism complemented by Hwange National Park wildlife experiences, Great Zimbabwe UNESCO World Heritage ruins, and Eastern Highlands mountain tourism. The country possesses established hospitality infrastructure, tourism expertise, and diverse natural and cultural assets. Political and economic stability concerns have impacted visitor numbers, but sector fundamentals remain strong. Regional and international aviation connectivity supports access. The sector represents opportunity for lodge investment, heritage tourism development, and destination recovery aligned with broader economic stabilization.$$,
      68, 70, 7, 'explorer')

  ) AS v(iso3, sector_key, sector_label, teaser_md, rationale_md, strength_score, growth_score, display_order, min_plan_id)
)
INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md, 
  strength_score, growth_score, display_order, min_plan_id
)
SELECT 
  c.id AS country_id,
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
