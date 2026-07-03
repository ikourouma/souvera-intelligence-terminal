/**
 * Supply-Demand Matrix — sector product profiles scaled to country/sector DB volumes.
 * Product names and mix shares are sector templates; dollar values derive from MatrixCell fields.
 */

import { formatUsdCompact } from '@/lib/intelligence/format-usd';
import type { MatrixCell } from '@/lib/intelligence/supply-demand-types';
import { getCountrySectorSupplyTemplates, isRegionInappropriateProduct } from '@/lib/intelligence/sdm-country-export-profiles';

export const SDM_TOP_EXPORT_PRODUCT_COUNT = 3;

export interface SdmProductRow {
  name: string;
  /** Display value e.g. "$91M" or "$45B/yr" */
  value: string;
  share: string;
  growth?: string;
  /** Raw USD for sorting */
  valueUsd: number;
}

interface SectorProductTemplate {
  name: string;
  sharePct: number;
  growthPct?: number;
}

const SECTOR_SUPPLY_TEMPLATES: Record<string, SectorProductTemplate[]> = {
  manufacturing_textiles: [
    { name: 'Apparel & Garments', sharePct: 35 },
    { name: 'Industrial Machinery', sharePct: 22 },
    { name: 'Automotive Parts', sharePct: 16 },
  ],
  agriculture_food: [
    { name: 'Fresh Produce', sharePct: 28 },
    { name: 'Cocoa & Coffee', sharePct: 21 },
    { name: 'Processed Foods', sharePct: 16 },
  ],
  energy_power: [
    { name: 'Crude Oil & LNG', sharePct: 65 },
    { name: 'Refined Petroleum', sharePct: 17 },
    { name: 'Renewable Components', sharePct: 5 },
  ],
  mining_minerals: [
    { name: 'Gold & Precious Metals', sharePct: 38 },
    { name: 'Critical Minerals', sharePct: 26 },
    { name: 'Industrial Metals', sharePct: 21 },
  ],
  digital_infrastructure: [
    { name: 'Telecom Equipment', sharePct: 35 },
    { name: 'Data Center Services', sharePct: 19 },
    { name: 'Software Services', sharePct: 15 },
  ],
  fintech_finance: [
    { name: 'Mobile Money Platforms', sharePct: 42 },
    { name: 'Payment Processing', sharePct: 26 },
    { name: 'Digital Banking', sharePct: 19 },
  ],
  logistics_trade: [
    { name: 'Port Services', sharePct: 38 },
    { name: 'Freight & Shipping', sharePct: 27 },
    { name: 'Warehousing', sharePct: 15 },
  ],
  tourism_hospitality: [
    { name: 'Hotels & Resorts', sharePct: 45 },
    { name: 'Travel Services', sharePct: 22 },
    { name: 'Eco-Tourism', sharePct: 15 },
  ],
};

const SECTOR_DEMAND_TEMPLATES: Record<string, SectorProductTemplate[]> = {
  manufacturing_textiles: [
    { name: 'Apparel (HS 61-62)', sharePct: 53, growthPct: 3.5 },
    { name: 'Electrical Equipment', sharePct: 28, growthPct: 4.2 },
    { name: 'Auto Components', sharePct: 19, growthPct: 2.8 },
  ],
  agriculture_food: [
    { name: 'Fresh Fruits & Veg', sharePct: 45, growthPct: 5.2 },
    { name: 'Seafood Products', sharePct: 28, growthPct: 4.5 },
    { name: 'Coffee & Cocoa', sharePct: 22, growthPct: 3.8 },
  ],
  energy_power: [
    { name: 'Crude Petroleum', sharePct: 64, growthPct: -1.5 },
    { name: 'LNG & Natural Gas', sharePct: 16, growthPct: 8.2 },
    { name: 'Solar/Wind Equipment', sharePct: 9, growthPct: 15 },
  ],
  mining_minerals: [
    { name: 'Lithium & Cobalt', sharePct: 9, growthPct: 22 },
    { name: 'Gold & Silver', sharePct: 37, growthPct: 5.5 },
    { name: 'Rare Earth Elements', sharePct: 4, growthPct: 18 },
  ],
  digital_infrastructure: [
    { name: 'Semiconductors', sharePct: 52, growthPct: 12 },
    { name: 'Network Equipment', sharePct: 22, growthPct: 8.5 },
    { name: 'Cloud Services', sharePct: 12, growthPct: 18 },
  ],
  fintech_finance: [
    { name: 'Payment Tech', sharePct: 48, growthPct: 15 },
    { name: 'RegTech Solutions', sharePct: 18, growthPct: 22 },
    { name: 'InsurTech', sharePct: 13, growthPct: 18 },
  ],
  logistics_trade: [
    { name: 'Container Shipping', sharePct: 50, growthPct: 4.5 },
    { name: 'Air Freight', sharePct: 25, growthPct: 6.2 },
    { name: '3PL Services', sharePct: 16, growthPct: 8.5 },
  ],
  tourism_hospitality: [
    { name: 'International Travel', sharePct: 64, growthPct: 12 },
    { name: 'Adventure Tourism', sharePct: 12, growthPct: 15 },
    { name: 'Wellness Travel', sharePct: 8, growthPct: 18 },
  ],
};

const FALLBACK_SUPPLY: SectorProductTemplate[] = [
  { name: 'Primary Exports', sharePct: 40 },
  { name: 'Secondary Products', sharePct: 25 },
  { name: 'Emerging Exports', sharePct: 12 },
];

const FALLBACK_DEMAND: SectorProductTemplate[] = [
  { name: 'Primary Imports', sharePct: 50, growthPct: 5 },
  { name: 'Secondary Products', sharePct: 30, growthPct: 3 },
  { name: 'Growth Categories', sharePct: 12, growthPct: 8 },
];

function formatGrowth(pct?: number): string {
  if (pct == null) return '';
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% YoY`;
}

function scaleProducts(
  templates: SectorProductTemplate[],
  baseUsd: number,
  suffix: '/yr' | '',
): SdmProductRow[] {
  const rows = templates.map((t) => {
    const valueUsd = Math.round(baseUsd * (t.sharePct / 100));
    return {
      name: t.name,
      value: `${formatUsdCompact(valueUsd)}${suffix}`,
      share: `${t.sharePct}%`,
      growth: t.growthPct != null ? formatGrowth(t.growthPct) : undefined,
      valueUsd,
    };
  });
  return rows.sort((a, b) => b.valueUsd - a.valueUsd);
}

function flowBackedBaseUsd(cell: MatrixCell): number {
  const flowSum = cell.export_products?.reduce((s, p) => s + p.valueUsd, 0) ?? 0;
  if (flowSum > 0) return flowSum;
  if (cell.export_volume_usd > 0) return cell.export_volume_usd;
  return cell.current_trade_usd;
}

function normalizeSharePct(rows: SdmProductRow[]): SdmProductRow[] {
  const sum = rows.reduce((s, r) => s + r.valueUsd, 0);
  if (sum <= 0) {
    return rows.map((r) => ({ ...r, share: `${Math.round(100 / rows.length)}%` }));
  }
  return rows.map((r) => ({
    ...r,
    share: `${Math.round((r.valueUsd / sum) * 1000) / 10}%`,
  }));
}

/** Country export products — always 3 lines; flow labels first, then region-aware templates. */
export function buildCountrySupplyProducts(cell: MatrixCell): SdmProductRow[] {
  const flowProducts = cell.export_products ?? [];
  const base = flowBackedBaseUsd(cell);

  if (flowProducts.length > 0) {
    const flowSum = flowProducts.reduce((s, p) => s + p.valueUsd, 0);

    // Single coarse USITC category — decompose into country profile lines (same verified total).
    if (flowProducts.length === 1 && flowProducts[0].sharePct >= 90) {
      const templates = getCountrySectorSupplyTemplates(cell.iso3, cell.sector_key, cell.region);
      return normalizeSharePct(scaleProducts(templates, flowSum, '')).slice(0, SDM_TOP_EXPORT_PRODUCT_COUNT);
    }

    const rows: SdmProductRow[] = flowProducts.slice(0, SDM_TOP_EXPORT_PRODUCT_COUNT).map((p) => ({
      name: p.name,
      value: formatUsdCompact(p.valueUsd),
      share: `${p.sharePct}%`,
      valueUsd: p.valueUsd,
    }));

    if (rows.length >= SDM_TOP_EXPORT_PRODUCT_COUNT) {
      return normalizeSharePct(rows);
    }

    const remainder = Math.max(0, base - rows.reduce((s, r) => s + r.valueUsd, 0));
    const templates = getCountrySectorSupplyTemplates(cell.iso3, cell.sector_key, cell.region);
    const used = new Set(rows.map((r) => r.name.toLowerCase()));

    for (const t of templates) {
      if (rows.length >= SDM_TOP_EXPORT_PRODUCT_COUNT) break;
      if (used.has(t.name.toLowerCase())) continue;
      if (isRegionInappropriateProduct(t.name, cell.region)) continue;
      const valueUsd = remainder > 0 ? Math.round(remainder * (t.sharePct / 100)) : 0;
      if (valueUsd <= 0) continue;
      rows.push({
        name: t.name,
        value: formatUsdCompact(valueUsd),
        share: '',
        valueUsd,
      });
      used.add(t.name.toLowerCase());
    }

    if (rows.length >= SDM_TOP_EXPORT_PRODUCT_COUNT) {
      return normalizeSharePct(rows.slice(0, SDM_TOP_EXPORT_PRODUCT_COUNT));
    }

    // Still short — scale country templates to verified flow total.
    const templatesForFill = getCountrySectorSupplyTemplates(cell.iso3, cell.sector_key, cell.region);
    const filled = scaleProducts(templatesForFill, flowSum, '');
    for (const row of filled) {
      if (rows.length >= SDM_TOP_EXPORT_PRODUCT_COUNT) break;
      if (used.has(row.name.toLowerCase())) continue;
      rows.push(row);
      used.add(row.name.toLowerCase());
    }

    return normalizeSharePct(rows.slice(0, SDM_TOP_EXPORT_PRODUCT_COUNT));
  }

  const templates = getCountrySectorSupplyTemplates(cell.iso3, cell.sector_key, cell.region);
  const rows = scaleProducts(templates, base, '').slice(0, SDM_TOP_EXPORT_PRODUCT_COUNT);
  while (rows.length < SDM_TOP_EXPORT_PRODUCT_COUNT) {
    const fallback = FALLBACK_SUPPLY[rows.length] ?? FALLBACK_SUPPLY[0];
    rows.push({
      name: fallback.name,
      value: formatUsdCompact(0),
      share: '0%',
      valueUsd: 0,
    });
  }
  return normalizeSharePct(rows);
}

export function exportProductSourceLabel(cell: MatrixCell): string {
  const flowSum = cell.export_products?.reduce((s, p) => s + p.valueUsd, 0) ?? 0;
  if (flowSum > 0 && cell.export_products_source === 'usitc') {
    return 'USITC category flows (verified category totals)';
  }
  if (flowSum > 0 && cell.export_products_source === 'cbtpa') {
    return 'CBTPA category flows (verified category totals)';
  }
  return cell.data_quality_tier === 'A' ? 'Curated sector estimate' : 'Sector profile estimate (Tier C)';
}

export function countryImportVolumeLabel(cell: MatrixCell): string {
  const usd = cell.country_sector_imports_from_us_usd ?? cell.country_imports_from_us_usd ?? 0;
  if (usd <= 0) return 'pending Census / Comtrade';
  const product = cell.country_top_import_product;
  return product ? `${formatUsdCompact(usd)}/yr (${product})` : `${formatUsdCompact(usd)}/yr`;
}

export function capacityCorridorBridge(cell: MatrixCell): string | null {
  if (cell.export_volume_usd <= 0 || cell.current_trade_usd <= 0) return null;
  if (cell.current_trade_usd >= cell.export_volume_usd * 0.95) return null;
  return `${formatUsdCompact(cell.current_trade_usd)} of ${formatUsdCompact(cell.export_volume_usd)} sector capacity currently reaches the U.S. corridor.`;
}

/** U.S. sector import demand — scaled to cell.us_import_volume_usd (sector-wide U.S. imports). */
export function buildUsSectorDemandProducts(cell: MatrixCell): SdmProductRow[] {
  const templates = SECTOR_DEMAND_TEMPLATES[cell.sector_key] ?? FALLBACK_DEMAND;
  return scaleProducts(templates, cell.us_import_volume_usd, '/yr');
}

export const SDM_PRODUCT_MIX_FOOTNOTE =
  'Top three export lines prioritize USITC/CBTPA category totals where available; remaining lines use region-appropriate country profiles. Dollar values reflect flow totals or sector export capacity — not HS-level customs lines.';

export interface SdmReciprocityContext {
  title: string;
  framework: string;
  statusLabel: string;
  eligible: boolean;
  narrative: string;
  keyNarrative: string;
  exportFileSlug: string;
}

export function getSdmReciprocityContext(cell: MatrixCell): SdmReciprocityContext {
  const isCaribbean = cell.region === 'Caribbean';
  if (isCaribbean) {
    const eligible = cell.cbtpa_eligible;
    return {
      title: 'CBI/CBTPA Reciprocal Trade Context',
      framework: 'CBI/CBTPA',
      statusLabel: eligible ? 'CBTPA Eligible' : 'CBI / MFN',
      eligible,
      narrative: `CBI and CBTPA frameworks emphasize mutually beneficial U.S.–Caribbean trade. U.S. exports to ${cell.country_name} demonstrate reciprocity and support nearshore corridor development under CBI/CARICOM preferences (petroleum excluded under HTS Ch. 27).`,
      keyNarrative:
        'CBI/CBTPA creates a two-way street — U.S. suppliers gain Caribbean market access while Caribbean exporters use preferential U.S. entry for qualifying non-petroleum goods.',
      exportFileSlug: 'cbi-reciprocity',
    };
  }
  return {
    title: 'AGOA Reauthorization Context',
    framework: 'AGOA',
    statusLabel: cell.agoa_eligible ? 'AGOA Eligible' : 'Not Eligible',
    eligible: cell.agoa_eligible,
    narrative: `AGOA's reauthorization cycle emphasizes mutually beneficial trade. U.S. exports to African markets demonstrate reciprocity and strengthen political support for the program.`,
    keyNarrative:
      'AGOA isn\'t just aid — it\'s a two-way street creating jobs in both the U.S. and Africa.',
    exportFileSlug: 'agoa-reciprocity',
  };
}

export function preferentialLabelForCell(cell: MatrixCell): string {
  if (cell.region === 'Caribbean') {
    return cell.cbtpa_eligible ? 'CBTPA eligible' : 'CBI / MFN';
  }
  return cell.agoa_eligible ? 'AGOA eligible' : 'MFN only';
}

/** Modeled import-demand index for US → Region (not dollar totals). */
export function computeCountryImportDemandScore(cell: MatrixCell): number {
  const gdpFactor = Math.min(100, Math.max(20, cell.infrastructure_score * 0.8 + 20));
  return Math.round(gdpFactor * (1 - cell.supply_score / 200));
}

export const SDM_IMPORT_NEEDS_PENDING_NOTE =
  'Country-sector import dollar breakdown pending UN Comtrade ingestion. Import demand index below is a modeled score only — not customs-line totals.';
