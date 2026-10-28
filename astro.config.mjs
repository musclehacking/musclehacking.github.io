import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import { site } from './src/config/site.ts';

export default defineConfig({
  site: site.origin,
  output: 'static',
  session: false,
  trailingSlash: 'ignore',
  outDir: './dist',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [mdx(), react()],
  build: {
    assets: '_astro',
    // Repeated mobile controls paint the homepage image sooner with external styles.
    // Keep this explicit: assetsInlineLimit also controls Astro's automatic CSS inlining.
    inlineStylesheets: 'never',
  },
  image: {
    responsiveStyles: true,
  },
  vite: {
    build: {
      // Small assets/scripts may inline; CSS stays external through inlineStylesheets above.
      // Inline scripts still need the generated CSP hashes.
      assetsInlineLimit: 4096,
    },
  },
});
