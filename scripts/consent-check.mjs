/**
 * Consent-flow check.
 *
 * The consent behaviour is a legal claim and a policy claim at the same time,
 * and both of them are invisible in a screenshot: a hidden ad slot and an
 * empty ad slot look identical in a still image. This drives a headless
 * browser with a forced timezone and asserts what actually happens.
 *
 * It needs a build with advertising enabled, so it is not part of the default
 * gate. Run it with:
 *
 *   npm run check:consent
 *
 * which builds with a placeholder publisher id and points at the preview
 * server.
 */
import { spawn } from 'node:child_process';
import { stat } from 'node:fs/promises';

const BASE_URL = process.env.CONSENT_BASE_URL ?? 'http://127.0.0.1:4321';
const PORT = 9334;

const CHROME_CANDIDATES = [
  '/Users/enriquemayor/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await stat(candidate);
      return candidate;
    } catch {
      // keep looking
    }
  }
  return null;
}

const chrome = await findChrome();
if (!chrome) {
  console.log('No Chrome binary found — skipping the consent check.');
  process.exit(0);
}

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

const socket = new WebSocket(await endpoint());
let nextId = 1;
const pending = new Map();

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? 'failed');
  return result.result?.value;
}

await send('Page.enable');
await send('Runtime.enable');

const results = [];

function check(name, actual, expected) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ name, pass, actual, expected });
}

async function state() {
  return evaluate(`(() => {
    const banner = document.getElementById('consent-banner');
    const slot = document.querySelector('.ad-slot');
    return {
      bannerVisible: Boolean(banner) && !banner.hidden,
      slotVisible: Boolean(slot) && !slot.hidden,
      slotPresent: Boolean(slot),
    };
  })()`);
}

async function visit(zone, path = '/tools/json-formatter/') {
  await send('Emulation.setTimezoneOverride', { timezoneId: zone });
  await send('Page.navigate', { url: 'about:blank' });
  await sleep(150);
  // Clearing storage needs an origin, so it happens after a first load.
  await send('Page.navigate', { url: `${BASE_URL}${path}` });
  await sleep(700);
  await evaluate('localStorage.clear(); document.cookie = "devsnap-consent=; max-age=0; path=/";');
  await send('Page.reload', { ignoreCache: true });
  await sleep(900);
}

/* ---- 1. EEA, no answer: nothing is requested, the banner is shown ---- */
await visit('Europe/Madrid');
const eeaNoAnswer = await state();
check('EEA, no answer: banner is shown', eeaNoAnswer.bannerVisible, true);
check('EEA, no answer: ad slot is withheld', eeaNoAnswer.slotVisible, false);

/* ---- 2. EEA, rejected: still nothing ---- */
await evaluate('document.getElementById("consent-reject").click();');
await sleep(400);
const eeaRejected = await state();
check('EEA, rejected: banner closes', eeaRejected.bannerVisible, false);
check('EEA, rejected: ad slot stays withheld', eeaRejected.slotVisible, false);
check(
  'EEA, rejected: the answer is stored',
  await evaluate('localStorage.getItem("devsnap-consent")'),
  'denied'
);

/* ---- 3. EEA, accepted: the slot is released ---- */
await evaluate('document.getElementById("consent-banner").hidden = false;');
await evaluate('document.getElementById("consent-accept").click();');
await sleep(1200);
const eeaAccepted = await state();
check('EEA, accepted: banner stays closed', eeaAccepted.bannerVisible, false);
check('EEA, accepted: ad slot is released', eeaAccepted.slotVisible, true);

/* ---- 4. Outside the EEA, no answer: non-personalised ads ---- */
await visit('America/New_York');
const usNoAnswer = await state();
check('US, no answer: banner is shown', usNoAnswer.bannerVisible, true);
check('US, no answer: ad slot loads without personalisation', usNoAnswer.slotVisible, true);
check(
  'US, no answer: the slot is marked npa',
  await evaluate('document.querySelector("ins.adsbygoogle")?.getAttribute("data-npa")'),
  '1'
);

/* ---- 5. Do Not Track overrides a stored yes ---- */
await visit('America/New_York');
await evaluate('localStorage.setItem("devsnap-consent", "granted");');

// The override has to run before the page's own head script, which is what
// Page.addScriptToEvaluateOnNewDocument is for. Setting it after load and
// reloading does not survive the reload.
const { identifier } = await send('Page.addScriptToEvaluateOnNewDocument', {
  source:
    'Object.defineProperty(Navigator.prototype, "doNotTrack", { get: () => "1", configurable: true });',
});
await send('Page.reload', { ignoreCache: true });
await sleep(900);
check(
  'Do Not Track: a stored yes does not produce a personalised request',
  await evaluate('document.querySelector("ins.adsbygoogle")?.getAttribute("data-npa")'),
  '1'
);

await send('Page.removeScriptToEvaluateOnNewDocument', { identifier }).catch(() => {});

socket.close();
child.kill();

const failed = results.filter((result) => !result.pass);
for (const result of results) {
  console.log(`${result.pass ? '  ok' : '  x '} ${result.name}`);
  if (!result.pass) {
    console.log(`      expected ${JSON.stringify(result.expected)}, got ${JSON.stringify(result.actual)}`);
  }
}

console.log(`\n${results.length - failed.length}/${results.length} consent checks passed.`);
process.exit(failed.length > 0 ? 1 : 0);
