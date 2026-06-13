import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, verifyAdminAccess } from '@/lib/admin/verify-admin';
import { writeAuditLog } from '@/lib/admin/audit-log';
import {
  CURATED_NEWS_SELECT,
  CURATED_NEWS_SOURCE_SELECT,
  mapCuratedNewsRow,
} from '@/lib/curated-news/mapper';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET    /api/v1/admin/curated-news/[id]
// PATCH  /api/v1/admin/curated-news/[id]
// DELETE /api/v1/admin/curated-news/[id]

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { isAdmin, error: authError } = await verifyAdminAccess();
    if (!isAdmin) return NextResponse.json({ error: authError }, { status: 403 });

    const { id } = await params;
    const supabase = getServiceClient();

    const { data: article, error } = await supabase
      .from('souvera_curated_news')
      .select(CURATED_NEWS_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const { data: sources } = await supabase
      .from('souvera_curated_news_sources')
      .select(CURATED_NEWS_SOURCE_SELECT)
      .eq('news_id', id)
      .order('sort_order', { ascending: true });

    return NextResponse.json({
      article: mapCuratedNewsRow(article, sources ?? []),
    });
  } catch (err) {
    console.error('GET /api/v1/admin/curated-news/[id]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin) return NextResponse.json({ error: authError }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const supabase = getServiceClient();

    const updates: Record<string, unknown> = {};
    if (body.title != null) updates.title = String(body.title).trim();
    if (body.summary != null) updates.summary = String(body.summary).trim().slice(0, 280);
    if (body.bodyMd != null) updates.body_md = body.bodyMd;
    if (body.status != null) updates.status = body.status;
    if (body.region != null) updates.region = body.region;
    if (body.countryIso3 != null) {
      updates.country_iso3 = (body.countryIso3 as string[]).map((c) => c.toUpperCase());
    }
    if (body.themes != null) updates.themes = body.themes;
    if (body.heroImageUrl !== undefined) updates.hero_image_url = body.heroImageUrl;
    if (body.editorNotes !== undefined) updates.editor_notes = body.editorNotes;
    if (body.liveWireFeatured != null) updates.live_wire_featured = Boolean(body.liveWireFeatured);
    if (body.liveWireSort != null) updates.live_wire_sort = Number(body.liveWireSort);
    if (body.scheduledPublishAt !== undefined) {
      updates.scheduled_publish_at = body.scheduledPublishAt;
      if (body.scheduledPublishAt) {
        updates.status = 'in_review';
      }
    }

    if (Object.keys(updates).length === 0 && !body.sources) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('souvera_curated_news')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        console.error('Curated news update error:', updateError);
        return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
      }
    }

    if (Array.isArray(body.sources)) {
      await supabase.from('souvera_curated_news_sources').delete().eq('news_id', id);

      if (body.sources.length > 0) {
        const sourceRows = body.sources.map(
          (
            s: {
              sourceName: string;
              sourceUrl: string;
              snippet?: string;
              confidence?: number;
            },
            i: number
          ) => ({
            news_id: id,
            source_name: s.sourceName.trim(),
            source_url: s.sourceUrl.trim(),
            snippet: s.snippet?.trim() ?? null,
            confidence: s.confidence ?? 0.8,
            sort_order: i,
          })
        );

        const { error: sourcesError } = await supabase
          .from('souvera_curated_news_sources')
          .insert(sourceRows);

        if (sourcesError) {
          console.error('Curated news sources replace error:', sourcesError);
          return NextResponse.json({ error: 'Failed to update sources' }, { status: 500 });
        }
      }
    }

    await writeAuditLog({
      actorId: userId,
      action: body.scheduledPublishAt ? 'curated_news.schedule' : 'curated_news.update',
      resourceType: 'curated_news',
      resourceId: id,
      metadata: { fields: Object.keys(updates) },
    });

    const { data: article } = await supabase
      .from('souvera_curated_news')
      .select(CURATED_NEWS_SELECT)
      .eq('id', id)
      .single();

    const { data: sources } = await supabase
      .from('souvera_curated_news_sources')
      .select(CURATED_NEWS_SOURCE_SELECT)
      .eq('news_id', id)
      .order('sort_order', { ascending: true });

    return NextResponse.json({
      article: mapCuratedNewsRow(article!, sources ?? []),
    });
  } catch (err) {
    console.error('PATCH /api/v1/admin/curated-news/[id]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin) return NextResponse.json({ error: authError }, { status: 403 });

    const { id } = await params;
    const supabase = getServiceClient();

    const { data: existing } = await supabase
      .from('souvera_curated_news')
      .select('slug, title, status')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const { error } = await supabase.from('souvera_curated_news').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }

    await writeAuditLog({
      actorId: userId,
      action: 'curated_news.delete',
      resourceType: 'curated_news',
      resourceId: id,
      metadata: { slug: existing.slug, title: existing.title, status: existing.status },
    });

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/v1/admin/curated-news/[id]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
