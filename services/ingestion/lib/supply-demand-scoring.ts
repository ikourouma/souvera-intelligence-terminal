/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * Supply-Demand Matrix Scoring Algorithms
 * Owner: Afronovation, Inc.
 * Phase 4C: Supply-Demand Matrix
 * =====================================================
 *
 * This module contains the scoring algorithms for the Supply-Demand Matrix.
 * Each matrix cell (country × sector) receives three scores:
 *   1. Supply Score (0-100): Production capacity, export readiness
 *   2. Demand Score (0-100): US market size, import dependency
 *   3. Opportunity Score (0-100): Combined signal with adjustments
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConfidenceLevel = 'A' | 'B' | 'C';
export type OpportunityTier = 1 | 2 | 3 | 4;

export interface SupplyComponents {
  exportVolumePercentile: number;
  infrastructureScore: number;
  regulatoryScore: number;
  fdiScore: number;
  laborQualityScore: number;
  manufacturingCapacity: number;
}

export interface DemandComponents {
  usImportVolumePercentile: number;
  growthScore: number;
  diversificationScore: number;
  policyIncentiveScore: number;
}

export interface SupplySignal {
  supply_score: number;
  supply_confidence: ConfidenceLevel;
  supply_components: SupplyComponents;
  export_volume_usd: number;
  infrastructure_score: number;
  fdi_inflows_usd: number;
  labor_quality_index: number;
  manufacturing_capacity_index: number;
  regulatory_score: number;
}

export interface DemandSignal {
  demand_score: number;
  demand_confidence: ConfidenceLevel;
  demand_components: DemandComponents;
  us_import_volume_usd: number;
  us_import_growth_pct: number;
  us_diversification_pressure: number;
  policy_incentive_score: number;
  china_market_share_pct: number;
}

export interface OpportunitySignal {
  opportunity_score: number;
  opportunity_tier: OpportunityTier;
  opportunity_rationale: string;
  adjustments: {
    agoaBonus: number;
    cbtpaBonus: number;
    tariffBonus: number;
    tradeCorridorBonus: number;
    chinaCompetitionPenalty: number;
    infrastructurePenalty: number;
    politicalRiskPenalty: number;
  };
}

export interface MatrixCellData {
  supply: SupplySignal;
  demand: DemandSignal;
  opportunity: OpportunitySignal;
}

// ─── Sector Definitions ───────────────────────────────────────────────────────

export const SECTORS = {
  manufacturing_textiles: {
    key: 'manufacturing_textiles',
    label: 'Manufacturing & Textiles',
    icon: '🏭',
    usImportVolume2023: 185_000_000_000,
    chinaShare2023: 32.5,
    growth5YrPct: 3.2,
    policyIncentiveScore: 75,
  },
  agriculture_food: {
    key: 'agriculture_food',
    label: 'Agriculture & Food Processing',
    icon: '🌾',
    usImportVolume2023: 165_000_000_000,
    chinaShare2023: 8.5,
    growth5YrPct: 4.8,
    policyIncentiveScore: 65,
  },
  energy_power: {
    key: 'energy_power',
    label: 'Energy & Power',
    icon: '⚡',
    usImportVolume2023: 280_000_000_000,
    chinaShare2023: 1.2,
    growth5YrPct: -2.5,
    policyIncentiveScore: 80,
  },
  mining_minerals: {
    key: 'mining_minerals',
    label: 'Mining & Critical Minerals',
    icon: '⛏️',
    usImportVolume2023: 95_000_000_000,
    chinaShare2023: 18.5,
    growth5YrPct: 6.8,
    policyIncentiveScore: 90,
  },
  digital_infrastructure: {
    key: 'digital_infrastructure',
    label: 'Digital Infrastructure',
    icon: '📡',
    usImportVolume2023: 125_000_000_000,
    chinaShare2023: 42.5,
    growth5YrPct: 8.5,
    policyIncentiveScore: 85,
  },
  fintech_finance: {
    key: 'fintech_finance',
    label: 'Fintech & Digital Finance',
    icon: '💳',
    usImportVolume2023: 0,
    chinaShare2023: 0,
    growth5YrPct: 15.2,
    policyIncentiveScore: 70,
  },
  logistics_trade: {
    key: 'logistics_trade',
    label: 'Logistics & Trade',
    icon: '🚢',
    usImportVolume2023: 0,
    chinaShare2023: 0,
    growth5YrPct: 5.5,
    policyIncentiveScore: 60,
  },
  tourism_hospitality: {
    key: 'tourism_hospitality',
    label: 'Tourism & Hospitality',
    icon: '🏨',
    usImportVolume2023: 0,
    chinaShare2023: 0,
    growth5YrPct: 12.0,
    policyIncentiveScore: 50,
  },
} as const;

export type SectorKey = keyof typeof SECTORS;

// ─── Country Data Structures ──────────────────────────────────────────────────

export interface CountryMacroData {
  iso3: string;
  name: string;
  region: 'Africa' | 'Caribbean';
  subRegion: string;
  gdpUsd: number;
  populationM: number;
  doingBusinessScore: number;
  infrastructureScore: number;
  laborQualityIndex: number;
  politicalRiskScore: number;
  agoaEligible: boolean;
  cbtpaEligible: boolean;
  afcftaMember: boolean;
}

export interface SectorSpecificData {
  exportVolumeUsd?: number;
  fdiInflowsUsd?: number;
  manufacturingCapacity?: number;
  sectorGdpSharePct?: number;
}

// ─── Scoring Algorithms ───────────────────────────────────────────────────────

/**
 * Calculate Supply Score for a country-sector pair.
 * Score components:
 *   - Export volume percentile (30%)
 *   - Infrastructure score (15%)
 *   - Regulatory/Doing Business score (10%)
 *   - FDI inflows (15%)
 *   - Labor quality (10%)
 *   - Manufacturing capacity (20%)
 */
export function calculateSupplyScore(
  country: CountryMacroData,
  sector: SectorKey,
  sectorData: SectorSpecificData,
  allExportVolumes: number[]
): SupplySignal {
  const sectorDef = SECTORS[sector];
  
  // Estimate export volume if not provided
  const sectorGdpShare = sectorData.sectorGdpSharePct ?? estimateSectorGdpShare(country, sector);
  const estimatedExportVolume = sectorData.exportVolumeUsd ?? 
    Math.round(country.gdpUsd * (sectorGdpShare / 100) * 0.15);
  
  // Calculate percentile rank for export volume
  const exportPercentile = percentileRank(estimatedExportVolume, allExportVolumes);
  
  // Infrastructure score (already 0-100)
  const infraScore = country.infrastructureScore;
  
  // Regulatory score from Doing Business (already 0-100)
  const regulatoryScore = country.doingBusinessScore;
  
  // FDI score (normalize to 0-100 based on $100M threshold)
  const fdiInflows = sectorData.fdiInflowsUsd ?? estimateFdiInflows(country.gdpUsd, sector);
  const fdiScore = Math.min((fdiInflows / 100_000_000) * 10, 100);
  
  // Labor quality (already 0-100)
  const laborScore = country.laborQualityIndex;
  
  // Manufacturing capacity (0-100)
  const mfgCapacity = sectorData.manufacturingCapacity ?? 
    estimateManufacturingCapacity(country, sector);
  
  // Calculate weighted supply score
  const supplyScore = Math.round(
    (exportPercentile * 0.30) +
    (infraScore * 0.15) +
    (regulatoryScore * 0.10) +
    (fdiScore * 0.15) +
    (laborScore * 0.10) +
    (mfgCapacity * 0.20)
  );
  
  // Determine confidence level
  let confidence: ConfidenceLevel = 'C';
  if (sectorData.exportVolumeUsd && sectorData.fdiInflowsUsd) {
    confidence = 'A';
  } else if (sectorData.exportVolumeUsd || sectorData.fdiInflowsUsd) {
    confidence = 'B';
  }
  
  return {
    supply_score: Math.min(100, Math.max(0, supplyScore)),
    supply_confidence: confidence,
    supply_components: {
      exportVolumePercentile: exportPercentile,
      infrastructureScore: infraScore,
      regulatoryScore,
      fdiScore,
      laborQualityScore: laborScore,
      manufacturingCapacity: mfgCapacity,
    },
    export_volume_usd: estimatedExportVolume,
    infrastructure_score: infraScore,
    fdi_inflows_usd: fdiInflows,
    labor_quality_index: laborScore,
    manufacturing_capacity_index: mfgCapacity,
    regulatory_score: regulatoryScore,
  };
}

/**
 * Calculate Demand Score for a sector.
 * Score components:
 *   - US import volume percentile (35%)
 *   - Growth rate score (25%)
 *   - Diversification pressure (20%)
 *   - Policy incentives (20%)
 */
export function calculateDemandScore(sector: SectorKey): DemandSignal {
  const sectorDef = SECTORS[sector];
  const allImportVolumes = Object.values(SECTORS).map(s => s.usImportVolume2023);
  
  // Volume percentile (for trade-based sectors)
  const volumePercentile = sectorDef.usImportVolume2023 > 0 
    ? percentileRank(sectorDef.usImportVolume2023, allImportVolumes)
    : 50; // Services sectors get neutral score
  
  // Growth score: 0% = 50, 10% = 100, -10% = 0
  const growthScore = Math.min(100, Math.max(0, (sectorDef.growth5YrPct + 5) * 10));
  
  // Diversification pressure: higher China share = higher pressure = higher score
  const diversificationScore = sectorDef.chinaShare2023 > 30 ? 85 
    : sectorDef.chinaShare2023 > 20 ? 70 
    : sectorDef.chinaShare2023 > 10 ? 55 
    : 40;
  
  // Policy incentives (already 0-100)
  const policyScore = sectorDef.policyIncentiveScore;
  
  // Calculate weighted demand score
  const demandScore = Math.round(
    (volumePercentile * 0.35) +
    (growthScore * 0.25) +
    (diversificationScore * 0.20) +
    (policyScore * 0.20)
  );
  
  return {
    demand_score: Math.min(100, Math.max(0, demandScore)),
    demand_confidence: 'A', // US data is always high quality
    demand_components: {
      usImportVolumePercentile: volumePercentile,
      growthScore,
      diversificationScore,
      policyIncentiveScore: policyScore,
    },
    us_import_volume_usd: sectorDef.usImportVolume2023,
    us_import_growth_pct: sectorDef.growth5YrPct,
    us_diversification_pressure: diversificationScore,
    policy_incentive_score: policyScore,
    china_market_share_pct: sectorDef.chinaShare2023,
  };
}

/**
 * Calculate Opportunity Score combining supply and demand with adjustments.
 * Base: (Supply × 0.45) + (Demand × 0.45)
 * Adjustments:
 *   + AGOA/CBTPA eligibility: +10 points
 *   + Tariff preference margin >10%: +5 points
 *   + Existing trade corridor: +5 points
 *   - High Chinese competition (>30%): -10 points
 *   - Infrastructure gaps (<50): -5 points
 *   - Political risk (>50): -10 points
 */
export function calculateOpportunityScore(
  supply: SupplySignal,
  demand: DemandSignal,
  country: CountryMacroData,
  currentTradeUsd: number,
  tariffPreferenceMargin: number
): OpportunitySignal {
  // Base score
  const baseScore = (supply.supply_score * 0.45) + (demand.demand_score * 0.45);
  
  // Calculate adjustments
  const agoaBonus = country.agoaEligible ? 10 : 0;
  const cbtpaBonus = country.cbtpaEligible ? 10 : 0;
  const tariffBonus = tariffPreferenceMargin > 10 ? 5 : tariffPreferenceMargin > 5 ? 3 : 0;
  const tradeCorridorBonus = currentTradeUsd > 100_000_000 ? 5 
    : currentTradeUsd > 10_000_000 ? 3 : 0;
  
  const chinaCompetitionPenalty = demand.china_market_share_pct > 30 ? -10 
    : demand.china_market_share_pct > 20 ? -5 : 0;
  const infrastructurePenalty = supply.infrastructure_score < 50 ? -5 : 0;
  const politicalRiskPenalty = country.politicalRiskScore > 50 ? -10 
    : country.politicalRiskScore > 30 ? -5 : 0;
  
  // Calculate final score (capped 0-100)
  const adjustedScore = baseScore + agoaBonus + cbtpaBonus + tariffBonus + 
    tradeCorridorBonus + chinaCompetitionPenalty + infrastructurePenalty + politicalRiskPenalty;
  const opportunityScore = Math.min(100, Math.max(0, Math.round(adjustedScore)));
  
  // Determine tier
  let tier: OpportunityTier;
  if (opportunityScore >= 80) tier = 1;
  else if (opportunityScore >= 60) tier = 2;
  else if (opportunityScore >= 40) tier = 3;
  else tier = 4;
  
  // Generate rationale
  const rationale = generateOpportunityRationale(
    opportunityScore, tier, supply, demand, country, currentTradeUsd
  );
  
  return {
    opportunity_score: opportunityScore,
    opportunity_tier: tier,
    opportunity_rationale: rationale,
    adjustments: {
      agoaBonus,
      cbtpaBonus,
      tariffBonus,
      tradeCorridorBonus,
      chinaCompetitionPenalty,
      infrastructurePenalty,
      politicalRiskPenalty,
    },
  };
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function percentileRank(value: number, allValues: number[]): number {
  if (allValues.length === 0) return 50;
  const sorted = [...allValues].sort((a, b) => a - b);
  const below = sorted.filter(v => v < value).length;
  return Math.round((below / sorted.length) * 100);
}

function estimateSectorGdpShare(country: CountryMacroData, sector: SectorKey): number {
  // Sector GDP share estimates by region and sector
  const baseShares: Record<SectorKey, number> = {
    manufacturing_textiles: 8,
    agriculture_food: 15,
    energy_power: 10,
    mining_minerals: 5,
    digital_infrastructure: 3,
    fintech_finance: 4,
    logistics_trade: 6,
    tourism_hospitality: 5,
  };
  
  // Regional adjustments
  const multiplier = country.region === 'Caribbean' ? 
    (sector === 'tourism_hospitality' ? 2.5 : sector === 'fintech_finance' ? 1.5 : 0.8) :
    (sector === 'mining_minerals' ? 1.8 : sector === 'agriculture_food' ? 1.3 : 1.0);
  
  return baseShares[sector] * multiplier;
}

function estimateFdiInflows(gdpUsd: number, sector: SectorKey): number {
  // FDI typically 2-5% of GDP, distributed across sectors
  const sectorFdiShares: Record<SectorKey, number> = {
    manufacturing_textiles: 0.20,
    agriculture_food: 0.10,
    energy_power: 0.25,
    mining_minerals: 0.20,
    digital_infrastructure: 0.10,
    fintech_finance: 0.05,
    logistics_trade: 0.05,
    tourism_hospitality: 0.05,
  };
  
  const totalFdi = gdpUsd * 0.03; // Assume 3% of GDP as FDI
  return Math.round(totalFdi * sectorFdiShares[sector]);
}

function estimateManufacturingCapacity(
  country: CountryMacroData, 
  sector: SectorKey
): number {
  // Base manufacturing capacity from infrastructure and GDP per capita
  const gdpPerCapita = country.gdpUsd / (country.populationM * 1_000_000);
  
  // GDP per capita benchmark: $5000 = 50, $10000 = 75, $20000 = 100
  const gdpCapacityScore = Math.min(100, Math.max(0, gdpPerCapita / 200));
  
  // Sector-specific adjustments
  const sectorMultipliers: Record<SectorKey, number> = {
    manufacturing_textiles: 1.2,
    agriculture_food: 1.0,
    energy_power: 0.8,
    mining_minerals: 0.9,
    digital_infrastructure: 1.1,
    fintech_finance: 1.3,
    logistics_trade: 0.9,
    tourism_hospitality: 1.0,
  };
  
  const baseScore = (gdpCapacityScore * 0.4) + (country.infrastructureScore * 0.4) + 
    (country.laborQualityIndex * 0.2);
  
  return Math.min(100, Math.round(baseScore * sectorMultipliers[sector]));
}

function generateOpportunityRationale(
  score: number,
  tier: OpportunityTier,
  supply: SupplySignal,
  demand: DemandSignal,
  country: CountryMacroData,
  currentTradeUsd: number
): string {
  const parts: string[] = [];
  
  // Tier classification
  if (tier === 1) {
    parts.push('High-conviction opportunity with strong fundamentals.');
  } else if (tier === 2) {
    parts.push('Strong opportunity with manageable execution risk.');
  } else if (tier === 3) {
    parts.push('Emerging opportunity with growth potential.');
  } else {
    parts.push('Early-stage opportunity requiring development.');
  }
  
  // Supply assessment
  if (supply.supply_score >= 70) {
    parts.push(`Strong supply capacity (${supply.supply_score}/100).`);
  } else if (supply.supply_score >= 50) {
    parts.push(`Developing supply base (${supply.supply_score}/100).`);
  } else {
    parts.push(`Building supply infrastructure (${supply.supply_score}/100).`);
  }
  
  // Demand assessment
  if (demand.demand_score >= 70) {
    parts.push(`Substantial US demand (${demand.demand_score}/100).`);
  } else if (demand.demand_score >= 50) {
    parts.push(`Moderate US demand (${demand.demand_score}/100).`);
  } else {
    parts.push(`Emerging US demand (${demand.demand_score}/100).`);
  }
  
  // Trade corridor status
  if (currentTradeUsd > 100_000_000) {
    parts.push(`Established trade corridor ($${(currentTradeUsd / 1e6).toFixed(0)}M/yr).`);
  } else if (currentTradeUsd > 10_000_000) {
    parts.push(`Nascent trade corridor ($${(currentTradeUsd / 1e6).toFixed(0)}M/yr).`);
  } else {
    parts.push('Greenfield opportunity.');
  }
  
  // Preference advantages
  if (country.agoaEligible) {
    parts.push('AGOA duty-free access available.');
  }
  if (country.cbtpaEligible) {
    parts.push('CBTPA preferential access available.');
  }
  
  return parts.join(' ');
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const SECTOR_KEYS = Object.keys(SECTORS) as SectorKey[];
