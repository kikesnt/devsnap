/**
 * End-to-end smoke test.
 *
 * Drives a headless Chrome over the DevTools protocol, loads every page,
 * clicks each tool's primary action, and reports any console error or
 * uncaught exception. This is the only way to catch the class of bug that a
 * build and a unit test both miss: a tool that renders but throws when you
 * actually use it.
 *
 * Run with: npm run smoke
 */
import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');

const CHROME_CANDIDATES = [
  '/Users/enriquemayor/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      const { stat } = await import('node:fs/promises');
      await stat(candidate);
      return candidate;
    } catch {
      // keep looking
    }
  }
  return null;
}

const PORT = 9333;
const BASE_URL = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4321';
const chrome = await findChrome();
if (!chrome) {
  console.log('No Chrome binary found — skipping the browser smoke test.');
  process.exit(0);
}

/* -------------------------------------------------------------------------- */
/* Minimal CDP client                                                         */
/* -------------------------------------------------------------------------- */

const child = spawn(
  chrome,
  [
    `--remote-debugging-port=${PORT}`,
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1280,900',
    'about:blank',
  ],
  { stdio: 'ignore' }
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function endpoint() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // not up yet
    }
    await sleep(250);
  }
  throw new Error('Chrome did not start');
}

const wsUrl = await endpoint();
const socket = new WebSocket(wsUrl);

let nextId = 1;
const pending = new Map();
const consoleErrors = [];
const exceptions = [];

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    consoleErrors.push(
      message.params.args.map((arg) => arg.value ?? arg.description ?? '').join(' ')
    );
  }
  if (message.method === 'Runtime.exceptionThrown') {
    const details = message.params.exceptionDetails;
    exceptions.push(
      details.exception?.description ?? details.text ?? 'Unknown exception'
    );
  }
});

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? 'evaluation failed');
  }
  return result.result?.value;
}

await send('Page.enable');
await send('Runtime.enable');

/* -------------------------------------------------------------------------- */
/* Discover the pages                                                          */
/* -------------------------------------------------------------------------- */

async function listPages(dir, base = '') {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await listPages(full, `${base}/${entry.name}`)));
    } else if (entry.name === 'index.html') {
      found.push(base || '/');
    }
  }
  return found;
}

const pages = (await listPages(dist)).sort();

const failures = [];
let checked = 0;

for (const path of pages) {
  if (path === '/404') continue;

  consoleErrors.length = 0;
  exceptions.length = 0;

  // The preview server runs on its own port; the DevTools browser is only
  // the client driving it.
  const url = `${BASE_URL}${path}`;
  await send('Page.navigate', { url });
  await sleep(900);

  // Click the primary action of the tool, and the load-sample button.
  await evaluate(`(() => {
    const buttons = [...document.querySelectorAll('.tool button')];
    const primary = buttons.find((b) => b.classList.contains('btn-primary'));
    if (primary) primary.click();
    const sample = buttons.find((b) => /sample/i.test(b.textContent || ''));
    if (sample) sample.click();
    return buttons.length;
  })()`);
  await sleep(700);

  checked += 1;

  const problems = [...exceptions.map((e) => `exception: ${e}`), ...consoleErrors];
  if (problems.length > 0) {
    failures.push({ path, problems: [...new Set(problems)] });
  }
}

socket.close();
child.kill();

console.log(`Pages exercised: ${checked}`);
if (failures.length > 0) {
  console.log(`\n${failures.length} page(s) with runtime errors:\n`);
  for (const failure of failures) {
    console.log(`  x ${failure.path}`);
    for (const problem of failure.problems) {
      console.log(`      ${problem.split('\n')[0]}`);
    }
  }
  process.exit(1);
}
console.log('No console errors or uncaught exceptions.');
