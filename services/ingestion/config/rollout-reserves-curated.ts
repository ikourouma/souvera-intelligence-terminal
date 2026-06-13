/**
 * Gross international reserves (USD) — IMF IFS / Article IV where WB has no country series.
 * @see https://www.imf.org/external/datamapper/api/v1/BCA_NGDPD/SEN
 */

export type CuratedReservePoint = { year: number; valueUsd: number };

/** Annual gross international reserves, current USD. */
export const ROLLOUT_CURATED_RESERVES_USD: Record<string, CuratedReservePoint[]> = {
  /** IMF Article IV / BCEAO — Senegal gross official reserves. */
  SEN: [
    { year: 2022, valueUsd: 3_850_000_000 },
    { year: 2023, valueUsd: 4_120_000_000 },
    { year: 2024, valueUsd: 4_350_000_000 },
  ],
  /** IMF Article IV — Côte d'Ivoire gross official reserves. */
  CIV: [
    { year: 2022, valueUsd: 6_200_000_000 },
    { year: 2023, valueUsd: 6_750_000_000 },
    { year: 2024, valueUsd: 7_100_000_000 },
  ],
};
