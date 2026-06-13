/**
 * Report quota resolution and enforcement (R4).
 * Calendar-month UTC window; limits from souvera_report_quota_policies.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserAccess } from '@souvera/entitlements';

export const AI_REPORT_TYPE = 'AI Custom Report';

export const TEMPLATE_REPORT_TYPES = new Set([
  'Country Profile',
  'Investment Memo',
  'Trade Profile',
  'Sector Deep-Dive',
]);

export interface ReportQuotaPolicy {
  planId: string;
  templateLimit: number | null;
  aiLimit: number | null;
  maxTokensIn: number | null;
  maxTokensOut: number | null;
}

export interface ReportUsageSnapshot {
  period: string;
  templateCount: number;
  aiCount: number;
  aiBonusLimit: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
}

export interface ReportQuotaStatus {
  planId: string;
  period: string;
  resetAt: string;
  unlimited: boolean;
  template: {
    used: number;
    limit: number | null;
    remaining: number | null;
  };
  ai: {
    used: number;
    limit: number | null;
    bonus: number;
    effectiveLimit: number | null;
    remaining: number | null;
  };
  upgradeUrl: string;
  contactUrl: string;
}

export interface QuotaCheckResult {
  allowed: boolean;
  quotaType?: 'template' | 'ai';
  status: ReportQuotaStatus;
  message?: string;
}

/** Fallback policies when DB row is missing (dev / pre-migration). */
export const DEFAULT_QUOTA_POLICIES: Record<string, ReportQuotaPolicy> = {
  explorer: { planId: 'explorer', templateLimit: 0, aiLimit: 0, maxTokensIn: null, maxTokensOut: null },
  professional: { planId: 'professional', templateLimit: 3, aiLimit: 0, maxTokensIn: null, maxTokensOut: null },
  business: { planId: 'business', templateLimit: 5, aiLimit: 2, maxTokensIn: 12000, maxTokensOut: 4000 },
  investor: { planId: 'investor', templateLimit: 5, aiLimit: 2, maxTokensIn: 12000, maxTokensOut: 4000 },
  institutional: { planId: 'institutional', templateLimit: 20, aiLimit: 10, maxTokensIn: 20000, maxTokensOut: 6000 },
  platform_admin: { planId: 'platform_admin', templateLimit: null, aiLimit: null, maxTokensIn: null, maxTokensOut: null },
};

export function isAiReportType(reportType: string): boolean {
  return reportType === AI_REPORT_TYPE;
}

export function isTemplateReportType(reportType: string): boolean {
  return TEMPLATE_REPORT_TYPES.has(reportType);
}

export function getCurrentQuotaPeriod(now = new Date()): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getQuotaPeriodResetAt(now = new Date()): string {
  const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return reset.toISOString();
}

function remaining(used: number, limit: number | null): number | null {
  if (limit === null) return null;
  return Math.max(0, limit - used);
}

function mapPolicyRow(row: {
  plan_id: string;
  template_limit: number | null;
  ai_limit: number | null;
  max_tokens_in: number | null;
  max_tokens_out: number | null;
}): ReportQuotaPolicy {
  return {
    planId: row.plan_id,
    templateLimit: row.template_limit,
    aiLimit: row.ai_limit,
    maxTokensIn: row.max_tokens_in,
    maxTokensOut: row.max_tokens_out,
  };
}

export async function resolveQuotaPolicy(
  supabase: SupabaseClient,
  planId: string
): Promise<ReportQuotaPolicy> {
  const { data } = await supabase
    .from('souvera_report_quota_policies')
    .select('plan_id, template_limit, ai_limit, max_tokens_in, max_tokens_out')
    .eq('plan_id', planId)
    .maybeSingle();

  if (data) return mapPolicyRow(data);
  return DEFAULT_QUOTA_POLICIES[planId] ?? DEFAULT_QUOTA_POLICIES.explorer;
}

export async function getReportUsage(
  supabase: SupabaseClient,
  userId: string,
  period = getCurrentQuotaPeriod()
): Promise<ReportUsageSnapshot> {
  const { data } = await supabase
    .from('souvera_report_usage')
    .select('template_count, ai_count, ai_bonus_limit, tokens_in, tokens_out, cost_usd')
    .eq('user_id', userId)
    .eq('period_yyyy_mm', period)
    .maybeSingle();

  return {
    period,
    templateCount: data?.template_count ?? 0,
    aiCount: data?.ai_count ?? 0,
    aiBonusLimit: data?.ai_bonus_limit ?? 0,
    tokensIn: data?.tokens_in ?? 0,
    tokensOut: data?.tokens_out ?? 0,
    costUsd: Number(data?.cost_usd ?? 0),
  };
}

export function buildQuotaStatus(
  access: UserAccess,
  policy: ReportQuotaPolicy,
  usage: ReportUsageSnapshot,
  isAdmin: boolean
): ReportQuotaStatus {
  const unlimited =
    isAdmin ||
    access.planId === 'platform_admin' ||
    (policy.templateLimit === null && policy.aiLimit === null);

  const aiEffectiveLimit =
    policy.aiLimit === null ? null : policy.aiLimit + usage.aiBonusLimit;

  return {
    planId: access.planId,
    period: usage.period,
    resetAt: getQuotaPeriodResetAt(),
    unlimited,
    template: {
      used: usage.templateCount,
      limit: policy.templateLimit,
      remaining: remaining(usage.templateCount, policy.templateLimit),
    },
    ai: {
      used: usage.aiCount,
      limit: policy.aiLimit,
      bonus: usage.aiBonusLimit,
      effectiveLimit: aiEffectiveLimit,
      remaining: remaining(usage.aiCount, aiEffectiveLimit),
    },
    upgradeUrl: '/access?source=reports-quota#plan-business',
    contactUrl: '/contact?intent=reports-addon&source=reports-quota',
  };
}

export function buildQuotaStatusForPlanId(
  planId: string,
  options?: { usage?: Partial<ReportUsageSnapshot>; isAdmin?: boolean }
): ReportQuotaStatus {
  const policy = DEFAULT_QUOTA_POLICIES[planId] ?? DEFAULT_QUOTA_POLICIES.explorer;
  const usage: ReportUsageSnapshot = {
    period: getCurrentQuotaPeriod(),
    templateCount: options?.usage?.templateCount ?? 0,
    aiCount: options?.usage?.aiCount ?? 0,
    aiBonusLimit: options?.usage?.aiBonusLimit ?? 0,
    tokensIn: options?.usage?.tokensIn ?? 0,
    tokensOut: options?.usage?.tokensOut ?? 0,
    costUsd: options?.usage?.costUsd ?? 0,
  };
  const access: UserAccess = {
    userId: '',
    email: null,
    planRank: 0,
    planId,
    entitlements: [],
    organizationId: null,
    organizationRole: null,
    isAuthenticated: true,
  };
  return buildQuotaStatus(access, policy, usage, options?.isAdmin ?? false);
}

export function formatReportQuotaSummary(quota: ReportQuotaStatus, reportType: string): string | null {
  if (quota.unlimited) return null;
  if (isAiReportType(reportType)) {
    const { remaining, effectiveLimit } = quota.ai;
    if (effectiveLimit === null || remaining === null) return null;
    return `${remaining} of ${effectiveLimit} AI reports remaining this month.`;
  }
  const { remaining, limit } = quota.template;
  if (limit === null || remaining === null) return null;
  return `${remaining} of ${limit} template reports remaining this month.`;
}

export async function getReportQuotaStatus(
  supabase: SupabaseClient,
  access: UserAccess,
  isAdmin: boolean
): Promise<ReportQuotaStatus> {
  const period = getCurrentQuotaPeriod();
  const [policy, usage] = await Promise.all([
    resolveQuotaPolicy(supabase, access.planId),
    getReportUsage(supabase, access.userId, period),
  ]);
  return buildQuotaStatus(access, policy, usage, isAdmin);
}

export async function checkReportQuota(
  supabase: SupabaseClient,
  access: UserAccess,
  reportType: string,
  isAdmin: boolean
): Promise<QuotaCheckResult> {
  const status = await getReportQuotaStatus(supabase, access, isAdmin);

  if (status.unlimited) {
    return { allowed: true, status };
  }

  if (isAiReportType(reportType)) {
    const limit = status.ai.effectiveLimit;
    if (limit !== null && status.ai.used >= limit) {
      return {
        allowed: false,
        quotaType: 'ai',
        status,
        message: `AI report quota reached (${status.ai.used} of ${limit} this month). Resets ${new Date(status.resetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} UTC.`,
      };
    }
    return { allowed: true, status };
  }

  if (isTemplateReportType(reportType)) {
    const limit = status.template.limit;
    if (limit !== null && status.template.used >= limit) {
      return {
        allowed: false,
        quotaType: 'template',
        status,
        message: `Template report quota reached (${status.template.used} of ${limit} this month). Resets ${new Date(status.resetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} UTC.`,
      };
    }
    return { allowed: true, status };
  }

  return {
    allowed: false,
    status,
    message: 'Unknown report type.',
  };
}

export async function recordReportUsage(
  supabase: SupabaseClient,
  userId: string,
  reportType: string
): Promise<void> {
  const period = getCurrentQuotaPeriod();
  const isAi = isAiReportType(reportType);

  const { error } = await supabase.rpc('souvera_increment_report_usage', {
    p_user_id: userId,
    p_period: period,
    p_is_ai: isAi,
    p_tokens_in: 0,
    p_tokens_out: 0,
    p_cost_usd: 0,
  });

  if (error) {
    console.error('[recordReportUsage] RPC failed, falling back to direct upsert:', error.message);
    await fallbackIncrementUsage(supabase, userId, period, isAi);
  }
}

async function fallbackIncrementUsage(
  supabase: SupabaseClient,
  userId: string,
  period: string,
  isAi: boolean
): Promise<void> {
  const existing = await getReportUsage(supabase, userId, period);

  const { error } = await supabase.from('souvera_report_usage').upsert(
    {
      user_id: userId,
      period_yyyy_mm: period,
      template_count: existing.templateCount + (isAi ? 0 : 1),
      ai_count: existing.aiCount + (isAi ? 1 : 0),
      tokens_in: existing.tokensIn,
      tokens_out: existing.tokensOut,
      cost_usd: existing.costUsd,
      ai_bonus_limit: existing.aiBonusLimit,
    },
    { onConflict: 'user_id,period_yyyy_mm' }
  );

  if (error) {
    console.error('[recordReportUsage] Fallback upsert failed:', error.message);
  }
}

export function quotaExceededResponse(check: QuotaCheckResult) {
  const { status, quotaType, message } = check;
  const used = quotaType === 'ai' ? status.ai.used : status.template.used;
  const limit = quotaType === 'ai' ? status.ai.effectiveLimit : status.template.limit;

  return {
    error: message ?? 'Report quota exceeded',
    quotaType,
    used,
    limit,
    resetAt: status.resetAt,
    upgradeUrl: status.upgradeUrl,
    contactUrl: status.contactUrl,
    quota: status,
  };
}
