import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import { SITE } from './src/config';
import { ogImages } from './src/integrations/og-images';

/**
 * The ad slot ids the site needs, one per position.
 *
 * They are not invented here: the AdSense panel is the only thing that can
 * mint one, and a made-up id produces an "invalid ad slot" error on every
 * page and an empty space for the visitor.
 */
const AD_SLOT_VARS = [
  'PUBLIC_ADSENSE_SLOT_BELOW_TOOL',
  'PUBLIC_ADSENSE_SLOT_IN_ARTICLE',
  'PUBLIC_ADSENSE_SLOT_FOOTER',
] as const;

/**
 * Refuses a build that has a publisher id but no ad slots.
 *
 * A site that serves ads without a single ad unit is the one thing the
 * AdSense review rejects with "no ad unit found on your site", and it is
 * easy to reach by accident: the publisher id is a single variable and the
 * slots are three more. Failing the build here keeps the error where it can
 * still be fixed, instead of publishing a site that cannot be approved.
 *
 * The gate is in the config rather than in CI on purpose: Cloudflare Pages
 * builds the site too, and a check that only runs in CI would let the broken
 * build through.
 */
function assertAdConfiguration(env: Record<string, string | undefined>): void {
  const client = env.PUBLIC_ADSENSE_CLIENT;
  if (!client) return;

  const missing = AD_SLOT_VARS.filter((name) => !env[name]);
  if (missing.length === 0) return;

  throw new Error(
    [
      `AdSense is configured (${client}) but these ad slot ids are missing: ${missing.join(', ')}`,
      'Create the ad slots in the AdSense panel for this site and set them in the environment:',
      ...missing.map((name) => `  ${name}=<ad slot id>`),
      'Until then the site is published without advertising.',
    ].join('\n')
  );
}

/**
 * The environment of the build.
 *
 * The real environment comes first: Cloudflare Pages and GitHub Actions set
 * the variables as real environment variables. The .env files are read too,
 * so that a local build refuses exactly what a deployed build refuses.
 */
function buildEnv(): Record<string, string | undefined> {
  return {
    ...loadEnv('production', process.cwd(), ''),
    ...loadEnv('development', process.cwd(), ''),
    ...process.env,
  } as Record<string, string | undefined>;
}

assertAdConfiguration(buildEnv());

export default defineConfig({
  site: SITE.domain,
  output: 'static',
  // HTML-aware whitespace compression. The v7 default ('jsx') strips spaces
  // between inline elements, which would run words together in the prose.
  compressHTML: true,
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.7,
    }),
    ogImages(),
  ],
});
