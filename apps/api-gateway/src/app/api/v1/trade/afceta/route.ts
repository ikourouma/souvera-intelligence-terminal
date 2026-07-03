/**
 * GET /api/v1/trade/afceta
 * AfCETA framework content — treaty text, pillars, Caribbean portfolio, forum metadata.
 */

import { NextResponse } from 'next/server';
import {
  AFCETA_FORUM,
  AFCETA_PREAMBLE,
  AFCETA_ARTICLES,
  AFCETA_OBJECTIVES,
} from '@/lib/intelligence/afceta-framework-content';
import { AFCETA_PILLARS } from '@/lib/intelligence/afceta-pillar-map';
import {
  CARIBBEAN_TRADABLE_PORTFOLIO,
  CARIBBEAN_PORTFOLIO_STATEMENT,
} from '@/lib/intelligence/afceta-caribbean-tradable-assets';
import { AFCETA_METHODOLOGY_NOTE } from '@/lib/intelligence/afceta-types';
import { AFCETA_EXPORT_PRODUCTS_CARD_EXPLANATION } from '@/lib/intelligence/afceta-export-product-tiers';
import {
  AFCETA_COVERAGE,
  AFCETA_SPOTLIGHT_PREVIEW,
} from '@/lib/intelligence/afceta-coverage-stats';

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json({
    forum: AFCETA_FORUM,
    preamble: AFCETA_PREAMBLE,
    articles: AFCETA_ARTICLES,
    objectives: AFCETA_OBJECTIVES,
    pillars: AFCETA_PILLARS,
    caribbean_portfolio: {
      statement: CARIBBEAN_PORTFOLIO_STATEMENT,
      assets: CARIBBEAN_TRADABLE_PORTFOLIO,
    },
    coverage: AFCETA_COVERAGE,
    spotlight_preview: AFCETA_SPOTLIGHT_PREVIEW,
    methodology: AFCETA_METHODOLOGY_NOTE,
    export_products_guide: AFCETA_EXPORT_PRODUCTS_CARD_EXPLANATION,
    attribution: {
      sources: ['AfCFTA Trade Flows', 'CBTPA Flows', 'Import Demand Signals'],
      note: 'Corridor metrics reflect regional export capacity matched to import demand profiles across shared trade categories.',
    },
  });
}
