/**
 * Restaura heroVideo en Railway Postgres (storage=db, ORIGINAL).
 * Quita la URL de Vercel Blob.
 * Uso: node scripts/restore-hero-railway.mjs
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

const sizeMb = (fs.statSync(filePath).size / 1024 / 1024).toFixed(1);
console.log(`Subiendo ORIGINAL a Railway Postgres (${sizeMb} MB)...`);
const buffer = fs.readFileSync(filePath);

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
await client.connect();

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
    storage = 'db',
    external_url = NULL,
    file_path = NULL,
    file_data = EXCLUDED.file_data,
    mime_type = 'video/mp4',
    media_type = 'video',
    is_active = TRUE,
    updated_at = NOW()
  `,
  [buffer]
);

const check = await client.query(
  `SELECT storage, external_url, length(file_data) AS bytes FROM media WHERE media_key = 'heroVideo'`
);
console.log('✓ Railway:', {
  storage: check.rows[0].storage,
  external_url: check.rows[0].external_url,
  mb: (Number(check.rows[0].bytes) / 1024 / 1024).toFixed(1)
});
await client.end();
