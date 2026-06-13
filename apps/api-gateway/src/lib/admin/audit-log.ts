import { getServiceClient } from '@/lib/admin/verify-admin';

export type AuditAction =
  | 'curated_news.create'
  | 'curated_news.update'
  | 'curated_news.publish'
  | 'curated_news.unpublish'
  | 'curated_news.archive'
  | 'curated_news.delete'
  | 'curated_news.schedule'
  | 'curated_news.ai_draft'
  | 'news_pulse.publish'
  | 'news_pulse.archive'
  | 'reports.reset';

export async function writeAuditLog(options: {
  actorId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getServiceClient();
    await supabase.from('souvera_platform_audit_log').insert({
      actor_id: options.actorId ?? null,
      action: options.action,
      resource_type: options.resourceType,
      resource_id: options.resourceId,
      metadata: options.metadata ?? {},
    });
  } catch (err) {
    console.error('Audit log write failed:', err);
  }
}
