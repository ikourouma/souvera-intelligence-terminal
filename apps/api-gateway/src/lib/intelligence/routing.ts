/**
 * Centralized country terminal & account routing — pre-scale gate.
 * Use these helpers everywhere (map, nav, CTAs) to avoid drift across 74 countries.
 */

import { PLAN_RANKS, type AccessTier } from '@souvera/entitlements';

/** Minimum plan rank to open /country/[iso3] (Explorer). */
export const MIN_TERMINAL_PLAN_RANK = PLAN_RANKS.explorer;

function buildCountryTabHref(iso3: string, tab: string, section?: string): string {
  const params = new URLSearchParams({ tab });
  if (section) params.set('section', section);
  const hash = section ? `#${section}` : '';
  return `/country/${iso3.toUpperCase()}?${params.toString()}${hash}`;
}

export function planRankFromTier(planId?: string | null): number {
  if (!planId) return PLAN_RANKS.public;
  return PLAN_RANKS[planId as AccessTier] ?? PLAN_RANKS.public;
}

export function canAccessCountryTerminal(
  isAuthenticated: boolean,
  planRank: number
): boolean {
  return isAuthenticated && planRank >= MIN_TERMINAL_PLAN_RANK;
}

export function canAccessCountryTerminalFromMeta(meta: {
  authenticated?: boolean;
  accessTier?: string;
}): boolean {
  return canAccessCountryTerminal(
    meta.authenticated === true,
    planRankFromTier(meta.accessTier)
  );
}

/** Full country intelligence terminal URL. */
export function countryTerminalHref(
  iso3: string,
  options?: { tab?: string; section?: string }
): string {
  const iso = iso3.toUpperCase();
  if (options?.tab) {
    return buildCountryTabHref(iso, options.tab, options.section);
  }
  return `/country/${iso}`;
}

/**
 * Map workspace / drawer CTA: authenticated Explorer+ → terminal; else request access.
 */
export function exploreCountryHref(options: {
  iso3: string;
  countryName: string;
  source?: string;
  isAuthenticated: boolean;
  planRank?: number;
  accessTier?: string;
}): string {
  const rank =
    options.planRank ?? planRankFromTier(options.accessTier);

  if (canAccessCountryTerminal(options.isAuthenticated, rank)) {
    return countryTerminalHref(options.iso3);
  }

  const params = new URLSearchParams({
    country: options.iso3.toUpperCase(),
    name: options.countryName,
    source: options.source ?? 'map-workspace',
    plan: 'explorer',
  });

  if (!options.isAuthenticated) {
    params.set('intent', 'access');
  }

  return `/access/request-access?${params.toString()}`;
}

/** Logged-in users: account dashboard with plan section. Prospects: /access. */
export function managePlanHref(isAuthenticated = true): string {
  return isAuthenticated ? '/profile#subscription' : '/access';
}

/** Map drawer / intelligence panel primary CTA — tier-aware label + href */
export function countryMapPanelCta(options: {
  iso3?: string;
  countryName?: string;
  isAuthenticated: boolean;
  planRank?: number;
  accessTier?: string;
  source?: string;
  region?: 'africa' | 'caribbean' | 'all';
}): { href: string; label: string } {
  const rank = options.planRank ?? planRankFromTier(options.accessTier);
  const canTerminal = canAccessCountryTerminal(options.isAuthenticated, rank);

  if (options.iso3 && options.countryName) {
    return {
      href: exploreCountryHref({
        iso3: options.iso3,
        countryName: options.countryName,
        isAuthenticated: options.isAuthenticated,
        planRank: rank,
        accessTier: options.accessTier,
        source: options.source ?? 'map-workspace',
      }),
      label: canTerminal
        ? `Open ${options.countryName} Terminal`
        : options.isAuthenticated
          ? 'Upgrade to Explorer+'
          : 'Sign In to Explore',
    };
  }

  const region = options.region ?? 'africa';
  const mapHref =
    region === 'caribbean'
      ? '/intelligence/caribbean'
      : region === 'all'
        ? '/intelligence/map?region=all'
        : '/intelligence/africa';

  if (canTerminal) {
    return { href: mapHref, label: 'Explore Market Intelligence' };
  }
  if (options.isAuthenticated) {
    return { href: managePlanHref(true), label: 'Upgrade Your Plan' };
  }
  return {
    href: `/login?redirect=${encodeURIComponent(mapHref)}`,
    label: 'Sign In to Explore',
  };
}

/** Compare / upgrade tiers (marketing comparison page). */
export function comparePlansHref(source?: string): string {
  const params = new URLSearchParams();
  if (source) params.set('source', source);
  const qs = params.toString();
  return `/access${qs ? `?${qs}` : ''}#plan-professional`;
}

/** Login with return path to country terminal after auth. */
export function loginForCountryHref(iso3: string): string {
  const params = new URLSearchParams({
    redirect: countryTerminalHref(iso3),
  });
  return `/login?${params.toString()}`;
}

export function requestAccessForCountryHref(options: {
  iso3: string;
  countryName?: string;
  source?: string;
}): string {
  const params = new URLSearchParams({
    country: options.iso3.toUpperCase(),
    source: options.source ?? 'country-direct',
    plan: 'explorer',
  });
  if (options.countryName) params.set('name', options.countryName);
  return `/access/request-access?${params.toString()}`;
}
