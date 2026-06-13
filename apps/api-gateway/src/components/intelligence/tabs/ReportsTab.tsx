'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText, Sparkles, Download, Clock, Zap, Building2, Ship, TrendingUp, Shield, Mail,
  ChevronRight, Loader2, CheckCircle2, AlertCircle, ArrowRight, X,
} from 'lucide-react';
import { EntitlementKey } from '@/lib/intelligence-entitlements';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { planCompareHref, upgradeWorkflowHref } from '@/lib/upgrade-paths';
import { buildQuotaStatusForPlanId, formatReportQuotaSummary } from '@/lib/reports/quota';
import { ReportPreviewModal } from './ReportPreviewModal';
import { getDeepDiveSectorOptions } from '@/lib/sectors/sector-taxonomy';
import { TEMPLATE_ID_BY_REPORT_TYPE } from '@/lib/reports/template-ids';
import { formatPreflightErrorsMessage } from '@/lib/reports/reports-v2-api';
import {
  isReportGenerationPausedForUi,
  REPORTS_PAUSED_BANNER_BODY,
  REPORTS_PAUSED_BANNER_TITLE,
  REPORTS_PAUSED_USER_MESSAGE,
} from '@/lib/reports/report-generation-availability';

function inferPlanIdFromEntitlements(entitlements: EntitlementKey[]): string {
  if (entitlements.includes('admin_access')) return 'platform_admin';
  if (entitlements.includes('investment_thesis')) return 'business';
  if (entitlements.includes('full_macro')) return 'professional';
  return 'explorer';
}

interface ReportHistoryItem {
  id: string;
  reportType: string;
  templateId?: string | null;
  status: string;
  storagePath?: string | null;
  downloadUrl?: string | null;
  downloadFilename?: string | null;
  downloadProxyUrl?: string | null;
  createdAt: string;
  errorMessage?: string | null;
}

interface ReportQuotaStatus {
  planId: string;
  period: string;
  resetAt: string;
  unlimited: boolean;
  template: { used: number; limit: number | null; remaining: number | null };
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

interface ReportsTabProps {
  data: any;
  userEntitlements: EntitlementKey[];
  planId?: string;
}

export default function ReportsTab({ data, userEntitlements, planId }: ReportsTabProps) {
  /** Professional+: Country Profile only */
  const hasCountryProfileAccess =
    userEntitlements.includes('full_macro') || userEntitlements.includes('admin_access');
  /** Business+: Investment Memo, Trade Profile, Sector Deep-Dive, AI Custom */
  const hasBusinessReports =
    userEntitlements.includes('investment_thesis') || userEntitlements.includes('admin_access');
  const reportsPaused = isReportGenerationPausedForUi();

  const [showPausedModal, setShowPausedModal] = useState(false);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [sectorDeepDiveKey, setSectorDeepDiveKey] = useState('technology');
  const [aiQuery, setAiQuery] = useState('');
  const [reportStatus, setReportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [quota, setQuota] = useState<ReportQuotaStatus | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [previewReportType, setPreviewReportType] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'pptx'>('pdf');

  const effectivePlanId = planId ?? inferPlanIdFromEntitlements(userEntitlements);
  const isAdmin = userEntitlements.includes('admin_access');

  const iso3 = data.country?.iso3 as string | undefined;
  const countryRegion = data.country?.region as string | undefined;
  const deepDiveSectorOptions = iso3
    ? getDeepDiveSectorOptions(iso3, countryRegion)
    : [];
  const countryName = (data.country?.name as string | undefined) ?? iso3 ?? 'Country';

  useEffect(() => {
    if (!deepDiveSectorOptions.length) return;
    if (!deepDiveSectorOptions.some((o) => o.sectorKey === sectorDeepDiveKey)) {
      setSectorDeepDiveKey(deepDiveSectorOptions[0].sectorKey);
    }
  }, [iso3, deepDiveSectorOptions, sectorDeepDiveKey]);
  const summaryMd =
    (data.profile?.summary_md as string | undefined) ??
    (data.narrative?.summary as string | undefined);
  const opportunityThesis =
    (data.profile?.opportunity_thesis_md as string | undefined) ??
    (data.thesis?.opportunityThesis as string | undefined);
  const riskNarrative =
    (data.profile?.risk_narrative_md as string | undefined) ??
    (data.thesis?.riskNarrative as string | undefined);

  const loadQuota = React.useCallback(async () => {
    if (!hasCountryProfileAccess) return;
    setQuotaLoading(true);
    try {
      const res = await fetch('/api/v1/reports/quota', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as { quota?: ReportQuotaStatus };
        if (json.quota) {
          setQuota(json.quota);
          return;
        }
      }
      setQuota(buildQuotaStatusForPlanId(effectivePlanId, { isAdmin }));
    } catch {
      setQuota(buildQuotaStatusForPlanId(effectivePlanId, { isAdmin }));
    } finally {
      setQuotaLoading(false);
    }
  }, [hasCountryProfileAccess, effectivePlanId, isAdmin]);

  const loadReportHistory = React.useCallback(async () => {
    if (!iso3 || !hasCountryProfileAccess) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/v1/reports/history?iso3=${encodeURIComponent(iso3)}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as { requests?: ReportHistoryItem[] };
        const requests = json.requests ?? [];
        setReportHistory(requests);

        const hasPending = requests.some(
          (r) => r.status === 'queued' || r.status === 'processing'
        );
        if (hasPending) {
          const processRes = await fetch('/api/v1/reports/process-pending', {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
          });
          if (processRes.ok) {
            const refresh = await fetch(
              `/api/v1/reports/history?iso3=${encodeURIComponent(iso3)}`,
              { credentials: 'include', cache: 'no-store' }
            );
            if (refresh.ok) {
              const refreshJson = (await refresh.json()) as { requests?: ReportHistoryItem[] };
              setReportHistory(refreshJson.requests ?? []);
            }
            void loadQuota();
          }
        }
      }
    } catch {
      setReportHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [iso3, hasCountryProfileAccess, loadQuota]);

  useEffect(() => {
    loadReportHistory();
    loadQuota();
  }, [loadReportHistory, loadQuota]);

  const hasPendingReports = reportHistory.some(
    (r) => r.status === 'queued' || r.status === 'processing'
  );

  useEffect(() => {
    if (!hasPendingReports) return;
    const timer = window.setInterval(() => {
      void loadReportHistory();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [hasPendingReports, loadReportHistory]);

  const onGeneratePdfClick = (
    reportType: string,
    options?: { sectorKey?: string },
    requiresBusiness = false
  ) => {
    if (reportsPaused) {
      setShowPausedModal(true);
      return;
    }
    if (requiresBusiness && !hasBusinessReports) return;
    void handleGenerateReport(reportType, options);
  };

  const pausedGenerateBtnClass =
    'bg-zinc-700/90 text-zinc-500 border border-zinc-600 cursor-pointer hover:bg-zinc-700';

  const handleGenerateReport = async (reportType: string, options?: { sectorKey?: string }) => {
    const iso3 = data.country?.iso3;
    if (!iso3) {
      setReportStatus({ type: 'error', message: 'Country data not loaded. Please refresh and try again.' });
      return;
    }

    if (downloadFormat === 'pptx') {
      setReportStatus({
        type: 'error',
        message: 'PowerPoint export is on the roadmap (R2b). Select PDF to generate now.',
      });
      return;
    }

    setLoadingReport(reportType);
    setReportStatus(null);

    try {
      const res = await fetch('/api/v1/reports/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          iso3,
          sectorKey:
            reportType === 'Sector Deep-Dive'
              ? options?.sectorKey ?? sectorDeepDiveKey
              : undefined,
          templateVersion: reportType === 'Sector Deep-Dive' ? 'v2' : undefined,
          query: reportType === 'AI Custom Report' ? aiQuery.trim() || undefined : undefined,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 429) {
          const resetLabel = json.resetAt
            ? new Date(json.resetAt as string).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC',
              })
            : 'next month';
          throw new Error(
            `${json.error ?? 'Report quota exceeded'}. Resets ${resetLabel} UTC.`
          );
        }
        if (res.status === 422 && json.error === 'PREFLIGHT_FAILED') {
          throw new Error(
            formatPreflightErrorsMessage(
              json.preflight as { errors?: Array<{ code: string; message: string }> } | undefined
            )
          );
        }
        throw new Error(
          (json.message as string | undefined) ?? (json.error as string | undefined) ?? 'Failed to queue report'
        );
      }

      if (json.quota) {
        setQuota(json.quota as ReportQuotaStatus);
      } else {
        void loadQuota();
      }

      const updatedQuota = (json.quota as ReportQuotaStatus | undefined) ?? quota;
      const quotaLine =
        updatedQuota && !updatedQuota.unlimited
          ? formatReportQuotaSummary(updatedQuota, reportType)
          : null;
      const baseMessage =
        json.message ?? `${reportType} queued successfully. Check Report History for your PDF.`;
      const isFailed = json.status === 'failed';

      setReportStatus({
        type: isFailed ? 'error' : 'success',
        message: quotaLine ? `${baseMessage} ${quotaLine}` : baseMessage,
      });
      void loadReportHistory();
    } catch (err) {
      setReportStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to queue report. Please try again.',
      });
    } finally {
      setLoadingReport(null);
    }
  };

  const isGenerating = (reportType: string) => loadingReport === reportType;

  const displayQuota =
    quota ??
    (hasCountryProfileAccess
      ? buildQuotaStatusForPlanId(effectivePlanId, { isAdmin })
      : null);

  // Explorer and below: no Reports tab content
  if (!hasCountryProfileAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border border-zinc-700/50 rounded-lg p-8 text-center">
          <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-3">Professional+ Feature</h3>
          <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
            Upgrade to Professional to generate Country Profile PDFs. Business+ unlocks Investment Memos, Trade Profiles, Sector Deep-Dives, and AI custom reports.
          </p>
          <Link
            href={upgradeWorkflowHref('professional', 'reports-tab')}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Upgrade to Professional
          </Link>
          <Link
            href={planCompareHref('professional', 'reports-tab')}
            className="inline-flex items-center gap-2 mt-4 text-sm text-blue-400 hover:text-blue-300"
          >
            Compare access plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showPausedModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reports-paused-title"
          onClick={() => setShowPausedModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 id="reports-paused-title" className="text-lg font-semibold text-white">
                {REPORTS_PAUSED_BANNER_TITLE}
              </h3>
              <button
                type="button"
                onClick={() => setShowPausedModal(false)}
                className="text-zinc-500 hover:text-white p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{REPORTS_PAUSED_BANNER_BODY}</p>
            <button
              type="button"
              onClick={() => setShowPausedModal(false)}
              className="mt-5 w-full py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {previewReportType && iso3 && (
        <ReportPreviewModal
          reportType={previewReportType}
          countryName={countryName}
          iso3={iso3}
          summary={summaryMd}
          opportunityThesis={opportunityThesis}
          riskNarrative={riskNarrative}
          query={previewReportType === 'AI Custom Report' ? aiQuery : undefined}
          onClose={() => setPreviewReportType(null)}
        />
      )}

      {reportStatus && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            reportStatus.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/20 border-red-500/30 text-red-300'
          }`}
        >
          {reportStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <p className="text-sm leading-relaxed">{reportStatus.message}</p>
        </div>
      )}

      {!hasBusinessReports && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-blue-500/20 bg-blue-950/20 text-blue-200">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
            <p className="text-sm leading-relaxed">
              <span className="font-semibold text-white">Professional plan:</span>{' '}
              {reportsPaused
                ? 'Institutional PDF reports are being refreshed across all markets. Upgrade to Business+ for Investment Memos, Trade Profiles, Sector Deep-Dives, and AI custom reports when generation resumes.'
                : 'Country Profile PDF generation is active. Upgrade to Business+ to unlock Investment Memos, Trade Profiles, Sector Deep-Dives, and AI custom reports.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link
              href={planCompareHref('business', 'reports-tab')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Compare Plans
            </Link>
            <Link
              href={upgradeWorkflowHref('business', 'reports-tab')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Upgrade to Business+
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-6 lg:p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Intelligence Reports</h2>
              <p className="text-sm text-zinc-400">Generate, customize, and download actionable reports</p>
            </div>
          </div>
          <HelpTooltip term="reports_overview" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
            <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-300 mb-1">4</div>
            <div className="text-sm text-zinc-400">Pre-Built Reports</div>
            <p className="text-xs text-zinc-500 mt-1">One-click generation</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
            <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-300 mb-1">AI-Powered</div>
            <div className="text-sm text-zinc-400">Custom Reports</div>
            <p className="text-xs text-zinc-500 mt-1">Business+ feature</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
            <Mail className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-300 mb-1">Weekly</div>
            <div className="text-sm text-zinc-400">Newsletter</div>
            <p className="text-xs text-zinc-500 mt-1">Curated insights</p>
          </div>
        </div>

        {quotaLoading ? (
          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading monthly usage…
          </div>
        ) : displayQuota && !displayQuota.unlimited ? (
          <div className="mt-4 p-4 rounded-lg border border-blue-500/20 bg-blue-950/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-400 mb-2">
              Monthly report usage · {displayQuota.planId} plan
            </p>
            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              {displayQuota.template.limit !== null && (
                <p>
                  <span className="text-zinc-400">Template reports: </span>
                  <span className="text-white font-medium">
                    {displayQuota.template.used} used
                  </span>
                  <span className="text-zinc-500"> · </span>
                  <span className="text-white font-medium">
                    {displayQuota.template.remaining ?? 0} remaining
                  </span>
                  <span className="text-zinc-500"> of {displayQuota.template.limit} this month</span>
                </p>
              )}
              {hasBusinessReports && displayQuota.ai.effectiveLimit !== null && displayQuota.ai.effectiveLimit > 0 && (
                <p>
                  <span className="text-zinc-400">AI custom reports: </span>
                  <span className="text-white font-medium">
                    {displayQuota.ai.used} used
                  </span>
                  <span className="text-zinc-500"> · </span>
                  <span className="text-white font-medium">
                    {displayQuota.ai.remaining ?? 0} remaining
                  </span>
                  <span className="text-zinc-500"> of {displayQuota.ai.effectiveLimit} this month</span>
                </p>
              )}
            </div>
            {(displayQuota.template.remaining === 0 ||
              (hasBusinessReports && displayQuota.ai.remaining === 0)) && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={displayQuota.upgradeUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                >
                  Upgrade plan
                  <ArrowRight className="w-3 h-3" />
                </Link>
                {hasBusinessReports && displayQuota.ai.remaining === 0 && (
                  <Link
                    href={displayQuota.contactUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
                  >
                    AI add-on (+5/mo)
                  </Link>
                )}
              </div>
            )}
            <p className="text-xs text-zinc-600 mt-2">
              Resets{' '}
              {new Date(displayQuota.resetAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC',
              })}{' '}
              UTC
            </p>
          </div>
        ) : null}
      </div>

      {/* Pre-Built Reports Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Quick Reports
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              {reportsPaused
                ? 'Institutional PDF exports are being refreshed — explore live intelligence in the tabs above'
                : 'Pre-built reports, generated on-demand with latest data'}
            </p>
          </div>
          {!reportsPaused && (
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="report-download-format" className="text-xs text-zinc-500 uppercase tracking-wide">
                Format
              </label>
              <select
                id="report-download-format"
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value as 'pdf' | 'pptx')}
                className="text-sm bg-zinc-800 border border-zinc-600 text-white rounded-lg px-3 py-1.5"
              >
                <option value="pdf">PDF (ready)</option>
                <option value="pptx">PowerPoint (soon)</option>
              </select>
            </div>
          )}
        </div>

        {reportsPaused && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 flex gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-100">{REPORTS_PAUSED_BANNER_TITLE}</p>
              <p className="text-sm text-amber-200/80 mt-1">{REPORTS_PAUSED_BANNER_BODY}</p>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${reportsPaused ? 'opacity-75' : ''}`}>
          {/* Country Profile */}
          <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-bold text-white">Country Profile</h4>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Professional+</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">Comprehensive country overview with key economic indicators</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-blue-400">✓</span>
                <span>Economic snapshot & demographics</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-blue-400">✓</span>
                <span>Key sectors & growth drivers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-blue-400">✓</span>
                <span>Trade summary & market access</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 mb-4 pb-4 border-b border-zinc-700">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>4-6 pages</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Updated weekly</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleGenerateReport('Country Profile')}
                disabled={reportsPaused || isGenerating('Country Profile')}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating('Country Profile') ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                {reportsPaused ? 'Coming soon' : 'Generate PDF'}
              </button>
              <button
                type="button"
                onClick={() => setPreviewReportType('Country Profile')}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg font-semibold transition-colors"
              >
                Preview
              </button>
            </div>
          </div>

          {/* Investment Memo */}
          <div className={`bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 transition-all duration-300 ${hasBusinessReports ? 'hover:border-emerald-500/30' : 'opacity-50'}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-bold text-white">Investment Memo</h4>
                  <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">Business+</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">Deep-dive opportunity & risk analysis with entry strategies</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400">✓</span>
                <span>3-pillar investment thesis</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400">✓</span>
                <span>Risk assessment & mitigation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400">✓</span>
                <span>Entry point recommendations</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 mb-4 pb-4 border-b border-zinc-700">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>8-12 pages</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Updated monthly</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onGeneratePdfClick('Investment Memo', undefined, true)}
                disabled={!reportsPaused && (!hasBusinessReports || isGenerating('Investment Memo'))}
                className={`flex-1 px-4 py-2 text-sm rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  reportsPaused
                    ? pausedGenerateBtnClass
                    : hasBusinessReports
                      ? 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white'
                      : 'bg-zinc-700 cursor-not-allowed text-white'
                }`}
              >
                {isGenerating('Investment Memo') ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Generate PDF
              </button>
              <button
                type="button"
                onClick={() => hasBusinessReports && setPreviewReportType('Investment Memo')}
                disabled={!hasBusinessReports}
                className={`px-4 py-2 ${hasBusinessReports ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-zinc-800 cursor-not-allowed'} text-white text-sm rounded-lg font-semibold transition-colors`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Trade Profile */}
          <div className={`bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 transition-all duration-300 ${hasBusinessReports ? 'hover:border-cyan-500/30' : 'opacity-50'}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Ship className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-bold text-white">Trade Profile</h4>
                  <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">Business+</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">Bilateral trade flows, AGOA analysis, export opportunities</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-cyan-400">✓</span>
                <span>U.S. trade relationship & AGOA</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-cyan-400">✓</span>
                <span>Top trade partners analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-cyan-400">✓</span>
                <span>Export/import breakdown</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 mb-4 pb-4 border-b border-zinc-700">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>6-8 pages</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Updated quarterly</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onGeneratePdfClick('Trade Profile', undefined, true)}
                disabled={!reportsPaused && (!hasBusinessReports || isGenerating('Trade Profile'))}
                className={`flex-1 px-4 py-2 text-sm rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  reportsPaused
                    ? pausedGenerateBtnClass
                    : hasBusinessReports
                      ? 'bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white'
                      : 'bg-zinc-700 cursor-not-allowed text-white'
                }`}
              >
                {isGenerating('Trade Profile') ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Generate PDF
              </button>
              <button
                type="button"
                onClick={() => hasBusinessReports && setPreviewReportType('Trade Profile')}
                disabled={!hasBusinessReports}
                className={`px-4 py-2 ${hasBusinessReports ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-zinc-800 cursor-not-allowed'} text-white text-sm rounded-lg font-semibold transition-colors`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Sector Deep-Dive */}
          <div className={`bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 transition-all duration-300 ${hasBusinessReports ? 'hover:border-purple-500/30' : 'opacity-50'}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-bold text-white">Sector Deep-Dive</h4>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Business+</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">Comprehensive single-sector analysis with competitive landscape</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="mb-3">
                <label className="text-xs text-zinc-400 mb-2 block">Select Sector:</label>
                <select
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  value={sectorDeepDiveKey}
                  onChange={(e) => setSectorDeepDiveKey(e.target.value)}
                  disabled={!hasBusinessReports || !deepDiveSectorOptions.length}
                >
                  {deepDiveSectorOptions.map((s) => (
                    <option key={s.sectorKey} value={s.sectorKey}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-purple-400">✓</span>
                <span>Sector scores & attractiveness</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-purple-400">✓</span>
                <span>Key players & competitive landscape</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 mb-4 pb-4 border-b border-zinc-700">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>10-15 pages</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Updated monthly</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  onGeneratePdfClick('Sector Deep-Dive', { sectorKey: sectorDeepDiveKey }, true)
                }
                disabled={!reportsPaused && (!hasBusinessReports || isGenerating('Sector Deep-Dive'))}
                className={`flex-1 px-4 py-2 text-sm rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  reportsPaused
                    ? pausedGenerateBtnClass
                    : hasBusinessReports
                      ? 'bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white'
                      : 'bg-zinc-700 cursor-not-allowed text-white'
                }`}
              >
                {isGenerating('Sector Deep-Dive') ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Generate PDF
              </button>
              <button
                type="button"
                onClick={() => hasBusinessReports && setPreviewReportType('Sector Deep-Dive')}
                disabled={!hasBusinessReports}
                className={`px-4 py-2 ${hasBusinessReports ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-zinc-800 cursor-not-allowed'} text-white text-sm rounded-lg font-semibold transition-colors`}
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Custom Reports Section */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6 lg:p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                AI-Powered Custom Reports
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Business+</span>
              </h3>
              <p className="text-sm text-zinc-400 mt-1">Generate tailored reports for your specific use case</p>
            </div>
          </div>
          <HelpTooltip term="ai_custom_reports" />
        </div>

        {hasBusinessReports ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                What are you trying to evaluate or analyze?
              </label>
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                rows={3}
                placeholder="Example: Should we open a fintech subsidiary in Lagos? What are the regulatory requirements, competitive landscape, and expected ROI?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Budget Range</label>
                <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
                  <option>$1-5M</option>
                  <option>$5-10M</option>
                  <option>$10-25M</option>
                  <option>$25M+</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Timeline</label>
                <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
                  <option>0-6 months</option>
                  <option>6-12 months</option>
                  <option>12-18 months</option>
                  <option>18+ months</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Risk Appetite</label>
                <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
                  <option>Conservative</option>
                  <option>Moderate</option>
                  <option>Aggressive</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onGeneratePdfClick('AI Custom Report')}
              disabled={!reportsPaused && isGenerating('AI Custom Report')}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                reportsPaused
                  ? pausedGenerateBtnClass
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-wait text-white'
              }`}
            >
              {isGenerating('AI Custom Report') ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              Generate Custom Report
              <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-zinc-500 text-center">
              AI will synthesize data from all tabs to create a custom report addressing your specific question
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-bold text-white mb-2">Business+ Required</h4>
            <p className="text-sm text-zinc-400 mb-4 max-w-xl mx-auto">
              Upgrade to Business+ to unlock AI-powered custom reports tailored to your specific investment questions and use cases.
            </p>
            <Link
              href={planCompareHref('business', 'reports-tab')}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Compare Business+ Plans
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={upgradeWorkflowHref('business', 'reports-tab')}
              className="inline-flex items-center justify-center gap-2 mt-3 px-6 py-2.5 text-sm text-purple-400 hover:text-purple-300"
            >
              Contact sales to upgrade
            </Link>
          </div>
        )}
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border border-emerald-500/30 rounded-xl p-6 lg:p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Curated Intelligence Newsletter</h3>
              <p className="text-sm text-zinc-400 mt-1">Weekly or monthly reports delivered to your inbox</p>
            </div>
          </div>
          <HelpTooltip term="newsletter_subscription" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-emerald-400" />
              <h4 className="text-base font-semibold text-white">Weekly Briefing</h4>
            </div>
            <p className="text-sm text-zinc-300 mb-4">
              Key developments, sector updates, and trade alerts for Nigeria delivered every Monday.
            </p>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="weekly" className="w-4 h-4 rounded bg-zinc-700 border-zinc-600" defaultChecked />
              <label htmlFor="weekly" className="text-sm text-zinc-300">Subscribe to weekly briefing</label>
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h4 className="text-base font-semibold text-white">Monthly Deep-Dive</h4>
            </div>
            <p className="text-sm text-zinc-300 mb-4">
              Comprehensive sector analysis, investment themes, and policy updates delivered monthly.
            </p>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="monthly" className="w-4 h-4 rounded bg-zinc-700 border-zinc-600" />
              <label htmlFor="monthly" className="text-sm text-zinc-300">Subscribe to monthly deep-dive</label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors">
            Save Newsletter Preferences
          </button>
        </div>
      </div>

      {/* Report History */}
      <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Reports
          </h3>
        </div>

        <div className="space-y-3">
          {historyLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading report history…</span>
            </div>
          ) : reportHistory.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Your generated reports will appear here once PDF generation completes.</p>
              <p className="text-xs text-zinc-600 mt-2">No reports generated yet for {data.country?.name ?? 'this country'}.</p>
            </div>
          ) : (
            reportHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-zinc-700/50 bg-zinc-800/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.reportType}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        item.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : item.status === 'failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {item.status === 'completed'
                        ? 'Ready'
                        : item.status === 'failed'
                          ? 'Failed'
                          : item.status === 'processing'
                            ? 'Generating…'
                            : 'Queued'}
                    </span>
                    {item.storagePath && item.downloadProxyUrl ? (
                      <a
                        href={item.downloadProxyUrl}
                        download={item.downloadFilename ?? undefined}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </a>
                    ) : item.status !== 'failed' ? (
                      <span className="text-xs text-zinc-500">Processing…</span>
                    ) : null}
                  </div>
                </div>
                {item.status === 'failed' && item.errorMessage ? (
                  <p className="mt-2 text-xs text-red-400/90 leading-relaxed break-words">
                    {item.errorMessage}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Institutional CTA */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6 text-center">
        <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-white mb-2">Need Enterprise Solutions?</h4>
        <p className="text-sm text-zinc-300 mb-4 max-w-2xl mx-auto">
          Institutional plans include white-label reports, API access, team collaboration, and dedicated support. Contact our sales team for custom pricing.
        </p>
        <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
          Contact Sales
        </button>
      </div>
    </div>
  );
}
