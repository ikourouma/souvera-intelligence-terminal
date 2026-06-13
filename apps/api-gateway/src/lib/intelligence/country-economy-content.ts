/**
 * Per-country Economy tab copy — Sprint C.
 * @see docs/execution/country-terminal-sprint-plan.md
 */

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

function defaultEconomy(): EconomyTabCopy {
  return {
    dataSources: 'World Bank, Souvera Analysis',
    fxPairLabel: 'Local/USD',
    fxRateLabel: 'Official Rate',
    showParallelRate: false,
    showReformLine: false,
    forecastAuthority: 'IMF',
    heroInflationNote: 'based on latest national statistics',
    buildGdpNarrative: ({ startGdpB, endGdpB, startYear, endYear, pctChange: chg }) =>
      `GDP expanded from $${startGdpB.toFixed(1)}B (${startYear}) to $${endGdpB.toFixed(1)}B (${endYear}), a ${chg.toFixed(0)}% change over the period.`,
    buildGrowthNarrative: ({ latestGrowth, latestYear, forecast, forecastYear, hasForecast }) => {
      let s = `Latest GDP growth: ${latestGrowth.toFixed(1)}% (${latestYear}).`;
      if (hasForecast && forecast != null && forecastYear != null) {
        s += ` Forecast: ${forecast.toFixed(1)}% (${forecastYear}).`;
      }
      return s;
    },
    buildFxNarrative: ({ latestFx, latestYear }) =>
      `Exchange rate: ~${latestFx.toFixed(2)} local currency per USD (${latestYear}).`,
    buildIndicatorBullets: (years) => {
      const last = years[years.length - 1];
      const bullets: string[] = [];
      if (last?.gdp_growth_pct != null) bullets.push(`Growth ${last.gdp_growth_pct.toFixed(1)}% (${last.year})`);
      if (last?.inflation_cpi_pct != null) bullets.push(`Inflation ${last.inflation_cpi_pct.toFixed(1)}% (${last.year})`);
      return bullets;
    },
  };
}

export function getEconomyTabCopy(iso3: string): EconomyTabCopy {
  const key = iso3.toUpperCase();
  if (key === 'NGA') return ngaEconomy();
  if (key === 'JAM') return jamEconomy();
  if (key === 'KEN') return kenEconomy();
  if (['GHA', 'ZAF', 'ETH', 'SEN', 'CIV', 'TZA'].includes(key)) return wave1AfricaEconomy(key);
  return defaultEconomy();
}

function wave1AfricaEconomy(iso3: string): EconomyTabCopy {
  const profiles: Record<string, { sources: string; fxPair: string; fxLabel: string; inflationNote: string; gdpContext: string; growthContext: string }> = {
    GHA: { sources: 'World Bank, BoG, Ghana Statistical Service', fxPair: 'GHS/USD', fxLabel: 'Official Rate (BoG)', inflationNote: 'with BoG tightening supporting disinflation from 2023 peak', gdpContext: 'gold mining, cocoa exports, and fintech scale', growthContext: 'services and agriculture export resilience' },
    ZAF: { sources: 'World Bank, SARB, Stats SA', fxPair: 'ZAR/USD', fxLabel: 'Official Rate (SARB)', inflationNote: 'with SARB policy anchoring price stability amid energy transition', gdpContext: 'mining, automotive manufacturing, and renewable IPP investment', growthContext: 'industrial output and energy sector modernization' },
    ETH: { sources: 'World Bank, NBE, Central Statistics Agency', fxPair: 'ETB/USD', fxLabel: 'Official Rate (NBE)', inflationNote: 'with NBE policy response to food and fuel pass-through', gdpContext: 'EPZ manufacturing, coffee exports, and infrastructure investment', growthContext: 'manufacturing and agriculture-led expansion' },
    SEN: { sources: 'World Bank, BCEAO, ANSD', fxPair: 'XOF/USD', fxLabel: 'CFA Franc (BCEAO)', inflationNote: 'with CFA peg providing currency stability', gdpContext: 'phosphate mining, fisheries, and Sangomar energy production', growthContext: 'stable growth under IMF program oversight' },
    CIV: { sources: 'World Bank, BCEAO, INS Côte d\'Ivoire', fxPair: 'XOF/USD', fxLabel: 'CFA Franc (BCEAO)', inflationNote: 'with CFA peg and strong growth supporting macro stability', gdpContext: 'cocoa processing, gold mining, and Abidjan port investment', growthContext: 'West Africa\'s fastest-growing major economy' },
    TZA: { sources: 'World Bank, BoT, NBS Tanzania', fxPair: 'TZS/USD', fxLabel: 'Official Rate (BoT)', inflationNote: 'with BoT policy maintaining price stability', gdpContext: 'gold mining, EPZ apparel, and Dar es Salaam port upgrades', growthContext: 'mining and manufacturing export expansion' },
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
