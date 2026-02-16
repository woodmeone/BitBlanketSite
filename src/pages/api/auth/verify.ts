import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
  const authenticated = await isAuthenticated(request);
  
  return new Response(JSON.stringify({ 
    authenticated 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
