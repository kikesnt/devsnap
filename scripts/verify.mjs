/**
 * Post-build verification.
 *
 * Checks the things that are easy to get wrong and expensive to discover
 * after deployment: element ids referenced by scripts that do not exist,
 * internal links pointing at pages that were never built, ads appearing on
 * pages they must not, and tool pages without enough publisher content.
 *
 * Run with: npm run verify
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const src = join(root, 'src');

const errors = [];
const warnings = [];

async function walk(dir, filter = () => true) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, filter)));
    else if (filter(full)) out.push(full);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* 1. Element ids used by scripts must exist in the same component              */
/* -------------------------------------------------------------------------- */

const components = await walk(join(src, 'components'), (f) => f.endsWith('.astro'));

for (const file of components) {
  const content = await readFile(file, 'utf8');
  const markup = content.split('<script>')[0] ?? content;

  const declared = new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const used = new Set([...content.matchAll(/byId<[^>]*>\('([^']+)'\)/g)].map((m) => m[1]));

  for (const id of used) {
    if (!declared.has(id)) {
      errors.push(
        `${relative(root, file)}: script references #${id} but no element with that id exists`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Internal links must resolve to a built page                              */
/* -------------------------------------------------------------------------- */

const pages = await walk(dist, (f) => f.endsWith('.html'));
const builtPaths = new Set(
  pages.map((file) => '/' + relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/'))
);

let linkCount = 0;
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const from = '/' + relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/');

  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = match[1];
    linkCount += 1;
    if (href === '/') continue;
    // Static assets and hashed bundles are not pages; check the file system.
    const lastSegment = href.split('/').pop() ?? '';
    if (lastSegment.includes('.') || href.startsWith('/_astro/')) {
      const asset = join(dist, href.replace(/^\//, ''));
      try {
        await stat(asset);
      } catch {
        errors.push(`${from}: link to missing asset "${href}"`);
      }
      continue;
    }
    const normalised = href.endsWith('/') ? href : `${href}/`;
    if (!builtPaths.has(normalised)) {
      errors.push(`${from}: link to "${href}" has no matching built page`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 2b. Every page must be reachable from somewhere                           */
/* -------------------------------------------------------------------------- */

/*
 * An orphan page is a page that exists, is in the sitemap, and is linked from
 * nowhere. It is invisible to a click-through review and it is a real problem
 * for both crawlers and reviewers: the "how we make money" page was shipped
 * once with no inbound link at all, and nothing caught it.
 */
const linkedPaths = new Set(['/']);
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = match[1];
    if (href.endsWith('/')) linkedPaths.add(href);
  }
}

for (const file of pages) {
  const relativePath = relative(dist, file).replace(/\\/g, '/');
  if (relativePath === 'index.html' || relativePath === '404.html') continue;
  const pagePath = '/' + relativePath.replace(/index\.html$/, '');
  const html = await readFile(file, 'utf8');
  if (html.includes('name="robots" content="noindex')) continue;
  if (!linkedPaths.has(pagePath)) {
    errors.push(`${pagePath}: no page links to it (orphan)`);
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Ad policy invariants                                                   */
/* -------------------------------------------------------------------------- */

let adsEnabled = false;
for (const file of pages) {
  if ((await readFile(file, 'utf8')).includes('pagead2.googlesyndication.com')) {
    adsEnabled = true;
    break;
  }
}

const toolPages = pages.filter((f) => /tools\/[^/]+\/index\.html$/.test(f));

const errorPage = pages.find((f) => f.endsWith('404.html'));
if (!errorPage) {
  errors.push('404 page was not generated');
} else {
  const html = await readFile(errorPage, 'utf8');
  if (html.includes('pagead2.googlesyndication.com')) {
    errors.push('404 page loads the AdSense script — ads must not appear on error screens');
  }
  if (html.includes('adsbygoogle.js')) {
    errors.push('404 page loads adsbygoogle.js');
  }
  if (/<ins[^>]*adsbygoogle/.test(html)) {
    errors.push('404 page contains ad slot markup — error screens must carry no ads');
  }
  if (!html.includes('noindex')) {
    errors.push('404 page is missing the noindex directive');
  }
}

if (adsEnabled) {
  // Minimum ad coverage per page type. A page that silently loses a slot is
  // a revenue bug, and it is invisible in the HTML diff.
  const home = pages.find((f) => f.endsWith('index.html') && f.split('/').length === 2);
  if (home) {
    const html = await readFile(home, 'utf8');
    const slots = (html.match(/<ins[^>]*adsbygoogle/g) ?? []).length;
    if (slots < 2) {
      errors.push(`Home page has ${slots} ad slot(s), expected at least 2`);
    }
  }

  for (const file of toolPages) {
    const html = await readFile(file, 'utf8');
    const slots = (html.match(/<ins[^>]*adsbygoogle/g) ?? []).length;
    if (slots < 3) {
      errors.push(`${relative(dist, file)} has ${slots} ad slot(s), expected at least 3`);
    }
  }
}

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  if (/<iframe[^>]*adsbygoogle/i.test(html)) {
    errors.push(`${relative(dist, file)}: ad markup is wrapped in an iframe, which is prohibited`);
  }
  if (html.includes('loading="lazy"') && /<ins[^>]*adsbygoogle/.test(html)) {
    warnings.push(`${relative(dist, file)}: lazy-loaded ad slot — do not lazy-render ad slots`);
  }

  /*
   * Consent Mode v2, and the order it has to be in.
   *
   * The AdSense script is in the head of every page that serves ads, and
   * Google's review looks for it there: hide it until the visitor accepts
   * and the review fails with "no ad unit found on your site". What waits
   * for the consent is the ad REQUEST, not the script.
   *
   * So the script is always there, and the consent mode default has to be
   * declared BEFORE it: the script is async, and a default that arrives
   * after it is a default that arrived too late. This check only applies
   * to the pages that actually load the script, so a build without
   * advertising stays valid.
   */
  const scriptAt = html.indexOf('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
  if (scriptAt !== -1) {
    const consentAt = html.search(/gtag\(\s*['"]consent['"]\s*,\s*['"]default['"]/);
    if (consentAt === -1) {
      errors.push(`${relative(dist, file)}: the Consent Mode v2 default is missing`);
    } else if (consentAt > scriptAt) {
      errors.push(
        `${relative(dist, file)}: the Consent Mode v2 default is declared after the AdSense script`
      );
    }

    /*
     * The client id in the tag is the per-site EDITOR id (ca-pub-…). The
     * account publisher id (pub-…) belongs in ads.txt, not in the tag.
     */
    const client = html.match(/adsbygoogle\.js\?client=([^"'&\s]+)/);
    if (!client) {
      errors.push(`${relative(dist, file)}: the AdSense script carries no client id`);
    } else if (!client[1].startsWith('ca-pub-')) {
      errors.push(
        `${relative(dist, file)}: the AdSense client id is "${client[1]}", expected a ca-pub-… editor id`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 3b. ads.txt                                                                */
/* -------------------------------------------------------------------------- */

/*
 * ads.txt is a statement about the domain, not about the ad units on the
 * page: AdSense reads it to check that the site may sell the account's
 * inventory, and reports "ads.txt error" when the file is served without an
 * authorised seller. The seller line names the publisher id of the ACCOUNT
 * (pub-…), which is the same for every site in the account. The per-site
 * editor id (ca-pub-…) is not a seller and must never appear here.
 *
 * The file is checked in every build, advertising or not: it is served at
 * the domain root either way.
 */
const adsTxtPath = join(dist, 'ads.txt');
if (!existsSync(adsTxtPath)) {
  errors.push('ads.txt was not generated');
} else {
  const adsTxt = await readFile(adsTxtPath, 'utf8');
  const sellers = adsTxt
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  if (!sellers.some((line) => /^google\.com,\s*pub-\d+,\s*DIRECT,\s*\S+$/.test(line))) {
    errors.push(`ads.txt has no authorised seller line: ${JSON.stringify(adsTxt.trim())}`);
  }

  /*
   * Every site of the account serves the same 59 bytes. A comment line is
   * harmless for the parser, but it makes two files of the same account
   * differ, and the difference is what breaks the byte for byte comparison
   * when the account is audited.
   */
  const nonEmptyLines = adsTxt
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (nonEmptyLines.length !== 1) {
    errors.push(
      `ads.txt must be exactly one line, found ${nonEmptyLines.length}: ${JSON.stringify(adsTxt.trim())}`
    );
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Structured data and in-page anchors                                     */
/* -------------------------------------------------------------------------- */

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  )) {
    try {
      const parsed = JSON.parse(match[1]);
      if (!parsed['@context']) {
        errors.push(`${relative(dist, file)}: JSON-LD block without @context`);
      }

      /*
       * An empty field is worse than a missing one: the structured data
       * looks valid, the validator passes it, and the search engine gets a
       * publisher with no url and no address. This happened when a build
       * variable came out empty and the default was not applied.
       */
      for (const node of parsed['@graph'] ?? [parsed]) {
        const type = node['@type'] ?? 'node';
        if (node.url === '') {
          errors.push(`${relative(dist, file)}: JSON-LD "${type}" has an empty url`);
        }
        if (node.email === '') {
          errors.push(`${relative(dist, file)}: JSON-LD "${type}" has an empty email`);
        }
        if (node.publisher && node.publisher.name === '') {
          errors.push(`${relative(dist, file)}: JSON-LD "${type}" has a publisher with an empty name`);
        }
      }
    } catch (error) {
      errors.push(`${relative(dist, file)}: JSON-LD is not valid JSON (${error.message})`);
    }
  }

  const isNoIndex = html.includes('name="robots" content="noindex');
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/);
  if (!canonical && !isNoIndex) {
    errors.push(`${relative(dist, file)}: missing canonical link`);
  }

  /*
   * A relative canonical is a canonical that says nothing about which domain
   * the page belongs to. It happens when the site domain is empty, and it is
   * invisible in the build log: the page still builds and the link is still
   * there. So the check is that it is absolute, not that it exists.
   */
  if (canonical && !/^https?:\/\/[^\s]+$/.test(canonical[1])) {
    errors.push(
      `${relative(dist, file)}: canonical is "${canonical[1]}", expected an absolute https URL`
    );
  }

  const ogUrl = html.match(/<meta property="og:url" content="([^"]*)"/);
  if (ogUrl && !/^https?:\/\/[^\s]+$/.test(ogUrl[1])) {
    errors.push(`${relative(dist, file)}: og:url is "${ogUrl[1]}", expected an absolute https URL`);
  }

  if (!html.includes('name="description"')) {
    errors.push(`${relative(dist, file)}: missing meta description`);
  }

  // In-page anchors must resolve to an element on the same page.
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    const anchor = match[1];
    if (anchor && !ids.has(anchor)) {
      errors.push(`${relative(dist, file)}: in-page link to "#${anchor}" has no target`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Publisher content density on tool pages                                 */
/* -------------------------------------------------------------------------- */

function wordCount(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return body.split(' ').filter(Boolean).length;
}

const thinPages = [];
for (const file of toolPages) {
  const html = await readFile(file, 'utf8');
  const words = wordCount(html);
  if (words < 400) {
    thinPages.push(`${relative(dist, file)}: ${words} words`);
  }
}
if (thinPages.length > 0) {
  warnings.push(
    `Tool pages below the 400-word target:\n    ${thinPages.join('\n    ')}`
  );
}

/* -------------------------------------------------------------------------- */
/* 5b. Icon set                                                               */
/* -------------------------------------------------------------------------- */

// Four different consumers fetch four different files: the tab reads the SVG
// or the ICO, iOS reads the 180px square, Android reads the manifest and
// Google's favicon crawler asks for /favicon.ico first. A missing one is
// invisible in the build log and shows up as a default globe in the browser, so
// the build fails instead.
const REQUIRED_ICONS = [
  'favicon.ico',
  'favicon.svg',
  'favicon-32.png',
  'favicon-192.png',
  'favicon-512.png',
  'apple-touch-icon.png',
  'site.webmanifest',
];
for (const icon of REQUIRED_ICONS) {
  if (!existsSync(join(dist, icon))) {
    errors.push(`missing ${icon}`);
  }
}

const homeHtml = await readFile(join(dist, 'index.html'), 'utf8');
for (const href of ['/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/site.webmanifest']) {
  if (!homeHtml.includes(href)) {
    errors.push(`index.html does not reference ${href}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 6. Output                                                                  */
/* -------------------------------------------------------------------------- */

console.log(`Pages built:            ${pages.length}`);
console.log(`Tool pages:             ${toolPages.length}`);
console.log(`Internal links checked: ${linkCount}`);
console.log(`OG images:              ${(await walk(join(dist, 'og'), (f) => f.endsWith('.png'))).length}`);

if (warnings.length > 0) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const warning of warnings) console.log(`  ! ${warning}`);
}

if (errors.length > 0) {
  console.log(`\nErrors (${errors.length}):`);
  for (const error of errors) console.log(`  x ${error}`);
  process.exit(1);
}

console.log('\nAll checks passed.');
