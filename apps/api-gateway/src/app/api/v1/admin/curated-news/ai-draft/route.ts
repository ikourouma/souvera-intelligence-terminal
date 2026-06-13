import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { generateCuratedNewsDraft } from '@/lib/ai/curated-news-draft';
import { writeAuditLog } from '@/lib/admin/audit-log';

// POST /api/v1/admin/curated-news/ai-draft

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin) return NextResponse.json({ error: authError }, { status: 403 });

    const body = await request.json();
    const { sources, articleId } = body as {
      sources: Array<{ sourceName: string; sourceUrl: string; snippet?: string }>;
      articleId?: string;
    };

    if (!sources?.length) {
      return NextResponse.json({ error: 'sources array required' }, { status: 400 });
    }

    const draft = await generateCuratedNewsDraft(sources);

    await writeAuditLog({
      actorId: userId,
      action: 'curated_news.ai_draft',
      resourceType: 'curated_news',
      resourceId: articleId ?? 'new',
      metadata: { sourceCount: sources.length, aiGenerated: draft.aiGenerated },
    });

    return NextResponse.json({ draft });
  } catch (err) {
    console.error('POST /api/v1/admin/curated-news/ai-draft:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
