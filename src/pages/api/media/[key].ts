import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db';

export const prerender = false;

function parseRange(rangeHeader: string | null, size: number): { start: number; end: number } | null {
  if (!rangeHeader?.startsWith('bytes=')) return null;
  const [startStr, endStr] = rangeHeader.replace(/bytes=/, '').split('-');
  let start = startStr ? parseInt(startStr, 10) : 0;
  let end = endStr ? parseInt(endStr, 10) : size - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) return null;
  end = Math.min(end, size - 1);
  return { start, end };
}

export const GET: APIRoute = async ({ params, request }) => {
  const key = params.key;
  if (!key) return new Response('Not found', { status: 404 });

  try {
    const meta = await sql<{
      mime_type: string;
      storage: string;
      file_path: string | null;
      external_url: string | null;
      bytes: number;
    }[]>`
      SELECT mime_type, storage, file_path, external_url,
             CASE WHEN file_data IS NULL THEN 0 ELSE length(file_data) END::int AS bytes
      FROM media
      WHERE media_key = ${key} AND is_active = TRUE
      LIMIT 1
    `;

    const row = meta[0];
    if (!row) return new Response('Not found', { status: 404 });

    if (row.storage === 'url' && row.external_url) {
      return Response.redirect(row.external_url, 302);
    }

    const size = Number(row.bytes) || 0;
    const mime = row.mime_type || 'application/octet-stream';

    if (size > 0) {
      // Videos grandes: servir por Range (substring) para no cargar 386MB en memoria
      const MAX_CHUNK = 2 * 1024 * 1024; // 2 MB
      let range = parseRange(request.headers.get('range'), size);
      if (!range) {
        // Sin Range: primer tramo (los players piden Range después)
        range = { start: 0, end: Math.min(size - 1, MAX_CHUNK - 1) };
      } else if (range.end - range.start + 1 > MAX_CHUNK) {
        range = { start: range.start, end: range.start + MAX_CHUNK - 1 };
      }

      const length = range.end - range.start + 1;
      // substring en BYTEA es 1-indexado
      const chunks = await sql<{ chunk: Buffer }[]>`
        SELECT substring(file_data FROM ${range.start + 1} FOR ${length}) AS chunk
        FROM media
        WHERE media_key = ${key} AND is_active = TRUE
        LIMIT 1
      `;

      const chunk = chunks[0]?.chunk;
      if (!chunk) return new Response('No file data', { status: 404 });

      const body = chunk instanceof Buffer ? chunk : Buffer.from(chunk as ArrayBuffer);
      return new Response(body, {
        status: 206,
        headers: {
          'Content-Type': mime,
          'Content-Length': String(body.length),
          'Content-Range': `bytes ${range.start}-${range.start + body.length - 1}/${size}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'CDN-Cache-Control': 'public, max-age=31536000',
          'Vercel-CDN-Cache-Control': 'public, max-age=31536000'
        }
      });
    }

    if (row.storage === 'file' && row.file_path) {
      return Response.redirect(row.file_path, 302);
    }

    return new Response('No file data', { status: 404 });
  } catch (err) {
    console.error('[api/media]', err);
    return new Response('Server error', { status: 500 });
  }
};
