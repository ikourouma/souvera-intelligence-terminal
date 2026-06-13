import type { SectorOverviewContent } from '@/components/sectors/SectorOverviewTemplate';

export const FINTECH_SECTOR: SectorOverviewContent = {
  slug: 'fintech',
  tagline: 'Sector Intelligence',
  title: 'Fintech & Digital Finance',
  subtitle: 'The infrastructure layer for Africa and the Caribbean\'s financial leapfrog.',
  description:
    'Mobile money, instant payments, embedded finance, and regulatory sandboxes are converging into a $14B+ African fintech market and a fast-maturing Caribbean digital corridor. Souvera tracks licensing regimes, payment interoperability, remittance flows, and institutional capital deployment across 50+ markets.',
  marketSize: '$14B+ African fintech market',
  growthSignal: 'High growth · Regulatory maturation',
  keyMarketIso3: ['NGA', 'KEN', 'ZAF', 'JAM', 'GHA'],
  primaryCta: { label: 'Explore Nigeria Terminal', href: '/country/NGA?tab=sectors' },
  secondaryCta: { label: 'Africa Intelligence Map', href: '/intelligence/map' },
  themes: [
    {
      id: 'payments',
      title: 'Payments & Mobile Money',
      description:
        'Agent networks, instant payment rails, and cross-border settlement are expanding financial inclusion. Nigeria and Kenya lead volume; Caribbean markets leverage remittance corridors and nearshore BPO-linked digital services.',
    },
    {
      id: 'regulation',
      title: 'Regulatory Sandboxes & Licensing',
      description:
        'Central banks are formalizing PSP licensing, open banking frameworks, and CBDC pilots. Policy clarity is the gating factor for institutional scale-up and foreign strategic investment.',
    },
    {
      id: 'embedded',
      title: 'Embedded Finance & BaaS',
      description:
        'Banking-as-a-service and API-driven lending are enabling telcos, retailers, and platforms to originate financial products without full banking licenses — reshaping unit economics for SME credit.',
    },
    {
      id: 'capital',
      title: 'Capital Flows & Exits',
      description:
        'Venture and growth equity remain active in payments infrastructure; consolidation is emerging among super-apps. Due diligence requires FX exposure, regulatory capital, and cross-border compliance mapping.',
    },
  ],
};

export const ENERGY_SECTOR: SectorOverviewContent = {
  slug: 'energy',
  tagline: 'Sector Intelligence',
  title: 'Energy & Renewables',
  subtitle: 'From hydrocarbons to green hydrogen — dual-track transition across two regions.',
  description:
    'Africa\'s energy story spans LNG expansion, utility-scale solar, and critical grid modernization. The Caribbean is pivoting from import dependence toward renewables and Guyana–Trinidad hydrocarbon growth. Souvera tracks generation mix, IPP pipelines, and transition policy for institutional allocators.',
  marketSize: '$28B+ transition investment pipeline',
  growthSignal: 'Emerging · Policy-driven',
  keyMarketIso3: ['NGA', 'AGO', 'ZAF', 'JAM', 'GUY', 'TTO'],
  primaryCta: { label: 'Explore Jamaica Terminal', href: '/country/JAM?tab=sectors' },
  secondaryCta: { label: 'View Methodology', href: '/insights/methodology' },
  themes: [
    {
      id: 'renewables',
      title: 'Renewables & Grid Modernization',
      description:
        'Solar IPPs, wind corridors, and distributed generation are accelerating where regulatory frameworks support net billing and offtake certainty. Grid reliability remains the binding constraint in many markets.',
    },
    {
      id: 'lng',
      title: 'LNG & Gas-to-Power',
      description:
        'West and Southern Africa LNG projects and Caribbean gas diversification reduce fuel-import volatility. Conversion economics depend on domestic distribution infrastructure and tariff reform.',
    },
    {
      id: 'hydrogen',
      title: 'Green Hydrogen & Critical Minerals Linkage',
      description:
        'Namibia, South Africa, and Morocco anchor early green hydrogen ambitions tied to renewable endowments and export corridor planning — intersecting with critical minerals supply chains.',
    },
    {
      id: 'policy',
      title: 'Transition Policy & PPP Frameworks',
      description:
        'National integrated resource plans, local content rules, and PPP structures determine bankability. Institutional investors require transparent tariff paths and currency convertibility assurances.',
    },
  ],
};

export const LOGISTICS_SECTOR: SectorOverviewContent = {
  slug: 'logistics',
  tagline: 'Sector Intelligence',
  title: 'Logistics & Trade',
  subtitle: 'AfCFTA corridors, port modernization, and the new geography of African and Caribbean trade.',
  description:
    'Trade logistics is the operational backbone of regional integration — from Lagos–Accra manufacturing corridors to Kingston transshipment hubs. Souvera tracks port throughput, cold-chain capacity, customs digitization, and corridor investment pipelines across 50+ markets for DFIs, freight operators, and trade finance institutions.',
  marketSize: '$25B+ logistics modernization pipeline',
  growthSignal: 'Emerging · AfCFTA & CARICOM driven',
  keyMarketIso3: ['KEN', 'ZAF', 'MAR', 'NGA', 'JAM', 'TTO'],
  primaryCta: { label: 'Explore Nigeria Trade Tab', href: '/country/NGA?tab=trade' },
  secondaryCta: { label: 'AfCFTA Intelligence', href: '/insights/news/afcfta-trade-corridor-momentum-2026' },
  themes: [
    {
      id: 'ports',
      title: 'Ports & Maritime Gateways',
      description:
        'Deep-water expansion, container terminal concessions, and transshipment positioning define competitive advantage. West Africa (Tema, Lekki) and East Africa (Mombasa, Dar) compete for AfCFTA-linked manufacturing exports; Caribbean hubs capture nearshoring reroutes.',
    },
    {
      id: 'afcfta',
      title: 'AfCFTA Trade Corridors',
      description:
        'Rules of origin, digital customs, and bonded warehouse networks are lowering intra-African friction. Nigeria and Ghana anchor West African manufacturing corridors targeting multi-billion-dollar export scale by 2027.',
    },
    {
      id: 'cold-chain',
      title: 'Cold Chain & Agro-Logistics',
      description:
        'Perishable exports (cocoa, horticulture, seafood) require temperature-controlled infrastructure. Investment in cold storage, reefer fleets, and inspection modernization unlocks premium market access to Europe and North America.',
    },
    {
      id: 'finance',
      title: 'Trade Finance & Supply Chain',
      description:
        'Receivables finance, warehouse receipt systems, and corridor risk scoring enable SME participation in regional trade. Institutional allocators focus on operators with multi-country licenses and digitized customs integration.',
    },
  ],
};

export const AGRICULTURE_SECTOR: SectorOverviewContent = {
  slug: 'agriculture',
  tagline: 'Sector Intelligence',
  title: 'Agriculture & Agribusiness',
  subtitle: 'Food security, export crops, and agritech at continental scale.',
  description:
    'Africa holds roughly 60% of the world\'s uncultivated arable land; the Caribbean combines specialty exports with food-import vulnerability. Souvera tracks yield trends, processing capacity, AfCFTA agro-trade flows, and institutional capital in mechanization, irrigation, and value-add infrastructure.',
  marketSize: '$180B+ agribusiness opportunity',
  growthSignal: 'Stable · Food security priority',
  keyMarketIso3: ['ETH', 'KEN', 'CIV', 'NGA', 'JAM', 'GUY'],
  primaryCta: { label: 'Explore Nigeria Sectors', href: '/country/NGA?tab=sectors' },
  secondaryCta: { label: 'Africa Intelligence', href: '/intelligence/africa' },
  themes: [
    {
      id: 'export-crops',
      title: 'Export Crops & Commodity Corridors',
      description:
        'Cocoa, coffee, cashew, and horticulture anchor foreign exchange for West and East Africa. Processing localization — not raw export alone — determines margin capture and job creation along AfCFTA value chains.',
    },
    {
      id: 'food-security',
      title: 'Food Security & Import Substitution',
      description:
        'Rice, wheat, and edible oil import bills remain structural vulnerabilities. Governments are incentivizing domestic production through input subsidies, tariff policy, and strategic grain reserve partnerships.',
    },
    {
      id: 'agritech',
      title: 'Agritech & Precision Agriculture',
      description:
        'Digital extension, yield forecasting, warehouse receipt financing, and last-mile input distribution are scaling via mobile penetration. Investors target platforms with proven smallholder reach and offtake agreements.',
    },
    {
      id: 'caribbean-agro',
      title: 'Caribbean Agro-Export & Blue Economy',
      description:
        'Jamaica\'s specialty crops, fisheries, and agro-processing support CBI-linked exports. Climate resilience, hurricane exposure, and water management are central to due diligence for hospitality-linked food supply chains.',
    },
  ],
};

export const CRITICAL_MINERALS_SECTOR: SectorOverviewContent = {
  slug: 'critical-minerals',
  tagline: 'Sector Intelligence',
  title: 'Mining & Critical Minerals',
  subtitle: 'Battery metals, strategic reserves, and the geopolitics of the energy transition.',
  description:
    'Cobalt, lithium, copper, manganese, and rare earths anchor EV and renewable supply chains. Africa holds the majority of global cobalt and significant lithium discoveries; Caribbean bauxite and emerging offshore resources add regional depth. Souvera tracks licensing, offtake agreements, beneficiation policy, and ESG governance for institutional allocators.',
  marketSize: '$320B+ transition minerals market',
  growthSignal: 'High growth · Geopolitical priority',
  keyMarketIso3: ['COD', 'ZMB', 'ZAF', 'ZWE', 'GHA', 'JAM'],
  primaryCta: { label: 'Explore Jamaica Mining Sector', href: '/country/JAM?tab=sectors' },
  secondaryCta: { label: 'Country Comparison', href: '/intelligence/compare' },
  themes: [
    {
      id: 'battery-metals',
      title: 'Battery Metals & EV Supply Chain',
      description:
        'Cobalt, lithium, nickel, and graphite demand scales with global EV adoption. DRC–Zambia copper-belt integration and West African lithium discoveries are reshaping upstream investment timelines and offtake competition.',
    },
    {
      id: 'beneficiation',
      title: 'Beneficiation & Local Value Add',
      description:
        'Export ban debates and local processing mandates (DRC, Zimbabwe, Indonesia-model parallels) force investors to evaluate refinery co-location, power availability, and fiscal stability before committing capital.',
    },
    {
      id: 'governance',
      title: 'ESG, Artisanal Mining & Governance',
      description:
        'Traceability, OECD due diligence, and community benefit frameworks are non-negotiable for OECD-market offtake. Institutional capital favors operators with verified chain-of-custody and transparent royalty structures.',
    },
    {
      id: 'caribbean-minerals',
      title: 'Caribbean Bauxite & Offshore Resources',
      description:
        'Jamaica\'s bauxite–alumina corridor and Guyana\'s hydrocarbon-linked infrastructure spend create adjacent mining services opportunities. Hurricane and environmental compliance shape operational risk profiles.',
    },
  ],
};

export const TOURISM_HOSPITALITY_SECTOR: SectorOverviewContent = {
  slug: 'tourism-hospitality',
  tagline: 'Sector Intelligence',
  title: 'Tourism & Hospitality',
  subtitle: 'Visitor economies, aviation connectivity, and institutional hospitality capital.',
  description:
    'Tourism contributes double-digit GDP share across much of the Caribbean and is recovering strongly in East and Southern Africa. Souvera tracks arrival trends, hotel pipeline, cruise traffic, aviation agreements, and diaspora travel patterns for tourism boards, hospitality REITs, and development finance institutions.',
  marketSize: '$40B+ Caribbean visitor economy',
  growthSignal: 'Stable · Post-recovery expansion',
  keyMarketIso3: ['JAM', 'BHS', 'BRB', 'KEN', 'ZAF', 'TZA'],
  primaryCta: { label: 'Explore Jamaica Terminal', href: '/country/JAM?tab=sectors' },
  secondaryCta: { label: 'Caribbean Intelligence', href: '/intelligence/caribbean' },
  themes: [
    {
      id: 'visitor-economy',
      title: 'Visitor Economy & FX Contribution',
      description:
        'Arrivals, spend per visitor, and employment multipliers define macro resilience. Jamaica\'s Q1 recovery and Kenya\'s safari corridor growth illustrate divergent post-pandemic trajectories with common infrastructure bottlenecks.',
    },
    {
      id: 'hospitality-investment',
      title: 'Hospitality Investment & Pipeline',
      description:
        'Branded hotel concessions, luxury resort development, and mixed-use tourism real estate attract institutional capital. CBI-linked investment and all-inclusive resort models require distinct underwriting frameworks.',
    },
    {
      id: 'aviation',
      title: 'Aviation & Air Connectivity',
      description:
        'Route development, open-skies agreements, and hub positioning (Addis, Nairobi, Kingston) determine destination accessibility. Airport expansion projects are primary enablers of sustained arrival growth.',
    },
    {
      id: 'resilience',
      title: 'Climate Resilience & Eco-Tourism',
      description:
        'Hurricane exposure, reef health, and water stress are material risk factors in the Caribbean. Eco-tourism and heritage assets in Africa offer differentiation but require community benefit and carrying-capacity planning.',
    },
  ],
};

export const DIGITAL_INFRASTRUCTURE_SECTOR: SectorOverviewContent = {
  slug: 'digital-infrastructure',
  tagline: 'Sector Intelligence',
  title: 'Digital Infrastructure',
  subtitle: 'Broadband, cloud, digital public infrastructure, and sovereign AI readiness.',
  description:
    'Digital infrastructure is the enabling layer for fintech, government modernization, and nearshore services. Souvera assesses fiber backbone deployment, submarine cable landing, data center capacity, e-government maturity, and cybersecurity posture across African and Caribbean markets for telcos, hyperscalers, and DFIs.',
  marketSize: '50+ markets under coverage',
  growthSignal: 'High growth · Leapfrog adoption',
  keyMarketIso3: ['NGA', 'KEN', 'ZAF', 'RWA', 'JAM', 'BRB'],
  primaryCta: { label: 'Explore Jamaica Fintech Sector', href: '/country/JAM?tab=sectors' },
  secondaryCta: { label: 'Digital Finance Sector', href: '/sectors/fintech' },
  themes: [
    {
      id: 'broadband',
      title: 'Broadband & Fiber Backbone',
      description:
        'National backbone rollout, last-mile fiber, and submarine cable diversity (WACS, ACE, AMX-1) determine latency and redundancy. Urban–rural divide remains the primary policy and investment challenge.',
    },
    {
      id: 'cloud',
      title: 'Cloud & Data Center Readiness',
      description:
        'Hyperscaler entry, colocation capacity, and edge nodes support enterprise and government cloud adoption. Power reliability and data sovereignty laws shape market entry sequencing.',
    },
    {
      id: 'dpi',
      title: 'Digital Public Infrastructure',
      description:
        'National ID, interoperable payments, and open API registries (India Stack–style models adapted locally) accelerate financial inclusion and e-government. Rwanda and Nigeria lead continental DPI experimentation.',
    },
    {
      id: 'cyber',
      title: 'Cybersecurity & Institutional Readiness',
      description:
        'Rising digital transaction volume increases attack surface. Central bank cyber frameworks, CERT maturity, and critical infrastructure protection determine institutional confidence in digital scale-up.',
    },
  ],
};

