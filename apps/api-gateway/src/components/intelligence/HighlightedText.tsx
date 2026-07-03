'use client';

/**
 * HighlightedText — highlights currency values, percentages, and risk metrics in narrative text.
 * 
 * Used across Trade Intelligence modules to emphasize key figures in Souvera analysis.
 * 
 * Highlighting rules:
 * - Currency values ($620M, $1.33B/yr) → emerald color
 * - Large currency values ($1B+) → emerald + bold
 * - Percentages (16.3%, 35%) → blue color
 * - Risk/inflation context (inflation: 15.0%) → amber color
 */

interface HighlightedTextProps {
  text: string;
  currencyClass?: string;
  largeCurrencyClass?: string;
  percentClass?: string;
  riskClass?: string;
}

/** Check if a currency value is "large" (billions) */
function isLargeCurrency(value: string): boolean {
  return /B(?:\/yr)?$/i.test(value);
}

/** Check if text segment is preceded by risk/inflation context */
function isRiskContext(fullText: string, matchIndex: number): boolean {
  const precedingText = fullText.slice(Math.max(0, matchIndex - 30), matchIndex).toLowerCase();
  return /(?:inflation|risk|debt|volatility|deficit)[:\s]*$/i.test(precedingText);
}

export function HighlightedText({
  text,
  currencyClass = 'text-emerald-300 font-semibold',
  largeCurrencyClass = 'text-emerald-300 font-bold',
  percentClass = 'text-blue-300 font-semibold',
  riskClass = 'text-amber-300 font-semibold',
}: HighlightedTextProps) {
  const pattern = /(\$[\d,.]+[BMK]?(?:\/yr)?|\d+\.?\d*%)/g;
  const parts: { text: string; type: 'currency' | 'largeCurrency' | 'percent' | 'riskPercent' | 'plain'; index: number }[] = [];
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), type: 'plain', index: lastIndex });
    }
    
    const matchedText = match[0];
    const matchIndex = match.index;
    
    if (/^\$/.test(matchedText)) {
      const isLarge = isLargeCurrency(matchedText);
      parts.push({ text: matchedText, type: isLarge ? 'largeCurrency' : 'currency', index: matchIndex });
    } else if (/^\d+\.?\d*%$/.test(matchedText)) {
      const isRisk = isRiskContext(text, matchIndex);
      parts.push({ text: matchedText, type: isRisk ? 'riskPercent' : 'percent', index: matchIndex });
    }
    
    lastIndex = pattern.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), type: 'plain', index: lastIndex });
  }
  
  return (
    <>
      {parts.map((part, i) => {
        switch (part.type) {
          case 'currency':
            return <span key={i} className={currencyClass}>{part.text}</span>;
          case 'largeCurrency':
            return <span key={i} className={largeCurrencyClass}>{part.text}</span>;
          case 'percent':
            return <span key={i} className={percentClass}>{part.text}</span>;
          case 'riskPercent':
            return <span key={i} className={riskClass}>{part.text}</span>;
          default:
            return <span key={i}>{part.text}</span>;
        }
      })}
    </>
  );
}
