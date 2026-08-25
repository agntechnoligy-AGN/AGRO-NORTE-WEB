/**
 * Sube hero.mp4 ORIGINAL a Vercel Blob y guarda la URL pública en Railway BD.
 * Uso: node scripts/upload-hero-to-blob.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { put } from '@vercel/blob';
import postgres from 'postgres';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('Falta BLOB_READ_WRITE_TOKEN en .env');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en .env');
  process.exit(1);
}

const filePath = path.join(root, 'public', 'videos', 'hero.mp4');
if (!fs.existsSync(filePath)) {
  console.error('No existe public/videos/hero.mp4');
  process.exit(1);
}

const sizeMb = (fs.statSync(filePath).size / 1024 / 1024).toFixed(1);
console.log(`Subiendo ORIGINAL a Vercel Blob (${sizeMb} MB)...`);

const blob = await put('hero/hero-original.mp4', fs.createReadStream(filePath), {
  access: 'private',
  contentType: 'video/mp4',
  token,
  multipart: true,
  addRandomSuffix: false,
  allowOverwrite: true
});

console.log(`✓ Blob CDN: ${blob.url}`);

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1
});

await sql`
  INSERT INTO media (
    media_key, title, section, media_type, mime_type, filename,
    alt_text, storage, file_path, external_url, file_data, sort_order, is_active, updated_at
  ) VALUES (
    'heroVideo',
    'Video hero original',
    'inicio',
    'video',
    'video/mp4',
    'hero.mp4',
    'Video institucional Agro Norte Corp',
    'url',
    NULL,
    ${blob.url},
    NULL,
    0,
    TRUE,
    NOW()
  )
  ON CONFLICT (media_key) DO UPDATE SET
    storage = 'url',
    external_url = ${blob.url},
    file_data = NULL,
    file_path = NULL,
    mime_type = 'video/mp4',
    media_type = 'video',
    is_active = TRUE,
    updated_at = NOW()
`;

const check = await sql`
  SELECT storage, external_url FROM media WHERE media_key = 'heroVideo'
`;
console.log('✓ BD Railway actualizada:', check[0]);
await sql.end();
console.log('Listo. La web tomará la URL desde la BD (video rápido vía CDN).');
