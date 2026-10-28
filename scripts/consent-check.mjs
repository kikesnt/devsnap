/**
 * Consent-flow check.
 *
 * The consent behaviour is a legal claim and a policy claim at the same time,
 * and both of them are invisible in a screenshot: a hidden ad slot and an
 * empty ad slot look identical in a still image. This drives a headless
 * browser and asserts what actually happens.
 *
 * The rule it checks is simple and absolute: no advertising request is made
 * until the visitor has agreed. The <ins> elements live inside a <template>
 * (see src/components/AdSlot.astro), so the AdSense library does not find
 * them and nothing is requested; agreeing moves them into the page and
 * pushes them to the library.
 *
 * The check is made at the network level, not only on the DOM: the test
 * watches the requests the browser makes and separates the ones that belong
 * to this site's ad slots from the ones Google makes on its own. That
 * separation matters, because Google can inject ad units of its own into
 * the body — automatic ads, which are a setting of the AdSense panel and
 * not of this code. Those requests are reported, but they are not this
 * site's fault and they do not fail the check.
 *
 * It also checks the one prompt rule: if Google's certified consent
 * platform (Funding Choices) turns up — even late — this site's banner must
 * not appear, or the visitor is asked the same question twice.
 *
 * It needs a build with advertising enabled, so it is not part of the default
 * gate. Run it with:
 *
 *   npm run check:ads && npm run check:consent
 *
 * which builds with a placeholder publisher id and points at the preview
 * server.
 */
import { spawn } from 'node:child_process';
import { stat } from 'node:fs/promises';

const BASE_URL = process.env.CONSENT_BASE_URL ?? 'http://127.0.0.1:4321';
const PORT = 9334;

/**
 * Fail the check when Google asks for ads of its own before the visitor
 * agrees. That is what automatic ads do, and the fix is in the AdSense
 * panel, not in the code, so it is off by default: the check prints the
 * finding and waits for the person in charge to turn automatic ads off.
 *
 *   CONSENT_STRICT_AUTO_ADS=1 npm run check:consent
 */
const STRICT_AUTO_ADS = process.env.CONSENT_STRICT_AUTO_ADS === '1';

/**
 * How long the site waits for Funding Choices before it shows its own
 * banner. The check has to wait for longer than that before it can say the
 * banner is not there.
 */
const CMP_WAIT_MS = 2500;
const SETTLE_MS = CMP_WAIT_MS + 1200;

/**
 * How long the check waits for the ad request that the consent has to
 * trigger. The library asks for the ad a moment after the unit is pushed.
 */
const AD_REQUEST_TIMEOUT_MS = 15000;

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
  if (process.env.CONSENT_REQUIRED) {
    // In CI a missing browser must fail the gate, not skip it: a gate that
    // silently does nothing is worse than no gate.
    console.error('No Chrome binary found — the consent check cannot run.');
    process.exit(1);
  }
  console.log('No Chrome binary found — skipping the consent check.');
  process.exit(0);
}

/*
 * The ad slots of this site are read from the served HTML: they are the
 * ids the site actually publishes, so the check cannot be fooled by a
 * stale configuration.
 */
const servedHtml = await (await fetch(`${BASE_URL}/tools/json-formatter/`)).text();
const slotIds = [
  ...new Set([...servedHtml.matchAll(/data-ad-slot="([^"]+)"/g)].map((match) => match[1])),
].filter((id) => id.length > 0);

if (slotIds.length === 0) {
  console.error(
    'The served page has no ad slots at all, so there is nothing to check.\n' +
      'Build with advertising enabled first: npm run check:ads'
  );
  process.exit(1);
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

/** Every request the browser has made, in order. */
const requests = [];

/**
 * Which page a request belongs to.
 *
 * A request made by the page that is on screen now is not the same as one
 * made by the page that was there a moment ago: the browser keeps asking for
 * things for a while, and a late request from the previous page would be
 * counted in the wrong phase. Every request is therefore tagged with the
 * page it belongs to.
 *
 * A page is identified by the document it loaded. The sub-resources of a
 * document carry its loader id, and the frames it opens (the ad iframes)
 * are attached while that page is on screen.
 */
let pageIndex = 0;
let currentLoaderId = '';
const framePage = new Map();

function pageOf(loaderId, frameId) {
  if (loaderId === currentLoaderId) return pageIndex;
  const frame = framePage.get(frameId);
  return frame === undefined ? -1 : frame;
}

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
    return;
  }
  if (message.method === 'Page.frameAttached') {
    framePage.set(message.params.frameId, pageIndex);
    return;
  }
  if (message.method === 'Network.requestWillBeSent') {
    const { request, type, loaderId, frameId } = message.params;
    if (type === 'Document' && request.url.startsWith(BASE_URL)) {
      // A new page of this site is loading: what belonged to the previous
      // one is stale from now on.
      pageIndex += 1;
      currentLoaderId = loaderId;
    }
    requests.push({ url: request.url, page: pageOf(loaderId, frameId) });
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
await send('Network.enable');

const results = [];
const notes = [];

function check(name, actual, expected) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ name, pass, actual, expected });
}

/** A request for an ad: the fetch that asks Google for a creative. */
function isAdRequest(url) {
  return (
    /\/pagead\/ads\?/.test(url) ||
    /\/pagead\/ads\/gampad\?/.test(url) ||
    /adservice\.google\.com/.test(url) ||
    /doubleclick\.net\/pagead/.test(url)
  );
}

/** An ad request that belongs to one of this site's ad slots. */
function isOurAdRequest(url) {
  return slotIds.some((id) => url.includes(id));
}

/** Marks where in the request log a phase starts. */
function mark() {
  return requests.length;
}

/** The ad requests made since a mark, split by who asked for them. */
function adRequestsSince(start) {
  const ads = requests
    .slice(start)
    .filter((entry) => entry.page === pageIndex)
    .map((entry) => entry.url)
    .filter(isAdRequest);
  return {
    ours: ads.filter(isOurAdRequest),
    automatic: ads.filter((url) => !isOurAdRequest(url)),
  };
}

/**
 * Waits until the browser stops asking for things.
 *
 * The ad request of a phase can arrive a moment after the phase is over,
 * and a request that arrives late would be counted in the next phase, where
 * the answer is expected to be "no request at all". So each phase waits for
 * the network to go quiet before the next one starts, and the late request
 * lands in the phase that caused it.
 */
async function drain(maxMs = 8000) {
  const started = Date.now();
  let seen = requests.length;
  let quietSince = Date.now();
  while (Date.now() - started < maxMs) {
    await sleep(250);
    if (requests.length !== seen) {
      seen = requests.length;
      quietSince = Date.now();
      continue;
    }
    if (Date.now() - quietSince >= 1200) return;
  }
}

/*
 * Every page load records whether the banner was ever visible, not only
 * whether it is visible at the moment of the check. A banner that appears
 * and disappears is a banner the visitor saw: that is the flicker the
 * double-prompt fix has to rule out.
 */
const { identifier: watcher } = await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `
    window.__bannerEverShown = false;
    const check = () => {
      const banner = document.getElementById('consent-banner');
      if (banner && !banner.hidden) window.__bannerEverShown = true;
    };
    const timer = setInterval(check, 10);
    setTimeout(() => clearInterval(timer), 20000);
  `,
});

/*
 * Funding Choices is kept out of the way by default, so the checks are
 * about this site's own banner. The property is defined rather than deleted
 * so that a script which assigns to it cannot throw.
 */
const { identifier: cmpBlocker } = await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `
    Object.defineProperty(window, 'googlefc', {
      configurable: true,
      get() { return undefined; },
      set() {}
    });
  `,
});

async function state() {
  return evaluate(`(() => {
    const banner = document.getElementById('consent-banner');
    const aside = document.querySelector('.ad-slot');
    // Only this site's own units: Google can inject units of its own into
    // the body when automatic ads are on, and those are not ours.
    const ours = document.querySelectorAll('ins.adsbygoogle[data-ds-ad-unit]');
    const foreign = document.querySelectorAll('ins.adsbygoogle:not([data-ds-ad-unit])');
    const template = document.querySelector('template[data-ds-ad-template]');
    return {
      bannerVisible: Boolean(banner) && !banner.hidden,
      bannerEverShown: window.__bannerEverShown === true,
      slotPresent: Boolean(aside),
      // The unit has left the template when it is in the page. The template
      // itself stays in the DOM on purpose: it keeps a copy of the unit so
      // the slot can be released again if the visitor changes their mind.
      adUnitInPage: ours.length > 0,
      adUnitCount: ours.length,
      foreignAdUnits: foreign.length,
      adUnitStillInTemplate: Boolean(
        template && template.content && template.content.querySelector('ins.adsbygoogle[data-ds-ad-unit]')
      ),
      adRequested: (window.__adsReleased ?? 0) > 0,
    };
  })()`);
}

async function visit(zone, path = '/tools/json-formatter/') {
  await send('Emulation.setTimezoneOverride', { timezoneId: zone });
  // The stored answer is cleared BEFORE the page loads, not after. A "yes"
  // left over from the previous phase would release the ad slots on that
  // first load, and the ad request it triggers would land in this phase.
  await send('Storage.clearDataForOrigin', {
    origin: BASE_URL,
    storageTypes: 'all',
  });
  await send('Page.navigate', { url: `${BASE_URL}${path}` });
  // Long enough for the site to have given up on Funding Choices and shown
  // its own banner, or to have found it and stood down.
  await sleep(SETTLE_MS);
}

/* ---- 1. No answer: the banner is shown and nothing is requested ---- */
await drain();
const noAnswerMark = mark();
await visit('Europe/Madrid');
const noAnswer = await state();
check('No answer: the banner is shown', noAnswer.bannerVisible, true);
check('No answer: the ad unit is not in the page', noAnswer.adUnitInPage, false);
check('No answer: the ad unit stays inside its template', noAnswer.adUnitStillInTemplate, true);
check('No answer: the slots are not released', noAnswer.adRequested, false);
check(
  'No answer: no ad request is made for the ad slots of this site',
  adRequestsSince(noAnswerMark).ours.length,
  0
);

/* ---- 2. Rejected: still nothing, and the answer is stored ---- */
await drain();
const rejectedMark = mark();
await evaluate('document.getElementById("consent-reject").click();');
await sleep(600);
const rejected = await state();
check('Rejected: the banner closes', rejected.bannerVisible, false);
check('Rejected: the slots are not released', rejected.adRequested, false);
check(
  'Rejected: no ad request is made for the ad slots of this site',
  adRequestsSince(rejectedMark).ours.length,
  0
);
check(
  'Rejected: the answer is stored',
  await evaluate('localStorage.getItem("devsnap-consent")'),
  'denied'
);

/* ---- 3. Accepted: the slots are released and the ad is asked for ---- */
await evaluate('document.getElementById("consent-banner").hidden = false;');
await drain();
const acceptMark = mark();
await evaluate('document.getElementById("consent-accept").click();');
await sleep(1200);
const accepted = await state();
check('Accepted: the banner closes', accepted.bannerVisible, false);
check('Accepted: the ad unit leaves the template', accepted.adUnitInPage, true);
check('Accepted: the slots are released', accepted.adRequested, true);

// The request is the thing the law is about: the unit can be in the page
// and still no ad asked for. So the check waits for the request itself.
let acceptedRequests = adRequestsSince(acceptMark);
const deadline = Date.now() + AD_REQUEST_TIMEOUT_MS;
while (acceptedRequests.ours.length === 0 && Date.now() < deadline) {
  await sleep(500);
  acceptedRequests = adRequestsSince(acceptMark);
}
check(
  'Accepted: the ad request is made for the ad slots of this site',
  acceptedRequests.ours.length > 0,
  true
);

/* ---- 4. The region does not change the answer ---- */
await drain();
const usMark = mark();
await visit('America/New_York');
const usNoAnswer = await state();
check('Outside the EEA, no answer: the banner is shown', usNoAnswer.bannerVisible, true);
check('Outside the EEA, no answer: the slots are not released', usNoAnswer.adRequested, false);
check(
  'Outside the EEA, no answer: no ad request is made for the ad slots of this site',
  adRequestsSince(usMark).ours.length,
  0
);

/* ---- 5. Do Not Track overrides a stored yes ---- */
await drain();
const dntMark = mark();
await visit('America/New_York');
await evaluate('localStorage.setItem("devsnap-consent", "granted");');

// The override has to run before the page's own head script, which is what
// Page.addScriptToEvaluateOnNewDocument is for. Setting it after load and
// reloading does not survive the reload.
const { identifier: dnt } = await send('Page.addScriptToEvaluateOnNewDocument', {
  source:
    'Object.defineProperty(Navigator.prototype, "doNotTrack", { get: () => "1", configurable: true });',
});
await send('Page.reload', { ignoreCache: true });
await sleep(SETTLE_MS);
const dntState = await state();
check('Do Not Track: the banner does not appear', dntState.bannerVisible, false);
check('Do Not Track: a stored yes does not release the slots', dntState.adRequested, false);
check(
  'Do Not Track: no ad request is made for the ad slots of this site',
  adRequestsSince(dntMark).ours.length,
  0
);

await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: dnt }).catch(() => {});

/* ---- 6. Funding Choices arrives late: the site banner stays out of it ---- */
await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: cmpBlocker }).catch(() => {});

// adsbygoogle.js is async, so Funding Choices can announce itself well
// after the page has loaded. If the site had already shown its banner by
// then, the visitor would be asked the same question twice.
const { identifier: lateCmp } = await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `
    setTimeout(() => {
      Object.defineProperty(window, 'googlefc', {
        configurable: true,
        writable: true,
        value: { showRevocationMessage: function () {} }
      });
    }, 1200);
  `,
});
await visit('America/New_York');
const lateCmpState = await state();
check('Funding Choices arrives late: the site banner is not shown', lateCmpState.bannerVisible, false);
check('Funding Choices arrives late: the banner never flashed', lateCmpState.bannerEverShown, false);
check(
  'Funding Choices arrives late: the slots are left to Google',
  lateCmpState.adRequested,
  true
);

await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: lateCmp }).catch(() => {});
await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: watcher }).catch(() => {});

/*
 * Automatic ads. Google can place ad units of its own in the body and ask
 * for ads without asking the visitor, because that is what automatic ads
 * are. The fix is one switch in the AdSense panel, so this is a finding
 * and not a failure of the site.
 */
const automaticUnits = await evaluate(
  'document.querySelectorAll("ins.adsbygoogle:not([data-ds-ad-unit])").length'
);
if (automaticUnits > 0) {
  const message =
    `Google placed ${automaticUnits} ad unit(s) of its own in the page. ` +
    'Turn automatic ads off in the AdSense panel for this site: they are asked for without consent.';
  if (STRICT_AUTO_ADS) {
    results.push({ name: 'Automatic ads are off', pass: false, actual: automaticUnits, expected: 0 });
  } else {
    notes.push(message);
  }
}

socket.close();
child.kill();

const failed = results.filter((result) => !result.pass);
for (const result of results) {
  console.log(`${result.pass ? '  ok' : '  x '} ${result.name}`);
  if (!result.pass) {
    console.log(`      expected ${JSON.stringify(result.expected)}, got ${JSON.stringify(result.actual)}`);
  }
}
for (const note of notes) {
  console.log(`  !  ${note}`);
}

console.log(`\n${results.length - failed.length}/${results.length} consent checks passed.`);
process.exit(failed.length > 0 ? 1 : 0);
