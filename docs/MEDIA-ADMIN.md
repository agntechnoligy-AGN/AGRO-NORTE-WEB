# Medios y panel admin (Agro Norte)

## Arquitectura 1-B

- **PostgreSQL (Railway):** metadatos + archivos subidos por el panel (`BYTEA`)
- **Deploy / código:** imágenes en `public/images/` registradas en BD con `storage = 'file'`
- El sitio resuelve cada `media_key` desde la BD; si falla, usa el fallback local

## Variables (`.env`)

Copia `.env.example` → `.env`:

- `DATABASE_URL` → URL **pública** de Railway Postgres
- `ADMIN_SESSION_SECRET` → secreto largo
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` → usuario del panel

## Comandos

```bash
npm install
npm run db:migrate
npm run dev
```

## Panel admin (oculto)

No está enlazado en el menú ni el footer.

URL directa: **http://localhost:4321/admin/login**

Tras el login: `/admin` y `/admin/media`

## Cambiar una imagen (recomendado: deploy)

1. Reemplaza el archivo en `public/images/` (ej. `hero.jpg`)
2. Asegúrate de que en BD exista la clave (`hero`, `palta`, etc.) — el migrate ya las crea
3. Deploy

## Cambiar una imagen (panel)

1. Entra a `/admin/media`
2. Usa la misma `media_key` (ej. `hero`)
3. Sube el archivo (máx. 25 MB) — se guarda en Postgres

## Video del hero

Sube o registra la clave `heroVideo`. Si está activa y tiene archivo/URL, el inicio muestra video; si no, muestra la imagen `hero`.

## Seguridad

- Cambia la contraseña de admin después del primer login
- Si compartiste la URL de Postgres en un chat, **rota la contraseña** en Railway
- No subas `.env` a git
