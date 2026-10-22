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
