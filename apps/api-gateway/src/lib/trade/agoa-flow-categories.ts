/** AGOA trade-flow category groups — shared by API scaffolding and UI. */
export const AGOA_FLOW_CATEGORY_GROUPS = [
  'petroleum',
  'minerals',
  'textiles_apparel',
  'agriculture',
  'vehicles',
  'chemicals',
  'machinery',
  'electronics',
  'handicrafts',
  'footwear',
] as const;

export type AgoaFlowCategoryGroup = (typeof AGOA_FLOW_CATEGORY_GROUPS)[number];

export const AGOA_FLOW_CATEGORY_LABELS: Record<AgoaFlowCategoryGroup, string> = {
  petroleum: 'Petroleum & Energy',
  minerals: 'Minerals & Precious Metals',
  textiles_apparel: 'Textiles & Apparel',
  agriculture: 'Agriculture & Food',
  vehicles: 'Vehicles & Transport',
  chemicals: 'Chemicals & Pharma',
  machinery: 'Machinery & Equipment',
  electronics: 'Electronics & ICT',
  handicrafts: 'Handicrafts & Artisanal',
  footwear: 'Footwear & Leather',
};
