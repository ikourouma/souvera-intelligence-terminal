/**
 * Map AGOA/CBTPA category_group values to SDM sector_key(s).
 * Shared by SDM export-product wiring and sector sync scripts.
 */

export const SDM_CATEGORY_TO_SECTORS: Record<string, string[]> = {
  agriculture: ['agriculture_food'],
  processed_foods: ['agriculture_food'],
  forest: ['agriculture_food'],
  leather: ['manufacturing_textiles'],
  textiles_apparel: ['manufacturing_textiles'],
  minerals: ['mining_minerals'],
  petroleum: ['energy_power'],
  machinery: ['manufacturing_textiles', 'logistics_trade'],
  electronics: ['digital_infrastructure', 'fintech_finance'],
  vehicles: ['manufacturing_textiles', 'logistics_trade'],
  chemicals: ['manufacturing_textiles'],
  footwear: ['manufacturing_textiles'],
  handicrafts: ['tourism_hospitality', 'manufacturing_textiles'],
};

/** Human-readable product line labels from flow category_group. */
export const SDM_CATEGORY_LABELS: Record<string, string> = {
  agriculture: 'Agriculture & Food',
  processed_foods: 'Processed Foods',
  forest: 'Forest Products',
  leather: 'Leather & Hides',
  textiles_apparel: 'Textiles & Apparel',
  minerals: 'Minerals & Metals',
  petroleum: 'Petroleum & Energy',
  machinery: 'Machinery & Equipment',
  electronics: 'Electronics & ICT',
  vehicles: 'Vehicles & Transport',
  chemicals: 'Chemicals',
  footwear: 'Footwear',
  handicrafts: 'Handicrafts',
};

export function categoriesForSdmSector(sectorKey: string): string[] {
  return Object.entries(SDM_CATEGORY_TO_SECTORS)
    .filter(([, sectors]) => sectors.includes(sectorKey))
    .map(([cat]) => cat);
}

export function labelForCategory(categoryGroup: string): string {
  return SDM_CATEGORY_LABELS[categoryGroup] ?? categoryGroup.replace(/_/g, ' ');
}
