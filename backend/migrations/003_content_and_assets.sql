CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE architectures (
  id SERIAL PRIMARY KEY,
  name TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE architecture_items (
  id SERIAL PRIMARY KEY,
  name TEXT,
  architecture_id INTEGER,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE digital_assets (
  id SERIAL PRIMARY KEY,
  unique_id UUID NOT NULL,
  name TEXT,
  content_type TEXT,
  bytes BYTEA NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX digital_assets_unique_id_idx ON digital_assets (unique_id);
