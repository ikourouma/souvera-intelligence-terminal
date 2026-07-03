-- Fix stale pricing CTA URLs in marketing CMS (Phase 2.5 access funnel)
-- Idempotent: safe to re-run

UPDATE souvera_pricing_display
SET cta_text = 'Create free account', cta_url = '/signup'
WHERE plan_id = 'explorer';

UPDATE souvera_pricing_display
SET cta_text = 'Request Professional Access', cta_url = '/access/request-access?plan=professional'
WHERE plan_id = 'professional';

UPDATE souvera_pricing_display
SET cta_text = 'Contact Sales', cta_url = '/contact?plan=business&intent=upgrade'
WHERE plan_id = 'business';

UPDATE souvera_pricing_display
SET cta_text = 'Contact Sales', cta_url = '/access/institutional'
WHERE plan_id = 'institutional';
