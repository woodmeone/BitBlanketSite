import type { APIRoute } from 'astro';
import { getDB, query, execute } from '../../lib/db';

function getVoterId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };
  return simpleHash(`${ip}-${userAgent}`);
}

export const GET: APIRoute = async ({ request, locals }) => {
  const db = getDB({ locals });
  
  try {
    const url = new URL(request.url);
    const suggestionId = url.searchParams.get('suggestion_id');
    const voterId = url.searchParams.get('voter_id') || getVoterId(request);
    
    if (!suggestionId) {
      return new Response(JSON.stringify({ success: false, error: '缺少建议ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const votes = await query(
      db,
      'SELECT * FROM votes WHERE suggestion_id = ? AND voter_id = ?',
      [suggestionId, voterId]
    );
    
    return new Response(JSON.stringify({ 
      success: true, 
      hasVoted: votes.length > 0 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('GET /api/votes error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error) 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getDB({ locals });
  
  try {
    const body = await request.json();
    const { suggestion_id, voter_id: providedVoterId } = body;
    
    if (!suggestion_id) {
      return new Response(JSON.stringify({ success: false, error: '缺少建议ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const voterId = providedVoterId || getVoterId(request);
    
    const existingVotes = await query(
      db,
      'SELECT * FROM votes WHERE suggestion_id = ? AND voter_id = ?',
      [suggestion_id, voterId]
    );
    
    if (existingVotes.length > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '您已经投过票了' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await execute(
      db,
      'INSERT INTO votes (suggestion_id, voter_id) VALUES (?, ?)',
      [suggestion_id, voterId]
    );
    
    await execute(
      db,
      'UPDATE suggestions SET votes = votes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [suggestion_id]
    );
    
    const updatedSuggestion = await query(
      db,
      'SELECT votes FROM suggestions WHERE id = ?',
      [suggestion_id]
    );
    
    const newVotes = updatedSuggestion[0]?.votes || 0;
    
    return new Response(JSON.stringify({ 
      success: true, 
      votes: newVotes,
      voterId 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('POST /api/votes error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error) 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
