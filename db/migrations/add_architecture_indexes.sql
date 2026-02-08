-- Performance indexes for decision/observation/events (greenupp_data_architecture §7)
-- Idempotent: CREATE INDEX IF NOT EXISTS

-- Decisions: by user and time (home + admin queries)
CREATE INDEX IF NOT EXISTS idx_decisions_user_id_created_at
  ON decisions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_decisions_user_id_expires_at
  ON decisions (user_id, expires_at);

-- Weather snapshots: by location and time (cache lookups)
CREATE INDEX IF NOT EXISTS idx_weather_snapshots_location_created_at
  ON weather_snapshots (location_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_weather_snapshots_user_created_at
  ON weather_snapshots (user_id, created_at DESC);

-- Analytics events: by user and time (admin events list + reporting)
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id_created_at
  ON analytics_events (user_id, created_at DESC);

-- Plant analyses: by user and time (diagnosis → decision, admin)
CREATE INDEX IF NOT EXISTS idx_plant_analyses_user_id_created_at
  ON plant_analyses (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_plant_analyses_field_id_created_at
  ON plant_analyses (field_id, created_at DESC)
  WHERE field_id IS NOT NULL;
