-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.13d: STAGE 2 SECTOR SEED — CARIBBEAN REMAINING
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- 
-- CURATED PREVIEW DATA
-- Phase 4A Stage 2: All-74 Sector Coverage — Batch D
-- Caribbean Remaining (13 countries × 7 sectors = 91 rows)
-- =========================================================

-- ===========================================
-- IMPORTANT NOTES
-- ===========================================
-- 
-- 1. This is Batch D of 4 regional batches for Stage 2.
-- 2. ESH / Western Sahara is excluded from all batches.
-- 3. Caribbean scope = 20 markets total.
-- 4. This batch covers 13 remaining Caribbean countries/territories.
-- 5. Stage 1 covered 7 priority Caribbean markets (JAM, TTO, BRB, DOM, BHS, GRD, LCA).
-- 6. Each country receives all 7 universal sectors.
-- 7. Content is country-specific and executive-grade.
-- 8. Safe to rerun (idempotent ON CONFLICT DO UPDATE).
-- 
-- ===========================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 7-SECTOR SEED DATA — CARIBBEAN REMAINING (BATCH D)
-- ═══════════════════════════════════════════════════════════════════════════

WITH sector_seed AS (
  SELECT * FROM (VALUES
    -- ────────────────────────────────────────────────────────────────────────
    -- ANTIGUA AND BARBUDA (ATG) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('ATG', 'digital_infrastructure', 'Digital Infrastructure',
      $$Antigua and Barbuda's digital infrastructure is advancing through mobile network expansion, broadband deployment, e-government services, and regional connectivity initiatives.$$,
      $$Antigua and Barbuda is expanding mobile and broadband connectivity across its islands, with government investment in e-services and digital identity programs. Regional submarine cable connectivity provides international bandwidth access. The country is developing ICT frameworks to support digital economy growth, financial services digitalization, and tourism sector technology adoption. Small island digital resilience and cloud adoption for government and private sector represent development priorities. The sector represents opportunity for fintech infrastructure, digital services, and regional connectivity.$$,
      60, 68, 1, 'explorer'),
    ('ATG', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Antigua and Barbuda's financial sector combines offshore financial services, banking modernization, mobile money expansion, and digital payment infrastructure development.$$,
      $$Antigua and Barbuda maintains an offshore financial services sector alongside domestic banking, with expanding digital payment systems and mobile money adoption. The Eastern Caribbean Central Bank supports digital financial services and payment system modernization across the currency union. Regulatory frameworks for fintech and digital banking are evolving. The country's position as a financial services jurisdiction and tourism economy supports payment infrastructure investment. The sector represents opportunity for digital banking, payment technology, and cross-border financial services.$$,
      65, 70, 2, 'explorer'),
    ('ATG', 'energy_renewables', 'Energy and Renewables',
      $$Antigua and Barbuda's energy sector is characterized by renewable energy potential, solar deployment, energy import reduction targets, and climate resilience priorities.$$,
      $$Antigua and Barbuda relies substantially on imported fossil fuels while pursuing renewable energy expansion to reduce costs and enhance energy security. Solar energy deployment is advancing for utility-scale and distributed generation. Wind energy potential exists but requires investment. The government has committed to renewable energy targets and climate adaptation as a small island developing state. Energy sector reforms aim to attract private investment. The sector represents opportunity for solar generation, battery storage, and climate-resilient energy infrastructure.$$,
      55, 72, 3, 'explorer'),
    ('ATG', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Antigua and Barbuda's agriculture includes fisheries, livestock, horticulture, and food security initiatives addressing import dependence and climate resilience.$$,
      $$Antigua and Barbuda's agricultural sector is small, focused on food security, fisheries, livestock, and niche horticulture serving domestic consumption and limited export. The country imports substantial food supplies. Government programs support agricultural commercialization, irrigation, and climate-resilient farming. Blue economy initiatives emphasize sustainable fisheries and aquaculture. The sector represents opportunity for food security investment, aquaculture development, and agro-processing serving tourism and domestic markets.$$,
      48, 58, 4, 'explorer'),
    ('ATG', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Antigua and Barbuda's mineral sector is limited, with aggregate production for construction and potential for marine resources and blue economy development.$$,
      $$Antigua and Barbuda has minimal land-based mining activity, primarily aggregate and sand extraction supporting construction demand. The country's blue economy potential includes marine resources, though extraction remains limited. Geological surveys for mineral potential are not extensively developed. The focus remains on sustainable resource use and environmental protection. The sector represents limited opportunity for traditional mining, with greater potential in sustainable marine resource management and blue economy development.$$,
      35, 45, 5, 'explorer'),
    ('ATG', 'logistics_trade', 'Logistics and Trade',
      $$Antigua and Barbuda's logistics infrastructure includes port facilities, air connectivity, regional trade participation, and transshipment services supporting tourism and commerce.$$,
      $$Antigua and Barbuda operates port facilities at St. John's supporting cargo and cruise tourism, with air connectivity through V.C. Bird International Airport serving regional and international routes. The country participates in CARICOM trade integration and benefits from OECS membership. Logistics services support tourism supply chains and domestic commerce. Maritime services and yacht charter logistics contribute to the economy. The sector represents opportunity for port modernization, air service expansion, and regional logistics services.$$,
      60, 65, 6, 'explorer'),
    ('ATG', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Antigua and Barbuda's tourism economy is anchored by beach resorts, sailing tourism, heritage sites, air connectivity, and positioning as a premium Caribbean destination.$$,
      $$Antigua and Barbuda's economy is tourism-dependent, supported by beach resort infrastructure, sailing and yacht tourism, heritage sites including English Harbour, and air connectivity to North American and European markets. The country positions as a premium Caribbean destination with all-inclusive resorts and villa accommodations. Cruise tourism and diaspora travel supplement stay-over visitors. Tourism contributes substantially to GDP, employment, and foreign exchange. The sector represents opportunity for hospitality investment, destination development, and climate-resilient tourism infrastructure.$$,
      78, 72, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- CUBA (CUB) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('CUB', 'digital_infrastructure', 'Digital Infrastructure',
      $$Cuba's digital infrastructure is evolving through mobile network expansion, internet access growth, e-government development, and connectivity infrastructure investment.$$,
      $$Cuba is expanding mobile and fixed broadband connectivity after decades of limited internet access, with government investment in fiber backbone and 4G/5G mobile networks. Submarine cable connectivity through ALBA-1 and other systems provides international bandwidth. E-government services and digital identity programs are under development. The telecommunications sector is transitioning toward greater service provision and digital inclusion. ICT sector reforms aim to expand access while maintaining state oversight. The sector represents opportunity for connectivity infrastructure, digital services, and technology adoption serving economic modernization.$$,
      55, 70, 1, 'explorer'),
    ('CUB', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Cuba's financial sector is evolving through banking modernization, mobile payment introduction, remittance digitization, and currency system reforms.$$,
      $$Cuba's financial sector operates within a state-controlled framework undergoing reforms including currency unification, banking modernization, and payment system development. Mobile payment platforms are being introduced to expand digital financial services. Remittances from Cuban diaspora represent significant inflows, with digital channels reducing transaction costs and processing times. Banking infrastructure is modernizing through technological upgrades. The sector is positioned for digital payment expansion, banking technology adoption, and financial services modernization aligned with broader economic reforms.$$,
      50, 72, 2, 'explorer'),
    ('CUB', 'energy_renewables', 'Energy and Renewables',
      $$Cuba's energy sector combines oil and gas production, renewable energy expansion, solar deployment, and energy efficiency programs addressing import dependence.$$,
      $$Cuba produces modest oil and gas domestically while importing substantial petroleum products, primarily from regional partners. The country is expanding renewable energy through solar installations, wind projects, and biomass from sugar industry byproducts. Energy efficiency programs target consumption reduction. Government renewable energy targets aim to reduce fossil fuel dependence and enhance energy security. Power generation and distribution infrastructure require ongoing investment and rehabilitation. The sector represents opportunity for renewable energy development, grid modernization, and energy efficiency technology.$$,
      58, 70, 3, 'explorer'),
    ('CUB', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Cuba's agriculture includes sugar, tobacco, citrus, coffee production, livestock, and food security programs addressing import dependence and productivity challenges.$$,
      $$Cuba's agricultural sector historically centered on sugar export is now diversifying to include tobacco, citrus, coffee, and food crops for domestic consumption and export. The country faces food security challenges requiring substantial imports. Government agricultural reforms support private farming, cooperatives, and productivity enhancement. Organic agriculture and sustainable practices are emphasized. Livestock production and aquaculture contribute to protein supply. The sector represents opportunity for agro-processing investment, modern farming techniques, and value chain development supporting food security and export diversification.$$,
      60, 65, 4, 'explorer'),
    ('CUB', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Cuba's mining sector includes nickel, cobalt, copper, and exploration for critical minerals supporting industrial demand and export earnings.$$,
      $$Cuba is a significant nickel and cobalt producer, with established mining operations contributing to export revenues and supplying global markets including battery manufacturing. The country also produces copper, gold, and construction minerals. Geological potential exists for additional critical mineral resources. Mining sector modernization and investment frameworks aim to expand production while addressing environmental standards. The sector represents opportunity for resource development, exploration investment, and beneficiation serving energy transition mineral demand.$$,
      68, 68, 5, 'explorer'),
    ('CUB', 'logistics_trade', 'Logistics and Trade',
      $$Cuba's logistics infrastructure includes port facilities, road networks, rail systems, air connectivity, and positioning for regional trade and transshipment services.$$,
      $$Cuba operates port facilities including Mariel Special Development Zone designed for trade and manufacturing, with container and bulk handling capacity. The country's strategic Caribbean location supports potential transshipment and logistics services. Road and rail infrastructure require modernization and investment. Air connectivity serves international passenger and cargo markets. Economic reforms and trade relationships influence logistics sector development. The sector represents opportunity for port infrastructure investment, special economic zones, and regional logistics services aligned with trade policy evolution.$$,
      58, 68, 6, 'explorer'),
    ('CUB', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Cuba's tourism economy is anchored by heritage sites, beach resorts, cultural tourism, medical tourism, air connectivity, and positioning as a unique Caribbean destination.$$,
      $$Cuba's tourism sector combines UNESCO World Heritage sites including Old Havana, beach resort infrastructure in Varadero and other coastal zones, cultural and heritage tourism, and medical tourism services. The country benefits from unique positioning, architecture, music, and cultural assets attracting international visitors. Air connectivity from Canada, Europe, and regional markets supports arrivals. Hotel infrastructure ranges from state-operated to foreign joint ventures. Economic reforms influence tourism sector development. The sector represents opportunity for hospitality investment, destination development, and tourism-related services.$$,
      72, 70, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- DOMINICA (DMA) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('DMA', 'digital_infrastructure', 'Digital Infrastructure',
      $$Dominica's digital infrastructure is advancing through broadband expansion, mobile coverage, e-government services, and climate-resilient connectivity investment.$$,
      $$Dominica is expanding broadband and mobile connectivity across mountainous terrain, with government investment in e-services and digital identity programs supporting service delivery modernization. Regional submarine cable connectivity provides international bandwidth access. The country emphasizes climate-resilient infrastructure following hurricane impacts. ICT frameworks support digital economy development and small island digital services. Government and private sector cloud adoption represents a development priority. The sector represents opportunity for resilient connectivity infrastructure, digital services, and institutional digital transformation.$$,
      55, 65, 1, 'explorer'),
    ('DMA', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Dominica's financial sector combines offshore financial services, banking modernization, mobile money adoption, and digital payment infrastructure supporting financial inclusion.$$,
      $$Dominica maintains an offshore financial services sector alongside domestic banking, with expanding digital payment systems and mobile money platforms. The Eastern Caribbean Central Bank supports digital financial services and payment system modernization. Citizenship by Investment program generates financial flows requiring banking infrastructure. Regulatory frameworks for fintech are evolving. The sector represents opportunity for digital banking services, payment technology, and financial services supporting economic diversification.$$,
      58, 68, 2, 'explorer'),
    ('DMA', 'energy_renewables', 'Energy and Renewables',
      $$Dominica's energy sector features geothermal potential, hydropower generation, renewable energy expansion, and climate-resilient energy infrastructure priorities.$$,
      $$Dominica possesses significant geothermal energy potential under development to provide baseload renewable generation and potential regional export. The country operates hydropower plants and is expanding solar energy deployment. Fossil fuel imports support remaining energy demand. Government commitment to climate resilience and renewable energy positions Dominica as a potential regional clean energy supplier. Energy sector reforms aim to attract investment in geothermal and renewable infrastructure. The sector represents strategic opportunity for geothermal development, hydropower expansion, and climate-resilient energy systems.$$,
      60, 80, 3, 'explorer'),
    ('DMA', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Dominica's agriculture includes bananas, roots and tubers, coconuts, eco-agriculture, and climate-resilient farming supporting food security and export.$$,
      $$Dominica's agricultural sector centers on banana production for export, complemented by roots, tubers, coconuts, and organic agriculture. The country emphasizes sustainable and climate-resilient farming following hurricane impacts. Agro-processing, essential oils, and niche organic products target export markets. Government programs support agricultural commercialization and value chain development. Fertile volcanic soils and abundant rainfall support diverse cultivation. The sector represents opportunity for organic agriculture investment, agro-processing, and climate-smart agriculture serving export and domestic markets.$$,
      62, 65, 4, 'explorer'),
    ('DMA', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Dominica's mineral sector is limited, with aggregate production for construction, geothermal resources, and sustainable resource management priorities.$$,
      $$Dominica has limited land-based mining activity, primarily aggregate extraction supporting construction demand. The country's geothermal energy resources represent significant subsurface assets under development for power generation. Geological surveys for mineral potential remain limited. Environmental protection and sustainable resource use are policy priorities. The sector represents limited opportunity for traditional mining, with strategic focus on geothermal energy development and sustainable resource management.$$,
      40, 50, 5, 'explorer'),
    ('DMA', 'logistics_trade', 'Logistics and Trade',
      $$Dominica's logistics infrastructure includes port facilities, air connectivity, regional trade participation, and infrastructure investment supporting economic recovery and growth.$$,
      $$Dominica operates port facilities at Roseau serving cargo and cruise tourism, with air connectivity through Douglas-Charles and Canefield airports serving regional routes. The country participates in CARICOM trade integration and OECS membership. Logistics infrastructure investment is ongoing following hurricane damage, with emphasis on climate resilience. Road networks connect population centers. Maritime services support trade and tourism. The sector represents opportunity for port modernization, air service expansion, and climate-resilient logistics infrastructure.$$,
      55, 65, 6, 'explorer'),
    ('DMA', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Dominica's tourism economy is anchored by nature tourism, eco-tourism, hiking, diving, heritage sites, and positioning as the "Nature Island of the Caribbean."$$,
      $$Dominica positions as a nature-based tourism destination supported by rainforests, waterfalls, Morne Trois Pitons National Park (UNESCO World Heritage), diving sites, and hiking trails. The country emphasizes eco-tourism, wellness tourism, and sustainable tourism development rather than mass beach tourism. Hospitality infrastructure includes boutique hotels, eco-lodges, and guesthouses. Air and sea connectivity serve visitor access. Citizenship by Investment program supports hospitality sector investment. The sector represents opportunity for eco-tourism development, adventure tourism, and sustainable destination infrastructure.$$,
      68, 72, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- HAITI (HTI) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('HTI', 'digital_infrastructure', 'Digital Infrastructure',
      $$Haiti's digital infrastructure is developing through mobile network coverage, internet access expansion, digital financial services, and connectivity investment addressing infrastructure gaps.$$,
      $$Haiti's telecommunications sector is expanding mobile network coverage and internet access from a low base, with private sector investment in infrastructure alongside development programs. Mobile money and digital financial services represent significant adoption given limited banking infrastructure. Submarine cable connectivity provides international bandwidth potential. E-government services and digital identity programs are at early stages. Infrastructure challenges include electricity supply reliability and geographic coverage in rural areas. The sector represents opportunity for connectivity expansion, mobile services, and digital inclusion programs.$$,
      45, 68, 1, 'explorer'),
    ('HTI', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Haiti's financial sector features mobile money dominance, remittance digitization, microfinance expansion, and financial inclusion initiatives addressing unbanked populations.$$,
      $$Haiti's financial sector is characterized by limited traditional banking penetration and substantial mobile money adoption serving remittance receipt, payments, and financial inclusion. Remittances from Haitian diaspora represent significant GDP percentage, with digital channels reducing costs and expanding access. Microfinance institutions serve credit needs. The central bank supports digital financial services and payment system development. The sector is positioned for mobile banking expansion, digital remittance infrastructure, and financial inclusion services serving predominantly cash-based and informal economy.$$,
      52, 75, 2, 'explorer'),
    ('HTI', 'energy_renewables', 'Energy and Renewables',
      $$Haiti's energy sector faces substantial challenges including low access rates, infrastructure deficits, renewable energy potential, and reconstruction investment needs.$$,
      $$Haiti confronts severe energy challenges including low electricity access rates, inadequate generation capacity, transmission and distribution infrastructure deficits, and reliance on biomass and imported fossil fuels. The country possesses renewable energy potential including solar, wind, and micro-hydropower suited for decentralized generation. Energy sector reconstruction and investment attract development assistance and private sector engagement. Off-grid solutions and mini-grids address access gaps. The sector represents significant opportunity for renewable energy development, grid rehabilitation, and energy access expansion serving economic development and social needs.$$,
      35, 75, 3, 'explorer'),
    ('HTI', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Haiti's agriculture includes coffee, mangoes, cacao, rice, food crops, and reforestation programs addressing food security and environmental degradation.$$,
      $$Haiti's agricultural sector supports livelihoods for a large rural population, producing coffee, mangoes, cacao for export and rice, corn, beans for domestic consumption. The country faces food security challenges requiring imports. Environmental degradation including deforestation affects productivity and resilience. Government and development programs support sustainable agriculture, reforestation, irrigation, and value chain development. The sector represents opportunity for agricultural investment, agro-processing, sustainable farming, and food security programs serving export markets and domestic needs.$$,
      50, 65, 4, 'explorer'),
    ('HTI', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Haiti's mining sector includes gold, copper, bauxite potential, and mineral exploration attracting investment interest while addressing governance and environmental considerations.$$,
      $$Haiti possesses geological potential for gold, copper, silver, and bauxite, with exploration and development projects attracting investor interest. The mining sector remains underdeveloped, with governance, regulatory, and environmental frameworks under strengthening. Artisanal and small-scale mining activity exists alongside exploration programs. Responsible resource development and community benefit-sharing are policy priorities. The sector represents opportunity for mineral exploration, responsible mining investment, and resource sector governance supporting economic development while managing environmental and social considerations.$$,
      45, 70, 5, 'explorer'),
    ('HTI', 'logistics_trade', 'Logistics and Trade',
      $$Haiti's logistics infrastructure includes port facilities, road networks, border trade with Dominican Republic, and infrastructure investment supporting economic activity.$$,
      $$Haiti operates port facilities at Port-au-Prince and Cap-Haïtien serving imports, exports, and humanitarian logistics, with infrastructure reconstruction ongoing. Road networks connect major centers and border crossings with the Dominican Republic, facilitating trade and movement. Airport facilities serve passenger and cargo traffic. CARICOM membership supports regional trade integration. Infrastructure deficits and security considerations affect logistics efficiency. The sector represents opportunity for port modernization, road rehabilitation, border trade facilitation, and logistics services supporting manufacturing and agriculture value chains.$$,
      45, 65, 6, 'explorer'),
    ('HTI', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Haiti's tourism potential includes heritage sites, natural attractions, cultural tourism, and destination development addressing security and infrastructure challenges.$$,
      $$Haiti possesses tourism assets including UNESCO World Heritage site Citadelle Laferrière, cultural heritage, beaches, and mountain landscapes, with tourism sector potential constrained by security, infrastructure, and political stability considerations. The country receives diaspora visitors and adventure tourism segments. Government and development programs support destination development and security improvements. Hospitality infrastructure exists in Port-au-Prince and coastal areas. The sector represents long-term opportunity for heritage tourism development, eco-tourism, and destination recovery aligned with broader stability and infrastructure investment.$$,
      48, 65, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- SAINT KITTS AND NEVIS (KNA) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('KNA', 'digital_infrastructure', 'Digital Infrastructure',
      $$Saint Kitts and Nevis' digital infrastructure combines mobile and broadband networks, e-government services, digital finance infrastructure, and regional connectivity.$$,
      $$Saint Kitts and Nevis maintains competitive mobile and broadband connectivity across the two-island federation, with government investment in e-services and digital identity programs. Regional submarine cable connectivity provides international bandwidth access. The ICT sector supports digital economy development, financial services infrastructure, and tourism sector technology. Government and private sector cloud adoption is advancing. The sector represents opportunity for fintech infrastructure, digital services, and regional connectivity serving financial services and tourism industries.$$,
      65, 70, 1, 'explorer'),
    ('KNA', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Saint Kitts and Nevis' financial sector includes offshore financial services, banking infrastructure, digital payment modernization, and Citizenship by Investment program financial flows.$$,
      $$Saint Kitts and Nevis operates offshore financial services alongside domestic banking, with expanding digital payment systems and mobile banking. The Eastern Caribbean Central Bank supports digital financial services and payment system modernization. Citizenship by Investment program generates substantial financial flows requiring banking infrastructure and compliance frameworks. The country maintains international financial services standards while developing fintech capabilities. The sector represents opportunity for digital banking, payment technology, and financial services supporting economic diversification.$$,
      68, 70, 2, 'explorer'),
    ('KNA', 'energy_renewables', 'Energy and Renewables',
      $$Saint Kitts and Nevis' energy sector features geothermal potential, solar deployment, renewable energy targets, and energy import reduction strategies.$$,
      $$Saint Kitts and Nevis relies on imported fossil fuels while pursuing renewable energy expansion including geothermal potential on Nevis, solar deployment, and wind energy exploration. The country has committed to renewable energy targets to reduce costs and enhance energy security. Energy sector reforms aim to attract private investment in generation and distribution. Geothermal development could provide baseload renewable generation. The sector represents opportunity for geothermal investment, solar generation, and climate-resilient energy infrastructure serving small island energy needs.$$,
      58, 75, 3, 'explorer'),
    ('KNA', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Saint Kitts and Nevis' agriculture includes vegetables, fruits, livestock, fisheries, and food security initiatives addressing import dependence and supporting tourism supply.$$,
      $$Saint Kitts and Nevis' agricultural sector is small, focused on food security, vegetables, fruits, livestock, and fisheries serving domestic consumption and tourism industry supply. The federation historically produced sugar but has diversified. Government programs support agricultural modernization, irrigation, and value chain development. Aquaculture and sustainable fisheries represent growth areas. The sector represents opportunity for food security investment, agro-processing, and agricultural value chains linking to tourism and export markets.$$,
      52, 60, 4, 'explorer'),
    ('KNA', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Saint Kitts and Nevis' mineral sector is limited, with aggregate production for construction, geothermal resources, and sustainable resource management focus.$$,
      $$Saint Kitts and Nevis has minimal land-based mining activity, primarily aggregate extraction supporting construction demand. The federation's geothermal energy resources on Nevis represent significant subsurface assets under exploration for power generation. Marine resources and blue economy potential exist. Environmental protection is a policy priority. The sector represents limited opportunity for traditional mining, with strategic focus on geothermal energy development and sustainable resource management.$$,
      38, 52, 5, 'explorer'),
    ('KNA', 'logistics_trade', 'Logistics and Trade',
      $$Saint Kitts and Nevis' logistics infrastructure includes port facilities, air connectivity, inter-island transport, regional trade participation, and tourism logistics.$$,
      $$Saint Kitts and Nevis operates port facilities at Basseterre and Charlestown serving cargo and cruise tourism, with air connectivity through Robert L. Bradshaw International Airport serving international routes. Inter-island ferry services connect the federation. The country participates in CARICOM and OECS trade integration. Logistics services support tourism supply chains and import-export commerce. Yacht charter and maritime services contribute to the economy. The sector represents opportunity for port modernization, air service expansion, and regional logistics services.$$,
      62, 65, 6, 'explorer'),
    ('KNA', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Saint Kitts and Nevis' tourism economy is anchored by beach resorts, heritage sites, cruise tourism, Citizenship by Investment linked hospitality development, and yachting.$$,
      $$Saint Kitts and Nevis' tourism sector combines beach resort infrastructure, UNESCO World Heritage site Brimstone Hill Fortress, cruise tourism, and yachting. Citizenship by Investment program supports significant hospitality infrastructure development including resort and villa projects. Air and sea connectivity from North American and Caribbean markets supports visitors. The federation positions as a premium Caribbean destination. Tourism contributes substantially to GDP and employment. The sector represents opportunity for resort investment, heritage tourism development, and destination infrastructure supported by citizenship investment flows.$$,
      75, 75, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- SAINT VINCENT AND THE GRENADINES (VCT) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('VCT', 'digital_infrastructure', 'Digital Infrastructure',
      $$Saint Vincent and the Grenadines' digital infrastructure is advancing through mobile networks, broadband expansion, e-government services, and multi-island connectivity.$$,
      $$Saint Vincent and the Grenadines is expanding mobile and broadband connectivity across its multi-island geography, with government investment in e-services and digital identity programs. Regional submarine cable connectivity provides international bandwidth. Multi-island connectivity challenges require infrastructure investment. ICT frameworks support digital economy and tourism sector technology adoption. Government and private sector digital transformation is progressing. The sector represents opportunity for inter-island connectivity, digital services, and technology infrastructure serving tourism and financial services.$$,
      58, 65, 1, 'explorer'),
    ('VCT', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Saint Vincent and the Grenadines' financial sector combines offshore services, banking modernization, digital payments expansion, and financial regulatory frameworks.$$,
      $$Saint Vincent and the Grenadines operates offshore financial services alongside domestic banking, with expanding digital payment systems and mobile banking adoption. The Eastern Caribbean Central Bank supports digital financial services and payment modernization. The country maintains international financial services frameworks while developing digital finance capabilities. Banking infrastructure serves multi-island population and economic activity. The sector represents opportunity for digital banking services, payment technology, and financial services supporting economic diversification and financial inclusion.$$,
      62, 68, 2, 'explorer'),
    ('VCT', 'energy_renewables', 'Energy and Renewables',
      $$Saint Vincent and the Grenadines' energy sector features geothermal potential, solar expansion, hydropower generation, and renewable energy targets addressing fossil fuel dependence.$$,
      $$Saint Vincent and the Grenadines relies on imported fossil fuels supplemented by hydropower and expanding solar generation. The country possesses geothermal energy potential under exploration for baseload renewable generation. Multi-island geography creates energy infrastructure challenges. Government renewable energy targets aim to reduce import dependence and enhance energy security. Energy sector reforms support private investment. The sector represents opportunity for geothermal development, solar deployment, and climate-resilient energy infrastructure serving multi-island energy needs.$$,
      55, 72, 3, 'explorer'),
    ('VCT', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Saint Vincent and the Grenadines' agriculture includes bananas, arrowroot, coconuts, fisheries, and value chain development supporting export and food security.$$,
      $$Saint Vincent and the Grenadines' agricultural sector produces bananas for export, arrowroot starch, coconuts, and diverse food crops. Fisheries and aquaculture contribute to protein supply and livelihoods. Volcanic soils support productive agriculture. Government programs promote agricultural modernization, value-added processing, and climate resilience. Organic agriculture and niche products target export markets. The sector represents opportunity for agro-processing investment, sustainable fisheries, and agricultural value chains serving export and domestic markets including tourism supply.$$,
      60, 62, 4, 'explorer'),
    ('VCT', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Saint Vincent and the Grenadines' mineral sector is limited, with aggregate production, geothermal resources, and sustainable blue economy resource management.$$,
      $$Saint Vincent and the Grenadines has minimal land-based mining, primarily aggregate and sand extraction for construction. Geothermal energy resources represent subsurface assets under exploration. Marine resources and blue economy potential exist across the multi-island geography. Environmental protection and sustainable resource use are policy priorities. The sector represents limited traditional mining opportunity, with focus on geothermal energy development and sustainable marine resource management.$$,
      40, 50, 5, 'explorer'),
    ('VCT', 'logistics_trade', 'Logistics and Trade',
      $$Saint Vincent and the Grenadines' logistics infrastructure includes port facilities, air connectivity, inter-island transport, regional trade, and yachting services.$$,
      $$Saint Vincent and the Grenadines operates port facilities at Kingstown and throughout the Grenadines serving cargo and cruise tourism, with air connectivity through Argyle International Airport and smaller airstrips. Inter-island ferry and marine services connect the multi-island nation. CARICOM and OECS membership support regional trade integration. Yachting and maritime services represent significant economic activity. Logistics support tourism supply chains and commerce. The sector represents opportunity for port modernization, air service expansion, and maritime logistics services serving tourism and trade.$$,
      58, 65, 6, 'explorer'),
    ('VCT', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Saint Vincent and the Grenadines' tourism economy is anchored by sailing, yachting, luxury resort islands, diving, eco-tourism, and positioning as an exclusive Caribbean destination.$$,
      $$Saint Vincent and the Grenadines is a premier sailing and yachting destination featuring the Grenadines islands including Bequia, Mustique, and Canouan supporting luxury resort tourism. The country offers sailing charters, diving, beaches, and volcanic landscapes. Film production including Pirates of the Caribbean has enhanced destination profile. Hospitality infrastructure ranges from luxury resorts to boutique properties. Tourism contributes substantially to GDP and employment. The sector represents opportunity for resort investment, yachting infrastructure, and sustainable tourism development serving high-value visitor segments.$$,
      75, 72, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- SURINAME (SUR) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('SUR', 'digital_infrastructure', 'Digital Infrastructure',
      $$Suriname's digital infrastructure combines mobile network coverage, internet expansion, fiber backbone development, e-government initiatives, and regional connectivity.$$,
      $$Suriname is expanding telecommunications infrastructure including mobile networks, fixed broadband, and fiber backbone connecting urban and interior regions. Submarine cable systems provide international connectivity. Government e-services and digital identity programs support service delivery modernization. The ICT sector serves diverse linguistic and geographic contexts. Digital inclusion programs target interior and indigenous communities. The sector represents opportunity for connectivity expansion, digital services, and regional connectivity infrastructure serving economic diversification and social inclusion.$$,
      60, 68, 1, 'explorer'),
    ('SUR', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Suriname's financial sector includes banking modernization, mobile money adoption, digital payment infrastructure, and remittance services supporting financial inclusion.$$,
      $$Suriname's financial sector is modernizing through digital banking channels, mobile money platforms, and payment system upgrades. The Central Bank of Suriname supports digital financial services and fintech development. Remittances from Surinamese diaspora contribute to financial flows. Currency challenges and inflation have influenced financial sector evolution. Banking infrastructure serves urban centers and expanding to interior regions. The sector is positioned for mobile banking expansion, digital remittance infrastructure, and financial inclusion services serving diverse population.$$,
      58, 70, 2, 'explorer'),
    ('SUR', 'energy_renewables', 'Energy and Renewables',
      $$Suriname's energy sector features hydropower generation, fossil fuel resources, renewable energy potential, and energy export possibilities supporting regional markets.$$,
      $$Suriname generates substantial hydropower from Afobaka Dam and other installations, supplemented by thermal generation from domestic and imported fuels. The country possesses offshore oil and gas resources under development attracting international investment. Additional renewable energy potential exists including solar and biomass. Energy sector could support domestic demand and regional export. Infrastructure investment and regulatory frameworks aim to attract energy sector development. The sector represents strategic opportunity for hydropower expansion, oil and gas development, and renewable energy investment.$$,
      65, 75, 3, 'explorer'),
    ('SUR', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Suriname's agriculture includes rice, bananas, citrus, vegetables, fisheries, and agro-processing supported by arable land and water resources.$$,
      $$Suriname's agricultural sector produces rice for domestic consumption and export, alongside bananas, citrus, vegetables, and other crops. Coastal zones support cultivation while interior regions hold agricultural expansion potential. Fisheries including shrimp contribute to export earnings. Government programs support agricultural commercialization, irrigation, and value chain development. The country benefits from arable land availability and water resources. The sector represents opportunity for agricultural investment, agro-processing, and sustainable farming serving export markets and food security.$$,
      62, 65, 4, 'explorer'),
    ('SUR', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Suriname's mining sector is anchored by gold, bauxite, oil and gas potential, and exploration for critical minerals supporting export revenues.$$,
      $$Suriname is a significant gold producer with established mining operations, alongside bauxite/alumina production historically important to the economy. Offshore oil and gas discoveries are attracting major development investment. The country's geology supports exploration for additional minerals. Mining sector regulatory frameworks and environmental standards are evolving. Responsible resource development and community engagement are policy priorities. The sector represents substantial opportunity for gold mining expansion, oil and gas development, and mineral exploration serving export earnings and economic diversification.$$,
      70, 78, 5, 'explorer'),
    ('SUR', 'logistics_trade', 'Logistics and Trade',
      $$Suriname's logistics infrastructure includes port facilities, river transport, road networks, air connectivity, and positioning for regional trade and transshipment.$$,
      $$Suriname operates port facilities at Paramaribo serving imports, exports including minerals and agricultural products, and potential regional transshipment. River transport serves interior regions and mining sites. Road networks connect coastal areas and border regions with Guyana and French Guiana. Air connectivity through Johan Adolf Pengel International Airport serves regional and international routes. CARICOM membership supports trade integration. The sector represents opportunity for port modernization, transport infrastructure investment, and regional logistics services supporting mining and agriculture.$$,
      62, 68, 6, 'explorer'),
    ('SUR', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Suriname's tourism economy features eco-tourism, rainforest tourism, cultural diversity, heritage sites, and nature-based destination positioning.$$,
      $$Suriname offers unique tourism assets including rainforest eco-tourism, UNESCO World Heritage site Paramaribo historic center, cultural diversity reflecting indigenous, African, Asian, and European heritage, and nature-based experiences. The country positions as an eco-tourism and adventure tourism destination rather than beach tourism market. Hospitality infrastructure includes hotels in Paramaribo and eco-lodges in interior regions. River and rainforest tours attract specialized visitor segments. The sector represents opportunity for eco-tourism development, cultural tourism, and sustainable destination infrastructure serving niche international markets.$$,
      62, 68, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- GUYANA (GUY) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('GUY', 'digital_infrastructure', 'Digital Infrastructure',
      $$Guyana's digital infrastructure is expanding through fiber backbone development, mobile network coverage, e-government services, and connectivity investment supporting economic transformation.$$,
      $$Guyana is significantly expanding telecommunications infrastructure including fiber backbone networks connecting regions, mobile network coverage expansion, and submarine cable connectivity. Oil and gas sector development is driving infrastructure investment. Government e-services, digital identity programs, and smart city initiatives support modernization. ICT sector serves rapidly evolving economic landscape. Digital inclusion programs target hinterland and indigenous communities. The sector represents substantial opportunity for connectivity infrastructure, data centers, digital services, and technology adoption serving oil-driven economic growth and diversification.$$,
      62, 80, 1, 'explorer'),
    ('GUY', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Guyana's financial sector is modernizing rapidly through banking expansion, digital payment infrastructure, fintech adoption, and oil revenue management frameworks.$$,
      $$Guyana's financial sector is undergoing rapid transformation driven by oil and gas revenues, with banking sector expansion, digital payment system development, and fintech innovation. The Bank of Guyana supports digital financial services and payment modernization. Oil revenue management and sovereign wealth fund frameworks require sophisticated financial infrastructure. Remittances from Guyanese diaspora represent significant flows. The sector is positioned for substantial growth in digital banking, payment technology, financial services, and regional financial hub development leveraging resource wealth and geographic positioning.$$,
      65, 85, 2, 'explorer'),
    ('GUY', 'energy_renewables', 'Energy and Renewables',
      $$Guyana's energy sector features offshore oil and gas production, hydropower potential, renewable energy expansion, and positioning as regional energy supplier.$$,
      $$Guyana is emerging as a major offshore oil and gas producer following substantial discoveries attracting international investment and transforming the economy. The country possesses significant untapped hydropower potential for domestic generation and regional export. Renewable energy expansion including solar deployment addresses energy access and diversification. Energy sector infrastructure investment is accelerating. Regional power interconnection could enable energy export. The sector represents transformational opportunity for oil and gas development, hydropower investment, renewable energy, and regional energy hub positioning.$$,
      75, 90, 3, 'explorer'),
    ('GUY', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Guyana's agriculture includes rice, sugar, fruits, aquaculture, forestry, and agro-processing supported by extensive arable land and water resources.$$,
      $$Guyana's agricultural sector produces rice and sugar for export, alongside fruits, vegetables, aquaculture, and livestock. The country possesses extensive arable land and freshwater resources supporting agricultural expansion potential. Forestry and sustainable timber production contribute to exports. Government programs support agricultural modernization, value-added processing, and export market development. Oil wealth provides investment capital for agricultural diversification. The sector represents opportunity for commercial agriculture investment, agro-processing, aquaculture expansion, and value chain development serving export and domestic markets.$$,
      68, 72, 4, 'explorer'),
    ('GUY', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Guyana's mining sector includes gold, bauxite, diamonds, offshore oil and gas, and exploration for critical minerals supporting export-driven economy.$$,
      $$Guyana produces gold, bauxite, and diamonds with established mining operations contributing to exports. Offshore oil and gas sector is transforming the economy with major production growth expected. Geological potential exists for additional mineral resources. Mining sector regulatory frameworks are evolving to attract investment while strengthening environmental and social standards. The sector represents substantial opportunity for gold mining expansion, oil and gas development, bauxite sector revitalization, and mineral exploration leveraging favorable geology and investment climate.$$,
      75, 85, 5, 'explorer'),
    ('GUY', 'logistics_trade', 'Logistics and Trade',
      $$Guyana's logistics infrastructure includes port facilities, airport expansion, road networks, river transport, and positioning for regional trade and oil sector logistics.$$,
      $$Guyana operates port facilities at Georgetown serving imports, exports, and emerging oil and gas logistics requirements, with port expansion planned. Road infrastructure is being upgraded connecting regions and border crossings. River transport serves interior regions and mining sites. Cheddi Jagan International Airport is expanding capacity. Oil sector development drives logistics infrastructure investment. CARICOM membership supports regional trade. The sector represents significant opportunity for port development, transport infrastructure, supply base services for oil sector, and regional logistics hub development.$$,
      68, 82, 6, 'explorer'),
    ('GUY', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Guyana's tourism economy features eco-tourism, rainforest tourism, wildlife, Kaieteur Falls, cultural diversity, and sustainable destination development potential.$$,
      $$Guyana offers unique tourism assets including pristine rainforests, Kaieteur Falls, wildlife viewing, indigenous cultural experiences, and eco-tourism opportunities. The country positions as an adventure and nature-based tourism destination. Hospitality infrastructure includes hotels in Georgetown and eco-lodges in interior regions. Air connectivity is improving through regional and international routes. Oil wealth provides capital for tourism infrastructure investment. The sector represents opportunity for eco-tourism development, adventure tourism, hospitality investment, and sustainable destination infrastructure serving niche international markets and diversifying the oil-dependent economy.$$,
      65, 75, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- BELIZE (BLZ) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('BLZ', 'digital_infrastructure', 'Digital Infrastructure',
      $$Belize's digital infrastructure combines mobile networks, broadband expansion, fiber backbone development, e-government services, and regional connectivity initiatives.$$,
      $$Belize is expanding telecommunications infrastructure including mobile networks, fixed broadband, and fiber backbone connecting districts. Submarine cable systems provide international connectivity. Government e-services and digital identity programs support service delivery modernization. ICT sector serves tourism industry technology needs and financial services infrastructure. Digital inclusion programs address rural and remote area connectivity. The sector represents opportunity for connectivity expansion, digital services, and technology infrastructure serving tourism, financial services, and economic diversification.$$,
      62, 68, 1, 'explorer'),
    ('BLZ', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Belize's financial sector includes offshore services, banking infrastructure, digital payment expansion, tourism-related payment systems, and financial regulatory frameworks.$$,
      $$Belize operates offshore financial services alongside domestic banking, with expanding digital payment systems serving tourism industry and domestic commerce. The Central Bank of Belize supports digital financial services and payment modernization. Tourism sector drives payment infrastructure including card acceptance and mobile payments. Remittances from Belizean diaspora represent financial flows. The sector represents opportunity for digital banking services, payment technology, tourism fintech solutions, and financial services supporting economic activity across tourism, agriculture, and commerce.$$,
      65, 70, 2, 'explorer'),
    ('BLZ', 'energy_renewables', 'Energy and Renewables',
      $$Belize's energy sector features hydropower generation, renewable energy expansion, biomass utilization, energy import reduction, and regional power integration.$$,
      $$Belize generates electricity from hydropower, imported power from Mexico, and thermal generation, with expanding renewable energy including solar, biomass from sugar industry, and additional hydropower potential. The country participates in regional power markets. Energy sector reforms support private investment and renewable energy development. Energy independence and cost reduction are policy priorities. The sector represents opportunity for renewable energy investment, hydropower expansion, solar deployment, and climate-resilient energy infrastructure serving domestic demand and potential regional trade.$$,
      62, 70, 3, 'explorer'),
    ('BLZ', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Belize's agriculture includes sugar, citrus, bananas, papaya, aquaculture, and agro-processing serving export and domestic markets.$$,
      $$Belize's agricultural sector produces sugar, citrus fruits, bananas, and papayas for export, alongside aquaculture and livestock for domestic consumption and export. The country benefits from arable land, favorable climate, and diverse production. Government programs support agricultural commercialization, organic farming, and value-added processing. Sustainable agriculture and aquaculture represent growth areas. The sector represents opportunity for agro-processing investment, organic and certified agriculture, aquaculture expansion, and value chain development serving export markets including U.S. and Caribbean.$$,
      68, 68, 4, 'explorer'),
    ('BLZ', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Belize's mining sector includes petroleum production, aggregate extraction, and exploration for minerals and hydrocarbons supporting industrial demand.$$,
      $$Belize produces modest petroleum from onshore and shallow offshore fields, with exploration continuing for additional hydrocarbon resources. Aggregate and stone extraction supports construction demand. The country's geology has potential for mineral resources. Environmental protection including the Belize Barrier Reef influences resource development frameworks. Sustainable resource management and environmental safeguards are policy priorities. The sector represents opportunity for responsible exploration, petroleum development, and resource extraction balanced with environmental protection and tourism interests.$$,
      52, 60, 5, 'explorer'),
    ('BLZ', 'logistics_trade', 'Logistics and Trade',
      $$Belize's logistics infrastructure includes port facilities, air connectivity, road networks, border trade, and positioning for regional trade and tourism logistics.$$,
      $$Belize operates port facilities at Belize City and Big Creek serving imports, exports including agricultural products and petroleum, and cruise tourism. Air connectivity through Philip S.W. Goldson International Airport serves tourism and cargo. Road networks connect districts and border crossings with Guatemala and Mexico. CARICOM membership and proximity to Central American markets support trade. The sector represents opportunity for port modernization, transport infrastructure investment, border trade facilitation, and logistics services supporting tourism, agriculture, and regional commerce.$$,
      65, 68, 6, 'explorer'),
    ('BLZ', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Belize's tourism economy is anchored by Barrier Reef, diving, Mayan heritage sites, eco-tourism, cruise tourism, and positioning as adventure-culture Caribbean destination.$$,
      $$Belize offers world-class tourism assets including the Belize Barrier Reef (UNESCO World Heritage), Blue Hole diving site, Mayan archaeological sites, rainforest eco-tourism, and wildlife experiences. The country combines Caribbean beach and reef tourism with cultural heritage and jungle adventure tourism. Hospitality infrastructure includes beachfront resorts, jungle lodges, and boutique properties. Cruise tourism and air connectivity from North America support visitor access. Tourism is the largest foreign exchange earner. The sector represents opportunity for resort investment, eco-tourism development, and destination infrastructure supporting sustainable high-value tourism.$$,
      80, 72, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- PUERTO RICO (PRI) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('PRI', 'digital_infrastructure', 'Digital Infrastructure',
      $$Puerto Rico's digital infrastructure combines advanced telecommunications, fiber networks, data centers, cloud infrastructure, and positioning as Caribbean digital services hub.$$,
      $$Puerto Rico maintains developed telecommunications infrastructure including mobile networks, fiber broadband, submarine cable connectivity, and data center facilities supporting U.S.-integrated digital economy. The territory offers nearshore services, bilingual workforce, and U.S. legal framework. Government digital services and smart city initiatives leverage infrastructure. Hurricane resilience and infrastructure hardening are ongoing priorities. The sector represents opportunity for data center expansion, cloud services, fintech infrastructure, and digital services outsourcing serving U.S. mainland and Caribbean markets.$$,
      75, 72, 1, 'explorer'),
    ('PRI', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Puerto Rico's financial sector includes U.S.-integrated banking, fintech innovation, blockchain and crypto initiatives, payment infrastructure, and financial services hub positioning.$$,
      $$Puerto Rico operates within the U.S. financial system with banking infrastructure, payment systems, and expanding fintech ecosystem. The territory attracts blockchain and cryptocurrency initiatives through tax incentives. Financial services sector benefits from U.S. regulatory framework, bilingual talent, and Caribbean positioning. Digital payment infrastructure serves integrated economy. The sector represents opportunity for fintech innovation, blockchain services, digital banking, and financial services hub development leveraging U.S. legal framework and strategic positioning.$$,
      78, 72, 2, 'explorer'),
    ('PRI', 'energy_renewables', 'Energy and Renewables',
      $$Puerto Rico's energy sector is transitioning toward renewable energy, solar deployment, grid modernization, energy storage, and resilience following hurricane damage.$$,
      $$Puerto Rico is undergoing energy sector transformation emphasizing renewable energy including substantial solar deployment, battery storage, and microgrids following hurricane-damaged grid reconstruction. The territory targets high renewable energy penetration to reduce fossil fuel imports and enhance resilience. Private investment in generation and distribution is advancing. Grid modernization and decentralized generation address reliability. Federal funding supports infrastructure rebuilding. The sector represents significant opportunity for renewable energy investment, energy storage, grid technology, and climate-resilient energy infrastructure.$$,
      70, 82, 3, 'explorer'),
    ('PRI', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Puerto Rico's agriculture includes coffee, plantains, vegetables, livestock, and food security initiatives addressing high import dependence and supporting local production.$$,
      $$Puerto Rico's agricultural sector produces coffee, plantains, vegetables, and livestock, with substantial food imports from U.S. mainland. Government and private sector programs support agricultural revitalization, local food production, and import substitution. Value-added processing and organic agriculture target niche markets. Hurricane impacts and labor costs influence sector challenges. The sector represents opportunity for agro-processing investment, greenhouse agriculture, sustainable farming, and value chain development supporting food security and economic diversification.$$,
      62, 65, 4, 'explorer'),
    ('PRI', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Puerto Rico's mining sector is limited, with aggregate production for construction, potential mineral resources, and environmental considerations shaping development frameworks.$$,
      $$Puerto Rico has limited active mining, primarily aggregate extraction for construction demand. Historical mining including copper exists. Geological potential for minerals requires evaluation. Environmental concerns and population density influence resource development frameworks. Sustainable resource management and environmental protection are priorities. The sector represents limited traditional mining opportunity, with focus on sustainable construction materials and careful evaluation of mineral potential balanced with environmental and community considerations.$$,
      45, 50, 5, 'explorer'),
    ('PRI', 'logistics_trade', 'Logistics and Trade',
      $$Puerto Rico's logistics infrastructure includes major ports, air cargo hub, U.S. trade integration, transshipment services, and positioning as Caribbean logistics gateway.$$,
      $$Puerto Rico operates major port facilities at San Juan and Ponce serving U.S. trade including Jones Act shipping, Caribbean transshipment, and cruise tourism. Air cargo operations through Luis Muñoz Marín International Airport serve regional and mainland U.S. distribution. The territory's U.S. status facilitates trade and logistics. Road infrastructure connects ports, airports, and manufacturing zones. Hurricane recovery included logistics infrastructure rehabilitation. The sector represents opportunity for port expansion, logistics services, air cargo growth, and regional distribution hub development leveraging U.S. market access.$$,
      78, 72, 6, 'explorer'),
    ('PRI', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Puerto Rico's tourism economy is anchored by beaches, heritage sites, convention tourism, cruise tourism, U.S. market access, and recovery from hurricane impacts.$$,
      $$Puerto Rico combines beach resort infrastructure, UNESCO World Heritage sites in Old San Juan and El Morro, convention and business tourism, rainforest eco-tourism, and cultural experiences. The territory benefits from U.S. domestic travel status eliminating passport requirements for mainland visitors. Cruise tourism is substantial. Hurricane recovery has rebuilt hospitality infrastructure. Air connectivity from major U.S. cities supports visitor access. Tourism contributes significantly to employment and economic activity. The sector represents opportunity for resort investment, convention facilities, destination recovery, and tourism infrastructure development.$$,
      78, 75, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- BRITISH VIRGIN ISLANDS (VGB) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('VGB', 'digital_infrastructure', 'Digital Infrastructure',
      $$British Virgin Islands' digital infrastructure combines telecommunications networks, broadband connectivity, financial services technology infrastructure, and climate-resilient systems.$$,
      $$British Virgin Islands maintains telecommunications infrastructure including mobile networks, fiber connectivity, and submarine cable access supporting financial services industry and tourism sector. The territory's ICT sector serves offshore financial services requiring secure data and connectivity. Government digital services and e-identity programs support service delivery. Hurricane resilience and infrastructure hardening are priorities. The sector represents opportunity for fintech infrastructure, secure connectivity, data services, and climate-resilient digital infrastructure serving financial services and tourism industries.$$,
      70, 70, 1, 'explorer'),
    ('VGB', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$British Virgin Islands' financial sector is anchored by offshore financial services, corporate registry, banking infrastructure, and fintech innovation supporting international finance.$$,
      $$British Virgin Islands is a major offshore financial services center with corporate registry, banking, trust, and fund administration services. The territory maintains international financial services standards and regulatory frameworks. Digital financial services and blockchain initiatives are emerging. Financial services represent the largest economic sector. British legal framework and tax neutrality attract international business. The sector represents opportunity for fintech innovation, digital corporate services, blockchain applications, and financial services technology serving global business structuring and wealth management.$$,
      82, 70, 2, 'explorer'),
    ('VGB', 'energy_renewables', 'Energy and Renewables',
      $$British Virgin Islands' energy sector features renewable energy expansion, solar deployment, energy storage, resilience priorities, and import dependence reduction strategies.$$,
      $$British Virgin Islands relies on imported fossil fuels with expanding renewable energy including solar installations and battery storage. Multi-island geography creates energy infrastructure challenges. Hurricane resilience and climate adaptation drive energy sector planning. Government renewable energy targets aim to reduce costs and enhance energy security. Private sector investment in generation and microgrids is advancing. The sector represents opportunity for solar generation, energy storage, microgrid development, and climate-resilient energy infrastructure serving small island energy needs.$$,
      58, 72, 3, 'explorer'),
    ('VGB', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$British Virgin Islands' agriculture is limited, including fisheries, livestock, vegetables, and food security initiatives addressing high import dependence.$$,
      $$British Virgin Islands' agricultural sector is small, focused on food security, fisheries, small-scale livestock, and vegetable production for domestic consumption and tourism supply. The territory imports substantial food. Aquaculture and sustainable fisheries represent development areas. Limited arable land constrains expansion. Government programs support local food production and agricultural diversification. The sector represents limited opportunity for agriculture expansion, with focus on aquaculture, sustainable fisheries, and food security initiatives serving tourism and domestic markets.$$,
      42, 52, 4, 'explorer'),
    ('VGB', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$British Virgin Islands' mineral sector is minimal, with aggregate extraction for construction and environmental protection priorities limiting resource development.$$,
      $$British Virgin Islands has minimal mining activity, primarily aggregate extraction for construction demand. Small island geography, limited mineral resources, and environmental protection priorities constrain mining development. Marine resources and blue economy potential exist. Sustainable resource management and environmental conservation are policy priorities. The sector represents minimal traditional mining opportunity, with focus on sustainable construction materials and marine resource management supporting environmental conservation and tourism interests.$$,
      30, 40, 5, 'explorer'),
    ('VGB', 'logistics_trade', 'Logistics and Trade',
      $$British Virgin Islands' logistics infrastructure includes port facilities, air connectivity, yachting services, inter-island transport, and positioning for Caribbean maritime services.$$,
      $$British Virgin Islands operates port facilities at Road Town and throughout the territory serving cargo, cruise tourism, and yacht charter industry. Air connectivity through Terrance B. Lettsome International Airport serves regional routes. Inter-island ferry services connect the multi-island territory. Yachting and maritime services represent significant economic activity. Logistics support tourism and financial services industries. The sector represents opportunity for port modernization, air service expansion, marina infrastructure, and maritime logistics services serving Caribbean yachting and tourism.$$,
      68, 68, 6, 'explorer'),
    ('VGB', 'tourism_hospitality', 'Tourism and Hospitality',
      $$British Virgin Islands' tourism economy is anchored by yachting and sailing, beach resorts, diving, luxury positioning, and recovery from hurricane impacts.$$,
      $$British Virgin Islands is a premier Caribbean sailing and yachting destination with yacht charter fleets, marina infrastructure, and island-hopping experiences. Beach resort tourism on Tortola, Virgin Gorda, and other islands complements yachting. Diving, beaches, and boutique hospitality infrastructure attract high-value visitors. Hurricane recovery has rebuilt tourism infrastructure. Air and sea connectivity serve visitor access. Tourism is the second-largest economic sector after financial services. The sector represents opportunity for resort investment, yacht charter infrastructure, marina development, and destination recovery supporting luxury tourism positioning.$$,
      80, 75, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- TURKS AND CAICOS ISLANDS (TCA) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('TCA', 'digital_infrastructure', 'Digital Infrastructure',
      $$Turks and Caicos Islands' digital infrastructure combines telecommunications networks, broadband services, financial services technology, and multi-island connectivity.$$,
      $$Turks and Caicos Islands maintains telecommunications infrastructure including mobile networks, broadband services, and submarine cable connectivity supporting tourism industry and financial services. Multi-island geography requires inter-island connectivity investment. Government digital services support administration. ICT sector serves tourism and offshore financial services. The sector represents opportunity for enhanced connectivity, fintech infrastructure, digital services, and technology supporting tourism and financial services industries across the multi-island territory.$$,
      68, 68, 1, 'explorer'),
    ('TCA', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Turks and Caicos Islands' financial sector includes offshore financial services, banking infrastructure, digital payments serving tourism, and financial regulatory frameworks.$$,
      $$Turks and Caicos Islands operates offshore financial services including banking, insurance, and trust services alongside domestic banking serving tourism-driven economy. Digital payment infrastructure supports tourism industry including resort and retail transactions. British Overseas Territory status provides legal framework. Financial services regulation aligns with international standards. The sector represents opportunity for digital banking services, payment technology, tourism fintech solutions, and financial services supporting economic activity in tourism and offshore finance.$$,
      70, 68, 2, 'explorer'),
    ('TCA', 'energy_renewables', 'Energy and Renewables',
      $$Turks and Caicos Islands' energy sector features renewable energy expansion, solar deployment, energy storage, multi-island energy infrastructure, and resilience priorities.$$,
      $$Turks and Caicos Islands relies on imported fossil fuels with expanding solar energy deployment and battery storage. Multi-island geography creates energy infrastructure challenges requiring island-specific generation and potential inter-island systems. Hurricane resilience and climate adaptation influence energy planning. Government renewable energy targets aim for cost reduction and energy security. The sector represents opportunity for solar generation, energy storage, microgrid systems, and climate-resilient energy infrastructure serving tourism-dependent multi-island economy.$$,
      60, 72, 3, 'explorer'),
    ('TCA', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Turks and Caicos Islands' agriculture is limited, including fisheries, aquaculture, limited cultivation, and food security initiatives addressing high import dependence.$$,
      $$Turks and Caicos Islands has minimal agriculture, with fisheries including conch and lobster representing primary production. The territory imports substantial food supplies. Arid climate and limited arable land constrain agricultural expansion. Aquaculture and sustainable fisheries represent development potential. Government programs support food security and local production serving tourism supply. The sector represents limited agriculture opportunity, with focus on sustainable fisheries, aquaculture development, and food security initiatives serving tourism and domestic consumption.$$,
      45, 55, 4, 'explorer'),
    ('TCA', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Turks and Caicos Islands' mineral sector is minimal, with salt production heritage, aggregate extraction, and environmental conservation priorities.$$,
      $$Turks and Caicos Islands historically produced salt, with minimal current mining beyond aggregate extraction for construction. Small island geography and environmental protection priorities limit mining development. Marine resources and blue economy potential exist. Coral reefs and marine ecosystem conservation are policy priorities supporting tourism. The sector represents minimal traditional mining opportunity, with historical salt production heritage and focus on sustainable resource management supporting environmental conservation and tourism positioning.$$,
      35, 42, 5, 'explorer'),
    ('TCA', 'logistics_trade', 'Logistics and Trade',
      $$Turks and Caicos Islands' logistics infrastructure includes port facilities, air connectivity, inter-island transport, and positioning supporting tourism logistics.$$,
      $$Turks and Caicos Islands operates port facilities on Providenciales and Grand Turk serving cargo, cruise tourism, and inter-island transport. Air connectivity through Providenciales International Airport serves tourism from U.S. and Canadian markets. Inter-island air and sea services connect the territory. Logistics infrastructure serves tourism supply chains and import commerce. The sector represents opportunity for port modernization, air service expansion, logistics services, and tourism supply chain infrastructure supporting resort and hospitality industries.$$,
      65, 68, 6, 'explorer'),
    ('TCA', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Turks and Caicos Islands' tourism economy is anchored by luxury beach resorts, diving, pristine beaches, high-end positioning, and air connectivity from North American markets.$$,
      $$Turks and Caicos Islands is a premier luxury Caribbean beach destination featuring Grace Bay and other world-class beaches, resort infrastructure, diving and water sports, and high-end positioning. The territory attracts affluent North American visitors through direct air connectivity. Hospitality infrastructure includes luxury resorts, villas, and boutique properties. Tourism dominates the economy contributing substantially to GDP and employment. Cruise tourism supplements stay-over visitors. The sector represents substantial opportunity for resort investment, hospitality development, and destination infrastructure serving luxury tourism market.$$,
      85, 75, 7, 'explorer'),

    -- ────────────────────────────────────────────────────────────────────────
    -- CAYMAN ISLANDS (CYM) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('CYM', 'digital_infrastructure', 'Digital Infrastructure',
      $$Cayman Islands' digital infrastructure combines advanced telecommunications, fiber networks, data centers, financial services technology, and regional connectivity hub positioning.$$,
      $$Cayman Islands maintains highly developed telecommunications infrastructure including mobile networks, fiber broadband, submarine cable systems, and data center facilities supporting global financial services industry. The territory offers redundant connectivity, low latency, and secure infrastructure serving banking, fund administration, and insurance sectors. Government digital services and smart nation initiatives leverage advanced infrastructure. The sector represents opportunity for data center expansion, fintech infrastructure, cloud services, and secure connectivity serving global financial services and regional digital hub positioning.$$,
      85, 75, 1, 'explorer'),
    ('CYM', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$Cayman Islands' financial sector is a global offshore financial center with banking, fund administration, insurance, blockchain innovation, and fintech ecosystem.$$,
      $$Cayman Islands is a leading global offshore financial services center with banking, asset management, fund administration, insurance, and trust services. The territory maintains premier regulatory frameworks, political stability, and legal infrastructure. Blockchain and cryptocurrency initiatives are emerging. Financial services dominate the economy. British Overseas Territory legal framework and tax neutrality attract global capital. The sector represents substantial opportunity for fintech innovation, blockchain services, digital asset custody, fund technology, and financial services infrastructure serving global wealth management and institutional finance.$$,
      90, 72, 2, 'explorer'),
    ('CYM', 'energy_renewables', 'Energy and Renewables',
      $$Cayman Islands' energy sector features renewable energy expansion, solar deployment, energy storage, waste-to-energy, and import dependence reduction strategies.$$,
      $$Cayman Islands relies on imported fossil fuels with expanding renewable energy including solar installations, battery storage, and waste-to-energy projects. The territory targets significant renewable energy penetration to reduce costs and enhance sustainability. Energy infrastructure serves tourism and financial services industries requiring reliability. Government renewable energy frameworks support private investment. The sector represents opportunity for solar generation, energy storage, microgrid development, and clean energy infrastructure serving high-value tourism and financial services sectors.$$,
      68, 75, 3, 'explorer'),
    ('CYM', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$Cayman Islands' agriculture is limited, including aquaculture, limited cultivation, fisheries, and food security initiatives addressing high import dependence.$$,
      $$Cayman Islands has minimal agriculture, with aquaculture including turtle farming, limited vegetable cultivation, and fisheries. The territory imports substantial food serving tourism and resident populations. Land scarcity and tourism focus constrain agricultural expansion. Sustainable fisheries and aquaculture represent niche opportunities. Government programs support food security and local production. The sector represents limited agriculture opportunity, with focus on aquaculture, sustainable fisheries, and specialty food production serving luxury tourism and domestic markets.$$,
      48, 55, 4, 'explorer'),
    ('CYM', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$Cayman Islands' mineral sector is minimal, with limited aggregate extraction and environmental conservation priorities preventing significant resource development.$$,
      $$Cayman Islands has minimal mining activity beyond limited aggregate extraction for construction demand. Small island geography, lack of significant mineral resources, and environmental protection priorities constrain mining. Marine resources and blue economy potential exist within sustainable frameworks. Coral reef and marine ecosystem conservation support tourism positioning. The sector represents minimal traditional mining opportunity, with focus on sustainable construction materials and marine resource management aligned with environmental conservation and tourism interests.$$,
      32, 40, 5, 'explorer'),
    ('CYM', 'logistics_trade', 'Logistics and Trade',
      $$Cayman Islands' logistics infrastructure includes port facilities, air connectivity, financial services logistics, and positioning as Caribbean business and tourism gateway.$$,
      $$Cayman Islands operates port facilities on Grand Cayman serving cargo, cruise tourism, and yacht services. Air connectivity through Owen Roberts International Airport provides extensive international routes serving financial services and tourism industries. Logistics infrastructure supports high-value imports, financial services business travel, and tourism supply chains. The territory's strategic positioning and infrastructure support business and tourism connectivity. The sector represents opportunity for port modernization, air service expansion, logistics services, and business aviation infrastructure serving financial services and luxury tourism.$$,
      75, 70, 6, 'explorer'),
    ('CYM', 'tourism_hospitality', 'Tourism and Hospitality',
      $$Cayman Islands' tourism economy combines beach resorts, diving including Stingray City, cruise tourism, luxury positioning, and diversified North American connectivity.$$,
      $$Cayman Islands is a premier Caribbean destination featuring Seven Mile Beach, world-class diving including Stingray City, luxury resort infrastructure, and cruise tourism on Grand Cayman. The territory attracts affluent visitors through extensive air connectivity from North American markets. Hospitality infrastructure includes luxury resorts, condominiums, and boutique properties. Tourism is the second-largest economic sector after financial services. Sister islands Cayman Brac and Little Cayman offer boutique tourism. The sector represents opportunity for resort investment, hospitality development, and destination infrastructure serving luxury tourism and cruise markets.$$,
      85, 72, 7, 'explorer')

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
