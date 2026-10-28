/**
 * Central site configuration.
 *
 * Every value that a publisher may need to change after launch lives here so
 * that the rest of the codebase never hard-codes a domain, an e-mail address or
 * an ad identifier.
 */

const env = import.meta.env;

/**
 * Reads an environment variable and falls back when it carries no value.
 *
 * An empty string counts as missing, and that is not a detail. A CI pipeline
 * passes a variable that does not exist as an empty string, and `??` only
 * falls back on null and undefined. So an empty PUBLIC_SITE_DOMAIN did not
 * fall back to the default domain: it left the canonical of every page
 * relative ("/"), the og:url relative, the publisher name of the JSON-LD
 * blank, and the contact pages without any e-mail address at all. The build
 * was green and the site was published. Only reading the deployed HTML
 * showed it.
 */
function withFallback(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/** Public AdSense publisher id (`pub-XXXXXXXXXXXXXXXX`). Empty = ads disabled. */
export const ADSENSE_CLIENT: string = env.PUBLIC_ADSENSE_CLIENT ?? '';

/**
 * AdSense publisher id of the ACCOUNT (`pub-…`).
 *
 * This is the id that tells Google's servers which publisher owns the
 * domain, and it is the only value that belongs in ads.txt. It is the same
 * for every site in the account, and it is not a secret: it is published by
 * Google itself in the ads.txt of every site that sells through the account.
 *
 * The per-site editor id (`ca-pub-…`) is a different thing — it goes in
 * PUBLIC_ADSENSE_CLIENT and in the ad tag, never in ads.txt. Writing the
 * editor id there is what produced an "ads.txt error" in the AdSense
 * console: the file existed, but it authorised no seller.
 */
export const ADSENSE_PUBLISHER_ID = 'pub-7087940323534073';

/** The authorised seller line for ads.txt. */
export const ADSENSE_SELLER_LINE = `google.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0`;

/**
 * Ad slot ids.
 *
 * These come from the AdSense panel and from nowhere else: the panel is the
 * only thing that can mint a slot id, and a made-up one produces an
 * "invalid ad slot" error on every page and an empty space for the visitor.
 * So there is no fallback value here — an empty id means "this slot is not
 * configured", and the slot is not rendered at all.
 *
 * A build that has a publisher id but is missing slot ids is refused by
 * astro.config.ts, because publishing a site with no ad unit is what makes
 * the AdSense review fail with "no ad unit found on your site".
 */
export const AD_SLOTS = {
  belowTool: env.PUBLIC_ADSENSE_SLOT_BELOW_TOOL ?? '',
  inArticle: env.PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? '',
  footer: env.PUBLIC_ADSENSE_SLOT_FOOTER ?? '',
} as const;

/** True when every ad slot of the site has a real id. */
export const AD_SLOTS_CONFIGURED = Object.values(AD_SLOTS).every((id) => id.length > 0);

export const SITE = {
  name: 'DevSnap',
  domain: withFallback(env.PUBLIC_SITE_DOMAIN, 'https://devsnap.cc').replace(/\/$/, ''),
  tagline: 'The developer toolbox that never sees your code.',
  description:
    'Free developer tools that run in your browser. Format JSON, test regexes, decode JWTs, build crons and turn code into shareable images. No upload, no sign-up.',
  locale: 'en_US',
  lang: 'en',
  themeColor: '#4f46e5',
  contactEmail: withFallback(env.PUBLIC_CONTACT_EMAIL, 'hello@devsnap.cc'),
  /** Publisher name shown in the footer and on the trust pages. */
  publisher: withFallback(env.PUBLIC_PUBLISHER_NAME, 'DevSnap'),
  /** Named author of the guides and the written content. */
  author: withFallback(env.PUBLIC_AUTHOR_NAME, 'Enrique M.'),
  /** Year used in the legal pages. */
  foundedYear: 2026,
} as const;

/** True when the AdSense client id is configured. */
export const ADS_ENABLED = ADSENSE_CLIENT.length > 0;

export function absoluteUrl(path: string): string {
  return `${SITE.domain}${path.startsWith('/') ? path : `/${path}`}`;
}
