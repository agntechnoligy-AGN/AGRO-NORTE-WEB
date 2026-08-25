/**
 * Sube el video hero ORIGINAL a Postgres usando el protocolo binario de `pg`
 * (postgres.js no aguanta BYTEA de ~386 MB).
 *
 * Uso: node scripts/upload-hero-video.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const filePath = path.join(root, 'public', 'videos', 'hero.mp4');
if (!fs.existsSync(filePath)) {
  console.error('No existe public/videos/hero.mp4');
  process.exit(1);
}

const size = fs.statSync(filePath).size;
console.log(`Leyendo original ${(size / 1024 / 1024).toFixed(1)} MB...`);
const buffer = fs.readFileSync(filePath);

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // video grande
  statement_timeout: 0,
  query_timeout: 0
});

await client.connect();
console.log('Conectado. Subiendo a BD (sin comprimir)...');

await client.query(
  `
  INSERT INTO media (
    media_key, title, section, media_type, mime_type, filename,
    alt_text, storage, file_path, external_url, file_data, sort_order, is_active, updated_at
  ) VALUES (
    'heroVideo', 'Video hero original', 'inicio', 'video', 'video/mp4', 'hero.mp4',
    'Video institucional Agro Norte Corp', 'db', NULL, NULL, $1, 0, TRUE, NOW()
  )
  ON CONFLICT (media_key) DO UPDATE SET
    title = EXCLUDED.title,
    media_type = 'video',
    mime_type = 'video/mp4',
    filename = 'hero.mp4',
    storage = 'db',
    file_path = NULL,
    external_url = NULL,
    file_data = EXCLUDED.file_data,
    is_active = TRUE,
    updated_at = NOW()
  `,
  [buffer]
);

const check = await client.query(
  `SELECT storage, length(file_data) AS bytes FROM media WHERE media_key = 'heroVideo'`
);
const row = check.rows[0];
console.log(`✓ heroVideo en BD: ${row.storage}, ${(Number(row.bytes) / 1024 / 1024).toFixed(1)} MB`);
await client.end();
