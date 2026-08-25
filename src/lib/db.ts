import postgres from 'postgres';

const connectionString = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[db] DATABASE_URL no está definida. Revisa tu archivo .env');
}

export const sql = postgres(connectionString || 'postgresql://invalid', {
  ssl: connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false },
  max: 5,
  idle_timeout: 20,
  connect_timeout: 30
});

export type MediaRow = {
  id: number;
  media_key: string;
  title: string;
  section: string;
  media_type: 'image' | 'video';
  mime_type: string;
  filename: string | null;
  alt_text: string;
  storage: 'file' | 'db' | 'url';
  file_path: string | null;
  external_url: string | null;
  sort_order: number;
  is_active: boolean;
  updated_at: Date;
  created_at: Date;
};

/** URL pública para usar en <img> / <video> — prioriza bytes en BD */
export function mediaPublicUrl(row: Pick<MediaRow, 'id' | 'storage' | 'file_path' | 'external_url' | 'media_key'>): string {
  if (row.storage === 'url' && row.external_url) {
    // Blob privado no se puede poner directo en <video src>; se sirve por API
    if (row.external_url.includes('private.blob.vercel-storage.com')) {
      return `/api/media/${row.media_key}`;
    }
    return row.external_url;
  }
  if (row.storage === 'db') return `/api/media/${row.media_key}`;
  if (row.storage === 'file' && row.file_path) return row.file_path;
  return `/api/media/${row.media_key}`;
}

export async function getMediaByKey(key: string): Promise<MediaRow | null> {
  const rows = await sql<MediaRow[]>`
    SELECT id, media_key, title, section, media_type, mime_type, filename, alt_text,
           storage, file_path, external_url, sort_order, is_active, updated_at, created_at
    FROM media
    WHERE media_key = ${key} AND is_active = TRUE
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getAllMedia(): Promise<MediaRow[]> {
  return sql<MediaRow[]>`
    SELECT id, media_key, title, section, media_type, mime_type, filename, alt_text,
           storage, file_path, external_url, sort_order, is_active, updated_at, created_at
    FROM media
    ORDER BY section ASC, sort_order ASC, media_key ASC
  `;
}

export async function getMediaMap(keys: string[]): Promise<Record<string, string>> {
  if (!keys.length) return {};
  try {
    const rows = await sql<MediaRow[]>`
      SELECT id, media_key, storage, file_path, external_url
      FROM media
      WHERE media_key = ANY(${keys}) AND is_active = TRUE
    `;
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.media_key] = mediaPublicUrl(row);
    }
    return map;
  } catch (err) {
    console.error('[db] getMediaMap failed:', err);
    return {};
  }
}
