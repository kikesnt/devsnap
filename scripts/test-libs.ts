/**
 * Functional checks for the tool logic.
 *
 * These run in Node against the same modules the browser bundle uses, so a
 * regression in an algorithm is caught at build time rather than by a user
 * reporting a wrong answer.
 *
 * Run with: npm run test
 */
import { diffLines, toUnifiedDiff } from '../src/lib/diff.ts';
import { parseCron, describeCron, nextRuns, buildCron } from '../src/lib/cron.ts';
import { formatSql } from '../src/lib/sql.ts';
import { inferSchema } from '../src/lib/schema.ts';
import { parseCsv, serializeCsv, detectDelimiter } from '../src/lib/csv.ts';
import { renderMarkdown } from '../src/lib/markdown.ts';
import { diffJson } from '../src/lib/jsondiff.ts';
import { checksum, crc32, adler32, fletcher16, bytesOf, toBase64Url, fromBase64Url } from '../src/lib/hash.ts';
import { buildQr, buildPayload } from '../src/lib/qr.ts';
import { tokenize, detectLanguage, isDiff } from '../src/lib/snapshot.ts';

let passed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    passed += 1;
    return;
  }
  failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

function equal(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  check(name, a === b, `expected ${b}, got ${a}`);
}

/* ------------------------------- diff ------------------------------------- */

const diff = diffLines('a\nb\nc', 'a\nx\nc');
equal('diff: added count', diff.added, 1);
equal('diff: removed count', diff.removed, 1);
equal('diff: same count', diff.same, 2);
check('diff: unified output', toUnifiedDiff('a\nb', 'a\nb').includes(' a'), 'expected context line');

const unified = toUnifiedDiff('a\nb\nc', 'a\nx\nc');
check('diff: unified keeps the removed line', unified.includes('-b'), unified);
check('diff: unified keeps the added line', unified.includes('+x'), unified);
check('diff: word level narrows the change', (() => {
  const parts = diffLines('hello world', 'hello there').lines[0]?.parts;
  return Array.isArray(parts) && parts.some((p) => p.type === 'delete' && p.text.includes('world'));
})());

const reordered = diffLines('{"a":1,"b":2}', '{"b":2,"a":1}');
check('diff: order changes are reported', reordered.added + reordered.removed > 0);

/* ------------------------------- cron ------------------------------------- */

const cron = parseCron('*/15 * * * *');
check('cron: valid', cron.valid, cron.error);
equal('cron: minute values', cron.minute, [0, 15, 30, 45]);
check('cron: description', describeCron(cron).includes('minutes'), describeCron(cron));

const daily = parseCron('30 3 * * *');
check('cron: daily valid', daily.valid, daily.error);
const runs = nextRuns(daily, 3);
check('cron: next runs count', runs.length === 3, `got ${runs.length}`);
check('cron: next runs have the right minute', runs.every((run) => run.getMinutes() === 30));

check('cron: rejects a four-field expression', !parseCron('* * * *').valid);
check('cron: rejects an out-of-range value', !parseCron('99 * * * *').valid);
check('cron: accepts named months', parseCron('0 0 1 JAN *').valid);
equal('cron: builder', buildCron({ minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1' }), '0 9 * * 1');

/* -------------------------------- sql ------------------------------------- */

const sql = formatSql("select a,b from t where x='VAL' and y=1", { keywordCase: 'upper' });
check('sql: SELECT is capitalised', sql.startsWith('SELECT'), sql.slice(0, 40));
check('sql: FROM on its own line', sql.includes('\nFROM'), sql);
check('sql: string literal is untouched', sql.includes("'VAL'"), sql);
const literalSql = formatSql("select 'from where' as x", { keywordCase: 'upper' });
check(
  'sql: keywords inside literals are untouched',
  literalSql.includes("'from where'"),
  literalSql
);

/* ------------------------------ schema ------------------------------------ */

const schema = inferSchema({ id: 1, name: 'a', tags: ['x'], nested: { ok: true } });
check('schema: object type', schema.type === 'object');
check('schema: id is an integer', schema.properties?.id?.type === 'integer');
check('schema: nested object', schema.properties?.nested?.type === 'object');
check('schema: array items', schema.properties?.tags?.items?.type === 'string');
check('schema: required list', Array.isArray(schema.required) && schema.required.length === 4);

/* -------------------------------- csv ------------------------------------- */

const csv = parseCsv('a,b\n1,2\n"x,y",3');
equal('csv: headers', csv.headers, ['a', 'b']);
equal('csv: first row', csv.rows[0], ['1', '2']);
equal('csv: quoted delimiter', csv.rows[1]?.[0], 'x,y');
equal('csv: delimiter detection', detectDelimiter('a;b\n1;2'), ';');
check(
  'csv: ragged detection',
  parseCsv('a,b\n1,2,3').ragged.length === 1
);
equal('csv: serialise round trip', parseCsv(serializeCsv(['a', 'b'], [['1', '2']])).rows[0], ['1', '2']);

/* ----------------------------- markdown ----------------------------------- */

const html = renderMarkdown('# Title\n\n- [x] done\n\n| a | b |\n| --- | --- |\n| 1 | 2 |');
check('markdown: heading', html.includes('<h1>Title</h1>'), html);
check('markdown: task list', html.includes('type="checkbox"'), html);
check('markdown: table', html.includes('<table>'), html);
check('markdown: escapes raw html', !renderMarkdown('<img src=x onerror=alert(1)>').includes('<img'), 'raw html was not escaped');
check('markdown: escapes script tags', !renderMarkdown('<script>alert(1)</script>').includes('<script>'), 'script was not escaped');

/* ------------------------------ json diff --------------------------------- */

const differences = diffJson({ a: 1, b: { c: 2 } }, { a: '1', b: { c: 3 }, d: 4 });
check('json diff: type change detected', differences.some((d) => d.type === 'type'), JSON.stringify(differences));
check('json diff: value change detected', differences.some((d) => d.path === 'b.c' && d.type === 'changed'));
check('json diff: addition detected', differences.some((d) => d.path === 'd' && d.type === 'added'));
check('json diff: key order ignored', diffJson({ a: 1, b: 2 }, { b: 2, a: 1 }).length === 0);

/* ------------------------------ checksums --------------------------------- */

equal('crc32: known vector', crc32(bytesOf('123456789')).toString(16), 'cbf43926');
equal('adler32: known vector', adler32(bytesOf('Wikipedia')).toString(16), '11e60398');
// Fletcher-16 of "abcde" is the classic 0xC8F0 test vector.
equal('fletcher16: known vector', fletcher16(bytesOf('abcde')), 0xc8f0);
equal('checksum: dispatch', checksum(bytesOf('abc'), 'crc32'), crc32(bytesOf('abc')));

/* ------------------------------- base64 ----------------------------------- */

const encoded = toBase64Url(JSON.stringify({ a: 1 }));
equal('base64url: round trip', JSON.parse(fromBase64Url(encoded)).a, 1);
check('base64url: no padding', !encoded.includes('='), encoded);

/* --------------------------------- qr ------------------------------------- */

const matrix = buildQr('https://example.com', {
  errorLevel: 'M',
  cellSize: 4,
  margin: 2,
  foreground: '#000',
  background: '#fff',
});
check('qr: matrix built', matrix.size > 20, `size ${matrix.size}`);
check('qr: wifi payload', buildPayload('wifi', { ssid: 'Net', password: 'pw', security: 'WPA' }).startsWith('WIFI:T:WPA;S:Net;'), buildPayload('wifi', { ssid: 'Net', password: 'pw', security: 'WPA' }));
check('qr: vcard payload', buildPayload('vcard', { firstName: 'A', lastName: 'B' }).includes('BEGIN:VCARD'));
check('qr: url payload', buildPayload('url', { url: 'https://x.dev' }) === 'https://x.dev');

/* ------------------------------ snapshot ---------------------------------- */

check('snapshot: diff detection', isDiff('--- a/x\n+++ b/x\n@@ -1 +1 @@'));
check('snapshot: json detection', detectLanguage('{"a": 1}') === 'json');
check('snapshot: sql detection', detectLanguage('SELECT * FROM t') === 'sql');
const tokens = tokenize('const x = "hi"; // note', 'javascript');
check('snapshot: keyword tokenised', tokens.some((t) => t.kind === 'keyword' && t.text === 'const'));
check('snapshot: string tokenised', tokens.some((t) => t.kind === 'string' && t.text.includes('hi')));
check('snapshot: comment tokenised', tokens.some((t) => t.kind === 'comment'));

/* -------------------------------- report ---------------------------------- */

console.log(`${passed} checks passed.`);
if (failures.length > 0) {
  console.log(`\n${failures.length} failed:`);
  for (const failure of failures) console.log(`  x ${failure}`);
  process.exit(1);
}
