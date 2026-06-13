/**
 * Phase 0B.3 — Map Evidence Vault market-access frameworks to Overview card items.
 */

import type { OverviewMarketAccessItem } from '@/lib/intelligence/country-overview-content';
import type { MarketAccessFramework } from '@/lib/intelligence/market-access-registry';
import type { MarketAccessFrameworkDto } from '@/types/country-intelligence';

type FrameworkInput = MarketAccessFramework | MarketAccessFrameworkDto;

const FRAMEWORK_TITLES: Record<string, string> = {
  AGOA: 'AGOA: U.S. Market Access',
  AfCFTA: 'AfCFTA: Continental Free Trade Area',
  ECOWAS: 'ECOWAS: Regional Market',
  CBI: 'CBI: U.S. Caribbean Basin Initiative',
  CARICOM: 'CARICOM: Caribbean Community',
};

function statusToTone(status: string): 'amber' | 'emerald' {
  return status === 'active' ? 'emerald' : 'amber';
}

function frameworkTitle(label: string): string {
  return FRAMEWORK_TITLES[label] ?? `${label} Trade Framework`;
}

function buildFootnote(framework: FrameworkInput): string {
  const statusLabel = framework.statusLabel ?? framework.status;
  if (framework.status === 'info' || /under review/i.test(statusLabel)) {
    return 'Status: Under review · Evidence Vault pending verification';
  }
  return `Status: ${statusLabel} · Source: Evidence Vault`;
}

/**
 * Converts vault-backed `marketAccess` DTOs into Overview tab card rows.
 * Returns empty when no frameworks — caller may fall back to static copy.
 */
export function buildOverviewMarketAccessItems(
  frameworks: FrameworkInput[] | undefined
): OverviewMarketAccessItem[] {
  if (!frameworks?.length) return [];

  return frameworks.map((fw) => ({
    emoji: fw.emoji ?? '🌐',
    tone: statusToTone(fw.status),
    title: frameworkTitle(fw.label),
    paragraphs: [fw.description],
    footnote: buildFootnote(fw),
  }));
}
