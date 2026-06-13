import { isFullTerminalPilot, countryDisplayName } from '@/lib/intelligence/country-names';

/** User-facing copy when map panel has no sector rows for a country */
export function mapPanelSectorsEmptyMessage(iso3: string): string {
  const name = countryDisplayName(iso3);
  if (isFullTerminalPilot(iso3)) {
    return `Sector summaries for ${name} are being refreshed. Open the full country terminal for the complete Sectors tab.`;
  }
  return `${name} sector profiles are part of the 74-country rollout. Full sector terminals are live for Nigeria and Jamaica pilots.`;
}
