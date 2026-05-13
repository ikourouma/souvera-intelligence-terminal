"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
type GeoFeature = any;
import { X, TrendingUp, Users, DollarSign, Globe, ArrowRight, Star, MapPin } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Africa-specific TopoJSON — 50m resolution, South Sudan + W. Sahara separate
// Properties include: name (country name), iso_a3 (ISO Alpha-3 code)
// ─────────────────────────────────────────────────────────────────────────────
const GEO_URL =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

const GEO_URL_FALLBACK =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type CountryRegion = "west" | "east" | "north" | "central" | "south";

export type CountryProfile = {
  iso3: string;
  name: string;
  region: CountryRegion;
  gdp?: string;
  gdp_growth?: string;
  population?: string;
  fdi_inflows?: string;
  data_year?: number;
  afdec_priority: boolean;
  afdec_note?: string;
  headline?: string;
  sectors?: string[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Region color system — 5 AU regions, premium palette
// ─────────────────────────────────────────────────────────────────────────────
export const REGION_COLORS: Record<CountryRegion, { fill: string; hover: string; label: string; dim: string }> = {
  west:    { fill: "#1d4ed8", hover: "#3b82f6", dim: "#1d4ed855", label: "West Africa" },
  east:    { fill: "#059669", hover: "#10b981", dim: "#05966955", label: "East Africa" },
  north:   { fill: "#7c3aed", hover: "#a78bfa", dim: "#7c3aed55", label: "North Africa" },
  central: { fill: "#d97706", hover: "#f59e0b", dim: "#d9770655", label: "Central Africa" },
  south:   { fill: "#dc2626", hover: "#f87171", dim: "#dc262655", label: "Southern Africa" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Complete AU 54 nations — ISO3 → Region assignment
// Includes: Western Sahara (diplomatic neutral), South Sudan, all island nations
// ─────────────────────────────────────────────────────────────────────────────
const ISO3_REGION: Record<string, CountryRegion> = {
  // North Africa (7 — incl. Western Sahara as diplomatic neutral)
  MAR: "north", DZA: "north", TUN: "north", LBY: "north",
  EGY: "north", SDN: "north", ESH: "north",

  // West Africa (16)
  NGA: "west", GHA: "west", SEN: "west", MLI: "west",
  BFA: "west", NER: "west", GIN: "west", SLE: "west",
  LBR: "west", CIV: "west", TGO: "west", BEN: "west",
  GMB: "west", GNB: "west", CPV: "west", MRT: "west",

  // East Africa (13 — incl. island nations, South Sudan)
  ETH: "east", KEN: "east", TZA: "east", UGA: "east",
  RWA: "east", BDI: "east", SOM: "east", DJI: "east",
  ERI: "east", MDG: "east", COM: "east", MUS: "east",
  SYC: "east", SSD: "east",

  // Central Africa (8)
  CMR: "central", CAF: "central", COD: "central", COG: "central",
  GAB: "central", GNQ: "central", STP: "central", TCD: "central",

  // Southern Africa (10 — Angola is SADC, moved from Central per AU/SADC classification)
  ZAF: "south", BWA: "south", LSO: "south", SWZ: "south",
  NAM: "south", ZWE: "south", MOZ: "south", ZMB: "south",
  MWI: "south", AGO: "south",
};

// Canonical country name → ISO3 (from world.geojson properties.name)
// Includes all known aliases used by different GeoJSON/TopoJSON sources
// Key fixes: Tanzania uses "United Republic of Tanzania" in world.geojson
//            Guinea-Bissau appears as "Guinea Bissau" (no hyphen) in some sources
const NAME_TO_ISO3: Record<string, string> = {
  // North Africa
  "Morocco": "MAR", "Algeria": "DZA", "Tunisia": "TUN",
  "Libya": "LBY", "Libyan Arab Jamahiriya": "LBY",
  "Egypt": "EGY", "Sudan": "SDN", "Western Sahara": "ESH", "W. Sahara": "ESH",
  // West Africa
  "Nigeria": "NGA", "Ghana": "GHA", "Senegal": "SEN", "Mali": "MLI",
  "Burkina Faso": "BFA", "Niger": "NER", "Guinea": "GIN",
  "Sierra Leone": "SLE", "Liberia": "LBR",
  "Ivory Coast": "CIV", "Côte d'Ivoire": "CIV", "Cote d'Ivoire": "CIV",
  "Togo": "TGO", "Benin": "BEN", "The Gambia": "GMB", "Gambia": "GMB",
  // Guinea-Bissau — multiple aliases across GeoJSON sources
  "Guinea-Bissau": "GNB", "Guinea Bissau": "GNB", "GuineaBissau": "GNB",
  // Cape Verde / Mauritania
  "Cape Verde": "CPV", "Cabo Verde": "CPV", "Mauritania": "MRT",
  // East Africa
  "Ethiopia": "ETH", "Kenya": "KEN",
  // Tanzania — world.geojson uses "United Republic of Tanzania"
  "Tanzania": "TZA", "United Republic of Tanzania": "TZA", "Tanzania, United Rep.": "TZA",
  "Uganda": "UGA", "Rwanda": "RWA", "Burundi": "BDI", "Somalia": "SOM", "Djibouti": "DJI",
  "Eritrea": "ERI", "Madagascar": "MDG", "Comoros": "COM",
  "Mauritius": "MUS", "Seychelles": "SYC",
  "South Sudan": "SSD", "S. Sudan": "SSD", "S Sudan": "SSD",
  // Central Africa — all Congo aliases
  "Cameroon": "CMR", "Central African Republic": "CAF", "Central African Rep.": "CAF",
  "Democratic Republic of the Congo": "COD", "Dem. Rep. Congo": "COD",
  "DR Congo": "COD", "DRC": "COD", "Congo, Dem. Rep.": "COD",
  "Congo, DR": "COD", "D.R. Congo": "COD",
  "Republic of the Congo": "COG", "Republic of Congo": "COG",
  "Congo": "COG", "Congo, Rep.": "COG", "Congo Republic": "COG",
  "Gabon": "GAB", "Equatorial Guinea": "GNQ", "Eq. Guinea": "GNQ",
  "Guinea Ecuatorial": "GNQ", "Guinée équatoriale": "GNQ",
  "São Tomé and Príncipe": "STP", "Sao Tome and Principe": "STP",
  "S. Tomé and Príncipe": "STP",
  "São Tomé e Príncipe": "STP", "Sao Tome e Principe": "STP",
  "Chad": "TCD", "Angola": "AGO",
  // Southern Africa
  "South Africa": "ZAF", "Botswana": "BWA", "Lesotho": "LSO",
  "Eswatini": "SWZ", "Swaziland": "SWZ", "Namibia": "NAM",
  "Zimbabwe": "ZWE", "Mozambique": "MOZ", "Zambia": "ZMB", "Malawi": "MWI",
};

// ─────────────────────────────────────────────────────────────────────────────
// Top 10 Largest African Economies by GDP 2026 (IMF Projections via Daba Finance)
// ─────────────────────────────────────────────────────────────────────────────
export const TOP_10_GDP_2026 = [
  { rank: 1,  iso3: "ZAF", name: "South Africa",   gdp: "$443.64B", gdp_growth: "+1.2%",  region: "south" as CountryRegion },
  { rank: 2,  iso3: "EGY", name: "Egypt",           gdp: "$399.51B", gdp_growth: "+4.1%",  region: "north" as CountryRegion },
  { rank: 3,  iso3: "NGA", name: "Nigeria",         gdp: "$334.34B", gdp_growth: "+3.4%",  region: "west"  as CountryRegion },
  { rank: 4,  iso3: "DZA", name: "Algeria",         gdp: "$284.98B", gdp_growth: "+3.2%",  region: "north" as CountryRegion },
  { rank: 5,  iso3: "MAR", name: "Morocco",         gdp: "$196.12B", gdp_growth: "+3.0%",  region: "north" as CountryRegion },
  { rank: 6,  iso3: "KEN", name: "Kenya",           gdp: "$140.87B", gdp_growth: "+5.0%",  region: "east"  as CountryRegion },
  { rank: 7,  iso3: "ETH", name: "Ethiopia",        gdp: "$125.74B", gdp_growth: "+7.1%",  region: "east"  as CountryRegion },
  { rank: 8,  iso3: "GHA", name: "Ghana",           gdp: "$113.49B", gdp_growth: "+3.8%",  region: "west"  as CountryRegion },
  { rank: 9,  iso3: "CIV", name: "Côte d'Ivoire",  gdp: "$111.45B", gdp_growth: "+6.4%",  region: "west"  as CountryRegion },
  { rank: 10, iso3: "AGO", name: "Angola",          gdp: "$109.86B", gdp_growth: "+3.6%",  region: "south"   as CountryRegion },
];

// ─────────────────────────────────────────────────────────────────────────────
// Fallback profiles — 2026 IMF / World Bank data (Supabase read on mount)
// Complete coverage: all 54 AU member states
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_PROFILES: Record<string, CountryProfile> = {

  // ══════════════════════════════════════════════════════════════════
  // NORTH AFRICA
  // ══════════════════════════════════════════════════════════════════
  EGY: {
    iso3: "EGY", name: "Egypt", region: "north", afdec_priority: false,
    gdp: "$399.51B", gdp_growth: "+4.1%", population: "107M", fdi_inflows: "$9.8B", data_year: 2026,
    headline: "Africa's #2 economy — controls the Suez Canal and serves as the continent's logistics gateway to Asia and Europe.",
    sectors: ["Tourism", "Suez Canal Logistics", "Natural Gas", "Manufacturing", "Infrastructure"],
    afdec_note: "AfDEC monitors Egypt as a bilateral trade corridor anchor for NC logistics and engineering firms.",
  },
  DZA: {
    iso3: "DZA", name: "Algeria", region: "north", afdec_priority: false,
    gdp: "$284.98B", gdp_growth: "+3.2%", population: "46M", fdi_inflows: "$1.5B", data_year: 2026,
    headline: "Africa's 4th largest economy — hydrocarbon powerhouse with significant diversification potential into renewables.",
    sectors: ["Natural Gas", "Oil", "Agriculture", "Manufacturing", "Renewables"],
    afdec_note: "AfDEC monitoring energy transition opportunities for NC clean energy developers.",
  },
  MAR: {
    iso3: "MAR", name: "Morocco", region: "north", afdec_priority: false,
    gdp: "$196.12B", gdp_growth: "+3.0%", population: "38M", fdi_inflows: "$2.1B", data_year: 2026,
    headline: "Africa's gateway to Europe — rising automotive and aerospace manufacturing hub with booming solar capacity.",
    sectors: ["Phosphates", "Aerospace", "Automotive", "Tourism", "Solar Energy"],
    afdec_note: "Trade corridor monitoring. EU-Africa bridge market with strong NC aerospace sector alignment.",
  },
  TUN: {
    iso3: "TUN", name: "Tunisia", region: "north", afdec_priority: false,
    gdp: "$46.7B", gdp_growth: "+1.8%", population: "12M", fdi_inflows: "$0.5B", data_year: 2026,
    headline: "North Africa's diversified economy — strong manufacturing and ICT sector with deep EU trade links.",
    sectors: ["Tourism", "Textiles", "ICT", "Agriculture", "Phosphates"],
    afdec_note: "NC tech and textile sector firms exploring Tunisia as a Mediterranean corridor anchor.",
  },
  LBY: {
    iso3: "LBY", name: "Libya", region: "north", afdec_priority: false,
    gdp: "$40B", gdp_growth: "+3.0%", population: "7M", fdi_inflows: "$0.2B", data_year: 2026,
    headline: "North Africa's major oil producer — post-conflict reconstruction phase creating infrastructure opportunities.",
    sectors: ["Oil & Gas", "Construction", "Infrastructure", "Trade"],
    afdec_note: "AfDEC maintains monitoring status. NC construction and EPC firms watching reconstruction sector.",
  },
  SDN: {
    iso3: "SDN", name: "Sudan", region: "north", afdec_priority: false,
    gdp: "$35.1B", gdp_growth: "-4.0%", population: "47M", fdi_inflows: "$0.1B", data_year: 2026,
    headline: "Sudan faces significant political and economic challenges — AfDEC monitors humanitarian corridor opportunities.",
    sectors: ["Agriculture", "Gold Mining", "Oil", "Livestock"],
    afdec_note: "AfDEC maintains observation status due to ongoing political transition. Humanitarian and agriculture corridors monitored.",
  },

  // ══════════════════════════════════════════════════════════════════
  // WEST AFRICA
  // ══════════════════════════════════════════════════════════════════
  NGA: {
    iso3: "NGA", name: "Nigeria", region: "west", afdec_priority: true,
    gdp: "$334.34B", gdp_growth: "+3.4%", population: "223M", fdi_inflows: "$3.5B", data_year: 2026,
    headline: "Africa's 3rd largest economy — largest consumer market, fintech capital, and top diaspora remittance recipient.",
    sectors: ["Fintech", "Oil & Gas", "Agriculture", "Entertainment", "Telecom"],
    afdec_note: "Active AfDEC bilateral trade corridor. 3 NC companies in active negotiation for market entry.",
  },
  GHA: {
    iso3: "GHA", name: "Ghana", region: "west", afdec_priority: true,
    gdp: "$113.49B", gdp_growth: "+3.8%", population: "34M", fdi_inflows: "$1.2B", data_year: 2026,
    headline: "West Africa's most stable democracy and established NC diaspora corridor — Year of Return anchor country.",
    sectors: ["Gold & Mining", "Cocoa", "Oil & Gas", "Tech Hubs", "Agribusiness"],
    afdec_note: "AfDEC Accra Tech & EPC Summit 2026 anchor country. Strong NC diaspora engagement.",
  },
  CIV: {
    iso3: "CIV", name: "Côte d'Ivoire", region: "west", afdec_priority: false,
    gdp: "$111.45B", gdp_growth: "+6.4%", population: "28M", fdi_inflows: "$1.3B", data_year: 2026,
    headline: "World's largest cocoa producer evolving into a regional financial services and logistics hub.",
    sectors: ["Cocoa & Coffee", "Port Logistics", "Financial Services", "Oil Production", "Manufacturing"],
    afdec_note: "Agritech export corridor under assessment. Rapid growth creating NC investment entry opportunities.",
  },
  SEN: {
    iso3: "SEN", name: "Senegal", region: "west", afdec_priority: false,
    gdp: "$31.8B", gdp_growth: "+7.1%", population: "18M", fdi_inflows: "$1.1B", data_year: 2026,
    headline: "West Africa's fastest-growing economy — new offshore oil production drives GDP surge alongside strong service sector.",
    sectors: ["Oil & Gas", "Fisheries", "Agriculture", "Tourism", "ICT"],
    afdec_note: "Dakar is emerging as an AfDEC corridor city. NC tech firms exploring Senegal's digital economy.",
  },
  MLI: {
    iso3: "MLI", name: "Mali", region: "west", afdec_priority: false,
    gdp: "$19.7B", gdp_growth: "+3.2%", population: "23M", fdi_inflows: "$0.4B", data_year: 2026,
    headline: "West Africa's third largest gold producer — significant agricultural potential alongside mineral wealth.",
    sectors: ["Gold Mining", "Agriculture", "Cotton", "Livestock"],
    afdec_note: "AfDEC monitoring status. NC agribusiness and mining service firms tracking development.",
  },
  BFA: {
    iso3: "BFA", name: "Burkina Faso", region: "west", afdec_priority: false,
    gdp: "$20.3B", gdp_growth: "+2.5%", population: "23M", fdi_inflows: "$0.3B", data_year: 2026,
    headline: "Landlocked West African state with growing gold exports and significant agricultural economy.",
    sectors: ["Gold Mining", "Cotton", "Agriculture", "Livestock"],
    afdec_note: "AfDEC maintains observation status. Agricultural corridor potential for NC agri-tech firms.",
  },
  NER: {
    iso3: "NER", name: "Niger", region: "west", afdec_priority: false,
    gdp: "$16.8B", gdp_growth: "+3.0%", population: "27M", fdi_inflows: "$0.4B", data_year: 2026,
    headline: "One of the world's youngest populations — uranium exports and emerging oil sector anchor a growing economy.",
    sectors: ["Uranium", "Oil", "Agriculture", "Livestock"],
    afdec_note: "AfDEC monitoring. Long-term observation for uranium and agriculture corridor development.",
  },
  GIN: {
    iso3: "GIN", name: "Guinea", region: "west", afdec_priority: false,
    gdp: "$21.4B", gdp_growth: "+5.5%", population: "14M", fdi_inflows: "$1.5B", data_year: 2026,
    headline: "World's largest bauxite reserves — Guinea is a critical node in the global aluminum supply chain.",
    sectors: ["Bauxite & Aluminum", "Gold", "Iron Ore", "Agriculture"],
    afdec_note: "NC manufacturing firms with aluminum dependencies are tracking Guinea's bauxite export trajectory.",
  },
  SLE: {
    iso3: "SLE", name: "Sierra Leone", region: "west", afdec_priority: false,
    gdp: "$4.9B", gdp_growth: "+4.2%", population: "9M", fdi_inflows: "$0.2B", data_year: 2026,
    headline: "Post-conflict growth economy — diamonds, iron ore, and a growing tourism sector anchor recovery.",
    sectors: ["Diamonds", "Iron Ore", "Agriculture", "Tourism"],
    afdec_note: "Strong NC diaspora community. AfDEC tracking trade and community investment opportunities.",
  },
  LBR: {
    iso3: "LBR", name: "Liberia", region: "west", afdec_priority: false,
    gdp: "$4.1B", gdp_growth: "+5.0%", population: "6M", fdi_inflows: "$0.5B", data_year: 2026,
    headline: "America's closest historical tie to Africa — Liberia grows through rubber, iron ore, and maritime services.",
    sectors: ["Rubber", "Iron Ore", "Maritime Services", "Agriculture"],
    afdec_note: "Deep historical NC-Liberia diaspora connections. AfDEC monitoring investment opportunities.",
  },
  TGO: {
    iso3: "TGO", name: "Togo", region: "west", afdec_priority: false,
    gdp: "$8.9B", gdp_growth: "+5.8%", population: "9M", fdi_inflows: "$0.3B", data_year: 2026,
    headline: "West Africa's emerging logistics hub — Lomé Port is the deepest in the Gulf of Guinea.",
    sectors: ["Port & Logistics", "Phosphates", "Agriculture", "Trade"],
    afdec_note: "AfDEC logistics corridor assessment in progress. Lomé Port is a strategic AfCFTA gateway node.",
  },
  BEN: {
    iso3: "BEN", name: "Benin", region: "west", afdec_priority: false,
    gdp: "$19.6B", gdp_growth: "+6.2%", population: "14M", fdi_inflows: "$0.4B", data_year: 2026,
    headline: "One of West Africa's most stable democracies — cotton exports and a growing digital economy.",
    sectors: ["Cotton", "Agriculture", "Port Logistics", "ICT"],
    afdec_note: "Benin's agritech and fintech ecosystems are under AfDEC monitoring for NC corridor alignment.",
  },
  GMB: {
    iso3: "GMB", name: "Gambia", region: "west", afdec_priority: false,
    gdp: "$2.1B", gdp_growth: "+5.3%", population: "2.7M", fdi_inflows: "$0.1B", data_year: 2026,
    headline: "West Africa's smallest country — strong tourism recovery and significant remittance-driven economy.",
    sectors: ["Tourism", "Agriculture", "Fisheries", "Remittances"],
    afdec_note: "AfDEC monitoring Gambia's tourism corridor for NC hospitality investment.",
  },
  GNB: {
    iso3: "GNB", name: "Guinea-Bissau", region: "west", afdec_priority: false,
    gdp: "$1.9B", gdp_growth: "+4.8%", population: "2.1M", fdi_inflows: "$0.05B", data_year: 2026,
    headline: "Cashew powerhouse — Guinea-Bissau produces 10% of the world's cashews with significant fishing resources.",
    sectors: ["Cashew Exports", "Fisheries", "Agriculture"],
    afdec_note: "Niche agribusiness opportunity. NC specialty food and agriculture firms tracking cashew corridor.",
  },
  CPV: {
    iso3: "CPV", name: "Cabo Verde", region: "west", afdec_priority: false,
    gdp: "$2.3B", gdp_growth: "+5.9%", population: "0.6M", fdi_inflows: "$0.2B", data_year: 2026,
    headline: "Island nation with one of Africa's highest per-capita incomes — tourism-driven economy with strong blue economy potential.",
    sectors: ["Tourism", "Fisheries", "Renewables", "Financial Services"],
    afdec_note: "Cabo Verde is AfDEC's showcase island tourism corridor market. NC hospitality investment opportunity.",
  },
  MRT: {
    iso3: "MRT", name: "Mauritania", region: "west", afdec_priority: false,
    gdp: "$10.8B", gdp_growth: "+4.5%", population: "4.7M", fdi_inflows: "$0.5B", data_year: 2026,
    headline: "Emerging oil and gas producer — Mauritania's Grand Tortue LNG project is a West African energy milestone.",
    sectors: ["Iron Ore", "Natural Gas", "Fisheries", "Oil"],
    afdec_note: "NC energy firms tracking Mauritania's LNG Grand Tortue development for corridor opportunities.",
  },

  // ══════════════════════════════════════════════════════════════════
  // EAST AFRICA
  // ══════════════════════════════════════════════════════════════════
  KEN: {
    iso3: "KEN", name: "Kenya", region: "east", afdec_priority: true,
    gdp: "$140.87B", gdp_growth: "+5.0%", population: "56M", fdi_inflows: "$0.8B", data_year: 2026,
    headline: "East Africa's tech hub — home to the Silicon Savannah, M-Pesa, and Africa's most dynamic startup ecosystem.",
    sectors: ["Fintech (M-Pesa)", "AgriTech", "Green Energy", "Logistics", "Tourism"],
    afdec_note: "AfDEC priority market for life sciences, fintech expansion, and bilateral trade corridor.",
  },
  ETH: {
    iso3: "ETH", name: "Ethiopia", region: "east", afdec_priority: false,
    gdp: "$125.74B", gdp_growth: "+7.1%", population: "127M", fdi_inflows: "$4.1B", data_year: 2026,
    headline: "Africa's fastest-growing major economy — massive hydroelectric and industrial ambitions anchor its rise.",
    sectors: ["Manufacturing", "Textiles", "Aviation", "Coffee Exports", "Hydropower"],
    afdec_note: "Emerging market. EPC infrastructure and renewable energy sectors under AfDEC monitoring.",
  },
  TZA: {
    iso3: "TZA", name: "Tanzania", region: "east", afdec_priority: false,
    gdp: "$80.5B", gdp_growth: "+5.2%", population: "67M", fdi_inflows: "$1.0B", data_year: 2026,
    headline: "East Africa's resource-rich powerhouse — Serengeti, Kilimanjaro, and emerging LNG sector define its dual economy.",
    sectors: ["Tourism", "Natural Gas (LNG)", "Mining", "Agriculture", "Trade"],
    afdec_note: "AfDEC tourism and agribusiness corridor tracking. Tanzania's LNG sector under monitoring for NC energy firm alignment.",
  },
  UGA: {
    iso3: "UGA", name: "Uganda", region: "east", afdec_priority: false,
    gdp: "$55.0B", gdp_growth: "+5.8%", population: "49M", fdi_inflows: "$0.8B", data_year: 2026,
    headline: "East Africa's fastest-urbanizing economy — emerging oil revenues to complement strong agriculture base.",
    sectors: ["Agriculture", "Oil & Gas", "Fintech", "Tourism", "Trade"],
    afdec_note: "AfDEC tracking Uganda's fintech sector and agribusiness for NC corridor development.",
  },
  RWA: {
    iso3: "RWA", name: "Rwanda", region: "east", afdec_priority: false,
    gdp: "$14.1B", gdp_growth: "+7.2%", population: "14M", fdi_inflows: "$0.4B", data_year: 2026,
    headline: "Africa's Singapore — the world's most business-friendly African economy with exceptional governance and ICT infrastructure.",
    sectors: ["ICT", "Financial Services", "Tourism", "Mining", "Agriculture"],
    afdec_note: "AfDEC views Rwanda as a model bilateral corridor. NC tech firms and life sciences exploring Kigali hub.",
  },
  BDI: {
    iso3: "BDI", name: "Burundi", region: "east", afdec_priority: false,
    gdp: "$2.9B", gdp_growth: "+3.8%", population: "13M", fdi_inflows: "$0.05B", data_year: 2026,
    headline: "One of Africa's smallest economies — coffee exports and nickel mining anchor subsistence agriculture base.",
    sectors: ["Coffee", "Nickel Mining", "Agriculture"],
    afdec_note: "AfDEC maintains observation status. Primarily monitoring humanitarian and development corridors.",
  },
  SOM: {
    iso3: "SOM", name: "Somalia", region: "east", afdec_priority: false,
    gdp: "$8.1B", gdp_growth: "+3.0%", population: "18M", fdi_inflows: "$0.3B", data_year: 2026,
    headline: "Rebuilding economy with major untapped potential — strategic Horn of Africa position and large diaspora remittances.",
    sectors: ["Livestock", "Fisheries", "Telecommunications", "Remittances"],
    afdec_note: "AfDEC tracking diaspora investment channels. Large Somali diaspora in NC creating community corridor links.",
  },
  DJI: {
    iso3: "DJI", name: "Djibouti", region: "east", afdec_priority: false,
    gdp: "$4.1B", gdp_growth: "+6.5%", population: "1.1M", fdi_inflows: "$0.4B", data_year: 2026,
    headline: "Africa's strategic hub — 30% of global maritime trade passes through Djibouti's ports, serving as Ethiopia's gateway to the sea.",
    sectors: ["Port & Logistics", "Financial Services", "Telecom", "Trade"],
    afdec_note: "Djibouti's logistics position makes it a critical node for AfDEC's East Africa trade infrastructure corridor.",
  },
  ERI: {
    iso3: "ERI", name: "Eritrea", region: "east", afdec_priority: false,
    gdp: "$2.2B", gdp_growth: "+2.0%", population: "3.7M", fdi_inflows: "$0.02B", data_year: 2026,
    headline: "Strategic Red Sea access with developing mining sector — Eritrea's geopolitical position creates long-term potential.",
    sectors: ["Copper & Gold Mining", "Agriculture", "Fisheries"],
    afdec_note: "AfDEC maintains observation status. Red Sea corridor monitoring for future engagement.",
  },
  MDG: {
    iso3: "MDG", name: "Madagascar", region: "east", afdec_priority: false,
    gdp: "$14.6B", gdp_growth: "+4.2%", population: "30M", fdi_inflows: "$0.4B", data_year: 2026,
    headline: "Biodiversity powerhouse — vanilla, nickel, and eco-tourism position Madagascar uniquely in the Indian Ocean economy.",
    sectors: ["Vanilla Exports", "Nickel Mining", "Eco-Tourism", "Textiles", "Agriculture"],
    afdec_note: "AfDEC tracking eco-tourism corridor. NC hospitality and specialty agriculture firms exploring Madagascar.",
  },
  COM: {
    iso3: "COM", name: "Comoros", region: "east", afdec_priority: false,
    gdp: "$1.3B", gdp_growth: "+3.5%", population: "0.9M", fdi_inflows: "$0.04B", data_year: 2026,
    headline: "Indian Ocean islands producing ylang-ylang and cloves — Comoros holds blue economy and tourism potential.",
    sectors: ["Ylang-Ylang", "Fisheries", "Tourism", "Agriculture"],
    afdec_note: "AfDEC monitoring blue economy and specialty agriculture corridors in the Indian Ocean islands.",
  },
  MUS: {
    iso3: "MUS", name: "Mauritius", region: "east", afdec_priority: false,
    gdp: "$14.3B", gdp_growth: "+4.1%", population: "1.3M", fdi_inflows: "$0.5B", data_year: 2026,
    headline: "Africa's most prosperous island economy — financial services and tourism anchor a world-class investment climate.",
    sectors: ["Financial Services", "Tourism", "Textiles", "ICT", "Real Estate"],
    afdec_note: "Mauritius serves as AfDEC's preferred Indian Ocean financial corridor gateway for NC investors.",
  },
  SYC: {
    iso3: "SYC", name: "Seychelles", region: "east", afdec_priority: false,
    gdp: "$1.9B", gdp_growth: "+3.8%", population: "0.1M", fdi_inflows: "$0.2B", data_year: 2026,
    headline: "Africa's richest country per capita — luxury tourism, blue economy, and offshore finance define this archipelago economy.",
    sectors: ["Luxury Tourism", "Fisheries", "Offshore Finance", "Blue Economy"],
    afdec_note: "AfDEC luxury tourism corridor — NC hospitality and real estate investors tracking Seychelles opportunities.",
  },
  SSD: {
    iso3: "SSD", name: "South Sudan", region: "east", afdec_priority: false,
    gdp: "$6.1B", gdp_growth: "-2.5%", population: "11M", fdi_inflows: "$0.3B", data_year: 2026,
    headline: "World's newest nation — oil-dependent economy navigating political transition with UN-supported reconstruction.",
    sectors: ["Oil & Gas", "Agriculture", "Livestock", "Construction"],
    afdec_note: "AfDEC maintains humanitarian monitoring status. Post-conflict reconstruction NCs tracking infrastructure corridor.",
  },

  // ══════════════════════════════════════════════════════════════════
  // CENTRAL AFRICA
  // ══════════════════════════════════════════════════════════════════
  COD: {
    iso3: "COD", name: "DR Congo", region: "central", afdec_priority: false,
    gdp: "$66.4B", gdp_growth: "+6.1%", population: "105M", fdi_inflows: "$1.8B", data_year: 2026,
    headline: "Africa's mineral superpower — DRC holds 70% of the world's cobalt essential for the global EV and clean energy transition.",
    sectors: ["Cobalt & Copper", "Coltan", "Gold", "Hydropower", "Agriculture"],
    afdec_note: "DRC's critical minerals are highly relevant to NC clean energy and EV supply chain firms. AfDEC strategic monitoring.",
  },
  CMR: {
    iso3: "CMR", name: "Cameroon", region: "central", afdec_priority: false,
    gdp: "$48.0B", gdp_growth: "+4.0%", population: "29M", fdi_inflows: "$0.6B", data_year: 2026,
    headline: "Central Africa's economic anchor — agricultural powerhouse and regional logistics hub with deep-water port access.",
    sectors: ["Agriculture", "Oil", "Timber", "Mining", "Trade"],
    afdec_note: "Diaspora engagement active. 2 AfDEC members based in Yaoundé. NC agribusiness corridor in assessment.",
  },
  COG: {
    iso3: "COG", name: "Republic of Congo", region: "central", afdec_priority: false,
    gdp: "$14.4B", gdp_growth: "+4.5%", population: "6M", fdi_inflows: "$1.2B", data_year: 2026,
    headline: "Oil-rich Central African state transitioning toward forest and agriculture diversification.",
    sectors: ["Oil & Gas", "Timber", "Agriculture", "Mining"],
    afdec_note: "AfDEC tracking energy transition corridor. NC clean energy opportunity within oil-to-renewables diversification.",
  },
  GAB: {
    iso3: "GAB", name: "Gabon", region: "central", afdec_priority: false,
    gdp: "$20.5B", gdp_growth: "+2.8%", population: "2.4M", fdi_inflows: "$1.0B", data_year: 2026,
    headline: "Equatorial forest nation with high per-capita income — oil revenues financing diversification into manganese and eco-tourism.",
    sectors: ["Oil", "Manganese", "Timber", "Eco-Tourism"],
    afdec_note: "AfDEC monitoring Gabon's sustainable forestry and eco-tourism for NC environmental sector alignment.",
  },
  GNQ: {
    iso3: "GNQ", name: "Equatorial Guinea", region: "central", afdec_priority: false,
    gdp: "$12.1B", gdp_growth: "-1.5%", population: "1.5M", fdi_inflows: "$0.4B", data_year: 2026,
    headline: "Central Africa's oil-rich microstate — declining oil revenues driving economic diversification agenda.",
    sectors: ["Oil & Gas", "Methanol", "Timber"],
    afdec_note: "AfDEC observation status. NC energy services tracking diversification opportunities.",
  },
  CAF: {
    iso3: "CAF", name: "Central African Republic", region: "central", afdec_priority: false,
    gdp: "$2.8B", gdp_growth: "+2.5%", population: "6M", fdi_inflows: "$0.1B", data_year: 2026,
    headline: "One of Africa's most resource-rich and least developed nations — diamonds, gold, and timber amid reconstruction.",
    sectors: ["Diamonds", "Gold", "Timber", "Agriculture"],
    afdec_note: "AfDEC maintains humanitarian monitoring. Long-term observation for minerals corridor development.",
  },
  STP: {
    iso3: "STP", name: "São Tomé & Príncipe", region: "central", afdec_priority: false,
    gdp: "$0.6B", gdp_growth: "+3.5%", population: "0.23M", fdi_inflows: "$0.05B", data_year: 2026,
    headline: "Gulf of Guinea island state with emerging eco-tourism — world-class cocoa and blue economy potential.",
    sectors: ["Cocoa", "Tourism", "Fisheries", "Oil Exploration"],
    afdec_note: "AfDEC eco-tourism and specialty cocoa corridor tracking. Niche NC artisan food alignment.",
  },
  TCD: {
    iso3: "TCD", name: "Chad", region: "central", afdec_priority: false,
    gdp: "$12.8B", gdp_growth: "+3.8%", population: "18M", fdi_inflows: "$0.2B", data_year: 2026,
    headline: "Landlocked Sahel nation — Lake Chad basin agriculture and declining oil revenues shape economic trajectory.",
    sectors: ["Oil", "Agriculture", "Livestock", "Gum Arabic"],
    afdec_note: "AfDEC maintains observation status for long-term Sahel agriculture corridor opportunity.",
  },

  // ══════════════════════════════════════════════════════════════════
  // SOUTHERN AFRICA
  // ══════════════════════════════════════════════════════════════════
  ZAF: {
    iso3: "ZAF", name: "South Africa", region: "south", afdec_priority: false,
    gdp: "$443.64B", gdp_growth: "+1.2%", population: "62M", fdi_inflows: "$5.2B", data_year: 2026,
    headline: "Africa's most sophisticated economy — the continent's financial hub with the deepest capital markets and most advanced infrastructure.",
    sectors: ["Mining", "Financial Services", "Automotive", "Tourism", "Renewables"],
    afdec_note: "NC–SA clean energy and automotive manufacturing corridor under AfDEC deep assessment.",
  },
  AGO: {
    iso3: "AGO", name: "Angola", region: "south", afdec_priority: false,
    gdp: "$109.86B", gdp_growth: "+3.6%", population: "36M", fdi_inflows: "$4.7B", data_year: 2026,
    headline: "Southern Africa's oil-driven powerhouse — accelerating diversification into agriculture, construction, and logistics.",
    sectors: ["Oil & Gas", "Construction", "Agriculture", "Mining", "Telecom"],
    afdec_note: "AfDEC monitoring Angola's diversification push for NC construction and agriculture sector alignment. SADC member.",
  },
  ZMB: {
    iso3: "ZMB", name: "Zambia", region: "south", afdec_priority: false,
    gdp: "$28.5B", gdp_growth: "+4.2%", population: "21M", fdi_inflows: "$0.5B", data_year: 2026,
    headline: "Copper corridor — Zambia is the world's 7th largest copper producer, critical to the global clean energy supply chain.",
    sectors: ["Copper Mining", "Agriculture", "Renewables", "Tourism"],
    afdec_note: "Zambia's copper sector is strategically important for NC clean energy and EV supply chain firms.",
  },
  ZWE: {
    iso3: "ZWE", name: "Zimbabwe", region: "south", afdec_priority: false,
    gdp: "$24.6B", gdp_growth: "+3.5%", population: "16M", fdi_inflows: "$0.5B", data_year: 2026,
    headline: "Highly educated workforce and significant mineral wealth — Zimbabwe's recovery path holds NC agriculture and mining opportunity.",
    sectors: ["Mining (Lithium, Gold)", "Agriculture", "Tourism", "Manufacturing"],
    afdec_note: "AfDEC tracking Zimbabwe's lithium sector — critical for EV batteries and NC advanced manufacturing alignment.",
  },
  MOZ: {
    iso3: "MOZ", name: "Mozambique", region: "south", afdec_priority: false,
    gdp: "$18.2B", gdp_growth: "+5.5%", population: "34M", fdi_inflows: "$2.5B", data_year: 2026,
    headline: "East Africa's LNG frontier — Mozambique's offshore gas fields represent one of the world's top-10 gas discoveries.",
    sectors: ["Natural Gas (LNG)", "Coal", "Agriculture", "Tourism", "Fisheries"],
    afdec_note: "Mozambique's LNG sector is highly relevant to NC energy firms. AfDEC LNG corridor in strategic assessment.",
  },
  MWI: {
    iso3: "MWI", name: "Malawi", region: "south", afdec_priority: false,
    gdp: "$12.7B", gdp_growth: "+3.0%", population: "21M", fdi_inflows: "$0.1B", data_year: 2026,
    headline: "The Warm Heart of Africa — tea, tobacco, and sugar exports anchor one of Southern Africa's most agricultural economies.",
    sectors: ["Tobacco", "Tea", "Sugar", "Agriculture", "Tourism"],
    afdec_note: "AfDEC tracking agribusiness corridor. NC specialty tobacco and tea industry connections under monitoring.",
  },
  NAM: {
    iso3: "NAM", name: "Namibia", region: "south", afdec_priority: false,
    gdp: "$12.4B", gdp_growth: "+3.8%", population: "3M", fdi_inflows: "$0.5B", data_year: 2026,
    headline: "Africa's green hydrogen pioneer — Namibia's green hydrogen ambition positions it as a future renewable energy exporter.",
    sectors: ["Mining (Diamonds, Uranium)", "Green Hydrogen", "Tourism", "Fishing"],
    afdec_note: "Namibia's green hydrogen initiative is a strategic priority for NC clean energy firms. AfDEC monitoring.",
  },
  BWA: {
    iso3: "BWA", name: "Botswana", region: "south", afdec_priority: false,
    gdp: "$22.1B", gdp_growth: "+4.5%", population: "2.7M", fdi_inflows: "$0.3B", data_year: 2026,
    headline: "Africa's diamond exemplar — Botswana turned diamond wealth into the continent's highest governance and human development standards.",
    sectors: ["Diamonds", "Tourism (Safari)", "Beef Exports", "Financial Services"],
    afdec_note: "AfDEC views Botswana as a model governance corridor. NC financial services and luxury tourism tracking.",
  },
  LSO: {
    iso3: "LSO", name: "Lesotho", region: "south", afdec_priority: false,
    gdp: "$2.9B", gdp_growth: "+2.5%", population: "2.2M", fdi_inflows: "$0.07B", data_year: 2026,
    headline: "Mountain kingdom entirely surrounded by South Africa — textiles, diamonds, and water exports form the economic core.",
    sectors: ["Textiles & Garments", "Diamonds", "Water Exports", "Agriculture"],
    afdec_note: "AfDEC monitoring textile manufacturing corridor for NC fashion industry connections.",
  },
  SWZ: {
    iso3: "SWZ", name: "Eswatini", region: "south", afdec_priority: false,
    gdp: "$4.8B", gdp_growth: "+2.2%", population: "1.2M", fdi_inflows: "$0.09B", data_year: 2026,
    headline: "Southern Africa's last absolute monarchy — sugar, soft drink concentrate, and textiles anchor the small export economy.",
    sectors: ["Sugar", "Soft Drink Concentrate", "Textiles", "Agriculture"],
    afdec_note: "AfDEC observation status. NC food & beverage firms tracking Eswatini's specialty concentrate exports.",
  },
};

// Western Sahara — diplomatic neutral tooltip data
const ESH_PROFILE: CountryProfile = {
  iso3: "ESH", name: "Western Sahara", region: "north", afdec_priority: false,
  headline: "Disputed non-self-governing territory. Administered by Morocco pending UN-supervised self-determination referendum.",
  sectors: [],
  afdec_note: "AfDEC maintains diplomatic neutrality on the status of Western Sahara in accordance with AU and UN positions.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip component
// ─────────────────────────────────────────────────────────────────────────────
type TooltipData = {
  name: string;
  iso3: string;
  region: CountryRegion | null;
  profile: CountryProfile | null;
  x: number;
  y: number;
};

function MapTooltip({ data }: { data: TooltipData | null }) {
  if (!data) return null;
  const region = data.region;
  const colors = region ? REGION_COLORS[region] : null;
  const profile = data.profile;

  return (
    <div
      className="fixed z-[200] pointer-events-none"
      style={{ left: data.x + 14, top: data.y - 10, maxWidth: 260 }}
    >
      <div className="bg-zinc-900/98 border border-zinc-700 rounded-lg shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          {colors && (
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors.fill }} />
          )}
          <span className="text-white font-black text-sm tracking-tight">{data.name}</span>
          {data.iso3 === "ESH" && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-800/40">
              Disputed
            </span>
          )}
          {profile?.afdec_priority && (
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0 ml-auto" />
          )}
        </div>

        {data.iso3 === "ESH" ? (
          <div className="px-4 py-3">
            <p className="text-zinc-400 text-[11px] leading-relaxed">{ESH_PROFILE.headline}</p>
          </div>
        ) : profile ? (
          <>
            {/* Key KPIs */}
            <div className="grid grid-cols-2 gap-px bg-zinc-800/50">
              {profile.gdp && (
                <div className="bg-zinc-900/80 px-3 py-2">
                  <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">GDP</div>
                  <div className="text-sm font-black text-blue-400">{profile.gdp}</div>
                </div>
              )}
              {profile.gdp_growth && (
                <div className="bg-zinc-900/80 px-3 py-2">
                  <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Growth</div>
                  <div className="text-sm font-black text-emerald-400">{profile.gdp_growth}</div>
                </div>
              )}
              {profile.population && (
                <div className="bg-zinc-900/80 px-3 py-2">
                  <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Population</div>
                  <div className="text-sm font-black text-zinc-300">{profile.population}</div>
                </div>
              )}
              {profile.fdi_inflows && (
                <div className="bg-zinc-900/80 px-3 py-2">
                  <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">FDI Inflows</div>
                  <div className="text-sm font-black text-amber-400">{profile.fdi_inflows}</div>
                </div>
              )}
            </div>
            {/* Region tag + CTA hint */}
            <div className="px-4 py-2.5 flex items-center justify-between">
              {colors && (
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: colors.fill }}>
                  {colors.label}
                </span>
              )}
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Click for full brief →</span>
            </div>
          </>
        ) : (
          <>
            {/* Country with no profile yet */}
            <div className="px-4 py-3">
              {colors && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: colors.fill }}>
                    {colors.label}
                  </span>
                </div>
              )}
              <p className="text-zinc-500 text-[11px]">Full intelligence brief pending. Admin update coming.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function AfricaMap({ compact = false }: { compact?: boolean }) {
  const [profiles, setProfiles] = useState<Record<string, CountryProfile>>(FALLBACK_PROFILES);
  const [priorityCountries, setPriorityCountries] = useState<CountryProfile[]>(
    Object.values(FALLBACK_PROFILES).filter((c) => c.afdec_priority)
  );
  const [selectedCountry, setSelectedCountry] = useState<CountryProfile | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [dataSource, setDataSource] = useState<"loading" | "live" | "fallback">("loading");
  const [managedEconomies, setManagedEconomies] = useState<any[]>([
    { rank: 1, iso3: "ZAF", name: "South Africa", gdp: "$443.64B", gdp_growth: "+1.2%", region: "south" },
    { rank: 2, iso3: "EGY", name: "Egypt", gdp: "$399.51B", gdp_growth: "+4.1%", region: "north" },
    { rank: 3, iso3: "NGA", name: "Nigeria", gdp: "$334.34B", gdp_growth: "+3.4%", region: "west" },
    { rank: 4, iso3: "DZA", name: "Algeria", gdp: "$284.98B", gdp_growth: "+3.2%", region: "north" },
    { rank: 5, iso3: "MAR", name: "Morocco", gdp: "$196.12B", gdp_growth: "+3.0%", region: "north" },
    { rank: 6, iso3: "ETH", name: "Ethiopia", gdp: "$156.07B", gdp_growth: "+6.2%", region: "east" },
    { rank: 7, iso3: "KEN", name: "Kenya", gdp: "$113.42B", gdp_growth: "+5.0%", region: "east" },
    { rank: 8, iso3: "AGO", name: "Angola", gdp: "$94.1B", gdp_growth: "+2.8%", region: "south" },
    { rank: 9, iso3: "TZA", name: "Tanzania", gdp: "$79.6B", gdp_growth: "+5.1%", region: "east" },
    { rank: 10, iso3: "GHA", name: "Ghana", gdp: "$76.4B", gdp_growth: "+4.4%", region: "west" }
  ]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [geoUrl, setGeoUrl] = useState<string>(GEO_URL);
  const [geoError, setGeoError] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pre-validate GeoJSON URL availability with timeout
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetch(GEO_URL, { signal: controller.signal, method: 'HEAD' })
      .then((res) => {
        clearTimeout(timeout);
        if (!res.ok) {
          setGeoUrl(GEO_URL_FALLBACK);
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        // Primary URL unreachable — try fallback
        setGeoUrl(GEO_URL_FALLBACK);
        // Also try HEAD on fallback to detect total network failure
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 5000);
        fetch(GEO_URL_FALLBACK, { signal: fallbackController.signal, method: 'HEAD' })
          .then((res) => {
            clearTimeout(fallbackTimeout);
            if (!res.ok) setGeoError(true);
          })
          .catch(() => {
            clearTimeout(fallbackTimeout);
            setGeoError(true);
          });
      });

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1280;

  // ── Managed Content: Top Economies ─────────────────────────────────────────
  useEffect(() => {
    async function loadManaged() {
      try {
        const result = await Promise.race([
          supabase.from('managed_content').select('content').eq('slug', 'map_top_economies').single(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ]);
        const cmsData = result.data?.content as any[] | undefined;
        if (cmsData && Array.isArray(cmsData) && cmsData.length >= 10) {
          // Only override when CMS has a complete top-10 set
          setManagedEconomies(cmsData);
        }
      } catch {
        // Supabase unreachable — using default economies
      }
    }
    loadManaged();
  }, []);

  // ── Supabase read (with local fallback + timeout) ─────────────────────────
  useEffect(() => {
    async function fetchProfiles() {
      setDataSource("loading");
      try {
        const result = await Promise.race([
          supabase.from("country_profiles").select("*"),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ]);

        const { data, error } = result;

        if (error || !data || data.length === 0) {
          setDataSource("fallback");
          return;
        }

        const map: Record<string, CountryProfile> = { ...FALLBACK_PROFILES };
        data.forEach((row: CountryProfile) => {
          map[row.iso3] = row;
        });
        setProfiles(map);
        setPriorityCountries(data.filter((c: CountryProfile) => c.afdec_priority));
        setDataSource("live");
      } catch {
        setDataSource("fallback");
      }
    }
    fetchProfiles();
  }, []);

  // ── Country lookup from geo feature ──────────────────────────────────────
  const getCountryISO3 = useCallback((geo: GeoFeature): string | null => {
    // Try direct ISO3 property (Natural Earth sources use iso_a3 / ISO_A3)
    const directIso3 = geo.properties?.iso_a3 ?? geo.properties?.ISO_A3;
    if (directIso3 && directIso3 !== '-99' && NAME_TO_ISO3[directIso3] === undefined) {
      // iso_a3 IS the code; check it's a valid scope code directly
      if (ISO3_REGION[directIso3]) return directIso3;
    }
    // Fall back to name lookup (holtzy world.geojson uses properties.name)
    const name = (geo.properties.name ?? geo.properties.NAME ?? "") as string;
    return NAME_TO_ISO3[name] ?? null;
  }, []);

  const getFillColor = useCallback((geo: GeoFeature): string => {
    const iso3 = getCountryISO3(geo);
    if (!iso3) return "transparent"; // Not an African country — hide it
    if (iso3 === "ESH") return REGION_COLORS.north.fill + "88"; // Semi-transparent for disputed
    const region = ISO3_REGION[iso3];
    if (!region) return "#27272a"; // Uncategorized African territory
    // All countries in the same region render the same base color.
    // Profile availability is shown via tooltip/panel, NOT via color variation.
    // This ensures regional color consistency across all 55 AU nations.
    return REGION_COLORS[region].fill;
  }, [getCountryISO3]);

  const getHoverColor = useCallback((geo: GeoFeature): string => {
    const iso3 = getCountryISO3(geo);
    if (!iso3) return "transparent";
    if (iso3 === "ESH") return REGION_COLORS.north.hover + "aa";
    const region = ISO3_REGION[iso3];
    if (!region) return "#3f3f46";
    return REGION_COLORS[region].hover;
  }, [getCountryISO3]);

  // ── Tooltip handlers ──────────────────────────────────────────────────────
  const handleMouseMove = useCallback((
    geo: GeoFeature,
    evt: React.MouseEvent
  ) => {
    const iso3 = getCountryISO3(geo);
    if (!iso3) { setTooltip(null); return; }

    const countryName = (geo.properties.name ?? geo.properties.NAME ?? iso3) as string;
    const region = ISO3_REGION[iso3] ?? null;
    const profile = iso3 === "ESH" ? ESH_PROFILE : (profiles[iso3] ?? null);

    setTooltip({
      name: iso3 === "ESH" ? "Western Sahara" : countryName,
      iso3,
      region,
      profile,
      x: evt.clientX,
      y: evt.clientY,
    });
  }, [getCountryISO3, profiles]);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const handleCountryClick = useCallback((geo: GeoFeature) => {
    const iso3 = getCountryISO3(geo);
    if (!iso3) return;
    const profile = iso3 === "ESH" ? ESH_PROFILE : profiles[iso3];
    if (profile) {
      setSelectedCountry(profile);
      setTooltip(null);
    }
  }, [getCountryISO3, profiles]);

  return (
    <>
      {/* Floating tooltip — rendered at document level via fixed positioning */}
      <MapTooltip data={tooltip} />

      <div className="relative w-full" ref={mapContainerRef}>
        {/* ── Live Status Bar ── */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 items-center">
          {/* Live indicator */}
          <div className="flex items-center gap-2 mr-4">
            {dataSource === "loading" && (
              <>
                <span className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Connecting...</span>
              </>
            )}
            {dataSource === "live" && (
              <>
                {/* Blinking green pulse */}
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live · Supabase</span>
              </>
            )}
            {dataSource === "fallback" && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Demo Data</span>
              </>
            )}
          </div>
          {/* Region legend */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-3 flex-1">
            {Object.entries(REGION_COLORS).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: val.fill }} />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{val.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AfDEC Priority</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 xl:items-stretch">
          {/* ── Map Canvas ── */}
          <div className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden relative min-h-[420px] sm:min-h-[600px] lg:min-h-[700px]">
            {geoError ? (
              /* ── Offline Fallback UI ── */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
                <div className="w-16 h-16 rounded-full bg-amber-950/40 border border-amber-800/40 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-amber-500" />
                </div>
                <div className="text-center max-w-sm px-4">
                  <h3 className="text-white font-black text-lg mb-2">Map Temporarily Offline</h3>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-4">
                    The intelligence map could not connect to the geospatial data source. Country intelligence data is still available in the panel.
                  </p>
                  <button
                    onClick={() => { setGeoError(false); setGeoUrl(GEO_URL); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors border border-zinc-700"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Retry Connection
                  </button>
                </div>
              </div>
            ) : (
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ 
                scale: isMobile ? 320 : (isTablet ? 360 : 400), 
                center: isMobile ? [18, 5] : [20, 2] 
              }}
              style={{ width: "100%", height: "100%" }}
            >
              <ZoomableGroup zoom={1} center={isMobile ? [18, 5] : [20, 2]} minZoom={0.8} maxZoom={6}>
                <Geographies geography={geoUrl}>
                {({ geographies }: { geographies: GeoFeature[] }) =>
                    geographies.map((geo) => {
                      const iso3 = getCountryISO3(geo);
                      // Hide non-African features entirely
                      if (!iso3 && !ISO3_REGION[iso3 ?? ""]) return null;

                      const fill = getFillColor(geo);
                      if (fill === "transparent") return null;

                      const hover = getHoverColor(geo);

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="#09090b"
                          strokeWidth={0.6}
                          style={{
                            default: { outline: "none", transition: "fill 0.15s ease" },
                            hover: { outline: "none", fill: hover, cursor: "pointer" },
                            pressed: { outline: "none", fill: hover },
                          }}
                          onMouseMove={(evt: React.MouseEvent) => handleMouseMove(geo, evt)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleCountryClick(geo)}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            )}

            {/* Zoom hint */}
            {!geoError && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-zinc-700 font-medium">
              <MapPin className="w-3 h-3" />
              Scroll to zoom · Drag to pan · Click country for brief
            </div>
            )}
          </div>

          {/* ── Country Detail Panel ── */}
          <div className="xl:w-[380px] shrink-0 flex flex-col">
            {selectedCountry ? (
              <div className="bg-zinc-900/80 border border-zinc-700 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: REGION_COLORS[selectedCountry.region].fill }}
                      />
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        {REGION_COLORS[selectedCountry.region].label}
                      </span>
                      {selectedCountry.afdec_priority && (
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 ml-1" />
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-white">{selectedCountry.name}</h3>
                    {selectedCountry.data_year && (
                      <p className="text-xs text-zinc-600 mt-1">Data: {selectedCountry.data_year} · World Bank</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="text-zinc-600 hover:text-white transition-colors p-1 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Headline */}
                {selectedCountry.headline && (
                  <div className="px-6 py-4 border-b border-zinc-800/60">
                    <p className="text-zinc-300 text-sm leading-relaxed font-medium">{selectedCountry.headline}</p>
                  </div>
                )}

                {/* KPIs — only shown if data exists */}
                {(selectedCountry.gdp || selectedCountry.population) && (
                  <div className="grid grid-cols-2 gap-px bg-zinc-800/50">
                    {[
                      { icon: DollarSign, label: "GDP", value: selectedCountry.gdp, color: "text-blue-400" },
                      { icon: TrendingUp, label: "GDP Growth", value: selectedCountry.gdp_growth, color: "text-emerald-400" },
                      { icon: Users, label: "Population", value: selectedCountry.population, color: "text-purple-400" },
                      { icon: Globe, label: "FDI Inflows", value: selectedCountry.fdi_inflows, color: "text-amber-400" },
                    ]
                      .filter((k) => k.value)
                      .map((kpi) => (
                        <div key={kpi.label} className="bg-zinc-900/70 p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{kpi.label}</span>
                          </div>
                          <div className={`text-xl font-black ${kpi.color}`}>{kpi.value}</div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Sectors */}
                {selectedCountry.sectors && selectedCountry.sectors.length > 0 && (
                  <div className="px-6 py-4 border-t border-zinc-800/60">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Key Sectors</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCountry.sectors.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-sm border border-zinc-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AfDEC Intelligence Note */}
                {selectedCountry.afdec_note && (
                  <div className="px-6 pb-4">
                    <div className="bg-blue-950/30 border border-blue-900/40 rounded-sm p-4">
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-2">
                        AfDEC Intelligence
                      </p>
                      <p className="text-blue-200/80 text-xs leading-relaxed font-medium">
                        {selectedCountry.afdec_note}
                      </p>
                    </div>
                  </div>
                )}

                {/* CTA */}
                {selectedCountry.iso3 !== "ESH" && (
                  <div className="px-6 pb-6">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-sm transition-colors group"
                    >
                      Explore {selectedCountry.name} Opportunities
                      <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              /* Default — Top 10 Largest African Economies by GDP 2026 */
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-zinc-800">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Top 10 Economies</h3>
                  </div>
                  <p className="text-[10px] text-zinc-600 font-medium">Largest African Economies by GDP · IMF 2026 Projections</p>
                </div>

                <div className="divide-y divide-zinc-800/60">
                  {managedEconomies.map((entry) => {
                    const profile = profiles[entry.iso3] ?? null;
                    const colors = REGION_COLORS[entry.region as CountryRegion];
                    return (
                      <button
                        key={entry.iso3}
                        onClick={() => profile && setSelectedCountry(profile)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/50 transition-colors text-left group"
                      >
                        {/* Rank badge */}
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-black text-zinc-400">{entry.rank}</span>
                        </div>
                        {/* Region color dot */}
                        {colors && (
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: colors.fill }} />
                        )}
                        {/* Name + GDP */}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors block truncate">
                            {entry.name}
                          </span>
                          <span className="text-[10px] text-zinc-600">{entry.gdp}</span>
                        </div>
                        {/* Growth rate */}
                        <span className="text-[10px] font-black text-emerald-400 shrink-0">{entry.gdp_growth}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-700 group-hover:text-blue-400 transition-colors shrink-0" />
                      </button>
                    );
                  })}
                </div>

                <div className="px-5 py-3 border-t border-zinc-800/60">
                  <p className="text-[9px] text-zinc-700 font-medium">
                    Source: IMF World Economic Outlook · Daba Finance · Click any country for intelligence brief
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
