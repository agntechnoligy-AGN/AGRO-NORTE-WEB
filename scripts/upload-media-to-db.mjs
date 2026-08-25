/**
 * Sube a Postgres (BYTEA) todos los archivos de media usados por el sitio.
 * El video hero se sube ORIGINAL (sin comprimir).
 *
 * Uso: node scripts/upload-media-to-db.mjs
 * Opcional: node scripts/upload-media-to-db.mjs --only=heroVideo
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Falta DATABASE_URL en .env');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1,
  connect_timeout: 120,
  idle_timeout: 0
});

/** Clave → archivo local relativo a public/ */
const MEDIA_FILES = [
  { key: 'logo', file: 'images/logo-agn.png', title: 'Logo AGN', section: 'brand', type: 'image', mime: 'image/png' },
  { key: 'hero', file: 'images/hero-video-poster.jpg', title: 'Poster video hero', section: 'inicio', type: 'image', mime: 'image/jpeg' },
  { key: 'headerNosotros', file: 'images/fields.jpg', title: 'Header Nosotros', section: 'nosotros', type: 'image', mime: 'image/jpeg' },
  { key: 'headerProductos', file: 'images/avocado.jpg', title: 'Header Productos', section: 'productos', type: 'image', mime: 'image/jpeg' },
  { key: 'headerProceso', file: 'images/farm.jpg', title: 'Header Proceso', section: 'proceso', type: 'image', mime: 'image/jpeg' },
  { key: 'headerSostenibilidad', file: 'images/irrigation.jpg', title: 'Header Sostenibilidad', section: 'sostenibilidad', type: 'image', mime: 'image/jpeg' },
  { key: 'headerFundo', file: 'images/fields.jpg', title: 'Header Fundo', section: 'fundo', type: 'image', mime: 'image/jpeg' },
  { key: 'headerNoticias', file: 'images/workers.jpg', title: 'Header Noticias', section: 'noticias', type: 'image', mime: 'image/jpeg' },
  { key: 'headerContacto', file: 'images/greenhouse.jpg', title: 'Header Contacto', section: 'contacto', type: 'image', mime: 'image/jpeg' },
  { key: 'orchard', file: 'images/orchard.jpg', title: 'Huerto', section: 'nosotros', type: 'image', mime: 'image/jpeg' },
  { key: 'avocadoOrchard', file: 'images/avocado.jpg', title: 'Palta huerto', section: 'productos', type: 'image', mime: 'image/jpeg' },
  { key: 'vineyard', file: 'images/vineyard.jpg', title: 'Viñedo', section: 'fundo', type: 'image', mime: 'image/jpeg' },
  { key: 'farmAerial', file: 'images/hero-video-poster.jpg', title: 'Vista aérea', section: 'sostenibilidad', type: 'image', mime: 'image/jpeg' },
  { key: 'greenFields', file: 'images/fields.jpg', title: 'Campos verdes', section: 'fundo', type: 'image', mime: 'image/jpeg' },
  { key: 'irrigation', file: 'images/irrigation.jpg', title: 'Riego', section: 'fundo', type: 'image', mime: 'image/jpeg' },
  { key: 'tractor', file: 'images/tractor.jpg', title: 'Maquinaria', section: 'fundo', type: 'image', mime: 'image/jpeg' },
  { key: 'workers', file: 'images/workers.jpg', title: 'Trabajadores', section: 'gente', type: 'image', mime: 'image/jpeg' },
  { key: 'team', file: 'images/team.jpg', title: 'Equipo', section: 'gente', type: 'image', mime: 'image/jpeg' },
  { key: 'palta', file: 'images/avocado.jpg', title: 'Palta Hass', section: 'productos', type: 'image', mime: 'image/jpeg' },
  { key: 'uva', file: 'images/grapes.jpg', title: 'Uva Allison', section: 'productos', type: 'image', mime: 'image/jpeg' },
  { key: 'crimson', file: 'images/red-grapes.jpg', title: 'Uva', section: 'productos', type: 'image', mime: 'image/jpeg' },
  { key: 'redGlobe', file: 'images/red-grapes.jpg', title: 'Uva', section: 'productos', type: 'image', mime: 'image/jpeg' },
  { key: 'superior', file: 'images/grapes.jpg', title: 'Uva', section: 'productos', type: 'image', mime: 'image/jpeg' },
  { key: 'newsPalta', file: 'images/orchard.jpg', title: 'Noticia palta', section: 'noticias', type: 'image', mime: 'image/jpeg' },
  { key: 'newsUva', file: 'images/red-grapes.jpg', title: 'Noticia uva', section: 'noticias', type: 'image', mime: 'image/jpeg' },
  { key: 'newsTech', file: 'images/tech.jpg', title: 'Noticia tech', section: 'noticias', type: 'image', mime: 'image/jpeg' },
  { key: 'newsTraining', file: 'images/team.jpg', title: 'Noticia capacitación', section: 'noticias', type: 'image', mime: 'image/jpeg' },
  { key: 'newsWater', file: 'images/irrigation.jpg', title: 'Noticia riego', section: 'noticias', type: 'image', mime: 'image/jpeg' },
  { key: 'newsExport', file: 'images/export.jpg', title: 'Noticia exportación', section: 'noticias', type: 'image', mime: 'image/jpeg' },
  { key: 'gallery1', file: 'images/workers.jpg', title: 'Galería 1', section: 'gente', type: 'image', mime: 'image/jpeg' },
  { key: 'gallery2', file: 'images/grapes.jpg', title: 'Galería 2', section: 'gente', type: 'image', mime: 'image/jpeg' },
  { key: 'gallery3', file: 'images/orchard.jpg', title: 'Galería 3', section: 'gente', type: 'image', mime: 'image/jpeg' },
  { key: 'gallery4', file: 'images/tech.jpg', title: 'Galería 4', section: 'gente', type: 'image', mime: 'image/jpeg' },
  { key: 'gallery5', file: 'images/avocado.jpg', title: 'Galería 5', section: 'gente', type: 'image', mime: 'image/jpeg' },
  { key: 'gallery6', file: 'images/team.jpg', title: 'Galería 6', section: 'gente', type: 'image', mime: 'image/jpeg' },
  // ORIGINAL sin comprimir
  { key: 'heroVideo', file: 'videos/hero.mp4', title: 'Video hero original', section: 'inicio', type: 'video', mime: 'video/mp4' }
];

async function upsertFile(item, sortOrder) {
  const abs = path.join(root, 'public', item.file);
  if (!fs.existsSync(abs)) {
    console.warn(`⊘ No existe: ${item.file}`);
    return false;
  }

  const stat = fs.statSync(abs);
  const mb = (stat.size / (1024 * 1024)).toFixed(1);
  console.log(`↑ ${item.key} ← ${item.file} (${mb} MB)`);

  const buffer = fs.readFileSync(abs);

  await sql`
    INSERT INTO media (
      media_key, title, section, media_type, mime_type, filename,
      alt_text, storage, file_path, external_url, file_data, sort_order, is_active, updated_at
    ) VALUES (
      ${item.key},
      ${item.title},
      ${item.section},
      ${item.type},
      ${item.mime},
      ${path.basename(item.file)},
      ${item.title},
      'db',
      NULL,
      NULL,
      ${buffer},
      ${sortOrder},
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
      sort_order = EXCLUDED.sort_order,
      is_active = TRUE,
      updated_at = NOW()
  `;

  console.log(`  ✓ ${item.key} en BD`);
  return true;
}

async function main() {
  const list = only ? MEDIA_FILES.filter((m) => m.key === only) : MEDIA_FILES;
  if (!list.length) {
    console.error(`No hay media para: ${only}`);
    process.exit(1);
  }

  console.log(`Subiendo ${list.length} archivo(s) a Postgres (storage=db)...\n`);
  let ok = 0;
  let i = 0;
  for (const item of list) {
    if (await upsertFile(item, i++)) ok++;
  }

  const check = await sql`
    SELECT media_key, storage,
           CASE WHEN file_data IS NULL THEN 0 ELSE length(file_data) END AS bytes
    FROM media
    WHERE media_key = ANY(${list.map((m) => m.key)})
    ORDER BY media_key
  `;
  console.log('\nEstado en BD:');
  for (const row of check) {
    console.log(`  ${row.media_key}: ${row.storage}, ${(Number(row.bytes) / (1024 * 1024)).toFixed(1)} MB`);
  }

  console.log(`\n✓ Listo: ${ok}/${list.length}`);
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end({ timeout: 1 });
  process.exit(1);
});
