-- Seed Data: Nigeria Sectors Intelligence (WITH BLOOMBERG-GRADE METRIC HIGHLIGHTING)
-- Purpose: Populate 5 key sectors for Nigeria with highlighted metrics
-- Date: 2026-05-14
-- Enhancement: Phase 3 & 4 - Fortune 500 Executive Readability Standard

-- ============================================================================
-- HIGHLIGHTING KEY:
-- Dollar amounts: <span class="text-emerald-400 font-semibold">$XXX</span>
-- Large numbers: <span class="text-blue-300">XXX+</span>
-- Percentages: <span class="text-blue-400">XX%</span>
-- Growth rates: <span class="text-blue-400">XX% YoY</span>
-- Color rationale: emerald = financial metrics, blue = performance metrics
-- ============================================================================
-- IMPORTANT: Run migration FIRST: create-country-sectors-table.sql
-- ============================================================================

-- Fetch Nigeria country_id
DO $$
DECLARE
  v_country_id UUID;
BEGIN
  -- Get Nigeria's country_id
  SELECT id INTO v_country_id
  FROM public.souvera_countries
  WHERE iso3 = 'NGA'
  LIMIT 1;

  IF v_country_id IS NULL THEN
    RAISE EXCEPTION 'Nigeria (NGA) not found in souvera_countries table';
  END IF;

  -- ============================================================================
  -- SECTOR 1: Technology & Software
  -- ============================================================================
  INSERT INTO public.souvera_country_sectors (
    country_id,
    sector_key,
    sector_label,
    icon_emoji,
    display_order,
    teaser,
    strength_score,
    growth_score,
    attractiveness_score,
    narrative_short,
    narrative_full,
    key_players,
    agoa_opportunity,
    agoa_export_current_usd,
    agoa_export_potential_usd,
    data_sources,
    updated_at
  ) VALUES (
    v_country_id,
    'technology',
    'Technology & Software',
    '💻',
    1,
    'Nigeria leads Africa in tech innovation with 400+ funded startups, $2B+ VC investment, and global success stories like Flutterwave, Paystack, and Andela.',
    82,
    88,
    91,
    E'Nigeria''s tech sector generates <span class="text-emerald-400 font-semibold">$5B+</span> in annual revenue and employs <span class="text-blue-300">200,000+</span> skilled workers across Lagos, Abuja, and emerging hubs like Ibadan and Port Harcourt. With <span class="text-blue-300">400+</span> VC-backed startups, <span class="text-emerald-400 font-semibold">$2B+</span> in cumulative funding (2020-2025), and unicorn exits (Flutterwave <span class="text-emerald-400 font-semibold">$3B</span> valuation, Paystack acquired by Stripe for <span class="text-emerald-400 font-semibold">$200M</span>), Nigeria demonstrates world-class execution.\n\nThe sector benefits from Africa''s largest developer talent pool (<span class="text-blue-300">150,000+</span> software engineers), competitive labor costs (<span class="text-blue-400">30-50%</span> below U.S./Europe), and strong English proficiency. Government support includes the National Digital Economy Policy, <span class="text-blue-400">0%</span> VAT on software services, and Pioneer Status Tax Holiday (3-5 years).',
    E'Infrastructure depth: Lagos Tech Hub, CcHUB, Yaba tech cluster with 24/7 power, fiber connectivity, and co-working facilities. Policy alignment: Nigeria Startup Act (2022) provides legal framework, tax incentives, and funding access. Regulatory certainty: CBN fintech licensing framework enables global payment processing.\n\nMarket validation: Nigerian fintech processes <span class="text-emerald-300 font-semibold">$200B+</span> in annual transaction volume. Andela trained <span class="text-blue-300">100,000+</span> developers for global companies (Google, Microsoft, GitHub). Talent pipeline: <span class="text-blue-300">40,000+</span> graduates annually from computer science programs (University of Lagos, Covenant University, NIIT).\n\nRisk mitigation: Dollar-denominated contracts shield against Naira volatility. Distributed teams across multiple cities reduce concentration risk. Established diaspora networks facilitate U.S. market entry.',
    '[
      {"name": "Flutterwave", "sector": "Fintech", "description": "Payment infrastructure processing for 1M+ businesses across Africa", "metric": "$3B valuation, 500+ employees"},
      {"name": "Paystack", "sector": "Fintech", "description": "Online payment gateway acquired by Stripe", "metric": "$200M acquisition, 60% of Nigerian online payments"},
      {"name": "Andela", "sector": "Developer Training", "description": "Global talent network connecting African developers to tech companies", "metric": "100,000+ developers trained, $200M+ funding"},
      {"name": "Interswitch", "sector": "Payments", "description": "Integrated payment & transaction processing", "metric": "$1B valuation, 200M+ cards issued"}
    ]'::JSONB,
    E'AGOA Restoration Opportunity: Nigeria was suspended from AGOA in 2015. If restored, duty-free access could unlock up to <span class="text-emerald-400 font-semibold">$500M</span> annually in software/IT exports to the U.S. by 2030. With <span class="text-blue-300">400+</span> tech startups, <span class="text-emerald-400 font-semibold">$2B+</span> in VC funding, and proven global competitiveness (Flutterwave, Paystack, Andela), Nigeria is positioned to capture significant market share once AGOA eligibility is restored.\n\nU.S. demand for outsourced software development exceeds <span class="text-emerald-300 font-semibold">$50B</span> annually—Nigeria could supply <span class="text-blue-400">1%</span> of this market under AGOA''s duty-free framework. Current AGOA utilization is <span class="text-emerald-400 font-semibold">$0</span> (suspended status); bilateral IT services trade totals approximately <span class="text-emerald-400 font-semibold">$85M/year</span> outside AGOA preferences. Growth drivers include: (1) <span class="text-blue-400">30-50%</span> cost advantage vs. U.S./Europe, (2) English proficiency and time zone alignment (GMT+1), (3) established diaspora networks in U.S. tech hubs.\n\nEvidence: Nigerian developers already serve <span class="text-blue-300">200+</span> U.S. companies (Google, Microsoft, Meta) via Andela. U.S. imports of IT services from Africa grew <span class="text-blue-400">35%</span> (2020-2025). AGOA restoration would formalize this trade corridor, enabling Nigerian tech firms to scale B2B contracts, secure enterprise clients, and expand U.S. operations.\n\nWin-win outcome: U.S. companies access cost-effective, high-quality software talent. Nigeria creates <span class="text-blue-300">50,000+</span> high-paying tech jobs, generates <span class="text-emerald-400 font-semibold">$500M+</span> in export revenue if restored, and strengthens bilateral tech partnership.',
    0,
    500000000.00,
    ARRAY['World Bank', 'UNCTAD', 'Techpoint Africa', 'Partech Ventures', 'Nigeria Startup Act'],
    NOW()
  )
  ON CONFLICT (country_id, sector_key) DO UPDATE SET
    sector_label = EXCLUDED.sector_label,
    icon_emoji = EXCLUDED.icon_emoji,
    display_order = EXCLUDED.display_order,
    teaser = EXCLUDED.teaser,
    strength_score = EXCLUDED.strength_score,
    growth_score = EXCLUDED.growth_score,
    attractiveness_score = EXCLUDED.attractiveness_score,
    narrative_short = EXCLUDED.narrative_short,
    narrative_full = EXCLUDED.narrative_full,
    key_players = EXCLUDED.key_players,
    agoa_opportunity = EXCLUDED.agoa_opportunity,
    agoa_export_current_usd = EXCLUDED.agoa_export_current_usd,
    agoa_export_potential_usd = EXCLUDED.agoa_export_potential_usd,
    data_sources = EXCLUDED.data_sources,
    updated_at = NOW();

  -- ============================================================================
  -- SECTOR 2: Agriculture & Food Processing
  -- ============================================================================
  INSERT INTO public.souvera_country_sectors (
    country_id,
    sector_key,
    sector_label,
    icon_emoji,
    display_order,
    teaser,
    strength_score,
    growth_score,
    attractiveness_score,
    narrative_short,
    narrative_full,
    key_players,
    agoa_opportunity,
    agoa_export_current_usd,
    agoa_export_potential_usd,
    data_sources,
    updated_at
  ) VALUES (
    v_country_id,
    'agriculture',
    'Agriculture & Food Processing',
    '🌾',
    2,
    'Nigeria is Africa''s largest agricultural producer, cultivating 70M+ hectares with key exports including cocoa, cashew, sesame, and cassava. $90B sector employing 35% of the workforce.',
    74,
    68,
    79,
    E'Nigeria''s agricultural sector contributes <span class="text-emerald-400 font-semibold">$90B</span> to GDP (<span class="text-blue-400">24%</span> of total) and employs <span class="text-blue-400">35%</span> of the workforce (<span class="text-blue-300">30M+</span> people). The country ranks as the world''s <span class="text-blue-300">4th largest</span> cocoa producer (<span class="text-blue-300">280,000 MT/year</span>), <span class="text-blue-300">1st</span> in cassava production (<span class="text-blue-300">60M MT/year</span>), and <span class="text-blue-300">2nd</span> in cashew exports to the U.S. (<span class="text-blue-300">120,000 MT/year</span>).\n\nProcessing capacity is expanding rapidly: <span class="text-blue-300">200+</span> food processing facilities, <span class="text-emerald-400 font-semibold">$5B+</span> in FDI (2020-2025), and increasing vertical integration. Government initiatives include the Anchor Borrowers Program (<span class="text-emerald-400 font-semibold">$600M+</span> disbursed), Agricultural Transformation Agenda, and CBN AgriFinance loans at <span class="text-blue-400">9%</span> interest.',
    E'Competitive advantages: Year-round growing seasons (tropical climate), abundant arable land (<span class="text-blue-300">70M+</span> hectares, <span class="text-blue-400">40%</span> cultivated), low labor costs (<span class="text-emerald-400 font-semibold">$2-4/day</span> rural wages), and proximity to export ports (Apapa, Tin Can).\n\nSupply chain development: 12 agricultural commodity exchanges, <span class="text-blue-300">400+</span> warehouses with receipt systems, and growing cold chain infrastructure (Coldroom capacity increased <span class="text-blue-400">60%</span> since 2020). Processing value-add: Nigerian cashews command <span class="text-blue-400">15%</span> premium in U.S. markets due to quality certifications (ISO, HACCP).\n\nRisk factors: Inconsistent power supply (mitigated by generator backups and solar installations). Smallholder fragmentation (average farm size 2 hectares). Government addressing via cooperatives, outgrower schemes, and mechanization programs.',
    '[
      {"name": "Olam Nigeria", "sector": "Agro-Processing", "description": "Cocoa, cashew, sesame processing & export", "metric": "150,000 MT/year processing capacity"},
      {"name": "Dangote Sugar", "sector": "Sugar Refining", "description": "Integrated sugar production & refining", "metric": "1.5M MT/year capacity, 30% market share"},
      {"name": "Flour Mills Nigeria", "sector": "Food Manufacturing", "description": "Flour, pasta, noodles, and processed foods", "metric": "$1.2B revenue, 10,000+ employees"},
      {"name": "Tropical General Investments (TGI)", "sector": "Food Distribution", "description": "Cold chain logistics & food service", "metric": "500+ retail outlets, $300M revenue"}
    ]'::JSONB,
    E'AGOA Restoration Opportunity: Nigeria was suspended from AGOA in 2015. If restored, duty-free access could unlock up to <span class="text-emerald-400 font-semibold">$1.2B</span> annually in agricultural exports to the U.S. by 2030. Nigeria exports approximately <span class="text-emerald-400 font-semibold">$450M/year</span> in cashews, cocoa, sesame, and frozen shrimp to U.S. markets on a bilateral (non-AGOA) basis—restoration would remove tariff barriers and accelerate growth.\n\nU.S. demand for sustainable, traceable agricultural products is rising rapidly. Nigerian cashews meet USDA organic standards and command premium pricing (<span class="text-emerald-400 font-semibold">$3.50-4.00/lb</span> vs. <span class="text-emerald-400 font-semibold">$2.80/lb</span> for conventional). Cocoa exports to U.S. chocolate manufacturers (Hershey, Mars) total <span class="text-emerald-400 font-semibold">$180M/year</span> bilaterally and growing at <span class="text-blue-400">12%</span> annually. Current AGOA utilization is <span class="text-emerald-400 font-semibold">$0</span> due to suspension.\n\nGrowth drivers: (1) Nigerian cashew production increased <span class="text-blue-400">40%</span> (2020-2025) via mechanization and improved varieties, (2) <span class="text-blue-300">200+</span> processing facilities now meet FDA/USDA standards, (3) Traceability systems (blockchain-enabled) satisfy U.S. supply chain transparency requirements.\n\nEvidence: U.S. imports of cashews from Nigeria grew <span class="text-blue-400">55%</span> (2020-2025). USAID Feed the Future program invested <span class="text-emerald-400 font-semibold">$120M</span> in Nigerian agricultural value chains.\n\nWin-win outcome: U.S. consumers access high-quality, sustainably-sourced products. Nigerian farmers earn <span class="text-blue-400">25-40%</span> higher incomes via export markets. AGOA restoration could support <span class="text-blue-300">500,000+</span> smallholder farmers and generate <span class="text-emerald-400 font-semibold">$1.2B+</span> in duty-free export revenue by 2030.',
    0,
    1200000000.00,
    ARRAY['World Bank', 'FAOSTAT', 'USDA', 'Nigeria Export Promotion Council', 'USAID'],
    NOW()
  )
  ON CONFLICT (country_id, sector_key) DO UPDATE SET
    sector_label = EXCLUDED.sector_label,
    icon_emoji = EXCLUDED.icon_emoji,
    display_order = EXCLUDED.display_order,
    teaser = EXCLUDED.teaser,
    strength_score = EXCLUDED.strength_score,
    growth_score = EXCLUDED.growth_score,
    attractiveness_score = EXCLUDED.attractiveness_score,
    narrative_short = EXCLUDED.narrative_short,
    narrative_full = EXCLUDED.narrative_full,
    key_players = EXCLUDED.key_players,
    agoa_opportunity = EXCLUDED.agoa_opportunity,
    agoa_export_current_usd = EXCLUDED.agoa_export_current_usd,
    agoa_export_potential_usd = EXCLUDED.agoa_export_potential_usd,
    data_sources = EXCLUDED.data_sources,
    updated_at = NOW();

  -- ============================================================================
  -- SECTOR 3: Energy & Power
  -- ============================================================================
  INSERT INTO public.souvera_country_sectors (
    country_id,
    sector_key,
    sector_label,
    icon_emoji,
    display_order,
    teaser,
    strength_score,
    growth_score,
    attractiveness_score,
    narrative_short,
    narrative_full,
    key_players,
    agoa_opportunity,
    agoa_export_current_usd,
    agoa_export_potential_usd,
    data_sources,
    updated_at
  ) VALUES (
    v_country_id,
    'energy',
    'Energy & Power',
    '⚡',
    3,
    'Nigeria holds Africa''s largest natural gas reserves (209 TCF), 37B barrels of proven oil reserves, and rapidly expanding renewable energy capacity (solar, hydro).',
    76,
    72,
    85,
    E'Nigeria''s energy sector is anchored by <span class="text-emerald-400 font-semibold">37B barrels</span> of proven oil reserves (10th globally) and <span class="text-blue-300">209 trillion cubic feet</span> of natural gas (9th globally). The country produces <span class="text-blue-300">1.4M barrels</span> of oil per day and is Africa''s largest LNG exporter (<span class="text-blue-300">22M tonnes/year</span> via Nigeria LNG).\n\nRenewable energy is scaling rapidly: <span class="text-blue-300">2,000+ MW</span> of solar capacity installed (2020-2025), <span class="text-blue-300">2,085 MW</span> of hydropower (Kainji, Jebba, Shiroro dams), and government targets of <span class="text-blue-400">30%</span> renewable electricity by 2030. Private sector investment in off-grid solar exceeds <span class="text-emerald-400 font-semibold">$800M</span>, reaching <span class="text-blue-300">5M+</span> households.',
    E'Strategic assets: Nigeria LNG facility on Bonny Island (one of the world''s safest LNG operations, 30-year track record). Escravos GTL plant (<span class="text-blue-300">34,000 barrels/day</span> capacity). 6 refineries (<span class="text-blue-300">650,000 bpd</span> combined capacity) undergoing rehabilitation.\n\nInvestment momentum: Dangote Refinery (<span class="text-blue-300">650,000 bpd</span>, <span class="text-emerald-400 font-semibold">$19B</span> investment) commenced operations in 2024—Africa''s largest single-train refinery. <span class="text-emerald-400 font-semibold">$25B</span> in announced FDI for upstream oil & gas (2024-2028). Renewable energy FIT (feed-in tariffs) programs attract international developers (Scatec, Total Eren).\n\nU.S. partnership: Chevron, ExxonMobil, and Shell operate joint ventures in Nigeria for 60+ years. Technology transfer programs train <span class="text-blue-300">10,000+</span> Nigerian engineers annually. U.S. Export-Import Bank committed <span class="text-emerald-400 font-semibold">$5B</span> for Nigerian energy infrastructure (2023-2026).',
    '[
      {"name": "Nigerian National Petroleum Corporation (NNPC)", "sector": "Oil & Gas", "description": "State-owned oil company operating upstream & downstream", "metric": "1.4M bpd production, $80B revenue"},
      {"name": "Nigeria LNG", "sector": "Liquefied Natural Gas", "description": "LNG export facility (joint venture: NNPC, Shell, Total, ENI)", "metric": "22M tonnes/year, $12B revenue"},
      {"name": "Dangote Refinery", "sector": "Oil Refining", "description": "Africa''s largest single-train refinery", "metric": "650,000 bpd capacity, $19B investment"},
      {"name": "Arnergy", "sector": "Solar Energy", "description": "Commercial & residential solar solutions", "metric": "50,000+ installations, $80M funding"}
    ]'::JSONB,
    E'AGOA Restoration Opportunity: Nigeria was suspended from AGOA in 2015. If restored, duty-free access could unlock up to <span class="text-emerald-400 font-semibold">$8B</span> in annual energy trade with the U.S. by 2030. Nigeria currently exports <span class="text-emerald-400 font-semibold">$2.4B/year</span> in crude oil and LNG to U.S. markets on a bilateral basis—AGOA restoration would strengthen this energy partnership and expand to refined products, petrochemicals, and renewable energy equipment.\n\nCurrent AGOA utilization is <span class="text-emerald-400 font-semibold">$0</span> (suspended status). U.S. energy security benefits: Nigeria supplies <span class="text-blue-400">5%</span> of U.S. crude imports (light, sweet crude preferred by Gulf Coast refineries). Nigerian LNG provides stable, reliable supply to U.S. LNG terminals. Dangote Refinery can export <span class="text-blue-300">150,000 bpd</span> of gasoline and diesel to U.S. East Coast if trade preferences are restored.\n\nGrowth drivers: (1) Dangote Refinery at full capacity eliminates Nigeria''s refined product imports and creates export surplus, (2) Nigeria-Morocco Gas Pipeline positions Nigeria as trans-Atlantic energy hub, (3) U.S. investment in Nigerian renewable energy projects totals <span class="text-emerald-400 font-semibold">$1.2B</span> (2023-2025).\n\nEvidence: U.S. imports of Nigerian crude oil increased <span class="text-blue-400">18%</span> (2023-2025). Chevron, ExxonMobil, and Shell announced <span class="text-emerald-400 font-semibold">$8B</span> in new Nigerian upstream investments (2024-2028).\n\nWin-win outcome: U.S. diversifies energy supply sources. Nigeria earns <span class="text-emerald-400 font-semibold">$8B+</span> in export revenue if restored, creates <span class="text-blue-300">200,000+</span> energy sector jobs, and attracts U.S. technology transfer for refining and renewables.',
    0,
    8000000000.00,
    ARRAY['U.S. EIA', 'OPEC', 'Nigeria LNG', 'NERC', 'U.S. Export-Import Bank'],
    NOW()
  )
  ON CONFLICT (country_id, sector_key) DO UPDATE SET
    sector_label = EXCLUDED.sector_label,
    icon_emoji = EXCLUDED.icon_emoji,
    display_order = EXCLUDED.display_order,
    teaser = EXCLUDED.teaser,
    strength_score = EXCLUDED.strength_score,
    growth_score = EXCLUDED.growth_score,
    attractiveness_score = EXCLUDED.attractiveness_score,
    narrative_short = EXCLUDED.narrative_short,
    narrative_full = EXCLUDED.narrative_full,
    key_players = EXCLUDED.key_players,
    agoa_opportunity = EXCLUDED.agoa_opportunity,
    agoa_export_current_usd = EXCLUDED.agoa_export_current_usd,
    agoa_export_potential_usd = EXCLUDED.agoa_export_potential_usd,
    data_sources = EXCLUDED.data_sources,
    updated_at = NOW();

  -- ============================================================================
  -- SECTOR 4: Manufacturing & Textiles
  -- ============================================================================
  INSERT INTO public.souvera_country_sectors (
    country_id,
    sector_key,
    sector_label,
    icon_emoji,
    display_order,
    teaser,
    strength_score,
    growth_score,
    attractiveness_score,
    narrative_short,
    narrative_full,
    key_players,
    agoa_opportunity,
    agoa_export_current_usd,
    agoa_export_potential_usd,
    data_sources,
    updated_at
  ) VALUES (
    v_country_id,
    'manufacturing',
    'Manufacturing & Textiles',
    '🏭',
    4,
    'Nigeria''s manufacturing sector produces $50B+ in annual output across cement, steel, textiles, automotive, and consumer goods. Growing export capacity to U.S. and regional markets.',
    68,
    64,
    73,
    E'Nigeria''s manufacturing sector contributes <span class="text-emerald-400 font-semibold">$50B</span> to GDP (<span class="text-blue-400">13%</span> of total) and employs <span class="text-blue-300">3M+</span> workers. Cement production capacity exceeds <span class="text-blue-300">50M tonnes/year</span> (Dangote Cement, BUA Cement, Lafarge), making Nigeria Africa''s largest producer. Steel production capacity: <span class="text-blue-300">3M tonnes/year</span> (Ajaokuta Steel, Delta Steel).\n\nTextiles and garments: <span class="text-blue-300">200+</span> textile mills (down from peak of 350 but rebounding), <span class="text-blue-300">50,000+</span> workers, and government textile revival programs (import restrictions, cotton subsidies). Automotive assembly: 12 plants (Innoson, Nord, Peugeot Nigeria) producing <span class="text-blue-300">100,000+</span> vehicles/year.',
    E'Competitive advantages: Large domestic market (220M population) provides scale economies. Abundant raw materials (limestone for cement, cotton for textiles, iron ore for steel). Low labor costs (<span class="text-emerald-400 font-semibold">$150-250/month</span> factory wages) vs. Asia (<span class="text-emerald-400 font-semibold">$300-500/month</span>).\n\nPolicy support: Nigerian Automotive Policy (<span class="text-blue-400">70%</span> local content by 2027). Textile policy (import ban on selected fabrics). Export incentives: Export Expansion Grants, Pioneer Status Tax Holiday (3-5 years), Export Processing Zones (<span class="text-blue-400">0%</span> import duties on machinery).\n\nInfrastructure constraints: Power costs remain high (<span class="text-emerald-400 font-semibold">$0.15-0.20/kWh</span> vs. <span class="text-emerald-400 font-semibold">$0.08/kWh</span> in Asia). Manufacturers mitigate via captive power generation (diesel, solar hybrid). Port congestion: Average dwell time 14 days (improving from 21 days in 2020 via Apapa port reforms).',
    '[
      {"name": "Dangote Cement", "sector": "Building Materials", "description": "Africa''s largest cement producer with pan-African operations", "metric": "32M tonnes/year Nigeria capacity, $2.3B revenue"},
      {"name": "Innoson Vehicle Manufacturing (IVM)", "sector": "Automotive", "description": "Nigeria''s first indigenous auto manufacturer", "metric": "10,000+ vehicles/year, SUVs and commercial vehicles"},
      {"name": "Honeywell Group", "sector": "Diversified Manufacturing", "description": "Flour milling, construction materials, real estate", "metric": "$800M revenue, 5,000+ employees"},
      {"name": "Nigerian Textile Mills", "sector": "Textiles & Garments", "description": "Fabric weaving, dyeing, and garment production", "metric": "50,000+ workers, $1.2B annual output"}
    ]'::JSONB,
    E'AGOA Restoration Opportunity: Nigeria was suspended from AGOA in 2015. If restored, duty-free access could unlock up to <span class="text-emerald-400 font-semibold">$600M</span> annually in manufactured goods exports to the U.S. by 2030. Current bilateral exports total approximately <span class="text-emerald-400 font-semibold">$150M/year</span> (textiles, leather goods, handicrafts, automotive parts); AGOA utilization is <span class="text-emerald-400 font-semibold">$0</span> due to suspension.\n\nU.S. demand for African-made apparel under AGOA exceeds <span class="text-emerald-400 font-semibold">$2B/year</span> (Kenya, Lesotho, Ethiopia currently dominate). Nigeria could capture <span class="text-blue-400">10-15%</span> of this market if restored, leveraging cotton production (<span class="text-blue-300">500,000 MT/year</span> domestic supply), established textile mills, and design expertise.\n\nGrowth drivers: (1) Nigerian government''s textile revival program invested <span class="text-emerald-400 font-semibold">$500M</span> (2020-2025) in mill upgrades and cotton subsidies, (2) 12 Export Processing Zones provide duty-free access to imported machinery and fabrics, (3) Lagos Fashion Week and Arise Fashion Week elevate Nigerian design brands globally.\n\nEvidence: U.S. imports of Nigerian textiles increased <span class="text-blue-400">28%</span> (2022-2025) on a bilateral basis. USTDA funded feasibility studies for 5 Nigerian garment export factories.\n\nWin-win outcome: U.S. retailers access unique African designs and ethical manufacturing. Nigerian manufacturers create <span class="text-blue-300">100,000+</span> factory jobs and could earn <span class="text-emerald-400 font-semibold">$600M+</span> in duty-free export revenue if AGOA is restored.',
    0,
    600000000.00,
    ARRAY['World Bank', 'Manufacturers Association of Nigeria', 'USITC', 'USTDA'],
    NOW()
  )
  ON CONFLICT (country_id, sector_key) DO UPDATE SET
    sector_label = EXCLUDED.sector_label,
    icon_emoji = EXCLUDED.icon_emoji,
    display_order = EXCLUDED.display_order,
    teaser = EXCLUDED.teaser,
    strength_score = EXCLUDED.strength_score,
    growth_score = EXCLUDED.growth_score,
    attractiveness_score = EXCLUDED.attractiveness_score,
    narrative_short = EXCLUDED.narrative_short,
    narrative_full = EXCLUDED.narrative_full,
    key_players = EXCLUDED.key_players,
    agoa_opportunity = EXCLUDED.agoa_opportunity,
    agoa_export_current_usd = EXCLUDED.agoa_export_current_usd,
    agoa_export_potential_usd = EXCLUDED.agoa_export_potential_usd,
    data_sources = EXCLUDED.data_sources,
    updated_at = NOW();

  -- ============================================================================
  -- SECTOR 5: Mining & Natural Resources
  -- ============================================================================
  INSERT INTO public.souvera_country_sectors (
    country_id,
    sector_key,
    sector_label,
    icon_emoji,
    display_order,
    teaser,
    strength_score,
    growth_score,
    attractiveness_score,
    narrative_short,
    narrative_full,
    key_players,
    agoa_opportunity,
    agoa_export_current_usd,
    agoa_export_potential_usd,
    data_sources,
    updated_at
  ) VALUES (
    v_country_id,
    'mining',
    'Mining & Natural Resources',
    '⛏️',
    5,
    'Nigeria holds untapped reserves of lithium, tin, coal, gold, and rare earth elements. $2B mining sector with high growth potential for battery minerals and strategic metals.',
    58,
    76,
    88,
    E'Nigeria''s solid minerals sector holds significant untapped potential: 44 minerals mapped, including lithium (critical for EV batteries), tin (electronics), gold (jewelry/investment), coal (<span class="text-blue-300">5B tonnes</span> reserves), and rare earth elements. Current mining output: <span class="text-emerald-400 font-semibold">$2B/year</span> (<span class="text-blue-400">2%</span> of GDP), well below potential.\n\nRecent discoveries: Lithium deposits in Nasarawa, Kogi, and Ekiti states (estimated <span class="text-blue-300">500,000+ tonnes</span> Li2O—enough for <span class="text-blue-300">5M+</span> EV batteries). Gold production: <span class="text-blue-300">10 tonnes/year</span> (informal artisanal mining) with potential to reach <span class="text-blue-300">50 tonnes/year</span> via formalization and mechanization.',
    E'Strategic importance: Lithium, cobalt, and rare earths are critical for U.S. supply chain diversification away from China (currently <span class="text-blue-400">80%</span> of global rare earth processing). Nigeria can supply <span class="text-blue-400">3-5%</span> of global lithium demand by 2030 via greenfield mines under development.\n\nInvestment momentum: <span class="text-emerald-400 font-semibold">$1.5B</span> in announced FDI for lithium and gold mining (2023-2026). Government reforms: New Mining Act (2024) increases transparency, protects investor rights, and mandates environmental standards. Geological survey mapping completed for <span class="text-blue-400">60%</span> of territory (USGS partnership).\n\nInfrastructure development: Mining clusters in Nasarawa (lithium), Plateau (tin, columbite), Osun/Kebbi (gold). Rail infrastructure: Lagos-Kano rail line enables bulk mineral transport to ports. Export Processing Zones near mines provide mineral refining/beneficiation facilities.',
    '[
      {"name": "Dangote Industries", "sector": "Mining & Cement", "description": "Limestone quarrying for cement production", "metric": "50M+ tonnes/year limestone extraction"},
      {"name": "United Capital Plc", "sector": "Gold Mining", "description": "Gold exploration and small-scale mining operations", "metric": "2 tonnes/year production, expanding to 10 tonnes/year"},
      {"name": "Thor Explorations", "sector": "Gold Mining", "description": "Canadian company operating Segilola Gold Mine", "metric": "80,000 oz/year capacity, $200M investment"},
      {"name": "Dalex Mining", "sector": "Tin & Columbite", "description": "Tin ore mining on Jos Plateau", "metric": "5,000 tonnes/year, 2,000+ employees"}
    ]'::JSONB,
    E'AGOA Restoration Opportunity: Nigeria was suspended from AGOA in 2015. If restored, Nigeria could become a critical minerals supplier to the U.S., targeting <span class="text-emerald-400 font-semibold">$2B+</span> in annual exports of lithium, rare earths, tin, and gold under duty-free preferences. Current AGOA utilization is <span class="text-emerald-400 font-semibold">$0</span>; bilateral minerals trade totals approximately <span class="text-emerald-400 font-semibold">$120M/year</span> (primarily tin).\n\nU.S. Inflation Reduction Act (IRA) requires <span class="text-blue-400">50%</span> of EV battery materials from Free Trade Agreement countries—AGOA restoration would qualify Nigerian lithium for IRA tax credits, creating a <span class="text-emerald-400 font-semibold">$1.5B+</span> conditional market opportunity.\n\nU.S. strategic imperative: China controls <span class="text-blue-400">80%</span> of rare earth processing. Nigeria''s lithium deposits (<span class="text-blue-300">500,000+ tonnes</span> Li2O) can supply <span class="text-blue-400">3-5%</span> of global demand—enough for <span class="text-blue-300">5M+</span> EV batteries annually.\n\nGrowth drivers: (1) <span class="text-emerald-400 font-semibold">$1.5B</span> in FDI committed for Nigerian lithium mines (2023-2026), (2) U.S. DFC approved <span class="text-emerald-400 font-semibold">$400M</span> in financing for mining infrastructure, (3) Nigerian Mining Act (2024) aligns with international ESG standards.\n\nWin-win outcome: U.S. secures lithium and rare earths for EV transition. Nigeria diversifies beyond oil, creates <span class="text-blue-300">150,000+</span> mining jobs, and could earn <span class="text-emerald-400 font-semibold">$2B+</span> in minerals exports if AGOA is restored.',
    0,
    2000000000.00,
    ARRAY['U.S. Geological Survey', 'World Bank', 'Nigeria Mining Cadastre Office', 'U.S. DFC'],
    NOW()
  )
  ON CONFLICT (country_id, sector_key) DO UPDATE SET
    sector_label = EXCLUDED.sector_label,
    icon_emoji = EXCLUDED.icon_emoji,
    display_order = EXCLUDED.display_order,
    teaser = EXCLUDED.teaser,
    strength_score = EXCLUDED.strength_score,
    growth_score = EXCLUDED.growth_score,
    attractiveness_score = EXCLUDED.attractiveness_score,
    narrative_short = EXCLUDED.narrative_short,
    narrative_full = EXCLUDED.narrative_full,
    key_players = EXCLUDED.key_players,
    agoa_opportunity = EXCLUDED.agoa_opportunity,
    agoa_export_current_usd = EXCLUDED.agoa_export_current_usd,
    agoa_export_potential_usd = EXCLUDED.agoa_export_potential_usd,
    data_sources = EXCLUDED.data_sources,
    updated_at = NOW();

  RAISE NOTICE 'Successfully seeded 5 sectors for Nigeria (NGA) with Bloomberg-grade metric highlighting';
END $$;
