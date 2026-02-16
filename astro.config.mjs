import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bit-blanket.com',
  
  output: 'static',
  
  integrations: [
    vue(),
    tailwind(),
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date()
    })
  ],
  
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true
    }
  },
  
  vite: {
    ssr: {
      noExternal: ['gsap']
    }
  }
});
