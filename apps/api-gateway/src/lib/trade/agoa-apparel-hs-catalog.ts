/**
 * AGOA Product Finder — HS chapters 50–63 reference catalog.
 * Classification labels only (WCO structure); trade values come from observations / Comtrade ingest.
 */

export interface AgoaHsProductEntry {
  hsCode: string;
  chapter: number;
  description: string;
  isApparelProvision: boolean;
  isAgoaSpecific: boolean;
}

/** Chapters covered by the apparel & textiles Product Finder MVP. */
export const AGOA_APPAREL_CHAPTERS = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63] as const;

export const AGOA_APPAREL_HS_CATALOG: AgoaHsProductEntry[] = [
  { hsCode: '500100', chapter: 50, description: 'Silk-worm cocoons suitable for reeling', isApparelProvision: false, isAgoaSpecific: true },
  { hsCode: '520100', chapter: 52, description: 'Cotton, not carded or combed', isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '520300', chapter: 52, description: 'Cotton, carded or combed', isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '520811', chapter: 52, description: 'Woven cotton fabric, unbleached, plain weave', isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '540710', chapter: 54, description: 'Woven synthetic filament yarn fabric', isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '550320', chapter: 55, description: 'Staple fibres of polyester, not carded or combed', isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '610910', chapter: 61, description: 'T-shirts, singlets and vests, cotton, knitted', isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '610990', chapter: 61, description: 'T-shirts, singlets and vests, other textile, knitted', isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '611020', chapter: 61, description: 'Pullovers, cardigans and similar, cotton, knitted', isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '611030', chapter: 61, description: 'Pullovers, cardigans and similar, man-made fibres, knitted', isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '620342', chapter: 62, description: "Men's trousers and shorts, cotton, not knitted", isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '620462', chapter: 62, description: "Women's trousers and shorts, cotton, not knitted", isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '620520', chapter: 62, description: "Men's shirts, cotton, not knitted", isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '620630', chapter: 62, description: "Women's blouses and shirts, cotton, not knitted", isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '620640', chapter: 62, description: "Women's blouses and shirts, man-made fibres, not knitted", isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '621142', chapter: 62, description: 'Other garments, cotton, not knitted', isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '630260', chapter: 63, description: 'Toilet and kitchen linen, of terry towelling, cotton', isApparelProvision: true, isAgoaSpecific: true },
  { hsCode: '630790', chapter: 63, description: 'Other made-up articles, including dress patterns', isApparelProvision: true, isAgoaSpecific: true },
];

export function filterAgoaHsCatalog(options: {
  chapter?: number;
  query?: string;
  apparelOnly?: boolean;
}): AgoaHsProductEntry[] {
  let rows = [...AGOA_APPAREL_HS_CATALOG];
  if (options.chapter != null) {
    rows = rows.filter((r) => r.chapter === options.chapter);
  }
  if (options.apparelOnly) {
    rows = rows.filter((r) => r.isApparelProvision);
  }
  if (options.query?.trim()) {
    const q = options.query.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.hsCode.includes(q) ||
        r.description.toLowerCase().includes(q) ||
        String(r.chapter).includes(q)
    );
  }
  return rows;
}
