/**
 * Trade sector composition helpers — derive $ volumes from totals + share %.
 * Data originates from API trade payload (curated today; Comtrade ingestion Phase 2).
 */

export interface SectorCompositionItem {
  sector: string;
  sharePct: number;
  valueUsd?: number;
}

/** Standard sector card count for Export/Import breakdown sections. */
export const BREAKDOWN_SECTOR_SLOTS = 5;

/**
 * Pad or trim composition to a consistent slot count for UI parity across markets.
 */
export function normalizeCompositionSlots(
  items: SectorCompositionItem[],
  slots = BREAKDOWN_SECTOR_SLOTS
): SectorCompositionItem[] {
  if (!items.length) return [];
  if (items.length >= slots) return items.slice(0, slots);

  const normalized = [...items];
  const sum = compositionShareSum(normalized);
  const remaining = Math.max(0, 100 - sum);

  if (remaining > 0) {
    normalized.push({ sector: 'Services & Other', sharePct: remaining });
  } else if (normalized.length < slots) {
    const last = normalized[normalized.length - 1];
    if (last && last.sharePct > 4) {
      const split = Math.floor(last.sharePct / 2);
      normalized[normalized.length - 1] = { ...last, sharePct: last.sharePct - split };
      normalized.push({ sector: 'Services & Other', sharePct: split });
    }
  }

  return normalized.slice(0, slots);
}

export function enrichCompositionWithUsd(
  items: SectorCompositionItem[],
  totalUsd?: number
): SectorCompositionItem[] {
  if (!items.length) return [];
  return items.map((item) => ({
    ...item,
    valueUsd:
      item.valueUsd ??
      (totalUsd != null && totalUsd > 0
        ? Math.round((totalUsd * item.sharePct) / 100)
        : undefined),
  }));
}

export function compositionShareSum(items: SectorCompositionItem[]): number {
  return items.reduce((sum, i) => sum + i.sharePct, 0);
}

export function compositionBullets(
  items: SectorCompositionItem[],
  limit = 3
): string[] {
  return items.slice(0, limit).map((item, i) => {
    const usd =
      item.valueUsd != null
        ? ` (~$${item.valueUsd >= 1e9 ? (item.valueUsd / 1e9).toFixed(1) + 'B' : (item.valueUsd / 1e6).toFixed(0) + 'M'})`
        : '';
    return `#${i + 1} ${item.sector}: ${item.sharePct}%${usd}`;
  });
}
