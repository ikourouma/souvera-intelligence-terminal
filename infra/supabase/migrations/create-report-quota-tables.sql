-- Report quota policies and per-user monthly usage (R4)
-- Run after create-report-requests-table.sql

CREATE TABLE IF NOT EXISTS public.souvera_report_quota_policies (
  plan_id TEXT PRIMARY KEY,
  template_limit INT,
  ai_limit INT,
  max_tokens_in INT,
  max_tokens_out INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.souvera_report_quota_policies IS
  'Monthly report limits per subscription plan. NULL limit = unlimited.';

COMMENT ON COLUMN public.souvera_report_quota_policies.template_limit IS
  'Max template PDF reports per calendar month (Country Profile, Memo, Trade, Sector).';

COMMENT ON COLUMN public.souvera_report_quota_policies.ai_limit IS
  'Max AI Custom Reports per calendar month.';

INSERT INTO public.souvera_report_quota_policies (plan_id, template_limit, ai_limit, max_tokens_in, max_tokens_out)
VALUES
  ('explorer', 0, 0, NULL, NULL),
  ('professional', 3, 0, NULL, NULL),
  ('business', 5, 2, 12000, 4000),
  ('investor', 5, 2, 12000, 4000),
  ('institutional', 20, 10, 20000, 6000),
  ('platform_admin', NULL, NULL, NULL, NULL)
ON CONFLICT (plan_id) DO UPDATE SET
  template_limit = EXCLUDED.template_limit,
  ai_limit = EXCLUDED.ai_limit,
  max_tokens_in = EXCLUDED.max_tokens_in,
  max_tokens_out = EXCLUDED.max_tokens_out,
  updated_at = now();

ALTER TABLE public.souvera_report_quota_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read quota policies"
  ON public.souvera_report_quota_policies FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS public.souvera_report_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_yyyy_mm TEXT NOT NULL,
  template_count INT NOT NULL DEFAULT 0 CHECK (template_count >= 0),
  ai_count INT NOT NULL DEFAULT 0 CHECK (ai_count >= 0),
  tokens_in INT NOT NULL DEFAULT 0 CHECK (tokens_in >= 0),
  tokens_out INT NOT NULL DEFAULT 0 CHECK (tokens_out >= 0),
  cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0 CHECK (cost_usd >= 0),
  ai_bonus_limit INT NOT NULL DEFAULT 0 CHECK (ai_bonus_limit >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_yyyy_mm)
);

CREATE INDEX IF NOT EXISTS idx_report_usage_user_period
  ON public.souvera_report_usage (user_id, period_yyyy_mm);

DROP TRIGGER IF EXISTS trg_souvera_report_usage_updated_at ON public.souvera_report_usage;
CREATE TRIGGER trg_souvera_report_usage_updated_at
  BEFORE UPDATE ON public.souvera_report_usage
  FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

ALTER TABLE public.souvera_report_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own report usage"
  ON public.souvera_report_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Quota policies are read by service role only (no public SELECT policy)

-- Atomic usage increment (service role)
CREATE OR REPLACE FUNCTION public.souvera_increment_report_usage(
  p_user_id UUID,
  p_period TEXT,
  p_is_ai BOOLEAN,
  p_tokens_in INT DEFAULT 0,
  p_tokens_out INT DEFAULT 0,
  p_cost_usd NUMERIC DEFAULT 0
)
RETURNS public.souvera_report_usage
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.souvera_report_usage;
BEGIN
  INSERT INTO public.souvera_report_usage (user_id, period_yyyy_mm, template_count, ai_count, tokens_in, tokens_out, cost_usd)
  VALUES (
    p_user_id,
    p_period,
    CASE WHEN p_is_ai THEN 0 ELSE 1 END,
    CASE WHEN p_is_ai THEN 1 ELSE 0 END,
    COALESCE(p_tokens_in, 0),
    COALESCE(p_tokens_out, 0),
    COALESCE(p_cost_usd, 0)
  )
  ON CONFLICT (user_id, period_yyyy_mm) DO UPDATE SET
    template_count = public.souvera_report_usage.template_count + CASE WHEN p_is_ai THEN 0 ELSE 1 END,
    ai_count = public.souvera_report_usage.ai_count + CASE WHEN p_is_ai THEN 1 ELSE 0 END,
    tokens_in = public.souvera_report_usage.tokens_in + COALESCE(p_tokens_in, 0),
    tokens_out = public.souvera_report_usage.tokens_out + COALESCE(p_tokens_out, 0),
    cost_usd = public.souvera_report_usage.cost_usd + COALESCE(p_cost_usd, 0),
    updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION public.souvera_increment_report_usage IS
  'Increment monthly report usage counters atomically (called from API service role).';
