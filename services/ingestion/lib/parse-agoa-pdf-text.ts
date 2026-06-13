/**
 * Parse USTR AGOA beneficiary PDF text into eligible / ineligible ISO3 sets.
 */

import { iso3FromMention, matchIso3InBlob } from './country-name-iso3';

function sectionBounds(text: string): { eligible: string; ineligible: string } {
  const lower = text.toLowerCase();
  const eligibleStart = lower.search(/agoa eligible countries|eligible countries\s*[\r\n]/);
  const ineligibleStart = lower.search(/agoa ineligible countries|ineligible countries\s*[\r\n]/);

  if (eligibleStart >= 0 && ineligibleStart > eligibleStart) {
    return {
      eligible: text.slice(eligibleStart, ineligibleStart),
      ineligible: text.slice(ineligibleStart),
    };
  }
  if (ineligibleStart >= 0) {
    return { eligible: text.slice(0, ineligibleStart), ineligible: text.slice(ineligibleStart) };
  }
  return { eligible: text, ineligible: '' };
}

function iso3FromNumberedLines(section: string): Set<string> {
  const found = new Set<string>();
  for (const line of section.split(/\r?\n/)) {
    const cleaned = line.replace(/^\d+\.\s*/, '').trim();
    if (!cleaned || cleaned.length < 3) continue;
    const iso = iso3FromMention(cleaned, 'africa');
    if (iso) found.add(iso);
  }
  return found;
}

export function parseAgoaPdfText(text: string): {
  eligible: Set<string>;
  ineligible: Set<string>;
  parseOk: boolean;
} {
  const { eligible: eligibleSection, ineligible: ineligibleSection } = sectionBounds(text);

  const eligibleFromLines = iso3FromNumberedLines(eligibleSection);
  const ineligibleFromLines = iso3FromNumberedLines(ineligibleSection);

  const eligible =
    eligibleFromLines.size >= 10
      ? eligibleFromLines
      : matchIso3InBlob(eligibleSection, 'africa');

  const ineligibleRaw =
    ineligibleFromLines.size >= 1
      ? ineligibleFromLines
      : matchIso3InBlob(ineligibleSection, 'africa');

  const ineligible = new Set([...ineligibleRaw].filter((iso) => !eligible.has(iso)));
  const parseOk = eligible.size >= 10;

  return { eligible, ineligible, parseOk };
}
