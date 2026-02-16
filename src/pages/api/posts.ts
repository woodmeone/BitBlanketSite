import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../lib/auth';
import { getDB, query, execute, insertAndGetId } from '../../lib/db';

export const GET: APIRoute = async ({ request, locals }) => {
  const authenticated = await isAuthenticated(request);
  const db = getDB({ locals });

  try {
    const publishedOnly = !authenticated;
    
    let sql = 'SELECT * FROM posts';
    const params: unknown[] = [];
    
    if (publishedOnly) {
      sql += ' WHERE published = 1';
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const posts = await query(db, sql, params);
    
    return new Response(JSON.stringify({ 
      success: true, 
      posts 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error),
      posts: []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const authenticated = await isAuthenticated(request);
  
  if (!authenticated) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: '未授权' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = getDB({ locals });

  try {
    const body = await request.json();
    const { slug, title, description, content, tags, cover_image, published } = body;

    if (!slug || !title || !content) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '缺少必填字段' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = await insertAndGetId(
      db,
      `INSERT INTO posts (slug, title, description, content, tags, cover_image, published) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [slug, title, description || '', content, tags || '', cover_image || '', published ? 1 : 0]
    );

    return new Response(JSON.stringify({ 
      success: true, 
      id,
      slug 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const authenticated = await isAuthenticated(request);
  
  if (!authenticated) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: '未授权' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = getDB({ locals });

  try {
    const body = await request.json();
    const { id, slug, title, description, content, tags, cover_image, published } = body;

    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '缺少文章ID' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await execute(
      db,
      `UPDATE posts SET 
        slug = ?, title = ?, description = ?, content = ?, 
        tags = ?, cover_image = ?, published = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [slug, title, description || '', content, tags || '', cover_image || '', published ? 1 : 0, id]
    );

    return new Response(JSON.stringify({ 
      success: true 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('PUT /api/posts error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const authenticated = await isAuthenticated(request);
  
  if (!authenticated) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: '未授权' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = getDB({ locals });

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '缺少文章ID' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await execute(db, 'DELETE FROM posts WHERE id = ?', [id]);

    return new Response(JSON.stringify({ 
      success: true 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('DELETE /api/posts error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
