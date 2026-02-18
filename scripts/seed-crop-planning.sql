-- Seed crop planning reference data (run after 0018_crop_planning_seed_variety_yield_simulation.sql)
-- Crop ref, seed companies, seed varieties (SeedCo/Pioneer Zambia maize), seasons, agro_ecological_regions

INSERT INTO crop_ref (name, category, default_water_requirement_mm, default_gdd_range)
VALUES ('Maize', 'cereal', 500, '{"min": 1200, "max": 1800}')
ON CONFLICT DO NOTHING;

-- Get maize id for varieties (id=1 if fresh install)
INSERT INTO seed_companies (name, country, website)
VALUES
  ('SeedCo Zambia', 'ZM', 'https://www.seedco.co.zm'),
  ('Pioneer (Corteva)', 'ZM', 'https://www.corteva.com')
ON CONFLICT DO NOTHING;

-- Seed varieties (crop_id=1 Maize; company 1=SeedCo, 2=Pioneer)
INSERT INTO seed_varieties (
  crop_id, company_id, name, code, type, grain_color, maturity_class,
  days_to_maturity_min, days_to_maturity_max, yield_potential_t_ha_min, yield_potential_t_ha_max,
  traits, recommended_regions, recommended_planting_window, source_url, last_verified_at, is_active
)
SELECT c.id, s.id, 'SC 719', 'SC719', 'hybrid', 'white', 'medium', 125, 135, 6, 10,
  '{"drought_tolerant": true, "disease_tolerance": ["MSV", "GLS"]}'::jsonb,
  ARRAY['I','II','III'], '{"start_month": 10, "end_month": 12, "notes": "Early to mid-season"}'::jsonb,
  'https://www.seedco.co.zm', '2025-01-01', true
FROM crop_ref c CROSS JOIN (SELECT id FROM seed_companies WHERE name = 'SeedCo Zambia' LIMIT 1) s
WHERE c.name = 'Maize' AND NOT EXISTS (SELECT 1 FROM seed_varieties WHERE code = 'SC719');

INSERT INTO seed_varieties (
  crop_id, company_id, name, code, type, grain_color, maturity_class,
  days_to_maturity_min, days_to_maturity_max, yield_potential_t_ha_min, yield_potential_t_ha_max,
  traits, recommended_regions, recommended_planting_window, source_url, last_verified_at, is_active
)
SELECT c.id, s.id, 'SC 637', 'SC637', 'hybrid', 'white', 'early', 115, 125, 5.5, 9,
  '{"drought_tolerant": true}'::jsonb, ARRAY['I','II'],
  '{"start_month": 11, "end_month": 12}'::jsonb, 'https://www.seedco.co.zm', '2025-01-01', true
FROM crop_ref c CROSS JOIN (SELECT id FROM seed_companies WHERE name = 'SeedCo Zambia' LIMIT 1) s
WHERE c.name = 'Maize' AND NOT EXISTS (SELECT 1 FROM seed_varieties WHERE code = 'SC637');

INSERT INTO seed_varieties (
  crop_id, company_id, name, code, type, grain_color, maturity_class,
  days_to_maturity_min, days_to_maturity_max, yield_potential_t_ha_min, yield_potential_t_ha_max,
  traits, recommended_regions, recommended_planting_window, source_url, last_verified_at, is_active
)
SELECT c.id, s.id, 'SC 513', 'SC513', 'hybrid', 'white', 'late', 135, 150, 7, 11,
  '{"drought_tolerant": false}'::jsonb, ARRAY['II','III'],
  '{"start_month": 10, "end_month": 11}'::jsonb, 'https://www.seedco.co.zm', '2025-01-01', true
FROM crop_ref c CROSS JOIN (SELECT id FROM seed_companies WHERE name = 'SeedCo Zambia' LIMIT 1) s
WHERE c.name = 'Maize' AND NOT EXISTS (SELECT 1 FROM seed_varieties WHERE code = 'SC513');

INSERT INTO seed_varieties (
  crop_id, company_id, name, code, type, grain_color, maturity_class,
  days_to_maturity_min, days_to_maturity_max, yield_potential_t_ha_min, yield_potential_t_ha_max,
  traits, recommended_regions, recommended_planting_window, source_url, last_verified_at, is_active
)
SELECT c.id, s.id, 'Pioneer P30B19', 'P30B19', 'hybrid', 'white', 'early', 110, 120, 5, 8.5,
  '{"drought_tolerant": true}'::jsonb, ARRAY['I','II','III'],
  '{"start_month": 10, "end_month": 12}'::jsonb, 'https://www.corteva.com', '2025-01-01', true
FROM crop_ref c CROSS JOIN (SELECT id FROM seed_companies WHERE name = 'Pioneer (Corteva)' LIMIT 1) s
WHERE c.name = 'Maize' AND NOT EXISTS (SELECT 1 FROM seed_varieties WHERE code = 'P30B19');

INSERT INTO seed_varieties (
  crop_id, company_id, name, code, type, grain_color, maturity_class,
  days_to_maturity_min, days_to_maturity_max, yield_potential_t_ha_min, yield_potential_t_ha_max,
  traits, recommended_regions, recommended_planting_window, source_url, last_verified_at, is_active
)
SELECT c.id, s.id, 'Pioneer P30G19', 'P30G19', 'hybrid', 'white', 'medium', 120, 130, 6, 10,
  '{"drought_tolerant": true}'::jsonb, ARRAY['II','III'],
  '{"start_month": 10, "end_month": 11}'::jsonb, 'https://www.corteva.com', '2025-01-01', true
FROM crop_ref c CROSS JOIN (SELECT id FROM seed_companies WHERE name = 'Pioneer (Corteva)' LIMIT 1) s
WHERE c.name = 'Maize' AND NOT EXISTS (SELECT 1 FROM seed_varieties WHERE code = 'P30G19');

-- Seasons
INSERT INTO seasons (name, start_date, end_date)
VALUES
  ('2025/26', '2025-10-01', '2026-04-30'),
  ('2026/27', '2026-10-01', '2027-04-30')
ON CONFLICT DO NOTHING;

-- Agro-ecological regions (Zambia provinces → Region I, II, III)
INSERT INTO agro_ecological_regions (province, district, region)
VALUES
  ('Lusaka', NULL, 'II'),
  ('Copperbelt', NULL, 'III'),
  ('Central', NULL, 'II'),
  ('Eastern', NULL, 'I'),
  ('Southern', NULL, 'I'),
  ('Northern', NULL, 'III'),
  ('Luapula', NULL, 'III'),
  ('North-Western', NULL, 'III'),
  ('Western', NULL, 'II'),
  ('Muchinga', NULL, 'III')
ON CONFLICT DO NOTHING;
