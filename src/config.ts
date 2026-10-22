/**
 * Central site configuration.
 *
 * Every value that a publisher may need to change after launch lives here so
 * that the rest of the codebase never hard-codes a domain, an e-mail address or
 * an ad identifier.
 */

const env = import.meta.env;

/** Public AdSense publisher id (`pub-XXXXXXXXXXXXXXXX`). Empty = ads disabled. */
export const ADSENSE_CLIENT: string = env.PUBLIC_ADSENSE_CLIENT ?? '';

/**
 * Ad slot ids. AdSense auto-created slots are recommended because they adapt to
 * the viewport; the fallback ids keep the markup valid while the account is
 * still under review.
 */
export const AD_SLOTS = {
  belowTool: env.PUBLIC_ADSENSE_SLOT_BELOW_TOOL ?? '1234567890',
  inArticle: env.PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? '1234567891',
  footer: env.PUBLIC_ADSENSE_SLOT_FOOTER ?? '1234567892',
} as const;

export const SITE = {
  name: 'DevSnap',
  domain: (env.PUBLIC_SITE_DOMAIN ?? 'https://devsnap.cc').replace(/\/$/, ''),
  tagline: 'The developer toolbox that never sees your code.',
  description:
    'Free developer tools that run in your browser. Format JSON, test regexes, decode JWTs, build crons and turn code into shareable images. No upload, no sign-up.',
  locale: 'en_US',
  lang: 'en',
  themeColor: '#4f46e5',
  contactEmail: env.PUBLIC_CONTACT_EMAIL ?? 'hello@devsnap.cc',
  /** Publisher name shown in the footer and on the trust pages. */
  publisher: env.PUBLIC_PUBLISHER_NAME ?? 'DevSnap',
  /** Named author of the guides and the written content. */
  author: env.PUBLIC_AUTHOR_NAME ?? 'Enrique M.',
  /** Year used in the legal pages. */
  foundedYear: 2026,
} as const;

/** True when the AdSense client id is configured. */
export const ADS_ENABLED = ADSENSE_CLIENT.length > 0;

export function absoluteUrl(path: string): string {
  return `${SITE.domain}${path.startsWith('/') ? path : `/${path}`}`;
}
