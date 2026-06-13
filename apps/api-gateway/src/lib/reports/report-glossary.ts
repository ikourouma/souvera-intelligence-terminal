/**
 * Key terms glossary for Country Profile reports — written for investors new to the market.
 */

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface ReportGlossary {
  intro: string;
  paragraphs: string[];
  terms: GlossaryTerm[];
}

const CORE_TERMS: GlossaryTerm[] = [
  {
    term: 'IMF (International Monetary Fund)',
    definition:
      'A global institution that monitors economic stability, provides policy advice, and lends to countries facing balance-of-payments crises. IMF forecasts and program reviews are widely cited in sovereign and corporate credit analysis.',
  },
  {
    term: 'World Bank',
    definition:
      'Multilateral development bank focused on poverty reduction and infrastructure. Its Doing Business successor indicators, country economic updates, and project pipelines inform sector entry timing.',
  },
  {
    term: 'GDP (Gross Domestic Product)',
    definition:
      'The total value of goods and services produced within a country in a given period. GDP scale indicates market size; GDP growth signals expansion or contraction of economic activity.',
  },
  {
    term: 'FDI (Foreign Direct Investment)',
    definition:
      'Cross-border investment where a foreign entity establishes lasting interest in a local enterprise (greenfield, joint venture, or acquisition). FDI inflows signal international confidence in a market.',
  },
  {
    term: 'CPI / Inflation',
    definition:
      'Consumer Price Index measures average price changes for household goods and services. Elevated inflation erodes purchasing power and can pressure interest rates and currency stability.',
  },
  {
    term: 'FX / Exchange Rate',
    definition:
      'The price of one currency in terms of another (e.g., local currency per U.S. dollar). Exchange-rate movements affect import costs, export competitiveness, and the dollar value of local earnings.',
  },
  {
    term: 'AGOA (African Growth and Opportunity Act)',
    definition:
      'U.S. trade preference program granting eligible African countries duty-free access for thousands of product lines. Eligibility is subject to annual U.S. Presidential review and can be restored or suspended.',
  },
  {
    term: 'AfCFTA (African Continental Free Trade Area)',
    definition:
      'Pan-African agreement creating a single market of 54 countries and 1.3 billion consumers, with phased tariff elimination. Enables regional manufacturing hubs and cross-border supply chains.',
  },
  {
    term: 'ECOWAS (Economic Community of West African States)',
    definition:
      'Regional bloc of 15 West African nations promoting free movement of goods, services, and people. Membership provides duty-free regional trade and harmonized investment protocols.',
  },
  {
    term: 'CBI (Caribbean Basin Initiative)',
    definition:
      'U.S. preferential trade program for Caribbean Basin countries, allowing duty-free entry for many goods exported to the United States when eligibility criteria are met.',
  },
  {
    term: 'CARICOM (Caribbean Community)',
    definition:
      'Political and economic union of Caribbean states. The CSME (Caribbean Single Market and Economy) component supports regional labor mobility and services trade.',
  },
  {
    term: 'MIGA (Multilateral Investment Guarantee Agency)',
    definition:
      'World Bank Group agency providing political risk insurance against expropriation, currency inconvertibility, and breach of contract — commonly used to de-risk greenfield FDI.',
  },
  {
    term: 'DFC (U.S. International Development Finance Corporation)',
    definition:
      'U.S. government development finance institution offering loans, equity, and political risk insurance for projects in emerging markets, often alongside private capital.',
  },
  {
    term: 'Afreximbank (African Export-Import Bank)',
    definition:
      'Pan-African multilateral bank specializing in trade finance, export development, and intra-African trade facilitation. Key counterparty for AfCFTA corridor transactions.',
  },
  {
    term: 'Special Economic Zone (SEZ)',
    definition:
      'Designated geographic area offering tax holidays, streamlined customs, and repatriation guarantees to attract manufacturing and export-oriented investment.',
  },
  {
    term: 'Joint Venture (JV)',
    definition:
      'Partnership between a foreign investor and a local company sharing ownership, capital, and operational responsibility. JVs accelerate market access and navigate regulatory complexity.',
  },
  {
    term: 'Political Risk Insurance (PRI)',
    definition:
      'Coverage protecting investors against government actions such as expropriation, war, civil disturbance, and currency transfer restrictions. Offered by MIGA, DFC, and private insurers.',
  },
  {
    term: 'Letter of Credit (L/C)',
    definition:
      'Bank guarantee that a buyer\'s payment to a seller will be received on time and for the correct amount. Standard instrument in commodity and cross-border goods trade.',
  },
  {
    term: 'Souvera Signal Scan',
    definition:
      'Souvera\'s proprietary synthesis of macro momentum, FDI trends, inflation trajectory, and sector leadership — producing an actionable investment-window badge updated with terminal data.',
  },
  {
    term: 'S/G/A Scorecard',
    definition:
      'Souvera sector scoring framework: Strength (current competitive position), Growth (expansion trajectory), and Attractiveness (investment appeal). Scores run 0–100; higher indicates stronger positioning.',
  },
];

export function buildReportGlossary(countryName: string, region?: string): ReportGlossary {
  const regionNote =
    region?.toLowerCase().includes('africa')
      ? 'Africa-focused frameworks (AGOA, AfCFTA, ECOWAS) appear throughout this profile.'
      : region?.toLowerCase().includes('caribbean')
        ? 'Caribbean frameworks (CBI, CARICOM) appear throughout this profile.'
        : 'Regional trade frameworks referenced in this profile are defined below.';

  return {
    intro:
      'This glossary defines key institutions, economic indicators, and trade programs referenced in this Country Profile.',
    paragraphs: [
      `${countryName} sits within a complex landscape of multilateral institutions, regional trade blocs, and development finance channels. This report assumes no prior familiarity with local acronyms or global development architecture — every term below is explained for first-time investors and board-level readers.`,
      `Understanding these definitions helps interpret macro data, market-access status, and risk mitigation options in the sections that follow. ${regionNote} Souvera Intelligence Terminal surfaces live status for each framework in the country terminal Market Access tab.`,
    ],
    terms: CORE_TERMS,
  };
}
