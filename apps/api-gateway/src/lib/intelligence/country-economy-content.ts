/**
 * Per-country Economy tab copy — Sprint C.
 * @see docs/execution/country-terminal-sprint-plan.md
 */

import { getAfricanSubRegionLabel } from '@/lib/intelligence/country-regions';
import { isApprovedCaribbeanMarket } from '@/lib/market-coverage';
import {
  getCountryStructuralDriver,
  getRegionalMacroFrame,
} from '@/lib/intelligence/economy-regional-frames';
import { formatPct, formatUsdCompact } from '@/lib/intelligence/executive-analysis-voice';
import { formatPopulation } from '@/lib/intelligence-entitlements';
import { getStructuralDataGap } from '@/lib/market-coverage/structural-data-gaps';

/**
 * Returns the first sentence of a text, splitting only on true sentence
 * boundaries (a period followed by whitespace or end of string) so decimals
 * like "~4.5%" or "~$22.5B" are never truncated. Any trailing period is removed
 * so the phrase can be embedded inline within a larger sentence.
 */
function firstSentence(text: string): string {
  const lead = text.split(/(?<=\D)\.(?=\s|$)/)[0] ?? text;
  return lead.replace(/\.$/, '').trim();
}

export interface EconomyYearPoint {
  year: number;
  gdp_current_usd?: number;
  gdp_growth_pct?: number;
  gdp_per_capita_usd?: number;
  population_total?: number;
  fdi_net_inflows_usd?: number;
  inflation_cpi_pct?: number;
  fx_to_usd?: number;
  official_exchange_rate?: number;
  current_account_pct_gdp?: number;
  reserves_total_usd?: number;
  reserves_months_imports?: number;
  remittances_received_usd?: number;
  exports_goods_services_usd?: number;
  imports_goods_services_usd?: number;
  trade_pct_gdp?: number;
  unemployment_pct?: number;
  internet_users_pct?: number;
  life_expectancy_years?: number;
  urban_population_pct?: number;
  electricity_access_pct?: number;
  co2_emissions_per_capita?: number;
  debt_to_gdp_pct?: number;
  fiscal_balance_pct_gdp?: number;
  wgi_governance_estimate?: number;
  fx_regime_category?: string;
}

export interface EconomyTabCopy {
  dataSources: string;
  fxPairLabel: string;
  fxRateLabel: string;
  showParallelRate: boolean;
  showReformLine: boolean;
  reformLineYear?: number;
  reformLineLabel?: string;
  forecastAuthority: string;
  heroInflationNote: string;
  buildGdpNarrative: (p: {
    startGdpB: number;
    endGdpB: number;
    startYear: number;
    endYear: number;
    pctChange: number;
  }) => string;
  buildGrowthNarrative: (p: {
    latestGrowth: number;
    latestYear: number;
    forecast?: number;
    forecastYear?: number;
    hasForecast: boolean;
  }) => string;
  buildFxNarrative: (p: { latestFx: number; earliestFx?: number; latestYear: number }) => string;
  buildIndicatorBullets: (years: EconomyYearPoint[]) => string[];
}

function pctChange(start: number, end: number) {
  return start ? ((end - start) / start) * 100 : 0;
}

function ngaEconomy(): EconomyTabCopy {
  return {
    dataSources: 'World Bank, IMF, CBN',
    fxPairLabel: 'NGN/USD',
    fxRateLabel: 'Official Rate (CBN)',
    showParallelRate: true,
    showReformLine: true,
    reformLineYear: 2023,
    reformLineLabel: '2023 Reform',
    forecastAuthority: 'CBN',
    heroInflationNote: 'reflecting ongoing macro adjustment post-2023 currency reform',
    buildGdpNarrative: ({ startGdpB, endGdpB, startYear, endYear, pctChange: chg }) => {
      const changeWord = chg >= 0 ? 'increase' : 'decrease';
      const changeMag = Math.abs(chg).toFixed(0);
      return `Nigeria's GDP moved from $${startGdpB.toFixed(1)}B (${startYear}) to $${endGdpB.toFixed(1)}B (${endYear}), a ${changeMag}% ${changeWord} over the series window. The 2023 currency reform initially compressed GDP in dollar terms; the ${endYear} level reflects technology sector momentum and oil production recovery per structured macro data.`;
    },
    buildGrowthNarrative: ({ latestGrowth, latestYear, forecast, forecastYear, hasForecast }) => {
      let s = `Growth reached ${latestGrowth.toFixed(1)}% in ${latestYear} — the strongest performance since 2014, driven by technology (+15% YoY), agriculture (+4.2% YoY), and services (+7.1% YoY).`;
      if (hasForecast && forecast != null && forecastYear != null) {
        s += ` CBN forecasts ${forecast.toFixed(1)}% in ${forecastYear}.`;
      } else {
        s += ' Upgrade to Business for GDP growth forecasts.';
      }
      return s;
    },
    buildFxNarrative: ({ latestFx, earliestFx, latestYear }) =>
      `The naira depreciated following the 2023 exchange rate unification${earliestFx ? ` (from ~${earliestFx.toFixed(0)} to ${latestFx.toFixed(0)} NGN/USD by ${latestYear})` : ''}. Volatility has stabilized since Q4 2024 under a managed float policy.`,
    buildIndicatorBullets: (years) => {
      const first = years[0];
      const last = years[years.length - 1];
      const bullets: string[] = [];
      if (first?.gdp_growth_pct != null && last?.gdp_growth_pct != null) {
        bullets.push(`GDP growth: ${first.gdp_growth_pct.toFixed(1)}% (${first.year}) → ${last.gdp_growth_pct.toFixed(1)}% (${last.year})`);
      }
      if (first?.gdp_current_usd && last?.gdp_current_usd) {
        bullets.push(`GDP scale: $${(first.gdp_current_usd / 1e9).toFixed(0)}B → $${(last.gdp_current_usd / 1e9).toFixed(0)}B over ${years.length} years`);
      }
      if (last?.inflation_cpi_pct != null) {
        bullets.push(`Inflation ${last.inflation_cpi_pct.toFixed(1)}% (${last.year}) — declining from 2023 peak`);
      }
      return bullets.slice(0, 3);
    },
  };
}

function jamEconomy(): EconomyTabCopy {
  return {
    dataSources: 'World Bank, BOJ, STATIN',
    fxPairLabel: 'JMD/USD',
    fxRateLabel: 'Official Rate (BOJ)',
    showParallelRate: false,
    showReformLine: false,
    forecastAuthority: 'IMF',
    heroInflationNote: 'with BOJ tightening supporting price stability amid tourism-led recovery',
    buildGdpNarrative: ({ startGdpB, endGdpB, startYear, endYear, pctChange: chg }) =>
      `Jamaica's GDP expanded from $${startGdpB.toFixed(1)}B (${startYear}) to $${endGdpB.toFixed(1)}B (${endYear}), a ${chg.toFixed(0)}% increase over five years. Recovery was driven by tourism rebound, remittance inflows ($3.5B+ annually), and digital services nearshoring in Kingston.`,
    buildGrowthNarrative: ({ latestGrowth, latestYear, forecast, forecastYear, hasForecast }) => {
      let s = `Growth reached ${latestGrowth.toFixed(1)}% in ${latestYear}, supported by tourism recovery, bauxite exports, and expanding BPO/digital services in Kingston.`;
      if (hasForecast && forecast != null && forecastYear != null) {
        s += ` IMF projects ${forecast.toFixed(1)}% in ${forecastYear}.`;
      } else {
        s += ' Upgrade to Business for GDP growth forecasts.';
      }
      return s;
    },
    buildFxNarrative: ({ latestFx, earliestFx, latestYear }) =>
      `The Jamaican dollar traded at ~${latestFx.toFixed(0)} JMD/USD in ${latestYear}${earliestFx ? `, from ~${earliestFx.toFixed(0)} in the series start` : ''}. BOJ intervention and IMF program anchors support gradual stability.`,
    buildIndicatorBullets: (years) => {
      const first = years[0];
      const last = years[years.length - 1];
      const bullets: string[] = [];
      if (first?.gdp_growth_pct != null && last?.gdp_growth_pct != null) {
        bullets.push(`GDP growth: ${first.gdp_growth_pct.toFixed(1)}% (${first.year}) → ${last.gdp_growth_pct.toFixed(1)}% (${last.year})`);
      }
      if (first?.gdp_current_usd && last?.gdp_current_usd) {
        bullets.push(`GDP scale: $${(first.gdp_current_usd / 1e9).toFixed(1)}B → $${(last.gdp_current_usd / 1e9).toFixed(1)}B`);
      }
      if (last?.fdi_net_inflows_usd != null) {
        bullets.push(`FDI inflows ~$${(last.fdi_net_inflows_usd / 1e6).toFixed(0)}M (${last.year}) — nearshore and tourism investment`);
      }
      return bullets.slice(0, 3);
    },
  };
}

function kenEconomy(): EconomyTabCopy {
  return {
    dataSources: 'World Bank, CBK, KNBS',
    fxPairLabel: 'KES/USD',
    fxRateLabel: 'Official Rate (CBK)',
    showParallelRate: false,
    showReformLine: false,
    forecastAuthority: 'IMF',
    heroInflationNote: 'with CBK policy anchoring price stability amid shilling adjustment cycles',
    buildGdpNarrative: ({ startGdpB, endGdpB, startYear, endYear, pctChange: chg }) =>
      `Kenya's GDP expanded from $${startGdpB.toFixed(1)}B (${startYear}) to $${endGdpB.toFixed(1)}B (${endYear}), a ${chg.toFixed(0)}% change over five years. Growth was driven by fintech scale, horticulture exports, and logistics gateway investment along the Mombasa–Nairobi corridor.`,
    buildGrowthNarrative: ({ latestGrowth, latestYear, forecast, forecastYear, hasForecast }) => {
      let s = `Growth reached ${latestGrowth.toFixed(1)}% in ${latestYear}, supported by services-led expansion, agricultural export resilience, and renewable energy IPP investment.`;
      if (hasForecast && forecast != null && forecastYear != null) {
        s += ` IMF projects ${forecast.toFixed(1)}% in ${forecastYear}.`;
      } else {
        s += ' Upgrade to Business for GDP growth forecasts.';
      }
      return s;
    },
    buildFxNarrative: ({ latestFx, earliestFx, latestYear }) =>
      `The Kenyan shilling traded at ~${latestFx.toFixed(0)} KES/USD in ${latestYear}${earliestFx ? `, from ~${earliestFx.toFixed(0)} at series start` : ''}. CBK intervention and export USD revenue from horticulture support gradual stability.`,
    buildIndicatorBullets: (years) => {
      const first = years[0];
      const last = years[years.length - 1];
      const bullets: string[] = [];
      if (first?.gdp_growth_pct != null && last?.gdp_growth_pct != null) {
        bullets.push(`GDP growth: ${first.gdp_growth_pct.toFixed(1)}% (${first.year}) → ${last.gdp_growth_pct.toFixed(1)}% (${last.year})`);
      }
      if (first?.gdp_current_usd && last?.gdp_current_usd) {
        bullets.push(`GDP scale: $${(first.gdp_current_usd / 1e9).toFixed(0)}B → $${(last.gdp_current_usd / 1e9).toFixed(0)}B`);
      }
      if (last?.fdi_net_inflows_usd != null) {
        bullets.push(`FDI inflows ~$${(last.fdi_net_inflows_usd / 1e9).toFixed(1)}B (${last.year}) — fintech and energy investment`);
      }
      return bullets.slice(0, 3);
    },
  };
}

function defaultEconomy(iso3: string): EconomyTabCopy {
  const key = iso3.toUpperCase();
  const subRegion = getAfricanSubRegionLabel(key);
  const caribbean = isApprovedCaribbeanMarket(key);
  const frame = getRegionalMacroFrame(key);
  const structural = getCountryStructuralDriver(key);
  const regionContext = structural
    ?? (subRegion ? `${subRegion} export and services diversification` : firstSentence(frame.structuralDrivers));

  return {
    dataSources: caribbean ? 'World Bank, IMF, national central banks' : 'World Bank, IMF, national statistics offices',
    fxPairLabel: caribbean ? 'Local/USD' : 'Local/USD',
    fxRateLabel: caribbean ? 'Official Rate' : 'Official Rate',
    showParallelRate: false,
    showReformLine: false,
    forecastAuthority: 'IMF',
    heroInflationNote: caribbean
      ? 'with tourism recovery and import-price pass-through shaping price dynamics'
      : `with monetary policy anchoring inflation amid ${regionContext}`,
    buildGdpNarrative: ({ startGdpB, endGdpB, startYear, endYear, pctChange: chg }) =>
      `GDP moved from $${startGdpB.toFixed(1)}B (${startYear}) to $${endGdpB.toFixed(1)}B (${endYear}), a ${Math.abs(chg).toFixed(0)}% ${chg >= 0 ? 'expansion' : 'contraction'} reflecting ${regionContext}.`,
    buildGrowthNarrative: ({ latestGrowth, latestYear, forecast, forecastYear, hasForecast }) => {
      let s = `Latest GDP growth: ${latestGrowth.toFixed(1)}% (${latestYear}), driven by ${regionContext}.`;
      if (hasForecast && forecast != null && forecastYear != null) {
        s += ` IMF projects ${forecast.toFixed(1)}% in ${forecastYear}.`;
      } else {
        s += ' Upgrade to Business for GDP growth forecasts.';
      }
      return s;
    },
    buildFxNarrative: ({ latestFx, latestYear }) =>
      `Exchange rate: ~${latestFx.toFixed(latestFx >= 100 ? 0 : 2)} local currency per USD (${latestYear}).`,
    buildIndicatorBullets: (years) => {
      const first = years[0];
      const last = years[years.length - 1];
      const bullets: string[] = [];
      if (first?.gdp_growth_pct != null && last?.gdp_growth_pct != null) {
        bullets.push(`GDP growth: ${first.gdp_growth_pct.toFixed(1)}% (${first.year}) → ${last.gdp_growth_pct.toFixed(1)}% (${last.year})`);
      }
      if (first?.gdp_current_usd && last?.gdp_current_usd) {
        bullets.push(`GDP scale: $${(first.gdp_current_usd / 1e9).toFixed(0)}B → $${(last.gdp_current_usd / 1e9).toFixed(0)}B`);
      }
      if (last?.inflation_cpi_pct != null) bullets.push(`Inflation ${last.inflation_cpi_pct.toFixed(1)}% (${last.year})`);
      if (last?.fdi_net_inflows_usd != null) {
        bullets.push(`FDI inflows ~$${last.fdi_net_inflows_usd >= 1e9 ? (last.fdi_net_inflows_usd / 1e9).toFixed(1) + 'B' : (last.fdi_net_inflows_usd / 1e6).toFixed(0) + 'M'} (${last.year})`);
      }
      return bullets.slice(0, 3);
    },
  };
}

export function buildEconomyOverviewAnalysis(params: {
  countryName: string;
  iso3: string;
  latestYear: EconomyYearPoint;
  earliestYear: EconomyYearPoint;
  gdpChange: number;
  copy: EconomyTabCopy;
}): string {
  const { countryName, iso3, latestYear, earliestYear, gdpChange, copy } = params;
  const regionalFrame = getRegionalMacroFrame(iso3);
  const structuralDriver = getCountryStructuralDriver(iso3);
  const structuralGap = getStructuralDataGap(iso3);

  const hasGdp = latestYear.gdp_current_usd != null && Number.isFinite(latestYear.gdp_current_usd);
  const hasGrowth = latestYear.gdp_growth_pct != null && Number.isFinite(latestYear.gdp_growth_pct);
  const hasFdi = latestYear.fdi_net_inflows_usd != null && Number.isFinite(latestYear.fdi_net_inflows_usd);
  const hasInflation = latestYear.inflation_cpi_pct != null && Number.isFinite(latestYear.inflation_cpi_pct);
  const hasGdpChange = earliestYear.gdp_current_usd != null
    && latestYear.gdp_current_usd != null
    && Number.isFinite(gdpChange);

  const popM = latestYear.population_total != null ? formatPopulation(latestYear.population_total) : null;
  const gdpPc = latestYear.gdp_per_capita_usd != null
    ? formatUsdCompact(latestYear.gdp_per_capita_usd)
    : null;

  const regionOutlook = regionalFrame.outlookSummary;

  let p1: string;
  if (structuralGap && !hasGdp) {
    p1 = [
      `${countryName} operates within a structurally constrained macro reporting environment — ${structuralGap.headline}.`,
      popM ? `Latest available population estimate: ${popM}.` : null,
      `Within ${regionalFrame.regionLabel}, SOUVERA surfaces UN-agency indicators (demographics, connectivity, infrastructure access) where IMF and World Bank headline series are unavailable — not a platform data gap but a reflection of ${countryName}'s limited participation in standard international statistical reporting.`,
      regionOutlook,
    ].filter(Boolean).join(' ');
  } else if (hasGdp) {
    const gdpB = formatUsdCompact(latestYear.gdp_current_usd);
    p1 = [
      `${countryName}'s macro scale in ${latestYear.year} centres on ${gdpB} nominal GDP${popM ? ` across a ${popM} population` : ''}${gdpPc ? ` (${gdpPc} per capita)` : ''} within ${regionalFrame.regionLabel} — positioning the market within SOUVERA's 74-market comparability framework for institutional allocation and cross-border peer benchmarking.`,
      regionOutlook,
    ].join(' ');
  } else {
    p1 = [
      `${countryName}'s macro profile in ${latestYear.year}${popM ? ` reflects a ${popM} population base` : ' draws on partial indicator coverage'} within ${regionalFrame.regionLabel}.`,
      regionOutlook,
    ].join(' ');
  }

  const driverLine = structuralDriver
    ? `Structural drivers include ${structuralDriver}.`
    : regionalFrame.structuralDrivers;
  const extraMetrics: string[] = [];
  if (latestYear.debt_to_gdp_pct != null) {
    extraMetrics.push(`government debt at ${formatPct(latestYear.debt_to_gdp_pct)} of GDP`);
  }
  if (latestYear.current_account_pct_gdp != null) {
    extraMetrics.push(`current account ${formatPct(latestYear.current_account_pct_gdp, true)} of GDP`);
  }
  if (latestYear.trade_pct_gdp != null) {
    extraMetrics.push(`trade intensity ${formatPct(latestYear.trade_pct_gdp)} of GDP`);
  }
  if (latestYear.reserves_months_imports != null) {
    extraMetrics.push(`${latestYear.reserves_months_imports.toFixed(1)} months import cover`);
  }
  if (latestYear.fiscal_balance_pct_gdp != null) {
    extraMetrics.push(`fiscal balance ${formatPct(latestYear.fiscal_balance_pct_gdp, true)} of GDP`);
  }
  if (latestYear.unemployment_pct != null) {
    extraMetrics.push(`unemployment ${formatPct(latestYear.unemployment_pct)}`);
  }
  const extraLine = extraMetrics.length ? ` Supporting indicators: ${extraMetrics.join('; ')}.` : '';

  const trajectoryParts: string[] = [];
  if (hasGrowth) {
    trajectoryParts.push(`Growth registered ${formatPct(latestYear.gdp_growth_pct)} in ${latestYear.year}`);
  }
  if (hasGdpChange) {
    trajectoryParts.push(`${formatPct(gdpChange, true)} cumulative GDP change from ${earliestYear.year}`);
  }
  if (hasFdi) {
    trajectoryParts.push(`FDI inflows of ${formatUsdCompact(latestYear.fdi_net_inflows_usd)}`);
  }
  if (hasInflation) {
    trajectoryParts.push(`inflation at ${formatPct(latestYear.inflation_cpi_pct)}`);
  }

  let p2: string;
  if (trajectoryParts.length >= 2) {
    p2 = `${trajectoryParts.join('; ')} frame the near-term trajectory, ${copy.heroInflationNote}. ${driverLine}${extraLine}`;
  } else if (trajectoryParts.length === 1) {
    p2 = `${trajectoryParts[0]} anchors the available near-term signal, ${copy.heroInflationNote}. ${driverLine}${extraLine}`;
  } else if (structuralGap) {
    p2 = `${structuralGap.disclaimer} ${driverLine}${extraLine}`;
  } else {
    p2 = `Headline GDP, growth, FDI, and inflation series are partially unavailable for ${latestYear.year}; rely on sector-level Trade and Risk tabs for allocatable signals. ${driverLine}${extraLine}`;
  }

  const sourceNote = structuralGap?.availableSource
    ? `Available indicators sourced from ${structuralGap.availableSource} and ${copy.dataSources}`
    : `Data sourced from ${copy.dataSources}`;

  const p3 = [
    `Investor read: ${regionalFrame.investorLevers}`,
    `Policy priority: ${regionalFrame.policyPriority}`,
    `Cross-reference Risk and Trade tabs for AGOA/CBI status, FX regime, and corridor-specific entry timing before sizing exposure.`,
    `${sourceNote}; vintage ${latestYear.year}. Curated estimates — verify against official releases before investment decisions.`,
  ].join(' ');

  return [p1, p2, p3].join('\n\n');
}

export function getEconomyTabCopy(iso3: string): EconomyTabCopy {
  const key = iso3.toUpperCase();
  if (key === 'NGA') return ngaEconomy();
  if (key === 'JAM') return jamEconomy();
  if (key === 'KEN') return kenEconomy();
  if (['GHA', 'ZAF', 'ETH', 'SEN', 'CIV', 'TZA', 'ZWE'].includes(key)) return wave1AfricaEconomy(key);
  if (['TTO', 'BRB', 'GUY'].includes(key)) return caribbeanPilotEconomy(key);
  return defaultEconomy(key);
}

function caribbeanPilotEconomy(iso3: string): EconomyTabCopy {
  const profiles: Record<string, { sources: string; fxPair: string; fxLabel: string; inflationNote: string; gdpContext: string; growthContext: string }> = {
    TTO: { sources: 'World Bank, IMF, Central Bank of Trinidad and Tobago', fxPair: 'TTD/USD', fxLabel: 'Official Rate (CBTT)', inflationNote: 'with hydrocarbon revenue cycles and import-price pass-through shaping CPI', gdpContext: 'hydrocarbon and petrochemical exports with mature production profile', growthContext: 'energy sector output and downstream petrochemical investment' },
    BRB: { sources: 'World Bank, IMF, Central Bank of Barbados', fxPair: 'BBD/USD', fxLabel: 'Official Rate (CBB)', inflationNote: 'with BBD peg stability and tourism recovery moderating import inflation', gdpContext: 'tourism-led services and international business/financial services hub', growthContext: 'tourism arrivals and financial services export growth' },
    GUY: { sources: 'World Bank, IMF, Bank of Guyana', fxPair: 'GYD/USD', fxLabel: 'Official Rate (BoG)', inflationNote: 'with oil-revenue inflows and infrastructure investment shaping price dynamics', gdpContext: 'offshore oil production and sovereign wealth accumulation — Caribbean growth outlier', growthContext: 'hydrocarbon production ramp and public infrastructure investment' },
  };
  const p = profiles[iso3] ?? profiles.BRB;

  return {
    dataSources: p.sources,
    fxPairLabel: p.fxPair,
    fxRateLabel: p.fxLabel,
    showParallelRate: false,
    showReformLine: false,
    forecastAuthority: 'IMF',
    heroInflationNote: p.inflationNote,
    buildGdpNarrative: ({ startGdpB, endGdpB, startYear, endYear, pctChange: chg }) =>
      `GDP expanded from $${startGdpB.toFixed(1)}B (${startYear}) to $${endGdpB.toFixed(1)}B (${endYear}), a ${chg.toFixed(0)}% change. Growth was driven by ${p.gdpContext}.`,
    buildGrowthNarrative: ({ latestGrowth, latestYear, forecast, forecastYear, hasForecast }) => {
      let s = `Growth reached ${latestGrowth.toFixed(1)}% in ${latestYear}, supported by ${p.growthContext}.`;
      if (hasForecast && forecast != null && forecastYear != null) {
        s += ` IMF projects ${forecast.toFixed(1)}% in ${forecastYear}.`;
      } else {
        s += ' Upgrade to Business for GDP growth forecasts.';
      }
      return s;
    },
    buildFxNarrative: ({ latestFx, earliestFx, latestYear }) =>
      `Exchange rate traded at ~${latestFx.toFixed(latestFx >= 100 ? 0 : 2)} ${p.fxPair.split('/')[0]}/USD in ${latestYear}${earliestFx ? `, from ~${earliestFx.toFixed(earliestFx >= 100 ? 0 : 2)} at series start` : ''}.`,
    buildIndicatorBullets: (years) => {
      const first = years[0];
      const last = years[years.length - 1];
      const bullets: string[] = [];
      if (first?.gdp_growth_pct != null && last?.gdp_growth_pct != null) {
        bullets.push(`GDP growth: ${first.gdp_growth_pct.toFixed(1)}% (${first.year}) → ${last.gdp_growth_pct.toFixed(1)}% (${last.year})`);
      }
      if (first?.gdp_current_usd && last?.gdp_current_usd) {
        bullets.push(`GDP scale: $${(first.gdp_current_usd / 1e9).toFixed(0)}B → $${(last.gdp_current_usd / 1e9).toFixed(0)}B`);
      }
      if (last?.fdi_net_inflows_usd != null) {
        bullets.push(`FDI inflows ~$${last.fdi_net_inflows_usd >= 1e9 ? (last.fdi_net_inflows_usd / 1e9).toFixed(1) + 'B' : (last.fdi_net_inflows_usd / 1e6).toFixed(0) + 'M'} (${last.year})`);
      }
      return bullets.slice(0, 3);
    },
  };
}

function wave1AfricaEconomy(iso3: string): EconomyTabCopy {
  const profiles: Record<string, { sources: string; fxPair: string; fxLabel: string; inflationNote: string; gdpContext: string; growthContext: string }> = {
    GHA: { sources: 'World Bank, BoG, Ghana Statistical Service', fxPair: 'GHS/USD', fxLabel: 'Official Rate (BoG)', inflationNote: 'with BoG tightening supporting disinflation from 2023 peak', gdpContext: 'gold mining, cocoa exports, and fintech scale', growthContext: 'services and agriculture export resilience' },
    ZAF: { sources: 'World Bank, SARB, Stats SA', fxPair: 'ZAR/USD', fxLabel: 'Official Rate (SARB)', inflationNote: 'with SARB policy anchoring price stability amid energy transition', gdpContext: 'mining, automotive manufacturing, and renewable IPP investment', growthContext: 'industrial output and energy sector modernization' },
    ETH: { sources: 'World Bank, NBE, Central Statistics Agency', fxPair: 'ETB/USD', fxLabel: 'Official Rate (NBE)', inflationNote: 'with NBE policy response to food and fuel pass-through', gdpContext: 'EPZ manufacturing, coffee exports, and infrastructure investment', growthContext: 'manufacturing and agriculture-led expansion' },
    SEN: { sources: 'World Bank, BCEAO, ANSD', fxPair: 'XOF/USD', fxLabel: 'CFA Franc (BCEAO)', inflationNote: 'with CFA peg providing currency stability', gdpContext: 'phosphate mining, fisheries, and Sangomar energy production', growthContext: 'stable growth under IMF program oversight' },
    CIV: { sources: 'World Bank, BCEAO, INS Côte d\'Ivoire', fxPair: 'XOF/USD', fxLabel: 'CFA Franc (BCEAO)', inflationNote: 'with CFA peg and strong growth supporting macro stability', gdpContext: 'cocoa processing, gold mining, and Abidjan port investment', growthContext: 'West Africa\'s fastest-growing major economy' },
    TZA: { sources: 'World Bank, BoT, NBS Tanzania', fxPair: 'TZS/USD', fxLabel: 'Official Rate (BoT)', inflationNote: 'with BoT policy maintaining price stability', gdpContext: 'gold mining, EPZ apparel, and Dar es Salaam port upgrades', growthContext: 'mining and manufacturing export expansion' },
    ZWE: { sources: 'World Bank, IMF, Reserve Bank of Zimbabwe, ZIMSTAT', fxPair: 'ZiG/USD', fxLabel: 'Official Rate (RBZ)', inflationNote: 'with RBZ monetary tightening and USD dollarization reducing hyperinflation risk', gdpContext: 'platinum mining, lithium extraction, tobacco exports, and regional trade positioning', growthContext: 'mining sector recovery and agricultural diversification' },
  };
  const p = profiles[iso3] ?? profiles.GHA;

  return {
    dataSources: p.sources,
    fxPairLabel: p.fxPair,
    fxRateLabel: p.fxLabel,
    showParallelRate: false,
    showReformLine: false,
    forecastAuthority: 'IMF',
    heroInflationNote: p.inflationNote,
    buildGdpNarrative: ({ startGdpB, endGdpB, startYear, endYear, pctChange: chg }) =>
      `GDP expanded from $${startGdpB.toFixed(1)}B (${startYear}) to $${endGdpB.toFixed(1)}B (${endYear}), a ${chg.toFixed(0)}% change. Growth was driven by ${p.gdpContext}.`,
    buildGrowthNarrative: ({ latestGrowth, latestYear, forecast, forecastYear, hasForecast }) => {
      let s = `Growth reached ${latestGrowth.toFixed(1)}% in ${latestYear}, supported by ${p.growthContext}.`;
      if (hasForecast && forecast != null && forecastYear != null) {
        s += ` IMF projects ${forecast.toFixed(1)}% in ${forecastYear}.`;
      } else {
        s += ' Upgrade to Business for GDP growth forecasts.';
      }
      return s;
    },
    buildFxNarrative: ({ latestFx, earliestFx, latestYear }) =>
      `Exchange rate traded at ~${latestFx.toFixed(latestFx >= 100 ? 0 : 2)} ${p.fxPair.split('/')[0]}/USD in ${latestYear}${earliestFx ? `, from ~${earliestFx.toFixed(earliestFx >= 100 ? 0 : 2)} at series start` : ''}.`,
    buildIndicatorBullets: (years) => {
      const first = years[0];
      const last = years[years.length - 1];
      const bullets: string[] = [];
      if (first?.gdp_growth_pct != null && last?.gdp_growth_pct != null) {
        bullets.push(`GDP growth: ${first.gdp_growth_pct.toFixed(1)}% (${first.year}) → ${last.gdp_growth_pct.toFixed(1)}% (${last.year})`);
      }
      if (first?.gdp_current_usd && last?.gdp_current_usd) {
        bullets.push(`GDP scale: $${(first.gdp_current_usd / 1e9).toFixed(0)}B → $${(last.gdp_current_usd / 1e9).toFixed(0)}B`);
      }
      if (last?.fdi_net_inflows_usd != null) {
        bullets.push(`FDI inflows ~$${last.fdi_net_inflows_usd >= 1e9 ? (last.fdi_net_inflows_usd / 1e9).toFixed(1) + 'B' : (last.fdi_net_inflows_usd / 1e6).toFixed(0) + 'M'} (${last.year})`);
      }
      return bullets.slice(0, 3);
    },
  };
}

export { pctChange };
