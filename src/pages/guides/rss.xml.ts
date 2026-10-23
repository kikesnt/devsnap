import type { APIRoute } from 'astro';
import { SITE } from '../../config';
import { allGuides } from '../../data/guides';

/**
 * The guides feed.
 *
 * It exists because a guide is the only thing on this site that somebody
 * might want to read again later, and an RSS reader is still the cheapest way
 * to be reminded that a site exists. There is no dependency here: the feed is
 * a string, and `@astrojs/rss` would be a dependency for a string.
 */
function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] ?? char
  );
}

function rfc822(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? new Date().toUTCString() : parsed.toUTCString();
}

export const GET: APIRoute = () => {
  const items = [...allGuides]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .map((guide) => {
      const url = `${SITE.domain}/guides/${guide.slug}/`;
      return [
        '    <item>',
        `      <title>${escapeXml(guide.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(guide.updated)}</pubDate>`,
        `      <description>${escapeXml(guide.description)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${SITE.name} guides`)}</title>
    <link>${SITE.domain}/guides/</link>
    <description>${escapeXml('Longer explanations of the concepts behind the tools: JSON, regex, time zones, diffs, tokens and the rest.')}</description>
    <language>en</language>
    <atom:link href="${SITE.domain}/guides/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
