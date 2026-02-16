import type { APIRoute } from 'astro';
import { generateToken, validatePassword } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '请输入密码' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!validatePassword(password)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '密码错误' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = await generateToken();

    return new Response(JSON.stringify({ 
      success: true, 
      token 
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: '服务器错误' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
