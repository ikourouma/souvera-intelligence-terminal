/**
 * Resolve economic momentum and investor readiness for the SignalMomentumRow.
 * Profile fields are stored as text; signal_scores holds numeric investment/confidence.
 */

export interface MomentumInputs {
  profileMomentum?: string | number | null;
  profileReadiness?: string | number | null;
  investmentScore?: number | null;
  growthScore?: number | null;
  gdpGrowthPct?: number | null;
}

export interface ResolvedMomentum {
  economicMomentum: number | null;
  investorReadiness: number | null;
}

function parseNumeric(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Map GDP growth % to momentum index roughly in [-100, 100]. */
function gdpGrowthToMomentum(gdpGrowthPct: number): number {
  // Baseline ~3% global EM growth → 0; each +1% ≈ +12 points
  return Math.max(-100, Math.min(100, Math.round((gdpGrowthPct - 3) * 12)));
}

export function resolveMomentum(inputs: MomentumInputs): ResolvedMomentum {
  let economicMomentum = parseNumeric(inputs.profileMomentum ?? null);
  let investorReadiness = parseNumeric(inputs.profileReadiness ?? null);

  if (economicMomentum == null && inputs.gdpGrowthPct != null) {
    economicMomentum = gdpGrowthToMomentum(inputs.gdpGrowthPct);
  }

  if (investorReadiness == null && inputs.investmentScore != null) {
    investorReadiness = Math.round(inputs.investmentScore);
  }

  if (investorReadiness == null && inputs.growthScore != null) {
    investorReadiness = Math.round(inputs.growthScore);
  }

  return { economicMomentum, investorReadiness };
}

/** Momentum index band label (Option A — single line, no bullets). */
export interface MomentumBand {
  label: string;
  clause: string | null;
}

const MOMENTUM_CLAUSE: Record<string, string> = {
  NGA: 'reforms + tech expansion',
  JAM: 'tourism + nearshore services',
  KEN: 'fintech + logistics gateway',
};

export function getMomentumBand(
  index: number | null,
  iso3: string
): MomentumBand {
  if (index == null) {
    return { label: 'Pending', clause: null };
  }

  let label: string;
  if (index >= 60) label = 'Strong acceleration';
  else if (index >= 30) label = 'Accelerating';
  else if (index >= 0) label = 'Steady expansion';
  else if (index >= -30) label = 'Slowing';
  else label = 'Decelerating';

  const clause = MOMENTUM_CLAUSE[iso3.toUpperCase()] ?? 'macro indicators trending';
  return { label, clause };
}

export function assertMomentumBandPurity(iso3: string, band: MomentumBand): void {
  if (band.clause == null) return;
  const upper = iso3.toUpperCase();
  const clause = band.clause.toLowerCase();

  if (upper === 'JAM' && clause === 'reforms + tech expansion') {
    throw new Error('JAM momentum band contaminated with NGA clause');
  }
  if (upper === 'NGA' && clause === 'tourism + nearshore services') {
    throw new Error('NGA momentum band contaminated with JAM clause');
  }
}

export const PROFILE_MOMENTUM_DEFAULTS: Record<
  string,
  { economicMomentum: number; investorReadiness: number }
> = {
  NGA: { economicMomentum: 55, investorReadiness: 74 },
  JAM: { economicMomentum: 28, investorReadiness: 68 },
  KEN: { economicMomentum: 38, investorReadiness: 72 },
};
