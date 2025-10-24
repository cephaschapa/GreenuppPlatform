-- Create crop observations table for daily monitoring and progress tracking

CREATE TABLE IF NOT EXISTS crop_observations (
  id SERIAL PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  field_id INTEGER REFERENCES fields(id),
  
  -- Observation details
  observation_date TIMESTAMP NOT NULL DEFAULT NOW(),
  observation_type TEXT NOT NULL CHECK (observation_type IN (
    'general',
    'watering',
    'fertilizing',
    'pest_check',
    'disease_check',
    'growth_measurement',
    'harvest_check',
    'soil_check',
    'weather_impact',
    'other'
  )),
  
  -- Observation content
  notes TEXT,
  health_status TEXT CHECK (health_status IN ('excellent', 'good', 'fair', 'poor', 'critical')),
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  
  -- Measurements
  height_cm DECIMAL(10, 2),
  leaf_count INTEGER,
  fruit_count INTEGER,
  
  -- Issues detected
  pest_detected BOOLEAN DEFAULT FALSE,
  pest_type TEXT,
  pest_severity TEXT CHECK (pest_severity IN ('low', 'moderate', 'high')),
  
  disease_detected BOOLEAN DEFAULT FALSE,
  disease_type TEXT,
  disease_severity TEXT CHECK (disease_severity IN ('low', 'moderate', 'high')),
  
  -- Actions taken
  action_taken TEXT, -- e.g., "Applied pesticide", "Watered", "Pruned"
  water_amount_liters DECIMAL(10, 2),
  fertilizer_applied BOOLEAN DEFAULT FALSE,
  fertilizer_type TEXT,
  fertilizer_amount TEXT,
  
  -- Media
  photos TEXT[], -- Array of image URLs
  
  -- Location (if GPS enabled)
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  
  -- Weather at observation time
  temperature DECIMAL(5, 2),
  weather_condition TEXT,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_crop_observations_crop_id ON crop_observations(crop_id);
CREATE INDEX idx_crop_observations_user_id ON crop_observations(user_id);
CREATE INDEX idx_crop_observations_field_id ON crop_observations(field_id);
CREATE INDEX idx_crop_observations_date ON crop_observations(observation_date DESC);
CREATE INDEX idx_crop_observations_type ON crop_observations(observation_type);

-- Create field visit logs table
CREATE TABLE IF NOT EXISTS field_visits (
  id SERIAL PRIMARY KEY,
  field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  
  -- Visit details
  visit_date TIMESTAMP NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,
  
  -- Visit purpose
  purpose TEXT CHECK (purpose IN (
    'routine_inspection',
    'pest_monitoring',
    'harvest',
    'planting',
    'irrigation',
    'maintenance',
    'soil_testing',
    'other'
  )),
  
  -- Observations
  notes TEXT,
  overall_condition TEXT CHECK (overall_condition IN ('excellent', 'good', 'fair', 'poor')),
  
  -- Issues found
  issues_found TEXT[],
  actions_taken TEXT[],
  
  -- Weather during visit
  temperature DECIMAL(5, 2),
  weather_condition TEXT,
  
  -- Location verification
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  
  -- Photos
  photos TEXT[],
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for field visits
CREATE INDEX idx_field_visits_field_id ON field_visits(field_id);
CREATE INDEX idx_field_visits_user_id ON field_visits(user_id);
CREATE INDEX idx_field_visits_date ON field_visits(visit_date DESC);

-- Create crop growth stages table for smart notifications
CREATE TABLE IF NOT EXISTS crop_growth_stages (
  id SERIAL PRIMARY KEY,
  crop_name TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  
  -- Days from planting
  days_from_planting_min INTEGER NOT NULL,
  days_from_planting_max INTEGER NOT NULL,
  
  -- Stage characteristics
  description TEXT,
  visual_indicators TEXT[],
  
  -- Care recommendations
  care_actions TEXT[],
  common_issues TEXT[],
  
  -- Notification settings
  should_notify BOOLEAN DEFAULT TRUE,
  notification_message TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(crop_name, stage_name)
);

-- Seed some basic growth stages
INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message) VALUES
  ('Maize', 'Germination', 1, 0, 10, 'Seed sprouting and emergence', ARRAY['Shoots emerging from soil', 'First leaves unfolding'], ARRAY['Keep soil moist', 'Protect from birds'], ARRAY['Poor germination', 'Bird damage'], 'Your maize should be germinating - check for emergence'),
  ('Maize', 'Vegetative Growth', 2, 10, 50, 'Rapid leaf and stem development', ARRAY['Leaves developing', 'Stem elongating', '6-12 leaves visible'], ARRAY['Apply nitrogen fertilizer', 'Weed control', 'Monitor for pests'], ARRAY['Leaf blight', 'Armyworm'], 'Your maize is in vegetative stage - time to fertilize'),
  ('Maize', 'Tasseling', 3, 50, 70, 'Tassel emergence and pollen shed', ARRAY['Tassel appearing at top', 'Pollen shedding'], ARRAY['Ensure adequate water', 'Monitor for pests'], ARRAY['Poor pollination', 'Aphids on tassel'], 'Your maize is tasseling - critical stage for yield'),
  ('Maize', 'Silking', 4, 55, 75, 'Silk emergence and pollination', ARRAY['Silks emerging from ear', 'Pollination occurring'], ARRAY['Maintain moisture', 'Protect from pests'], ARRAY['Poor pollination', 'Silk cutting by beetles'], 'Your maize is silking - ensure good pollination'),
  ('Maize', 'Grain Fill', 5, 70, 100, 'Kernel development', ARRAY['Ears filling out', 'Kernels developing'], ARRAY['Maintain water', 'Monitor for diseases'], ARRAY['Ear rot', 'Kernel damage'], 'Your maize is filling grain - monitor closely'),
  ('Maize', 'Maturity', 6, 100, 140, 'Grain maturation and drying', ARRAY['Leaves drying', 'Kernels hardening', 'Black layer visible'], ARRAY['Prepare for harvest', 'Protect from birds'], ARRAY['Lodging', 'Bird damage'], 'Your maize is maturing - prepare for harvest'),
  
  ('Tomato', 'Germination', 1, 0, 14, 'Seedling emergence', ARRAY['Cotyledons visible', 'First true leaves'], ARRAY['Keep warm and moist', 'Good light'], ARRAY['Damping off'], 'Check your tomato seedlings'),
  ('Tomato', 'Vegetative', 2, 14, 35, 'Leaf and stem growth', ARRAY['Multiple leaf sets', 'Strong stem'], ARRAY['Transplant if needed', 'Apply fertilizer'], ARRAY['Aphids', 'Whiteflies'], 'Your tomatoes need attention - vegetative stage'),
  ('Tomato', 'Flowering', 3, 35, 50, 'First flowers appear', ARRAY['Flower clusters', 'Yellow blooms'], ARRAY['Ensure pollination', 'Maintain moisture'], ARRAY['Blossom drop', 'Poor fruit set'], 'Your tomatoes are flowering - critical for fruit set'),
  ('Tomato', 'Fruit Set', 4, 45, 60, 'Small fruits developing', ARRAY['Green fruits visible', 'Growing in size'], ARRAY['Regular watering', 'Support heavy branches'], ARRAY['Blossom end rot', 'Fruit cracking'], 'Your tomatoes have fruit - maintain consistent watering'),
  ('Tomato', 'Ripening', 5, 60, 85, 'Fruits changing color', ARRAY['Color change from green', 'Fruits softening'], ARRAY['Reduce watering slightly', 'Monitor for pests'], ARRAY['Fruit flies', 'Splitting'], 'Your tomatoes are ripening - prepare for harvest');

COMMENT ON TABLE crop_observations IS 'Daily observations and updates for crop monitoring';
COMMENT ON TABLE field_visits IS 'Field inspection logs with GPS verification';
COMMENT ON TABLE crop_growth_stages IS 'Growth stage definitions for smart notifications';

