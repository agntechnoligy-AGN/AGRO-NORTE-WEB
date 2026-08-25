import type { APIRoute } from 'astro';
import {
  findAdminByEmail,
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  readSession
} from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email y contraseña requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const admin = await findAdminByEmail(email);
    if (!admin || !(await verifyPassword(password, admin.password_hash))) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = await createSessionToken({
      id: admin.id,
      email: admin.email,
      name: admin.name
    });
    setSessionCookie(cookies, token);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[admin/login]', err);
    return new Response(JSON.stringify({ error: 'Error del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  clearSessionCookie(cookies);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const GET: APIRoute = async ({ cookies }) => {
  const session = await readSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return new Response(JSON.stringify({ authenticated: true, admin: session }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
