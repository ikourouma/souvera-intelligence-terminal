/**
 * Souvera institutional report brand tokens (PDF / HTML templates).
 */

export const SOUVERA_REPORT_BRAND = {
  /** Deep navy — primary cover & table headers */
  navy: '#0B1220',
  navyMid: '#0F172A',
  navyLight: '#1E293B',
  /** Terminal emerald — growth / signal accent */
  emerald: '#10B981',
  emeraldLight: '#34D399',
  /** Intelligence cyan — links & highlights */
  cyan: '#06B6D4',
  /** Institutional gold — cover rule & TOC accent */
  gold: '#C9A227',
  goldMuted: '#A8841A',
  /** Content */
  ink: '#1A1A1F',
  slate: '#64748B',
  border: '#E2E8F0',
  cardBg: '#F4F4F5',
  cardBgAlt: '#F8FAFC',
  white: '#F8FAFC',
} as const;

export const SOUVERA_CONTACT = {
  hqLabel: 'Souvera HQ',
  addressLine1: '127 Long Shadow Ln',
  addressLine2: 'Cary, NC 27510',
  website: 'https://souveraterminal.com',
  websiteDisplay: 'souveraterminal.com',
  email: 'intelligence@souveraterminal.com',
  division: 'Souvera Intelligence Terminal · Research Division',
  classification: 'Professional Intelligence · Licensed subscriber use only',
} as const;

/** Cover gradient — deep navy throughout; subtle emerald only upper-right (no bottom fade). */
export const COVER_GRADIENT = `linear-gradient(180deg, ${SOUVERA_REPORT_BRAND.navy} 0%, ${SOUVERA_REPORT_BRAND.navyMid} 42%, ${SOUVERA_REPORT_BRAND.navy} 100%)`;

/** Optional accent wash — top-right only, keeps footer band dark */
export const COVER_GRADIENT_ACCENT = `radial-gradient(ellipse 90% 70% at 92% 8%, rgba(16, 185, 129, 0.14) 0%, transparent 62%)`;
