-- Hazard & Pest Alerts subsystem: normalized events, user subscriptions, delivery tracking.
-- Zambia-first; integrates with weather/location/notifications.

-- Enums (optional; we use text in schema for flexibility; uncomment if you want DB enums)
-- CREATE TYPE alert_event_type AS ENUM ('flood','drought','storm','heat','extreme_rain','pest_outbreak','disease_risk','advisory');
-- CREATE TYPE alert_hazard_class AS ENUM ('weather','climate','pest');
-- CREATE TYPE alert_status AS ENUM ('active','resolved','test');
-- CREATE TYPE alert_subscription_scope AS ENUM ('my_location','my_fields','custom_area');
-- CREATE TYPE alert_delivery_channel AS ENUM ('push','in_app','email');
-- CREATE TYPE alert_delivery_status AS ENUM ('sent','failed','skipped');

-- Alert events (from GDACS, ReliefWeb, OpenWeather, pest feeds, etc.)
CREATE TABLE IF NOT EXISTS alert_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_type TEXT NOT NULL,
  hazard_class TEXT NOT NULL,
  severity INTEGER NOT NULL,
  confidence REAL,
  headline TEXT NOT NULL,
  summary TEXT,
  recommended_actions JSONB DEFAULT '[]',
  geojson JSONB,
  province TEXT,
  district TEXT,
  country TEXT DEFAULT 'ZM',
  start_at TIMESTAMP,
  end_at TIMESTAMP,
  first_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_url TEXT,
  external_id TEXT,
  dedupe_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_events_status ON alert_events(status);
CREATE INDEX IF NOT EXISTS idx_alert_events_dedupe_key ON alert_events(dedupe_key);
CREATE INDEX IF NOT EXISTS idx_alert_events_start_at ON alert_events(start_at);
CREATE INDEX IF NOT EXISTS idx_alert_events_province ON alert_events(province);
CREATE INDEX IF NOT EXISTS idx_alert_events_geojson ON alert_events USING GIN (geojson);

-- User alert subscriptions (scope: my_location | my_fields | custom_area)
CREATE TABLE IF NOT EXISTS user_alert_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  scope TEXT NOT NULL DEFAULT 'my_location',
  custom_geojson JSONB,
  event_types JSONB DEFAULT '[]',
  min_severity INTEGER NOT NULL DEFAULT 1,
  digest_mode BOOLEAN DEFAULT false,
  quiet_hours_start INTEGER,
  quiet_hours_end INTEGER,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_alert_subscriptions_user_id ON user_alert_subscriptions(user_id);

-- Alert deliveries (one row per user/event/channel to avoid spam)
CREATE TABLE IF NOT EXISTS alert_deliveries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  alert_event_id TEXT NOT NULL REFERENCES alert_events(id),
  channel TEXT NOT NULL,
  delivered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  delivery_status TEXT NOT NULL DEFAULT 'sent',
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT alert_deliveries_user_event_channel_unique UNIQUE (user_id, alert_event_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_alert_deliveries_user_id ON alert_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_deliveries_alert_event_id ON alert_deliveries(alert_event_id);
