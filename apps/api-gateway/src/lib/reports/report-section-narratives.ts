/**
 * Expanded institutional narratives for Country Profile PDF sections.
 * Each section targets 2–3 short paragraphs for investors new to the market.
 */

import { getCountryRegion } from '@/lib/intelligence/country-overview-content';
import type { CountryProfileReportData } from './country-profile-data';
import type { EconomyTabCopy } from '@/lib/intelligence/country-economy-content';
import type { TradeTabCopy } from '@/lib/intelligence/country-trade-content';
import type { CountryOpportunityContent } from '@/lib/intelligence/country-opportunity-content';
import type { CountryRiskContent } from '@/lib/intelligence/country-risk-content';

const ENTRY_POINT_EXPANSIONS: Record<string, string> = {
  'Joint Ventures':
    'A joint venture pairs your capital and expertise with a local partner who holds licenses, land access, distribution networks, and government relationships. For first-time entrants, JVs reduce regulatory friction and accelerate time-to-revenue compared to wholly owned subsidiaries.',
  'Private Equity':
    'Private equity invests in established companies with proven revenue — typically Series B through pre-IPO — rather than building operations from scratch. This channel suits investors seeking growth equity exposure without day-to-day operational burden.',
  'Greenfield Projects':
    'Greenfield investment means building new facilities on undeveloped sites — factories, warehouses, or processing plants. Special Economic Zones often bundle tax incentives, customs clearance, and repatriation guarantees for greenfield exporters.',
  'Listed Equities':
    'Public markets provide liquid exposure to blue-chip local companies. Exchange-listed equities suit portfolio investors who want tradable positions rather than illiquid private stakes.',
};

export function expandEntryPoint(title: string, baseBody: string): string {
  const key = Object.keys(ENTRY_POINT_EXPANSIONS).find((k) =>
    title.toLowerCase().includes(k.toLowerCase())
  );
  const expansion = key ? ENTRY_POINT_EXPANSIONS[key] : '';
  const parts = [baseBody, expansion].filter(Boolean);
  return parts.join(' ');
}

export function buildGeographyNarratives(
  data: CountryProfileReportData,
  capital?: string,
  population?: string,
  gdp?: string
): { intro: string; paragraphs: string[] } {
  const { name, region } = data.country;
  const regionKey = getCountryRegion(data.country.iso3);
  const pop = population ?? data.metrics.find((m) => m.label.includes('Population'))?.value;
  const gdpVal = gdp ?? data.metrics.find((m) => m.label.includes('GDP (current'))?.value;

  const intro = `${name} occupies a strategic position within ${region ?? 'its regional'} economic geography — a market profile designed for investors who may not yet know the country's location, scale, or demographic advantage.`;

  const p1 =
    regionKey === 'africa'
      ? `${name} is part of Sub-Saharan Africa's frontier and emerging-market corridor, where AfCFTA continental integration is reshaping supply chains and manufacturing location decisions. The country connects West, East, or Central African trade routes depending on its coastal and land-border profile.`
      : regionKey === 'caribbean'
        ? `${name} sits in the Caribbean Basin — a nearshore corridor with preferential U.S. trade linkages (CBI/CARICOM), tourism-driven services exports, and growing digital-services nearshoring in capital cities.`
        : `${name} is an emerging market jurisdiction in Souvera's institutional coverage, with regional trade agreements and bilateral partners shaping export opportunity.`;

  const p2 = capital
    ? `The administrative capital is ${capital}, which hosts core policy institutions, while commercial hubs often concentrate financial services, logistics, and technology clusters. Understanding this urban hierarchy helps investors site operations, hire talent, and engage regulators.`
    : `Administrative and commercial centers anchor policy-making and private-sector activity. Investors should map where regulators, ports, and talent pools concentrate before committing capital.`;

  const p3 =
    pop && gdpVal
      ? `With a population of ${pop} and economic output of ${gdpVal}, ${name} offers scale sufficient for consumer markets, labor-intensive manufacturing, and services expansion — subject to infrastructure and market-access conditions detailed later in this profile.`
      : `${name}'s population scale and economic output — summarized in the fact panel below — determine addressable market size, labor availability, and domestic demand depth for greenfield and expansion investments.`;

  return { intro, paragraphs: [p1, p2, p3] };
}

export function buildPoliticalNarratives(
  name: string,
  risk: CountryRiskContent
): { intro: string; paragraphs: string[] } {
  const intro = `Political environment assessment for ${name} — governance quality, institutional stability, and security conditions that affect investment timelines and capital repatriation.`;

  const p1 = `${name}'s political landscape spans ${risk.political.subtitle.toLowerCase()}. For international investors, political risk is not abstract: it determines contract enforcement, license continuity, tax policy stability, and the security of personnel and assets on the ground.`;

  const leadItem = risk.political.items[0];
  const p2 = leadItem
    ? `${leadItem.title} (${leadItem.severity}): ${leadItem.body} Souvera monitors election cycles, security hotspots, and governance indicators alongside macro data because political shocks often precede currency and FDI volatility.`
    : `${name} requires ongoing monitoring of governance, security, and corruption indicators. Political transitions and regional security dynamics can shift investor sentiment independently of macro fundamentals.`;

  const p3 =
    risk.political.mitigatingFactor?.body ??
    'Mitigating factors include institutional anchors (central bank independence, IMF/World Bank engagement), private-sector resilience through prior volatility cycles, and international oversight frameworks that constrain abrupt policy reversals.';

  return { intro, paragraphs: [p1, p2, p3] };
}

export function buildTradeNarratives(
  name: string,
  data: CountryProfileReportData,
  tradeCopy: TradeTabCopy
): {
  intro: string;
  paragraphs: string[];
  regionalFrameworkIntro: string;
  sectorScorecardIntro: string;
  marketAccessIntro: string;
} {
  const exports = data.tradeSummary?.exportsUsd ?? 'N/A';
  const imports = data.tradeSummary?.importsUsd ?? 'N/A';
  const partners = data.tradeSummary?.topPartners
    .map((p) => `${p.country}${p.sharePct != null ? ` (${p.sharePct}%)` : ''}`)
    .join(', ');

  const intro = `Trade and sector analysis for ${name} — how the country connects to global and regional markets, and where export-oriented investment can capture preferential access.`;

  const p1 = data.tradeSummary
    ? `${name} recorded approximately ${exports} in goods exports and ${imports} in imports in the latest Souvera trade registry refresh. ${tradeCopy.heroSubtitle}. Bilateral concentration matters: top partners${partners ? ` include ${partners}` : ''} shape currency earnings, supply-chain dependence, and geopolitical exposure.`
    : `${tradeCopy.heroSubtitle}. Souvera is expanding bilateral trade coverage for ${name}; export and import volumes in the panels below reflect the latest available Comtrade-aligned data.`;

  const p2 =
    'Trade performance is only half the story. Preferential frameworks — AGOA, AfCFTA, ECOWAS, CBI, or CARICOM — determine whether manufactured and agricultural exports enter major markets at reduced or zero duty. Investors should align product mix and origin rules with active agreements.';

  const p3 =
    'Sector scorecards below rank Strength, Growth, and Attractiveness (S/G/A) for each vertical Souvera tracks. These scores synthesize terminal data, editorial intelligence, and comparative regional benchmarks — helping investors prioritize sectors before committing diligence resources.';

  return {
    intro,
    paragraphs: [p1, p2, p3],
    regionalFrameworkIntro:
      'Regional trade frameworks define duty treatment, rules of origin, and dispute mechanisms for cross-border goods and services. Each agreement below includes a plain-language summary of what it means for exporters and manufacturers seeking market access.',
    sectorScorecardIntro:
      'The Souvera sector scorecard ranks verticals on Strength (current competitive position), Growth (expansion trajectory), and Attractiveness (investment appeal). Scores run 0–100. Higher scores indicate stronger positioning relative to regional peers. Use this section to shortlist sectors before deep due diligence.',
    marketAccessIntro:
      'Market access status tracks live eligibility for preferential trade programs — including suspensions, restorations under review, and active membership. Status changes can unlock or close export corridors worth billions in duty savings; Souvera updates this registry as policy shifts.',
  };
}

export function buildOpportunityNarratives(
  name: string,
  opportunity: CountryOpportunityContent,
  _lead: string
): {
  intro: string;
  paragraphs: string[];
  entryPointsIntro: string;
  regionalAdvantagesIntro: string;
} {
  return {
    intro: `Investment opportunity assessment for ${name} — ${opportunity.heroSubtitle.toLowerCase()}.`,
    paragraphs: [
      `${name} offers multiple entry channels across technology, agriculture, infrastructure, energy, and services. The pillars below summarize where patient capital has the highest structural tailwinds — based on Souvera terminal intelligence, not generic emerging-market templates.`,
      'Each opportunity area includes specific sub-themes (fintech, value-add agriculture, power, logistics) with quantified market gaps where available. Investors should cross-reference Risk Assessment and Market Access sections before sizing commitments.',
    ],
    entryPointsIntro:
      'Investment entry points describe how foreign capital typically enters the market — through local partnerships, private equity, greenfield development, or public markets. Each channel below is explained for readers unfamiliar with local capital markets or regulatory pathways.',
    regionalAdvantagesIntro:
      'Regional advantages quantify access beyond the domestic market — neighboring trade blocs, U.S. preference programs, and workforce scale. These advantages compound domestic returns when export-oriented business models are part of the investment thesis.',
  };
}

export function buildRegionalAdvantageCards(
  opportunity: CountryOpportunityContent,
  parsedStrings: string[]
): Array<{ title: string; body: string }> {
  if (opportunity.regionalAdvantages.length) {
    return opportunity.regionalAdvantages.map((a) => ({
      title: `${a.label} (${a.value})`,
      body: `${a.sublabel}. ${expandRegionalAdvantage(a.label, a.value)}`,
    }));
  }
  return parsedStrings.map((s) => {
    const colon = s.indexOf(':');
    if (colon === -1) return { title: 'Regional Advantage', body: s };
    return {
      title: s.slice(0, colon).trim(),
      body: expandRegionalAdvantage(s.slice(0, colon).trim(), s.slice(colon + 1).trim()),
    };
  });
}

function expandRegionalAdvantage(label: string, detail: string): string {
  const lower = label.toLowerCase();
  if (lower.includes('afcfta')) {
    return `${detail} AfCFTA phases out tariffs on 90% of goods across 54 African countries by 2030, enabling regional manufacturing hubs and pan-African brands.`;
  }
  if (lower.includes('agoa')) {
    return `${detail} AGOA grants duty-free U.S. market access for eligible product lines when a country is certified — restoration from suspension can materially expand export margins.`;
  }
  if (lower.includes('ecowas') || lower.includes('caricom')) {
    return `${detail} Regional membership provides duty-free trade with neighboring states and harmonized investment protocols — critical for distribution and regional services plays.`;
  }
  if (lower.includes('workforce') || lower.includes('graduate')) {
    return `${detail} English-speaking graduates support BPO, tech, and professional services outsourcing at competitive cost bases versus North America and Europe.`;
  }
  return `${detail} This regional positioning extends the addressable market beyond domestic borders and should be modeled in export revenue scenarios.`;
}

export function buildRiskNarratives(
  name: string,
  risk: CountryRiskContent,
  _lead: string
): {
  intro: string;
  paragraphs: string[];
  mitigationIntro: string;
} {
  return {
    intro: `Risk assessment for ${name} — ${risk.heroSubtitle.toLowerCase()}.`,
    paragraphs: [
      `Institutional investors require explicit risk taxonomy: macro (currency, inflation, debt), political (governance, security), operational (power, logistics, talent), and sector-specific exposures. ${name}'s profile below follows this structure with severity ratings and mitigants for each factor.`,
      'No emerging market is risk-free. The objective is risk-adjusted return — identifying where mitigation tools (insurance, local partners, phased deployment, hard-currency revenue) bring exposures within acceptable bounds for your mandate.',
    ],
    mitigationIntro:
      'Mitigation strategies translate risk awareness into actionable frameworks. Each strategy below describes how institutional investors typically de-risk capital deployment — with specific instruments, partners, and sequencing recommendations. These are standard practices among DFIs, private equity sponsors, and multinational corporates operating in frontier and emerging markets.',
  };
}

export function elaborateMitigation(title: string, body: string): string {
  const extras: Record<string, string> = {
    'Local Partnerships':
      ' Select partners with audited financials, export track records, and government relations depth. Structure governance rights, exit clauses, and anti-corruption covenants in shareholder agreements before capital injection.',
    'Insurance Products':
      ' MIGA and DFC cover expropriation and currency inconvertibility; private insurers offer contract frustration and trade credit coverage. Premium costs typically run 1–3% of insured value — material but often required by lender covenants.',
    'Revenue Diversification':
      ' Model scenarios where 30–50% of revenue is hard-currency (exports, offshore clients, diaspora remittance-linked demand) to offset local-currency depreciation on operating costs and dividends.',
    'Phased Capital Deployment':
      ' Phase 1: pilot with capped exposure and KPI gates. Phase 2: scale on proven unit economics. Phase 3: full deployment with institutional debt or PE co-investment. This sequencing limits downside while preserving optionality.',
  };
  const key = Object.keys(extras).find((k) => title.includes(k));
  return body + (key ? extras[key] : '');
}

export function elaborateSectorRisk(title: string, body: string): string {
  if (body.length > 120) return body;
  const lower = title.toLowerCase();
  if (lower.includes('agricult')) {
    return `${body} Investors should budget for weather insurance, secure land titles early, and site processing facilities away from active conflict zones. Cold-chain and storage capex often determine whether agricultural margins survive post-harvest losses.`;
  }
  if (lower.includes('tech')) {
    return `${body} Data localization rules, payment licensing, and cybersecurity requirements evolve quickly. Budget legal and compliance headcount; partner with licensed payment aggregators rather than building rails from scratch unless scale justifies it.`;
  }
  if (lower.includes('infrastructure')) {
    return `${body} Multi-year projects face cost overrun and delay risk — common globally but amplified where procurement transparency varies. Milestone-based disbursements, independent engineering oversight, and political-risk insurance on completion risk are standard mitigants.`;
  }
  return `${body} Sector-specific diligence should include local operator interviews, regulatory pre-clearance, and stress tests on the mitigants listed in macro and operational categories above.`;
}

export function expandAgreementDescription(name: string, base: string): string {
  const expansions: Record<string, string> = {
    AGOA: ' The African Growth and Opportunity Act allows qualifying exports to enter the United States duty-free when a country is certified eligible — subject to annual U.S. Presidential review.',
    AfCFTA: ' The African Continental Free Trade Area creates a single market of 54 countries, phasing out tariffs on 90% of goods and enabling regional manufacturing and distribution strategies.',
    ECOWAS: ' The Economic Community of West African States provides duty-free trade among 15 member nations and harmonized investment protocols for West African operations.',
    CARICOM: ' The Caribbean Community supports regional trade in goods and services among member states, with CSME integration for labor and capital mobility.',
    CBI: ' The Caribbean Basin Initiative offers preferential U.S. market access for eligible exports from participating Caribbean Basin countries.',
  };
  const key = Object.keys(expansions).find((k) => name.toUpperCase().includes(k.toUpperCase()));
  return base + (key ? expansions[key] : '');
}

export function buildEconomicIntro(
  name: string,
  economyCopy: EconomyTabCopy
): { intro: string; paragraphs: string[] } {
  return {
    intro: `Economic overview for ${name} — macro scale, growth trajectory, and price stability based on ${economyCopy.dataSources}.`,
    paragraphs: [
      `This section summarizes ${name}'s macroeconomic performance using official and multilateral data sources (${economyCopy.dataSources}). Indicators include GDP scale and growth, inflation, foreign direct investment, population, and exchange-rate dynamics — the core variables that drive sovereign risk pricing and corporate valuation multiples.`,
      economyCopy.heroInflationNote.charAt(0).toUpperCase() +
        economyCopy.heroInflationNote.slice(1) +
        '. Investors should read headline metrics alongside the multi-year trajectory in the indicator panel — single-year snapshots can mislead when reforms or currency moves create base effects.',
      `Souvera refreshes these indicators from the data foundation with freshness timestamps visible in the terminal Economy tab. Regenerate this report for the latest period before board or investment committee presentation.`,
    ],
  };
}
