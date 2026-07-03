'use client';

import Link from 'next/link';
import { TrendingUp, Target, Newspaper, Gauge, ExternalLink, Download } from 'lucide-react';
import { useState, useRef } from 'react';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import type { NewsHeadline } from '@/types/country-intelligence';
import type { CardAnalysisInput } from '@/lib/intelligence/generate-card-analysis';

export interface SignalMomentumRowProps {
  signal: {
    level: string;
    investmentScore: number | null;
    confidenceScore: number | null;
    scan?: {
      badge: string;
      bullets: [string, string];
    };
  };
  momentum: {
    economicMomentum: number | null;
    investorReadiness: number | null;
    bandLabel?: string | null;
    bandClause?: string | null;
  };
  newsPulse: {
    sentimentScore: number | null;
    riskIntensity: number | null;
    opportunityIntensity: number | null;
    headlineCount?: number | null;
    topHeadlines?: NewsHeadline[];
    pending?: boolean;
  };
  onMomentumClick?: () => void;
  className?: string;
  countryName?: string;
  iso3?: string;
}

/**
 * SignalMomentumRow - 3-card horizontal layout
 * Shows signal strength, economic momentum, and news sentiment
 * 
 * Visual Capitalist Principle: Storytelling Through Data
 */
export function SignalMomentumRow({
  signal,
  momentum,
  newsPulse,
  onMomentumClick,
  className = '',
  countryName = 'Country',
  iso3 = 'XXX',
}: SignalMomentumRowProps) {
  // Format momentum color
  const getMomentumColor = (value: number) => {
    if (value >= 50) return { text: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (value >= 0) return { text: 'text-blue-400', bg: 'bg-blue-500' };
    if (value >= -50) return { text: 'text-amber-400', bg: 'bg-amber-500' };
    return { text: 'text-red-400', bg: 'bg-red-500' };
  };

  // Format sentiment label
  const getSentimentLabel = (score: number) => {
    if (score >= 0.3) return { label: 'Positive', color: 'text-emerald-400' };
    if (score >= -0.3) return { label: 'Neutral', color: 'text-zinc-400' };
    return { label: 'Negative', color: 'text-red-400' };
  };

  const momentumColor = getMomentumColor(momentum.economicMomentum ?? 0);
  const sentiment = getSentimentLabel(newsPulse.sentimentScore ?? 0);
  const invScore = signal.investmentScore;
  const newsPending = newsPulse.pending === true;
  const headlines = newsPulse.topHeadlines ?? [];

  /** External URL, internal Souvera article path, or plain text when no verified link */
  const headlineHref = (h: NewsHeadline): string | null => {
    if (h.url?.startsWith('/insights/news/')) return h.url;
    if (h.url && h.url !== '#' && h.url.trim() !== '') return h.url;
    return null;
  };
  const momentumValue = momentum.economicMomentum;
  const readinessValue = momentum.investorReadiness;
  const signalScan = signal.scan;
  const bandLabel = momentum.bandLabel;
  const bandClause = momentum.bandClause;

  // Export handlers for each card
  const signalCardRef = useRef<HTMLDivElement>(null);
  const momentumCardRef = useRef<HTMLDivElement>(null);
  const newsCardRef = useRef<HTMLDivElement>(null);
  const [exportingSignal, setExportingSignal] = useState(false);
  const [exportingMomentum, setExportingMomentum] = useState(false);
  const [exportingNews, setExportingNews] = useState(false);

  const handleExportSignal = async () => {
    if (!signalCardRef.current || exportingSignal) return;
    setExportingSignal(true);
    try {
      const aiConfig: CardAnalysisInput = {
        cardType: 'signal_strength',
        countryName,
        iso3,
        data: {
          'Investment Score': invScore != null ? `${invScore}/100` : 'Pending',
          'Confidence Score': signal.confidenceScore != null ? `${signal.confidenceScore}/100` : 'Pending',
          'Signal Level': signal.level,
        },
      };

      await exportElementToPNG({
        element: signalCardRef.current,
        fileName: `souvera-${iso3}-signal-strength-${new Date().toISOString().split('T')[0]}.png`,
        cardTitle: 'Signal Strength',
        countryName,
        sourceAttribution: 'SOUVERA Intelligence',
        aiAnalysisConfig: aiConfig,
      });
    } catch (err) {
      console.error('Failed to export Signal Strength:', err);
    } finally {
      setExportingSignal(false);
    }
  };

  const handleExportMomentum = async () => {
    if (!momentumCardRef.current || exportingMomentum) return;
    setExportingMomentum(true);
    try {
      const aiConfig: CardAnalysisInput = {
        cardType: 'economic_momentum',
        countryName,
        iso3,
        data: {
          'Momentum Index': momentumValue != null ? `${momentumValue > 0 ? '+' : ''}${momentumValue}` : 'Pending',
          'Investor Readiness': readinessValue != null ? `${readinessValue}/100` : 'Pending',
          'Momentum Band': bandLabel || 'Pending',
        },
      };

      await exportElementToPNG({
        element: momentumCardRef.current,
        fileName: `souvera-${iso3}-economic-momentum-${new Date().toISOString().split('T')[0]}.png`,
        cardTitle: 'Economic Momentum',
        countryName,
        sourceAttribution: 'SOUVERA Intelligence',
        aiAnalysisConfig: aiConfig,
      });
    } catch (err) {
      console.error('Failed to export Economic Momentum:', err);
    } finally {
      setExportingMomentum(false);
    }
  };

  const handleExportNews = async () => {
    if (!newsCardRef.current || exportingNews) return;
    setExportingNews(true);
    try {
      const aiConfig: CardAnalysisInput = {
        cardType: 'news_pulse',
        countryName,
        iso3,
        data: {
          'Sentiment': sentiment.label,
          'Sentiment Score': newsPulse.sentimentScore != null ? newsPulse.sentimentScore.toFixed(2) : 'N/A',
          'Risk Intensity': newsPulse.riskIntensity != null ? `${newsPulse.riskIntensity}/100` : 'N/A',
          'Opportunity Intensity': newsPulse.opportunityIntensity != null ? `${newsPulse.opportunityIntensity}/100` : 'N/A',
          'Headlines Analyzed': newsPulse.headlineCount ?? headlines.length,
        },
      };

      await exportElementToPNG({
        element: newsCardRef.current,
        fileName: `souvera-${iso3}-news-pulse-${new Date().toISOString().split('T')[0]}.png`,
        cardTitle: 'News Pulse',
        countryName,
        sourceAttribution: 'SOUVERA Intelligence',
        aiAnalysisConfig: aiConfig,
      });
    } catch (err) {
      console.error('Failed to export News Pulse:', err);
    } finally {
      setExportingNews(false);
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {/* Card 1: Signal Strength */}
      <div ref={signalCardRef} className="exportable-card group relative bg-zinc-900/50 border border-zinc-800 rounded-sm p-4">
        {/* Hover-activated PNG download button */}
        <button
          onClick={handleExportSignal}
          disabled={exportingSignal}
          className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          data-export-exclude
          title="Download Signal Strength as PNG"
          aria-label="Download Signal Strength as PNG"
        >
          <Download className={`w-4 h-4 text-zinc-300 ${exportingSignal ? 'animate-pulse' : ''}`} />
        </button>
        
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-blue-400" />
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
            Signal Strength
            <HelpTooltip term="signal_strength" size="sm" position="top" />
          </h3>
        </div>

        {/* Investment Score */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              Investment Score
              <HelpTooltip term="investment_score" size="sm" position="top" />
            </span>
            <span className="text-xs font-bold text-blue-400">{invScore != null ? `${invScore}/100` : 'Pending'}</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            {invScore != null && (
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${invScore}%` }}
            />
            )}
          </div>
        </div>

        {/* Confidence Score */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              Confidence
              <HelpTooltip term="confidence_score" size="sm" position="top" />
            </span>
            <span className="text-xs font-bold text-emerald-400">{signal.confidenceScore != null ? `${signal.confidenceScore}/100` : 'Pending'}</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            {signal.confidenceScore != null && (
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${signal.confidenceScore}%` }}
            />
            )}
          </div>
        </div>

        {/* Signal scan summary (badge + 2 bullets) */}
        {signalScan && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <p className="text-[11px] font-semibold text-blue-400/90 mb-2">{signalScan.badge}</p>
            <ul className="space-y-1">
              {signalScan.bullets.map((bullet, i) => (
                <li key={i} className="text-[11px] text-zinc-400 leading-snug flex gap-1.5">
                  <span className="text-zinc-600 shrink-0">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Card 2: Economic Momentum */}
      <div
        ref={momentumCardRef}
        className={`exportable-card group relative bg-zinc-900/50 border border-zinc-800 rounded-sm p-4${onMomentumClick ? ' cursor-pointer hover:border-emerald-800/60 transition-colors' : ''}`}
        onClick={onMomentumClick}
        onKeyDown={onMomentumClick ? (e) => e.key === 'Enter' && onMomentumClick() : undefined}
        role={onMomentumClick ? 'button' : undefined}
        tabIndex={onMomentumClick ? 0 : undefined}
      >
        {/* Hover-activated PNG download button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleExportMomentum();
          }}
          disabled={exportingMomentum}
          className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          data-export-exclude
          title="Download Economic Momentum as PNG"
          aria-label="Download Economic Momentum as PNG"
        >
          <Download className={`w-4 h-4 text-zinc-300 ${exportingMomentum ? 'animate-pulse' : ''}`} />
        </button>
        
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
            Economic Momentum
            <HelpTooltip term="economic_momentum" size="sm" position="top" />
          </h3>
        </div>

        {/* Momentum Gauge */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              Momentum Index
              <HelpTooltip term="momentum_index" size="sm" position="top" />
            </span>
            <span className={`text-xs font-bold ${momentumColor.text}`}>
              {momentumValue != null
                ? `${momentumValue > 0 ? '+' : ''}${momentumValue}`
                : 'Pending'}
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            {momentumValue != null && (
            <div
              className={`h-full ${momentumColor.bg} transition-all duration-500`}
              style={{
                width: `${Math.abs(momentumValue)}%`,
                marginLeft: momentumValue < 0 ? 'auto' : '0',
              }}
            />
            )}
          </div>
        </div>

        {/* Investor Readiness */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              Investor Readiness
              <HelpTooltip term="investor_readiness" size="sm" position="top" />
            </span>
            <span className="text-xs font-bold text-purple-400">
              {readinessValue != null ? `${readinessValue}/100` : 'Pending'}
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            {readinessValue != null && (
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${readinessValue}%` }}
            />
            )}
          </div>
        </div>

        {/* Momentum band label (single line — no bullets) */}
        {bandLabel && bandLabel !== 'Pending' && (
          <p className="mt-3 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 leading-snug">
            <span className="font-semibold text-emerald-400/90">{bandLabel}</span>
            {bandClause && (
              <span className="text-zinc-500"> — {bandClause}</span>
            )}
            {onMomentumClick && (
              <span className="text-emerald-600/70 ml-1">→</span>
            )}
          </p>
        )}
      </div>

      {/* Card 3: News Pulse */}
      <div ref={newsCardRef} className="exportable-card group relative bg-zinc-900/50 border border-zinc-800 rounded-sm p-4">
        {/* Hover-activated PNG download button */}
        <button
          onClick={handleExportNews}
          disabled={exportingNews}
          className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          data-export-exclude
          title="Download News Pulse as PNG"
          aria-label="Download News Pulse as PNG"
        >
          <Download className={`w-4 h-4 text-zinc-300 ${exportingNews ? 'animate-pulse' : ''}`} />
        </button>
        
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-4 h-4 text-amber-400" />
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
            News Pulse
            <HelpTooltip term="news_pulse" size="sm" position="top" />
          </h3>
        </div>

        {/* Sentiment Badge */}
        <div className="mb-3">
          <span className="text-xs text-zinc-500 block mb-1">Sentiment</span>
          {newsPending ? (
            <span className="text-xs text-zinc-500">Pending review</span>
          ) : (
            <div className={`inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded-sm ${sentiment.color}`}>
              <Gauge className="w-3 h-3" />
              <span className="text-xs font-bold">{sentiment.label}</span>
            </div>
          )}
        </div>

        {/* Risk Intensity */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              Risk Intensity
              <HelpTooltip term="risk_intensity" size="sm" position="top" />
            </span>
            <span className="text-xs font-bold text-red-400">
              {newsPulse.riskIntensity != null ? `${newsPulse.riskIntensity}/100` : '—'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            {newsPulse.riskIntensity != null && (
            <div
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${newsPulse.riskIntensity}%` }}
            />
            )}
          </div>
        </div>

        {/* Opportunity Intensity */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              Opportunity Intensity
              <HelpTooltip term="opportunity_intensity" size="sm" position="top" />
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {newsPulse.opportunityIntensity != null ? `${newsPulse.opportunityIntensity}/100` : '—'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            {newsPulse.opportunityIntensity != null && (
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${newsPulse.opportunityIntensity}%` }}
            />
            )}
          </div>
        </div>

        {/* Top Headlines */}
        {!newsPending && headlines.length > 0 && (
          <div className="pt-2 border-t border-zinc-800">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1.5">
              Top Headlines{newsPulse.headlineCount ? ` (${newsPulse.headlineCount})` : ''}
            </span>
            <ul className="space-y-1">
              {headlines.slice(0, 3).map((h, i) => {
                const href = headlineHref(h);
                const isInternal = href?.startsWith('/');
                return (
                <li key={i} className="text-[11px] leading-snug">
                  {href ? (
                    isInternal ? (
                      <Link
                        href={href}
                        className="text-zinc-400 hover:text-amber-400 inline-flex items-start gap-1"
                      >
                        <span className="line-clamp-2">{h.title}</span>
                      </Link>
                    ) : (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-amber-400 inline-flex items-start gap-1"
                    >
                      <span className="line-clamp-2">{h.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 mt-0.5" />
                    </a>
                    )
                  ) : (
                    <span className="text-zinc-400 line-clamp-2 inline-flex items-start gap-1">
                      {h.title}
                      <span className="text-[9px] text-amber-600 uppercase tracking-wide shrink-0">(Analysis Only)</span>
                    </span>
                  )}
                </li>
              );})}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
