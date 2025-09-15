-- backend/migrations.sql

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  event_type VARCHAR(100) NOT NULL,
  scenario VARCHAR(100),
  timestamp TIMESTAMPTZ DEFAULT now(),
  details JSONB
);

CREATE TABLE IF NOT EXISTS consents (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  consent JSONB NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now()
);

