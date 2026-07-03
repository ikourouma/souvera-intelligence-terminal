export interface StructuredKeyPlayer {
  name: string;
  sector: string;
  description: string;
  metric: string;
}

/** Coerce DB string[] or partial objects into structured key players for UI. */
export function normalizeKeyPlayers(
  raw: unknown,
  sectorLabel: string
): StructuredKeyPlayer[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  if (typeof raw[0] === 'string') {
    return (raw as string[]).map((name) => ({
      name: String(name),
      sector: sectorLabel,
      description: `Key participant in the ${sectorLabel.toLowerCase()} value chain`,
      metric: 'Sector anchor',
    }));
  }
  return (raw as StructuredKeyPlayer[]).filter((p) => p?.name);
}
