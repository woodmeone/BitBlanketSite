import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../lib/auth';
import { getDB, query, execute, insertAndGetId } from '../../lib/db';

export const GET: APIRoute = async ({ request, locals }) => {
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
    const status = url.searchParams.get('status');
    
    let sql = 'SELECT * FROM todos';
    const params: unknown[] = [];
    
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY priority DESC, created_at DESC';
    
    const todos = await query(db, sql, params);
    
    return new Response(JSON.stringify({ success: true, todos }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('GET /api/todos error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error), todos: [] }), {
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
    const { title, description, category, status, priority, progress, due_date } = body;

    if (!title) {
      return new Response(JSON.stringify({ success: false, error: '缺少标题' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = await insertAndGetId(
      db,
      `INSERT INTO todos (title, description, category, status, priority, progress, due_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description || '', category || '', status || 'pending', priority || 0, progress || 0, due_date || null]
    );

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('POST /api/todos error:', error);
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
    const { id, title, description, category, status, priority, progress, due_date } = body;

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: '缺少ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await execute(
      db,
      `UPDATE todos SET 
        title = ?, description = ?, category = ?, status = ?, 
        priority = ?, progress = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description || '', category || '', status || 'pending', priority || 0, progress || 0, due_date || null, id]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('PUT /api/todos error:', error);
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

    await execute(db, 'DELETE FROM todos WHERE id = ?', [id]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('DELETE /api/todos error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
