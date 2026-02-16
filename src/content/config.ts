import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().default('general'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const projectsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().url(),
    category: z.enum(['ai-tool', 'saas', 'open-source', 'api']),
    pricing: z.enum(['free', 'freemium', 'paid', 'subscription']),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const softwareCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
    platform: z.array(z.enum(['windows', 'mac', 'linux', 'web'])),
    category: z.enum(['development', 'utility', 'design', 'media']),
    downloadUrl: z.string().url().optional(),
    websiteUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const videosCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    platform: z.enum(['bilibili', 'youtube']),
    videoId: z.string(),
    thumbnail: z.string().optional(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog: blogCollection,
  projects: projectsCollection,
  software: softwareCollection,
  videos: videosCollection,
};
