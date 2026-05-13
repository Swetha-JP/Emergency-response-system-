-- ============================================
-- SafeGuard Emergency Platform — Full Schema
-- Run this in Neon SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type     VARCHAR(50) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agencies (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  type           VARCHAR(50) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  address        TEXT,
  latitude       DECIMAL(10,8),
  longitude      DECIMAL(11,8),
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_requests (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER REFERENCES users(id),
  emergency_type     VARCHAR(50) NOT NULL,
  description        TEXT,
  latitude           DECIMAL(10,8) NOT NULL,
  longitude          DECIMAL(11,8) NOT NULL,
  status             VARCHAR(50) DEFAULT 'pending',
  priority           VARCHAR(20) DEFAULT 'medium',
  assigned_agency_id INTEGER REFERENCES agencies(id),
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at        TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_updates (
  id           SERIAL PRIMARY KEY,
  emergency_id INTEGER REFERENCES emergency_requests(id),
  agency_id    INTEGER REFERENCES agencies(id),
  status       VARCHAR(50) NOT NULL,
  message      TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS location_tracking (
  id           SERIAL PRIMARY KEY,
  emergency_id INTEGER REFERENCES emergency_requests(id),
  latitude     DECIMAL(10,8) NOT NULL,
  longitude    DECIMAL(11,8) NOT NULL,
  tracked_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_files (
  id           SERIAL PRIMARY KEY,
  emergency_id INTEGER REFERENCES emergency_requests(id),
  file_type    VARCHAR(50) NOT NULL,
  file_path    TEXT NOT NULL,
  file_name    VARCHAR(255) NOT NULL,
  file_size    INTEGER,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id),
  name         VARCHAR(255) NOT NULL,
  phone        VARCHAR(20) NOT NULL,
  email        VARCHAR(255),
  relationship VARCHAR(100),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id           SERIAL PRIMARY KEY,
  emergency_id INTEGER REFERENCES emergency_requests(id),
  user_id      INTEGER REFERENCES users(id),
  message      TEXT NOT NULL,
  user_type    VARCHAR(50) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS path_tracking (
  id           SERIAL PRIMARY KEY,
  emergency_id INTEGER REFERENCES emergency_requests(id),
  latitude     DECIMAL(10,8) NOT NULL,
  longitude    DECIMAL(11,8) NOT NULL,
  accuracy     DECIMAL(10,2),
  timestamp    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_zones (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  latitude    DECIMAL(10,8) NOT NULL,
  longitude   DECIMAL(11,8) NOT NULL,
  radius      INTEGER NOT NULL,
  risk_level  VARCHAR(50),
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wildlife_reports (
  report_id     SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  image_url     TEXT NOT NULL,
  incident_type VARCHAR(50) NOT NULL,
  description   TEXT,
  latitude      DECIMAL(10,8),
  longitude     DECIMAL(11,8),
  status        VARCHAR(20) DEFAULT 'Pending',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Seed admin user (password: admin123) ──────────────────────
-- Hash generated with bcrypt saltRounds=10 for 'admin123'
INSERT INTO users (name, email, phone, password_hash, user_type)
VALUES (
  'Admin',
  'admin@safeguard.com',
  '9999999999',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO',
  'admin'
) ON CONFLICT (email) DO NOTHING;
