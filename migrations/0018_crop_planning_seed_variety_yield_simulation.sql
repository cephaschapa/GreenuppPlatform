-- Crop Planning + Seed Variety + Yield Simulation (Zambia)
-- Tables: crop_ref, seed_companies, seed_varieties, seasons, agro_ecological_regions, field_crop_plans, yield_simulation_runs

-- Reference crop types
CREATE TABLE IF NOT EXISTS crop_ref (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  default_water_requirement_mm REAL,
  default_gdd_range JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed companies
CREATE TABLE IF NOT EXISTS seed_companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT DEFAULT 'ZM',
  website TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed varieties (Zambia agro-ecological fit, planting windows)
CREATE TABLE IF NOT EXISTS seed_varieties (
  id SERIAL PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crop_ref(id),
  company_id INTEGER REFERENCES seed_companies(id),
  name TEXT NOT NULL,
  code TEXT,
  type TEXT NOT NULL,
  grain_color TEXT,
  maturity_class TEXT NOT NULL,
  days_to_maturity_min INTEGER,
  days_to_maturity_max INTEGER,
  yield_potential_t_ha_min REAL,
  yield_potential_t_ha_max REAL,
  traits JSONB,
  recommended_regions TEXT[],
  recommended_provinces TEXT[],
  recommended_planting_window JSONB,
  source_url TEXT,
  source_doc TEXT,
  last_verified_at DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seed_varieties_crop_id ON seed_varieties(crop_id);
CREATE INDEX IF NOT EXISTS idx_seed_varieties_company_id ON seed_varieties(company_id);
CREATE INDEX IF NOT EXISTS idx_seed_varieties_recommended_regions ON seed_varieties USING GIN(recommended_regions);
CREATE INDEX IF NOT EXISTS idx_seed_varieties_is_active ON seed_varieties(is_active);

-- Seasons
CREATE TABLE IF NOT EXISTS seasons (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Province/District → Agro-Ecological Region (Zambia)
CREATE TABLE IF NOT EXISTS agro_ecological_regions (
  id SERIAL PRIMARY KEY,
  province TEXT NOT NULL,
  district TEXT,
  region TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(province, district)
);

CREATE INDEX IF NOT EXISTS idx_agro_ecological_province ON agro_ecological_regions(province);
CREATE INDEX IF NOT EXISTS idx_agro_ecological_region ON agro_ecological_regions(region);

-- Field crop plans
CREATE TABLE IF NOT EXISTS field_crop_plans (
  id SERIAL PRIMARY KEY,
  field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  season_id INTEGER NOT NULL REFERENCES seasons(id),
  crop_id INTEGER NOT NULL REFERENCES crop_ref(id),
  seed_variety_id INTEGER REFERENCES seed_varieties(id),
  target_area_ha NUMERIC(10,2),
  planting_date DATE,
  expected_harvest_date DATE,
  management_level TEXT DEFAULT 'medium',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_crop_plans_field_id ON field_crop_plans(field_id);
CREATE INDEX IF NOT EXISTS idx_field_crop_plans_season_id ON field_crop_plans(season_id);

-- Yield simulation runs (audit snapshot)
CREATE TABLE IF NOT EXISTS yield_simulation_runs (
  id SERIAL PRIMARY KEY,
  field_crop_plan_id INTEGER NOT NULL REFERENCES field_crop_plans(id) ON DELETE CASCADE,
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  weather_snapshot_json JSONB,
  method_version TEXT NOT NULL DEFAULT 'mvp_v1',
  inputs JSONB NOT NULL,
  outputs JSONB NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yield_simulation_runs_plan_id ON yield_simulation_runs(field_crop_plan_id);

COMMENT ON TABLE crop_ref IS 'Reference crop types for planning (Maize, Soybean, etc.)';
COMMENT ON TABLE seed_varieties IS 'Seed varieties with Zambia agro-ecological region and planting window';
COMMENT ON TABLE field_crop_plans IS 'Crop plan per field per season (crop + optional seed variety)';
COMMENT ON TABLE yield_simulation_runs IS 'Auditable yield simulation snapshots';
