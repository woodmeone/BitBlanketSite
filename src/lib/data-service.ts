import { getDB, query, queryOne } from './db';
import type { AstroGlobal } from 'astro';

export interface Post {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string;
  cover_image: string;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface Software {
  id: number;
  slug: string;
  name: string;
  description: string;
  content: string;
  category: string;
  platform: string;
  website: string;
  download_url: string;
  hidden_content: string;
  icon: string;
  screenshots: string;
  rating: number;
  downloads: number;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  slug: string;
  name: string;
  description: string;
  content: string;
  usage_scenario: string;
  category: string;
  tags: string;
  website: string;
  github: string;
  icon: string;
  status: string;
  stars: number;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface Suggestion {
  id: number;
  type: string;
  nickname: string;
  content: string;
  reply: string;
  status: string;
  votes: number;
  created_at: string;
  updated_at: string;
}

type AstroContext = AstroGlobal | { locals?: Record<string, unknown> } | null | undefined;

export async function getPublishedPosts(Astro: AstroContext): Promise<Post[]> {
  const db = getDB(Astro);
  return await query<Post>(db, 'SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC');
}

export async function getPostBySlug(Astro: AstroContext, slug: string): Promise<Post | null> {
  const db = getDB(Astro);
  return await queryOne<Post>(db, 'SELECT * FROM posts WHERE slug = ? AND published = 1', [slug]);
}

export async function getAllPostSlugs(Astro: AstroContext): Promise<string[]> {
  const db = getDB(Astro);
  const posts = await query<{ slug: string }>(db, 'SELECT slug FROM posts WHERE published = 1');
  return posts.map(p => p.slug);
}

export async function getPublishedSoftware(Astro: AstroContext): Promise<Software[]> {
  const db = getDB(Astro);
  return await query<Software>(db, 'SELECT * FROM software WHERE published = 1 ORDER BY created_at DESC');
}

export async function getSoftwareBySlug(Astro: AstroContext, slug: string): Promise<Software | null> {
  const db = getDB(Astro);
  return await queryOne<Software>(db, 'SELECT * FROM software WHERE slug = ? AND published = 1', [slug]);
}

export async function getPublishedProjects(Astro: AstroContext): Promise<Project[]> {
  const db = getDB(Astro);
  return await query<Project>(db, 'SELECT * FROM projects WHERE published = 1 ORDER BY created_at DESC');
}

export async function getProjectBySlug(Astro: AstroContext, slug: string): Promise<Project | null> {
  const db = getDB(Astro);
  return await queryOne<Project>(db, 'SELECT * FROM projects WHERE slug = ? AND published = 1', [slug]);
}

export async function getAllTodos(Astro: AstroContext): Promise<Todo[]> {
  const db = getDB(Astro);
  return await query<Todo>(db, 'SELECT * FROM todos ORDER BY created_at DESC');
}

export async function getPublicSuggestions(Astro: AstroContext): Promise<Suggestion[]> {
  const db = getDB(Astro);
  return await query<Suggestion>(db, 'SELECT * FROM suggestions WHERE status != ? ORDER BY votes DESC, created_at DESC', ['rejected']);
}

export async function getStats(Astro: AstroContext): Promise<{
  postsCount: number;
  softwareCount: number;
  projectsCount: number;
  todosCount: number;
}> {
  const db = getDB(Astro);
  const posts = await query<{ count: number }>(db, 'SELECT COUNT(*) as count FROM posts WHERE published = 1');
  const software = await query<{ count: number }>(db, 'SELECT COUNT(*) as count FROM software WHERE published = 1');
  const projects = await query<{ count: number }>(db, 'SELECT COUNT(*) as count FROM projects WHERE published = 1');
  const todos = await query<{ count: number }>(db, 'SELECT COUNT(*) as count FROM todos');
  
  return {
    postsCount: posts[0]?.count || 0,
    softwareCount: software[0]?.count || 0,
    projectsCount: projects[0]?.count || 0,
    todosCount: todos[0]?.count || 0
  };
}
