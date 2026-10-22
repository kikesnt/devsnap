/**
 * Structural JSON comparison.
 *
 * Objects are matched by key name, arrays by position. The output is a flat
 * list of differences, each with a dotted path that identifies exactly where
 * the change lives.
 */

export type JsonChangeType = 'added' | 'removed' | 'changed' | 'type';

export interface JsonDifference {
  path: string;
  type: JsonChangeType;
  left?: unknown;
  right?: unknown;
  leftType?: string;
  rightType?: string;
}

function typeName(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function join(path: string, key: string): string {
  return path ? `${path}.${key}` : key;
}

function compare(left: unknown, right: unknown, path: string, out: JsonDifference[]): void {
  const leftType = typeName(left);
  const rightType = typeName(right);

  if (leftType !== rightType) {
    // integer vs number is not a meaningful difference.
    const numeric = (type: string) => type === 'integer' || type === 'number';
    if (!(numeric(leftType) && numeric(rightType))) {
      out.push({ path: path || '(root)', type: 'type', left, right, leftType, rightType });
      return;
    }
  }

  if (leftType === 'object') {
    const leftObject = left as Record<string, unknown>;
    const rightObject = right as Record<string, unknown>;
    const keys = new Set([...Object.keys(leftObject), ...Object.keys(rightObject)]);
    for (const key of [...keys].sort()) {
      const inLeft = key in leftObject;
      const inRight = key in rightObject;
      if (inLeft && !inRight) {
        out.push({ path: join(path, key), type: 'removed', left: leftObject[key] });
        continue;
      }
      if (!inLeft && inRight) {
        out.push({ path: join(path, key), type: 'added', right: rightObject[key] });
        continue;
      }
      compare(leftObject[key], rightObject[key], join(path, key), out);
    }
    return;
  }

  if (leftType === 'array') {
    const leftArray = left as unknown[];
    const rightArray = right as unknown[];
    const length = Math.max(leftArray.length, rightArray.length);
    for (let index = 0; index < length; index += 1) {
      const itemPath = `${path}[${index}]`;
      if (index >= leftArray.length) {
        out.push({ path: itemPath, type: 'added', right: rightArray[index] });
        continue;
      }
      if (index >= rightArray.length) {
        out.push({ path: itemPath, type: 'removed', left: leftArray[index] });
        continue;
      }
      compare(leftArray[index], rightArray[index], itemPath, out);
    }
    return;
  }

  if (left !== right) {
    out.push({ path: path || '(root)', type: 'changed', left, right, leftType, rightType });
  }
}

export function diffJson(left: unknown, right: unknown): JsonDifference[] {
  const out: JsonDifference[] = [];
  compare(left, right, '', out);
  return out;
}

export function describeDifference(difference: JsonDifference): string {
  const render = (value: unknown): string => {
    if (value === undefined) return '—';
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    return text.length > 80 ? `${text.slice(0, 77)}…` : text;
  };
  switch (difference.type) {
    case 'added':
      return `Added: ${render(difference.right)}`;
    case 'removed':
      return `Removed: ${render(difference.left)}`;
    case 'type':
      return `Type changed: ${difference.leftType} → ${difference.rightType}`;
    default:
      return `Changed: ${render(difference.left)} → ${render(difference.right)}`;
  }
}
