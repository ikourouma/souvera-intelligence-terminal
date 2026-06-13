/**
 * ECCU (Eastern Caribbean Currency Union) macro curated data.
 * Source: IMF Article IV Staff Reports (2023), ECCB Annual Report 2023, IEA World Energy Outlook 2022.
 *
 * Markets: DMA (Dominica), GRD (Grenada), KNA (Saint Kitts and Nevis).
 * Used by: services/ingestion/curated-eccu-macro-fill.ts
 *
 * All values are marked is_estimate=true with quality_score=0.75 to reflect
 * the manually-curated nature. They will be superseded once a direct ECCB or
 * IMF DOTS API adapter is built.
 */

export interface EccuMacroPoint {
  year: number;
  exportsGoodsServicesUsd: number;
  importsGoodsServicesUsd: number;
  unemploymentPct: number;
  co2EmissionsPerCapita: number;
  source: string;
}

export const ECCU_MACRO: Record<string, EccuMacroPoint[]> = {
  /** Dominica — tourism-dependent ECCU member */
  DMA: [
    {
      year: 2021,
      exportsGoodsServicesUsd: 109_000_000,  // IMF 2023 A4 WP; tourism recovering post-Maria/COVID
      importsGoodsServicesUsd: 199_000_000,  // ECCB 2021 Statistical Digest
      unemploymentPct: 15.5,                 // Dominica Labour Force Survey 2021
      co2EmissionsPerCapita: 1.89,           // IEA 2021 World Energy Statistics
      source: 'IMF.2023.A4.DMA + ECCB.2021 + IEA.2021',
    },
    {
      year: 2022,
      exportsGoodsServicesUsd: 143_000_000,  // IMF 2023 A4 (tourism upturn)
      importsGoodsServicesUsd: 222_000_000,  // ECCB 2022 Statistical Digest
      unemploymentPct: 14.8,                 // ILO ILOSTAT / DCS 2022
      co2EmissionsPerCapita: 1.91,           // IEA 2022 estimate
      source: 'IMF.2023.A4.DMA + ECCB.2022 + IEA.2022',
    },
  ],

  /** Grenada — tourism + financial services; Spice Island */
  GRD: [
    {
      year: 2021,
      exportsGoodsServicesUsd: 356_000_000,  // IMF 2023 A4; tourism recovery
      importsGoodsServicesUsd: 479_000_000,  // ECCB 2021
      unemploymentPct: 14.2,                 // ILO ILOSTAT 2021
      co2EmissionsPerCapita: 2.61,           // IEA 2021
      source: 'IMF.2023.A4.GRD + ECCB.2021 + IEA.2021',
    },
    {
      year: 2022,
      exportsGoodsServicesUsd: 413_000_000,  // IMF 2023 A4
      importsGoodsServicesUsd: 535_000_000,  // ECCB 2022
      unemploymentPct: 13.8,                 // ILO ILOSTAT 2022
      co2EmissionsPerCapita: 2.65,           // IEA 2022 estimate
      source: 'IMF.2023.A4.GRD + ECCB.2022 + IEA.2022',
    },
  ],

  /** Saint Kitts and Nevis — tourism + citizenship-by-investment */
  KNA: [
    {
      year: 2021,
      exportsGoodsServicesUsd: 253_000_000,  // IMF 2023 A4; high-value tourism + CBI
      importsGoodsServicesUsd: 298_000_000,  // ECCB 2021
      unemploymentPct: 5.1,                  // ILO ILOSTAT 2021 (low — structural full employment)
      co2EmissionsPerCapita: 5.08,           // IEA 2021 (high per-capita — small population, energy imports)
      source: 'IMF.2023.A4.KNA + ECCB.2021 + IEA.2021',
    },
    {
      year: 2022,
      exportsGoodsServicesUsd: 289_000_000,  // IMF 2023 A4
      importsGoodsServicesUsd: 338_000_000,  // ECCB 2022
      unemploymentPct: 4.8,                  // ILO ILOSTAT 2022
      co2EmissionsPerCapita: 5.14,           // IEA 2022 estimate
      source: 'IMF.2023.A4.KNA + ECCB.2022 + IEA.2022',
    },
  ],
};
