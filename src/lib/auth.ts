import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import type { AstroCookies } from 'astro';
import { sql } from './db';

const COOKIE_NAME = 'agro_admin_session';

function getSecret() {
  const secret = import.meta.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET no definido');
  return new TextEncoder().encode(secret);
}

export type AdminSession = {
  id: number;
  email: string;
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(admin: AdminSession) {
  return new SignJWT({ email: admin.email, name: admin.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(admin.id))
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function readSession(cookies: AstroCookies): Promise<AdminSession | null> {
  const token = cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const id = Number(payload.sub);
    if (!id || !payload.email) return null;
    return {
      id,
      email: String(payload.email),
      name: String(payload.name || 'Admin')
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(cookies: AstroCookies, token: string) {
  cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSessionCookie(cookies: AstroCookies) {
  cookies.delete(COOKIE_NAME, { path: '/' });
}

export async function findAdminByEmail(email: string) {
  const rows = await sql<{ id: number; email: string; name: string; password_hash: string }[]>`
    SELECT id, email, name, password_hash FROM admins WHERE email = ${email.toLowerCase()} LIMIT 1
  `;
  return rows[0] || null;
}

export async function requireAdmin(cookies: AstroCookies): Promise<AdminSession | null> {
  return readSession(cookies);
}
