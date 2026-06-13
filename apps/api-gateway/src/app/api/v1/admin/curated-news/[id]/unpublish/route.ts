import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, verifyAdminAccess } from '@/lib/admin/verify-admin';
import { writeAuditLog } from '@/lib/admin/audit-log';
import { CURATED_NEWS_SELECT, mapCuratedNewsRow } from '@/lib/curated-news/mapper';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/v1/admin/curated-news/[id]/unpublish

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin) return NextResponse.json({ error: authError }, { status: 403 });

    const { id } = await params;
    const supabase = getServiceClient();

    const { data: article, error } = await supabase
      .from('souvera_curated_news')
      .update({
        status: 'draft',
        published_at: null,
        published_by: null,
      })
      .eq('id', id)
      .select(CURATED_NEWS_SELECT)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: 'Failed to unpublish' }, { status: 500 });
    }

    await writeAuditLog({
      actorId: userId,
      action: 'curated_news.unpublish',
      resourceType: 'curated_news',
      resourceId: id,
    });

    return NextResponse.json({ article: mapCuratedNewsRow(article) });
  } catch (err) {
    console.error('POST unpublish:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
