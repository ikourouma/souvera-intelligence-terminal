// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Environment Configuration
// Owner: Afronovation, Inc.
// ===========================================

export function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? '';
}

export const env = {
  supabase: {
    url: () => getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: () => getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: () => getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  },
  apiKeys: {
    openExchangeRates: () => getEnvVar('OPEN_EXCHANGE_RATES_API_KEY', false),
    newsApi: () => getEnvVar('NEWSAPI_KEY', false),
    unComtrade: () => getEnvVar('UN_COMTRADE_API_KEY', false),
    afdb: () => getEnvVar('AFDB_API_KEY', false),
    tradingEconomics: () => getEnvVar('TRADING_ECONOMICS_API_KEY', false),
    iea: () => getEnvVar('IEA_API_TOKEN', false),
  },
  app: {
    env: () => getEnvVar('APP_ENV', false) || 'dev',
    isProduction: () => getEnvVar('APP_ENV', false) === 'prod',
  },
} as const;

// External API base URLs (no keys required for public APIs)
export const DATA_SOURCE_URLS = {
  worldBank: 'https://api.worldbank.org/v2',
  imf: 'https://api.imf.org',
  oecd: 'https://sdmx.oecd.org/public/rest/v1',
  restCountries: 'https://restcountries.com/v3.1',
  unComtrade: 'https://comtradeapi.un.org',
  openExchangeRates: 'https://openexchangerates.org/api',
  gdelt: 'https://api.gdeltproject.org/api/v2',
  newsApi: 'https://newsapi.org/v2',
  afdb: 'https://apiportal.opendataforafrica.org',
  tradingEconomics: 'https://api.tradingeconomics.com',
  iea: 'https://api.iea.org',
} as const;
