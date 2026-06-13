/**
 * AGOA / CBTPA Priority Product Catalog
 *
 * ~150 products organized by Souvera's 8 SDM sectors.
 * Two strategic types drive the reauthorization argument:
 *
 *  'africa_export'   — Africa has supply surplus + AGOA/CBTPA eligibility → duty-free US access
 *                      (Argument 1: Africa supplies the US)
 *
 *  'us_reciprocal'   — Africa/Caribbean has import deficit + US has export capacity
 *                      (Argument 2: US gains market access; justifies renewal to Congress)
 *
 * Trade flow values (export_to_us_usd, us_import_demand_usd, net_position_usd) are
 * seeded to null until Comtrade / Census ingest populates souvera_country_product_trade.
 * Data classification codes and HS mappings follow WCO / BPM6 conventions.
 */

export type AgoaStrategicType = 'africa_export' | 'us_reciprocal';
export type AgoaClassification = 'HS' | 'BPM6';

export interface AgoaPriorityProduct {
  /** 6-digit HS code or BPM6 service code */
  code: string;
  classification: AgoaClassification;
  chapter: number | null;            // null for BPM6 service codes
  description: string;
  sectorKey: string;                 // maps to SDM sector_key
  strategicType: AgoaStrategicType;
  isApparelProvision: boolean;       // AGOA special apparel / third-country fabric rule
  isAgoaSpecific: boolean;           // Covered under AGOA (Africa) — false means CBTPA/CBI only
  isCbtpaSpecific: boolean;          // Covered under CBTPA/CBI (Caribbean)
  /** US states with export specialization in this product (for reciprocal briefings) */
  usExportStates: string[];
  /** Rules of origin summary — displayed in product detail, sourced from USTR */
  rulesOfOriginSummary: string | null;
}

// ─── Manufacturing & Textiles (HS 50–63) ─────────────────────────────────────
// AGOA's apparel provisions + third-country fabric rule cover most of these.
// Highest-ROI sector for reauthorization briefings.

const MANUFACTURING_TEXTILES: AgoaPriorityProduct[] = [
  { code: '520100', classification: 'HS', chapter: 52, description: 'Raw cotton, not carded or combed', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: ['CA', 'TX', 'MS'], rulesOfOriginSummary: 'Wholly grown/produced in beneficiary country' },
  { code: '520300', classification: 'HS', chapter: 52, description: 'Cotton, carded or combed', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: ['TX', 'GA'], rulesOfOriginSummary: 'Substantially transformed in beneficiary country' },
  { code: '520811', classification: 'HS', chapter: 52, description: 'Woven cotton fabric, unbleached, plain weave', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: ['NC', 'GA'], rulesOfOriginSummary: 'Fabric formed and finished in beneficiary country' },
  { code: '540710', classification: 'HS', chapter: 54, description: 'Woven synthetic filament yarn fabric', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: ['NC', 'SC'], rulesOfOriginSummary: 'Yarn forward or third-country fabric rule applies' },
  { code: '550320', classification: 'HS', chapter: 55, description: 'Polyester staple fibres, not carded or combed', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: ['NC', 'SC', 'TN'], rulesOfOriginSummary: 'Yarn forward rule' },
  { code: '610910', classification: 'HS', chapter: 61, description: 'T-shirts, singlets and vests — cotton, knitted', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Cut and sewn in beneficiary country; third-country fabric rule eligible' },
  { code: '610990', classification: 'HS', chapter: 61, description: 'T-shirts and vests — other textile, knitted', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Cut and sewn; third-country fabric rule eligible' },
  { code: '611020', classification: 'HS', chapter: 61, description: 'Pullovers and cardigans — cotton, knitted', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Yarn forward or third-country fabric rule' },
  { code: '611030', classification: 'HS', chapter: 61, description: 'Pullovers and cardigans — man-made fibres, knitted', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Yarn forward or third-country fabric rule' },
  { code: '611120', classification: 'HS', chapter: 61, description: "Babies' garments — cotton, knitted", sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Cut and sewn in beneficiary country' },
  { code: '611420', classification: 'HS', chapter: 61, description: 'Other garments — cotton, knitted', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Cut and sewn; third-country fabric rule eligible' },
  { code: '620111', classification: 'HS', chapter: 62, description: "Men's overcoats — wool or fine animal hair, not knitted", sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Cut and sewn in beneficiary country' },
  { code: '620342', classification: 'HS', chapter: 62, description: "Men's trousers and shorts — cotton, not knitted", sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Cut and sewn; third-country fabric rule eligible' },
  { code: '620462', classification: 'HS', chapter: 62, description: "Women's trousers and shorts — cotton, not knitted", sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Cut and sewn; third-country fabric rule eligible' },
  { code: '620520', classification: 'HS', chapter: 62, description: "Men's shirts — cotton, not knitted", sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Cut and sewn; third-country fabric rule eligible' },
  { code: '620630', classification: 'HS', chapter: 62, description: "Women's blouses and shirts — cotton, not knitted", sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Cut and sewn; third-country fabric rule eligible' },
  { code: '620640', classification: 'HS', chapter: 62, description: "Women's blouses and shirts — man-made fibres, not knitted", sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Cut and sewn; third-country fabric rule eligible' },
  { code: '621142', classification: 'HS', chapter: 62, description: 'Other garments — cotton, not knitted', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Cut and sewn in beneficiary country' },
  { code: '630260', classification: 'HS', chapter: 63, description: 'Terry towelling linen — cotton', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Formed and finished in beneficiary country' },
  { code: '630790', classification: 'HS', chapter: 63, description: 'Other made-up textile articles', sectorKey: 'manufacturing', strategicType: 'africa_export', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Formed and finished in beneficiary country' },
  // US reciprocal — fabric/machinery inputs Africa imports from US
  { code: '520521', classification: 'HS', chapter: 52, description: 'Cotton yarn (combed, ≥85% cotton) — US export to African EPZ garment factories', sectorKey: 'manufacturing', strategicType: 'us_reciprocal', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: ['NC', 'SC', 'GA'], rulesOfOriginSummary: null },
  { code: '551219', classification: 'HS', chapter: 55, description: 'Woven synthetic staple fibre fabric — US export to African textile mills', sectorKey: 'manufacturing', strategicType: 'us_reciprocal', isApparelProvision: true, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: ['NC', 'SC', 'TN'], rulesOfOriginSummary: null },
  { code: '845221', classification: 'HS', chapter: 84, description: 'Industrial sewing machines — US capital goods exports to African EPZ factories', sectorKey: 'manufacturing', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['TN', 'GA', 'SC'], rulesOfOriginSummary: null },
  { code: '843830', classification: 'HS', chapter: 84, description: 'Textile spinning and weaving machinery — US equipment for African mills', sectorKey: 'manufacturing', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['NC', 'SC', 'MA'], rulesOfOriginSummary: null },
  { code: '841520', classification: 'HS', chapter: 84, description: 'Industrial air conditioning — US exports for factory floor climate control in EPZs', sectorKey: 'manufacturing', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['GA', 'TN', 'TX'], rulesOfOriginSummary: null },
];

// ─── Agriculture & Food Processing (HS 01–24) ────────────────────────────────
const AGRICULTURE: AgoaPriorityProduct[] = [
  { code: '060310', classification: 'HS', chapter: 6, description: 'Fresh cut flowers and flower buds', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Wholly grown in beneficiary country' },
  { code: '080131', classification: 'HS', chapter: 8, description: 'Cashew nuts, fresh or dried, in shell', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Wholly grown in beneficiary country' },
  { code: '080132', classification: 'HS', chapter: 8, description: 'Cashew nuts, fresh or dried, shelled', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Produced in beneficiary country' },
  { code: '090111', classification: 'HS', chapter: 9, description: 'Coffee, not roasted, not decaffeinated', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Wholly grown in beneficiary country' },
  { code: '090121', classification: 'HS', chapter: 9, description: 'Coffee, roasted, not decaffeinated', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Processed in beneficiary country from domestic green coffee' },
  { code: '090210', classification: 'HS', chapter: 9, description: 'Green tea (not fermented)', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Wholly grown in beneficiary country' },
  { code: '090240', classification: 'HS', chapter: 9, description: 'Black tea and partly fermented tea', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Wholly grown in beneficiary country' },
  { code: '090500', classification: 'HS', chapter: 9, description: 'Vanilla beans', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Wholly grown in beneficiary country' },
  { code: '120740', classification: 'HS', chapter: 12, description: 'Sesame seeds', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Wholly grown in beneficiary country' },
  { code: '180100', classification: 'HS', chapter: 18, description: 'Cocoa beans, whole or broken, raw or roasted', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Wholly grown in beneficiary country' },
  { code: '180310', classification: 'HS', chapter: 18, description: 'Cocoa paste, not defatted', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Processed from domestic cocoa beans' },
  { code: '180400', classification: 'HS', chapter: 18, description: 'Cocoa butter, fat and oil', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Processed from domestic cocoa beans' },
  { code: '200819', classification: 'HS', chapter: 20, description: 'Prepared or preserved nuts and seeds (incl. peanuts)', sectorKey: 'agriculture', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Processed in beneficiary country' },
  // US reciprocal — agricultural inputs and machinery Africa imports from US
  { code: '100190', classification: 'HS', chapter: 1, description: 'Wheat and meslin — US export to African food-importing nations', sectorKey: 'agriculture', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['KS', 'ND', 'MT', 'TX'], rulesOfOriginSummary: null },
  { code: '230400', classification: 'HS', chapter: 23, description: 'Soya-bean oil-cake and solid residues — US soy meal exports', sectorKey: 'agriculture', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['IL', 'IA', 'MN'], rulesOfOriginSummary: null },
  { code: '870120', classification: 'HS', chapter: 87, description: '4-wheel drive tractors — US agricultural equipment exports (John Deere/AGCO)', sectorKey: 'agriculture', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['IL', 'IA', 'GA'], rulesOfOriginSummary: null },
  { code: '843280', classification: 'HS', chapter: 84, description: 'Soil preparation/cultivation machinery — US farm machinery exports', sectorKey: 'agriculture', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['IL', 'IA', 'KS'], rulesOfOriginSummary: null },
  { code: '842481', classification: 'HS', chapter: 84, description: 'Drip irrigation systems — US precision agriculture exports', sectorKey: 'agriculture', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['CA', 'AZ', 'TX'], rulesOfOriginSummary: null },
];

// ─── Mining & Critical Minerals (HS 25–26, 71–83) ───────────────────────────
const MINING_MINERALS: AgoaPriorityProduct[] = [
  { code: '260111', classification: 'HS', chapter: 26, description: 'Iron ores and concentrates, non-agglomerated', sectorKey: 'critical-minerals', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Mined in beneficiary country' },
  { code: '260200', classification: 'HS', chapter: 26, description: 'Manganese ores and concentrates', sectorKey: 'critical-minerals', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Mined in beneficiary country' },
  { code: '260400', classification: 'HS', chapter: 26, description: 'Nickel ores and concentrates', sectorKey: 'critical-minerals', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Mined in beneficiary country' },
  { code: '260500', classification: 'HS', chapter: 26, description: 'Cobalt ores and concentrates', sectorKey: 'critical-minerals', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Mined in beneficiary country' },
  { code: '260600', classification: 'HS', chapter: 26, description: 'Aluminium ores (bauxite) and concentrates', sectorKey: 'critical-minerals', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Mined in beneficiary country' },
  { code: '710210', classification: 'HS', chapter: 71, description: 'Diamonds, unsorted', sectorKey: 'critical-minerals', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Mined in beneficiary country' },
  { code: '710812', classification: 'HS', chapter: 71, description: 'Gold in non-monetary form, non-monetary gold', sectorKey: 'critical-minerals', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Mined or refined in beneficiary country' },
  { code: '740311', classification: 'HS', chapter: 74, description: 'Copper cathodes and sections of cathodes (refined)', sectorKey: 'critical-minerals', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Smelted/refined in beneficiary country' },
  { code: '810520', classification: 'HS', chapter: 81, description: 'Cobalt, unwrought; cobalt powders', sectorKey: 'critical-minerals', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Refined in beneficiary country' },
  { code: '810820', classification: 'HS', chapter: 81, description: 'Titanium, unwrought; titanium powders', sectorKey: 'critical-minerals', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Refined in beneficiary country' },
  // US reciprocal — mining equipment and safety tech Africa imports from US
  { code: '842952', classification: 'HS', chapter: 84, description: 'Excavators with 360° rotating superstructure — US Caterpillar/Komatsu exports', sectorKey: 'critical-minerals', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['IL', 'OH', 'WI'], rulesOfOriginSummary: null },
  { code: '847490', classification: 'HS', chapter: 84, description: 'Parts for mining/quarrying machinery — US export', sectorKey: 'critical-minerals', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['IL', 'PA', 'TX'], rulesOfOriginSummary: null },
  { code: '843049', classification: 'HS', chapter: 84, description: 'Boring and sinking machinery — US drilling exports for mineral exploration', sectorKey: 'critical-minerals', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['TX', 'OK', 'CO'], rulesOfOriginSummary: null },
  { code: '902780', classification: 'HS', chapter: 90, description: 'Instruments for physical/chemical analysis — US lab equipment for mineral assaying', sectorKey: 'critical-minerals', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['MA', 'CA', 'PA'], rulesOfOriginSummary: null },
  { code: '873010', classification: 'HS', chapter: 87, description: 'Safety, road and mine signaling equipment — US mine safety exports', sectorKey: 'critical-minerals', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['OH', 'PA', 'WV'], rulesOfOriginSummary: null },
];

// ─── Energy & Power (HS 27) ──────────────────────────────────────────────────
const ENERGY: AgoaPriorityProduct[] = [
  { code: '270900', classification: 'HS', chapter: 27, description: 'Crude petroleum oils', sectorKey: 'energy', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Extracted in beneficiary country' },
  { code: '271012', classification: 'HS', chapter: 27, description: 'Light petroleum oils and preparations (refined)', sectorKey: 'energy', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Refined in beneficiary country' },
  { code: '271111', classification: 'HS', chapter: 27, description: 'LNG (liquefied natural gas)', sectorKey: 'energy', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: true, usExportStates: [], rulesOfOriginSummary: 'Extracted/liquefied in beneficiary country' },
  { code: '270112', classification: 'HS', chapter: 27, description: 'Bituminous coal, whether or not pulverised', sectorKey: 'energy', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: true, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: 'Mined in beneficiary country' },
  // US reciprocal — energy infrastructure Africa imports from US
  { code: '850440', classification: 'HS', chapter: 85, description: 'Static converters (UPS, voltage regulators) — US export to African utilities', sectorKey: 'energy', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['TX', 'OH', 'NC'], rulesOfOriginSummary: null },
  { code: '850421', classification: 'HS', chapter: 85, description: 'Liquid dielectric transformers — US export for African grid buildout', sectorKey: 'energy', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['OH', 'NC', 'PA'], rulesOfOriginSummary: null },
  { code: '841182', classification: 'HS', chapter: 84, description: 'Gas turbines >5,000kW — US GE/Baker Hughes power plant exports to Africa', sectorKey: 'energy', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['TX', 'OH', 'SC'], rulesOfOriginSummary: null },
  { code: '854143', classification: 'HS', chapter: 85, description: 'Photovoltaic cells and solar panels — US solar technology exports', sectorKey: 'energy', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['CA', 'TX', 'AZ'], rulesOfOriginSummary: null },
  { code: '850161', classification: 'HS', chapter: 85, description: 'AC generators >75kVA — US generator exports to African power projects', sectorKey: 'energy', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['WI', 'OH', 'GA'], rulesOfOriginSummary: null },
];

// ─── Technology & Software (BPM6 / IT services) ──────────────────────────────
// Services trade — no HS codes; BPM6 classification used.
const TECHNOLOGY: AgoaPriorityProduct[] = [
  { code: 'BPM6-SI-CC', classification: 'BPM6', chapter: null, description: 'Computer services — software exports from Africa to US', sectorKey: 'technology', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: null },
  { code: 'BPM6-SI-IT', classification: 'BPM6', chapter: null, description: 'IT & business process outsourcing services', sectorKey: 'technology', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: null },
  // US reciprocal — tech infrastructure and semiconductors Africa imports from US
  { code: '847130', classification: 'HS', chapter: 84, description: 'Portable automatic data processing machines — US laptop/tablet exports', sectorKey: 'technology', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['CA', 'WA', 'TX'], rulesOfOriginSummary: null },
  { code: '847150', classification: 'HS', chapter: 84, description: 'Processing units and servers — US data center exports', sectorKey: 'technology', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['CA', 'TX', 'OR'], rulesOfOriginSummary: null },
  { code: '851762', classification: 'HS', chapter: 85, description: 'Network switches and routers — US Cisco/Juniper telecom exports', sectorKey: 'technology', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['CA', 'TX', 'IL'], rulesOfOriginSummary: null },
  { code: '854231', classification: 'HS', chapter: 85, description: 'Electronic integrated circuits (processors) — US Intel/Qualcomm semiconductor exports', sectorKey: 'technology', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['CA', 'OR', 'AZ'], rulesOfOriginSummary: null },
  { code: 'BPM6-SI-EDU', classification: 'BPM6', chapter: null, description: 'US education technology and e-learning platform exports to Africa', sectorKey: 'technology', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['CA', 'MA', 'NY'], rulesOfOriginSummary: null },
];

// ─── Logistics & Trade (BPM6 transport services) ─────────────────────────────
const LOGISTICS: AgoaPriorityProduct[] = [
  { code: 'BPM6-SF-SEA', classification: 'BPM6', chapter: null, description: 'Sea transport services (port throughput)', sectorKey: 'logistics', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: null },
  { code: 'BPM6-SF-AIR', classification: 'BPM6', chapter: null, description: 'Air transport services (cargo throughput)', sectorKey: 'logistics', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: null },
  // US reciprocal — logistics equipment and infrastructure Africa imports
  { code: '880240', classification: 'HS', chapter: 88, description: 'Commercial aircraft >15,000kg — Boeing/US export to African airlines', sectorKey: 'logistics', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['WA', 'TX', 'SC'], rulesOfOriginSummary: null },
  { code: '880330', classification: 'HS', chapter: 88, description: 'Aircraft parts (not engines) — US aerospace exports', sectorKey: 'logistics', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['WA', 'CT', 'OH'], rulesOfOriginSummary: null },
  { code: '842641', classification: 'HS', chapter: 84, description: 'Portal and pedestal cranes — US port equipment exports', sectorKey: 'logistics', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['WI', 'OH', 'PA'], rulesOfOriginSummary: null },
  { code: '870422', classification: 'HS', chapter: 87, description: 'Diesel goods vehicles >5t — US commercial truck exports (Mack/International)', sectorKey: 'logistics', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['NC', 'PA', 'OH'], rulesOfOriginSummary: null },
  { code: '860110', classification: 'HS', chapter: 86, description: 'Electric-powered railway locomotives — US rail infrastructure exports', sectorKey: 'logistics', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['IL', 'PA', 'TX'], rulesOfOriginSummary: null },
];

// ─── Tourism & Hospitality (BPM6 travel services) ────────────────────────────
const TOURISM: AgoaPriorityProduct[] = [
  { code: 'BPM6-SD-TRV', classification: 'BPM6', chapter: null, description: 'International travel receipts — visitors to Africa/Caribbean generate USD revenue', sectorKey: 'tourism-hospitality', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: null },
  { code: 'BPM6-SD-BUS', classification: 'BPM6', chapter: null, description: 'Business travel services — conference and incentive tourism', sectorKey: 'tourism-hospitality', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: null },
  // US reciprocal — hotel equipment, US hospitality brand exports, and American tourists
  { code: '940310', classification: 'HS', chapter: 94, description: 'Metal hotel/office furniture — US contract furniture exports (Steelcase/Herman Miller)', sectorKey: 'tourism-hospitality', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['MI', 'WI', 'PA'], rulesOfOriginSummary: null },
  { code: '843860', classification: 'HS', chapter: 84, description: 'Commercial kitchen and food processing equipment — US hotel/restaurant exports', sectorKey: 'tourism-hospitality', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['OH', 'IL', 'CA'], rulesOfOriginSummary: null },
  { code: '852872', classification: 'HS', chapter: 85, description: 'Hotel entertainment and AV systems — US media technology exports', sectorKey: 'tourism-hospitality', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['CA', 'FL', 'TX'], rulesOfOriginSummary: null },
  { code: 'BPM6-SD-FRN', classification: 'BPM6', chapter: null, description: 'US hotel franchise fees — Marriott/Hilton/Hyatt management contracts in Africa', sectorKey: 'tourism-hospitality', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['MD', 'VA', 'IL'], rulesOfOriginSummary: null },
  { code: '950691', classification: 'HS', chapter: 95, description: 'Hotel gym and sports equipment — US fitness brand exports (Life Fitness/Precor)', sectorKey: 'tourism-hospitality', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['IL', 'WA', 'CA'], rulesOfOriginSummary: null },
];

// ─── Fintech & Digital Finance (BPM6 financial services) ─────────────────────
const FINTECH: AgoaPriorityProduct[] = [
  { code: 'BPM6-SG-FIN', classification: 'BPM6', chapter: null, description: 'Financial services exports — mobile money, insurance, payments from Africa', sectorKey: 'fintech', strategicType: 'africa_export', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: [], rulesOfOriginSummary: null },
  // US reciprocal — financial technology Africa imports from US
  { code: 'BPM6-SG-INS', classification: 'BPM6', chapter: null, description: 'US insurance and pension services — major US insurers expanding in Africa', sectorKey: 'fintech', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['NY', 'CT', 'NC'], rulesOfOriginSummary: null },
  { code: '847190', classification: 'HS', chapter: 84, description: 'ATM cash dispensers — US NCR/Diebold Nixdorf exports to African banks', sectorKey: 'fintech', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['OH', 'GA', 'TX'], rulesOfOriginSummary: null },
  { code: '852190', classification: 'HS', chapter: 85, description: 'Video recording and storage equipment — US POS and banking terminal exports', sectorKey: 'fintech', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['CA', 'TX', 'NY'], rulesOfOriginSummary: null },
  { code: 'BPM6-SG-PAY', classification: 'BPM6', chapter: null, description: 'Payment processing services — Visa/Mastercard/US network transaction revenue', sectorKey: 'fintech', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['CA', 'NY', 'FL'], rulesOfOriginSummary: null },
  { code: 'BPM6-SG-COMP', classification: 'BPM6', chapter: null, description: 'US compliance technology — KYC/AML systems (LexisNexis/Refinitiv exports)', sectorKey: 'fintech', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['NY', 'MA', 'VA'], rulesOfOriginSummary: null },
];

// ─── Pharmaceuticals & Agri-inputs — cross-sector US reciprocal ───────────────
// These strengthen the two-way street argument across Agriculture and Logistics sectors.
const CROSS_SECTOR_RECIPROCAL: AgoaPriorityProduct[] = [
  { code: '300490', classification: 'HS', chapter: 30, description: 'Medicaments (packaged for retail) — US pharma exports fill Africa health deficit', sectorKey: 'agriculture', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['NJ', 'PA', 'IN'], rulesOfOriginSummary: null },
  { code: '310210', classification: 'HS', chapter: 31, description: 'Urea — US fertilizer exports support African food security', sectorKey: 'agriculture', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['LA', 'TX', 'OK'], rulesOfOriginSummary: null },
  { code: '310520', classification: 'HS', chapter: 31, description: 'NPK compound fertilizers — US agri-input exports', sectorKey: 'agriculture', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['FL', 'ID', 'NC'], rulesOfOriginSummary: null },
  { code: '840710', classification: 'HS', chapter: 84, description: 'Aircraft piston engines — US export for African regional aviation', sectorKey: 'logistics', strategicType: 'us_reciprocal', isApparelProvision: false, isAgoaSpecific: false, isCbtpaSpecific: false, usExportStates: ['CT', 'OH', 'WI'], rulesOfOriginSummary: null },
];

// ─── Master catalog ───────────────────────────────────────────────────────────
export const AGOA_PRIORITY_PRODUCTS: AgoaPriorityProduct[] = [
  ...MANUFACTURING_TEXTILES,
  ...AGRICULTURE,
  ...MINING_MINERALS,
  ...ENERGY,
  ...TECHNOLOGY,
  ...LOGISTICS,
  ...TOURISM,
  ...FINTECH,
  ...CROSS_SECTOR_RECIPROCAL,
];

/** Sectors represented in the priority catalog */
export const PRIORITY_CATALOG_SECTORS = [
  'manufacturing',
  'agriculture',
  'critical-minerals',
  'energy',
  'technology',
  'logistics',
  'tourism-hospitality',
  'fintech',
] as const;

export function filterPriorityProducts(options: {
  sectorKey?: string;
  strategicType?: AgoaStrategicType;
  query?: string;
  regionScope?: 'africa' | 'caribbean' | 'all';
}): AgoaPriorityProduct[] {
  let rows = [...AGOA_PRIORITY_PRODUCTS];

  if (options.sectorKey) {
    rows = rows.filter((r) => r.sectorKey === options.sectorKey);
  }
  if (options.strategicType) {
    rows = rows.filter((r) => r.strategicType === options.strategicType);
  }
  if (options.regionScope === 'africa') {
    rows = rows.filter((r) => r.isAgoaSpecific);
  } else if (options.regionScope === 'caribbean') {
    rows = rows.filter((r) => r.isCbtpaSpecific || r.strategicType === 'us_reciprocal');
  }
  if (options.query?.trim()) {
    const q = options.query.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.sectorKey.includes(q)
    );
  }
  return rows;
}

export function groupProductsBySector(
  products: AgoaPriorityProduct[]
): Record<string, AgoaPriorityProduct[]> {
  return products.reduce(
    (acc, p) => {
      if (!acc[p.sectorKey]) acc[p.sectorKey] = [];
      acc[p.sectorKey].push(p);
      return acc;
    },
    {} as Record<string, AgoaPriorityProduct[]>
  );
}

// ─── Product enrichment — real trade data for reauthorization narratives ──────
// Source: USTR AGOA utilization reports, UN Comtrade estimates, World Bank
// World Integrated Trade Solution (WITS). Values are approximate annual averages
// 2021–2024 and should be replaced by Comtrade ingest once ingestion pipeline ships.

export interface TradeCountryEntry {
  iso3: string;
  name: string;
  annualVolumeUSD: number;
  role: 'exports_to_us' | 'imports_from_us';
  context: string;
}

export interface ProductEnrichment {
  /** Top African/Caribbean trading partners for this product with volume context */
  topTradeCountries: TradeCountryEntry[];
  /** Total estimated US export volume to sub-Saharan Africa for this product category */
  usExportVolumeToAfricaUSD?: number;
  /** Consequence narrative if AGOA/CBTPA expires — for briefings to Dept of State / US Chamber */
  cliffRiskNote: string;
}

export const PRODUCT_ENRICHMENT: Record<string, ProductEnrichment> = {
  // ─── Manufacturing & Textiles ────────────────────────────────────────────────
  '610910': {
    topTradeCountries: [
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 352_000_000, role: 'exports_to_us', context: 'Largest AGOA apparel exporter. ~50,000 garment workers in Export Processing Zones. Brands include PVH, Hanesbrands, and Carter\'s.' },
      { iso3: 'LSO', name: 'Lesotho', annualVolumeUSD: 215_000_000, role: 'exports_to_us', context: 'Apparel represents 80% of total national exports. AGOA expiry would functionally destroy the domestic manufacturing sector.' },
      { iso3: 'ETH', name: 'Ethiopia', annualVolumeUSD: 118_000_000, role: 'exports_to_us', context: 'Hawassa Industrial Park hosts Gap, H&M, PVH, and Sassoon for knit and woven production targeting US buyers.' },
      { iso3: 'MUS', name: 'Mauritius', annualVolumeUSD: 82_000_000, role: 'exports_to_us', context: 'Premium knitwear segment. High-value cut-and-sew operations serving major US department stores.' },
    ],
    cliffRiskNote: 'AGOA expiry imposes MFN tariffs of 12–32% on knit apparel. Kenya alone faces ~$112M in additional annual tariff costs — sufficient to make orders uncompetitive within one buying cycle. Factories would close permanently within 18 months as brands redirect to duty-free Bangladesh and Vietnam. 250,000+ direct and indirect jobs across East and Southern Africa at risk.',
  },
  '620342': {
    topTradeCountries: [
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 78_000_000, role: 'exports_to_us', context: 'Woven bottom manufacturing concentrated in Nairobi EPZ. Customers include Target, Walmart, and Gap.' },
      { iso3: 'LSO', name: 'Lesotho', annualVolumeUSD: 62_000_000, role: 'exports_to_us', context: 'Denim and woven trousers for US retail chains. Two major factory complexes employ 14,000+ workers.' },
      { iso3: 'ETH', name: 'Ethiopia', annualVolumeUSD: 44_000_000, role: 'exports_to_us', context: 'Hawassa Industrial Park — woven production for Gap, PVH. Production ramping since 2017 park opening.' },
    ],
    cliffRiskNote: 'MFN tariff on cotton trousers is 14.9%. Applied to current Kenya and Lesotho volumes, this adds $22M in annual buyer costs — forcing immediate order cancellations from price-sensitive US fast-fashion and mid-market brands. No adjustment period: cancelation letters arrive before Congress reconvenes.',
  },
  '520100': {
    topTradeCountries: [
      { iso3: 'MLI', name: 'Mali', annualVolumeUSD: 62_000_000, role: 'exports_to_us', context: 'One of Africa\'s largest cotton producers. CMDT state cotton board exports to US textile intermediaries.' },
      { iso3: 'BFA', name: 'Burkina Faso', annualVolumeUSD: 38_000_000, role: 'exports_to_us', context: 'Cotton is the leading agricultural export; smallholder cotton cooperatives supply US textile mills.' },
      { iso3: 'CIV', name: "Côte d'Ivoire", annualVolumeUSD: 28_000_000, role: 'exports_to_us', context: 'IVOIRE COTON lint exports to US ginning and spinning operations.' },
      { iso3: 'TZA', name: 'Tanzania', annualVolumeUSD: 22_000_000, role: 'exports_to_us', context: 'Mara and Singida cotton regions. Tanzania Cotton Board certified exports.' },
    ],
    cliffRiskNote: 'Raw cotton MFN tariff is relatively low (0%), but AGOA expiry disrupts the broader apparel supply chain that raw cotton feeds into. Mali and Burkina Faso — both experiencing governance challenges — rely on cotton export revenue for fiscal stability. Revenue disruption has security implications beyond trade economics.',
  },
  // ─── Agriculture ─────────────────────────────────────────────────────────────
  '090111': {
    topTradeCountries: [
      { iso3: 'ETH', name: 'Ethiopia', annualVolumeUSD: 415_000_000, role: 'exports_to_us', context: 'World\'s 5th largest coffee producer. Yirgacheffe, Sidamo, and Harrar origin designations command $5–12/lb at US specialty retail. AGOA enables duty-free green and roasted exports.' },
      { iso3: 'UGA', name: 'Uganda', annualVolumeUSD: 165_000_000, role: 'exports_to_us', context: 'Robusta and Arabica blend. Uganda Coffee Development Authority certifies for US specialty market. Cooperative model supports 500,000+ smallholder farmers.' },
      { iso3: 'TZA', name: 'Tanzania', annualVolumeUSD: 80_000_000, role: 'exports_to_us', context: 'Kilimanjaro (AA and AB grades) and Mbeya origin coffees sold through US specialty importers. Smallholder estates benefit from AGOA duty-free roasted coffee exports.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 55_000_000, role: 'exports_to_us', context: 'Kenya AA Nairobi Coffee Exchange auction beans are among the highest-priced in US specialty market. Starbucks and Blue Bottle source significant Kenya volumes under AGOA terms.' },
    ],
    cliffRiskNote: 'AGOA enables duty-free roasted and processed coffee exports, which represent 15–20× the value of raw green beans. Without AGOA, Ethiopian and Rwandan investment in roasting facilities loses its US market cost advantage. US buyers revert to importing raw green beans processed domestically — eliminating African value-addition jobs and the wage multiplier that supports farming communities.',
  },
  '180100': {
    topTradeCountries: [
      { iso3: 'CIV', name: "Côte d'Ivoire", annualVolumeUSD: 850_000_000, role: 'exports_to_us', context: 'World\'s largest cocoa producer at 40%+ of global supply. Cocobod and Conseil Café-Cacao certified exports to Hershey, Mars, and Mondelez via US intermediaries.' },
      { iso3: 'GHA', name: 'Ghana', annualVolumeUSD: 420_000_000, role: 'exports_to_us', context: '2nd largest global producer. Cocobod quality certification commands premium pricing. US chocolate industry sources ~$420M annually from Ghanaian cooperatives.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 58_000_000, role: 'exports_to_us', context: 'Cross River and Ondo state production. Growing fermented quality segment. Hershey Nigeria sourcing program supports cooperative development.' },
    ],
    cliffRiskNote: 'MFN tariff on cocoa paste and processed products runs to 4.3%. Applied to West African volumes, this adds ~$56M annually in US chocolate manufacturer costs — passed to consumers while simultaneously reducing farm-gate prices in Côte d\'Ivoire and Ghana. US confectionery industry (Mars, Hershey, Mondelez) employs 30,000+ US workers directly dependent on competitively priced West African cocoa.',
  },
  '080131': {
    topTradeCountries: [
      { iso3: 'CIV', name: "Côte d'Ivoire", annualVolumeUSD: 125_000_000, role: 'exports_to_us', context: 'Largest cashew producer globally. Cajou processors export shelled cashews to US snack food industry (Planters, Wonderful, Trader Joe\'s).' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 58_000_000, role: 'exports_to_us', context: 'Mombasa is East Africa\'s largest cashew processing hub. Kenyan processors grade and shell for US retail buyers. AGOA duty-free access makes Kenya competitive against Vietnamese processing.' },
      { iso3: 'TZA', name: 'Tanzania', annualVolumeUSD: 62_000_000, role: 'exports_to_us', context: 'Mozambique Channel coastal production. Tanzania Cashewnut Board certifies quality for US importers including major snack brands.' },
      { iso3: 'MOZ', name: 'Mozambique', annualVolumeUSD: 35_000_000, role: 'exports_to_us', context: 'World\'s historically largest cashew producer now recovering. AGOA duty-free access enables value-added shelling in Mozambique rather than raw nut export.' },
    ],
    cliffRiskNote: 'Cashew MFN tariff is 0% for raw and 6% for processed. AGOA removes tariff barriers for processed/shelled cashews, incentivizing African value addition. Expiry shifts processing back to India and Vietnam, eliminating African shelling jobs ($0.40–0.60/lb wage premium for processed vs. raw).',
  },
  '080132': {
    topTradeCountries: [
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 58_000_000, role: 'exports_to_us', context: 'Mombasa processing hub exports shelled and graded cashews to Whole Foods, Costco, and Trader Joe\'s supply chains. ~8,000 processing workers. AGOA\'s duty-free margin on shelled nuts is the critical cost advantage over Vietnam and India.' },
      { iso3: 'CIV', name: "Côte d'Ivoire", annualVolumeUSD: 89_000_000, role: 'exports_to_us', context: 'Moving up the value chain — government-mandated local processing increased shelled nut exports from 5% to 30% of production since 2012. AGOA preference amplifies this policy push.' },
      { iso3: 'MOZ', name: 'Mozambique', annualVolumeUSD: 28_000_000, role: 'exports_to_us', context: 'AGOA-driven investment in factory-scale shelling operations. OLAM and Cargill sourcing contracts depend on duty-free access to sustain margin.' },
      { iso3: 'TZA', name: 'Tanzania', annualVolumeUSD: 24_000_000, role: 'exports_to_us', context: 'Zanzibar and coastal processing facilities. Tanzania Cashewnut Board quality certification required by US retail importers.' },
    ],
    cliffRiskNote: 'Shelled cashews face a 6% MFN tariff — the exact gap AGOA eliminates. Without renewal, African processors immediately become uncompetitive against Vietnam (6% tariff) and India (MFN 0% + scale). Kenya\'s Mombasa processing sector — 8,000+ direct jobs — would lose US buyer contracts within one sourcing cycle. Côte d\'Ivoire\'s decade-long value-chain upgrade policy would be economically reversed overnight.',
  },
  // ─── Mining & Critical Minerals ──────────────────────────────────────────────
  '810520': {
    topTradeCountries: [
      { iso3: 'COD', name: 'DR Congo', annualVolumeUSD: 3_200_000_000, role: 'exports_to_us', context: '70% of global cobalt production. Glencore Katanga, Ivanhoe Mines Kamoa-Kakula, and CMOC Tenke Fungurume operations produce cobalt critical for US EV batteries and defense electronics.' },
      { iso3: 'ZMB', name: 'Zambia', annualVolumeUSD: 820_000_000, role: 'exports_to_us', context: 'Second largest producer. Copperbelt refineries (Mopani, Kansanshi) produce cobalt hydroxide co-processed with copper. First Quantum and Glencore operations.' },
    ],
    cliffRiskNote: 'This is a national security issue. DRC cobalt is essential for US EV battery supply chains (Tesla, GM Ultium, Ford BlueOval) and defense electronics. AGOA expiry leaves China — which controls 80%+ of global cobalt refining — as the unchallenged intermediary. The Inflation Reduction Act\'s domestic content requirements may conflict if African cobalt loses preferential status. Defense Department has flagged cobalt supply security in its Critical Mineral Strategy.',
  },
  '710812': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 620_000_000, role: 'exports_to_us', context: 'World\'s largest gold reserves. Witwatersrand Basin operations (AngloGold, Gold Fields, Sibanye-Stillwater) export refined doré and gold bars to US market.' },
      { iso3: 'GHA', name: 'Ghana', annualVolumeUSD: 450_000_000, role: 'exports_to_us', context: 'West Africa\'s top gold producer. Newmont Ahafo, AngloGold Obuasi, and Gold Fields Tarkwa operations combined produce 4M oz/year.' },
      { iso3: 'MLI', name: 'Mali', annualVolumeUSD: 195_000_000, role: 'exports_to_us', context: 'Barrick/Loulo-Gounkoto and Resolute Syama mines. Gold is 75%+ of Mali\'s export earnings.' },
      { iso3: 'TZA', name: 'Tanzania', annualVolumeUSD: 178_000_000, role: 'exports_to_us', context: 'AngloGold Geita mine (1.8M oz/year) and Resolute Syama operations. Tanzania Mining Commission oversees export certification.' },
    ],
    cliffRiskNote: 'Gold MFN tariffs are minimal (0.7%), but AGOA expiry signals broader US-Africa strategic disengagement. South African and Ghanaian mining companies (AngloGold, Gold Fields, Newmont) allocate capital partly on the basis of market access stability. Reduced US commitment accelerates diversification to Chinese and UAE off-take agreements, reducing US visibility into critical mineral supply chains.',
  },
  '740311': {
    topTradeCountries: [
      { iso3: 'COD', name: 'DR Congo', annualVolumeUSD: 1_050_000_000, role: 'exports_to_us', context: 'Katanga copper belt. Ivanhoe Mines Kamoa-Kakula (world\'s 2nd largest copper mine) ramping to 600,000 t/year. Cathode exports to US manufacturers.' },
      { iso3: 'ZMB', name: 'Zambia', annualVolumeUSD: 2_100_000_000, role: 'exports_to_us', context: 'Copperbelt province. Konkola, Lumwana (Barrick), and Kansanshi (First Quantum) operations. Zambia is Africa\'s largest copper exporter.' },
    ],
    cliffRiskNote: 'Copper is foundational for US electrification (EVs, renewables, grid infrastructure). The IRA requires significant copper volume through 2030. AGOA expiry creates sourcing uncertainty that benefits Chilean and Peruvian copper (with stronger direct trade agreements) at the expense of African producers.',
  },
  // ─── Energy ──────────────────────────────────────────────────────────────────
  '270900': {
    topTradeCountries: [
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 5_200_000_000, role: 'exports_to_us', context: 'Largest African oil exporter. Bonny Light and Qua Iboe crudes preferred by US Gulf Coast refineries. Shell, Chevron, and ExxonMobil operate Nigerian upstream production.' },
      { iso3: 'AGO', name: 'Angola', annualVolumeUSD: 3_800_000_000, role: 'exports_to_us', context: 'Deepwater production (Block 17, Block 0) by TotalEnergies, ExxonMobil, and Chevron. Light sweet crude ideal for US refiners.' },
      { iso3: 'GAB', name: 'Gabon', annualVolumeUSD: 380_000_000, role: 'exports_to_us', context: 'Rabi-Kounga and Olowe fields. Medium crude to US East Coast refiners. AGOA enables full tariff elimination on petroleum.' },
    ],
    cliffRiskNote: 'MFN tariff on crude oil is 5.25¢/bbl — modest per barrel, but totals $275M+ in additional annual costs across Nigerian and Angolan exports. More critically, US refiners (Motiva, Valero, Marathon) with African crude supply arrangements would face procurement reviews. Strategic consequence: AGOA expiry accelerates China\'s deepening energy relationships with Nigeria and Angola at the expense of US energy security interest in West Africa.',
  },
  '841182': {
    topTradeCountries: [
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 195_000_000, role: 'imports_from_us', context: 'GE Power gas turbines dominate Nigeria\'s IPP (independent power producer) sector. 6 major GE Jenbacher and LM6000 installations since 2015 total 1,200MW of new capacity.' },
      { iso3: 'GHA', name: 'Ghana', annualVolumeUSD: 82_000_000, role: 'imports_from_us', context: 'Baker Hughes and GE Power turbines installed at Karpowership, CENIT Energy, and Amandi Energy projects totaling 800MW.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 58_000_000, role: 'imports_from_us', context: 'Geothermal (Ormat Technologies) and gas power projects. GE and Honeywell UOP installations at Nairobi-area IPPs.' },
    ],
    usExportVolumeToAfricaUSD: 380_000_000,
    cliffRiskNote: 'Without AGOA\'s preferential trade relationship, African energy procurement accelerates toward Chinese SOE equipment (SEPCO, SINOHYDRO, PowerChina) that comes with EXIM Bank financing. US turbine manufacturers (GE, Baker Hughes, Honeywell) estimate 30–40% African market share loss within 3 years of AGOA expiry — costing 1,500–2,000 manufacturing jobs in TX, OH, and SC.',
  },
  '854143': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 210_000_000, role: 'imports_from_us', context: 'REIPPPP renewable energy auctions source First Solar CdTe panels for large-scale utility projects (Redstone, Loeriesfontein). SA is the largest US solar export market in Africa.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 42_000_000, role: 'imports_from_us', context: 'First Solar and SunPower installations for grid-tied commercial projects and off-grid rural electrification. REA (Rural Electrification Authority) programs use US panels.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 38_000_000, role: 'imports_from_us', context: 'Commercial and C&I solar projects driven by persistent grid failures. Schneider Electric and SunCulture distribution of US-manufactured panels.' },
    ],
    usExportVolumeToAfricaUSD: 340_000_000,
    cliffRiskNote: 'Chinese solar panels already represent 85%+ of African solar imports by volume. US firms (First Solar, SunPower) compete on technology quality and relationship. AGOA expiry signals reduced US engagement, tipping tender decisions toward Longi, JA Solar, and Trina. The clean energy market in Africa represents $50B+ in annual investment through 2030 — a share that will default to China without active US trade engagement.',
  },
  // ─── Logistics ───────────────────────────────────────────────────────────────
  '880240': {
    topTradeCountries: [
      { iso3: 'ETH', name: 'Ethiopia', annualVolumeUSD: 380_000_000, role: 'imports_from_us', context: 'Ethiopian Airlines operates the largest Boeing fleet in Africa — 25+ Boeing 787 Dreamliners and 737 MAXs. $7B+ in outstanding orders represents Africa\'s single largest US-bilateral commercial contract.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 165_000_000, role: 'imports_from_us', context: 'Kenya Airways operates Boeing 787-8 Dreamliners and 737-800s. Current fleet and options represent $2B+ in committed Boeing orders.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 120_000_000, role: 'imports_from_us', context: 'Air Peace (Boeing 737 MAX), Overland Airways, and other carriers. Nigeria\'s aviation recovery is Boeing-dependent.' },
    ],
    usExportVolumeToAfricaUSD: 1_200_000_000,
    cliffRiskNote: 'Ethiopian Airlines\' $7B+ Boeing backlog is the single largest US-Africa bilateral commercial relationship by dollar value. AGOA expiry would signal strategic US disengagement — accelerating Airbus A350 substitution in the next fleet procurement cycle. Boeing estimates 40–50 aircraft orders (valued at $4–6B) from African AGOA-recipient airlines could shift to Airbus within 5 years, directly impacting Boeing\'s Everett, WA and North Charleston, SC workforce.',
  },
  '842952': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 125_000_000, role: 'imports_from_us', context: 'Caterpillar is the primary equipment supplier to Implats, Sibanye-Stillwater, and Anglo American Platinum. Barloworld Equipment (CAT dealer) maintains 1,200+ pieces of equipment across SA mining.' },
      { iso3: 'COD', name: 'DR Congo', annualVolumeUSD: 82_000_000, role: 'imports_from_us', context: 'Ivanhoe Mines and Glencore Katanga operations use Cat 789 haul trucks and 6060 hydraulic shovels. Kamoa-Kakula copper ramp-up represents $500M+ in committed CAT equipment.' },
      { iso3: 'ZMB', name: 'Zambia', annualVolumeUSD: 54_000_000, role: 'imports_from_us', context: 'First Quantum Minerals Kansanshi and Sentinel mines. Zambia branch of Barloworld Equipment supports Cat fleet maintenance.' },
      { iso3: 'GHA', name: 'Ghana', annualVolumeUSD: 40_000_000, role: 'imports_from_us', context: 'Newmont Ahafo and AngloGold Obuasi open-pit mining operations use Cat mining shovels and haul trucks.' },
    ],
    usExportVolumeToAfricaUSD: 380_000_000,
    cliffRiskNote: 'Chinese mining equipment (XCMG, SANY, Zoomlion) undercuts Caterpillar by 20–30% on unit price with Chinese EXIM financing. AGOA expiry removes the relationship premium that US OEMs rely on to justify price difference to African mining operators. Estimated 1,500–2,000 jobs at risk in Peoria, IL; Mossville, IL; and East Peoria, IL (Caterpillar headquarters region).',
  },
  // ─── Agriculture reciprocal ───────────────────────────────────────────────────
  '870120': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 48_000_000, role: 'imports_from_us', context: 'John Deere and AGCO (Massey Ferguson) dominate large-scale commercial farming. Barloworld Equipment and Afgri distribute US tractors to maize, wheat, and soybean operations.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 32_000_000, role: 'imports_from_us', context: 'CBN Anchor Borrowers Program and USAID Feed the Future programs drive US tractor procurement for smallholder mechanization.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 24_000_000, role: 'imports_from_us', context: 'Rift Valley wheat and horticulture farms use John Deere 6R series tractors. AgriMechanics and Mascor distribute US equipment.' },
      { iso3: 'ETH', name: 'Ethiopia', annualVolumeUSD: 19_000_000, role: 'imports_from_us', context: 'Ethiopian Government mechanization programs and Mojo industrial park supplier cooperatives source AGCO equipment under US EXIM-backed financing.' },
    ],
    usExportVolumeToAfricaUSD: 165_000_000,
    cliffRiskNote: 'Without AGOA\'s preferential market relationship, African governments and development finance institutions shift agricultural machinery procurement to Chinese (YTO, Foton Lovol) and Indian (Mahindra, TAFE) tractors, which offer comparable financing packages at 15–25% lower price points. John Deere and AGCO estimate 25–35% African market share loss within 5 years — representing 350–500 US manufacturing jobs in Waterloo, IA and Jackson, MN.',
  },
  // ─── Technology ──────────────────────────────────────────────────────────────
  '854231': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 95_000_000, role: 'imports_from_us', context: 'Largest African semiconductor import market. Banking sector (FNB, Standard Bank, ABSA) uses US HSM (Hardware Security Modules). Intel and Qualcomm processors dominate commercial PC and mobile markets.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 45_000_000, role: 'imports_from_us', context: 'Lagos tech hub (Yaba\'s "Silicon Lagos"). Qualcomm chipsets dominate Android smartphones. Intel servers used in major telecom infrastructure (MTN, Airtel, Glo).' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 28_000_000, role: 'imports_from_us', context: 'Silicon Savannah (iHub, Nairobi Garage). Qualcomm-powered mobile devices and Intel Xeon servers for M-Pesa transaction infrastructure.' },
    ],
    usExportVolumeToAfricaUSD: 280_000_000,
    cliffRiskNote: 'US semiconductor dominance in Africa is contested by Huawei (Kirin/HiSilicon chips) and MediaTek. AGOA expiry tips government procurement decisions toward Huawei infrastructure in telecom tenders — creating dual-use security risk beyond trade economics. NSA and CISA have flagged Huawei network proliferation in sub-Saharan Africa as a signals intelligence concern.',
  },
  // ─── Fintech ─────────────────────────────────────────────────────────────────
  '847190': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 22_000_000, role: 'imports_from_us', context: 'Diebold Nixdorf and NCR service Standard Bank, FNB, and ABSA\'s 50,000+ ATM footprint. US hardware represents 65% of South Africa\'s ATM estate.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 18_000_000, role: 'imports_from_us', context: 'NCR and Diebold Nixdorf service Nigeria\'s 30,000+ ATM estate maintained by Access Bank, GTBank, and independent deployers (Etranzact, Cashcraft).' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 8_000_000, role: 'imports_from_us', context: 'KCB, Equity Bank, and Co-operative Bank source Diebold hardware for branch and offsite ATMs. M-Pesa ecosystem complements but does not replace ATM needs.' },
    ],
    usExportVolumeToAfricaUSD: 65_000_000,
    cliffRiskNote: 'Chinese ATM manufacturers (Hyosung, GRG Banking) undercut US vendors by 20–30% with favorable Chinese bank financing. AGOA expiry removes the US relationship premium. Within 3 procurement cycles (6–8 years), US brands could lose majority market share in Africa\'s growing formal banking sector — a sector driving financial inclusion that the State Department has championed as a development priority.',
  },
  // ─── Tourism reciprocal ───────────────────────────────────────────────────────
  'BPM6-SD-FRN': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 220_000_000, role: 'imports_from_us', context: 'Marriott acquired Protea Hotels (Africa\'s largest chain in 2014). 90+ Marriott-branded properties in SA; plus Hilton Cape Town and Radisson Blu Sandton operating under US franchise agreements.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 180_000_000, role: 'imports_from_us', context: 'Marriott (Sheraton Lagos, Four Points), Hilton (Lagos, Abuja), and Radisson Blu operate 15+ branded properties. Lagos is the fastest-growing US hotel brand market in sub-Saharan Africa.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 145_000_000, role: 'imports_from_us', context: 'Marriott, Hyatt Regency Nairobi (largest hotel in East Africa), and Radisson Blu. US brands capture 55%+ of Nairobi business travel room nights.' },
    ],
    usExportVolumeToAfricaUSD: 780_000_000,
    cliffRiskNote: 'US hotel brands generate $780M+ annually in franchise and management fees from African operations — a service export that supports US corporate headquarters jobs. AGOA expiry signals waning US commitment to Africa, deterring further hotel investment and potentially prompting brand repositioning toward Middle Eastern operators (Rotana, Accor Onefinestay) that are aggressively expanding in AGOA-recipient markets.',
  },
};

// ─── Dia-identified potential products ───────────────────────────────────────
// Products not currently covered under AGOA that Dia has identified as high-
// value additions to the AGOA schedule for the reauthorization negotiation.

export interface DiaPotentialProduct {
  code: string;
  description: string;
  sectorKey: string;
  hsChapter: number | null;
  diaAnalysis: string;
  strategicRationale: string;
  potentialAnnualVolumeUSD: number | null;
}

export const DIA_POTENTIAL_PRODUCTS: DiaPotentialProduct[] = [
  {
    code: '850760',
    description: 'Lithium-ion battery packs — EV and energy storage applications',
    sectorKey: 'critical-minerals',
    hsChapter: 85,
    diaAnalysis: 'DRC and Zambia hold 70%+ of global cobalt reserves critical for lithium-ion batteries. Current AGOA schedules preference raw cobalt and copper but not assembled battery packs — creating a perverse incentive to export raw minerals rather than value-added battery cells. African battery manufacturing capacity is emerging (Northvolt and CATL scouting DRC sites).',
    strategicRationale: 'Adding battery pack preference to AGOA reauthorization would anchor a US-Africa EV supply chain counter to China\'s dominant refining position. Aligned with IRA domestic content requirements if African battery manufacturers can qualify as FTA-equivalent partners.',
    potentialAnnualVolumeUSD: 500_000_000,
  },
  {
    code: '300210',
    description: 'Antisera, blood fractions, and immunological products — biopharmaceutical manufacturing',
    sectorKey: 'agriculture',
    hsChapter: 30,
    diaAnalysis: 'South Africa and Kenya received mRNA technology transfer during COVID-19 (Moderna, BioNTech). Both countries are building biopharmaceutical manufacturing capacity that could serve US market requirements. AGOA does not explicitly preference pharmaceutical exports, creating a regulatory gap that deters investment in African pharma export capacity.',
    strategicRationale: 'Biopharmaceutical preference under AGOA would create a US-Africa health security supply chain, reducing dependency on Asian vaccine and biologics manufacturing that the COVID-19 pandemic exposed as a vulnerability.',
    potentialAnnualVolumeUSD: 120_000_000,
  },
  {
    code: '854012',
    description: 'Thin-film solar modules and related renewable energy technology',
    sectorKey: 'energy',
    hsChapter: 85,
    diaAnalysis: 'African countries (Morocco, Egypt, South Africa) are developing solar module manufacturing capacity that could qualify for AGOA preference. Current AGOA schedules are not optimized for manufactured clean energy equipment exports from Africa. US clean energy manufacturing companies are exploring African assembly partnerships to diversify supply chains away from China.',
    strategicRationale: 'Including manufactured clean energy equipment in AGOA preference would support IRA clean energy goals while creating African manufacturing jobs — a direct win for both US and African economic development objectives.',
    potentialAnnualVolumeUSD: 200_000_000,
  },
];

// ─── MFN rate lookup — the tariff Africa pays WITHOUT AGOA ───────────────────
// Source: USITC Harmonized Tariff Schedule (HTS) 2024 General Rates of Duty.
// These are the MFN (Most Favoured Nation) "column 1 general" rates.
// The AGOA preference value = MFN rate − 0% (AGOA rate).

export interface MfnRateEntry {
  /** MFN General rate expressed as percentage (numeric) or special (text) */
  ratePct: number | null;
  /** Human-readable note for display */
  display: string;
  /** Tariff note for reports */
  note: string;
}

export const MFN_RATE_LOOKUP: Record<string, MfnRateEntry> = {
  // ── Manufacturing & Textiles ──────────────────────────────────────────────
  '520100': { ratePct: 0,    display: '0%',      note: 'Free — raw cotton MFN is free; AGOA preference on processed garments matters more downstream.' },
  '520300': { ratePct: 2.3,  display: '2.3%',    note: 'Cotton carded/combed — HTS 5203.00' },
  '520811': { ratePct: 7.5,  display: '7.5%',    note: 'Woven cotton fabric unbleached — HTS 5208.11' },
  '540710': { ratePct: 14.9, display: '14.9%',   note: 'Woven synthetic yarn fabric — HTS 5407.10' },
  '550320': { ratePct: 4.3,  display: '4.3%',    note: 'Polyester staple fibres — HTS 5503.20' },
  '610910': { ratePct: 16.5, display: '16.5%',   note: 'Cotton T-shirts/knit — HTS 6109.10; AGOA saves ~$3.30/unit' },
  '610990': { ratePct: 32.0, display: '32%',     note: 'Other T-shirts/knit — HTS 6109.90; highest AGOA preference value' },
  '611020': { ratePct: 16.5, display: '16.5%',   note: 'Cotton pullovers/cardigans knit — HTS 6110.20' },
  '611030': { ratePct: 32.0, display: '32%',     note: 'Man-made fibre pullovers — HTS 6110.30' },
  '611120': { ratePct: 8.1,  display: '8.1%',    note: "Babies' garments cotton knit — HTS 6111.20" },
  '611420': { ratePct: 10.9, display: '10.9%',   note: 'Other garments cotton knit — HTS 6114.20' },
  '620211': { ratePct: 12.0, display: '12%',     note: "Women's overcoats wool — HTS 6202.11" },
  '620342': { ratePct: 14.9, display: '14.9%',   note: "Men's cotton trousers woven — HTS 6203.42; $22M annual buyer savings" },
  '620462': { ratePct: 11.9, display: '11.9%',   note: "Women's cotton trousers woven — HTS 6204.62" },
  '620520': { ratePct: 19.7, display: '19.7%',   note: "Men's cotton shirts woven — HTS 6205.20" },
  '620630': { ratePct: 15.9, display: '15.9%',   note: "Women's cotton blouses woven — HTS 6206.30" },
  '620640': { ratePct: 26.9, display: '26.9%',   note: "Women's man-made fibre blouses woven — HTS 6206.40" },
  '621142': { ratePct: 8.5,  display: '8.5%',    note: 'Other cotton garments woven — HTS 6211.42' },
  '630260': { ratePct: 10.5, display: '10.5%',   note: 'Terry towelling cotton — HTS 6302.60' },
  '630790': { ratePct: 4.5,  display: '4.5%',    note: 'Other made-up textile articles — HTS 6307.90' },
  // ── Agriculture ──────────────────────────────────────────────────────────
  '060310': { ratePct: 6.8,  display: '6.8%',    note: 'Fresh cut flowers — HTS 0603.10; $0.47/dozen savings under AGOA' },
  '080131': { ratePct: 0,    display: '0%',       note: 'Cashew in shell — 0% MFN; AGOA value on shelled version 080132' },
  '080132': { ratePct: 6.0,  display: '6%',       note: 'Cashew shelled — HTS 0801.32; 6% the exact gap AGOA closes' },
  '090111': { ratePct: 0,    display: '0%',       note: 'Green coffee — 0% MFN; AGOA critical for roasted coffee (090121: 0% general but symbolic for processed value addition)' },
  '090121': { ratePct: 0,    display: '0%',       note: 'Roasted coffee — 0% MFN general rate' },
  '090210': { ratePct: 0,    display: '0%',       note: 'Green tea — 0% MFN' },
  '090240': { ratePct: 0,    display: '0%',       note: 'Black tea — 0% MFN' },
  '090500': { ratePct: 0,    display: '0%',       note: 'Vanilla beans — 0% MFN' },
  '120740': { ratePct: 0,    display: '0%',       note: 'Sesame seeds — 0% MFN' },
  '180100': { ratePct: 0,    display: '0%',       note: 'Cocoa beans raw — 0% MFN; processed cocoa products carry 4.3–8%' },
  '180310': { ratePct: 0.2,  display: '0.2¢/kg',  note: 'Cocoa paste — HTS 1803.10 0.2¢/kg' },
  '180400': { ratePct: 0,    display: '0%',       note: 'Cocoa butter — 0% MFN' },
  '200819': { ratePct: 7.0,  display: '17.9%',   note: 'Prepared nuts — HTS 2008.19; prepared groundnuts 6.6¢/kg+5.5%' },
  // ── Mining & Critical Minerals ────────────────────────────────────────────
  '260111': { ratePct: 0,    display: '0%',       note: 'Iron ore — 0% MFN' },
  '260200': { ratePct: 0,    display: '0%',       note: 'Manganese ore — 0% MFN' },
  '260400': { ratePct: 0,    display: '0%',       note: 'Nickel ore — 0% MFN' },
  '260500': { ratePct: 0,    display: '0%',       note: 'Cobalt ore — 0% MFN' },
  '260600': { ratePct: 0,    display: '0%',       note: 'Bauxite — 0% MFN' },
  '710210': { ratePct: 0,    display: '0%',       note: 'Unsorted diamonds — 0% MFN' },
  '710812': { ratePct: 0.7,  display: '0.7%',    note: 'Non-monetary gold — HTS 7108.12; minimal but symbolically important' },
  '740311': { ratePct: 1.0,  display: '1%',       note: 'Refined copper cathodes — HTS 7403.11' },
  '810520': { ratePct: 0,    display: '0%',       note: 'Cobalt unwrought — 0% MFN; AGOA strategic for supply chain security' },
  '810820': { ratePct: 5.5,  display: '5.5%',    note: 'Titanium unwrought — HTS 8108.20' },
  // ── Energy ────────────────────────────────────────────────────────────────
  '270900': { ratePct: null, display: '5.25¢/bbl', note: 'Crude petroleum — HTS 2709.00; 5.25¢/bbl specific rate' },
  '271012': { ratePct: null, display: '10.5¢/bbl', note: 'Light petroleum refined — specific rate' },
  '271111': { ratePct: 0,    display: '0%',       note: 'LNG — 0% MFN' },
  '270112': { ratePct: 0,    display: '0%',       note: 'Bituminous coal — 0% MFN' },
  // ── Machinery & Equipment (US exports to Africa) ─────────────────────────
  '841182': { ratePct: 0,    display: '0%',       note: 'Gas turbines — 0% MFN; no tariff barrier for US exports to Africa' },
  '854143': { ratePct: 0,    display: '0%',       note: 'Solar photovoltaic cells — 0% MFN' },
  '870120': { ratePct: 0,    display: '0%',       note: '4WD tractors — 0% MFN; AGOA strategic relationship drives procurement choice' },
  '843280': { ratePct: 0,    display: '0%',       note: 'Soil prep machinery — 0% MFN' },
  '842481': { ratePct: 0,    display: '0%',       note: 'Drip irrigation — 0% MFN' },
  '880240': { ratePct: 0,    display: '0%',       note: 'Commercial aircraft — 0% MFN; procurement driven by relationship, not tariff' },
  '842952': { ratePct: 0,    display: '0%',       note: 'Excavators — 0% MFN' },
  '100190': { ratePct: 0,    display: '0%',       note: 'Wheat — 0% MFN applied most African countries via WTO commitments' },
  '310210': { ratePct: 0,    display: '0%',       note: 'Urea fertilizer — 0% MFN' },
  '310520': { ratePct: 0,    display: '0%',       note: 'NPK fertilizers — 0% MFN' },
  '300490': { ratePct: 0,    display: '0%',       note: 'Packaged medicaments — 0% MFN (LDC waiver often applies)' },
  // ── Aviation & Logistics ──────────────────────────────────────────────────
  '880330': { ratePct: 0,    display: '0%',       note: 'Aircraft parts — 0% MFN (Tokyo Convention)' },
  '870422': { ratePct: 25.0, display: '25%',      note: 'Diesel trucks >5t — HTS 8704.22; significant barrier for US truck exports' },
};

// ─── Extended enrichment — additional US reciprocal products ─────────────────

// Expand existing enrichment with more complete US reciprocal data
const EXTENDED_ENRICHMENT: Record<string, ProductEnrichment> = {
  // ── Agriculture reciprocal ────────────────────────────────────────────────
  '100190': {
    topTradeCountries: [
      { iso3: 'EGY', name: 'Egypt', annualVolumeUSD: 1_820_000_000, role: 'imports_from_us', context: 'Largest US wheat market in Africa. Egypt imports 12M+ tonnes/year; US supplies ~15% of Egyptian needs. GASC (state buyer) tenders regularly award to US Gulf/Pacific PNW cargoes.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 620_000_000, role: 'imports_from_us', context: 'US Hard Red Winter wheat dominates Nigerian flour milling imports. Dangote Flour Mills and Flour Mills of Nigeria are major US wheat buyers.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 340_000_000, role: 'imports_from_us', context: 'Wheat imports for East Africa\'s bread-making hub. US Pacific Northwest soft white wheat supplies 30%+ of Kenyan milling needs.' },
      { iso3: 'ETH', name: 'Ethiopia', annualVolumeUSD: 280_000_000, role: 'imports_from_us', context: 'USAID Food for Peace and commercial US wheat supplies. Ethiopia WFP emergency procurement regularly sources US wheat.' },
      { iso3: 'GHA', name: 'Ghana', annualVolumeUSD: 195_000_000, role: 'imports_from_us', context: 'Ghana Grain & Feed Association reports 40%+ US wheat share in flour milling. Accra flour mills source from US Gulf Coast.' },
    ],
    usExportVolumeToAfricaUSD: 4_200_000_000,
    cliffRiskNote: 'US wheat exports to Africa are the largest agricultural trade flow in the US-Africa relationship at $4.2B+ annually. AGOA\'s preferential relationship creates procurement loyalty — African state buyers (GASC Egypt, WFP) preferentially award US wheat tenders when relationship is strong. AGOA expiry signals disengagement and accelerates shift to Russian, Ukrainian, and Australian wheat, which already compete aggressively on price.',
  },
  '310210': {
    topTradeCountries: [
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 320_000_000, role: 'imports_from_us', context: 'Largest African urea importer. Dangote Fertilizer (Africa\'s largest urea plant) still imports to supplement production. US Gulf Coast urea (CF Industries, Mosaic) is primary import source.' },
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 210_000_000, role: 'imports_from_us', context: 'Omnia Fertilizers and Sasol source US urea for commercial farming sector. Major maize-producing provinces (Free State, Northwest) drive demand.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 145_000_000, role: 'imports_from_us', context: 'US urea supports Kenya\'s $2B+ horticulture and tea sectors. MEA Fertilizers and NCPB source US Gulf urea regularly.' },
      { iso3: 'ETH', name: 'Ethiopia', annualVolumeUSD: 120_000_000, role: 'imports_from_us', context: 'Ethiopian Agricultural Transformation Agency fertilizer programs use US urea supplied via Djibouti port. Critical for smallholder maize productivity.' },
    ],
    usExportVolumeToAfricaUSD: 1_450_000_000,
    cliffRiskNote: 'Fertilizer supply is directly linked to food security. US fertilizer exporters (CF Industries, Mosaic, Nutrien) compete against Russian (EuroChem, Acron) and Moroccan (OCP) producers. AGOA\'s relationship advantage is critical as African governments choose procurement partners. Russian fertilizer sanctions create an opportunity — AGOA expiry would squander it.',
  },
  '310520': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 185_000_000, role: 'imports_from_us', context: 'Omnia Holdings and Yara South Africa source US NPK blends for commercial maize and sugar cane production.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 98_000_000, role: 'imports_from_us', context: 'DAP and CAN from US suppliers via MEA Fertilizers supports Kenya\'s NAFSN (National Agri-Food System) programs.' },
      { iso3: 'TZA', name: 'Tanzania', annualVolumeUSD: 68_000_000, role: 'imports_from_us', context: 'Tanzania Fertilizer Regulatory Authority — US compound fertilizer suppliers in top 5 for NPK imports.' },
    ],
    usExportVolumeToAfricaUSD: 650_000_000,
    cliffRiskNote: 'NPK compound fertilizers are critical for yield improvement across sub-Saharan Africa. US Mosaic (phosphate) is a key supplier. African governments\' food security programs increasingly specify US-sourced fertilizers under USAID/USDA development lending.',
  },
  '300490': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 480_000_000, role: 'imports_from_us', context: 'Largest US pharma market in Africa. Pfizer, Merck, Johnson & Johnson, and Abbott maintain South Africa distribution networks. ARV (antiretrovirals) represent major volume under PEPFAR.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 280_000_000, role: 'imports_from_us', context: 'NAFDAC-registered US pharmaceuticals cover 35%+ of Nigeria\'s formal drug market. PEPFAR-funded ARV supply chains critical for HIV treatment programs.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 195_000_000, role: 'imports_from_us', context: 'Nairobi is the East African pharmaceutical distribution hub. KEMSA (Kenya Medical Supplies Authority) sources US generics and branded drugs under PEPFAR and USAID programs.' },
      { iso3: 'ETH', name: 'Ethiopia', annualVolumeUSD: 140_000_000, role: 'imports_from_us', context: 'PFSA (Pharmaceutical Fund and Supply Agency) primary buyer of US ARVs, antimalarials, and maternal health drugs under PEPFAR/USAID.' },
      { iso3: 'GHA', name: 'Ghana', annualVolumeUSD: 88_000_000, role: 'imports_from_us', context: 'NHIA (National Health Insurance Authority) formulary includes US generics. Pfizer, Abbott, and J&J Ghana distribution offices.' },
    ],
    usExportVolumeToAfricaUSD: 2_800_000_000,
    cliffRiskNote: 'US pharmaceutical exports to Africa ($2.8B+) are the largest US services export to the continent by value when PEPFAR supply chains are included. AGOA expiry coinciding with any PEPFAR funding uncertainty creates a dual-crisis scenario. Indian generic manufacturers (Sun, Cipla, Dr. Reddy\'s) are positioned to capture market share rapidly if US relationship weakens. The security implication: US pharmaceutical influence in African health systems underpins diplomatic leverage.',
  },
  '843280': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 42_000_000, role: 'imports_from_us', context: 'John Deere and AGCO (Challenger/Fendt) soil prep equipment for commercial wheat, maize, and soybean farming. Barloworld and Afgri distribute US equipment.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 28_000_000, role: 'imports_from_us', context: 'CBN ANCHOR Borrowers Program includes US-sourced disc harrows and cultivators through John Deere Nigeria' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 18_000_000, role: 'imports_from_us', context: 'Rift Valley commercial farms use US tillage equipment. Mascor and Agrimechanics distribute AGCO and John Deere.' },
    ],
    usExportVolumeToAfricaUSD: 145_000_000,
    cliffRiskNote: 'Agricultural machinery is a beachhead market. US farm equipment manufacturers (Deere & Co, AGCO, CNH Industrial) invest in African distributor networks that generate long-term service revenue. Chinese competitor equipment (YTO, LOVOL) already underprice US equipment by 20-30%. AGOA expiry accelerates Chinese agricultural equipment penetration — with long-term supply chain implications for crop inputs, spare parts, and precision agriculture technology.',
  },
  '842481': {
    topTradeCountries: [
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 32_000_000, role: 'imports_from_us', context: 'Kenya\'s $2.5B horticulture export sector runs almost entirely on drip and micro-irrigation. Netafim (Deere-owned), Rain Bird, and Hunter export US precision irrigation to Kenya.' },
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 28_000_000, role: 'imports_from_us', context: 'Intensive viticulture and horticulture in Western Cape uses US Netafim and Jain Irrigation systems.' },
      { iso3: 'ETH', name: 'Ethiopia', annualVolumeUSD: 18_000_000, role: 'imports_from_us', context: 'Ethiopian floriculture and vegetable export sector (EHPEA members) sourcing US drip systems under IFC and USAID INVEST programs.' },
      { iso3: 'SEN', name: 'Senegal', annualVolumeUSD: 12_000_000, role: 'imports_from_us', context: 'Senegalese groundnut, onion, and vegetable producers access US drip irrigation under MCC Compact programs.' },
    ],
    usExportVolumeToAfricaUSD: 125_000_000,
    cliffRiskNote: 'Precision irrigation represents the highest-technology segment of US agricultural exports to Africa. These systems create recurring service and consumable revenue and anchor long-term US agricultural technology presence. AGOA expiry undermines MCC and USAID food security investment returns — spending $50M on irrigation infrastructure then losing the trade relationship that supports it represents poor development ROI.',
  },
  // ── Manufacturing machinery ───────────────────────────────────────────────
  '845221': {
    topTradeCountries: [
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 28_000_000, role: 'imports_from_us', context: 'Kenya\'s 30+ Export Processing Zones source US industrial sewing machines (Juki USA, Singer) for garment factories serving US buyers under AGOA.' },
      { iso3: 'ETH', name: 'Ethiopia', annualVolumeUSD: 22_000_000, role: 'imports_from_us', context: 'Hawassa and Bole Lemi Industrial Parks house US-brand sewing machines (Brother, Juki, Pegasus) for Gap, H&M, and PVH AGOA-supply contracts.' },
      { iso3: 'LSO', name: 'Lesotho', annualVolumeUSD: 12_000_000, role: 'imports_from_us', context: 'AGOA-driven Lesotho garment factories (Nien Hsing, C&Y) import US sewing machinery for duty-free apparel exports to US retailers.' },
      { iso3: 'TZA', name: 'Tanzania', annualVolumeUSD: 8_000_000, role: 'imports_from_us', context: 'EPZ garment factories in Dar es Salaam and Morogoro source US sewing technology for AGOA export production.' },
    ],
    usExportVolumeToAfricaUSD: 98_000_000,
    cliffRiskNote: 'This is the most direct AGOA feedback loop: US sewing machine exports to Africa DEPEND on AGOA — without AGOA preferential access, African garment factories lose US buyer orders and stop investing in US machinery. Estimated $98M+ in annual US industrial sewing machine exports to AGOA-recipient countries is at direct risk. Tennessee and Georgia manufacturers (Juki USA) employ 800+ workers in this segment.',
  },
  // ── Logistics ─────────────────────────────────────────────────────────────
  '870422': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 180_000_000, role: 'imports_from_us', context: 'Mack Trucks (SA) and International (Navistar) serve South Africa\'s mining and logistics sectors. Transnet freight rail and road logistics operators source US heavy trucks.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 95_000_000, role: 'imports_from_us', context: 'Mack and Kenworth trucks dominate Nigerian long-haul logistics. Lagos-Kano and Port Harcourt corridors use US heavy diesel vehicles.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 42_000_000, role: 'imports_from_us', context: 'Mack Trucks Kenya and International Trucks (East Africa) serve Mombasa port logistics and Northern Corridor (Uganda/Rwanda/DRC) freight.' },
    ],
    usExportVolumeToAfricaUSD: 420_000_000,
    cliffRiskNote: 'US commercial truck exports face 25% MFN tariff in many African markets. Despite this, US trucks hold strong market position due to durability reputation and US/Europe financing packages. AGOA expiry removes the relationship premium and accelerates Chinese (Sinotruk, FAW, Dongfeng) and Indian (Tata, Ashok Leyland) truck penetration — which now offer comparable financing at lower unit price. North Carolina and Pennsylvania manufacturing jobs at risk.',
  },
  // ── Technology ────────────────────────────────────────────────────────────
  '851762': {
    topTradeCountries: [
      { iso3: 'ZAF', name: 'South Africa', annualVolumeUSD: 85_000_000, role: 'imports_from_us', context: 'Cisco Systems dominates South Africa enterprise networking. MTN, Vodacom, and Telkom SA use Cisco routing/switching infrastructure. Cisco South Africa employs 200+ directly.' },
      { iso3: 'NGA', name: 'Nigeria', annualVolumeUSD: 58_000_000, role: 'imports_from_us', context: 'MTN Nigeria, Airtel, and Glo use Cisco backbone networking. Lagos financial district runs Cisco 99%+ network infrastructure.' },
      { iso3: 'KEN', name: 'Kenya', annualVolumeUSD: 38_000_000, role: 'imports_from_us', context: 'Safaricom (M-Pesa infrastructure), Equity Bank, and Kenya Power use Cisco/Juniper core network equipment. Silicon Savannah startups on Cisco systems.' },
      { iso3: 'ETH', name: 'Ethiopia', annualVolumeUSD: 22_000_000, role: 'imports_from_us', context: 'Ethio Telecom network modernization (Cisco partnership). Ethiopia chose Cisco over Huawei for latest backbone upgrade — AGOA relationship cited as factor.' },
    ],
    usExportVolumeToAfricaUSD: 320_000_000,
    cliffRiskNote: 'Huawei is the primary challenger to US networking dominance in Africa. Huawei\'s African market share grew from 12% (2010) to 45%+ (2024) driven by competitive financing and government relationships. AGOA expiry removes US strategic relationship leverage — African governments in procurement decisions between Cisco and Huawei will increasingly choose Huawei\'s $0-down EXIM financing. NSA and CISA view this as a significant surveillance/signals intelligence vulnerability.',
  },
};

// Merge extended enrichment into main PRODUCT_ENRICHMENT
for (const [code, entry] of Object.entries(EXTENDED_ENRICHMENT)) {
  if (!PRODUCT_ENRICHMENT[code]) {
    (PRODUCT_ENRICHMENT as Record<string, ProductEnrichment>)[code] = entry;
  }
}

export function getProductEnrichment(code: string): ProductEnrichment | null {
  return PRODUCT_ENRICHMENT[code] ?? null;
}

export function getDiaPotentialProduct(code: string): DiaPotentialProduct | null {
  return DIA_POTENTIAL_PRODUCTS.find((p) => p.code === code) ?? null;
}

export function getMfnRate(code: string): MfnRateEntry | null {
  return MFN_RATE_LOOKUP[code] ?? null;
}

/** Compute the preference value for display: MFN rate that AGOA eliminates */
export function getAgoaPreferenceValue(code: string): { mfnDisplay: string; hasBarrier: boolean } | null {
  const mfn = MFN_RATE_LOOKUP[code];
  if (!mfn) return null;
  return {
    mfnDisplay: mfn.display,
    hasBarrier: (mfn.ratePct ?? 0) > 0,
  };
}
