/**
 * AfCETA coverage figures — sourced from approved market registry and module config.
 */

import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '@/lib/market-coverage';
import { AFCETA_SHARED_CATEGORIES } from '@/lib/intelligence/afceta-types';
import { AFCETA_SPOTLIGHT_PAIRS } from '@/lib/intelligence/afceta-spotlights';
import { AFCETA_PILLARS } from '@/lib/intelligence/afceta-pillar-map';

export const AFCETA_COVERAGE = {
  african_markets: APPROVED_AFRICA_ISO3.length,
  caribbean_markets: APPROVED_CARIBBEAN_ISO3.length,
  total_markets: APPROVED_AFRICA_ISO3.length + APPROVED_CARIBBEAN_ISO3.length,
  shared_categories: Object.keys(AFCETA_SHARED_CATEGORIES).length,
  spotlight_pairs: AFCETA_SPOTLIGHT_PAIRS.length,
  protocol_pillars: Object.keys(AFCETA_PILLARS).length,
  data_vintage: 2023,
} as const;

export const AFCETA_SPOTLIGHT_PREVIEW = AFCETA_SPOTLIGHT_PAIRS.map((pair) => ({
  label: pair.label,
  direction: pair.direction,
  categories: pair.categories,
}));
