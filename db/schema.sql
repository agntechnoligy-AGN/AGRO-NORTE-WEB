-- Agro Norte Corp — schema 1-B
-- Metadatos + archivos (BYTEA) en Postgres Railway

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  media_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  section TEXT NOT NULL DEFAULT 'general',
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  filename TEXT,
  alt_text TEXT NOT NULL DEFAULT '',
  -- file = ruta en public/ | db = contenido en file_data | url = enlace externo
  storage TEXT NOT NULL DEFAULT 'file' CHECK (storage IN ('file', 'db', 'url')),
  file_path TEXT,
  external_url TEXT,
  file_data BYTEA,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_section ON media(section);
CREATE INDEX IF NOT EXISTS idx_media_key ON media(media_key);
CREATE INDEX IF NOT EXISTS idx_media_active ON media(is_active);
