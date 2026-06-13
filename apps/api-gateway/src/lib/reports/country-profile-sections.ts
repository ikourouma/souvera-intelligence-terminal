/**
 * Assembles Country Profile report section narratives from terminal tab content libs.
 * Mirrors Overview · Economy · Sectors · Opportunity · Risk · Trade tabs.
 */

import { getOverviewContent, getCountryRegion } from '@/lib/intelligence/country-overview-content';
import { getEconomyTabCopy, type EconomyYearPoint } from '@/lib/intelligence/country-economy-content';
import { getOpportunityContent } from '@/lib/intelligence/country-opportunity-content';
import { getRiskContent, type RiskItem } from '@/lib/intelligence/country-risk-content';
import { getTradeTabCopy } from '@/lib/intelligence/country-trade-content';
import type { CountryProfileReportData } from './country-profile-data';
import {
  mergeOpportunityPillars,
  mergeRiskCategories,
  parseOpportunityThesis,
  parseRiskNarrative,
  type ParsedPillar,
  type ParsedRiskCategory,
} from './report-narrative-parser';
import { buildReportGlossary, type ReportGlossary } from './report-glossary';
import {
  buildGeographyNarratives,
  buildPoliticalNarratives,
  buildTradeNarratives,
  buildOpportunityNarratives,
  buildRegionalAdvantageCards,
  buildRiskNarratives,
  buildEconomicIntro,
  expandEntryPoint,
  expandAgreementDescription,
  elaborateMitigation,
  elaborateSectorRisk,
} from './report-section-narratives';

export interface ReportFact {
  label: string;
  value: string;
  note?: string;
}

export interface ReportSectionBlock {
  intro: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface CountryProfileSections {
  glossary: ReportGlossary;
  souvera: ReportSectionBlock & {
    capabilities: string[];
  };
  geography: ReportSectionBlock & { facts: ReportFact[] };
  introduction: ReportSectionBlock & { headline: string };
  political: ReportSectionBlock & { items: Array<{ title: string; severity: string; body: string; mitigants?: string[] }> };
  economic: ReportSectionBlock & { indicatorBullets: string[] };
  tradeAndSectors: ReportSectionBlock & {
    regionalFrameworkIntro: string;
    sectorScorecardIntro: string;
    marketAccessIntro: string;
    tradeFinanceIntro: string;
    tradeFinanceBullets: string[];
    regionalAgreements: Array<{ name: string; description: string }>;
  };
  opportunity: {
    intro: string;
    paragraphs: string[];
    lead: string;
    entryPointsIntro: string;
    pillars: ParsedPillar[];
    entryPoints: Array<{ title: string; body: string }>;
    regionalAdvantagesIntro: string;
    regionalAdvantages: Array<{ title: string; body: string }>;
  };
  risk: {
    intro: string;
    paragraphs: string[];
    lead: string;
    categories: ParsedRiskCategory[];
    mitigationIntro: string;
    mitigationStrategies: Array<{ title: string; body: string }>;
    closingSummary: string;
  };
  signalAndDifferentiation: ReportSectionBlock & {
    badge: string;
    signalBullets: [string, string];
    differentiators: string[];
  };
}

const SOUVERA_TERMINAL_COPY: ReportSectionBlock & { capabilities: string[] } = {
  intro:
    'This Country Profile is produced by Souvera Intelligence Terminal — the institutional research platform for Africa and Caribbean market intelligence.',
  paragraphs: [
    'Souvera synthesizes macro data, sector scorecards, bilateral trade flows, market-access frameworks (AGOA, AfCFTA, CBI, CARICOM), and curated editorial intelligence into a single decision-grade view. Unlike static annual country briefs, Souvera profiles refresh from live data foundations and signal models as conditions evolve.',
    'Subscribers use the terminal for country comparison, trade policy tracking, sector deep-dives, and on-demand PDF reports. This document mirrors the seven intelligence tabs — Overview, Economy, Sectors, Opportunity, Risk, Trade, and Reports — packaged for board packs, investment committees, and due diligence workflows.',
  ],
  bullets: [
    'Live macro indicators with freshness timestamps',
    'Souvera Signal Scan — proprietary momentum synthesis',
    'Market access registry with AGOA / AfCFTA / regional status',
    'Sector scorecards (Strength · Growth · Attractiveness)',
    'Exportable institutional PDFs with quota-managed AI custom briefs',
  ],
  capabilities: [
    'Country Intelligence Map — 50+ markets with tiered depth',
    'Trade Policy Hub — AGOA, AfCFTA, CBI legislative tracking',
    'Insights Rankings — comparative market scoring',
    'Reports — template PDFs + AI custom intelligence briefs',
  ],
};

const REGION_GEO: Record<string, { blurb: string; coordinates?: string }> = {
  africa: {
    blurb: 'Sub-Saharan Africa — frontier and emerging market corridor with AfCFTA continental integration.',
  },
  caribbean: {
    blurb: 'Caribbean Basin — nearshore corridor with CBI/CARICOM U.S. trade linkages and tourism-mining diversification.',
  },
  default: {
    blurb: 'Emerging market jurisdiction in Souvera institutional coverage.',
  },
};

function buildGeographyFacts(
  data: CountryProfileReportData,
  overviewMetrics: Array<{ label: string; value: string; sublabel: string; narrative: string }>
): ReportFact[] {
  const facts: ReportFact[] = [];
  if (data.country.region) {
    facts.push({ label: 'Region', value: data.country.region, note: REGION_GEO[getCountryRegion(data.country.iso3)]?.blurb });
  }
  if (data.country.capital) {
    facts.push({ label: 'Capital', value: data.country.capital, note: 'Administrative and policy center' });
  }
  if (data.country.currencyCode) {
    facts.push({ label: 'Currency', value: data.country.currencyCode, note: 'Official unit of account' });
  }
  facts.push({ label: 'ISO Codes', value: `${data.country.iso3}${data.country.iso2 ? ` / ${data.country.iso2}` : ''}`, note: 'International identifiers' });

  for (const m of overviewMetrics.slice(0, 4)) {
    facts.push({ label: m.label, value: m.value, note: `${m.sublabel} — ${m.narrative}` });
  }
  return facts;
}

function mergeEntryPoints(
  parsed: Array<{ title: string; body: string }>,
  structured: Array<{ title: string; body: string }>
): Array<{ title: string; body: string }> {
  if (structured.length) {
    return structured.map((s, i) => {
      const p = parsed[i];
      const body = expandEntryPoint(s.title, p?.body && p.body.length > s.body.length ? p.body : s.body);
      return { title: s.title, body };
    });
  }
  return parsed.map((p, i) => ({
    title: p.title || `Investment Channel ${i + 1}`,
    body: expandEntryPoint(p.title, p.body),
  }));
}

function elaborateRiskCategories(categories: ParsedRiskCategory[]): ParsedRiskCategory[] {
  return categories.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => ({
      ...item,
      body:
        /sector/i.test(cat.title) || /sector/i.test(item.title)
          ? elaborateSectorRisk(item.title, item.body)
          : item.body,
    })),
  }));
}

function mapRiskItems(items: RiskItem[]) {
  return items.map((i) => ({
    title: i.title,
    severity: i.severity,
    body: i.body,
    mitigants: i.mitigants,
  }));
}

export function buildCountryProfileSections(
  data: CountryProfileReportData,
  economyYears: EconomyYearPoint[]
): CountryProfileSections {
  const { country } = data;
  const iso3 = country.iso3;
  const name = country.name;

  const metricsRaw = {
    gdp_current_usd: parseMetricUsd(data.metrics.find((m) => m.label.includes('GDP (current'))?.value),
    gdp_growth_annual_pct: parseMetricPct(data.metrics.find((m) => m.label.includes('GDP growth'))?.value),
    population_total: parseMetricPopulation(data.metrics.find((m) => m.label.includes('Population'))?.value),
    fdi_net_inflows_current_usd: parseMetricUsd(data.metrics.find((m) => m.label.includes('FDI'))?.value),
    inflation_consumer_prices_annual_pct: parseMetricPct(data.metrics.find((m) => m.label.includes('Inflation'))?.value),
    fx_to_usd: parseMetricFx(data.metrics.find((m) => m.label.includes('FX'))?.value),
  };

  const overview = getOverviewContent(iso3, name, metricsRaw);
  const economyCopy = getEconomyTabCopy(iso3);
  const opportunity = getOpportunityContent(iso3, name);
  const risk = getRiskContent(iso3, name);
  const tradeCopy = getTradeTabCopy(iso3);

  const economyParagraphs: string[] = [];
  if (economyYears.length >= 2) {
    const first = economyYears[0];
    const last = economyYears[economyYears.length - 1];
    if (first.gdp_current_usd && last.gdp_current_usd) {
      economyParagraphs.push(
        economyCopy.buildGdpNarrative({
          startGdpB: first.gdp_current_usd / 1e9,
          endGdpB: last.gdp_current_usd / 1e9,
          startYear: first.year,
          endYear: last.year,
          pctChange: first.gdp_current_usd ? ((last.gdp_current_usd - first.gdp_current_usd) / first.gdp_current_usd) * 100 : 0,
        })
      );
    }
    if (last.gdp_growth_pct != null) {
      economyParagraphs.push(
        economyCopy.buildGrowthNarrative({
          latestGrowth: last.gdp_growth_pct,
          latestYear: last.year,
          hasForecast: false,
        })
      );
    }
    if (last.fx_to_usd != null) {
      economyParagraphs.push(
        economyCopy.buildFxNarrative({
          latestFx: last.fx_to_usd,
          earliestFx: first.fx_to_usd,
          latestYear: last.year,
        })
      );
    }
  } else if (data.summary) {
    economyParagraphs.push(
      `${name}'s economic profile reflects ${data.metrics.find((m) => m.label.includes('GDP growth'))?.value ?? 'moderate'} growth, ${data.metrics.find((m) => m.label.includes('Inflation'))?.value ?? 'elevated'} inflation, and ${data.metrics.find((m) => m.label.includes('FDI'))?.value ?? 'steady'} FDI inflows based on latest Souvera intelligence.`
    );
  }

  const indicatorBullets = economyYears.length ? economyCopy.buildIndicatorBullets(economyYears) : [];

  const introParagraphs = [
    overview.snapshotIntro,
    overview.momentumIntro,
    ...(data.summary ? [data.summary] : []),
  ];

  const structuredPillars = opportunity.pillars.map((p) => ({
    title: p.title,
    subtitle: p.subtitle,
    narrative: p.narrative,
    bullets: p.bullets.map((b) => `${b.label}: ${b.text}`),
  }));

  const parsedOpportunity = parseOpportunityThesis(data.opportunityThesis);
  const opportunityPillars = mergeOpportunityPillars(parsedOpportunity?.pillars, structuredPillars);
  const opportunityLead = parsedOpportunity?.lead || opportunity.heroFallback;

  const structuredEntryPoints = opportunity.entryPoints.map((e) => ({
    title: e.title,
    body: e.body,
  }));
  const opportunityEntryPoints = mergeEntryPoints(
    parsedOpportunity?.entryPoints ?? [],
    structuredEntryPoints
  );

  const regionalAdvantageCards = buildRegionalAdvantageCards(
    opportunity,
    parsedOpportunity?.regionalAdvantages ?? []
  );

  const structuredRiskCategories = [
    {
      title: risk.macro.title,
      items: risk.macro.items.map((i) => ({
        title: i.title,
        severity: i.severity,
        body: i.body,
        mitigants: i.mitigants,
      })),
    },
    {
      title: risk.political.title,
      items: risk.political.items.map((i) => ({
        title: i.title,
        severity: i.severity,
        body: i.body,
        mitigants: i.mitigants,
      })),
    },
    {
      title: risk.operational.title,
      items: risk.operational.items.map((i) => ({
        title: i.title,
        severity: i.severity,
        body: i.body,
        mitigants: i.mitigants,
      })),
    },
  ];

  const parsedRisk = parseRiskNarrative(data.riskNarrative);
  const riskCategories = elaborateRiskCategories(
    mergeRiskCategories(parsedRisk?.categories, structuredRiskCategories)
  );

  const riskLead = parsedRisk?.lead?.replace(/:\s*$/, '') || risk.heroFallback;
  const riskClosing = parsedRisk?.closingSummary || risk.riskAdjustedNarrative;

  const glossary = buildReportGlossary(name, country.region);
  const geographyNarr = buildGeographyNarratives(data, country.capital);
  const politicalNarr = buildPoliticalNarratives(name, risk);
  const tradeNarr = buildTradeNarratives(name, data, tradeCopy);
  const economicNarr = buildEconomicIntro(name, economyCopy);
  const opportunityNarr = buildOpportunityNarratives(name, opportunity, opportunityLead);
  const riskNarr = buildRiskNarratives(name, risk, riskLead);

  const economicParagraphsFinal = [
    ...economicNarr.paragraphs.slice(0, 2),
    ...(economyParagraphs.length ? economyParagraphs : [`${name} macro indicators are summarized in the headline metric panel below.`]),
  ];

  return {
    glossary,
    souvera: SOUVERA_TERMINAL_COPY,
    geography: {
      ...geographyNarr,
      facts: buildGeographyFacts(data, overview.snapshotMetrics),
    },
    introduction: {
      headline: overview.snapshotTitle,
      intro: overview.snapshotIntro,
      paragraphs: introParagraphs,
      bullets: overview.whyNowPoints.map((p) => `${p.title}: ${p.body}`),
    },
    political: {
      ...politicalNarr,
      items: mapRiskItems(risk.political.items),
    },
    economic: {
      intro: economicNarr.intro,
      paragraphs: economicParagraphsFinal,
      indicatorBullets,
    },
    tradeAndSectors: {
      intro: tradeNarr.intro,
      paragraphs: tradeNarr.paragraphs,
      regionalFrameworkIntro: tradeNarr.regionalFrameworkIntro,
      sectorScorecardIntro: tradeNarr.sectorScorecardIntro,
      marketAccessIntro: tradeNarr.marketAccessIntro,
      tradeFinanceIntro:
        'Trade finance instruments bridge the gap between shipment and payment — essential when counterparties span multiple jurisdictions. The channels below are commonly used for AfCFTA, ECOWAS, and bilateral export corridors.',
      tradeFinanceBullets: tradeCopy.financeBullets,
      regionalAgreements: tradeCopy.regionalAgreements.map((a) => ({
        name: a.name,
        description: expandAgreementDescription(a.name, a.description),
      })),
    },
    opportunity: {
      intro: opportunityNarr.intro,
      paragraphs: opportunityNarr.paragraphs,
      lead: opportunityLead,
      entryPointsIntro: opportunityNarr.entryPointsIntro,
      pillars: opportunityPillars,
      entryPoints: opportunityEntryPoints,
      regionalAdvantagesIntro: opportunityNarr.regionalAdvantagesIntro,
      regionalAdvantages: regionalAdvantageCards,
    },
    risk: {
      intro: riskNarr.intro,
      paragraphs: riskNarr.paragraphs,
      lead: riskLead,
      categories: riskCategories,
      mitigationIntro: riskNarr.mitigationIntro,
      mitigationStrategies: risk.mitigationStrategies.map((m) => ({
        title: m.title,
        body: elaborateMitigation(m.title, m.body),
      })),
      closingSummary: riskClosing,
    },
    signalAndDifferentiation: {
      intro: 'Souvera Signal Scan synthesizes macro momentum, FDI, inflation, and sector leadership into an actionable badge.',
      paragraphs: [
        overview.whyNowCallout,
        'Differentiators vs static country briefs: live data refresh, trade policy legislative tracking, sector S/G/A scorecards, and quota-managed AI custom briefs grounded in this same intelligence foundation.',
      ],
      badge: data.signalScan.badge,
      signalBullets: data.signalScan.bullets,
      differentiators: [
        'Live Signal Scan — updated with macro and sector inputs, not annual PDF refresh cycles',
        'Market Access Registry — AGOA restoration/suspension, AfCFTA, ECOWAS, CBI, CARICOM in one view',
        'Trade Policy Intelligence — legislative tracker and export opportunity mapping',
        'Terminal-to-PDF parity — this report mirrors the seven country intelligence tabs',
        'AI Custom Briefs — query-driven reports grounded in Souvera data (Business+ quota)',
      ],
    },
  };
}

function parseMetricUsd(v?: string): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v.replace(/[$,BMK]/gi, ''));
  if (Number.isNaN(n)) return undefined;
  if (/B/i.test(v)) return n * 1e9;
  if (/M/i.test(v)) return n * 1e6;
  if (/K/i.test(v)) return n * 1e3;
  return n;
}

function parseMetricPct(v?: string): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v.replace('%', ''));
  return Number.isNaN(n) ? undefined : n;
}

function parseMetricPopulation(v?: string): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v.replace(/[,M]/g, ''));
  return Number.isNaN(n) ? undefined : n * 1e6;
}

function parseMetricFx(v?: string): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v.replace(/,/g, ''));
  return Number.isNaN(n) ? undefined : n;
}
