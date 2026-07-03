/**
 * Audit the Overview tab's market-access source vs hardcoded fallback for consistency.
 *
 * 1. Resolves the authoritative vault-derived market-access frameworks (what actually renders).
 * 2. Compares the AGOA status against the hardcoded static fallback in country-overview-content.ts
 *    for the markets that carry a hardcoded AGOA status (wave1 Africa + NGA + KEN).
 * Read-only. Run: npx tsx apps/api-gateway/scripts/audit-overview-marketaccess.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { resolveMarketAccessForCountry } from '../src/lib/intelligence/trade-policy-vault';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Hardcoded AGOA status strings currently in country-overview-content.ts.
const HARDCODED_AGOA: Record<string, string> = {
  GHA: 'Active · AGOA eligible',
  ZAF: 'Active · AGOA eligible',
  ETH: 'Ineligible · terminated Jan 2022',
  SEN: 'Active · AGOA eligible',
  CIV: 'Active · AGOA eligible',
  TZA: 'Active · AGOA eligible',
  NGA: 'Active · AGOA eligible',
  KEN: 'Active · AGOA eligible',
};

/** Normalise a status into a coarse class for narrative comparison. */
function classify(s: string): 'eligible' | 'ineligible' | 'suspended' | 'review' | 'other' {
  const lc = s.toLowerCase();
  if (/under review/.test(lc)) return 'review';
  if (/ineligible|terminated|not a current/.test(lc)) return 'ineligible';
  if (/suspend/.test(lc)) return 'suspended';
  if (/eligible|active/.test(lc)) return 'eligible';
  return 'other';
}

/** Map vault status to the same coarse class. */
function classifyVault(status: string): 'eligible' | 'ineligible' | 'suspended' | 'review' | 'other' {
  if (status === 'active' || status === 'eligible') return 'eligible';
  if (status === 'ineligible' || status === 'graduated' || status === 'not_applicable') return 'ineligible';
  if (status === 'suspended') return 'suspended';
  if (status === 'info') return 'review';
  return 'other';
}

async function main() {
  console.log('\n=== Overview market-access: vault (live) vs hardcoded fallback ===\n');
  console.log('ISO3 | vault status | vault statusLabel | hardcoded fallback | consistent?');
  console.log('-----|--------------|-------------------|--------------------|-----------');

  for (const iso3 of Object.keys(HARDCODED_AGOA)) {
    const frameworks = await resolveMarketAccessForCountry(iso3);
    const agoa = frameworks.find((f) => f.label === 'AGOA');
    const vaultStatus = agoa?.status ?? 'NONE';
    const vaultLabel = agoa?.statusLabel ?? '-';
    const hard = HARDCODED_AGOA[iso3];
    const consistent = classify(hard) === classifyVault(vaultStatus);

    console.log(
      `${iso3}  | ${vaultStatus.padEnd(12)} | ${vaultLabel.padEnd(17)} | ${hard.padEnd(32)} | ${consistent ? 'yes' : 'NO  <-- FIX'}`
    );
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
