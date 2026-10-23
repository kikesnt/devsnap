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
  if (html.includes('adsbygoogle')) {
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
  if (html.includes('loading="lazy"') && html.includes('adsbygoogle')) {
    warnings.push(`${relative(dist, file)}: lazy-loaded ad slot — do not lazy-render ad slots`);
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
    } catch (error) {
      errors.push(`${relative(dist, file)}: JSON-LD is not valid JSON (${error.message})`);
    }
  }

  const isNoIndex = html.includes('name="robots" content="noindex');
  if (!html.includes('<link rel="canonical"') && !isNoIndex) {
    errors.push(`${relative(dist, file)}: missing canonical link`);
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
