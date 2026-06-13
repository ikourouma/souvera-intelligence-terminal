-- Dev / QA: reset report quota usage and request history
-- Run in Supabase SQL Editor. Storage PDFs: use CLI script or Admin → Reports Reset.

-- Option A: one user, current UTC month
DO $$
DECLARE
  v_user_id UUID;
  v_period TEXT := to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM');
BEGIN
  SELECT id INTO v_user_id FROM auth.users
  WHERE lower(email) = lower('business@afronovation.com') LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  DELETE FROM public.souvera_report_usage
  WHERE user_id = v_user_id AND period_yyyy_mm = v_period;

  INSERT INTO public.souvera_report_usage (
    user_id, period_yyyy_mm, template_count, ai_count, tokens_in, tokens_out, cost_usd, ai_bonus_limit
  ) VALUES (v_user_id, v_period, 0, 0, 0, 0, 0, 0)
  ON CONFLICT (user_id, period_yyyy_mm) DO UPDATE SET
    template_count = 0,
    ai_count = 0,
    tokens_in = 0,
    tokens_out = 0,
    cost_usd = 0,
    updated_at = now();

  DELETE FROM public.souvera_report_requests WHERE user_id = v_user_id;

  RAISE NOTICE 'Reset reports for user % period %', v_user_id, v_period;
END $$;
