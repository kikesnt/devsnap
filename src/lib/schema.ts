/**
 * JSON Schema inference.
 *
 * A schema is inferred from a sample document. Object properties present in
 * every sampled object become `required`; properties missing from some of
 * them are optional. Types are unioned when a field holds more than one kind
 * of value across the sample.
 */

export type JsonType = 'string' | 'number' | 'integer' | 'boolean' | 'null' | 'array' | 'object';

export interface JsonSchema {
  $schema?: string;
  $id?: string;
  title?: string;
  type?: JsonType | JsonType[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  additionalProperties?: boolean | JsonSchema;
  description?: string;
}

function typeOf(value: unknown): JsonType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string') return 'string';
  return 'object';
}

function mergeTypes(a: JsonType, b: JsonType): JsonType {
  if (a === b) return a;
  if (a === 'integer' && b === 'number') return 'number';
  if (a === 'number' && b === 'integer') return 'number';
  return a;
}

function collectSamples(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap((item) => collectSamples(item));
  return [value];
}

function inferNode(samples: unknown[]): JsonSchema {
  const types = new Set<JsonType>();
  for (const sample of samples) types.add(typeOf(sample));

  if (types.has('object')) {
    const objects = samples.filter(
      (sample): sample is Record<string, unknown> =>
        typeof sample === 'object' && sample !== null && !Array.isArray(sample)
    );
    const keys = new Set<string>();
    for (const object of objects) for (const key of Object.keys(object)) keys.add(key);

    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const key of keys) {
      const childSamples = objects
        .map((object) => object[key])
        .filter((child) => child !== undefined);
      properties[key] = inferNode(childSamples);
      if (childSamples.length === objects.length && objects.length > 0) required.push(key);
    }

    const schema: JsonSchema = { type: 'object', properties };
    if (required.length > 0) schema.required = required.sort();
    return schema;
  }

  if (types.has('array')) {
    const arrays = samples.filter(Array.isArray) as unknown[][];
    const childSamples = arrays.flat();
    const schema: JsonSchema = { type: 'array' };
    if (childSamples.length > 0) schema.items = inferNode(childSamples);
    return schema;
  }

  const list = [...types];
  if (list.length === 1) return { type: list[0]! };
  return { type: list.sort() as JsonType[] };
}

export function inferSchema(value: unknown, title?: string): JsonSchema {
  const samples = collectSamples(value);
  const schema = inferNode(samples);
  const base: JsonSchema = { $schema: 'https://json-schema.org/draft/2020-12/schema' };
  if (title) base.title = title;
  return { ...base, ...schema };
}

/** Strips a leading "type" key duplication that `inferNode` may nest. */
export function normalizeSchema(schema: JsonSchema): JsonSchema {
  if (schema.type === 'object' || (Array.isArray(schema.type) && schema.type.includes('object'))) {
    const properties: Record<string, JsonSchema> = {};
    for (const [key, value] of Object.entries(schema.properties ?? {})) {
      properties[key] = normalizeSchema(value);
    }
    const next: JsonSchema = { ...schema, properties };
    if (schema.items) next.items = normalizeSchema(schema.items);
    return next;
  }
  if (schema.type === 'array' && schema.items) {
    return { ...schema, items: normalizeSchema(schema.items) };
  }
  return schema;
}
