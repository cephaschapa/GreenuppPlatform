-- Create crop reference database table
-- This replaces the hardcoded crop data in weather.ts

CREATE TABLE IF NOT EXISTS crop_varieties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., "Maize (Corn)", "Wheat", "Rice"
  variety TEXT NOT NULL, -- e.g., "Hybrid", "Winter Wheat", "Long Grain"
  
  -- Temperature requirements (°C)
  temp_min DECIMAL(5, 2) NOT NULL,
  temp_optimal DECIMAL(5, 2) NOT NULL,
  temp_max DECIMAL(5, 2) NOT NULL,
  
  -- Growing period (days)
  growing_days_min INTEGER NOT NULL,
  growing_days_max INTEGER NOT NULL,
  
  -- Water requirements
  water_requirement TEXT NOT NULL CHECK (water_requirement IN ('Low', 'Medium', 'High')),
  
  -- Soil preferences
  soil_types TEXT[] NOT NULL, -- Array of preferred soil types
  soil_ph_min DECIMAL(3, 1) NOT NULL,
  soil_ph_max DECIMAL(3, 1) NOT NULL,
  
  -- Seasonality
  planting_seasons TEXT[] NOT NULL, -- ["Spring", "Summer", "Fall", "Winter", "Perennial"]
  
  -- Additional metadata
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  region TEXT, -- e.g., "Global", "Tropical", "Temperate", "Zambia"
  
  -- Yield information
  expected_yield_min DECIMAL(8, 2), -- tons/hectare
  expected_yield_max DECIMAL(8, 2), -- tons/hectare
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Unique constraint on name + variety
  UNIQUE(name, variety)
);

-- Create index for faster queries
CREATE INDEX idx_crop_varieties_name ON crop_varieties(name);
CREATE INDEX idx_crop_varieties_region ON crop_varieties(region);
CREATE INDEX idx_crop_varieties_active ON crop_varieties(is_active);

-- Insert default crop data (migrated from hardcoded data)
INSERT INTO crop_varieties (
  name, variety, temp_min, temp_optimal, temp_max, 
  growing_days_min, growing_days_max, water_requirement,
  soil_types, soil_ph_min, soil_ph_max, planting_seasons,
  description, region, expected_yield_min, expected_yield_max
) VALUES
  ('Maize (Corn)', 'Hybrid', 18, 24, 32, 60, 100, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 5.8, 7.0, ARRAY['Spring', 'Summer'],
   'Versatile hybrid maize suitable for various climates', 'Global', 3.5, 8.0),
   
  ('Maize (Corn)', 'Sweet Corn', 18, 24, 30, 60, 90, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 6.0, 7.0, ARRAY['Spring', 'Summer'],
   'Sweet corn for fresh consumption', 'Global', 2.0, 5.0),
   
  ('Maize (Corn)', 'Popcorn', 18, 24, 32, 70, 110, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 5.8, 7.0, ARRAY['Spring', 'Summer'],
   'Specialty corn for popping', 'Global', 2.5, 4.5),

  ('Wheat', 'Winter Wheat', 3, 15, 30, 100, 130, 'Low',
   ARRAY['Clay Loam', 'Silt Loam', 'Loam'], 6.0, 7.5, ARRAY['Fall', 'Spring'],
   'Cold-hardy wheat planted in fall', 'Temperate', 3.0, 7.0),
   
  ('Wheat', 'Spring Wheat', 10, 18, 30, 90, 120, 'Low',
   ARRAY['Clay Loam', 'Silt Loam', 'Loam'], 6.0, 7.5, ARRAY['Spring'],
   'Wheat planted in spring for summer harvest', 'Temperate', 2.5, 6.0),
   
  ('Wheat', 'Durum', 8, 18, 32, 100, 130, 'Low',
   ARRAY['Clay Loam', 'Loam'], 6.5, 7.5, ARRAY['Spring'],
   'Hard wheat for pasta production', 'Temperate', 2.0, 5.5),

  ('Rice', 'Long Grain', 20, 30, 35, 90, 150, 'High',
   ARRAY['Clay', 'Clay Loam'], 5.5, 6.5, ARRAY['Spring', 'Summer'],
   'Popular long grain rice variety', 'Tropical', 4.0, 8.0),
   
  ('Rice', 'Medium Grain', 20, 30, 35, 100, 140, 'High',
   ARRAY['Clay', 'Clay Loam'], 5.5, 6.5, ARRAY['Spring', 'Summer'],
   'Medium grain rice for various uses', 'Tropical', 4.5, 8.5),
   
  ('Rice', 'Short Grain', 20, 28, 35, 110, 150, 'High',
   ARRAY['Clay', 'Clay Loam'], 5.5, 6.5, ARRAY['Spring', 'Summer'],
   'Short grain sticky rice', 'Tropical', 4.0, 7.5),

  ('Potato', 'Russet', 10, 18, 25, 90, 120, 'Medium',
   ARRAY['Sandy Loam', 'Loam'], 5.0, 6.5, ARRAY['Spring', 'Fall'],
   'Russet potatoes for baking', 'Temperate', 20, 40),
   
  ('Potato', 'Red', 10, 18, 25, 70, 100, 'Medium',
   ARRAY['Sandy Loam', 'Loam'], 5.0, 6.5, ARRAY['Spring', 'Fall'],
   'Red potatoes for boiling', 'Temperate', 18, 38),
   
  ('Potato', 'White', 10, 18, 25, 75, 110, 'Medium',
   ARRAY['Sandy Loam', 'Loam'], 5.0, 6.5, ARRAY['Spring', 'Fall'],
   'White potatoes for general use', 'Temperate', 20, 42),
   
  ('Potato', 'Yellow', 10, 18, 25, 80, 110, 'Medium',
   ARRAY['Sandy Loam', 'Loam'], 5.2, 6.5, ARRAY['Spring', 'Fall'],
   'Yellow/gold potatoes', 'Temperate', 22, 40),

  ('Soybean', 'Early Maturity', 15, 25, 30, 80, 100, 'Medium',
   ARRAY['Loam', 'Clay Loam', 'Silt Loam'], 6.0, 7.0, ARRAY['Spring', 'Summer'],
   'Fast-growing soybean variety', 'Global', 2.0, 4.0),
   
  ('Soybean', 'Mid Maturity', 15, 25, 30, 100, 115, 'Medium',
   ARRAY['Loam', 'Clay Loam', 'Silt Loam'], 6.0, 7.0, ARRAY['Spring', 'Summer'],
   'Standard soybean variety', 'Global', 2.5, 4.5),
   
  ('Soybean', 'Late Maturity', 18, 25, 30, 115, 140, 'Medium',
   ARRAY['Loam', 'Clay Loam', 'Silt Loam'], 6.0, 7.0, ARRAY['Spring', 'Summer'],
   'High-yield late season variety', 'Global', 3.0, 5.0),

  ('Tomato', 'Cherry', 16, 25, 30, 60, 80, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 6.0, 6.8, ARRAY['Spring', 'Summer'],
   'Small cherry tomatoes', 'Global', 15, 30),
   
  ('Tomato', 'Roma', 16, 25, 30, 75, 100, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 6.0, 6.8, ARRAY['Spring', 'Summer'],
   'Paste tomatoes for processing', 'Global', 20, 40),
   
  ('Tomato', 'Beefsteak', 18, 25, 30, 80, 100, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 6.2, 6.8, ARRAY['Spring', 'Summer'],
   'Large slicing tomatoes', 'Global', 18, 35),

  ('Lettuce', 'Romaine', 7, 16, 24, 30, 70, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 6.0, 7.0, ARRAY['Spring', 'Fall'],
   'Crisp romaine lettuce', 'Temperate', 12, 25),
   
  ('Lettuce', 'Iceberg', 7, 16, 24, 40, 70, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 6.0, 7.0, ARRAY['Spring', 'Fall'],
   'Crunchy iceberg lettuce', 'Temperate', 15, 28),
   
  ('Lettuce', 'Butterhead', 7, 16, 22, 30, 60, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 6.0, 7.0, ARRAY['Spring', 'Fall'],
   'Soft butterhead lettuce', 'Temperate', 10, 22),
   
  ('Lettuce', 'Loose Leaf', 7, 16, 24, 30, 60, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 6.0, 7.0, ARRAY['Spring', 'Fall'],
   'Loose leaf lettuce', 'Temperate', 8, 20),

  ('Cotton', 'Upland', 18, 28, 35, 150, 180, 'Medium',
   ARRAY['Loam', 'Sandy Loam', 'Clay Loam'], 5.8, 8.0, ARRAY['Spring', 'Summer'],
   'Most common cotton variety', 'Tropical', 0.8, 2.0),
   
  ('Cotton', 'Pima', 20, 28, 35, 160, 190, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 6.0, 7.8, ARRAY['Spring', 'Summer'],
   'Long-staple premium cotton', 'Tropical', 0.7, 1.8),

  ('Sunflower', 'Oil', 8, 23, 32, 70, 100, 'Low',
   ARRAY['Loam', 'Sandy Loam', 'Clay Loam'], 6.0, 7.5, ARRAY['Spring', 'Summer'],
   'Sunflower for oil production', 'Global', 1.5, 3.5),
   
  ('Sunflower', 'Confectionery', 10, 23, 32, 80, 100, 'Low',
   ARRAY['Loam', 'Sandy Loam', 'Clay Loam'], 6.0, 7.5, ARRAY['Spring', 'Summer'],
   'Sunflower for edible seeds', 'Global', 1.0, 2.5),

  ('Barley', 'Spring', 5, 15, 25, 60, 90, 'Low',
   ARRAY['Loam', 'Clay Loam', 'Silt Loam'], 6.0, 8.0, ARRAY['Spring'],
   'Spring barley for brewing and feed', 'Temperate', 2.5, 6.0),
   
  ('Barley', 'Winter', 3, 12, 25, 90, 120, 'Low',
   ARRAY['Loam', 'Clay Loam', 'Silt Loam'], 6.0, 8.0, ARRAY['Fall', 'Winter'],
   'Winter barley planted in fall', 'Temperate', 3.0, 7.0),
   
  ('Barley', 'Two-row', 5, 15, 25, 70, 100, 'Low',
   ARRAY['Loam', 'Silt Loam'], 6.5, 7.5, ARRAY['Spring'],
   'Two-row barley for malting', 'Temperate', 2.8, 6.5),
   
  ('Barley', 'Six-row', 5, 15, 25, 65, 95, 'Low',
   ARRAY['Loam', 'Clay Loam'], 6.0, 7.8, ARRAY['Spring'],
   'Six-row barley for feed', 'Temperate', 2.5, 6.0),

  ('Coffee', 'Arabica', 15, 20, 25, 365, 365, 'Medium',
   ARRAY['Loam', 'Clay Loam'], 5.0, 6.0, ARRAY['Perennial'],
   'High-quality arabica coffee', 'Tropical', 0.5, 2.0),
   
  ('Coffee', 'Robusta', 20, 26, 30, 365, 365, 'Medium',
   ARRAY['Loam', 'Clay Loam'], 5.5, 6.5, ARRAY['Perennial'],
   'Hardy robusta coffee', 'Tropical', 1.0, 3.0);

-- Add some Zambian-specific crops
INSERT INTO crop_varieties (
  name, variety, temp_min, temp_optimal, temp_max, 
  growing_days_min, growing_days_max, water_requirement,
  soil_types, soil_ph_min, soil_ph_max, planting_seasons,
  description, region, expected_yield_min, expected_yield_max
) VALUES
  ('Maize (Corn)', 'MM603 (Zambia)', 18, 24, 32, 120, 140, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 5.8, 6.8, ARRAY['Summer'],
   'Popular Zambian maize variety (medium maturing)', 'Zambia', 4.0, 7.0),
   
  ('Maize (Corn)', 'PAN53 (Zambia)', 18, 25, 32, 125, 145, 'Medium',
   ARRAY['Loam', 'Sandy Loam'], 6.0, 7.0, ARRAY['Summer'],
   'High-yielding Zambian hybrid', 'Zambia', 5.0, 9.0),
   
  ('Groundnuts (Peanuts)', 'Chalimbana', 20, 28, 35, 90, 120, 'Low',
   ARRAY['Sandy Loam', 'Loam'], 5.5, 6.8, ARRAY['Summer'],
   'Zambian groundnut variety', 'Zambia', 1.5, 3.0),
   
  ('Sweet Potato', 'Zambian Orange', 18, 25, 32, 90, 150, 'Low',
   ARRAY['Sandy Loam', 'Loam'], 5.5, 6.5, ARRAY['Summer'],
   'Orange-fleshed sweet potato', 'Zambia', 10, 25),
   
  ('Cassava', 'Mweru', 20, 28, 35, 270, 365, 'Low',
   ARRAY['Sandy Loam', 'Loam'], 5.5, 7.0, ARRAY['Summer'],
   'Drought-tolerant cassava variety', 'Zambia', 8, 20),
   
  ('Sorghum', 'MMSH375', 15, 28, 40, 100, 140, 'Low',
   ARRAY['Sandy Loam', 'Clay Loam'], 5.5, 7.5, ARRAY['Summer'],
   'Drought-resistant sorghum', 'Zambia', 1.5, 4.0);

COMMENT ON TABLE crop_varieties IS 'Reference database of crop varieties with climate and soil requirements';

