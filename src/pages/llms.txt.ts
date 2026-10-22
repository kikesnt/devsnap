import type { APIRoute } from 'astro';
import { tools } from '../data/tools';
import { allGuides as guides } from '../data/guides';
import { SITE } from '../config';

/**
 * llms.txt
 *
 * A plain-text index of the site for language models and crawlers. It is
 * optional, it costs nothing, and it makes the tool list machine-readable.
 */
export const GET: APIRoute = () => {
  const toolLines = tools.map(
    (tool) => `- [${tool.name}](${SITE.domain}/tools/${tool.slug}/): ${tool.description}`
  );
  const guideLines = guides.map(
    (guide) => `- [${guide.title}](${SITE.domain}/guides/${guide.slug}/): ${guide.description}`
  );

  const body = `# DevSnap

> ${SITE.description}

${SITE.name} is a static toolbox of browser-based developer tools. Every tool runs
entirely client-side: no account, no upload, no tracking cookie, and nothing the
user pastes is ever transmitted to a server.

## Tools

${toolLines.join('\n')}

## Guides

${guideLines.join('\n')}

## Pages

- [Home](${SITE.domain}/): ${SITE.tagline}
- [All tools](${SITE.domain}/tools/): every tool in one index
- [Guides](${SITE.domain}/guides/): long-form explanations
- [About](${SITE.domain}/about/): what the site is and how it is funded
- [Contact](${SITE.domain}/contact/): how to reach the team
- [Privacy Policy](${SITE.domain}/privacy/): what data is collected, which is almost none
- [Terms of Service](${SITE.domain}/terms/): the terms of use
- [Disclaimer](${SITE.domain}/disclaimer/): accuracy and professional-advice limits

## Optional

- [Sitemap](${SITE.domain}/sitemap-index.xml): the full list of pages
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
