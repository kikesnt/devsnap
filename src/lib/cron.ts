/**
 * Cron parsing, human-readable description and next-run calculation.
 *
 * The core model is the standard five-field Unix expression. Quartz and AWS
 * variants differ in field count and in the use of `?` and `L`, so they are
 * normalised into the same internal representation where possible.
 */

export interface CronField {
  name: string;
  min: number;
  max: number;
  names?: Record<string, number>;
}

export const CRON_FIELDS: CronField[] = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day of month', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12, names: { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 } },
  { name: 'day of week', min: 0, max: 6, names: { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 } },
];

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface ParsedCron {
  expression: string;
  fields: string[];
  minute: number[];
  hour: number[];
  dayOfMonth: number[];
  month: number[];
  dayOfWeek: number[];
  /** True when both day fields are restricted, which means OR semantics. */
  dayUnion: boolean;
  valid: boolean;
  error?: string;
}

function parseField(
  raw: string,
  field: CronField,
  offset: number
): { values: number[]; error?: string } {
  const values = new Set<number>();
  const chunks = raw.split(',');
  for (const chunk of chunks) {
    if (chunk === '') return { values: [], error: `${field.name} field is empty` };

    const [rangePart, stepPart] = chunk.split('/');
    const step = stepPart === undefined ? 1 : Number(stepPart);
    if (!Number.isInteger(step) || step < 1) {
      return { values: [], error: `"${chunk}" is not a valid step in the ${field.name} field` };
    }

    let start = field.min;
    let end = field.max;

    if (rangePart !== '*' && rangePart !== undefined) {
      if (rangePart.includes('-')) {
        const [rawStart, rawEnd] = rangePart.split('-');
        const resolvedStart = resolveValue(rawStart ?? '', field, offset);
        const resolvedEnd = resolveValue(rawEnd ?? '', field, offset);
        if (resolvedStart === undefined || resolvedEnd === undefined) {
          return { values: [], error: `"${rangePart}" is not a valid range in the ${field.name} field` };
        }
        start = resolvedStart;
        end = resolvedEnd;
      } else {
        const single = resolveValue(rangePart, field, offset);
        if (single === undefined) {
          return { values: [], error: `"${rangePart}" is not a valid value in the ${field.name} field` };
        }
        if (stepPart === undefined) {
          values.add(single);
          continue;
        }
        start = single;
        end = field.max;
      }
    }

    if (start > end) {
      return { values: [], error: `The range in the ${field.name} field starts after it ends` };
    }
    for (let value = start; value <= end; value += step) values.add(value);
  }

  return { values: [...values].sort((a, b) => a - b) };
}

function resolveValue(raw: string, field: CronField, offset: number): number | undefined {
  const key = raw.trim().toLowerCase();
  if (key === '*' || key === '?') return field.min;
  if (field.names && key in field.names) return field.names[key]!;

  const numeric = Number(key);
  if (!Number.isInteger(numeric)) return undefined;

  let value = numeric;
  // Sunday may be written as 7.
  if (field.name === 'day of week' && value === 7) value = 0;
  if (value < field.min || value > field.max) {
    return offset === 0 && field.name === 'day of week' && value === 7 ? 0 : undefined;
  }
  return value;
}

export function parseCron(expression: string): ParsedCron {
  const trimmed = expression.trim();
  const fields = trimmed.split(/\s+/).filter(Boolean);

  const empty: ParsedCron = {
    expression: trimmed,
    fields,
    minute: [],
    hour: [],
    dayOfMonth: [],
    month: [],
    dayOfWeek: [],
    dayUnion: false,
    valid: false,
  };

  if (fields.length !== 5) {
    return { ...empty, error: `Expected 5 fields but found ${fields.length}.` };
  }

  const results = fields.map((raw, index) => {
    const field = CRON_FIELDS[index]!;
    return parseField(raw, field, index);
  });

  const failure = results.find((result) => result.error);
  if (failure?.error) return { ...empty, error: failure.error };

  const minute = results[0]!.values;
  const hour = results[1]!.values;
  const dayOfMonth = results[2]!.values;
  const month = results[3]!.values;
  const dayOfWeek = results[4]!.values;

  return {
    expression: trimmed,
    fields,
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
    dayUnion: fields[2] !== '*' && fields[4] !== '*',
    valid: true,
  };
}

/** Builds a five-field expression from a structured description. */
export interface ScheduleSpec {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export function buildCron(spec: ScheduleSpec): string {
  return [spec.minute, spec.hour, spec.dayOfMonth, spec.month, spec.dayOfWeek].join(' ');
}

function describeList(values: number[], names?: string[]): string {
  if (values.length === 0) return 'none';
  if (values.length === 1) {
    const only = values[0]!;
    return names ? names[only] ?? String(only) : String(only);
  }
  const sorted = [...values].sort((a, b) => a - b);
  const runs: number[] = [];
  let start = sorted[0]!;
  let previous = sorted[0]!;
  for (const value of sorted.slice(1)) {
    if (value === previous + 1) {
      previous = value;
      continue;
    }
    runs.push(start, previous);
    start = value;
    previous = value;
  }
  runs.push(start, previous);

  const parts: string[] = [];
  for (let index = 0; index < runs.length; index += 2) {
    const from = runs[index]!;
    const to = runs[index + 1]!;
    if (from === to) parts.push(names ? names[from] ?? String(from) : String(from));
    else parts.push(`${names ? names[from] ?? from : from}-${names ? names[to] ?? to : to}`);
  }
  return parts.join(', ');
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/** Human-readable description of a parsed expression. */
export function describeCron(parsed: ParsedCron): string {
  if (!parsed.valid) return 'Invalid expression';

  const everyMinute = parsed.minute.length === 60;
  const everyHour = parsed.hour.length === 24;
  const everyMonth = parsed.month.length === 12;
  const everyDayOfMonth = parsed.dayOfMonth.length === 31;
  const everyDayOfWeek = parsed.dayOfWeek.length === 7;

  if (everyMinute && everyHour && everyDayOfMonth && everyMonth && everyDayOfWeek) {
    return 'Every minute';
  }

  const timeParts: string[] = [];
  if (everyMinute) {
    timeParts.push('every minute');
  } else if (parsed.minute.length === 1) {
    timeParts.push(`at minute ${parsed.minute[0]}`);
  } else {
    timeParts.push(`at minutes ${describeList(parsed.minute)}`);
  }

  if (!everyHour) {
    if (parsed.hour.length === 1) {
      const hour = parsed.hour[0]!;
      const suffix = hour < 12 ? 'AM' : 'PM';
      const display = hour % 12 === 0 ? 12 : hour % 12;
      timeParts.push(`during hour ${hour} (${display}:00 ${suffix})`);
    } else {
      timeParts.push(`during hours ${describeList(parsed.hour)}`);
    }
  }

  const scope: string[] = [];
  if (!everyMonth) scope.push(`in ${describeList(parsed.month, MONTH_NAMES)}`);
  if (!everyDayOfMonth && !everyDayOfWeek) {
    scope.push(`on day ${describeList(parsed.dayOfMonth)} of the month`);
  } else if (!everyDayOfWeek) {
    scope.push(`on ${describeList(parsed.dayOfWeek, WEEKDAY_NAMES)}`);
  } else if (!everyDayOfMonth) {
    scope.push(`on day ${describeList(parsed.dayOfMonth)} of the month`);
  }

  const frequency = everyMinute && everyHour ? 'Every minute' : 'At';
  const body = timeParts.join(', ');
  return scope.length ? `${frequency} ${body}, ${scope.join(' ')}` : `${frequency} ${body}`;
}

/** Field-by-field explanation, used by the tool page. */
export function explainCron(parsed: ParsedCron): { field: string; value: string; meaning: string }[] {
  if (!parsed.valid) return [];
  return [
    { field: 'Minute', value: parsed.fields[0]!, meaning: describeList(parsed.minute) },
    { field: 'Hour', value: parsed.fields[1]!, meaning: describeList(parsed.hour) },
    { field: 'Day of month', value: parsed.fields[2]!, meaning: describeList(parsed.dayOfMonth) },
    { field: 'Month', value: parsed.fields[3]!, meaning: describeList(parsed.month, MONTH_NAMES) },
    { field: 'Day of week', value: parsed.fields[4]!, meaning: describeList(parsed.dayOfWeek, WEEKDAY_NAMES) },
  ];
}

/** Next `count` execution times, evaluated in the browser's local timezone. */
export function nextRuns(parsed: ParsedCron, count = 10, from = new Date()): Date[] {
  if (!parsed.valid) return [];

  const results: Date[] = [];
  const cursor = new Date(from.getTime());
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const limit = 500_000;
  let iterations = 0;

  while (results.length < count && iterations < limit) {
    iterations += 1;
    const month = cursor.getMonth() + 1;
    if (!parsed.month.includes(month)) {
      cursor.setMonth(cursor.getMonth() + 1, 1);
      cursor.setHours(0, 0, 0, 0);
      continue;
    }
    if (!parsed.hour.includes(cursor.getHours())) {
      cursor.setHours(cursor.getHours() + 1, 0, 0, 0);
      continue;
    }
    if (!parsed.minute.includes(cursor.getMinutes())) {
      cursor.setMinutes(cursor.getMinutes() + 1, 0, 0);
      continue;
    }

    const domMatch = parsed.dayOfMonth.includes(cursor.getDate());
    const dowMatch = parsed.dayOfWeek.includes(cursor.getDay());
    const dayOk = parsed.dayUnion ? domMatch || dowMatch : domMatch && dowMatch;

    if (!dayOk) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
      continue;
    }

    results.push(new Date(cursor.getTime()));
    cursor.setMinutes(cursor.getMinutes() + 1, 0, 0);
  }

  return results;
}

export function formatRun(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
