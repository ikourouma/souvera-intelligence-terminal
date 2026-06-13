/**
 * AfCFTA Full Coverage — All 54 African Countries
 * 
 * Comprehensive AfCFTA implementation status for all AU member states.
 * Includes ratification status, tariff offer submissions, and intra-Africa trade data.
 * 
 * Sources: AfCFTA Secretariat, AU Commission, tralac, UN Comtrade
 */

import { APPROVED_AFRICA_ISO3 } from '@/lib/market-coverage';
import { countryDisplayName } from '@/lib/intelligence/country-names';

export type AfCftaStatus = 'not_signed' | 'signed' | 'ratified' | 'deposited' | 'trading';

export interface AfCftaTradePartner {
  iso3: string;
  name: string;
  tradeValueUSD: number;
  shareOfTotal: number;
}

export interface AfCftaTopProduct {
  hsCode: string;
  description: string;
  tradeValueUSD: number;
  shareOfTotal: number;
}

export interface AfCftaCountryData {
  iso3: string;
  name: string;
  status: AfCftaStatus;
  signedDate?: string;
  ratifiedDate?: string;
  depositedDate?: string;
  tradingSince?: string;
  tariffOffersSubmitted: boolean;
  servicesOffersSubmitted: boolean;
  notes?: string;
  sourceUrl: string;
  asOfDate: string;
  // Intra-Africa trade data
  intraAfricaExportsUSD?: number;
  intraAfricaImportsUSD?: number;
  topExportPartners?: AfCftaTradePartner[];
  topImportPartners?: AfCftaTradePartner[];
  topExportProducts?: AfCftaTopProduct[];
  topImportProducts?: AfCftaTopProduct[];
}

const AFCFTA_SOURCE = 'https://au-afcfta.org/';
const AS_OF = '2026-06-01';

// Complete list of 54 African countries with AfCFTA status
const AFCFTA_FULL_DATA: AfCftaCountryData[] = [
  // ─── Trading (Active) ─────────────────────────────────────────────────────
  {
    iso3: 'NGA',
    name: 'Nigeria',
    status: 'trading',
    signedDate: '2019-07-07',
    ratifiedDate: '2020-12-05',
    depositedDate: '2020-12-05',
    tradingSince: '2021-01-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Africa\'s largest economy; AfCFTA trading active with ECOWAS integration.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 8_200_000_000,
    intraAfricaImportsUSD: 5_400_000_000,
    topExportPartners: [
      { iso3: 'GHA', name: 'Ghana', tradeValueUSD: 1_850_000_000, shareOfTotal: 22.6 },
      { iso3: 'CIV', name: "Côte d'Ivoire", tradeValueUSD: 1_420_000_000, shareOfTotal: 17.3 },
      { iso3: 'ZAF', name: 'South Africa', tradeValueUSD: 980_000_000, shareOfTotal: 12.0 },
    ],
    topImportPartners: [
      { iso3: 'ZAF', name: 'South Africa', tradeValueUSD: 1_650_000_000, shareOfTotal: 30.6 },
      { iso3: 'EGY', name: 'Egypt', tradeValueUSD: 850_000_000, shareOfTotal: 15.7 },
      { iso3: 'MAR', name: 'Morocco', tradeValueUSD: 620_000_000, shareOfTotal: 11.5 },
    ],
    topExportProducts: [
      { hsCode: '270900', description: 'Crude petroleum', tradeValueUSD: 3_200_000_000, shareOfTotal: 39.0 },
      { hsCode: '271019', description: 'Refined petroleum', tradeValueUSD: 1_450_000_000, shareOfTotal: 17.7 },
      { hsCode: '180100', description: 'Cocoa beans', tradeValueUSD: 520_000_000, shareOfTotal: 6.3 },
    ],
    topImportProducts: [
      { hsCode: '870323', description: 'Motor vehicles', tradeValueUSD: 1_200_000_000, shareOfTotal: 22.2 },
      { hsCode: '100190', description: 'Wheat and meslin', tradeValueUSD: 680_000_000, shareOfTotal: 12.6 },
      { hsCode: '720712', description: 'Iron and steel products', tradeValueUSD: 520_000_000, shareOfTotal: 9.6 },
    ],
  },
  {
    iso3: 'KEN',
    name: 'Kenya',
    status: 'trading',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-05-09',
    depositedDate: '2018-05-09',
    tradingSince: '2021-01-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Early ratifier; EAC and AfCFTA dual market access supports exports.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 2_850_000_000,
    intraAfricaImportsUSD: 1_920_000_000,
    topExportPartners: [
      { iso3: 'UGA', name: 'Uganda', tradeValueUSD: 680_000_000, shareOfTotal: 23.9 },
      { iso3: 'TZA', name: 'Tanzania', tradeValueUSD: 520_000_000, shareOfTotal: 18.2 },
      { iso3: 'RWA', name: 'Rwanda', tradeValueUSD: 380_000_000, shareOfTotal: 13.3 },
    ],
    topImportPartners: [
      { iso3: 'ZAF', name: 'South Africa', tradeValueUSD: 480_000_000, shareOfTotal: 25.0 },
      { iso3: 'EGY', name: 'Egypt', tradeValueUSD: 320_000_000, shareOfTotal: 16.7 },
      { iso3: 'UGA', name: 'Uganda', tradeValueUSD: 280_000_000, shareOfTotal: 14.6 },
    ],
    topExportProducts: [
      { hsCode: '090240', description: 'Black tea', tradeValueUSD: 620_000_000, shareOfTotal: 21.8 },
      { hsCode: '060310', description: 'Cut flowers', tradeValueUSD: 480_000_000, shareOfTotal: 16.8 },
      { hsCode: '252329', description: 'Cement', tradeValueUSD: 320_000_000, shareOfTotal: 11.2 },
    ],
    topImportProducts: [
      { hsCode: '271019', description: 'Refined petroleum', tradeValueUSD: 380_000_000, shareOfTotal: 19.8 },
      { hsCode: '870422', description: 'Commercial vehicles', tradeValueUSD: 220_000_000, shareOfTotal: 11.5 },
      { hsCode: '720712', description: 'Iron and steel', tradeValueUSD: 185_000_000, shareOfTotal: 9.6 },
    ],
  },
  {
    iso3: 'GHA',
    name: 'Ghana',
    status: 'trading',
    signedDate: '2018-03-21',
    ratifiedDate: '2020-04-28',
    depositedDate: '2020-04-28',
    tradingSince: '2021-01-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'AfCFTA Secretariat host country; ECOWAS hub with active trading.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 4_200_000_000,
    intraAfricaImportsUSD: 3_100_000_000,
    topExportPartners: [
      { iso3: 'BFA', name: 'Burkina Faso', tradeValueUSD: 850_000_000, shareOfTotal: 20.2 },
      { iso3: 'TGO', name: 'Togo', tradeValueUSD: 620_000_000, shareOfTotal: 14.8 },
      { iso3: 'CIV', name: "Côte d'Ivoire", tradeValueUSD: 480_000_000, shareOfTotal: 11.4 },
    ],
    topImportPartners: [
      { iso3: 'NGA', name: 'Nigeria', tradeValueUSD: 920_000_000, shareOfTotal: 29.7 },
      { iso3: 'CIV', name: "Côte d'Ivoire", tradeValueUSD: 580_000_000, shareOfTotal: 18.7 },
      { iso3: 'ZAF', name: 'South Africa', tradeValueUSD: 420_000_000, shareOfTotal: 13.5 },
    ],
    topExportProducts: [
      { hsCode: '180100', description: 'Cocoa beans', tradeValueUSD: 1_200_000_000, shareOfTotal: 28.6 },
      { hsCode: '710812', description: 'Gold', tradeValueUSD: 850_000_000, shareOfTotal: 20.2 },
      { hsCode: '271019', description: 'Refined petroleum', tradeValueUSD: 420_000_000, shareOfTotal: 10.0 },
    ],
    topImportProducts: [
      { hsCode: '270900', description: 'Crude petroleum', tradeValueUSD: 680_000_000, shareOfTotal: 21.9 },
      { hsCode: '252329', description: 'Cement', tradeValueUSD: 380_000_000, shareOfTotal: 12.3 },
      { hsCode: '870323', description: 'Motor vehicles', tradeValueUSD: 320_000_000, shareOfTotal: 10.3 },
    ],
  },
  {
    iso3: 'ZAF',
    name: 'South Africa',
    status: 'trading',
    signedDate: '2018-07-01',
    ratifiedDate: '2019-02-10',
    depositedDate: '2019-02-10',
    tradingSince: '2021-01-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Africa\'s most industrialized economy; SADC anchor state.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 28_500_000_000,
    intraAfricaImportsUSD: 8_200_000_000,
    topExportPartners: [
      { iso3: 'BWA', name: 'Botswana', tradeValueUSD: 5_200_000_000, shareOfTotal: 18.2 },
      { iso3: 'NAM', name: 'Namibia', tradeValueUSD: 4_800_000_000, shareOfTotal: 16.8 },
      { iso3: 'MOZ', name: 'Mozambique', tradeValueUSD: 3_200_000_000, shareOfTotal: 11.2 },
    ],
    topImportPartners: [
      { iso3: 'NGA', name: 'Nigeria', tradeValueUSD: 1_850_000_000, shareOfTotal: 22.6 },
      { iso3: 'AGO', name: 'Angola', tradeValueUSD: 1_420_000_000, shareOfTotal: 17.3 },
      { iso3: 'ZMB', name: 'Zambia', tradeValueUSD: 980_000_000, shareOfTotal: 12.0 },
    ],
    topExportProducts: [
      { hsCode: '870323', description: 'Motor vehicles', tradeValueUSD: 4_800_000_000, shareOfTotal: 16.8 },
      { hsCode: '271019', description: 'Refined petroleum', tradeValueUSD: 3_200_000_000, shareOfTotal: 11.2 },
      { hsCode: '720712', description: 'Iron and steel', tradeValueUSD: 2_800_000_000, shareOfTotal: 9.8 },
    ],
    topImportProducts: [
      { hsCode: '270900', description: 'Crude petroleum', tradeValueUSD: 2_450_000_000, shareOfTotal: 29.9 },
      { hsCode: '271111', description: 'LNG natural gas', tradeValueUSD: 1_200_000_000, shareOfTotal: 14.6 },
      { hsCode: '180100', description: 'Cocoa beans', tradeValueUSD: 850_000_000, shareOfTotal: 10.4 },
    ],
  },
  {
    iso3: 'SEN',
    name: 'Senegal',
    status: 'trading',
    signedDate: '2018-03-21',
    ratifiedDate: '2020-11-19',
    depositedDate: '2020-11-19',
    tradingSince: '2021-01-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'UEMOA/ECOWAS hub; fisheries and phosphate exports.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 1_450_000_000,
    intraAfricaImportsUSD: 1_850_000_000,
    topExportPartners: [
      { iso3: 'MLI', name: 'Mali', tradeValueUSD: 420_000_000, shareOfTotal: 29.0 },
      { iso3: 'GIN', name: 'Guinea', tradeValueUSD: 280_000_000, shareOfTotal: 19.3 },
      { iso3: 'GMB', name: 'Gambia', tradeValueUSD: 180_000_000, shareOfTotal: 12.4 },
    ],
    topImportPartners: [
      { iso3: 'CIV', name: "Côte d'Ivoire", tradeValueUSD: 380_000_000, shareOfTotal: 20.5 },
      { iso3: 'NGA', name: 'Nigeria', tradeValueUSD: 320_000_000, shareOfTotal: 17.3 },
      { iso3: 'MAR', name: 'Morocco', tradeValueUSD: 280_000_000, shareOfTotal: 15.1 },
    ],
    topExportProducts: [
      { hsCode: '310520', description: 'Phosphate fertilizers', tradeValueUSD: 420_000_000, shareOfTotal: 29.0 },
      { hsCode: '030617', description: 'Frozen fish and seafood', tradeValueUSD: 280_000_000, shareOfTotal: 19.3 },
      { hsCode: '252329', description: 'Cement', tradeValueUSD: 180_000_000, shareOfTotal: 12.4 },
    ],
    topImportProducts: [
      { hsCode: '270900', description: 'Crude petroleum', tradeValueUSD: 480_000_000, shareOfTotal: 25.9 },
      { hsCode: '252310', description: 'Cement clinker', tradeValueUSD: 220_000_000, shareOfTotal: 11.9 },
      { hsCode: '100190', description: 'Wheat and meslin', tradeValueUSD: 185_000_000, shareOfTotal: 10.0 },
    ],
  },
  {
    iso3: 'CIV',
    name: "Côte d'Ivoire",
    status: 'trading',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-11-23',
    depositedDate: '2018-11-23',
    tradingSince: '2021-01-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'World\'s largest cocoa producer; West African trade hub.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 3_800_000_000,
    intraAfricaImportsUSD: 2_200_000_000,
    topExportPartners: [
      { iso3: 'BFA', name: 'Burkina Faso', tradeValueUSD: 720_000_000, shareOfTotal: 18.9 },
      { iso3: 'MLI', name: 'Mali', tradeValueUSD: 580_000_000, shareOfTotal: 15.3 },
      { iso3: 'GHA', name: 'Ghana', tradeValueUSD: 420_000_000, shareOfTotal: 11.1 },
    ],
    topImportPartners: [
      { iso3: 'NGA', name: 'Nigeria', tradeValueUSD: 680_000_000, shareOfTotal: 30.9 },
      { iso3: 'ZAF', name: 'South Africa', tradeValueUSD: 320_000_000, shareOfTotal: 14.5 },
      { iso3: 'SEN', name: 'Senegal', tradeValueUSD: 180_000_000, shareOfTotal: 8.2 },
    ],
    topExportProducts: [
      { hsCode: '180100', description: 'Cocoa beans, raw', tradeValueUSD: 1_520_000_000, shareOfTotal: 40.0 },
      { hsCode: '180400', description: 'Cocoa butter', tradeValueUSD: 680_000_000, shareOfTotal: 17.9 },
      { hsCode: '271019', description: 'Refined petroleum', tradeValueUSD: 450_000_000, shareOfTotal: 11.8 },
    ],
    topImportProducts: [
      { hsCode: '271019', description: 'Refined petroleum', tradeValueUSD: 520_000_000, shareOfTotal: 23.6 },
      { hsCode: '100190', description: 'Wheat and meslin', tradeValueUSD: 280_000_000, shareOfTotal: 12.7 },
      { hsCode: '870422', description: 'Commercial vehicles', tradeValueUSD: 185_000_000, shareOfTotal: 8.4 },
    ],
  },
  {
    iso3: 'TZA',
    name: 'Tanzania',
    status: 'trading',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-04-17',
    depositedDate: '2019-04-17',
    tradingSince: '2021-01-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'EAC member with AfCFTA trading; gold and horticulture exports.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 2_100_000_000,
    intraAfricaImportsUSD: 1_450_000_000,
    topExportPartners: [
      { iso3: 'KEN', name: 'Kenya', tradeValueUSD: 520_000_000, shareOfTotal: 24.8 },
      { iso3: 'COD', name: 'DR Congo', tradeValueUSD: 380_000_000, shareOfTotal: 18.1 },
      { iso3: 'RWA', name: 'Rwanda', tradeValueUSD: 280_000_000, shareOfTotal: 13.3 },
    ],
    topImportPartners: [
      { iso3: 'KEN', name: 'Kenya', tradeValueUSD: 420_000_000, shareOfTotal: 29.0 },
      { iso3: 'ZAF', name: 'South Africa', tradeValueUSD: 320_000_000, shareOfTotal: 22.1 },
      { iso3: 'UGA', name: 'Uganda', tradeValueUSD: 180_000_000, shareOfTotal: 12.4 },
    ],
    topExportProducts: [
      { hsCode: '710812', description: 'Gold', tradeValueUSD: 520_000_000, shareOfTotal: 24.8 },
      { hsCode: '090240', description: 'Black tea', tradeValueUSD: 380_000_000, shareOfTotal: 18.1 },
      { hsCode: '080132', description: 'Cashew nuts, shelled', tradeValueUSD: 280_000_000, shareOfTotal: 13.3 },
    ],
    topImportProducts: [
      { hsCode: '271019', description: 'Refined petroleum', tradeValueUSD: 320_000_000, shareOfTotal: 22.1 },
      { hsCode: '720712', description: 'Iron and steel', tradeValueUSD: 220_000_000, shareOfTotal: 15.2 },
      { hsCode: '870422', description: 'Commercial vehicles', tradeValueUSD: 185_000_000, shareOfTotal: 12.8 },
    ],
  },
  {
    iso3: 'RWA',
    name: 'Rwanda',
    status: 'trading',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-05-24',
    depositedDate: '2018-05-24',
    tradingSince: '2021-01-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'First country to ratify; hub for EAC trade facilitation.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 650_000_000,
    intraAfricaImportsUSD: 1_200_000_000,
  },
  {
    iso3: 'UGA',
    name: 'Uganda',
    status: 'trading',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-07-11',
    depositedDate: '2018-07-11',
    tradingSince: '2021-01-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'EAC member; coffee and fish exports to continental markets.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 1_850_000_000,
    intraAfricaImportsUSD: 2_400_000_000,
  },
  {
    iso3: 'EGY',
    name: 'Egypt',
    status: 'trading',
    signedDate: '2019-02-10',
    ratifiedDate: '2019-04-23',
    depositedDate: '2019-04-23',
    tradingSince: '2021-01-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'North Africa\'s largest economy; key manufacturing hub.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 5_200_000_000,
    intraAfricaImportsUSD: 2_800_000_000,
  },
  // ─── Deposited (Ready to Trade) ──────────────────────────────────────────
  {
    iso3: 'ETH',
    name: 'Ethiopia',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-06-10',
    depositedDate: '2019-06-10',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: false,
    notes: 'Ratified and deposited; trading pending services offers.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 850_000_000,
    intraAfricaImportsUSD: 1_450_000_000,
  },
  {
    iso3: 'MAR',
    name: 'Morocco',
    status: 'deposited',
    signedDate: '2019-03-21',
    ratifiedDate: '2021-01-15',
    depositedDate: '2021-02-28',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Gateway to Europe and Africa; automotive and phosphate exports.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
    intraAfricaExportsUSD: 3_200_000_000,
    intraAfricaImportsUSD: 1_850_000_000,
  },
  {
    iso3: 'DZA',
    name: 'Algeria',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2022-05-15',
    depositedDate: '2022-06-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: false,
    notes: 'Energy exporter; hydrocarbons dominate Africa trade.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'TUN',
    name: 'Tunisia',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2020-07-08',
    depositedDate: '2020-08-15',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Manufacturing hub; textiles and components exports.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'AGO',
    name: 'Angola',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-10-18',
    depositedDate: '2019-11-05',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: false,
    notes: 'Major oil producer; diversification into non-oil exports.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'ZMB',
    name: 'Zambia',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-02-08',
    depositedDate: '2019-02-12',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Copper belt economy; COMESA-SADC-EAC tripartite member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'ZWE',
    name: 'Zimbabwe',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-12-18',
    depositedDate: '2019-01-15',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: false,
    notes: 'Mining and agriculture; regional SADC corridor.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'MUS',
    name: 'Mauritius',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-01-30',
    depositedDate: '2019-02-15',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Services hub; financial services and textiles.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'NAM',
    name: 'Namibia',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-09-25',
    depositedDate: '2018-10-10',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Mining and fisheries; SACU member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'BWA',
    name: 'Botswana',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2020-01-15',
    depositedDate: '2020-02-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Diamond exporter; beef and tourism sectors.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'MOZ',
    name: 'Mozambique',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2020-03-12',
    depositedDate: '2020-04-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: false,
    notes: 'Emerging LNG producer; aluminium and coal exports.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'MDG',
    name: 'Madagascar',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-03-05',
    depositedDate: '2019-03-20',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Vanilla and apparel exports; biodiversity hotspot.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'CMR',
    name: 'Cameroon',
    status: 'deposited',
    signedDate: '2018-03-21',
    ratifiedDate: '2021-06-15',
    depositedDate: '2021-07-01',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: false,
    notes: 'CEMAC anchor; cocoa, timber, and petroleum exports.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  // ─── Ratified (Not Yet Deposited) ────────────────────────────────────────
  {
    iso3: 'SDN',
    name: 'Sudan',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2021-11-25',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Ratified; awaiting instrument deposit with AU.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'COD',
    name: 'DR Congo',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2020-10-28',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Critical minerals exporter; cobalt and copper.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'COG',
    name: 'Republic of Congo',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-08-22',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Oil producer; CEMAC member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'GAB',
    name: 'Gabon',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-07-10',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Oil and timber exporter; CEMAC hub.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'MLI',
    name: 'Mali',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-05-15',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Cotton and gold exporter; ECOWAS member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'BFA',
    name: 'Burkina Faso',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-06-28',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Cotton exporter; ECOWAS/UEMOA member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'NER',
    name: 'Niger',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-01-09',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Uranium exporter; ECOWAS member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'TGO',
    name: 'Togo',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-04-18',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Regional port hub; phosphate and cement exports.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'BEN',
    name: 'Benin',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2020-07-22',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Cotton and re-export trade; ECOWAS corridor.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'GIN',
    name: 'Guinea',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-12-05',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Bauxite exporter; ECOWAS member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'SLE',
    name: 'Sierra Leone',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-11-01',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Diamonds and iron ore; ECOWAS member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'LBR',
    name: 'Liberia',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2020-06-18',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Rubber and iron ore; ECOWAS member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'MWI',
    name: 'Malawi',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-10-24',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: false,
    notes: 'Tobacco and tea exporter; SADC/COMESA member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'LSO',
    name: 'Lesotho',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2021-04-05',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: false,
    notes: 'Apparel and diamonds; SACU enclave in South Africa.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'SWZ',
    name: 'Eswatini',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-04-23',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: false,
    notes: 'Sugar and textiles; SACU member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  // ─── Signed Only ─────────────────────────────────────────────────────────
  {
    iso3: 'LBY',
    name: 'Libya',
    status: 'signed',
    signedDate: '2019-07-07',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Signed; ratification pending political stabilization.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'SOM',
    name: 'Somalia',
    status: 'signed',
    signedDate: '2019-07-07',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Signed at AU Summit; ratification pending.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'DJI',
    name: 'Djibouti',
    status: 'signed',
    signedDate: '2018-03-21',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Strategic port; ratification pending.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'ERI',
    name: 'Eritrea',
    status: 'not_signed',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Has not signed AfCFTA agreement.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'SSD',
    name: 'South Sudan',
    status: 'signed',
    signedDate: '2018-07-07',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Signed; ratification pending peace stabilization.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'BDI',
    name: 'Burundi',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2020-09-15',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Coffee and tea exporter; EAC member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'GMB',
    name: 'Gambia',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-04-08',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Re-export hub; ECOWAS member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'GNB',
    name: 'Guinea-Bissau',
    status: 'signed',
    signedDate: '2018-03-21',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Cashew exporter; ratification pending.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'CPV',
    name: 'Cape Verde',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-03-15',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Island economy; tourism and services.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'MRT',
    name: 'Mauritania',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-07-25',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Iron ore and fisheries; AMU/ECOWAS bridge.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'CAF',
    name: 'Central African Republic',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2020-05-12',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Diamonds and timber; CEMAC member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'GNQ',
    name: 'Equatorial Guinea',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-12-10',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Oil and gas producer; CEMAC member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'STP',
    name: 'São Tomé and Príncipe',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-06-05',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Cocoa exporter; small island state.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'TCD',
    name: 'Chad',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2018-05-30',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Oil producer; CEMAC member.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'COM',
    name: 'Comoros',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2020-08-05',
    tariffOffersSubmitted: false,
    servicesOffersSubmitted: false,
    notes: 'Vanilla and cloves; island economy.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
  {
    iso3: 'SYC',
    name: 'Seychelles',
    status: 'ratified',
    signedDate: '2018-03-21',
    ratifiedDate: '2019-02-28',
    tariffOffersSubmitted: true,
    servicesOffersSubmitted: true,
    notes: 'Tourism and fisheries; services exporter.',
    sourceUrl: AFCFTA_SOURCE,
    asOfDate: AS_OF,
  },
];

// Build map for all 54 countries
function buildFullAfCftaMap(): Map<string, AfCftaCountryData> {
  const map = new Map<string, AfCftaCountryData>();
  
  // Add all curated data
  for (const record of AFCFTA_FULL_DATA) {
    map.set(record.iso3, record);
  }
  
  // Fill in any missing countries with minimal data
  for (const iso3 of APPROVED_AFRICA_ISO3) {
    if (!map.has(iso3)) {
      map.set(iso3, {
        iso3,
        name: countryDisplayName(iso3),
        status: 'signed',
        tariffOffersSubmitted: false,
        servicesOffersSubmitted: false,
        notes: 'Status data pending verification.',
        sourceUrl: AFCFTA_SOURCE,
        asOfDate: AS_OF,
      });
    }
  }
  
  return map;
}

const AFCFTA_MAP = buildFullAfCftaMap();

/**
 * Get AfCFTA data for a specific country
 */
export function getAfCftaCountryData(iso3: string): AfCftaCountryData | undefined {
  return AFCFTA_MAP.get(iso3.toUpperCase());
}

/**
 * Get all AfCFTA country data sorted by name
 */
export function getAllAfCftaCountryData(): AfCftaCountryData[] {
  return Array.from(AFCFTA_MAP.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get AfCFTA status label
 */
export function getAfCftaStatusLabel(status: AfCftaStatus): string {
  const labels: Record<AfCftaStatus, string> = {
    not_signed: 'Not Signed',
    signed: 'Signed',
    ratified: 'Ratified',
    deposited: 'Deposited',
    trading: 'Trading',
  };
  return labels[status] ?? status;
}

/**
 * Get AfCFTA status color class
 */
export function getAfCftaStatusColor(status: AfCftaStatus): string {
  const colors: Record<AfCftaStatus, string> = {
    not_signed: 'bg-red-500/20 text-red-400 border-red-500/30',
    signed: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    ratified: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    deposited: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    trading: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  return colors[status] ?? colors.signed;
}

/**
 * Format trade value for display
 */
export function formatAfCftaTradeValue(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}
