export type HighlightPlan = 'explorer' | 'professional' | 'business' | 'institutional';

/**
 * Plan comparison page with optional tier highlight (scroll + ring).
 * @example planCompareHref('business', 'reports-tab') → /access?source=reports-tab#plan-business
 */
export function planCompareHref(plan: HighlightPlan, source?: string): string {
  const params = new URLSearchParams();
  if (source) params.set('source', source);
  const qs = params.toString();
  return `/access${qs ? `?${qs}` : ''}#plan-${plan}`;
}

/** Primary upgrade CTA — Business uses Contact Sales; Professional uses request form. */
export function upgradeWorkflowHref(plan: 'professional' | 'business', source?: string): string {
  const params = new URLSearchParams();
  params.set('plan', plan);
  params.set('intent', 'upgrade');
  if (source) params.set('source', source);

  if (plan === 'business') {
    return `/contact?${params.toString()}`;
  }
  return `/access/request-access?${params.toString()}`;
}
