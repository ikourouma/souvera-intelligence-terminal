/**
 * Unified Souvera entity registry — territories first-class.
 * DB: souvera_entities. Code mirror for offline/tests.
 */

export type SouveraEntityRegion = 'africa' | 'caribbean';
export type SouveraEntityType = 'sovereign' | 'territory';
export type SouveraCoverageStatus = 'active' | 'excluded';

export interface SouveraEntity {
  entityKey: string;
  name: string;
  iso2: string | null;
  iso3: string | null;
  region: SouveraEntityRegion;
  entityType: SouveraEntityType;
  sovereignParentEntityKey: string | null;
  coverageStatus: SouveraCoverageStatus;
  notes: string | null;
}

/** Active markets from coverage manifests (entity_key = ISO3 when available). */
export const SOUVERA_ENTITIES: SouveraEntity[] = [
  ...africaEntities(),
  ...caribbeanEntities(),
];

function africaEntities(): SouveraEntity[] {
  const rows: Array<[string, string, string, string | null]> = [
    ['MAR', 'Morocco', 'MA', 'AGOA not_applicable'],
    ['DZA', 'Algeria', 'DZ', 'AGOA not_applicable'],
    ['TUN', 'Tunisia', 'TN', 'AGOA not_applicable'],
    ['LBY', 'Libya', 'LY', 'AGOA not_applicable'],
    ['EGY', 'Egypt', 'EG', 'AGOA not_applicable'],
    ['SDN', 'Sudan', 'SD', null],
    ['NGA', 'Nigeria', 'NG', 'Full terminal pilot'],
    ['GHA', 'Ghana', 'GH', null],
    ['SEN', 'Senegal', 'SN', null],
    ['MLI', 'Mali', 'ML', null],
    ['BFA', 'Burkina Faso', 'BF', null],
    ['NER', 'Niger', 'NE', null],
    ['GIN', 'Guinea', 'GN', null],
    ['SLE', 'Sierra Leone', 'SL', null],
    ['LBR', 'Liberia', 'LR', null],
    ['CIV', 'Ivory Coast', 'CI', null],
    ['TGO', 'Togo', 'TG', null],
    ['BEN', 'Benin', 'BJ', null],
    ['GMB', 'Gambia', 'GM', null],
    ['GNB', 'Guinea-Bissau', 'GW', null],
    ['CPV', 'Cape Verde', 'CV', null],
    ['MRT', 'Mauritania', 'MR', null],
    ['ETH', 'Ethiopia', 'ET', null],
    ['KEN', 'Kenya', 'KE', 'Full terminal pilot'],
    ['TZA', 'Tanzania', 'TZ', null],
    ['UGA', 'Uganda', 'UG', null],
    ['RWA', 'Rwanda', 'RW', null],
    ['BDI', 'Burundi', 'BI', null],
    ['SOM', 'Somalia', 'SO', null],
    ['DJI', 'Djibouti', 'DJ', null],
    ['ERI', 'Eritrea', 'ER', null],
    ['MDG', 'Madagascar', 'MG', null],
    ['COM', 'Comoros', 'KM', null],
    ['MUS', 'Mauritius', 'MU', null],
    ['SYC', 'Seychelles', 'SC', null],
    ['SSD', 'South Sudan', 'SS', null],
    ['CMR', 'Cameroon', 'CM', null],
    ['CAF', 'Central African Republic', 'CF', null],
    ['COD', 'DR Congo', 'CD', null],
    ['COG', 'Republic of Congo', 'CG', null],
    ['GAB', 'Gabon', 'GA', null],
    ['GNQ', 'Equatorial Guinea', 'GQ', null],
    ['STP', 'São Tomé and Príncipe', 'ST', null],
    ['TCD', 'Chad', 'TD', null],
    ['AGO', 'Angola', 'AO', null],
    ['ZAF', 'South Africa', 'ZA', null],
    ['BWA', 'Botswana', 'BW', null],
    ['LSO', 'Lesotho', 'LS', null],
    ['SWZ', 'Eswatini', 'SZ', null],
    ['NAM', 'Namibia', 'NA', null],
    ['ZWE', 'Zimbabwe', 'ZW', null],
    ['MOZ', 'Mozambique', 'MZ', null],
    ['ZMB', 'Zambia', 'ZM', null],
    ['MWI', 'Malawi', 'MW', null],
  ];
  return rows.map(([entityKey, name, iso2, notes]) => ({
    entityKey,
    name,
    iso2,
    iso3: entityKey,
    region: 'africa' as const,
    entityType: 'sovereign' as const,
    sovereignParentEntityKey: null,
    coverageStatus: 'active' as const,
    notes,
  }));
}

function caribbeanEntities(): SouveraEntity[] {
  const sovereign: Array<[string, string, string, string | null]> = [
    ['ATG', 'Antigua and Barbuda', 'AG', null],
    ['BHS', 'Bahamas', 'BS', null],
    ['BRB', 'Barbados', 'BB', null],
    ['CUB', 'Cuba', 'CU', 'CBI typically not applicable'],
    ['DMA', 'Dominica', 'DM', null],
    ['DOM', 'Dominican Republic', 'DO', 'CARICOM associate candidate'],
    ['GRD', 'Grenada', 'GD', null],
    ['HTI', 'Haiti', 'HT', null],
    ['JAM', 'Jamaica', 'JM', 'Full terminal pilot'],
    ['KNA', 'Saint Kitts and Nevis', 'KN', null],
    ['LCA', 'Saint Lucia', 'LC', null],
    ['VCT', 'Saint Vincent and the Grenadines', 'VC', null],
    ['SUR', 'Suriname', 'SR', null],
    ['TTO', 'Trinidad and Tobago', 'TT', null],
    ['GUY', 'Guyana', 'GY', null],
    ['BLZ', 'Belize', 'BZ', null],
  ];
  const territories: Array<[string, string, string, string]> = [
    ['PRI', 'Puerto Rico', 'PR', 'USA'],
    ['VGB', 'British Virgin Islands', 'VG', 'GBR'],
    ['TCA', 'Turks and Caicos Islands', 'TC', 'GBR'],
    ['CYM', 'Cayman Islands', 'KY', 'GBR'],
  ];
  return [
    ...sovereign.map(([entityKey, name, iso2, notes]) => ({
      entityKey,
      name,
      iso2,
      iso3: entityKey,
      region: 'caribbean' as const,
      entityType: 'sovereign' as const,
      sovereignParentEntityKey: null,
      coverageStatus: 'active' as const,
      notes,
    })),
    ...territories.map(([entityKey, name, iso2, parent]) => ({
      entityKey,
      name,
      iso2,
      iso3: entityKey,
      region: 'caribbean' as const,
      entityType: 'territory' as const,
      sovereignParentEntityKey: parent,
      coverageStatus: 'active' as const,
      notes: null,
    })),
  ];
}

const ENTITY_BY_KEY = new Map(SOUVERA_ENTITIES.map((e) => [e.entityKey, e]));

export function getEntity(entityKey: string): SouveraEntity | undefined {
  return ENTITY_BY_KEY.get(entityKey.toUpperCase());
}

export function getActiveEntitiesByRegion(region: SouveraEntityRegion): SouveraEntity[] {
  return SOUVERA_ENTITIES.filter((e) => e.region === region && e.coverageStatus === 'active');
}

export function entityKeysForRegion(region: SouveraEntityRegion): string[] {
  return getActiveEntitiesByRegion(region).map((e) => e.entityKey);
}

export function isTerritoryEntity(entityKey: string): boolean {
  return getEntity(entityKey)?.entityType === 'territory';
}
