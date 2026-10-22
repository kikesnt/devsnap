/**
 * Longest-common-subsequence diff over lines, plus a word-level refinement
 * for lines that differ. The algorithm is the same family Git uses, which
 * keeps the output minimal: it reports the smallest set of changes that
 * explains the difference between the two inputs.
 */

export type ChangeType = 'equal' | 'insert' | 'delete';

export interface DiffLine {
  type: ChangeType;
  text: string;
  leftNumber?: number;
  rightNumber?: number;
  /** Word-level fragments, present only on modified lines. */
  parts?: DiffPart[];
  /** Index of the pair this line belongs to, when it was modified. */
  pairIndex?: number;
}

export interface DiffPart {
  type: 'equal' | 'insert' | 'delete';
  text: string;
}

export interface DiffResult {
  lines: DiffLine[];
  added: number;
  removed: number;
  changed: number;
  same: number;
}

function splitLines(text: string): string[] {
  if (text === '') return [];
  return text.replace(/\r\n?/g, '\n').split('\n');
}

/** Classic dynamic-programming LCS over two line arrays. */
function lcsMatrix(a: string[], b: string[]): number[][] {
  const table: number[][] = [];
  for (let i = 0; i <= a.length; i += 1) table.push(new Array<number>(b.length + 1).fill(0));

  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i]![j] =
        a[i] === b[j]
          ? table[i + 1]![j + 1]! + 1
          : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
    }
  }
  return table;
}

/** Word-level LCS used to highlight the exact difference inside a line. */
function wordDiff(a: string, b: string): DiffPart[] {
  const tokenize = (value: string) => value.match(/\s+|[^\s]+/g) ?? [];
  const left = tokenize(a);
  const right = tokenize(b);
  const table = lcsMatrix(left, right);
  const parts: DiffPart[] = [];

  const push = (type: DiffPart['type'], text: string) => {
    const last = parts[parts.length - 1];
    if (last && last.type === type) last.text += text;
    else parts.push({ type, text });
  };

  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      push('equal', left[i]!);
      i += 1;
      j += 1;
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      push('delete', left[i]!);
      i += 1;
    } else {
      push('insert', right[j]!);
      j += 1;
    }
  }
  while (i < left.length) {
    push('delete', left[i]!);
    i += 1;
  }
  while (j < right.length) {
    push('insert', right[j]!);
    j += 1;
  }
  return parts;
}

export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  /** Refine changed lines down to word level. */
  wordLevel?: boolean;
}

function normalise(text: string, options: DiffOptions): string {
  let value = text;
  if (options.ignoreWhitespace) value = value.replace(/\s+/g, ' ').trim();
  if (options.ignoreCase) value = value.toLowerCase();
  return value;
}

export function diffLines(left: string, right: string, options: DiffOptions = {}): DiffResult {
  const leftLines = splitLines(left);
  const rightLines = splitLines(right);
  const keyLeft = leftLines.map((line) => normalise(line, options));
  const keyRight = rightLines.map((line) => normalise(line, options));
  const table = lcsMatrix(keyLeft, keyRight);

  const raw: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < leftLines.length && j < rightLines.length) {
    if (keyLeft[i] === keyRight[j]) {
      raw.push({
        type: 'equal',
        text: rightLines[j]!,
        leftNumber: i + 1,
        rightNumber: j + 1,
      });
      i += 1;
      j += 1;
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      raw.push({ type: 'delete', text: leftLines[i]!, leftNumber: i + 1 });
      i += 1;
    } else {
      raw.push({ type: 'insert', text: rightLines[j]!, rightNumber: j + 1 });
      j += 1;
    }
  }
  while (i < leftLines.length) {
    raw.push({ type: 'delete', text: leftLines[i]!, leftNumber: i + 1 });
    i += 1;
  }
  while (j < rightLines.length) {
    raw.push({ type: 'insert', text: rightLines[j]!, rightNumber: j + 1 });
    j += 1;
  }

  // Pair adjacent delete/insert runs so a changed line can be shown at word
  // level. Both lines are kept: a unified diff needs the `-` and the `+`.
  const lines: DiffLine[] = [];
  for (let index = 0; index < raw.length; index += 1) {
    const current = raw[index]!;
    const next = raw[index + 1];

    if (current.type === 'delete' && next && next.type === 'insert' && options.wordLevel !== false) {
      const parts = wordDiff(current.text, next.text);
      const removed = parts.filter((part) => part.type !== 'insert');
      const added = parts.filter((part) => part.type !== 'delete');
      lines.push({ ...current, parts: removed, pairIndex: index });
      lines.push({ ...next, parts: added, pairIndex: index });
      index += 1;
      continue;
    }

    lines.push(current);
  }

  const result: DiffResult = { lines, added: 0, removed: 0, changed: 0, same: 0 };
  for (const line of lines) {
    if (line.type === 'insert') result.added += 1;
    else if (line.type === 'delete') result.removed += 1;
    else result.same += 1;
  }
  result.changed = Math.min(result.added, result.removed);
  return result;
}

/** Renders a diff in the unified format that Git and GitHub understand. */
export function toUnifiedDiff(left: string, right: string, options: DiffOptions = {}): string {
  const result = diffLines(left, right, options);
  const out: string[] = [];
  let leftNo = 0;
  let rightNo = 0;
  for (const line of result.lines) {
    if (line.type === 'equal') {
      leftNo += 1;
      rightNo += 1;
      out.push(` ${line.text}`);
    } else if (line.type === 'delete') {
      leftNo += 1;
      out.push(`-${line.text}`);
    } else {
      rightNo += 1;
      out.push(`+${line.text}`);
    }
  }
  return out.join('\n');
}
