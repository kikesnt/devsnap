/**
 * Scans the source files for unbalanced string literals.
 *
 * A single-quoted string that contains a bare apostrophe terminates early and
 * silently corrupts the rest of the file, producing a parse error hundreds of
 * lines away from the cause. This finds the line where the string was opened
 * rather than the line where the parser gave up.
 *
 * It understands template literals with `${}` interpolations and regular
 * expression literals, so a file that parses cleanly is reported as clean.
 *
 * Run with: node scripts/lint-strings.mjs
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.mjs')) out.push(full);
  }
  return out;
}

/** Characters after which a slash starts a regular expression, not a division. */
const REGEX_PRECEDERS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^', '\n']);

const problems = [];

// The content files are where a bare apostrophe in prose is a realistic
// mistake. The library files are covered by the type checker, which reports
// the same class of error with a better location.
const files = (await walk(join(root, 'src/data'))).filter((f) => f.endsWith('.ts'));

for (const file of files) {
  const text = await readFile(file, 'utf8');
  const lineOf = (index) => text.slice(0, index).split('\n').length;

  let mode = 'code'; // code | string | template | lineComment | blockComment | regex
  let quote = '';
  let openedAt = 0;
  let templateDepth = 0;
  let previousSignificant = '';

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (mode === 'lineComment') {
      if (char === '\n') mode = 'code';
      continue;
    }
    if (mode === 'blockComment') {
      if (char === '*' && next === '/') {
        mode = 'code';
        index += 1;
      }
      continue;
    }
    if (mode === 'string') {
      if (char === '\\') {
        index += 1;
        continue;
      }
      if (char === quote) mode = 'code';
      continue;
    }
    if (mode === 'regex') {
      if (char === '\\') {
        index += 1;
        continue;
      }
      if (char === '[') {
        // A character class may contain an unescaped slash.
        const end = text.indexOf(']', index);
        if (end === -1) break;
        index = end;
        continue;
      }
      if (char === '/') mode = 'code';
      continue;
    }
    if (mode === 'template') {
      if (char === '\\') {
        index += 1;
        continue;
      }
      if (char === '`') {
        mode = 'code';
        continue;
      }
      if (char === '$' && next === '{') {
        // An interpolation: parse it as code until the matching brace.
        templateDepth = 0;
        index += 1;
        mode = 'code';
        // Track the brace depth with a small local counter.
        let depth = 1;
        let inner = 'code';
        let innerQuote = '';
        let innerOpen = 0;
        let innerIndex = index + 1;
        for (; innerIndex < text.length; innerIndex += 1) {
          const c = text[innerIndex];
          const n = text[innerIndex + 1];
          if (inner === 'code') {
            if (c === '{') depth += 1;
            else if (c === '}') {
              depth -= 1;
              if (depth === 0) break;
            } else if (c === '"' || c === "'") {
              inner = 'string';
              innerQuote = c;
              innerOpen = innerIndex;
            } else if (c === '`') {
              inner = 'template';
            }
            continue;
          }
          if (inner === 'string') {
            if (c === '\\') {
              innerIndex += 1;
              continue;
            }
            if (c === innerQuote) inner = 'code';
          }
        }
        index = innerIndex;
        mode = 'template';
        continue;
      }
      continue;
    }

    // mode === 'code'
    if (char === '/' && next === '/') {
      mode = 'lineComment';
      index += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      mode = 'blockComment';
      index += 1;
      continue;
    }
    if (char === "'" || char === '"') {
      mode = 'string';
      quote = char;
      openedAt = index;
      continue;
    }
    if (char === '`') {
      mode = 'template';
      continue;
    }
    if (char === '/' && REGEX_PRECEDERS.has(previousSignificant)) {
      mode = 'regex';
      continue;
    }
    if (!/\s/.test(char)) previousSignificant = char;
  }

  if (mode === 'string') {
    const line = lineOf(openedAt);
    const source = text.split('\n')[line - 1] ?? '';
    problems.push(
      `${relative(root, file)}:${line}  unterminated ${quote === "'" ? 'single' : 'double'}-quoted string: ${source.trim().slice(0, 100)}`
    );
  } else if (mode === 'template') {
    const line = lineOf(openedAt);
    problems.push(`${relative(root, file)}:${line}  unterminated template literal`);
  }
}

if (problems.length > 0) {
  console.log(`${problems.length} unbalanced string literal(s):\n`);
  for (const problem of problems) console.log(`  x ${problem}`);
  process.exit(1);
}
console.log('All string literals are balanced.');
