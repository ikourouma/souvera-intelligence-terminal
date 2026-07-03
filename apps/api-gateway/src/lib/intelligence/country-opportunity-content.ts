/**
 * Per-country Opportunity tab copy — Sprint C.
 * @see docs/execution/country-terminal-sprint-plan.md
 */

import { regionalOpportunityContent } from './country-regional-content';

export interface OpportunityBullet {
  label: string;
  text: string;
}

export interface OpportunityPillar {
  exportId: string;
  exportFileSlug: string;
  exportTitle: string;
  icon: 'zap' | 'trending' | 'building';
  title: string;
  subtitle: string;
  narrative: string;
  bullets: OpportunityBullet[];
  borderHover: string;
  accentClass: string;
  helpTerm: string;
}

export interface OpportunityEntryPoint {
  icon: 'building' | 'trending' | 'zap' | 'dollar';
  title: string;
  body: string;
}

export interface RegionalAdvantage {
  icon: 'globe' | 'shield' | 'users';
  value: string;
  label: string;
  sublabel: string;
  accentClass: string;
}

export interface CountryOpportunityContent {
  heroSubtitle: string;
  heroFallback: string;
  pillars: OpportunityPillar[];
  entryPoints: OpportunityEntryPoint[];
  regionalAdvantages: RegionalAdvantage[];
}

function nigeriaOpportunity(countryName: string): CountryOpportunityContent {
  return {
    heroSubtitle: 'Multi-sector opportunities at structural inflection point',
    heroFallback: `${countryName} represents a major economy at a structural inflection point, offering multi-sector investment opportunities across technology, agriculture, infrastructure, and financial services.`,
    pillars: [
      {
        exportId: 'tech-pillar-card',
        exportFileSlug: 'technology-opportunity',
        exportTitle: 'Technology Opportunity',
        icon: 'zap',
        title: 'Technology Sector',
        subtitle: "Africa's Leading Tech Hub",
        narrative: "Nigeria's technology ecosystem has reached critical mass, with Lagos emerging as Africa's leading tech hub. Fintech transaction volumes are large and growing; verify latest figures against sector sources before sizing exposure.",
        bullets: [
          { label: 'Fintech infrastructure', text: 'Payment gateways, lending platforms, digital banking' },
          { label: 'AgriTech', text: 'Supply chain digitization, farmer financing, logistics optimization' },
          { label: 'EdTech', text: 'Online learning platforms serving 45 million school-age population' },
          { label: 'E-commerce', text: 'Last-mile delivery, warehousing, B2B marketplaces' },
        ],
        borderHover: 'hover:border-blue-500/30',
        accentClass: 'text-blue-400',
        helpTerm: 'tech_sector_opportunity',
      },
      {
        exportId: 'agriculture-pillar-card',
        exportFileSlug: 'agriculture-opportunity',
        exportTitle: 'Agriculture Opportunity',
        icon: 'trending',
        title: 'Agricultural Value-Add',
        subtitle: '$10B Import Substitution Play',
        narrative: "Nigeria is Africa's largest agricultural producer but imports $10 billion in processed food annually. Massive opportunity in value-added processing and export-oriented agriculture.",
        bullets: [
          { label: 'Cassava processing', text: '60M tons/year production, minimal value-add exports' },
          { label: 'Cocoa value chain', text: '3rd largest producer, 70% exported raw' },
          { label: 'Rice milling', text: 'Closing $2B import gap' },
          { label: 'Cold chain infrastructure', text: '95% of post-harvest losses preventable' },
        ],
        borderHover: 'hover:border-emerald-500/30',
        accentClass: 'text-emerald-400',
        helpTerm: 'agriculture_opportunity',
      },
      {
        exportId: 'infrastructure-pillar-card',
        exportFileSlug: 'infrastructure-opportunity',
        exportTitle: 'Infrastructure Opportunity',
        icon: 'building',
        title: 'Infrastructure Development',
        subtitle: 'Multi-year infrastructure pipeline',
        narrative: 'A multi-year infrastructure pipeline spans power, transport, and housing — driven by urbanization. Treat headline pipeline totals as estimates until tied to structured project data.',
        bullets: [
          { label: 'Power generation', text: 'Targeting 25GW by 2030' },
          { label: 'Port modernization', text: 'Lekki Deep Sea Port Phase 2 expansion' },
          { label: 'Rail infrastructure', text: 'Lagos-Kano standard gauge railway' },
          { label: 'Housing', text: '20M unit deficit, urbanization at 3.5%/year' },
        ],
        borderHover: 'hover:border-amber-500/30',
        accentClass: 'text-amber-400',
        helpTerm: 'infrastructure_opportunity',
      },
    ],
    entryPoints: [
      { icon: 'building', title: 'Joint Ventures', body: 'Partner with Nigerian conglomerates like Dangote, BUA, Flour Mills for established market access and operational expertise' },
      { icon: 'trending', title: 'Private Equity', body: 'Mid-market tech companies at Series B-C stage with proven business models and regional expansion potential' },
      { icon: 'zap', title: 'Greenfield Projects', body: 'Special Economic Zones offering tax holidays and repatriation guarantees for new manufacturing/assembly operations' },
      { icon: 'dollar', title: 'Listed Equities', body: 'Nigerian Stock Exchange (NSE) provides liquidity for blue-chip exposure across banking, consumer goods, and industrial sectors' },
    ],
    regionalAdvantages: [
      { icon: 'globe', value: '350M', label: 'ECOWAS Market Access', sublabel: 'West African Economic Community', accentClass: 'text-blue-300' },
      { icon: 'globe', value: '1.3B', label: 'AfCFTA Access', sublabel: 'Duty-free African market', accentClass: 'text-emerald-300' },
      { icon: 'shield', value: 'AGOA', label: 'U.S. Market Access', sublabel: 'Restoration opportunity under review', accentClass: 'text-blue-300' },
      { icon: 'users', value: '200K+', label: 'Annual Graduates', sublabel: 'English-speaking skilled workforce', accentClass: 'text-emerald-300' },
    ],
  };
}

function jamaicaOpportunity(countryName: string): CountryOpportunityContent {
  return {
    heroSubtitle: 'Caribbean digital gateway at a tourism and nearshore inflection point',
    heroFallback: `${countryName} is a Caribbean economy at a digital inflection point, offering opportunities across tourism, digital infrastructure, and mining/energy transition.`,
    pillars: [
      {
        exportId: 'tech-pillar-card',
        exportFileSlug: 'digital-infrastructure-opportunity',
        exportTitle: 'Digital Infrastructure Opportunity',
        icon: 'zap',
        title: 'Digital Infrastructure & Fintech',
        subtitle: 'Caribbean Digital Gateway',
        narrative: "Jamaica leads the English-speaking Caribbean in submarine cable connectivity, cloud readiness, and fintech interoperability via the Jam-Dex CBDC pilot. Kingston is emerging as the region's nearshore delivery hub for North American firms.",
        bullets: [
          { label: 'Data centers', text: 'Edge cloud and colocation investment along Kingston corridor' },
          { label: 'BPO / nearshoring', text: 'US time-zone aligned English-speaking workforce, 30-40% cost vs US metros' },
          { label: 'Fintech rails', text: 'Jam-Dex CBDC pilot and cross-border payment modernization' },
          { label: 'E-government', text: 'Digital public services expansion driving enterprise SaaS demand' },
        ],
        borderHover: 'hover:border-blue-500/30',
        accentClass: 'text-blue-400',
        helpTerm: 'tech_sector_opportunity',
      },
      {
        exportId: 'agriculture-pillar-card',
        exportFileSlug: 'tourism-opportunity',
        exportTitle: 'Tourism Opportunity',
        icon: 'trending',
        title: 'Tourism & Hospitality',
        subtitle: 'Premium Segment Recovery',
        narrative: 'World-renowned destination with luxury segment growth, cruise port expansion, and sustainable tourism investment. Arrivals recovering with 15%+ higher average spend per visitor versus 2019.',
        bullets: [
          { label: 'Luxury resorts', text: 'High-end coastal and eco-tourism development' },
          { label: 'Cruise infrastructure', text: 'Port modernization and shore excursion investment' },
          { label: 'Agri-tourism', text: 'Blue Mountain coffee, rum, and culinary tourism exports' },
          { label: 'Sustainable tourism', text: 'ESG-aligned hospitality and community-based models' },
        ],
        borderHover: 'hover:border-emerald-500/30',
        accentClass: 'text-emerald-400',
        helpTerm: 'agriculture_opportunity',
      },
      {
        exportId: 'infrastructure-pillar-card',
        exportFileSlug: 'mining-energy-opportunity',
        exportTitle: 'Mining & Energy Opportunity',
        icon: 'building',
        title: 'Mining & Energy Transition',
        subtitle: 'Bauxite + Renewables Pipeline',
        narrative: 'Bauxite/alumina sector transitioning toward renewable energy and green hydrogen potential. Energy diversification reduces import dependence and supports ESG-aligned industrial investment.',
        bullets: [
          { label: 'Bauxite/alumina', text: 'Existing mining base with modernization and efficiency upgrades' },
          { label: 'Renewable energy', text: 'Solar and wind capacity expansion reducing fuel import bill' },
          { label: 'Green hydrogen', text: 'Early-stage potential leveraging renewable resources' },
          { label: 'Grid resilience', text: 'PPP models for rural and industrial power reliability' },
        ],
        borderHover: 'hover:border-amber-500/30',
        accentClass: 'text-amber-400',
        helpTerm: 'infrastructure_opportunity',
      },
    ],
    entryPoints: [
      { icon: 'building', title: 'Joint Ventures', body: 'Partner with established groups like GraceKennedy, Seprod, or Digicel Jamaica for market access and operational expertise' },
      { icon: 'trending', title: 'Private Equity', body: 'Tourism, digital services, and fintech at growth stage with regional expansion potential across CARICOM' },
      { icon: 'zap', title: 'Free Zone Investment', body: 'Free zone and SEZ incentives for export-oriented manufacturing, BPO, and tech services operations' },
      { icon: 'dollar', title: 'Listed Equities', body: 'Jamaica Stock Exchange (JSE) provides liquidity for banking, tourism, and consumer sector exposure' },
    ],
    regionalAdvantages: [
      { icon: 'globe', value: '15', label: 'CARICOM Members', sublabel: 'Regional single market access', accentClass: 'text-blue-300' },
      { icon: 'shield', value: 'CBI', label: 'U.S. Market Access', sublabel: 'Caribbean Basin Initiative eligible', accentClass: 'text-emerald-300' },
      { icon: 'globe', value: 'Same TZ', label: 'US Nearshore', sublabel: 'Kingston–Miami business hours alignment', accentClass: 'text-blue-300' },
      { icon: 'users', value: '$3.5B+', label: 'Remittances', sublabel: 'Diaspora corridor supporting consumption', accentClass: 'text-emerald-300' },
    ],
  };
}

function kenyaOpportunity(countryName: string): CountryOpportunityContent {
  return {
    heroSubtitle: 'East Africa fintech hub at a mobile money and logistics inflection point',
    heroFallback: `${countryName} is an East African economy at a digital and infrastructure inflection point, offering opportunities across fintech, renewables, agriculture, and logistics gateway investment.`,
    pillars: [
      {
        exportId: 'tech-pillar-card',
        exportFileSlug: 'fintech-opportunity',
        exportTitle: 'Fintech Opportunity',
        icon: 'zap',
        title: 'Fintech & Digital Finance',
        subtitle: "Africa's Mobile Money Pioneer",
        narrative: "Kenya's fintech ecosystem is built on M-Pesa's foundational infrastructure, with Nairobi hosting Africa's densest cluster of digital lenders, insurtech, and BaaS platforms. Cross-border EAC payment interoperability is scaling regional expansion.",
        bullets: [
          { label: 'Mobile money rails', text: 'M-Pesa ecosystem — billions in annual transaction volume' },
          { label: 'Digital lending', text: 'CBK-licensed lenders and SME finance platforms' },
          { label: 'BaaS / embedded finance', text: 'Banking-as-a-service for regional expansion' },
          { label: 'Insurtech', text: 'Micro-insurance and agritech-linked products' },
        ],
        borderHover: 'hover:border-blue-500/30',
        accentClass: 'text-blue-400',
        helpTerm: 'tech_sector_opportunity',
      },
      {
        exportId: 'agriculture-pillar-card',
        exportFileSlug: 'agriculture-opportunity',
        exportTitle: 'Agriculture Opportunity',
        icon: 'trending',
        title: 'Agriculture & Horticulture',
        subtitle: 'AGOA-Eligible Export Corridor',
        narrative: 'Tea, coffee, floriculture, and nut exports anchor Kenya\'s AGOA-eligible agricultural trade with Europe and the U.S. Cold chain, agritech platforms, and smallholder aggregation improve yield and market access.',
        bullets: [
          { label: 'Floriculture', text: 'JKIA air cargo hub for European supermarket supply chains' },
          { label: 'Tea & coffee', text: 'Premium branded exports with AGOA duty-free access' },
          { label: 'Agritech', text: 'Yield optimization and market linkage platforms' },
          { label: 'Cold chain', text: 'Post-harvest loss reduction for export-grade produce' },
        ],
        borderHover: 'hover:border-emerald-500/30',
        accentClass: 'text-emerald-400',
        helpTerm: 'agriculture_opportunity',
      },
      {
        exportId: 'infrastructure-pillar-card',
        exportFileSlug: 'logistics-energy-opportunity',
        exportTitle: 'Logistics & Energy Opportunity',
        icon: 'building',
        title: 'Logistics Gateway & Renewables',
        subtitle: 'Mombasa + Geothermal Leadership',
        narrative: 'Mombasa port and the SGR corridor anchor East Africa trade flows, while geothermal, wind, and solar make Kenya one of Africa\'s cleanest power producers — attractive for renewable IPP and logistics investment.',
        bullets: [
          { label: 'Mombasa port', text: 'East Africa\'s largest container throughput hub' },
          { label: 'SGR corridor', text: 'Inland freight connectivity to Nairobi industrial zones' },
          { label: 'Geothermal IPPs', text: 'Rift Valley baseload renewable generation' },
          { label: 'Mini-grids', text: 'Off-grid solar for rural electrification' },
        ],
        borderHover: 'hover:border-amber-500/30',
        accentClass: 'text-amber-400',
        helpTerm: 'infrastructure_opportunity',
      },
    ],
    entryPoints: [
      { icon: 'building', title: 'Joint Ventures', body: 'Partner with Safaricom, Equity Bank, or export agribusiness operators for EAC market access and regulatory navigation' },
      { icon: 'trending', title: 'Private Equity', body: 'Fintech, agritech, and renewable IPPs at growth stage with regional expansion potential' },
      { icon: 'zap', title: 'Greenfield EPZ', body: 'Export Processing Zone apparel and horticulture operations with AGOA duty-free U.S. access' },
      { icon: 'dollar', title: 'Listed Equities', body: 'Nairobi Securities Exchange (NSE) exposure to banking, telecom, and agribusiness sectors' },
    ],
    regionalAdvantages: [
      { icon: 'globe', value: '300M+', label: 'EAC Market Access', sublabel: 'East African Community corridor', accentClass: 'text-blue-300' },
      { icon: 'shield', value: 'AGOA', label: 'U.S. Market Access', sublabel: 'Active eligibility — duty-free exports', accentClass: 'text-emerald-300' },
      { icon: 'globe', value: '1.3B', label: 'AfCFTA Access', sublabel: 'Continental duty-free trade', accentClass: 'text-blue-300' },
      { icon: 'users', value: '56M', label: 'Mobile-First Population', sublabel: 'High digital finance adoption', accentClass: 'text-emerald-300' },
    ],
  };
}

function defaultOpportunity(countryName: string): CountryOpportunityContent {
  return {
    heroSubtitle: 'Investment opportunities across key sectors',
    heroFallback: `${countryName} offers multi-sector investment opportunities. See the Souvera Country Analysis and sector tabs for detailed intelligence.`,
    pillars: [
      {
        exportId: 'tech-pillar-card',
        exportFileSlug: 'sector-opportunity-1',
        exportTitle: 'Sector Opportunity',
        icon: 'zap',
        title: 'Primary Sector',
        subtitle: 'Growth opportunity',
        narrative: 'Review sector scores and narratives in the Sectors tab for country-specific opportunity detail.',
        bullets: [{ label: 'Sector analysis', text: 'See Sectors tab for strength, growth, and attractiveness scores' }],
        borderHover: 'hover:border-blue-500/30',
        accentClass: 'text-blue-400',
        helpTerm: 'tech_sector_opportunity',
      },
      {
        exportId: 'agriculture-pillar-card',
        exportFileSlug: 'sector-opportunity-2',
        exportTitle: 'Sector Opportunity',
        icon: 'trending',
        title: 'Secondary Sector',
        subtitle: 'Emerging opportunity',
        narrative: 'Monitor macro trends in the Economy tab for timing and entry strategy.',
        bullets: [{ label: 'Macro context', text: 'GDP growth, FDI, and inflation trends inform sector timing' }],
        borderHover: 'hover:border-emerald-500/30',
        accentClass: 'text-emerald-400',
        helpTerm: 'agriculture_opportunity',
      },
      {
        exportId: 'infrastructure-pillar-card',
        exportFileSlug: 'sector-opportunity-3',
        exportTitle: 'Sector Opportunity',
        icon: 'building',
        title: 'Infrastructure',
        subtitle: 'Development pipeline',
        narrative: 'Trade and market access frameworks are detailed in the Trade tab.',
        bullets: [{ label: 'Market access', text: 'See Trade tab for bilateral and regional frameworks' }],
        borderHover: 'hover:border-amber-500/30',
        accentClass: 'text-amber-400',
        helpTerm: 'infrastructure_opportunity',
      },
    ],
    entryPoints: [
      { icon: 'building', title: 'Joint Ventures', body: 'Partner with established local operators for market entry' },
      { icon: 'trending', title: 'Private Equity', body: 'Growth-stage companies with regional expansion potential' },
      { icon: 'zap', title: 'Greenfield', body: 'New operations in priority sectors with incentive support' },
      { icon: 'dollar', title: 'Listed Equities', body: 'Local exchange exposure where available' },
    ],
    regionalAdvantages: [
      { icon: 'globe', value: '—', label: 'Regional Access', sublabel: 'See Trade tab', accentClass: 'text-blue-300' },
      { icon: 'shield', value: '—', label: 'Trade Frameworks', sublabel: 'See Trade tab', accentClass: 'text-emerald-300' },
      { icon: 'globe', value: '—', label: 'Bilateral Partners', sublabel: 'See Trade tab', accentClass: 'text-blue-300' },
      { icon: 'users', value: '—', label: 'Workforce', sublabel: 'See Overview tab', accentClass: 'text-emerald-300' },
    ],
  };
}

function trinidadOpportunity(countryName: string): CountryOpportunityContent {
  return {
    heroSubtitle: 'Caribbean energy and industrial hub at a downstream diversification inflection',
    heroFallback: `${countryName} is a CARICOM economy combining LNG, petrochemicals, and manufacturing scale with CBI preferential U.S. access.`,
    pillars: [
      {
        exportId: 'energy-pillar-card',
        exportFileSlug: 'energy-opportunity',
        exportTitle: 'Energy Opportunity',
        icon: 'zap',
        title: 'Energy & Petrochemicals',
        subtitle: 'Regional Supply Anchor',
        narrative: `${countryName}'s Point Lisas industrial estate and Atlantic LNG train anchor Caribbean ammonia, methanol, and LNG exports with feedstock cost advantages versus import-dependent peers.`,
        bullets: [
          { label: 'LNG exports', text: 'Americas supply corridor with long-term offtake contracts' },
          { label: 'Downstream chemicals', text: 'Ammonia, urea, and methanol for agribusiness and industry' },
          { label: 'Renewable transition', text: 'Solar and wind diversification reducing gas dependence' },
        ],
        borderHover: 'hover:border-amber-500/30',
        accentClass: 'text-amber-400',
        helpTerm: 'infrastructure_opportunity',
      },
      {
        exportId: 'manufacturing-pillar-card',
        exportFileSlug: 'manufacturing-opportunity',
        exportTitle: 'Manufacturing Opportunity',
        icon: 'building',
        title: 'Manufacturing & Food Processing',
        subtitle: 'CARICOM Supply Base',
        narrative: 'Steel, beverages, and food processing serve regional demand with CBI duty-free U.S. entry on eligible goods.',
        bullets: [
          { label: 'Steel & metals', text: 'Regional construction and energy project demand' },
          { label: 'Food & beverage', text: 'CARICOM distribution with U.S. export potential' },
          { label: 'Assembly', text: 'Re-export models under CSME frameworks' },
        ],
        borderHover: 'hover:border-emerald-500/30',
        accentClass: 'text-emerald-400',
        helpTerm: 'agriculture_opportunity',
      },
      {
        exportId: 'logistics-pillar-card',
        exportFileSlug: 'logistics-opportunity',
        exportTitle: 'Logistics Opportunity',
        icon: 'trending',
        title: 'Maritime & Logistics',
        subtitle: 'Port of Spain Gateway',
        narrative: 'Deep-water port capacity and industrial logistics support Guyana corridor trade and Caribbean transshipment.',
        bullets: [
          { label: 'Transshipment', text: 'Regional cargo hub for northern South America' },
          { label: 'Offshore services', text: 'Energy services to Guyana and regional fields' },
          { label: 'Free zone', text: 'Export-oriented warehousing and assembly' },
        ],
        borderHover: 'hover:border-blue-500/30',
        accentClass: 'text-blue-400',
        helpTerm: 'tech_sector_opportunity',
      },
    ],
    entryPoints: [
      { icon: 'building', title: 'Joint Ventures', body: 'Partner with energy majors (Atlantic, Nutrien Trinidad) or manufacturers for CARICOM market access' },
      { icon: 'trending', title: 'Private Equity', body: 'Downstream petrochemical and logistics assets at brownfield expansion stage' },
      { icon: 'zap', title: 'Industrial PPPs', body: 'Port and renewable infrastructure with government co-investment' },
      { icon: 'dollar', title: 'Listed Equities', body: 'Trinidad & Tobago Stock Exchange exposure to energy and financials' },
    ],
    regionalAdvantages: [
      { icon: 'globe', value: '15', label: 'CARICOM Members', sublabel: 'Regional industrial supply', accentClass: 'text-blue-300' },
      { icon: 'shield', value: 'CBI', label: 'U.S. Market Access', sublabel: 'Duty-free eligible exports', accentClass: 'text-emerald-300' },
      { icon: 'globe', value: 'LNG', label: 'Energy Exporter', sublabel: 'Feedstock cost advantage', accentClass: 'text-amber-300' },
      { icon: 'users', value: '1.4M', label: 'Skilled Workforce', sublabel: 'Energy & engineering talent', accentClass: 'text-emerald-300' },
    ],
  };
}

function barbadosOpportunity(countryName: string): CountryOpportunityContent {
  return {
    heroSubtitle: 'High-income Caribbean services economy with tourism and IFS upside',
    heroFallback: `${countryName} offers stable governance, CBI market access, and premium tourism recovery on an Eastern Caribbean services platform.`,
    pillars: [
      {
        exportId: 'tourism-pillar-card',
        exportFileSlug: 'tourism-opportunity',
        exportTitle: 'Tourism Opportunity',
        icon: 'trending',
        title: 'Tourism & Hospitality',
        subtitle: 'Premium Segment Recovery',
        narrative: `${countryName}'s luxury villa, yacht, and long-stay segments command premium pricing with Grantley Adams connectivity to Europe and North America.`,
        bullets: [
          { label: 'Luxury resorts', text: 'West coast and south coast development pipeline' },
          { label: 'Cruise & yacht', text: 'Bridgetown port and marina investment' },
          { label: 'Rum & culinary', text: 'Branded exports under CBI preferential access' },
        ],
        borderHover: 'hover:border-emerald-500/30',
        accentClass: 'text-emerald-400',
        helpTerm: 'agriculture_opportunity',
      },
      {
        exportId: 'fintech-pillar-card',
        exportFileSlug: 'fintech-opportunity',
        exportTitle: 'Financial Services Opportunity',
        icon: 'zap',
        title: 'IFS & Fintech',
        subtitle: 'Regulated Sandbox Hub',
        narrative: 'International business companies, captive insurance, and fintech sandbox frameworks attract regional headquarters with English common-law certainty.',
        bullets: [
          { label: 'Digital assets', text: 'Sandbox-licensed crypto and payment innovators' },
          { label: 'Captive insurance', text: 'North American corporate structures' },
          { label: 'BPO services', text: 'English-speaking back-office to U.S. firms' },
        ],
        borderHover: 'hover:border-blue-500/30',
        accentClass: 'text-blue-400',
        helpTerm: 'tech_sector_opportunity',
      },
      {
        exportId: 'renewables-pillar-card',
        exportFileSlug: 'renewables-opportunity',
        exportTitle: 'Renewables Opportunity',
        icon: 'building',
        title: 'Solar & Energy Transition',
        subtitle: 'Import Reduction Thesis',
        narrative: 'Utility-scale solar and EV infrastructure targets reduce fossil import dependence with CBI-eligible equipment supply chains.',
        bullets: [
          { label: 'Utility solar', text: 'Rooftop and grid-scale deployment targets' },
          { label: 'EV charging', text: 'Tourism fleet electrification opportunity' },
          { label: 'Energy efficiency', text: 'Hospitality and commercial retrofits' },
        ],
        borderHover: 'hover:border-amber-500/30',
        accentClass: 'text-amber-400',
        helpTerm: 'infrastructure_opportunity',
      },
    ],
    entryPoints: [
      { icon: 'building', title: 'Joint Ventures', body: 'Partner with hotel groups, rum producers, or IFS administrators for market entry' },
      { icon: 'trending', title: 'Private Equity', body: 'Hospitality and renewable assets at growth stage' },
      { icon: 'zap', title: 'Greenfield Tourism', body: 'Resort and villa development with tax incentive structures' },
      { icon: 'dollar', title: 'Listed Equities', body: 'Barbados Stock Exchange exposure to banking and tourism' },
    ],
    regionalAdvantages: [
      { icon: 'globe', value: '15', label: 'CARICOM Access', sublabel: 'Eastern Caribbean anchor', accentClass: 'text-blue-300' },
      { icon: 'shield', value: 'CBI', label: 'U.S. Market Access', sublabel: 'Rum and food exports', accentClass: 'text-emerald-300' },
      { icon: 'globe', value: 'High', label: 'GDP Per Capita', sublabel: 'Stable institutional base', accentClass: 'text-blue-300' },
      { icon: 'users', value: '98%', label: 'Literacy', sublabel: 'Services-ready workforce', accentClass: 'text-emerald-300' },
    ],
  };
}

function bahamasOpportunity(countryName: string): CountryOpportunityContent {
  return {
    heroSubtitle: 'USD-pegged tourism and offshore finance gateway with maritime upside',
    heroFallback: `${countryName} is an archipelago economy combining tourism, IFS, and Freeport logistics with CBI preferential U.S. access.`,
    pillars: [
      {
        exportId: 'tourism-pillar-card',
        exportFileSlug: 'tourism-opportunity',
        exportTitle: 'Tourism Opportunity',
        icon: 'trending',
        title: 'Tourism & Real Estate',
        subtitle: 'Luxury Recovery',
        narrative: `${countryName}'s resort, cruise, and second-home markets are recovering with higher per-visitor spend on New Providence and the Out Islands.`,
        bullets: [
          { label: 'Luxury resorts', text: 'Branded hotel and villa pipeline' },
          { label: 'Cruise ports', text: 'Nassau and private island upgrades' },
          { label: 'Second homes', text: 'North American buyer demand returning' },
        ],
        borderHover: 'hover:border-emerald-500/30',
        accentClass: 'text-emerald-400',
        helpTerm: 'agriculture_opportunity',
      },
      {
        exportId: 'ifs-pillar-card',
        exportFileSlug: 'ifs-opportunity',
        exportTitle: 'Financial Services Opportunity',
        icon: 'zap',
        title: 'Offshore Finance & Trusts',
        subtitle: 'Wealth Management Hub',
        narrative: 'Banking, trust, and captive insurance structures serve North American and LATAM wealth with BSD currency stability.',
        bullets: [
          { label: 'Private banking', text: 'HNW and family office structures' },
          { label: 'Captive insurance', text: 'Corporate risk management vehicles' },
          { label: 'Fund administration', text: 'Alternative asset servicing' },
        ],
        borderHover: 'hover:border-blue-500/30',
        accentClass: 'text-blue-400',
        helpTerm: 'tech_sector_opportunity',
      },
      {
        exportId: 'maritime-pillar-card',
        exportFileSlug: 'maritime-opportunity',
        exportTitle: 'Maritime Opportunity',
        icon: 'building',
        title: 'Freeport & Maritime',
        subtitle: 'Transhipment Hub',
        narrative: 'Freeport container terminal and ship registry support logistics investment with CBI re-export frameworks.',
        bullets: [
          { label: 'Container port', text: 'U.S. East Coast transshipment corridor' },
          { label: 'Ship registry', text: 'Maritime services and crewing' },
          { label: 'Warehousing', text: 'Duty-free zone re-export models' },
        ],
        borderHover: 'hover:border-amber-500/30',
        accentClass: 'text-amber-400',
        helpTerm: 'infrastructure_opportunity',
      },
    ],
    entryPoints: [
      { icon: 'building', title: 'Joint Ventures', body: 'Partner with resort operators, port authorities, or trust administrators' },
      { icon: 'trending', title: 'Private Equity', body: 'Hospitality and marina assets with USD-denominated returns' },
      { icon: 'zap', title: 'Real Estate Development', body: 'Resort and residential projects with investment incentives' },
      { icon: 'dollar', title: 'Structured Finance', body: 'Offshore fund and captive insurance vehicles' },
    ],
    regionalAdvantages: [
      { icon: 'globe', value: 'USD', label: 'Currency Peg', sublabel: 'Reduced FX risk for investors', accentClass: 'text-emerald-300' },
      { icon: 'shield', value: 'CBI', label: 'U.S. Market Access', sublabel: 'Preferential export corridor', accentClass: 'text-emerald-300' },
      { icon: 'globe', value: '50mi', label: 'Florida Proximity', sublabel: 'Miami logistics linkage', accentClass: 'text-blue-300' },
      { icon: 'users', value: 'GDP', label: 'Economic Scale', sublabel: 'Largest CARICOM island GDP — see Economy tab', accentClass: 'text-emerald-300' },
    ],
  };
}

export function getOpportunityContent(iso3: string, countryName: string): CountryOpportunityContent {
  const key = iso3.toUpperCase();
  if (key === 'NGA') return nigeriaOpportunity(countryName);
  if (key === 'JAM') return jamaicaOpportunity(countryName);
  if (key === 'KEN') return kenyaOpportunity(countryName);
  if (key === 'TTO') return trinidadOpportunity(countryName);
  if (key === 'BRB') return barbadosOpportunity(countryName);
  if (key === 'BHS') return bahamasOpportunity(countryName);
  if (['GHA', 'ZAF', 'ETH', 'SEN', 'CIV', 'TZA', 'ZWE'].includes(key)) return wave1AfricaOpportunity(key, countryName);
  const regional = regionalOpportunityContent(key, countryName);
  if (regional) return regional;
  return defaultOpportunity(countryName);
}

function wave1AfricaOpportunity(iso3: string, countryName: string): CountryOpportunityContent {
  const profiles: Record<string, { subtitle: string; fallback: string; pillar1: string; pillar1Title?: string; pillar2: string; pillar2Title?: string; pillar3: string; regional: RegionalAdvantage[] }> = {
    GHA: { subtitle: 'West Africa mining and cocoa value-add at a stability inflection point', fallback: `${countryName} is a West African economy offering opportunities across gold mining, cocoa processing, digital finance, and Tema port logistics.`, pillar1: 'Gold mining and refinery investment anchor export revenues with AGOA-eligible processed mineral corridors.', pillar2: 'Second-largest global cocoa producer with processing and specialty export potential under AGOA duty-free access.', pillar3: 'Tema port and ECOWAS corridor positioning support re-export and AfCFTA value-chain models.', regional: [{ icon: 'globe', value: '350M', label: 'ECOWAS Market Access', sublabel: 'West African Economic Community', accentClass: 'text-blue-300' }, { icon: 'shield', value: 'AGOA', label: 'U.S. Market Access', sublabel: 'Active eligibility — duty-free exports', accentClass: 'text-emerald-300' }, { icon: 'globe', value: '1.3B', label: 'AfCFTA Access', sublabel: 'Continental duty-free trade', accentClass: 'text-blue-300' }, { icon: 'users', value: '34M', label: 'Population', sublabel: 'English-speaking workforce', accentClass: 'text-emerald-300' }] },
    ZAF: { subtitle: 'Africa\'s industrial base at an energy transition inflection point', fallback: `${countryName} is a diversified economy offering opportunities across PGMs, automotive manufacturing, renewable IPPs, and deep capital markets.`, pillar1: 'Platinum group metals and critical minerals anchor export revenues with ESG-aligned modernization.', pillar2: 'OEM automotive assembly and component exports under AGOA preferential U.S. market access.', pillar3: 'Renewable IPP rollout and rooftop solar reduce grid dependency and support long-duration returns.', regional: [{ icon: 'globe', value: '300M+', label: 'SADC Market Access', sublabel: 'Southern African Development Community', accentClass: 'text-blue-300' }, { icon: 'shield', value: 'AGOA', label: 'U.S. Market Access', sublabel: 'Active eligibility — duty-free exports', accentClass: 'text-emerald-300' }, { icon: 'globe', value: 'JSE', label: 'Capital Markets', sublabel: 'Deep equity market liquidity', accentClass: 'text-blue-300' }, { icon: 'users', value: '63M', label: 'Population', sublabel: 'Skilled industrial workforce', accentClass: 'text-emerald-300' }] },
    ETH: { subtitle: 'East Africa manufacturing hub at an EPZ and agriculture inflection point', fallback: `${countryName} is a large population economy offering opportunities across EPZ apparel, coffee exports, hydropower, and industrial zone manufacturing.`, pillar1: 'Hawassa and Eastern Industrial Zones anchor apparel manufacturing with AGOA restoration potential.', pillar2: 'Origin of Arabica coffee with specialty export corridors to U.S. and European markets.', pillar3: 'Grand Ethiopian Renaissance Dam and rail connectivity improve industrial load and logistics.', regional: [{ icon: 'globe', value: '128M', label: 'Domestic Market', sublabel: 'Second-largest population in Africa', accentClass: 'text-blue-300' }, { icon: 'shield', value: 'AGOA', label: 'Restoration Watch', sublabel: 'Suspended — restoration potential', accentClass: 'text-amber-300' }, { icon: 'globe', value: '1.3B', label: 'AfCFTA Access', sublabel: 'Continental duty-free trade', accentClass: 'text-blue-300' }, { icon: 'users', value: 'EPZ', label: 'Industrial Zones', sublabel: 'Scale apparel manufacturing', accentClass: 'text-emerald-300' }] },
    SEN: { subtitle: 'West Africa stability anchor at a phosphate and energy inflection point', fallback: `${countryName} is a stable democracy offering opportunities across phosphate mining, fisheries, offshore energy, and Diamniadio industrial zone investment.`, pillar1: 'Phosphate and mining operations anchor export revenues with AGOA-eligible derivative products.', pillar2: 'Sangomar offshore oil and gas-to-power investment diversify the energy mix.', pillar3: 'Diamniadio industrial zone attracts manufacturing and agro-processing under stable institutions.', regional: [{ icon: 'globe', value: 'UEMOA', label: 'CFA Zone Access', sublabel: 'West African monetary union', accentClass: 'text-blue-300' }, { icon: 'shield', value: 'AGOA', label: 'U.S. Market Access', sublabel: 'Active eligibility — duty-free exports', accentClass: 'text-emerald-300' }, { icon: 'globe', value: 'ECOWAS', label: 'Regional Access', sublabel: 'West African trade corridor', accentClass: 'text-blue-300' }, { icon: 'users', value: '18M', label: 'Population', sublabel: 'French-English bilingual hub', accentClass: 'text-emerald-300' }] },
    CIV: { subtitle: 'West Africa\'s fastest-growing major economy at a cocoa processing inflection point', fallback: `${countryName} is a growth economy offering opportunities across cocoa value-add, gold mining, Abidjan port logistics, and energy diversification.`, pillar1: 'World\'s largest cocoa producer with processing investment creating AGOA-eligible export corridors.', pillar2: 'Gold and manganese mining expand export revenues beyond agriculture.', pillar3: 'Abidjan port expansion supports ECOWAS and landlocked Sahel re-export models.', regional: [{ icon: 'globe', value: 'ECOWAS', label: 'Regional Hub', sublabel: 'West Africa trade gateway', accentClass: 'text-blue-300' }, { icon: 'shield', value: 'AGOA', label: 'U.S. Market Access', sublabel: 'Active eligibility — duty-free exports', accentClass: 'text-emerald-300' }, { icon: 'globe', value: '1.3B', label: 'AfCFTA Access', sublabel: 'Continental duty-free trade', accentClass: 'text-blue-300' }, { icon: 'users', value: '29M', label: 'Population', sublabel: 'Fast-growing consumer base', accentClass: 'text-emerald-300' }] },
    TZA: { subtitle: 'East Africa resource economy at a mining and EPZ apparel inflection point', fallback: `${countryName} is an East African economy offering opportunities across gold mining, EPZ apparel, cashew agriculture, and Dar es Salaam port logistics.`, pillar1: 'Gold mining operations anchor export revenues with nickel and graphite emerging.', pillar2: 'Export Processing Zones target U.S. apparel markets under AGOA duty-free access.', pillar3: 'Dar es Salaam port upgrades support landlocked EAC partner re-exports.', regional: [{ icon: 'globe', value: 'EAC', label: 'East African Community', sublabel: 'Regional single market access', accentClass: 'text-blue-300' }, { icon: 'shield', value: 'AGOA', label: 'U.S. Market Access', sublabel: 'Active eligibility — duty-free exports', accentClass: 'text-emerald-300' }, { icon: 'globe', value: '1.3B', label: 'AfCFTA Access', sublabel: 'Continental duty-free trade', accentClass: 'text-blue-300' }, { icon: 'users', value: '67M', label: 'Population', sublabel: 'Large domestic market', accentClass: 'text-emerald-300' }] },
    ZWE: { subtitle: 'Southern Africa mineral wealth at an AGOA restoration and reform inflection point', fallback: `${countryName} is a Southern African economy offering opportunities across mining, agriculture, and regional trade positioning despite AGOA suspension since 2001.`, pillar1: 'Platinum group metals, lithium, and chrome reserves anchor export revenues with potential AGOA-eligible processed mineral corridors.', pillar2: 'Traditional tobacco exporter diversifying to horticulture, coffee, and agro-processing with value-add potential.', pillar3: 'SADC and COMESA positioning support regional re-export and AfCFTA value-chain models.', regional: [{ icon: 'globe', value: 'SADC', label: 'Regional Access', sublabel: 'Southern African Development Community', accentClass: 'text-blue-300' }, { icon: 'shield', value: 'AGOA', label: 'Restoration Opportunity', sublabel: 'Suspended 2001 — restoration potential', accentClass: 'text-amber-300' }, { icon: 'globe', value: 'COMESA', label: 'East Africa Access', sublabel: 'Common Market 560M consumers', accentClass: 'text-blue-300' }, { icon: 'globe', value: '1.3B', label: 'AfCFTA Access', sublabel: 'Continental duty-free trade', accentClass: 'text-blue-300' }] },
  };
  const p = profiles[iso3] ?? profiles.GHA;
  return {
    heroSubtitle: p.subtitle,
    heroFallback: p.fallback,
    pillars: [
      { exportId: 'tech-pillar-card', exportFileSlug: 'sector-opportunity-1', exportTitle: 'Primary Sector Opportunity', icon: 'zap', title: p.pillar1Title ?? 'Primary Sector', subtitle: 'Anchor export and value-add', narrative: p.pillar1, bullets: [
        { label: 'Export anchor', text: 'Resource and commodity exports underpin foreign-exchange earnings' },
        { label: 'Value-add', text: 'Processing and beneficiation capture margin beyond raw exports' },
        { label: 'Market access', text: 'AGOA and AfCFTA frameworks support preferential export corridors' },
      ], borderHover: 'hover:border-blue-500/30', accentClass: 'text-blue-400', helpTerm: 'tech_sector_opportunity' },
      { exportId: 'agriculture-pillar-card', exportFileSlug: 'sector-opportunity-2', exportTitle: 'Secondary Sector Opportunity', icon: 'trending', title: p.pillar2Title ?? 'Agriculture & Agro-Processing', subtitle: 'Diversification and specialty exports', narrative: p.pillar2, bullets: [
        { label: 'Specialty crops', text: 'Premium commodities command pricing power in export markets' },
        { label: 'Agro-processing', text: 'Value-add conversion is the highest-margin opportunity' },
        { label: 'Cold chain', text: 'Logistics investment extends year-round export capacity' },
      ], borderHover: 'hover:border-emerald-500/30', accentClass: 'text-emerald-400', helpTerm: 'agriculture_opportunity' },
      { exportId: 'infrastructure-pillar-card', exportFileSlug: 'sector-opportunity-3', exportTitle: 'Infrastructure Opportunity', icon: 'building', title: 'Infrastructure & Logistics', subtitle: 'Development pipeline', narrative: p.pillar3, bullets: [
        { label: 'Renewable power', text: 'Solar, wind, and hydro IPPs address reliability and access gaps' },
        { label: 'Logistics', text: 'Port and corridor upgrades reduce trade costs and lead times' },
        { label: 'Regional integration', text: 'Cross-border corridors enable AfCFTA value-chain models' },
      ], borderHover: 'hover:border-amber-500/30', accentClass: 'text-amber-400', helpTerm: 'infrastructure_opportunity' },
    ],
    entryPoints: [
      { icon: 'building', title: 'Joint Ventures', body: `Partner with established local operators in ${countryName} for market entry and regulatory navigation` },
      { icon: 'trending', title: 'Private Equity', body: 'Growth-stage companies with regional expansion potential across priority sectors' },
      { icon: 'zap', title: 'Greenfield', body: 'New operations in priority sectors with incentive support and AGOA market access where eligible' },
      { icon: 'dollar', title: 'Listed Equities', body: 'Local exchange exposure where available for sector diversification' },
    ],
    regionalAdvantages: p.regional,
  };
}
