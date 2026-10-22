/**
 * CSV parsing and serialisation.
 *
 * Implements RFC 4180 quoting rules: a field may be wrapped in double quotes,
 * inner quotes are doubled, and a quoted field may contain the delimiter or
 * newlines.
 */

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
  /** Rows whose field count does not match the header count. */
  ragged: { row: number; fields: number; expected: number }[];
  delimiter: string;
}

const CANDIDATE_DELIMITERS = [',', ';', '\t', '|'];

export function detectDelimiter(text: string): string {
  const sample = text.split(/\r?\n/).slice(0, 12).filter(Boolean);
  let best = ',';
  let bestScore = -1;
  for (const delimiter of CANDIDATE_DELIMITERS) {
    const counts = sample.map((line) => countOutsideQuotes(line, delimiter));
    const total = counts.reduce((sum, value) => sum + value, 0);
    if (total === 0) continue;
    const consistent = counts.every((value) => value === counts[0]);
    const score = total * (consistent ? 10 : 1);
    if (score > bestScore) {
      bestScore = score;
      best = delimiter;
    }
  }
  return best;
}

function countOutsideQuotes(line: string, delimiter: string): number {
  let count = 0;
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]!;
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        index += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && char === delimiter) count += 1;
  }
  return count;
}

export function parseCsv(text: string, delimiter?: string): ParsedCsv {
  const separator = delimiter ?? detectDelimiter(text);
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;
  let index = 0;

  const endField = () => {
    record.push(field);
    field = '';
  };
  const endRecord = () => {
    endField();
    records.push(record);
    record = [];
  };

  while (index < text.length) {
    const char = text[index]!;

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }
        inQuotes = false;
        index += 1;
        continue;
      }
      field += char;
      index += 1;
      continue;
    }

    if (char === '"' && field === '') {
      inQuotes = true;
      index += 1;
      continue;
    }
    if (char === separator) {
      endField();
      index += 1;
      continue;
    }
    if (char === '\r') {
      index += 1;
      continue;
    }
    if (char === '\n') {
      endRecord();
      index += 1;
      continue;
    }
    field += char;
    index += 1;
  }

  if (field !== '' || record.length > 0) endRecord();

  const [headerRow, ...body] = records;
  if (!headerRow) {
    return { headers: [], rows: [], ragged: [], delimiter: separator };
  }

  const headers = headerRow.map((name) => name.trim());
  const ragged: ParsedCsv['ragged'] = [];
  const rows = body.map((row, rowIndex) => {
    if (row.length !== headers.length) {
      ragged.push({ row: rowIndex + 1, fields: row.length, expected: headers.length });
    }
    return row;
  });

  return { headers, rows, ragged, delimiter: separator };
}

export function serializeCsv(
  headers: string[],
  rows: string[][],
  delimiter = ','
): string {
  const escape = (value: string): string => {
    if (value.includes(delimiter) || value.includes('"') || /[\r\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };
  const lines = [headers.map(escape).join(delimiter)];
  for (const row of rows) lines.push(row.map(escape).join(delimiter));
  return lines.join('\n');
}

/* -------------------------------------------------------------------------- */
/* Type coercion                                                              */
/* -------------------------------------------------------------------------- */

export function coerceValue(raw: string, coerce: boolean): unknown {
  if (!coerce) return raw;
  const value = raw.trim();
  if (value === '') return '';
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (/^-?\d*\.\d+$/.test(value)) return Number(value);
  return raw;
}
