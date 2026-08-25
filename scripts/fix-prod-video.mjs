import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const BLOB_URL =
  process.env.HERO_BLOB_URL ||
  'https://jlkzw3cjhprqel9b.private.blob.vercel-storage.com/hero/hero-original.mp4';

const TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN ||
  'vercel_blob_rw_JlkZw3CJHpRQel9B_ZmnjJUg39gZcJu4jIMRgeMhLy9GR8R';

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1
});

await sql`
  CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`
  INSERT INTO app_config (key, value, updated_at)
  VALUES ('BLOB_READ_WRITE_TOKEN', ${TOKEN}, NOW())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
`;

await sql`
  UPDATE media SET
    storage = 'url',
    external_url = ${BLOB_URL},
    is_active = TRUE,
    updated_at = NOW()
  WHERE media_key = 'heroVideo'
`;

const row = await sql`
  SELECT storage, external_url FROM media WHERE media_key = 'heroVideo'
`;
const cfg = await sql`
  SELECT key, left(value, 20) AS value_prefix FROM app_config WHERE key = 'BLOB_READ_WRITE_TOKEN'
`;

console.log('✓ heroVideo:', row[0]);
console.log('✓ token en Railway app_config:', cfg[0]);
await sql.end();
