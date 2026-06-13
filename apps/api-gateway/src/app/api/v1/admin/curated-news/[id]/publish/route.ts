import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, verifyAdminAccess } from '@/lib/admin/verify-admin';
import { writeAuditLog } from '@/lib/admin/audit-log';
import {
  CURATED_NEWS_SELECT,
  CURATED_NEWS_SOURCE_SELECT,
  mapCuratedNewsRow,
} from '@/lib/curated-news/mapper';
import { validateAllSources } from '@/lib/curated-news/validate-source-url';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/v1/admin/curated-news/[id]/publish

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin) return NextResponse.json({ error: authError }, { status: 403 });

    const { id } = await params;
    const supabase = getServiceClient();

    const { data: sources, error: sourcesError } = await supabase
      .from('souvera_curated_news_sources')
      .select('source_name, source_url')
      .eq('news_id', id);

    if (sourcesError) {
      return NextResponse.json({ error: 'Failed to verify sources' }, { status: 500 });
    }

    if (!sources?.length) {
      return NextResponse.json(
        { error: 'Cannot publish without at least one source reference' },
        { status: 400 }
      );
    }

    const sourceCheck = await validateAllSources(sources);
    if (!sourceCheck.valid) {
      return NextResponse.json(
        {
          error: 'One or more source URLs failed validation. Fix or remove broken links before publishing.',
          details: sourceCheck.errors,
        },
        { status: 400 }
      );
    }

    const { data: article, error: updateError } = await supabase
      .from('souvera_curated_news')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_by: userId ?? null,
        scheduled_publish_at: null,
      })
      .eq('id', id)
      .select(CURATED_NEWS_SELECT)
      .single();

    if (updateError || !article) {
      console.error('Curated news publish error:', updateError);
      return NextResponse.json({ error: 'Failed to publish article' }, { status: 500 });
    }

    const { data: fullSources } = await supabase
      .from('souvera_curated_news_sources')
      .select(CURATED_NEWS_SOURCE_SELECT)
      .eq('news_id', id)
      .order('sort_order', { ascending: true });

    await writeAuditLog({
      actorId: userId,
      action: 'curated_news.publish',
      resourceType: 'curated_news',
      resourceId: id,
      metadata: { slug: article.slug },
    });

    return NextResponse.json({
      article: mapCuratedNewsRow(article, fullSources ?? []),
    });
  } catch (err) {
    console.error('POST /api/v1/admin/curated-news/[id]/publish:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
