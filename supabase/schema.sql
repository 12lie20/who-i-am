-- ============================================================
-- Who Am I? — Database Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- Categories
-- ------------------------------------------------------------
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  icon       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Images (characters within a category)
-- ------------------------------------------------------------
CREATE TABLE images (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id              UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  character_name           TEXT NOT NULL,
  character_name_normalized TEXT NOT NULL,
  image_url                TEXT NOT NULL,
  hints                    JSONB DEFAULT '[]'::jsonb,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_images_category_id ON images(category_id);

-- ------------------------------------------------------------
-- Rooms
-- ------------------------------------------------------------
CREATE TABLE rooms (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code        TEXT NOT NULL UNIQUE,
  category_id      UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'waiting'
                     CHECK (status IN ('waiting', 'playing', 'finished')),
  player_1_id      TEXT,
  player_2_id      TEXT,
  player_1_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  player_2_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  winner_id        TEXT,
  timer_seconds    INTEGER,
  player_1_guesses INTEGER NOT NULL DEFAULT 0,
  player_2_guesses INTEGER NOT NULL DEFAULT 0,
  player_1_hints_used INTEGER NOT NULL DEFAULT 0,
  player_2_hints_used INTEGER NOT NULL DEFAULT 0,
  started_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rooms_room_code ON rooms(room_code);
CREATE INDEX idx_rooms_status    ON rooms(status);

-- ------------------------------------------------------------
-- Enable Row-Level Security on all tables
-- ------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms      ENABLE ROW LEVEL SECURITY;
