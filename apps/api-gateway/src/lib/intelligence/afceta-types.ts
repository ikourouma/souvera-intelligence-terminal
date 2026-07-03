/**
 * AfCETA (African-Caribbean Economic and Trade Agreement) — shared types.
 */

export type AfcetaDirection = 'africa_to_caribbean' | 'caribbean_to_africa';

export type AfcetaPillarKey =
  | 'blue_maritime'
  | 'digital_services'
  | 'diaspora_investment'
  | 'agriculture_climate';

export type CaribbeanAssetClass = 'hydrocarbons' | 'agri_food' | 'minerals' | 'services';

export interface AfcetaProductLine {
  name: string;
  valueUsd: number;
  sharePct: number;
  source?: string;
}

export interface AfcetaCorridorSignal {
  id: string;
  origin_iso3: string;
  origin_name: string;
  dest_iso3: string;
  dest_name: string;
  direction: AfcetaDirection;
  category_group: string;
  category_label: string;
  pillar_key: AfcetaPillarKey;
  origin_capacity_usd: number;
  dest_demand_usd: number;
  opportunity_score: number;
  caribbean_asset_class: CaribbeanAssetClass | null;
  top_products: AfcetaProductLine[];
  data_quality_tier: 'A' | 'B' | 'C';
  methodology_note: string | null;
  data_year: number;
  is_spotlight: boolean;
}

export const AFCETA_SHARED_CATEGORIES: Record<string, string> = {
  machinery: 'Machinery & Equipment',
  minerals: 'Minerals & Mining',
  petroleum: 'Petroleum & Energy',
  agriculture: 'Agriculture & Food',
  textiles: 'Textiles & Apparel',
  chemicals: 'Chemicals & Pharmaceuticals',
  vehicles: 'Vehicles & Transport',
  electronics: 'Electronics & ICT',
};

export const AFCETA_METHODOLOGY_NOTE =
  'Corridor Opportunity Index — modeled from regional export capacity and import demand profiles. Not UN Comtrade bilateral customs totals. AfCETA is a proposed framework.';
