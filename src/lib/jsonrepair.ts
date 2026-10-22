/**
 * JSON repair and JSON Schema validation.
 *
 * Both run entirely on the client. The repair logic applies the common
 * syntax faults in order, from the safe to the risky, and reports every
 * change it made so the result is auditable rather than a black box.
 */

export interface RepairResult {
  ok: boolean;
  value?: unknown;
  text?: string;
  error?: string;
  fixes: string[];
}

const SMART_QUOTES: Record<string, string> = {
  '\u201C': '"',
  '\u201D': '"',
  '\u2018': "'",
  '\u2019': "'",
  '\u00AB': '"',
  '\u00BB': '"',
  '\u201E': '"',
  '\u201A': "'",
  '\u2032': "'",
  '\u2033': '"',
};

export function normaliseSmartQuotes(input: string): string {
  let out = '';
  let changed = false;
  for (const char of input) {
    const replacement = SMART_QUOTES[char];
    if (replacement) {
      out += replacement;
      changed = true;
    } else {
      out += char;
    }
  }
  return changed ? out : input;
}

/** Removes `//` and block comments that are outside of string literals. */
export function stripComments(input: string): { text: string; removed: boolean } {
  let out = '';
  let removed = false;
  let inString = false;
  let quote = '';

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]!;
    const next = input[index + 1]!;

    if (inString) {
      out += char;
      if (char === '\\') {
        out += input[index + 1] ?? '';
        index += 1;
        continue;
      }
      if (char === quote) inString = false;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      out += char;
      continue;
    }

    if (char === '/' && next === '/') {
      const end = input.indexOf('\n', index);
      const stop = end === -1 ? input.length : end;
      out += ' '.repeat(stop - index);
      index = stop - 1;
      removed = true;
      continue;
    }

    if (char === '/' && next === '*') {
      const end = input.indexOf('*/', index + 2);
      const stop = end === -1 ? input.length : end + 2;
      out += ' '.repeat(stop - index);
      index = stop - 1;
      removed = true;
      continue;
    }

    out += char;
  }

  return { text: out, removed };
}

/** Removes trailing commas before a closing brace or bracket. */
export function stripTrailingCommas(input: string): { text: string; removed: number } {
  let out = '';
  let removed = 0;
  let inString = false;
  let quote = '';

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]!;

    if (inString) {
      out += char;
      if (char === '\\') {
        out += input[index + 1] ?? '';
        index += 1;
        continue;
      }
      if (char === quote) inString = false;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      out += char;
      continue;
    }

    if (char === ',') {
      let lookahead = index + 1;
      while (lookahead < input.length && /\s/.test(input[lookahead]!)) lookahead += 1;
      const next = input[lookahead];
      if (next === '}' || next === ']') {
        removed += 1;
        out += ' ';
        continue;
      }
    }

    out += char;
  }

  return { text: out, removed };
}

/** Wraps bare object keys in double quotes. */
export function quoteBareKeys(input: string): { text: string; quoted: number } {
  let out = '';
  let quoted = 0;
  let inString = false;
  let quote = '';
  let expectKey = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]!;

    if (inString) {
      out += char;
      if (char === '\\') {
        out += input[index + 1] ?? '';
        index += 1;
        continue;
      }
      if (char === quote) inString = false;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      out += char;
      expectKey = false;
      continue;
    }

    if (char === '{') {
      out += char;
      expectKey = true;
      continue;
    }
    if (char === ',') {
      out += char;
      expectKey = true;
      continue;
    }
    if (char === ':') {
      out += char;
      expectKey = false;
      continue;
    }
    if (char === ' ' || char === '\n' || char === '\t' || char === '\r') {
      out += char;
      continue;
    }

    if (expectKey && /[A-Za-z_$]/.test(char)) {
      let end = index;
      while (end < input.length && /[A-Za-z0-9_$]/.test(input[end]!)) end += 1;
      const key = input.slice(index, end);
      out += `"${key}"`;
      quoted += 1;
      index = end - 1;
      expectKey = false;
      continue;
    }

    out += char;
  }

  return { text: out, quoted };
}

/** Converts single-quoted strings into double-quoted ones. */
export function singleToDoubleQuotes(input: string): { text: string; converted: number } {
  let out = '';
  let converted = 0;
  let index = 0;

  while (index < input.length) {
    const char = input[index]!;

    if (char === '"') {
      out += char;
      index += 1;
      while (index < input.length) {
        const current = input[index]!;
        out += current;
        index += 1;
        if (current === '\\') {
          out += input[index] ?? '';
          index += 1;
          continue;
        }
        if (current === '"') break;
      }
      continue;
    }

    if (char === "'") {
      let body = '';
      index += 1;
      while (index < input.length) {
        const current = input[index]!;
        if (current === '\\') {
          const next = input[index + 1]!;
          if (next === "'") {
            body += "'";
            index += 2;
            continue;
          }
          body += current + next;
          index += 2;
          continue;
        }
        if (current === "'") break;
        body += current;
        index += 1;
      }
      index += 1;
      out += `"${body}"`;
      converted += 1;
      continue;
    }

    out += char;
    index += 1;
  }

  return { text: out, converted };
}

/** Adds the closing brackets a truncated document is missing. */
export function balanceBrackets(input: string): { text: string; added: number } {
  const stack: string[] = [];
  let inString = false;
  let quote = '';

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]!;

    if (inString) {
      if (char === '\\') {
        index += 1;
        continue;
      }
      if (char === quote) inString = false;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      continue;
    }

    if (char === '{' || char === '[') stack.push(char);
    if (char === '}' || char === ']') stack.pop();
  }

  if (stack.length === 0) return { text: input, added: 0 };

  const closers = stack.map((open) => (open === '{' ? '}' : ']')).reverse();
  return { text: input + closers.join(''), added: closers.length };
}

/** Truncates the text after the last complete top-level value. */
export function trimTrailingGarbage(input: string): { text: string; trimmed: boolean } {
  let depth = 0;
  let inString = false;
  let quote = '';
  let lastComplete = -1;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]!;

    if (inString) {
      if (char === '\\') {
        index += 1;
        continue;
      }
      if (char === quote) inString = false;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      continue;
    }

    if (char === '{' || char === '[') depth += 1;
    if (char === '}' || char === ']') {
      depth -= 1;
      if (depth === 0) lastComplete = index;
    }
  }

  if (lastComplete === -1 || lastComplete === input.length - 1) {
    return { text: input, trimmed: false };
  }

  return { text: input.slice(0, lastComplete + 1), trimmed: true };
}

export function repairJson(input: string): RepairResult {
  const fixes: string[] = [];
  let text = input.trim();

  if (!text) {
    return { ok: false, error: 'There is nothing to repair.', fixes };
  }

  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
    fixes.push('Removed a byte order mark');
  }

  const quoted = normaliseSmartQuotes(text);
  if (quoted !== text) {
    text = quoted;
    fixes.push('Replaced typographic quotes with straight quotes');
  }

  const withoutComments = stripComments(text);
  if (withoutComments.removed) {
    text = withoutComments.text;
    fixes.push('Removed comments');
  }

  const withoutCommas = stripTrailingCommas(text);
  if (withoutCommas.removed > 0) {
    text = withoutCommas.text;
    fixes.push(`Removed ${withoutCommas.removed} trailing comma${withoutCommas.removed === 1 ? '' : 's'}`);
  }

  const quotedKeys = quoteBareKeys(text);
  if (quotedKeys.quoted > 0) {
    text = quotedKeys.text;
    fixes.push(`Quoted ${quotedKeys.quoted} unquoted key${quotedKeys.quoted === 1 ? '' : 's'}`);
  }

  const doubleQuoted = singleToDoubleQuotes(text);
  if (doubleQuoted.converted > 0) {
    text = doubleQuoted.text;
    fixes.push(`Converted ${doubleQuoted.converted} single-quoted string${doubleQuoted.converted === 1 ? '' : 's'}`);
  }

  const trimmed = trimTrailingGarbage(text);
  if (trimmed.trimmed) {
    text = trimmed.text;
    fixes.push('Removed trailing content after the last complete value');
  }

  try {
    const value = JSON.parse(text);
    if (fixes.length === 0) {
      return { ok: true, value, text: JSON.stringify(value, null, 2), fixes: ['The input was already valid JSON'] };
    }
    return { ok: true, value, text: JSON.stringify(value, null, 2), fixes };
  } catch (error) {
    const balanced = balanceBrackets(text);
    if (balanced.added > 0) {
      try {
        const value = JSON.parse(balanced.text);
        fixes.push(`Added ${balanced.added} missing closing bracket${balanced.added === 1 ? '' : 's'}`);
        return { ok: true, value, text: JSON.stringify(value, null, 2), fixes };
      } catch {
        // fall through to the error below
      }
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'The document could not be repaired.',
      fixes,
    };
  }
}

/* -------------------------------------------------------------------------- */
/* JSON Schema validation                                                     */
/* -------------------------------------------------------------------------- */

export interface ValidationError {
  path: string;
  keyword: string;
  message: string;
  expected?: string;
  actual?: string;
}

function typeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number';
  return typeof value;
}

function matchesType(value: unknown, expected: string): boolean {
  const actual = typeOf(value);
  if (expected === 'number') return actual === 'number' || actual === 'integer';
  if (expected === 'integer') return actual === 'integer';
  return actual === expected;
}

function describe(value: unknown): string {
  if (value === undefined) return 'missing';
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > 60 ? `${text.slice(0, 57)}…` : text;
}

function validateNode(
  value: unknown,
  schema: Record<string, unknown>,
  path: string,
  errors: ValidationError[]
): void {
  if (typeof schema !== 'object' || schema === null) return;

  const type = schema.type;
  if (typeof type === 'string') {
    if (!matchesType(value, type)) {
      errors.push({
        path: path || '(root)',
        keyword: 'type',
        message: `Expected ${type}`,
        expected: type,
        actual: typeOf(value),
      });
      return;
    }
  } else if (Array.isArray(type)) {
    const allowed = type as string[];
    if (!allowed.some((candidate) => matchesType(value, candidate))) {
      errors.push({
        path: path || '(root)',
        keyword: 'type',
        message: `Expected one of ${allowed.join(', ')}`,
        expected: allowed.join(' | '),
        actual: typeOf(value),
      });
      return;
    }
  }

  if (Array.isArray(schema.enum)) {
    const options = schema.enum as unknown[];
    if (!options.some((option) => JSON.stringify(option) === JSON.stringify(value))) {
      errors.push({
        path: path || '(root)',
        keyword: 'enum',
        message: `Value is not one of the ${options.length} allowed values`,
        expected: options.map((option) => describe(option)).join(', '),
        actual: describe(value),
      });
    }
  }

  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum) {
      errors.push({
        path: path || '(root)',
        keyword: 'minimum',
        message: `Value is below the minimum of ${schema.minimum}`,
        expected: `>= ${schema.minimum}`,
        actual: String(value),
      });
    }
    if (typeof schema.maximum === 'number' && value > schema.maximum) {
      errors.push({
        path: path || '(root)',
        keyword: 'maximum',
        message: `Value is above the maximum of ${schema.maximum}`,
        expected: `<= ${schema.maximum}`,
        actual: String(value),
      });
    }
    if (typeof schema.exclusiveMinimum === 'number' && value <= schema.exclusiveMinimum) {
      errors.push({
        path: path || '(root)',
        keyword: 'exclusiveMinimum',
        message: `Value must be greater than ${schema.exclusiveMinimum}`,
        expected: `> ${schema.exclusiveMinimum}`,
        actual: String(value),
      });
    }
  }

  if (typeof value === 'string') {
    if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
      errors.push({
        path: path || '(root)',
        keyword: 'minLength',
        message: `String is shorter than ${schema.minLength} characters`,
        expected: `length >= ${schema.minLength}`,
        actual: `${value.length} characters`,
      });
    }
    if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) {
      errors.push({
        path: path || '(root)',
        keyword: 'maxLength',
        message: `String is longer than ${schema.maxLength} characters`,
        expected: `length <= ${schema.maxLength}`,
        actual: `${value.length} characters`,
      });
    }
    if (typeof schema.pattern === 'string') {
      try {
        if (!new RegExp(schema.pattern).test(value)) {
          errors.push({
            path: path || '(root)',
            keyword: 'pattern',
            message: 'String does not match the required pattern',
            expected: String(schema.pattern),
            actual: describe(value),
          });
        }
      } catch {
        // An invalid pattern in the schema is not the document's fault.
      }
    }
  }

  if (Array.isArray(value)) {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
      errors.push({
        path: path || '(root)',
        keyword: 'minItems',
        message: `Array has fewer than ${schema.minItems} items`,
        expected: `>= ${schema.minItems} items`,
        actual: `${value.length} items`,
      });
    }
    if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) {
      errors.push({
        path: path || '(root)',
        keyword: 'maxItems',
        message: `Array has more than ${schema.maxItems} items`,
        expected: `<= ${schema.maxItems} items`,
        actual: `${value.length} items`,
      });
    }
    const items = schema.items as Record<string, unknown> | undefined;
    if (items && typeof items === 'object') {
      value.forEach((item, index) => {
        validateNode(item, items, `${path}[${index}]`, errors);
      });
    }
  }

  if (typeOf(value) === 'object') {
    const object = value as Record<string, unknown>;
    const properties = (schema.properties ?? {}) as Record<string, Record<string, unknown>>;

    if (Array.isArray(schema.required)) {
      for (const key of schema.required as string[]) {
        if (!(key in object)) {
          errors.push({
            path: path ? `${path}.${key}` : key,
            keyword: 'required',
            message: `Required property "${key}" is missing`,
            expected: key,
            actual: 'missing',
          });
        }
      }
    }

    for (const [key, child] of Object.entries(properties)) {
      if (key in object) {
        validateNode(object[key], child, path ? `${path}.${key}` : key, errors);
      }
    }

    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(properties));
      for (const key of Object.keys(object)) {
        if (!allowed.has(key)) {
          errors.push({
            path: path ? `${path}.${key}` : key,
            keyword: 'additionalProperties',
            message: `Property "${key}" is not allowed by the schema`,
            expected: 'one of the declared properties',
            actual: key,
          });
        }
      }
    }
  }
}

export function validateJson(instance: unknown, schema: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof schema !== 'object' || schema === null) {
    return [{ path: '(root)', keyword: 'schema', message: 'The schema is not a JSON object' }];
  }
  validateNode(instance, schema as Record<string, unknown>, '', errors);
  return errors;
}
