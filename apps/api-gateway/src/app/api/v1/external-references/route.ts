import { NextRequest, NextResponse } from 'next/server';
import {
  fetchExternalReferencesForEntity,
  fetchUstrAfricaPageMap,
  type ExternalRefType,
} from '@/lib/external-references';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/external-references?region=africa
 * GET /api/v1/external-references?entity_key=NGA&ref_type=USTR_COUNTRY_PAGE
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region');
  const entityKey = searchParams.get('entity_key')?.toUpperCase();
  const refType = searchParams.get('ref_type') as ExternalRefType | null;

  try {
    if (region === 'africa' && !entityKey) {
      const map = await fetchUstrAfricaPageMap();
      return NextResponse.json({ region: 'africa', ustrCountryPages: map });
    }

    if (!entityKey) {
      return NextResponse.json({ error: 'entity_key or region=africa required' }, { status: 400 });
    }

    const refs = await fetchExternalReferencesForEntity(
      entityKey,
      refType ? [refType] : undefined
    );
    return NextResponse.json({ entityKey, references: refs });
  } catch (error) {
    console.error('[/api/v1/external-references]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
