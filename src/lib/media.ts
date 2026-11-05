import { getMediaMap } from './db';

/** Fallbacks locales (deploy / public/images) si la BD no responde */
export const defaultImages = {
  logo: '/images/logo-agn.png',
  hero: '/images/hero-video-poster.jpg',
  headerNosotros: '/images/fields.jpg',
  headerProductos: '/images/avocado.jpg',
  headerProceso: '/images/grapes.jpg',
  headerSostenibilidad: '/images/irrigation.jpg',
  headerFundo: '/images/fields.jpg',
  headerNoticias: '/images/workers.jpg',
  headerContacto: '/images/greenhouse.jpg',
  orchard: '/images/orchard.jpg',
  avocadoOrchard: '/images/avocado.jpg',
  vineyard: '/images/vineyard.jpg',
  farmAerial: '/images/hero-video-poster.jpg',
  greenFields: '/images/fields.jpg',
  irrigation: '/images/irrigation.jpg',
  tractor: '/images/tractor.jpg',
  workers: '/images/workers.jpg',
  harvestHands: '/images/orchard.jpg',
  team: '/images/team.jpg',
  palta: '/images/avocado.jpg',
  uva: '/images/grapes.jpg',
  crimson: '/images/red-grapes.jpg',
  redGlobe: '/images/red-grapes.jpg',
  superior: '/images/grapes.jpg',
  newsPalta: '/images/orchard.jpg',
  newsUva: '/images/red-grapes.jpg',
  newsTech: '/images/tech.jpg',
  newsTraining: '/images/team.jpg',
  newsWater: '/images/irrigation.jpg',
  newsExport: '/images/export.jpg',
  gallery1: '/images/workers.jpg',
  gallery2: '/images/grapes.jpg',
  gallery3: '/images/orchard.jpg',
  gallery4: '/images/tech.jpg',
  gallery5: '/images/avocado.jpg',
  gallery6: '/images/team.jpg',
  heroVideo: '/api/media/heroVideo'
} as const;

/** MP4 del hero. Vive en GitHub porque Vercel rechaza el archivo dentro del sitio. */
export const heroVideoUrl =
  'https://raw.githubusercontent.com/agntechnoligy-AGN/AGRO-NORTE-WEB/08a7eaa5ebce3a97bf10594be6c3aa117fd4ccf8/public/videos/hero-web.mp4';

/** Archivo público si Postgres no responde. Evita un 500 en /api/media. */
export function staticMediaPath(key: string): string | null {
  if (key === 'heroVideo') return heroVideoUrl;
  if (Object.prototype.hasOwnProperty.call(defaultImages, key)) {
    const url = defaultImages[key as keyof typeof defaultImages];
    if (url.startsWith('/api/')) return null;
    return url;
  }
  return null;
}

export type ImageKey = keyof typeof defaultImages;

/** Resuelve URLs desde Postgres; si falla, usa archivos del deploy */
export async function resolveImages(keys?: ImageKey[]): Promise<Record<ImageKey, string>> {
  const allKeys = (keys || Object.keys(defaultImages)) as ImageKey[];
  const fromDb = await getMediaMap(allKeys);
  const result = { ...defaultImages } as Record<ImageKey, string>;
  for (const key of allKeys) {
    if (fromDb[key]) result[key] = fromDb[key];
  }
  return result;
}

/** Compat: objeto estático para imports síncronos legacy */
export const images = defaultImages;
