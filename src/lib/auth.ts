import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = import.meta.env.JWT_SECRET || 'bit-blanket-jwt-secret-key-2026';
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || '135792468Lzy';

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
