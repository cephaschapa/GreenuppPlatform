-- Add more reference crop types (Zambia-relevant) so crop type dropdown shows more than Maize
INSERT INTO crop_ref (name, category, default_water_requirement_mm, default_gdd_range)
SELECT 'Wheat', 'cereal', 450, '{"min": 1200, "max": 1600}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM crop_ref WHERE name = 'Wheat');

INSERT INTO crop_ref (name, category, default_water_requirement_mm, default_gdd_range)
SELECT 'Groundnuts', 'legume', 500, '{"min": 1400, "max": 2000}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM crop_ref WHERE name = 'Groundnuts');

INSERT INTO crop_ref (name, category, default_water_requirement_mm, default_gdd_range)
SELECT 'Soybean', 'legume', 450, '{"min": 1300, "max": 1700}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM crop_ref WHERE name = 'Soybean');

INSERT INTO crop_ref (name, category, default_water_requirement_mm, default_gdd_range)
SELECT 'Rice', 'cereal', 800, '{"min": 1500, "max": 2200}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM crop_ref WHERE name = 'Rice');

INSERT INTO crop_ref (name, category, default_water_requirement_mm, default_gdd_range)
SELECT 'Sorghum', 'cereal', 400, '{"min": 1100, "max": 1600}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM crop_ref WHERE name = 'Sorghum');

INSERT INTO crop_ref (name, category, default_water_requirement_mm, default_gdd_range)
SELECT 'Beans', 'legume', 350, '{"min": 1000, "max": 1400}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM crop_ref WHERE name = 'Beans');

INSERT INTO crop_ref (name, category, default_water_requirement_mm, default_gdd_range)
SELECT 'Sunflower', 'oilseed', 450, '{"min": 1300, "max": 1800}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM crop_ref WHERE name = 'Sunflower');

INSERT INTO crop_ref (name, category, default_water_requirement_mm, default_gdd_range)
SELECT 'Cassava', 'tuber', 600, '{"min": 2000, "max": 3500}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM crop_ref WHERE name = 'Cassava');

INSERT INTO crop_ref (name, category, default_water_requirement_mm, default_gdd_range)
SELECT 'Sweet potato', 'tuber', 500, '{"min": 1200, "max": 1800}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM crop_ref WHERE name = 'Sweet potato');
