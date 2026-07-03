/**
 * AfCETA corridor export product tiers — primary, secondary, and emerging lines by category.
 */

import { formatUsdCompact } from '@/lib/intelligence/format-usd';
import type { AfcetaDirection } from '@/lib/intelligence/afceta-types';

export interface AfcetaExportProductTier {
  tier: 'Primary Exports' | 'Secondary Products' | 'Emerging Lines';
  products: string[];
  valueUsd: number;
  sharePct: number;
}

export interface AfcetaProductLineSet {
  primary: string[];
  secondary: string[];
  emerging: string[];
}

const TIER_LABELS: AfcetaExportProductTier['tier'][] = [
  'Primary Exports',
  'Secondary Products',
  'Emerging Lines',
];

const TIER_SHARES = [45, 32, 23] as const;

/** Category-level default product lines when no country override exists. */
export const CATEGORY_EXPORT_LINES: Record<string, AfcetaProductLineSet> = {
  agriculture: {
    primary: ['Cocoa & Coffee', 'Fresh Produce', 'Processed Foods'],
    secondary: ['Oil Seeds & Nuts', 'Fish & Seafood', 'Spices & Condiments'],
    emerging: ['Organic & Specialty Crops', 'Agro-Processing Inputs', 'Beverages & Juices'],
  },
  petroleum: {
    primary: ['Crude Oil & Condensates', 'LNG & Natural Gas', 'Refined Petroleum'],
    secondary: ['Petrochemical Feedstock', 'Lubricants & Bitumen', 'Energy Logistics'],
    emerging: ['Renewable Fuels', 'Carbon Capture Inputs', 'Power Generation Equipment'],
  },
  chemicals: {
    primary: ['Fertilizers & Agrochemicals', 'Industrial Chemicals', 'Pharmaceutical Inputs'],
    secondary: ['Plastics & Polymers', 'Paints & Coatings', 'Cleaning & Hygiene'],
    emerging: ['Green Chemistry', 'Bio-based Polymers', 'Specialty Additives'],
  },
  minerals: {
    primary: ['Gold & Precious Metals', 'Iron Ore & Steel Inputs', 'Bauxite & Alumina'],
    secondary: ['Copper & Base Metals', 'Industrial Minerals', 'Gemstones'],
    emerging: ['Battery Minerals', 'Rare Earth Elements', 'Processed Metal Goods'],
  },
  machinery: {
    primary: ['Mining & Construction Equipment', 'Industrial Machinery', 'Agricultural Equipment'],
    secondary: ['Power Generation Equipment', 'Pumps & Compressors', 'Material Handling'],
    emerging: ['Renewable Energy Systems', 'Automation & Robotics', 'Precision Tools'],
  },
  vehicles: {
    primary: ['Commercial Vehicles', 'Auto Parts & Components', 'Rail & Transport Equipment'],
    secondary: ['Marine Vessel Components', 'Tyres & Rubber Goods', 'Vehicle Assembly Kits'],
    emerging: ['Electric Mobility', 'Aviation Ground Support', 'Fleet Telematics'],
  },
  textiles: {
    primary: ['Cotton & Yarn', 'Apparel & Garments', 'Home Textiles'],
    secondary: ['Technical Textiles', 'Footwear & Leather', 'Dyeing & Finishing Inputs'],
    emerging: ['Sustainable Fabrics', 'Athleisure & Performance Wear', 'Fashion Accessories'],
  },
  electronics: {
    primary: ['ICT Hardware', 'Telecom Equipment', 'Consumer Electronics'],
    secondary: ['Fintech Platforms', 'Tourism & Hospitality Services', 'Professional Services'],
    emerging: ['Digital Infrastructure', 'Creative & Media Services', 'EdTech & HealthTech'],
  },
};

/** Country-specific overrides — flat arrays map to primary tier; structured sets use all tiers. */
export const AFRICA_COUNTRY_EXPORT_LINES: Record<string, Record<string, string[] | AfcetaProductLineSet>> = {
  GHA: {
    agriculture: ['Cocoa & Cashew', 'Processed Foods', 'Fresh Produce'],
    textiles: ['Cocoa Butter Derivatives', 'Cashew Processing', 'Palm-based Inputs'],
  },
  NGA: {
    petroleum: ['Crude Oil & LNG', 'Refined Petroleum', 'Petrochemicals'],
    chemicals: ['Fertilizers', 'Industrial Chemicals', 'Pharmaceutical Inputs'],
    agriculture: ['Cocoa & Cashew', 'Sesame & Oil Seeds', 'Processed Foods'],
  },
  KEN: {
    agriculture: ['Tea & Horticulture', 'Coffee & Cocoa', 'Fresh Produce'],
  },
  ZAF: {
    machinery: ['Mining Equipment', 'Automotive Parts', 'Industrial Machinery'],
    minerals: ['Platinum Group Metals', 'Gold', 'Manganese'],
    vehicles: ['Automotive Components', 'Commercial Vehicles', 'Rail Equipment'],
  },
  SEN: {
    agriculture: ['Groundnuts & Oil Seeds', 'Fish & Seafood', 'Processed Foods'],
  },
  ETH: {
    agriculture: ['Coffee & Pulses', 'Oil Seeds', 'Livestock Products'],
  },
  CIV: {
    agriculture: ['Cocoa & Coffee', 'Cashew & Rubber', 'Processed Foods'],
  },
  TZA: {
    agriculture: ['Coffee & Tea', 'Cashew & Spices', 'Fresh Produce'],
  },
};

export const CARIBBEAN_COUNTRY_EXPORT_LINES: Record<string, Record<string, string[] | AfcetaProductLineSet>> = {
  JAM: {
    agriculture: ['Rum & Beverages', 'Spices & Condiments', 'Fresh Produce'],
    petroleum: ['Refined Petroleum', 'Energy Products', 'Logistics Services'],
  },
  TTO: {
    petroleum: ['LNG & Natural Gas', 'Petrochemicals', 'Fertilizers'],
    chemicals: ['Ammonia & Urea', 'Petrochemicals', 'Industrial Chemicals'],
  },
  GUY: {
    agriculture: ['Rice & Staples', 'Sugar & Molasses', 'Fresh Produce'],
    minerals: ['Gold & Bauxite', 'Alumina', 'Industrial Minerals'],
  },
  KNA: {
    electronics: ['Tourism Services', 'Fintech Platforms', 'Professional Services'],
    agriculture: ['Specialty Agro-Processing', 'Beverages', 'Spices'],
  },
  BRB: {
    electronics: ['Tourism & Hospitality', 'Financial Services', 'Digital Infrastructure'],
    agriculture: ['Rum & Sugar', 'Specialty Foods', 'Beverages'],
  },
};

function isProductLineSet(v: string[] | AfcetaProductLineSet): v is AfcetaProductLineSet {
  return v !== null && typeof v === 'object' && !Array.isArray(v) && 'primary' in v;
}

function resolveLineSet(
  originIso: string,
  categoryGroup: string,
  isCaribbeanOrigin: boolean,
): AfcetaProductLineSet {
  const countryMap = isCaribbeanOrigin ? CARIBBEAN_COUNTRY_EXPORT_LINES : AFRICA_COUNTRY_EXPORT_LINES;
  const countryEntry = countryMap[originIso.toUpperCase()]?.[categoryGroup];
  const categoryDefaults = CATEGORY_EXPORT_LINES[categoryGroup] ?? CATEGORY_EXPORT_LINES.agriculture;

  if (!countryEntry) return categoryDefaults;

  if (isProductLineSet(countryEntry)) {
    return {
      primary: countryEntry.primary.length ? countryEntry.primary : categoryDefaults.primary,
      secondary: countryEntry.secondary.length ? countryEntry.secondary : categoryDefaults.secondary,
      emerging: countryEntry.emerging.length ? countryEntry.emerging : categoryDefaults.emerging,
    };
  }

  return {
    primary: countryEntry,
    secondary: categoryDefaults.secondary,
    emerging: categoryDefaults.emerging,
  };
}

export function buildExportProductTiers(
  originIso: string,
  categoryGroup: string,
  totalUsd: number,
  isCaribbeanOrigin: boolean,
): AfcetaExportProductTier[] {
  const lines = resolveLineSet(originIso, categoryGroup, isCaribbeanOrigin);
  const productSets = [lines.primary, lines.secondary, lines.emerging];

  return TIER_LABELS.map((tier, i) => ({
    tier,
    products: productSets[i],
    valueUsd: Math.round(totalUsd * (TIER_SHARES[i] / 100)),
    sharePct: TIER_SHARES[i],
  }));
}

/** Normalize legacy flat top_products from DB into tier structure. */
export function normalizeExportProductTiers(
  originIso: string,
  categoryGroup: string,
  totalUsd: number,
  isCaribbeanOrigin: boolean,
  stored?: Array<{ name?: string; products?: string[]; tier?: string; valueUsd?: number; sharePct?: number }>,
): AfcetaExportProductTier[] {
  if (stored?.length && stored.some((s) => Array.isArray(s.products) && s.products.length > 0)) {
    return stored.map((s, i) => ({
      tier: (s.tier as AfcetaExportProductTier['tier']) ?? TIER_LABELS[i] ?? 'Primary Exports',
      products: s.products ?? [],
      valueUsd: s.valueUsd ?? 0,
      sharePct: s.sharePct ?? TIER_SHARES[i] ?? 0,
    }));
  }

  const genericLabels = new Set(['Primary Exports', 'Secondary Products', 'Emerging Lines']);
  if (stored?.length && stored.every((s) => genericLabels.has(s.name ?? ''))) {
    return buildExportProductTiers(originIso, categoryGroup, totalUsd, isCaribbeanOrigin);
  }

  if (stored?.length && !stored.some((s) => genericLabels.has(s.name ?? ''))) {
    return stored.map((s, i) => ({
      tier: TIER_LABELS[i] ?? 'Primary Exports',
      products: s.name ? [s.name] : [],
      valueUsd: s.valueUsd ?? 0,
      sharePct: s.sharePct ?? TIER_SHARES[i] ?? 0,
    }));
  }

  return buildExportProductTiers(originIso, categoryGroup, totalUsd, isCaribbeanOrigin);
}

export function leadExportProductName(tiers: AfcetaExportProductTier[]): string | undefined {
  return tiers[0]?.products[0];
}

/** Static card copy — shown on every Top Export Products drawer and flows guide. */
export const AFCETA_EXPORT_PRODUCTS_CARD_EXPLANATION =
  'Lists what the origin country exports in the selected category, in three tiers. Primary Exports (45%) are the strongest lines; Secondary Products (32%) and Emerging Lines (23%) complete the mix. Dollar values split the corridor trade scale — the smaller of export capacity and import demand. Product names come from Souvera\'s AfCETA catalog (country-specific when curated, otherwise category defaults). They support corridor planning; they are not itemized customs shipment records.';

export interface AfcetaExportProductsContextInput {
  origin_name: string;
  dest_name: string;
  category_label: string;
  direction: AfcetaDirection;
  origin_capacity_usd: number;
  dest_demand_usd: number;
}

function cleanCountryName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

/** Row-specific one-liner — only uses fields on the corridor record. */
export function buildAfcetaExportProductsContext(input: AfcetaExportProductsContextInput): string {
  const origin = cleanCountryName(input.origin_name);
  const dest = cleanCountryName(input.dest_name);
  const scale = formatUsdCompact(Math.min(input.origin_capacity_usd, input.dest_demand_usd));
  const capacity = formatUsdCompact(input.origin_capacity_usd);
  const demand = formatUsdCompact(input.dest_demand_usd);
  return `${origin} → ${dest} · ${input.category_label}: tiers below allocate a ${scale} corridor scale (capacity ${capacity}, demand ${demand}).`;
}

/** Full curated text for PNG export and assistant context. */
export function buildAfcetaExportProductsCuratedText(input: AfcetaExportProductsContextInput): string {
  return `${buildAfcetaExportProductsContext(input)}\n\n${AFCETA_EXPORT_PRODUCTS_CARD_EXPLANATION}`;
}
