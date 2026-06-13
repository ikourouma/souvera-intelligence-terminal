/**
 * Reset report history, storage PDFs, and monthly quota usage (dev / platform admin).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getCurrentQuotaPeriod } from './quota';

const REPORTS_BUCKET = 'reports';

export interface ResetReportsOptions {
  /** Limit to one auth user */
  userId?: string;
  /** Limit usage reset to this calendar month (YYYY-MM). Omit = all periods for scoped user(s). */
  period?: string;
  /** Zero out souvera_report_usage counters */
  resetUsage?: boolean;
  /** Delete souvera_report_requests rows */
  deleteRequests?: boolean;
  /** Remove PDFs from storage.reports bucket */
  deleteStorage?: boolean;
  /** Preview counts only */
  dryRun?: boolean;
}

export interface ResetReportsResult {
  dryRun: boolean;
  userIds: string[];
  period: string | null;
  usageRowsReset: number;
  requestsDeleted: number;
  storageFilesDeleted: number;
  errors: string[];
}

async function resolveUserIdByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers failed: ${error.message}`);

    const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (match) return match.id;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

async function listAllStoragePaths(
  supabase: SupabaseClient,
  prefix?: string
): Promise<string[]> {
  const paths: string[] = [];
  const queue: string[] = prefix ? [prefix] : [''];

  while (queue.length) {
    const folder = queue.pop()!;
    const { data, error } = await supabase.storage.from(REPORTS_BUCKET).list(folder, {
      limit: 500,
    });
    if (error) {
      if (error.message.toLowerCase().includes('not found')) return paths;
      throw new Error(`storage list failed (${folder || 'root'}): ${error.message}`);
    }

    for (const item of data ?? []) {
      const fullPath = folder ? `${folder}/${item.name}` : item.name;
      if (item.id) {
        paths.push(fullPath);
      } else {
        queue.push(fullPath);
      }
    }
  }

  return paths;
}

export async function resetReports(
  supabase: SupabaseClient,
  options: ResetReportsOptions
): Promise<ResetReportsResult> {
  const {
    userId,
    period,
    resetUsage = true,
    deleteRequests = true,
    deleteStorage = true,
    dryRun = false,
  } = options;

  const result: ResetReportsResult = {
    dryRun,
    userIds: [],
    period: period ?? null,
    usageRowsReset: 0,
    requestsDeleted: 0,
    storageFilesDeleted: 0,
    errors: [],
  };

  let scopedUserIds: string[] | undefined;
  if (userId) {
    scopedUserIds = [userId];
  }

  result.userIds = scopedUserIds ?? [];

  if (resetUsage) {
    let query = supabase.from('souvera_report_usage').select('id, user_id, period_yyyy_mm', {
      count: 'exact',
    });

    if (scopedUserIds?.length === 1) {
      query = query.eq('user_id', scopedUserIds[0]);
    }
    if (period) {
      query = query.eq('period_yyyy_mm', period);
    }

    const { data: usageRows, error: usageSelectError } = await query;
    if (usageSelectError) {
      result.errors.push(usageSelectError.message);
    } else {
      result.usageRowsReset = usageRows?.length ?? 0;
      if (!dryRun && usageRows?.length) {
        let deleteQuery = supabase.from('souvera_report_usage').delete();
        if (scopedUserIds?.length === 1) {
          deleteQuery = deleteQuery.eq('user_id', scopedUserIds[0]);
        }
        if (period) {
          deleteQuery = deleteQuery.eq('period_yyyy_mm', period);
        }
        const { error: usageDeleteError } = await deleteQuery;
        if (usageDeleteError) result.errors.push(usageDeleteError.message);
      }
    }

    // Ensure current-month quota is cleared even if no row matched the delete filter
    if (!dryRun && scopedUserIds?.length === 1) {
      const zeroPeriod = period ?? getCurrentQuotaPeriod();
      const { error: zeroError } = await supabase.from('souvera_report_usage').upsert(
        {
          user_id: scopedUserIds[0],
          period_yyyy_mm: zeroPeriod,
          template_count: 0,
          ai_count: 0,
          tokens_in: 0,
          tokens_out: 0,
          cost_usd: 0,
          ai_bonus_limit: 0,
        },
        { onConflict: 'user_id,period_yyyy_mm' }
      );
      if (zeroError) result.errors.push(zeroError.message);
      else if (result.usageRowsReset === 0) result.usageRowsReset = 1;
    }
  }

  if (deleteRequests) {
    let query = supabase.from('souvera_report_requests').select('id, file_path', { count: 'exact' });

    if (scopedUserIds?.length === 1) {
      query = query.eq('user_id', scopedUserIds[0]);
    }

    const { data: requests, error: reqSelectError } = await query;
    if (reqSelectError) {
      result.errors.push(reqSelectError.message);
    } else {
      result.requestsDeleted = requests?.length ?? 0;

      if (!dryRun && requests?.length) {
        let deleteQuery = supabase.from('souvera_report_requests').delete();
        if (scopedUserIds?.length === 1) {
          deleteQuery = deleteQuery.eq('user_id', scopedUserIds[0]);
        }
        const { error: reqDeleteError } = await deleteQuery;
        if (reqDeleteError) result.errors.push(reqDeleteError.message);
      }
    }
  }

  if (deleteStorage) {
    try {
      let paths: string[] = [];

      if (scopedUserIds?.length === 1) {
        paths = await listAllStoragePaths(supabase, scopedUserIds[0]);
      } else if (!scopedUserIds) {
        paths = await listAllStoragePaths(supabase);
      }

      result.storageFilesDeleted = paths.length;

      if (!dryRun && paths.length) {
        const batchSize = 100;
        for (let i = 0; i < paths.length; i += batchSize) {
          const batch = paths.slice(i, i + batchSize);
          const { error: removeError } = await supabase.storage.from(REPORTS_BUCKET).remove(batch);
          if (removeError) result.errors.push(removeError.message);
        }
      }
    } catch (err) {
      result.errors.push(err instanceof Error ? err.message : 'Storage reset failed');
    }
  }

  return result;
}

export async function resetReportsForEmail(
  supabase: SupabaseClient,
  email: string,
  options: Omit<ResetReportsOptions, 'userId'> = {}
): Promise<ResetReportsResult> {
  const userId = await resolveUserIdByEmail(supabase, email);
  if (!userId) {
    return {
      dryRun: options.dryRun ?? false,
      userIds: [],
      period: options.period ?? null,
      usageRowsReset: 0,
      requestsDeleted: 0,
      storageFilesDeleted: 0,
      errors: [`No user found for email: ${email}`],
    };
  }

  return resetReports(supabase, { ...options, userId });
}

export async function getReportAdminStats(supabase: SupabaseClient) {
  const period = getCurrentQuotaPeriod();

  const [{ count: requestCount }, { count: usageCount }, { data: usageRows }] = await Promise.all([
    supabase.from('souvera_report_requests').select('*', { count: 'exact', head: true }),
    supabase
      .from('souvera_report_usage')
      .select('*', { count: 'exact', head: true })
      .eq('period_yyyy_mm', period),
    supabase
      .from('souvera_report_usage')
      .select('user_id, template_count, ai_count, period_yyyy_mm')
      .eq('period_yyyy_mm', period)
      .order('template_count', { ascending: false })
      .limit(20),
  ]);

  return {
    period,
    totalRequests: requestCount ?? 0,
    usageRowsThisMonth: usageCount ?? 0,
    topUsage: usageRows ?? [],
  };
}

export { resolveUserIdByEmail, getCurrentQuotaPeriod };
