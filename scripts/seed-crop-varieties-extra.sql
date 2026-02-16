-- Add 3 extra Zambia-relevant crop varieties. Run after the main seed if you want these.
-- If the table is empty, run: node scripts/seed-crop-varieties-simple.cjs

INSERT INTO crop_varieties (
  name, variety, temp_min, temp_optimal, temp_max,
  growing_days_min, growing_days_max, water_requirement,
  soil_types, soil_ph_min, soil_ph_max, planting_seasons,
  description, region, expected_yield_min, expected_yield_max, is_active
) VALUES
  ('Sunflower', 'Open Pollinated', 18, 26, 32, 90, 120, 'Low',
   ARRAY['Loam','Sandy Loam'], 6.0, 7.5, ARRAY['Summer'],
   'Oilseed sunflower for Zambia', 'Zambia', 1.0, 2.5, true),
  ('Common Bean', 'Red / Speckled', 18, 24, 30, 70, 90, 'Medium',
   ARRAY['Loam','Sandy Loam'], 6.0, 7.0, ARRAY['Summer','Rainy'],
   'Common beans for grain or green', 'Zambia', 0.8, 2.0, true),
  ('Cotton', 'Upland', 20, 28, 35, 150, 180, 'Medium',
   ARRAY['Loam','Clay Loam'], 5.5, 7.0, ARRAY['Summer'],
   'Upland cotton for lint', 'Zambia', 0.5, 1.5, true);
