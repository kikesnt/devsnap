import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config';
import { ogImages } from './src/integrations/og-images';

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
