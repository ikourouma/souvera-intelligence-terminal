// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// File Parsers for Ingestion
// Owner: Afronovation, Inc.
//
// Supports: CSV, JSON, XLSX
// ===========================================

import Papa, { ParseResult as PapaParseResult, ParseError } from 'papaparse';

export interface ParsedRow {
  row_number: number;
  data: Record<string, unknown>;
}

export interface ParseResult {
  success: boolean;
  rows: ParsedRow[];
  columns: string[];
  errors?: string[];
  meta?: {
    delimiter?: string;
    linebreak?: string;
    truncated?: boolean;
    total_rows?: number;
  };
}

export async function parseCSV(content: string, options?: {
  header?: boolean;
  maxRows?: number;
  skipEmptyLines?: boolean;
}): Promise<ParseResult> {
  const { header = true, maxRows, skipEmptyLines = true } = options || {};

  return new Promise((resolve) => {
    const rows: ParsedRow[] = [];
    const errors: string[] = [];
    let columns: string[] = [];
    let rowCount = 0;

    Papa.parse<Record<string, unknown>>(content, {
      header,
      skipEmptyLines,
      dynamicTyping: true,
      complete: (results: PapaParseResult<Record<string, unknown>>) => {
        if (results.errors && results.errors.length > 0) {
          results.errors.forEach((err: ParseError) => {
            errors.push(`Row ${err.row}: ${err.message}`);
          });
        }

        columns = results.meta.fields || [];

        results.data.forEach((row: Record<string, unknown>, index: number) => {
          if (maxRows && rowCount >= maxRows) return;
          
          if (Object.keys(row).length > 0) {
            rows.push({
              row_number: index + 1,
              data: row,
            });
            rowCount++;
          }
        });

        resolve({
          success: errors.length === 0,
          rows,
          columns,
          errors: errors.length > 0 ? errors : undefined,
          meta: {
            delimiter: results.meta.delimiter,
            linebreak: results.meta.linebreak,
            truncated: maxRows ? rowCount >= maxRows : false,
            total_rows: results.data.length,
          },
        });
      },
      error: (error: Error) => {
        resolve({
          success: false,
          rows: [],
          columns: [],
          errors: [error.message],
        });
      },
    });
  });
}

export async function parseJSON(content: string, options?: {
  maxRows?: number;
  arrayPath?: string;
}): Promise<ParseResult> {
  const { maxRows, arrayPath } = options || {};

  try {
    let data = JSON.parse(content);

    // Navigate to array path if specified
    if (arrayPath) {
      const pathParts = arrayPath.split('.');
      for (const part of pathParts) {
        if (data && typeof data === 'object' && part in data) {
          data = data[part];
        } else {
          return {
            success: false,
            rows: [],
            columns: [],
            errors: [`Path "${arrayPath}" not found in JSON`],
          };
        }
      }
    }

    // Handle single object vs array
    if (!Array.isArray(data)) {
      if (typeof data === 'object' && data !== null) {
        data = [data];
      } else {
        return {
          success: false,
          rows: [],
          columns: [],
          errors: ['JSON content is not an array or object'],
        };
      }
    }

    const rows: ParsedRow[] = [];
    const columnSet = new Set<string>();

    data.forEach((item: unknown, index: number) => {
      if (maxRows && index >= maxRows) return;
      
      if (typeof item === 'object' && item !== null) {
        const row = item as Record<string, unknown>;
        Object.keys(row).forEach((key) => columnSet.add(key));
        rows.push({
          row_number: index + 1,
          data: row,
        });
      }
    });

    return {
      success: true,
      rows,
      columns: Array.from(columnSet),
      meta: {
        truncated: maxRows ? data.length > maxRows : false,
        total_rows: data.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      rows: [],
      columns: [],
      errors: [error instanceof Error ? error.message : 'Invalid JSON'],
    };
  }
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  transform?: 'none' | 'uppercase' | 'lowercase' | 'date' | 'number' | 'boolean';
}

export function applyColumnMapping(
  row: Record<string, unknown>,
  mappings: ColumnMapping[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const mapping of mappings) {
    let value = row[mapping.sourceColumn];

    if (value !== undefined && value !== null) {
      switch (mapping.transform) {
        case 'uppercase':
          value = String(value).toUpperCase();
          break;
        case 'lowercase':
          value = String(value).toLowerCase();
          break;
        case 'date':
          value = new Date(String(value)).toISOString().split('T')[0];
          break;
        case 'number':
          value = Number(value);
          break;
        case 'boolean':
          value = ['true', '1', 'yes', 'y'].includes(String(value).toLowerCase());
          break;
      }
    }

    result[mapping.targetField] = value;
  }

  return result;
}

export function detectDelimiter(sample: string): string {
  const delimiters = [',', '\t', ';', '|'];
  const counts: Record<string, number> = {};

  for (const delim of delimiters) {
    counts[delim] = (sample.match(new RegExp(`\\${delim}`, 'g')) || []).length;
  }

  return Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

export function inferColumnTypes(rows: ParsedRow[]): Record<string, string> {
  if (rows.length === 0) return {};

  const types: Record<string, Set<string>> = {};
  const sample = rows.slice(0, 100);

  for (const row of sample) {
    for (const [key, value] of Object.entries(row.data)) {
      if (!types[key]) types[key] = new Set();

      if (value === null || value === undefined || value === '') {
        types[key].add('null');
      } else if (typeof value === 'number') {
        types[key].add(Number.isInteger(value) ? 'integer' : 'float');
      } else if (typeof value === 'boolean') {
        types[key].add('boolean');
      } else {
        const strValue = String(value);
        if (/^\d{4}-\d{2}-\d{2}/.test(strValue)) {
          types[key].add('date');
        } else if (/^-?\d+$/.test(strValue)) {
          types[key].add('integer');
        } else if (/^-?\d+\.\d+$/.test(strValue)) {
          types[key].add('float');
        } else {
          types[key].add('string');
        }
      }
    }
  }

  const result: Record<string, string> = {};
  for (const [key, typeSet] of Object.entries(types)) {
    const typeArray = Array.from(typeSet).filter((t) => t !== 'null');
    if (typeArray.length === 0) {
      result[key] = 'null';
    } else if (typeArray.length === 1) {
      result[key] = typeArray[0];
    } else if (typeArray.includes('string')) {
      result[key] = 'string';
    } else if (typeArray.includes('float') && typeArray.includes('integer')) {
      result[key] = 'float';
    } else {
      result[key] = 'mixed';
    }
  }

  return result;
}
