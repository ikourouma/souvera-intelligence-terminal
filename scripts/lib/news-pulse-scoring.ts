/**
 * Keyword-based News Pulse scoring for GDELT headline batches.
 */

import type { GdeltArticle } from './gdelt-doc';

export interface NewsPulseScore {
  headlineCount: number;
  sentimentScore: number;
  riskIntensity: number;
  opportunityIntensity: number;
  topHeadlines: Array<{
    title: string;
    url: string;
    source: string;
    publishedAt: string;
  }>;
}

const RISK_KEYWORDS = [
  'crisis', 'conflict', 'sanction', 'protest', 'coup', 'violence', 'terror',
  'inflation surge', 'recession', 'default', 'hurricane', 'earthquake',
  'crime', 'corruption scandal', 'downgrade', 'strike', 'unrest', 'fraud',
];

const OPPORTUNITY_KEYWORDS = [
  'investment', 'growth', 'partnership', 'deal', 'expand', 'reform',
  'tourism', 'fintech', 'infrastructure', 'billion', 'record', 'boost',
  'agreement', 'launch', 'recovery', 'opportunity', 'trade deal', 'fdi',
];

const POSITIVE_WORDS = [
  'growth', 'surge', 'boost', 'record', 'strong', 'positive', 'gain',
  'recovery', 'success', 'expand', 'partnership', 'investment', 'deal',
];

const NEGATIVE_WORDS = [
  'crisis', 'decline', 'fall', 'drop', 'conflict', 'violence', 'protest',
  'sanction', 'recession', 'default', 'scandal', 'fraud', 'strike', 'unrest',
];

function countKeywordHits(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((n, kw) => (lower.includes(kw) ? n + 1 : n), 0);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function scoreNewsPulse(articles: GdeltArticle[]): NewsPulseScore {
  if (articles.length === 0) {
    return {
      headlineCount: 0,
      sentimentScore: 0,
      riskIntensity: 0,
      opportunityIntensity: 0,
      topHeadlines: [],
    };
  }

  let riskHits = 0;
  let oppHits = 0;
  let posHits = 0;
  let negHits = 0;

  for (const article of articles) {
    const text = article.title;
    riskHits += countKeywordHits(text, RISK_KEYWORDS);
    oppHits += countKeywordHits(text, OPPORTUNITY_KEYWORDS);
    posHits += countKeywordHits(text, POSITIVE_WORDS);
    negHits += countKeywordHits(text, NEGATIVE_WORDS);
  }

  const totalHits = riskHits + oppHits + posHits + negHits || 1;
  const sentimentRaw = (posHits - negHits) / Math.max(articles.length, 3);
  const sentimentScore = clamp(Math.round(sentimentRaw * 100) / 100, -1, 1);

  const riskIntensity = clamp(Math.round((riskHits / totalHits) * 100), 0, 100);
  const opportunityIntensity = clamp(Math.round((oppHits / totalHits) * 100), 0, 100);

  const topHeadlines = articles.slice(0, 5).map((a) => ({
    title: a.title,
    url: a.url,
    source: a.domain,
    publishedAt: a.seendate,
  }));

  return {
    headlineCount: articles.length,
    sentimentScore,
    riskIntensity,
    opportunityIntensity,
    topHeadlines,
  };
}
