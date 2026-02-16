import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../lib/auth';
import { getDB, query, execute, insertAndGetId } from '../../lib/db';

export const GET: APIRoute = async ({ request, locals }) => {
  const authenticated = await isAuthenticated(request);
  const db = getDB({ locals });

  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const publishedOnly = !authenticated;
    
    let sql = 'SELECT * FROM software';
    const params: unknown[] = [];
    const conditions: string[] = [];
    
    if (publishedOnly) {
      conditions.push('published = 1');
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const software = await query(db, sql, params);
    
    return new Response(JSON.stringify({ 
      success: true, 
      software 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('GET /api/software error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error),
      software: []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const authenticated = await isAuthenticated(request);
  
  if (!authenticated) {
    return new Response(JSON.stringify({ success: false, error: '未授权' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = getDB({ locals });

  try {
    const body = await request.json();
    const { slug, name, description, content, category, platform, website, download_url, hidden_content, icon, screenshots, published } = body;

    if (!slug || !name) {
      return new Response(JSON.stringify({ success: false, error: '缺少必填字段' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = await insertAndGetId(
      db,
      `INSERT INTO software (slug, name, description, content, category, platform, website, download_url, hidden_content, icon, screenshots, published) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [slug, name, description || '', content || '', category || '', platform || '', website || '', download_url || '', hidden_content || '', icon || '', screenshots || '', published ? 1 : 0]
    );

    return new Response(JSON.stringify({ success: true, id, slug }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('POST /api/software error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const authenticated = await isAuthenticated(request);
  
  if (!authenticated) {
    return new Response(JSON.stringify({ success: false, error: '未授权' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = getDB({ locals });

  try {
    const body = await request.json();
    const { id, slug, name, description, content, category, platform, website, download_url, hidden_content, icon, screenshots, published } = body;

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: '缺少ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await execute(
      db,
      `UPDATE software SET 
        slug = ?, name = ?, description = ?, content = ?, category = ?, 
        platform = ?, website = ?, download_url = ?, hidden_content = ?, icon = ?, screenshots = ?, 
        published = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [slug, name, description || '', content || '', category || '', platform || '', website || '', download_url || '', hidden_content || '', icon || '', screenshots || '', published ? 1 : 0, id]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('PUT /api/software error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const authenticated = await isAuthenticated(request);
  
  if (!authenticated) {
    return new Response(JSON.stringify({ success: false, error: '未授权' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = getDB({ locals });

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: '缺少ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await execute(db, 'DELETE FROM software WHERE id = ?', [id]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('DELETE /api/software error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
