-- =========================================================
-- T2 Narrative Profiles — 12 Rollout Markets  (Phase 0D.1 / 0D.2)
-- souvera_country_profiles: summary_md, why_now_md,
--   opportunity_thesis_md, risk_narrative_md,
--   signal_level, economic_momentum, investor_readiness
--
-- Rules (SDC T2 tier):
--   - No bare numeric facts (numbers live in souvera_country_observations)
--   - Template tokens {{GDP_NOMINAL_USD}} hydrated at render from T1
--   - Prose is institutional, editorial, non-promotional
--   - risk_narrative_md must not soften material risks
-- =========================================================

-- ── NGA — Nigeria ────────────────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
  -- summary_md
  'Africa''s most populous nation and one of the continent''s largest economies. Nigeria is simultaneously the region''s consumer goods gravitational centre, its leading fintech innovation hub, and a major hydrocarbons exporter — three roles that make it impossible to ignore for institutional investors operating in Africa. The non-oil private sector — spanning digital payments, fast-moving consumer goods, agro-processing, and manufacturing — is expanding structurally, reducing (though not eliminating) the economy''s traditional crude-price dependence.',
  -- why_now_md
  'President Tinubu''s 2023 reform package — floating the naira, eliminating fuel subsidies, and unifying multiple exchange rate windows — has created the most significant policy realignment in a generation. These reforms impose near-term hardship but correct structural distortions that suppressed long-horizon investment. Nigeria''s AGOA eligibility (reinstated per USTR 2024 beneficiary list, Evidence Vault) positions it as a priority engagement market for US trade policy stakeholders ahead of the December 2026 reauthorisation deadline. The country''s demographic profile — median age under twenty-five and an urban middle class expanding faster than continental peers — underpins structural consumer demand growth that is policy-agnostic.',
  -- opportunity_thesis_md
  'Digital financial services represent the highest-conviction entry point: Nigeria hosts the highest density of licensed fintechs on the continent and a payment infrastructure stack (NIBSS, NIP) that processes transaction volumes rivalling sub-regional peers combined. Agro-processing is the second pillar — cashews, sesame, and cocoa value-addition attract both AGOA-motivated investment and AfCFTA cross-border supply chain development. Energy services and transition infrastructure (gas monetisation, off-grid solar, and LNG for West African markets) form the third corridor. Manufacturing — particularly in fast-moving consumer goods and pharmaceuticals — benefits from import substitution incentives and a captive demand base that no other African market can replicate at this scale.',
  -- risk_narrative_md
  'Foreign exchange volatility remains the most operationally disruptive risk for cross-border investors: the naira''s post-float trajectory has imposed mark-to-market losses on USD-denominated exposures and elevated repatriation costs. Infrastructure deficits — particularly electricity, roads, and port logistics — increase operating costs relative to regional peers and require investors to internalise services that government systems fail to provide. Security conditions in the North-East (Borno) and parts of the North-West create operational perimeters that exclude significant portions of the country from cost-effective deployment. Regulatory opacity and unpredictable policy application (particularly in the banking and telecoms sectors) require structuring approaches that are less reliant on regulatory predictability than comparable markets.',
  'emerging', 'improving', 'moderate', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();

-- ── KEN — Kenya ──────────────────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'KEN'),
  'East Africa''s most diversified economy and the region''s established gateway for institutional capital. Kenya hosts the continent''s most mature mobile money ecosystem (M-Pesa), a deep network of regional banks and capital markets, and an Export Processing Zone infrastructure that makes it the primary AGOA-linked apparel and horticulture exporter in Sub-Saharan Africa. Nairobi functions as a dual hub — the headquarters of choice for multinational Africa operations and the continent''s fastest-scaling startup ecosystem outside of Lagos.',
  'Kenya''s AGOA eligibility and active apparel EPZ (Athi River, Export Processing Zones Authority) position it as a high-priority engagement market for US trade stakeholders focused on nearshoring and supply chain diversification. The government''s Bottom-Up Economic Transformation Agenda is directing capital into agribusiness, manufacturing, and affordable housing — sectors where development finance and commercial capital can co-invest at scale. Kenya''s EAC and AfCFTA membership makes it the logical operational base for companies seeking cross-border access to East and Central African consumer markets from a single platform.',
  'Apparel and textile manufacturing under AGOA preferences is the most immediately investable corridor — Kenya''s EPZ operators serve US retailers and benefit from established certification and compliance infrastructure. Specialty horticulture and floriculture (Naivasha, Mt. Kenya region) is a globally competitive export corridor with AGOA and EU market access. Tea, coffee, and macadamia processing offer value-addition opportunities built on Kenya''s dominant global export positions in these categories. Fintech and financial services infrastructure (payments, insurance-tech, credit scoring) represent the highest-growth-rate entry point for technology-oriented investors. Logistics and cold-chain infrastructure investment addresses a structural gap that constrains the entire East African agricultural export system.',
  'Fiscal consolidation pressures following COVID-era borrowing are real: the debt-to-GDP trajectory and rising debt servicing costs constrain public investment and increase the probability of IMF programme conditions. The anti-Finance-Bill protests of 2024 demonstrated that domestic political constraints on government fiscal plans are active and consequential — requiring investors to discount policy predictability relative to historical norms. Drought vulnerability in ASAL regions creates agricultural output variability that affects sector-level projections. Private sector credit costs remain elevated, constraining SME growth rates that underpin the consumer economy.',
  'high_growth', 'improving', 'high', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();

-- ── JAM — Jamaica ────────────────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'JAM'),
  'The Caribbean''s leading services-led economy and a regional anchor for Business Process Outsourcing, financial services, and premium tourism. Jamaica has achieved one of the most successful post-IMF programme fiscal consolidations in the region — moving from persistent deficits to primary surpluses — and its debt-to-GDP ratio is on a demonstrable downward trajectory. CBI and CARICOM frameworks provide preferential US market access that anchors the services export corridor and supports manufacturing diversification.',
  'Jamaica''s successful exit from IMF programme conditions signals macroeconomic stabilisation that most Caribbean peers have not yet achieved. This creates a differentiated risk profile for institutional capital seeking Caribbean exposure with reduced sovereign risk. The CARICOM single market and economy''s deepening integration — combined with Kingston''s position as a transshipment and logistics hub — positions Jamaica as the logical platform for regional scale. The government''s Digital Jamaica programme and BPO sector incentives are attracting new investment in high-value services at a time when US companies are actively seeking nearshore delivery capacity.',
  'Tourism and hospitality remain the structural engine — Jamaica''s brand equity in premium and experiential travel is undermonetised at the infrastructure level, creating durable development demand. Business Process Outsourcing is the fastest-growing tradeable services sector, with established operators serving US financial services, healthcare, and technology clients from Kingston and Montego Bay. Kingston''s natural deepwater port and logistics capacity position it as a viable Caribbean transshipment alternative in a post-Panama Canal diversification context. Agriculture — rum, Blue Mountain coffee, pimento — offers niche premium export opportunities with strong North American consumer demand.',
  'Climate vulnerability is the primary structural risk: Jamaica sits in the active Atlantic hurricane corridor and lacks the fiscal buffers to absorb major storm impacts without sovereign stress. Youth unemployment and gang-related violence in Kingston metropolitan areas create operational security considerations for employers and social stability risks for the macro outlook. US market concentration — particularly in tourism arrivals and BPO contracts — creates correlated demand exposure that reduces portfolio diversification value for investors seeking uncorrelated Caribbean returns. Energy costs remain structurally high relative to regional peers, constraining manufacturing competitiveness for goods-oriented investment.',
  'stable', 'stable', 'high', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();

-- ── GHA — Ghana ──────────────────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'GHA'),
  'West Africa''s democratic anchor and a commodity-rich economy undergoing an IMF-supported fiscal stabilisation following a sovereign debt restructuring completed in 2024. Ghana combines deep institutional infrastructure — a mature capital market, independent judiciary, and competitive banking system — with significant resource endowments in gold, cocoa, oil, and emerging critical minerals. Its democratic governance track record and English-language legal environment make it the most accessible West African market for US institutional investors.',
  'Post-restructuring stabilisation is restoring the fiscal space and investor confidence that was eroded during the 2022–23 debt crisis. The new Mahama administration''s growth agenda and the IMF Extended Credit Facility are creating a policy framework that rewards long-horizon investment. Ghana''s AGOA eligibility positions it for preferential US market access in cocoa derivatives, apparel, and processed agriculture at a moment when global cocoa supply chain diversification is a strategic priority for US food and confectionery manufacturers. The Ghana Investment Promotion Centre''s streamlined registration framework has reduced the friction cost of market entry relative to regional peers.',
  'Cocoa processing and agro-industrial value-addition is the highest-conviction corridor: Ghana processes a growing share of its cocoa into butter, paste, and powder before export, and US confectionery sector demand for certified sustainable cocoa creates a durable premium market. Critical minerals — lithium, manganese, and bauxite — are attracting exploration capital from US and international players seeking to diversify supply chains away from DRC and China-linked sources. Financial services and insurance offer institutional capital deployment opportunities in an underserved market with a maturing regulatory framework. Manufacturing — particularly in pharmaceuticals and consumer goods — benefits from import substitution incentives and ECOWAS regional market access.',
  'The debt restructuring has imposed a multi-year constraint on public investment and access to external capital markets — investors must structure around reduced government co-investment capacity for the IMF programme period. Currency depreciation risk remains elevated: the cedi has lost significant value against the USD over the past three years, creating FX mark-to-market exposure for USD-denominated investors. Energy sector liabilities (Electricity Company of Ghana, power purchase agreements) represent contingent fiscal risks that have not been fully resolved. Regional cocoa production concentration creates sector-level supply risk for agriculture-linked investments.',
  'emerging', 'improving', 'moderate', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();

-- ── ZAF — South Africa ───────────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'ZAF'),
  'Africa''s most sophisticated financial market, most advanced manufacturing base, and the continent''s gateway for institutional capital seeking exposure to a developed-market-proximate environment with emerging-market returns. South Africa hosts the JSE (one of the twenty largest stock exchanges globally), a deep banking system, world-class legal infrastructure, and a diversified export economy spanning platinum group metals, automotive, agriculture, and advanced financial services. It is simultaneously AGOA''s largest beneficiary by export value and the continent''s largest bilateral trading partner with the United States.',
  'The formation of a Government of National Unity following the May 2024 elections has materially reduced the near-term political risk premium that was suppressing investment. Eskom''s dramatic reduction in load-shedding frequency during 2024 — the most persistent operational constraint on private sector growth for the prior four years — is restoring business confidence and industrial output. South Africa''s AGOA position — particularly for automotive components, platinum group metals, and citrus — makes it a top-priority engagement market for US trade policy as the reauthorisation process advances. The JSE''s rand-denominated asset base provides natural FX diversification for USD investors during periods of rand weakness.',
  'Automotive manufacturing and components represent the highest-conviction institutional corridor — South Africa''s BMW, Toyota, Mercedes-Benz, and Ford assembly operations anchor a mature supply chain that accesses preferential US import duties through AGOA. Platinum group metals (platinum, palladium, rhodium) are an irreplaceable strategic input for automotive catalysts and hydrogen fuel cells — South Africa holds the world''s largest known reserves and is non-substitutable in the near term. Financial and business services — insurance, asset management, banking — offer institutional entry into a sophisticated market that intermediates capital flows across the continent. Renewable energy infrastructure (the REIPPPP programme) provides a structured procurement framework for private power investment with long-dated government-backed offtake contracts.',
  'Structural unemployment — persistently above a third of the labour force — is both a social risk and a constraint on domestic demand growth that no single administration has solved in the post-Apartheid era. State-owned enterprise reform (Eskom, Transnet, SAA) remains incomplete and continues to impose direct and indirect costs on the fiscus and private sector. South Africa''s non-alignment foreign policy posture — including its position on Russia-Ukraine and its ICJ case against Israel — creates reputational and AGOA eligibility considerations for US-associated investors. Infrastructure constraints (Transnet rail and port logistics) impose measurable competitiveness costs on mining and agricultural exporters relative to what the resource base alone would support.',
  'stable', 'stable', 'high', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();

-- ── ETH — Ethiopia ────────────────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'ETH'),
  'Africa''s second most populous nation and the continent''s fastest-growing large economy over the prior decade before the Tigray conflict. Ethiopia''s industrial park model — anchored by Hawassa Industrial City and the Eastern Industrial Zone — attracted global fast-fashion and apparel brands seeking African manufacturing alternatives, establishing a manufacturing workforce and infrastructure base that is unique on the continent. Post-conflict stabilisation and reform under Prime Minister Abiy Ahmed''s administration are creating conditions for a potential second phase of industrial expansion, conditional on AGOA eligibility restoration.',
  'Ethiopia is suspended from AGOA eligibility as of 2022 due to human rights concerns related to the Tigray conflict. Restoration — which would require demonstrated progress on humanitarian access, accountability, and civilian protection — is the single highest-value policy event for the country''s trade investment outlook. The potential trajectory to restoration creates a meaningful forward-looking investment case for patient capital willing to position ahead of re-eligibility. Simultaneously, the government''s macro reform programme — including FX liberalisation, privatisation of telecoms (Telebirr/Safaricom Ethiopia), and banking sector opening — is creating new entry points that are independent of AGOA status.',
  'Apparel and textiles manufacturing is the primary AGOA-conditional corridor: Hawassa Industrial City (designed by UNIDO and developed with global brand tenants) provides purpose-built infrastructure that can re-accelerate on restoration. Coffee is Ethiopia''s oldest and most globally competitive export — Ethiopian single-origin Yirgacheffe, Guji, and Sidamo command premium prices in specialty markets, and the export infrastructure is established. Specialty floriculture, sesame, leather goods, and cut flowers represent additional agricultural export corridors. Industrial park infrastructure development and logistics connectivity (Djibouti corridor) offer infrastructure-oriented investment themes that are partially independent of AGOA status.',
  'Active AGOA suspension is the paramount risk: it directly suppresses apparel export revenue, constrains industrial park occupancy, and limits the bilateral trade relationship with the United States. Unresolved internal conflicts in Amhara and Oromia regions — separate from but related to the Tigray peace process — create security uncertainty across a significant portion of the territory. Foreign exchange liquidity constraints have historically created repatriation difficulties for international investors, though the 2024 FX liberalisation has begun to address this. Political concentration of power and governance opacity increase event risk relative to more institutionally developed peers.',
  'emerging', 'improving', 'low', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();

-- ── SEN — Senegal ────────────────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'SEN'),
  'West Africa''s most stable democracy and an emerging energy producer undergoing a structural economic transformation. The Sangomar offshore field''s first oil production in 2024 marks a milestone that repositions Senegal from a frontier to an established hydrocarbons exporter. Dakar''s infrastructure, Francophone legal alignment, and political stability make it the preferred platform for US and European investors seeking West African exposure outside the ECOWAS geopolitical turbulence zone. Senegal is AGOA-eligible with an established preferential access framework for fisheries, groundnuts, phosphate derivatives, and manufactured goods.',
  'First oil production from Sangomar and the imminent Grande Tortue Ahmeyim LNG project create a once-in-a-generation investment inflection point that has already attracted major US and international energy companies. The Faye administration''s "Sénégal 2050" development framework and anti-corruption mandate are creating governance conditions that reward institutional investment over resource rent extraction. The Diamniadio industrial zone — purpose-built with Chinese construction financing but increasingly open to US and European industrial tenants — provides plug-and-play manufacturing infrastructure that reduces entry barriers for light manufacturing and agro-processing. Dakar''s port expansion and road infrastructure investment are improving logistics connectivity to Mali, Guinea, and Mauritanian markets.',
  'Energy and LNG infrastructure is the highest-profile investment theme: US and international oil companies (BP, Kosmos) have established positions, and the gas monetisation opportunity via GTL extends the value chain. Phosphate and agro-processing (fertiliser, food processing from groundnuts and cashews) leverage Senegal''s natural resource endowments with downstream value-addition. Financial services — including Islamic finance, microfinance, and digital payments — are expanding into an underserved population with rising smartphone penetration. Light manufacturing from the Diamniadio zone targets ECOWAS market access and AGOA US exports, particularly in processed foods and consumer goods.',
  'Oil revenue management discipline is the paramount long-horizon risk: resource curse dynamics — fiscal procyclicality, institutional erosion, and distributional conflict — require active monitoring as petrodollar inflows begin. The Faye administration''s political mandate includes significant redistributive expectations from the population that may create fiscal pressure to spend rather than save oil revenues. Regional security pressures from the Sahelian zone (Mali, Burkina Faso) create terrorism and cross-border instability risks, particularly for infrastructure investments in the eastern regions. Senegal''s dependence on rainfall for agriculture and on fish stocks for protein security creates climate vulnerability that is underweighted in traditional sovereign risk models.',
  'high_growth', 'improving', 'high', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();

-- ── CIV — Côte d'Ivoire ──────────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'CIV'),
  'West Africa''s largest economy and the world''s leading cocoa producer, anchoring agricultural commodity flows for the entire ECOWAS zone. Abidjan — the region''s most developed port city and financial centre — functions as the operational hub for multinational companies seeking ECOWAS-wide distribution, making Côte d''Ivoire the default entry point for consumer goods and industrial operators in Francophone West Africa. The country''s decade-long political stabilisation under President Ouattara has delivered some of the highest sustained growth rates in the region, funded by infrastructure investment and commodity revenue management.',
  'Côte d''Ivoire''s AGOA eligibility covers cocoa derivatives, cashews, rubber, and processed agriculture at a time when global cocoa prices have reached multi-decade highs — creating an exceptional window for value-added agro-processing investment that captures both commodity price tailwinds and AGOA trade preferences simultaneously. The country''s upcoming presidential transition (2025) is the near-term political variable to monitor, but institutional frameworks are sufficiently developed that policy continuity is the base case. Abidjan''s Autonomous Port expansion programme and the Henri Konan Bédié bridge infrastructure investment are reducing the logistics bottleneck that has historically constrained industrial throughput.',
  'Cocoa and agro-industrial processing is the primary corridor: Côte d''Ivoire''s ambition to process more of its cocoa before export creates investment opportunities in chocolate manufacturing, cocoa butter and powder processing, and certified sustainable supply chain infrastructure. Petroleum products and refining — the Abidjan refinery rehabilitation and potential expansion — represent an energy sector investment theme tied to regional product market demand. Financial services in Abidjan anchor UEMOA (West African Monetary Union) capital allocation for the zone''s eight member states, creating scale for institutional financial investors. Port and logistics infrastructure investment leverages Abidjan''s position as West Africa''s busiest container port with expansion potential.',
  'Political succession risk is the most proximate concern: Ouattara''s eventual departure will test whether the stabilisation of the 2010s has created genuine institutional durability or remains personality-dependent. ECOWAS instability linkages — the coup belt in Mali, Burkina Faso, Guinea, and Niger directly borders Côte d''Ivoire on three sides — creates regional contagion risk that cannot be fully hedged at the country level. Cocoa price volatility creates export revenue swings that affect the fiscal position and downstream value-chain economics. UEMOA franc (XOF) exchange rate rigidity under the franc zone arrangement limits monetary policy flexibility but provides FX stability that distinguishes it from floating-rate West African peers.',
  'high_growth', 'improving', 'high', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();

-- ── TZA — Tanzania ───────────────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'TZA'),
  'East Africa''s second largest economy and a major producer of gold, agricultural commodities, and tourism services. Tanzania''s strategic position — serving as the logistics gateway for landlocked Uganda, Rwanda, Burundi, DRC, and Zambia via the Dar es Salaam port and TAZARA railway corridor — gives it structural trade throughput importance that extends well beyond its own consumer market. The country''s Export Processing Zones position it as an alternative AGOA-linked manufacturing hub for East African supply chains, particularly in apparel, cashew processing, and specialty agriculture.',
  'Tanzania''s AGOA eligibility and growing apparel EPZ sector (EPZ Authority) position it as a complementary or alternative sourcing hub to Kenya for US buyers seeking East African production diversity. President Samia Suluhu Hassan''s business-friendly reform signals — including streamlined investment procedures and diplomatic re-engagement — have improved the country''s profile with international investors after a period of regulatory tightening under Magufuli. The TAZARA corridor redevelopment (with Chinese and Western development finance interest) and the SGR (Standard Gauge Railway) extension plans represent multi-decade infrastructure investment opportunities. Dar es Salaam''s port expansion and the government''s Kilimo Kwanza agricultural transformation agenda are creating structured entry points for agribusiness capital.',
  'Gold and critical minerals represent the highest near-term commodity investment theme — Tanzania''s gold sector is already globally significant, and nickel, lithium, and graphite deposits in the Lake Victoria and interior zones are attracting pre-feasibility capital from US and international mining companies. Apparel and textiles manufacturing (EPZ) under AGOA preferences targets US fast-fashion supply chain diversification away from Asian sole-source dependence. Specialty agriculture — cashews, coffee, tea, and spices — offers AGOA-linked export corridors with strong US consumer market demand. Tourism and hospitality infrastructure investment (Serengeti, Kilimanjaro, Zanzibar) addresses capacity constraints in one of the world''s strongest nature-tourism brands.',
  'State-led economic orientation — Tanzania''s mixed-economy model gives the government direct intervention authority in strategic sectors — creates unpredictability in tax treatment, licensing, and resource revenue sharing that has historically surprised investors who applied Kenyan or Rwandan frameworks. FDI policy uncertainty, including sector-specific ownership restrictions and shifting local content requirements in the extractive sector, requires careful legal due diligence. Port logistics congestion at Dar es Salaam constrains throughput relative to the corridor''s theoretical capacity and imposes costs on exporters. Relations with Tanzania''s key EU markets can be affected by bilateral policy disagreements (e.g., EU-ACP Economic Partnership Agreement dynamics) in ways that affect agricultural export flows.',
  'emerging', 'improving', 'moderate', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();

-- ── TTO — Trinidad & Tobago ───────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'TTO'),
  'The Caribbean''s energy-led economy and the region''s industrial and petrochemical hub, with the highest per-capita income in the Caribbean Community. Trinidad anchors CARICOM''s manufacturing base and provides preferential US market access under CBI/CBERA for qualifying exports. Its deep port infrastructure at Port of Spain and Point Lisas Industrial Estate position it as the region''s primary logistics and industrial platform. The natural gas sector — which drives downstream ammonia, methanol, and LNG production — makes Trinidad one of the world''s most energy-intensive small economies and a significant US petrochemical trade partner.',
  'Post-COVID energy sector recovery and improved natural gas pricing have restored fiscal space after several years of contraction. CARICOM single market integration and Trinidad''s role as the region''s manufacturing base create structured demand for capital in industrial upgrading. CBI preferential US access supports diversification into non-energy manufacturing — particularly food processing, industrial chemicals, and business services — at a moment when US companies are actively evaluating nearshore supply chain alternatives. The development of La Brea industrial estate and industrial upgrading programmes create entry points for manufacturing-oriented investors.',
  'Energy and petrochemicals represent the core investment base — ammonia, methanol, LNG, and downstream derivatives from Atlantic LNG position Trinidad as a critical supplier for US and European energy markets. Manufacturing diversification — food processing, industrial chemicals, consumer goods — leverages CBI access and the established industrial infrastructure at Point Lisas. Financial and professional services (regional banking, insurance, legal) serve the broader Caribbean market from Port of Spain. Maritime and logistics services benefit from Trinidad''s central geographic position in the Caribbean arc, serving both North-South and East-West shipping lanes.',
  'Natural gas reserve depletion is the paramount structural risk: Trinidad''s fiscal and industrial model is calibrated to gas field production levels that are declining, and no resource base equivalent has been identified to replace the long-term production profile. Energy sector revenue dependence creates fiscal procyclicality — when gas prices fall or production drops, government spending capacity contracts sharply, reducing domestic demand. Climate transition exposure is real: downstream petrochemical products face long-horizon demand headwinds as the global energy transition accelerates. Hurricane risk, while less acute than Eastern Caribbean peers, remains a physical infrastructure and business continuity consideration.',
  'stable', 'stable', 'high', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();

-- ── BRB — Barbados ────────────────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'BRB'),
  'A services-led small island economy with among the strongest governance, legal, and financial sector infrastructure in the Caribbean. Barbados combines a premium tourism brand, a well-regulated international business and financial services (IBFS) sector, and CBI/CARICOM US market access in a compact, politically stable jurisdiction. Prime Minister Mottley''s domestic and international leadership — including the Bridgetown Initiative for global finance reform — has positioned Barbados as a model small island developing state and elevated its profile with institutional investors, multilateral lenders, and climate finance allocators disproportionate to its market size.',
  'The Mottley administration''s digital economy agenda — including the Digital Barbados programme and Barbados Welcome Stamp digital nomad visa — is attracting high-value remote workers and technology services firms that are diversifying the IBFS base beyond traditional offshore structures. Barbados'' leadership in climate finance advocacy (Bridgetown Initiative) is creating preferential access to concessional multilateral capital for climate adaptation and renewable energy infrastructure that commercial investors can co-finance. CBI preferential US access for financial services and qualifying goods exports supports the services export corridor. The CARICOM single market deepening creates a logical platform for Barbados-based companies to serve the broader Caribbean.',
  'Premium tourism and hospitality is the primary revenue engine and investment theme — Barbados'' luxury positioning and airlift from North America and UK create durable demand that justifies ongoing resort and infrastructure investment. International financial and business services — despite OECD/FATF pressure on offshore structures — remain a significant economic contributor with legitimate substance requirements that create demand for professional services infrastructure. Digital economy and BPO services are expanding on the back of the Stamp programme and fibre connectivity investment. Renewable energy infrastructure (solar, wave) addresses energy import dependence and aligns with the government''s hundred-percent renewable target timeline.',
  'Small market size is the fundamental constraint on scale: Barbados'' domestic market and labour pool limit the growth potential of any investment thesis that depends on domestic demand rather than export or services orientation. Climate vulnerability is existential at the small island scale — a Category 4 or higher hurricane represents a multi-year GDP shock and requires catastrophe risk structuring for all fixed-asset investment. Debt-to-GDP management is a persistent consideration: Barbados emerged from a 2018 debt restructuring and the post-COVID fiscal adjustment has been difficult, though the trajectory has improved. IBFS sector vulnerability to international tax transparency requirements requires investors in that sector to model regulatory evolution scenarios carefully.',
  'stable', 'stable', 'high', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();

-- ── BHS — The Bahamas ────────────────────────────────────────────────────
INSERT INTO public.souvera_country_profiles (
  country_id, summary_md, why_now_md, opportunity_thesis_md,
  risk_narrative_md, signal_level, economic_momentum, investor_readiness, updated_at
)
VALUES (
  (SELECT id FROM public.souvera_countries WHERE iso3 = 'BHS'),
  'A high-income services economy with near-total integration into the US market as the closest major tourism and financial services hub to the continental United States. The Bahamas combines world-class tourism and hospitality infrastructure, an established international financial centre (Nassau and Freeport), maritime and logistics services (Nassau Container Port), and CBI preferential US market access. Despite its small population, the Bahamas ranks among the highest per-capita income economies in the Western Hemisphere and the highest in the Caribbean — a function of its concentrated service economy and geographic positioning.',
  'Nassau''s positioning as the nearest non-US international financial centre to the US East Coast, combined with Sand Dollar (the world''s first fully operational CBDC), positions The Bahamas as an early-mover in the digital financial infrastructure transition. The government''s renewed focus on economic diversification beyond stopover tourism — mariculture, digital services, maritime, and financial technology — creates new investment themes beyond the established tourism and IBFS corridors. CBI access and the country''s strong investor protection framework (English common law, independent judiciary) reduce structural risks relative to Latin American and other Caribbean peers. Nassau''s proximity to the Florida coast creates natural logistics advantages for US-oriented light manufacturing and distribution.',
  'Ultra-premium tourism and hospitality remains the defining investment corridor — Atlantis, Baha Mar, and the pipeline of resort development projects demonstrate durable institutional capital demand for Bahamian hospitality assets. Financial and wealth management services — anchored by Nassau''s legal and regulatory infrastructure — continue to attract international capital despite OECD/FATF framework evolution. Maritime and port logistics (Nassau Container Port, Freeport Container Port) serve US-Caribbean distribution chains with strategic geographic advantages. Digital economy services and financial technology benefit from the Sand Dollar infrastructure and the government''s digital economy regulatory sandbox programme.',
  'Near-total US market concentration is the primary portfolio risk: Bahamian tourism arrivals, financial services flows, and trade are dominated by US counterparties, creating a highly correlated risk exposure that eliminates geographic diversification value for US-based investors. Hurricane risk is extreme: the northern Bahamas experienced catastrophic damage from Hurricane Dorian in 2019 — a reminder that Category 5 events can cause multi-year economic disruption disproportionate to conventional risk models. Dependence on tourism revenue creates a single-sector exposure that made the COVID shutdowns economically devastating; recovery has been strong but the structural vulnerability persists. IBFS sector evolution under OECD Pillar Two and FATF frameworks requires careful modelling of regulatory scenarios for financial services investors.',
  'stable', 'stable', 'high', now()
)
ON CONFLICT (country_id) DO UPDATE
SET summary_md            = EXCLUDED.summary_md,
    why_now_md            = EXCLUDED.why_now_md,
    opportunity_thesis_md = EXCLUDED.opportunity_thesis_md,
    risk_narrative_md     = EXCLUDED.risk_narrative_md,
    signal_level          = EXCLUDED.signal_level,
    economic_momentum     = EXCLUDED.economic_momentum,
    investor_readiness    = EXCLUDED.investor_readiness,
    updated_at            = now();
