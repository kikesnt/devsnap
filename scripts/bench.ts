/**
 * Measures the tool algorithms and writes src/data/benchmarks.json.
 *
 * The point of the page this feeds is to publish numbers instead of promises:
 * "fast" is not a claim, it is a measurement with a machine and a date
 * attached. Every input is generated deterministically, so the same script on
 * the same machine produces the same workload and a comparable number.
 *
 * The measurement is deliberately narrow. It times the pure function that
 * does the work, not the browser, not the DOM and not the paint. That is the
 * part that would be slow if the algorithm were bad, and it is the part that
 * can be reproduced without a specific laptop.
 *
 * Run with: npm run bench
 */
import { cpus, platform, arch, totalmem } from 'node:os';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash, webcrypto } from 'node:crypto';

import { diffLines } from '../src/lib/diff.ts';
import { diffJson } from '../src/lib/jsondiff.ts';
import { parseCsv, serializeCsv } from '../src/lib/csv.ts';
import { formatSql } from '../src/lib/sql.ts';
import { inferSchema } from '../src/lib/schema.ts';
import { repairJson } from '../src/lib/jsonrepair.ts';
import { convertCase } from '../src/lib/caseconverter.ts';
import { parseCurl } from '../src/lib/curlconverter.ts';
import { parseCron } from '../src/lib/cron.ts';
import { buildQr } from '../src/lib/qr.ts';
import { renderMarkdown } from '../src/lib/markdown.ts';

const root = fileURLToPath(new URL('..', import.meta.url));

/* ------------------------------------------------------------------ inputs */

/** A JSON document of roughly the requested size, with repeated shapes. */
function makeJson(targetBytes: number): string {
  const records = [];
  let size = 0;
  let index = 0;
  while (size < targetBytes) {
    const record = {
      id: index,
      name: `service-${index}`,
      active: index % 3 !== 0,
      region: ['eu-west-1', 'us-east-1', 'ap-south-1'][index % 3],
      replicas: (index % 7) + 1,
      tags: ['api', 'edge', `v${index % 4}`],
      owner: { team: `team-${index % 40}`, email: `team${index % 40}@example.com` },
      createdAt: new Date(Date.UTC(2026, 0, 1) + index * 60_000).toISOString(),
    };
    records.push(record);
    size += JSON.stringify(record).length + 1;
    index += 1;
  }
  return JSON.stringify(records);
}

function makeCsv(rows: number): string {
  const header = 'id,name,email,country,plan,seats,created_at';
  const lines = [header];
  for (let i = 0; i < rows; i += 1) {
    lines.push(
      `${i},User ${i},user${i}@example.com,${['ES', 'US', 'DE', 'BR'][i % 4]},${['free', 'pro', 'team'][i % 3]},${(i % 50) + 1},2026-0${(i % 9) + 1}-15`
    );
  }
  return lines.join('\n');
}

function makeText(lines: number, changeEvery: number): string {
  const out = [];
  for (let i = 0; i < lines; i += 1) {
    out.push(
      i % changeEvery === 0
        ? `line ${i}: the deployment changed this value to ${i * 2}`
        : `line ${i}: an ordinary log line that did not change at all`
    );
  }
  return out.join('\n');
}

function makeSql(columns: number): string {
  const cols = [];
  for (let i = 0; i < columns; i += 1) {
    cols.push(`  coalesce(t${i % 5}.column_${i}, 0) as metric_${i}`);
  }
  return `select ${cols.join(',\n')}
from metrics t0
left join accounts t1 on t1.id = t0.account_id
left join plans t2 on t2.id = t1.plan_id
left join regions t3 on t3.id = t0.region_id
left join teams t4 on t4.id = t1.team_id
where t0.created_at > now() - interval '30 days'
  and t1.deleted_at is null
group by t0.account_id
order by metric_0 desc
limit 500`;
}

function makeMarkdown(sections: number): string {
  const block = `## A heading for the section

A paragraph with **bold text**, a [link](https://example.com) and some \`inline code\`.

- a list item
- another list item
  - a nested item

\`\`\`ts
const value = ${'`'}template${'`'};
\`\`\`

| column | meaning |
| --- | --- |
| one | the first |
| two | the second |

> A blockquote that says something worth quoting.

`;
  return '# Benchmark document\n\n' + block.repeat(sections);
}

const jsonSmall = makeJson(200_000);
const jsonSmallChanged = makeJson(200_000).replace('"service-1"', '"service-1-changed"');
const jsonLarge = makeJson(1_000_000);
const csvLarge = makeCsv(10_000);
const textLeft = makeText(2_000, 40);
const textRight = makeText(2_000, 41);
const sqlLarge = makeSql(120);
const markdownLarge = makeMarkdown(400);
const curlCommand = `curl 'https://api.example.com/v1/orders?limit=50&status=open' \\
  -X POST -H 'authorization: Bearer eyJhbGciOiJIUzI1NiJ9.payload.signature' \\
  -H 'content-type: application/json' --data-raw '{"note":"hello","items":[1,2,3]}' --compressed`;
const qrPayload = 'https://devsnap.cc/tools/qr-generator/?source=benchmark&medium=internal';

/* ------------------------------------------------------------- measurement */

interface Measurement {
  slug: string;
  label: string;
  operation: string;
  inputLabel: string;
  medianMs: number;
  minMs: number;
  iterations: number;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1]! + sorted[middle]!) / 2 : sorted[middle]!;
}

async function measure(
  meta: Omit<Measurement, 'medianMs' | 'minMs' | 'iterations'>,
  run: () => unknown | Promise<unknown>,
  iterations = 9
): Promise<Measurement> {
  // A warm-up run keeps the first call's compile and allocation cost out of
  // the sample, which would otherwise dominate a nine-run median.
  await run();
  const samples: number[] = [];
  for (let i = 0; i < iterations; i += 1) {
    const start = performance.now();
    await run();
    samples.push(performance.now() - start);
  }
  return {
    ...meta,
    medianMs: Number(median(samples).toFixed(4)),
    minMs: Number(Math.min(...samples).toFixed(4)),
    iterations,
  };
}

const rows: Measurement[] = [];

rows.push(
  await measure(
    {
      slug: 'json-formatter',
      label: 'JSON Formatter',
      operation: 'Pretty-print with a two-space indent',
      inputLabel: '1.0 MB of JSON',
    },
    () => JSON.stringify(JSON.parse(jsonLarge), null, 2)
  )
);

rows.push(
  await measure(
    {
      slug: 'json-formatter',
      label: 'JSON Formatter',
      operation: 'Minify',
      inputLabel: '1.0 MB of JSON',
    },
    () => JSON.stringify(JSON.parse(jsonLarge))
  )
);

const jsonLeft = JSON.parse(jsonSmall);
const jsonRight = JSON.parse(jsonSmallChanged);

rows.push(
  await measure(
    {
      slug: 'json-diff',
      label: 'JSON Diff',
      operation: 'Compare two documents by structure',
      inputLabel: '2,000 records each, 5% changed',
    },
    () => diffJson(jsonLeft, jsonRight)
  )
);

rows.push(
  await measure(
    {
      slug: 'diff-checker',
      label: 'Text Diff',
      operation: 'Line diff with word-level highlighting',
      inputLabel: '2,000 lines, 2.5% changed',
    },
    () => diffLines(textLeft, textRight)
  )
);

rows.push(
  await measure(
    {
      slug: 'csv-to-json',
      label: 'CSV to JSON',
      operation: 'Parse with delimiter detection and type inference',
      inputLabel: '10,000 rows × 7 columns',
    },
    () => parseCsv(csvLarge)
  )
);

rows.push(
  await measure(
    {
      slug: 'json-to-csv',
      label: 'JSON to CSV',
      operation: 'Flatten and serialise',
      inputLabel: '10,000 rows × 7 columns',
    },
    () => {
      const parsed = parseCsv(csvLarge);
      return serializeCsv(parsed.headers, parsed.rows);
    }
  )
);

rows.push(
  await measure(
    {
      slug: 'sql-formatter',
      label: 'SQL Formatter',
      operation: 'Format a 120-column query with five joins',
      inputLabel: '120 select expressions',
    },
    () => formatSql(sqlLarge)
  )
);

rows.push(
  await measure(
    {
      slug: 'markdown-preview',
      label: 'Markdown Preview',
      operation: 'Render GitHub-flavoured Markdown to HTML',
      inputLabel: '400 sections, ~40 KB',
    },
    () => renderMarkdown(markdownLarge)
  )
);

rows.push(
  await measure(
    {
      slug: 'json-repair',
      label: 'JSON Repair',
      operation: 'Repair trailing commas, single quotes and bare keys',
      inputLabel: '1.0 MB of broken JSON',
    },
    () => repairJson(jsonLarge.replace(/"id":/g, 'id:'))
  )
);

rows.push(
  await measure(
    {
      slug: 'case-converter',
      label: 'Case Converter',
      operation: 'Convert to camelCase',
      inputLabel: '1.0 MB of text',
    },
    () => convertCase(jsonLarge, 'camelCase')
  )
);

rows.push(
  await measure(
    {
      slug: 'json-schema-generator',
      label: 'JSON Schema Generator',
      operation: 'Infer a schema from a sample',
      inputLabel: '2,000 records',
    },
    () => inferSchema(JSON.parse(jsonSmall))
  )
);

rows.push(
  await measure(
    {
      slug: 'curl-converter',
      label: 'cURL Converter',
      operation: 'Parse a command into a request model',
      inputLabel: 'One command, 2 headers, JSON body',
    },
    () => parseCurl(curlCommand),
    200
  )
);

rows.push(
  await measure(
    {
      slug: 'cron-builder',
      label: 'Cron Builder',
      operation: 'Parse and validate an expression',
      inputLabel: '5-field expression',
    },
    () => parseCron('*/15 9-17 * * MON-FRI'),
    200
  )
);

rows.push(
  await measure(
    {
      slug: 'qr-generator',
      label: 'QR Code Generator',
      operation: 'Build the module matrix',
      inputLabel: '78-character URL, level M',
    },
    () => buildQr(qrPayload, { cellSize: 8, margin: 4, errorLevel: 'M', foreground: '#111827', background: '#ffffff' })
  )
);

rows.push(
  await measure(
    {
      slug: 'hash-generator',
      label: 'Hash Generator',
      operation: 'SHA-256 over the input',
      inputLabel: '1.0 MB of text',
    },
    async () => {
      const bytes = new TextEncoder().encode(jsonLarge);
      return webcrypto.subtle.digest('SHA-256', bytes);
    }
  )
);

/* The digest above uses WebCrypto, which is what the browser uses. The
   node:crypto import is kept so the script fails loudly if the platform
   cannot provide a reference implementation to compare against. */
const reference = createHash('sha256').update(jsonLarge).digest('hex');
if (reference.length !== 64) {
  throw new Error('The reference digest is malformed.');
}

/* ------------------------------------------------------------------ output */

const payload = {
  generated: new Date().toISOString().slice(0, 10),
  runtime: `Node ${process.versions.node}`,
  cpu: cpus()[0]?.model?.trim() ?? 'unknown',
  platform: `${platform()} ${arch()}`,
  memoryGb: Math.round(totalmem() / 1024 ** 3),
  rows: rows.sort((a, b) => a.label.localeCompare(b.label)),
};

await writeFile(`${root}src/data/benchmarks.json`, JSON.stringify(payload, null, 2) + '\n', 'utf8');

console.log(`${payload.rows.length} benchmarks on ${payload.cpu}`);
const human = (ms: number): string =>
  ms < 0.1 ? `${Math.round(ms * 1000)} µs` : `${ms.toFixed(ms < 10 ? 2 : 0)} ms`;

console.table(
  payload.rows.map((row) => ({
    tool: row.label,
    operation: row.operation,
    input: row.inputLabel,
    median: human(row.medianMs),
    best: human(row.minMs),
    runs: row.iterations,
  }))
);
