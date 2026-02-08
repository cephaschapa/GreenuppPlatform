-- Migration: Decision + Observation + Events (Option B Phase 1)
-- Adds weather_snapshots, decisions, events and farmer_profile location resolution columns.

-- 1) Farmer profile: location resolution columns (if not already present)
ALTER TABLE farmer_profiles ADD COLUMN IF NOT EXISTS farm_location_id INTEGER REFERENCES locations(id);
ALTER TABLE farmer_profiles ADD COLUMN IF NOT EXISTS farm_location_source TEXT;
ALTER TABLE farmer_profiles ADD COLUMN IF NOT EXISTS farm_location_confidence TEXT;
ALTER TABLE farmer_profiles ADD COLUMN IF NOT EXISTS farm_location_resolved_at TIMESTAMP;
ALTER TABLE farmer_profiles ADD COLUMN IF NOT EXISTS farm_location_last_geocode_error TEXT;

-- 2) Weather snapshots
CREATE TABLE IF NOT EXISTS weather_snapshots (
  id SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES locations(id),
  user_id INTEGER REFERENCES users(id),
  location_name TEXT NOT NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  source TEXT NOT NULL,
  forecast_json JSONB NOT NULL,
  forecast_from TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_snapshots_location_created
  ON weather_snapshots(location_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_snapshots_user_created
  ON weather_snapshots(user_id, created_at DESC);

-- 3) Decisions
CREATE TABLE IF NOT EXISTS decisions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  scope_type TEXT NOT NULL,
  field_id INTEGER REFERENCES fields(id),
  crop_id INTEGER REFERENCES crops(id),
  decision_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  priority TEXT NOT NULL,
  confidence_level TEXT NOT NULL,
  confidence_score DECIMAL(5,2),
  why_text TEXT NOT NULL,
  why_payload JSONB,
  trigger_type TEXT NOT NULL,
  trigger_ref_id INTEGER,
  ruleset_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated',
  expires_at TIMESTAMP NOT NULL,
  shown_at TIMESTAMP,
  acted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_user_created
  ON decisions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_user_expires
  ON decisions(user_id, expires_at);

-- 4) Analytics events (append-only; table name avoids conflict with social "events")
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id TEXT,
  device_id TEXT,
  event_name TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  properties JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
  ON analytics_events(user_id, created_at DESC);
