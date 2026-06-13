/**
 * News Pulse pilot configuration — NGA + JAM + KEN before 74-country rollout.
 */

export interface NewsPulsePilotCountry {
  iso3: string;
  name: string;
  /** Primary GDELT keyword (single term — avoid nested OR blocks) */
  countryKeyword: string;
  regionTerms: string;
}

/** Africa wave-1 expansion — canonical list from rollout manifest */
export { WAVE1_AFRICA_ISO3 } from '../../apps/api-gateway/src/lib/intelligence/rollout-manifest';

export const NEWS_PULSE_PILOT: NewsPulsePilotCountry[] = [
  {
    iso3: 'NGA',
    name: 'Nigeria',
    countryKeyword: 'Nigeria',
    regionTerms: 'AGOA OR AfCFTA OR ECOWAS',
  },
  {
    iso3: 'JAM',
    name: 'Jamaica',
    countryKeyword: 'Jamaica',
    regionTerms: 'CARICOM OR CBI OR Caribbean',
  },
  {
    iso3: 'KEN',
    name: 'Kenya',
    countryKeyword: 'Kenya',
    regionTerms: 'AGOA OR AfCFTA OR EAC OR East Africa',
  },
  {
    iso3: 'GHA',
    name: 'Ghana',
    countryKeyword: 'Ghana',
    regionTerms: 'AGOA OR AfCFTA OR ECOWAS OR West Africa',
  },
  {
    iso3: 'ZAF',
    name: 'South Africa',
    countryKeyword: 'South Africa',
    regionTerms: 'AGOA OR AfCFTA OR SADC OR Southern Africa',
  },
  {
    iso3: 'ETH',
    name: 'Ethiopia',
    countryKeyword: 'Ethiopia',
    regionTerms: 'AGOA OR AfCFTA OR Horn of Africa OR East Africa',
  },
  {
    iso3: 'SEN',
    name: 'Senegal',
    countryKeyword: 'Senegal',
    regionTerms: 'AGOA OR AfCFTA OR ECOWAS OR West Africa',
  },
  {
    iso3: 'CIV',
    name: "Côte d'Ivoire",
    countryKeyword: "Cote d'Ivoire",
    regionTerms: 'AGOA OR AfCFTA OR ECOWAS OR cocoa',
  },
  {
    iso3: 'TZA',
    name: 'Tanzania',
    countryKeyword: 'Tanzania',
    regionTerms: 'AGOA OR AfCFTA OR EAC OR East Africa',
  },
];

export function getPilotIso3List(): string[] {
  return NEWS_PULSE_PILOT.map((c) => c.iso3);
}
