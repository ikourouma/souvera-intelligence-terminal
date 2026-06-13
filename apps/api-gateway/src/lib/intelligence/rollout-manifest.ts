/**
 * Country terminal rollout manifest — pilot, Wave 1 Africa, Wave 2 Caribbean.
 */

export const FULL_TERMINAL_PILOT_ISO3 = ['NGA', 'JAM', 'KEN'] as const;

export const WAVE1_AFRICA_ISO3 = ['GHA', 'ZAF', 'ETH', 'SEN', 'CIV', 'TZA'] as const;

export const WAVE2_CARIBBEAN_ISO3 = ['TTO', 'BRB', 'BHS'] as const;

export const ALL_ROLLOUT_ISO3 = [
  ...FULL_TERMINAL_PILOT_ISO3,
  ...WAVE1_AFRICA_ISO3,
  ...WAVE2_CARIBBEAN_ISO3,
] as const;

export type FullTerminalPilotIso3 = (typeof FULL_TERMINAL_PILOT_ISO3)[number];
export type Wave1AfricaIso3 = (typeof WAVE1_AFRICA_ISO3)[number];
export type Wave2CaribbeanIso3 = (typeof WAVE2_CARIBBEAN_ISO3)[number];
export type RolloutIso3 = (typeof ALL_ROLLOUT_ISO3)[number];

export function isRolloutCountry(iso3: string): iso3 is RolloutIso3 {
  return (ALL_ROLLOUT_ISO3 as readonly string[]).includes(iso3.toUpperCase());
}

export function isWave1Africa(iso3: string): iso3 is Wave1AfricaIso3 {
  return (WAVE1_AFRICA_ISO3 as readonly string[]).includes(iso3.toUpperCase());
}
