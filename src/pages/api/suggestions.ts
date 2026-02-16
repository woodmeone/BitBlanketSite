import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../lib/auth';
import { getDB, query, execute, insertAndGetId } from '../../lib/db';

export const GET: APIRoute = async ({ request, locals }) => {
  const authenticated = await isAuthenticated(request);
  const db = getDB({ locals });

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    
    let sql = 'SELECT * FROM suggestions';
    const params: unknown[] = [];
    const conditions: string[] = [];
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const suggestions = await query(db, sql, params);
    
    return new Response(JSON.stringify({ 
      success: true, 
      suggestions 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('GET /api/suggestions error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error),
      suggestions: []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getDB({ locals });

  try {
    const body = await request.json();
    const { type, nickname, content } = body;

    if (!content) {
      return new Response(JSON.stringify({ success: false, error: '内容不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = await insertAndGetId(
      db,
      `INSERT INTO suggestions (type, nickname, content, status, votes) 
       VALUES (?, ?, ?, 'pending', 0)`,
      [type || 'other', nickname || '匿名', content]
    );

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('POST /api/suggestions error:', error);
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
    const { id, status, reply } = body;

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: '缺少ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (status) {
      await execute(
        db,
        `UPDATE suggestions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, id]
      );
    }

    if (reply !== undefined) {
      await execute(
        db,
        `UPDATE suggestions SET reply = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [reply, id]
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('PUT /api/suggestions error:', error);
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

    await execute(db, 'DELETE FROM votes WHERE suggestion_id = ?', [id]);
    await execute(db, 'DELETE FROM suggestions WHERE id = ?', [id]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('DELETE /api/suggestions error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
