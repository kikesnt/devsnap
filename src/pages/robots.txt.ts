import type { APIRoute } from 'astro';

/**
 * robots.txt
 *
 * The site is open to indexing. The admin paths are not part of the static
 * build at all, but they are disallowed explicitly so that a future preview
 * deployment is not crawled.
 *
 * AI crawlers are split by purpose, following RFC 9309: a crawler obeys only
 * the most specific group that names it, so the `*` group no longer applies
 * to them once their own group exists.
 *
 *   - search and citation bots (ChatGPT search, Claude search, Perplexity) are
 *     allowed, because they are the ones that send visitors;
 *   - training bots are not, because the content here is editorial work.
 *
 * `Content-Signal` states the same preference in a machine-readable way. It
 * is a preference, not access control, and it has no effect on Google Search.
 */
const AI_SEARCH_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
];

const AI_TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'CCBot',
  'Bytespider',
  'Applebot-Extended',
  'meta-externalagent',
  'AI2Bot',
  'YouBot',
  'Diffbot',
];

const SIGNAL = 'Content-Signal: search=yes, ai-input=yes, ai-train=no';

export const GET: APIRoute = () => {
  const body = `# AI crawlers: the content may be read and quoted, but not used to train models.
# Content-Signal: https://www.cloudflare.com/developer-platform/products/content-signals-policy/

User-agent: *
${SIGNAL}
Allow: /

# Nothing here is private, but these are never part of a public build.
Disallow: /api/
Disallow: /preview/

# Search and citation: they are the ones that send visitors.
User-agent: ${AI_SEARCH_BOTS.join('\nUser-agent: ')}
${SIGNAL}
Allow: /
Disallow: /api/
Disallow: /preview/

# Training: no. The content here is editorial work.
User-agent: ${AI_TRAINING_BOTS.join('\nUser-agent: ')}
${SIGNAL}
Disallow: /

Sitemap: https://devsnap.cc/sitemap-index.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
