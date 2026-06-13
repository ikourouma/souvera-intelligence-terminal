-- Curated news admin features: schedule publish + platform audit log

ALTER TABLE public.souvera_curated_news
  ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;

ALTER TABLE public.souvera_curated_news
  ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_curated_news_scheduled
  ON public.souvera_curated_news (scheduled_publish_at)
  WHERE status IN ('draft', 'in_review') AND scheduled_publish_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.souvera_platform_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_audit_resource
  ON public.souvera_platform_audit_log (resource_type, resource_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_audit_actor
  ON public.souvera_platform_audit_log (actor_id, created_at DESC);

ALTER TABLE public.souvera_platform_audit_log ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.souvera_platform_audit_log IS
  'Immutable audit trail for admin actions (curated news, news pulse, etc.)';
