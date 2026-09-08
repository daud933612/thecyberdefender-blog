import { defineConfig, font } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://thecyberdefender.live',
  integrations: [mdx(), sitemap()],
  fonts: [
    font({
      name: 'Atkinson Hyperlegible',
      cssVariable: '--font-atkinson',
      provider: 'google',
    }),
  ],
});