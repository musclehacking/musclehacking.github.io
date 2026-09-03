import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.musclehacking.com',
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
    inlineStylesheets: 'never',
  },
  image: {
    responsiveStyles: true,
  },
});
