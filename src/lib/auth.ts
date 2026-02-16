import { SignJWT, jwtVerify } from 'jose';

function getRequiredEnv(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`环境变量 ${name} 未设置，请检查 .env 文件或 Cloudflare 环境配置`);
  }
  return value;
}

const JWT_SECRET = getRequiredEnv('JWT_SECRET');
const ADMIN_PASSWORD = getRequiredEnv('ADMIN_PASSWORD');

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function generateToken(): Promise<string> {
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secretKey);
    return true;
  } catch {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  const cookie = request.headers.get('Cookie');
  if (cookie) {
    const match = cookie.match(/auth_token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

export async function isAuthenticated(request: Request): Promise<boolean> {
  const token = extractToken(request);
  if (!token) return false;
  return verifyToken(token);
}
