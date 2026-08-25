import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const key = params.key;
  if (!key) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const rows = await sql<{
      mime_type: string;
      storage: string;
      file_path: string | null;
      external_url: string | null;
      file_data: Buffer | null;
    }[]>`
      SELECT mime_type, storage, file_path, external_url, file_data
      FROM media
      WHERE media_key = ${key} AND is_active = TRUE
      LIMIT 1
    `;

    const row = rows[0];
    if (!row) return new Response('Not found', { status: 404 });

    if (row.storage === 'url' && row.external_url) {
      return Response.redirect(row.external_url, 302);
    }

    if (row.storage === 'file' && row.file_path) {
      return Response.redirect(row.file_path, 302);
    }

    if (row.file_data) {
      const body = row.file_data instanceof Buffer
        ? row.file_data
        : Buffer.from(row.file_data as ArrayBuffer);
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': row.mime_type || 'application/octet-stream',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    return new Response('No file data', { status: 404 });
  } catch (err) {
    console.error('[api/media]', err);
    return new Response('Server error', { status: 500 });
  }
};
