/**
 * A pragmatic SQL formatter.
 *
 * The goal is a readable, predictable layout — not a full SQL parser. It
 * tokenises the statement, leaves string literals and comments untouched,
 * upper-cases keywords, breaks the statement at clause boundaries and indents
 * the select list.
 */

const KEYWORDS = new Set([
  'ADD', 'ALL', 'ALTER', 'AND', 'ANY', 'AS', 'ASC', 'BEGIN', 'BETWEEN', 'BY', 'CASE', 'CAST',
  'CHECK', 'COLUMN', 'COMMIT', 'CONSTRAINT', 'CREATE', 'CROSS', 'CUBE', 'CURRENT', 'DATABASE',
  'DEFAULT', 'DELETE', 'DESC', 'DISTINCT', 'DROP', 'ELSE', 'END', 'EXCEPT', 'EXISTS', 'EXPLAIN',
  'FALSE', 'FETCH', 'FILTER', 'FIRST', 'FOR', 'FOREIGN', 'FROM', 'FULL', 'FUNCTION', 'GROUP',
  'GROUPING', 'HAVING', 'IF', 'ILIKE', 'IN', 'INDEX', 'INNER', 'INSERT', 'INTERSECT', 'INTO',
  'IS', 'JOIN', 'KEY', 'LAST', 'LEFT', 'LIKE', 'LIMIT', 'MATERIALIZED', 'NATURAL', 'NOT', 'NULL',
  'NULLS', 'OFFSET', 'ON', 'ONLY', 'OR', 'ORDER', 'OUTER', 'OVER', 'PARTITION', 'PRIMARY',
  'PROCEDURE', 'RECURSIVE', 'REFERENCES', 'RETURNING', 'RIGHT', 'ROLLBACK', 'ROLLUP', 'ROW',
  'ROWS', 'SELECT', 'SET', 'TABLE', 'THEN', 'TRUE', 'TRUNCATE', 'UNION', 'UNIQUE', 'UPDATE',
  'USING', 'VALUES', 'VIEW', 'WHEN', 'WHERE', 'WINDOW', 'WITH',
]);

/** Clauses that start a new line at the base indentation level. */
const CLAUSE_BREAKS = new Set([
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'UNION', 'EXCEPT',
  'INTERSECT', 'VALUES', 'SET', 'RETURNING', 'WINDOW',
]);

/** Join variants that should stay on one line. */
const JOIN_WORDS = new Set(['JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'OUTER', 'NATURAL']);

interface Token {
  type: 'word' | 'string' | 'number' | 'punct' | 'comment' | 'whitespace';
  value: string;
}

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < sql.length) {
    const char = sql[index]!;
    const next = sql[index + 1];

    if (char === '-' && next === '-') {
      const end = sql.indexOf('\n', index);
      const stop = end === -1 ? sql.length : end;
      tokens.push({ type: 'comment', value: sql.slice(index, stop) });
      index = stop;
      continue;
    }

    if (char === '/' && next === '*') {
      const end = sql.indexOf('*/', index + 2);
      const stop = end === -1 ? sql.length : end + 2;
      tokens.push({ type: 'comment', value: sql.slice(index, stop) });
      index = stop;
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      const quote = char;
      let value = char;
      index += 1;
      while (index < sql.length) {
        const current = sql[index]!;
        value += current;
        index += 1;
        if (current === quote) {
          if (sql[index] === quote) {
            value += quote;
            index += 1;
            continue;
          }
          break;
        }
      }
      tokens.push({ type: 'string', value });
      continue;
    }

    if (/\s/.test(char)) {
      let value = '';
      while (index < sql.length && /\s/.test(sql[index]!)) {
        value += sql[index];
        index += 1;
      }
      tokens.push({ type: 'whitespace', value });
      continue;
    }

    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(sql[index + 1] ?? ''))) {
      let value = '';
      while (index < sql.length && /[0-9._]/.test(sql[index]!)) {
        value += sql[index];
        index += 1;
      }
      tokens.push({ type: 'number', value });
      continue;
    }

    if (/[A-Za-z_@#]/.test(char)) {
      let value = '';
      while (index < sql.length && /[A-Za-z0-9_@$#.]/.test(sql[index]!)) {
        value += sql[index];
        index += 1;
      }
      tokens.push({ type: 'word', value });
      continue;
    }

    tokens.push({ type: 'punct', value: char });
    index += 1;
  }

  return tokens;
}

export interface SqlFormatOptions {
  indent?: number;
  keywordCase?: 'upper' | 'lower' | 'preserve';
  upperCase?: boolean;
}

export function formatSql(sql: string, options: SqlFormatOptions = {}): string {
  const indentSize = options.indent ?? 2;
  const keywordCase = options.keywordCase ?? 'upper';
  const tokens = tokenize(sql);

  const out: string[] = [];
  let depth = 0;
  let line = '';
  let inSelectList = false;
  let pendingComma = false;

  const indentText = () => ' '.repeat(depth * indentSize);

  const flushLine = () => {
    const trimmed = line.trim();
    if (trimmed) out.push(indentText() + trimmed);
    line = '';
  };

  const caseWord = (value: string): string => {
    if (keywordCase === 'preserve') return value;
    const upper = value.toUpperCase();
    if (KEYWORDS.has(upper)) {
      return keywordCase === 'upper' ? upper : value.toLowerCase();
    }
    return value;
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]!;

    if (token.type === 'whitespace') continue;

    if (token.type === 'comment') {
      flushLine();
      out.push(indentText() + token.value.trim());
      continue;
    }

    if (token.type === 'string' || token.type === 'number') {
      line += (line && !line.endsWith(' ') ? ' ' : '') + token.value;
      pendingComma = false;
      continue;
    }

    if (token.type === 'punct') {
      if (token.value === '(') {
        depth += 1;
        line += ' (';
        inSelectList = false;
        continue;
      }
      if (token.value === ')') {
        depth = Math.max(0, depth - 1);
        line += ')';
        inSelectList = false;
        continue;
      }
      if (token.value === ',') {
        if (inSelectList) {
          flushLine();
          line = '';
          pendingComma = true;
          line = '';
        } else {
          line += ', ';
        }
        continue;
      }
      if (token.value === ';') {
        flushLine();
        out.push(';');
        continue;
      }
      if (token.value === '.') {
        line += '.';
        continue;
      }
      line += token.value;
      continue;
    }

    // Word token.
    const upper = token.value.toUpperCase();
    const isKeyword = KEYWORDS.has(upper);

    // Look ahead to see whether this word begins a multi-word clause.
    const nextWord = (() => {
      for (let ahead = index + 1; ahead < tokens.length; ahead += 1) {
        const candidate = tokens[ahead]!;
        if (candidate.type === 'whitespace') continue;
        if (candidate.type === 'word') return candidate.value.toUpperCase();
        return '';
      }
      return '';
    })();

    if (upper === 'SELECT') {
      flushLine();
      line = 'SELECT';
      inSelectList = true;
      continue;
    }

    if (upper === 'FROM' || upper === 'WHERE' || upper === 'HAVING' || upper === 'LIMIT' || upper === 'OFFSET' || upper === 'VALUES' || upper === 'RETURNING' || upper === 'SET') {
      flushLine();
      line = upper;
      inSelectList = false;
      continue;
    }

    if (upper === 'GROUP' && nextWord === 'BY') {
      flushLine();
      line = 'GROUP BY';
      inSelectList = false;
      index += 1;
      continue;
    }

    if (upper === 'ORDER' && nextWord === 'BY') {
      flushLine();
      line = 'ORDER BY';
      inSelectList = false;
      index += 1;
      continue;
    }

    if (upper === 'PARTITION' && nextWord === 'BY') {
      flushLine();
      line = 'PARTITION BY';
      inSelectList = false;
      index += 1;
      continue;
    }

    if (upper === 'UNION' || upper === 'EXCEPT' || upper === 'INTERSECT') {
      flushLine();
      line = upper;
      inSelectList = false;
      continue;
    }

    if (JOIN_WORDS.has(upper)) {
      // "LEFT JOIN", "INNER JOIN" and friends stay together.
      if (line.trim() && !/join$/i.test(line.trim())) {
        // fall through and append to the current line
      }
      line += (line ? ' ' : '') + caseWord(token.value);
      if (upper === 'JOIN') inSelectList = false;
      continue;
    }

    if (upper === 'ON' || upper === 'AND' || upper === 'OR' || upper === 'AS' || upper === 'IN' || upper === 'IS' || upper === 'NOT' || upper === 'LIKE' || upper === 'ILIKE' || upper === 'BETWEEN' || upper === 'CASE' || upper === 'WHEN' || upper === 'THEN' || upper === 'ELSE' || upper === 'END' || upper === 'DISTINCT' || upper === 'ALL' || upper === 'EXISTS' || upper === 'OVER' || upper === 'PARTITION' || upper === 'FILTER' || upper === 'USING' || upper === 'WITHIN' || upper === 'RECURSIVE' || upper === 'BY') {
      line += (line ? ' ' : '') + caseWord(token.value);
      continue;
    }

    if (pendingComma) {
      // A select-list continuation.
      pendingComma = false;
      line = caseWord(token.value);
      continue;
    }

    line += (line && !line.endsWith(' ') ? ' ' : '') + caseWord(token.value);
  }

  flushLine();

  // Post-process: keep "ON" conditions with their join, tidy spacing.
  return out
    .join('\n')
    .replace(/([A-Za-z0-9_\])])\s+\(/g, '$1(')
    .replace(/\s+,\s+/g, ', ')
    .replace(/([<>]=?|<>|!=|::)/g, ' $1 ')
    .replace(/ +/g, ' ')
    .replace(/ \n/g, '\n')
    .replace(/\n /g, '\n')
    .trim();
}
