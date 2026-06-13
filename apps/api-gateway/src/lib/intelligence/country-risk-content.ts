/**
 * Per-country Risk tab copy — Sprint D.
 * @see docs/execution/country-terminal-sprint-plan.md
 */

export interface RiskItem {
  title: string;
  severity: string;
  severityTone: 'amber' | 'red' | 'emerald';
  body: string;
  mitigants?: string[];
}

export interface RiskSecurityItem {
  region: string;
  detail: string;
}

export interface RiskCategoryContent {
  exportId: string;
  exportTitle: string;
  exportFileSlug: string;
  title: string;
  subtitle: string;
  icon: 'macro' | 'political' | 'operational';
  items: RiskItem[];
  securityItems?: RiskSecurityItem[];
  mitigatingFactor?: { title: string; body: string };
}

export interface MitigationStrategy {
  icon: 'users' | 'shield' | 'dollar' | 'check';
  title: string;
  body: string;
  borderClass: string;
}

export interface RiskStat {
  value: string;
  label: string;
  sublabel: string;
  accentClass: string;
}

export interface CountryRiskContent {
  heroSubtitle: string;
  heroFallback: string;
  macro: RiskCategoryContent;
  political: RiskCategoryContent;
  operational: RiskCategoryContent;
  mitigationStrategies: MitigationStrategy[];
  mitigationBullets: string[];
  riskAdjustedNarrative: string;
  riskAdjustedStats: RiskStat[];
  returnsBullets: string[];
}

const SEVERITY_CLASS = {
  amber: 'bg-amber-500/20 text-amber-400',
  red: 'bg-red-500/20 text-red-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
};

export function riskSeverityClass(tone: RiskItem['severityTone']) {
  return SEVERITY_CLASS[tone];
}

function nigeriaRisk(countryName: string): CountryRiskContent {
  return {
    heroSubtitle: 'Balanced assessment with structural reforms and mitigation frameworks',
    heroFallback: `${countryName}'s investment landscape requires a balanced assessment of macro, political, and operational risks. Risks are real but manageable through strategic partnerships and phased capital deployment.`,
    macro: {
      exportId: 'inflation',
      exportTitle: 'Macro Risks',
      exportFileSlug: 'macro-risks',
      title: 'Macro Risks',
      subtitle: 'Currency, Inflation, Debt',
      icon: 'macro',
      items: [
        {
          title: 'Currency Volatility',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Naira depreciated post-2023 unification; FX at {{FX}} ({{MACRO_ASOF_YEAR}}) per structured series. Volatility has moderated under managed float policy. CBN reserve position should be verified against latest official releases.',
          mitigants: ['Hedging instruments available', 'Hard currency revenue options'],
        },
        {
          title: 'Inflation',
          severity: 'MODERATE-HIGH',
          severityTone: 'red',
          body: 'Inflation at {{INFLATION}} ({{MACRO_ASOF_YEAR}}) remains elevated but declining from the 2023 peak. CBN policy rates should be verified against latest official releases.',
          mitigants: ['Monetary tightening', 'Agricultural reforms underway'],
        },
        {
          title: 'Debt Sustainability',
          severity: 'LOW-MODERATE',
          severityTone: 'emerald',
          body: 'Debt sustainability metrics should be verified against IMF/World Bank sovereign updates; treat debt-to-GDP ratios as estimates until tied to structured fiscal series.',
          mitigants: ['Below IMF threshold', 'Fiscal reforms improving revenue'],
        },
      ],
    },
    political: {
      exportId: 'political-risks-card',
      exportTitle: 'Political Risks',
      exportFileSlug: 'political-risks',
      title: 'Political Risks',
      subtitle: 'Governance, Security, Corruption',
      icon: 'political',
      items: [
        {
          title: 'Governance & Stability',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: "Nigeria's democracy is mature (25 years, 7 peaceful transitions), but challenges persist: 2027 presidential election watchpoint, security issues (Boko Haram, banditry), corruption rank 145/180.",
          mitigants: ['Strong institutions (CBN independence)', 'IMF/World Bank oversight'],
        },
      ],
      securityItems: [
        { region: 'Northeast', detail: 'Boko Haram insurgency (improving)' },
        { region: 'Northwest', detail: 'Banditry in farming regions' },
        { region: 'Southeast', detail: 'Secessionist movements (localized)' },
      ],
      mitigatingFactor: {
        title: 'Mitigating Factor',
        body: 'Private sector resilience: Nigerian companies (Dangote, BUA) have operated through multiple volatility cycles',
      },
    },
    operational: {
      exportId: 'operational-risks-card',
      exportTitle: 'Operational Risks',
      exportFileSlug: 'operational-risks',
      title: 'Operational Risks',
      subtitle: 'Power, Logistics, Talent',
      icon: 'operational',
      items: [
        {
          title: 'Power Supply',
          severity: 'HIGH IMPACT',
          severityTone: 'red',
          body: 'Grid instability requires self-generation (diesel/solar), adding 15-25% to operating costs. Lagos/Abuja grids more reliable than national grid.',
          mitigants: ['Solar/diesel backup standard', 'Power reforms underway'],
        },
        {
          title: 'Logistics',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Port congestion averages 10-14 days clearance. Road quality variable; Lagos-Abuja corridor is well-maintained.',
          mitigants: ['Lekki Deep Sea Port operational', 'Infrastructure improvements ongoing'],
        },
        {
          title: 'Talent Retention',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Brain drain to Europe/U.S./Canada impacts skilled workforce availability, particularly in tech and professional services.',
          mitigants: ['Competitive salaries retain talent', 'Equity participation effective'],
        },
      ],
    },
    mitigationStrategies: [
      { icon: 'users', title: 'Local Partnerships', body: 'Partner with established Nigerian conglomerates (Dangote, BUA, Flour Mills) for political relationships, supply chains, and operational expertise.', borderClass: 'border-emerald-500/10' },
      { icon: 'shield', title: 'Insurance Products', body: 'Utilize political risk insurance, currency hedging, and credit insurance from MIGA, DFC, Afreximbank, or private insurers to protect capital.', borderClass: 'border-blue-500/10' },
      { icon: 'dollar', title: 'Revenue Diversification', body: 'Balance domestic and export markets to hedge currency risk. Hard currency revenue streams (exports, diaspora) offset naira volatility.', borderClass: 'border-amber-500/10' },
      { icon: 'check', title: 'Phased Capital Deployment', body: 'De-risk through pilot phases: Start with small-scale operations, validate business model, then scale based on demonstrated ROI.', borderClass: 'border-cyan-500/10' },
    ],
    mitigationBullets: [
      'Local JV partners reduce operational and regulatory friction',
      'MIGA/DFC political risk insurance available for qualifying projects',
      'Phased deployment validates unit economics before scale-up',
    ],
    riskAdjustedNarrative: "Nigeria's risk-adjusted returns remain compelling for investors with 5-7 year horizons and operational flexibility. The combination of {{GDP_NOMINAL_USD}} economy scale ({{MACRO_ASOF_YEAR}}), structural reforms, and proven risk mitigation frameworks creates an attractive risk-reward profile for patient capital.",
    riskAdjustedStats: [
      { value: 'Manageable', label: 'Risk Level', sublabel: 'With proper mitigation', accentClass: 'text-emerald-400' },
      { value: '5-7 Years', label: 'Investment Horizon', sublabel: 'Patient capital rewarded', accentClass: 'text-blue-400' },
      { value: 'Compelling', label: 'Risk-Adjusted Returns', sublabel: 'Above emerging market avg', accentClass: 'text-emerald-400' },
    ],
    returnsBullets: [
      '{{GDP_NOMINAL_USD}} economy scale ({{MACRO_ASOF_YEAR}}) supports diversified entry strategies',
      'Structural reforms improving macro stability post-2023',
      'Risk-reward profile favors 5-7 year patient capital',
    ],
  };
}

function jamaicaRisk(countryName: string): CountryRiskContent {
  return {
    heroSubtitle: 'Caribbean risk profile with IMF anchor and tourism diversification mitigants',
    heroFallback: `${countryName}'s investment landscape requires balanced assessment of macro, political, and operational risks. Hurricane exposure and tourism concentration are real but manageable through insurance, diversification, and USD-linked revenue streams.`,
    macro: {
      exportId: 'inflation',
      exportTitle: 'Macro Risks',
      exportFileSlug: 'macro-risks',
      title: 'Macro Risks',
      subtitle: 'Currency, Debt, Remittances',
      icon: 'macro',
      items: [
        {
          title: 'Currency Volatility',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'JMD exchange rate volatility persists (~157 JMD/USD, 2025). IMF Extended Fund Facility anchors fiscal discipline. Tourism and remittance inflows ($3.5B+) provide natural USD hedges.',
          mitigants: ['USD-linked tourism revenue', 'Remittance corridor stability'],
        },
        {
          title: 'Inflation',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Inflation at ~7.0% (2025) with BOJ tightening supporting price stability. Lower volatility profile than larger emerging markets.',
          mitigants: ['BOJ policy tightening', 'Import cost moderation'],
        },
        {
          title: 'Debt Sustainability',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Debt-to-GDP elevated but improving under IMF program. Fiscal reforms targeting primary surplus maintenance and expenditure rationalization.',
          mitigants: ['IMF program oversight', 'Primary surplus targets'],
        },
      ],
    },
    political: {
      exportId: 'political-risks-card',
      exportTitle: 'Political Risks',
      exportFileSlug: 'political-risks',
      title: 'Political Risks',
      subtitle: 'Governance, Policy Continuity',
      icon: 'political',
      items: [
        {
          title: 'Governance & Stability',
          severity: 'LOW-MODERATE',
          severityTone: 'emerald',
          body: 'Stable democracy with peaceful transitions and low geopolitical risk relative to the Caribbean region. Policy continuity on digital transformation and tourism investment.',
          mitigants: ['Mature democratic institutions', 'Regional stability anchor'],
        },
      ],
      mitigatingFactor: {
        title: 'Mitigating Factor',
        body: 'English-speaking common law jurisdiction with established regulatory frameworks for financial services and tourism investment',
      },
    },
    operational: {
      exportId: 'operational-risks-card',
      exportTitle: 'Operational Risks',
      exportFileSlug: 'operational-risks',
      title: 'Operational Risks',
      subtitle: 'Hurricane, Infrastructure, Grid',
      icon: 'operational',
      items: [
        {
          title: 'Hurricane Exposure',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Seasonal hurricane risk to tourism and coastal infrastructure (June–November). Resilient building codes and insurance markets mitigate catastrophic loss.',
          mitigants: ['Comprehensive insurance coverage', 'Resilient construction standards'],
        },
        {
          title: 'Infrastructure Gaps',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Rural connectivity and grid reliability variable outside Kingston corridor. PPP models and renewable self-generation reduce dependency.',
          mitigants: ['PPP infrastructure models', 'Solar self-generation options'],
        },
        {
          title: 'Tourism Concentration',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Tourism contributes ~30% of GDP — cyclical exposure to global travel trends and weather events. Digital services diversification mitigates.',
          mitigants: ['Digital/BPO sector expansion', 'Luxury segment resilience'],
        },
      ],
    },
    mitigationStrategies: [
      { icon: 'users', title: 'Local Partnerships', body: 'Partner with established groups (GraceKennedy, Seprod, hotel operators) for market access, regulatory navigation, and supply chain integration.', borderClass: 'border-emerald-500/10' },
      { icon: 'shield', title: 'Insurance & Hedging', body: 'Hurricane and business interruption insurance, plus USD revenue streams from tourism and remittances to hedge JMD volatility.', borderClass: 'border-blue-500/10' },
      { icon: 'dollar', title: 'Revenue Diversification', body: 'Balance tourism with digital services, mining, and agriculture exports. CBI-eligible exports provide hard currency revenue.', borderClass: 'border-amber-500/10' },
      { icon: 'check', title: 'Phased Capital Deployment', body: 'Pilot operations in Kingston corridor before rural expansion. Validate hurricane season impact and grid reliability before full scale-up.', borderClass: 'border-cyan-500/10' },
    ],
    mitigationBullets: [
      'Kingston corridor offers best infrastructure and talent density',
      'Hurricane insurance and resilient design standard for coastal assets',
      'USD-linked tourism/remittance revenue hedges JMD exposure',
    ],
    riskAdjustedNarrative: "Jamaica's risk-adjusted returns are attractive for investors with 3-5 year horizons who can navigate hurricane seasonality and leverage CARICOM/CBI market access. IMF program anchor, tourism recovery, and digital services expansion create a favorable risk-reward profile for diversified Caribbean exposure.",
    riskAdjustedStats: [
      { value: 'Moderate', label: 'Risk Level', sublabel: 'IMF-anchored macro', accentClass: 'text-amber-400' },
      { value: '3-5 Years', label: 'Investment Horizon', sublabel: 'Tourism/digital cycle', accentClass: 'text-blue-400' },
      { value: 'Attractive', label: 'Risk-Adjusted Returns', sublabel: 'Caribbean gateway premium', accentClass: 'text-emerald-400' },
    ],
    returnsBullets: [
      '$19B economy with CARICOM/CBI market access',
      'Tourism recovery + digital nearshoring diversification',
      'IMF program supports fiscal anchor through 2027',
    ],
  };
}

function kenyaRisk(countryName: string): CountryRiskContent {
  return {
    heroSubtitle: 'East Africa risk profile with CBK anchor, AGOA access, and fintech diversification mitigants',
    heroFallback: `${countryName}'s investment landscape requires balanced assessment of macro, political, and operational risks. Currency cycles, fiscal pressure, and climate variability are real but manageable through export revenue hedges, EAC partnerships, and phased capital deployment.`,
    macro: {
      exportId: 'inflation',
      exportTitle: 'Macro Risks',
      exportFileSlug: 'macro-risks',
      title: 'Macro Risks',
      subtitle: 'Currency, Inflation, Debt',
      icon: 'macro',
      items: [
        {
          title: 'Currency Volatility',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'KES depreciation cycles persist (~130 KES/USD, 2025). CBK intervention and forex reserves provide anchors. Horticulture and tourism exports offer natural USD-linked revenue hedges.',
          mitigants: ['Export USD revenue streams', 'CBK forex reserve buffer'],
        },
        {
          title: 'Inflation',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Inflation at ~6.2% (2025) with CBK rate policy anchoring price stability. Food and fuel pass-through remain watchpoints during drought cycles.',
          mitigants: ['CBK tightening cycle', 'Agricultural supply diversification'],
        },
        {
          title: 'Fiscal Pressure',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Debt-to-GDP elevated (~68%, 2025) but IMF program supports fiscal consolidation. Revenue mobilization and expenditure discipline remain policy priorities.',
          mitigants: ['IMF program oversight', 'Infrastructure PPP models'],
        },
      ],
    },
    political: {
      exportId: 'political-risks-card',
      exportTitle: 'Political Risks',
      exportFileSlug: 'political-risks',
      title: 'Political Risks',
      subtitle: 'Governance, Policy Continuity',
      icon: 'political',
      items: [
        {
          title: 'Governance & Stability',
          severity: 'LOW-MODERATE',
          severityTone: 'emerald',
          body: 'Stable democracy with peaceful transitions and policy continuity on digital finance regulation, renewable energy, and logistics infrastructure investment.',
          mitigants: ['Mature democratic institutions', 'Regional stability anchor in EAC'],
        },
      ],
      mitigatingFactor: {
        title: 'Mitigating Factor',
        body: 'English-speaking common law jurisdiction with established CBK regulatory frameworks for fintech, banking, and capital markets',
      },
    },
    operational: {
      exportId: 'operational-risks-card',
      exportTitle: 'Operational Risks',
      exportFileSlug: 'operational-risks',
      title: 'Operational Risks',
      subtitle: 'Climate, Infrastructure, Regulation',
      icon: 'operational',
      items: [
        {
          title: 'Climate & Agriculture',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Drought cycles affect agricultural output and hydropower generation. Rift Valley and irrigation schemes mitigate but remain sector watchpoints for agribusiness investors.',
          mitigants: ['Irrigation expansion programs', 'Diversified renewable generation mix'],
        },
        {
          title: 'Infrastructure Bottlenecks',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Mombasa port congestion and last-mile grid constraints outside Nairobi corridor add operational friction. Northern Corridor upgrades are advancing but uneven.',
          mitigants: ['SGR corridor efficiency gains', 'PPP port modernization'],
        },
        {
          title: 'Fintech Regulation',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'CBK lending caps and consumer protection rules periodically adjust sector economics for digital lenders. Licensed operators with strong compliance frameworks are best positioned.',
          mitigants: ['CBK sandbox for innovation', 'Licensed operator advantage'],
        },
      ],
    },
    mitigationStrategies: [
      { icon: 'users', title: 'Local Partnerships', body: 'Partner with established groups (Safaricom, Equity Bank, export agribusiness operators) for market access, regulatory navigation, and EAC expansion pathways.', borderClass: 'border-emerald-500/10' },
      { icon: 'shield', title: 'Insurance & Hedging', body: 'Political risk insurance from MIGA/DFC, plus USD export revenue from horticulture and AGOA-eligible agriculture to hedge KES volatility.', borderClass: 'border-blue-500/10' },
      { icon: 'dollar', title: 'Revenue Diversification', body: 'Balance domestic mobile money scale with EAC cross-border payments and AGOA export corridors. Fintech BaaS and renewable IPPs offer hard currency options.', borderClass: 'border-amber-500/10' },
      { icon: 'check', title: 'Phased Capital Deployment', body: 'Pilot in Nairobi fintech or Mombasa logistics corridors before rural or cross-border scale-up. Validate regulatory and port throughput assumptions first.', borderClass: 'border-cyan-500/10' },
    ],
    mitigationBullets: [
      'Nairobi corridor offers best fintech talent and regulatory density',
      'AGOA-eligible export revenue hedges KES exposure',
      'EAC partnerships reduce cross-border operational friction',
    ],
    riskAdjustedNarrative: "Kenya's risk-adjusted returns are attractive for investors with 4-6 year horizons who can navigate currency cycles and leverage AGOA/EAC market access. CBK regulatory anchor, M-Pesa ecosystem scale, and renewable energy leadership create a favorable risk-reward profile for East Africa gateway exposure.",
    riskAdjustedStats: [
      { value: 'Manageable', label: 'Risk Level', sublabel: 'CBK-anchored macro', accentClass: 'text-emerald-400' },
      { value: '4-6 Years', label: 'Investment Horizon', sublabel: 'Fintech/infrastructure cycle', accentClass: 'text-blue-400' },
      { value: 'Attractive', label: 'Risk-Adjusted Returns', sublabel: 'East Africa gateway premium', accentClass: 'text-emerald-400' },
    ],
    returnsBullets: [
      '$115B economy with AGOA duty-free U.S. market access',
      'M-Pesa ecosystem + EAC payment interoperability scaling',
      'Renewable energy leadership supports long-duration IPP returns',
    ],
  };
}

function defaultRisk(countryName: string): CountryRiskContent {
  return {
    heroSubtitle: 'Macro, political, and operational risk assessment',
    heroFallback: `${countryName}'s investment landscape requires balanced risk assessment. See Souvera Country Analysis and signal scores for country-specific intelligence.`,
    macro: {
      exportId: 'inflation',
      exportTitle: 'Macro Risks',
      exportFileSlug: 'macro-risks',
      title: 'Macro Risks',
      subtitle: 'Currency, Inflation, Debt',
      icon: 'macro',
      items: [
        { title: 'Currency', severity: 'MODERATE', severityTone: 'amber', body: 'Monitor exchange rate trends in the Economy tab.', mitigants: ['Hedging available'] },
        { title: 'Inflation', severity: 'MODERATE', severityTone: 'amber', body: 'Review CPI trends and central bank policy.', mitigants: ['Policy response variable'] },
      ],
    },
    political: {
      exportId: 'political-risks-card',
      exportTitle: 'Political Risks',
      exportFileSlug: 'political-risks',
      title: 'Political Risks',
      subtitle: 'Governance, Stability',
      icon: 'political',
      items: [
        { title: 'Governance', severity: 'MODERATE', severityTone: 'amber', body: 'Assess institutional quality and policy continuity.', mitigants: ['Due diligence required'] },
      ],
    },
    operational: {
      exportId: 'operational-risks-card',
      exportTitle: 'Operational Risks',
      exportFileSlug: 'operational-risks',
      title: 'Operational Risks',
      subtitle: 'Infrastructure, Logistics',
      icon: 'operational',
      items: [
        { title: 'Infrastructure', severity: 'MODERATE', severityTone: 'amber', body: 'Evaluate power, transport, and connectivity for your sector.', mitigants: ['PPP options may apply'] },
      ],
    },
    mitigationStrategies: [
      { icon: 'users', title: 'Local Partnerships', body: 'Partner with established local operators for market entry.', borderClass: 'border-emerald-500/10' },
      { icon: 'shield', title: 'Insurance', body: 'Political risk and credit insurance from MIGA, DFC, or private markets.', borderClass: 'border-blue-500/10' },
      { icon: 'dollar', title: 'Diversification', body: 'Balance domestic and export revenue streams.', borderClass: 'border-amber-500/10' },
      { icon: 'check', title: 'Phased Deployment', body: 'Pilot before full-scale capital commitment.', borderClass: 'border-cyan-500/10' },
    ],
    mitigationBullets: ['Local partners reduce friction', 'Insurance products available', 'Phased deployment recommended'],
    riskAdjustedNarrative: `Risk-adjusted returns for ${countryName} depend on sector, entry strategy, and mitigation framework. Consult Souvera advisory for customized assessment.`,
    riskAdjustedStats: [
      { value: '—', label: 'Risk Level', sublabel: 'See signal score', accentClass: 'text-amber-400' },
      { value: '—', label: 'Horizon', sublabel: 'Sector-dependent', accentClass: 'text-blue-400' },
      { value: '—', label: 'Returns', sublabel: 'Case-by-case', accentClass: 'text-emerald-400' },
    ],
    returnsBullets: ['See Economy tab for macro context', 'See Opportunity tab for sector thesis'],
  };
}

function trinidadRisk(countryName: string): CountryRiskContent {
  return {
    heroSubtitle: 'Energy-dependent macro profile with CARICOM diversification mitigants',
    heroFallback: `${countryName}'s investment landscape balances energy price cyclicality against industrial scale, CBI access, and CARICOM integration.`,
    macro: {
      exportId: 'inflation',
      exportTitle: 'Macro Risks',
      exportFileSlug: 'macro-risks',
      title: 'Macro Risks',
      subtitle: 'Energy Prices, FX, Fiscal',
      icon: 'macro',
      items: [
        {
          title: 'Energy Price Cyclicality',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'GDP and fiscal revenues correlate with natural gas and petrochemical prices. Diversification into manufacturing and services reduces but does not eliminate exposure.',
          mitigants: ['Hedging via long-term LNG contracts', 'Downstream manufacturing expansion'],
        },
        {
          title: 'FX & Reserves',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'TTD managed float with energy export FX inflows. Reserve buffers support import coverage but energy downturns pressure balances.',
          mitigants: ['CBTT intervention framework', 'USD-linked export revenues'],
        },
      ],
    },
    political: {
      exportId: 'political-risks-card',
      exportTitle: 'Political Risks',
      exportFileSlug: 'political-risks',
      title: 'Political Risks',
      subtitle: 'Policy, Industrial Relations',
      icon: 'political',
      items: [
        {
          title: 'Policy Continuity',
          severity: 'LOW-MODERATE',
          severityTone: 'emerald',
          body: 'Stable democratic institutions with continuity on energy investment and CARICOM trade policy.',
          mitigants: ['Established energy regulatory framework', 'CARICOM treaty obligations'],
        },
      ],
    },
    operational: {
      exportId: 'operational-risks-card',
      exportTitle: 'Operational Risks',
      exportFileSlug: 'operational-risks',
      title: 'Operational Risks',
      subtitle: 'Infrastructure, Crime',
      icon: 'operational',
      items: [
        {
          title: 'Industrial Infrastructure',
          severity: 'LOW-MODERATE',
          severityTone: 'emerald',
          body: 'Point Lisas and port infrastructure are mature but aging assets require sustained capex.',
          mitigants: ['PPP port upgrades', 'Energy sector reinvestment'],
        },
        {
          title: 'Security',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Urban crime in Port of Spain corridor requires site security planning for industrial and office investments.',
          mitigants: ['Industrial estate security', 'Insurance coverage'],
        },
      ],
    },
    mitigationStrategies: [
      { icon: 'users', title: 'Local Partnerships', body: 'Partner with energy majors and established manufacturers for regulatory navigation and CARICOM distribution.', borderClass: 'border-emerald-500/10' },
      { icon: 'shield', title: 'Contract Structuring', body: 'Long-term offtake and political risk insurance for energy-linked projects.', borderClass: 'border-blue-500/10' },
      { icon: 'dollar', title: 'Revenue Diversification', body: 'Balance energy exposure with CBI-eligible manufacturing and services exports.', borderClass: 'border-amber-500/10' },
      { icon: 'check', title: 'Phased Deployment', body: 'Pilot in Point Lisas or port logistics before greenfield industrial scale-up.', borderClass: 'border-cyan-500/10' },
    ],
    mitigationBullets: ['Energy contracts hedge price cycles', 'CBI exports provide USD revenue', 'CARICOM partnerships reduce distribution friction'],
    riskAdjustedNarrative: `${countryName}'s risk-adjusted returns favor investors with 4–6 year horizons who can navigate energy cycles and leverage CBI/CARICOM access. Industrial scale and feedstock advantage create upside for downstream manufacturing exposure.`,
    riskAdjustedStats: [
      { value: 'Moderate', label: 'Risk Level', sublabel: 'Energy-linked macro', accentClass: 'text-amber-400' },
      { value: '4-6 Years', label: 'Investment Horizon', sublabel: 'Industrial/energy cycle', accentClass: 'text-blue-400' },
      { value: 'Attractive', label: 'Risk-Adjusted Returns', sublabel: 'Energy hub premium', accentClass: 'text-emerald-400' },
    ],
    returnsBullets: ['$28B economy with CARICOM/CBI access', 'LNG and petrochemical export scale', 'Guyana corridor logistics upside'],
  };
}

function barbadosRisk(countryName: string): CountryRiskContent {
  return {
    heroSubtitle: 'Tourism-concentrated economy with strong institutions and hurricane mitigants',
    heroFallback: `${countryName} combines high governance quality with tourism cyclicality and climate exposure — manageable through insurance, diversification, and CBI export revenue.`,
    macro: {
      exportId: 'inflation',
      exportTitle: 'Macro Risks',
      exportFileSlug: 'macro-risks',
      title: 'Macro Risks',
      subtitle: 'Tourism, Debt, FX',
      icon: 'macro',
      items: [
        {
          title: 'Tourism Concentration',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Tourism and IFS contribute majority of GDP — cyclical exposure to global travel trends and weather events.',
          mitigants: ['Premium segment resilience', 'IFS revenue diversification'],
        },
        {
          title: 'Fiscal & Debt',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Debt-to-GDP elevated but improving under IMF-supported fiscal reforms and revenue mobilization.',
          mitigants: ['IMF program oversight', 'Tourism tax revenue recovery'],
        },
      ],
    },
    political: {
      exportId: 'political-risks-card',
      exportTitle: 'Political Risks',
      exportFileSlug: 'political-risks',
      title: 'Political Risks',
      subtitle: 'Governance, Stability',
      icon: 'political',
      items: [
        {
          title: 'Institutional Quality',
          severity: 'LOW',
          severityTone: 'emerald',
          body: 'Strong rule of law, independent judiciary, and policy continuity on tourism and financial services regulation.',
          mitigants: ['Common-law legal framework', 'Regional policy leadership'],
        },
      ],
    },
    operational: {
      exportId: 'operational-risks-card',
      exportTitle: 'Operational Risks',
      exportFileSlug: 'operational-risks',
      title: 'Operational Risks',
      subtitle: 'Hurricane, Infrastructure',
      icon: 'operational',
      items: [
        {
          title: 'Hurricane Exposure',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Seasonal hurricane risk to coastal tourism and infrastructure (June–November). Building codes and insurance markets mitigate loss.',
          mitigants: ['Comprehensive insurance', 'Resilient construction standards'],
        },
        {
          title: 'Water & Energy Costs',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'High utility costs affect hospitality margins. Solar deployment and efficiency retrofits reduce exposure.',
          mitigants: ['Renewable self-generation', 'Government efficiency incentives'],
        },
      ],
    },
    mitigationStrategies: [
      { icon: 'users', title: 'Local Partnerships', body: 'Partner with hotel operators, rum producers, and IFS firms for market access.', borderClass: 'border-emerald-500/10' },
      { icon: 'shield', title: 'Insurance', body: 'Hurricane and business interruption coverage for coastal assets.', borderClass: 'border-blue-500/10' },
      { icon: 'dollar', title: 'Revenue Mix', body: 'Balance tourism with IFS and CBI-eligible manufacturing exports.', borderClass: 'border-amber-500/10' },
      { icon: 'check', title: 'Phased Deployment', body: 'Pilot hospitality or solar before large-scale greenfield resort investment.', borderClass: 'border-cyan-500/10' },
    ],
    mitigationBullets: ['Strong institutions reduce political risk', 'CBI rum and food exports hedge tourism cycles', 'Solar reduces utility cost exposure'],
    riskAdjustedNarrative: `${countryName}'s risk-adjusted profile suits investors seeking stable Caribbean exposure with 3–5 year horizons. High governance, CBI access, and IFS diversification offset tourism and hurricane seasonality.`,
    riskAdjustedStats: [
      { value: 'Low-Moderate', label: 'Risk Level', sublabel: 'Institutional anchor', accentClass: 'text-emerald-400' },
      { value: '3-5 Years', label: 'Investment Horizon', sublabel: 'Tourism/IFS cycle', accentClass: 'text-blue-400' },
      { value: 'Attractive', label: 'Risk-Adjusted Returns', sublabel: 'High-income stability', accentClass: 'text-emerald-400' },
    ],
    returnsBullets: ['Highest GDP per capita in Eastern Caribbean', 'CBI and UK/EU tourism corridors', 'IFS and fintech sandbox growth'],
  };
}

function bahamasRisk(countryName: string): CountryRiskContent {
  return {
    heroSubtitle: 'Tourism and IFS concentration with hurricane and fiscal watchpoints',
    heroFallback: `${countryName}'s investment landscape balances USD stability and IFS depth against tourism cyclicality, hurricane exposure, and fiscal consolidation needs.`,
    macro: {
      exportId: 'inflation',
      exportTitle: 'Macro Risks',
      exportFileSlug: 'macro-risks',
      title: 'Macro Risks',
      subtitle: 'Tourism, Fiscal, FX',
      icon: 'macro',
      items: [
        {
          title: 'Tourism Dependence',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Tourism drives majority of employment and FX earnings — sensitive to U.S. travel trends and hurricane disruptions.',
          mitigants: ['Luxury segment resilience', 'Cruise volume recovery'],
        },
        {
          title: 'Fiscal Consolidation',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'Post-pandemic fiscal deficits elevated; revenue recovery and expenditure discipline remain priorities.',
          mitigants: ['Tourism tax recovery', 'IFS stable revenue base'],
        },
      ],
    },
    political: {
      exportId: 'political-risks-card',
      exportTitle: 'Political Risks',
      exportFileSlug: 'political-risks',
      title: 'Political Risks',
      subtitle: 'Policy, Regulation',
      icon: 'political',
      items: [
        {
          title: 'Policy Stability',
          severity: 'LOW-MODERATE',
          severityTone: 'emerald',
          body: 'Stable governance with continuity on tourism investment, offshore finance regulation, and CBI trade frameworks.',
          mitigants: ['BSD currency peg', 'Established IFS regulatory regime'],
        },
      ],
    },
    operational: {
      exportId: 'operational-risks-card',
      exportTitle: 'Operational Risks',
      exportFileSlug: 'operational-risks',
      title: 'Operational Risks',
      subtitle: 'Hurricane, Labor',
      icon: 'operational',
      items: [
        {
          title: 'Hurricane Risk',
          severity: 'HIGH',
          severityTone: 'red',
          body: 'Archipelago geography creates significant hurricane exposure for coastal resorts and infrastructure. Dorian-scale events remain tail risks.',
          mitigants: ['Comprehensive insurance', 'Resilient building codes', 'Geographic diversification across islands'],
        },
        {
          title: 'Labor & Costs',
          severity: 'MODERATE',
          severityTone: 'amber',
          body: 'High cost of living affects hospitality labor markets. Import dependence for goods and energy adds cost pressure.',
          mitigants: ['USD peg reduces FX risk', 'Freeport logistics efficiency'],
        },
      ],
    },
    mitigationStrategies: [
      { icon: 'users', title: 'Local Partnerships', body: 'Partner with resort groups, port operators, and trust companies for operational expertise.', borderClass: 'border-emerald-500/10' },
      { icon: 'shield', title: 'Insurance & Hedging', body: 'Hurricane, business interruption, and political risk coverage for coastal assets.', borderClass: 'border-blue-500/10' },
      { icon: 'dollar', title: 'USD Revenue', body: 'Tourism and IFS generate USD revenues aligned with BSD peg — reduced currency mismatch for U.S. investors.', borderClass: 'border-amber-500/10' },
      { icon: 'check', title: 'Phased Deployment', body: 'Validate hurricane insurance and occupancy assumptions before large resort capex.', borderClass: 'border-cyan-500/10' },
    ],
    mitigationBullets: ['USD peg simplifies investor returns', 'CBI exports diversify beyond tourism', 'Freeport offers non-tourism logistics exposure'],
    riskAdjustedNarrative: `${countryName}'s risk-adjusted returns appeal to investors accepting hurricane seasonality in exchange for USD stability, IFS depth, and CBI access. Premium tourism recovery supports 4–6 year hospitality and real estate horizons.`,
    riskAdjustedStats: [
      { value: 'Moderate', label: 'Risk Level', sublabel: 'Hurricane watchpoint', accentClass: 'text-amber-400' },
      { value: '4-6 Years', label: 'Investment Horizon', sublabel: 'Tourism/real estate', accentClass: 'text-blue-400' },
      { value: 'Attractive', label: 'Risk-Adjusted Returns', sublabel: 'USD-stable gateway', accentClass: 'text-emerald-400' },
    ],
    returnsBullets: ['$14B economy with BSD/USD peg', 'CBI preferential U.S. export access', 'IFS and Freeport diversification'],
  };
}

export function getRiskContent(iso3: string, countryName: string): CountryRiskContent {
  const key = iso3.toUpperCase();
  if (key === 'NGA') return nigeriaRisk(countryName);
  if (key === 'JAM') return jamaicaRisk(countryName);
  if (key === 'KEN') return kenyaRisk(countryName);
  if (key === 'TTO') return trinidadRisk(countryName);
  if (key === 'BRB') return barbadosRisk(countryName);
  if (key === 'BHS') return bahamasRisk(countryName);
  if (['GHA', 'ZAF', 'ETH', 'SEN', 'CIV', 'TZA'].includes(key)) return wave1AfricaRisk(key, countryName);
  return defaultRisk(countryName);
}

function wave1AfricaRisk(iso3: string, countryName: string): CountryRiskContent {
  const profiles: Record<string, { subtitle: string; fallback: string; riskLevel: string; horizon: string; returns: string; narrative: string; bullets: string[] }> = {
    GHA: { subtitle: 'West Africa risk profile with BoG anchor and AGOA export mitigants', fallback: `${countryName} requires balanced assessment of cedi volatility, debt levels, and infrastructure gaps — manageable through export revenue hedges and IMF program oversight.`, riskLevel: 'Manageable', horizon: '4-6 Years', returns: 'Attractive', narrative: `${countryName}'s risk-adjusted returns are attractive for investors with 4-6 year horizons who can navigate currency cycles and leverage AGOA/ECOWAS market access.`, bullets: ['$83B economy with AGOA duty-free U.S. access', 'Gold and cocoa export USD revenue hedges', 'Stable democratic institutions'] },
    ZAF: { subtitle: 'Industrial economy with energy transition and coalition governance watchpoints', fallback: `${countryName}'s investment landscape balances deep capital markets and industrial scale against load-shedding, rand volatility, and policy uncertainty.`, riskLevel: 'Moderate', horizon: '5-7 Years', returns: 'Compelling', narrative: `${countryName}'s risk-adjusted returns favor patient capital with 5-7 year horizons leveraging JSE liquidity, AGOA manufacturing access, and renewable IPP diversification.`, bullets: ['$380B economy with deep capital markets', 'AGOA automotive and PGM export corridors', 'Renewable IPP rollout reducing grid risk'] },
    ETH: { subtitle: 'High-growth manufacturing economy with AGOA suspension and forex watchpoints', fallback: `${countryName} offers compelling growth but requires careful navigation of AGOA suspension, forex constraints, and regulatory evolution.`, riskLevel: 'Elevated', horizon: '5-8 Years', returns: 'High Potential', narrative: `${countryName}'s risk-adjusted returns reward patient capital accepting AGOA restoration uncertainty in exchange for EPZ scale, coffee export corridors, and 128M domestic market access.`, bullets: ['$156B economy with 6%+ growth trajectory', '$680M+ AGOA restoration potential', 'EPZ apparel manufacturing scale'] },
    SEN: { subtitle: 'West Africa stability anchor with CFA peg and energy diversification mitigants', fallback: `${countryName} combines political stability and CFA currency anchor with moderate infrastructure and energy diversification requirements.`, riskLevel: 'Low-Moderate', horizon: '3-5 Years', returns: 'Attractive', narrative: `${countryName}'s risk-adjusted returns suit investors seeking stable West African exposure with 3-5 year horizons leveraging AGOA access and Sangomar energy production.`, bullets: ['$31B stable democracy with CFA peg', 'AGOA-eligible phosphate and fisheries exports', 'Diamniadio industrial zone pipeline'] },
    CIV: { subtitle: 'Fast-growing West Africa economy with strong macro and port logistics mitigants', fallback: `${countryName} offers strong growth with manageable political and infrastructure risks mitigated by CFA peg and Abidjan port investment.`, riskLevel: 'Manageable', horizon: '4-6 Years', returns: 'Compelling', narrative: `${countryName}'s risk-adjusted returns are compelling for investors with 4-6 year horizons capturing West Africa's fastest major economy growth under AGOA cocoa export access.`, bullets: ['$87B economy — West Africa growth leader', 'World\'s largest cocoa producer with AGOA access', 'Abidjan port regional hub advantage'] },
    TZA: { subtitle: 'East Africa resource economy with regulatory evolution and AGOA EPZ mitigants', fallback: `${countryName} balances mining and EPZ apparel opportunity against infrastructure gaps and regulatory evolution outside Dar es Salaam.`, riskLevel: 'Moderate', horizon: '4-6 Years', returns: 'Attractive', narrative: `${countryName}'s risk-adjusted returns attract investors with 4-6 year horizons leveraging AGOA EPZ apparel access, gold mining scale, and EAC market integration.`, bullets: ['$86B economy with EAC single market access', 'AGOA-eligible EPZ apparel exports', 'Gold mining and cashew export corridors'] },
  };
  const p = profiles[iso3] ?? profiles.GHA;
  return {
    heroSubtitle: p.subtitle,
    heroFallback: p.fallback,
    macro: { exportId: 'inflation', exportTitle: 'Macro Risks', exportFileSlug: 'macro-risks', title: 'Macro Risks', subtitle: 'Currency, Inflation, Debt', icon: 'macro', items: [{ title: 'Currency & Inflation', severity: 'MODERATE', severityTone: 'amber', body: `Monitor exchange rate trends and CPI in the Economy tab for ${countryName}.`, mitigants: ['Export USD revenue where applicable', 'Regional trade frameworks'] }] },
    political: { exportId: 'political-risks-card', exportTitle: 'Political Risks', exportFileSlug: 'political-risks', title: 'Political Risks', subtitle: 'Governance, Stability', icon: 'political', items: [{ title: 'Governance & Stability', severity: 'LOW-MODERATE', severityTone: 'emerald', body: `Assess institutional quality and policy continuity for ${countryName}.`, mitigants: ['Due diligence on local partners'] }] },
    operational: { exportId: 'operational-risks-card', exportTitle: 'Operational Risks', exportFileSlug: 'operational-risks', title: 'Operational Risks', subtitle: 'Infrastructure, Logistics', icon: 'operational', items: [{ title: 'Infrastructure', severity: 'MODERATE', severityTone: 'amber', body: 'Evaluate power, transport, and connectivity for your sector.', mitigants: ['PPP options may apply'] }] },
    mitigationStrategies: [
      { icon: 'users', title: 'Local Partnerships', body: `Partner with established operators in ${countryName} for market entry.`, borderClass: 'border-emerald-500/10' },
      { icon: 'shield', title: 'Insurance', body: 'Political risk and credit insurance from MIGA, DFC, or private markets.', borderClass: 'border-blue-500/10' },
      { icon: 'dollar', title: 'Diversification', body: 'Balance domestic and AGOA export revenue streams.', borderClass: 'border-amber-500/10' },
      { icon: 'check', title: 'Phased Deployment', body: 'Pilot before full-scale capital commitment.', borderClass: 'border-cyan-500/10' },
    ],
    mitigationBullets: ['Local partners reduce friction', 'AGOA export revenue hedges FX exposure', 'Phased deployment recommended'],
    riskAdjustedNarrative: p.narrative,
    riskAdjustedStats: [
      { value: p.riskLevel, label: 'Risk Level', sublabel: 'With proper mitigation', accentClass: 'text-emerald-400' },
      { value: p.horizon, label: 'Investment Horizon', sublabel: 'Patient capital rewarded', accentClass: 'text-blue-400' },
      { value: p.returns, label: 'Risk-Adjusted Returns', sublabel: 'Above emerging market avg', accentClass: 'text-emerald-400' },
    ],
    returnsBullets: p.bullets,
  };
}
