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
let toolPages = 0;
let pagesWithChip = 0;
let pagesWithTiming = 0;
const leakedRequests = [];
const missingTiming = [];
const inputDriven = [];

for (const path of pages) {
  if (path === '/404') continue;

  consoleErrors.length = 0;
  exceptions.length = 0;

  // The preview server runs on its own port; the DevTools browser is only
  // the client driving it.
  const url = `${BASE_URL}${path}`;
  await send('Page.navigate', { url });
  await sleep(900);

  // Click the primary action of the tool, and the load-sample button. A few
  // tools have no primary action at all because they are driven by their
  // inputs (a live preview), and the chip deliberately does not time
  // keystrokes. For those, click a filter button if there is one so the
  // timer has something honest to measure.
  const action = await evaluate(`(() => {
    const buttons = [...document.querySelectorAll('.tool button')];
    const isCopy = (b) => /^copy\\b/i.test((b.textContent || '').trim());
    const primary = buttons.find((b) => b.classList.contains('btn-primary'));
    const filter = buttons.find(
      (b) => !isCopy(b) && !b.classList.contains('btn-primary') && b.getAttribute('aria-pressed') === 'false'
    );
    const target = primary || filter;
    if (target) target.click();
    const sample = buttons.find((b) => /sample/i.test(b.textContent || ''));
    if (sample) sample.click();
    return { buttons: buttons.length, clicked: Boolean(target) };
  })()`);
  await sleep(700);

  /*
   * The integrity chip is a claim the site makes in prose, so it gets a test
   * like any other claim. Three things are checked: it exists on every tool
   * page, it reports a timing after an action, and it never reports a network
   * request. That last one is the regression guard for the whole "nothing is
   * uploaded" promise: a tool that starts phoning home fails the build.
   */
  const chip = await evaluate(`(() => {
    if (!document.querySelector('.tool')) return null;
    const element = document.querySelector('.tool-proof');
    if (!element) return { missing: true };
    const time = element.querySelector('.tool-proof-time');
    return {
      count: element.querySelector('.tool-proof-count')?.textContent ?? '',
      time: time && !time.hidden ? time.textContent : '',
      state: element.dataset.state ?? '',
    };
  })()`);

  if (chip) {
    toolPages += 1;
    if (chip.missing) {
      failures.push({ path, problems: ['tool page has no integrity chip'] });
    } else {
      pagesWithChip += 1;
      if (chip.time) {
        pagesWithTiming += 1;
      } else if (action.clicked) {
        missingTiming.push(path);
      } else {
        // Nothing to press: the tool reacts to typing, which is not timed.
        inputDriven.push(path);
      }
      if (chip.state === 'warn') {
        leakedRequests.push({ path, count: chip.count });
      }
    }
  }

  checked += 1;

  const problems = [...exceptions.map((e) => `exception: ${e}`), ...consoleErrors];
  if (problems.length > 0) {
    failures.push({ path, problems: [...new Set(problems)] });
  }
}

socket.close();
child.kill();

console.log(`Pages exercised: ${checked}`);
console.log(`Tool pages with the integrity chip: ${pagesWithChip}/${toolPages}`);
console.log(
  `Tool pages that reported a timing: ${pagesWithTiming}/${toolPages - inputDriven.length}` +
    (inputDriven.length > 0 ? ` (${inputDriven.length} input-only tool(s) not timed by design)` : '')
);
if (missingTiming.length > 0) {
  console.log(`  no timing after an action on: ${missingTiming.join(', ')}`);
  failures.push({ path: '(timing)', problems: missingTiming.map((p) => `${p}: no timing after a click`) });
}
if (inputDriven.length > 0) {
  console.log(`  input-only: ${inputDriven.join(', ')}`);
}

if (leakedRequests.length > 0) {
  console.log(`\n${leakedRequests.length} tool page(s) made a network request:\n`);
  for (const leak of leakedRequests) {
    console.log(`  x ${leak.path}: ${leak.count}`);
  }
  failures.push({ path: '(integrity)', problems: ['a tool made a network request'] });
}
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
