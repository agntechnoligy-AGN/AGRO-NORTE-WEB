import type { APIRoute } from 'astro';
import { requireAdmin } from '../../../lib/auth';
import { sql, getAllMedia, mediaPublicUrl } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const admin = await requireAdmin(cookies);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const rows = await getAllMedia();
  const items = rows.map((r) => ({
    ...r,
    url: mediaPublicUrl(r),
    has_file_data: false
  }));

  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const admin = await requireAdmin(cookies);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const form = await request.formData();
    const mediaKey = String(form.get('media_key') || '').trim();
    const title = String(form.get('title') || '').trim();
    const section = String(form.get('section') || 'general').trim();
    const altText = String(form.get('alt_text') || '').trim();
    const mediaType = String(form.get('media_type') || 'image') === 'video' ? 'video' : 'image';
    const file = form.get('file');

    if (!mediaKey) {
      return new Response(JSON.stringify({ error: 'media_key requerido' }), { status: 400 });
    }

    if (!(file instanceof File) || file.size === 0) {
      return new Response(JSON.stringify({ error: 'Archivo requerido' }), { status: 400 });
    }

    // Límite práctico: 25 MB (videos grandes mejor por deploy)
    if (file.size > 25 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Máximo 25 MB. Para videos grandes usa deploy.' }), {
        status: 400
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg');
    const filename = file.name || `${mediaKey}`;

    await sql`
      INSERT INTO media (
        media_key, title, section, media_type, mime_type, filename,
        alt_text, storage, file_path, external_url, file_data, is_active, updated_at
      ) VALUES (
        ${mediaKey},
        ${title || mediaKey},
        ${section},
        ${mediaType},
        ${mime},
        ${filename},
        ${altText || title || mediaKey},
        'db',
        NULL,
        NULL,
        ${buffer},
        TRUE,
        NOW()
      )
      ON CONFLICT (media_key) DO UPDATE SET
        title = EXCLUDED.title,
        section = EXCLUDED.section,
        media_type = EXCLUDED.media_type,
        mime_type = EXCLUDED.mime_type,
        filename = EXCLUDED.filename,
        alt_text = EXCLUDED.alt_text,
        storage = 'db',
        file_path = NULL,
        external_url = NULL,
        file_data = EXCLUDED.file_data,
        is_active = TRUE,
        updated_at = NOW()
    `;

    return new Response(JSON.stringify({
      ok: true,
      url: `/api/media/${mediaKey}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[admin/media POST]', err);
    return new Response(JSON.stringify({ error: 'Error al guardar' }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const admin = await requireAdmin(cookies);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const mediaKey = String(body.media_key || '');
    if (!mediaKey) {
      return new Response(JSON.stringify({ error: 'media_key requerido' }), { status: 400 });
    }

    const title = body.title != null ? String(body.title) : null;
    const section = body.section != null ? String(body.section) : null;
    const altText = body.alt_text != null ? String(body.alt_text) : null;
    const isActive = typeof body.is_active === 'boolean' ? body.is_active : null;
    const filePath = body.file_path != null ? String(body.file_path) : null;
    const externalUrl = body.external_url != null ? String(body.external_url).trim() : null;

    if (externalUrl) {
      await sql`
        UPDATE media SET
          title = COALESCE(${title}, title),
          section = COALESCE(${section}, section),
          alt_text = COALESCE(${altText}, alt_text),
          is_active = COALESCE(${isActive}, is_active),
          storage = 'url',
          external_url = ${externalUrl},
          file_path = NULL,
          file_data = NULL,
          media_type = COALESCE(media_type, 'video'),
          mime_type = COALESCE(mime_type, 'video/mp4'),
          updated_at = NOW()
        WHERE media_key = ${mediaKey}
      `;
    } else {
      await sql`
        UPDATE media SET
          title = COALESCE(${title}, title),
          section = COALESCE(${section}, section),
          alt_text = COALESCE(${altText}, alt_text),
          is_active = COALESCE(${isActive}, is_active),
          file_path = COALESCE(${filePath}, file_path),
          storage = CASE WHEN ${filePath} IS NOT NULL THEN 'file' ELSE storage END,
          updated_at = NOW()
        WHERE media_key = ${mediaKey}
      `;
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[admin/media PATCH]', err);
    return new Response(JSON.stringify({ error: 'Error al actualizar' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const admin = await requireAdmin(cookies);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const mediaKey = String(body.media_key || '');
    if (!mediaKey) {
      return new Response(JSON.stringify({ error: 'media_key requerido' }), { status: 400 });
    }

    await sql`DELETE FROM media WHERE media_key = ${mediaKey}`;
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[admin/media DELETE]', err);
    return new Response(JSON.stringify({ error: 'Error al eliminar' }), { status: 500 });
  }
};
