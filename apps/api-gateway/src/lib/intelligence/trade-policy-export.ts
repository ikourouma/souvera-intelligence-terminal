/**
 * PNG export context for trade policy surfaces (AGOA, AfCFTA, legislative timeline).
 */

import { exportCardToPNG, exportElementToPNG } from '@/lib/intelligence/export-png';

export const TRADE_POLICY_EXPORT_DISCLAIMER =
  'Curated preview intelligence. Verify eligibility with official USTR sources before trade decisions.';

export function tradePolicyExportContext(cardTitle: string, subtitle?: string) {
  return {
    countryName: subtitle ?? 'Trade Policy Intelligence',
    cardTitle,
    sourceAttribution: 'USTR, AfCFTA Secretariat, Souvera Curated Intelligence',
    disclaimer: TRADE_POLICY_EXPORT_DISCLAIMER,
    dataAsOf: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
}

export async function exportTradePolicyCard(
  elementId: string,
  fileName: string,
  cardTitle: string,
  subtitle?: string
): Promise<void> {
  return exportCardToPNG({
    elementId,
    fileName,
    ...tradePolicyExportContext(cardTitle, subtitle),
  });
}

export async function exportTradePolicyElement(
  element: HTMLElement,
  fileName: string,
  cardTitle: string,
  subtitle?: string
): Promise<void> {
  return exportElementToPNG({
    element,
    fileName,
    ...tradePolicyExportContext(cardTitle, subtitle),
  });
}
