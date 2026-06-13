/**
 * Per-country Overview tab copy — Sprint B.
 * @see docs/execution/country-terminal-sprint-plan.md
 */

export type CountryRegion = 'africa' | 'caribbean' | 'default';

export function getCountryRegion(iso3: string): CountryRegion {
  const caribbean = new Set(['JAM', 'TTO', 'BRB', 'BHS', 'HTI', 'DOM', 'CUB']);
  if (caribbean.has(iso3.toUpperCase())) return 'caribbean';
  const africa = new Set(['NGA', 'ZAF', 'KEN', 'GHA', 'EGY', 'MAR', 'TZA', 'ETH', 'SEN', 'CIV']);
  if (africa.has(iso3.toUpperCase())) return 'africa';
  return 'default';
}

export interface OverviewSnapshotMetric {
  emoji: string;
  label: string;
  value: string;
  sublabel: string;
  narrative: string;
}

export interface OverviewWhyNowPoint {
  emoji: string;
  title: string;
  body: string;
}

export interface OverviewMarketAccessItem {
  emoji: string;
  tone: 'amber' | 'emerald';
  title: string;
  paragraphs: string[];
  bullets?: string[];
  footnote?: string;
}

export interface OverviewMomentumMetric {
  emoji: string;
  label: string;
  value: string;
  sublabel: string;
  narrative: string;
}

export interface CountryOverviewContent {
  snapshotTitle: string;
  snapshotIntro: string;
  snapshotMetrics: OverviewSnapshotMetric[];
  momentumIntro: string;
  momentumMetrics: OverviewMomentumMetric[];
  momentumFooterSources: string;
  whyNowLead: string;
  whyNowPoints: OverviewWhyNowPoint[];
  whyNowCallout: string;
  marketAccessItems: Array<{
    emoji: string;
    tone: 'amber' | 'emerald';
    title: string;
    paragraphs: string[];
    bullets?: string[];
    footnote?: string;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Metrics = Record<string, any>;

function fmtPct(v?: number) {
  return v != null ? `${v.toFixed(1)}%` : 'Pending';
}

export function getOverviewContent(
  iso3: string,
  countryName: string,
  m: Metrics
): CountryOverviewContent {
  const key = iso3.toUpperCase();
  if (key === 'JAM') return jamaicaOverview(countryName, m);
  if (key === 'NGA') return nigeriaOverview(countryName, m);
  if (key === 'KEN') return kenyaOverview(countryName, m);
  if (key === 'TTO') return trinidadOverview(countryName, m);
  if (key === 'BRB') return barbadosOverview(countryName, m);
  if (key === 'BHS') return bahamasOverview(countryName, m);
  if (['GHA', 'ZAF', 'ETH', 'SEN', 'CIV', 'TZA'].includes(key)) return wave1AfricaOverview(key, countryName, m);
  return defaultOverview(countryName, m);
}

function wave1AfricaOverview(iso3: string, countryName: string, m: Metrics): CountryOverviewContent {
  const profiles: Record<string, { title: string; intro: string; hub: string; hubLabel: string; hubNarrative: string; sources: string; agoaTitle: string; agoaTone: 'amber' | 'emerald'; agoaStatus: string; regionalTitle: string }> = {
    GHA: { title: 'West Africa Mining & Cocoa Hub', intro: `${countryName} is West Africa's second-largest economy combining gold mining, cocoa exports, and Accra fintech growth with Tema port gateway access.`, hub: 'Accra', hubLabel: 'Fintech & Services', hubNarrative: 'Mobile money and digital finance cluster', sources: 'World Bank, BoG, Ghana Statistical Service', agoaTitle: 'AGOA: Duty-Free U.S. Market Access', agoaTone: 'emerald', agoaStatus: 'Active · AGOA eligible', regionalTitle: 'ECOWAS: West African Gateway' },
    ZAF: { title: 'Africa\'s Industrial Powerhouse', intro: `${countryName} is Africa's most industrialized economy combining PGMs, automotive manufacturing, deep capital markets, and renewable energy transition.`, hub: 'Johannesburg', hubLabel: 'Financial Capital', hubNarrative: 'JSE and banking sector anchor', sources: 'World Bank, SARB, Stats SA', agoaTitle: 'AGOA: Duty-Free U.S. Market Access', agoaTone: 'emerald', agoaStatus: 'Active · AGOA eligible', regionalTitle: 'SADC: Southern African Hub' },
    ETH: { title: 'East Africa Manufacturing Giant', intro: `${countryName} is Africa's second-most populous nation combining EPZ apparel manufacturing, coffee exports, and hydropower infrastructure at scale.`, hub: 'Addis Ababa', hubLabel: 'Industrial Capital', hubNarrative: 'EPZ and manufacturing cluster', sources: 'World Bank, NBE, Central Statistics Agency', agoaTitle: 'AGOA: Restoration Watch', agoaTone: 'amber', agoaStatus: 'Suspended · $680M+ potential', regionalTitle: 'AfCFTA: Continental Market Access' },
    SEN: { title: 'West Africa Stability Anchor', intro: `${countryName} is a stable West African democracy combining phosphate mining, fisheries, Sangomar energy, and Diamniadio industrial zone investment.`, hub: 'Dakar', hubLabel: 'Regional Capital', hubNarrative: 'UEMOA and ECOWAS gateway', sources: 'World Bank, BCEAO, ANSD', agoaTitle: 'AGOA: Duty-Free U.S. Market Access', agoaTone: 'emerald', agoaStatus: 'Active · AGOA eligible', regionalTitle: 'UEMOA: CFA Zone Stability' },
    CIV: { title: 'West Africa Growth Leader', intro: `${countryName} is West Africa's fastest-growing major economy combining world's largest cocoa production, gold mining, and Abidjan port logistics.`, hub: 'Abidjan', hubLabel: 'Trade Gateway', hubNarrative: 'West Africa\'s largest container port hub', sources: 'World Bank, BCEAO, INS Côte d\'Ivoire', agoaTitle: 'AGOA: Duty-Free U.S. Market Access', agoaTone: 'emerald', agoaStatus: 'Active · AGOA eligible', regionalTitle: 'ECOWAS: Sahel Re-Export Hub' },
    TZA: { title: 'East Africa Resource Economy', intro: `${countryName} combines gold mining, EPZ apparel exports, cashew agriculture, and Dar es Salaam port access for EAC trade corridors.`, hub: 'Dar es Salaam', hubLabel: 'Port Gateway', hubNarrative: 'EAC trade and EPZ manufacturing hub', sources: 'World Bank, BoT, NBS Tanzania', agoaTitle: 'AGOA: Duty-Free U.S. Market Access', agoaTone: 'emerald', agoaStatus: 'Active · AGOA eligible', regionalTitle: 'EAC: East African Community' },
  };
  const p = profiles[iso3] ?? profiles.GHA;
  return {
    snapshotTitle: p.title,
    snapshotIntro: p.intro,
    snapshotMetrics: [
      { emoji: '💰', label: 'Economic Scale', value: m.gdp_current_usd ? `$${(m.gdp_current_usd / 1e9).toFixed(0)}B` : 'Pending', sublabel: 'GDP (2025)', narrative: 'Latest Souvera intelligence estimate' },
      { emoji: '👥', label: 'Population', value: m.population_total ? `${(m.population_total / 1e6).toFixed(0)}M` : 'Pending', sublabel: 'People (2025)', narrative: 'Demographic base and domestic market scale' },
      { emoji: '🏙️', label: 'Hub City', value: p.hub, sublabel: p.hubLabel, narrative: p.hubNarrative },
      { emoji: '📈', label: 'Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: 'GDP Growth (2025)', narrative: 'Latest annual growth rate' },
    ],
    momentumIntro: `${countryName} economic momentum reflects sector investment, trade corridor development, and macro policy frameworks.`,
    momentumMetrics: [
      { emoji: '📈', label: 'GDP Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: '(2025)', narrative: 'Annual growth rate' },
      { emoji: '💰', label: 'FDI Inflows', value: m.fdi_net_inflows_current_usd ? (m.fdi_net_inflows_current_usd >= 1e9 ? `$${(m.fdi_net_inflows_current_usd / 1e9).toFixed(1)}B` : `$${(m.fdi_net_inflows_current_usd / 1e6).toFixed(0)}M`) : 'Pending', sublabel: '(2025)', narrative: 'Foreign direct investment' },
      { emoji: '💰', label: 'GDP', value: m.gdp_current_usd ? `$${(m.gdp_current_usd / 1e9).toFixed(0)}B` : 'Pending', sublabel: '(2025)', narrative: 'Economic scale' },
      { emoji: '📉', label: 'Inflation', value: fmtPct(m.inflation_consumer_prices_annual_pct), sublabel: '(2025)', narrative: 'Consumer price index' },
    ],
    momentumFooterSources: p.sources,
    whyNowLead: 'Investment context — key factors to monitor:',
    whyNowPoints: [
      { emoji: '📊', title: '1. Sector Opportunity', body: 'Review sector scores and AGOA trade blocks in the Sectors tab for country-specific entry points.' },
      { emoji: '🏛️', title: '2. Trade Access', body: 'Monitor AGOA eligibility and regional trade framework developments in the Trade tab.' },
      { emoji: '👥', title: '3. Macro Timing', body: 'Assess GDP growth, FDI, and inflation trends in the Economy tab for deployment timing.' },
    ],
    whyNowCallout: 'See Souvera Country Analysis below for editorial intelligence on timing and entry strategy.',
    marketAccessItems: [
      { emoji: '🇺🇸', tone: p.agoaTone, title: p.agoaTitle, paragraphs: [`${countryName} AGOA status shapes duty-free U.S. market access for qualifying exports. See Trade tab for bilateral trade detail.`], footnote: `Status: ${p.agoaStatus}` },
      { emoji: '🌍', tone: 'emerald', title: p.regionalTitle, paragraphs: [`${countryName} participates in regional trade frameworks supporting cross-border investment and re-export models.`], footnote: 'See Trade tab for partner detail' },
      { emoji: '🌍', tone: 'emerald', title: 'AfCFTA: Continental Free Trade Area', paragraphs: [`${countryName} exports to African countries duty-free under AfCFTA, accessing a combined market of 1.3B consumers.`], footnote: 'Continental duty-free trade integration' },
    ],
  };
}

function nigeriaOverview(countryName: string, m: Metrics): CountryOverviewContent {
  return {
    snapshotTitle: "Africa's Largest Economy",
    snapshotIntro: `${countryName} is profiled with macro data as of {{MACRO_ASOF_YEAR}}: nominal GDP {{GDP_NOMINAL_USD}}, growth {{GDP_GROWTH}}, inflation {{INFLATION}}. Technology and agriculture lead the sector scorecard; post-2023 reforms remain a structural watchpoint per policy registry.`,
    snapshotMetrics: [
      { emoji: '💰', label: 'Economic Scale', value: m.gdp_current_usd ? `$${(m.gdp_current_usd / 1e9).toFixed(0)}B+` : 'Pending', sublabel: 'GDP ({{MACRO_ASOF_YEAR}})', narrative: "West Africa's largest economy, representing 24% of regional output" },
      { emoji: '👥', label: 'Population', value: m.population_total ? `${(m.population_total / 1e6).toFixed(1)}M` : '223M', sublabel: 'Population (latest)', narrative: "Africa's most populous nation with median age of 19.7 years" },
      { emoji: '💻', label: 'Tech Hub', value: 'Lagos', sublabel: 'Fintech Capital', narrative: '400+ funded startups, $2B+ VC investment' },
      { emoji: '📈', label: 'Growth Leader', value: fmtPct(m.gdp_growth_annual_pct), sublabel: 'GDP Growth ({{MACRO_ASOF_YEAR}})', narrative: 'Post-reform macro trajectory per structured series' },
    ],
    momentumIntro: `${countryName} entered sustained growth following 2023 currency reforms. Technology sector expansion and agricultural modernization are driving GDP acceleration, with inflation declining from peak levels.`,
    momentumMetrics: [
      { emoji: '📈', label: 'GDP Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: '({{MACRO_ASOF_YEAR}})', narrative: 'Per structured macro series ({{MACRO_ASOF_YEAR}})' },
      { emoji: '💰', label: 'FDI Inflows', value: m.fdi_net_inflows_current_usd ? `$${(m.fdi_net_inflows_current_usd / 1e9).toFixed(1)}B` : 'Not covered', sublabel: '({{MACRO_ASOF_YEAR}})', narrative: 'FDI {{FDI}} per canonical series' },
      { emoji: '🚀', label: 'Tech sector', value: 'Scorecard', sublabel: 'Sector tab', narrative: 'Sector strength from Souvera scorecard — not a macro series' },
      { emoji: '📉', label: 'Inflation', value: fmtPct(m.inflation_consumer_prices_annual_pct), sublabel: '({{MACRO_ASOF_YEAR}})', narrative: 'Inflation trajectory per structured series (2023 reform cycle referenced in Economy tab)' },
    ],
    momentumFooterSources: 'World Bank, IMF, CBN',
    whyNowLead: 'Critical 24-36 month investment window — three converging factors:',
    whyNowPoints: [
      { emoji: '💹', title: '1. Economic Momentum', body: 'Macro momentum is anchored to the latest structured series ({{MACRO_ASOF_YEAR}}): GDP growth {{GDP_GROWTH}}, FDI {{FDI}}, inflation {{INFLATION}}. Technology and agricultural modernization remain key structural drivers.' },
      { emoji: '🏛️', title: '2. Policy Stability', body: "The Tinubu administration's economic reforms—currency unification, fuel subsidy removal, and tax reforms—have passed the volatility phase. Markets have adjusted, and policy continuity through 2027 is highly probable." },
      { emoji: '👥', title: '3. Demographic Dividend', body: "Nigeria's youth bulge (median age 19.7 years) is maturing into a tech-savvy consumer class. Mobile internet penetration exceeds 75%, and digital payment adoption is accelerating at 35% annually." },
    ],
    whyNowCallout: 'Timing and entry strategy are summarized in the Opportunity and Risk sections; verify macro and policy stamps before deployment decisions.',
    marketAccessItems: [
      {
        emoji: '🇺🇸',
        tone: 'amber',
        title: 'AGOA: U.S. Market Access',
        paragraphs: [`${countryName} AGOA status is sourced from the Evidence Vault — see Trade tab for legislative watchpoints and restoration timeline.`],
        footnote: 'Status: Under review · Source: Evidence Vault',
      },
      {
        emoji: '🌍',
        tone: 'emerald',
        title: 'AfCFTA: Continental Free Trade Area',
        paragraphs: [`${countryName} can export to 54 African countries duty-free, accessing a combined market of 1.3B consumers.`],
        footnote: 'Example: Regional value chains across West and East Africa',
      },
      {
        emoji: '🇳🇬',
        tone: 'emerald',
        title: 'ECOWAS: Regional Market Leadership',
        paragraphs: [`As West Africa's largest economy, ${countryName} has preferential access to 350M consumers across 15 ECOWAS member states.`],
        footnote: 'Strategic Advantage: Springboard for continental expansion',
      },
    ],
  };
}

function jamaicaOverview(countryName: string, m: Metrics): CountryOverviewContent {
  return {
    snapshotTitle: 'Caribbean Digital Gateway',
    snapshotIntro: `${countryName} is the English-speaking Caribbean's leading nearshore hub, combining tourism strength, bauxite mining, and a fast-growing digital services sector. Kingston anchors fintech, BPO, and submarine cable connectivity for the region.`,
    snapshotMetrics: [
      { emoji: '💰', label: 'Economic Scale', value: m.gdp_current_usd ? `$${(m.gdp_current_usd / 1e9).toFixed(1)}B` : '~$19B', sublabel: 'GDP (2025)', narrative: "Caribbean's third-largest English-speaking economy" },
      { emoji: '👥', label: 'Population', value: m.population_total ? `${(m.population_total / 1e6).toFixed(1)}M` : '2.8M', sublabel: 'People (2025)', narrative: 'English-speaking workforce with US time-zone alignment' },
      { emoji: '🌐', label: 'Digital Hub', value: 'Kingston', sublabel: 'Nearshore Capital', narrative: 'Submarine cables, Jam-Dex CBDC pilot, growing BPO cluster' },
      { emoji: '📈', label: 'Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: 'GDP Growth (2025)', narrative: 'Tourism recovery + digital services expansion' },
    ],
    momentumIntro: `${countryName}'s economy is recovering from the pandemic tourism shock with diversified growth in digital infrastructure, luxury tourism, and nearshore services. Remittance flows and IMF-backed fiscal reforms support macro stability.`,
    momentumMetrics: [
      { emoji: '📈', label: 'GDP Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: '(2025)', narrative: 'Tourism recovery + digital services expansion' },
      { emoji: '💰', label: 'FDI Inflows', value: m.fdi_net_inflows_current_usd ? `$${(m.fdi_net_inflows_current_usd / 1e6).toFixed(0)}M` : '$900M', sublabel: '(2024)', narrative: 'Nearshore BPO and tourism investment' },
      { emoji: '✈️', label: 'Tourism', value: '+15%', sublabel: 'Arrival Growth', narrative: 'Higher average spend per visitor vs 2019' },
      { emoji: '📉', label: 'Inflation', value: fmtPct(m.inflation_consumer_prices_annual_pct), sublabel: '(2025)', narrative: 'BOJ tightening supports price stability' },
    ],
    momentumFooterSources: 'World Bank, BOJ, STATIN',
    whyNowLead: 'Critical 24-36 month window — three converging Caribbean opportunities:',
    whyNowPoints: [
      { emoji: '🌐', title: '1. Digital Infrastructure', body: 'Submarine cable connectivity, data center investment, and e-government modernization create a regional hub opportunity with English-speaking Caribbean leadership in cloud readiness.' },
      { emoji: '✈️', title: '2. Tourism Recovery', body: 'Post-pandemic tourism rebound with luxury and eco-tourism segments expanding. Arrivals recovering with 15%+ higher average spend per visitor versus 2019.' },
      { emoji: '💻', title: '3. Nearshoring', body: 'English-speaking workforce and US time-zone alignment attract BPO and tech services investment. Kingston emerging as a nearshore delivery hub with 30-40% labor cost advantage vs US metros.' },
    ],
    whyNowCallout: 'Investment Window: Jamaica offers a 24-36 month positioning window as digital infrastructure scales and tourism diversification accelerates.',
    marketAccessItems: [
      {
        emoji: '🇺🇸',
        tone: 'emerald',
        title: 'CBI: Caribbean Basin Initiative',
        paragraphs: [`${countryName} enjoys preferential U.S. market access under CBI/CARICOM arrangements, supporting duty-free entry for eligible exports.`],
        bullets: ['$890M+ current eligible exports to the U.S.', '4,200+ product categories under preferential access', 'Strong diaspora remittance corridor ($3.5B+ annually)'],
        footnote: 'Status: Active · CARICOM/CBI eligible',
      },
      {
        emoji: '🏝️',
        tone: 'emerald',
        title: 'CARICOM: Single Market Access',
        paragraphs: [`${countryName} is a founding CARICOM member with access to 15 Caribbean economies and CSME integration pathways.`],
        footnote: 'Regional integration supports services and tourism supply chains',
      },
      {
        emoji: '🌎',
        tone: 'emerald',
        title: 'USMCA Nearshore Corridor',
        paragraphs: ['US time-zone alignment and English proficiency position Jamaica as a nearshore delivery hub for North American firms in BPO, fintech, and tech services.'],
        footnote: 'Kingston–Miami corridor: 1.5hr flight, same business hours',
      },
    ],
  };
}

function kenyaOverview(countryName: string, m: Metrics): CountryOverviewContent {
  return {
    snapshotTitle: 'East Africa Fintech Hub',
    snapshotIntro: `${countryName} is East Africa's largest economy and the continent's mobile money pioneer, combining M-Pesa infrastructure, renewable energy leadership, and Mombasa port gateway access for regional trade.`,
    snapshotMetrics: [
      { emoji: '💰', label: 'Economic Scale', value: m.gdp_current_usd ? `$${(m.gdp_current_usd / 1e9).toFixed(0)}B` : '~$115B', sublabel: 'GDP (2025)', narrative: "East Africa's largest economy by output" },
      { emoji: '👥', label: 'Population', value: m.population_total ? `${(m.population_total / 1e6).toFixed(1)}M` : '56M', sublabel: 'People (2025)', narrative: 'Young, urbanizing workforce with high mobile adoption' },
      { emoji: '💳', label: 'Fintech Hub', value: 'Nairobi', sublabel: 'Mobile Money Capital', narrative: 'M-Pesa ecosystem, CBK-regulated digital finance cluster' },
      { emoji: '📈', label: 'Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: 'GDP Growth (2025)', narrative: 'Services-led expansion + infrastructure investment' },
    ],
    momentumIntro: `${countryName}'s economy is driven by fintech scale, renewable energy expansion, and logistics gateway investment. IMF-backed fiscal reforms and EAC integration support macro stability.`,
    momentumMetrics: [
      { emoji: '📈', label: 'GDP Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: '(2025)', narrative: 'Services and agriculture export resilience' },
      { emoji: '💰', label: 'FDI Inflows', value: m.fdi_net_inflows_current_usd ? `$${(m.fdi_net_inflows_current_usd / 1e9).toFixed(1)}B` : '$1.4B', sublabel: '(2025)', narrative: 'Fintech, energy, and logistics investment' },
      { emoji: '⚡', label: 'Renewables', value: '90%+', sublabel: 'Grid Mix', narrative: 'Geothermal, wind, and solar baseload' },
      { emoji: '📉', label: 'Inflation', value: fmtPct(m.inflation_consumer_prices_annual_pct), sublabel: '(2025)', narrative: 'CBK policy anchoring price stability' },
    ],
    momentumFooterSources: 'World Bank, CBK, KNBS',
    whyNowLead: 'Critical 24-36 month window — three converging East Africa opportunities:',
    whyNowPoints: [
      { emoji: '💳', title: '1. Fintech Scale', body: 'M-Pesa and EAC payment interoperability create a $2B+ regional fintech expansion corridor from Nairobi, with open banking and BaaS platforms scaling cross-border digital finance.' },
      { emoji: '⚡', title: '2. Clean Energy', body: 'Geothermal baseload from the Rift Valley and Lake Turkana wind position Kenya as East Africa\'s cleanest power producer, attracting renewable IPP and off-grid solar investment.' },
      { emoji: '🚢', title: '3. Logistics Gateway', body: 'Mombasa port and SGR corridor upgrades reduce inland transit costs, reinforcing Kenya as the trade hub for Uganda, Rwanda, and eastern DRC under AfCFTA value chains.' },
    ],
    whyNowCallout: 'Investment Window: Kenya offers a 24-36 month positioning window as fintech rails mature and logistics infrastructure upgrades reduce regional trade friction.',
    marketAccessItems: [
      {
        emoji: '🇺🇸',
        tone: 'emerald',
        title: 'AGOA: Duty-Free U.S. Market Access',
        paragraphs: [`${countryName} is AGOA-eligible with duty-free access to the U.S. market for qualifying exports including agriculture, textiles, and manufactured goods.`],
        bullets: ['$420M+ in AGOA-eligible agricultural exports annually', 'Horticulture and specialty coffee command premium U.S. pricing', 'Fintech and digital services corridor expanding to North America'],
        footnote: 'Status: Active · AGOA eligible',
      },
      {
        emoji: '🌍',
        tone: 'emerald',
        title: 'AfCFTA: Continental Free Trade Area',
        paragraphs: [`${countryName} exports to 54 African countries duty-free under AfCFTA, accessing a combined market of 1.3B consumers.`],
        footnote: 'Regional value chains across East and West Africa',
      },
      {
        emoji: '🏔️',
        tone: 'emerald',
        title: 'EAC: East African Community',
        paragraphs: [`As the EAC's logistics gateway, ${countryName} serves 300M+ consumers across Kenya, Uganda, Tanzania, Rwanda, Burundi, South Sudan, and DRC.`],
        footnote: 'Mombasa port + SGR corridor anchor regional trade flows',
      },
    ],
  };
}

function trinidadOverview(countryName: string, m: Metrics): CountryOverviewContent {
  return {
    snapshotTitle: 'Caribbean Energy Hub',
    snapshotIntro: `${countryName} is the Caribbean's largest energy exporter and industrial base, combining petrochemicals, LNG, and manufacturing with Port of Spain's role as a regional logistics and financial gateway.`,
    snapshotMetrics: [
      { emoji: '💰', label: 'Economic Scale', value: m.gdp_current_usd ? `$${(m.gdp_current_usd / 1e9).toFixed(1)}B` : '~$28B', sublabel: 'GDP (2025)', narrative: "Caribbean's highest per-capita industrial output" },
      { emoji: '👥', label: 'Population', value: m.population_total ? `${(m.population_total / 1e6).toFixed(1)}M` : '1.4M', sublabel: 'People (2025)', narrative: 'Skilled energy and manufacturing workforce' },
      { emoji: '⚡', label: 'Energy Hub', value: 'Point Fortin', sublabel: 'LNG & Petrochemicals', narrative: 'Regional supplier of ammonia, methanol, and LNG' },
      { emoji: '📈', label: 'Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: 'GDP Growth (2025)', narrative: 'Energy prices and Guyana corridor trade supporting output' },
    ],
    momentumIntro: `${countryName}'s economy is anchored by energy exports with diversification into downstream manufacturing, maritime services, and CARICOM trade integration. Fiscal reforms and energy price normalization shape the 2025–2027 outlook.`,
    momentumMetrics: [
      { emoji: '📈', label: 'GDP Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: '(2025)', narrative: 'Energy-linked recovery with manufacturing upside' },
      { emoji: '💰', label: 'FDI Inflows', value: m.fdi_net_inflows_current_usd ? `$${(m.fdi_net_inflows_current_usd / 1e6).toFixed(0)}M` : '$1.1B', sublabel: '(2024)', narrative: 'Petrochemical and logistics corridor investment' },
      { emoji: '⚡', label: 'Energy Exports', value: '+8%', sublabel: 'YoY Volume', narrative: 'LNG and ammonia supply chains to Americas' },
      { emoji: '📉', label: 'Inflation', value: fmtPct(m.inflation_consumer_prices_annual_pct), sublabel: '(2025)', narrative: 'CBTT policy anchoring price stability' },
    ],
    momentumFooterSources: 'World Bank, CBTT, CSO Trinidad',
    whyNowLead: 'Critical 24–36 month window — three converging opportunities:',
    whyNowPoints: [
      { emoji: '⚡', title: '1. Energy Corridor', body: 'LNG and petrochemical export capacity positions Trinidad as the Caribbean energy supplier to North America and Guyana-linked industrial demand. Downstream manufacturing investment benefits from feedstock advantage.' },
      { emoji: '🚢', title: '2. Logistics Gateway', body: 'Port of Spain and Point Lisas industrial estate anchor regional transshipment and heavy industry. CARICOM single market access supports re-export models under CBI frameworks.' },
      { emoji: '🏭', title: '3. Manufacturing Scale', body: 'Steel, food processing, and assembly operations serve CARICOM demand with preferential U.S. access on eligible goods. Industrial policy targets higher value-add exports.' },
    ],
    whyNowCallout: 'Investment Window: Trinidad offers energy-linked returns with CARICOM/CBI market access as regional manufacturing scales through 2027.',
    marketAccessItems: [
      {
        emoji: '🇺🇸',
        tone: 'emerald',
        title: 'CBI: Caribbean Basin Initiative',
        paragraphs: [`${countryName} enjoys preferential U.S. market access under CBI/CARICOM for eligible petrochemical, manufacturing, and food exports.`],
        bullets: ['$1.4B+ CBI-eligible exports to the U.S.', '3,800+ product categories under preferential access', 'Energy and manufacturing supply chains to U.S. Gulf'],
        footnote: 'Status: Active · CARICOM/CBI eligible',
      },
      {
        emoji: '🏝️',
        tone: 'emerald',
        title: 'CARICOM: Single Market Access',
        paragraphs: [`${countryName} is a founding CARICOM member supplying energy and manufactured goods across 15 Caribbean economies.`],
        footnote: 'Regional energy and industrial integration',
      },
      {
        emoji: '🌎',
        tone: 'emerald',
        title: 'Guyana Energy Corridor',
        paragraphs: ['Proximity to Guyana offshore development creates logistics, services, and industrial supply chain opportunities across the southern Caribbean.'],
        footnote: 'Port of Spain–Georgetown trade lane expanding',
      },
    ],
  };
}

function barbadosOverview(countryName: string, m: Metrics): CountryOverviewContent {
  return {
    snapshotTitle: 'Eastern Caribbean Services Hub',
    snapshotIntro: `${countryName} combines high-income tourism, international financial services, and renewable energy ambition on a stable, English-speaking platform with strong institutional governance.`,
    snapshotMetrics: [
      { emoji: '💰', label: 'Economic Scale', value: m.gdp_current_usd ? `$${(m.gdp_current_usd / 1e9).toFixed(1)}B` : '~$6.5B', sublabel: 'GDP (2025)', narrative: 'Highest GDP per capita in the Eastern Caribbean' },
      { emoji: '👥', label: 'Population', value: m.population_total ? `${(m.population_total / 1e6).toFixed(1)}M` : '0.28M', sublabel: 'People (2025)', narrative: 'Highly educated services workforce' },
      { emoji: '🏦', label: 'IFS Hub', value: 'Bridgetown', sublabel: 'Financial Services', narrative: 'Regional IFC and fintech sandbox leadership' },
      { emoji: '📈', label: 'Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: 'GDP Growth (2025)', narrative: 'Tourism recovery + renewable investment' },
    ],
    momentumIntro: `${countryName}'s economy is recovering from pandemic tourism disruption with growth in financial services exports, rum and food manufacturing, and solar deployment. IMF-supported fiscal discipline supports macro stability.`,
    momentumMetrics: [
      { emoji: '📈', label: 'GDP Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: '(2025)', narrative: 'Tourism and services-led expansion' },
      { emoji: '💰', label: 'FDI Inflows', value: m.fdi_net_inflows_current_usd ? `$${(m.fdi_net_inflows_current_usd / 1e6).toFixed(0)}M` : '$420M', sublabel: '(2024)', narrative: 'Hospitality and renewable project pipeline' },
      { emoji: '✈️', label: 'Tourism', value: '+12%', sublabel: 'Arrival Growth', narrative: 'Premium long-stay segment outperforming' },
      { emoji: '📉', label: 'Inflation', value: fmtPct(m.inflation_consumer_prices_annual_pct), sublabel: '(2025)', narrative: 'CBB policy supports price stability' },
    ],
    momentumFooterSources: 'World Bank, CBB, Barbados Statistical Service',
    whyNowLead: 'Critical 24–36 month window — three converging opportunities:',
    whyNowPoints: [
      { emoji: '✈️', title: '1. Tourism Upside', body: 'Premium tourism recovery with higher RevPAR in luxury and villa segments. Grantley Adams expansion supports long-haul connectivity from Europe and North America.' },
      { emoji: '🏦', title: '2. Financial Services', body: 'International business and fintech sandbox frameworks attract regional headquarters and digital asset services with English common-law certainty.' },
      { emoji: '☀️', title: '3. Energy Transition', body: 'Solar and EV infrastructure targets reduce import dependence. CBI-eligible equipment imports support U.S.–Caribbean clean energy supply chains.' },
    ],
    whyNowCallout: 'Investment Window: Barbados offers stable, high-income Caribbean exposure with CBI access and services diversification through 2027.',
    marketAccessItems: [
      {
        emoji: '🇺🇸',
        tone: 'emerald',
        title: 'CBI: Caribbean Basin Initiative',
        paragraphs: [`${countryName} benefits from CBI duty-free entry for eligible rum, food, and light manufacturing exports to the U.S. market.`],
        bullets: ['$380M+ CBI-eligible exports annually', 'Rum and specialty food premium pricing in U.S. retail', 'IFS and BPO services to North American clients'],
        footnote: 'Status: Active · CARICOM/CBI eligible',
      },
      {
        emoji: '🏝️',
        tone: 'emerald',
        title: 'CARICOM: Eastern Caribbean Anchor',
        paragraphs: [`${countryName} leads Eastern Caribbean policy coordination and CSME services integration across 15 member states.`],
        footnote: 'Bridgetown hosts regional institutions',
      },
      {
        emoji: '🌎',
        tone: 'emerald',
        title: 'UK & EU Corridors',
        paragraphs: ['Historical UK trade ties and growing EU tourism source markets diversify beyond U.S. demand.'],
        footnote: 'Grantley Adams long-haul gateway',
      },
    ],
  };
}

function bahamasOverview(countryName: string, m: Metrics): CountryOverviewContent {
  return {
    snapshotTitle: 'Atlantic Financial & Tourism Gateway',
    snapshotIntro: `${countryName} is a high-income archipelago economy driven by tourism, offshore financial services, and maritime logistics, with Nassau as a regional wealth management and cruise hub.`,
    snapshotMetrics: [
      { emoji: '💰', label: 'Economic Scale', value: m.gdp_current_usd ? `$${(m.gdp_current_usd / 1e9).toFixed(1)}B` : '~$14B', sublabel: 'GDP (2025)', narrative: 'Largest GDP among CARICOM island economies' },
      { emoji: '👥', label: 'Population', value: m.population_total ? `${(m.population_total / 1e6).toFixed(1)}M` : '0.4M', sublabel: 'People (2025)', narrative: 'Concentrated Nassau–Freeport workforce' },
      { emoji: '🏦', label: 'IFS Center', value: 'Nassau', sublabel: 'Wealth Management', narrative: 'Offshore banking and trust services hub' },
      { emoji: '📈', label: 'Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: 'GDP Growth (2025)', narrative: 'Tourism and construction-led recovery' },
    ],
    momentumIntro: `${countryName}'s economy is rebounding on tourism arrivals, resort development, and financial services stability. Hurricane resilience investment and fiscal consolidation remain policy priorities.`,
    momentumMetrics: [
      { emoji: '📈', label: 'GDP Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: '(2025)', narrative: 'Tourism and construction driving output' },
      { emoji: '💰', label: 'FDI Inflows', value: m.fdi_net_inflows_current_usd ? `$${(m.fdi_net_inflows_current_usd / 1e6).toFixed(0)}M` : '$980M', sublabel: '(2024)', narrative: 'Resort and marina development pipeline' },
      { emoji: '🛳️', label: 'Tourism', value: '+14%', sublabel: 'Arrival Growth', narrative: 'Cruise and stopover volumes recovering' },
      { emoji: '📉', label: 'Inflation', value: fmtPct(m.inflation_consumer_prices_annual_pct), sublabel: '(2025)', narrative: 'BSD peg supports import price stability' },
    ],
    momentumFooterSources: 'World Bank, Central Bank of The Bahamas',
    whyNowLead: 'Critical 24–36 month window — three converging opportunities:',
    whyNowPoints: [
      { emoji: '🛳️', title: '1. Tourism & Real Estate', body: 'Luxury resort and second-home investment on New Providence and the Out Islands. Cruise port modernization supports higher per-visitor spend.' },
      { emoji: '🏦', title: '2. Financial Services', body: 'Wealth management, captive insurance, and family office structures attract North American and LATAM capital with tax-neutral frameworks.' },
      { emoji: '🚢', title: '3. Maritime & Logistics', body: 'Freeport container and transhipment capacity serves U.S. East Coast supply chains. CBI-eligible re-export models support regional trade.' },
    ],
    whyNowCallout: 'Investment Window: The Bahamas offers USD-pegged stability with CBI market access as tourism and IFS capacity expand through 2027.',
    marketAccessItems: [
      {
        emoji: '🇺🇸',
        tone: 'emerald',
        title: 'CBI: Caribbean Basin Initiative',
        paragraphs: [`${countryName} has preferential U.S. access under CBI for eligible tourism-linked manufacturing, seafood, and services exports.`],
        bullets: ['$720M+ CBI-eligible export corridor', 'USD currency peg reduces FX risk for U.S. investors', 'Proximity to Florida logistics hubs'],
        footnote: 'Status: Active · CBI eligible',
      },
      {
        emoji: '🏝️',
        tone: 'emerald',
        title: 'CARICOM: Regional Integration',
        paragraphs: [`${countryName} participates in CARICOM trade and policy coordination while maintaining strong bilateral U.S. economic ties.`],
        footnote: 'Nassau–Miami business corridor',
      },
      {
        emoji: '🌎',
        tone: 'emerald',
        title: 'Offshore & Maritime',
        paragraphs: ['Freeport SEZ and maritime registry support logistics, ship management, and re-export investment.'],
        footnote: 'Hurricane-resilient infrastructure upgrades underway',
      },
    ],
  };
}

function defaultOverview(countryName: string, m: Metrics): CountryOverviewContent {
  return {
    snapshotTitle: 'Country Overview',
    snapshotIntro: `${countryName} macroeconomic profile and investment context. Metrics below reflect the latest available Souvera intelligence data.`,
    snapshotMetrics: [
      { emoji: '💰', label: 'GDP', value: m.gdp_current_usd ? `$${(m.gdp_current_usd / 1e9).toFixed(1)}B` : 'Pending', sublabel: 'Current', narrative: 'Economic scale indicator' },
      { emoji: '👥', label: 'Population', value: m.population_total ? `${(m.population_total / 1e6).toFixed(1)}M` : 'Pending', sublabel: 'Total', narrative: 'Demographic base' },
      { emoji: '📈', label: 'Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: 'GDP Growth', narrative: 'Annual growth rate' },
      { emoji: '🌍', label: 'Region', value: countryName, sublabel: 'Market', narrative: 'See Trade tab for market access detail' },
    ],
    momentumIntro: `${countryName} economic momentum indicators are sourced from World Bank and national statistics agencies.`,
    momentumMetrics: [
      { emoji: '📈', label: 'GDP Growth', value: fmtPct(m.gdp_growth_annual_pct), sublabel: 'Annual', narrative: 'Latest available growth rate' },
      { emoji: '💰', label: 'GDP', value: m.gdp_current_usd ? `$${(m.gdp_current_usd / 1e9).toFixed(1)}B` : 'Pending', sublabel: 'Current', narrative: 'Economic scale' },
      { emoji: '👥', label: 'Population', value: m.population_total ? `${(m.population_total / 1e6).toFixed(1)}M` : 'Pending', sublabel: 'Total', narrative: 'Demographic base' },
      { emoji: '📉', label: 'Inflation', value: fmtPct(m.inflation_consumer_prices_annual_pct), sublabel: 'CPI', narrative: 'Consumer price index' },
    ],
    momentumFooterSources: 'World Bank, Souvera Analysis',
    whyNowLead: 'Investment context — key factors to monitor:',
    whyNowPoints: [
      { emoji: '📊', title: '1. Macro Trends', body: 'Review GDP growth, inflation, and FDI trends in the Economy tab for historical context.' },
      { emoji: '🏛️', title: '2. Policy Environment', body: 'Monitor fiscal and regulatory reforms affecting investment conditions.' },
      { emoji: '👥', title: '3. Market Dynamics', body: 'Assess demographic and sector trends in the Sectors tab.' },
    ],
    whyNowCallout: 'See Souvera Country Analysis below for editorial intelligence on timing and entry strategy.',
    marketAccessItems: [],
  };
}
