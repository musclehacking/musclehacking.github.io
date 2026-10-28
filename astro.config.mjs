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
    // Inline small styles; keep the larger shared/calculator sheets immutable and cacheable.
    // Inlining everything added 11 KB gzip to calculator HTML and slowed its mobile probe.
    inlineStylesheets: 'auto',
  },
  image: {
    responsiveStyles: true,
  },
  vite: {
    build: {
      // Explicit 4 KiB limit for small styles/assets/scripts. Inline scripts still need CSP hashes.
      assetsInlineLimit: 4096,
    },
  },
});
