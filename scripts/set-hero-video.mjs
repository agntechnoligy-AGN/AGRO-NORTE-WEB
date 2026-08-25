import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1
});

await sql`
  UPDATE media SET
    file_path = '/videos/hero.mp4',
    storage = 'file',
    media_type = 'video',
    mime_type = 'video/mp4',
    filename = 'hero.mp4',
    title = 'Video hero',
    alt_text = 'Video institucional Agro Norte Corp',
    is_active = TRUE,
    updated_at = NOW()
  WHERE media_key = 'heroVideo'
`;

console.log('✓ heroVideo activado → /videos/hero.mp4');
await sql.end();
