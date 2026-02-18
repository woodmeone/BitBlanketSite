import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://bitblanket.top',
  
  output: 'server',
  
  server: {
    port: 4321,
    strictPort: true
  },
  
  adapter: cloudflare({
    platformProxy: {
      enabled: false
    },
    imageService: 'passthrough'
  }),
  
  integrations: [
    vue(),
    tailwind(),
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => {
        const excludePatterns = [
          '/admin',
          '/login',
          '/404',
          '/todos',
          '/api/',
        ];
        return !excludePatterns.some(pattern => page.includes(pattern));
      },
      customPages: [
        'https://bit-blanket.com/',
        'https://bit-blanket.com/software/',
        'https://bit-blanket.com/blog/',
        'https://bit-blanket.com/projects/',
        'https://bit-blanket.com/about/',
        'https://bit-blanket.com/archives/',
      ],
      serialize: (item) => {
        if (item.url === 'https://bit-blanket.com/') {
          return { ...item, priority: 1.0, changefreq: 'daily' };
        }
        if (item.url.includes('/software/') && !item.url.endsWith('/software/')) {
          return { ...item, priority: 0.9, changefreq: 'weekly' };
        }
        if (item.url.includes('/blog/') && !item.url.endsWith('/blog/')) {
          return { ...item, priority: 0.9, changefreq: 'monthly' };
        }
        if (item.url.includes('/projects')) {
          return { ...item, priority: 0.8, changefreq: 'weekly' };
        }
        if (item.url.endsWith('/software/') || item.url.endsWith('/blog/')) {
          return { ...item, priority: 0.7, changefreq: 'weekly' };
        }
        return { ...item, priority: 0.5, changefreq: 'monthly' };
      }
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
