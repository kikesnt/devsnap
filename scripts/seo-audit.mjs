/**
 * SEO audit.
 *
 * Checks the things that decide whether a page can rank and whether it
 * passes an AdSense review: title and description length, one H1 per page,
 * canonical correctness, structured data, internal linking, image alt text
 * and word count.
 *
 * Run with: npm run seo
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');

const errors = [];
const warnings = [];
const notes = [];

async function walk(dir, filter = () => true) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, filter)));
    else if (filter(full)) out.push(full);
  }
  return out;
}

const pages = await walk(dist, (f) => f.endsWith('.html'));

const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
const h1s = new Map();
const seen = { titles: new Set(), descriptions: new Set(), h1s: new Set() };

let totalWords = 0;

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const path = '/' + relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  const label = relative(dist, file);

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? '';
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim() ?? '';
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1]?.trim() ?? '';
  const h1sFound = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
    (m[1] ?? '').replace(/<[^>]+>/g, '').trim()
  );

  /* ---- Title ---- */
  if (!title) {
    errors.push(`${label}: missing title`);
  } else {
    if (title.length > 60) {
      warnings.push(`${label}: title is ${title.length} characters (aim for 50-60)`);
    }
    if (title.length < 25) {
      warnings.push(`${label}: title is only ${title.length} characters`);
    }
    const key = title.toLowerCase();
    if (seen.titles.has(key)) {
      errors.push(`${label}: duplicate title — also on ${titles.get(key)}`);
    }
    seen.titles.add(key);
    titles.set(key, label);
  }

  /* ---- Description ---- */
  if (!description) {
    errors.push(`${label}: missing meta description`);
  } else {
    if (description.length > 160) {
      warnings.push(`${label}: description is ${description.length} characters (aim for 120-160)`);
    }
    if (description.length < 70) {
      warnings.push(`${label}: description is only ${description.length} characters`);
    }
    const key = description.toLowerCase();
    if (seen.descriptions.has(key)) {
      errors.push(`${label}: duplicate meta description — also on ${descriptions.get(key)}`);
    }
    seen.descriptions.add(key);
    descriptions.set(key, label);
  }

  const isNoIndex = html.includes('name="robots" content="noindex');

  /* ---- Canonical ---- */
  if (!canonical && !isNoIndex) {
    errors.push(`${label}: missing canonical`);
  } else if (canonical && !canonical.endsWith(path) && path !== '/') {
    errors.push(`${label}: canonical "${canonical}" does not match the page path "${path}"`);
  }
  const canonicalKey = canonical;
  if (canonicals.has(canonicalKey)) {
    errors.push(`${label}: canonical duplicates ${canonicals.get(canonicalKey)}`);
  }
  canonicals.set(canonicalKey, label);

  /* ---- Headings ---- */
  if (h1sFound.length === 0) {
    errors.push(`${label}: no H1`);
  } else if (h1sFound.length > 1) {
    errors.push(`${label}: ${h1sFound.length} H1 elements (there should be one)`);
  } else {
    const h1 = h1sFound[0];
    if (h1.length > 75) {
      warnings.push(`${label}: H1 is ${h1.length} characters (aim for under 70)`);
    }
    const key = h1.toLowerCase();
    if (seen.h1s.has(key)) {
      errors.push(`${label}: duplicate H1 — also on ${h1s.get(key)}`);
    }
    seen.h1s.add(key);
    h1s.set(key, label);
  }

  /* ---- Structured data ---- */
  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (ldBlocks.length === 0 && !isNoIndex) {
    warnings.push(`${label}: no structured data`);
  }
  for (const block of ldBlocks) {
    try {
      const data = JSON.parse(block[1]);
      const nodes = data['@graph'] ?? [data];
      for (const node of nodes) {
        if (!node['@type']) errors.push(`${label}: structured data node without @type`);
      }
    } catch (error) {
      errors.push(`${label}: structured data is not valid JSON — ${error.message}`);
    }
  }

  /* ---- Open Graph ---- */
  if (!html.includes('og:image') && path !== '/404') {
    errors.push(`${label}: no og:image`);
  }
  if (!html.includes('name="twitter:card"')) {
    warnings.push(`${label}: no twitter:card`);
  }

  /* ---- Images need alt text ---- */
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/alt="/.test(match[0])) {
      errors.push(`${label}: an <img> has no alt attribute`);
    }
  }

  /* ---- Heading order ---- */
  /*
   * A jump from h2 to h4 is not a ranking penalty on its own, but it is a
   * signal that the outline was assembled visually rather than structurally,
   * and it makes the page harder to skim with a screen reader. The footer did
   * exactly this on every page: six h4 column titles after a content h2.
   */
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]));
  for (let index = 1; index < levels.length; index += 1) {
    if (levels[index] - levels[index - 1] > 1) {
      errors.push(`${label}: heading jumps from h${levels[index - 1]} to h${levels[index]}`);
      break;
    }
  }

  /* ---- Form controls need an accessible name ---- */
  const labelSpans = [...html.matchAll(/<label\b[\s\S]*?<\/label>/g)].map((match) => [
    match.index,
    match.index + match[0].length,
  ]);
  const idsInPage = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/<(input|select|textarea)\b([^>]*)>/g)) {
    const attrs = match[2];
    if (/type="hidden"/.test(attrs)) continue;
    if (/aria-label|aria-labelledby/.test(attrs)) continue;
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    if (id && html.includes(`for="${id}"`)) continue;
    const wrapped = labelSpans.some(([start, end]) => match.index > start && match.index < end);
    if (!wrapped) errors.push(`${label}: ${match[1]}${id ? `#${id}` : ''} has no label`);
  }

  /* ---- Ids must be unique, labels must point at something ---- */
  const idCounts = new Map();
  for (const id of idsInPage) idCounts.set(id, 0);
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
    idCounts.set(match[1], (idCounts.get(match[1]) ?? 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) errors.push(`${label}: id "${id}" appears ${count} times`);
  }
  for (const match of html.matchAll(/<label[^>]*\bfor="([^"]+)"/g)) {
    if (!idsInPage.has(match[1])) {
      errors.push(`${label}: <label for="${match[1]}"> points at nothing`);
    }
  }

  /* ---- Word count ---- */
  const body = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ');
  const words = body.split(/\s+/).filter(Boolean).length;
  totalWords += words;
  if (path.startsWith('/tools/') && words < 400) {
    warnings.push(`${label}: only ${words} words of content`);
  }
  if (path.startsWith('/guides/') && words < 600) {
    warnings.push(`${label}: only ${words} words of content`);
  }

  /* ---- Ads must not outnumber content ---- */
  const adSlots = (html.match(/<ins[^>]*adsbygoogle/g) ?? []).length;
  if (adSlots > 0 && words < 250) {
    errors.push(`${label}: ${adSlots} ad slot(s) on a page with only ${words} words`);
  }
}

/* -------------------------------------------------------------------------- */
/* Sitemap must match the pages that were built                              */
/* -------------------------------------------------------------------------- */

/*
 * A page missing from the sitemap is invisible to a crawler that only reads
 * the sitemap; a URL in the sitemap with no page behind it is a soft 404 and
 * a quality signal against the site. Neither is visible in a browser.
 */
const sitemapFiles = (await walk(dist, (f) => /sitemap.*\.xml$/.test(f))).filter(
  (f) => !f.endsWith('sitemap-index.xml')
);
const sitemapUrls = new Set();
for (const file of sitemapFiles) {
  const xml = await readFile(file, 'utf8');
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.add(match[1]);
}

const indexablePages = new Set();
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  if (html.includes('name="robots" content="noindex')) continue;
  if (file.endsWith('404.html')) continue;
  indexablePages.add('https://devsnap.cc/' + relative(dist, file).replace(/index\.html$/, ''));
}

for (const url of indexablePages) {
  if (!sitemapUrls.has(url)) errors.push(`sitemap: ${url} is indexable but not listed`);
}
for (const url of sitemapUrls) {
  if (!indexablePages.has(url)) errors.push(`sitemap: ${url} is listed but not an indexable page`);
}

console.log(`Sitemap URLs:       ${sitemapUrls.size}`);
console.log(`Pages audited:      ${pages.length}`);
console.log(`Total content:      ${totalWords.toLocaleString('en-US')} words`);
console.log(`Unique titles:      ${seen.titles.size}`);
console.log(`Unique descriptions:${seen.descriptions.size}`);

if (notes.length) {
  console.log(`\nNotes:`);
  for (const note of notes) console.log(`  - ${note}`);
}

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const warning of warnings) console.log(`  ! ${warning}`);
}

if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  for (const error of errors) console.log(`  x ${error}`);
  process.exit(1);
}

console.log('\nNo SEO errors.');
