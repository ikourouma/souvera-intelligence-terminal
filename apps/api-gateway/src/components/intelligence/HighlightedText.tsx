'use client';

/**
 * HighlightedText — highlights currency values and percentages in narrative text.
 * 
 * Used across Trade Intelligence modules to emphasize key figures in Souvera analysis.
 * 
 * Highlighting rules:
 * - Currency values ($620M, $1.33B/yr) → emerald color
 * - Percentages (16.3%, 35%) → blue color
 */

interface HighlightedTextProps {
  text: string;
  currencyClass?: string;
  percentClass?: string;
}

export function HighlightedText({
  text,
  currencyClass = 'text-emerald-300 font-semibold',
  percentClass = 'text-blue-300 font-semibold',
}: HighlightedTextProps) {
  const parts = text.split(/(\$[\d,.]+[BMK]?(?:\/yr)?|\d+\.?\d*%)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (/^\$[\d,.]+[BMK]?(?:\/yr)?$/.test(part)) {
          return <span key={i} className={currencyClass}>{part}</span>;
        }
        if (/^\d+\.?\d*%$/.test(part)) {
          return <span key={i} className={percentClass}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
