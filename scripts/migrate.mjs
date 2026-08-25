import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(root, '.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Falta DATABASE_URL en .env');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1
});

const DEFAULT_MEDIA = [
  { key: 'hero', title: 'Hero inicio', section: 'inicio', path: '/images/hero.jpg', type: 'image' },
  { key: 'headerNosotros', title: 'Header Nosotros', section: 'nosotros', path: '/images/fields.jpg', type: 'image' },
  { key: 'headerProductos', title: 'Header Productos', section: 'productos', path: '/images/avocado.jpg', type: 'image' },
  { key: 'headerProceso', title: 'Header Proceso', section: 'proceso', path: '/images/farm.jpg', type: 'image' },
  { key: 'headerSostenibilidad', title: 'Header Sostenibilidad', section: 'sostenibilidad', path: '/images/irrigation.jpg', type: 'image' },
  { key: 'headerFundo', title: 'Header Fundo', section: 'fundo', path: '/images/fields.jpg', type: 'image' },
  { key: 'headerNoticias', title: 'Header Noticias', section: 'noticias', path: '/images/workers.jpg', type: 'image' },
  { key: 'headerContacto', title: 'Header Contacto', section: 'contacto', path: '/images/greenhouse.jpg', type: 'image' },
  { key: 'orchard', title: 'Huerto', section: 'nosotros', path: '/images/orchard.jpg', type: 'image' },
  { key: 'avocadoOrchard', title: 'Palta huerto', section: 'productos', path: '/images/avocado.jpg', type: 'image' },
  { key: 'vineyard', title: 'Viñedo', section: 'fundo', path: '/images/vineyard.jpg', type: 'image' },
  { key: 'farmAerial', title: 'Vista aérea', section: 'sostenibilidad', path: '/images/hero.jpg', type: 'image' },
  { key: 'greenFields', title: 'Campos verdes', section: 'fundo', path: '/images/fields.jpg', type: 'image' },
  { key: 'irrigation', title: 'Riego', section: 'fundo', path: '/images/irrigation.jpg', type: 'image' },
  { key: 'tractor', title: 'Maquinaria', section: 'fundo', path: '/images/tractor.jpg', type: 'image' },
  { key: 'workers', title: 'Trabajadores', section: 'gente', path: '/images/workers.jpg', type: 'image' },
  { key: 'team', title: 'Equipo', section: 'gente', path: '/images/team.jpg', type: 'image' },
  { key: 'palta', title: 'Palta Hass', section: 'productos', path: '/images/avocado.jpg', type: 'image' },
  { key: 'uva', title: 'Uva', section: 'productos', path: '/images/grapes.jpg', type: 'image' },
  { key: 'crimson', title: 'Crimson', section: 'productos', path: '/images/red-grapes.jpg', type: 'image' },
  { key: 'redGlobe', title: 'Red Globe', section: 'productos', path: '/images/red-grapes.jpg', type: 'image' },
  { key: 'superior', title: 'Superior', section: 'productos', path: '/images/grapes.jpg', type: 'image' },
  { key: 'newsPalta', title: 'Noticia palta', section: 'noticias', path: '/images/orchard.jpg', type: 'image' },
  { key: 'newsUva', title: 'Noticia uva', section: 'noticias', path: '/images/red-grapes.jpg', type: 'image' },
  { key: 'newsTech', title: 'Noticia tech', section: 'noticias', path: '/images/tech.jpg', type: 'image' },
  { key: 'newsTraining', title: 'Noticia capacitación', section: 'noticias', path: '/images/team.jpg', type: 'image' },
  { key: 'newsWater', title: 'Noticia riego', section: 'noticias', path: '/images/irrigation.jpg', type: 'image' },
  { key: 'newsExport', title: 'Noticia exportación', section: 'noticias', path: '/images/export.jpg', type: 'image' },
  { key: 'gallery1', title: 'Galería 1', section: 'gente', path: '/images/workers.jpg', type: 'image' },
  { key: 'gallery2', title: 'Galería 2', section: 'gente', path: '/images/grapes.jpg', type: 'image' },
  { key: 'gallery3', title: 'Galería 3', section: 'gente', path: '/images/orchard.jpg', type: 'image' },
  { key: 'gallery4', title: 'Galería 4', section: 'gente', path: '/images/tech.jpg', type: 'image' },
  { key: 'gallery5', title: 'Galería 5', section: 'gente', path: '/images/avocado.jpg', type: 'image' },
  { key: 'gallery6', title: 'Galería 6', section: 'gente', path: '/images/team.jpg', type: 'image' },
  { key: 'heroVideo', title: 'Video hero', section: 'inicio', path: '/videos/hero.mp4', type: 'video' }
];

async function main() {
  console.log('→ Aplicando schema...');
  const schema = fs.readFileSync(path.join(root, 'db', 'schema.sql'), 'utf8');
  await sql.unsafe(schema);

  const email = (process.env.ADMIN_EMAIL || 'admin@agronortecorp.pe').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'AgroNorte2026!';
  const hash = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO admins (email, password_hash, name)
    VALUES (${email}, ${hash}, 'Administrador')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `;
  console.log(`→ Admin listo: ${email}`);

  let i = 0;
  for (const item of DEFAULT_MEDIA) {
    const mime = item.type === 'video' ? 'video/mp4' : 'image/jpeg';
    await sql`
      INSERT INTO media (
        media_key, title, section, media_type, mime_type, filename,
        alt_text, storage, file_path, sort_order, is_active
      ) VALUES (
        ${item.key},
        ${item.title},
        ${item.section},
        ${item.type},
        ${mime},
        ${item.path ? path.basename(item.path) : null},
        ${item.title},
        ${item.path ? 'file' : 'file'},
        ${item.path},
        ${i++},
        ${item.path ? true : false}
      )
      ON CONFLICT (media_key) DO NOTHING
    `;
  }

  console.log(`→ Media seed: ${DEFAULT_MEDIA.length} registros (sin sobrescribir existentes)`);
  console.log('✓ Migración completada');
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end({ timeout: 1 });
  process.exit(1);
});
