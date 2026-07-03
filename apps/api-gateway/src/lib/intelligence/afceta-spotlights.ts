/**
 * Tier-A curated spotlight corridors for AfCETA forum.
 */

export interface AfcetaSpotlightPair {
  origin_iso3: string;
  dest_iso3: string;
  direction: 'africa_to_caribbean' | 'caribbean_to_africa';
  label: string;
  narrative: string;
  categories: string[];
  tier: 'A';
}

export const AFCETA_SPOTLIGHT_PAIRS: AfcetaSpotlightPair[] = [
  {
    origin_iso3: 'GHA',
    dest_iso3: 'JAM',
    direction: 'africa_to_caribbean',
    label: 'Accra → Kingston',
    narrative: 'Cocoa, cashew, and processed foods corridor — Ghana export capacity meets Jamaica import demand.',
    categories: ['agriculture', 'textiles'],
    tier: 'A',
  },
  {
    origin_iso3: 'NGA',
    dest_iso3: 'TTO',
    direction: 'africa_to_caribbean',
    label: 'Lagos → Port of Spain',
    narrative: 'Energy and petrochemicals bridge — Nigerian crude/LNG capacity aligned with Trinidad refining demand.',
    categories: ['petroleum', 'chemicals'],
    tier: 'A',
  },
  {
    origin_iso3: 'KEN',
    dest_iso3: 'KNA',
    direction: 'africa_to_caribbean',
    label: 'Nairobi → Basseterre',
    narrative: 'Tea, horticulture, and fresh produce for the forum host market and Eastern Caribbean tourism supply chains.',
    categories: ['agriculture'],
    tier: 'A',
  },
  {
    origin_iso3: 'ZAF',
    dest_iso3: 'BRB',
    direction: 'africa_to_caribbean',
    label: 'Johannesburg → Bridgetown',
    narrative: 'Mining equipment, automotive parts, and industrial machinery for Caribbean infrastructure build-out.',
    categories: ['machinery', 'minerals', 'vehicles'],
    tier: 'A',
  },
  {
    origin_iso3: 'SEN',
    dest_iso3: 'HTI',
    direction: 'africa_to_caribbean',
    label: 'Dakar → Port-au-Prince',
    narrative: 'Groundnuts, fish, and processed foods — West African staples for Haitian food security.',
    categories: ['agriculture'],
    tier: 'A',
  },
  {
    origin_iso3: 'JAM',
    dest_iso3: 'GHA',
    direction: 'caribbean_to_africa',
    label: 'Kingston → Accra',
    narrative: 'Rum, spices, and tourism services — Jamaica\'s agri-food and services export portfolio for West Africa.',
    categories: ['agriculture', 'electronics'],
    tier: 'A',
  },
  {
    origin_iso3: 'TTO',
    dest_iso3: 'NGA',
    direction: 'caribbean_to_africa',
    label: 'Port of Spain → Lagos',
    narrative: 'LNG, ammonia, and petrochemicals — Trinidad energy exports for Nigerian industrial demand.',
    categories: ['petroleum', 'chemicals'],
    tier: 'A',
  },
  {
    origin_iso3: 'GUY',
    dest_iso3: 'ZAF',
    direction: 'caribbean_to_africa',
    label: 'Georgetown → Johannesburg',
    narrative: 'Gold, bauxite, and rice — Guyana minerals and staples for Southern African markets.',
    categories: ['minerals', 'agriculture'],
    tier: 'A',
  },
  {
    origin_iso3: 'KNA',
    dest_iso3: 'KEN',
    direction: 'caribbean_to_africa',
    label: 'Basseterre → Nairobi',
    narrative: 'Forum host services hub — fintech, tourism, and professional services for East Africa.',
    categories: ['electronics'],
    tier: 'A',
  },
  {
    origin_iso3: 'BRB',
    dest_iso3: 'GHA',
    direction: 'caribbean_to_africa',
    label: 'Bridgetown → Accra',
    narrative: 'Financial services, rum, and digital infrastructure for Ghana\'s growing consumer market.',
    categories: ['electronics', 'agriculture'],
    tier: 'A',
  },
  {
    origin_iso3: 'KNA',
    dest_iso3: 'ZAF',
    direction: 'caribbean_to_africa',
    label: 'Basseterre → Johannesburg',
    narrative: 'Tourism and fintech services corridor — St Kitts hub connecting to Southern Africa.',
    categories: ['electronics'],
    tier: 'A',
  },
  {
    origin_iso3: 'GHA',
    dest_iso3: 'KNA',
    direction: 'africa_to_caribbean',
    label: 'Accra → Basseterre',
    narrative: 'Forum spotlight — Ghana cocoa and cashew for the AfriCaribbean Trade & Investment Forum host market.',
    categories: ['agriculture'],
    tier: 'A',
  },
];
