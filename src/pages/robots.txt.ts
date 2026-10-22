import type { APIRoute } from 'astro';

/**
 * robots.txt
 *
 * The site is open to indexing. The admin paths are not part of the static
 * build at all, but they are disallowed explicitly so that a future preview
 * deployment is not crawled.
 */
export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

# Nothing here is private, but these are never part of a public build.
Disallow: /api/
Disallow: /preview/

Sitemap: https://devsnap.cc/sitemap-index.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
