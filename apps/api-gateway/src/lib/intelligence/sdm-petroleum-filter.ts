/**
 * HTS Ch. 27 / energy sector helpers for Supply-Demand Matrix preferential filtering.
 */

import type { MatrixCell } from '@/lib/intelligence/supply-demand-types';
import { petroleumExclusionFootnote } from '@/lib/intelligence/preferential-trade-policy';

/** SDM sector key for oil, gas, LNG, and power (petroleum-heavy). */
export const SDM_PETROLEUM_SECTOR_KEY = 'energy_power';

export function isHtsChapter27(hsCode: string | number | null | undefined): boolean {
  if (hsCode == null) return false;
  const normalized = String(hsCode).replace(/\D/g, '');
  if (normalized.length < 2) return false;
  const chapter = parseInt(normalized.slice(0, 2), 10);
  return chapter === 27;
}

export function isSdmPetroleumSector(sectorKey?: string | null): boolean {
  return sectorKey === SDM_PETROLEUM_SECTOR_KEY;
}

export const SDM_PETROLEUM_EXCLUSION_REASON =
  'HTS Chapter 27 (crude and refined petroleum) is excluded from AGOA/CBI duty-free preferences.';

/** Annotate matrix cells with preferential exclusion metadata (non-destructive). */
export function annotateSdmCellPreferentialExclusion(cell: MatrixCell): MatrixCell {
  if (!isSdmPetroleumSector(cell.sector_key)) return cell;
  return {
    ...cell,
    preferential_excluded: true,
    preferential_exclusion_reason: SDM_PETROLEUM_EXCLUSION_REASON,
    preferential_framework_note: petroleumExclusionFootnote(cell.iso3),
  };
}

/** Client-side filter: hide petroleum-excluded cells from preferential opportunity views. */
export function filterSdmMatrixForPreferentialView(
  matrix: MatrixCell[],
  excludePetroleum: boolean
): MatrixCell[] {
  if (!excludePetroleum) return matrix;
  return matrix.filter((c) => !c.preferential_excluded);
}

/** Recompute summary counts after petroleum filter (lightweight). */
export function sdmPetroleumFilterStats(matrix: MatrixCell[]): {
  excluded_cells: number;
  visible_cells: number;
} {
  const excluded = matrix.filter((c) => c.preferential_excluded).length;
  return { excluded_cells: excluded, visible_cells: matrix.length - excluded };
}
