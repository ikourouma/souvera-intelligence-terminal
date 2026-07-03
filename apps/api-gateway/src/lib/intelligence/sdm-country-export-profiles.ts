/**
 * Country-differentiated SDM export product names — always 3 lines per cell.
 * Flow category labels + totals (USITC/CBTPA) take precedence; region-aware
 * profile names fill gaps (Africa ≠ Caribbean product pools).
 */

export type SdmMarketRegion = 'Africa' | 'Caribbean';

export interface SectorProductTemplate {
  name: string;
  sharePct: number;
}

/** Caribbean-only labels — never assigned to African markets via hash pools. */
export const CARIBBEAN_ONLY_PRODUCT_LABELS = new Set([
  'Beverages & Rum',
  'Spices & Condiments',
  'Cruise & Travel',
  'Resort & Hotel Services',
]);

const TIER_A_OVERRIDES: Record<string, Record<string, SectorProductTemplate[]>> = {
  KEN: {
    agriculture_food: [
      { name: 'Tea & Horticulture', sharePct: 38 },
      { name: 'Coffee & Cocoa', sharePct: 28 },
      { name: 'Fresh Produce', sharePct: 18 },
    ],
    manufacturing_textiles: [
      { name: 'Apparel & Garments', sharePct: 42 },
      { name: 'Cut Flowers', sharePct: 24 },
      { name: 'Leather Goods', sharePct: 16 },
    ],
  },
  SEN: {
    agriculture_food: [
      { name: 'Groundnuts & Oil Seeds', sharePct: 36 },
      { name: 'Fish & Seafood', sharePct: 26 },
      { name: 'Cotton & Textile Inputs', sharePct: 18 },
    ],
  },
  GIN: {
    agriculture_food: [
      { name: 'Coffee & Palm Products', sharePct: 38 },
      { name: 'Processed Foods', sharePct: 28 },
      { name: 'Fish & Seafood', sharePct: 18 },
    ],
  },
  NGA: {
    agriculture_food: [
      { name: 'Cocoa & Cashew', sharePct: 34 },
      { name: 'Sesame & Oil Seeds', sharePct: 26 },
      { name: 'Processed Foods', sharePct: 18 },
    ],
    energy_power: [
      { name: 'Crude Oil & LNG', sharePct: 72 },
      { name: 'Refined Petroleum', sharePct: 15 },
      { name: 'Gas Liquids', sharePct: 6 },
    ],
  },
  GHA: {
    agriculture_food: [
      { name: 'Cocoa & Cashew', sharePct: 40 },
      { name: 'Fresh Produce', sharePct: 24 },
      { name: 'Processed Foods', sharePct: 16 },
    ],
  },
  ZAF: {
    mining_minerals: [
      { name: 'Platinum Group Metals', sharePct: 38 },
      { name: 'Gold & Precious Metals', sharePct: 28 },
      { name: 'Manganese & Chrome', sharePct: 18 },
    ],
    agriculture_food: [
      { name: 'Citrus & Wine', sharePct: 32 },
      { name: 'Maize & Grains', sharePct: 24 },
      { name: 'Processed Foods', sharePct: 18 },
    ],
  },
  COD: {
    mining_minerals: [
      { name: 'Copper & Cobalt', sharePct: 52 },
      { name: 'Gold & Tin', sharePct: 24 },
      { name: 'Industrial Metals', sharePct: 14 },
    ],
  },
  ETH: {
    agriculture_food: [
      { name: 'Coffee & Pulses', sharePct: 40 },
      { name: 'Oil Seeds & Sesame', sharePct: 26 },
      { name: 'Cut Flowers', sharePct: 16 },
    ],
  },
  JAM: {
    agriculture_food: [
      { name: 'Beverages & Rum', sharePct: 34 },
      { name: 'Spices & Condiments', sharePct: 24 },
      { name: 'Fresh Produce', sharePct: 18 },
    ],
    tourism_hospitality: [
      { name: 'Resort & Hotel Services', sharePct: 48 },
      { name: 'Cruise & Travel', sharePct: 22 },
      { name: 'Eco-Tourism', sharePct: 14 },
    ],
  },
  GUY: {
    agriculture_food: [
      { name: 'Rice & Staples', sharePct: 32 },
      { name: 'Sugar & Molasses', sharePct: 28 },
      { name: 'Fresh Produce', sharePct: 16 },
    ],
    mining_minerals: [
      { name: 'Gold & Bauxite', sharePct: 44 },
      { name: 'Alumina', sharePct: 26 },
      { name: 'Industrial Minerals', sharePct: 16 },
    ],
  },
  TTO: {
    energy_power: [
      { name: 'LNG & Natural Gas', sharePct: 58 },
      { name: 'Petrochemicals', sharePct: 22 },
      { name: 'Refined Petroleum', sharePct: 12 },
    ],
  },
};

const AFRICA_AGRICULTURE_POOL = [
  'Fresh Produce',
  'Coffee & Cocoa',
  'Cocoa & Cashew',
  'Groundnuts & Oil Seeds',
  'Fish & Seafood',
  'Cut Flowers',
  'Processed Foods',
  'Cashew & Tree Nuts',
  'Cotton & Textile Inputs',
  'Oil Seeds & Sesame',
  'Tea & Horticulture',
  'Palm Oil & Agro-Processing',
  'Citrus & Tropical Fruits',
];

const CARIBBEAN_AGRICULTURE_POOL = [
  'Fresh Produce',
  'Sugar & Molasses',
  'Rice & Staples',
  'Spices & Condiments',
  'Beverages & Rum',
  'Fish & Seafood',
  'Processed Foods',
];

const AFRICA_TOURISM_POOL = [
  'Hotels & Resorts',
  'Safari & Eco-Tourism',
  'Travel Services',
  'Adventure Tourism',
  'Conference & Events',
];

const CARIBBEAN_TOURISM_POOL = [
  'Hotels & Resorts',
  'Cruise & Travel',
  'Eco-Tourism',
  'Resort & Hotel Services',
  'Travel Services',
];

const SECTOR_PRODUCT_POOLS: Record<string, string[]> = {
  manufacturing_textiles: [
    'Apparel & Garments', 'Industrial Machinery', 'Automotive Parts', 'Textiles & Fabrics',
    'Leather Goods', 'Footwear', 'Medical Equipment', 'Electrical Equipment',
  ],
  energy_power: [
    'Crude Oil & LNG', 'Refined Petroleum', 'Renewable Components', 'Gas Liquids',
    'Petrochemicals', 'Solar Equipment', 'Power Generation Equipment',
  ],
  mining_minerals: [
    'Gold & Precious Metals', 'Critical Minerals', 'Industrial Metals', 'Copper & Cobalt',
    'Bauxite & Alumina', 'Manganese & Chrome', 'Platinum Group Metals', 'Gemstones',
  ],
  digital_infrastructure: [
    'Telecom Equipment', 'Data Center Services', 'Software Services', 'Network Infrastructure',
    'Cloud Services', 'Fintech Platforms', 'Mobile Services',
  ],
  fintech_finance: [
    'Mobile Money Platforms', 'Payment Processing', 'Digital Banking', 'Insurance Tech',
    'Remittance Services', 'RegTech Solutions',
  ],
  logistics_trade: [
    'Port Services', 'Freight & Shipping', 'Warehousing', 'Cold Chain Logistics',
    'Customs & Trade Services', 'Air Cargo',
  ],
};

const FALLBACK_POOL = ['Primary Exports', 'Secondary Products', 'Emerging Exports', 'Value-Added Lines'];

function hash32(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function poolForSector(sectorKey: string, region?: SdmMarketRegion): string[] {
  if (sectorKey === 'agriculture_food') {
    return region === 'Caribbean' ? CARIBBEAN_AGRICULTURE_POOL : AFRICA_AGRICULTURE_POOL;
  }
  if (sectorKey === 'tourism_hospitality') {
    return region === 'Caribbean' ? CARIBBEAN_TOURISM_POOL : AFRICA_TOURISM_POOL;
  }
  return SECTOR_PRODUCT_POOLS[sectorKey] ?? FALLBACK_POOL;
}

function pickThreeFromPool(
  iso3: string,
  sectorKey: string,
  pool: string[],
  region?: SdmMarketRegion,
): SectorProductTemplate[] {
  const h = hash32(`${iso3}:${sectorKey}`);
  const shares = [38, 28, 18];
  const picks: SectorProductTemplate[] = [];
  const used = new Set<number>();
  for (let i = 0; i < 3; i++) {
    let idx = (h + i * 17) % pool.length;
    let guard = 0;
    while (used.has(idx) && guard < pool.length) {
      idx = (idx + 1) % pool.length;
      guard++;
    }
    used.add(idx);
    const name = pool[idx];
    if (region === 'Africa' && CARIBBEAN_ONLY_PRODUCT_LABELS.has(name)) continue;
    picks.push({ name, sharePct: shares[picks.length] ?? 18 });
    if (picks.length >= 3) break;
  }
  while (picks.length < 3) {
    const fallback = FALLBACK_POOL[picks.length] ?? FALLBACK_POOL[0];
    picks.push({ name: fallback, sharePct: [38, 28, 18][picks.length] ?? 18 });
  }
  return picks;
}

/** Three country-specific export product names for a matrix cell (template fallback). */
export function getCountrySectorSupplyTemplates(
  iso3: string,
  sectorKey: string,
  region?: SdmMarketRegion,
): SectorProductTemplate[] {
  const iso = iso3.toUpperCase();
  const override = TIER_A_OVERRIDES[iso]?.[sectorKey];
  if (override?.length >= 3) return override.slice(0, 3);

  const pool = poolForSector(sectorKey, region);
  const picked = pickThreeFromPool(iso, sectorKey, pool, region);

  if (override?.length) {
    return [
      override[0],
      ...picked.filter((p) => p.name !== override[0].name).slice(0, 2),
    ].slice(0, 3);
  }
  return picked;
}

/** True when a product label is inappropriate for the market region. */
export function isRegionInappropriateProduct(name: string, region: SdmMarketRegion): boolean {
  return region === 'Africa' && CARIBBEAN_ONLY_PRODUCT_LABELS.has(name);
}
