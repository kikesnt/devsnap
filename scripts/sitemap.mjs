/**
 * Publishes a plain /sitemap.xml next to Astro's sitemap-index.xml.
 *
 * Astro's sitemap integration publishes an index (sitemap-index.xml) that
 * points at the real file (sitemap-0.xml). That is valid and Google supports
 * it, but it is the only one of the four sites that does it this way, and the
 * other three are read by Google without a problem. A crawler that fails to
 * follow the extra hop never gets the list, so the same list is also written
 * to the conventional path, where every crawler and every tool expects it.
 *
 * The list is not written by hand: it is read from the file Astro generated,
 * so the two can never disagree. If that file is missing or looks wrong, the
 * build fails instead of publishing a sitemap with no URLs in it.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SOURCE = join(DIST, 'sitemap-0.xml');
const TARGET = join(DIST, 'sitemap.xml');

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const EXPECTED_DOMAIN = 'https://devsnap.cc';

async function readSourceUrls() {
  let xml;
  try {
    xml = await readFile(SOURCE, 'utf8');
  } catch {
    throw new Error(
      `${SOURCE} does not exist. The sitemap integration has to be enabled in astro.config.ts, ` +
        'otherwise the site would be published with no sitemap at all.'
    );
  }

  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

  if (urls.length === 0) {
    throw new Error(`${SOURCE} contains no <loc> entries. Refusing to publish an empty sitemap.`);
  }

  const seen = new Set();
  for (const url of urls) {
    if (!url.startsWith(`${EXPECTED_DOMAIN}/`)) {
      throw new Error(`${url} is not a URL of ${EXPECTED_DOMAIN}. Refusing to publish it.`);
    }
    if (seen.has(url)) {
      throw new Error(`${url} appears twice in the sitemap. Refusing to publish it.`);
    }
    seen.add(url);
  }

  return urls;
}

function render(urls) {
  const entries = urls
    .map(
      (url) =>
        `  <url>\n    <loc>${url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NS}">\n${entries}\n</urlset>\n`;
}

const urls = await readSourceUrls();
await writeFile(TARGET, render(urls), 'utf8');
console.log(`sitemap.xml:       ${urls.length} URLs written to dist/sitemap.xml`);
