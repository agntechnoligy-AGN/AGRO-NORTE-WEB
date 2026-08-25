import { getMediaMap } from './db';

/** Fallbacks locales (deploy / public/images) si la BD no responde */
export const defaultImages = {
  hero: '/images/hero.jpg',
  headerNosotros: '/images/fields.jpg',
  headerProductos: '/images/avocado.jpg',
  headerProceso: '/images/farm.jpg',
  headerSostenibilidad: '/images/irrigation.jpg',
  headerFundo: '/images/fields.jpg',
  headerNoticias: '/images/workers.jpg',
  headerContacto: '/images/greenhouse.jpg',
  orchard: '/images/orchard.jpg',
  avocadoOrchard: '/images/avocado.jpg',
  vineyard: '/images/vineyard.jpg',
  farmAerial: '/images/hero.jpg',
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
  heroVideo: '/videos/hero.mp4'
} as const;

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
