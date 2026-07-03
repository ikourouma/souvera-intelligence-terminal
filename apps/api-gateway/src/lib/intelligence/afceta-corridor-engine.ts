/**
 * AfCETA Corridor Opportunity Index — scoring helpers.
 */

import { AFCETA_SHARED_CATEGORIES } from '@/lib/intelligence/afceta-types';
import { CATEGORY_TO_DEMAND_GROUPS, pillarForCategory } from '@/lib/intelligence/afceta-pillar-map';
import {
  buildSpotlightProducts,
  caribbeanAssetForCategory,
} from '@/lib/intelligence/afceta-caribbean-tradable-assets';
import { countryDisplayName } from '@/lib/intelligence/country-names';
import type { AfcetaDirection } from '@/lib/intelligence/afceta-types';

export interface CorridorSeedInput {
  origin_iso3: string;
  dest_iso3: string;
  direction: AfcetaDirection;
  category_group: string;
  origin_capacity_usd: number;
  dest_demand_usd: number;
  data_quality_tier: 'A' | 'B' | 'C';
  is_spotlight: boolean;
  methodology_note?: string;
  data_year?: number;
}

export function computeOpportunityScore(capacityUsd: number, demandUsd: number): number {
  if (capacityUsd <= 0 || demandUsd <= 0) return 0;
  const min = Math.min(capacityUsd, demandUsd);
  const max = Math.max(capacityUsd, demandUsd);
  const fit = (2 * min) / (capacityUsd + demandUsd);
  const scale = Math.min(100, Math.log10(capacityUsd + demandUsd) * 8);
  return Math.round(fit * scale * 10) / 10;
}

export function buildCorridorRow(input: CorridorSeedInput) {
  const {
    origin_iso3,
    dest_iso3,
    direction,
    category_group,
    origin_capacity_usd,
    dest_demand_usd,
    data_quality_tier,
    is_spotlight,
    methodology_note,
    data_year = 2023,
  } = input;

  const score = computeOpportunityScore(origin_capacity_usd, dest_demand_usd);
  const isCaribbeanOrigin = direction === 'caribbean_to_africa';
  const totalUsd = Math.min(origin_capacity_usd, dest_demand_usd);

  return {
    origin_iso3: origin_iso3.toUpperCase(),
    origin_name: countryDisplayName(origin_iso3),
    dest_iso3: dest_iso3.toUpperCase(),
    dest_name: countryDisplayName(dest_iso3),
    direction,
    category_group,
    category_label: AFCETA_SHARED_CATEGORIES[category_group] ?? category_group,
    pillar_key: pillarForCategory(category_group),
    origin_capacity_usd: Math.round(origin_capacity_usd),
    dest_demand_usd: Math.round(dest_demand_usd),
    opportunity_score: score,
    caribbean_asset_class: caribbeanAssetForCategory(category_group, isCaribbeanOrigin),
    top_products: buildSpotlightProducts(origin_iso3, category_group, totalUsd, isCaribbeanOrigin),
    data_quality_tier,
    methodology_note:
      methodology_note ??
      'Corridor Opportunity Index — derived from regional export capacity and import demand profiles.',
    data_year,
    source_notes: 'AfCFTA exports, CBTPA flows, import demand signals — Souvera derived index',
    is_spotlight,
  };
}

/** Sum import demand USD for a country across mapped demand groups. */
export function demandForCategory(
  demandByIsoGroup: Map<string, number>,
  iso3: string,
  categoryGroup: string,
): number {
  const groups = CATEGORY_TO_DEMAND_GROUPS[categoryGroup] ?? [categoryGroup];
  let total = 0;
  for (const g of groups) {
    total += demandByIsoGroup.get(`${iso3}:${g}`) ?? 0;
  }
  return total;
}

export function capacityKey(iso3: string, categoryGroup: string): string {
  return `${iso3.toUpperCase()}:${categoryGroup}`;
}
